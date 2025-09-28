import { QueryClient } from '@tanstack/react-query'

/**
 * Query keys factory for consistent key management
 * This helps avoid key collisions and makes invalidation easier
 */
export const queryKeys = {
  // Todo-related queries
  todos: {
    all: ["todos"] as const,
    today: () => [...queryKeys.todos.all, "today"] as const,
    byId: (id: string) => [...queryKeys.todos.all, "detail", id] as const,
    byDate: (date: string) => [...queryKeys.todos.all, "date", date] as const,
  },

  // User-related queries
  user: {
    all: ["user"] as const,
    session: () => [...queryKeys.user.all, "session"] as const,
    profile: () => [...queryKeys.user.all, "profile"] as const,
  },
} as const;

/**
 * Query key invalidation helpers
 * These make it easier to invalidate related queries after mutations
 */
export const queryInvalidation = {
  /**
   * Invalidate all todo-related queries
   */
  invalidateTodoQueries: (queryClient: QueryClient) => {
    return queryClient.invalidateQueries({
      queryKey: queryKeys.todos.all,
    });
  },

  /**
   * Invalidate today's todos specifically
   */
  invalidateTodayTodos: (queryClient: QueryClient) => {
    return queryClient.invalidateQueries({
      queryKey: queryKeys.todos.today(),
    });
  },

  /**
   * Invalidate a specific todo by ID
   */
  invalidateTodoById: (queryClient: QueryClient, todoId: string) => {
    return queryClient.invalidateQueries({
      queryKey: queryKeys.todos.byId(todoId),
    });
  },

  /**
   * Invalidate user session data
   */
  invalidateUserQueries: (queryClient: QueryClient) => {
    return queryClient.invalidateQueries({
      queryKey: queryKeys.user.all,
    });
  },
};

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes (formerly cacheTime)
      retry: (failureCount, error: unknown) => {
        // Don't retry on 401/403 errors (authentication issues)
        if (error && typeof error === 'object' && 'status' in error) {
          const status = (error as { status: number }).status
          if (status === 401 || status === 403) {
            return false
          }
        }
        return failureCount < 3
      },
    },
  },
})
