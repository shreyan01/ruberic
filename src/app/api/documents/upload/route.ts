import { NextRequest, NextResponse } from 'next/server';
import { ApiKeyManager } from '@/lib/api-keys';
import { DocumentProcessor } from '@/lib/document-processor';

/**
 * Document upload endpoint for customers to add their documentation
 * 
 * Request: multipart/form-data
 * - file: The document file (PDF, DOCX, TXT, MD)
 * - apiKey: Customer's API key
 * - projectId: Optional project ID (if not provided, uses default project)
 * 
 * Response:
 * {
 *   "message": "Document uploaded and processed successfully",
 *   "documentId": "uuid",
 *   "chunksCount": 15,
 *   "status": "completed"
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const apiKey = formData.get('apiKey') as string;
    const projectId = formData.get('projectId') as string;

    // Validate required fields
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key is required' },
        { status: 400 }
      );
    }

    // Verify API key
    const keyVerification = await ApiKeyManager.verifyApiKey(apiKey);
    
    if (!keyVerification.isValid || !keyVerification.userId) {
      return NextResponse.json(
        { error: 'Invalid or expired API key' },
        { status: 401 }
      );
    }

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'text/markdown',
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Unsupported file type. Please upload PDF, DOCX, TXT, or MD files.' },
        { status: 400 }
      );
    }

    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size too large. Maximum size is 10MB.' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Use customer's default project if none specified
    const targetProjectId = projectId || keyVerification.userId;

    // Process the document
    const result = await DocumentProcessor.processDocument(
      buffer,
      file.name,
      file.type,
      targetProjectId,
      keyVerification.userId
    );

    return NextResponse.json({
      message: 'Document uploaded and processed successfully',
      documentId: result.documentId,
      chunksCount: result.chunks.length,
      status: 'completed',
      filename: file.name,
    });
  } catch (error) {
    console.error('Error uploading document:', error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to upload document' },
      { status: 500 }
    );
  }
}
