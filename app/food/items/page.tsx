'use client'

import { Suspense, useEffect, useRef, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Apple, ArrowLeft, Plus, MoreHorizontal, Trash2, Folder, FolderOpen } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuthenticatedFoodItemsAPI } from '@/src/lib/api/food-items'
import { CreateFoodItemForm } from '../../../components/create-food-item-form'
import type { FoodItem } from '@/src/lib/api/types/food-items'
import { toast } from 'sonner'

const normalizeCategorySegment = (segment: string | null | undefined) =>
  (segment ?? '').replace(/[\p{Cc}\p{Cf}]/gu, '').trim()

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
      className="transition-all duration-200 cursor-pointer animate-slide-up border-[color:var(--flow-border)] bg-[var(--flow-surface)] shadow-[var(--flow-shadow)] hover:border-[color:var(--flow-border-hover)] hover:bg-[var(--flow-hover)]"
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-md bg-[var(--flow-accent)]/12 text-[var(--flow-accent)]">
              {hasSubcategories ? (
                <Folder className="h-5 w-5" />
              ) : (
                <FolderOpen className="h-5 w-5" />
              )}
            </div>
            <div>
              <h3 className="font-semibold text-[var(--flow-text)]">{categoryName}</h3>
              <p className="text-sm text-[var(--flow-text-muted)]">
                {itemCount} item{itemCount !== 1 ? 's' : ''}
                {hasSubcategories && ' and subcategories'}
              </p>
            </div>
          </div>
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
      className="transition-all duration-200 animate-slide-up cursor-pointer border-[color:var(--flow-border)] bg-[var(--flow-surface)] shadow-[var(--flow-shadow)] hover:border-[color:var(--flow-border-hover)]"
      onClick={() => router.push(`/food/items/${foodItem.id}/units`)}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="mb-2 font-semibold text-lg text-[var(--flow-text)]">{foodItem.name}</h3>
            
            <p className="text-sm text-[var(--flow-text-muted)]">
              {foodItem.hasUnits 
                ? 'Ready to use in recipes'
                : 'Add measurement units to use in recipes'
              }
            </p>
          </div>
          
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              className="relative z-20 p-2"
              onClick={(e) => {
                e.stopPropagation() // Prevent card click when clicking menu
                setShowActions(!showActions)
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

function FoodItemsSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(3)].map((_, i) => (
        <Card className="border-[color:var(--flow-border)] bg-[var(--flow-surface)] shadow-[var(--flow-shadow)]" key={i}>
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

function FoodItemsPageContent() {
  const [showCreateForm, setShowCreateForm] = useState(false)
  const pathScrollRef = useRef<HTMLDivElement | null>(null)
  const apiClient = useAuthenticatedFoodItemsAPI()
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentPath = searchParams
    .getAll('category')
    .map((segment) => normalizeCategorySegment(segment))
    .filter(Boolean)
  const maxVisiblePathSegments = 2
  const hiddenPathCount = Math.max(0, currentPath.length - maxVisiblePathSegments)
  const visiblePathStartIndex = hiddenPathCount
  const visiblePath = currentPath.slice(visiblePathStartIndex)
  const showPathNavigation = currentPath.length > 0
  const showAllItemsBreadcrumb = currentPath.length === 1

  useEffect(() => {
    if (!pathScrollRef.current) return
    pathScrollRef.current.scrollLeft = pathScrollRef.current.scrollWidth
  }, [currentPath])

  useEffect(() => {
    if (currentPath.length !== 0) return

    const sentinelKey = '__foodItemsRootBackToFood'
    const state = window.history.state as Record<string, unknown> | null

    // Add a same-page history entry so iOS/Android swipe-back can be intercepted reliably.
    if (!state?.[sentinelKey]) {
      window.history.pushState(
        { ...(state ?? {}), [sentinelKey]: true },
        '',
        window.location.href
      )
    }

    const handlePopState = () => {
      if (window.location.pathname === '/food/items') {
        router.replace('/food')
      }
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [currentPath.length, router])

  const getFoodItemsUrl = (pathSegments: string[]) => {
    if (pathSegments.length === 0) return '/food/items'
    const params = new URLSearchParams()
    pathSegments.forEach((segment) => params.append('category', segment))
    return `/food/items?${params.toString()}`
  }

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
          .map((segment) => normalizeCategorySegment(segment))
          .filter(Boolean)

        if (hierarchy.length === 0) {
          if (currentPath.length === 0) {
            currentItems.push(foodItem)
          }
          return
        }
        
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
            const nextCategory = normalizeCategorySegment(hierarchy[currentPath.length])
            if (!nextCategory) {
              return
            }
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
  const visibleSubcategories = subcategories.filter(
    (category) => normalizeCategorySegment(category.name).length > 0,
  )

  const navigateToCategory = (categoryName: string) => {
    const nextUrl = getFoodItemsUrl([...currentPath, categoryName])

    // Keep root `/food/items` as the single back target while browsing nested categories.
    if (currentPath.length === 0) {
      router.push(nextUrl)
      return
    }

    router.replace(nextUrl)
  }

  const navigateUp = () => {
    const nextPath = currentPath.slice(0, -1)
    const nextUrl = getFoodItemsUrl(nextPath)

    // Preserve root as the "previous page" destination from any nested level.
    if (nextPath.length === 0) {
      router.push(nextUrl)
      return
    }

    router.replace(nextUrl)
  }

  const navigateToPath = (pathIndex: number) => {
    const nextPath = currentPath.slice(0, pathIndex + 1)
    const nextUrl = getFoodItemsUrl(nextPath)

    // Breadcrumb jumps inside category browsing should not stack browser history.
    if (nextPath.length === 0) {
      router.push(nextUrl)
      return
    }

    router.replace(nextUrl)
  }

  return (
    <div className="min-h-screen bg-[var(--flow-background)]">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Header */}
        <header className="space-y-5 mb-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2 text-[var(--flow-text)]">
                  <Apple className="h-6 w-6 text-[var(--flow-accent)]" />
                  Food Items
                </h1>
              </div>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <CreateFoodItemForm 
                open={showCreateForm} 
                onOpenChange={setShowCreateForm}
              >
                <Button
                  size="sm"
                  className="w-full sm:w-auto border-[color:var(--flow-border)] bg-[var(--flow-surface)] text-[var(--flow-text)] hover:bg-[var(--flow-hover)] shadow-[var(--flow-shadow)]"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Item
                </Button>
              </CreateFoodItemForm>
            </div>
          </div>

          {/* Category Path Navigation */}
          {showPathNavigation && (
            <div className="flex items-center justify-between gap-3 rounded-xl border border-[color:var(--flow-border)] bg-[var(--flow-surface)] p-2 shadow-[var(--flow-shadow)]">
              <div ref={pathScrollRef} className="min-w-0 flex-1 overflow-x-auto">
                <div className="flex w-max items-center gap-1">
                  {showAllItemsBreadcrumb && (
                    <button
                      type="button"
                      onClick={() => router.push('/food/items')}
                      className="rounded-md px-2.5 py-1.5 text-xs font-medium text-[var(--flow-text-muted)] transition-colors hover:bg-[var(--flow-hover)] hover:text-[var(--flow-text)]"
                    >
                      All Items
                    </button>
                  )}

                  {hiddenPathCount > 0 && (
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] text-[var(--flow-text-muted)]">/</span>
                      <span className="rounded-md px-2 py-1 text-[10px] font-medium text-[var(--flow-text-muted)]">
                        +{hiddenPathCount}
                      </span>
                    </div>
                  )}

                  {visiblePath.map((pathSegment, index) => {
                    const realPathIndex = visiblePathStartIndex + index

                    return (
                      <div key={`${pathSegment}-${realPathIndex}`} className="flex items-center gap-1">
                        {(showAllItemsBreadcrumb || hiddenPathCount > 0 || index > 0) && (
                          <span className="text-[10px] text-[var(--flow-text-muted)]">/</span>
                        )}
                        {realPathIndex === currentPath.length - 1 ? (
                        <span className="rounded-md bg-[var(--flow-accent)]/12 px-2.5 py-1.5 text-xs font-medium text-[var(--flow-accent)]">
                          {pathSegment}
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => navigateToPath(realPathIndex)}
                          className="rounded-md px-2.5 py-1.5 text-xs font-medium text-[var(--flow-text-muted)] transition-colors hover:bg-[var(--flow-hover)] hover:text-[var(--flow-text)]"
                        >
                          {pathSegment}
                        </button>
                      )}
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )}
        </header>

        {/* Content */}
        {isLoading && <FoodItemsSkeleton />}
        
        {error && (
          <Card className="border-[color:var(--flow-border)] bg-[var(--flow-surface)] shadow-[var(--flow-shadow)]">
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
              <Card className="animate-fade-in border-[color:var(--flow-border)] bg-[var(--flow-surface)] shadow-[var(--flow-shadow)]">
                <CardContent className="p-8 text-center">
                  <Apple className="h-12 w-12 text-[var(--flow-text-muted)] mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2 text-[var(--flow-text)]">No Food Items Yet</h3>
                  <p className="text-[var(--flow-text-muted)] mb-4">
                    Create your first food item to start tracking nutrition and building recipes.
                  </p>
                  <Button
                    onClick={() => setShowCreateForm(true)}
                    className="border-[color:var(--flow-border)] bg-[var(--flow-surface)] text-[var(--flow-text)] hover:bg-[var(--flow-hover)] shadow-[var(--flow-shadow)]"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Food Item
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6 animate-fade-in">
                {/* Show subcategories first */}
                {visibleSubcategories.length > 0 && (
                  <div className="space-y-3">
                    <h2 className="text-lg font-semibold text-[var(--flow-text)]">Categories</h2>
                    <div className="space-y-2">
                      {visibleSubcategories.map((category) => (
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
                    <h2 className="text-lg font-semibold text-[var(--flow-text)]">
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
                {visibleSubcategories.length === 0 && currentItems.length === 0 && (
                  <Card className="border-[color:var(--flow-border)] bg-[var(--flow-surface)] shadow-[var(--flow-shadow)]">
                    <CardContent className="p-8 text-center">
                      <Folder className="h-12 w-12 text-[var(--flow-text-muted)] mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2 text-[var(--flow-text)]">No Items in This Category</h3>
                      <p className="text-[var(--flow-text-muted)] mb-4">
                        This category doesn&apos;t contain any food items yet.
                      </p>
                      <Button
                        className="border-[color:var(--flow-border)] bg-[var(--flow-surface)] text-[var(--flow-text)] hover:bg-[var(--flow-hover)] shadow-[var(--flow-shadow)]"
                        onClick={navigateUp}
                      >
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

export default function FoodItemsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[var(--flow-background)]">
          <div className="container mx-auto max-w-4xl px-4 py-6">
            <FoodItemsSkeleton />
          </div>
        </div>
      }
    >
      <FoodItemsPageContent />
    </Suspense>
  )
}
