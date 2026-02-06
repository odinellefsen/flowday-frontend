/**
 * Todo domain types
 */

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

export interface CompleteTodoResponse {
  id: string
  userId: string
}

export type UpdateTodoRequest = Partial<Pick<TodoItem, 'completed' | 'description' | 'scheduledFor'>>

