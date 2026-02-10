'use client'

import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Apple, Plus, X } from 'lucide-react'
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
import { Badge } from '@/components/ui/badge'
import { useAuthenticatedFoodItemsAPI } from '@/src/lib/api/food-items'
import type { CreateFoodItemRequest } from '@/src/lib/api/types/food-items'

// Form validation schema based on API documentation
const createFoodItemSchema = z.object({
  foodItemName: z
    .string()
    .min(1, 'Food item name is required')
    .max(100, 'Food item name must be less than 100 characters'),
  categoryHierarchy: z.array(z.string()).optional(),
  newCategory: z.string().optional(), // For adding new categories
})

type CreateFoodItemFormData = z.infer<typeof createFoodItemSchema>

interface CreateFoodItemFormProps {
  children: React.ReactNode
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateFoodItemForm({ children, open, onOpenChange }: CreateFoodItemFormProps) {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const queryClient = useQueryClient()
  const apiClient = useAuthenticatedFoodItemsAPI()

  const form = useForm<CreateFoodItemFormData>({
    resolver: zodResolver(createFoodItemSchema),
    defaultValues: {
      foodItemName: '',
      categoryHierarchy: [],
      newCategory: '',
    },
  })

  const createFoodItemMutation = useMutation({
    mutationFn: async (data: CreateFoodItemFormData) => {
      const foodItemData: CreateFoodItemRequest = {
        foodItemName: data.foodItemName,
        categoryHierarchy: selectedCategories.length > 0 ? selectedCategories : undefined,
      }
      
      return apiClient.create(foodItemData)
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['foodItems'] })
      onOpenChange(false)
      form.reset()
      setSelectedCategories([])
      toast.success('Food item created successfully! 🎉', {
        description: `${data.data?.name} has been added to your food items.`,
      })
    },
    onError: (error) => {
      console.error('Failed to create food item:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      toast.error('Failed to create food item', {
        description: `Error: ${errorMessage}`,
      })
    },
  })

  const onSubmit = (data: CreateFoodItemFormData) => {
    createFoodItemMutation.mutate(data)
  }

  const addNewCategory = () => {
    const newCategory = form.getValues('newCategory')
    if (newCategory && newCategory.trim()) {
      // Parse comma-separated hierarchy
      const hierarchyParts = newCategory
        .split(',')
        .map(part => part.trim())
        .filter(part => part.length > 0)
      
      if (hierarchyParts.length > 0) {
        setSelectedCategories(hierarchyParts)
        form.setValue('newCategory', '')
      }
    }
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange} handleOnly disablePreventScroll={false}>
      <DrawerTrigger asChild>
        {children}
      </DrawerTrigger>
      <DrawerContent className="h-[85vh] max-h-[85vh] overflow-hidden overscroll-none">
        <div className="mx-auto h-full w-full max-w-sm overflow-y-auto overflow-x-hidden overscroll-contain">
          <DrawerHeader className="text-center">
            <DrawerTitle className="flex items-center justify-center gap-2 text-[var(--flow-text)]">
              <Apple className="h-5 w-5" />
              Create Food Item
            </DrawerTitle>
            <DrawerDescription className="text-[var(--flow-text-muted)]">
              Create a new food item. You can add measurement units and nutritional information after creation.
            </DrawerDescription>
          </DrawerHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 p-4 pb-0">
              <FormField
                control={form.control}
                name="foodItemName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-[var(--flow-text)]">Food Item Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., Apple, Chicken Breast, Brown Rice"
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

              <div className="space-y-3">
                <FormLabel className="text-sm font-medium text-[var(--flow-text)]">Categories</FormLabel>
                
                {/* Selected Category Hierarchy */}
                {selectedCategories.length > 0 && (
                  <div className="rounded-md border border-[color:var(--flow-border)] bg-[var(--flow-surface)] p-3">
                    <div className="flex items-center gap-1 text-sm">
                      <span className="text-[var(--flow-text-muted)]">Category path:</span>
                      {selectedCategories.map((category, index) => (
                        <span key={category} className="flex items-center">
                          {index > 0 && <span className="mx-1 text-[var(--flow-text-muted)]">→</span>}
                          <Badge variant="secondary" className="text-xs">
                            {category}
                          </Badge>
                        </span>
                      ))}
                      <button
                        type="button"
                        onClick={() => setSelectedCategories([])}
                        className="ml-2 text-[var(--flow-text-muted)] hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Custom Category Hierarchy Input */}
                <FormField
                  control={form.control}
                  name="newCategory"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <div className="space-y-2">
                          <div className="flex gap-2">
                            <Input
                              placeholder="e.g., Food, Fruits, Citrus (comma-separated)"
                              {...field}
                              className="text-sm border-[color:var(--flow-border)] bg-[var(--flow-surface)] text-[var(--flow-text)]"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={addNewCategory}
                              disabled={!field.value?.trim()}
                              className="border-[color:var(--flow-border)] bg-[var(--flow-surface)] text-[var(--flow-text)] hover:bg-[var(--flow-hover)]"
                            >
                              Add
                            </Button>
                          </div>
                          <div className="space-y-1 text-xs text-[var(--flow-text-muted)]">
                            <p><strong>Format:</strong> Use commas to separate hierarchy levels</p>
                            
                            {/* Live preview of hierarchy */}
                            {field.value && field.value.trim() && (
                              <div className="rounded border border-[color:var(--flow-border)] bg-[var(--flow-hover)] p-2">
                                <p className="mb-1 font-medium">Preview:</p>
                                <div className="flex items-center gap-1">
                                  {field.value.split(',').map((part, index) => (
                                    <span key={index} className="flex items-center">
                                      {index > 0 && <span className="mx-1 text-[var(--flow-text-muted)]">→</span>}
                                      <Badge variant="secondary" className="text-xs">
                                        {part.trim()}
                                      </Badge>
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            
                          </div>
                        </div>
                      </FormControl>
                      
                    </FormItem>
                  )}
                />
              </div>

              <DrawerFooter className="px-0">
                <div className="flex justify-end gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => onOpenChange(false)}
                    disabled={createFoodItemMutation.isPending}
                    className="border-[color:var(--flow-border)] bg-[var(--flow-surface)] text-[var(--flow-text)] hover:bg-[var(--flow-hover)]"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={createFoodItemMutation.isPending}
                    className="bg-[var(--flow-accent)]/15 text-[var(--flow-accent)] hover:bg-[var(--flow-accent)]/20"
                  >
                    {createFoodItemMutation.isPending ? (
                      <>
                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Plus className="mr-2 h-4 w-4" />
                        Create Food Item
                      </>
                    )}
                  </Button>
                </div>
              </DrawerFooter>
            </form>
          </Form>

          {createFoodItemMutation.isError && (
            <div className="mt-4 rounded-md border border-destructive/20 bg-destructive/10 p-3">
              <p className="text-sm text-destructive">
                Failed to create food item. Please try again.
              </p>
            </div>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  )
}
