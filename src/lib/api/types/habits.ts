/**
 * Habits domain types
 */

export type Weekday = 
  | "monday" 
  | "tuesday" 
  | "wednesday" 
  | "thursday" 
  | "friday" 
  | "saturday" 
  | "sunday"

export interface HabitSubEntity {
  subEntityId?: string // Optional - if omitted, triggers auto-configuration
  scheduledWeekday: Weekday
  scheduledTime?: string // HH:MM format (optional)
}

// Request types
export interface CreateHabitBatchRequest {
  domain: "meal" // Only "meal" supported currently
  entityId: string // Meal ID
  recurrenceType: "weekly" // Only "weekly" supported
  targetWeekday: Weekday // Main event day
  targetTime?: string // Main event time (HH:MM, optional)
  startDate: string // When to start (YYYY-MM-DD)
  subEntities: HabitSubEntity[] // Recipe instructions to schedule (empty array = auto-add all with defaults)
}

// Response types
export interface CreateHabitBatchResponse {
  data: {
    domain: string
    userConfiguredCount: number // Number of instructions you configured
    autoAddedCount: number // Number auto-added (unconfigured instructions)
    totalSubEntityCount: number // Total prep tasks
  }
}

export interface CreateSimpleHabitRequest {
  description: string
  recurrenceType: "weekly"
  targetWeekday: Weekday
  targetTime?: string
  startDate: string
}

export interface CreateSimpleHabitResponse {
  data: {
    domain: "simple"
    description: string
  }
}

