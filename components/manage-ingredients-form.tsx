'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Utensils, Plus, X } from 'lucide-react'
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
import { useApiClient } from '@/lib/api-client'
import type { CreateRecipeIngredientsRequest } from '@/lib/recipe-types'

// Form validation schema based on API documentation
const ingredientsSchema = z.object({
  ingredients: z
    .array(
      z.object({
        ingredientText: z
          .string()
          .min(1, 'Ingredient is required')
          .max(150, 'Ingredient must be less than 150 characters'),
      })
    )
    .min(1, 'At least one ingredient is required')
    .max(50, 'Maximum 50 ingredients allowed'),
})

type IngredientsFormData = z.infer<typeof ingredientsSchema>

interface ManageIngredientsFormProps {
  children: React.ReactNode
  recipeId: string
  recipeName: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ManageIngredientsForm({ 
  children, 
  recipeId, 
  recipeName,
  open, 
  onOpenChange 
}: ManageIngredientsFormProps) {
  const queryClient = useQueryClient()
  const apiClient = useApiClient()

  const form = useForm<IngredientsFormData>({
    resolver: zodResolver(ingredientsSchema),
    defaultValues: {
      ingredients: [{ ingredientText: '' }], // Always start with empty form
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'ingredients',
  })

  const createIngredientsMutation = useMutation({
    mutationFn: async (data: IngredientsFormData) => {
      const ingredientsData: CreateRecipeIngredientsRequest = {
        recipeId,
        ingredients: data.ingredients,
      }
      
      return apiClient.createRecipeIngredients(ingredientsData)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recipe', recipeId] })
      queryClient.invalidateQueries({ queryKey: ['recipes'] })
      onOpenChange(false)
      form.reset()
      toast.success('Ingredients added successfully! 🥕', {
        description: `New ingredients have been added to ${recipeName}.`,
      })
    },
    onError: (error) => {
      console.error('Failed to add ingredients:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      toast.error('Failed to add ingredients', {
        description: `Error: ${errorMessage}`,
      })
    },
  })

  const onSubmit = (data: IngredientsFormData) => {
    createIngredientsMutation.mutate(data)
  }

  const addIngredient = () => {
    append({ ingredientText: '' })
  }

  const removeIngredient = (index: number) => {
    if (fields.length > 1) {
      remove(index)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto animate-scale-in">
        <DialogHeader className="space-y-3">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Utensils className="h-5 w-5" />
            Add Ingredients
          </DialogTitle>
          <DialogDescription>
            Add new ingredients to {recipeName}. Each ingredient should be on a separate line.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <FormLabel className="text-sm font-medium">Ingredients</FormLabel>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addIngredient}
                  disabled={fields.length >= 50}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Ingredient
                </Button>
              </div>

              <div className="space-y-3 max-h-64 overflow-y-auto">
                {fields.map((field, index) => (
                  <FormField
                    key={field.id}
                    control={form.control}
                    name={`ingredients.${index}.ingredientText`}
                    render={({ field: inputField }) => (
                      <FormItem>
                        <FormControl>
                          <div className="flex gap-2">
                            <Input
                              placeholder="e.g., 2 cups flour, 1 tsp salt, 3 large eggs"
                              {...inputField}
                              className="flex-1"
                            />
                            {fields.length > 1 && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="p-2 text-muted-foreground hover:text-destructive"
                                onClick={() => removeIngredient(index)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ))}
              </div>

              <FormDescription className="text-xs text-muted-foreground">
                Add up to 50 ingredients. Include quantities and descriptions as needed.
              </FormDescription>
            </div>

            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={createIngredientsMutation.isPending}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createIngredientsMutation.isPending || fields.length === 0}
                className="w-full sm:w-auto"
              >
                {createIngredientsMutation.isPending ? (
                  <>
                    <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Adding...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Ingredients
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>

        {createIngredientsMutation.isError && (
          <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
            <p className="text-sm text-destructive">
              Failed to add ingredients. Please try again.
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
