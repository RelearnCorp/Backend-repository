export function formatUserResponse(user: any) {
  const { password_hash, ...userWithoutPassword } = user;
  return userWithoutPassword;
}

export function formatQuizResponse(quiz: any) {
  return {
    ...quiz,
    is_published: Boolean(quiz.is_published),
  };
}

export function formatQuestionResponse(question: any) {
  return {
    id: question.id,
    quiz_id: question.quiz_id,
    type: question.type,
    content: question.content,
    options: question.options,
    order_index: question.order_index,
    // Don't expose correct answer to students
    explanation: question.explanation,
  };
}

export function formatQuestionWithAnswerResponse(question: any) {
  // Include correct answer for teachers or after quiz completion
  return {
    id: question.id,
    quiz_id: question.quiz_id,
    type: question.type,
    content: question.content,
    options: question.options,
    correct_answer: question.correct_answer,
    explanation: question.explanation,
    order_index: question.order_index,
  };
}

export function formatClassResponse(cls: any) {
  return {
    id: cls.id,
    name: cls.name,
    description: cls.description,
    teacher_id: cls.teacher_id,
    teacher: cls.teacher ? formatUserResponse(cls.teacher) : null,
    class_code: cls.class_code,
    created_at: cls.created_at,
  };
}

export function formatMaterialResponse(material: any) {
  return {
    id: material.id,
    class_id: material.class_id,
    title: material.title,
    content: material.content,
    file_url: material.file_url,
    file_type: material.file_type,
    created_by: material.created_by,
    created_at: material.created_at,
  };
}

export function formatChatMessageResponse(message: any) {
  return {
    id: message.id,
    session_id: message.session_id,
    role: message.role,
    content: message.content,
    created_at: message.created_at,
  };
}

export function formatAnalyticsResponse(data: any) {
  return {
    total_students: data.total_students || 0,
    total_quizzes: data.total_quizzes || 0,
    average_score: data.average_score || 0,
    completion_rate: data.completion_rate || 0,
    student_metrics: data.student_metrics || [],
    quiz_stats: data.quiz_stats || [],
    ai_usage_stats: data.ai_usage_stats || {},
  };
}
