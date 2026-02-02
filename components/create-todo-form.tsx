'use client'

import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Plus } from 'lucide-react'
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
import { useCreateTodo } from '@/src/hooks/useQueries'
import type { CreateTodoRequest } from '@/src/lib/api/types/todos'

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
  const createTodoMutation = useCreateTodo()

  const form = useForm<CreateTodoFormData>({
    resolver: zodResolver(createTodoSchema),
    defaultValues: {
      description: '',
      scheduledFor: '', // Use empty string to keep input controlled
    },
  })
  const scheduledInputRef = useRef<HTMLInputElement | null>(null)

  const handleCreateTodo = async (data: CreateTodoFormData) => {
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
    
    try {
      await createTodoMutation.mutateAsync(todoData)
      setOpen(false)
      form.reset({
        description: '',
        scheduledFor: '',
      })
      toast.success('Task created successfully! 🎉', {
        description: 'Your new task has been added to today\'s schedule.',
      })
    } catch (error) {
      console.error('Failed to create todo:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      toast.error('Failed to create task', {
        description: `Error: ${errorMessage}. Please check the console for more details.`,
      })
    }
  }

  const onSubmit = (data: CreateTodoFormData) => {
    handleCreateTodo(data)
  }

  const formatDateTimeLocal = (date: Date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    return `${year}-${month}-${day}T${hours}:${minutes}`
  }

  useEffect(() => {
    if (!open) return
    const currentValue = form.getValues('scheduledFor')
    if (!currentValue) {
      form.setValue('scheduledFor', formatDateTimeLocal(new Date()), {
        shouldDirty: false,
        shouldTouch: false,
        shouldValidate: false,
      })
    }
  }, [open, form])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="w-[calc(100%-2rem)] sm:max-w-[480px] max-h-[90vh] overflow-y-auto animate-scale-in rounded-2xl p-5 sm:p-6">
        <DialogHeader className="space-y-1">
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Plus className="h-4 w-4" />
            New task
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">Task</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="What do you need to do?"
                      className="min-h-[72px] resize-none"
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
                  <FormLabel className="text-sm font-medium">Schedule</FormLabel>
                  <FormControl>
                    <div className="space-y-2">
                      <div
                        className="relative"
                        onClick={() => {
                          if (!scheduledInputRef.current) return
                          if (typeof scheduledInputRef.current.showPicker === 'function') {
                            scheduledInputRef.current.showPicker()
                          } else {
                            scheduledInputRef.current.click()
                            scheduledInputRef.current.focus()
                          }
                        }}
                      >
                        <div className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 text-sm shadow-sm transition-colors hover:bg-accent">
                          <span>
                            {field.value
                              ? new Date(field.value).toLocaleString(undefined, {
                                  month: 'short',
                                  day: 'numeric',
                                  hour: 'numeric',
                                  minute: '2-digit',
                                })
                              : 'Choose date & time (optional)'}
                          </span>
                        </div>
                        <Input
                          type="datetime-local"
                          {...field}
                          ref={(node) => {
                            scheduledInputRef.current = node
                            field.ref(node)
                          }}
                          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                        />
                      </div>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="flex-col gap-2 pt-2">
              <Button
                type="submit"
                disabled={createTodoMutation.isPending}
                className="w-full"
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
