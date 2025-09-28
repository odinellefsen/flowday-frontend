'use client'

import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Clock, Plus, X } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useApiClient, type CreateTodoRequest } from '@/lib/api-client'

// Form validation schema based on API documentation
const createTodoSchema = z.object({
  description: z
    .string()
    .min(1, 'Description is required')
    .max(250, 'Description must be less than 250 characters'),
  scheduledFor: z.string().optional(),
})

type CreateTodoFormData = z.infer<typeof createTodoSchema>

interface CreateTodoFormProps {
  children: React.ReactNode
}

export function CreateTodoForm({ children }: CreateTodoFormProps) {
  const [open, setOpen] = useState(false)
  const queryClient = useQueryClient()
  const apiClient = useApiClient()

  const form = useForm<CreateTodoFormData>({
    resolver: zodResolver(createTodoSchema),
    defaultValues: {
      description: '',
      scheduledFor: '', // Use empty string to keep input controlled
    },
  })

  const createTodoMutation = useMutation({
    mutationFn: async (data: CreateTodoFormData) => {
      // Convert datetime-local format to ISO string if scheduledFor is provided
      let scheduledFor: string | undefined = undefined
      if (data.scheduledFor && typeof data.scheduledFor === 'string' && data.scheduledFor.trim() !== '') {
        // datetime-local gives us "YYYY-MM-DDTHH:mm" format in LOCAL time
        // We need to preserve the exact date/time the user selected
        // Use the proper timezone-aware conversion
        const localDate = new Date(data.scheduledFor + ':00') // Add seconds
        const offset = localDate.getTimezoneOffset() * 60000 // Get timezone offset in ms
        const utcDate = new Date(localDate.getTime() - offset) // Adjust for timezone
        scheduledFor = utcDate.toISOString()
      }

      const todoData: CreateTodoRequest = {
        description: data.description,
        ...(scheduledFor && { scheduledFor }),
      }
        
      // Validate the data before sending
      if (!todoData.description || todoData.description.trim().length === 0) {
        throw new Error('Description is required')
      }
      
      if (todoData.description.length > 250) {
        throw new Error('Description must be less than 250 characters')
      }
      
      if (todoData.scheduledFor) {
        // Validate that it's a valid ISO datetime string
        const date = new Date(todoData.scheduledFor)
        if (isNaN(date.getTime())) {
          throw new Error('Invalid scheduled date format')
        }
      }
      
      return apiClient.createTodo(todoData)
    },
    onSuccess: () => {
      // Invalidate and refetch today's todos
      queryClient.invalidateQueries({ queryKey: ['todos', 'today'] })
      setOpen(false)
      form.reset({
        description: '',
        scheduledFor: '',
      })
      toast.success('Task created successfully! 🎉', {
        description: 'Your new task has been added to today\'s schedule.',
      })
    },
    onError: (error) => {
      console.error('Failed to create todo:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      toast.error('Failed to create task', {
        description: `Error: ${errorMessage}. Please check the console for more details.`,
      })
    },
  })

  const onSubmit = (data: CreateTodoFormData) => {
    createTodoMutation.mutate(data)
  }

  const formatDateTimeLocal = (date: Date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    return `${year}-${month}-${day}T${hours}:${minutes}`
  }

  const setQuickTime = (hours: number, minutes: number = 0) => {
    const scheduledDate = new Date()
    scheduledDate.setHours(hours, minutes, 0, 0)
    
    // Always schedule for today - let the user decide if they want tomorrow
    form.setValue('scheduledFor', formatDateTimeLocal(scheduledDate))
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto animate-scale-in">
        <DialogHeader className="space-y-3">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Plus className="h-5 w-5" />
            Create New Task
          </DialogTitle>
          <DialogDescription>
            Add a new task to your daily schedule. You can set a specific time or leave it unscheduled.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">Task Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="What do you need to do?"
                      className="min-h-[80px] resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription className="text-xs text-muted-foreground">
                    {field.value.length}/250 characters
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="scheduledFor"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">Schedule (Optional)</FormLabel>
                  <FormControl>
                    <div className="space-y-3">
                      <Input
                        type="datetime-local"
                        {...field}
                        className="w-full"
                      />
                      
                      {/* Quick time buttons */}
                      <div className="space-y-2">
                        <p className="text-xs text-muted-foreground">Quick schedule:</p>
                        <div className="flex flex-wrap gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setQuickTime(9, 0)}
                            className="text-xs"
                          >
                            <Clock className="h-3 w-3 mr-1" />
                            9:00 AM
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setQuickTime(12, 0)}
                            className="text-xs"
                          >
                            <Clock className="h-3 w-3 mr-1" />
                            12:00 PM
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setQuickTime(15, 0)}
                            className="text-xs"
                          >
                            <Clock className="h-3 w-3 mr-1" />
                            3:00 PM
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setQuickTime(18, 0)}
                            className="text-xs"
                          >
                            <Clock className="h-3 w-3 mr-1" />
                            6:00 PM
                          </Button>
                          {field.value && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => form.setValue('scheduledFor', '')}
                              className="text-xs text-muted-foreground hover:text-foreground"
                            >
                              <X className="h-3 w-3 mr-1" />
                              Clear
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </FormControl>
                  <FormDescription className="text-xs text-muted-foreground">
                    {field.value ? 
                      `Scheduled for ${new Date(field.value).toLocaleString()}` : 
                      'Leave empty to create an unscheduled task'
                    }
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={createTodoMutation.isPending}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createTodoMutation.isPending}
                className="w-full sm:w-auto"
              >
                {createTodoMutation.isPending ? (
                  <>
                    <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Task
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>

        {createTodoMutation.isError && (
          <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
            <p className="text-sm text-destructive">
              Failed to create task. Please try again.
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
