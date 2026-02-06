"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys, queryInvalidation } from "@/src/lib/query-client";
import { useAuthenticatedTodosAPI } from "@/src/lib/api/todos";
import type {
  TodayTodosResponse,
  CreateTodoRequest,
  CreateTodoResponse,
  TodoItem,
} from "@/src/lib/api/types/todos";

/**
 * Hook to fetch today's todos for the authenticated user
 */
export function useTodayTodos() {
  const api = useAuthenticatedTodosAPI();

  return useQuery<TodayTodosResponse>({
    queryKey: queryKeys.todos.today(),
    queryFn: async () => {
      const response = await api.getToday();
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to fetch today\'s todos');
      }
      return response.data;
    },
    staleTime: 1000 * 60 * 2, // 2 minutes - todos change frequently
    refetchInterval: 1000 * 60 * 5, // Refetch every 5 minutes
  });
}

/**
 * Hook to create a new todo
 */
export function useCreateTodo() {
  const queryClient = useQueryClient();
  const api = useAuthenticatedTodosAPI();

  return useMutation({
    mutationFn: async (todoData: CreateTodoRequest): Promise<CreateTodoResponse> => {
      const response = await api.create(todoData);
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to create todo');
      }
      return response.data;
    },
    onSuccess: () => {
      // Invalidate and refetch today's todos
      queryInvalidation.invalidateTodayTodos(queryClient);
    },
    onError: (error) => {
      console.error('Failed to create todo:', error);
    },
  });
}

/**
 * Hook to update a todo (mark as completed, edit description, etc.)
 */
export function useUpdateTodo() {
  const queryClient = useQueryClient();
  const api = useAuthenticatedTodosAPI();

  return useMutation({
    mutationFn: async ({
      todoId,
      updateData,
    }: {
      todoId: string;
      updateData: Partial<Pick<TodoItem, 'completed' | 'description' | 'scheduledFor'>>;
    }): Promise<TodoItem> => {
      const response = await api.update(todoId, updateData);
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to update todo');
      }
      return response.data;
    },
    onSuccess: (updatedTodo) => {
      // Invalidate today's todos and the specific todo
      queryInvalidation.invalidateTodayTodos(queryClient);
      queryInvalidation.invalidateTodoById(queryClient, updatedTodo.id);
    },
    onError: (error) => {
      console.error('Failed to update todo:', error);
    },
  });
}

/**
 * Hook to delete a todo
 */
export function useDeleteTodo() {
  const queryClient = useQueryClient();
  const api = useAuthenticatedTodosAPI();

  return useMutation({
    mutationFn: async (todoId: string): Promise<void> => {
      const response = await api.delete(todoId);
      if (!response.success) {
        throw new Error(response.message || 'Failed to delete todo');
      }
    },
    onSuccess: () => {
      // Invalidate today's todos
      queryInvalidation.invalidateTodayTodos(queryClient);
    },
    onError: (error) => {
      console.error('Failed to delete todo:', error);
    },
  });
}

/**
 * Hook to complete a todo
 */
export function useCompleteTodo() {
  const queryClient = useQueryClient();
  const api = useAuthenticatedTodosAPI();

  return useMutation({
    mutationFn: async (todoId: string) => {
      const response = await api.complete(todoId);
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to complete todo');
      }
      return response.data;
    },
    onSuccess: (_completedTodo, todoId) => {
      queryInvalidation.invalidateTodayTodos(queryClient);
      queryInvalidation.invalidateTodoById(queryClient, todoId);
    },
    onError: (error) => {
      console.error('Failed to complete todo:', error);
    },
  });
}

/**
 * Hook to toggle todo completion status
 */
export function useToggleTodo() {
  const updateTodo = useUpdateTodo();

  return useMutation({
    mutationFn: async ({ todoId, completed }: { todoId: string; completed: boolean }) => {
      return updateTodo.mutateAsync({
        todoId,
        updateData: { completed },
      });
    },
    onError: (error) => {
      console.error('Failed to toggle todo:', error);
    },
  });
}
