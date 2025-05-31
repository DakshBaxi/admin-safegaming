import  express  from "express";
import { config } from "dotenv";
import playerRoute from './routes/playerRoute'
import adminRoute from './routes/adminRoute'
import tournamentRoute from './routes/tournamentRoute'
const app = express();
config();
const PORT  = process.env.PORT ||5000

app.listen(PORT,()=>{
    console.log(`Server is listning ${PORT} `)
})

app.get('/',(req,res)=>{
    res.json(
        "Hello from backend"
    )
})

app.use('/api/player',playerRoute);

app.use('/api/admin',adminRoute);

app.use('/api/tournament',tournamentRoute);