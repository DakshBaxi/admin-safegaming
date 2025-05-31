import express from "express";

const router = express.Router();

router.get('/',(req,res)=>{
    const userID =1;
    res.json({
        "userId":userID
    })
})



export default router;