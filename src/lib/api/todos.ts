/**
 * Todos API - Client-side API functions for todo operations
 * Works seamlessly with TanStack Query
 */

import { useAuth } from '@clerk/nextjs'
import type { ApiResponse } from './types'
import type {
  TodoItem,
  TodayTodosResponse,
  CreateTodoRequest,
  CreateTodoResponse,
  UpdateTodoRequest,
} from './types/todos'

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3030'

/**
 * Raw API functions that accept a token parameter
 * Use these when you already have a token or need more control
 */
export const todosAPI = {
  /**
   * Fetch today's todos for the authenticated user
   */
  getToday: async (token: string | null): Promise<ApiResponse<TodayTodosResponse>> => {
    const response = await fetch(`${BASE_URL}/api/todo/today`, {
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
    const response = await fetch(`${BASE_URL}/api/todo`, {
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
   * Update a todo (mark as completed, edit description, etc.)
   */
  update: async (
    token: string | null,
    todoId: string,
    updateData: UpdateTodoRequest
  ): Promise<ApiResponse<TodoItem>> => {
    const response = await fetch(`${BASE_URL}/api/todo/${todoId}`, {
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
    const response = await fetch(`${BASE_URL}/api/todo/${todoId}`, {
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
}

/**
 * Authenticated API hook - automatically handles token retrieval
 * Use this in your components with TanStack Query
 */
export function useAuthenticatedTodosAPI() {
  const { getToken } = useAuth()

  return {
    getToday: async (): Promise<ApiResponse<TodayTodosResponse>> => {
      const token = await getToken()
      return todosAPI.getToday(token)
    },
    create: async (todoData: CreateTodoRequest): Promise<ApiResponse<CreateTodoResponse>> => {
      const token = await getToken()
      return todosAPI.create(token, todoData)
    },
    update: async (
      todoId: string,
      updateData: UpdateTodoRequest
    ): Promise<ApiResponse<TodoItem>> => {
      const token = await getToken()
      return todosAPI.update(token, todoId, updateData)
    },
    delete: async (todoId: string): Promise<ApiResponse<void>> => {
      const token = await getToken()
      return todosAPI.delete(token, todoId)
    },
  }
}

