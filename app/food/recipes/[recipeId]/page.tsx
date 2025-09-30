'use client'

import { useState, use } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  ChefHat, 
  ArrowLeft, 
  Plus, 
  Edit, 
  Clock, 
  List, 
  BookOpen,
  Utensils
} from 'lucide-react'
import Link from 'next/link'
import { useApiClient } from '@/lib/api-client'
import { ManageIngredientsForm } from '@/components/manage-ingredients-form'
import { ManageInstructionsForm } from '@/components/manage-instructions-form'
import { AttachedUnitBadge } from '@/components/food-item-unit-picker'
import type { RecipeWithDetails, MealTimingEnum } from '@/lib/recipe-types'

interface PageProps {
  params: Promise<{
    recipeId: string
  }>
}

function RecipeHeader({ recipe }: { recipe: RecipeWithDetails }) {
  const getMealTimingColor = (timing: MealTimingEnum) => {
    switch (timing) {
      case 'BREAKFAST': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'LUNCH': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'DINNER': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'SNACK': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
    }
  }

  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <CardTitle className="text-2xl">{recipe.nameOfTheRecipe}</CardTitle>
              <Badge variant={recipe.completeness === 'complete' ? 'default' : 'outline'} className="text-xs">
                {recipe.completeness}
              </Badge>
              <Badge variant="secondary" className="text-xs">
                v{recipe.version}
              </Badge>
            </div>
            
            {recipe.generalDescriptionOfTheRecipe && (
              <CardDescription className="text-base mb-3">
                {recipe.generalDescriptionOfTheRecipe}
              </CardDescription>
            )}
            
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <List className="h-4 w-4" />
                {recipe.ingredientCount} ingredient{recipe.ingredientCount !== 1 ? 's' : ''}
              </span>
              <span className="flex items-center gap-1">
                <BookOpen className="h-4 w-4" />
                {recipe.stepCount} step{recipe.stepCount !== 1 ? 's' : ''}
              </span>
              {recipe.metadata.estimatedTotalTime && (
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {recipe.metadata.estimatedTotalTime} min
                </span>
              )}
            </div>
            
            {recipe.whenIsItConsumed && recipe.whenIsItConsumed.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {recipe.whenIsItConsumed.map((timing) => (
                  <span
                    key={timing}
                    className={`text-xs px-2 py-1 rounded-md ${getMealTimingColor(timing)}`}
                  >
                    {timing.toLowerCase()}
                  </span>
                ))}
              </div>
            )}
          </div>
          
          <Button variant="outline" size="sm">
            <Edit className="h-4 w-4 mr-2" />
            Edit Recipe
          </Button>
        </div>
      </CardHeader>
    </Card>
  )
}

