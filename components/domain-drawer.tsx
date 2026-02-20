'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer'
import { Badge } from '@/components/ui/badge'
import { 
  UtensilsCrossed, 
  Dumbbell, 
  GraduationCap, 
} from 'lucide-react'

interface Domain {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  implemented: boolean
  comingSoon?: boolean
}

const domains: Domain[] = [
  {
    id: 'food',
    name: 'Food',
    description: 'Manage recipes, meals, and nutrition tracking',
    icon: <UtensilsCrossed className="h-6 w-6" />,
    implemented: true,
  },
  {
    id: 'fitness',
    name: 'Fitness',
    description: 'Track workouts, exercises, and fitness goals',
    icon: <Dumbbell className="h-6 w-6" />,
    implemented: false,
    comingSoon: true,
  },
  {
    id: 'school',
    name: 'School',
    description: 'Organize assignments, courses, and study schedules',
    icon: <GraduationCap className="h-6 w-6" />,
    implemented: false,
    comingSoon: true,
  },
]

interface DomainDrawerProps {
  children: React.ReactNode
}

export function DomainDrawer({ children }: DomainDrawerProps) {
  const [open, setOpen] = useState(false)
  const router = useRouter()

  const handleDomainClick = (domain: Domain) => {
    if (!domain.implemented) {
      // Show coming soon message
      alert(`${domain.name} domain is coming soon! 🚀`)
      return
    }

    // Navigate to domain-specific page
    if (domain.id === 'food') {
      router.push('/food')
    }
    
    setOpen(false)
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        {children}
      </DrawerTrigger>
      <DrawerContent className="max-h-[85vh]">
        <div className="mx-auto w-full max-w-sm">
          <div className="p-4 pb-0 space-y-3">
            {domains.map((domain, index) => (
              <button
                key={domain.id}
                onClick={() => handleDomainClick(domain)}
                disabled={!domain.implemented}
                className={`
                  w-full p-4 rounded-lg border text-left transition-all duration-200 animate-slide-up
                  ${domain.implemented 
                    ? 'hover:bg-accent hover:border-accent-foreground/20 cursor-pointer hover:scale-[1.02]' 
                    : 'opacity-60 cursor-not-allowed bg-muted/30'
                  }
                  ${domain.implemented 
                    ? 'border-border' 
                    : 'border-dashed border-muted-foreground/30'
                  }
                `}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`
                      p-2 rounded-md 
                      ${domain.implemented 
                        ? 'bg-primary/10 text-primary' 
                        : 'bg-muted text-muted-foreground'
                      }
                    `}>
                      {domain.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-sm">{domain.name}</h3>
                        {domain.comingSoon && (
                          <Badge variant="outline" className="text-xs px-2 py-0">
                            Coming Soon
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {domain.description}
                      </p>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
