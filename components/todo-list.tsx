'use client'

import { useEffect, useRef, useState } from 'react'
import { useCompleteTodo, useCreateTodo, useTodayTodos } from '@/src/hooks/useQueries'
import type { TodoItem } from '@/src/lib/api/types/todos'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Clock, CheckCircle2, AlertCircle, Plus, Grid3X3, Check } from 'lucide-react'
import { CreateTodoForm } from './create-todo-form'
import { DomainDrawer } from './domain-drawer'

function TodoItemCard({
  todo,
  onComplete,
  isCompleting,
}: {
  todo: TodoItem
  onComplete: (todoId: string) => Promise<void>
  isCompleting: boolean
}) {
  const [translateX, setTranslateX] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const startXRef = useRef(0)
  const SWIPE_COMPLETE_THRESHOLD = 90
  const MAX_SWIPE = 140

  const formatScheduledTime = (scheduledFor?: string) => {
    if (!scheduledFor) return null
    const date = new Date(scheduledFor)
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    })
  }

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (todo.completed || isCompleting) return
    startXRef.current = event.clientX
    setIsDragging(true)
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return
    const deltaX = Math.max(0, event.clientX - startXRef.current)
    setTranslateX(Math.min(deltaX, MAX_SWIPE))
  }

  const handlePointerEnd = async (event: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return
    setIsDragging(false)
    const shouldComplete = translateX >= SWIPE_COMPLETE_THRESHOLD
    setTranslateX(0)
    event.currentTarget.releasePointerCapture(event.pointerId)
    if (shouldComplete) {
      await onComplete(todo.id)
    }
  }

  useEffect(() => {
    if (!todo.completed) return
    setTranslateX(0)
    setIsDragging(false)
  }, [todo.completed])

  return (
    <div className="relative">
      <div className="absolute inset-0 flex items-center gap-2 rounded-lg border border-transparent bg-[#10261f] px-5 text-xs uppercase tracking-[0.2em] text-[#7ed2a7]">
        <CheckCircle2 className="h-4 w-4" />
        Complete
      </div>
      <Card
        className={`relative overflow-hidden border border-white/10 bg-[#151a21] shadow-[0_10px_25px_rgba(0,0,0,0.25)] transition-all duration-200 hover:border-white/20 ${
          todo.completed ? 'opacity-70' : ''
        } before:absolute before:left-0 before:top-0 before:h-full before:w-0.5 before:bg-[#7ed2a7]`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerEnd}
        onPointerCancel={handlePointerEnd}
        style={{
          transform: `translateX(${translateX}px)`,
          transition: isDragging ? 'none' : 'transform 160ms ease',
          touchAction: 'pan-y',
        }}
      >
        <CardContent className="p-4 pl-5 sm:p-5 sm:pl-6">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                {todo.completed && <CheckCircle2 className="h-4 w-4 text-[#7ed2a7] flex-shrink-0" />}
                <p className={`text-sm font-medium leading-relaxed break-all whitespace-pre-wrap ${
                  todo.completed ? 'line-through text-white/40' : 'text-white'
                }`}>
                  {todo.description}
                </p>
              </div>
              
              {todo.context.type === 'meal' && todo.context.mealName && (
                <p className="text-xs text-white/60 mb-2">
                  Meal: {todo.context.mealName}
                  {todo.context.instructionNumber && ` (Step ${todo.context.instructionNumber})`}
                </p>
              )}
              
              {todo.scheduledFor && (
                <div className="flex items-center gap-1 text-[11px] uppercase tracking-wide text-white/60">
                  <Clock className="h-3 w-3 text-[#f3c969]" />
                  <span>{formatScheduledTime(todo.scheduledFor)}</span>
                </div>
              )}
            </div>
            
            {todo.context.estimatedDuration && (
              <div className="flex flex-col items-end gap-2">
                <span className="text-xs text-white/60">
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
  const completeTodoMutation = useCompleteTodo()
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
  const completingTodoId = completeTodoMutation.isPending ? completeTodoMutation.variables : null

  const handleCompleteTodo = async (todoId: string) => {
    if (completeTodoMutation.isPending) return
    await completeTodoMutation.mutateAsync(todoId)
  }

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Todo Items */}
      {todos.length > 0 ? (
        <div className="space-y-4">
          {todos.map((todo) => (
            <TodoItemCard
              key={todo.id}
              todo={todo}
              onComplete={handleCompleteTodo}
              isCompleting={completingTodoId === todo.id}
            />
          ))}
          <form onSubmit={handleQuickAdd}>
            <Card
              className="border-dashed border-white/15 bg-[#151a21] hover:border-[#7ed2a7]/60 transition-colors"
              ref={quickAddCardRef}
            >
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
                    <span className={`${quickIconBaseClass} border-white/20 text-white/70`}>
                      <Plus className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="text-sm font-medium text-white">Add a task</p>
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
                      <span className={`${quickIconBaseClass} border-[#7ed2a7]/50 bg-[#7ed2a7]/10 text-[#7ed2a7]`}>
                        <Check className="h-4 w-4 scale-110" />
                      </span>
                    </button>
                    <Input
                      ref={quickInputRef}
                      autoFocus
                      value={quickDescription}
                      onChange={(event) => setQuickDescription(event.target.value)}
                      placeholder="Add a task"
                      className="h-9 flex-1 border-white/10 bg-[#0f1216] text-white placeholder:text-white/40 focus-visible:ring-[#7ed2a7]/30"
                      disabled={createTodoMutation.isPending}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </form>
        </div>
      ) : (
        <div className="rounded-2xl border border-white/10 bg-[#151a21] p-6 sm:p-8 text-center space-y-4 shadow-[0_10px_25px_rgba(0,0,0,0.25)]">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-[#0f1216] px-3 py-1 text-xs uppercase tracking-[0.25em] text-[#7ed2a7]">
            Fresh day
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-white">No tasks yet</h2>
            <p className="text-sm text-white/60">
              Add one small thing and build from there.
            </p>
          </div>
          <CreateTodoForm>
            <Button className="mt-2 rounded-full px-5 bg-[#7ed2a7] text-[#0f1216] hover:bg-[#6bc795]">
              <Plus className="h-4 w-4 mr-2" />
              Create your first task
            </Button>
          </CreateTodoForm>
        </div>
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
