import express from "express";

const router = express.Router();

router.get('/',(req,res)=>{
    const adminID =1;
    res.json({
        "userId":adminID
    })
})



export default router;