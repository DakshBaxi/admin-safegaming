import  express  from "express";
import { config } from "dotenv";
import playerRoute from './routes/playerRoute'
import adminRoute from './routes/adminRoute'
import tournamentRoute from './routes/tournamentRoute'
import { connectDB } from "./config/db";
import playmentRoute from "./routes/razorPaymentRoute"
import cors from "cors"
const app = express();
config();
const PORT  = process.env.PORT ||5000


app.use(  cors({
    origin: "*",
  }))
app.listen(PORT,()=>{
    console.log(`Server is listening ${PORT} `)
})
app.use(express.json());
connectDB();
app.get('/',(req,res)=>{
    res.json(
        "Hello from backend"
    )
})

app.use('/api/player',playerRoute);

app.use('/api/admin',adminRoute);
app.use('/api/payment',playmentRoute)
app.use('/api/tournament',tournamentRoute);