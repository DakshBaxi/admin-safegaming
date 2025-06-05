import mongoose from 'mongoose';

// Schedule schema for tournament stages
const scheduleSchema = new mongoose.Schema({
  stage: {
    type: String,
    required: true,
    trim: true
  },
  date: {
    type: Date,
    required: true
  },
  teams: {
    type: String,
    required: true
  }
}, { _id: false });

// Tournament schema
const tournamentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Tournament title is required'],
    trim: true,
    maxLength: [100, 'Title cannot exceed 100 characters']
  },
  game: {
    type: String,
    required: [true, 'Game is required'],
    enum: ['valorant', 
       'counterStrike2',
       'bgmi',
       'freeFire'
      //  'League of Legends','CS:GO', 'Dota 2', 'Fortnite', 'Apex Legends'
      ],
    trim: true
  },
  status: {
    type: String,
    enum: ['upcoming', 'open', 'closed', 'ongoing', 'completed', 'cancelled'],
    default: 'upcoming'
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxLength: [500, 'Description cannot exceed 500 characters']
  },
  date: {
    type: Date,
    required: [true, 'Tournament date is required'],
  },
  maxPlayers: {
    type: Number,
    required: [true, 'Maximum players is required'],
    min: [2, 'Minimum 2 players required'],
    max: [1000, 'Maximum 1000 players allowed']
  },
  currentRegistrations: {
    type: Number,
    default: 0,
    min: 0
  },
  prizePool: {
    type: String,
    required: [true, 'Prize pool is required'],
    trim: true
  },
  trustScoreThreshold: {
    type: Number,
    required: [true, 'Trust score threshold is required'],
  },
  organizerId: {
    // type: mongoose.Schema.Types.ObjectId,
    // ref: 'Organizer',
    // required: [true, 'Organizer ID is required']
       required: true,
    type:String,
  },
  registrationDeadline: {
    type: Date,
    required: [true, 'Registration deadline is required'],
  },
  location: {
    type: String,
    default: 'Online',
    trim: true
  },
  rules: [{
    type: String,
    trim: true,
    maxLength: [200, 'Rule cannot exceed 200 characters']
  }],
  schedule: [scheduleSchema],
  registeredTeams: [{
    teamId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team',
      required: true
    },
    registrationDate: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    }
  }],
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    // type: mongoose.Schema.Types.ObjectId,
    // ref: 'Organizer',
    required: true,
    type:String,
  }
}, {
  timestamps: true,

});



export const Tournament = mongoose.model('Tournament', tournamentSchema);