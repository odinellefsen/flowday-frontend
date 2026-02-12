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
  Plus, 
  Edit, 
  Clock, 
  List, 
  BookOpen,
  Utensils
} from 'lucide-react'
import { useAuthenticatedRecipesAPI } from '@/src/lib/api/recipes'
import { ManageIngredientsForm } from '@/components/manage-ingredients-form'
import { ManageInstructionsForm } from '@/components/manage-instructions-form'
import type { RecipeWithDetails, MealTimingEnum } from '@/src/lib/api/types/recipes'

interface PageProps {
  params: Promise<{
    recipeId: string
  }>
}

function RecipeHeader({ recipe }: { recipe: RecipeWithDetails }) {
  const getMealTimingColor = (_timing: MealTimingEnum) => {
    return 'bg-[var(--flow-accent)]/12 text-[var(--flow-accent)]'
  }

  return (
    <Card className="animate-fade-in border-[color:var(--flow-border)] bg-[var(--flow-surface)] shadow-[var(--flow-shadow)]">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <CardTitle className="text-2xl text-[var(--flow-text)]">{recipe.nameOfTheRecipe}</CardTitle>
              <Badge variant={recipe.completeness === 'complete' ? 'default' : 'outline'} className="text-xs">
                {recipe.completeness}
              </Badge>
              <Badge variant="outline" className="text-xs border-[color:var(--flow-border)] text-[var(--flow-text-muted)]">
                v{recipe.version}
              </Badge>
            </div>
            
            {recipe.generalDescriptionOfTheRecipe && (
              <CardDescription className="text-base mb-3 text-[var(--flow-text-muted)]">
                {recipe.generalDescriptionOfTheRecipe}
              </CardDescription>
            )}
            
            <div className="flex items-center gap-4 text-sm text-[var(--flow-text-muted)]">
              <span className="flex items-center gap-1">
                <List className="h-4 w-4" />
                {recipe.ingredientCount} ingredient{recipe.ingredientCount !== 1 ? 's' : ''}
              </span>
              <span className="flex items-center gap-1">
                <BookOpen className="h-4 w-4" />
                {recipe.instructions?.length || recipe.stepCount} step{(recipe.instructions?.length || recipe.stepCount) !== 1 ? 's' : ''}
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
          
          <Button
            variant="outline"
            size="sm"
            className="border-[color:var(--flow-border)] bg-[var(--flow-surface)] text-[var(--flow-text)] hover:bg-[var(--flow-hover)]"
          >
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
    <Card className="border-[color:var(--flow-border)] bg-[var(--flow-surface)] shadow-[var(--flow-shadow)]">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-[var(--flow-text)]">
            <Utensils className="h-5 w-5" />
            Ingredients
          </CardTitle>
          <ManageIngredientsForm
            recipeId={recipe.id}
            recipeName={recipe.nameOfTheRecipe}
            open={showIngredientsForm}
            onOpenChange={setShowIngredientsForm}
          >
            <Button
              size="sm"
              variant="outline"
              className="border-[color:var(--flow-border)] bg-[var(--flow-surface)] text-[var(--flow-text)] hover:bg-[var(--flow-hover)]"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Ingredients
            </Button>
          </ManageIngredientsForm>
        </div>
      </CardHeader>
      <CardContent>
        {recipe.ingredients.length === 0 ? (
          <div className="text-center py-8">
            <Utensils className="h-12 w-12 text-[var(--flow-text-muted)] mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2 text-[var(--flow-text)]">No Ingredients Added</h3>
            <p className="text-[var(--flow-text-muted)] mb-4">
              Add ingredients to complete your recipe.
            </p>
            <ManageIngredientsForm
              recipeId={recipe.id}
              recipeName={recipe.nameOfTheRecipe}
              open={showIngredientsForm}
              onOpenChange={setShowIngredientsForm}
            >
              <Button
                variant="outline"
                className="border-[color:var(--flow-border)] bg-[var(--flow-surface)] text-[var(--flow-text)] hover:bg-[var(--flow-hover)]"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Ingredient
              </Button>
            </ManageIngredientsForm>
          </div>
        ) : (
          <div className="space-y-2">
            {recipe.ingredients.map((ingredient) => (
              <div key={ingredient.id} className="rounded-md border border-[color:var(--flow-border)] bg-[var(--flow-hover)] p-3">
                <span className="text-[var(--flow-text)]">{ingredient.ingredientText}</span>
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
    <Card className="border-[color:var(--flow-border)] bg-[var(--flow-surface)] shadow-[var(--flow-shadow)]">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-[var(--flow-text)]">
            <BookOpen className="h-5 w-5" />
            Instructions
          </CardTitle>
          <ManageInstructionsForm
            recipeId={recipe.id}
            recipeName={recipe.nameOfTheRecipe}
            open={showInstructionsForm}
            onOpenChange={setShowInstructionsForm}
          >
            <Button
              size="sm"
              variant="outline"
              className="border-[color:var(--flow-border)] bg-[var(--flow-surface)] text-[var(--flow-text)] hover:bg-[var(--flow-hover)]"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Instructions
            </Button>
          </ManageInstructionsForm>
        </div>
      </CardHeader>
      <CardContent>
        {recipe.instructions.length === 0 ? (
          <div className="text-center py-8">
            <BookOpen className="h-12 w-12 text-[var(--flow-text-muted)] mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2 text-[var(--flow-text)]">No Instructions Added</h3>
            <p className="text-[var(--flow-text-muted)] mb-4">
              Add step-by-step instructions to complete your recipe.
            </p>
            <ManageInstructionsForm
              recipeId={recipe.id}
              recipeName={recipe.nameOfTheRecipe}
              open={showInstructionsForm}
              onOpenChange={setShowInstructionsForm}
            >
              <Button
                variant="outline"
                className="border-[color:var(--flow-border)] bg-[var(--flow-surface)] text-[var(--flow-text)] hover:bg-[var(--flow-hover)]"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Instruction
              </Button>
            </ManageInstructionsForm>
          </div>
        ) : (
          <div className="space-y-4">
            {recipe.instructions.map((step) => (
              <div key={step.id} className="rounded-lg border border-[color:var(--flow-border)] bg-[var(--flow-surface)] p-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[var(--flow-accent)]/15 text-sm font-semibold text-[var(--flow-accent)]">
                    {step.instructionNumber}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm leading-relaxed text-[var(--flow-text)]">{step.instruction}</p>
                    
                    {/* Food Item Units Attached to this step */}
                    {step.foodItemUnits && step.foodItemUnits.length > 0 && (
                      <div className="mt-3 border-t border-[color:var(--flow-border)] pt-2">
                        <p className="mb-2 text-xs font-medium text-[var(--flow-text-muted)]">Attached Food Units:</p>
                        <div className="flex flex-wrap gap-1">
                          {step.foodItemUnits.map((unit, unitIndex) => (
                            <Badge
                              key={`${unit.foodItemName}-${unit.unitOfMeasurement}-${unitIndex}`}
                              variant="outline"
                              className="text-xs border-[color:var(--flow-border)] bg-[var(--flow-hover)] text-[var(--flow-text-muted)]"
                            >
                              {unit.quantity}x {unit.unitOfMeasurement} {unit.foodItemName} ({unit.calories * unit.quantity} cal)
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-2 mt-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs text-[var(--flow-text-muted)] hover:bg-[var(--flow-hover)] hover:text-[var(--flow-text)]"
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Attach Food Units
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs text-[var(--flow-text-muted)] hover:bg-[var(--flow-hover)] hover:text-[var(--flow-text)]"
                      >
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
      <Card className="border-[color:var(--flow-border)] bg-[var(--flow-surface)] shadow-[var(--flow-shadow)]">
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
        <Card className="border-[color:var(--flow-border)] bg-[var(--flow-surface)] shadow-[var(--flow-shadow)]">
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
  const apiClient = useAuthenticatedRecipesAPI()
  
  // Unwrap the params Promise
  const { recipeId } = use(params)

  const { data: recipeData, isLoading, error } = useQuery({
    queryKey: ['recipe', recipeId],
    queryFn: () => apiClient.get(recipeId),
  })

  const recipe = recipeData?.data
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--flow-background)]">
        <div className="container mx-auto px-4 py-6 max-w-4xl">
          <header className="flex items-center gap-3 mb-8">
            <Skeleton className="h-8 w-48" />
          </header>
          <RecipeDetailSkeleton />
        </div>
      </div>
    )
  }

  if (error || !recipe) {
    return (
      <div className="min-h-screen bg-[var(--flow-background)]">
        <div className="container mx-auto px-4 py-6 max-w-4xl">
          <header className="flex items-center gap-3 mb-8">
            <h1 className="text-2xl font-bold text-[var(--flow-text)]">Recipe Not Found</h1>
          </header>
          
          <Card className="border-[color:var(--flow-border)] bg-[var(--flow-surface)] shadow-[var(--flow-shadow)]">
            <CardHeader>
              <CardTitle className="text-destructive">Error Loading Recipe</CardTitle>
              <CardDescription>
                {error instanceof Error ? error.message : 'Recipe not found or failed to load.'}
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[var(--flow-background)]">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Header */}
        <header className="flex items-center gap-3 mb-8">
          <div className="flex items-center gap-2">
            <ChefHat className="h-6 w-6 text-[var(--flow-accent)]" />
            <h1 className="text-2xl sm:text-3xl font-bold text-[var(--flow-text)]">Recipe Details</h1>
          </div>
        </header>

        {/* Recipe Header */}
        <div className="space-y-6">
          <RecipeHeader recipe={recipe} />
          
          {/* Recipe Content Tabs */}
          <Tabs defaultValue="ingredients" className="animate-fade-in">
            <TabsList className="grid h-auto w-full grid-cols-2 overflow-hidden border border-[color:var(--flow-border)] bg-[var(--flow-surface)]">
              <TabsTrigger
                value="ingredients"
                className="flex items-center gap-2 text-[var(--flow-text-muted)] data-[state=active]:bg-[var(--flow-hover)] data-[state=active]:text-[var(--flow-text)]"
              >
                <Utensils className="h-4 w-4" />
                Ingredients
              </TabsTrigger>
              <TabsTrigger
                value="instructions"
                className="flex items-center gap-2 text-[var(--flow-text-muted)] data-[state=active]:bg-[var(--flow-hover)] data-[state=active]:text-[var(--flow-text)]"
              >
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
