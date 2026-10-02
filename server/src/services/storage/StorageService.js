import { supabaseAdmin } from '../../config/supabase.js';
import config from '../../config/index.js';
import path from 'path';

const ALLOWED_EXTENSIONS = ['.pdf', '.png', '.jpg', '.jpeg', '.webp'];
const MAX_FILE_SIZE = config.upload.maxFileSizeMB * 1024 * 1024;

/**
 * StorageService — manages all Supabase Storage interactions.
 * Enforces MIME type, extension, and size validation server-side.
 * Files are stored in user-scoped folders: {userId}/{filename}
 */
class StorageService {
  /**
   * Validate a file before upload.
   */
  validate(file) {
    const errors = [];

    if (!file) {
      errors.push('No file provided.');
      return errors;
    }

    if (file.size > MAX_FILE_SIZE) {
      errors.push(`File size exceeds ${config.upload.maxFileSizeMB}MB limit.`);
    }

    const ext = path.extname(file.originalname).toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      errors.push(`File extension "${ext}" is not allowed. Allowed: ${ALLOWED_EXTENSIONS.join(', ')}`);
    }

    if (!config.upload.allowedMimeTypes.includes(file.mimetype)) {
      errors.push(`MIME type "${file.mimetype}" is not allowed.`);
    }

    return errors;
  }

  /**
   * Upload a file to the specified bucket.
   * @param {string} bucket - 'forms' | 'documents' | 'generated'
   * @param {string} userId
   * @param {Buffer} fileBuffer
   * @param {string} fileName
   * @param {string} mimeType
   * @returns {{ filePath: string, publicUrl: string }}
   */
  async upload(bucket, userId, fileBuffer, fileName, mimeType) {
    const safeName = `${Date.now()}_${fileName.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
    const filePath = `${userId}/${safeName}`;

    const { data, error } = await supabaseAdmin.storage
      .from(bucket)
      .upload(filePath, fileBuffer, {
        contentType: mimeType,
        upsert: false,
      });

    if (error) throw new Error(`Storage upload failed: ${error.message}`);

    return { filePath: data.path, fullPath: `${bucket}/${data.path}` };
  }

  /**
   * Generate a signed URL for private file access.
   * Default 1-hour expiry.
   */
  async getSignedUrl(bucket, filePath, expiresIn = 3600) {
    const { data, error } = await supabaseAdmin.storage
      .from(bucket)
      .createSignedUrl(filePath, expiresIn);

    if (error) throw new Error(`Failed to generate signed URL: ${error.message}`);
    return data.signedUrl;
  }

  /**
   * Download a file as a Buffer (for AI processing).
   */
  async download(bucket, filePath) {
    const { data, error } = await supabaseAdmin.storage
      .from(bucket)
      .download(filePath);

    if (error) throw new Error(`Failed to download file: ${error.message}`);

    const arrayBuffer = await data.arrayBuffer();
    return Buffer.from(arrayBuffer);
  }

  /**
   * Delete a file from storage.
   */
  async delete(bucket, filePath) {
    const { error } = await supabaseAdmin.storage
      .from(bucket)
      .remove([filePath]);

    if (error) throw new Error(`Failed to delete file: ${error.message}`);
  }

  /**
   * Ensure required storage buckets exist.
   */
  async ensureBuckets() {
    const buckets = ['forms', 'documents', 'generated'];
    for (const bucket of buckets) {
      const { data } = await supabaseAdmin.storage.getBucket(bucket);
      if (!data) {
        await supabaseAdmin.storage.createBucket(bucket, {
          public: false,
          fileSizeLimit: MAX_FILE_SIZE,
        });
        console.log(`  ✓ Created storage bucket: ${bucket}`);
      }
    }
  }
}

export default new StorageService();
