import { useState, useEffect } from 'react'
import { Button } from '../ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog'
import { Calendar } from '../ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'
import { ThemeToggle } from '../theme-toggle'
import { 
  Bus, 
  Ticket, 
  MapPin, 
  Clock,
  Plus,
  Settings,
  LogOut,
  CalendarIcon,
  CreditCard,
  User,
  Search,
  Filter,
  Download
} from 'lucide-react'
import { toast } from 'sonner@2.0.3'
import { projectId, publicAnonKey } from '../../utils/supabase/info'

export function CommutterDashboard({ userInfo, onLogout }) {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [bookings, setBookings] = useState([])
  const [routes, setRoutes] = useState([])
  const [schedules, setSchedules] = useState([])
  const [showBookingModal, setShowBookingModal] = useState(false)
  const [selectedDate, setSelectedDate] = useState()
  const [bookingForm, setBookingForm] = useState({
    from: '',
    to: '',
    passengers: 1,
    scheduleId: ''
  })
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    fetchUserBookings()
    fetchRoutes()
  }, [])

  const fetchUserBookings = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-2a7b3961/bookings/${userInfo.id}`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json'
          }
        }
      )
      const data = await response.json()
      if (data.bookings) {
        setBookings(data.bookings)
      }
    } catch (error) {
      console.error('Error fetching bookings:', error)
    }
  }

  const fetchRoutes = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-2a7b3961/routes`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json'
          }
        }
      )
      const data = await response.json()
      if (data.routes) {
        setRoutes(data.routes)
      }
    } catch (error) {
      console.error('Error fetching routes:', error)
    }
  }

  const searchSchedules = async () => {
    if (!bookingForm.from || !bookingForm.to || !selectedDate) {
      toast.error('Please fill all search criteria')
      return
    }

    setIsLoading(true)
    try {
      const dateStr = selectedDate.toISOString().split('T')[0]
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-2a7b3961/schedules?from=${bookingForm.from}&to=${bookingForm.to}&date=${dateStr}`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json'
          }
        }
      )
      const data = await response.json()
      if (data.schedules) {
        setSchedules(data.schedules)
      }
    } catch (error) {
      console.error('Error searching schedules:', error)
      toast.error('Failed to search schedules')
    } finally {
      setIsLoading(false)
    }
  }

  const handleBookTicket = async (schedule) => {
    setIsLoading(true)
    try {
      const accessToken = localStorage.getItem('safaritix-access-token')
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-2a7b3961/bookings`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            scheduleId: schedule.id,
            from: schedule.from,
            to: schedule.to,
            date: schedule.date,
            time: schedule.time,
            passengers: bookingForm.passengers,
            price: schedule.price,
            busNumber: schedule.busNumber,
            companyName: schedule.companyName
          })
        }
      )

      const data = await response.json()
      if (data.success) {
        toast.success('Ticket booked successfully!')
        setShowBookingModal(false)
        fetchUserBookings()
        setSchedules([])
        setBookingForm({ from: '', to: '', passengers: 1, scheduleId: '' })
        setSelectedDate(undefined)
      } else {
        toast.error(data.error || 'Booking failed')
      }
    } catch (error) {
      console.error('Error booking ticket:', error)
      toast.error('Failed to book ticket')
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const upcomingTrips = bookings.filter(booking => {
    const tripDate = new Date(booking.date)
    return tripDate >= new Date() && booking.status === 'confirmed'
  }).slice(0, 3)

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
              Passenger
            </Badge>
          </div>

          <div className="flex items-center space-x-4">
            <span className="text-sm text-muted-foreground">
              Welcome, {userInfo.firstName}
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
          <TabsList className="w-full flex">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="bookings">My Bookings</TabsTrigger>
            <TabsTrigger value="book">Book Ticket</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            {/* Welcome Section */}
            <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg p-6 text-white">
              <h2 className="text-2xl font-bold mb-2">Welcome back, {userInfo.firstName}!</h2>
              <p className="text-blue-100">
                {upcomingTrips.length > 0 
                  ? `Your next trip is on ${new Date(upcomingTrips[0].date).toLocaleDateString()} at ${upcomingTrips[0].time}`
                  : 'No upcoming trips. Book your next journey!'
                }
              </p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
                  <Ticket className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{bookings.length}</div>
                  <p className="text-xs text-muted-foreground">All time bookings</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Upcoming Trips</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{upcomingTrips.length}</div>
                  <p className="text-xs text-muted-foreground">Next 30 days</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {bookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0).toLocaleString()} RWF
                  </div>
                  <p className="text-xs text-muted-foreground">All time spending</p>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button 
                className="h-20 flex flex-col gap-2"
                onClick={() => setActiveTab('book')}
              >
                <Plus className="h-6 w-6" />
                Book New Ticket
              </Button>
              <Button variant="outline" className="h-20 flex flex-col gap-2">
                <MapPin className="h-6 w-6" />
                Track Bus
              </Button>
              <Button variant="outline" className="h-20 flex flex-col gap-2">
                <Clock className="h-6 w-6" />
                Trip History
              </Button>
            </div>

            {/* Upcoming Trips */}
            {upcomingTrips.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Upcoming Trips</CardTitle>
                  <CardDescription>Your confirmed upcoming journeys</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {upcomingTrips.map((booking) => (
                      <div key={booking.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Badge className={getStatusColor(booking.status)}>
                              {booking.status}
                            </Badge>
                            <span className="font-semibold">{booking.from} → {booking.to}</span>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {new Date(booking.date).toLocaleDateString()} at {booking.time} • {booking.passengers} passenger(s)
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Bus: {booking.busNumber} • {booking.companyName}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">{booking.totalAmount?.toLocaleString()} RWF</div>
                          <Button variant="link" size="sm" className="h-auto p-0">
                            View Details
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* My Bookings Tab */}
          <TabsContent value="bookings" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">My Bookings</h2>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              {bookings.map((booking) => (
                <Card key={booking.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge className={getStatusColor(booking.status)}>
                            {booking.status}
                          </Badge>
                          <span className="font-semibold text-lg">{booking.from} → {booking.to}</span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          <div>Date: {new Date(booking.date).toLocaleDateString()} at {booking.time}</div>
                          <div>Passengers: {booking.passengers} • Bus: {booking.busNumber}</div>
                          <div>Company: {booking.companyName}</div>
                          <div>Booking ID: {booking.id}</div>
                        </div>
                      </div>
                      <div className="text-right space-y-2">
                        <div className="text-2xl font-bold text-blue-600">
                          {booking.totalAmount?.toLocaleString()} RWF
                        </div>
                        <div className="space-x-2">
                          <Button variant="outline" size="sm">
                            View Invoice
                          </Button>
                          {booking.status === 'confirmed' && new Date(booking.date) > new Date() && (
                            <Button variant="destructive" size="sm">
                              Cancel
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {bookings.length === 0 && (
                <Card>
                  <CardContent className="p-12 text-center">
                    <Ticket className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No bookings yet</h3>
                    <p className="text-muted-foreground mb-4">Book your first ticket to see it here</p>
                    <Button onClick={() => setActiveTab('book')}>
                      Book Your First Ticket
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Book Ticket Tab */}
          <TabsContent value="book" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Book Your Ticket</CardTitle>
                <CardDescription>Search and book bus tickets for your journey</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>From</Label>
                    <Select value={bookingForm.from} onValueChange={(value) => setBookingForm(prev => ({ ...prev, from: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select departure city" />
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
                    <Label>To</Label>
                    <Select value={bookingForm.to} onValueChange={(value) => setBookingForm(prev => ({ ...prev, to: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select destination city" />
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
                    <Label>Travel Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {selectedDate ? selectedDate.toLocaleDateString() : "Pick a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={selectedDate}
                          onSelect={setSelectedDate}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Passengers</Label>
                    <Select 
                      value={bookingForm.passengers.toString()} 
                      onValueChange={(value) => setBookingForm(prev => ({ ...prev, passengers: parseInt(value) }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 4, 5, 6].map((num) => (
                          <SelectItem key={num} value={num.toString()}>
                            {num} Passenger{num > 1 ? 's' : ''}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-end">
                    <Button 
                      onClick={searchSchedules} 
                      className="w-full"
                      disabled={isLoading || !bookingForm.from || !bookingForm.to || !selectedDate}
                    >
                      <Search className="mr-2 h-4 w-4" />
                      {isLoading ? 'Searching...' : 'Search Buses'}
                    </Button>
                  </div>
                </div>

                {/* Search Results */}
                {schedules.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Available Buses</h3>
                    {schedules.map((schedule) => (
                      <Card key={schedule.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <h4 className="font-semibold">{schedule.companyName}</h4>
                                <Badge variant="outline">{schedule.busType || 'Standard'}</Badge>
                              </div>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <Clock className="h-4 w-4" />
                                  {schedule.time}
                                </div>
                                <div>{schedule.duration || '3h 30m'}</div>
                                <div>{schedule.availableSeats} seats left</div>
                              </div>
                              <div className="text-sm text-muted-foreground">
                                Bus: {schedule.busNumber}
                              </div>
                            </div>
                            <div className="text-right space-y-2">
                              <div className="text-2xl font-bold text-blue-600">
                                {schedule.price?.toLocaleString()} RWF
                              </div>
                              <div className="text-sm text-muted-foreground">per person</div>
                              <Button 
                                onClick={() => handleBookTicket(schedule)}
                                disabled={isLoading || schedule.availableSeats < bookingForm.passengers}
                                className="w-full"
                              >
                                {isLoading ? 'Booking...' : 'Book Now'}
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Profile Settings</CardTitle>
                <CardDescription>Manage your account information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input id="firstName" defaultValue={userInfo.firstName} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input id="lastName" defaultValue={userInfo.lastName} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" defaultValue={userInfo.email} />
                </div>
                <Button>Update Profile</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}