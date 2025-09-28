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

class ApiClient {
  private baseUrl: string

  constructor(baseUrl: string = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3030') {
    this.baseUrl = baseUrl
  }

  private async makeRequest<T>(
    endpoint: string,
    token: string | null,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    }

    if (token) {
      headers.Authorization = `Bearer ${token}`
    } else {
      console.warn('No authentication token provided')
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`)
      }

      return data
    } catch (error) {
      console.error('API request failed:', error)
      throw error
    }
  }

  async getTodayTodos(token: string | null): Promise<ApiResponse<TodayTodosResponse>> {
    return this.makeRequest<TodayTodosResponse>('/api/todo/today', token)
  }

  async createTodo(token: string | null, todoData: CreateTodoRequest): Promise<ApiResponse<CreateTodoResponse>> {
    return this.makeRequest<CreateTodoResponse>('/api/todo', token, {
      method: 'POST',
      body: JSON.stringify(todoData),
    })
  }
}

export const apiClient = new ApiClient()

// Custom hook for authenticated API calls
export function useApiClient() {
  const { getToken } = useAuth()

  return {
    getTodayTodos: async (): Promise<ApiResponse<TodayTodosResponse>> => {
      const token = await getToken()
      return apiClient.getTodayTodos(token)
    },
    createTodo: async (todoData: CreateTodoRequest): Promise<ApiResponse<CreateTodoResponse>> => {
      const token = await getToken()
      return apiClient.createTodo(token, todoData)
    },
  }
}
