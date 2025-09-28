/**
 * Client-safe API layer - NO SDK imports here!
 * This file can be safely imported in client components and hooks
 */

import { useAuth } from '@clerk/nextjs'

// API Response types based on the documentation
export interface ApiResponse<T = unknown> {
  success: boolean
  message: string
  data?: T
  errors?: unknown
}

export interface TodoItem {
  id: string
  description: string
  scheduledFor?: string
  completed: boolean
  context: {
    type: "meal" | "standalone"
    mealName?: string
    instructionNumber?: number
    estimatedDuration?: number | null
  }
  canStartNow: boolean
  isOverdue: boolean
  urgency: "overdue" | "now" | "upcoming" | "later"
}

export interface TodayTodosResponse {
  todos: TodoItem[]
  counts: {
    total: number
    completed: number
    remaining: number
    overdue: number
  }
}

export interface CreateTodoRequest {
  description: string
  scheduledFor?: string
  relations?: Array<{
    mealInstruction: {
      mealStepId: string
      mealId: string
      recipeId: string
      instructionNumber: number
    }
  }>
}

export interface CreateTodoResponse {
  id: string
  userId: string
  description: string
  completed: boolean
  scheduledFor?: string
  completedAt?: string
  relations?: Array<{
    mealInstruction: {
      mealStepId: string
      mealId: string
      recipeId: string
      instructionNumber: number
    }
  }>
}

/**
 * Client-side API functions that work with React Query
 * These functions handle the client-side data fetching patterns
 */
export const clientAPI = {
  todos: {
    /**
     * Fetch today's todos for the authenticated user
     */
    today: async (token: string | null): Promise<ApiResponse<TodayTodosResponse>> => {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3030'
      const response = await fetch(`${baseUrl}/api/todo/today`, {
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
     * Create a new todo
     */
    create: async (
      token: string | null,
      todoData: CreateTodoRequest
    ): Promise<ApiResponse<CreateTodoResponse>> => {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3030'
      const response = await fetch(`${baseUrl}/api/todo`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify(todoData),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
      }

      return response.json()
    },

    /**
     * Update a todo (mark as completed, etc.)
     */
    update: async (
      token: string | null,
      todoId: string,
      updateData: Partial<Pick<TodoItem, 'completed' | 'description' | 'scheduledFor'>>
    ): Promise<ApiResponse<TodoItem>> => {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3030'
      const response = await fetch(`${baseUrl}/api/todo/${todoId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify(updateData),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
      }

      return response.json()
    },

    /**
     * Delete a todo
     */
    delete: async (token: string | null, todoId: string): Promise<ApiResponse<void>> => {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3030'
      const response = await fetch(`${baseUrl}/api/todo/${todoId}`, {
        method: 'DELETE',
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
  },
}

/**
 * Hook factory for authenticated API calls
 * This creates the authenticated versions of the API functions
 */
export function createAuthenticatedAPI() {
  const { getToken } = useAuth()

  return {
    todos: {
      today: async (): Promise<ApiResponse<TodayTodosResponse>> => {
        const token = await getToken()
        return clientAPI.todos.today(token)
      },
      create: async (todoData: CreateTodoRequest): Promise<ApiResponse<CreateTodoResponse>> => {
        const token = await getToken()
        return clientAPI.todos.create(token, todoData)
      },
      update: async (
        todoId: string,
        updateData: Partial<Pick<TodoItem, 'completed' | 'description' | 'scheduledFor'>>
      ): Promise<ApiResponse<TodoItem>> => {
        const token = await getToken()
        return clientAPI.todos.update(token, todoId, updateData)
      },
      delete: async (todoId: string): Promise<ApiResponse<void>> => {
        const token = await getToken()
        return clientAPI.todos.delete(token, todoId)
      },
    },
  }
}
