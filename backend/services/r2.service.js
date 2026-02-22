// backend/services/r2.service.js
import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

class R2Service {
  constructor() {
    console.log("🔧 Initializing R2 Service...");
    
    // Log credentials (remove in production)
    console.log("📁 R2_ENDPOINT:", process.env.R2_ENDPOINT ? "✅" : "❌");
    console.log("🪣 R2_BUCKET:", process.env.R2_BUCKET);
    console.log("🌐 R2_PUBLIC_URL:", process.env.R2_PUBLIC_URL);

    this.client = new S3Client({
      region: 'auto',
      endpoint: process.env.R2_ENDPOINT,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY,
        secretAccessKey: process.env.R2_SECRET_KEY,
      },
      forcePathStyle: true,
    });
    
    this.bucket = process.env.R2_BUCKET;
    this.publicUrl = process.env.R2_PUBLIC_URL;
  }

  generateFileName(originalName) {
    const timestamp = Date.now();
    const random = crypto.randomBytes(8).toString('hex');
    const ext = originalName.split('.').pop();
    return `fabrics/${timestamp}-${random}.${ext}`;
  }

  async uploadFile(file, fileName) {
    try {
      console.log("📤 Uploading to R2:", fileName);
      
      const key = this.generateFileName(fileName);
      console.log("Generated key:", key);
      console.log("Bucket:", this.bucket); // This should be just "dreamfit", not the full path

      const command = new PutObjectCommand({
        Bucket: this.bucket,        // ✅ This should be just "dreamfit"
        Key: key,                   // ✅ This should be "fabrics/123-456.jpg"
        Body: file.buffer,
        ContentType: file.mimetype,
      });

      await this.client.send(command);
      console.log("✅ Upload successful");

      return {
        success: true,
        key: key,
        url: `${this.publicUrl}/${key}`,
      };
    } catch (error) {
      console.error('❌ R2 upload error:', error);
      return { success: false, error: error.message };
    }
  }

  async deleteFile(key) {
    try {
      console.log("🗑️ Deleting:", key);
      
      const command = new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key
      });

      await this.client.send(command);
      console.log("✅ Deleted");
      
      return { success: true };
    } catch (error) {
      console.error('❌ R2 delete error:', error);
      return { success: false, error: error.message };
    }
  }
}

export default new R2Service();