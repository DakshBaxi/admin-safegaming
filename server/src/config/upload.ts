import multer from "multer";
export  const upload = multer({ 
  storage: multer.memoryStorage(),
  // optional file filter
  fileFilter: (req, file, cb) => {
    cb(null, true);
  }
});