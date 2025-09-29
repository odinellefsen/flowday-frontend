import { useAuth } from '@clerk/nextjs'
import type { 
  CreateFoodItemRequest, 
  CreateFoodItemResponse, 
  ListFoodItemsResponse, 
  CreateFoodItemUnitRequest, 
  CreateFoodItemUnitsResponse,
  FoodItemUnit,
  ApiResponse as FoodApiResponse
} from './food-types'
import type {
  CreateRecipeRequest,
  CreateRecipeResponse,
  ListRecipesResponse,
  GetRecipeResponse,
  CreateRecipeIngredientsRequest,
  CreateRecipeIngredientsResponse,
  CreateRecipeInstructionsRequest,
  CreateRecipeInstructionsResponse,
  UpdateRecipeInstructionsRequest
} from './recipe-types'

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

  // Food Item API methods
  async listFoodItems(token: string | null): Promise<FoodApiResponse<ListFoodItemsResponse['data']>> {
    return this.makeRequest<ListFoodItemsResponse['data']>('/api/food-item', token)
  }

  async createFoodItem(token: string | null, foodItemData: CreateFoodItemRequest): Promise<FoodApiResponse<CreateFoodItemResponse['data']>> {
    return this.makeRequest<CreateFoodItemResponse['data']>('/api/food-item', token, {
      method: 'POST',
      body: JSON.stringify(foodItemData),
    })
  }

  async createFoodItemUnits(token: string | null, foodItemId: string, unitsData: CreateFoodItemUnitRequest): Promise<FoodApiResponse<CreateFoodItemUnitsResponse['data']>> {
    return this.makeRequest<CreateFoodItemUnitsResponse['data']>(`/api/food-item/${foodItemId}/units`, token, {
      method: 'POST',
      body: JSON.stringify(unitsData),
    })
  }

  async deleteFoodItem(token: string | null, foodItemName: string): Promise<FoodApiResponse<unknown>> {
    return this.makeRequest<unknown>('/api/food-item', token, {
      method: 'DELETE',
      body: JSON.stringify({ foodItemName }),
    })
  }

  async getFoodItemUnits(token: string | null, foodItemId: string): Promise<FoodApiResponse<FoodItemUnit[]>> {
    return this.makeRequest<FoodItemUnit[]>(`/api/food-item/${foodItemId}/units`, token)
  }

  // Recipe API methods
  async listRecipes(token: string | null): Promise<FoodApiResponse<ListRecipesResponse['data']>> {
    return this.makeRequest<ListRecipesResponse['data']>('/api/recipe', token)
  }

  async getRecipe(token: string | null, recipeId: string): Promise<FoodApiResponse<GetRecipeResponse['data']>> {
    return this.makeRequest<GetRecipeResponse['data']>(`/api/recipe/${recipeId}`, token)
  }

  async createRecipe(token: string | null, recipeData: CreateRecipeRequest): Promise<FoodApiResponse<CreateRecipeResponse['data']>> {
    return this.makeRequest<CreateRecipeResponse['data']>('/api/recipe', token, {
      method: 'POST',
      body: JSON.stringify(recipeData),
    })
  }

  async deleteRecipe(token: string | null, nameOfTheRecipe: string): Promise<FoodApiResponse<unknown>> {
    return this.makeRequest<unknown>('/api/recipe', token, {
      method: 'DELETE',
      body: JSON.stringify({ nameOfTheRecipe }),
    })
  }

  async createRecipeIngredients(token: string | null, ingredientsData: CreateRecipeIngredientsRequest): Promise<FoodApiResponse<CreateRecipeIngredientsResponse['data']>> {
    return this.makeRequest<CreateRecipeIngredientsResponse['data']>('/api/recipe/ingredients', token, {
      method: 'POST',
      body: JSON.stringify(ingredientsData),
    })
  }

  async createRecipeInstructions(token: string | null, instructionsData: CreateRecipeInstructionsRequest): Promise<FoodApiResponse<CreateRecipeInstructionsResponse['data']>> {
    return this.makeRequest<CreateRecipeInstructionsResponse['data']>('/api/recipe/instructions', token, {
      method: 'POST',
      body: JSON.stringify(instructionsData),
    })
  }

  async updateRecipeInstructions(
    token: string | null,
    instructionsData: UpdateRecipeInstructionsRequest
  ): Promise<FoodApiResponse<CreateRecipeInstructionsResponse['data']>> {
    return this.makeRequest<CreateRecipeInstructionsResponse['data']>(
      '/api/recipe/instructions',
      token,
      {
        method: 'PATCH',
        body: JSON.stringify(instructionsData),
      }
    )
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
    // Food Item methods
    listFoodItems: async (): Promise<FoodApiResponse<ListFoodItemsResponse['data']>> => {
      const token = await getToken()
      return apiClient.listFoodItems(token)
    },
    createFoodItem: async (foodItemData: CreateFoodItemRequest): Promise<FoodApiResponse<CreateFoodItemResponse['data']>> => {
      const token = await getToken()
      return apiClient.createFoodItem(token, foodItemData)
    },
    createFoodItemUnits: async (foodItemId: string, unitsData: CreateFoodItemUnitRequest): Promise<FoodApiResponse<CreateFoodItemUnitsResponse['data']>> => {
      const token = await getToken()
      return apiClient.createFoodItemUnits(token, foodItemId, unitsData)
    },
    deleteFoodItem: async (foodItemName: string): Promise<FoodApiResponse<unknown>> => {
      const token = await getToken()
      return apiClient.deleteFoodItem(token, foodItemName)
    },
    getFoodItemUnits: async (foodItemId: string): Promise<FoodApiResponse<FoodItemUnit[]>> => {
      const token = await getToken()
      return apiClient.getFoodItemUnits(token, foodItemId)
    },
    // Recipe methods
    listRecipes: async (): Promise<FoodApiResponse<ListRecipesResponse['data']>> => {
      const token = await getToken()
      return apiClient.listRecipes(token)
    },
    getRecipe: async (recipeId: string): Promise<FoodApiResponse<GetRecipeResponse['data']>> => {
      const token = await getToken()
      return apiClient.getRecipe(token, recipeId)
    },
    createRecipe: async (recipeData: CreateRecipeRequest): Promise<FoodApiResponse<CreateRecipeResponse['data']>> => {
      const token = await getToken()
      return apiClient.createRecipe(token, recipeData)
    },
    deleteRecipe: async (nameOfTheRecipe: string): Promise<FoodApiResponse<unknown>> => {
      const token = await getToken()
      return apiClient.deleteRecipe(token, nameOfTheRecipe)
    },
    createRecipeIngredients: async (ingredientsData: CreateRecipeIngredientsRequest): Promise<FoodApiResponse<CreateRecipeIngredientsResponse['data']>> => {
      const token = await getToken()
      return apiClient.createRecipeIngredients(token, ingredientsData)
    },
    createRecipeInstructions: async (instructionsData: CreateRecipeInstructionsRequest): Promise<FoodApiResponse<CreateRecipeInstructionsResponse['data']>> => {
      const token = await getToken()
      return apiClient.createRecipeInstructions(token, instructionsData)
    },
    updateRecipeInstructions: async (instructionsData: UpdateRecipeInstructionsRequest): Promise<FoodApiResponse<CreateRecipeInstructionsResponse['data']>> => {
      const token = await getToken()
      return apiClient.updateRecipeInstructions(token, instructionsData)
    },
  }
}
