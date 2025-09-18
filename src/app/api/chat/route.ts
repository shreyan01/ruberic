import { NextRequest, NextResponse } from 'next/server';
import { OpenAI } from 'openai';
import { ApiKeyManager } from '@/lib/api-keys';
import { DocumentProcessor } from '@/lib/document-processor';
import { supabaseAdmin } from '@/lib/supabase';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(request: NextRequest) {
  try {
    const { message, projectId, sessionId, apiKey } = await request.json();

    if (!message || !apiKey) {
      return NextResponse.json(
        { error: 'Message and API key are required' },
        { status: 400 }
      );
    }

    // Verify API key
    const keyVerification = await ApiKeyManager.verifyApiKey(apiKey);
    
    if (!keyVerification.isValid || !keyVerification.userId || !keyVerification.userData) {
      return NextResponse.json(
        { error: 'Invalid API key' },
        { status: 401 }
      );
    }

    // Check usage limits
    const usageCheck = await ApiKeyManager.checkUsageLimit(keyVerification.userId);
    
    if (!usageCheck.canProceed) {
      return NextResponse.json(
        { 
          error: 'Usage limit exceeded',
          currentUsage: usageCheck.currentUsage,
          usageLimit: usageCheck.usageLimit,
        },
        { status: 429 }
      );
    }

    // Search for relevant document chunks
    let relevantChunks: any[] = [];
    if (projectId) {
      try {
        const searchResult = await DocumentProcessor.searchSimilarChunks(
          message,
          projectId,
          5, // limit
          0.7 // similarity threshold
        );
        relevantChunks = searchResult.chunks;
      } catch (error) {
        console.error('Error searching documents:', error);
        // Continue without document context if search fails
      }
    }

    // Prepare context from relevant chunks
    const context = relevantChunks
      .map(chunk => chunk.content)
      .join('\n\n');

    // Create system prompt
    const systemPrompt = context
      ? `You are a helpful documentation assistant. Use the following context from the user's documentation to answer their questions accurately and helpfully. If the context doesn't contain relevant information, say so clearly.

Context from documentation:
${context}

Please provide a helpful response based on the user's question and the available documentation context.`
      : `You are a helpful documentation assistant. The user is asking a question, but no relevant documentation context was found. Please provide a helpful response or ask them to upload relevant documentation.`;

    // Generate response using OpenAI
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
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

    // Increment user usage counter
    await ApiKeyManager.incrementUsage(keyVerification.userId, tokensUsed);

    // Save chat messages if sessionId is provided
    if (sessionId) {
      try {
        // Save user message
        await supabaseAdmin
          .from('chat_messages')
          .insert({
            session_id: sessionId,
            role: 'user',
            content: message,
            metadata: {
              projectId,
              relevantChunks: relevantChunks.map(chunk => ({
                id: chunk.id,
                documentId: chunk.documentId,
                chunkIndex: chunk.chunkIndex,
                similarity: chunk.similarity,
              })),
            },
          });

        // Save assistant response
        await supabaseAdmin
          .from('chat_messages')
          .insert({
            session_id: sessionId,
            role: 'assistant',
            content: response,
            metadata: {
              tokensUsed,
              cost,
              model: 'gpt-3.5-turbo',
            },
          });
      } catch (error) {
        console.error('Error saving chat messages:', error);
        // Continue even if saving fails
      }
    }

    return NextResponse.json({
      response,
      metadata: {
        tokensUsed,
        cost,
        relevantChunks: relevantChunks.length,
        usageRemaining: usageCheck.usageLimit - usageCheck.currentUsage - tokensUsed,
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
