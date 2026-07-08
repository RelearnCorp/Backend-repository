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

export async function getClassMaterials(classId: string) {
  const supabase = getSupabaseServiceClient();

  const { data, error } = await supabase
    .from(TABLES.MATERIALS)
    .select('*')
    .eq('class_id', classId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new AppError('DB_QUERY_FAILED', 500);
  }

  return data || [];
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
