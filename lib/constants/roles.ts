export const ROLES = {
  TEACHER: 'teacher',
  STUDENT: 'student',
  ADMIN: 'admin',
} as const;

export const PERMISSIONS = {
  TEACHER: {
    create_class: true,
    manage_class: true,
    upload_materials: true,
    create_quiz: true,
    view_analytics: true,
    delete_class: true,
    manage_students: true,
  },
  STUDENT: {
    take_quiz: true,
    view_materials: true,
    use_ai_chat: true,
    view_progress: true,
    submit_answers: true,
  },
  ADMIN: {
    create_class: true,
    manage_class: true,
    upload_materials: true,
    create_quiz: true,
    view_analytics: true,
    delete_class: true,
    manage_students: true,
    take_quiz: true,
    view_materials: true,
    use_ai_chat: true,
    view_progress: true,
    submit_answers: true,
    manage_users: true,
    manage_roles: true,
  },
} as const;
