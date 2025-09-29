'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Plus, Scale } from 'lucide-react'
import Link from 'next/link'

interface PageProps {
  params: {
    foodItemId: string
  }
}

export default function FoodItemUnitsPage({ params }: PageProps) {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Header */}
        <header className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Link href="/food/items">
              <Button variant="ghost" size="sm" className="p-2">
                <ArrowLeft className="h-4 w-4" />
                <span className="sr-only">Back to food items</span>
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
                <Scale className="h-6 w-6 text-primary" />
                Food Item Units
              </h1>
              <p className="text-sm text-muted-foreground">
                Manage measurement units and nutritional information
              </p>
            </div>
          </div>
          <Button size="sm" disabled>
            <Plus className="h-4 w-4 mr-2" />
            Add Unit
          </Button>
        </header>

        {/* Coming Soon Card */}
        <Card className="animate-fade-in">
          <CardHeader className="text-center">
            <CardTitle className="text-xl">Units Management Coming Soon! ⚖️</CardTitle>
            <CardDescription className="max-w-md mx-auto">
              This page will allow you to manage measurement units for food item: <Badge variant="outline">{params.foodItemId}</Badge>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <h4 className="font-medium">📏 Unit Management</h4>
                <ul className="text-muted-foreground space-y-1">
                  <li>• Add measurement units (slice, whole, gram, etc.)</li>
                  <li>• Set unit descriptions</li>
                  <li>• Define serving sizes</li>
                  <li>• Set measurement source</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">🥗 Nutrition Information</h4>
                <ul className="text-muted-foreground space-y-1">
                  <li>• Calories per unit</li>
                  <li>• Macronutrients (protein, carbs, fat)</li>
                  <li>• Fiber and sugar content</li>
                  <li>• Sodium levels</li>
                </ul>
              </div>
            </div>
            <div className="pt-4 text-center space-y-2">
              <p className="text-xs text-muted-foreground">
                This feature is currently in development and will be available soon!
              </p>
              <div className="flex justify-center gap-2">
                <Badge variant="outline" className="text-xs">Weight Units</Badge>
                <Badge variant="outline" className="text-xs">Volume Units</Badge>
                <Badge variant="outline" className="text-xs">Count Units</Badge>
                <Badge variant="outline" className="text-xs">Custom Units</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
