# API Usage Examples

This document provides examples of how to use the Documentation Assistant API.

## Authentication

All API calls require an API key in the request body or header.

### Getting an API Key

1. Sign up for an account
2. Create a project
3. Generate an API key from the dashboard
4. Save the key securely (it won't be shown again)

## Chat API

### Basic Chat Request

```javascript
const response = await fetch('/api/chat', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    message: "What is the main purpose of this API?",
    projectId: "your-project-id", // Optional
    sessionId: "your-session-id", // Optional
    apiKey: "rub_your-api-key-here"
  })
});

const data = await response.json();
console.log(data.response); // AI response
console.log(data.metadata); // Usage info
```

### Python Example

```python
import requests

def chat_with_docs(message, api_key, project_id=None, session_id=None):
    url = "https://your-domain.com/api/chat"
    
    payload = {
        "message": message,
        "apiKey": api_key
    }
    
    if project_id:
        payload["projectId"] = project_id
    if session_id:
        payload["sessionId"] = session_id
    
    response = requests.post(url, json=payload)
    
    if response.status_code == 200:
        data = response.json()
        return data["response"], data["metadata"]
    else:
        raise Exception(f"API Error: {response.json()}")

# Usage
response, metadata = chat_with_docs(
    "How do I integrate this API?",
    "rub_your-api-key-here",
    project_id="your-project-id"
)
print(response)
```

### cURL Example

```bash
curl -X POST https://your-domain.com/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "What are the main features?",
    "projectId": "your-project-id",
    "apiKey": "rub_your-api-key-here"
  }'
```

## Response Format

### Success Response

```json
{
  "response": "The main purpose of this API is to provide intelligent document-based assistance...",
  "metadata": {
    "tokensUsed": 150,
    "cost": 0.0003,
    "relevantChunks": 3,
    "usageRemaining": 850
  }
}
```

### Error Responses

#### Invalid API Key
```json
{
  "error": "Invalid API key"
}
```

#### Usage Limit Exceeded
```json
{
  "error": "Usage limit exceeded",
  "currentUsage": 1000,
  "usageLimit": 1000
}
```

#### Missing Parameters
```json
{
  "error": "Message and API key are required"
}
```

## Dashboard API (Authentication Required)

### Create Project

```javascript
const response = await fetch('/api/projects', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${userToken}` // Supabase auth token
  },
  body: JSON.stringify({
    name: "My Documentation Project",
    description: "Project for API documentation"
  })
});
```

### Upload Document

```javascript
const formData = new FormData();
formData.append('file', fileInput.files[0]);
formData.append('projectId', 'your-project-id');

const response = await fetch('/api/documents/upload', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${userToken}`
  },
  body: formData
});
```

### Create API Key

```javascript
const response = await fetch('/api/keys', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${userToken}`
  },
  body: JSON.stringify({
    keyName: "Production API Key",
    expiresAt: "2024-12-31T23:59:59Z" // Optional
  })
});

const data = await response.json();
console.log(data.apiKey); // Save this securely!
```

## Integration Examples

### React Component

```jsx
import React, { useState } from 'react';

function DocumentChat({ apiKey, projectId }) {
  const [message, setMessage] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          projectId,
          apiKey
        })
      });

      const data = await res.json();
      setResponse(data.response);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Ask about your documents..."
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Sending...' : 'Send'}
        </button>
      </form>
      {response && <div>{response}</div>}
    </div>
  );
}
```

### Node.js Server

```javascript
const express = require('express');
const app = express();

app.use(express.json());

// Middleware to validate API key
async function validateApiKey(req, res, next) {
  const { apiKey } = req.body;
  
  if (!apiKey) {
    return res.status(400).json({ error: 'API key required' });
  }

  // Verify API key with your backend
  const isValid = await verifyApiKey(apiKey);
  if (!isValid) {
    return res.status(401).json({ error: 'Invalid API key' });
  }

  next();
}

// Chat endpoint
app.post('/chat', validateApiKey, async (req, res) => {
  const { message, projectId } = req.body;
  
  try {
    // Forward to your API
    const response = await fetch('https://your-domain.com/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message,
        projectId,
        apiKey: req.body.apiKey
      })
    });

    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});
```

## Best Practices

### API Key Security
- Store API keys securely (environment variables, secret management)
- Never expose keys in client-side code
- Rotate keys regularly
- Use different keys for different environments

### Error Handling
- Always check response status codes
- Implement retry logic for transient failures
- Handle rate limiting gracefully
- Log errors for debugging

### Usage Monitoring
- Monitor token usage to avoid limits
- Implement usage alerts
- Cache responses when appropriate
- Optimize queries to reduce token usage

### Performance
- Use appropriate chunk sizes for documents
- Implement pagination for large result sets
- Cache frequently accessed data
- Use connection pooling for high-traffic applications

## Rate Limits

- Free tier: 1000 tokens/month
- Pro tier: 10,000 tokens/month
- Enterprise: Unlimited

## Support

For technical support:
1. Check the error message and status code
2. Verify your API key is valid and active
3. Ensure you haven't exceeded usage limits
4. Check that your project has uploaded documents
5. Contact support with specific error details
