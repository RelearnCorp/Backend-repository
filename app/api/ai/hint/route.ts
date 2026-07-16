import { NextRequest } from 'next/server';
import { authenticateRequest } from '@/lib/auth/middleware';
import { getQuestionById } from '@/lib/database/queries';
import { sendSuccess, sendError } from '@/lib/utils/response-formatter';
import { getGroqClient } from '@/lib/ai/groq-client';
import { generateHintPrompt } from '@/lib/ai/prompts';
import { z } from 'zod';

const hintSchema = z.object({
  question_id: z.string(),
  hint_level: z.enum(['1', '2', '3']).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request);

    // Check permission
    if (auth.rolePermissions?.use_ai_chat !== true) {
      return sendError('FORBIDDEN', 403);
    }

    const body = await request.json();
    const validation = hintSchema.safeParse(body);

    if (!validation.success) {
      return sendError('VALIDATION_ERROR', 400);
    }

    const { question_id, hint_level = '1' } = validation.data;

    // Get question
    const question = await getQuestionById(question_id);
    if (!question) {
      return sendError('QUESTION_NOT_FOUND', 404);
    }

    // Generate hint prompt
    const hintPrompt = generateHintPrompt(
      question.question_text,
      question.question_type,
      parseInt(hint_level) as 1 | 2 | 3
    );

    // Get hint from Groq
    const groqClient = getGroqClient();

    const response = await groqClient.messages.create({
      model: 'mixtral-8x7b-32768',
      max_tokens: 256,
      messages: [
        {
          role: 'user',
          content: hintPrompt,
        },
      ],
    });

    const hint = response.content[0].type === 'text' ? response.content[0].text : '';

    return sendSuccess(
      {
        hint,
        level: hint_level,
        question_id,
      },
      'Hint generated successfully'
    );
  } catch (error: any) {
    console.error('[API] Hint generation error:', error);
    return sendError('INTERNAL_SERVER_ERROR', 500);
  }
}
