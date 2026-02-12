/**
 * Recipes domain types
 */

export enum MealTimingEnum {
  BREAKFAST = "BREAKFAST",
  LUNCH = "LUNCH",
  DINNER = "DINNER",
  SNACK = "SNACK"
}

export interface Recipe {
  id: string
  userId: string
  nameOfTheRecipe: string
  generalDescriptionOfTheRecipe?: string
  whenIsItConsumed?: MealTimingEnum[]
  version: number
  stepCount: number
  ingredientCount: number
  hasSteps: boolean
  hasIngredients: boolean
  completeness: "complete" | "incomplete"
}

export interface RecipeIngredient {
  id: string
  ingredientText: string
}

export interface RecipeInstruction {
  id: string
  instructionNumber: number
  instruction: string
  foodItemUnits: Array<{
    quantity: number
    calories: number
    unitOfMeasurement: string
    foodItemName: string
  }>
}

export interface RecipeWithDetails extends Recipe {
  instructions: RecipeInstruction[]
  ingredients: RecipeIngredient[]
  metadata: {
    stepCount: number
    ingredientCount: number
    estimatedTotalTime: number | null
  }
}

// Request types
export interface CreateRecipeRequest {
  nameOfTheRecipe: string
  generalDescriptionOfTheRecipe?: string
  whenIsItConsumed?: MealTimingEnum[]
}

export interface UpdateRecipeRequest {
  recipeId: string
  nameOfTheRecipe: string
  generalDescriptionOfTheRecipe?: string
  whenIsItConsumed?: MealTimingEnum[]
}

export interface CreateRecipeIngredientsRequest {
  recipeId: string
  ingredients: Array<{
    ingredientText: string
  }>
}

export interface UpdateRecipeIngredientsRequest {
  recipeId: string
  ingredients: Array<{
    ingredientText: string
  }>
}

export interface CreateRecipeInstructionsRequest {
  recipeId: string
  stepByStepInstructions: Array<{
    stepInstruction: string
    foodItemUnitsUsedInStep?: Array<{
      foodItemUnitId: string
      quantityOfFoodItemUnit: number
    }>
  }>
}

export interface UpdateRecipeInstructionsRequest {
  recipeId: string
  stepByStepInstructions: Array<{
    instructionNumber: number
    stepInstruction: string
    foodItemUnitsUsedInStep?: Array<{
      foodItemUnitId: string
      foodItemId: string
      quantityOfFoodItemUnit: number
    }>
  }>
}

// Response types
export interface ListRecipesResponse {
  data: Recipe[]
}

export interface CreateRecipeResponse {
  data: Recipe
}

export interface GetRecipeResponse {
  data: RecipeWithDetails
}

export interface CreateRecipeIngredientsResponse {
  data: {
    recipeId: string
    ingredients: RecipeIngredient[]
  }
}

export interface CreateRecipeInstructionsResponse {
  data: {
    recipeId: string
    stepByStepInstructions: RecipeInstruction[]
  }
}

