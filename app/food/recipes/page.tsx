'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { ChefHat, ArrowLeft, Plus, Search, MoreHorizontal, Trash2, Edit, Clock, Users } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuthenticatedRecipesAPI } from '@/src/lib/api/recipes'
import { CreateRecipeForm } from '@/components/create-recipe-form'
import { type Recipe, MealTimingEnum } from '@/src/lib/api/types/recipes'
import { toast } from 'sonner'

function RecipeCard({ recipe }: { recipe: Recipe }) {
  const [showActions, setShowActions] = useState(false)
  const apiClient = useAuthenticatedRecipesAPI()
  const queryClient = useQueryClient()
  const router = useRouter()

  const deleteMutation = useMutation({
    mutationFn: async () => {
      return apiClient.delete(recipe.nameOfTheRecipe)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recipes'] })
      toast.success(`${recipe.nameOfTheRecipe} deleted successfully`)
    },
    onError: (error) => {
      console.error('Failed to delete recipe:', error)
      toast.error('Failed to delete recipe')
    },
  })

  const handleDelete = () => {
    if (confirm(`Are you sure you want to delete "${recipe.nameOfTheRecipe}"?`)) {
      deleteMutation.mutate()
    }
  }

  const getMealTimingColor = (timing: MealTimingEnum) => {
    switch (timing) {
      case MealTimingEnum.BREAKFAST: return 'bg-yellow-100 text-yellow-800'
      case MealTimingEnum.LUNCH: return 'bg-green-100 text-green-800'
      case MealTimingEnum.DINNER: return 'bg-blue-100 text-blue-800'
      case MealTimingEnum.SNACK: return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <Card 
      className="transition-all duration-200 hover:shadow-md animate-slide-up cursor-pointer"
      onClick={() => router.push(`/food/recipes/${recipe.id}`)}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-semibold text-lg">{recipe.nameOfTheRecipe}</h3>
              <Badge variant={recipe.completeness === 'complete' ? 'default' : 'outline'} className="text-xs">
                {recipe.completeness}
              </Badge>
            </div>
            
            {recipe.generalDescriptionOfTheRecipe && (
              <p className="text-sm text-muted-foreground mb-2">
                {recipe.generalDescriptionOfTheRecipe}
              </p>
            )}
            
            {recipe.whenIsItConsumed && recipe.whenIsItConsumed.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-2">
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
            
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                {recipe.ingredientCount} ingredient{recipe.ingredientCount !== 1 ? 's' : ''}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {recipe.stepCount} step{recipe.stepCount !== 1 ? 's' : ''}
              </span>
              <span>v{recipe.version}</span>
            </div>
          </div>
          
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              className="p-2"
              onClick={(e) => {
                e.stopPropagation()
                setShowActions(!showActions)
              }}
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
            
            {showActions && (
              <div className="absolute right-0 top-8 bg-popover border rounded-md shadow-lg p-1 z-10 min-w-[120px]">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-xs"
                  onClick={(e) => {
                    e.stopPropagation()
                    setShowActions(false)
                    toast.info('Edit recipe coming soon!')
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
                    handleDelete()
                  }}
                  disabled={deleteMutation.isPending}
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

function RecipesSkeleton() {
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
                <div className="flex gap-2">
                  <Skeleton className="h-5 w-16" />
                  <Skeleton className="h-5 w-16" />
                </div>
                <div className="flex gap-4">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-12" />
                </div>
              </div>
              <Skeleton className="h-8 w-8" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export default function RecipesPage() {
  const [showCreateForm, setShowCreateForm] = useState(false)
  const apiClient = useAuthenticatedRecipesAPI()

  const { data: recipes, isLoading, error } = useQuery({
    queryKey: ['recipes'],
    queryFn: apiClient.list,
  })

  const recipesList = recipes?.data || []

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Header */}
        <header className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Link href="/food">
              <Button variant="ghost" size="sm" className="p-2">
                <ArrowLeft className="h-4 w-4" />
                <span className="sr-only">Back to food domain</span>
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
                <ChefHat className="h-6 w-6 text-primary" />
                Recipes
              </h1>
              <p className="text-sm text-muted-foreground">
                Create and manage recipes with ingredients and instructions
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled>
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
            <CreateRecipeForm 
              open={showCreateForm} 
              onOpenChange={setShowCreateForm}
            >
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                New Recipe
              </Button>
            </CreateRecipeForm>
          </div>
        </header>

        {/* Content */}
        {isLoading && <RecipesSkeleton />}
        
        {error && (
          <Card>
            <CardHeader>
              <CardTitle className="text-destructive">Error Loading Recipes</CardTitle>
              <CardDescription>
                {error instanceof Error ? error.message : 'Failed to load recipes. Please try again.'}
              </CardDescription>
            </CardHeader>
          </Card>
        )}

        {!isLoading && !error && (
          <>
            {recipesList.length === 0 ? (
              <Card className="animate-fade-in">
                <CardContent className="p-8 text-center">
                  <ChefHat className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Recipes Yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Create your first recipe to start building your personal cookbook.
                  </p>
                  <CreateRecipeForm 
                    open={showCreateForm} 
                    onOpenChange={setShowCreateForm}
                  >
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Your First Recipe
                    </Button>
                  </CreateRecipeForm>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4 animate-fade-in">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold">Your Recipes</h2>
                  <Badge variant="outline" className="text-xs">
                    {recipesList.length} recipe{recipesList.length !== 1 ? 's' : ''}
                  </Badge>
                </div>
                
                {recipesList.map((recipe) => (
                  <RecipeCard key={recipe.id} recipe={recipe} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
