// server/src/config/cloudinary.config.js
import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

// Using CLOUDINARY_URL
cloudinary.config({
  url: process.env.CLOUDINARY_URL,
  secure: true,
});

export default cloudinary;