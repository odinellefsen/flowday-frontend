'use client'

import { useState, use } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Plus, Scale, MoreHorizontal, Trash2, Edit } from 'lucide-react'
import { useAuthenticatedFoodItemsAPI } from '@/src/lib/api/food-items'
import { CreateUnitForm } from '@/components/create-unit-form'
import type { FoodItemUnit } from '@/src/lib/api/types/food-items'
import { toast } from 'sonner'

interface PageProps {
  params: Promise<{
    foodItemId: string
  }>
}

function UnitListItem({ unit }: { unit: FoodItemUnit }) {
  const [showActions, setShowActions] = useState(false)

  const formatNutrition = (unit: FoodItemUnit) => {
    const parts = []
    if (unit.calories) parts.push(`${unit.calories} cal`)
    if (unit.proteinInGrams) parts.push(`${unit.proteinInGrams}g protein`)
    if (unit.carbohydratesInGrams) parts.push(`${unit.carbohydratesInGrams}g carbs`)
    if (unit.fatInGrams) parts.push(`${unit.fatInGrams}g fat`)
    return parts.join(' • ')
  }

  return (
    <div className="flex items-start justify-between gap-3 px-4 py-3 transition-colors hover:bg-[var(--flow-hover)]/60">
      <div className="min-w-0 flex-1">
        <h3 className="font-semibold text-lg text-[var(--flow-text)]">{unit.unitOfMeasurement}</h3>

        {unit.unitDescription && (
          <p className="mb-2 text-sm text-[var(--flow-text-muted)]">
            {unit.unitDescription}
          </p>
        )}

        <div className="text-sm text-[var(--flow-text-muted)]">
          {formatNutrition(unit)}
        </div>
      </div>

      <div className="relative">
        <Button
          variant="ghost"
          size="sm"
          className="relative z-20 p-2"
          onClick={(e) => {
            e.stopPropagation()
            setShowActions(!showActions)
          }}
        >
          <MoreHorizontal className="h-4 w-4" />
        </Button>

        {showActions && (
          <>
            <div
              className="fixed inset-0 z-10"
              onPointerDown={(e) => {
                e.preventDefault()
                e.stopPropagation()
              }}
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                setShowActions(false)
              }}
            />
            <div className="absolute right-0 top-8 z-20 min-w-[120px] rounded-md border border-[color:var(--flow-border)] bg-[var(--flow-surface)] p-1 shadow-[var(--flow-shadow)]">
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start text-xs"
                onClick={(e) => {
                  e.stopPropagation()
                  setShowActions(false)
                  toast.info('Edit unit coming soon!')
                }}
              >
                <Edit className="h-3 w-3 mr-2" />
                Edit
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start text-xs text-destructive hover:text-destructive"
                onClick={(e) => {
                  e.stopPropagation()
                  setShowActions(false)
                  toast.info('Delete unit coming soon!')
                }}
              >
                <Trash2 className="h-3 w-3 mr-2" />
                Delete
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function UnitsSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-[color:var(--flow-border)] bg-[var(--flow-surface)] shadow-[var(--flow-shadow)]">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="border-b border-[color:var(--flow-border)] p-4 last:border-b-0">
          <div className="flex items-start justify-between">
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-6 w-24" />
                </div>
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-48" />
              </div>
              <Skeleton className="h-8 w-8" />
          </div>
        </div>
      ))}
    </div>
  )
}

export default function FoodItemUnitsPage({ params }: PageProps) {
  const [showCreateForm, setShowCreateForm] = useState(false)
  const apiClient = useAuthenticatedFoodItemsAPI()
  
  // Unwrap the params Promise
  const { foodItemId } = use(params)

  const { data: unitsData, isLoading, error } = useQuery({
    queryKey: ['foodItemUnits', foodItemId],
    queryFn: () => apiClient.getUnits(foodItemId),
  })

  const { data: foodItemsData } = useQuery({
    queryKey: ['foodItems'],
    queryFn: () => apiClient.list(),
  })

  const units = unitsData?.data || []
  const foodItemNameFromList = foodItemsData?.data?.find((item) => item.id === foodItemId)?.name
  const foodItemName = units[0]?.foodItemName || foodItemNameFromList || 'Food Item'
  
  return (
    <div className="min-h-screen bg-[var(--flow-background)]">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Header */}
        <header className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2 text-[var(--flow-text)]">
                <Scale className="h-6 w-6 text-[var(--flow-accent)]" />
                {isLoading ? 'Food Item Units' : foodItemName}
              </h1>
              <p className="text-sm text-[var(--flow-text-muted)]">
                Manage measurement units and nutritional information
              </p>
            </div>
          </div>
          <Button
            size="sm"
            onClick={() => setShowCreateForm(true)}
            className="border-[color:var(--flow-border)] bg-[var(--flow-surface)] text-[var(--flow-text)] hover:bg-[var(--flow-hover)] shadow-[var(--flow-shadow)]"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Unit
          </Button>
        </header>

        {/* Content */}
        {isLoading && <UnitsSkeleton />}
        
        {error && (
          <Card className="border-[color:var(--flow-border)] bg-[var(--flow-surface)] shadow-[var(--flow-shadow)]">
            <CardHeader>
              <CardTitle className="text-destructive">Error Loading Units</CardTitle>
              <CardDescription>
                {error instanceof Error ? error.message : 'Failed to load food item units. Please try again.'}
              </CardDescription>
            </CardHeader>
          </Card>
        )}

        {!isLoading && !error && (
          <>
            {units.length === 0 ? (
              <Card className="animate-fade-in border-[color:var(--flow-border)] bg-[var(--flow-surface)] shadow-[var(--flow-shadow)]">
                <CardContent className="p-8 text-center">
                  <Scale className="h-12 w-12 text-[var(--flow-text-muted)] mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2 text-[var(--flow-text)]">No Measurement Units Yet</h3>
                  <p className="text-[var(--flow-text-muted)] mb-4">
                    Add measurement units to define how this food item can be measured and used in recipes.
                  </p>
                  <Button
                    onClick={() => setShowCreateForm(true)}
                    className="border-[color:var(--flow-border)] bg-[var(--flow-surface)] text-[var(--flow-text)] hover:bg-[var(--flow-hover)] shadow-[var(--flow-shadow)]"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First Unit
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4 animate-fade-in">
                <h2 className="text-lg font-semibold text-[var(--flow-text)]">Measurement Units</h2>
                <div className="rounded-xl border border-[color:var(--flow-border)] bg-[var(--flow-surface)] shadow-[var(--flow-shadow)]">
                  {units.map((unit, index) => (
                    <div
                      key={unit.id}
                      className={index !== units.length - 1 ? 'border-b border-[color:var(--flow-border)]' : ''}
                    >
                      <UnitListItem unit={unit} />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
      <CreateUnitForm
        foodItemId={foodItemId}
        foodItemName={foodItemName}
        open={showCreateForm}
        onOpenChange={setShowCreateForm}
      >
        <span className="hidden" />
      </CreateUnitForm>
    </div>
  )
}
