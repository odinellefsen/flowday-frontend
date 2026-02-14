'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Scale, Plus, Info } from 'lucide-react'
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto animate-scale-in">
        <DialogHeader className="space-y-3">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Scale className="h-5 w-5" />
            Add Measurement Unit
          </DialogTitle>
          <DialogDescription>
            Define how this food item can be measured and add nutritional information for this unit.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Unit of Measurement */}
            <FormField
              control={form.control}
              name="unitOfMeasurement"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">Unit of Measurement</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
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
                  <FormLabel className="text-sm font-medium">Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="e.g., Medium-sized slice, Large apple, etc."
                      className="min-h-[60px] resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription className="text-xs text-muted-foreground">
                    Describe this specific unit measurement
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Nutrition Information */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-medium">Nutritional Information</h3>
                <Info className="h-4 w-4 text-muted-foreground" />
              </div>
              
              {/* Calories (Required) */}
              <FormField
                control={form.control}
                name="calories"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">Calories *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        max="10000"
                        step="0.1"
                        placeholder="0"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Macronutrients Grid */}
              <div className="grid grid-cols-2 gap-4">
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
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Data Source */}
            <FormField
              control={form.control}
              name="source"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">Data Source</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
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
                  <FormDescription className="text-xs text-muted-foreground">
                    How was this nutritional information obtained?
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
                disabled={createUnitMutation.isPending}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createUnitMutation.isPending}
                className="w-full sm:w-auto"
              >
                {createUnitMutation.isPending ? (
                  <>
                    <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Unit
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>

        {createUnitMutation.isError && (
          <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
            <p className="text-sm text-destructive">
              Failed to create unit. Please try again.
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
