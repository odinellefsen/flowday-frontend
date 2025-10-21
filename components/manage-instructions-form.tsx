'use client'

import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { BookOpen, Plus, X, Link as LinkIcon } from 'lucide-react'
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
import { Textarea } from '@/components/ui/textarea'
import { useAuthenticatedRecipesAPI } from '@/src/lib/api/recipes'
import { FoodItemUnitPicker, AttachedUnitBadge } from './food-item-unit-picker'
import type { CreateRecipeInstructionsRequest } from '@/src/lib/api/types/recipes'

// Extended type for form handling
interface AttachedFoodUnit {
  foodItemUnitId: string
  foodItemId: string
  foodItemName: string
  unitOfMeasurement: string
  quantityOfFoodItemUnit: number
  calories?: number
}

// Form validation schema based on API documentation
const instructionsSchema = z.object({
  instructions: z
    .array(
      z.object({
        stepInstruction: z
          .string()
          .min(1, 'Instruction is required')
          .max(250, 'Instruction must be less than 250 characters'),
        foodItemUnitsUsedInStep: z
          .array(
            z.object({
              foodItemUnitId: z.string().uuid(),
              quantityOfFoodItemUnit: z.number().positive().max(1_000_000),
            })
          )
          .optional(),
      })
    )
    .min(1, 'At least one instruction is required')
    .max(30, 'Maximum 30 instructions allowed'),
})

type InstructionsFormData = z.infer<typeof instructionsSchema>

