'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Apple, ArrowLeft, Plus, Search } from 'lucide-react'
import Link from 'next/link'

export default function FoodItemsPage() {
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
            <Button variant="outline" size="sm">
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </Button>
          </div>
        </header>

        {/* Coming Soon Card */}
        <Card className="animate-fade-in">
          <CardHeader className="text-center">
            <CardTitle className="text-xl">Food Items Coming Soon! 🍎</CardTitle>
            <CardDescription className="max-w-md mx-auto">
              This section will allow you to manage individual food items, track their nutritional 
              information, and organize them by categories. Features will include:
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <h4 className="font-medium">🥕 Food Management</h4>
                <ul className="text-muted-foreground space-y-1">
                  <li>• Add custom food items</li>
                  <li>• Set nutritional information</li>
                  <li>• Organize by categories</li>
                  <li>• Search and filter items</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">📊 Nutrition Tracking</h4>
                <ul className="text-muted-foreground space-y-1">
                  <li>• Calories per serving</li>
                  <li>• Macronutrients (protein, carbs, fat)</li>
                  <li>• Vitamins and minerals</li>
                  <li>• Custom serving sizes</li>
                </ul>
              </div>
            </div>
            <div className="pt-4 text-center">
              <p className="text-xs text-muted-foreground">
                This feature is currently in development and will be available soon!
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
