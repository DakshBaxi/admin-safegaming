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

router.get('/:tournamentId/applicants', async (req, res) => {
  try {
    const { tournamentId } = req.params;
    
    // Find tournament and populate registered teams with team details
    const tournament = await Tournament.findById(tournamentId)
      .populate({
        path: 'registeredTeams.teamId',
        model: 'Team',
        populate: [
          {
            path: 'captainId',
            model: 'User',
            select: 'fullName email trustScore kycStatus'
          },
          {
            path: 'players',
            model: 'User',
            select: 'fullName email trustScore kycStatus'
          }
        ]
      })
      .select('title game status maxPlayers currentRegistrations registeredTeams');

    if (!tournament) {
       res.status(404).json({ error: 'Tournament not found' });
       return
    }

    // Format the response to match the frontend expectations
    const formattedTeams = tournament.registeredTeams.map(registeredTeam => {
      const team = registeredTeam.teamId;
      
      if (!team) {
        null; // Skip if team is not found
         return
      }

      // Combine captain and players for trust score calculation
      const allMembers = [];
      
      // Add captain
      // @ts-ignore
      if (team.captainId && team.captainId.trustScore) {
        // @ts-ignore
        allMembers.push(team.captainId.trustScore);
      }
      
      // Add players
      // @ts-ignore
      if (team.players && team.players.length > 0) {
        // @ts-ignore
        team.players.forEach(player => {
          if (player && player.trustScore) {
            allMembers.push(player.trustScore);
          }
        });
      }
      
      // Calculate average trust score
      const averageTrustScore = allMembers.length > 0 
        ? Math.round(allMembers.reduce((sum, score) => sum + score, 0) / allMembers.length)
        : 0;

      // Determine overall KYC status for the team
      

      // Calculate total team members (captain + players)
      // @ts-ignore
      const totalMembers = 1 + (team.players ? team.players.length : 0);

      return {
        id: team._id,
        // @ts-ignore
        teamName: team.teamName,
        // @ts-ignore
        captain: team.captainId ? team.captainId.fullName : 'Unknown',
        // @ts-ignore
        captainEmail: team.captainId ? team.captainId.email : '',
        playerCount: totalMembers,
        averageTrustScore,
        status: registeredTeam.status, // pending, approved, rejected
        joinedAt: registeredTeam.registrationDate,
        // @ts-ignore
        game: team.game,
        players: [
          // Captain as first player
          // @ts-ignore
          ...(team.captainId ? [{
            // @ts-ignore
            id: team.captainId._id,
            // @ts-ignore
            name: team.captainId.fullName,
            // @ts-ignore
            email: team.captainId.email,
            // @ts-ignore
            role: 'Captain',
            // @ts-ignore
            trustScore: team.captainId.trustScore || 0,
            // @ts-ignore
            kycStatus: team.captainId.kycStatus || 'not_started'
          }] : []),
          // Regular players
          // @ts-ignore
          ...(team.players ? team.players
            // @ts-ignore
            .filter(player => player) // Filter out null/undefined players
            // @ts-ignore
            .map(player => ({
              id: player._id,
              name: player.fullName,
              email: player.email,
              role: 'Player',
              trustScore: player.trustScore || 0,
              kycStatus: player.kycStatus || 'not_started'
            })) : [])
        ]
      };
    }).filter(team => team !== null); // Remove null teams

    const response = {
      tournament: {
        id: tournament._id,
        title: tournament.title,
        game: tournament.game,
        status: tournament.status,
        currentRegistrations: tournament.currentRegistrations,
        maxPlayers: tournament.maxPlayers
      },
      teams: formattedTeams,
      totalApplications: tournament.registeredTeams.length
    };

    res.status(200).json(response);
  } catch (err) {
    console.error('Error fetching tournament applicants:', err);
    res.status(500).json({ error: 'Failed to fetch tournament applicants.' });
  }
});

