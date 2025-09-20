import { NextRequest, NextResponse } from 'next/server';
import { OpenAI } from 'openai';
import { ApiKeyManager } from '@/lib/api-keys';
import { DocumentProcessor } from '@/lib/document-processor';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

/**
 * Main chat endpoint for customers to integrate into their applications
 * 
 * Request body:
 * {
 *   "message": "How do I use the login API?",
 *   "apiKey": "customer_api_key",
 *   "projectId": "optional_project_id", // If not provided, searches all customer's docs
 *   "model": "gpt-3.5-turbo" // Optional, defaults to gpt-3.5-turbo
 * }
 * 
 * Response:
 * {
 *   "response": "AI response based on customer's documentation",
 *   "metadata": {
 *     "tokensUsed": 150,
 *     "cost": 0.0003,
 *     "relevantChunks": 3,
 *     "usageRemaining": 850
 *   }
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const { message, apiKey, projectId, model = 'gpt-3.5-turbo' } = await request.json();

    // Validate required fields
    if (!message || !apiKey) {
      return NextResponse.json(
        { error: 'Message and API key are required' },
        { status: 400 }
      );
    }

    // Verify API key and get customer info
    const keyVerification = await ApiKeyManager.verifyApiKey(apiKey);
    
    if (!keyVerification.isValid || !keyVerification.userId || !keyVerification.userData) {
      return NextResponse.json(
        { error: 'Invalid or expired API key' },
        { status: 401 }
      );
    }

    // Check usage limits
    const usageCheck = await ApiKeyManager.checkUsageLimit(keyVerification.userId);
    
    if (!usageCheck.canProceed) {
      return NextResponse.json(
        { 
          error: 'Usage limit exceeded. Please upgrade your plan or wait for next billing cycle.',
          currentUsage: usageCheck.currentUsage,
          usageLimit: usageCheck.usageLimit,
        },
        { status: 429 }
      );
    }

    // Search for relevant document chunks in customer's documentation
    let relevantChunks: any[] = [];
    let searchError: string | null = null;
    
    try {
      const searchResult = await DocumentProcessor.searchSimilarChunks(
        message,
        projectId || keyVerification.userId, // Use customer's default project if none specified
        5, // limit
        0.7 // similarity threshold
      );
      relevantChunks = searchResult.chunks;
    } catch (error) {
      console.error('Error searching documents:', error);
      searchError = 'Document search temporarily unavailable';
      // Continue without document context
    }

    // Prepare context from relevant chunks
    const context = relevantChunks
      .map(chunk => chunk.content)
      .join('\n\n');

    // Create system prompt
    const systemPrompt = context
      ? `You are a helpful documentation assistant. Use the following context from the customer's documentation to answer their questions accurately and helpfully. If the context doesn't contain relevant information, say so clearly.

Context from documentation:
${context}

Please provide a helpful response based on the user's question and the available documentation context.`
      : `You are a helpful documentation assistant. The user is asking a question, but no relevant documentation context was found in their uploaded documents. Please provide a helpful response or suggest they upload relevant documentation.`;

    // Generate response using OpenAI
    const completion = await openai.chat.completions.create({
      model: model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message },
      ],
      max_tokens: 1000,
      temperature: 0.7,
    });

    const response = completion.choices[0]?.message?.content || 'Sorry, I could not generate a response.';

    // Calculate tokens used
    const tokensUsed = completion.usage?.total_tokens || 0;
    const cost = (tokensUsed / 1000) * 0.002; // Approximate cost for GPT-3.5-turbo

    // Record usage
    await ApiKeyManager.recordUsage(
      keyVerification.userId,
      keyVerification.keyId || null,
      '/api/chat',
      tokensUsed,
      cost
    );

    // Increment customer usage counter
    await ApiKeyManager.incrementUsage(keyVerification.userId, tokensUsed);

    return NextResponse.json({
      response,
      metadata: {
        tokensUsed,
        cost,
        relevantChunks: relevantChunks.length,
        usageRemaining: usageCheck.usageLimit - usageCheck.currentUsage - tokensUsed,
        model: model,
        searchError: searchError,
      },
    });
  } catch (error) {
    console.error('Error in chat API:', error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
