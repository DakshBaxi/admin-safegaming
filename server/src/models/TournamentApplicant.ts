// models/TournamentApplicant.js
import mongoose from 'mongoose'
const tournamentApplicantSchema = new mongoose.Schema({
  tournamentId: { type: String, required: true, ref: 'Tournament' },
  userId: { type: mongoose.Schema.ObjectId, required: true, ref: 'User' },
  kycStatus: { type: String, enum: ['pending', 'approved', 'rejected'], required: true },
  trustScore: { type: Number, required: true },
  status: { type: String, enum: ['applied', 'accepted', 'rejected', 'flagged'], default: 'applied' },
  joinedAt: { type: Date, default: Date.now }
});

export const TournamentApplicant = mongoose.model('TournamentApplicant', tournamentApplicantSchema);
