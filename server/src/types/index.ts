export interface userRequestAuthentication extends Request{
  user?: {
    uid: string;
    email?: string;
    profileUrl?: string;
  };
}
export interface fileRequest extends userRequestAuthentication{
        files: {
        govtId: Express.Multer.File[];
        selfie: Express.Multer.File[];
    };
}
