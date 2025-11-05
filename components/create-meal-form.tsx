'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { UtensilsCrossed, Plus } from 'lucide-react'
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
import { useAuthenticatedMealsAPI } from '@/src/lib/api/meals'
import { CreateMealRequest } from '@/src/lib/api/types/meals'
import { useRouter } from 'next/navigation'

// Form validation schema based on API documentation
const createMealSchema = z.object({
  mealName: z
    .string()
    .min(1, 'Meal name is required')
    .max(100, 'Meal name must be less than 100 characters'),
})

type CreateMealFormData = z.infer<typeof createMealSchema>

interface CreateMealFormProps {
  children: React.ReactNode
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateMealForm({ children, open, onOpenChange }: CreateMealFormProps) {
  const queryClient = useQueryClient()
  const apiClient = useAuthenticatedMealsAPI()
  const router = useRouter()

  const form = useForm<CreateMealFormData>({
    resolver: zodResolver(createMealSchema),
    defaultValues: {
      mealName: '',
    },
  })

  const createMealMutation = useMutation({
    mutationFn: async (data: CreateMealFormData) => {
      // Build the meal data object
      const mealData: CreateMealRequest = {
        mealName: data.mealName,
      }

      // Validate data before sending
      if (!mealData.mealName || mealData.mealName.trim().length === 0) {
        throw new Error('Meal name is required')
      }

      if (mealData.mealName.length > 100) {
        throw new Error('Meal name must be less than 100 characters')
      }

      return apiClient.create(mealData)
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['meals'] })
      onOpenChange(false)
      form.reset()
      toast.success('Meal created successfully! 🎉', {
        description: `${data.data?.meal.mealName} has been added to your meals.`,
      })

      // Navigate to the meal detail page
      if (data.data?.meal.id) {
        router.push(`/food/meals/${data.data.meal.id}`)
      }
    },
    onError: (error) => {
      console.error('Failed to create meal:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      toast.error('Failed to create meal', {
        description: `Error: ${errorMessage}`,
      })
    },
  })

  const onSubmit = (data: CreateMealFormData) => {
    createMealMutation.mutate(data)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto animate-scale-in">
        <DialogHeader className="space-y-3">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <UtensilsCrossed className="h-5 w-5" />
            Plan New Meal
          </DialogTitle>
          <DialogDescription>
            Create a new meal. You can attach recipes to it after creation.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Meal Name */}
            <FormField
              control={form.control}
              name="mealName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">Meal Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Sunday Brunch, Weeknight Dinner"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription className="text-xs text-muted-foreground">
                    {field.value.length}/100 characters
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={createMealMutation.isPending}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createMealMutation.isPending}
                className="w-full sm:w-auto"
              >
                {createMealMutation.isPending ? (
                  <>
                    <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Meal
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>

        {createMealMutation.isError && (
          <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
            <p className="text-sm text-destructive">
              Failed to create meal. Please try again.
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

