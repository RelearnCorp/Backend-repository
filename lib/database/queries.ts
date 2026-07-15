import { getSupabaseServiceClient } from '@/lib/supabase/server';
import { User, Role, JWTPayload } from '@/types';
import { AppError } from '@/lib/utils/error-handler';
import { TABLES } from '@/lib/constants/config';

// ============================================================================
// USER QUERIES
// ============================================================================

export async function getUserById(userId: string): Promise<User | null> {
  const supabase = getSupabaseServiceClient();

  const { data, error } = await supabase
    .from(TABLES.USERS)
    .select('*, role:roles(*)')
    .eq('id', userId)
    .single();

  if (error && error.code !== 'PGRST116') {
    throw new AppError('DB_QUERY_FAILED', 500);
  }

  return data || null;
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const supabase = getSupabaseServiceClient();

  const { data, error } = await supabase
    .from(TABLES.USERS)
    .select('*, role:roles(*)')
    .eq('email', email.toLowerCase())
    .single();

  if (error && error.code !== 'PGRST116') {
    throw new AppError('DB_QUERY_FAILED', 500);
  }

  return data || null;
}

export async function createUser(
  email: string,
  fullName: string,
  passwordHash: string,
  roleId: string
): Promise<User> {
  const supabase = getSupabaseServiceClient();

  const { data, error } = await supabase
    .from(TABLES.USERS)
    .insert({
      email: email.toLowerCase(),
      full_name: fullName,
      password_hash: passwordHash,
      role_id: roleId,
    })
    .select('*, role:roles(*)')
    .single();

  if (error) {
    if (error.code === '23505') {
      throw new AppError('AUTH_EMAIL_EXISTS', 409);
    }
    throw new AppError('DB_QUERY_FAILED', 500);
  }

  return data;
}

export async function getStudentRoleId(): Promise<string> {
  const supabase = getSupabaseServiceClient();

  const { data, error } = await supabase
    .from(TABLES.ROLES)
    .select('id')
    .eq('name', 'student')
    .single();

  if (error || !data) {
    throw new AppError('DB_QUERY_FAILED', 500);
  }

  return data.id;
}

export async function getTeacherRoleId(): Promise<string> {
  const supabase = getSupabaseServiceClient();

  const { data, error } = await supabase
    .from(TABLES.ROLES)
    .select('id')
    .eq('name', 'teacher')
    .single();

  if (error || !data) {
    throw new AppError('DB_QUERY_FAILED', 500);
  }

  return data.id;
}

// CLASS QUERIES HANDLED IN SECTION BELOW

// ============================================================================
// MATERIAL QUERIES
// ============================================================================

export async function createMaterial(
  classId: string,
  title: string,
  content: string | null,
  fileUrl: string | null,
  fileType: string,
  createdBy: string
) {
  const supabase = getSupabaseServiceClient();

  const { data, error } = await supabase
    .from(TABLES.MATERIALS)
    .insert({
      class_id: classId,
      title,
      content,
      file_url: fileUrl,
      file_type: fileType,
      created_by: createdBy,
    })
    .select('*')
    .single();

  if (error) {
    throw new AppError('DB_QUERY_FAILED', 500);
  }

  return data;
}

export async function getClassMaterials(classId: string) {
  const supabase = getSupabaseServiceClient();

  const { data, error } = await supabase
    .from(TABLES.MATERIALS)
    .select('*, creator:users(id, full_name)')
    .eq('class_id', classId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new AppError('DB_QUERY_FAILED', 500);
  }

  return data || [];
}

export async function getMaterialById(materialId: string) {
  const supabase = getSupabaseServiceClient();

  const { data, error } = await supabase
    .from(TABLES.MATERIALS)
    .select('*, creator:users(id, full_name)')
    .eq('id', materialId)
    .single();

  if (error && error.code !== 'PGRST116') {
    throw new AppError('DB_QUERY_FAILED', 500);
  }

  return data || null;
}

