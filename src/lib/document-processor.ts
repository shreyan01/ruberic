import { createHash } from 'crypto';
import { OpenAI } from 'openai';
import { supabaseAdmin } from './supabase';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export interface DocumentChunk {
  content: string;
  chunkIndex: number;
  metadata: {
    documentId: string;
    chunkIndex: number;
    contentLength: number;
    [key: string]: string | number;
  };
}

export class DocumentProcessor {
  private static readonly CHUNK_SIZE = 1000;
  private static readonly CHUNK_OVERLAP = 200;
  

  /**
   * Extract text content from different file types
   */
  static async extractTextFromFile(
    file: Buffer,
    filename: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    mimeType: string,
  ): Promise<string> {
    const fileExtension = filename.split('.').pop()?.toLowerCase();

    switch (fileExtension) {
      case 'pdf':
        return await this.extractTextFromPDF(file);
      case 'docx':
        return await this.extractTextFromDocx(file);
      case 'txt':
      case 'md':
        return file.toString('utf-8');
      default:
        throw new Error(`Unsupported file type: ${fileExtension}`);
    }
  }

  /**
   * Extract text from PDF files
   */
  private static async extractTextFromPDF(file: Buffer): Promise<string> {
    try {
      const pdfParse = await import('pdf-parse');
      const data = await pdfParse.default(file);
      return data.text;
    } catch (error) {
      throw new Error(`Failed to parse PDF: ${error}`);
    }
  }

  /**
   * Extract text from DOCX files
   */
  private static async extractTextFromDocx(file: Buffer): Promise<string> {
    try {
      const mammoth = await import('mammoth');
      const result = await mammoth.extractRawText({ buffer: file });
      return result.value;
    } catch (error) {
      throw new Error(`Failed to parse DOCX: ${error}`);
    }
  }

  /**
   * Split text into chunks for vector storage
   */
  static splitTextIntoChunks(text: string): string[] {
    const chunks: string[] = [];
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    
    let currentChunk = '';
    
    for (const sentence of sentences) {
      const trimmedSentence = sentence.trim();
      if (!trimmedSentence) continue;
      
      const sentenceWithPunctuation = trimmedSentence + '.';
      
      if (currentChunk.length + sentenceWithPunctuation.length > this.CHUNK_SIZE) {
        if (currentChunk.length > 0) {
          chunks.push(currentChunk.trim());
        }
        currentChunk = sentenceWithPunctuation;
      } else {
        currentChunk += (currentChunk ? ' ' : '') + sentenceWithPunctuation;
      }
    }
    
    if (currentChunk.length > 0) {
      chunks.push(currentChunk.trim());
    }
    
    return chunks;
  }

  /**
   * Generate embeddings for text chunks
   */
  static async generateEmbeddings(chunks: string[]): Promise<number[][]> {
    try {
      const response = await openai.embeddings.create({
        model: 'text-embedding-ada-002',
        input: chunks,
      });

      return response.data.map(item => item.embedding);
    } catch (error) {
      throw new Error(`Failed to generate embeddings: ${error}`);
    }
  }

  /**
   * Calculate content hash for deduplication
   */
  static calculateContentHash(content: string): string {
    return createHash('sha256').update(content).digest('hex');
  }

