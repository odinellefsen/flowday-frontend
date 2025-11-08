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
export * from './meals'
export * from './habits'

// Re-export for convenience with namespacing
export { todosAPI } from './todos'
export { foodItemsAPI } from './food-items'
export { recipesAPI } from './recipes'
export { mealsAPI } from './meals'
export { habitsAPI } from './habits'

// Re-export authenticated hooks
export { useAuthenticatedTodosAPI } from './todos'
export { useAuthenticatedFoodItemsAPI } from './food-items'
export { useAuthenticatedRecipesAPI } from './recipes'
export { useAuthenticatedMealsAPI } from './meals'
export { useAuthenticatedHabitsAPI } from './habits'

