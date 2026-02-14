'use client'

import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { ChefHat, Plus, Search } from 'lucide-react'
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
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { useAuthenticatedMealsAPI } from '@/src/lib/api/meals'
import { useAuthenticatedRecipesAPI } from '@/src/lib/api/recipes'
import { AttachRecipesToMealRequest } from '@/src/lib/api/types/meals'
import { Skeleton } from '@/components/ui/skeleton'

// Form validation schema based on API documentation
const attachRecipesSchema = z.object({
  recipeIds: z.array(z.string().uuid()).min(1, 'Select at least one recipe'),
})

type AttachRecipesFormData = z.infer<typeof attachRecipesSchema>

interface AttachRecipesFormProps {
  children: React.ReactNode
  open: boolean
  onOpenChange: (open: boolean) => void
  mealId: string
  mealName: string
}

export function AttachRecipesForm({ 
  children, 
  open, 
  onOpenChange,
  mealId,
  mealName 
}: AttachRecipesFormProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const queryClient = useQueryClient()
  const mealsApiClient = useAuthenticatedMealsAPI()
  const recipesApiClient = useAuthenticatedRecipesAPI()

  const form = useForm<AttachRecipesFormData>({
    resolver: zodResolver(attachRecipesSchema),
    defaultValues: {
      recipeIds: [],
    },
  })

  // Fetch available recipes
  const { data: recipesData, isLoading: isLoadingRecipes } = useQuery({
    queryKey: ['recipes'],
    queryFn: recipesApiClient.list,
    enabled: open, // Only fetch when dialog is open
  })

  const recipes = recipesData?.data || []

  // Filter recipes based on search query
  const filteredRecipes = recipes.filter((recipe) =>
    recipe.nameOfTheRecipe.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const attachRecipesMutation = useMutation({
    mutationFn: async (data: AttachRecipesFormData) => {
      const attachData: AttachRecipesToMealRequest = {
        recipeIds: data.recipeIds,
      }

      // Validate data
      if (!attachData.recipeIds || attachData.recipeIds.length === 0) {
        throw new Error('Please select at least one recipe')
      }

      return mealsApiClient.attachRecipes(mealId, attachData)
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['meal', mealId] })
      queryClient.invalidateQueries({ queryKey: ['meals'] })
      onOpenChange(false)
      form.reset()
      setSearchQuery('')
      
      const count = data.data?.mealRecipe.recipes.length || 0
      toast.success(`${count} recipe${count !== 1 ? 's' : ''} attached successfully`, {
        description: `Recipes have been added to ${mealName}.`,
      })
    },
    onError: (error) => {
      console.error('Failed to attach recipes:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      toast.error('Failed to attach recipes', {
        description: `Error: ${errorMessage}`,
      })
    },
  })

  const onSubmit = (data: AttachRecipesFormData) => {
    attachRecipesMutation.mutate(data)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto animate-scale-in">
        <DialogHeader className="space-y-3">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <ChefHat className="h-5 w-5" />
            Attach Recipes to {mealName}
          </DialogTitle>
          <DialogDescription>
            Select one or more recipes to add to this meal plan.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search recipes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Recipe Selection */}
            <FormField
              control={form.control}
              name="recipeIds"
              render={() => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">Select Recipes</FormLabel>
                  <FormDescription className="text-xs text-muted-foreground mb-3">
                    Choose recipes to add to this meal (at least 1 required)
                  </FormDescription>
                  
                  {isLoadingRecipes ? (
                    <div className="space-y-2">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="flex items-center space-x-3 p-3 border rounded-md">
                          <Skeleton className="h-4 w-4" />
                          <div className="flex-1 space-y-2">
                            <Skeleton className="h-4 w-48" />
                            <Skeleton className="h-3 w-32" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : filteredRecipes.length === 0 ? (
                    <div className="text-center py-8 border rounded-md">
                      <ChefHat className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-sm font-semibold mb-2">
                        {searchQuery ? 'No recipes found' : 'No recipes available'}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {searchQuery 
                          ? 'Try a different search term'
                          : 'Create some recipes first before attaching them to meals'
                        }
                      </p>
                    </div>
                  ) : (
                    <div className="max-h-[300px] overflow-y-auto space-y-2 border rounded-md p-2">
                      {filteredRecipes.map((recipe) => (
                        <FormField
                          key={recipe.id}
                          control={form.control}
                          name="recipeIds"
                          render={({ field }) => {
                            return (
                              <FormItem
                                key={recipe.id}
                                className="flex flex-row items-start space-x-3 space-y-0 p-3 hover:bg-muted/50 rounded-md transition-colors"
                              >
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(recipe.id)}
                                    onCheckedChange={(checked) => {
                                      return checked
                                        ? field.onChange([...(field.value || []), recipe.id])
                                        : field.onChange(
                                            field.value?.filter((value) => value !== recipe.id)
                                          )
                                    }}
                                  />
                                </FormControl>
                                <div className="flex-1 space-y-1">
                                  <FormLabel className="text-sm font-normal cursor-pointer">
                                    {recipe.nameOfTheRecipe}
                                  </FormLabel>
                                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <span>{recipe.ingredientCount} ingredients</span>
                                    <span>•</span>
                                    <span>{recipe.stepCount} steps</span>
                                    {recipe.completeness === 'complete' ? (
                                      <Badge variant="default" className="text-xs ml-1">
                                        Complete
                                      </Badge>
                                    ) : (
                                      <Badge variant="outline" className="text-xs ml-1">
                                        Incomplete
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              </FormItem>
                            )
                          }}
                        />
                      ))}
                    </div>
                  )}
                  <FormMessage />
                  
                  {/* Selected count */}
                  {form.watch('recipeIds').length > 0 && (
                    <div className="mt-2 text-xs text-muted-foreground">
                      {form.watch('recipeIds').length} recipe{form.watch('recipeIds').length !== 1 ? 's' : ''} selected
                    </div>
                  )}
                </FormItem>
              )}
            />

            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  onOpenChange(false)
                  form.reset()
                  setSearchQuery('')
                }}
                disabled={attachRecipesMutation.isPending}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={attachRecipesMutation.isPending || form.watch('recipeIds').length === 0}
                className="w-full sm:w-auto"
              >
                {attachRecipesMutation.isPending ? (
                  <>
                    <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Attaching...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Attach {form.watch('recipeIds').length > 0 ? `(${form.watch('recipeIds').length})` : 'Recipes'}
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>

        {attachRecipesMutation.isError && (
          <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
            <p className="text-sm text-destructive">
              Failed to attach recipes. Please try again.
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