router.patch('/:tournamentId/applicants/:teamId/status', async (req, res) => {
  try {
    const { tournamentId, teamId } = req.params;
    const { status } = req.body; // 'pending', 'approved', 'rejected'

    if (!['pending', 'approved', 'rejected'].includes(status)) {
     res.status(400).json({ error: 'Invalid status' });
      return 
    }

    const tournament = await Tournament.findOneAndUpdate(
      { 
        _id: tournamentId, 
        'registeredTeams.teamId': teamId 
      },
      { 
        $set: { 'registeredTeams.$.status': status }
      },
      { new: true }
    );

    if (!tournament) {
       res.status(404).json({ error: 'Tournament or team not found' });
       return
    }

    res.status(200).json({ 
      message: `Team application ${status} successfully`,
      status 
    });
  } catch (err) {
    console.error('Error updating team status:', err);
    res.status(500).json({ error: 'Failed to update team status.' });
  }
});


router.get('/:tournamentId/applicants/export', async (req, res) => {
  try {
    const { tournamentId } = req.params;
    
    // Find tournament and populate registered teams with team details
    const tournament = await Tournament.findById(tournamentId)
      .populate({
        path: 'registeredTeams.teamId',
        model: 'Team',
        populate: [
          {
            path: 'captainId',
            model: 'User',
            select: 'fullName email trustScore '
          },
          {
            path: 'players',
            model: 'User',
            select: 'fullName email trustScore '
          }
        ]
      })
      .select('title game status maxPlayers currentRegistrations registeredTeams');

    if (!tournament) {
       res.status(404).json({ error: 'Tournament not found' });
       return
    }

    // Prepare CSV data
    const csvData = [];
    
    // CSV Headers
    csvData.push([
      'Team ID',
      'Team Name',
      'Captain Name',
      'Captain Email',
      'Player Count',
      'Average Trust Score',
      'Registration Status',
      'Joined Date',
      'Game',
      'Player Name',
      'Player Email',
      'Player Role',
      'Player Trust Score',
    ]);

    // Process each registered team
    tournament.registeredTeams.forEach(registeredTeam => {
      const team = registeredTeam.teamId;
      
      if (!team) {
        return; // Skip if team is not found
      }

      // Calculate team statistics (same logic as original route)
      const allMembers = [];
      
      // Add captain trust score
      // @ts-ignore
      if (team.captainId && team.captainId.trustScore) {
        // @ts-ignore
        allMembers.push(team.captainId.trustScore);
      }
      
      // Add players trust scores
      // @ts-ignore
      if (team.players && team.players.length > 0) {
        // @ts-ignore
        team.players.forEach(player => {
          if (player && player.trustScore) {
            allMembers.push(player.trustScore);
          }
        });
      }
      
      const averageTrustScore = allMembers.length > 0 
        ? Math.round(allMembers.reduce((sum, score) => sum + score, 0) / allMembers.length)
        : 0;

    
      // @ts-ignore
      const totalMembers = 1 + (team.players ? team.players.length : 0);
      const joinedDate = registeredTeam.registrationDate ? new Date(registeredTeam.registrationDate).toLocaleDateString() : '';

      // Base team info
      const baseTeamData = [
        team._id.toString(),
        // @ts-ignore
        team.teamName || '',
        // @ts-ignore
        team.captainId ? team.captainId.fullName : 'Unknown',
        // @ts-ignore
        team.captainId ? team.captainId.email : '',
        totalMembers,
        averageTrustScore,
        registeredTeam.status || 'pending',
        joinedDate,
        // @ts-ignore
        team.game || tournament.game || ''
      ];

      // Add captain row
      // @ts-ignore
      if (team.captainId) {
        csvData.push([
          ...baseTeamData,
          // @ts-ignore
          team.captainId.fullName || '',
          // @ts-ignore
          team.captainId.email || '',
          'Captain',
          // @ts-ignore
          team.captainId.trustScore || 0,
          // @ts-ignore
        ]);
      }

      // Add player rows
      // @ts-ignore
      if (team.players && team.players.length > 0) {
        // @ts-ignore
        team.players.forEach(player => {
          if (player) {
            csvData.push([
              ...baseTeamData,
              player.fullName || '',
              player.email || '',
              'Player',
              player.trustScore || 0,
            ]);
          }
        });
      }

      // If team has no players, add an empty row to show team info
      // @ts-ignore
      if (!team.captainId && (!team.players || team.players.length === 0)) {
        csvData.push([
          ...baseTeamData,
          '', '', '', '', ''
        ]);
      }
    });

    // Convert to CSV string
    const csvString = csvData.map(row => 
      row.map(field => {
        // Escape fields that contain commas, quotes, or newlines
        if (typeof field === 'string' && (field.includes(',') || field.includes('"') || field.includes('\n'))) {
          return `"${field.replace(/"/g, '""')}"`;
        }
        return field;
      }).join(',')
    ).join('\n');

    // Set headers for file download
    const filename = `tournament_${tournament.title.replace(/[^a-z0-9]/gi, '_')}_applicants_${new Date().toISOString().split('T')[0]}.csv`;
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Pragma', 'no-cache');

    // Send CSV data
    res.status(200).send(csvString);

  } catch (err) {
    console.error('Error exporting tournament applicants:', err);
    res.status(500).json({ error: 'Failed to export tournament applicants.' });
  }
});

