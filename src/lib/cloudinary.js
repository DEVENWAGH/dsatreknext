import { v2 as cloudinary } from 'cloudinary';

// Initialize Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload file to Cloudinary
 * @param {Buffer} fileBuffer - File buffer
 * @param {string} fileName - File name with extension
 * @param {string} contentType - MIME type
 * @param {string} folder - Folder path in Cloudinary (e.g., 'problems', 'companies', 'avatars')
 * @returns {Promise<{url: string, key: string}>}
 */
export async function uploadToCloudinary(
  fileBuffer,
  fileName,
  contentType,
  folder = 'general'
) {
  try {
    // Generate unique public_id
    const timestamp = Date.now();
    const publicId = `${folder}/${timestamp}-${fileName.split('.')[0]}`;

    // Convert buffer to base64 data URL
    const base64Data = `data:${contentType};base64,${fileBuffer.toString('base64')}`;

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(base64Data, {
      public_id: publicId,
      folder: folder,
      resource_type: 'auto', // Automatically detect resource type
      overwrite: false,
    });

    return {
      url: result.secure_url,
      key: result.public_id,
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw new Error(`Failed to upload to Cloudinary: ${error.message}`);
  }
}

// Keep the old function name for backward compatibility
export const uploadToS3 = uploadToCloudinary;

/**
 * Delete file from Cloudinary
 * @param {string} key - Cloudinary public_id
 * @returns {Promise<void>}
 */
export async function deleteFromCloudinary(key) {
  try {
    await cloudinary.uploader.destroy(key);
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    throw new Error(`Failed to delete from Cloudinary: ${error.message}`);
  }
}

// Keep the old function name for backward compatibility
export const deleteFromS3 = deleteFromCloudinary;

/**
 * Generate upload URL for Cloudinary (direct upload)
 * @param {string} key - Cloudinary public_id (optional)
 * @param {number} expiresIn - URL expiration time in seconds (default: 1 hour)
 * @returns {Promise<string>}
 */
export async function getPresignedUploadUrl(key, expiresIn = 3600) {
  try {
    // For Cloudinary, we can return the direct upload URL
    // The actual signature should be generated on the client side for security
    const uploadUrl = `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/upload`;

    return uploadUrl;
  } catch (error) {
    console.error('Cloudinary upload URL error:', error);
    throw new Error(
      `Failed to generate Cloudinary upload URL: ${error.message}`
    );
  }
}

/**
 * Validate Cloudinary configuration
 * @returns {boolean}
 */
export function validateCloudinaryConfig() {
  const requiredEnvVars = [
    'NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME',
    'CLOUDINARY_API_KEY',
    'CLOUDINARY_API_SECRET',
  ];

  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      console.error(`Missing required environment variable: ${envVar}`);
      return false;
    }
  }

  return true;
}

// Keep the old function name for backward compatibility
export const validateAWSConfig = validateCloudinaryConfig;
