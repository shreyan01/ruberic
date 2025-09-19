# Documentation Assistant API

A headless SaaS API that allows customers to upload their documentation and integrate intelligent document-based chat into their applications.

## Base URL
```
https://your-domain.com/api
```

## Authentication
All API endpoints require an API key. Include it in your requests as shown in the examples below.

## Endpoints

### 1. Create API Key
**POST** `/api/keys`

Create a new API key for your application.

**Request Body:**
```json
{
  "keyName": "My App API Key",
  "customerId": "your-customer-id",
  "expiresAt": "2024-12-31T23:59:59Z" // Optional
}
```

**Response:**
```json
{
  "apiKey": "rub_abc123def456...",
  "keyData": {
    "id": "uuid",
    "keyName": "My App API Key",
    "keyPrefix": "rub_abc1...",
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00Z"
  },
  "message": "API key created successfully. Please save it securely as it will not be shown again."
}
```

### 2. Chat with Documents
**POST** `/api/chat`

The main endpoint for chatting with your documentation.

**Request Body:**
```json
{
  "message": "How do I use the login API?",
  "apiKey": "rub_your-api-key-here",
  "projectId": "optional-project-id", // If not provided, searches all your docs
  "model": "gpt-3.5-turbo" // Optional, defaults to gpt-3.5-turbo
}
```

**Response:**
```json
{
  "response": "To use the login API, you need to send a POST request to /auth/login with your credentials...",
  "metadata": {
    "tokensUsed": 150,
    "cost": 0.0003,
    "relevantChunks": 3,
    "usageRemaining": 850,
    "model": "gpt-3.5-turbo",
    "searchError": null
  }
}
```

### 3. Upload Document
**POST** `/api/documents/upload`

Upload a document to your knowledge base.

**Request:** `multipart/form-data`
- `file`: The document file (PDF, DOCX, TXT, MD)
- `apiKey`: Your API key
- `projectId`: Optional project ID (if not provided, uses default project)

**Response:**
```json
{
  "message": "Document uploaded and processed successfully",
  "documentId": "uuid",
  "chunksCount": 15,
  "status": "completed",
  "filename": "api-documentation.pdf"
}
```

### 4. List Projects
**GET** `/api/projects?apiKey=your-api-key`

Get a list of your projects and their documents.

**Response:**
```json
{
  "projects": [
    {
      "id": "uuid",
      "name": "API Documentation",
      "description": "Main API docs",
      "createdAt": "2024-01-01T00:00:00Z",
      "documents": [
        {
          "id": "uuid",
          "filename": "api-docs.pdf",
          "uploadStatus": "completed",
          "createdAt": "2024-01-01T00:00:00Z"
        }
      ]
    }
  ]
}
```

### 5. Create Project
**POST** `/api/projects`

Create a new project to organize your documents.

**Request Body:**
```json
{
  "name": "API Documentation",
  "description": "Main API documentation project",
  "apiKey": "rub_your-api-key-here"
}
```

**Response:**
```json
{
  "project": {
    "id": "uuid",
    "name": "API Documentation",
    "description": "Main API documentation project",
    "createdAt": "2024-01-01T00:00:00Z"
  },
  "message": "Project created successfully"
}
```

### 6. Check Usage
**GET** `/api/usage?apiKey=your-api-key`

Check your current usage and limits.

**Response:**
```json
{
  "currentUsage": 150,
  "usageLimit": 1000,
  "usagePercentage": 15.0,
  "subscriptionTier": "free",
  "usageRemaining": 850
}
```

## Error Responses

All endpoints return consistent error responses:

```json
{
  "error": "Error message description"
}
```

**Common HTTP Status Codes:**
- `400` - Bad Request (missing required fields)
- `401` - Unauthorized (invalid API key)
- `429` - Too Many Requests (usage limit exceeded)
- `500` - Internal Server Error

## Usage Limits

- **Free Tier**: 1,000 tokens/month
- **Pro Tier**: 10,000 tokens/month
- **Enterprise**: Unlimited

## Supported File Types

- PDF (.pdf)
- Microsoft Word (.docx)
- Plain Text (.txt)
- Markdown (.md)

**File Size Limit**: 10MB per file

## Integration Examples

### JavaScript/Node.js
```javascript
// Chat with documents
const response = await fetch('https://your-domain.com/api/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    message: "How do I authenticate?",
    apiKey: "rub_your-api-key-here"
  })
});

const data = await response.json();
console.log(data.response);
```

### Python
```python
import requests

# Upload a document
files = {'file': open('document.pdf', 'rb')}
data = {'apiKey': 'rub_your-api-key-here'}

response = requests.post(
  'https://your-domain.com/api/documents/upload',
  files=files,
  data=data
)

print(response.json())
```

### cURL
```bash
# Chat with documents
curl -X POST https://your-domain.com/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "How do I get started?",
    "apiKey": "rub_your-api-key-here"
  }'
```

## Best Practices

1. **Store API keys securely** - Never expose them in client-side code
2. **Handle errors gracefully** - Always check response status codes
3. **Monitor usage** - Check your usage regularly to avoid limits
4. **Use projects** - Organize your documents into logical projects
5. **Test with small files first** - Ensure your integration works before uploading large documents

## Support

For technical support or questions:
- Check the error message and status code
- Verify your API key is valid and active
- Ensure you haven't exceeded usage limits
- Contact support with specific error details

