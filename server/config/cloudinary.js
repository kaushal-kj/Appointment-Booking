import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Enhanced Cloudinary storage for consistent sizing
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "teacher-student-system",
    allowed_formats: ["jpg", "jpeg", "png", "gif", "webp"],
    transformation: [
      {
        width: 400,
        height: 400,
        crop: "fill",
        gravity: "face", // Focus on face
        quality: "auto:eco", // Lower quality to reduce size
        fetch_format: "auto", // Optimize format
        flags: "strip_profile", // Remove metadata to reduce size
      },
    ],
    // Add these to ensure consistent file size
    resource_type: "image",
    type: "upload",
  },
});

// Enhanced multer upload middleware
export const uploadProfilePicture = multer({
  storage: storage,
  limits: {
    fileSize: 2 * 1024 * 1024, // Reduce to 2MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed!"), false);
    }
  },
});

export default cloudinary;
