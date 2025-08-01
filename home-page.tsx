"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trash2, Leaf, Smartphone, Plus, Clock, Loader2 } from "lucide-react"
import { type User, useAuth } from "@/hooks/use-auth"

interface HomePageProps {
  user: User
}

export function HomePage({ user }: HomePageProps) {
  const { addPickupRequest, pickupRequests } = useAuth()
  const [isCreatingPickup, setIsCreatingPickup] = useState<string | null>(null)

  const wasteTypes = [
    {
      type: "Plastic" as const,
      icon: Trash2,
      color: "bg-blue-500",
      points: "5 pts/kg",
      description: "Bottles, bags, containers",
    },
    {
      type: "Organic" as const,
      icon: Leaf,
      color: "bg-green-500",
      points: "3 pts/kg",
      description: "Food waste, garden waste",
    },
    {
      type: "E-waste" as const,
      icon: Smartphone,
      color: "bg-purple-500",
      points: "15 pts/kg",
      description: "Electronics, batteries",
    },
  ]

  const handleRequestPickup = async (wasteType: "Plastic" | "Organic" | "E-waste") => {
    try {
      setIsCreatingPickup(wasteType)
      await addPickupRequest({
        type: wasteType,
        locationAddress: "Current Location",
        notes: `${wasteType} waste pickup request`,
      })
      // Show success message
      alert(`${wasteType} pickup requested successfully!`)
    } catch (error: any) {
      console.error("Failed to create pickup:", error)
      alert(`Failed to request pickup: ${error.message}`)
    } finally {
      setIsCreatingPickup(null)
    }
  }

  // Show welcome message for new users
  const isNewUser = pickupRequests.length === 0 && user.points === 0

  return (
    <div className="p-4 space-y-6">
      {/* Welcome Message for New Users */}
      {isNewUser && (
        <Card className="bg-gradient-to-r from-green-500 to-blue-500 text-white">
          <CardContent className="p-4">
            <h3 className="font-bold text-lg mb-2">Welcome to SmartWaste KE! 🌱</h3>
            <p className="text-green-100 text-sm">
              Start your recycling journey by requesting your first pickup below. You'll earn points for every kilogram
              of waste you recycle!
            </p>
          </CardContent>
        </Card>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{user.points.toLocaleString()}</div>
            <div className="text-green-100 text-sm">Points Earned</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{user.totalWasteRecycled.toFixed(1)}kg</div>
            <div className="text-blue-100 text-sm">Waste Recycled</div>
          </CardContent>
        </Card>
      </div>

      {/* Request Pickup Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5 text-green-600" />
            Request Pickup
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {wasteTypes.map((waste) => (
            <div
              key={waste.type}
              className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-full ${waste.color} text-white`}>
                  <waste.icon className="h-4 w-4" />
                </div>
                <div>
                  <div className="font-medium">{waste.type}</div>
                  <div className="text-sm text-gray-500">{waste.description}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="secondary" className="text-green-600 bg-green-50">
                  {waste.points}
                </Badge>
                <Button
                  size="sm"
                  onClick={() => handleRequestPickup(waste.type)}
                  disabled={isCreatingPickup === waste.type}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isCreatingPickup === waste.type ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Requesting...
                    </>
                  ) : (
                    "Request"
                  )}
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Recent Requests */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-gray-600" />
            Recent Requests
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {pickupRequests.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Clock className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No pickup requests yet</p>
              <p className="text-sm">Request your first pickup above to get started!</p>
            </div>
          ) : (
            pickupRequests.slice(0, 3).map((request) => (
              <div key={request.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <div className="font-medium">{request.id.slice(0, 8)}...</div>
                  <div className="text-sm text-gray-500">
                    {request.type} • {new Date(request.createdAt).toLocaleDateString()}
                  </div>
                  {request.collectorName && (
                    <div className="text-xs text-blue-600">Collector: {request.collectorName}</div>
                  )}
                </div>
                <div className="text-right">
                  <Badge
                    variant={
                      request.status === "Completed"
                        ? "default"
                        : request.status === "Pending"
                          ? "secondary"
                          : "outline"
                    }
                    className={
                      request.status === "Completed"
                        ? "bg-green-100 text-green-800"
                        : request.status === "Pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-blue-100 text-blue-800"
                    }
                  >
                    {request.status}
                  </Badge>
                  {request.pointsEarned && (
                    <div className="text-xs text-green-600 mt-1">+{request.pointsEarned} pts</div>
                  )}
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}
