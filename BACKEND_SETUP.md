# Documentation Assistant Backend Setup

This document provides a complete guide to setting up the documentation assistant chatbot backend system.

## Overview

The system consists of:
- **Database**: Supabase with PostgreSQL and pgvector extension
- **Authentication**: Supabase Auth with API key management
- **Document Processing**: PDF, DOCX, TXT, MD file support with vector embeddings
- **Chat API**: OpenAI GPT integration with document context
- **Usage Tracking**: Token-based usage limits and billing

## Database Schema

### Core Tables

1. **users** - User profiles and subscription information
2. **api_keys** - API key management with hashing
3. **projects** - Document organization
4. **documents** - File metadata and processing status
5. **document_chunks** - Text chunks with vector embeddings
6. **chat_sessions** - Chat conversation management
7. **chat_messages** - Individual chat messages
8. **usage_tracking** - API usage monitoring

### Key Features

- **Row Level Security (RLS)** - Users can only access their own data
- **Vector Search** - Semantic search using pgvector
- **Usage Limits** - Subscription-based token limits
- **API Key Security** - SHA-256 hashed keys with prefixes

## Setup Instructions

### 1. Supabase Setup

1. Create a new Supabase project
2. Enable the `vector` extension in your database
3. Run the migration files in order:
   ```sql
   -- Run these in your Supabase SQL editor
   supabase/migrations/001_initial_schema.sql
   supabase/migrations/002_rls_policies.sql
   supabase/migrations/003_vector_search_function.sql
   ```

### 2. Environment Variables

Copy `env.example` to `.env.local` and fill in your values:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key

# Next.js Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Database Functions

The system includes several PostgreSQL functions:

- `match_document_chunks()` - Vector similarity search
- `get_user_usage_stats()` - Usage statistics
- `reset_monthly_usage()` - Monthly usage reset
- `cleanup_old_usage_data()` - Data cleanup

## API Endpoints

### Authentication Required (Dashboard)

- `GET /api/projects` - List user projects
- `POST /api/projects` - Create new project
- `GET /api/projects/[id]` - Get project details
- `PUT /api/projects/[id]` - Update project
- `DELETE /api/projects/[id]` - Delete project

- `GET /api/keys` - List API keys
- `POST /api/keys` - Create new API key
- `DELETE /api/keys/[id]` - Delete API key
- `PATCH /api/keys/[id]` - Activate/deactivate key

- `POST /api/documents/upload` - Upload document
- `GET /api/chat/sessions` - List chat sessions
- `POST /api/chat/sessions` - Create chat session
- `GET /api/chat/sessions/[id]` - Get session messages
- `DELETE /api/chat/sessions/[id]` - Delete session

### API Key Required (External Use)

- `POST /api/chat` - Chat with documents

## Usage Flow

### 1. User Registration
- Users sign up through Supabase Auth
- User profile created in `users` table
- Default subscription tier: 'free' with 1000 token limit

### 2. API Key Generation
- Users create API keys through dashboard
- Keys are hashed with SHA-256 for security
- Only key prefix is stored for display

### 3. Document Upload
- Users upload documents to projects
- Documents are processed and chunked
- Text chunks are embedded using OpenAI
- Embeddings stored in `document_chunks` table

### 4. Chat Interaction
- External applications use API keys
- Queries are embedded and matched against document chunks
- Relevant context is retrieved and sent to OpenAI
- Responses are generated with document context
- Usage is tracked and limited

## Security Features

### API Key Security
- Keys are hashed with SHA-256
- Only hashes are stored in database
- Keys can be deactivated/activated
- Expiration dates supported

### Row Level Security
- All tables have RLS enabled
- Users can only access their own data
- Service role bypasses RLS for system operations

### Usage Limits
- Subscription-based token limits
- Real-time usage tracking
- Automatic limit enforcement

## File Processing

### Supported Formats
- **PDF**: Using pdf-parse library
- **DOCX**: Using mammoth library
- **TXT**: Direct text processing
- **MD**: Markdown processing

### Processing Pipeline
1. File validation (type, size)
2. Text extraction
3. Content hashing for deduplication
4. Text chunking (1000 chars with 200 overlap)
5. OpenAI embedding generation
6. Vector storage in database

## Vector Search

### Similarity Search
- Uses cosine similarity with pgvector
- Configurable similarity threshold
- Project-scoped search
- Returns ranked results with similarity scores

### Performance
- IVFFlat index for fast vector search
- Concurrent index creation
- Optimized for 1536-dimensional embeddings

## Usage Tracking

### Metrics Tracked
- API calls per endpoint
- Token usage per request
- Cost calculation
- User-level aggregation

### Limits
- Free tier: 1000 tokens/month
- Pro tier: 10,000 tokens/month
- Enterprise: Unlimited

## Monitoring and Maintenance

### Automated Tasks
- Monthly usage reset
- Old data cleanup (90 days)
- Usage statistics generation

### Manual Operations
- Subscription tier updates
- Usage limit adjustments
- API key management

## Error Handling

### Document Processing
- Graceful failure handling
- Error status tracking
- Retry mechanisms for transient failures

### API Errors
- Comprehensive error responses
- Usage limit enforcement
- Authentication validation

## Scaling Considerations

### Database
- Vector index optimization
- Connection pooling
- Read replicas for search

### Processing
- Async document processing
- Queue-based processing
- Batch embedding generation

### API
- Rate limiting
- Caching strategies
- Load balancing

## Development

### Local Development
```bash
npm run dev
```

### Testing
- Unit tests for utilities
- Integration tests for APIs
- End-to-end tests for workflows

### Deployment
- Vercel deployment ready
- Environment variable configuration
- Database migration automation

## Support

For issues or questions:
1. Check the error logs
2. Verify environment variables
3. Test database connectivity
4. Validate API key permissions

## Next Steps

1. Set up Supabase project
2. Configure environment variables
3. Run database migrations
4. Test API endpoints
5. Deploy to production

