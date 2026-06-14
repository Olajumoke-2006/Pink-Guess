const rooms = {};

module.exports = (io) => {
  io.on("connection", (socket) => {
    console.log(`User Connected: ${socket.id}`);

    // JOIN ROOM
    socket.on("join-room", ({ roomCode, username }) => {
      if (!rooms[roomCode]) {
        rooms[roomCode] = {
          players: [],
          gameMaster: null,
          question: "",
          answer: "",
          winner: null,
          status: "waiting",
          timer: null,
        };
      }

      const room = rooms[roomCode];

      if (room.status === "playing") {
        socket.emit("error-message", "Game already in progress.");
        return;
      }

      const existingPlayer = room.players.find(
        (player) => player.id === socket.id
      );

      if (existingPlayer) {
        return;
      }

      room.players.push({
        id: socket.id,
        username,
        score: 0,
        attempts: 3,
      });

      if (room.players.length === 1) {
        room.gameMaster = username;
      }

      socket.join(roomCode);

      io.to(roomCode).emit("players-update", {
        players: room.players,
        gameMaster: room.gameMaster,
      });
    });

    // CREATE QUESTION
    socket.on("create-question", ({ roomCode, question, answer }) => {
      const room = rooms[roomCode];

      if (!room) return;

      const player = room.players.find(
        (p) => p.id === socket.id
      );

      if (!player) return;

      if (player.username !== room.gameMaster) {
        socket.emit(
          "error-message",
          "Only the Game Master can create questions."
        );
        return;
      }

      if (room.status === "playing") {
        socket.emit(
          "error-message",
          "Cannot change question during game."
        );
        return;
      }

      room.question = question;
      room.answer = answer.trim();

      io.to(roomCode).emit("question-created");
    });

    // START GAME
    socket.on("start-game", (roomCode) => {
      const room = rooms[roomCode];

      if (!room) return;

      const player = room.players.find(
        (p) => p.id === socket.id
      );

      if (!player) return;

      if (player.username !== room.gameMaster) {
        socket.emit(
          "error-message",
          "Only the Game Master can start the game."
        );
        return;
      }

      if (!room.question || !room.answer) {
        socket.emit(
          "error-message",
          "Create a question first."
        );
        return;
      }

      if (room.players.length < 3) {
        socket.emit(
          "error-message",
          "Minimum 3 players required."
        );
        return;
      }

      room.players.forEach((player) => {
        player.attempts = 3;
      });

      room.status = "playing";
      room.winner = null;

      io.to(roomCode).emit("game-started", {
        question: room.question,
        time: 60,
      });

      let countdown = 60;

      room.timer = setInterval(() => {
        countdown--;

        io.to(roomCode).emit("timer", countdown);

        if (countdown <= 0) {
          clearInterval(room.timer);
          room.timer = null;

          room.status = "finished";

          io.to(roomCode).emit("game-over", {
            winner: null,
            answer: room.answer,
          });
        }
      }, 1000);
    });

    // GUESS ANSWER
    socket.on("guess-answer", ({ roomCode, guess }) => {
      const room = rooms[roomCode];

      if (!room) return;

      if (room.status !== "playing") return;

      const player = room.players.find(
        (p) => p.id === socket.id
      );

      if (!player) return;

      if (player.attempts <= 0) {
        socket.emit(
          "error-message",
          "No attempts remaining."
        );
        return;
      }

      player.attempts--;

      io.to(roomCode).emit("players-update", {
        players: room.players,
        gameMaster: room.gameMaster,
      });

      const isCorrect =
        guess.trim().toLowerCase() ===
        room.answer.trim().toLowerCase();

      if (isCorrect) {
        player.score += 10;

        room.winner = player.username;
        room.status = "finished";

        if (room.timer) {
          clearInterval(room.timer);
          room.timer = null;
        }

        io.to(roomCode).emit("game-over", {
          winner: player.username,
          answer: room.answer,
        });

        io.to(roomCode).emit("players-update", {
          players: room.players,
          gameMaster: room.gameMaster,
        });
      }
    });

    // DISCONNECT
    socket.on("disconnect", () => {
      console.log(`User Disconnected: ${socket.id}`);

      Object.keys(rooms).forEach((roomCode) => {
        const room = rooms[roomCode];

        const leavingPlayer = room.players.find(
          (p) => p.id === socket.id
        );

        if (!leavingPlayer) return;

        room.players = room.players.filter(
          (p) => p.id !== socket.id
        );

        // Assign new game master if needed
        if (
          leavingPlayer.username === room.gameMaster &&
          room.players.length > 0
        ) {
          room.gameMaster = room.players[0].username;
        }

        io.to(roomCode).emit("players-update", {
          players: room.players,
          gameMaster: room.gameMaster,
        });

        // Delete empty room
        if (room.players.length === 0) {
          if (room.timer) {
            clearInterval(room.timer);
          }

          delete rooms[roomCode];
          console.log(`Room ${roomCode} deleted`);
        }
      });
    });
  });
};