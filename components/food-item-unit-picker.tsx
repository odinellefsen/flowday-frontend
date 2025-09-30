'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { 
  Search, 
  ArrowLeft, 
  Folder, 
  FolderOpen, 
  ChevronRight, 
  Apple,
  Scale,
} from 'lucide-react'
import { useApiClient } from '@/lib/api-client'
import type { FoodItem, FoodItemUnit } from '@/lib/food-types'

interface AttachedFoodUnit {
  foodItemUnitId: string
  foodItemId: string
  foodItemName: string
  unitOfMeasurement: string
  quantityOfFoodItemUnit: number
  calories?: number
}

interface FoodItemUnitPickerProps {
  children: React.ReactNode
  onAttachUnit: (unit: AttachedFoodUnit) => void
}

// Category navigation component (reusing logic from food items page)
function FoodItemBrowser({ 
  onSelectFoodItem, 
  currentPath, 
  setCurrentPath 
}: { 
  onSelectFoodItem: (foodItem: FoodItem) => void
  currentPath: string[]
  setCurrentPath: (path: string[]) => void
}) {
  const apiClient = useApiClient()

  const { data: foodItems, isLoading } = useQuery({
    queryKey: ['foodItems'],
    queryFn: apiClient.listFoodItems,
  })

  const foodItemsList = foodItems?.data || []

  // Same logic as food items page for category navigation
  const getCurrentLevelData = () => {
    const currentItems: FoodItem[] = []
    const subcategories = new Map<string, { count: number; hasSubcategories: boolean }>()

    foodItemsList.forEach((foodItem) => {
      if (!foodItem.categoryHierarchy || foodItem.categoryHierarchy.length === 0) {
        if (currentPath.length === 0) {
          currentItems.push(foodItem)
        }
      } else {
        const hierarchy = foodItem.categoryHierarchy
        const isExactMatch = currentPath.every((pathSegment, index) => 
          hierarchy[index] === pathSegment
        )

        if (isExactMatch) {
          if (hierarchy.length === currentPath.length) {
            currentItems.push(foodItem)
          } else if (hierarchy.length > currentPath.length) {
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

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-4">
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
          <Button variant="ghost" size="sm" onClick={navigateUp}>
            <ArrowLeft className="h-3 w-3 mr-1" />
            Back
          </Button>
        )}
      </div>

      {/* Categories */}
      {subcategories.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold">Categories</h3>
          {subcategories.map((category) => (
            <Card 
              key={category.name}
              className="cursor-pointer hover:bg-accent/50 transition-colors"
              onClick={() => navigateToCategory(category.name)}
            >
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {category.hasSubcategories ? (
                      <Folder className="h-4 w-4 text-primary" />
                    ) : (
                      <FolderOpen className="h-4 w-4 text-primary" />
                    )}
                    <span className="font-medium">{category.name}</span>
                    <Badge variant="outline" className="text-xs">
                      {category.count}
                    </Badge>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Food Items */}
      {currentItems.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold">
            {currentPath.length === 0 ? 'Uncategorized Items' : 'Food Items'}
          </h3>
          {currentItems.map((foodItem) => (
            <Card 
              key={foodItem.id}
              className="cursor-pointer hover:bg-accent/50 transition-colors"
              onClick={() => onSelectFoodItem(foodItem)}
            >
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Apple className="h-4 w-4 text-primary" />
                    <span className="font-medium">{foodItem.name}</span>
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
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Empty state */}
      {subcategories.length === 0 && currentItems.length === 0 && (
        <div className="text-center py-8">
          <Apple className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No food items in this category</p>
          {currentPath.length > 0 && (
            <Button variant="outline" size="sm" className="mt-2" onClick={navigateUp}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
          )}
        </div>
      )}
    </div>
  )
}

// Unit selection component
function UnitSelector({ 
  foodItem, 
  onSelectUnit, 
  onBack 
}: { 
  foodItem: FoodItem
  onSelectUnit: (unit: FoodItemUnit, quantity: number) => void
  onBack: () => void
}) {
  const [quantity, setQuantity] = useState(1)
  const apiClient = useApiClient()

  const { data: unitsData, isLoading } = useQuery({
    queryKey: ['foodItemUnits', foodItem.id],
    queryFn: () => apiClient.getFoodItemUnits(foodItem.id),
  })

  const units = unitsData?.data || []

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Skeleton className="h-6 w-32" />
        </div>
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-20 w-full" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h3 className="font-semibold">{foodItem.name}</h3>
          <p className="text-sm text-muted-foreground">Choose a measurement unit</p>
        </div>
      </div>

      {/* Quantity Input */}
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium">Quantity:</label>
        <Input
          type="number"
          min="0.1"
          max="1000"
          step="0.1"
          value={quantity}
          onChange={(e) => setQuantity(parseFloat(e.target.value) || 1)}
          className="w-24"
        />
      </div>

      {/* Units Grid */}
      {units.length === 0 ? (
        <div className="text-center py-8">
          <Scale className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No units available for this food item</p>
          <p className="text-sm text-muted-foreground mt-1">
            Add measurement units to use this food item in recipes
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          <h4 className="text-sm font-semibold">Available Units</h4>
          {units.map((unit) => (
            <Card 
              key={unit.id}
              className="cursor-pointer hover:bg-accent/50 transition-colors"
              onClick={() => onSelectUnit(unit, quantity)}
            >
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Scale className="h-4 w-4 text-primary" />
                    <div>
                      <span className="font-medium">{unit.unitOfMeasurement}</span>
                      {unit.unitDescription && (
                        <p className="text-xs text-muted-foreground">{unit.unitDescription}</p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">
                      {quantity}x = {(unit.calories * quantity).toFixed(1)} cal
                    </div>
                    {unit.source && (
                      <Badge variant="outline" className="text-xs">
                        {unit.source.replace('_', ' ')}
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

// Main picker component
export function FoodItemUnitPicker({ children, onAttachUnit }: FoodItemUnitPickerProps) {
  const [open, setOpen] = useState(false)
  const [selectedFoodItem, setSelectedFoodItem] = useState<FoodItem | null>(null)
  const [currentPath, setCurrentPath] = useState<string[]>([])

  const handleSelectFoodItem = (foodItem: FoodItem) => {
    if (!foodItem.hasUnits) {
      // Show message that this food item has no units
      return
    }
    setSelectedFoodItem(foodItem)
  }

  const handleSelectUnit = (unit: FoodItemUnit, quantity: number) => {
    const attachedUnit: AttachedFoodUnit = {
      foodItemUnitId: unit.id,
      foodItemId: unit.foodItemId,
      foodItemName: unit.foodItemName,
      unitOfMeasurement: unit.unitOfMeasurement,
      quantityOfFoodItemUnit: quantity,
      calories: unit.calories,
    }
    
    onAttachUnit(attachedUnit)
    setOpen(false)
    setSelectedFoodItem(null)
    setCurrentPath([])
  }

  const handleBack = () => {
    setSelectedFoodItem(null)
  }

  const handleClose = () => {
    setOpen(false)
    setSelectedFoodItem(null)
    setCurrentPath([])
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-hidden animate-scale-in">
        <DialogHeader className="space-y-3">
          <DialogTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            {selectedFoodItem ? 'Select Unit & Quantity' : 'Choose Food Item'}
          </DialogTitle>
          <DialogDescription>
            {selectedFoodItem 
              ? `Select a measurement unit for ${selectedFoodItem.name} and specify the quantity.`
              : 'Browse through your food items and select one to attach to this instruction step.'
            }
          </DialogDescription>
        </DialogHeader>

        <div className="overflow-y-auto max-h-[50vh] px-1">
          {selectedFoodItem ? (
            <UnitSelector
              foodItem={selectedFoodItem}
              onSelectUnit={handleSelectUnit}
              onBack={handleBack}
            />
          ) : (
            <FoodItemBrowser
              onSelectFoodItem={handleSelectFoodItem}
              currentPath={currentPath}
              setCurrentPath={setCurrentPath}
            />
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// Component to display attached units as badges
export function AttachedUnitBadge({ 
  unit, 
  onRemove 
}: { 
  unit: AttachedFoodUnit
  onRemove: () => void 
}) {
  return (
    <Badge variant="secondary" className="text-xs flex items-center gap-1 pr-1">
      <span>
        {unit.quantityOfFoodItemUnit}x {unit.unitOfMeasurement} {unit.foodItemName}
      </span>
      {unit.calories && (
        <span className="text-muted-foreground">
          ({(unit.calories * unit.quantityOfFoodItemUnit).toFixed(0)} cal)
        </span>
      )}
      <button
        onClick={onRemove}
        className="ml-1 hover:text-destructive transition-colors"
      >
        <X className="h-3 w-3" />
      </button>
    </Badge>
  )
}

function X({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      height="24"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
      width="24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="m18 6-12 12" />
      <path d="m6 6 12 12" />
    </svg>
  )
}
