'use client'

import { useState, use } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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

function UnitCard({ unit }: { unit: FoodItemUnit }) {
  const [showActions, setShowActions] = useState(false)

  const getSourceColor = (_source: string) => {
    return 'bg-[var(--flow-accent)]/12 text-[var(--flow-accent)]'
  }

  const formatNutrition = (unit: FoodItemUnit) => {
    const parts = []
    if (unit.calories) parts.push(`${unit.calories} cal`)
    if (unit.proteinInGrams) parts.push(`${unit.proteinInGrams}g protein`)
    if (unit.carbohydratesInGrams) parts.push(`${unit.carbohydratesInGrams}g carbs`)
    if (unit.fatInGrams) parts.push(`${unit.fatInGrams}g fat`)
    return parts.join(' • ')
  }

  return (
    <Card className="transition-all duration-200 border-[color:var(--flow-border)] bg-[var(--flow-surface)] shadow-[var(--flow-shadow)] hover:border-[color:var(--flow-border-hover)]">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-semibold text-lg text-[var(--flow-text)]">{unit.unitOfMeasurement}</h3>
              <span className={`text-xs px-2 py-1 rounded-md ${getSourceColor(unit.source || 'unknown')}`}>
                {unit.source ? unit.source.replace('_', ' ') : 'unknown'}
              </span>
            </div>
            
            {unit.unitDescription && (
              <p className="text-sm text-[var(--flow-text-muted)] mb-2">
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
              className="p-2"
              onClick={() => setShowActions(!showActions)}
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
            
            {showActions && (
              <div className="absolute right-0 top-8 bg-[var(--flow-surface)] border-[color:var(--flow-border)] rounded-md shadow-[var(--flow-shadow)] p-1 z-10 min-w-[120px]">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-xs"
                  onClick={() => {
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
                  onClick={() => {
                    setShowActions(false)
                    toast.info('Delete unit coming soon!')
                  }}
                >
                  <Trash2 className="h-3 w-3 mr-2" />
                  Delete
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function UnitsSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(3)].map((_, i) => (
        <Card className="border-[color:var(--flow-border)] bg-[var(--flow-surface)] shadow-[var(--flow-shadow)]" key={i}>
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-6 w-24" />
                  <Skeleton className="h-5 w-16" />
                </div>
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-48" />
              </div>
              <Skeleton className="h-8 w-8" />
            </div>
          </CardContent>
        </Card>
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

  const units = unitsData?.data || []
  const foodItemName = units[0]?.foodItemName || 'Food Item'
  
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
          <CreateUnitForm 
            foodItemId={foodItemId}
            foodItemName={foodItemName}
            open={showCreateForm} 
            onOpenChange={setShowCreateForm}
          >
            <Button
              size="sm"
              className="border-[color:var(--flow-border)] bg-[var(--flow-surface)] text-[var(--flow-text)] hover:bg-[var(--flow-hover)] shadow-[var(--flow-shadow)]"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Unit
            </Button>
          </CreateUnitForm>
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
                  <CreateUnitForm 
                    foodItemId={foodItemId}
                    foodItemName={foodItemName}
                    open={showCreateForm} 
                    onOpenChange={setShowCreateForm}
                  >
                    <Button className="border-[color:var(--flow-border)] bg-[var(--flow-surface)] text-[var(--flow-text)] hover:bg-[var(--flow-hover)] shadow-[var(--flow-shadow)]">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Your First Unit
                    </Button>
                  </CreateUnitForm>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4 animate-fade-in">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-[var(--flow-text)]">Measurement Units</h2>
                  <Badge
                    variant="outline"
                    className="text-xs border-[color:var(--flow-border)] bg-[var(--flow-surface)] text-[var(--flow-text-muted)]"
                  >
                    {units.length} unit{units.length !== 1 ? 's' : ''}
                  </Badge>
                </div>
                
                {units.map((unit) => (
                  <UnitCard 
                    key={unit.id} 
                    unit={unit}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
