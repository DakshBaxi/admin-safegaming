// models/User.js
import mongoose,{Document} from 'mongoose'

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true, unique: true },
  fullName: { type: String, required: true },
  gamerTag: { type: String, required: true, unique: true },
  gameIds: {
      bgmi: { type: String},
      valorant: { type: String },
      freeFire:{type:String},
      counterStrike2:{type:String},
    },
  trustScore: { type: Number, default: 0 },
  profileUrl: { type: String,}, 
 teams: [{ type: mongoose.Schema.Types.ObjectId, ref: "Team" }]
}, { timestamps: true });

export const User = mongoose.model('User', userSchema);
