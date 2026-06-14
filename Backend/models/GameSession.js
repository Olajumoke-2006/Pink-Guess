const mongoose = require("mongoose");

const gameSchema = new mongoose.Schema({
  roomCode:String,

  gameMaster:String,

  question:String,

  answer:String,

  status:{
    type:String,
    enum:[
      "waiting",
      "playing",
      "finished"
    ],
    default:"waiting"
  },

  players:[
    {
      username:String,
      score:{
        type:Number,
        default:0
      }
    }
  ]
});

module.exports=
mongoose.model(
"GameSession",
gameSchema
);