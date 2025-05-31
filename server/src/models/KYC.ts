// models/KYCSubmission.js
import mongoose from 'mongoose'

const kycSubmissionSchema = new mongoose.Schema({
  kycId: { type: String, required: true, unique: true }, // UUID
  userId: { type: String, required: true, ref: 'User' },
  govtIdUrl: { type: String, required: true },
  selfieUrl: { type: String, required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  submittedAt: { type: Date, default: Date.now },
  reviewedAt: { type: Date }
});

export const KYC = mongoose.model('KYCSubmission', kycSubmissionSchema);
