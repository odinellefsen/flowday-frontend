/**
 * Food Items API - Client-side API functions for food item operations
 * Works seamlessly with TanStack Query
 */

import { useAuth } from '@clerk/nextjs'
import type { ApiResponse } from './types'
import type {
  FoodItem,
  FoodItemUnit,
  CreateFoodItemRequest,
  CreateFoodItemUnitRequest,
  ListFoodItemsResponse,
  CreateFoodItemResponse,
  CreateFoodItemUnitsResponse,
} from './types/food-items'

import { getApiBaseUrl } from '@/src/lib/api/base-url'

const BASE_URL = getApiBaseUrl()

/**
 * Raw API functions that accept a token parameter
 * Use these when you already have a token or need more control
 */
export const foodItemsAPI = {
  /**
   * List all food items for the authenticated user
   */
  list: async (token: string | null): Promise<ApiResponse<ListFoodItemsResponse['data']>> => {
    const response = await fetch(`${BASE_URL}/api/food-item`, {
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
   * Create a new food item
   */
  create: async (
    token: string | null,
    foodItemData: CreateFoodItemRequest
  ): Promise<ApiResponse<CreateFoodItemResponse['data']>> => {
    const response = await fetch(`${BASE_URL}/api/food-item`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify(foodItemData),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
    }

    return response.json()
  },

  /**
   * Delete a food item by name
   */
  delete: async (token: string | null, foodItemName: string): Promise<ApiResponse<unknown>> => {
    const response = await fetch(`${BASE_URL}/api/food-item`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify({ foodItemName }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
    }

    return response.json()
  },

  /**
   * Get units for a specific food item
   */
  getUnits: async (token: string | null, foodItemId: string): Promise<ApiResponse<FoodItemUnit[]>> => {
    const response = await fetch(`${BASE_URL}/api/food-item/${foodItemId}/units`, {
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
   * Create units for a food item
   */
  createUnits: async (
    token: string | null,
    foodItemId: string,
    unitsData: CreateFoodItemUnitRequest
  ): Promise<ApiResponse<CreateFoodItemUnitsResponse['data']>> => {
    const response = await fetch(`${BASE_URL}/api/food-item/${foodItemId}/units`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify(unitsData),
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
export function useAuthenticatedFoodItemsAPI() {
  const { getToken } = useAuth()

  return {
    list: async (): Promise<ApiResponse<ListFoodItemsResponse['data']>> => {
      const token = await getToken()
      return foodItemsAPI.list(token)
    },
    create: async (foodItemData: CreateFoodItemRequest): Promise<ApiResponse<CreateFoodItemResponse['data']>> => {
      const token = await getToken()
      return foodItemsAPI.create(token, foodItemData)
    },
    delete: async (foodItemName: string): Promise<ApiResponse<unknown>> => {
      const token = await getToken()
      return foodItemsAPI.delete(token, foodItemName)
    },
    getUnits: async (foodItemId: string): Promise<ApiResponse<FoodItemUnit[]>> => {
      const token = await getToken()
      return foodItemsAPI.getUnits(token, foodItemId)
    },
    createUnits: async (
      foodItemId: string,
      unitsData: CreateFoodItemUnitRequest
    ): Promise<ApiResponse<CreateFoodItemUnitsResponse['data']>> => {
      const token = await getToken()
      return foodItemsAPI.createUnits(token, foodItemId, unitsData)
    },
  }
}

