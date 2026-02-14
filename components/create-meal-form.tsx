'use client'

import { useEffect } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer'
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
const CREATE_MEAL_DEFAULT_VALUES: CreateMealFormData = {
  mealName: '',
}
const CREATE_MEAL_DRAFT_KEY = 'draft:create-meal'

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
    defaultValues: CREATE_MEAL_DEFAULT_VALUES,
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
      sessionStorage.removeItem(CREATE_MEAL_DRAFT_KEY)
      onOpenChange(false)
      form.reset(CREATE_MEAL_DEFAULT_VALUES)
      toast.success('Meal created successfully', {
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

  useEffect(() => {
    const rawDraft = sessionStorage.getItem(CREATE_MEAL_DRAFT_KEY)
    if (!rawDraft) return

    try {
      const draft = JSON.parse(rawDraft) as Partial<CreateMealFormData>
      form.reset({
        ...CREATE_MEAL_DEFAULT_VALUES,
        ...draft,
      })
    } catch {
      sessionStorage.removeItem(CREATE_MEAL_DRAFT_KEY)
    }
  }, [form])

  useEffect(() => {
    const subscription = form.watch((values) => {
      sessionStorage.setItem(CREATE_MEAL_DRAFT_KEY, JSON.stringify(values))
    })

    return () => subscription.unsubscribe()
  }, [form])

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerTrigger asChild>
        {children}
      </DrawerTrigger>
      <DrawerContent
        data-ptr-ignore
        className="data-[vaul-drawer-direction=bottom]:mt-0 max-h-[85dvh] data-[vaul-drawer-direction=bottom]:max-h-[85dvh] overflow-hidden"
      >
        <div className="mx-auto w-full max-w-sm overflow-y-auto overflow-x-hidden overscroll-contain">
          <DrawerHeader className="space-y-1.5 pb-2 text-center">
            <DrawerTitle className="text-xl text-[var(--flow-text)]">
              Plan New Meal
            </DrawerTitle>
            <DrawerDescription className="text-[var(--flow-text-muted)]">
              Create a new meal. You can attach recipes to it after creation.
            </DrawerDescription>
          </DrawerHeader>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4 p-3 pt-2"
              style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 1rem)' }}
            >
              <FormField
                control={form.control}
                name="mealName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-[var(--flow-text)]">Meal Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., Sunday Brunch, Weeknight Dinner"
                        {...field}
                        className="border-[color:var(--flow-border)] bg-[var(--flow-surface)] text-[var(--flow-text)]"
                      />
                    </FormControl>
                    <FormDescription className="text-xs text-[var(--flow-text-muted)]">
                      {field.value.length}/100 characters
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DrawerFooter className="px-0 pt-1">
                <div className="flex justify-end gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => onOpenChange(false)}
                    disabled={createMealMutation.isPending}
                    className="min-w-[100px] justify-center border-[color:var(--flow-border)] bg-[var(--flow-surface)] text-[var(--flow-text)] transition-none hover:bg-[var(--flow-hover)]"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={createMealMutation.isPending}
                    className="min-w-[130px] justify-center bg-[var(--flow-accent)]/15 text-[var(--flow-accent)] transition-none hover:bg-[var(--flow-accent)]/20"
                  >
                    {createMealMutation.isPending ? (
                      <>
                        <span className="mr-2 inline-flex h-4 w-4 items-center justify-center">
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        </span>
                        Creating...
                      </>
                    ) : (
                      <>
                        <span className="mr-2 inline-flex h-4 w-4" />
                        Create Meal
                      </>
                    )}
                  </Button>
                </div>
              </DrawerFooter>
            </form>
          </Form>

          {createMealMutation.isError && (
            <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
              <p className="text-sm text-destructive">
                Failed to create meal. Please try again.
              </p>
            </div>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  )
}

