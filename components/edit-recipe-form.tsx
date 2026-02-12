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
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { useAuthenticatedRecipesAPI } from '@/src/lib/api/recipes'
import { MealTimingEnum, type RecipeWithDetails, type UpdateRecipeRequest } from '@/src/lib/api/types/recipes'

const editRecipeSchema = z.object({
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

type EditRecipeFormData = z.infer<typeof editRecipeSchema>

interface EditRecipeFormProps {
  children: React.ReactNode
  open: boolean
  onOpenChange: (open: boolean) => void
  recipe: RecipeWithDetails
}

const mealTimingOptions = [
  { value: MealTimingEnum.BREAKFAST, label: 'Breakfast' },
  { value: MealTimingEnum.LUNCH, label: 'Lunch' },
  { value: MealTimingEnum.DINNER, label: 'Dinner' },
  { value: MealTimingEnum.SNACK, label: 'Snack' },
]

const normalizeMealTimings = (timings?: Array<string | MealTimingEnum>): MealTimingEnum[] => {
  const allowed = new Set(Object.values(MealTimingEnum))
  return (timings ?? [])
    .map((timing) => timing.toString().trim().toUpperCase())
    .filter((timing): timing is MealTimingEnum => allowed.has(timing as MealTimingEnum))
}

export function EditRecipeForm({ children, open, onOpenChange, recipe }: EditRecipeFormProps) {
  const queryClient = useQueryClient()
  const apiClient = useAuthenticatedRecipesAPI()

  const form = useForm<EditRecipeFormData>({
    resolver: zodResolver(editRecipeSchema),
    defaultValues: {
      nameOfTheRecipe: recipe.nameOfTheRecipe,
      generalDescriptionOfTheRecipe: recipe.generalDescriptionOfTheRecipe ?? '',
      whenIsItConsumed: normalizeMealTimings(recipe.whenIsItConsumed),
    },
  })
  const selectedTimings = normalizeMealTimings(form.watch('whenIsItConsumed'))

  useEffect(() => {
    if (open) {
      form.reset({
        nameOfTheRecipe: recipe.nameOfTheRecipe,
        generalDescriptionOfTheRecipe: recipe.generalDescriptionOfTheRecipe ?? '',
        whenIsItConsumed: normalizeMealTimings(recipe.whenIsItConsumed),
      })
    }
  }, [open, recipe, form])

  const updateRecipeMutation = useMutation({
    mutationFn: async (data: EditRecipeFormData) => {
      const recipeData: UpdateRecipeRequest = {
        recipeId: recipe.id,
        nameOfTheRecipe: data.nameOfTheRecipe.trim(),
      }

      const description = data.generalDescriptionOfTheRecipe?.trim()
      if (description) {
        recipeData.generalDescriptionOfTheRecipe = description
      }

      // Always send timing selection so users can also clear all timings.
      recipeData.whenIsItConsumed = data.whenIsItConsumed ?? []

      return apiClient.update(recipeData)
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['recipe', recipe.id] })
      queryClient.invalidateQueries({ queryKey: ['recipes'] })
      onOpenChange(false)
      toast.success('Recipe updated successfully', {
        description: `${data.data?.nameOfTheRecipe} was saved.`,
      })
    },
    onError: (error) => {
      console.error('Failed to update recipe:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      toast.error('Failed to update recipe', {
        description: `Error: ${errorMessage}`,
      })
    },
  })

  const onSubmit = (data: EditRecipeFormData) => {
    updateRecipeMutation.mutate(data)
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerTrigger asChild>{children}</DrawerTrigger>
      <DrawerContent className="data-[vaul-drawer-direction=bottom]:mt-0 max-h-[85dvh] data-[vaul-drawer-direction=bottom]:max-h-[85dvh] overflow-hidden">
        <div className="mx-auto w-full max-w-sm overflow-y-auto overflow-x-hidden">
          <DrawerHeader className="space-y-1.5 pb-2 text-center">
            <DrawerTitle className="text-xl text-[var(--flow-text)]">Edit Recipe</DrawerTitle>
            <DrawerDescription className="text-[var(--flow-text-muted)]">
              Update your recipe details. Ingredients and instructions are edited in their own sections.
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
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-[var(--flow-text)]">When is it consumed? (Optional)</FormLabel>
                    <FormDescription className="mb-2 text-xs text-[var(--flow-text-muted)]">
                      Select all that apply
                    </FormDescription>
                    <div className="grid grid-cols-2 gap-1.5">
                      {mealTimingOptions.map((option) => (
                        <FormItem
                          key={option.value}
                          className="flex flex-row items-center space-x-2 space-y-0 rounded-md border border-[color:var(--flow-border)] bg-[var(--flow-surface)] px-2.5 py-1.5"
                        >
                          <FormControl>
                            <Checkbox
                              checked={selectedTimings.includes(option.value)}
                              onCheckedChange={(checked) => {
                                const nextValues = checked
                                  ? selectedTimings.includes(option.value)
                                    ? selectedTimings
                                    : [...selectedTimings, option.value]
                                  : selectedTimings.filter((value) => value !== option.value)

                                form.setValue('whenIsItConsumed', nextValues, {
                                  shouldDirty: true,
                                  shouldTouch: true,
                                  shouldValidate: true,
                                })
                              }}
                            />
                          </FormControl>
                          <FormLabel className="cursor-pointer text-sm font-normal text-[var(--flow-text)]">
                            {option.label}
                          </FormLabel>
                        </FormItem>
                      ))}
                    </div>
                    <input type="hidden" value={(field.value ?? []).join(',')} readOnly />
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
                    disabled={updateRecipeMutation.isPending}
                    className="border-[color:var(--flow-border)] bg-[var(--flow-surface)] text-[var(--flow-text)] hover:bg-[var(--flow-hover)]"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={updateRecipeMutation.isPending}
                    className="bg-[var(--flow-accent)]/15 text-[var(--flow-accent)] hover:bg-[var(--flow-accent)]/20"
                  >
                    {updateRecipeMutation.isPending ? (
                      <>
                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        Saving...
                      </>
                    ) : (
                      'Save Changes'
                    )}
                  </Button>
                </div>
              </DrawerFooter>
            </form>
          </Form>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
