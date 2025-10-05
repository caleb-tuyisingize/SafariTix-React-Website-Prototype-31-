import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "npm:@supabase/supabase-js";
import * as kv from "./kv_store.tsx";

const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Initialize Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL') || 'https://hacxexxoslzoupzvqrzx.supabase.co'
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

console.log('Supabase URL:', supabaseUrl)
console.log('Service Key exists:', !!supabaseServiceKey)

const supabase = supabaseServiceKey ? createClient(supabaseUrl, supabaseServiceKey) : null

// Initialize sample data for development if no real Supabase connection
const initializeSampleData = async () => {
  if (!supabase) {
    console.log('Initializing sample data for development mode...')
    
    // Check if data already exists
    const existingUsers = await kv.getByPrefix('user:')
    if (existingUsers.length > 0) {
      console.log('Sample data already exists, skipping initialization')
      return
    }
    
    // Create sample admin user
    const adminUser = {
      id: 'admin-user-001',
      email: 'admin@safaritix.com',
      firstName: 'System',
      lastName: 'Administrator',
      userType: 'admin',
      status: 'active',
      createdAt: new Date().toISOString()
    }
    await kv.set(`user:admin-user-001`, adminUser)
    
    console.log('Sample data initialized successfully')
  }
}

// Initialize sample data on startup
initializeSampleData().catch(console.error)

// Auth routes
app.post('/make-server-2a7b3961/auth/register', async (c) => {
  try {
    const { email, password, firstName, lastName, userType, companyName } = await c.req.json()
    
    console.log('Registration attempt:', { email, userType })

    if (!supabase) {
      // Mock registration for development
      const userData = {
        id: `user_${Date.now()}`,
        email,
        firstName,
        lastName,
        userType,
        companyName: userType === 'company' ? companyName : null,
        status: userType === 'company' ? 'pending' : 'active',
        createdAt: new Date().toISOString()
      }

      await kv.set(`user:${userData.id}`, userData)
      
      if (userType === 'company') {
        const companyData = {
          id: userData.id,
          name: companyName,
          email,
          status: 'pending',
          subscription: 'basic',
          createdAt: new Date().toISOString()
        }
        await kv.set(`company:${userData.id}`, companyData)
      }

      return c.json({ 
        success: true, 
        user: userData,
        message: userType === 'company' ? 'Company registered successfully. Awaiting admin approval.' : 'Registration successful!'
      })
    }

    // Real Supabase registration
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { 
        firstName, 
        lastName, 
        userType,
        companyName: userType === 'company' ? companyName : null
      },
      email_confirm: true
    })

    if (authError) {
      console.log('Auth error:', authError)
      return c.json({ error: 'Registration failed: ' + authError.message }, 400)
    }

    // Store additional user data in KV store
    const userData = {
      id: authData.user.id,
      email,
      firstName,
      lastName,
      userType,
      companyName: userType === 'company' ? companyName : null,
      status: userType === 'company' ? 'pending' : 'active',
      createdAt: new Date().toISOString()
    }

    await kv.set(`user:${authData.user.id}`, userData)
    
    if (userType === 'company') {
      // Create company record
      const companyData = {
        id: authData.user.id,
        name: companyName,
        email,
        status: 'pending',
        subscription: 'basic',
        createdAt: new Date().toISOString()
      }
      await kv.set(`company:${authData.user.id}`, companyData)
    }

    return c.json({ 
      success: true, 
      user: userData,
      message: userType === 'company' ? 'Company registered successfully. Awaiting admin approval.' : 'Registration successful!'
    })

  } catch (error) {
    console.log('Registration error:', error)
    return c.json({ error: 'Registration failed: ' + error.message }, 500)
  }
})

