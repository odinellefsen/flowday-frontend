'use client'

import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Calendar, Clock, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react'
import { toast } from 'sonner'
import { useAuthenticatedHabitsAPI } from '@/src/lib/api/habits'
import type { CreateHabitBatchRequest, Weekday } from '@/src/lib/api/types/habits'
import type { MealWithDetails } from '@/src/lib/api/types/meals'

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

const formSchema = z.object({
  targetWeekday: z.enum(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']),
  targetTime: z.string().optional(),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be in YYYY-MM-DD format'),
  customizeInstructions: z.boolean(),
})

type FormValues = z.infer<typeof formSchema>

interface InstructionSchedule {
  instructionId: string
  instructionText: string
  instructionNumber: number
  scheduledWeekday: Weekday
  scheduledTime: string
}

interface CreateMealHabitFormProps {
  meal: MealWithDetails
  onSuccess?: () => void
  onCancel?: () => void
}

export function CreateMealHabitForm({ meal, onSuccess, onCancel }: CreateMealHabitFormProps) {
  const queryClient = useQueryClient()
  const habitsAPI = useAuthenticatedHabitsAPI()
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [instructionSchedules, setInstructionSchedules] = useState<InstructionSchedule[]>([])

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      targetWeekday: 'sunday',
      targetTime: '18:00',
      startDate: new Date().toISOString().split('T')[0],
      customizeInstructions: false,
    },
  })

  // Initialize instruction schedules when toggling customization
  const handleCustomizeChange = (checked: boolean) => {
    form.setValue('customizeInstructions', checked)
    
    if (checked && instructionSchedules.length === 0) {
      // Initialize with default values (same day, 30 min before main event)
      const targetTime = form.getValues('targetTime') || '18:00'
      const targetWeekday = form.getValues('targetWeekday')
      const [hours, minutes] = targetTime.split(':').map(Number)
      const prepMinutes = minutes - 30
      const prepHours = prepMinutes < 0 ? hours - 1 : hours
      const adjustedMinutes = prepMinutes < 0 ? prepMinutes + 60 : prepMinutes
      const defaultTime = `${String(prepHours).padStart(2, '0')}:${String(adjustedMinutes).padStart(2, '0')}`

      // Get all instructions from the meal
      const schedules: InstructionSchedule[] = meal.instructions.map((instruction) => ({
        instructionId: instruction.id || `${instruction.recipeId}-${instruction.instructionNumber}`,
        instructionText: instruction.instruction,
        instructionNumber: instruction.instructionNumber,
        scheduledWeekday: targetWeekday,
        scheduledTime: defaultTime,
      }))

      setInstructionSchedules(schedules)
    }
  }

  const updateInstructionSchedule = (
    index: number,
    field: 'scheduledWeekday' | 'scheduledTime',
    value: string
  ) => {
    const updated = [...instructionSchedules]
    updated[index] = { ...updated[index], [field]: value }
    setInstructionSchedules(updated)
  }

  const createHabitMutation = useMutation({
    mutationFn: async (data: CreateHabitBatchRequest) => {
      return habitsAPI.createBatch(data)
    },
    onSuccess: () => {
      toast.success('Meal habit created successfully! Todos will appear on the scheduled days.')
      queryClient.invalidateQueries({ queryKey: ['todos'] })
      form.reset()
      setInstructionSchedules([])
      onSuccess?.()
    },
    onError: (error: Error) => {
      toast.error(`Failed to create habit: ${error.message}`)
    },
  })

  const onSubmit = (values: FormValues) => {
    // Calculate default prep time (30 min before main event)
    const targetTime = values.targetTime || '18:00'
    const [hours, minutes] = targetTime.split(':').map(Number)
    const prepMinutes = minutes - 30
    const prepHours = prepMinutes < 0 ? hours - 1 : hours
    const adjustedMinutes = prepMinutes < 0 ? prepMinutes + 60 : prepMinutes
    const defaultPrepTime = `${String(prepHours).padStart(2, '0')}:${String(adjustedMinutes).padStart(2, '0')}`

    const habitData: CreateHabitBatchRequest = {
      domain: 'meal',
      entityId: meal.id,
      recurrenceType: 'weekly',
      targetWeekday: values.targetWeekday,
      targetTime: values.targetTime,
      startDate: values.startDate,
      // Backend requires at least 1 element, so provide a default entry that will trigger auto-configuration
      subEntities: [{
        scheduledWeekday: values.targetWeekday,
        scheduledTime: defaultPrepTime,
      }],
    }

    // Add custom instruction schedules if customization is enabled
    if (values.customizeInstructions && instructionSchedules.length > 0) {
      const customSchedules = instructionSchedules
        .filter((schedule) => {
          // Only include instructions that have valid UUIDs
          const instruction = meal.instructions.find(
            (inst) => inst.id === schedule.instructionId || 
                     `${inst.recipeId}-${inst.instructionNumber}` === schedule.instructionId
          )
          return instruction?.id !== undefined
        })
        .map((schedule) => ({
          subEntityId: schedule.instructionId,
          scheduledWeekday: schedule.scheduledWeekday,
          scheduledTime: schedule.scheduledTime,
        }))
      
      // If we have valid custom schedules, use them; otherwise keep the default
      if (customSchedules.length > 0) {
        habitData.subEntities = customSchedules
      }
    }

    console.log('Submitting habit data:', habitData)
    createHabitMutation.mutate(habitData)
  }

  return (
    <Card className="border-[color:var(--flow-border)] bg-[var(--flow-surface)] shadow-[var(--flow-shadow)]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-[var(--flow-text)]">
          <RefreshCw className="h-5 w-5" />
          Create Weekly Meal Habit
        </CardTitle>
        <CardDescription className="text-[var(--flow-text-muted)]">
          Set up a recurring weekly schedule for &quot;{meal.mealName}&quot;. Prep tasks will be automatically
          scheduled based on your meal&apos;s recipe instructions.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Main Event Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-[var(--flow-text-muted)]">
                <Calendar className="h-4 w-4" />
                Main Event Schedule
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="targetWeekday"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[var(--flow-text)]">Weekday</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="border-[color:var(--flow-border)] bg-[var(--flow-surface)] text-[var(--flow-text)]">
                            <SelectValue placeholder="Select weekday" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {weekdays.map((day) => (
                            <SelectItem key={day} value={day}>
                              {weekdayLabels[day]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="targetTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[var(--flow-text)]">Time (optional)</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--flow-text-muted)]" />
                          <Input
                            {...field}
                            type="time"
                            className="pl-10 border-[color:var(--flow-border)] bg-[var(--flow-surface)] text-[var(--flow-text)]"
                            placeholder="HH:MM"
                          />
                        </div>
                      </FormControl>
                      <FormDescription className="text-xs text-[var(--flow-text-muted)]">
                        24-hour format (e.g., 18:00)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[var(--flow-text)]">Start Date</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="date"
                          className="border-[color:var(--flow-border)] bg-[var(--flow-surface)] text-[var(--flow-text)]"
                        />
                      </FormControl>
                      <FormDescription className="text-xs text-[var(--flow-text-muted)]">
                        When to begin
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Advanced Configuration */}
            {meal.instructions.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <FormField
                    control={form.control}
                    name="customizeInstructions"
                    render={({ field }) => (
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={handleCustomizeChange}
                          />
                        </FormControl>
                        <FormLabel className="text-sm font-normal cursor-pointer text-[var(--flow-text)]">
                          Customize prep task schedule
                        </FormLabel>
                      </FormItem>
                    )}
                  />
                  {form.watch('customizeInstructions') && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-[var(--flow-text-muted)] hover:text-[var(--flow-text)] hover:bg-[var(--flow-hover)]"
                      onClick={() => setShowAdvanced(!showAdvanced)}
                    >
                      {showAdvanced ? (
                        <>
                          <ChevronUp className="h-4 w-4 mr-1" />
                          Hide
                        </>
                      ) : (
                        <>
                          <ChevronDown className="h-4 w-4 mr-1" />
                          Show
                        </>
                      )}
                    </Button>
                  )}
                </div>

                {form.watch('customizeInstructions') && showAdvanced && (
                  <div className="space-y-3 pl-6 border-l-2 border-[color:var(--flow-border)]">
                    <p className="text-sm text-[var(--flow-text-muted)] mb-4">
                      By default, all prep tasks are scheduled 30 minutes before the main event. 
                      Customize individual tasks below (e.g., marinate 2 days before).
                    </p>
                    {instructionSchedules.map((schedule, index) => (
                      <div
                        key={schedule.instructionId}
                        className="p-4 bg-[var(--flow-hover)] rounded-lg space-y-3"
                      >
                        <div className="flex items-start gap-2">
                          <div className="flex-shrink-0 w-6 h-6 bg-[var(--flow-accent)]/15 text-[var(--flow-accent)] rounded-full flex items-center justify-center text-xs font-semibold">
                            {schedule.instructionNumber}
                          </div>
                          <p className="text-sm flex-1 text-[var(--flow-text)]">{schedule.instructionText}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-xs text-[var(--flow-text-muted)] mb-1 block">
                              Weekday
                            </label>
                            <Select
                              value={schedule.scheduledWeekday}
                              onValueChange={(value) =>
                                updateInstructionSchedule(index, 'scheduledWeekday', value)
                              }
                            >
                              <SelectTrigger className="h-9 border-[color:var(--flow-border)] bg-[var(--flow-surface)] text-[var(--flow-text)]">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {weekdays.map((day) => (
                                  <SelectItem key={day} value={day}>
                                    {weekdayLabels[day]}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <label className="text-xs text-[var(--flow-text-muted)] mb-1 block">
                              Time
                            </label>
                            <Input
                              type="time"
                              value={schedule.scheduledTime}
                              onChange={(e) =>
                                updateInstructionSchedule(index, 'scheduledTime', e.target.value)
                              }
                              className="h-9 border-[color:var(--flow-border)] bg-[var(--flow-surface)] text-[var(--flow-text)]"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Info Box */}
            <div className="p-4 rounded-lg border border-[color:var(--flow-border)] bg-[var(--flow-hover)]">
              <p className="text-sm text-[var(--flow-text-muted)]">
                <strong>Note:</strong> Todos will be generated automatically when you view your todo list 
                on the scheduled days. The system will create prep tasks and a main &quot;Eat: {meal.mealName}&quot; 
                todo every week.
              </p>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3">
              {onCancel && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                  className="border-[color:var(--flow-border)] bg-[var(--flow-surface)] text-[var(--flow-text)] hover:bg-[var(--flow-hover)]"
                >
                  Cancel
                </Button>
              )}
              <Button
                type="submit"
                disabled={createHabitMutation.isPending}
                className="bg-[var(--flow-accent)]/15 text-[var(--flow-accent)] hover:bg-[var(--flow-accent)]/20"
              >
                {createHabitMutation.isPending ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Create Habit
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}