interface ManageInstructionsFormProps {
  children: React.ReactNode
  recipeId: string
  recipeName: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ManageInstructionsForm({ 
  children, 
  recipeId, 
  recipeName,
  open, 
  onOpenChange 
}: ManageInstructionsFormProps) {
  const [attachedUnits, setAttachedUnits] = useState<Record<number, AttachedFoodUnit[]>>({})
  const queryClient = useQueryClient()
  const apiClient = useAuthenticatedRecipesAPI()

  const form = useForm<InstructionsFormData>({
    resolver: zodResolver(instructionsSchema),
    defaultValues: {
      instructions: [{ stepInstruction: '', foodItemUnitsUsedInStep: [] }], // Always start with empty form
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'instructions',
  })

  const handleAttachUnit = (stepIndex: number, unit: AttachedFoodUnit) => {
    setAttachedUnits(prev => ({
      ...prev,
      [stepIndex]: [...(prev[stepIndex] || []), unit]
    }))
  }

  const handleRemoveUnit = (stepIndex: number, unitIndex: number) => {
    setAttachedUnits(prev => ({
      ...prev,
      [stepIndex]: prev[stepIndex]?.filter((_, i) => i !== unitIndex) || []
    }))
  }

  const createInstructionsMutation = useMutation({
    mutationFn: async (data: InstructionsFormData) => {
      const instructionsData: CreateRecipeInstructionsRequest = {
        recipeId,
        stepByStepInstructions: data.instructions.map((instruction, index) => ({
          stepInstruction: instruction.stepInstruction,
          foodItemUnitsUsedInStep: attachedUnits[index] && attachedUnits[index].length > 0 
            ? attachedUnits[index].map(unit => ({
                foodItemUnitId: unit.foodItemUnitId,
                quantityOfFoodItemUnit: unit.quantityOfFoodItemUnit,
              }))
            : undefined,
        })),
      }
      
      return apiClient.createInstructions(instructionsData)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recipe', recipeId] })
      queryClient.invalidateQueries({ queryKey: ['recipes'] })
      onOpenChange(false)
      form.reset()
      setAttachedUnits({}) // Clear attached units
      toast.success('Instructions added successfully! 📝', {
        description: `New instructions have been added to ${recipeName}.`,
      })
    },
    onError: (error) => {
      console.error('Failed to add instructions:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      toast.error('Failed to add instructions', {
        description: `Error: ${errorMessage}`,
      })
    },
  })

  const onSubmit = (data: InstructionsFormData) => {
    createInstructionsMutation.mutate(data)
  }

  const addInstruction = () => {
    append({ stepInstruction: '', foodItemUnitsUsedInStep: [] })
  }

  const removeInstruction = (index: number) => {
    if (fields.length > 1) {
      remove(index)
      // Remove attached units for this instruction
      setAttachedUnits(prev => {
        const newUnits = { ...prev }
        delete newUnits[index]
        // Reindex remaining units
        const reindexed: Record<number, AttachedFoodUnit[]> = {}
        Object.keys(newUnits).forEach(key => {
          const oldIndex = parseInt(key)
          const newIndex = oldIndex > index ? oldIndex - 1 : oldIndex
          reindexed[newIndex] = newUnits[oldIndex]
        })
        return reindexed
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto animate-scale-in">
        <DialogHeader className="space-y-3">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <BookOpen className="h-5 w-5" />
            Add Instructions
          </DialogTitle>
          <DialogDescription>
            Add new step-by-step instructions to {recipeName}. You can attach food units to each step for precise nutrition tracking.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <FormLabel className="text-sm font-medium">Instructions</FormLabel>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addInstruction}
                  disabled={fields.length >= 30}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Step
                </Button>
              </div>

              <div className="space-y-4 max-h-96 overflow-y-auto">
                {fields.map((field, index) => (
                  <div key={field.id} className="border rounded-lg p-4 space-y-3">
                    <FormField
                      control={form.control}
                      name={`instructions.${index}.stepInstruction`}
                      render={({ field: inputField }) => (
                        <FormItem>
                          <div className="flex items-center gap-2 mb-2">
                            <div className="flex-shrink-0 w-8 h-8 bg-primary/10 text-primary rounded-full flex items-center justify-center text-sm font-semibold">
                              {index + 1}
                            </div>
                            <FormLabel className="text-sm font-medium">
                              Step {index + 1}
                            </FormLabel>
                            {fields.length > 1 && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="p-1 ml-auto text-muted-foreground hover:text-destructive"
                                onClick={() => removeInstruction(index)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                          <FormControl>
                            <Textarea
                              placeholder="e.g., Preheat oven to 350°F. Mix flour and sugar in a large bowl..."
                              className="min-h-[80px] resize-none"
                              {...inputField}
                            />
                          </FormControl>
                          <FormDescription className="text-xs text-muted-foreground">
                            {inputField.value?.length || 0}/250 characters
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Food Units Attachment */}
                    <div className="pt-2 border-t border-muted">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-muted-foreground">
                          Attached Food Units
                        </span>
                        <FoodItemUnitPicker
                          onAttachUnit={(unit) => handleAttachUnit(index, unit)}
                        >
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="text-xs"
                          >
                            <LinkIcon className="h-3 w-3 mr-1" />
                            Attach Food Units
                          </Button>
                        </FoodItemUnitPicker>
                      </div>
                      
                      {/* Display attached food units */}
                      <div className="mt-2 flex flex-wrap gap-1">
                        {attachedUnits[index] && attachedUnits[index].length > 0 ? (
                          attachedUnits[index].map((unit, unitIndex) => (
                            <AttachedUnitBadge
                              key={`${unit.foodItemUnitId}-${unitIndex}`}
                              unit={unit}
                              onRemove={() => handleRemoveUnit(index, unitIndex)}
                            />
                          ))
                        ) : (
                          <span className="text-xs text-muted-foreground italic">
                            No food units attached to this step
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <FormDescription className="text-xs text-muted-foreground">
                Add up to 30 instructions. You can attach specific food items and quantities to each step for precise nutrition tracking.
              </FormDescription>
            </div>

            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={createInstructionsMutation.isPending}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createInstructionsMutation.isPending || fields.length === 0}
                className="w-full sm:w-auto"
              >
                {createInstructionsMutation.isPending ? (
                  <>
                    <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Adding...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Instructions
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>

        {createInstructionsMutation.isError && (
          <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
            <p className="text-sm text-destructive">
              Failed to add instructions. Please try again.
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
