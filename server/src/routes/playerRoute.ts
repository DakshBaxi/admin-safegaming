import express, { RequestHandler } from "express";
import { User } from "../models/User";
import { authMiddleware,userRequestAuthentication } from "../middleware/authmiddleware";
import { upload } from "../config/upload";
import { uploadToS3 } from "../config/aws";
import { fileRequest } from "../types";
import { KYC } from "../models/KYC";
import { Team } from "../models/Team";
import { error } from "console";
import { v4 as uuidv4 } from "uuid";



const router = express.Router();


router.get('/',authMiddleware, async (req:userRequestAuthentication,res)=>{
 try {
       const {email} = req.user!;
     const user  = await User.findOne({ 
      email:email
      }).populate("teams");

      if (!user) {
       res.status(404).json({ error: 'User not found' });
       return;
    }
  res.json(user);
 } catch (err: any) {
   console.log(err);
     res.status(400).json({ error: err.message });
     return
 }
})

router.post('/',authMiddleware, async (req:userRequestAuthentication, res) => {
  try {
   const { email, profileUrl } = req.user!;
   const { fullName, phone, gamerTag, gameIds } = req.body
   const validateGamerTag = await User.findOne({gamerTag})
   const validatePhoneNumber = await User.findOne({phone})
  if (validateGamerTag) {
      res.status(409).json({ message: "Gamer Tag already in use" });
       return
    }

    if (validatePhoneNumber) {
      res.status(409).json({ message: "Phone Number already in use" });
       return
    }

    const gameIdFields = Object.entries(gameIds || {});
    for (const [game, id] of gameIdFields) {
      if (!id) continue;
      const existing = await User.findOne({ [`gameIds.${game}`]: id });
      if (existing) {
        res.status(409).json({ message: `${game.toUpperCase()} ID already in use` });
         return
      }
    }
    const newUser = await User.create({
      email:email,
      profileUrl:profileUrl,
      fullName:fullName,
      phone,
      gamerTag,
      gameIds,
    });
    res.status(201).json(newUser);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});


router.post('/kyc',authMiddleware,upload.fields([
  { name: 'govtId', maxCount: 1 },
  { name: 'selfie', maxCount: 1 }
]),
// @ts-ignore
async (req:fileRequest, res)=>{
  try {
      const {email} = req.user!;
         const [govtIdUrl, selfieUrl] = await Promise.all([
            uploadToS3(req.files.govtId[0], 'playerGovtId'),
            uploadToS3(req.files.selfie[0], 'playerSelfie')
        ]);
        const user  = await User.findOne({email})
        if(!user){
          res.status(404).json({
             error: 'User not found'
          })
          return;
        }
      const kyc = await KYC.create({
        // @ts-ignore
        userId: user._id,
        govtIdUrl:govtIdUrl,
        selfieUrl:selfieUrl
      })
      // console.log(kyc)
      res.status(201).json(kyc);
  } catch (err:any) {
  
    res.status(401).json({error:err.message})
  }   
  }) 

router.get('/kycStatus',authMiddleware, async (req:userRequestAuthentication, res )=>{
   const {email} = req.user!;
try {
    const user = await User.findOne({email});
   if(!user){
          res.status(404).json({
             error: 'User not found'
          })
          return;
        }
  const kyc = await KYC.findOne({userId:user._id}).select("status");
  res.json(kyc);
} catch (err:any) {
    res.status(401).json({error:err.message})
}
})







router.post('/createTeam', authMiddleware, async (req: userRequestAuthentication, res) => {
  try {
    const { email } = req.user!;
    const captain = await User.findOne({ email });

    if (!captain) {
      res.status(404).json({ error: "No user found with the provided email." });
      return 
    }

    const { players, teamName, game } = req.body as {
      players: string[], // assuming player gamertags
      teamName: string,
      game: string,
    };

    const validatePlayers = [];
    for (const playerGamerTag of players) {
      const player = await User.findOne({ gamerTag: playerGamerTag });
      if (!player) {
        res.status(400).json({ error: `Player with gamerTag ${playerGamerTag} not found.` });
        return
      }
      validatePlayers.push(player._id); // store user IDs
    }

    const inviteCode = generateInviteCode();// unique team invite code

    const team = await Team.create({
      teamName,
      players: validatePlayers,
      game,
      captainId: captain._id,
      inviteCode
    });

    await Promise.all(
      validatePlayers.map(async (userId) => {
        await User.findByIdAndUpdate(userId, {
          $addToSet: { teams: team._id } // Assuming `teams` is an array in User model
        });
      })
    );

     res.status(201).json({
      message: "Team created successfully.",
      team,
      inviteCode
    });

  } catch (error) {
    console.error("Error creating team:", error);
     res.status(500).json({ error: "Internal server error" });
     return
  }
});

router.post('/joinTeam', authMiddleware, async (req: userRequestAuthentication, res) => {
  try {
    const { email } = req.user!;
    const user = await User.findOne({ email });

    if (!user) {
      res.status(404).json({ error: "User not found." });
      return 
    }

    const { inviteCode } = req.body as { inviteCode: string };
    const team = await Team.findOne({ inviteCode });

    if (!team) {
       res.status(404).json({ error: "Invalid invite code. Team not found." });
       return
    }

     let MAX_PLAYERS = 4;

    if(team.game==="bgmi"||team.game==="freeFire"){
     MAX_PLAYERS =4;
    }else{
      MAX_PLAYERS =5;
    }

    if (team.players.includes(user._id)) {
      res.status(400).json({ error: "User already part of the team." });
       return
    }

    if (team.players.length >= MAX_PLAYERS) {
       res.status(400).json({ error: "Team already has the maximum number of players." });
      return
      }

    // Add user to the team
    team.players.push(user._id);
    await team.save();

    // Add team to user's document
    await User.findByIdAndUpdate(user._id, {
      $addToSet: { teams: team._id }
    });

    res.status(200).json({
      message: "Joined team successfully.",
      team
    });
  } catch (error) {
    console.error("Error joining team:", error);
   res.status(500).json({ error: "Internal server error" });
    return 
  }
});



router.get('/getAllTeams',authMiddleware,async(req:userRequestAuthentication,res)=>{
  try {
       const { email } = req.user!;
    const user = await User.findOne({ email }).populate("teams");

    if (!user) {
      res.status(404).json({ error: "User not found." });
      return 
    }
    res.status(201).json(user);
  } catch (err:any) {
    res.status(401).json({
      error:err.message
    })
  }
})

router.get('/team/:teamId', authMiddleware, async (req: any, res) => {
  try {
    const { teamId } = req.params

    const team = await Team.findById(teamId)
      .populate({
        path: 'players',
        select: 'gamerTag trustScore kycStatus email', // no role here
      })

    if (!team) {
      res.status(404).json({ error: 'Team not found' })
      return 
    }

    const { email } = req.user!
    const currentUser = await User.findOne({ email }).select('_id')
    const currentUserId = currentUser?._id.toString()

    // Map players and add role based on captainId
    const playersWithRole = team.players.map((player: any) => {
      const playerId = player._id.toString()
      return {
        ...player.toObject(),
        role: playerId === team.captainId.toString() ? 'captain' : 'player',
        isCurrentUser: playerId === currentUserId,
      }
    })

    const isAdmin = currentUserId === team.captainId.toString()

    const averageTrustScore =
      team.players.reduce((acc: number, player: any) => acc + (player.trustScore || 0), 0) /
      (team.players.length || 1)

    res.json({
      id: team._id,
      teamName: team.teamName,
      game: team.game,
      inviteCode: team.inviteCode,
      players: playersWithRole,
      isAdmin,
      averageTrustScore: Math.round(averageTrustScore),
    })
  } catch (err: any) {
    console.error('Error fetching team:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
})


// DELETE /api/player/team/:teamId/remove/:playerId
router.delete("/team/:teamId/remove/:playerId", authMiddleware, async (req:userRequestAuthentication, res) => {
  const { teamId, playerId } = req.params;
  const {email} = req.user!;
  const user = await User.findOne({email});
  if(!user){
    res.status(404).json({
       error: 'User not found'
    })
    return
  }
  const requestingUserId = user._id;

  const team = await Team.findById(teamId);
  if (!team){
    res.status(404).send("Team not found") 
    return;
  }  

  if (team.captainId.toString() !== requestingUserId.toString()) {
     res.status(403).send("Only the captain can remove players");
     return
  }

  team.players = team.players.filter(p => p.toString() !== playerId);
  await team.save();

   // Remove the team from the player's record
  await User.findByIdAndUpdate(playerId, {
    $pull: { teams: team._id },
  },{new:true});


  res.status(200).send({ success: true });
});

// delte team route
router.delete("/team/:teamId", authMiddleware, async (req: userRequestAuthentication, res) => {
  const { teamId } = req.params;
  const { email } = req.user!;
  const user = await User.findOne({ email });

  if (!user) {
     res.status(404).json({ error: "User not found" });
     return;
  }

  const team = await Team.findById(teamId);
  if (!team) {
    res.status(404).json({ error: "Team not found" });
     return
  }

  if (team.captainId.toString() !== user._id.toString()) {
    res.status(403).json({ error: "Only the captain can delete the team" });
     return
  }

  // Remove team from all users' records
  await User.updateMany({ teams: team._id }, { $pull: { teams: team._id } });

  // Delete the team
  await Team.findByIdAndDelete(teamId);

   res.status(200).json({ success: true, message: "Team deleted successfully" });
   return
});




export default router;


function generateInviteCode(length = 6) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}
