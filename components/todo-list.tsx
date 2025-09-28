'use client'

import { useQuery } from '@tanstack/react-query'
import { useApiClient, type TodoItem } from '@/lib/api-client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Clock, CheckCircle2, AlertCircle, Calendar } from 'lucide-react'

function TodoItemCard({ todo }: { todo: TodoItem }) {
  const getUrgencyColor = (urgency: TodoItem['urgency']) => {
    switch (urgency) {
      case 'overdue':
        return 'destructive'
      case 'now':
        return 'default'
      case 'upcoming':
        return 'secondary'
      case 'later':
        return 'outline'
      default:
        return 'outline'
    }
  }

  const getUrgencyIcon = (urgency: TodoItem['urgency']) => {
    switch (urgency) {
      case 'overdue':
        return <AlertCircle className="h-4 w-4" />
      case 'now':
        return <Clock className="h-4 w-4" />
      case 'upcoming':
        return <Calendar className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const formatScheduledTime = (scheduledFor?: string) => {
    if (!scheduledFor) return null
    const date = new Date(scheduledFor)
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    })
  }

  return (
    <Card className={`transition-all duration-200 ${todo.completed ? 'opacity-60' : ''}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              {todo.completed && <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />}
              <p className={`text-sm font-medium leading-relaxed ${
                todo.completed ? 'line-through text-muted-foreground' : ''
              }`}>
                {todo.description}
              </p>
            </div>
            
            {todo.context.type === 'meal' && todo.context.mealName && (
              <p className="text-xs text-muted-foreground mb-2">
                Meal: {todo.context.mealName}
                {todo.context.instructionNumber && ` (Step ${todo.context.instructionNumber})`}
              </p>
            )}
            
            {todo.scheduledFor && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>{formatScheduledTime(todo.scheduledFor)}</span>
              </div>
            )}
          </div>
          
          <div className="flex flex-col items-end gap-2">
            <Badge variant={getUrgencyColor(todo.urgency)} className="text-xs">
              <span className="flex items-center gap-1">
                {getUrgencyIcon(todo.urgency)}
                {todo.urgency}
              </span>
            </Badge>
            
            {todo.context.estimatedDuration && (
              <span className="text-xs text-muted-foreground">
                ~{todo.context.estimatedDuration}min
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function TodoListSkeleton() {
  return (
    <div className="space-y-3">
      {[...Array(5)].map((_, i) => (
        <Card key={i}>
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-3 w-2/3" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-3 w-12" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export function TodoList() {
  const apiClient = useApiClient()
  
  const { data, isLoading, error } = useQuery({
    queryKey: ['todos', 'today'],
    queryFn: apiClient.getTodayTodos,
    refetchInterval: 1000 * 60 * 5, // Refetch every 5 minutes
  })

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Today&apos;s Tasks
            </CardTitle>
            <CardDescription>Loading your tasks for today...</CardDescription>
          </CardHeader>
        </Card>
        <TodoListSkeleton />
      </div>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            Error Loading Tasks
          </CardTitle>
          <CardDescription>
            {error instanceof Error ? error.message : 'Failed to load your tasks. Please try again.'}
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  const todos = data?.data?.todos || []
  const counts = data?.data?.counts || { total: 0, completed: 0, remaining: 0, overdue: 0 }

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Today&apos;s Tasks
          </CardTitle>
          <CardDescription>
            {counts.remaining > 0 
              ? `${counts.remaining} of ${counts.total} tasks remaining`
              : counts.total > 0 
                ? `All ${counts.total} tasks completed! 🎉`
                : 'No tasks scheduled for today'
            }
          </CardDescription>
        </CardHeader>
        {counts.total > 0 && (
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="text-xs">
                Total: {counts.total}
              </Badge>
              <Badge variant="default" className="text-xs">
                Completed: {counts.completed}
              </Badge>
              <Badge variant="secondary" className="text-xs">
                Remaining: {counts.remaining}
              </Badge>
              {counts.overdue > 0 && (
                <Badge variant="destructive" className="text-xs">
                  Overdue: {counts.overdue}
                </Badge>
              )}
            </div>
          </CardContent>
        )}
      </Card>

      {/* Todo Items */}
      {todos.length > 0 ? (
        <div className="space-y-3">
          {todos.map((todo) => (
            <TodoItemCard key={todo.id} todo={todo} />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-8 text-center">
            <CheckCircle2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No tasks for today</p>
            <p className="text-sm text-muted-foreground mt-1">
              Enjoy your free time! 🌟
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
