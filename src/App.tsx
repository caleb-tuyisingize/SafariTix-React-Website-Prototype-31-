import { useState, useEffect } from 'react'
import { ThemeProvider } from './components/theme-provider'
import { Header } from './components/header'
import { HeroSection } from './components/hero-section'
import { FeaturesSection } from './components/features-section'
import { Footer } from './components/footer'
import { AuthModal } from './components/auth-modal'
import { Toaster } from './components/ui/sonner'
import { CommutterDashboard } from './components/dashboards/commuter-dashboard'
import { CompanyDashboard } from './components/dashboards/company-dashboard'
import { AdminDashboard } from './components/dashboards/admin-dashboard'

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userType, setUserType] = useState(null)
  const [userInfo, setUserInfo] = useState(null)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authDefaultTab, setAuthDefaultTab] = useState('login')

  // Check for existing session on load
  useEffect(() => {
    const savedUser = localStorage.getItem('safaritix-user')
    if (savedUser) {
      const user = JSON.parse(savedUser)
      setIsLoggedIn(true)
      setUserType(user.type)
      setUserInfo(user)
    }
  }, [])

  const handleLogin = () => {
    setAuthDefaultTab('login')
    setShowAuthModal(true)
  }

  const handleRegister = () => {
    setAuthDefaultTab('register')
    setShowAuthModal(true)
  }

  const handleAuthSuccess = (type, info) => {
    setIsLoggedIn(true)
    setUserType(type)
    setUserInfo(info)
    setShowAuthModal(false)
    // Save to localStorage
    localStorage.setItem('safaritix-user', JSON.stringify({ type, ...info }))
  }

  const handleLogout = () => {
    setIsLoggedIn(false)
    setUserType(null)
    setUserInfo(null)
    localStorage.removeItem('safaritix-user')
    localStorage.removeItem('safaritix-access-token')
  }

  const handleBookNow = () => {
    if (isLoggedIn) {
      // Navigate to booking within dashboard
      if (userType === 'commuter') {
        // This will be handled within the commuter dashboard
      }
    } else {
      setAuthDefaultTab('register')
      setShowAuthModal(true)
    }
  }

  const handleLearnMore = () => {
    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })
  }

  // Render appropriate dashboard based on user type
  if (isLoggedIn && userType) {
    return (
      <ThemeProvider defaultTheme="system" storageKey="safaritix-theme">
        {userType === 'commuter' && (
          <CommutterDashboard userInfo={userInfo} onLogout={handleLogout} />
        )}
        {userType === 'company' && (
          <CompanyDashboard userInfo={userInfo} onLogout={handleLogout} />
        )}
        {userType === 'admin' && (
          <AdminDashboard userInfo={userInfo} onLogout={handleLogout} />
        )}
        <Toaster />
      </ThemeProvider>
    )
  }

  return (
    <ThemeProvider defaultTheme="system" storageKey="safaritix-theme">
      <div className="min-h-screen bg-background">
        {/* Development Mode Notice */}
        <div className="hidden bg-blue-50 border-b border-blue-200 p-2">
          <div className="container mx-auto px-4">
            <p className="hidden text-sm text-blue-700 text-center">
              🚧 <strong>Development Mode:</strong> Admin access available - Use "Use Admin Credentials" button on login page
            </p>
          </div>
        </div>
        
        <Header onLoginClick={handleLogin} onRegisterClick={handleRegister} />
        
        <HeroSection 
          onBookNowClick={handleBookNow}
          onLearnMoreClick={handleLearnMore}
        />
        
        <FeaturesSection />
        
        <Footer />

        <AuthModal
          open={showAuthModal}
          onOpenChange={setShowAuthModal}
          defaultTab={authDefaultTab}
          onSuccess={handleAuthSuccess}
        />

        <Toaster />
      </div>
    </ThemeProvider>
  )
}