'use client'

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
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { useAuthenticatedRecipesAPI } from '@/src/lib/api/recipes'
import { CreateRecipeRequest, MealTimingEnum } from '@/src/lib/api/types/recipes'
import { useRouter } from 'next/navigation'

// Form validation schema based on API documentation
const createRecipeSchema = z.object({
  nameOfTheRecipe: z
    .string()
    .min(1, 'Recipe name is required')
    .max(75, 'Recipe name must be less than 75 characters'),
  generalDescriptionOfTheRecipe: z
    .string()
    .max(250, 'Description must be less than 250 characters')
    .optional(),
  whenIsItConsumed: z.array(z.nativeEnum(MealTimingEnum)).optional(),
})

type CreateRecipeFormData = z.infer<typeof createRecipeSchema>

interface CreateRecipeFormProps {
  children: React.ReactNode
  open: boolean
  onOpenChange: (open: boolean) => void
}

const mealTimingOptions = [
  { value: MealTimingEnum.BREAKFAST, label: 'Breakfast' },
  { value: MealTimingEnum.LUNCH, label: 'Lunch' },
  { value: MealTimingEnum.DINNER, label: 'Dinner' },
  { value: MealTimingEnum.SNACK, label: 'Snack' },
]

export function CreateRecipeForm({ children, open, onOpenChange }: CreateRecipeFormProps) {
  const queryClient = useQueryClient()
  const apiClient = useAuthenticatedRecipesAPI()
  const router = useRouter()

  const form = useForm<CreateRecipeFormData>({
    resolver: zodResolver(createRecipeSchema),
    defaultValues: {
      nameOfTheRecipe: '',
      generalDescriptionOfTheRecipe: '',
      whenIsItConsumed: [],
    },
  })

  const createRecipeMutation = useMutation({
    mutationFn: async (data: CreateRecipeFormData) => {
      // Build the recipe data object carefully
      const recipeData: CreateRecipeRequest = {
        nameOfTheRecipe: data.nameOfTheRecipe,
      }

      // Only add optional fields if they have values
      if (data.generalDescriptionOfTheRecipe && data.generalDescriptionOfTheRecipe.trim().length > 0) {
        recipeData.generalDescriptionOfTheRecipe = data.generalDescriptionOfTheRecipe.trim()
      }
      
      // Validate data before sending
      if (!recipeData.nameOfTheRecipe || recipeData.nameOfTheRecipe.trim().length === 0) {
        throw new Error('Recipe name is required')
      }
      
      if (recipeData.nameOfTheRecipe.length > 75) {
        throw new Error('Recipe name must be less than 75 characters')
      }
      
      if (recipeData.generalDescriptionOfTheRecipe && recipeData.generalDescriptionOfTheRecipe.length > 250) {
        throw new Error('Description must be less than 250 characters')
      }
      
      return apiClient.create(recipeData)
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['recipes'] })
      onOpenChange(false)
      form.reset()
      toast.success('Recipe created successfully! 🎉', {
        description: `${data.data?.nameOfTheRecipe} has been added to your recipes.`,
      })
      
      // Navigate to the recipe detail page
      if (data.data?.id) {
        router.push(`/food/recipes/${data.data.id}`)
      }
    },
    onError: (error) => {
      console.error('Failed to create recipe:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      toast.error('Failed to create recipe', {
        description: `Error: ${errorMessage}`,
      })
    },
  })

  const onSubmit = (data: CreateRecipeFormData) => {
    createRecipeMutation.mutate(data)
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerTrigger asChild>
        {children}
      </DrawerTrigger>
      <DrawerContent className="data-[vaul-drawer-direction=bottom]:mt-0 max-h-[85dvh] data-[vaul-drawer-direction=bottom]:max-h-[85dvh] overflow-hidden">
        <div className="mx-auto w-full max-w-sm overflow-y-auto overflow-x-hidden">
          <DrawerHeader className="space-y-1.5 pb-2 text-center">
            <DrawerTitle className="text-xl text-[var(--flow-text)]">
              Create New Recipe
            </DrawerTitle>
            <DrawerDescription className="text-[var(--flow-text-muted)]">
              Create a new recipe. You can add ingredients and instructions after creation.
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
              name="nameOfTheRecipe"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-[var(--flow-text)]">Recipe Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Chocolate Chip Cookies, Caesar Salad"
                      {...field}
                      className="border-[color:var(--flow-border)] bg-[var(--flow-surface)] text-[var(--flow-text)]"
                    />
                  </FormControl>
                  <FormDescription className="text-xs text-[var(--flow-text-muted)]">
                    {field.value.length}/75 characters
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="generalDescriptionOfTheRecipe"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-[var(--flow-text)]">Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Brief description of the recipe..."
                      className="min-h-[64px] resize-none border-[color:var(--flow-border)] bg-[var(--flow-surface)] text-[var(--flow-text)]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription className="text-xs text-[var(--flow-text-muted)]">
                    {field.value?.length || 0}/250 characters
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="whenIsItConsumed"
              render={() => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-[var(--flow-text)]">When is it consumed? (Optional)</FormLabel>
                  <FormDescription className="mb-2 text-xs text-[var(--flow-text-muted)]">
                    Select all that apply
                  </FormDescription>
                  <div className="grid grid-cols-2 gap-1.5">
                    {mealTimingOptions.map((option) => (
                      <FormField
                        key={option.value}
                        control={form.control}
                        name="whenIsItConsumed"
                        render={({ field }) => {
                          return (
                            <FormItem
                              key={option.value}
                              className="flex flex-row items-center space-x-2 space-y-0 rounded-md border border-[color:var(--flow-border)] bg-[var(--flow-surface)] px-2.5 py-1.5"
                            >
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(option.value)}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([...(field.value || []), option.value])
                                      : field.onChange(
                                          field.value?.filter(
                                            (value) => value !== option.value
                                          )
                                        )
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="cursor-pointer text-sm font-normal text-[var(--flow-text)]">
                                {option.label}
                              </FormLabel>
                            </FormItem>
                          )
                        }}
                      />
                    ))}
                  </div>
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
                    disabled={createRecipeMutation.isPending}
                    className="min-w-[100px] justify-center border-[color:var(--flow-border)] bg-[var(--flow-surface)] text-[var(--flow-text)] transition-none hover:bg-[var(--flow-hover)]"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={createRecipeMutation.isPending}
                    className="min-w-[140px] justify-center bg-[var(--flow-accent)]/15 text-[var(--flow-accent)] transition-none hover:bg-[var(--flow-accent)]/20"
                  >
                    {createRecipeMutation.isPending ? (
                      <>
                        <span className="mr-2 inline-flex h-4 w-4 items-center justify-center">
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        </span>
                        Creating...
                      </>
                    ) : (
                      <>
                        <span className="mr-2 inline-flex h-4 w-4" />
                        Create Recipe
                      </>
                    )}
                  </Button>
                </div>
              </DrawerFooter>
            </form>
          </Form>

          {createRecipeMutation.isError && (
            <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
              <p className="text-sm text-destructive">
                Failed to create recipe. Please try again.
              </p>
            </div>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  )
}
