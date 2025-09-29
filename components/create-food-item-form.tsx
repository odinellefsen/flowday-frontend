'use client'

import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Apple, Plus, X, Tag } from 'lucide-react'
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
import { Badge } from '@/components/ui/badge'
import { useApiClient } from '@/lib/api-client'
import { CreateFoodItemRequest } from '@/lib/food-types'

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

// Hierarchical category structure - each array represents a path from general to specific
const categoryHierarchies = [
  ['Food', 'Fruits', 'Citrus'],
  ['Food', 'Fruits', 'Berries'],
  ['Food', 'Fruits', 'Tropical'],
  ['Food', 'Vegetables', 'Leafy Greens'],
  ['Food', 'Vegetables', 'Root Vegetables'],
  ['Food', 'Vegetables', 'Cruciferous'],
  ['Food', 'Proteins', 'Meat'],
  ['Food', 'Proteins', 'Poultry'],
  ['Food', 'Proteins', 'Seafood'],
  ['Food', 'Proteins', 'Plant-based'],
  ['Food', 'Grains', 'Whole Grains'],
  ['Food', 'Grains', 'Refined Grains'],
  ['Food', 'Dairy', 'Milk Products'],
  ['Food', 'Dairy', 'Cheese'],
  ['Food', 'Spices & Seasonings'],
  ['Food', 'Beverages'],
  ['Food', 'Snacks'],
  ['Food', 'Condiments & Sauces'],
  ['Food', 'Oils & Fats'],
]

export function CreateFoodItemForm({ children, open, onOpenChange }: CreateFoodItemFormProps) {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const queryClient = useQueryClient()
  const apiClient = useApiClient()

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
      
      return apiClient.createFoodItem(foodItemData)
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

  const selectCategoryHierarchy = (hierarchy: string[]) => {
    setSelectedCategories(hierarchy)
  }

  const addNewCategory = () => {
    const newCategory = form.getValues('newCategory')
    if (newCategory && newCategory.trim()) {
      // Add as a single-level hierarchy
      setSelectedCategories([newCategory.trim()])
      form.setValue('newCategory', '')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto animate-scale-in">
        <DialogHeader className="space-y-3">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Apple className="h-5 w-5" />
            Create Food Item
          </DialogTitle>
          <DialogDescription>
            Create a new food item. You can add measurement units and nutritional information after creation.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="foodItemName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">Food Item Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Apple, Chicken Breast, Brown Rice"
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

            <div className="space-y-3">
              <FormLabel className="text-sm font-medium">Categories (Optional)</FormLabel>
              
              {/* Selected Category Hierarchy */}
              {selectedCategories.length > 0 && (
                <div className="p-3 bg-muted/30 rounded-md">
                  <div className="flex items-center gap-1 text-sm">
                    <span className="text-muted-foreground">Category path:</span>
                    {selectedCategories.map((category, index) => (
                      <span key={category} className="flex items-center">
                        {index > 0 && <span className="mx-1 text-muted-foreground">→</span>}
                        <Badge variant="secondary" className="text-xs">
                          {category}
                        </Badge>
                      </span>
                    ))}
                    <button
                      type="button"
                      onClick={() => setSelectedCategories([])}
                      className="ml-2 text-muted-foreground hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              )}

              {/* Hierarchical Categories */}
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">Choose a category hierarchy:</p>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {categoryHierarchies.map((hierarchy, index) => (
                    <Button
                      key={index}
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => selectCategoryHierarchy(hierarchy)}
                      className="text-xs h-auto p-2 w-full justify-start"
                    >
                      <Tag className="h-3 w-3 mr-2 flex-shrink-0" />
                      <span className="flex items-center gap-1">
                        {hierarchy.map((category, catIndex) => (
                          <span key={category} className="flex items-center">
                            {catIndex > 0 && <span className="mx-1 text-muted-foreground">→</span>}
                            <span>{category}</span>
                          </span>
                        ))}
                      </span>
                    </Button>
                  ))}
                </div>
              </div>

              {/* Custom Category Input */}
              <FormField
                control={form.control}
                name="newCategory"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Add custom category"
                          {...field}
                          className="text-sm"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={addNewCategory}
                          disabled={!field.value?.trim()}
                        >
                          Add
                        </Button>
                      </div>
                    </FormControl>
                    <FormDescription className="text-xs text-muted-foreground">
                      Create a custom category hierarchy (this will replace any selected hierarchy above)
                    </FormDescription>
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={createFoodItemMutation.isPending}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createFoodItemMutation.isPending}
                className="w-full sm:w-auto"
              >
                {createFoodItemMutation.isPending ? (
                  <>
                    <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Food Item
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>

        {createFoodItemMutation.isError && (
          <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
            <p className="text-sm text-destructive">
              Failed to create food item. Please try again.
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