// GET /api/tournament/:tournamentId/applicants/teams/:teamId
router.get('/:tournamentId/applicants/teams/:teamId', async (req, res) => {
  try {
    const { tournamentId, teamId } = req.params;

    // Find the tournament and populate team details
    const tournament = await Tournament.findById(tournamentId)
      .populate({
        path: 'registeredTeams.teamId',
        populate: [
          {
            path: 'captainId',
            select: 'fullName email trustScore profileUrl '
          },
          {
            path: 'players',
            select: 'fullName email trustScore profileUrl'
          }
        ]
      });

    if (!tournament) {
       res.status(404).json({ error: 'Tournament not found' });
       return
    }

    // Find the specific team in the registered teams
    const registeredTeam = tournament.registeredTeams.find(
      rt => rt.teamId._id.toString() === teamId
    );

    if (!registeredTeam) {
       res.status(404).json({ error: 'Team not found in this tournament' });
       return
    }

    const team = registeredTeam.teamId;

    // Calculate average trust score
    // @ts-ignore
    const allPlayers = [team.captainId, ...team.players];
    const validScores = allPlayers
      .map(player => player.trustScore)
      .filter(score => typeof score === 'number' && score > 0);
    
    const averageTrustScore = validScores.length > 0 
      ? Math.round(validScores.reduce((sum, score) => sum + score, 0) / validScores.length)
      : 0;

    // Format the response to match frontend interface
    const teamDetails = {
      _id: team._id,
      // @ts-ignore
      teamName: team.teamName,
      captainId: {
        // @ts-ignore
        _id: team.captainId._id,
        // @ts-ignore
        fullName: team.captainId.fullName,
        // @ts-ignore
        email: team.captainId.email,
        // @ts-ignore
        trustScore: team.captainId.trustScore,
        // @ts-ignore
        profileUrl:team.captainId.profileUrl
      },
      // @ts-ignore
      players: team.players.map(player => ({
        _id: player._id,
        fullName: player.fullName,
        email: player.email,
        trustScore: player.trustScore,
        profileUrl: player.profileUrl
      })),
      // @ts-ignore
      game: team.game,
      // @ts-ignore
      status: registeredTeam.status || 'pending', // Status from tournament registration
      averageTrustScore: averageTrustScore
    };

    res.status(200).json(teamDetails);

  } catch (err) {
    console.error('Error fetching team details:', err);
    res.status(500).json({ error: 'Failed to fetch team details.' });
  }
});


export default router;
