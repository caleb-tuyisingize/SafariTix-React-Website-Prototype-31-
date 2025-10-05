import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { 
  Smartphone, 
  MapPin, 
  CreditCard, 
  Users, 
  Calendar, 
  BarChart3,
  Shield,
  Clock,
  Zap
} from 'lucide-react'

export function FeaturesSection() {
  const features = [
    {
      icon: Smartphone,
      title: 'Mobile-First Design',
      description: 'Book tickets on the go with our responsive mobile interface optimized for all devices.',
      badge: 'User-Friendly',
      color: 'blue'
    },
    {
      icon: MapPin,
      title: 'Real-Time GPS Tracking',
      description: 'Track your bus location in real-time and get accurate arrival estimates.',
      badge: 'Live Updates',
      color: 'green'
    },
    {
      icon: CreditCard,
      title: 'Secure Payments',
      description: 'Multiple payment options with bank-grade security for safe transactions.',
      badge: 'Secure',
      color: 'purple'
    },
    {
      icon: Users,
      title: 'Fleet Management',
      description: 'Complete bus fleet management system for transport companies.',
      badge: 'Business',
      color: 'orange'
    },
    {
      icon: Calendar,
      title: 'Smart Scheduling',
      description: 'Advanced scheduling system with automated seat management.',
      badge: 'Automated',
      color: 'cyan'
    },
    {
      icon: BarChart3,
      title: 'Analytics Dashboard',
      description: 'Comprehensive analytics for revenue tracking and performance insights.',
      badge: 'Insights',
      color: 'pink'
    }
  ]

  const stats = [
    { label: 'Active Users', value: '50,000+', icon: Users },
    { label: 'Daily Bookings', value: '2,500+', icon: Calendar },
    { label: 'Route Coverage', value: '95%', icon: MapPin },
    { label: 'Uptime', value: '99.9%', icon: Zap }
  ]

  return (
    <section id="features" className="py-20 bg-muted/30">
      <div className="container px-4">
        {/* Header */}
        <div className="text-center space-y-4 mb-16">
          <Badge variant="outline" className="text-blue-600 border-blue-200">
            Everything you need for modern transport
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-bold">
            How it works
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            SafariTix streamlines the entire bus travel experience from booking to arrival, 
            making transportation smarter for everyone.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <Card key={index} className="border-0 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className={`p-3 rounded-lg bg-${feature.color}-100 dark:bg-${feature.color}-900/20`}>
                      <Icon className={`h-6 w-6 text-${feature.color}-600`} />
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {feature.badge}
                    </Badge>
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Stats Section */}
        <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl p-8 text-white">
          <div className="text-center mb-12">
            <h3 className="text-2xl sm:text-3xl font-bold mb-4">
              Trusted by thousands across Rwanda
            </h3>
            <p className="text-blue-100 max-w-2xl mx-auto">
              Join the growing community of commuters and transport companies 
              who trust SafariTix for their daily travel needs.
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon
              return (
                <div key={index} className="text-center">
                  <div className="flex justify-center mb-3">
                    <div className="p-3 rounded-lg bg-white/10 backdrop-blur-sm">
                      <Icon className="h-6 w-6" />
                    </div>
                  </div>
                  <div className="text-2xl sm:text-3xl font-bold mb-1">{stat.value}</div>
                  <div className="text-blue-100 text-sm">{stat.label}</div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}