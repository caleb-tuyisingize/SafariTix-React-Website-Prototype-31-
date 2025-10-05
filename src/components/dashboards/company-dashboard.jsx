import { useState, useEffect } from 'react'
import { Button } from '../ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,DialogDescription } from '../ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table'
import { Progress } from '../ui/progress'
import { ThemeToggle } from '../theme-toggle'
import { 
  Bus, 
  DollarSign, 
  Users, 
  Calendar, 
  Plus,
  Settings,
  LogOut,
  TrendingUp,
  MapPin,
  Clock,
  Edit,
  Trash2,
  Eye
} from 'lucide-react'
import { toast } from 'sonner@2.0.3'
import { projectId, publicAnonKey } from '../../utils/supabase/info'

export function CompanyDashboard({ userInfo, onLogout }) {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [buses, setBuses] = useState([])
  const [routes, setRoutes] = useState([])
  const [schedules, setSchedules] = useState([])
  const [bookings, setBookings] = useState([])
  const [stats, setStats] = useState({})
  const [showBusModal, setShowBusModal] = useState(false)
  const [showRouteModal, setShowRouteModal] = useState(false)
  const [showScheduleModal, setShowScheduleModal] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const [busForm, setBusForm] = useState({
    plateNumber: '',
    capacity: '',
    type: 'Standard',
    status: 'active'
  })

  const [routeForm, setRouteForm] = useState({
    from: '',
    to: '',
    distance: '',
    duration: '',
    price: ''
  })

  const [scheduleForm, setScheduleForm] = useState({
    routeId: '',
    busId: '',
    date: '',
    time: '',
    price: '',
    totalSeats: ''
  })

  useEffect(() => {
    if (userInfo.status === 'active') {
      fetchCompanyData()
    }
  }, [])

  const fetchCompanyData = async () => {
    try {
      // Fetch buses
      const busesResponse = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-2a7b3961/buses/${userInfo.id}`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json'
          }
        }
      )
      const busesData = await busesResponse.json()
      if (busesData.buses) {
        setBuses(busesData.buses)
      }

      // Fetch routes
      const routesResponse = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-2a7b3961/routes/${userInfo.id}`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json'
          }
        }
      )
      const routesData = await routesResponse.json()
      if (routesData.routes) {
        setRoutes(routesData.routes)
      }

      // Fetch schedules
      const schedulesResponse = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-2a7b3961/schedules/${userInfo.id}`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json'
          }
        }
      )
      const schedulesData = await schedulesResponse.json()
      if (schedulesData.schedules) {
        setSchedules(schedulesData.schedules)
      }

      // Calculate stats
      setStats({
        totalBuses: busesData.buses?.length || 0,
        activeBuses: busesData.buses?.filter(b => b.status === 'active').length || 0,
        todayRevenue: 145000,
        monthlyRevenue: 4500000,
        todayBookings: 45,
        monthlyBookings: 1200
      })

    } catch (error) {
      console.error('Error fetching company data:', error)
    }
  }

  const handleAddBus = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const accessToken = localStorage.getItem('safaritix-access-token')
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-2a7b3961/buses`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            ...busForm,
            companyName: userInfo.companyName,
            capacity: parseInt(busForm.capacity)
          })
        }
      )

      const data = await response.json()
      if (data.success) {
        toast.success('Bus added successfully!')
        setShowBusModal(false)
        setBusForm({ plateNumber: '', capacity: '', type: 'Standard', status: 'active' })
        fetchCompanyData()
      } else {
        toast.error(data.error || 'Failed to add bus')
      }
    } catch (error) {
      console.error('Error adding bus:', error)
      toast.error('Failed to add bus')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddRoute = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const accessToken = localStorage.getItem('safaritix-access-token')
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-2a7b3961/routes`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            ...routeForm,
            companyName: userInfo.companyName,
            distance: parseFloat(routeForm.distance),
            price: parseFloat(routeForm.price)
          })
        }
      )

      const data = await response.json()
      if (data.success) {
        toast.success('Route added successfully!')
        setShowRouteModal(false)
        setRouteForm({ from: '', to: '', distance: '', duration: '', price: '' })
        fetchCompanyData()
      } else {
        toast.error(data.error || 'Failed to add route')
      }
    } catch (error) {
      console.error('Error adding route:', error)
      toast.error('Failed to add route')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddSchedule = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const accessToken = localStorage.getItem('safaritix-access-token')
      const selectedBus = buses.find(b => b.id === scheduleForm.busId)
      const selectedRoute = routes.find(r => r.id === scheduleForm.routeId)

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-2a7b3961/schedules`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            ...scheduleForm,
            companyName: userInfo.companyName,
            busNumber: selectedBus?.plateNumber,
            from: selectedRoute?.from,
            to: selectedRoute?.to,
            duration: selectedRoute?.duration,
            price: parseFloat(scheduleForm.price),
            totalSeats: parseInt(scheduleForm.totalSeats)
          })
        }
      )

      const data = await response.json()
      if (data.success) {
        toast.success('Schedule added successfully!')
        setShowScheduleModal(false)
        setScheduleForm({ routeId: '', busId: '', date: '', time: '', price: '', totalSeats: '' })
        fetchCompanyData()
      } else {
        toast.error(data.error || 'Failed to add schedule')
      }
    } catch (error) {
      console.error('Error adding schedule:', error)
      toast.error('Failed to add schedule')
    } finally {
      setIsLoading(false)
    }
  }

  if (userInfo.status === 'pending') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center w-16 h-16 bg-yellow-100 rounded-full mx-auto mb-4">
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
            <CardTitle>Account Pending Approval</CardTitle>
            <CardDescription>
              Your company registration is under review by our admin team.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-sm text-muted-foreground">
              We'll notify you once your account has been approved and you can start managing your fleet.
            </p>
            <Button onClick={onLogout} variant="outline">
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur sticky top-0 z-50">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center space-x-2">
            <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg">
              <Bus className="h-4 w-4 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              SafariTix
            </span>
            <Badge variant="outline" className="ml-2">
              Company
            </Badge>
          </div>

          <div className="flex items-center space-x-4">
            <span className="text-sm text-muted-foreground">
              {userInfo.companyName}
            </span>
            <ThemeToggle />
            <Button variant="ghost" size="icon">
              <Settings className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={onLogout}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="container py-6 px-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="w-full lg:flex lg:space-x-2">
            <TabsTrigger value="dashboard">Overview</TabsTrigger>
            <TabsTrigger value="buses">Fleet</TabsTrigger>
            <TabsTrigger value="routes">Routes</TabsTrigger>
            <TabsTrigger value="schedules">Schedules</TabsTrigger>
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
          </TabsList>

          {/* Dashboard Overview */}
          <TabsContent value="dashboard" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-bold">Company Dashboard</h2>
              <Badge variant="secondary" className="text-green-600 bg-green-100">
                Active Account
              </Badge>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Buses</CardTitle>
                  <Bus className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalBuses}</div>
                  <p className="text-xs text-muted-foreground">
                    <span className="text-green-600">{stats.activeBuses} active</span>
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Today's Revenue</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {stats.todayRevenue?.toLocaleString()} RWF
                  </div>
                  <p className="text-xs text-muted-foreground">
                    <TrendingUp className="inline h-3 w-3 text-green-600" />
                    <span className="text-green-600"> +12% from yesterday</span>
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {(stats.monthlyRevenue / 1000000)?.toFixed(1)}M RWF
                  </div>
                  <p className="text-xs text-muted-foreground">
                    <span className="text-green-600">+8% from last month</span>
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Today's Bookings</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.todayBookings}</div>
                  <p className="text-xs text-muted-foreground">
                    <span className="text-green-600">+5% from yesterday</span>
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Fleet Status */}
            <Card>
              <CardHeader>
                <CardTitle>Fleet Status</CardTitle>
                <CardDescription>Real-time status of your bus fleet</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Active Buses</span>
                    <span>{stats.activeBuses}/{stats.totalBuses}</span>
                  </div>
                  <Progress value={(stats.activeBuses / stats.totalBuses) * 100 || 0} />
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{stats.activeBuses}</div>
                      <div className="text-sm text-muted-foreground">On Route</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">
                        {Math.max(0, stats.totalBuses - stats.activeBuses)}
                      </div>
                      <div className="text-sm text-muted-foreground">Maintenance</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">0</div>
                      <div className="text-sm text-muted-foreground">Idle</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Fleet Management */}
          <TabsContent value="buses" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Fleet Management</h2>
              <Dialog open={showBusModal} onOpenChange={setShowBusModal}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Bus
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Bus</DialogTitle>
                    <DialogDescription>
                      Add a new bus to your fleet for passenger transportation
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleAddBus} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="plateNumber">Plate Number</Label>
                      <Input
                        id="plateNumber"
                        value={busForm.plateNumber}
                        onChange={(e) => setBusForm(prev => ({ ...prev, plateNumber: e.target.value }))}
                        placeholder="e.g., RAB 123A"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="capacity">Passenger Capacity</Label>
                      <Input
                        id="capacity"
                        type="number"
                        value={busForm.capacity}
                        onChange={(e) => setBusForm(prev => ({ ...prev, capacity: e.target.value }))}
                        placeholder="e.g., 50"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="type">Bus Type</Label>
                      <Select value={busForm.type} onValueChange={(value) => setBusForm(prev => ({ ...prev, type: value }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Standard">Standard</SelectItem>
                          <SelectItem value="Express">Express</SelectItem>
                          <SelectItem value="Luxury">Luxury</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? 'Adding Bus...' : 'Add Bus'}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Bus Number</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Capacity</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {buses.map((bus) => (
                      <TableRow key={bus.id}>
                        <TableCell className="font-medium">{bus.plateNumber}</TableCell>
                        <TableCell>{bus.type}</TableCell>
                        <TableCell>{bus.capacity} seats</TableCell>
                        <TableCell>
                          <Badge variant={bus.status === 'active' ? 'default' : 'secondary'}>
                            {bus.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {buses.length === 0 && (
                  <div className="p-12 text-center">
                    <Bus className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No buses added yet</h3>
                    <p className="text-muted-foreground mb-4">Add your first bus to start managing your fleet</p>
                    <Button onClick={() => setShowBusModal(true)}>
                      Add Your First Bus
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Routes Management */}
          <TabsContent value="routes" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Route Management</h2>
              <Dialog open={showRouteModal} onOpenChange={setShowRouteModal}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Route
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Route</DialogTitle>
                    <DialogDescription>
                      Create a new route between two cities for your bus services
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleAddRoute} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="from">From</Label>
                        <Select value={routeForm.from} onValueChange={(value) => setRouteForm(prev => ({ ...prev, from: value }))}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select origin" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Kigali">Kigali</SelectItem>
                            <SelectItem value="Butare">Butare</SelectItem>
                            <SelectItem value="Musanze">Musanze</SelectItem>
                            <SelectItem value="Huye">Huye</SelectItem>
                            <SelectItem value="Rubavu">Rubavu</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="to">To</Label>
                        <Select value={routeForm.to} onValueChange={(value) => setRouteForm(prev => ({ ...prev, to: value }))}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select destination" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Kigali">Kigali</SelectItem>
                            <SelectItem value="Butare">Butare</SelectItem>
                            <SelectItem value="Musanze">Musanze</SelectItem>
                            <SelectItem value="Huye">Huye</SelectItem>
                            <SelectItem value="Rubavu">Rubavu</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="distance">Distance (km)</Label>
                        <Input
                          id="distance"
                          type="number"
                          value={routeForm.distance}
                          onChange={(e) => setRouteForm(prev => ({ ...prev, distance: e.target.value }))}
                          placeholder="e.g., 135"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="duration">Duration</Label>
                        <Input
                          id="duration"
                          value={routeForm.duration}
                          onChange={(e) => setRouteForm(prev => ({ ...prev, duration: e.target.value }))}
                          placeholder="e.g., 2h 30m"
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="price">Base Price (RWF)</Label>
                      <Input
                        id="price"
                        type="number"
                        value={routeForm.price}
                        onChange={(e) => setRouteForm(prev => ({ ...prev, price: e.target.value }))}
                        placeholder="e.g., 2500"
                        required
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? 'Adding Route...' : 'Add Route'}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {routes.map((route) => (
                <Card key={route.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      {route.from} → {route.to}
                    </CardTitle>
                    <CardDescription>
                      {route.distance}km • {route.duration}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="text-2xl font-bold text-blue-600">
                        {route.price?.toLocaleString()} RWF
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" className="flex-1">
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {routes.length === 0 && (
                <Card className="col-span-full">
                  <CardContent className="p-12 text-center">
                    <MapPin className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No routes added yet</h3>
                    <p className="text-muted-foreground mb-4">Add your first route to start offering services</p>
                    <Button onClick={() => setShowRouteModal(true)}>
                      Add Your First Route
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Schedule Management */}
          <TabsContent value="schedules" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Schedule Management</h2>
              <Dialog open={showScheduleModal} onOpenChange={setShowScheduleModal}>
                <DialogTrigger asChild>
                  <Button disabled={buses.length === 0 || routes.length === 0}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Schedule
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Schedule</DialogTitle>
                    <DialogDescription>
                      Schedule a bus trip for a specific route, date and time
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleAddSchedule} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="routeId">Route</Label>
                      <Select value={scheduleForm.routeId} onValueChange={(value) => setScheduleForm(prev => ({ ...prev, routeId: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select route" />
                        </SelectTrigger>
                        <SelectContent>
                          {routes.map((route) => (
                            <SelectItem key={route.id} value={route.id}>
                              {route.from} → {route.to}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="busId">Bus</Label>
                      <Select value={scheduleForm.busId} onValueChange={(value) => setScheduleForm(prev => ({ ...prev, busId: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select bus" />
                        </SelectTrigger>
                        <SelectContent>
                          {buses.map((bus) => (
                            <SelectItem key={bus.id} value={bus.id}>
                              {bus.plateNumber} ({bus.capacity} seats)
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="date">Date</Label>
                        <Input
                          id="date"
                          type="date"
                          value={scheduleForm.date}
                          onChange={(e) => setScheduleForm(prev => ({ ...prev, date: e.target.value }))}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="time">Time</Label>
                        <Input
                          id="time"
                          type="time"
                          value={scheduleForm.time}
                          onChange={(e) => setScheduleForm(prev => ({ ...prev, time: e.target.value }))}
                          required
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="price">Price (RWF)</Label>
                        <Input
                          id="price"
                          type="number"
                          value={scheduleForm.price}
                          onChange={(e) => setScheduleForm(prev => ({ ...prev, price: e.target.value }))}
                          placeholder="e.g., 2500"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="totalSeats">Available Seats</Label>
                        <Input
                          id="totalSeats"
                          type="number"
                          value={scheduleForm.totalSeats}
                          onChange={(e) => setScheduleForm(prev => ({ ...prev, totalSeats: e.target.value }))}
                          placeholder="e.g., 50"
                          required
                        />
                      </div>
                    </div>
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? 'Adding Schedule...' : 'Add Schedule'}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            {(buses.length === 0 || routes.length === 0) && (
              <Card>
                <CardContent className="p-12 text-center">
                  <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Prerequisites Required</h3>
                  <p className="text-muted-foreground mb-4">
                    You need to add at least one bus and one route before creating schedules
                  </p>
                  <div className="flex gap-2 justify-center">
                    {buses.length === 0 && (
                      <Button onClick={() => setActiveTab('buses')}>
                        Add Buses
                      </Button>
                    )}
                    {routes.length === 0 && (
                      <Button onClick={() => setActiveTab('routes')}>
                        Add Routes
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Bookings */}
          <TabsContent value="bookings" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Booking Management</h2>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Eye className="h-4 w-4 mr-2" />
                  View All
                </Button>
              </div>
            </div>

            <Card>
              <CardContent className="p-12 text-center">
                <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No bookings yet</h3>
                <p className="text-muted-foreground">
                  Bookings will appear here once customers start booking your schedules
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}