app.post('/make-server-2a7b3961/auth/login', async (c) => {
  try {
    const { email, password } = await c.req.json()
    
    console.log('Login attempt:', { email })

    if (!supabase) {
      // Check for default admin credentials
      if (email === 'admin@safaritix.com' && password === 'admin123') {
        const adminUser = {
          id: 'admin-user-001',
          email: 'admin@safaritix.com',
          firstName: 'System',
          lastName: 'Administrator',
          userType: 'admin',
          status: 'active',
          createdAt: new Date().toISOString()
        }
        
        // Store admin user for consistency
        await kv.set(`user:admin-user-001`, adminUser)
        
        return c.json({ 
          success: true, 
          accessToken: 'mock-token-admin-user-001',
          user: adminUser
        })
      }
      
      // Mock login for development
      const users = await kv.getByPrefix('user:')
      const user = users.find(u => u.email === email)
      
      if (!user) {
        return c.json({ error: 'User not found' }, 404)
      }

      // In development, accept any password
      return c.json({ 
        success: true, 
        accessToken: 'mock-token-' + user.id,
        user: user
      })
    }

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (authError) {
      console.log('Login error:', authError)
      return c.json({ error: 'Login failed: ' + authError.message }, 400)
    }

    // Get user data from KV store
    const userData = await kv.get(`user:${authData.user.id}`)
    
    if (!userData) {
      return c.json({ error: 'User data not found' }, 404)
    }

    return c.json({ 
      success: true, 
      accessToken: authData.session.access_token,
      user: userData
    })

  } catch (error) {
    console.log('Login error:', error)
    return c.json({ error: 'Login failed: ' + error.message }, 500)
  }
})

// Company management routes
app.get('/make-server-2a7b3961/companies', async (c) => {
  try {
    let companies = await kv.getByPrefix('company:')
    
    // Create sample companies if none exist for development
    if (companies.length === 0 && !supabase) {
      console.log('Creating sample companies for development')
      const sampleCompanies = [
        {
          id: 'sample-company-1',
          name: 'Express Rwanda',
          email: 'info@expressrwanda.com',
          status: 'pending',
          subscription: 'basic',
          createdAt: new Date().toISOString()
        },
        {
          id: 'sample-company-2', 
          name: 'City Line Transport',
          email: 'contact@cityline.rw',
          status: 'pending',
          subscription: 'basic',
          createdAt: new Date().toISOString()
        },
        {
          id: 'sample-company-3',
          name: 'Rwanda Luxury Buses',
          email: 'bookings@rwandaluxury.com', 
          status: 'active',
          subscription: 'premium',
          createdAt: new Date().toISOString()
        }
      ]
      
      for (const company of sampleCompanies) {
        await kv.set(`company:${company.id}`, company)
        
        // Also create corresponding user records
        const userData = {
          id: company.id,
          email: company.email,
          firstName: 'Company',
          lastName: 'Owner',
          userType: 'company',
          companyName: company.name,
          status: company.status,
          createdAt: company.createdAt
        }
        await kv.set(`user:${company.id}`, userData)
      }
      
      companies = sampleCompanies
    }
    
    return c.json({ companies })
  } catch (error) {
    console.log('Error fetching companies:', error)
    return c.json({ error: 'Failed to fetch companies' }, 500)
  }
})

app.post('/make-server-2a7b3961/companies/:id/approve', async (c) => {
  try {
    const companyId = c.req.param('id')
    const company = await kv.get(`company:${companyId}`)
    
    if (!company) {
      return c.json({ error: 'Company not found' }, 404)
    }

    company.status = 'active'
    await kv.set(`company:${companyId}`, company)

    // Update user status
    const user = await kv.get(`user:${companyId}`)
    if (user) {
      user.status = 'active'
      await kv.set(`user:${companyId}`, user)
    }

    return c.json({ success: true, company })
  } catch (error) {
    console.log('Error approving company:', error)
    return c.json({ error: 'Failed to approve company' }, 500)
  }
})

// Admin stats
app.get('/make-server-2a7b3961/admin/stats', async (c) => {
  try {
    const users = await kv.getByPrefix('user:')
    const companies = await kv.getByPrefix('company:')
    const buses = await kv.getByPrefix('bus:')
    const bookings = await kv.getByPrefix('booking:')
    const routes = await kv.getByPrefix('route:')

    const stats = {
      totalUsers: users.length,
      totalCompanies: companies.length,
      activeCompanies: companies.filter(c => c.status === 'active').length,
      pendingCompanies: companies.filter(c => c.status === 'pending').length,
      totalBuses: buses.length,
      activeBuses: buses.filter(b => b.status === 'active').length,
      totalBookings: bookings.length,
      totalRevenue: bookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0),
      totalRoutes: routes.length,
      activeRoutes: routes.filter(r => r.status === 'active').length
    }

    return c.json({ stats })
  } catch (error) {
    console.log('Error fetching admin stats:', error)
    return c.json({ error: 'Failed to fetch stats' }, 500)
  }
})