  /**
   * Process and store a document
   */
  static async processDocument(
    file: Buffer,
    filename: string,
    mimeType: string,
    projectId: string,
    userId: string
  ): Promise<{
    documentId: string;
    chunks: DocumentChunk[];
  }> {
    try {
      // Extract text content
      const textContent = await this.extractTextFromFile(file, filename, mimeType);
      
      if (!textContent.trim()) {
        throw new Error('No text content found in the document');
      }

      // Calculate content hash
      const contentHash = this.calculateContentHash(textContent);

      // Create document record
      const { data: document, error: docError } = await supabaseAdmin
        .from('documents')
        .insert({
          project_id: projectId,
          user_id: userId,
          filename: filename,
          original_filename: filename,
          file_type: mimeType,
          file_size: file.length,
          content_hash: contentHash,
          upload_status: 'processing',
        })
        .select()
        .single();

      if (docError) {
        throw new Error(`Failed to create document record: ${docError.message}`);
      }

      // Split text into chunks
      const textChunks = this.splitTextIntoChunks(textContent);
      
      if (textChunks.length === 0) {
        throw new Error('No valid chunks created from document');
      }

      // Generate embeddings
      const embeddings = await this.generateEmbeddings(textChunks);

      // Store chunks with embeddings
      const chunksToInsert = textChunks.map((chunk, index) => ({
        document_id: document.id,
        chunk_index: index,
        content: chunk,
        content_length: chunk.length,
        embedding: embeddings[index],
        metadata: {
          documentId: document.id,
          chunkIndex: index,
          contentLength: chunk.length,
        },
      }));

      const { error: chunksError } = await supabaseAdmin
        .from('document_chunks')
        .insert(chunksToInsert);

      if (chunksError) {
        // Update document status to failed
        await supabaseAdmin
          .from('documents')
          .update({
            upload_status: 'failed',
            processing_error: `Failed to store chunks: ${chunksError.message}`,
          })
          .eq('id', document.id);

        throw new Error(`Failed to store document chunks: ${chunksError.message}`);
      }

      // Update document status to completed
      await supabaseAdmin
        .from('documents')
        .update({
          upload_status: 'completed',
        })
        .eq('id', document.id);

      return {
        documentId: document.id,
        chunks: chunksToInsert.map(chunk => ({
          content: chunk.content,
          chunkIndex: chunk.chunk_index,
          metadata: chunk.metadata,
        })),
      };
    } catch (error) {
      // Update document status to failed if we have a document ID
      if (error instanceof Error && error.message.includes('document record')) {
        // Document creation failed, no need to update status
      } else {
        // Try to find and update the document status
        try {
          const { data: documents } = await supabaseAdmin
            .from('documents')
            .select('id')
            .eq('project_id', projectId)
            .eq('user_id', userId)
            .eq('original_filename', filename)
            .order('created_at', { ascending: false })
            .limit(1);

          if (documents && documents.length > 0) {
            await supabaseAdmin
              .from('documents')
              .update({
                upload_status: 'failed',
                processing_error: error instanceof Error ? error.message : 'Unknown error',
              })
              .eq('id', documents[0].id);
          }
        } catch (updateError) {
          console.error('Failed to update document status:', updateError);
        }
      }

      throw error;
    }
  }

  /**
   * Search for similar chunks using vector similarity
   */
  static async searchSimilarChunks(
    query: string,
    projectId: string,
    limit: number = 5,
    similarityThreshold: number = 0.7
  ): Promise<{
    chunks: Array<{
      id: string;
      content: string;
      documentId: string;
      chunkIndex: number;
      similarity: number;
      metadata: Record<string, unknown>;
    }>;
  }> {
    try {
      // Generate embedding for the query
      const queryEmbedding = await this.generateEmbeddings([query]);
      
      // Search for similar chunks using vector similarity
      const { data, error } = await supabaseAdmin.rpc('match_document_chunks', {
        query_embedding: queryEmbedding[0],
        match_threshold: similarityThreshold,
        match_count: limit,
        project_id: projectId,
      });

      if (error) {
        throw new Error(`Vector search failed: ${error.message}`);
      }

      return {
        chunks: data || [],
      };
    } catch (error) {
      throw new Error(`Failed to search similar chunks: ${error}`);
    }
  }

  /**
   * Get document chunks by document ID
   */
  static async getDocumentChunks(documentId: string): Promise<DocumentChunk[]> {
    const { data, error } = await supabaseAdmin
      .from('document_chunks')
      .select('*')
      .eq('document_id', documentId)
      .order('chunk_index');

    if (error) {
      throw new Error(`Failed to fetch document chunks: ${error.message}`);
    }

    return data.map(chunk => ({
      content: chunk.content,
      chunkIndex: chunk.chunk_index,
      metadata: {
        documentId: chunk.document_id,
        chunkIndex: chunk.chunk_index,
        contentLength: chunk.content_length,
        ...chunk.metadata,
      },
    }));
  }
}
