'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Apple, ArrowLeft, Plus, MoreHorizontal, Trash2, Folder, FolderOpen, ChevronRight } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useAuthenticatedFoodItemsAPI } from '@/src/lib/api/food-items'
import { CreateFoodItemForm } from '../../../components/create-food-item-form'
import type { FoodItem } from '@/src/lib/api/types/food-items'
import { toast } from 'sonner'

function CategoryCard({ 
  categoryName, 
  itemCount, 
  hasSubcategories, 
  onClick 
}: { 
  categoryName: string
  itemCount: number
  hasSubcategories: boolean
  onClick: () => void 
}) {
  return (
    <Card 
      className="transition-all duration-200 hover:shadow-md cursor-pointer hover:bg-accent/50"
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-md bg-primary/10 text-primary">
              {hasSubcategories ? (
                <Folder className="h-5 w-5" />
              ) : (
                <FolderOpen className="h-5 w-5" />
              )}
            </div>
            <div>
              <h3 className="font-semibold">{categoryName}</h3>
              <p className="text-sm text-muted-foreground">
                {itemCount} item{itemCount !== 1 ? 's' : ''}
                {hasSubcategories && ' and subcategories'}
              </p>
            </div>
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </div>
      </CardContent>
    </Card>
  )
}

function FoodItemCard({ foodItem }: { foodItem: FoodItem }) {
  const [showActions, setShowActions] = useState(false)
  const apiClient = useAuthenticatedFoodItemsAPI()
  const queryClient = useQueryClient()
  const router = useRouter()

  const deleteMutation = useMutation({
    mutationFn: async () => {
      return apiClient.delete(foodItem.name)
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
    <Card 
      className="transition-all duration-200 hover:shadow-md animate-slide-up cursor-pointer"
      onClick={() => router.push(`/food/items/${foodItem.id}/units`)}
    >
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
              onClick={(e) => {
                e.stopPropagation() // Prevent card click when clicking menu
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
  const [currentPath, setCurrentPath] = useState<string[]>([]) // Current navigation path
  const apiClient = useAuthenticatedFoodItemsAPI()

  const { data: foodItems, isLoading, error } = useQuery({
    queryKey: ['foodItems'],
    queryFn: apiClient.list,
  })

  const foodItemsList = foodItems?.data || []

  // Get items and subcategories at the current path level
  const getCurrentLevelData = () => {
    const currentItems: FoodItem[] = []
    const subcategories = new Map<string, { count: number; hasSubcategories: boolean }>()

    foodItemsList.forEach((foodItem) => {
      if (!foodItem.categoryHierarchy || foodItem.categoryHierarchy.length === 0) {
        // Uncategorized items - show ONLY at root level
        if (currentPath.length === 0) {
          currentItems.push(foodItem)
        }
      } else {
        const hierarchy = foodItem.categoryHierarchy
        
        // Check if this item's hierarchy matches the current path exactly
        const isExactMatch = currentPath.every((pathSegment, index) => 
          hierarchy[index] === pathSegment
        )

        if (isExactMatch) {
          if (hierarchy.length === currentPath.length) {
            // This item belongs exactly at this level - show it
            currentItems.push(foodItem)
          } else if (hierarchy.length > currentPath.length) {
            // This item is deeper - show its next category level
            const nextCategory = hierarchy[currentPath.length]
            const hasMoreLevels = hierarchy.length > currentPath.length + 1

            if (!subcategories.has(nextCategory)) {
              subcategories.set(nextCategory, { count: 0, hasSubcategories: hasMoreLevels })
            }
            
            const existing = subcategories.get(nextCategory)!
            existing.count++
            existing.hasSubcategories = existing.hasSubcategories || hasMoreLevels
          }
        }
      }
    })

    return {
      items: currentItems,
      subcategories: Array.from(subcategories.entries()).map(([name, data]) => ({
        name,
        count: data.count,
        hasSubcategories: data.hasSubcategories
      })).sort((a, b) => a.name.localeCompare(b.name))
    }
  }

  const { items: currentItems, subcategories } = getCurrentLevelData()

  const navigateToCategory = (categoryName: string) => {
    setCurrentPath([...currentPath, categoryName])
  }

  const navigateUp = () => {
    setCurrentPath(currentPath.slice(0, -1))
  }

  const navigateToPath = (pathIndex: number) => {
    setCurrentPath(currentPath.slice(0, pathIndex + 1))
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Header */}
        <header className="space-y-5 mb-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
                  <Apple className="h-6 w-6 text-primary" />
                  Food Items
                </h1>
              </div>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <CreateFoodItemForm 
                open={showCreateForm} 
                onOpenChange={setShowCreateForm}
              >
                <Button size="sm" className="w-full sm:w-auto">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Item
                </Button>
              </CreateFoodItemForm>
            </div>
          </div>

          {/* Breadcrumb Navigation */}
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink 
                    href="#" 
                    onClick={(e) => {
                      e.preventDefault()
                      setCurrentPath([])
                    }}
                    className="cursor-pointer"
                  >
                    All Items
                  </BreadcrumbLink>
                </BreadcrumbItem>
                {currentPath.map((pathSegment, index) => (
                  <div key={pathSegment} className="flex items-center">
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                      {index === currentPath.length - 1 ? (
                        <BreadcrumbPage>{pathSegment}</BreadcrumbPage>
                      ) : (
                        <BreadcrumbLink 
                          href="#" 
                          onClick={(e) => {
                            e.preventDefault()
                            navigateToPath(index)
                          }}
                          className="cursor-pointer"
                        >
                          {pathSegment}
                        </BreadcrumbLink>
                      )}
                    </BreadcrumbItem>
                  </div>
                ))}
              </BreadcrumbList>
            </Breadcrumb>
            
            {currentPath.length > 0 && (
              <Button variant="ghost" size="sm" onClick={navigateUp} className="w-fit">
                <ArrowLeft className="h-3 w-3 mr-1" />
                Back
              </Button>
            )}
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
              <div className="space-y-6 animate-fade-in">
                {/* Show subcategories first */}
                {subcategories.length > 0 && (
                  <div className="space-y-3">
                    <h2 className="text-lg font-semibold">Categories</h2>
                    <div className="space-y-2">
                      {subcategories.map((category) => (
                        <CategoryCard
                          key={category.name}
                          categoryName={category.name}
                          itemCount={category.count}
                          hasSubcategories={category.hasSubcategories}
                          onClick={() => navigateToCategory(category.name)}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Show food items at current level */}
                {currentItems.length > 0 && (
                  <div className="space-y-3">
                    <h2 className="text-lg font-semibold">
                      {currentPath.length === 0 ? 'Uncategorized Items' : 'Items'}
                    </h2>
                    <div className="space-y-3">
                      {currentItems.map((foodItem) => (
                        <FoodItemCard key={foodItem.id} foodItem={foodItem} />
                      ))}
                    </div>
                  </div>
                )}

                {/* Show message if current level is empty */}
                {subcategories.length === 0 && currentItems.length === 0 && (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <Folder className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No Items in This Category</h3>
                      <p className="text-muted-foreground mb-4">
                        This category doesn&apos;t contain any food items yet.
                      </p>
                      <Button variant="outline" onClick={navigateUp}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Go Back
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