export async function createMaterialChunk(
  materialId: string,
  chunkIndex: number,
  content: string,
  embedding: number[] | null = null
) {
  const supabase = getSupabaseServiceClient();

  const { data, error } = await supabase
    .from(TABLES.MATERIAL_CHUNKS)
    .insert({
      material_id: materialId,
      chunk_index: chunkIndex,
      content,
      embedding: embedding ? JSON.stringify(embedding) : null,
    })
    .select('*')
    .single();

  if (error) {
    throw new AppError('DB_QUERY_FAILED', 500);
  }

  return data;
}

export async function getMaterialChunks(materialId: string) {
  const supabase = getSupabaseServiceClient();

  const { data, error } = await supabase
    .from(TABLES.MATERIAL_CHUNKS)
    .select('*')
    .eq('material_id', materialId)
    .order('chunk_index', { ascending: true });

  if (error) {
    throw new AppError('DB_QUERY_FAILED', 500);
  }

  return data || [];
}

export async function searchMaterialChunks(
  embedding: number[],
  classId: string,
  limit: number = 5
) {
  const supabase = getSupabaseServiceClient();

  const { data, error } = await supabase.rpc(
    'match_material_chunks',
    {
      query_embedding: embedding,
      match_count: limit,
    }
  );

  if (error) {
    throw new AppError('DB_QUERY_FAILED', 500);
  }

  return data || [];
}

// ============================================================================
// QUIZ QUERIES
// ============================================================================

export async function createQuiz(
  classId: string,
  title: string,
  description: string | null,
  createdBy: string
) {
  const supabase = getSupabaseServiceClient();

  const { data, error } = await supabase
    .from(TABLES.QUIZZES)
    .insert({
      class_id: classId,
      title,
      description,
      created_by: createdBy,
      is_published: false,
    })
    .select('*')
    .single();

  if (error) {
    throw new AppError('DB_QUERY_FAILED', 500);
  }

  return data;
}

export async function getQuizById(quizId: string) {
  const supabase = getSupabaseServiceClient();

  const { data, error } = await supabase
    .from(TABLES.QUIZZES)
    .select('*')
    .eq('id', quizId)
    .single();

  if (error && error.code !== 'PGRST116') {
    throw new AppError('DB_QUERY_FAILED', 500);
  }

  return data || null;
}

export async function publishQuiz(quizId: string) {
  const supabase = getSupabaseServiceClient();

  const { data, error } = await supabase
    .from(TABLES.QUIZZES)
    .update({ is_published: true })
    .eq('id', quizId)
    .select('*')
    .single();

  if (error) {
    throw new AppError('DB_QUERY_FAILED', 500);
  }

  return data;
}

// ============================================================================
// QUESTION QUERIES
// ============================================================================

export async function createQuestion(
  quizId: string,
  questionText: string,
  questionType: string,
  options: any,
  correctAnswer: string,
  orderIndex: number
) {
  const supabase = getSupabaseServiceClient();

  const { data, error } = await supabase
    .from(TABLES.QUESTIONS)
    .insert({
      quiz_id: quizId,
      question_text: questionText,
      question_type: questionType,
      options,
      correct_answer: correctAnswer,
      order_index: orderIndex,
    })
    .select('*')
    .single();

  if (error) {
    throw new AppError('DB_QUERY_FAILED', 500);
  }

  return data;
}

// ============================================================================
// QUIZ ATTEMPT QUERIES
// ============================================================================

export async function startQuizAttempt(
  quizId: string,
  studentId: string,
  learningMode: string = 'normal'
) {
  const supabase = getSupabaseServiceClient();

  const { data, error } = await supabase
    .from(TABLES.QUIZ_ATTEMPTS)
    .insert({
      quiz_id: quizId,
      student_id: studentId,
      learning_mode: learningMode,
      status: 'in_progress',
    })
    .select('*')
    .single();

  if (error) {
    throw new AppError('DB_QUERY_FAILED', 500);
  }

  return data;
}

