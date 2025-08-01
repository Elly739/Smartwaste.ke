"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { QrCode, Camera, CheckCircle, Clock, Scale, Loader2 } from "lucide-react"
import { type User, useAuth } from "@/hooks/use-auth"

interface QRScanPageProps {
  user: User
}

export function QRScanPage({ user }: QRScanPageProps) {
  const [isScanning, setIsScanning] = useState(false)
  const [scannedRequest, setScannedRequest] = useState<string | null>(null)
  const [weight, setWeight] = useState("")
  const [isCompleting, setIsCompleting] = useState(false)
  const { pickupRequests, completePickup } = useAuth()

  const handleStartScan = () => {
    setIsScanning(true)
    // Simulate QR scan - in real app, this would use camera
    setTimeout(() => {
      const pendingRequest = pickupRequests.find((r) => r.status === "Pending")
      if (pendingRequest) {
        setScannedRequest(pendingRequest.id)
        setIsScanning(false)
      } else {
        alert("No pending pickup requests found!")
        setIsScanning(false)
      }
    }, 2000)
  }

  const handleCompletePickup = async () => {
    if (scannedRequest && weight) {
      try {
        setIsCompleting(true)
        const response = await completePickup(scannedRequest, Number.parseFloat(weight))
        setScannedRequest(null)
        setWeight("")
        alert(`Pickup completed successfully! You earned ${response.pointsEarned} points.`)
      } catch (error: any) {
        console.error("Failed to complete pickup:", error)
        alert(`Failed to complete pickup: ${error.message}`)
      } finally {
        setIsCompleting(false)
      }
    }
  }

  const recentScans = pickupRequests.filter((r) => r.status === "Completed").slice(0, 5)

  return (
    <div className="p-4 space-y-6">
      {/* QR Scanner */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5 text-green-600" />
            QR Code Scanner
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-lg flex items-center justify-center mb-4 relative overflow-hidden">
            <div className="absolute inset-4 border-2 border-green-500 rounded-lg"></div>
            <div className="absolute inset-8 border border-green-300 rounded"></div>
            {isScanning ? (
              <div className="text-center">
                <Loader2 className="h-12 w-12 text-green-600 mx-auto mb-4 animate-spin" />
                <p className="text-sm text-gray-600">Scanning...</p>
              </div>
            ) : (
              <Camera className="h-12 w-12 text-gray-400" />
            )}
            {!isScanning && <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-green-500 animate-pulse"></div>}
          </div>

          {scannedRequest ? (
            <div className="space-y-4">
              <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <p className="text-sm font-medium text-green-800 dark:text-green-200">
                  Pickup Request Scanned: {scannedRequest.slice(0, 8)}...
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="weight">Weight (kg)</Label>
                <div className="relative">
                  <Scale className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="weight"
                    type="number"
                    step="0.1"
                    min="0.1"
                    max="1000"
                    placeholder="Enter weight"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleCompletePickup}
                  disabled={!weight || isCompleting}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  {isCompleting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Completing...
                    </>
                  ) : (
                    "Complete Pickup"
                  )}
                </Button>
                <Button variant="outline" onClick={() => setScannedRequest(null)} className="flex-1">
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center space-y-2">
              <p className="text-sm text-gray-600 dark:text-gray-300">Position QR code within the frame</p>
              <Button
                onClick={handleStartScan}
                disabled={isScanning}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                <Camera className="h-4 w-4 mr-2" />
                {isScanning ? "Scanning..." : "Start Scanning"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800">
          <CardContent className="p-4 text-center">
            <QrCode className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <div className="font-medium">Scan Bin</div>
            <div className="text-sm text-gray-500">Log waste pickup</div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800">
          <CardContent className="p-4 text-center">
            <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <div className="font-medium">Verify Pickup</div>
            <div className="text-sm text-gray-500">Confirm collection</div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Scans */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-gray-600" />
            Recent Scans
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {recentScans.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <QrCode className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No completed scans yet</p>
              <p className="text-sm">Complete your first pickup to see scan history</p>
            </div>
          ) : (
            recentScans.map((scan) => (
              <div key={scan.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-green-100 text-green-600">
                    <CheckCircle className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="font-medium">{scan.id.slice(0, 8)}...</div>
                    <div className="text-sm text-gray-500">{scan.locationAddress}</div>
                    <div className="text-xs text-gray-400">
                      {scan.type} • {scan.weight}kg • {new Date(scan.collectedAt!).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant="secondary" className="text-green-600 bg-green-50 mb-1">
                    +{scan.pointsEarned} pts
                  </Badge>
                  <div className="text-xs text-green-600">Completed</div>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}
