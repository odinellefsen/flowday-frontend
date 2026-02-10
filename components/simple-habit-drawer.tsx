'use client'

import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Calendar, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import { useAuthenticatedHabitsAPI } from '@/src/lib/api/habits'
import { queryInvalidation } from '@/src/lib/query-client'
import type { CreateSimpleHabitRequest, Weekday } from '@/src/lib/api/types/habits'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer'

const weekdays: Weekday[] = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
]

const weekdayLabels: Record<Weekday, string> = {
  monday: 'Monday',
  tuesday: 'Tuesday',
  wednesday: 'Wednesday',
  thursday: 'Thursday',
  friday: 'Friday',
  saturday: 'Saturday',
  sunday: 'Sunday',
}

const dayMap: Weekday[] = [
  'sunday',
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
]

type SimpleHabitRecurrenceType = 'daily' | 'weekly'

interface SimpleHabitDrawerProps {
  children: React.ReactNode
}

export function SimpleHabitDrawer({ children }: SimpleHabitDrawerProps) {
  const queryClient = useQueryClient()
  const habitsAPI = useAuthenticatedHabitsAPI()
  const [open, setOpen] = useState(false)
  const [description, setDescription] = useState('')
  const [recurrenceType, setRecurrenceType] = useState<SimpleHabitRecurrenceType>('daily')
  const [targetWeekday, setTargetWeekday] = useState<Weekday>(dayMap[new Date().getDay()])
  const [targetTime, setTargetTime] = useState('')
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0])

  const createSimpleHabitMutation = useMutation({
    mutationFn: async (habitData: CreateSimpleHabitRequest) => habitsAPI.createSimple(habitData),
    onSuccess: () => {
      toast.success('Simple habit created successfully')
      queryInvalidation.invalidateTodayTodos(queryClient)
      setDescription('')
      setRecurrenceType('daily')
      setTargetTime('')
      setTargetWeekday(dayMap[new Date().getDay()])
      setStartDate(new Date().toISOString().split('T')[0])
      setOpen(false)
    },
    onError: (error: Error) => {
      toast.error(`Failed to create habit: ${error.message}`)
    },
  })

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const trimmedDescription = description.trim()
    if (!trimmedDescription) {
      toast.error('Description is required')
      return
    }

    if (targetTime && !/^\d{2}:\d{2}$/.test(targetTime)) {
      toast.error('Time must be in HH:MM format')
      return
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(startDate)) {
      toast.error('Start date must be in YYYY-MM-DD format')
      return
    }

    const basePayload = {
      description: trimmedDescription,
      recurrenceType,
      targetTime: targetTime || undefined,
      startDate,
    }

    const payload: CreateSimpleHabitRequest =
      recurrenceType === 'weekly'
        ? { ...basePayload, recurrenceType: 'weekly', targetWeekday }
        : { ...basePayload, recurrenceType: 'daily' }

    createSimpleHabitMutation.mutate(payload)
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>{children}</DrawerTrigger>
      <DrawerContent
        data-ptr-ignore
        className="data-[vaul-drawer-direction=bottom]:mt-0 max-h-[85dvh] data-[vaul-drawer-direction=bottom]:max-h-[85dvh] overflow-hidden overscroll-none"
      >
        <div className="mx-auto w-full max-w-sm overflow-y-auto overflow-x-hidden overscroll-contain">
          <DrawerHeader className="text-center">
            <DrawerTitle className="flex items-center justify-center gap-2 text-[var(--flow-text)]">
              <Calendar className="h-5 w-5" />
              Create Simple Habit
            </DrawerTitle>
            <DrawerDescription className="text-[var(--flow-text-muted)]">
              Add a recurring habit like &quot;Brush your teeth&quot; and Flowday will auto-generate the todo.
            </DrawerDescription>
          </DrawerHeader>

          <form onSubmit={handleSubmit} className="space-y-4 overflow-x-hidden p-4 pb-0">
            <div className="space-y-2">
              <label className="text-sm font-medium text-[var(--flow-text)]" htmlFor="simple-habit-description">
                Description
              </label>
              <Textarea
                id="simple-habit-description"
                maxLength={250}
                required
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Brush your teeth"
                className="border-[color:var(--flow-border)] bg-[var(--flow-surface)] text-[var(--flow-text)]"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-[var(--flow-text)]" htmlFor="simple-habit-recurrence">
                Recurrence
              </label>
              <select
                id="simple-habit-recurrence"
                value={recurrenceType}
                onChange={(event) => setRecurrenceType(event.target.value as SimpleHabitRecurrenceType)}
                className="w-full rounded-md border border-[color:var(--flow-border)] bg-[var(--flow-surface)] px-3 py-2 text-sm text-[var(--flow-text)]"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
              </select>
            </div>

            {recurrenceType === 'weekly' && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-[var(--flow-text)]" htmlFor="simple-habit-weekday">
                  Weekday
                </label>
                <select
                  id="simple-habit-weekday"
                  value={targetWeekday}
                  onChange={(event) => setTargetWeekday(event.target.value as Weekday)}
                  className="w-full rounded-md border border-[color:var(--flow-border)] bg-[var(--flow-surface)] px-3 py-2 text-sm text-[var(--flow-text)]"
                >
                  {weekdays.map((day) => (
                    <option key={day} value={day}>
                      {weekdayLabels[day]}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium text-[var(--flow-text)]" htmlFor="simple-habit-time">
                Time (optional)
              </label>
              <Input
                id="simple-habit-time"
                type="text"
                inputMode="numeric"
                value={targetTime}
                onChange={(event) => setTargetTime(event.target.value)}
                placeholder="HH:MM"
                className="max-w-full border-[color:var(--flow-border)] bg-[var(--flow-surface)] text-[var(--flow-text)]"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-[var(--flow-text)]" htmlFor="simple-habit-start-date">
                Start date
              </label>
              <Input
                id="simple-habit-start-date"
                type="text"
                inputMode="numeric"
                required
                value={startDate}
                onChange={(event) => setStartDate(event.target.value)}
                placeholder="YYYY-MM-DD"
                className="max-w-full border-[color:var(--flow-border)] bg-[var(--flow-surface)] text-[var(--flow-text)]"
              />
            </div>

            <DrawerFooter className="px-0">
              <div className="flex justify-end gap-3">
                <DrawerClose asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className="border-[color:var(--flow-border)] bg-[var(--flow-surface)] text-[var(--flow-text)] hover:bg-[var(--flow-hover)]"
                  >
                    Cancel
                  </Button>
                </DrawerClose>
                <Button
                  type="submit"
                  disabled={createSimpleHabitMutation.isPending}
                  className="bg-[var(--flow-accent)]/15 text-[var(--flow-accent)] hover:bg-[var(--flow-accent)]/20"
                >
                  {createSimpleHabitMutation.isPending ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create Habit'
                  )}
                </Button>
              </div>
            </DrawerFooter>
          </form>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
