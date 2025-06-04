import { Request,Response,NextFunction } from "express"
import {auth} from '../config/firebase'

export interface userRequestAuthentication extends Request{
  user?: {
    uid: string;
    email?: string;
    profileUrl?: string;
  };
}

export const authMiddleware= async (req:userRequestAuthentication,res:Response,next:NextFunction)=>{
    const authHeader = req.headers.authorization;   
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
     res.status(401).json({ message: 'Unauthorized: No token provided' });
     return
  }
   const idToken = authHeader.split('Bearer ')[1];
  try {
    const decodedToken  = await auth.verifyIdToken(idToken);

      req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      profileUrl: decodedToken.picture, // 👈 Firebase returns `picture` for profile URL
    };
    next();
  } catch (error) {
    console.error('Error verifying token:', error);
   res.status(401).json({ message: 'Unauthorized: Invalid token' });
    return ;
  }
}