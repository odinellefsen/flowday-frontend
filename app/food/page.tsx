'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Apple, 
  ChefHat, 
  UtensilsCrossed, 
  ArrowLeft,
  ArrowRight,
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface FoodSection {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  href: string
  implemented: boolean
  comingSoon?: boolean
}

const foodSections: FoodSection[] = [
  {
    id: 'food-items',
    name: 'Food Items',
    description: 'Manage individual food items and their nutritional information',
    icon: <Apple className="h-6 w-6" />,
    href: '/food/items',
    implemented: true, // Enable navigation to placeholder page
    comingSoon: false,
  },
  {
    id: 'recipes',
    name: 'Recipes',
    description: 'Create and manage recipes with ingredients and instructions',
    icon: <ChefHat className="h-6 w-6" />,
    href: '/food/recipes',
    implemented: true, // Enable navigation to placeholder page
    comingSoon: false,
  },
  {
    id: 'meals',
    name: 'Meals',
    description: 'Plan meals by combining recipes and track preparation',
    icon: <UtensilsCrossed className="h-6 w-6" />,
    href: '/food/meals',
    implemented: true, // Enable navigation to placeholder page
    comingSoon: false,
  },
]

export default function FoodPage() {
  const router = useRouter()

  const handleSectionClick = (section: FoodSection) => {
    if (!section.implemented) {
      alert(`${section.name} section is coming soon! 🚀`)
      return
    }
    // Navigate to the section page
    router.push(section.href)
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        {/* Header */}
        <header className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Link href="/">
              <Button variant="ghost" size="sm" className="p-2">
                <ArrowLeft className="h-4 w-4" />
                <span className="sr-only">Back to home</span>
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
                <UtensilsCrossed className="h-6 w-6 text-primary" />
                Food Domain
              </h1>
              <p className="text-sm text-muted-foreground">
                Manage your food items, recipes, and meals
              </p>
            </div>
          </div>
        </header>

        {/* Food Sections */}
        <div className="space-y-4 animate-fade-in">
          {foodSections.map((section, index) => (
            <Card 
              key={section.id} 
              className={`
                transition-all duration-200 animate-slide-up
                ${section.implemented 
                  ? 'hover:shadow-md cursor-pointer' 
                  : 'opacity-75'
                }
              `}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardContent className="p-0">
                <div
                  className={`
                    p-6 transition-all duration-200
                    ${section.implemented 
                      ? 'hover:bg-accent/50' 
                      : 'cursor-not-allowed'
                    }
                  `}
                  onClick={() => handleSectionClick(section)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`
                        p-3 rounded-lg 
                        ${section.implemented 
                          ? 'bg-primary/10 text-primary' 
                          : 'bg-muted text-muted-foreground'
                        }
                      `}>
                        {section.icon}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-lg">{section.name}</h3>
                          {section.comingSoon && (
                            <Badge variant="outline" className="text-xs">
                              Coming Soon
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {section.description}
                        </p>
                      </div>
                    </div>
                    {section.implemented && (
                      <ArrowRight className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Footer Info */}
        <div className="mt-12 text-center">
          <p className="text-sm text-muted-foreground">
            More food management features coming soon! 🍽️
          </p>
        </div>
      </div>
    </div>
  )
}
