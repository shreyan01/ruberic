import { NextRequest, NextResponse } from 'next/server';
import { ApiKeyManager } from '@/lib/api-keys';

/**
 * API key management endpoint for customers
 * 
 * POST /api/keys - Create a new API key
 * Request body:
 * {
 *   "keyName": "My App API Key",
 *   "expiresAt": "2024-12-31T23:59:59Z" // Optional
 * }
 * 
 * Response:
 * {
 *   "apiKey": "rub_abc123...",
 *   "keyData": { ... },
 *   "message": "API key created successfully. Please save it securely as it will not be shown again."
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const { keyName, expiresAt, customerId } = await request.json();

    // For now, we'll use a simple approach where customers provide their ID
    // In production, you'd want proper authentication/registration
    if (!keyName || !customerId) {
      return NextResponse.json(
        { error: 'Key name and customer ID are required' },
        { status: 400 }
      );
    }

    const expiresDate = expiresAt ? new Date(expiresAt) : undefined;
    const { apiKey, keyData } = await ApiKeyManager.createApiKey(
      customerId,
      keyName,
      expiresDate
    );

    return NextResponse.json({
      apiKey,
      keyData,
      message: 'API key created successfully. Please save it securely as it will not be shown again.',
    });
  } catch (error) {
    console.error('Error creating API key:', error);
    return NextResponse.json(
      { error: 'Failed to create API key' },
      { status: 500 }
    );
  }
}
