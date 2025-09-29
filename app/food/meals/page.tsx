'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { UtensilsCrossed, ArrowLeft, Plus, Calendar } from 'lucide-react'
import Link from 'next/link'

export default function MealsPage() {
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
                <UtensilsCrossed className="h-6 w-6 text-primary" />
                Meals
              </h1>
              <p className="text-sm text-muted-foreground">
                Plan meals by combining recipes and track preparation
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Calendar className="h-4 w-4 mr-2" />
              Schedule
            </Button>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Plan Meal
            </Button>
          </div>
        </header>

        {/* Coming Soon Card */}
        <Card className="animate-fade-in">
          <CardHeader className="text-center">
            <CardTitle className="text-xl">Meal Planning Coming Soon! 🍽️</CardTitle>
            <CardDescription className="max-w-md mx-auto">
              This section will allow you to plan and schedule meals by combining recipes. 
              Features will include automatic todo generation and preparation tracking:
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <h4 className="font-medium">🍳 Meal Planning</h4>
                <ul className="text-muted-foreground space-y-1">
                  <li>• Combine multiple recipes</li>
                  <li>• Schedule meals by date/time</li>
                  <li>• Weekly meal planning</li>
                  <li>• Meal prep coordination</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">✅ Smart Integration</h4>
                <ul className="text-muted-foreground space-y-1">
                  <li>• Auto-generate cooking todos</li>
                  <li>• Track preparation progress</li>
                  <li>• Shopping list integration</li>
                  <li>• Habit-based meal scheduling</li>
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
