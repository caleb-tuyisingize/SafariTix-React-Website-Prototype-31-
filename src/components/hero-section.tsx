import { Button } from './ui/button'
import { ArrowRight, MapPin, Clock, Shield } from 'lucide-react'
import { ImageWithFallback } from './figma/ImageWithFallback'

interface HeroSectionProps {
  onBookNowClick: () => void
  onLearnMoreClick: () => void
}

export function HeroSection({ onBookNowClick, onLearnMoreClick }: HeroSectionProps) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-20 sm:py-32">
      <div className="container px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="inline-flex items-center rounded-full border bg-background/60 px-3 py-1 text-sm">
                <span className="h-2 w-2 rounded-full bg-green-500 mr-2"></span>
                Fast, reliable bus ticketing
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
                Fast, reliable bus ticketing for{' '}
                <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                  commuters and companies
                </span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-lg">
                Book tickets instantly, track buses in real-time, and manage your journey with ease. 
                SafariTix modernizes bus travel across Rwanda with cutting-edge technology.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
                onClick={onBookNowClick}
              >
                Book Your Ticket
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline" onClick={onLearnMoreClick}>
                Learn More
              </Button>
            </div>

            {/* Feature Highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-8">
              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <MapPin className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold">Real-time tracking</h3>
                  <p className="text-sm text-muted-foreground">GPS location updates</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg">
                  <Clock className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold">Instant booking</h3>
                  <p className="text-sm text-muted-foreground">Book in seconds</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-lg">
                  <Shield className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold">Secure payments</h3>
                  <p className="text-sm text-muted-foreground">Safe & reliable</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Image */}
          <div className="relative">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1671715448361-696135504295?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBidXMlMjB0cmFuc3BvcnRhdGlvbiUyMFJ3YW5kYXxlbnwxfHx8fDE3NTk0NzQwMjR8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                alt="Modern bus transportation in Rwanda"
                className="w-full h-[400px] object-cover"
              />
              {/* Overlay with stats */}
              <div className="absolute bottom-4 left-4 right-4">
                <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-lg p-4 grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">150+</div>
                    <div className="text-xs text-muted-foreground">Active Buses</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">50K+</div>
                    <div className="text-xs text-muted-foreground">Happy Users</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">25+</div>
                    <div className="text-xs text-muted-foreground">Routes</div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Floating elements */}
            <div className="absolute -top-4 -right-4 w-16 h-16 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-full opacity-20 animate-pulse"></div>
            <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full opacity-10 animate-pulse delay-1000"></div>
          </div>
        </div>
      </div>

      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
    </section>
  )
}