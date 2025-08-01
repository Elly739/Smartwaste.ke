import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MapPin, Navigation, Filter } from "lucide-react"

export function MapView() {
  const nearbyRequests = [
    {
      id: "REQ004",
      type: "Plastic",
      distance: "0.5km",
      address: "Kilimani, Nairobi",
      points: 25,
      status: "Available",
    },
    {
      id: "REQ005",
      type: "Organic",
      distance: "1.2km",
      address: "Westlands, Nairobi",
      points: 15,
      status: "Available",
    },
    {
      id: "REQ006",
      type: "E-waste",
      distance: "2.1km",
      address: "Karen, Nairobi",
      points: 75,
      status: "In Progress",
    },
  ]

  return (
    <div className="p-4 space-y-4">
      {/* Map Placeholder */}
      <Card>
        <CardContent className="p-0">
          <div className="h-64 bg-gradient-to-br from-green-100 to-blue-100 dark:from-green-900 dark:to-blue-900 rounded-lg flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('/placeholder.svg?height=256&width=400')] bg-cover bg-center opacity-20"></div>
            <div className="text-center z-10">
              <MapPin className="h-12 w-12 text-green-600 mx-auto mb-2" />
              <p className="text-gray-600 dark:text-gray-300">Interactive Map View</p>
              <p className="text-sm text-gray-500">Showing nearby collection requests</p>
            </div>
            {/* Mock location pins */}
            <div className="absolute top-16 left-20 w-4 h-4 bg-red-500 rounded-full animate-pulse"></div>
            <div className="absolute top-32 right-16 w-4 h-4 bg-green-500 rounded-full animate-pulse"></div>
            <div className="absolute bottom-20 left-32 w-4 h-4 bg-blue-500 rounded-full animate-pulse"></div>
          </div>
        </CardContent>
      </Card>

      {/* Filter Controls */}
      <div className="flex gap-2">
        <Button variant="outline" size="sm" className="flex-1 bg-transparent">
          <Filter className="h-4 w-4 mr-2" />
          Filter
        </Button>
        <Button variant="outline" size="sm" className="flex-1 bg-transparent">
          <Navigation className="h-4 w-4 mr-2" />
          Navigate
        </Button>
      </div>

      {/* Nearby Requests */}
      <Card>
        <CardHeader>
          <CardTitle>Nearby Requests</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {nearbyRequests.map((request) => (
            <div key={request.id} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div>
                  <div className="font-medium">{request.id}</div>
                  <div className="text-sm text-gray-500">{request.address}</div>
                  <div className="text-xs text-gray-400">{request.distance} away</div>
                </div>
              </div>
              <div className="text-right">
                <Badge variant="secondary" className="text-green-600 bg-green-50 mb-1">
                  {request.points} pts
                </Badge>
                <div className="text-xs text-gray-500">{request.type}</div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
