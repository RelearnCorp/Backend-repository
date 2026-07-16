import { NextRequest } from 'next/server';
import { authenticateRequest } from '@/lib/auth/middleware';
import {
  getChatSession,
  getChatMessages,
  saveChatMessage,
} from '@/lib/database/queries';
import { sendSuccess, sendError } from '@/lib/utils/response-formatter';
import { getGroqClient, streamGroqResponse } from '@/lib/ai/groq-client';
import { z } from 'zod';

const chatSchema = z.object({
  session_id: z.string(),
  message: z.string().min(1),
  context: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request);

    // Check permission
    if (auth.rolePermissions?.use_ai_chat !== true) {
      return sendError('FORBIDDEN', 403);
    }

    const body = await request.json();
    const validation = chatSchema.safeParse(body);

    if (!validation.success) {
      return sendError('VALIDATION_ERROR', 400);
    }

    const { session_id, message, context } = validation.data;

    // Verify session exists and belongs to user
    const session = await getChatSession(session_id);
    if (!session || session.user_id !== auth.userId) {
      return sendError('SESSION_NOT_FOUND', 404);
    }

    // Save user message
    await saveChatMessage(session_id, 'user', message);

    // Get conversation history
    const messages = await getChatMessages(session_id);

    // Prepare messages for Groq
    const groqMessages = messages.map((m: any) => ({
      role: m.role,
      content: m.content,
    }));

    // Add context if provided
    let systemPrompt = 'You are a helpful educational AI tutor. Be concise and helpful.';
    if (context) {
      systemPrompt += ` Context: ${context}`;
    }

    // Get response from Groq
    const groqClient = getGroqClient();

    const response = await groqClient.messages.create({
      model: 'mixtral-8x7b-32768',
      max_tokens: 1024,
      system: systemPrompt,
      messages: groqMessages,
    });

    const assistantMessage =
      response.content[0].type === 'text' ? response.content[0].text : '';

    // Save assistant response
    await saveChatMessage(session_id, 'assistant', assistantMessage);

    return sendSuccess(
      {
        message: assistantMessage,
        session_id,
        usage: {
          input_tokens: response.usage?.input_tokens,
          output_tokens: response.usage?.output_tokens,
        },
      },
      'Response generated successfully'
    );
  } catch (error: any) {
    console.error('[API] AI chat error:', error);
    return sendError('INTERNAL_SERVER_ERROR', 500);
  }
}
