import mongoose from "mongoose";

const teamSchema = new mongoose.Schema({
  teamName: {
    type: String,
    required: true,
  },
  captainId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  players: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'User',
  },
  inviteCode: {
    type: String,
    default: null
  },
  game: {
    type: String,
    enum: ['bgmi','valorant','freeFire','counterStrike2'],
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  tournaments:[{
    type: mongoose.Schema.Types.ObjectId,
    ref:"Tournament",
  }]
},{
    timestamps:true,
});



export const Team = mongoose.model('Team', teamSchema);


