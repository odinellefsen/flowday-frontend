'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Apple, ArrowLeft, Plus, Search, MoreHorizontal, Trash2, Settings } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useApiClient } from '@/lib/api-client'
import { CreateFoodItemForm } from '@/components/create-food-item-form'
import type { FoodItem } from '@/lib/food-types'
import { toast } from 'sonner'

function FoodItemCard({ foodItem }: { foodItem: FoodItem }) {
  const [showActions, setShowActions] = useState(false)
  const apiClient = useApiClient()
  const queryClient = useQueryClient()
  const router = useRouter()

  const deleteMutation = useMutation({
    mutationFn: async () => {
      return apiClient.deleteFoodItem(foodItem.name)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['foodItems'] })
      toast.success(`${foodItem.name} deleted successfully`)
    },
    onError: (error) => {
      console.error('Failed to delete food item:', error)
      toast.error('Failed to delete food item')
    },
  })

  const handleDelete = () => {
    if (confirm(`Are you sure you want to delete "${foodItem.name}"?`)) {
      deleteMutation.mutate()
    }
  }

  return (
    <Card className="transition-all duration-200 hover:shadow-md animate-slide-up">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-semibold text-lg">{foodItem.name}</h3>
              {foodItem.hasUnits && (
                <Badge variant="default" className="text-xs">
                  {foodItem.unitCount} unit{foodItem.unitCount !== 1 ? 's' : ''}
                </Badge>
              )}
              {!foodItem.hasUnits && (
                <Badge variant="outline" className="text-xs">
                  No units
                </Badge>
              )}
            </div>
            
            {foodItem.categoryHierarchy && foodItem.categoryHierarchy.length > 0 && (
              <div className="mb-2">
                <div className="flex items-center gap-1 text-xs">
                  <span className="text-muted-foreground">Category:</span>
                  {foodItem.categoryHierarchy.map((category, index) => (
                    <span key={category} className="flex items-center">
                      {index > 0 && <span className="mx-1 text-muted-foreground">→</span>}
                      <Badge variant="secondary" className="text-xs">
                        {category}
                      </Badge>
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            <p className="text-sm text-muted-foreground">
              {foodItem.hasUnits 
                ? `Ready to use in recipes with ${foodItem.unitCount} measurement option${foodItem.unitCount !== 1 ? 's' : ''}`
                : 'Add measurement units to use in recipes'
              }
            </p>
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
              <div className="absolute right-0 top-8 bg-popover border rounded-md shadow-lg p-1 z-10 min-w-[120px]">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-xs"
                  onClick={() => {
                    setShowActions(false)
                    router.push(`/food/items/${foodItem.id}/units`)
                  }}
                >
                  <Settings className="h-3 w-3 mr-2" />
                  Manage Units
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-xs text-destructive hover:text-destructive"
                  onClick={() => {
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

function FoodItemsSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(3)].map((_, i) => (
        <Card key={i}>
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1 space-y-2">
                <Skeleton className="h-6 w-32" />
                <div className="flex gap-2">
                  <Skeleton className="h-5 w-16" />
                  <Skeleton className="h-5 w-20" />
                </div>
                <Skeleton className="h-4 w-64" />
              </div>
              <Skeleton className="h-8 w-8" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export default function FoodItemsPage() {
  const [showCreateForm, setShowCreateForm] = useState(false)
  const apiClient = useApiClient()

  const { data: foodItems, isLoading, error } = useQuery({
    queryKey: ['foodItems'],
    queryFn: apiClient.listFoodItems,
  })

  const foodItemsList = foodItems?.data || []

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
                <Apple className="h-6 w-6 text-primary" />
                Food Items
              </h1>
              <p className="text-sm text-muted-foreground">
                Manage individual food items and their nutritional information
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled>
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
            <CreateFoodItemForm 
              open={showCreateForm} 
              onOpenChange={setShowCreateForm}
            >
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </CreateFoodItemForm>
          </div>
        </header>

        {/* Content */}
        {isLoading && <FoodItemsSkeleton />}
        
        {error && (
          <Card>
            <CardHeader>
              <CardTitle className="text-destructive">Error Loading Food Items</CardTitle>
              <CardDescription>
                {error instanceof Error ? error.message : 'Failed to load food items. Please try again.'}
              </CardDescription>
            </CardHeader>
          </Card>
        )}

        {!isLoading && !error && (
          <>
            {foodItemsList.length === 0 ? (
              <Card className="animate-fade-in">
                <CardContent className="p-8 text-center">
                  <Apple className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Food Items Yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Create your first food item to start tracking nutrition and building recipes.
                  </p>
                  <CreateFoodItemForm 
                    open={showCreateForm} 
                    onOpenChange={setShowCreateForm}
                  >
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Your First Food Item
                    </Button>
                  </CreateFoodItemForm>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4 animate-fade-in">
                {foodItemsList.map((foodItem) => (
                  <FoodItemCard key={foodItem.id} foodItem={foodItem} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
