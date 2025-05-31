// models/Tournament.js
import mongoose from 'mongoose'

const tournamentSchema = new mongoose.Schema({
  tournamentId: { type: String, required: true, unique: true }, // UUID
  organizerId: { type: String, required: true, ref: 'User' },
  title: { type: String, required: true },
  description: { type: String },
  date: { type: Date, required: true },
  maxPlayers: { type: Number, required: true },
}, { timestamps: { createdAt: true, updatedAt: false } });

module.exports = mongoose.model('Tournament', tournamentSchema);
