/**
 * Usuario
 * Estructura según contrato del backend
 * GET /api/users
 * GET /api/users/{id}
 */
export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[]; // ej: ["ROLE_ADMIN", "ROLE_USER"]
  enabled: boolean;
  createdAt: string; // ISO-8601: "2025-11-20T00:00:00Z"
  lastLogin?: string; // ISO-8601: "2025-11-20T01:32:00Z" (opcional)
}

export interface CreateUserRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  roles: string[];
  enabled?: boolean;
}

export interface UpdateUserRequest {
  email?: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  roles?: string[];
  enabled?: boolean;
}

export interface PagedUsers {
  content: User[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export interface UserListParams {
  page?: number;
  size?: number;
  email?: string;
  role?: string;
}
