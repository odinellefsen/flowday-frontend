'use client'

import { useEffect, useRef, useState } from 'react'
import { useCancelTodo, useCompleteTodo, useCreateTodo, useDeleteHabit, useTodayTodos } from '@/src/hooks/useQueries'
import type { TodoItem } from '@/src/lib/api/types/todos'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Clock, CheckCircle2, AlertCircle, Plus, Grid3X3, Check, Repeat, Hand, Ban } from 'lucide-react'
import {
  Dialog,
  DialogOverlay,
  DialogPortal,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { DomainDrawer } from './domain-drawer'
import { SimpleHabitDrawer } from './simple-habit-drawer'
import { toast } from 'sonner'

function TodoItemCard({
  todo,
  onComplete,
  onCancel,
  onStopHabit,
  isCompleting,
  isCancelling,
  isStoppingHabit,
}: {
  todo: TodoItem
  onComplete: (todoId: string) => Promise<void>
  onCancel: (todoId: string) => Promise<void>
  onStopHabit: (todo: TodoItem) => Promise<void>
  isCompleting: boolean
  isCancelling: boolean
  isStoppingHabit: boolean
}) {
  const [translateX, setTranslateX] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [isPressing, setIsPressing] = useState(false)
  const [showActions, setShowActions] = useState(false)
  const startXRef = useRef(0)
  const startYRef = useRef(0)
  const dragXRef = useRef(0)
  const longPressTimerRef = useRef<number | null>(null)
  const pressFeedbackTimerRef = useRef<number | null>(null)
  const longPressTriggeredRef = useRef(false)
  const SWIPE_COMPLETE_THRESHOLD = 90
  const MAX_SWIPE = 140
  const LONG_PRESS_MS = 450
  const PRESS_FEEDBACK_MS = 160
  const LONG_PRESS_MOVE_TOLERANCE = 12
  const isBusy = isCompleting || isCancelling || isStoppingHabit
  const showSwipeBackground = isDragging && Math.abs(translateX) > 8 && !showActions && !todo.completed
  const contextMaybe = todo.context as TodoItem['context'] & { type?: string; habitId?: string }
  const todoMaybe = todo as TodoItem & { habitId?: string; recurringHabitId?: string }
  const habitId = contextMaybe.habitId || todoMaybe.habitId || todoMaybe.recurringHabitId
  const isHabitTodo = contextMaybe.type === 'habit' || Boolean(habitId)

  const formatScheduledTime = (scheduledFor?: string) => {
    if (!scheduledFor) return null
    const date = new Date(scheduledFor)
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    })
  }

  const clearLongPressTimer = () => {
    if (longPressTimerRef.current) {
      window.clearTimeout(longPressTimerRef.current)
      longPressTimerRef.current = null
    }
  }

  const clearPressFeedbackTimer = () => {
    if (pressFeedbackTimerRef.current) {
      window.clearTimeout(pressFeedbackTimerRef.current)
      pressFeedbackTimerRef.current = null
    }
  }

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (todo.completed || isBusy || showActions) return
    startXRef.current = event.clientX
    startYRef.current = event.clientY
    dragXRef.current = 0
    longPressTriggeredRef.current = false
    setIsDragging(true)
    setIsPressing(false)
    event.currentTarget.setPointerCapture(event.pointerId)
    clearLongPressTimer()
    clearPressFeedbackTimer()
    pressFeedbackTimerRef.current = window.setTimeout(() => {
      setIsPressing(true)
    }, PRESS_FEEDBACK_MS)
    longPressTimerRef.current = window.setTimeout(() => {
      longPressTriggeredRef.current = true
      dragXRef.current = 0
      setTranslateX(0)
      setIsDragging(false)
      setIsPressing(false)
      setShowActions(true)
    }, LONG_PRESS_MS)
  }

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return
    const deltaY = event.clientY - startYRef.current
    const deltaX = event.clientX - startXRef.current
    if (Math.abs(deltaX) > LONG_PRESS_MOVE_TOLERANCE || Math.abs(deltaY) > LONG_PRESS_MOVE_TOLERANCE) {
      clearLongPressTimer()
      clearPressFeedbackTimer()
      setIsPressing(false)
    }
    if (deltaX >= 0) {
      const clamped = Math.min(deltaX, MAX_SWIPE)
      dragXRef.current = clamped
      setTranslateX(clamped)
      return
    }
    const clamped = Math.max(deltaX, -MAX_SWIPE)
    dragXRef.current = clamped
    setTranslateX(clamped)
  }

  const handlePointerEnd = async (event: React.PointerEvent<HTMLDivElement>) => {
    clearLongPressTimer()
    clearPressFeedbackTimer()
    setIsPressing(false)
    if (!isDragging) return
    setIsDragging(false)
    if (longPressTriggeredRef.current) {
      longPressTriggeredRef.current = false
      setTranslateX(0)
      event.currentTarget.releasePointerCapture(event.pointerId)
      return
    }
    const deltaX = dragXRef.current
    const shouldComplete = Math.abs(deltaX) >= SWIPE_COMPLETE_THRESHOLD
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
    setIsPressing(false)
    setShowActions(false)
  }, [todo.completed])

  return (
    <div className="relative">
      <div
        className={`pointer-events-none absolute inset-0 flex items-center justify-between rounded-lg border border-transparent px-4 text-xs uppercase tracking-[0.2em] transition-opacity duration-100 ${
          showSwipeBackground ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <span className="inline-flex items-center gap-2 rounded-full bg-[var(--flow-success-bg)] px-3 py-1 text-[var(--flow-success-text)]">
          <CheckCircle2 className="h-4 w-4" />
          Complete
        </span>
        <span className="inline-flex items-center gap-2 rounded-full bg-[var(--flow-success-bg)] px-3 py-1 text-[var(--flow-success-text)]">
          <CheckCircle2 className="h-4 w-4" />
          Complete
        </span>
      </div>
      <Card
        className={`relative overflow-hidden border border-[color:var(--flow-border)] bg-[var(--flow-surface)] shadow-[var(--flow-shadow)] transition-all duration-200 hover:border-[color:var(--flow-border-hover)] ${
          todo.completed ? 'opacity-70' : ''
        } before:absolute before:left-0 before:top-0 before:h-full before:w-0.5 before:bg-[var(--flow-accent)] select-none ${
          isPressing ? 'border-[color:var(--flow-border-hover)] bg-[var(--flow-hover)]' : ''
        }`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerEnd}
        onPointerCancel={handlePointerEnd}
        onContextMenu={(event) => event.preventDefault()}
        onDragStart={(event) => event.preventDefault()}
        style={{
          transform: `translateX(${translateX}px) scale(${isPressing ? 0.985 : 1})`,
          transition: isDragging ? 'none' : 'transform 160ms ease',
          touchAction: 'pan-y',
          WebkitTapHighlightColor: 'transparent',
          WebkitUserSelect: 'none',
          WebkitTouchCallout: 'none',
          userSelect: 'none',
        }}
      >
        <CardContent className="p-4 pl-5 sm:p-5 sm:pl-6">
          {isPressing && !todo.completed && (
            <div className="mb-2 inline-flex items-center gap-1 rounded-full bg-[var(--flow-accent)]/12 px-2 py-1 text-[10px] font-medium uppercase tracking-wide text-[var(--flow-accent)]">
              <Hand className="h-3 w-3" />
              Hold for actions
            </div>
          )}
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                {todo.completed && (
                  <CheckCircle2 className="h-4 w-4 text-[var(--flow-accent)] flex-shrink-0" />
                )}
                <p className={`text-sm font-medium leading-relaxed break-all whitespace-pre-wrap ${
                  todo.completed ? 'line-through text-[var(--flow-text-muted)]' : 'text-[var(--flow-text)]'
                }`}>
                  {todo.description}
                </p>
              </div>
              
              {todo.context.type === 'meal' && todo.context.mealName && (
                <p className="text-xs text-[var(--flow-text-muted)] mb-2">
                  Meal: {todo.context.mealName}
                  {todo.context.instructionNumber && ` (Step ${todo.context.instructionNumber})`}
                </p>
              )}
              
              {todo.scheduledFor && (
                <div className="flex items-center gap-1 text-[11px] uppercase tracking-wide text-[var(--flow-text-muted)]">
                  <Clock className="h-3 w-3 text-[var(--flow-warning)]" />
                  <span>{formatScheduledTime(todo.scheduledFor)}</span>
                </div>
              )}
            </div>
            
            {todo.context.estimatedDuration && (
              <div className="flex flex-col items-end gap-2">
                <span className="text-xs text-[var(--flow-text-muted)]">
                  ~{todo.context.estimatedDuration}min
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {!todo.completed && (
        <Dialog open={showActions} onOpenChange={setShowActions}>
          <DialogPortal>
            <DialogOverlay className="bg-transparent" />
            <DialogContent
              showCloseButton={false}
              className="border-[color:var(--flow-border)] bg-[var(--flow-surface)] text-[var(--flow-text)]"
            >
              <DialogHeader>
                <DialogTitle>Todo actions</DialogTitle>
                <DialogDescription className="text-[var(--flow-text-muted)]">
                  Choose what to do with this task.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full justify-start border-[color:var(--flow-border)] bg-[var(--flow-surface)] text-[var(--flow-danger-text)] hover:bg-[var(--flow-danger-bg)] hover:text-[var(--flow-danger-text)]"
                  disabled={isBusy}
                  onClick={async () => {
                    setShowActions(false)
                    await onCancel(todo.id)
                  }}
                >
                  <Ban className="mr-2 h-3.5 w-3.5" />
                  Cancel
                </Button>
                {isHabitTodo && (
                  <Button
                    variant="outline"
                    className="w-full justify-start border-[color:var(--flow-border)] bg-[var(--flow-surface)] text-[var(--flow-text)] hover:bg-[var(--flow-hover)] hover:text-[var(--flow-text)]"
                    disabled={isBusy}
                    onClick={async () => {
                      setShowActions(false)
                      await onStopHabit(todo)
                    }}
                  >
                    <Hand className="mr-2 h-3.5 w-3.5" />
                    Stop habit
                  </Button>
                )}
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full justify-center text-[var(--flow-text-muted)] hover:bg-[var(--flow-hover)] hover:text-[var(--flow-text)]"
                  onClick={() => setShowActions(false)}
                >
                  Close
                </Button>
              </div>
            </DialogContent>
          </DialogPortal>
        </Dialog>
      )}
    </div>
  )
}

export function TodoList() {
  const { data, error } = useTodayTodos()
  const createTodoMutation = useCreateTodo()
  const completeTodoMutation = useCompleteTodo()
  const cancelTodoMutation = useCancelTodo()
  const deleteHabitMutation = useDeleteHabit()
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
  const cancellingTodoId = cancelTodoMutation.isPending ? cancelTodoMutation.variables : null
  const stoppingHabitTodoId = deleteHabitMutation.isPending ? deleteHabitMutation.variables : null

  const handleCompleteTodo = async (todoId: string) => {
    if (completeTodoMutation.isPending) return
    await completeTodoMutation.mutateAsync(todoId)
  }

  const handleCancelTodo = async (todoId: string) => {
    if (cancelTodoMutation.isPending) return
    await cancelTodoMutation.mutateAsync(todoId)
  }

  const handleStopHabitTodo = async (todo: TodoItem) => {
    const contextMaybe = todo.context as TodoItem['context'] & { habitId?: string }
    const todoMaybe = todo as TodoItem & { habitId?: string; recurringHabitId?: string }
    const habitId = contextMaybe.habitId || todoMaybe.habitId || todoMaybe.recurringHabitId

    if (!habitId) {
      toast.error('Unable to stop this habit', {
        description: 'This todo does not include a habit ID yet.',
      })
      return
    }

    try {
      await deleteHabitMutation.mutateAsync(habitId)
      toast.success('Habit stopped')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      toast.error('Failed to stop habit', {
        description: message,
      })
    }
  }

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Todo Items */}
      <div className="space-y-4">
        {todos.map((todo) => (
          <TodoItemCard
            key={todo.id}
            todo={todo}
            onComplete={handleCompleteTodo}
            onCancel={handleCancelTodo}
            onStopHabit={handleStopHabitTodo}
            isCompleting={completingTodoId === todo.id}
            isCancelling={cancellingTodoId === todo.id}
            isStoppingHabit={stoppingHabitTodoId === todo.id}
          />
        ))}
        <form onSubmit={handleQuickAdd}>
          <Card
            className="border-dashed border-[color:var(--flow-border)] bg-[var(--flow-surface)] hover:border-[color:var(--flow-border-hover)] transition-colors"
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
                  <span className={`${quickIconBaseClass} border-[color:var(--flow-border)] text-[var(--flow-text-muted)]`}>
                    <Plus className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-sm font-medium text-[var(--flow-text)]">Add a task</p>
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
                  <span
                    className={`${quickIconBaseClass} border-[color:var(--flow-border-hover)] bg-[var(--flow-hover)] text-[var(--flow-accent)]`}
                  >
                      <Check className="h-4 w-4 scale-110" />
                    </span>
                  </button>
                  <Input
                    ref={quickInputRef}
                    autoFocus
                    value={quickDescription}
                    onChange={(event) => setQuickDescription(event.target.value)}
                    placeholder="Add a task"
                    className="h-9 flex-1 border-[color:var(--flow-border)] bg-[var(--flow-background)] text-[var(--flow-text)] placeholder:text-[var(--flow-text-muted)] focus-visible:ring-[color:var(--flow-accent)]/30"
                    disabled={createTodoMutation.isPending}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </form>
      </div>

      {/* Floating Action Buttons */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 animate-scale-in">
        <SimpleHabitDrawer>
          <Button
            size="lg"
            className="h-12 w-12 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 bg-[var(--flow-accent)]/15 text-[var(--flow-accent)] hover:bg-[var(--flow-accent)]/25"
          >
            <Repeat className="h-5 w-5" />
            <span className="sr-only">Create simple habit</span>
          </Button>
        </SimpleHabitDrawer>

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
