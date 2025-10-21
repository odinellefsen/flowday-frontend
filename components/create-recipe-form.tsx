'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { ChefHat, Plus } from 'lucide-react'
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
  { value: MealTimingEnum.BREAKFAST, label: 'Breakfast', emoji: '🌅' },
  { value: MealTimingEnum.LUNCH, label: 'Lunch', emoji: '☀️' },
  { value: MealTimingEnum.DINNER, label: 'Dinner', emoji: '🌙' },
  { value: MealTimingEnum.SNACK, label: 'Snack', emoji: '🍿' },
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto animate-scale-in">
        <DialogHeader className="space-y-3">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <ChefHat className="h-5 w-5" />
            Create New Recipe
          </DialogTitle>
          <DialogDescription>
            Create a new recipe. You can add ingredients and instructions after creation.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Recipe Name */}
            <FormField
              control={form.control}
              name="nameOfTheRecipe"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">Recipe Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Chocolate Chip Cookies, Caesar Salad"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription className="text-xs text-muted-foreground">
                    {field.value.length}/75 characters
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Recipe Description */}
            <FormField
              control={form.control}
              name="generalDescriptionOfTheRecipe"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Brief description of the recipe..."
                      className="min-h-[80px] resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription className="text-xs text-muted-foreground">
                    {field.value?.length || 0}/250 characters
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Meal Timing */}
            <FormField
              control={form.control}
              name="whenIsItConsumed"
              render={() => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">When is it consumed? (Optional)</FormLabel>
                  <FormDescription className="text-xs text-muted-foreground mb-3">
                    Select all meal times when this recipe is typically enjoyed
                  </FormDescription>
                  <div className="grid grid-cols-2 gap-3">
                    {mealTimingOptions.map((option) => (
                      <FormField
                        key={option.value}
                        control={form.control}
                        name="whenIsItConsumed"
                        render={({ field }) => {
                          return (
                            <FormItem
                              key={option.value}
                              className="flex flex-row items-start space-x-3 space-y-0"
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
                              <FormLabel className="text-sm font-normal cursor-pointer">
                                <span className="flex items-center gap-2">
                                  <span>{option.emoji}</span>
                                  <span>{option.label}</span>
                                </span>
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

            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={createRecipeMutation.isPending}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createRecipeMutation.isPending}
                className="w-full sm:w-auto"
              >
                {createRecipeMutation.isPending ? (
                  <>
                    <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Recipe
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>

        {createRecipeMutation.isError && (
          <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
            <p className="text-sm text-destructive">
              Failed to create recipe. Please try again.
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
