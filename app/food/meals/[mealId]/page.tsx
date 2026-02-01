'use client'

import { useMemo, useState, use } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  UtensilsCrossed, 
  ArrowLeft, 
  Plus, 
  ChefHat,
  List, 
  BookOpen,
  Utensils,
  RefreshCw
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuthenticatedMealsAPI, useAuthenticatedRecipesAPI } from '@/src/lib/api'
import type { MealWithDetails } from '@/src/lib/api/types/meals'
import { AttachRecipesForm } from '@/components/attach-recipes-form'
import { CreateMealHabitForm } from '@/components/create-meal-habit-form'

interface PageProps {
  params: Promise<{
    mealId: string
  }>
}

function MealHeader({ meal }: { meal: MealWithDetails }) {
  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <CardTitle className="text-2xl">{meal.mealName}</CardTitle>
              {meal.recipes.length > 0 ? (
                <Badge variant="default" className="text-xs">
                  {meal.recipes.length} recipe{meal.recipes.length !== 1 ? 's' : ''}
                </Badge>
              ) : (
                <Badge variant="outline" className="text-xs">
                  No recipes
                </Badge>
              )}
            </div>
            
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <List className="h-4 w-4" />
                {meal.ingredients.length} ingredient{meal.ingredients.length !== 1 ? 's' : ''}
              </span>
              <span className="flex items-center gap-1">
                <BookOpen className="h-4 w-4" />
                {meal.instructions.length} step{meal.instructions.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        </div>
      </CardHeader>
    </Card>
  )
}

