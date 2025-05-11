import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinaryConfig";

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => ({
    public_id: `${Date.now()}-${file.originalname}`,
    format: file.mimetype.split("/")[1], // Extract file format (jpg, png, etc.)
  }),
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

export default upload;
