'use client'

import { useTodayTodos } from '@/src/hooks/useQueries'
import type { TodoItem } from '@/src/lib/api/types/todos'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Clock, CheckCircle2, AlertCircle, Calendar, Plus, Grid3X3 } from 'lucide-react'
import { CreateTodoForm } from './create-todo-form'
import { DomainDrawer } from './domain-drawer'

function TodoItemCard({ todo }: { todo: TodoItem }) {
  const getUrgencyStyles = (urgency: TodoItem['urgency']) => {
    switch (urgency) {
      case 'overdue':
        return 'border-destructive/30 bg-destructive/10 text-destructive'
      case 'now':
        return 'border-primary/30 bg-primary/10 text-primary'
      case 'upcoming':
        return 'border-amber-500/30 bg-amber-500/10 text-amber-700'
      case 'later':
        return 'border-muted bg-muted text-muted-foreground'
      default:
        return 'border-muted bg-muted text-muted-foreground'
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
            <div
              className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${getUrgencyStyles(
                todo.urgency
              )}`}
            >
              {getUrgencyIcon(todo.urgency)}
              <span>{todo.urgency}</span>
            </div>
            
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

export function TodoList() {
  const { data, error } = useTodayTodos()

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

  return (
    <div className="space-y-6 animate-fade-in">
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

      {/* Floating Action Buttons */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 animate-scale-in">
        {/* Domain Drawer Button */}
        <DomainDrawer>
          <Button
            size="lg"
            variant="secondary"
            className="h-12 w-12 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
          >
            <Grid3X3 className="h-5 w-5" />
            <span className="sr-only">Explore domains</span>
          </Button>
        </DomainDrawer>
        
        {/* Create Todo Button */}
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
