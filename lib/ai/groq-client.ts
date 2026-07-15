import { Groq } from 'groq-sdk';
import { AI_CONFIG } from '@/lib/constants/config';
import { AppError } from '@/lib/utils/error-handler';

const groqApiKey = process.env.GROQ_API_KEY;

if (!groqApiKey && process.env.NODE_ENV === 'production') {
  console.error('[Groq] ERROR: GROQ_API_KEY not configured in production!');
}

const client = new Groq({
  apiKey: groqApiKey,
});

export function getGroqClient() {
  return client;
}

export async function generateChatResponse(
  messages: Array<{ role: 'user' | 'assistant'; content: string }>,
  systemPrompt?: string,
  streaming: boolean = false
) {
  try {
    const allMessages = systemPrompt
      ? [{ role: 'system' as const, content: systemPrompt }, ...messages]
      : messages;

    if (streaming) {
      return await client.messages.create({
        model: AI_CONFIG.MODEL,
        max_tokens: AI_CONFIG.MAX_TOKENS,
        temperature: AI_CONFIG.TEMPERATURE,
        messages: allMessages as any,
        stream: true,
      });
    }

    const response = await client.chat.completions.create({
      model: AI_CONFIG.MODEL,
      max_tokens: AI_CONFIG.MAX_TOKENS,
      temperature: AI_CONFIG.TEMPERATURE,
      messages: allMessages as any,
    });

    return response;
  } catch (error: any) {
    if (error.status === 429) {
      throw new AppError('AI_RATE_LIMITED', 429);
    }
    if (error.status === 500) {
      throw new AppError('AI_API_ERROR', 500);
    }
    console.error('[Groq] Error:', error);
    throw new AppError('AI_API_ERROR', 500);
  }
}

export async function generateHint(
  questionContent: string,
  questionType: string,
  attemptNumber: number
): Promise<string> {
  try {
    // Progressive hint strategy based on attempt number
    let promptLevel = 'simple';
    if (attemptNumber === 2) {
      promptLevel = 'moderate';
    } else if (attemptNumber >= 3) {
      promptLevel = 'detailed';
    }

    const systemPrompt = `You are a helpful tutor providing progressive hints to help students learn. 
Your hints should guide the student to think critically without directly providing the answer.
For ${promptLevel} hints: ${
      promptLevel === 'simple'
        ? 'Ask a guiding question to help them think about the concept.'
        : promptLevel === 'moderate'
          ? 'Provide more specific guidance pointing to relevant concepts or examples.'
          : 'Provide detailed explanation and examples, but still encourage independent thought.'
    }`;

    const messages = [
      {
        role: 'user' as const,
        content: `Question type: ${questionType}\nQuestion: ${questionContent}\n\nProvide a ${promptLevel} hint to help me answer this question.`,
      },
    ];

    const response = await client.chat.completions.create({
      model: AI_CONFIG.MODEL,
      max_tokens: AI_CONFIG.HINT_MAX_TOKENS,
      temperature: 0.7,
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages,
      ] as any,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No content in response');
    }

    return content;
  } catch (error) {
    console.error('[Groq] Hint generation error:', error);
    throw new AppError('AI_API_ERROR', 500);
  }
}

export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    // Note: Groq's embedding endpoint might not be available in all plans
    // This is a placeholder for when embeddings are available
    // For production, consider using a dedicated embedding service or
    // generating embeddings with a different provider

    // For now, we'll return a mock embedding
    // In production, implement actual embedding generation
    console.warn('[Groq] Embeddings not implemented - using placeholder');

    // Generate a hash-based deterministic embedding
    const hash = require('crypto')
      .createHash('sha256')
      .update(text)
      .digest('hex');

    const embedding: number[] = [];
    for (let i = 0; i < 384; i++) {
      const hexPair = hash.substring((i * 2) % hash.length, (i * 2) % hash.length + 2);
      embedding.push((parseInt(hexPair, 16) / 256) * 2 - 1);
    }

    return embedding;
  } catch (error) {
    console.error('[Groq] Embedding generation error:', error);
    throw new AppError('AI_API_ERROR', 500);
  }
}

export function extractTokenCount(response: any): number {
  // Extract token usage from response
  return response.usage?.completion_tokens || 0;
}
