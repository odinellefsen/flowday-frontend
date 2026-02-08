'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { UtensilsCrossed, ArrowLeft, Plus, ChefHat } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useAuthenticatedMealsAPI } from '@/src/lib/api/meals'
import { CreateMealForm } from '@/components/create-meal-form'
import { type Meal } from '@/src/lib/api/types/meals'

function MealCard({ meal }: { meal: Meal }) {
  const router = useRouter()

  return (
    <Card 
      className="transition-all duration-200 animate-slide-up cursor-pointer border-[color:var(--flow-border)] bg-[var(--flow-surface)] shadow-[var(--flow-shadow)] hover:border-[color:var(--flow-border-hover)]"
      onClick={() => router.push(`/food/meals/${meal.id}`)}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-semibold text-lg text-[var(--flow-text)]">{meal.mealName}</h3>
              {meal.recipeCount > 0 ? (
                <Badge
                  variant="default"
                  className="text-xs bg-[var(--flow-accent)]/15 text-[var(--flow-accent)] hover:bg-[var(--flow-accent)]/20"
                >
                  {meal.recipeCount} recipe{meal.recipeCount !== 1 ? 's' : ''}
                </Badge>
              ) : (
                <Badge
                  variant="outline"
                  className="text-xs border-[color:var(--flow-border)] text-[var(--flow-text-muted)]"
                >
                  No recipes
                </Badge>
              )}
            </div>
            
            <p className="text-sm text-[var(--flow-text-muted)]">
              {meal.recipeCount > 0 
                ? `Meal plan with ${meal.recipeCount} recipe${meal.recipeCount !== 1 ? 's' : ''}`
                : 'Add recipes to complete this meal plan'
              }
            </p>
          </div>
          
          <div className="ml-4">
            <ChefHat className="h-5 w-5 text-[var(--flow-text-muted)]" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function MealsSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(3)].map((_, i) => (
        <Card
          key={i}
          className="border-[color:var(--flow-border)] bg-[var(--flow-surface)] shadow-[var(--flow-shadow)]"
        >
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="h-5 w-20" />
                </div>
                <Skeleton className="h-4 w-64" />
              </div>
              <Skeleton className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export default function MealsPage() {
  const [showCreateForm, setShowCreateForm] = useState(false)
  const apiClient = useAuthenticatedMealsAPI()
  const router = useRouter()

  const { data: meals, isLoading, error } = useQuery({
    queryKey: ['meals'],
    queryFn: apiClient.list,
  })

  const mealsList = meals?.data || []

  return (
    <div className="min-h-screen bg-[var(--flow-background)]">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Header */}
        <header className="space-y-5 mb-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                className="p-2 text-[var(--flow-text-muted)] hover:text-[var(--flow-text)] hover:bg-[var(--flow-hover)]"
                onClick={() => router.back()}
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="sr-only">Back to food domain</span>
              </Button>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2 text-[var(--flow-text)]">
                  <UtensilsCrossed className="h-6 w-6 text-[var(--flow-accent)]" />
                  Meals
                </h1>
              </div>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <CreateMealForm 
                open={showCreateForm} 
                onOpenChange={setShowCreateForm}
              >
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full sm:w-auto border-[color:var(--flow-border)] bg-[var(--flow-surface)] text-[var(--flow-text)] hover:bg-[var(--flow-hover)]"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Plan Meal
                </Button>
              </CreateMealForm>
            </div>
          </div>
        </header>

        {/* Content */}
        {isLoading && <MealsSkeleton />}
        
        {error && (
          <Card className="border-[color:var(--flow-border)] bg-[var(--flow-surface)] shadow-[var(--flow-shadow)]">
            <CardHeader>
              <CardTitle className="text-destructive">Error Loading Meals</CardTitle>
              <CardDescription>
                {error instanceof Error ? error.message : 'Failed to load meals. Please try again.'}
              </CardDescription>
            </CardHeader>
          </Card>
        )}

        {!isLoading && !error && (
          <>
            {mealsList.length === 0 ? (
              <Card className="animate-fade-in border-[color:var(--flow-border)] bg-[var(--flow-surface)] shadow-[var(--flow-shadow)]">
                <CardContent className="p-8 text-center">
                  <UtensilsCrossed className="h-12 w-12 text-[var(--flow-text-muted)] mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2 text-[var(--flow-text)]">No Meals Yet</h3>
                  <p className="text-[var(--flow-text-muted)] mb-4">
                    Create your first meal plan to start organizing your recipes and cooking schedule.
                  </p>
                  <CreateMealForm 
                    open={showCreateForm} 
                    onOpenChange={setShowCreateForm}
                  >
                    <Button
                      variant="outline"
                      className="border-[color:var(--flow-border)] bg-[var(--flow-surface)] text-[var(--flow-text)] hover:bg-[var(--flow-hover)]"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Plan Your First Meal
                    </Button>
                  </CreateMealForm>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4 animate-fade-in">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-[var(--flow-text)]">Your Meals</h2>
                  <Badge
                    variant="outline"
                    className="text-xs border-[color:var(--flow-border)] bg-[var(--flow-surface)] text-[var(--flow-text-muted)]"
                  >
                    {mealsList.length} meal{mealsList.length !== 1 ? 's' : ''}
                  </Badge>
                </div>
                
                {mealsList.map((meal) => (
                  <MealCard key={meal.id} meal={meal} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
