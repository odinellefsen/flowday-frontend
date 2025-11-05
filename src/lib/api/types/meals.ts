/**
 * Meals domain types
 */

export interface Meal {
  id: string
  mealName: string
  recipeCount: number
}

export interface MealRecipe {
  recipeId: string
  orderInMeal: number
}

export interface MealInstruction {
  recipeId: string
  instruction: string
  instructionNumber: number
}

export interface MealIngredient {
  recipeId: string
  ingredientText: string
}

export interface MealWithDetails extends Meal {
  recipes: MealRecipe[]
  instructions: MealInstruction[]
  ingredients: MealIngredient[]
}

// Request types
export interface CreateMealRequest {
  mealName: string
}

export interface AttachRecipesToMealRequest {
  recipeIds: string[]
}

// Response types
export interface ListMealsResponse {
  data: Meal[]
}

export interface CreateMealResponse {
  data: {
    meal: {
      id: string
      mealName: string
    }
    message: string
  }
}

export interface GetMealResponse {
  data: MealWithDetails
}

export interface AttachRecipesResponse {
  data: {
    mealRecipe: {
      mealId: string
      recipes: Array<{
        recipeId: string
        orderInMeal: number
      }>
    }
  }
}

