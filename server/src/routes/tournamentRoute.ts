import express from 'express';
import { Tournament } from '../models/Tournament';

const router = express.Router();





// POST /api/tournaments
router.post("/create", async (req, res) => {
  try {
    const {
      title,
      game,
      description,
      date,
      maxPlayers,
      prizePool,
      trustScoreThreshold,
      registrationDeadline,
      location = "Online",
      rules = [],
      schedule = [],
      tags = [],
      entryFee = "0",
      hasFee = false,
    } = req.body;
const trustScoreThresholdInt = parseInt(trustScoreThreshold)
    if (!title || !game || !description || !date || !maxPlayers || !prizePool || !registrationDeadline) {
      res.status(400).json({ error: "All required fields must be filled." });
       return
    }

    

    const newTournament = new Tournament({
      title,
      game,
      description,
      date: new Date(date),
      maxPlayers: parseInt(maxPlayers),
      prizePool,
      trustScoreThreshold: trustScoreThresholdInt,
      registrationDeadline: new Date(registrationDeadline),
      location,
      rules,
      schedule,
      tags,
      organizerId: 1,
      createdBy: 1,
      entryFee: hasFee ? entryFee : "0"
    });

    await newTournament.save();

    res.status(201).json({ message: "Tournament created successfully", tournament: newTournament });
  } catch (error) {
    console.error("Tournament creation error:", error);
    res.status(500).json({ error: "Server error while creating tournament." });
  }
});

router.get('/', async (req, res) => {
  try {
    const tournaments = await Tournament.find()
    //   .populate('organizerId', 'fullName email') // if you want user info
      .sort({ date: 1 }); // Sort by date ascending

    res.status(200).json(tournaments);
  } catch (err) {
    console.error('Error fetching tournaments:', err);
    res.status(500).json({ error: 'Failed to fetch tournaments.' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const id = req.params.id
    const tournament = await Tournament.findById(id)
    //   .populate('organizerId', 'fullName email') // if you want user info

    res.status(200).json(tournament);
  } catch (err) {
    console.error('Error fetching tournaments:', err);
    res.status(500).json({ error: 'Failed to fetch tournaments.' });
  }
});

router.put("/edit/:id", async (req, res) => {
  try {
    const id = req.params.id
    const {
      title,
      game,
      description,
      date,
      maxPlayers,
      prizePool,
      trustScoreThreshold,
      registrationDeadline,
      location = "Online",
      rules = [],
      schedule = [],
      tags = [],
      entryFee = "0",
      hasFee = false,
    } = req.body;
    const trustScoreThresholdInt = parseInt(trustScoreThreshold)
    if (!title || !game || !description || !date || !maxPlayers || !prizePool  || !registrationDeadline) {
      res.status(400).json({ error: "All required fields must be filled." });
       return
    }
    const updateTournament = await Tournament.findByIdAndUpdate(id,{
      title,
      game,
      description,
      date: new Date(date),
      maxPlayers: parseInt(maxPlayers),
      prizePool,
      trustScoreThreshold: trustScoreThresholdInt,
      registrationDeadline: new Date(registrationDeadline),
      location,
      rules,
      schedule,
      tags,
      entryFee: hasFee ? entryFee : "0"
    },{new:true})
    res.status(201).json({ message: "Tournament created successfully", tournament: updateTournament });
  } catch (error) {
    console.log("Tournament creation error:", error);
    res.status(500).json({ error: "Server error while creating tournament." });
  }
});



export default router;
