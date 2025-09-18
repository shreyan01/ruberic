-- Create function for vector similarity search
CREATE OR REPLACE FUNCTION match_document_chunks(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.7,
  match_count int DEFAULT 5,
  project_id uuid DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  content text,
  document_id uuid,
  chunk_index int,
  similarity float,
  metadata jsonb
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    dc.id,
    dc.content,
    dc.document_id,
    dc.chunk_index,
    1 - (dc.embedding <=> query_embedding) as similarity,
    dc.metadata
  FROM document_chunks dc
  JOIN documents d ON d.id = dc.document_id
  WHERE 
    dc.embedding IS NOT NULL
    AND (project_id IS NULL OR d.project_id = project_id)
    AND 1 - (dc.embedding <=> query_embedding) > match_threshold
  ORDER BY dc.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Create function to get user usage statistics
CREATE OR REPLACE FUNCTION get_user_usage_stats(user_uuid uuid)
RETURNS TABLE (
  current_usage int,
  usage_limit int,
  subscription_tier text,
  usage_percentage float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    u.current_usage,
    u.usage_limit,
    u.subscription_tier,
    CASE 
      WHEN u.usage_limit > 0 THEN (u.current_usage::float / u.usage_limit::float) * 100
      ELSE 0
    END as usage_percentage
  FROM users u
  WHERE u.id = user_uuid;
END;
$$;

-- Create function to reset monthly usage (for subscription management)
CREATE OR REPLACE FUNCTION reset_monthly_usage()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE users 
  SET current_usage = 0
  WHERE subscription_tier IN ('free', 'pro');
  
  -- Log the reset action
  INSERT INTO usage_tracking (user_id, endpoint, tokens_used, cost)
  SELECT 
    id,
    'monthly_reset',
    0,
    0
  FROM users 
  WHERE subscription_tier IN ('free', 'pro');
END;
$$;

-- Create index for better vector search performance
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_document_chunks_embedding_cosine 
ON document_chunks USING ivfflat (embedding vector_cosine_ops) 
WITH (lists = 100);

-- Create function to clean up old usage tracking data (keep last 90 days)
CREATE OR REPLACE FUNCTION cleanup_old_usage_data()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  DELETE FROM usage_tracking 
  WHERE created_at < NOW() - INTERVAL '90 days';
END;
$$;
