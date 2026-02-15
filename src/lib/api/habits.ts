/**
 * Habits API - Client-side API functions for habit operations
 * Works seamlessly with TanStack Query
 */

import { useAuth } from '@clerk/nextjs'
import type { ApiResponse } from './types'
import type {
  CreateHabitBatchRequest,
  CreateHabitBatchResponse,
  CreateSimpleHabitRequest,
  CreateSimpleHabitResponse,
  DeleteHabitRequest,
  DeleteHabitResponse,
} from './types/habits'

import { getApiBaseUrl } from '@/src/lib/api/base-url'

const BASE_URL = getApiBaseUrl()

/**
 * Raw API functions that accept a token parameter
 * Use these when you already have a token or need more control
 */
export const habitsAPI = {
  /**
   * Create a batch habit (weekly recurring tasks)
   */
  createBatch: async (
    token: string | null,
    habitData: CreateHabitBatchRequest
  ): Promise<ApiResponse<CreateHabitBatchResponse['data']>> => {
    const response = await fetch(`${BASE_URL}/api/habit/batch`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify(habitData),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('Habit creation error:', errorData)
      throw new Error(errorData.message || errorData.error || `HTTP error! status: ${response.status}`)
    }

    return response.json()
  },

  /**
   * Create a simple recurring habit (auto-generates todos)
   */
  createSimple: async (
    token: string | null,
    habitData: CreateSimpleHabitRequest
  ): Promise<ApiResponse<CreateSimpleHabitResponse['data']>> => {
    const response = await fetch(`${BASE_URL}/api/habit/simple`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify(habitData),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('Simple habit creation error:', errorData)
      throw new Error(errorData.message || errorData.error || `HTTP error! status: ${response.status}`)
    }

    return response.json()
  },

  /**
   * Delete/stop a habit
   */
  delete: async (
    token: string | null,
    habitData: DeleteHabitRequest
  ): Promise<ApiResponse<DeleteHabitResponse['data']>> => {
    const response = await fetch(`${BASE_URL}/api/habit`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify(habitData),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('Habit delete error:', errorData)
      throw new Error(errorData.message || errorData.error || `HTTP error! status: ${response.status}`)
    }

    return response.json()
  },
}

/**
 * Authenticated API hook - automatically handles token retrieval
 * Use this in your components with TanStack Query
 */
export function useAuthenticatedHabitsAPI() {
  const { getToken } = useAuth()

  return {
    createBatch: async (habitData: CreateHabitBatchRequest): Promise<ApiResponse<CreateHabitBatchResponse['data']>> => {
      const token = await getToken()
      return habitsAPI.createBatch(token, habitData)
    },
    createSimple: async (
      habitData: CreateSimpleHabitRequest
    ): Promise<ApiResponse<CreateSimpleHabitResponse['data']>> => {
      const token = await getToken()
      return habitsAPI.createSimple(token, habitData)
    },
    delete: async (habitData: DeleteHabitRequest): Promise<ApiResponse<DeleteHabitResponse['data']>> => {
      const token = await getToken()
      return habitsAPI.delete(token, habitData)
    },
  }
}

