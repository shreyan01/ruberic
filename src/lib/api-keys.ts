import { createHash } from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import { supabaseAdmin } from './supabase';

export interface ApiKeyData {
  id: string;
  key_name: string;
  key_prefix: string;
  is_active: boolean;
  last_used_at: string | null;
  usage_count: number;
  created_at: string;
  expires_at: string | null;
}

export class ApiKeyManager {
  /**
   * Generate a new API key
   */
  static generateApiKey(): string {
    const prefix = 'rub_';
    const randomPart = uuidv4().replace(/-/g, '');
    return `${prefix}${randomPart}`;
  }

  /**
   * Hash an API key for secure storage
   */
  static hashApiKey(apiKey: string): string {
    return createHash('sha256').update(apiKey).digest('hex');
  }

  /**
   * Extract prefix from API key for display
   */
  static getKeyPrefix(apiKey: string): string {
    return apiKey.substring(0, 8) + '...';
  }

  /**
   * Create a new API key for a user
   */
  static async createApiKey(
    userId: string,
    keyName: string,
    expiresAt?: Date
  ): Promise<{ apiKey: string; keyData: ApiKeyData }> {
    const apiKey = this.generateApiKey();
    const keyHash = this.hashApiKey(apiKey);
    const keyPrefix = this.getKeyPrefix(apiKey);

    const { data, error } = await supabaseAdmin
      .from('api_keys')
      .insert({
        user_id: userId,
        key_name: keyName,
        key_hash: keyHash,
        key_prefix: keyPrefix,
        expires_at: expiresAt?.toISOString() || null,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create API key: ${error.message}`);
    }

    return {
      apiKey,
      keyData: data as ApiKeyData,
    };
  }

  /**
   * Verify an API key and return user information
   */
  static async verifyApiKey(apiKey: string): Promise<{
    isValid: boolean;
    userId?: string;
    keyId?: string;
    userData?: {
      subscription_tier: string;
      usage_limit: number;
      current_usage: number;
    };
  }> {
    const keyHash = this.hashApiKey(apiKey);

    const { data, error } = await supabaseAdmin
      .from('api_keys')
      .select(`
        id,
        user_id,
        is_active,
        expires_at,
        users!inner (
          id,
          subscription_tier,
          usage_limit,
          current_usage
        )
      `)
      .eq('key_hash', keyHash)
      .single();

    if (error || !data) {
      return { isValid: false };
    }

    const isExpired = data.expires_at && new Date(data.expires_at) < new Date();
    const isValid = data.is_active && !isExpired;

    if (!isValid) {
      return { isValid: false };
    }

    // Update last used timestamp
    await supabaseAdmin
      .from('api_keys')
      .update({
        last_used_at: new Date().toISOString(),
        usage_count: data.usage_count + 1,
      })
      .eq('id', data.id);

    return {
      isValid: true,
      userId: data.user_id,
      keyId: data.id,
      userData: {
        subscription_tier: data.users.subscription_tier,
        usage_limit: data.users.usage_limit,
        current_usage: data.users.current_usage,
      },
    };
  }

  /**
   * Get all API keys for a user
   */
  static async getUserApiKeys(userId: string): Promise<ApiKeyData[]> {
    const { data, error } = await supabaseAdmin
      .from('api_keys')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch API keys: ${error.message}`);
    }

    return data as ApiKeyData[];
  }

  /**
   * Deactivate an API key
   */
  static async deactivateApiKey(keyId: string, userId: string): Promise<void> {
    const { error } = await supabaseAdmin
      .from('api_keys')
      .update({ is_active: false })
      .eq('id', keyId)
      .eq('user_id', userId);

    if (error) {
      throw new Error(`Failed to deactivate API key: ${error.message}`);
    }
  }

  /**
   * Delete an API key
   */
  static async deleteApiKey(keyId: string, userId: string): Promise<void> {
    const { error } = await supabaseAdmin
      .from('api_keys')
      .delete()
      .eq('id', keyId)
      .eq('user_id', userId);

    if (error) {
      throw new Error(`Failed to delete API key: ${error.message}`);
    }
  }

  /**
   * Check if user has reached usage limit
   */
  static async checkUsageLimit(userId: string): Promise<{
    canProceed: boolean;
    currentUsage: number;
    usageLimit: number;
  }> {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('current_usage, usage_limit')
      .eq('id', userId)
      .single();

    if (error) {
      throw new Error(`Failed to check usage limit: ${error.message}`);
    }

    return {
      canProceed: data.current_usage < data.usage_limit,
      currentUsage: data.current_usage,
      usageLimit: data.usage_limit,
    };
  }

  /**
   * Increment usage counter
   */
  static async incrementUsage(userId: string, tokensUsed: number = 1): Promise<void> {
    const { error } = await supabaseAdmin
      .from('users')
      .update({
        current_usage: supabaseAdmin.raw('current_usage + ?', [tokensUsed]),
      })
      .eq('id', userId);

    if (error) {
      throw new Error(`Failed to increment usage: ${error.message}`);
    }
  }

  /**
   * Record API usage for tracking
   */
  static async recordUsage(
    userId: string,
    apiKeyId: string | null,
    endpoint: string,
    tokensUsed: number = 0,
    cost: number = 0
  ): Promise<void> {
    const { error } = await supabaseAdmin
      .from('usage_tracking')
      .insert({
        user_id: userId,
        api_key_id: apiKeyId,
        endpoint,
        tokens_used: tokensUsed,
        cost,
      });

    if (error) {
      console.error('Failed to record usage:', error);
      // Don't throw here as this is not critical for the main operation
    }
  }
}