// Health check endpoint
app.get("/make-server-2a7b3961/health", (c) => {
  return c.json({ 
    status: "ok", 
    timestamp: new Date().toISOString(),
    supabaseConnected: !!supabase,
    mode: supabase ? 'production' : 'development'
  });
});

// Test endpoint to verify API is working
app.get("/make-server-2a7b3961/test", (c) => {
  return c.json({ 
    message: "SafariTix API is working!", 
    timestamp: new Date().toISOString(),
    environment: supabase ? 'production' : 'development'
  });
});

// Add other missing endpoints for buses, routes, schedules, bookings
app.post('/make-server-2a7b3961/buses', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1]
    
    // For development, extract user ID from mock token
    let userId = 'mock-company-user'
    if (accessToken && accessToken.startsWith('mock-token-')) {
      userId = accessToken.replace('mock-token-', '')
    }

    const busData = await c.req.json()
    const busId = `bus_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    const bus = {
      id: busId,
      companyId: userId,
      ...busData,
      status: 'active',
      createdAt: new Date().toISOString()
    }

    await kv.set(`bus:${busId}`, bus)
    return c.json({ success: true, bus })
  } catch (error) {
    console.log('Error creating bus:', error)
    return c.json({ error: 'Failed to create bus' }, 500)
  }
})

app.get('/make-server-2a7b3961/buses/:companyId', async (c) => {
  try {
    const companyId = c.req.param('companyId')
    const buses = await kv.getByPrefix('bus:')
    const companyBuses = buses.filter(bus => bus.companyId === companyId)
    return c.json({ buses: companyBuses })
  } catch (error) {
    console.log('Error fetching buses:', error)
    return c.json({ error: 'Failed to fetch buses' }, 500)
  }
})

app.get('/make-server-2a7b3961/routes', async (c) => {
  try {
    const routes = await kv.getByPrefix('route:')
    const activeRoutes = routes.filter(route => route.status === 'active')
    return c.json({ routes: activeRoutes })
  } catch (error) {
    console.log('Error fetching routes:', error)
    return c.json({ error: 'Failed to fetch routes' }, 500)
  }
})

app.get('/make-server-2a7b3961/schedules', async (c) => {
  try {
    const { from, to, date } = c.req.query()
    let schedules = await kv.getByPrefix('schedule:')
    
    // If no schedules exist, create some sample ones for development
    if (schedules.length === 0 && !supabase) {
      console.log('Creating sample schedules for development')
      const sampleSchedules = [
        {
          id: 'schedule_sample_1',
          companyId: 'sample-company-1',
          companyName: 'Express Rwanda',
          busNumber: 'RAB 123A',
          from: 'Kigali',
          to: 'Butare',
          date: new Date().toISOString().split('T')[0],
          time: '08:00',
          price: 2500,
          totalSeats: 50,
          availableSeats: 45,
          duration: '2h 30m',
          busType: 'Express',
          status: 'active',
          createdAt: new Date().toISOString()
        },
        {
          id: 'schedule_sample_2',
          companyId: 'sample-company-2',
          companyName: 'City Line',
          busNumber: 'RAB 456B',
          from: 'Kigali',
          to: 'Musanze',
          date: new Date().toISOString().split('T')[0],
          time: '09:30',
          price: 3000,
          totalSeats: 45,
          availableSeats: 38,
          duration: '3h 15m',
          busType: 'Standard',
          status: 'active',
          createdAt: new Date().toISOString()
        },
        {
          id: 'schedule_sample_3',
          companyId: 'sample-company-1',
          companyName: 'Express Rwanda',
          busNumber: 'RAB 789C',
          from: 'Butare',
          to: 'Kigali',
          date: new Date().toISOString().split('T')[0],
          time: '14:00',
          price: 2500,
          totalSeats: 50,
          availableSeats: 42,
          duration: '2h 30m',
          busType: 'Express',
          status: 'active',
          createdAt: new Date().toISOString()
        }
      ]
      
      for (const schedule of sampleSchedules) {
        await kv.set(`schedule:${schedule.id}`, schedule)
      }
      
      schedules = sampleSchedules
    }
    
    let filteredSchedules = schedules.filter(s => s.status === 'active')
    
    if (from) {
      filteredSchedules = filteredSchedules.filter(s => 
        s.from.toLowerCase().includes(from.toLowerCase())
      )
    }
    if (to) {
      filteredSchedules = filteredSchedules.filter(s => 
        s.to.toLowerCase().includes(to.toLowerCase())
      )
    }
    if (date) {
      filteredSchedules = filteredSchedules.filter(s => s.date === date)
    }

    return c.json({ schedules: filteredSchedules })
  } catch (error) {
    console.log('Error fetching schedules:', error)
    return c.json({ error: 'Failed to fetch schedules' }, 500)
  }
})

app.get('/make-server-2a7b3961/bookings/:userId', async (c) => {
  try {
    const userId = c.req.param('userId')
    const bookings = await kv.getByPrefix('booking:')
    const userBookings = bookings.filter(booking => booking.userId === userId)
    return c.json({ bookings: userBookings })
  } catch (error) {
    console.log('Error fetching bookings:', error)
    return c.json({ error: 'Failed to fetch bookings' }, 500)
  }
})

// Route management endpoints
app.post('/make-server-2a7b3961/routes', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1]
    
    let userId = 'mock-company-user'
    if (accessToken && accessToken.startsWith('mock-token-')) {
      userId = accessToken.replace('mock-token-', '')
    }

    const routeData = await c.req.json()
    const routeId = `route_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    const route = {
      id: routeId,
      companyId: userId,
      ...routeData,
      status: 'active',
      createdAt: new Date().toISOString()
    }

    await kv.set(`route:${routeId}`, route)
    return c.json({ success: true, route })
  } catch (error) {
    console.log('Error creating route:', error)
    return c.json({ error: 'Failed to create route' }, 500)
  }
})

