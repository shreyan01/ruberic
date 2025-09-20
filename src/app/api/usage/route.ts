import { NextRequest, NextResponse } from 'next/server';
import { ApiKeyManager } from '@/lib/api-keys';
import { supabaseAdmin } from '@/lib/supabase';

/**
 * Usage tracking endpoint for customers
 * 
 * GET /api/usage?apiKey=xxx - Get customer's usage statistics
 * 
 * Response:
 * {
 *   "currentUsage": 150,
 *   "usageLimit": 1000,
 *   "usagePercentage": 15.0,
 *   "subscriptionTier": "free",
 *   "usageRemaining": 850
 * }
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const apiKey = searchParams.get('apiKey');

    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key is required' },
        { status: 400 }
      );
    }

    // Verify API key
    const keyVerification = await ApiKeyManager.verifyApiKey(apiKey);
    
    if (!keyVerification.isValid || !keyVerification.userId || !keyVerification.userData) {
      return NextResponse.json(
        { error: 'Invalid or expired API key' },
        { status: 401 }
      );
    }

    const { currentUsage, usageLimit, subscriptionTier } = keyVerification.userData;
    const usagePercentage = usageLimit > 0 ? (currentUsage / usageLimit) * 100 : 0;
    const usageRemaining = Math.max(0, usageLimit - currentUsage);

    return NextResponse.json({
      currentUsage,
      usageLimit,
      usagePercentage: Math.round(usagePercentage * 100) / 100,
      subscriptionTier,
      usageRemaining,
    });
  } catch (error) {
    console.error('Error fetching usage:', error);
    return NextResponse.json(
      { error: 'Failed to fetch usage statistics' },
      { status: 500 }
    );
  }
}


