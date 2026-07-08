import { JWTPayload } from '@/types';
import { AppError } from '@/lib/utils/error-handler';

/**
 * Check if user has required permission
 */
export function hasPermission(user: JWTPayload, permission: string): boolean {
  return user.permissions?.[permission] === true;
}

/**
 * Check if user has any of the required permissions
 */
export function hasAnyPermission(user: JWTPayload, permissions: string[]): boolean {
  return permissions.some(permission => hasPermission(user, permission));
}

/**
 * Check if user has all required permissions
 */
export function hasAllPermissions(user: JWTPayload, permissions: string[]): boolean {
  return permissions.every(permission => hasPermission(user, permission));
}

/**
 * Require specific permission or throw error
 */
export function requirePermission(user: JWTPayload, permission: string) {
  if (!hasPermission(user, permission)) {
    throw new AppError('AUTH_INSUFFICIENT_PERMISSION', 403);
  }
}

/**
 * Require any of the permissions or throw error
 */
export function requireAnyPermission(user: JWTPayload, permissions: string[]) {
  if (!hasAnyPermission(user, permissions)) {
    throw new AppError('AUTH_INSUFFICIENT_PERMISSION', 403);
  }
}

/**
 * Require all permissions or throw error
 */
export function requireAllPermissions(user: JWTPayload, permissions: string[]) {
  if (!hasAllPermissions(user, permissions)) {
    throw new AppError('AUTH_INSUFFICIENT_PERMISSION', 403);
  }
}

/**
 * Check if user is owner of resource
 */
export function isOwner(user: JWTPayload, resourceUserId: string): boolean {
  return user.user_id === resourceUserId;
}

/**
 * Require user to be owner or admin
 */
export function requireOwnerOrAdmin(user: JWTPayload, resourceUserId: string) {
  if (!isOwner(user, resourceUserId) && user.role !== 'admin') {
    throw new AppError('AUTH_INSUFFICIENT_PERMISSION', 403);
  }
}

/**
 * Get permission name based on role
 */
export function getRolePermissions(role: string): Record<string, boolean> {
  const rolePermissionsMap: Record<string, Record<string, boolean>> = {
    teacher: {
      create_class: true,
      manage_class: true,
      upload_materials: true,
      create_quiz: true,
      view_analytics: true,
      delete_class: true,
      manage_students: true,
    },
    student: {
      take_quiz: true,
      view_materials: true,
      use_ai_chat: true,
      view_progress: true,
      submit_answers: true,
    },
    admin: {
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
  };

  return rolePermissionsMap[role] || {};
}
