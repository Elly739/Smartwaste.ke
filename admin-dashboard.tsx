"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, Users, Trash2, MapPin, DollarSign, QrCode, Leaf, Award, Filter, Download } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"

interface AdminDashboardProps {
  onBackToMobile: () => void
}

export function AdminDashboard({ onBackToMobile }: AdminDashboardProps) {
  const [selectedPeriod, setSelectedPeriod] = useState("month")

  const wasteData = [
    { month: "Jan", plastic: 1200, organic: 800, ewaste: 300 },
    { month: "Feb", plastic: 1400, organic: 950, ewaste: 450 },
    { month: "Mar", plastic: 1100, organic: 1200, ewaste: 200 },
    { month: "Apr", plastic: 1600, organic: 1100, ewaste: 600 },
    { month: "May", plastic: 1800, organic: 1300, ewaste: 400 },
    { month: "Jun", plastic: 2000, organic: 1500, ewaste: 800 },
  ]

  const impactData = [
    { name: "CO₂ Saved", value: 2.4, unit: "tons", color: "#10b981" },
    { name: "Trees Saved", value: 45, unit: "trees", color: "#059669" },
    { name: "Water Saved", value: 12000, unit: "liters", color: "#3b82f6" },
  ]

  const pieData = [
    { name: "Plastic", value: 45, color: "#3b82f6" },
    { name: "Organic", value: 35, color: "#10b981" },
    { name: "E-waste", value: 20, color: "#8b5cf6" },
  ]

  const topUsers = [
    { name: "John Kamau", points: 2450, waste: "45.2kg", rank: 1 },
    { name: "Mary Wanjiku", points: 2100, waste: "38.7kg", rank: 2 },
    { name: "Peter Ochieng", points: 1890, waste: "34.1kg", rank: 3 },
    { name: "Grace Muthoni", points: 1650, waste: "29.8kg", rank: 4 },
    { name: "David Kiprop", points: 1420, waste: "26.3kg", rank: 5 },
  ]

  const topCollectors = [
    { name: "Samuel Kiprotich", collections: 156, earnings: "KES 15,600", rating: 4.9 },
    { name: "Jane Akinyi", collections: 142, earnings: "KES 14,200", rating: 4.8 },
    { name: "Michael Otieno", collections: 128, earnings: "KES 12,800", rating: 4.7 },
    { name: "Lucy Nyambura", collections: 115, earnings: "KES 11,500", rating: 4.6 },
    { name: "Robert Mwangi", collections: 98, earnings: "KES 9,800", rating: 4.5 },
  ]

  const activePickups = [
    { id: "PU001", collector: "Samuel K.", location: "Kilimani", type: "Plastic", status: "In Progress" },
    { id: "PU002", collector: "Jane A.", location: "Westlands", type: "Organic", status: "Assigned" },
    { id: "PU003", collector: "Michael O.", location: "Karen", type: "E-waste", status: "Completed" },
    { id: "PU004", collector: "Lucy N.", location: "Lavington", type: "Mixed", status: "In Progress" },
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={onBackToMobile}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">SmartWaste KE Admin</h1>
              <p className="text-gray-600 dark:text-gray-300">Digital Waste Collection Platform</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export Data
            </Button>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Waste Collected</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">12.4 tons</p>
                  <p className="text-sm text-green-600">+15% from last month</p>
                </div>
                <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-full">
                  <Trash2 className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Active Users</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">2,847</p>
                  <p className="text-sm text-blue-600">+8% from last month</p>
                </div>
                <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-full">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Active Pickups</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">156</p>
                  <p className="text-sm text-orange-600">24 in progress</p>
                </div>
                <div className="p-3 bg-orange-100 dark:bg-orange-900/20 rounded-full">
                  <MapPin className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Revenue</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">KES 45.2K</p>
                  <p className="text-sm text-green-600">+12% from last month</p>
                </div>
                <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-full">
                  <DollarSign className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="map">Live Map</TabsTrigger>
            <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
            <TabsTrigger value="bins">QR Bins</TabsTrigger>
            <TabsTrigger value="impact">Impact</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Waste Collection Trends */}
              <Card>
                <CardHeader>
                  <CardTitle>Waste Collection Trends</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={wasteData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="plastic" fill="#3b82f6" name="Plastic" />
                      <Bar dataKey="organic" fill="#10b981" name="Organic" />
                      <Bar dataKey="ewaste" fill="#8b5cf6" name="E-waste" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Waste Type Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Waste Type Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}%`}
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {activePickups.map((pickup) => (
                    <div key={pickup.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <div>
                          <div className="font-medium">{pickup.id}</div>
                          <div className="text-sm text-gray-500">
                            {pickup.collector} • {pickup.location} • {pickup.type}
                          </div>
                        </div>
                      </div>
                      <Badge
                        variant={
                          pickup.status === "Completed"
                            ? "default"
                            : pickup.status === "In Progress"
                              ? "secondary"
                              : "outline"
                        }
                        className={
                          pickup.status === "Completed"
                            ? "bg-green-100 text-green-800"
                            : pickup.status === "In Progress"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-yellow-100 text-yellow-800"
                        }
                      >
                        {pickup.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="map" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Live Collection Map</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-96 bg-gradient-to-br from-green-100 to-blue-100 dark:from-green-900 dark:to-blue-900 rounded-lg flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-[url('/placeholder.svg?height=384&width=800')] bg-cover bg-center opacity-20"></div>
                  <div className="text-center z-10">
                    <MapPin className="h-16 w-16 text-green-600 mx-auto mb-4" />
                    <p className="text-xl font-semibold text-gray-700 dark:text-gray-300">Interactive Map</p>
                    <p className="text-gray-600 dark:text-gray-400">
                      Real-time pickup locations and collector positions
                    </p>
                  </div>
                  {/* Mock pins */}
                  <div className="absolute top-20 left-32 w-6 h-6 bg-red-500 rounded-full animate-pulse flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                  <div className="absolute top-48 right-24 w-6 h-6 bg-green-500 rounded-full animate-pulse flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                  <div className="absolute bottom-32 left-48 w-6 h-6 bg-blue-500 rounded-full animate-pulse flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="leaderboard" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Top Users */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-yellow-500" />
                    Top Users
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {topUsers.map((user) => (
                      <div key={user.rank} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${
                              user.rank === 1
                                ? "bg-yellow-500"
                                : user.rank === 2
                                  ? "bg-gray-400"
                                  : user.rank === 3
                                    ? "bg-orange-600"
                                    : "bg-gray-300"
                            }`}
                          >
                            {user.rank}
                          </div>
                          <div>
                            <div className="font-medium">{user.name}</div>
                            <div className="text-sm text-gray-500">{user.waste} recycled</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-green-600">{user.points}</div>
                          <div className="text-xs text-gray-500">points</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Top Collectors */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-blue-500" />
                    Top Collectors
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {topCollectors.map((collector, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                            <Users className="h-4 w-4 text-blue-600" />
                          </div>
                          <div>
                            <div className="font-medium">{collector.name}</div>
                            <div className="text-sm text-gray-500">
                              {collector.collections} collections • ⭐ {collector.rating}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-green-600">{collector.earnings}</div>
                          <div className="text-xs text-gray-500">earned</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="bins" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <QrCode className="h-5 w-5 text-purple-600" />
                  QR Bin Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-green-600">245</div>
                      <div className="text-sm text-gray-500">Active Bins</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-blue-600">18</div>
                      <div className="text-sm text-gray-500">Pending Setup</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-red-600">7</div>
                      <div className="text-sm text-gray-500">Maintenance</div>
                    </CardContent>
                  </Card>
                </div>

                <Button className="w-full bg-purple-600 hover:bg-purple-700 mb-4">
                  <QrCode className="h-4 w-4 mr-2" />
                  Register New Bin
                </Button>

                <div className="space-y-3">
                  {[
                    { id: "BIN001", location: "Kilimani Plaza", status: "Active", lastScan: "2 hours ago" },
                    { id: "BIN002", location: "Westgate Mall", status: "Active", lastScan: "4 hours ago" },
                    { id: "BIN003", location: "Karen Center", status: "Maintenance", lastScan: "2 days ago" },
                    { id: "BIN004", location: "Lavington Mall", status: "Pending", lastScan: "Never" },
                  ].map((bin) => (
                    <div key={bin.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">{bin.id}</div>
                        <div className="text-sm text-gray-500">{bin.location}</div>
                      </div>
                      <div className="text-right">
                        <Badge
                          variant={
                            bin.status === "Active" ? "default" : bin.status === "Pending" ? "secondary" : "destructive"
                          }
                          className={
                            bin.status === "Active"
                              ? "bg-green-100 text-green-800"
                              : bin.status === "Pending"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-800"
                          }
                        >
                          {bin.status}
                        </Badge>
                        <div className="text-xs text-gray-500 mt-1">{bin.lastScan}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="impact" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              {impactData.map((impact) => (
                <Card key={impact.name}>
                  <CardContent className="p-6 text-center">
                    <Leaf className="h-12 w-12 mx-auto mb-4" style={{ color: impact.color }} />
                    <div className="text-3xl font-bold mb-2" style={{ color: impact.color }}>
                      {impact.value}
                    </div>
                    <div className="text-gray-600 dark:text-gray-300">{impact.unit}</div>
                    <div className="text-sm font-medium mt-2">{impact.name}</div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Monthly Environmental Impact</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold mb-3">Carbon Footprint Reduction</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Plastic Recycling</span>
                          <span className="font-medium">1.2 tons CO₂</span>
                        </div>
                        <Progress value={60} className="h-2" />
                        <div className="flex justify-between">
                          <span>Organic Composting</span>
                          <span className="font-medium">0.8 tons CO₂</span>
                        </div>
                        <Progress value={40} className="h-2" />
                        <div className="flex justify-between">
                          <span>E-waste Processing</span>
                          <span className="font-medium">0.4 tons CO₂</span>
                        </div>
                        <Progress value={20} className="h-2" />
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-3">Resource Conservation</h4>
                      <div className="space-y-4">
                        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                          <div className="font-medium text-blue-800 dark:text-blue-200">Water Saved</div>
                          <div className="text-2xl font-bold text-blue-600">12,000L</div>
                        </div>
                        <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                          <div className="font-medium text-green-800 dark:text-green-200">Energy Saved</div>
                          <div className="text-2xl font-bold text-green-600">3,400 kWh</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payments" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="text-2xl font-bold text-green-600">KES 156,400</div>
                  <div className="text-sm text-gray-500">Total Paid Out</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="text-2xl font-bold text-blue-600">KES 23,800</div>
                  <div className="text-sm text-gray-500">Pending Payments</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="text-2xl font-bold text-purple-600">89</div>
                  <div className="text-sm text-gray-500">Active Collectors</div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-green-600" />
                  Collector Payments
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    {
                      name: "Samuel Kiprotich",
                      phone: "+254712345678",
                      amount: "KES 2,400",
                      status: "Paid",
                      date: "Today",
                    },
                    {
                      name: "Jane Akinyi",
                      phone: "+254723456789",
                      amount: "KES 1,800",
                      status: "Pending",
                      date: "Yesterday",
                    },
                    {
                      name: "Michael Otieno",
                      phone: "+254734567890",
                      amount: "KES 3,200",
                      status: "Processing",
                      date: "2 days ago",
                    },
                    {
                      name: "Lucy Nyambura",
                      phone: "+254745678901",
                      amount: "KES 1,600",
                      status: "Paid",
                      date: "3 days ago",
                    },
                    {
                      name: "Robert Mwangi",
                      phone: "+254756789012",
                      amount: "KES 2,100",
                      status: "Pending",
                      date: "4 days ago",
                    },
                  ].map((payment, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                          <Users className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                        </div>
                        <div>
                          <div className="font-medium">{payment.name}</div>
                          <div className="text-sm text-gray-500">{payment.phone}</div>
                          <div className="text-xs text-gray-400">{payment.date}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-green-600 mb-1">{payment.amount}</div>
                        <Badge
                          variant={
                            payment.status === "Paid"
                              ? "default"
                              : payment.status === "Processing"
                                ? "secondary"
                                : "outline"
                          }
                          className={
                            payment.status === "Paid"
                              ? "bg-green-100 text-green-800"
                              : payment.status === "Processing"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-yellow-100 text-yellow-800"
                          }
                        >
                          {payment.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 flex gap-2">
                  <Button className="flex-1 bg-green-600 hover:bg-green-700">Process M-Pesa Payments</Button>
                  <Button variant="outline" className="flex-1 bg-transparent">
                    Send Airtime Credits
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
