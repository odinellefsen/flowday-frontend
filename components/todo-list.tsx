'use client'

import { useTodayTodos } from '@/src/hooks/useQueries'
import type { TodoItem } from '@/src/lib/api/client-api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Clock, CheckCircle2, AlertCircle, Calendar, Plus } from 'lucide-react'
import { CreateTodoForm } from './create-todo-form'

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
    <Card className={`transition-all duration-200 animate-slide-up ${todo.completed ? 'opacity-60' : ''}`}>
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
  const { data, isLoading, error } = useTodayTodos()

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

  const todos = data?.todos || []
  const counts = data?.counts || { total: 0, completed: 0, remaining: 0, overdue: 0 }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Summary Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              <CardTitle>Today&apos;s Tasks</CardTitle>
            </div>
            <div className="hidden sm:block">
              <CreateTodoForm>
                <Button size="sm" variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Task
                </Button>
              </CreateTodoForm>
            </div>
          </div>
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
          <CardContent className="p-8 text-center space-y-4">
            <CheckCircle2 className="h-12 w-12 text-muted-foreground mx-auto" />
            <div className="space-y-2">
              <p className="text-muted-foreground">No tasks for today</p>
              <p className="text-sm text-muted-foreground">
                Enjoy your free time! 🌟
              </p>
            </div>
            <CreateTodoForm>
              <Button variant="outline" className="mt-4">
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Task
              </Button>
            </CreateTodoForm>
          </CardContent>
        </Card>
      )}

      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6 z-50 animate-scale-in">
        <CreateTodoForm>
          <Button
            size="lg"
            className="h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
          >
            <Plus className="h-6 w-6" />
            <span className="sr-only">Create new task</span>
          </Button>
        </CreateTodoForm>
      </div>
    </div>
  )
}