export async function submitQuizAttempt(
  attemptId: string,
  score: number,
  totalQuestions: number
) {
  const supabase = getSupabaseServiceClient();

  const percentage = (score / totalQuestions) * 100;

  const { data, error } = await supabase
    .from(TABLES.QUIZ_ATTEMPTS)
    .update({
      status: 'completed',
      score,
      percentage_score: percentage,
      completed_at: new Date().toISOString(),
    })
    .eq('id', attemptId)
    .select('*')
    .single();

  if (error) {
    throw new AppError('DB_QUERY_FAILED', 500);
  }

  return data;
}

export async function recordAnswer(
  attemptId: string,
  questionId: string,
  studentAnswer: string,
  isCorrect: boolean
) {
  const supabase = getSupabaseServiceClient();

  const { data, error } = await supabase
    .from(TABLES.ANSWERS)
    .insert({
      attempt_id: attemptId,
      question_id: questionId,
      student_answer: studentAnswer,
      is_correct: isCorrect,
    })
    .select('*')
    .single();

  if (error) {
    throw new AppError('DB_QUERY_FAILED', 500);
  }

  return data;
}

// ============================================================================
// CHAT SESSION QUERIES
// ============================================================================

export async function createChatSession(
  userId: string,
  classId: string | null = null,
  topicId: string | null = null
) {
  const supabase = getSupabaseServiceClient();

  const { data, error } = await supabase
    .from(TABLES.CHAT_SESSIONS)
    .insert({
      user_id: userId,
      class_id: classId,
      topic_id: topicId,
    })
    .select('*')
    .single();

  if (error) {
    throw new AppError('DB_QUERY_FAILED', 500);
  }

  return data;
}

export async function getChatSession(sessionId: string) {
  const supabase = getSupabaseServiceClient();

  const { data, error } = await supabase
    .from(TABLES.CHAT_SESSIONS)
    .select('*')
    .eq('id', sessionId)
    .single();

  if (error && error.code !== 'PGRST116') {
    throw new AppError('DB_QUERY_FAILED', 500);
  }

  return data || null;
}

export async function saveChatMessage(
  sessionId: string,
  role: 'user' | 'assistant',
  content: string,
  metadata: any = null
) {
  const supabase = getSupabaseServiceClient();

  const { data, error } = await supabase
    .from(TABLES.CHAT_MESSAGES)
    .insert({
      session_id: sessionId,
      role,
      content,
      metadata,
    })
    .select('*')
    .single();

  if (error) {
    throw new AppError('DB_QUERY_FAILED', 500);
  }

  return data;
}

export async function getChatMessages(sessionId: string, limit: number = 50) {
  const supabase = getSupabaseServiceClient();

  const { data, error } = await supabase
    .from(TABLES.CHAT_MESSAGES)
    .select('*')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: true })
    .limit(limit);

  if (error) {
    throw new AppError('DB_QUERY_FAILED', 500);
  }

  return data || [];
}

// ============================================================================
// LEARNING SESSION QUERIES
// ============================================================================

export async function createLearningSession(
  studentId: string,
  quizAttemptId: string,
  mode: string = 'normal'
) {
  const supabase = getSupabaseServiceClient();

  const { data, error } = await supabase
    .from(TABLES.LEARNING_SESSIONS)
    .insert({
      student_id: studentId,
      quiz_attempt_id: quizAttemptId,
      mode,
      wrong_attempt_count: 0,
    })
    .select('*')
    .single();

  if (error) {
    throw new AppError('DB_QUERY_FAILED', 500);
  }

  return data;
}

export async function incrementWrongAttempt(sessionId: string) {
  const supabase = getSupabaseServiceClient();

  const session = await getLearningSession(sessionId);
  if (!session) throw new AppError('SESSION_NOT_FOUND', 404);

  const { data, error } = await supabase
    .from(TABLES.LEARNING_SESSIONS)
    .update({ wrong_attempt_count: (session.wrong_attempt_count || 0) + 1 })
    .eq('id', sessionId)
    .select('*')
    .single();

  if (error) {
    throw new AppError('DB_QUERY_FAILED', 500);
  }

  return data;
}

