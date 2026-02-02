'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { UtensilsCrossed, ArrowLeft, Plus, Calendar, ChefHat } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuthenticatedMealsAPI } from '@/src/lib/api/meals'
import { CreateMealForm } from '@/components/create-meal-form'
import { type Meal } from '@/src/lib/api/types/meals'
import { toast } from 'sonner'

function MealCard({ meal }: { meal: Meal }) {
  const router = useRouter()

  return (
    <Card 
      className="transition-all duration-200 hover:shadow-md animate-slide-up cursor-pointer"
      onClick={() => router.push(`/food/meals/${meal.id}`)}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-semibold text-lg">{meal.mealName}</h3>
              {meal.recipeCount > 0 ? (
                <Badge variant="default" className="text-xs">
                  {meal.recipeCount} recipe{meal.recipeCount !== 1 ? 's' : ''}
                </Badge>
              ) : (
                <Badge variant="outline" className="text-xs">
                  No recipes
                </Badge>
              )}
            </div>
            
            <p className="text-sm text-muted-foreground">
              {meal.recipeCount > 0 
                ? `Meal plan with ${meal.recipeCount} recipe${meal.recipeCount !== 1 ? 's' : ''}`
                : 'Add recipes to complete this meal plan'
              }
            </p>
          </div>
          
          <div className="ml-4">
            <ChefHat className="h-5 w-5 text-muted-foreground" />
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
        <Card key={i}>
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

  const { data: meals, isLoading, error } = useQuery({
    queryKey: ['meals'],
    queryFn: apiClient.list,
  })

  const mealsList = meals?.data || []

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Header */}
        <header className="space-y-5 mb-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <Link href="/food">
                <Button variant="ghost" size="sm" className="p-2">
                  <ArrowLeft className="h-4 w-4" />
                  <span className="sr-only">Back to food domain</span>
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
                  <UtensilsCrossed className="h-6 w-6 text-primary" />
                  Meals
                </h1>
                <p className="text-sm text-muted-foreground">
                  Plan meals by combining recipes and track preparation
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <CreateMealForm 
                open={showCreateForm} 
                onOpenChange={setShowCreateForm}
              >
                <Button size="sm" className="w-full sm:w-auto">
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
          <Card>
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
              <Card className="animate-fade-in">
                <CardContent className="p-8 text-center">
                  <UtensilsCrossed className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Meals Yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Create your first meal plan to start organizing your recipes and cooking schedule.
                  </p>
                  <CreateMealForm 
                    open={showCreateForm} 
                    onOpenChange={setShowCreateForm}
                  >
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Plan Your First Meal
                    </Button>
                  </CreateMealForm>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4 animate-fade-in">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold">Your Meals</h2>
                  <Badge variant="outline" className="text-xs">
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
