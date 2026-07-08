export const SYSTEM_PROMPTS = {
  // Tutor mode - helping students learn
  TUTOR: `You are an excellent educational tutor. Your role is to help students learn and understand concepts deeply.
Guidelines:
- Ask clarifying questions to understand what the student doesn't understand
- Encourage critical thinking rather than just giving answers
- Break complex concepts into simpler parts
- Use examples and analogies to explain
- Praise effort and growth
- Be patient and supportive`,

  // Socratic mode - asking guiding questions
  SOCRATIC: `You are a Socratic tutor using the Socratic method to help students discover answers themselves.
Guidelines:
- Instead of explaining, ask thoughtful questions
- Guide the student to think about the problem from different angles
- Help them connect to prior knowledge
- Encourage them to explain their reasoning
- Let them discover the answer through guided questioning
- Ask one question at a time`,

  // Explainer mode - detailed explanations
  EXPLAINABLE: `You are an expert educator providing clear, comprehensive explanations.
Guidelines:
- Provide detailed step-by-step explanations
- Include relevant examples and worked solutions
- Explain the 'why' behind concepts, not just the 'how'
- Use diagrams/structure when helpful
- Connect to real-world applications
- Summarize key takeaways at the end`,

  // Quiz feedback mode
  QUIZ_FEEDBACK: `You are providing educational feedback on a quiz answer.
Guidelines:
- Be constructive and encouraging
- Explain why the answer was correct or incorrect
- Provide the correct answer with explanation if wrong
- Suggest resources or concepts to review
- Encourage the student to try similar problems
- Maintain a supportive tone`,

  // RAG context mode - using retrieved documents
  RAG_CONTEXT: `You are an AI assistant helping students learn using provided course materials.
Guidelines:
- Always prioritize information from the provided context
- Cite which material or section you're referencing
- If the context doesn't have relevant information, say so
- Connect student questions to the provided materials
- Help students understand the materials better
- Suggest related concepts from the materials`,
};

export function buildSystemPrompt(
  mode: 'tutor' | 'socratic' | 'explainable' | 'quiz_feedback' | 'rag_context',
  additionalContext?: string
): string {
  let basePrompt = SYSTEM_PROMPTS.TUTOR;

  switch (mode) {
    case 'socratic':
      basePrompt = SYSTEM_PROMPTS.SOCRATIC;
      break;
    case 'explainable':
      basePrompt = SYSTEM_PROMPTS.EXPLAINABLE;
      break;
    case 'quiz_feedback':
      basePrompt = SYSTEM_PROMPTS.QUIZ_FEEDBACK;
      break;
    case 'rag_context':
      basePrompt = SYSTEM_PROMPTS.RAG_CONTEXT;
      break;
  }

  if (additionalContext) {
    return `${basePrompt}\n\nAdditional Context:\n${additionalContext}`;
  }

  return basePrompt;
}

export function buildRAGPrompt(
  userQuestion: string,
  retrievedContext: string[],
  questionContent?: string
): string {
  const contextSection =
    retrievedContext.length > 0
      ? `Based on the course materials:\n${retrievedContext.map((ctx, i) => `${i + 1}. ${ctx}`).join('\n\n')}`
      : 'No relevant course materials found.';

  let fullPrompt = contextSection;

  if (questionContent) {
    fullPrompt += `\n\nQuestion: ${questionContent}`;
  }

  fullPrompt += `\n\nStudent question: ${userQuestion}`;

  return fullPrompt;
}

export function buildHintPrompt(
  questionContent: string,
  questionType: string,
  attemptNumber: number,
  previousHints?: string[]
): string {
  let prompt = `Question type: ${questionType}\nQuestion: ${questionContent}\n\n`;

  if (previousHints && previousHints.length > 0) {
    prompt += `Previous hints you provided:\n${previousHints.map((h, i) => `${i + 1}. ${h}`).join('\n\n')}\n\n`;
  }

  const hintLevel = {
    1: 'This is their first attempt. Ask a gentle guiding question to help them think.',
    2: 'This is their second attempt. Point them towards the relevant concept or suggest an approach.',
    3: 'This is their third attempt. Provide more detailed guidance while still encouraging thought.',
  };

  prompt +=
    hintLevel[Math.min(attemptNumber, 3) as keyof typeof hintLevel] ||
    'Provide a detailed hint with step-by-step guidance.';

  return prompt;
}

export function buildLearningModePrompt(
  learningMode: 'normal' | 'socratic' | 'explainable',
  questionContent: string,
  studentAnswer: string,
  isCorrect: boolean
): string {
  let prompt = '';

  if (learningMode === 'normal') {
    prompt = `Question: ${questionContent}\nStudent's answer: ${studentAnswer}\n\n`;
    prompt += isCorrect
      ? 'Provide brief encouragement and confirmation.'
      : 'Explain why this answer is incorrect and guide them to the right answer.';
  } else if (learningMode === 'socratic') {
    prompt = `Question: ${questionContent}\nStudent's answer: ${studentAnswer}\n\n`;
    prompt += 'Ask Socratic questions to help them discover the correct answer themselves.';
  } else if (learningMode === 'explainable') {
    prompt = `Question: ${questionContent}\nStudent's answer: ${studentAnswer}\n\n`;
    prompt += 'Provide a comprehensive explanation with the correct answer, worked examples, and key concepts.';
  }

  return prompt;
}

export const HINT_TEMPLATES = {
  INITIAL: 'Try thinking about the key concept involved in this question. What do you already know about it?',
  CONCEPT: 'This question is about [CONCEPT]. Can you recall the main principle or definition?',
  APPROACH: 'Consider approaching this problem by first [STEP1], then [STEP2].',
  SIMILAR: 'This is similar to a problem we covered about [SIMILAR_TOPIC]. Can you recall how we solved that?',
  BREAKDOWN: 'Break this problem into smaller parts. First, focus on [PART1]. Then, think about [PART2].',
  EXAMPLE: 'Let me give you an example: [EXAMPLE]. Can you apply this logic to your problem?',
};
