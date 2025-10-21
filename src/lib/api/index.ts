/**
 * Central API export - domain-based organization
 * Import from this file for convenience, or from individual domain files for tree-shaking
 */

// Export all types
export * from './types'

// Export domain APIs
export * from './todos'
export * from './food-items'
export * from './recipes'

// Re-export for convenience with namespacing
export { todosAPI } from './todos'
export { foodItemsAPI } from './food-items'
export { recipesAPI } from './recipes'

// Re-export authenticated hooks
export { useAuthenticatedTodosAPI } from './todos'
export { useAuthenticatedFoodItemsAPI } from './food-items'
export { useAuthenticatedRecipesAPI } from './recipes'