export async function updateLearningMode(sessionId: string, mode: string) {
  const supabase = getSupabaseServiceClient();

  const { data, error } = await supabase
    .from(TABLES.LEARNING_SESSIONS)
    .update({ mode })
    .eq('id', sessionId)
    .select('*')
    .single();

  if (error) {
    throw new AppError('DB_QUERY_FAILED', 500);
  }

  return data;
}

export async function getLearningSession(sessionId: string) {
  const supabase = getSupabaseServiceClient();

  const { data, error } = await supabase
    .from(TABLES.LEARNING_SESSIONS)
    .select('*')
    .eq('id', sessionId)
    .single();

  if (error && error.code !== 'PGRST116') {
    throw new AppError('DB_QUERY_FAILED', 500);
  }

  return data || null;
}

// ============================================================================
// ANALYTICS QUERIES
// ============================================================================

export async function getStudentProgress(studentId: string) {
  const supabase = getSupabaseServiceClient();

  const { data, error } = await supabase
    .from(TABLES.QUIZ_ATTEMPTS)
    .select('*, quiz:quizzes(id, title, class_id)')
    .eq('student_id', studentId)
    .eq('status', 'completed')
    .order('completed_at', { ascending: false });

  if (error) {
    throw new AppError('DB_QUERY_FAILED', 500);
  }

  return data || [];
}

export async function getClassStatistics(classId: string) {
  const supabase = getSupabaseServiceClient();

  const { data: attempts, error } = await supabase
    .from(TABLES.QUIZ_ATTEMPTS)
    .select('*, quiz:quizzes(id), student:users(id, full_name)')
    .eq('quiz.class_id', classId)
    .eq('status', 'completed');

  if (error) {
    throw new AppError('DB_QUERY_FAILED', 500);
  }

  // Calculate statistics
  const stats = {
    total_quizzes_taken: attempts?.length || 0,
    average_score:
      attempts && attempts.length > 0
        ? (attempts.reduce((sum: number, a: any) => sum + (a.percentage_score || 0), 0) /
            attempts.length)
          .toFixed(2)
        : 0,
    highest_score:
      attempts && attempts.length > 0
        ? Math.max(...attempts.map((a: any) => a.percentage_score || 0))
        : 0,
    lowest_score:
      attempts && attempts.length > 0
        ? Math.min(...attempts.map((a: any) => a.percentage_score || 0))
        : 0,
  };

  return stats;
}

export async function getStudentClassProgress(studentId: string, classId: string) {
  const supabase = getSupabaseServiceClient();

  const { data, error } = await supabase
    .from(TABLES.QUIZ_ATTEMPTS)
    .select('*, quiz:quizzes(id, title)')
    .eq('student_id', studentId)
    .eq('quiz.class_id', classId)
    .eq('status', 'completed')
    .order('completed_at', { ascending: false });

  if (error) {
    throw new AppError('DB_QUERY_FAILED', 500);
  }

  return data || [];
}

export async function recordAIUsage(
  userId: string,
  classId: string,
  type: 'chat' | 'hint' | 'explanation',
  tokensUsed: number
) {
  const supabase = getSupabaseServiceClient();

  const { data, error } = await supabase
    .from(TABLES.AI_USAGE_LOGS)
    .insert({
      user_id: userId,
      class_id: classId,
      usage_type: type,
      tokens_used: tokensUsed,
    })
    .select('*')
    .single();

  if (error) {
    throw new AppError('DB_QUERY_FAILED', 500);
  }

  return data;
}

export async function getAIUsageStats(classId: string) {
  const supabase = getSupabaseServiceClient();

  const { data, error } = await supabase
    .from(TABLES.AI_USAGE_LOGS)
    .select('usage_type, tokens_used, user_id')
    .eq('class_id', classId);

  if (error) {
    throw new AppError('DB_QUERY_FAILED', 500);
  }

  // Calculate stats
  const logs = data || [];
  const stats = {
    total_requests: logs.length,
    total_tokens: logs.reduce((sum: number, log: any) => sum + (log.tokens_used || 0), 0),
    by_type: {
      chat: logs.filter((l: any) => l.usage_type === 'chat').length,
      hint: logs.filter((l: any) => l.usage_type === 'hint').length,
      explanation: logs.filter((l: any) => l.usage_type === 'explanation').length,
    },
    unique_users: new Set(logs.map((l: any) => l.user_id)).size,
  };

  return stats;
}

