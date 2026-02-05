'use client'

import { useEffect, useRef, useState } from 'react'
import { useCreateTodo, useTodayTodos } from '@/src/hooks/useQueries'
import type { TodoItem } from '@/src/lib/api/types/todos'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Clock, CheckCircle2, AlertCircle, Plus, Grid3X3, Check } from 'lucide-react'
import { CreateTodoForm } from './create-todo-form'
import { DomainDrawer } from './domain-drawer'

function TodoItemCard({ todo }: { todo: TodoItem }) {
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
    <div className="relative pl-8">
      <span
        className={`absolute left-0 top-4 flex h-5 w-5 items-center justify-center rounded-full border ${
          todo.completed
            ? 'border-emerald-500/40 bg-emerald-500/10'
            : 'border-border/60 bg-background'
        }`}
      >
        <span
          className={`h-2 w-2 rounded-full ${
            todo.completed ? 'bg-emerald-500' : 'bg-muted-foreground/60'
          }`}
        />
      </span>
      <Card
        className={`group relative overflow-hidden border-border/60 bg-background/80 transition-all duration-200 hover:border-border hover:bg-background ${
          todo.completed ? 'opacity-70' : ''
        }`}
      >
        <CardContent className="p-4 sm:p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                {todo.completed && <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0" />}
                <p
                  className={`text-sm font-medium leading-relaxed break-all whitespace-pre-wrap ${
                    todo.completed ? 'line-through text-muted-foreground' : ''
                  }`}
                >
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
                <div className="flex items-center gap-1 text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span>{formatScheduledTime(todo.scheduledFor)}</span>
                </div>
              )}
            </div>

            {todo.context.estimatedDuration && (
              <div className="flex flex-col items-end gap-2">
                <span className="text-xs text-muted-foreground">
                  ~{todo.context.estimatedDuration}min
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export function TodoList() {
  const { data, error } = useTodayTodos()
  const createTodoMutation = useCreateTodo()
  const [quickDescription, setQuickDescription] = useState('')
  const [showQuickInput, setShowQuickInput] = useState(false)
  const quickInputRef = useRef<HTMLInputElement | null>(null)
  const quickAddCardRef = useRef<HTMLDivElement | null>(null)
  const quickIconBaseClass =
    "flex size-9 items-center justify-center rounded-full border border-dashed shadow-sm box-border"

  const handleQuickAdd = async (event: React.FormEvent) => {
    event.preventDefault()
    const trimmed = quickDescription.trim()
    if (!trimmed) return
    await createTodoMutation.mutateAsync({ description: trimmed })
    setQuickDescription('')
    setShowQuickInput(false)
  }

  useEffect(() => {
    if (!showQuickInput) return
    const handlePointerDown = (event: PointerEvent) => {
      if (!quickAddCardRef.current) return
      if (quickAddCardRef.current.contains(event.target as Node)) return
      setShowQuickInput(false)
    }
    document.addEventListener('pointerdown', handlePointerDown)
    return () => document.removeEventListener('pointerdown', handlePointerDown)
  }, [showQuickInput])

  useEffect(() => {
    if (!showQuickInput) return
    const focusId = window.setTimeout(() => {
      quickInputRef.current?.focus()
    }, 0)
    return () => window.clearTimeout(focusId)
  }, [showQuickInput])

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
  const totalCount = todos.length
  const completedCount = todos.filter((todo) => todo.completed).length
  const remainingCount = totalCount - completedCount
  const completionPercent = totalCount ? Math.round((completedCount / totalCount) * 100) : 0
  const todayLabel = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })

  return (
    <div className="space-y-8 animate-fade-in">
      <section className="rounded-2xl border border-border/60 bg-background/70 p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground">Today</p>
            <h2 className="text-2xl sm:text-3xl font-semibold">Focus list</h2>
            <p className="text-sm text-muted-foreground">Small steps, steady pace.</p>
          </div>
          <div className="text-left sm:text-right">
            <p className="text-xs text-muted-foreground">{todayLabel}</p>
            <p className="text-sm font-medium">
              {remainingCount} remaining · {completedCount} done
            </p>
          </div>
        </div>
        <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-muted/40">
          <div
            className="h-full rounded-full bg-primary/70 transition-all"
            style={{ width: `${completionPercent}%` }}
          />
        </div>
      </section>

      {/* Todo Items */}
      {todos.length > 0 ? (
        <div className="relative space-y-4 before:absolute before:left-[10px] before:top-3 before:bottom-6 before:w-px before:bg-border/60">
          {todos.map((todo) => (
            <TodoItemCard key={todo.id} todo={todo} />
          ))}
          <form onSubmit={handleQuickAdd}>
            <div className="relative pl-8" ref={quickAddCardRef}>
              <span className="absolute left-0 top-4 flex h-5 w-5 items-center justify-center rounded-full border border-dashed border-muted-foreground/60 bg-background">
                <span className="h-2 w-2 rounded-full bg-muted-foreground/60" />
              </span>
              <Card className="border-dashed bg-muted/20 transition-colors hover:bg-muted/30">
                <CardContent className="p-3 min-h-[72px]">
                  {!showQuickInput ? (
                    <button
                      type="button"
                      onClick={() => {
                        setShowQuickInput(true)
                        requestAnimationFrame(() => quickInputRef.current?.focus())
                      }}
                      className="flex w-full items-center gap-3 text-left"
                    >
                      <span className={`${quickIconBaseClass} border-muted-foreground/50 text-muted-foreground`}>
                        <Plus className="h-4 w-4" />
                      </span>
                      <div>
                        <p className="text-sm font-medium">Add a task</p>
                      </div>
                    </button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <button
                        type="submit"
                        disabled={createTodoMutation.isPending || !quickDescription.trim()}
                        className="p-0 transition active:scale-95 disabled:opacity-50"
                        aria-label="Add a task"
                      >
                        <span className={`${quickIconBaseClass} border-primary/40 bg-primary/10 text-primary`}>
                          <Check className="h-4 w-4 scale-110" />
                        </span>
                      </button>
                      <Input
                        ref={quickInputRef}
                        autoFocus
                        value={quickDescription}
                        onChange={(event) => setQuickDescription(event.target.value)}
                        placeholder="Add a task"
                        className="h-9 flex-1"
                        disabled={createTodoMutation.isPending}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </form>
        </div>
      ) : (
        <Card className="border-dashed bg-muted/10">
          <CardContent className="p-8 text-center space-y-4">
            <CheckCircle2 className="h-12 w-12 text-muted-foreground mx-auto" />
            <div className="space-y-2">
              <p className="text-muted-foreground">No tasks for today</p>
              <p className="text-sm text-muted-foreground">
                Enjoy your free time! 🌟
              </p>
            </div>
            <CreateTodoForm>
              <Button variant="outline" className="mt-2">
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
        
      </div>
    </div>
  )
}
