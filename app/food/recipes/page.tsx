'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { ChefHat, Plus, MoreHorizontal, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useAuthenticatedRecipesAPI } from '@/src/lib/api/recipes'
import { CreateRecipeForm } from '@/components/create-recipe-form'
import { type Recipe } from '@/src/lib/api/types/recipes'
import { toast } from 'sonner'

function RecipeCard({ recipe }: { recipe: Recipe }) {
  const [showActions, setShowActions] = useState(false)
  const apiClient = useAuthenticatedRecipesAPI()
  const queryClient = useQueryClient()
  const router = useRouter()

  const deleteMutation = useMutation({
    mutationFn: async () => {
      return apiClient.delete(recipe.id)
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

  const getMealTimingColor = () => 'bg-[var(--flow-accent)]/12 text-[var(--flow-accent)]'

  return (
    <Card 
      className="transition-all duration-200 animate-slide-up cursor-pointer border-[color:var(--flow-border)] bg-[var(--flow-surface)] shadow-[var(--flow-shadow)] hover:border-[color:var(--flow-border-hover)]"
      onClick={() => router.push(`/food/recipes/${recipe.id}`)}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
              <h3 className="font-semibold text-lg text-[var(--flow-text)]">{recipe.nameOfTheRecipe}</h3>
            {recipe.generalDescriptionOfTheRecipe && (
              <p className="text-sm text-[var(--flow-text-muted)] mb-2">
                {recipe.generalDescriptionOfTheRecipe}
              </p>
            )}
            
            {(recipe.whenIsItConsumed?.length ?? 0) > 0 && (
              <div className="flex flex-wrap gap-1 mb-2">
                {(recipe.whenIsItConsumed ?? []).map((timing) => (
                  <span
                    key={timing}
                    className={`text-xs px-2 py-1 rounded-md ${getMealTimingColor()}`}
                  >
                    {timing.toLowerCase()}
                  </span>
                ))}
              </div>
            )}
          </div>
          
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              className="relative z-20 p-2"
              onClick={(e) => {
                e.stopPropagation() // Prevent card click when clicking menu
                setShowActions((prev) => !prev)
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
              </>
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
        <Card className="border-[color:var(--flow-border)] bg-[var(--flow-surface)] shadow-[var(--flow-shadow)]" key={i}>
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

  const recipesList = recipes?.data ?? []

  return (
    <div className="min-h-screen bg-[var(--flow-background)]">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Header */}
        <header className="space-y-5 mb-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2 text-[var(--flow-text)]">
                  <ChefHat className="h-6 w-6 text-[var(--flow-accent)]" />
                  Recipes
                </h1>
              </div>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <CreateRecipeForm 
                open={showCreateForm} 
                onOpenChange={setShowCreateForm}
              >
                <Button
                  size="sm"
                  className="w-full sm:w-auto border-[color:var(--flow-border)] bg-[var(--flow-surface)] text-[var(--flow-text)] hover:bg-[var(--flow-hover)] shadow-[var(--flow-shadow)]"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  New Recipe
                </Button>
              </CreateRecipeForm>
            </div>
          </div>
        </header>

        {/* Content */}
        {isLoading && <RecipesSkeleton />}
        
        {error && (
          <Card className="border-[color:var(--flow-border)] bg-[var(--flow-surface)] shadow-[var(--flow-shadow)]">
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
              <Card className="animate-fade-in border-[color:var(--flow-border)] bg-[var(--flow-surface)] shadow-[var(--flow-shadow)]">
                <CardContent className="p-8 text-center">
                  <ChefHat className="h-12 w-12 text-[var(--flow-text-muted)] mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2 text-[var(--flow-text)]">No Recipes Yet</h3>
                  <p className="text-[var(--flow-text-muted)] mb-4">
                    Create your first recipe to start building your personal cookbook.
                  </p>
                  <Button
                    onClick={() => setShowCreateForm(true)}
                    className="border-[color:var(--flow-border)] bg-[var(--flow-surface)] text-[var(--flow-text)] hover:bg-[var(--flow-hover)] shadow-[var(--flow-shadow)]"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Recipe
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4 animate-fade-in">
                <h2 className="text-lg font-semibold text-[var(--flow-text)]">Your Recipes</h2>
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
