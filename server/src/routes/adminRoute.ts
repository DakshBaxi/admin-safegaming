import express from "express";
import { KYC } from "../models/KYC";
import { transporter } from "../controller/emailController";
import { User } from "../models/User";

const router = express.Router();

router.get('/',(req,res)=>{
    const adminID =1;
    res.json({
        "userId":adminID
    })
})

router.put("/approveKyc/:userId",async(req,res)=>{
try {
        const userId = req.params.userId 
    const kyc = await KYC.findOneAndUpdate({
        userId:userId
    },{
        status:"approved"
    },{
        new:true
    })
      if (!kyc) {
     res.status(404).json({ error: "KYC not found" })
      return 
    }
     const user = await User.findById(userId)

    if (!user || !user.email) {
       res.status(404).json({ error: "User not found or email missing" })
       return
    }
     await transporter.sendMail({
      from: `${process.env.EMAIL_USER}`,
      to: user.email,
      subject: "KYC Approved ✅",
      html: `
        <h2>Your KYC has been approved!</h2>
        <p>Hi ${user.fullName || "User"},</p>
        <p>We're happy to inform you that your KYC verification has been approved. You can now access all platform features.</p>
        <p>Thank you!</p>
      `,
    })
    res.status(201).json(kyc)
} catch (err:any) {
    res.status(401).json({
        error:err.message
    })
}
})

router.put("/rejectKyc/:userId",async(req,res)=>{
try {
        const userId = req.params.userId 
    const kyc = await KYC.findOneAndUpdate({
        userId:userId
    },{
        status:"rejected"
    },{
        new:true
    })

    if (!kyc) {
       res.status(404).json({ error: "KYC record not found" })
       return
    }
    const user = await User.findById(userId)

    if (!user || !user.email) {
      res.status(404).json({ error: "User not found or email missing" })
       return
    }
        await transporter.sendMail({
      from: `${process.env.EMAIL_USER}`,
      to: user.email,
      subject: "KYC Rejected ❌",
      html: `
        <h2>Your KYC has been rejected</h2>
        <p>Hi ${user.fullName || "User"},</p>
        <p>Unfortunately, your KYC verification was rejected. Please review the reasons below and re-upload valid documents.</p>
        <ul>
          <li>Blurry or unreadable images</li>
          <li>Mismatch between your ID and selfie</li>
          <li>Expired or invalid documents</li>
        </ul>
        <p>If you believe this was an error, please contact our support team.</p>
      `,
    })
    res.status(201).json(kyc)
} catch (err:any) {
    res.status(401).json({
        error:err.message
    })
}
})


export default router;