import { UploadedFile } from 'express-fileupload';
import cloudinary from '../config/cloudinaryConfig';
import { unlink } from 'fs/promises';

export const uploadToCloudinary = async (file: UploadedFile): Promise<{ secure_url: string }> => {
  try {
    // Upload the file to Cloudinary
    const result = await cloudinary.uploader.upload(file.tempFilePath, {
      folder: 'feedback-screenshots',
      allowed_formats: ['jpg', 'png', 'jpeg', 'gif'],
      resource_type: 'auto',
      max_bytes: 10485760, // 10MB limit
    });

    // Clean up the temporary file
    if (file.tempFilePath) {
      await unlink(file.tempFilePath);
    }

    return { secure_url: result.secure_url };
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    throw new Error('Failed to upload image');
  }
};