// ============================================================================
// ROLE QUERIES
// ============================================================================

export async function getRoleById(roleId: string): Promise<Role | null> {
  const supabase = getSupabaseServiceClient();

  const { data, error } = await supabase
    .from(TABLES.ROLES)
    .select('*')
    .eq('id', roleId)
    .single();

  if (error && error.code !== 'PGRST116') {
    throw new AppError('DB_QUERY_FAILED', 500);
  }

  return data || null;
}

export async function getRoleByName(name: string): Promise<Role | null> {
  const supabase = getSupabaseServiceClient();

  const { data, error } = await supabase
    .from(TABLES.ROLES)
    .select('*')
    .eq('name', name)
    .single();

  if (error && error.code !== 'PGRST116') {
    throw new AppError('DB_QUERY_FAILED', 500);
  }

  return data || null;
}

// ============================================================================
// CLASS QUERIES
// ============================================================================

export async function getClassById(classId: string, includeTeacher = false) {
  const supabase = getSupabaseServiceClient();

  let query = supabase.from(TABLES.CLASSES).select('*');

  if (includeTeacher) {
    query = supabase.from(TABLES.CLASSES).select('*, teacher:users(*)');
  }

  const { data, error } = await query.eq('id', classId).single();

  if (error && error.code !== 'PGRST116') {
    throw new AppError('DB_QUERY_FAILED', 500);
  }

  return data || null;
}

export async function getClassByCode(classCode: string) {
  const supabase = getSupabaseServiceClient();

  const { data, error } = await supabase
    .from(TABLES.CLASSES)
    .select('*')
    .eq('class_code', classCode)
    .single();

  if (error && error.code !== 'PGRST116') {
    throw new AppError('DB_QUERY_FAILED', 500);
  }

  return data || null;
}

export async function getTeacherClasses(teacherId: string) {
  const supabase = getSupabaseServiceClient();

  const { data, error } = await supabase
    .from(TABLES.CLASSES)
    .select('*')
    .eq('teacher_id', teacherId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new AppError('DB_QUERY_FAILED', 500);
  }

  return data || [];
}

export async function getStudentClasses(studentId: string) {
  const supabase = getSupabaseServiceClient();

  const { data, error } = await supabase
    .from(TABLES.STUDENT_CLASSES)
    .select('class_id, classes(*)')
    .eq('student_id', studentId);

  if (error) {
    throw new AppError('DB_QUERY_FAILED', 500);
  }

  return data?.map(item => item.classes) || [];
}

// ============================================================================
// MATERIAL QUERIES
// ============================================================================

export async function createClass(
  name: string,
  description: string,
  teacherId: string,
  classCode: string
) {
  const supabase = getSupabaseServiceClient();

  const { data, error } = await supabase
    .from(TABLES.CLASSES)
    .insert({
      name,
      description,
      teacher_id: teacherId,
      class_code: classCode,
    })
    .select('*')
    .single();

  if (error) {
    throw new AppError('DB_QUERY_FAILED', 500);
  }

  return data;
}

// ============================================================================
// ENROLLMENT QUERIES
// ============================================================================

export async function checkEnrollment(studentId: string, classId: string): Promise<boolean> {
  const supabase = getSupabaseServiceClient();

  const { data, error } = await supabase
    .from(TABLES.STUDENT_CLASSES)
    .select('id')
    .eq('student_id', studentId)
    .eq('class_id', classId)
    .single();

  if (error && error.code !== 'PGRST116') {
    throw new AppError('DB_QUERY_FAILED', 500);
  }

  return !!data;
}

