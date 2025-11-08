/**
 * Habits API - Client-side API functions for habit operations
 * Works seamlessly with TanStack Query
 */

import { useAuth } from '@clerk/nextjs'
import type { ApiResponse } from './types'
import type {
  CreateHabitBatchRequest,
  CreateHabitBatchResponse,
} from './types/habits'

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3030'

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
  }
}

