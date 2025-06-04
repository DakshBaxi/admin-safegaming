import express, { Request, Response } from "express"
import Razorpay from "razorpay"
import crypto from "crypto"

const router = express.Router()

// Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
})

// Create Order Route
router.post("/initiate",
    // @ts-ignore
     async (req: Request, res: Response) => 
        {
  const { amount, currency = "INR", receipt = "receipt#1" } = req.body as {
    amount: number
    currency?: string
    receipt?: string
  }

  if (!amount) {
    return res.status(400).json({ error: "Amount is required" })
  }

  try {
    // @ts-ignore
    const options: Razorpay.OrderCreateRequestBody = {
      amount: amount * 100, // convert to paise
      currency,
      receipt,
    }

    const order = await razorpay.orders.create(options)
    res.status(200).json(order)
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Internal Server Error" })
  }
})

// Verify Payment Signature Route
router.post("/verify",
    // @ts-ignore
     (req: Request, res: Response) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
  }: {
    razorpay_order_id: string
    razorpay_payment_id: string
    razorpay_signature: string
  } = req.body

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return res.status(400).json({ error: "Missing required fields" })
  }

  const generatedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex")

  if (generatedSignature === razorpay_signature) {
    res.status(200).json({ status: "Payment verified" })
  } else {
    res.status(400).json({ error: "Payment verification failed" })
  }
})

export default router
