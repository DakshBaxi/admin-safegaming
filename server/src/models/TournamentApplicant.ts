// models/TournamentApplicant.js
import mongoose from 'mongoose'
const tournamentApplicantSchema = new mongoose.Schema({
  tournamentId: { type: mongoose.Schema.ObjectId, required: true, ref: 'Tournament' },
  teamId: { type: mongoose.Schema.ObjectId, required: true, ref: 'User' },
  trustScore: { type: Number, required: true },
  status: { type: String, enum: ['applied', 'accepted', 'rejected', 'flagged'], default: 'applied' },
  joinedAt: { type: Date, default: Date.now }
});

export const TournamentApplicant = mongoose.model('TournamentApplicant', tournamentApplicantSchema);
