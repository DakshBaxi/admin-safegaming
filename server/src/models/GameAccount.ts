// models/GameAccount.js
import mongoose from 'mongoose'

const gameAccountSchema = new mongoose.Schema({
  accountId: { type: String, required: true }, // Game-specific account ID
  userId: { type: String, required: true, ref: 'User' },
  game: { type: String, enum: ['bgmi', 'valorant', 'csgo', 'pubg', 'freefire'], required: true },
  inGameName: { type: String, required: true },
  verified: { type: Boolean, default: false },
  addedAt: { type: Date, default: Date.now }
});

export const GameAccount = mongoose.model('GameAccount', gameAccountSchema);
