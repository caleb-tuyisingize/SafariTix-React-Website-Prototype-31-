import { useState, useEffect } from 'react'
import { Button } from '../ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog'
import { ThemeToggle } from '../theme-toggle'
import { 
  Users, 
  Building2, 
  Bus, 
  DollarSign,
  TrendingUp,
  Activity,
  Settings,
  LogOut,
  Check,
  X,
  Eye,
  Shield,
  AlertTriangle
} from 'lucide-react'
import { toast } from 'sonner@2.0.3'
import { projectId, publicAnonKey } from '../../utils/supabase/info'

export function AdminDashboard({ userInfo, onLogout }) {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [stats, setStats] = useState({})
  const [companies, setCompanies] = useState([])
  const [pendingCompanies, setPendingCompanies] = useState([])
  const [users, setUsers] = useState([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    fetchAdminData()
  }, [])

  const fetchAdminData = async () => {
    try {
      // Fetch admin stats
      const statsResponse = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-2a7b3961/admin/stats`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json'
          }
        }
      )
      const statsData = await statsResponse.json()
      if (statsData.stats) {
        setStats(statsData.stats)
      }

      // Fetch companies
      const companiesResponse = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-2a7b3961/companies`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json'
          }
        }
      )
      const companiesData = await companiesResponse.json()
      if (companiesData.companies) {
        setCompanies(companiesData.companies)
        setPendingCompanies(companiesData.companies.filter(c => c.status === 'pending'))
      }

    } catch (error) {
      console.error('Error fetching admin data:', error)
    }
  }

  const handleApproveCompany = async (companyId) => {
    setIsLoading(true)
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-2a7b3961/companies/${companyId}/approve`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json'
          }
        }
      )

      const data = await response.json()
      if (data.success) {
        toast.success('Company approved successfully!')
        fetchAdminData()
      } else {
        toast.error(data.error || 'Failed to approve company')
      }
    } catch (error) {
      console.error('Error approving company:', error)
      toast.error('Failed to approve company')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRejectCompany = async (companyId) => {
    // This would be implemented to reject/delete company
    toast.info('Company rejection functionality to be implemented')
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur sticky top-0 z-50">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center space-x-2">
            <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg">
              <Shield className="h-4 w-4 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              SafariTix
            </span>
            <Badge variant="outline" className="ml-2 border-red-500 text-red-600">
              Admin
            </Badge>
          </div>

          <div className="flex items-center space-x-4">
            <span className="text-sm text-muted-foreground">
              System Administrator
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
            <TabsTrigger value="dashboard">System Overview</TabsTrigger>
            <TabsTrigger value="companies">Companies</TabsTrigger>
            <TabsTrigger value="approvals">
              Pending Approvals
              {pendingCompanies.length > 0 && (
                <Badge variant="destructive" className="ml-2 h-5 px-1">
                  {pendingCompanies.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="monitoring">System Monitor</TabsTrigger>
          </TabsList>

          {/* System Overview */}
          <TabsContent value="dashboard" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-bold">System Overview</h2>
              <Badge variant="secondary" className="text-green-600 bg-green-100">
                System Operational
              </Badge>
            </div>

            {/* System Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalUsers || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    Registered commuters
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Companies</CardTitle>
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalCompanies || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    <span className="text-green-600">{stats.activeCompanies || 0} active</span> • 
                    <span className="text-orange-600 ml-1">{stats.pendingCompanies || 0} pending</span>
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Buses</CardTitle>
                  <Bus className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalBuses || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    <span className="text-green-600">{stats.activeBuses || 0} active</span>
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Platform Revenue</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {(stats.totalRevenue / 1000000)?.toFixed(1) || 0}M RWF
                  </div>
                  <p className="text-xs text-muted-foreground">
                    <TrendingUp className="inline h-3 w-3 text-green-600" />
                    <span className="text-green-600"> Total transactions</span>
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Bookings</CardTitle>
                  <CardDescription>Latest ticket bookings across all companies</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center py-8 text-muted-foreground">
                      <Activity className="h-8 w-8 mx-auto mb-2" />
                      <p>Booking activity will appear here</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>System Health</CardTitle>
                  <CardDescription>Current system status and performance</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span>API Status</span>
                      <Badge variant="secondary" className="text-green-600 bg-green-100">
                        Operational
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Database</span>
                      <Badge variant="secondary" className="text-green-600 bg-green-100">
                        Connected
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Payment Gateway</span>
                      <Badge variant="secondary" className="text-blue-600 bg-blue-100">
                        Simulation Mode
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Active Routes</span>
                      <span className="font-semibold">{stats.activeRoutes || 0}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Companies Management */}
          <TabsContent value="companies" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Company Management</h2>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  Export Report
                </Button>
              </div>
            </div>

            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Company Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Registration Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {companies.map((company) => (
                      <TableRow key={company.id}>
                        <TableCell className="font-medium">{company.name}</TableCell>
                        <TableCell>{company.email}</TableCell>
                        <TableCell>
                          <Badge variant={company.status === 'active' ? 'default' : 
                                        company.status === 'pending' ? 'secondary' : 'destructive'}>
                            {company.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(company.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            {company.status === 'pending' && (
                              <>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => handleApproveCompany(company.id)}
                                  disabled={isLoading}
                                >
                                  <Check className="h-4 w-4 text-green-600" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => handleRejectCompany(company.id)}
                                >
                                  <X className="h-4 w-4 text-red-600" />
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {companies.length === 0 && (
                  <div className="p-12 text-center">
                    <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No companies registered</h3>
                    <p className="text-muted-foreground">Companies will appear here once they register</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Pending Approvals */}
          <TabsContent value="approvals" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Pending Approvals</h2>
              {pendingCompanies.length > 0 && (
                <Badge variant="destructive" className="text-sm">
                  {pendingCompanies.length} pending
                </Badge>
              )}
            </div>

            {pendingCompanies.length > 0 ? (
              <div className="space-y-4">
                {pendingCompanies.map((company) => (
                  <Card key={company.id} className="border-orange-200">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-orange-600" />
                            {company.name}
                          </CardTitle>
                          <CardDescription>
                            Registration pending since {new Date(company.createdAt).toLocaleDateString()}
                          </CardDescription>
                        </div>
                        <Badge variant="secondary" className="text-orange-600">
                          Pending Approval
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <span className="text-sm font-medium">Email:</span>
                          <p className="text-sm text-muted-foreground">{company.email}</p>
                        </div>
                        <div>
                          <span className="text-sm font-medium">Subscription:</span>
                          <p className="text-sm text-muted-foreground">{company.subscription}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          onClick={() => handleApproveCompany(company.id)}
                          disabled={isLoading}
                          className="flex-1"
                        >
                          <Check className="h-4 w-4 mr-2" />
                          {isLoading ? 'Approving...' : 'Approve Company'}
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={() => handleRejectCompany(company.id)}
                          className="flex-1"
                        >
                          <X className="h-4 w-4 mr-2" />
                          Reject
                        </Button>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Company Details</DialogTitle>
                              <DialogDescription>
                                Review company information before approval
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <span className="font-medium">Company Name:</span>
                                <p>{company.name}</p>
                              </div>
                              <div>
                                <span className="font-medium">Email:</span>
                                <p>{company.email}</p>
                              </div>
                              <div>
                                <span className="font-medium">Registration Date:</span>
                                <p>{new Date(company.createdAt).toLocaleDateString()}</p>
                              </div>
                              <div>
                                <span className="font-medium">Status:</span>
                                <Badge>{company.status}</Badge>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <Check className="h-12 w-12 mx-auto text-green-600 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">All caught up!</h3>
                  <p className="text-muted-foreground">No pending company approvals at this time</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* System Monitoring */}
          <TabsContent value="monitoring" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">System Monitoring</h2>
              <Button variant="outline" size="sm">
                Refresh Status
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Service Status</CardTitle>
                  <CardDescription>Current status of all system services</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Authentication Service</span>
                    <Badge variant="secondary" className="text-green-600 bg-green-100">
                      Operational
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Booking Service</span>
                    <Badge variant="secondary" className="text-green-600 bg-green-100">
                      Operational
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Payment Processing</span>
                    <Badge variant="secondary" className="text-blue-600 bg-blue-100">
                      Development Mode
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>GPS Tracking</span>
                    <Badge variant="secondary" className="text-blue-600 bg-blue-100">
                      Development Mode
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>System Metrics</CardTitle>
                  <CardDescription>Key performance indicators</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Total Bookings</span>
                    <span className="font-semibold">{stats.totalBookings || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Active Routes</span>
                    <span className="font-semibold">{stats.activeRoutes || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Database Size</span>
                    <span className="font-semibold">12.5 MB</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>API Response Time</span>
                    <span className="font-semibold">245ms</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}