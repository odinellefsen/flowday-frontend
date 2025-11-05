/**
 * Meals API - Client-side API functions for meal operations
 * Works seamlessly with TanStack Query
 */

import { useAuth } from '@clerk/nextjs'
import type { ApiResponse } from './types'
import type {
  CreateMealRequest,
  AttachRecipesToMealRequest,
  ListMealsResponse,
  CreateMealResponse,
  GetMealResponse,
  AttachRecipesResponse,
} from './types/meals'

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3030'

/**
 * Raw API functions that accept a token parameter
 * Use these when you already have a token or need more control
 */
export const mealsAPI = {
  /**
   * List all meals for the authenticated user
   */
  list: async (token: string | null): Promise<ApiResponse<ListMealsResponse['data']>> => {
    const response = await fetch(`${BASE_URL}/api/meal`, {
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
   * Get a specific meal with full details
   */
  get: async (token: string | null, mealId: string): Promise<ApiResponse<GetMealResponse['data']>> => {
    const response = await fetch(`${BASE_URL}/api/meal/${mealId}`, {
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
   * Create a new meal
   */
  create: async (
    token: string | null,
    mealData: CreateMealRequest
  ): Promise<ApiResponse<CreateMealResponse['data']>> => {
    const response = await fetch(`${BASE_URL}/api/meal`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify(mealData),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
    }

    return response.json()
  },

  /**
   * Attach recipes to a meal
   */
  attachRecipes: async (
    token: string | null,
    mealId: string,
    recipesData: AttachRecipesToMealRequest
  ): Promise<ApiResponse<AttachRecipesResponse['data']>> => {
    const response = await fetch(`${BASE_URL}/api/meal/${mealId}/recipes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify(recipesData),
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
export function useAuthenticatedMealsAPI() {
  const { getToken } = useAuth()

  return {
    list: async (): Promise<ApiResponse<ListMealsResponse['data']>> => {
      const token = await getToken()
      return mealsAPI.list(token)
    },
    get: async (mealId: string): Promise<ApiResponse<GetMealResponse['data']>> => {
      const token = await getToken()
      return mealsAPI.get(token, mealId)
    },
    create: async (mealData: CreateMealRequest): Promise<ApiResponse<CreateMealResponse['data']>> => {
      const token = await getToken()
      return mealsAPI.create(token, mealData)
    },
    attachRecipes: async (
      mealId: string,
      recipesData: AttachRecipesToMealRequest
    ): Promise<ApiResponse<AttachRecipesResponse['data']>> => {
      const token = await getToken()
      return mealsAPI.attachRecipes(token, mealId, recipesData)
    },
  }
}

