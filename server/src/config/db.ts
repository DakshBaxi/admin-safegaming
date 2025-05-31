import mongoose from 'mongoose'
import { config } from "dotenv";
import { User } from '../models/User';
import { Tournament } from '../models/Tournament';
import { GameAccount } from '../models/GameAccount';
import { KYC } from '../models/KYC';
import { TournamentApplicant } from '../models/TournamentApplicant';


config();
export const connectDB = async ()=>{
    try{
     
        const uri = process.env.MONGODB_URI;
        
         if (typeof uri !== "string") {
    return;
}
  //         console.log('MongoDB URI:', uri);
          await mongoose.connect(uri)
        console.log("connect to mongo");
    }
    catch(error){
        console.error('Error connecting to MongoDB:', error);
    process.exit(1);
    }
}

export {User,Tournament,GameAccount,KYC,TournamentApplicant}