export async function getClassStudents(classId: string) {
  const supabase = getSupabaseServiceClient();

  const { data, error } = await supabase
    .from(TABLES.STUDENT_CLASSES)
    .select('student_id, users(*)')
    .eq('class_id', classId);

  if (error) {
    throw new AppError('DB_QUERY_FAILED', 500);
  }

  return data?.map(item => item.users) || [];
}

export async function enrollStudent(studentId: string, classId: string) {
  const supabase = getSupabaseServiceClient();

  const { data, error } = await supabase
    .from(TABLES.STUDENT_CLASSES)
    .insert({
      student_id: studentId,
      class_id: classId,
    })
    .select('*')
    .single();

  if (error) {
    if (error.code === '23505') {
      throw new AppError('ALREADY_ENROLLED', 409);
    }
    throw new AppError('DB_QUERY_FAILED', 500);
  }

  return data;
}

export async function removeStudent(studentId: string, classId: string) {
  const supabase = getSupabaseServiceClient();

  const { error } = await supabase
    .from(TABLES.STUDENT_CLASSES)
    .delete()
    .eq('student_id', studentId)
    .eq('class_id', classId);

  if (error) {
    throw new AppError('DB_QUERY_FAILED', 500);
  }
}

// ============================================================================
// MATERIAL QUERIES
// ============================================================================

export async function getMaterialById(materialId: string) {
  const supabase = getSupabaseServiceClient();

  const { data, error } = await supabase
    .from(TABLES.MATERIALS)
    .select('*')
    .eq('id', materialId)
    .single();

  if (error && error.code !== 'PGRST116') {
    throw new AppError('DB_QUERY_FAILED', 500);
  }

  return data || null;
}

// ============================================================================
// QUIZ QUERIES
// ============================================================================

export async function getQuizById(quizId: string) {
  const supabase = getSupabaseServiceClient();

  const { data, error } = await supabase
    .from(TABLES.QUIZZES)
    .select('*')
    .eq('id', quizId)
    .single();

  if (error && error.code !== 'PGRST116') {
    throw new AppError('DB_QUERY_FAILED', 500);
  }

  return data || null;
}

export async function getClassQuizzes(classId: string) {
  const supabase = getSupabaseServiceClient();

  const { data, error } = await supabase
    .from(TABLES.QUIZZES)
    .select('*')
    .eq('class_id', classId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new AppError('DB_QUERY_FAILED', 500);
  }

  return data || [];
}

// ============================================================================
// QUESTION QUERIES
// ============================================================================

export async function getQuizQuestions(quizId: string) {
  const supabase = getSupabaseServiceClient();

  const { data, error } = await supabase
    .from(TABLES.QUESTIONS)
    .select('*')
    .eq('quiz_id', quizId)
    .order('order_index', { ascending: true });

  if (error) {
    throw new AppError('DB_QUERY_FAILED', 500);
  }

  return data || [];
}

export async function getQuestionById(questionId: string) {
  const supabase = getSupabaseServiceClient();

  const { data, error } = await supabase
    .from(TABLES.QUESTIONS)
    .select('*')
    .eq('id', questionId)
    .single();

  if (error && error.code !== 'PGRST116') {
    throw new AppError('DB_QUERY_FAILED', 500);
  }

  return data || null;
}

// ============================================================================
// QUIZ ATTEMPT QUERIES
// ============================================================================

export async function getAttemptById(attemptId: string) {
  const supabase = getSupabaseServiceClient();

  const { data, error } = await supabase
    .from(TABLES.QUIZ_ATTEMPTS)
    .select('*')
    .eq('id', attemptId)
    .single();

  if (error && error.code !== 'PGRST116') {
    throw new AppError('DB_QUERY_FAILED', 500);
  }

  return data || null;
}

export async function getStudentAttempts(studentId: string, quizId: string) {
  const supabase = getSupabaseServiceClient();

  const { data, error } = await supabase
    .from(TABLES.QUIZ_ATTEMPTS)
    .select('*')
    .eq('student_id', studentId)
    .eq('quiz_id', quizId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new AppError('DB_QUERY_FAILED', 500);
  }

  return data || [];
}
