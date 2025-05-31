// models/User.js
import mongoose from 'mongoose'
const userSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true }, 
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true, unique: true },
  fullName: { type: String, required: true },
  gamerTag: { type: String, required: true, unique: true },
  trustScore: { type: Number, default: 0 },
  profileUrl: { type: String,}, 
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
