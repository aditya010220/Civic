import { put, del } from '@vercel/blob';
import * as dotenv from 'dotenv';

dotenv.config();

// Ensure we have the required token
const BLOB_TOKEN = process.env.BLOB_READ_WRITE_TOKEN;

if (!BLOB_TOKEN) {
  throw new Error('BLOB_READ_WRITE_TOKEN is required in environment variables');
}

export const uploadToBlob = async (file, options = {}) => {
  try {
    // Create blob client with authentication
    const blob = await put(file.originalname, file.buffer, {
      access: 'public',
      token: BLOB_TOKEN,
      ...options
    });
    
    return blob;
  } catch (error) {
    console.error('Vercel Blob upload error:', error);
    throw error;
  }
};

export const deleteFromBlob = async (url) => {
  try {
    await del(url, {
      token: BLOB_TOKEN
    });
  } catch (error) {
    console.error('Vercel Blob deletion error:', error);
    throw error;
  }
};