app.get('/make-server-2a7b3961/routes/:companyId', async (c) => {
  try {
    const companyId = c.req.param('companyId')
    const routes = await kv.getByPrefix('route:')
    const companyRoutes = routes.filter(route => route.companyId === companyId)
    return c.json({ routes: companyRoutes })
  } catch (error) {
    console.log('Error fetching routes:', error)
    return c.json({ error: 'Failed to fetch routes' }, 500)
  }
})

// Schedule management endpoints
app.post('/make-server-2a7b3961/schedules', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1]
    
    let userId = 'mock-company-user'
    if (accessToken && accessToken.startsWith('mock-token-')) {
      userId = accessToken.replace('mock-token-', '')
    }

    const scheduleData = await c.req.json()
    const scheduleId = `schedule_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    const schedule = {
      id: scheduleId,
      companyId: userId,
      availableSeats: scheduleData.totalSeats,
      ...scheduleData,
      status: 'active',
      createdAt: new Date().toISOString()
    }

    await kv.set(`schedule:${scheduleId}`, schedule)
    return c.json({ success: true, schedule })
  } catch (error) {
    console.log('Error creating schedule:', error)
    return c.json({ error: 'Failed to create schedule' }, 500)
  }
})

app.get('/make-server-2a7b3961/schedules/:companyId', async (c) => {
  try {
    const companyId = c.req.param('companyId')
    const schedules = await kv.getByPrefix('schedule:')
    const companySchedules = schedules.filter(schedule => schedule.companyId === companyId)
    return c.json({ schedules: companySchedules })
  } catch (error) {
    console.log('Error fetching schedules:', error)
    return c.json({ error: 'Failed to fetch schedules' }, 500)
  }
})

// Booking creation endpoint
app.post('/make-server-2a7b3961/bookings', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1]
    
    let userId = 'mock-user'
    if (accessToken && accessToken.startsWith('mock-token-')) {
      userId = accessToken.replace('mock-token-', '')
    }

    const bookingData = await c.req.json()
    const bookingId = `booking_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    const totalAmount = bookingData.price * bookingData.passengers
    
    const booking = {
      id: bookingId,
      userId: userId,
      ...bookingData,
      totalAmount: totalAmount,
      status: 'confirmed',
      createdAt: new Date().toISOString()
    }

    await kv.set(`booking:${bookingId}`, booking)
    
    // Update schedule available seats
    if (bookingData.scheduleId) {
      const schedule = await kv.get(`schedule:${bookingData.scheduleId}`)
      if (schedule) {
        schedule.availableSeats = Math.max(0, schedule.availableSeats - bookingData.passengers)
        await kv.set(`schedule:${bookingData.scheduleId}`, schedule)
      }
    }
    
    return c.json({ success: true, booking })
  } catch (error) {
    console.log('Error creating booking:', error)
    return c.json({ error: 'Failed to create booking' }, 500)
  }
})

Deno.serve(app.fetch);