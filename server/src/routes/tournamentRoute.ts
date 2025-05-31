import express from "express";

const router = express.Router();

router.get('/',(req,res)=>{
    const tournamentId =1;
    res.json({
        "userId":tournamentId
    })
})



export default router;