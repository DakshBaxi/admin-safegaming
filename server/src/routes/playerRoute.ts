import express from "express";
import { User } from "../models/User";

const router = express.Router();

router.get('/',(req,res)=>{
    const userID =1;
    res.json({
        "userId":userID
    })
})

router.post('/', async (req, res) => {
  try {
    const newUser = await User.create(req.body);
    res.status(201).json(newUser);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});




export default router;