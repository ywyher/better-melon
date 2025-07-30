// app/api/upload/get-presigned-url/route.ts
import { NextRequest, NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { getSession } from "@/lib/auth-client";
import crypto from "crypto";
import { rateLimit } from "@/lib/rate-limit";

// Validate environment variables
const requiredEnvVars = [
  'S3_ACCOUNT_ID',
  'S3_ACCESS_KEY_ID',
  'S3_SECRET_ACCESS_KEY',
  'S3_BUCKET_NAME'
];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`Missing required environment variable: ${envVar}`);
    throw new Error(`Server configuration error: Missing ${envVar}`);
  }
}

const s3 = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.S3_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID!,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
  },
});

const generateFileName = (bytes = 32) =>
  crypto.randomBytes(bytes).toString("hex");

// Define file type configurations with their respective max sizes
const fileTypeConfigs = {
  // Images: 4MB
  "image/jpeg": 4 * 1024 * 1024,
  "image/png": 4 * 1024 * 1024,
  "image/gif": 4 * 1024 * 1024,
  "image/webp": 4 * 1024 * 1024,
  // PDFs: 10MB
  "application/pdf": 10 * 1024 * 1024,
  // Word documents: 10MB
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": 10 * 1024 * 1024,
  // Videos: 10MB
  "video/mp4": 10 * 1024 * 1024,
  // Audio files: 10MB
  "audio/mpeg": 10 * 1024 * 1024, // MP3
  "audio/mp3": 10 * 1024 * 1024, // MP3 alternative
  "audio/wav": 10 * 1024 * 1024, // WAV
  "audio/x-wav": 10 * 1024 * 1024, // WAV alternative
  "audio/wave": 10 * 1024 * 1024, // WAV alternative
  "audio/vnd.wave": 10 * 1024 * 1024, // WAV alternative
  "audio/ogg": 10 * 1024 * 1024, // OGG
  "application/ogg": 10 * 1024 * 1024, // OGG alternative
  "audio/flac": 10 * 1024 * 1024, // FLAC
  "audio/x-flac": 10 * 1024 * 1024, // FLAC alternative
  "audio/aac": 10 * 1024 * 1024, // AAC
  "audio/x-aac": 10 * 1024 * 1024, // AAC alternative
  "audio/mp4": 10 * 1024 * 1024, // AAC in MP4 container
  "audio/x-m4a": 10 * 1024 * 1024, // AAC in M4A container
  "audio/webm": 10 * 1024 * 1024, // WebM audio
};

// Get accepted types from the keys of fileTypeConfigs
const acceptedTypes = Object.keys(fileTypeConfigs);

// Create a rate limiter that allows 20 requests per user per minute
const limiter = rateLimit({
  uniqueTokenPerInterval: 500, // Max number of users per interval
  interval: 60 * 1000, // 1 minute
  limit: 20, // 20 requests per interval
});

export async function POST(req: NextRequest) {
  // Security headers
  const headers = new Headers({
    'Content-Type': 'application/json',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
  });

  try {
    // Authenticate user
    const { data: session } = await getSession({
      fetchOptions: {
        headers: req.headers,
      },
    });

    if (!session || !session.user) {
      return NextResponse.json(
        { message: "Not authenticated" }, 
        { status: 401, headers }
      );
    }

    // Apply rate limiting
    try {
      await limiter.check(headers, `upload_${session.user.id}`, 20);
    } catch {
      return NextResponse.json(
        { message: "Too many upload requests. Please try again later." },
        { status: 429, headers }
      );
    }

    // Validate request body
    if (!req.body) {
      return NextResponse.json(
        { message: "Request body is required" },
        { status: 400, headers }
      );
    }
    
    // Parse request body
    const body = await req.json().catch(() => null);
    
    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { message: "Invalid request body" },
        { status: 400, headers }
      );
    }
    
    const { type, size, checksum } = body;
    
    // Validate required fields
    if (!type || !size || !checksum) {
      return NextResponse.json(
        { message: "Missing required fields: type, size, and checksum are required" },
        { status: 400, headers }
      );
    }

    // Validate file type
    if (!acceptedTypes.includes(type)) {
      return NextResponse.json(
        { message: `Invalid file type: ${type}. Accepted types are: ${acceptedTypes.join(', ')}` },
        { status: 400, headers }
      );
    }

    // Get the max size for this specific file type
    const maxFileSize = fileTypeConfigs[type as keyof typeof fileTypeConfigs];

    // Validate file size
    if (size > maxFileSize) {
      return NextResponse.json(
        { message: `File size too large. Maximum allowed for ${type} is ${maxFileSize / (1024 * 1024)}MB` },
        { status: 400, headers }
      );
    }

    // Generate a unique file name
    const fileName = generateFileName();
    // Get file extension from mime type
    const extension = type.split('/')[1] || '';
    // Create a clean filename with extension if possible
    const fileNameWithExt = extension ? `${fileName}.${extension}` : fileName;

    // Determine the content disposition based on file type
    const isViewableInBrowser = type.startsWith('image/') || type === 'application/pdf';
    const contentDisposition = isViewableInBrowser 
      ? 'inline' 
      : `attachment; filename="${fileNameWithExt}"`;

    // Create S3 upload command with metadata
    const putObjectCommand = new PutObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME!,
      Key: fileNameWithExt,
      ContentType: type,
      ContentLength: size,
      ChecksumSHA256: checksum,
      ContentDisposition: contentDisposition,
      Metadata: {
        userId: session.user.id,
        originalUploadDate: new Date().toISOString(),
      },
    });

    // Generate presigned URL
    const preSignedUrl = await getSignedUrl(s3, putObjectCommand, {
      expiresIn: 3600, // 1 hour
    });
    
    // Return success response
    return NextResponse.json(
      { 
        key: fileNameWithExt, 
        url: preSignedUrl, 
        name: fileNameWithExt, 
        type, 
        size 
      },
      { headers }
    );
    
  } catch (error) {
    console.error("Error generating presigned URL:", error);
    
    return NextResponse.json(
      { message: "Failed to generate pre-signed URL. Please try again later." },
      { status: 500, headers }
    );
  }
}