import { getSupabaseServiceClient } from '@/lib/supabase/server';
import { generateEmbedding } from './groq-client';
import { AI_CONFIG, TABLES } from '@/lib/constants/config';
import { AppError } from '@/lib/utils/error-handler';

export interface RAGSearchResult {
  id: string;
  material_id: string;
  content: string;
  similarity: number;
}

/**
 * Split text into chunks for embedding
 */
export function chunkText(text: string, chunkSize: number = 1000, overlap: number = 200): string[] {
  const chunks: string[] = [];
  let startIndex = 0;

  while (startIndex < text.length) {
    const endIndex = Math.min(startIndex + chunkSize, text.length);
    const chunk = text.substring(startIndex, endIndex);
    chunks.push(chunk);
    startIndex += chunkSize - overlap;
  }

  return chunks;
}

/**
 * Store material chunks with embeddings in database
 */
export async function storeMaterialChunks(materialId: string, chunks: string[]): Promise<void> {
  try {
    const supabase = getSupabaseServiceClient();

    // Generate embeddings for each chunk
    const chunksWithEmbeddings = await Promise.all(
      chunks.map(async (content, index) => ({
        material_id: materialId,
        chunk_index: index,
        content,
        embedding: await generateEmbedding(content),
      }))
    );

    // Store in database
    const { error } = await supabase
      .from(TABLES.MATERIAL_CHUNKS)
      .insert(chunksWithEmbeddings);

    if (error) {
      console.error('[RAG] Error storing chunks:', error);
      throw new AppError('DB_QUERY_FAILED', 500);
    }
  } catch (error) {
    console.error('[RAG] Error in storeMaterialChunks:', error);
    throw error;
  }
}

/**
 * Search for similar chunks using vector similarity
 */
export async function searchSimilarChunks(
  query: string,
  classId: string,
  limit: number = AI_CONFIG.RAG_TOP_K
): Promise<RAGSearchResult[]> {
  try {
    const supabase = getSupabaseServiceClient();

    // Generate embedding for query
    const queryEmbedding = await generateEmbedding(query);

    // Search using similarity (cosine distance)
    // Note: In Supabase, you can use RPC calls or raw SQL for vector search
    // This is a simplified version - you may need to create an RPC function

    const { data, error } = await supabase.rpc('search_material_chunks', {
      query_embedding: queryEmbedding,
      class_id: classId,
      limit_results: limit,
    });

    if (error) {
      // Fallback: Simple keyword search if vector search fails
      console.warn('[RAG] Vector search failed, using keyword fallback');
      return await keywordSearch(query, classId, limit);
    }

    return data || [];
  } catch (error) {
    console.error('[RAG] Error in searchSimilarChunks:', error);
    // Fallback to keyword search
    return await keywordSearch(query, classId, limit);
  }
}

/**
 * Fallback: Simple keyword-based search
 */
async function keywordSearch(query: string, classId: string, limit: number): Promise<RAGSearchResult[]> {
  try {
    const supabase = getSupabaseServiceClient();

    const searchTerm = `%${query}%`;

    const { data, error } = await supabase
      .from(TABLES.MATERIAL_CHUNKS)
      .select(
        `
        id,
        material_id,
        content,
        material:${TABLES.MATERIALS}!inner(class_id)
      `
      )
      .ilike('content', searchTerm)
      .eq(`material.class_id`, classId)
      .limit(limit);

    if (error) {
      throw new AppError('DB_QUERY_FAILED', 500);
    }

    return (
      data?.map(item => ({
        id: item.id,
        material_id: item.material_id,
        content: item.content,
        similarity: 0.5, // Placeholder similarity for keyword search
      })) || []
    );
  } catch (error) {
    console.error('[RAG] Error in keywordSearch:', error);
    return [];
  }
}

/**
 * Format search results for prompt injection
 */
export function formatRAGContext(results: RAGSearchResult[]): string[] {
  return results.map(result => result.content);
}

/**
 * Build context string from search results
 */
export function buildContextString(results: RAGSearchResult[]): string {
  if (results.length === 0) {
    return '';
  }

  return results.map((result, index) => `[Source ${index + 1}] ${result.content}`).join('\n\n');
}

/**
 * Create RPC function for vector search (run this in Supabase SQL Editor)
 */
export const vectorSearchRPC = `
CREATE OR REPLACE FUNCTION search_material_chunks(
  query_embedding vector,
  class_id UUID,
  limit_results INT DEFAULT 5
)
RETURNS TABLE (
  id UUID,
  material_id UUID,
  content TEXT,
  similarity FLOAT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    mc.id,
    mc.material_id,
    mc.content,
    (1 - (mc.embedding <=> query_embedding)) as similarity
  FROM material_chunks mc
  JOIN materials m ON mc.material_id = m.id
  WHERE m.class_id = search_material_chunks.class_id
  AND mc.embedding IS NOT NULL
  ORDER BY mc.embedding <=> query_embedding
  LIMIT limit_results;
END;
$$ LANGUAGE plpgsql;
`;

/**
 * Parse PDF content (stub - implement with pdf-parse library)
 */
export async function parsePDF(fileBuffer: Buffer): Promise<string> {
  try {
    // This would use pdf-parse library
    // const pdfParse = require('pdf-parse');
    // const pdfData = await pdfParse(fileBuffer);
    // return pdfData.text;

    console.warn('[RAG] PDF parsing not yet implemented');
    return 'PDF content would be extracted here';
  } catch (error) {
    console.error('[RAG] Error parsing PDF:', error);
    throw new AppError('FILE_UPLOAD_FAILED', 500);
  }
}

/**
 * Process and store uploaded material with chunks
 */
export async function processMaterial(materialId: string, content: string): Promise<void> {
  try {
    // Split into chunks
    const chunks = chunkText(content, AI_CONFIG.CHUNK_SIZE, AI_CONFIG.CHUNK_OVERLAP);

    // Store chunks with embeddings
    await storeMaterialChunks(materialId, chunks);

    console.log(`[RAG] Processed ${chunks.length} chunks for material ${materialId}`);
  } catch (error) {
    console.error('[RAG] Error processing material:', error);
    throw error;
  }
}
