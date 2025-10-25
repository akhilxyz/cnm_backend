// api/upload.service.ts

import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { RequestHandler } from 'express';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import streamifier from 'streamifier';

// Cloudinary Config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

// Memory storage for multer
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

const imageUpload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
});

export const uploadFiles: RequestHandler = upload.array('files', 10);
export const uploadImages: RequestHandler = imageUpload.array('images', 5);

// Function to upload buffer to Cloudinary
const uploadToCloudinary = (file: Express.Multer.File, folder: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        public_id: uuidv4() + path.extname(file.originalname),
        resource_type: 'auto',
      },
      (error, result) => {
        if (error || !result) return reject(error);
        resolve(result.secure_url);
      }
    );

    streamifier.createReadStream(file.buffer).pipe(stream);
  });
};

export const uploadFilesToCloudinary = async (
  files: Express.Multer.File[]
): Promise<string[]> => {
  const uploads = files.map((file) => uploadToCloudinary(file, 'projects'));
  return Promise.all(uploads);
};

export const uploadImagesToCloudinary = async (
  images: Express.Multer.File[]
): Promise<string[]> => {
  const uploads = images.map((img) => uploadToCloudinary(img, 'projects/images'));
  return Promise.all(uploads);
};



export const deleteFromCloudinary = async (publicId: string) => {
  return cloudinary.uploader.destroy(publicId);
};

export const extractPublicId = (url: string): string | null => {
  try {
    const parts = url.split("/");
    const filename = parts[parts.length - 1]; // e.g. "abc123.jpg"
    return filename.split(".")[0]; // "abc123"
  } catch {
    return null;
  }
};