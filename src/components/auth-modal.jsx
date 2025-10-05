import { useState } from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Badge } from './ui/badge'
import { Bus, User, Building2, Shield, Eye, EyeOff } from 'lucide-react'
import { toast } from 'sonner@2.0.3'
import { projectId, publicAnonKey } from '../utils/supabase/info'

export function AuthModal({ open, onOpenChange, defaultTab = 'login', onSuccess }) {
  const [activeTab, setActiveTab] = useState(defaultTab)
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const [loginForm, setLoginForm] = useState({
    email: '',
    password: ''
  })

  const [registerForm, setRegisterForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    userType: 'commuter',
    companyName: ''
  })

  const handleLogin = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-2a7b3961/auth/login`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(loginForm)
        }
      )

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      
      if (data.success) {
        // Store access token
        localStorage.setItem('safaritix-access-token', data.accessToken)
        
        toast.success('Login successful!')
        onSuccess(data.user.userType, data.user)
        
        // Reset form
        setLoginForm({ email: '', password: '' })
      } else {
        toast.error(data.error || 'Login failed')
      }
    } catch (error) {
      console.error('Login error:', error)
      
      // Fallback for development - check for mock users or special admin login
      if (error.message.includes('Failed to fetch') || error.message.includes('TypeError')) {
        console.log('Server not available, checking for mock users in development')
        
        // Check for admin credentials first
        if (loginForm.email === 'admin@safaritix.com' && loginForm.password === 'admin123') {
          const adminUser = {
            id: 'admin-user-001',
            email: 'admin@safaritix.com',
            firstName: 'System',
            lastName: 'Administrator',
            userType: 'admin',
            status: 'active',
            createdAt: new Date().toISOString()
          }
          localStorage.setItem('safaritix-access-token', `mock-token-admin-user-001`)
          toast.success('Development mode: Admin login successful!')
          onSuccess(adminUser.userType, adminUser)
          setLoginForm({ email: '', password: '' })
          return
        }
        
        // Look for mock users in localStorage
        const mockUserKeys = Object.keys(localStorage).filter(key => key.startsWith('mock-user-'))
        let foundUser = null
        
        for (const key of mockUserKeys) {
          const mockUser = JSON.parse(localStorage.getItem(key))
          if (mockUser.email === loginForm.email) {
            foundUser = mockUser
            break
          }
        }
        
        if (foundUser) {
          localStorage.setItem('safaritix-access-token', `mock-token-${foundUser.id}`)
          toast.success('Development mode: Login successful!')
          onSuccess(foundUser.userType, foundUser)
          setLoginForm({ email: '', password: '' })
        } else {
          toast.error('Development mode: User not found. Please register first.')
        }
      } else {
        toast.error('Login failed. Please try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    
    if (registerForm.password !== registerForm.confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    if (registerForm.password.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-2a7b3961/auth/register`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            email: registerForm.email,
            password: registerForm.password,
            firstName: registerForm.firstName,
            lastName: registerForm.lastName,
            userType: registerForm.userType,
            companyName: registerForm.companyName
          })
        }
      )

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      
      if (data.success) {
        toast.success(data.message || 'Registration successful!')
        
        if (data.user.userType === 'company' && data.user.status === 'pending') {
          // Company registration - show pending message
          toast.info('Your account is pending admin approval. You will be notified once approved.')
        }
        
        onSuccess(data.user.userType, data.user)
        
        // Reset form
        setRegisterForm({
          firstName: '',
          lastName: '',
          email: '',
          password: '',
          confirmPassword: '',
          userType: 'commuter',
          companyName: ''
        })
      } else {
        toast.error(data.error || 'Registration failed')
      }
    } catch (error) {
      console.error('Registration error:', error)
      
      // Fallback for development - create a mock user
      if (error.message.includes('Failed to fetch') || error.message.includes('TypeError')) {
        console.log('Server not available, creating mock user for development')
        
        const mockUser = {
          id: `mock_${Date.now()}`,
          email: registerForm.email,
          firstName: registerForm.firstName,
          lastName: registerForm.lastName,
          userType: registerForm.userType,
          companyName: registerForm.companyName,
          status: registerForm.userType === 'company' ? 'pending' : 'active',
          createdAt: new Date().toISOString()
        }
        
        // Store in localStorage for development
        localStorage.setItem(`mock-user-${mockUser.id}`, JSON.stringify(mockUser))
        
        toast.success('Development mode: Registration successful!')
        onSuccess(mockUser.userType, mockUser)
        
        // Reset form
        setRegisterForm({
          firstName: '',
          lastName: '',
          email: '',
          password: '',
          confirmPassword: '',
          userType: 'commuter',
          companyName: ''
        })
      } else {
        toast.error('Registration failed. Please try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const getUserTypeIcon = (type) => {
    switch (type) {
      case 'commuter': return <User className="h-4 w-4" />
      case 'company': return <Building2 className="h-4 w-4" />
      case 'admin': return <Shield className="h-4 w-4" />
      default: return <User className="h-4 w-4" />
    }
  }

  const getUserTypeDescription = (type) => {
    switch (type) {
      case 'commuter': return 'Book and manage your bus tickets'
      case 'company': return 'Manage your fleet and schedules'
      case 'admin': return 'System administration access'
      default: return ''
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg">
              <Bus className="h-6 w-6 text-white" />
            </div>
          </div>
          <DialogTitle className="text-center">Welcome to SafariTix</DialogTitle>
          <DialogDescription className="text-center">
            Your modern bus ticketing platform for Rwanda
          </DialogDescription>
          <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-xs text-blue-700 text-center">
              🚧 Welcome
            </p>
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Sign In</TabsTrigger>
            <TabsTrigger value="register">Register</TabsTrigger>
          </TabsList>

          <TabsContent value="login" className="space-y-4">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="login-email">Email</Label>
                <Input
                  id="login-email"
                  type="email"
                  placeholder="Enter your email"
                  value={loginForm.email}
                  onChange={(e) => setLoginForm(prev => ({ ...prev, email: e.target.value }))}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="login-password">Password</Label>
                <div className="relative">
                  <Input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={loginForm.password}
                    onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Signing In...' : 'Sign In'}
              </Button>
            </form>

            {/* Quick Admin Access */}
            <div className="border-t pt-4">
              <div className="hidden text-center text-sm text-muted-foreground mb-2">
                Admin Access
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="hidden w-full" 
                onClick={() => {
                  setLoginForm({ email: 'admin@safaritix.com', password: 'admin123' })
                }}
              >
                <Shield className="mr-2 h-4 w-4" />
                Use Admin Credentials
              </Button>
            </div>

            <div className="text-center text-sm text-muted-foreground">
              Don't have an account?{' '}
              <Button variant="link" className="p-0 h-auto" onClick={() => setActiveTab('register')}>
                Register here
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="register" className="space-y-4">
            <form onSubmit={handleRegister} className="space-y-4">
              {/* User Type Selection */}
              <div className="space-y-2">
                <Label>Account Type</Label>
                <Select 
                  value={registerForm.userType} 
                  onValueChange={(value) => setRegisterForm(prev => ({ ...prev, userType: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="commuter">
                      <div className="flex items-center gap-2">
                        {getUserTypeIcon('commuter')}
                        <div>
                          <div>Passenger</div>
                          <div className="text-xs text-muted-foreground">
                            {getUserTypeDescription('commuter')}
                          </div>
                        </div>
                      </div>
                    </SelectItem>
                    <SelectItem value="company">
                      <div className="flex items-center gap-2">
                        {getUserTypeIcon('company')}
                        <div>
                          <div>Transport Company</div>
                          <div className="text-xs text-muted-foreground">
                            {getUserTypeDescription('company')}
                          </div>
                        </div>
                      </div>
                    </SelectItem>
                    <SelectItem value="admin">
                      <div className="flex hidden items-center gap-2">
                        {getUserTypeIcon('admin')}
                        <div>
                          <div>System Administrator</div>
                          <div className="text-xs text-muted-foreground">
                            {getUserTypeDescription('admin')}
                          </div>
                        </div>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Personal Information */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    placeholder="John"
                    value={registerForm.firstName}
                    onChange={(e) => setRegisterForm(prev => ({ ...prev, firstName: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    placeholder="Doe"
                    value={registerForm.lastName}
                    onChange={(e) => setRegisterForm(prev => ({ ...prev, lastName: e.target.value }))}
                    required
                  />
                </div>
              </div>

              {/* Company Name (only for company type) */}
              {registerForm.userType === 'company' && (
                <div className="space-y-2">
                  <Label htmlFor="companyName">Company Name</Label>
                  <Input
                    id="companyName"
                    placeholder="Your Transport Company"
                    value={registerForm.companyName}
                    onChange={(e) => setRegisterForm(prev => ({ ...prev, companyName: e.target.value }))}
                    required
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="register-email">Email</Label>
                <Input
                  id="register-email"
                  type="email"
                  placeholder="john@example.com"
                  value={registerForm.email}
                  onChange={(e) => setRegisterForm(prev => ({ ...prev, email: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="register-password">Password</Label>
                <div className="relative">
                  <Input
                    id="register-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Choose a strong password"
                    value={registerForm.password}
                    onChange={(e) => setRegisterForm(prev => ({ ...prev, password: e.target.value }))}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  placeholder="Confirm your password"
                  value={registerForm.confirmPassword}
                  onChange={(e) => setRegisterForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  required
                />
              </div>

              {registerForm.userType === 'company' && (
                <Card className="border-orange-200 bg-orange-50">
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-2">
                      <Badge variant="outline" className="text-orange-600 border-orange-300">
                        Note
                      </Badge>
                      <p className="text-sm text-orange-700">
                        Company accounts require admin approval before activation. 
                        You'll be notified once your account is reviewed and approved.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </Button>
            </form>

            <div className="text-center text-sm text-muted-foreground">
              Already have an account?{' '}
              <Button variant="link" className="p-0 h-auto" onClick={() => setActiveTab('login')}>
                Sign in here
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}