/**
 * Shared API types used across all domains
 */

// Base API Response
export interface ApiResponse<T = unknown> {
  success: boolean
  message: string
  data?: T
  errors?: unknown
}

// Re-export domain-specific types for convenience
export * from './types/todos'
export * from './types/food-items'
export * from './types/recipes'
