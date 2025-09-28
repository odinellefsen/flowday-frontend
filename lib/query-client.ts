import { QueryClient } from '@tanstack/react-query'
import { queryClient as newQueryClient } from '@/src/lib/query-client'

// Re-export the new query client for backward compatibility
export const queryClient = newQueryClient
