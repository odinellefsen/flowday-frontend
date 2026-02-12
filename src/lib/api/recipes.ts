/**
 * Recipes API - Client-side API functions for recipe operations
 * Works seamlessly with TanStack Query
 */

import { useAuth } from '@clerk/nextjs'
import type { ApiResponse } from './types'
import type {
  CreateRecipeRequest,
  UpdateRecipeRequest,
  CreateRecipeIngredientsRequest,
  CreateRecipeInstructionsRequest,
  UpdateRecipeInstructionsRequest,
  ListRecipesResponse,
  CreateRecipeResponse,
  GetRecipeResponse,
  CreateRecipeIngredientsResponse,
  CreateRecipeInstructionsResponse,
} from './types/recipes'

import { getApiBaseUrl } from '@/src/lib/api/base-url'

const BASE_URL = getApiBaseUrl()

/**
 * Raw API functions that accept a token parameter
 * Use these when you already have a token or need more control
 */
export const recipesAPI = {
  /**
   * List all recipes for the authenticated user
   */
  list: async (token: string | null): Promise<ApiResponse<ListRecipesResponse['data']>> => {
    const response = await fetch(`${BASE_URL}/api/recipe`, {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
    }

    return response.json()
  },

  /**
   * Get a specific recipe with full details
   */
  get: async (token: string | null, recipeId: string): Promise<ApiResponse<GetRecipeResponse['data']>> => {
    const response = await fetch(`${BASE_URL}/api/recipe/${recipeId}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
    }

    return response.json()
  },

  /**
   * Create a new recipe
   */
  create: async (
    token: string | null,
    recipeData: CreateRecipeRequest
  ): Promise<ApiResponse<CreateRecipeResponse['data']>> => {
    const response = await fetch(`${BASE_URL}/api/recipe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify(recipeData),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
    }

    return response.json()
  },

  /**
   * Update recipe metadata
   */
  update: async (
    token: string | null,
    recipeData: UpdateRecipeRequest
  ): Promise<ApiResponse<CreateRecipeResponse['data']>> => {
    const response = await fetch(`${BASE_URL}/api/recipe`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify(recipeData),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
    }

    return response.json()
  },

  /**
   * Delete a recipe by name
   */
  delete: async (token: string | null, recipeId: string): Promise<ApiResponse<unknown>> => {
    const response = await fetch(`${BASE_URL}/api/recipe`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify({ recipeId }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
    }

    return response.json()
  },

  /**
   * Create ingredients for a recipe
   */
  createIngredients: async (
    token: string | null,
    ingredientsData: CreateRecipeIngredientsRequest
  ): Promise<ApiResponse<CreateRecipeIngredientsResponse['data']>> => {
    const response = await fetch(`${BASE_URL}/api/recipe/ingredients`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify(ingredientsData),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
    }

    return response.json()
  },

  /**
   * Create instructions for a recipe
   */
  createInstructions: async (
    token: string | null,
    instructionsData: CreateRecipeInstructionsRequest
  ): Promise<ApiResponse<CreateRecipeInstructionsResponse['data']>> => {
    const response = await fetch(`${BASE_URL}/api/recipe/instructions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify(instructionsData),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
    }

    return response.json()
  },

  /**
   * Update instructions for a recipe
   */
  updateInstructions: async (
    token: string | null,
    instructionsData: UpdateRecipeInstructionsRequest
  ): Promise<ApiResponse<CreateRecipeInstructionsResponse['data']>> => {
    const response = await fetch(`${BASE_URL}/api/recipe/instructions`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify(instructionsData),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
    }

    return response.json()
  },
}

/**
 * Authenticated API hook - automatically handles token retrieval
 * Use this in your components with TanStack Query
 */
export function useAuthenticatedRecipesAPI() {
  const { getToken } = useAuth()

  return {
    list: async (): Promise<ApiResponse<ListRecipesResponse['data']>> => {
      const token = await getToken()
      return recipesAPI.list(token)
    },
    get: async (recipeId: string): Promise<ApiResponse<GetRecipeResponse['data']>> => {
      const token = await getToken()
      return recipesAPI.get(token, recipeId)
    },
    create: async (recipeData: CreateRecipeRequest): Promise<ApiResponse<CreateRecipeResponse['data']>> => {
      const token = await getToken()
      return recipesAPI.create(token, recipeData)
    },
    update: async (recipeData: UpdateRecipeRequest): Promise<ApiResponse<CreateRecipeResponse['data']>> => {
      const token = await getToken()
      return recipesAPI.update(token, recipeData)
    },
    delete: async (nameOfTheRecipe: string): Promise<ApiResponse<unknown>> => {
      const token = await getToken()
      return recipesAPI.delete(token, nameOfTheRecipe)
    },
    createIngredients: async (
      ingredientsData: CreateRecipeIngredientsRequest
    ): Promise<ApiResponse<CreateRecipeIngredientsResponse['data']>> => {
      const token = await getToken()
      return recipesAPI.createIngredients(token, ingredientsData)
    },
    createInstructions: async (
      instructionsData: CreateRecipeInstructionsRequest
    ): Promise<ApiResponse<CreateRecipeInstructionsResponse['data']>> => {
      const token = await getToken()
      return recipesAPI.createInstructions(token, instructionsData)
    },
    updateInstructions: async (
      instructionsData: UpdateRecipeInstructionsRequest
    ): Promise<ApiResponse<CreateRecipeInstructionsResponse['data']>> => {
      const token = await getToken()
      return recipesAPI.updateInstructions(token, instructionsData)
    },
  }
}