function RecipesSection({
  meal,
  recipeNameById,
}: {
  meal: MealWithDetails
  recipeNameById?: Map<string, string>
}) {
  const router = useRouter()
  const [showAttachForm, setShowAttachForm] = useState(false)

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <ChefHat className="h-5 w-5" />
            Recipes in this meal
          </CardTitle>
          <AttachRecipesForm
            mealId={meal.id}
            mealName={meal.mealName}
            open={showAttachForm}
            onOpenChange={setShowAttachForm}
          >
            <Button size="sm" variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Attach Recipe
            </Button>
          </AttachRecipesForm>
        </div>
      </CardHeader>
      <CardContent>
        {meal.recipes.length === 0 ? (
          <div className="text-center py-8">
            <ChefHat className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Recipes Attached</h3>
            <p className="text-muted-foreground mb-4">
              Attach recipes to this meal to build your meal plan.
            </p>
            <AttachRecipesForm
              mealId={meal.id}
              mealName={meal.mealName}
              open={showAttachForm}
              onOpenChange={setShowAttachForm}
            >
              <Button variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Attach Your First Recipe
              </Button>
            </AttachRecipesForm>
          </div>
        ) : (
          <div className="space-y-2">
            {meal.recipes.map((recipe, index) => {
              const recipeDisplayName =
                recipe.recipeName ??
                recipe.nameOfTheRecipe ??
                recipeNameById?.get(recipe.recipeId) ??
                `Recipe ${recipe.orderInMeal}`
              const recipeNumber = index + 1

              return (
                <div 
                  key={recipe.recipeId}
                  className="p-4 bg-muted/30 rounded-md hover:bg-muted/50 transition-colors cursor-pointer"
                  onClick={() => router.push(`/food/recipes/${recipe.recipeId}`)}
                >
                  <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div>
                      <span className="font-medium">{recipeDisplayName}</span>
                      <p className="text-xs text-muted-foreground">
                        Recipe {recipeNumber} • Click to view recipe details
                      </p>
                    </div>
                  </div>
                    <ChefHat className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function IngredientsSection({ meal }: { meal: MealWithDetails }) {
  // Group ingredients by recipe
  const ingredientsByRecipe = meal.ingredients.reduce((acc, ingredient) => {
    if (!acc[ingredient.recipeId]) {
      acc[ingredient.recipeId] = []
    }
    acc[ingredient.recipeId].push(ingredient)
    return acc
  }, {} as Record<string, typeof meal.ingredients>)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Utensils className="h-5 w-5" />
          Ingredients
        </CardTitle>
        <CardDescription>
          All ingredients from attached recipes
        </CardDescription>
      </CardHeader>
      <CardContent>
        {meal.ingredients.length === 0 ? (
          <div className="text-center py-8">
            <Utensils className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Ingredients Yet</h3>
            <p className="text-muted-foreground mb-4">
              Attach recipes to see their ingredients here.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {Object.entries(ingredientsByRecipe).map(([recipeId, ingredients], index) => (
              <div key={recipeId} className="space-y-2">
                <h4 className="text-sm font-semibold text-muted-foreground">
                  Recipe {index + 1}
                </h4>
                <div className="space-y-2">
                  {ingredients.map((ingredient, idx) => (
                    <div key={`${recipeId}-${idx}`} className="p-3 bg-muted/30 rounded-md">
                      <span>{ingredient.ingredientText}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function InstructionsSection({ meal }: { meal: MealWithDetails }) {
  // Group instructions by recipe
  const instructionsByRecipe = meal.instructions.reduce((acc, instruction) => {
    if (!acc[instruction.recipeId]) {
      acc[instruction.recipeId] = []
    }
    acc[instruction.recipeId].push(instruction)
    return acc
  }, {} as Record<string, typeof meal.instructions>)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          Instructions
        </CardTitle>
        <CardDescription>
          All steps from attached recipes
        </CardDescription>
      </CardHeader>
      <CardContent>
        {meal.instructions.length === 0 ? (
          <div className="text-center py-8">
            <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Instructions Yet</h3>
            <p className="text-muted-foreground mb-4">
              Attach recipes to see their instructions here.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(instructionsByRecipe).map(([recipeId, instructions], recipeIndex) => (
              <div key={recipeId} className="space-y-3">
                <h4 className="text-sm font-semibold text-muted-foreground">
                  Recipe {recipeIndex + 1}
                </h4>
                <div className="space-y-4">
                  {instructions.map((step) => (
                    <div key={`${recipeId}-${step.instructionNumber}`} className="border rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-8 h-8 bg-primary/10 text-primary rounded-full flex items-center justify-center text-sm font-semibold">
                          {step.instructionNumber}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm leading-relaxed">{step.instruction}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function MealDetailSkeleton() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-6 w-20" />
            </div>
            <div className="flex gap-4">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-20" />
            </div>
          </div>
        </CardHeader>
      </Card>
      
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Card>
          <CardContent className="p-6">
            <div className="space-y-3">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function MealDetailPage({ params }: PageProps) {
  const apiClient = useAuthenticatedMealsAPI()
  const recipesApiClient = useAuthenticatedRecipesAPI()
  
  // Unwrap the params Promise
  const { mealId } = use(params)

  const { data: mealData, isLoading, error } = useQuery({
    queryKey: ['meal', mealId],
    queryFn: () => apiClient.get(mealId),
  })
  const { data: recipesData } = useQuery({
    queryKey: ['recipes'],
    queryFn: () => recipesApiClient.list(),
  })

  const meal = mealData?.data
  const recipeNameById = useMemo(() => {
    if (!recipesData?.data) {
      return undefined
    }
    const map = new Map<string, string>()
    recipesData.data.forEach((recipe) => {
      map.set(recipe.id, recipe.nameOfTheRecipe)
    })
    return map
  }, [recipesData])
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-6 max-w-4xl">
          <header className="flex items-center gap-3 mb-8">
            <Link href="/food/meals">
              <Button variant="ghost" size="sm" className="p-2">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <Skeleton className="h-8 w-48" />
          </header>
          <MealDetailSkeleton />
        </div>
      </div>
    )
  }

  if (error || !meal) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-6 max-w-4xl">
          <header className="flex items-center gap-3 mb-8">
            <Link href="/food/meals">
              <Button variant="ghost" size="sm" className="p-2">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <h1 className="text-2xl font-bold">Meal Not Found</h1>
          </header>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-destructive">Error Loading Meal</CardTitle>
              <CardDescription>
                {error instanceof Error ? error.message : 'Meal not found or failed to load.'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/food/meals">
                <Button variant="outline">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Meals
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Header */}
        <header className="flex items-center gap-3 mb-8">
          <Link href="/food/meals">
            <Button variant="ghost" size="sm" className="p-2">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back to meals</span>
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <UtensilsCrossed className="h-6 w-6 text-primary" />
            <h1 className="text-2xl sm:text-3xl font-bold">Meal Details</h1>
          </div>
        </header>

        {/* Meal Header */}
        <div className="space-y-6">
          <MealHeader meal={meal} />
          
          {/* Recipes Section */}
          <RecipesSection meal={meal} recipeNameById={recipeNameById} />
          
          {/* Meal Content Tabs */}
          <Tabs defaultValue="ingredients" className="animate-fade-in">
            <TabsList className="grid w-full grid-cols-3 h-auto overflow-hidden">
              <TabsTrigger value="ingredients" className="flex items-center gap-2">
                <Utensils className="h-4 w-4" />
                Ingredients
              </TabsTrigger>
              <TabsTrigger value="instructions" className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Instructions
              </TabsTrigger>
              <TabsTrigger value="habit" className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4" />
                Habit
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="ingredients" className="mt-6">
              <IngredientsSection meal={meal} />
            </TabsContent>
            
            <TabsContent value="instructions" className="mt-6">
              <InstructionsSection meal={meal} />
            </TabsContent>
            
            <TabsContent value="habit" className="mt-6">
              <CreateMealHabitForm meal={meal} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}