function IngredientsSection({ recipe }: { recipe: RecipeWithDetails }) {
  const [showIngredientsForm, setShowIngredientsForm] = useState(false)

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Utensils className="h-5 w-5" />
            Ingredients
          </CardTitle>
          <ManageIngredientsForm
            recipeId={recipe.id}
            recipeName={recipe.nameOfTheRecipe}
            open={showIngredientsForm}
            onOpenChange={setShowIngredientsForm}
          >
            <Button size="sm" variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Add Ingredients
            </Button>
          </ManageIngredientsForm>
        </div>
      </CardHeader>
      <CardContent>
        {recipe.ingredients.length === 0 ? (
          <div className="text-center py-8">
            <Utensils className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Ingredients Added</h3>
            <p className="text-muted-foreground mb-4">
              Add ingredients to complete your recipe.
            </p>
            <ManageIngredientsForm
              recipeId={recipe.id}
              recipeName={recipe.nameOfTheRecipe}
              open={showIngredientsForm}
              onOpenChange={setShowIngredientsForm}
            >
              <Button variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Ingredient
              </Button>
            </ManageIngredientsForm>
          </div>
        ) : (
          <div className="space-y-2">
            {recipe.ingredients.map((ingredient) => (
              <div key={ingredient.id} className="p-3 bg-muted/30 rounded-md">
                <span>{ingredient.ingredientText}</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function InstructionsSection({ recipe }: { recipe: RecipeWithDetails }) {
  const [showInstructionsForm, setShowInstructionsForm] = useState(false)

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Instructions
          </CardTitle>
          <ManageInstructionsForm
            recipeId={recipe.id}
            recipeName={recipe.nameOfTheRecipe}
            open={showInstructionsForm}
            onOpenChange={setShowInstructionsForm}
          >
            <Button size="sm" variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Add Instructions
            </Button>
          </ManageInstructionsForm>
        </div>
      </CardHeader>
      <CardContent>
        {recipe.steps.length === 0 ? (
          <div className="text-center py-8">
            <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Instructions Added</h3>
            <p className="text-muted-foreground mb-4">
              Add step-by-step instructions to complete your recipe.
            </p>
            <ManageInstructionsForm
              recipeId={recipe.id}
              recipeName={recipe.nameOfTheRecipe}
              open={showInstructionsForm}
              onOpenChange={setShowInstructionsForm}
            >
              <Button variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Instruction
              </Button>
            </ManageInstructionsForm>
          </div>
        ) : (
          <div className="space-y-4">
            {recipe.steps.map((step) => (
              <div key={step.id} className="border rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary/10 text-primary rounded-full flex items-center justify-center text-sm font-semibold">
                    {step.instructionNumber}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm leading-relaxed">{step.instruction}</p>
                    
                    {/* Food Item Units Attached to this step */}
                    {step.foodItemUnitsUsedInStep && step.foodItemUnitsUsedInStep.length > 0 && (
                      <div className="mt-3 pt-2 border-t border-muted">
                        <p className="text-xs font-medium text-muted-foreground mb-2">Attached Food Units:</p>
                        <div className="flex flex-wrap gap-1">
                          {step.foodItemUnitsUsedInStep.map((unit, unitIndex) => (
                            <Badge key={`${unit.foodItemUnitId}-${unitIndex}`} variant="secondary" className="text-xs">
                              {unit.quantityOfFoodItemUnit}x Unit ID: {unit.foodItemUnitId.substring(0, 8)}...
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-2 mt-3">
                      <Button variant="ghost" size="sm" className="text-xs">
                        <Plus className="h-3 w-3 mr-1" />
                        Attach Food Units
                      </Button>
                      <Button variant="ghost" size="sm" className="text-xs">
                        <Edit className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function RecipeDetailSkeleton() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-6 w-20" />
            </div>
            <Skeleton className="h-4 w-96" />
            <div className="flex gap-4">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-16" />
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

export default function RecipeDetailPage({ params }: PageProps) {
  const apiClient = useApiClient()
  
  // Unwrap the params Promise
  const { recipeId } = use(params)

  const { data: recipeData, isLoading, error } = useQuery({
    queryKey: ['recipe', recipeId],
    queryFn: () => apiClient.getRecipe(recipeId),
  })

  console.log('🔍 Recipe API Response:', recipeData)

  const recipe = recipeData?.data
  
  console.log('📊 Recipe steps:', recipe?.steps)

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-6 max-w-4xl">
          <header className="flex items-center gap-3 mb-8">
            <Link href="/food/recipes">
              <Button variant="ghost" size="sm" className="p-2">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <Skeleton className="h-8 w-48" />
          </header>
          <RecipeDetailSkeleton />
        </div>
      </div>
    )
  }

  if (error || !recipe) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-6 max-w-4xl">
          <header className="flex items-center gap-3 mb-8">
            <Link href="/food/recipes">
              <Button variant="ghost" size="sm" className="p-2">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <h1 className="text-2xl font-bold">Recipe Not Found</h1>
          </header>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-destructive">Error Loading Recipe</CardTitle>
              <CardDescription>
                {error instanceof Error ? error.message : 'Recipe not found or failed to load.'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/food/recipes">
                <Button variant="outline">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Recipes
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
          <Link href="/food/recipes">
            <Button variant="ghost" size="sm" className="p-2">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back to recipes</span>
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <ChefHat className="h-6 w-6 text-primary" />
            <h1 className="text-2xl sm:text-3xl font-bold">Recipe Details</h1>
          </div>
        </header>

        {/* Recipe Header */}
        <div className="space-y-6">
          <RecipeHeader recipe={recipe} />
          
          {/* Recipe Content Tabs */}
          <Tabs defaultValue="ingredients" className="animate-fade-in">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="ingredients" className="flex items-center gap-2">
                <Utensils className="h-4 w-4" />
                Ingredients
              </TabsTrigger>
              <TabsTrigger value="instructions" className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Instructions
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="ingredients" className="mt-6">
              <IngredientsSection recipe={recipe} />
            </TabsContent>
            
            <TabsContent value="instructions" className="mt-6">
              <InstructionsSection recipe={recipe} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
