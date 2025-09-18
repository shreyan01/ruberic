import { createClient } from "@supabase/supabase-js";

const supabase_url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabase_anon_key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase_service_key = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Client for browser/frontend use
export const supabase = createClient(supabase_url, supabase_anon_key);

// Admin client for server-side operations
export const supabaseAdmin = createClient(supabase_url, supabase_service_key, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Database types
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          company_name: string | null;
          created_at: string;
          updated_at: string;
          subscription_tier: 'free' | 'pro' | 'enterprise';
          usage_limit: number;
          current_usage: number;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          company_name?: string | null;
          subscription_tier?: 'free' | 'pro' | 'enterprise';
          usage_limit?: number;
          current_usage?: number;
        };
        Update: {
          full_name?: string | null;
          company_name?: string | null;
          subscription_tier?: 'free' | 'pro' | 'enterprise';
          usage_limit?: number;
          current_usage?: number;
        };
      };
      api_keys: {
        Row: {
          id: string;
          user_id: string;
          key_name: string;
          key_hash: string;
          key_prefix: string;
          is_active: boolean;
          last_used_at: string | null;
          usage_count: number;
          created_at: string;
          expires_at: string | null;
        };
        Insert: {
          user_id: string;
          key_name: string;
          key_hash: string;
          key_prefix: string;
          is_active?: boolean;
          expires_at?: string | null;
        };
        Update: {
          key_name?: string;
          is_active?: boolean;
          last_used_at?: string | null;
          usage_count?: number;
          expires_at?: string | null;
        };
      };
      projects: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          description: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          name: string;
          description?: string | null;
        };
        Update: {
          name?: string;
          description?: string | null;
        };
      };
      documents: {
        Row: {
          id: string;
          project_id: string;
          user_id: string;
          filename: string;
          original_filename: string;
          file_type: string;
          file_size: number;
          content_hash: string;
          upload_status: 'pending' | 'processing' | 'completed' | 'failed';
          processing_error: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          project_id: string;
          user_id: string;
          filename: string;
          original_filename: string;
          file_type: string;
          file_size: number;
          content_hash: string;
          upload_status?: 'pending' | 'processing' | 'completed' | 'failed';
          processing_error?: string | null;
        };
        Update: {
          upload_status?: 'pending' | 'processing' | 'completed' | 'failed';
          processing_error?: string | null;
        };
      };
      document_chunks: {
        Row: {
          id: string;
          document_id: string;
          chunk_index: number;
          content: string;
          content_length: number;
          embedding: number[] | null;
          metadata: any;
          created_at: string;
        };
        Insert: {
          document_id: string;
          chunk_index: number;
          content: string;
          content_length: number;
          embedding?: number[] | null;
          metadata?: any;
        };
        Update: {
          content?: string;
          content_length?: number;
          embedding?: number[] | null;
          metadata?: any;
        };
      };
      chat_sessions: {
        Row: {
          id: string;
          user_id: string;
          project_id: string | null;
          session_name: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          project_id?: string | null;
          session_name?: string | null;
        };
        Update: {
          session_name?: string | null;
        };
      };
      chat_messages: {
        Row: {
          id: string;
          session_id: string;
          role: 'user' | 'assistant' | 'system';
          content: string;
          metadata: any;
          created_at: string;
        };
        Insert: {
          session_id: string;
          role: 'user' | 'assistant' | 'system';
          content: string;
          metadata?: any;
        };
        Update: {
          content?: string;
          metadata?: any;
        };
      };
      usage_tracking: {
        Row: {
          id: string;
          user_id: string;
          api_key_id: string | null;
          endpoint: string;
          tokens_used: number;
          cost: number;
          created_at: string;
        };
        Insert: {
          user_id: string;
          api_key_id?: string | null;
          endpoint: string;
          tokens_used?: number;
          cost?: number;
        };
      };
    };
  };
}