'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Scale, Plus, Info, ChevronDown, ChevronUp } from 'lucide-react'
import { toast } from 'sonner'
import { useState } from 'react'

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useAuthenticatedFoodItemsAPI } from '@/src/lib/api/food-items'
import { UnitOfMeasurementEnum, type CreateFoodItemUnitRequest } from '@/src/lib/api/types/food-items'

// Form validation schema
const createUnitSchema = z.object({
  unitOfMeasurement: z.nativeEnum(UnitOfMeasurementEnum),
  unitDescription: z.string().optional(),
  calories: z.number().min(0, 'Calories must be positive').max(10000, 'Calories seems too high'),
  proteinInGrams: z.number().min(0).max(1000).optional(),
  carbohydratesInGrams: z.number().min(0).max(1000).optional(),
  fatInGrams: z.number().min(0).max(1000).optional(),
  fiberInGrams: z.number().min(0).max(1000).optional(),
  sugarInGrams: z.number().min(0).max(1000).optional(),
  sodiumInMilligrams: z.number().min(0).max(10000).optional(),
  source: z.enum(['user_measured', 'package_label', 'database', 'estimated']),
})

type CreateUnitFormData = z.infer<typeof createUnitSchema>

interface CreateUnitFormProps {
  children: React.ReactNode
  foodItemId: string
  foodItemName: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

// Group units by category for better UX
const unitCategories = {
  'Weight': [
    UnitOfMeasurementEnum.GRAM,
    UnitOfMeasurementEnum.KILOGRAM,
  ],
  'Volume': [
    UnitOfMeasurementEnum.MILLILITER,
    UnitOfMeasurementEnum.LITER,
    UnitOfMeasurementEnum.TABLESPOON,
    UnitOfMeasurementEnum.TEASPOON,
  ],
  'Count': [
    UnitOfMeasurementEnum.PIECE,
    UnitOfMeasurementEnum.WHOLE,
    UnitOfMeasurementEnum.SLICE,
  ],
  'Contextual': [
    UnitOfMeasurementEnum.CLOVE,
    UnitOfMeasurementEnum.STRIP,
    UnitOfMeasurementEnum.HEAD,
    UnitOfMeasurementEnum.BUNCH,
  ],
  'Approximate': [
    UnitOfMeasurementEnum.PINCH,
    UnitOfMeasurementEnum.HANDFUL,
    UnitOfMeasurementEnum.DASH,
    UnitOfMeasurementEnum.DROP,
    UnitOfMeasurementEnum.SPLASH,
    UnitOfMeasurementEnum.SCOOP,
    UnitOfMeasurementEnum.DRIZZLE,
  ],
  'Beverage': [
    UnitOfMeasurementEnum.SHOT,
  ],
  'Flexible': [
    UnitOfMeasurementEnum.TO_TASTE,
    UnitOfMeasurementEnum.AS_NEEDED,
  ],
}

export function CreateUnitForm({ children, foodItemId, foodItemName, open, onOpenChange }: CreateUnitFormProps) {
  const queryClient = useQueryClient()
  const apiClient = useAuthenticatedFoodItemsAPI()
  const [showAdvancedNutrition, setShowAdvancedNutrition] = useState(false)

  const form = useForm<CreateUnitFormData>({
    resolver: zodResolver(createUnitSchema),
    defaultValues: {
      unitOfMeasurement: UnitOfMeasurementEnum.PIECE,
      unitDescription: '',
      calories: 0,
      proteinInGrams: 0,
      carbohydratesInGrams: 0,
      fatInGrams: 0,
      fiberInGrams: 0,
      sugarInGrams: 0,
      sodiumInMilligrams: 0,
      source: 'user_measured',
    },
  })

  const createUnitMutation = useMutation({
    mutationFn: async (data: CreateUnitFormData) => {
      const unitData: CreateFoodItemUnitRequest = {
        foodItemName,
        units: [{
          unitOfMeasurement: data.unitOfMeasurement,
          unitDescription: data.unitDescription || undefined,
          nutritionPerOfThisUnit: {
            calories: data.calories,
            proteinInGrams: data.proteinInGrams || undefined,
            carbohydratesInGrams: data.carbohydratesInGrams || undefined,
            fatInGrams: data.fatInGrams || undefined,
            fiberInGrams: data.fiberInGrams || undefined,
            sugarInGrams: data.sugarInGrams || undefined,
            sodiumInMilligrams: data.sodiumInMilligrams || undefined,
          },
          source: data.source,
        }]
      }
      
      return apiClient.createUnits(foodItemId, unitData)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['foodItemUnits', foodItemId] })
      queryClient.invalidateQueries({ queryKey: ['foodItems'] }) // Update the main list too
      onOpenChange(false)
      setShowAdvancedNutrition(false)
      form.reset()
      toast.success('Unit created successfully', {
        description: 'The measurement unit has been added to this food item.',
      })
    },
    onError: (error) => {
      console.error('Failed to create unit:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      toast.error('Failed to create unit', {
        description: `Error: ${errorMessage}`,
      })
    },
  })

  const onSubmit = (data: CreateUnitFormData) => {
    createUnitMutation.mutate(data)
  }

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setShowAdvancedNutrition(false)
    }
    onOpenChange(nextOpen)
  }

  return (
    <Drawer open={open} onOpenChange={handleOpenChange}>
      <DrawerTrigger asChild>
        {children}
      </DrawerTrigger>
      <DrawerContent className="data-[vaul-drawer-direction=bottom]:mt-0 max-h-[85dvh] data-[vaul-drawer-direction=bottom]:max-h-[85dvh] overflow-hidden">
        <div className="mx-auto w-full max-w-sm overflow-y-auto overflow-x-hidden overscroll-contain">
          <DrawerHeader className="space-y-1.5 pb-2 text-center">
            <DrawerTitle className="flex items-center justify-center gap-2 text-xl text-[var(--flow-text)]">
              <Scale className="h-5 w-5" />
              Add Measurement Unit
            </DrawerTitle>
            <DrawerDescription className="text-[var(--flow-text-muted)]">
              Define how this food item can be measured and add nutritional information for this unit.
            </DrawerDescription>
          </DrawerHeader>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4 p-3 pt-2"
              style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 1rem)' }}
            >
            {/* Unit of Measurement */}
            <FormField
              control={form.control}
              name="unitOfMeasurement"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-[var(--flow-text)]">Unit of Measurement</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="border-[color:var(--flow-border)] bg-[var(--flow-surface)] text-[var(--flow-text)]">
                        <SelectValue placeholder="Select a unit" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="max-h-[300px]">
                      {Object.entries(unitCategories).map(([category, units]) => (
                        <div key={category}>
                          <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                            {category}
                          </div>
                          {units.map((unit) => (
                            <SelectItem key={unit} value={unit}>
                              {unit}
                            </SelectItem>
                          ))}
                        </div>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Unit Description */}
            <FormField
              control={form.control}
              name="unitDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-[var(--flow-text)]">Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="e.g., Medium-sized slice, Large apple, etc."
                      className="min-h-[60px] resize-none border-[color:var(--flow-border)] bg-[var(--flow-surface)] text-[var(--flow-text)]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription className="text-xs text-[var(--flow-text-muted)]">
                    Describe this specific unit measurement
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Nutrition Information */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-medium text-[var(--flow-text)]">Nutritional Information</h3>
                <Info className="h-4 w-4 text-[var(--flow-text-muted)]" />
              </div>
              
              {/* Calories (Required) */}
              <FormField
                control={form.control}
                name="calories"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-[var(--flow-text)]">Calories *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        max="10000"
                        step="0.1"
                        placeholder="0"
                        className="border-[color:var(--flow-border)] bg-[var(--flow-surface)] text-[var(--flow-text)]"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="rounded-lg border border-[color:var(--flow-border)]">
                <button
                  type="button"
                  onClick={() => setShowAdvancedNutrition((prev) => !prev)}
                  className="flex w-full items-center justify-between px-3 py-2 text-left text-sm font-medium text-[var(--flow-text)] hover:bg-[var(--flow-hover)]"
                >
                  <span>Advanced nutrition</span>
                  {showAdvancedNutrition ? (
                    <ChevronUp className="h-4 w-4 text-[var(--flow-text-muted)]" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-[var(--flow-text-muted)]" />
                  )}
                </button>

                {showAdvancedNutrition && (
                  <div className="grid grid-cols-2 gap-4 border-t border-[color:var(--flow-border)] p-3">
                    <FormField
                      control={form.control}
                      name="proteinInGrams"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium">Protein (g)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="0"
                              max="1000"
                              step="0.1"
                              placeholder="0"
                              className="border-[color:var(--flow-border)] bg-[var(--flow-surface)] text-[var(--flow-text)]"
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="carbohydratesInGrams"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium">Carbs (g)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="0"
                              max="1000"
                              step="0.1"
                              placeholder="0"
                              className="border-[color:var(--flow-border)] bg-[var(--flow-surface)] text-[var(--flow-text)]"
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="fatInGrams"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium">Fat (g)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="0"
                              max="1000"
                              step="0.1"
                              placeholder="0"
                              className="border-[color:var(--flow-border)] bg-[var(--flow-surface)] text-[var(--flow-text)]"
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="fiberInGrams"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium">Fiber (g)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="0"
                              max="1000"
                              step="0.1"
                              placeholder="0"
                              className="border-[color:var(--flow-border)] bg-[var(--flow-surface)] text-[var(--flow-text)]"
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="sugarInGrams"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium">Sugar (g)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="0"
                              max="1000"
                              step="0.1"
                              placeholder="0"
                              className="border-[color:var(--flow-border)] bg-[var(--flow-surface)] text-[var(--flow-text)]"
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="sodiumInMilligrams"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium">Sodium (mg)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="0"
                              max="10000"
                              step="0.1"
                              placeholder="0"
                              className="border-[color:var(--flow-border)] bg-[var(--flow-surface)] text-[var(--flow-text)]"
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Data Source */}
            <FormField
              control={form.control}
              name="source"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-[var(--flow-text)]">Data Source</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="border-[color:var(--flow-border)] bg-[var(--flow-surface)] text-[var(--flow-text)]">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="user_measured">User Measured</SelectItem>
                      <SelectItem value="package_label">Package Label</SelectItem>
                      <SelectItem value="database">Database</SelectItem>
                      <SelectItem value="estimated">Estimated</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription className="text-xs text-[var(--flow-text-muted)]">
                    How was this nutritional information obtained?
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
                    onClick={() => handleOpenChange(false)}
                    disabled={createUnitMutation.isPending}
                    className="min-w-[100px] justify-center border-[color:var(--flow-border)] bg-[var(--flow-surface)] text-[var(--flow-text)] transition-none hover:bg-[var(--flow-hover)]"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={createUnitMutation.isPending}
                    className="min-w-[130px] justify-center bg-[var(--flow-accent)]/15 text-[var(--flow-accent)] transition-none hover:bg-[var(--flow-accent)]/20"
                  >
                    {createUnitMutation.isPending ? (
                      <>
                        <span className="mr-2 inline-flex h-4 w-4 items-center justify-center">
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        </span>
                        Creating...
                      </>
                    ) : (
                      <>
                        <span className="mr-2 inline-flex h-4 w-4 items-center justify-center">
                          <Plus className="h-4 w-4" />
                        </span>
                        Add Unit
                      </>
                    )}
                  </Button>
                </div>
              </DrawerFooter>
            </form>
          </Form>

          {createUnitMutation.isError && (
            <div className="mt-4 rounded-md border border-destructive/20 bg-destructive/10 p-3">
              <p className="text-sm text-destructive">
                Failed to create unit. Please try again.
              </p>
            </div>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  )
}
