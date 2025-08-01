"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Recycle, MapPin, User, QrCode, Gift } from "lucide-react"
import { MobileHeader } from "@/components/mobile-header"
import { HomePage } from "@/components/home-page"
import { MapView } from "@/components/map-view"
import { ProfileScreen } from "@/components/profile-screen"
import { QRScanPage } from "@/components/qr-scan-page"
import { RewardScreen } from "@/components/reward-screen"
import { AdminDashboard } from "@/components/admin-dashboard"
import { AuthScreen } from "@/components/auth-screen"
import { OnboardingScreen } from "@/components/onboarding-screen"
import { useAuth } from "@/hooks/use-auth"

export default function SmartWasteApp() {
  const [activeTab, setActiveTab] = useState("home")
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [viewMode, setViewMode] = useState<"mobile" | "admin">("mobile")
  const { user, isLoading } = useAuth()

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode)
    document.documentElement.classList.toggle("dark")
  }

  // Show loading screen while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading SmartWaste KE...</p>
        </div>
      </div>
    )
  }

  // Show auth screen if not logged in
  if (!user) {
    console.log("No user logged in")
    return <AuthScreen />
  }

  // Show onboarding for new users
  if (user && !user.hasCompletedOnboarding) {
    console.log("Showing onboarding for user:", user.name, "Onboarding status:", user.hasCompletedOnboarding)
    return <OnboardingScreen />
  }

  console.log("User state:", user ? `${user.name} - Onboarding: ${user.hasCompletedOnboarding}` : "No user")

  if (viewMode === "admin") {
    return <AdminDashboard onBackToMobile={() => setViewMode("mobile")} />
  }

  return (
    <div className={`min-h-screen bg-gray-50 ${isDarkMode ? "dark" : ""}`}>
      <div className="max-w-md mx-auto bg-white dark:bg-gray-900 min-h-screen">
        <MobileHeader
          isDarkMode={isDarkMode}
          toggleDarkMode={toggleDarkMode}
          onViewAdmin={() => setViewMode("admin")}
          user={user}
        />

        <main className="flex flex-col h-screen">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col flex-1">
            {/* Content Area */}
            <div className="flex-1 overflow-auto">
              <TabsContent value="home" className="mt-0 h-full">
                <HomePage user={user} />
              </TabsContent>

              <TabsContent value="map" className="mt-0 h-full">
                <MapView />
              </TabsContent>

              <TabsContent value="profile" className="mt-0 h-full">
                <ProfileScreen user={user} />
              </TabsContent>

              <TabsContent value="scan" className="mt-0 h-full">
                <QRScanPage user={user} />
              </TabsContent>

              <TabsContent value="rewards" className="mt-0 h-full">
                <RewardScreen user={user} />
              </TabsContent>
            </div>

            {/* Bottom Navigation */}
            <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
              <TabsList className="grid w-full grid-cols-5 h-16 bg-transparent rounded-none">
                <TabsTrigger
                  value="home"
                  className="flex flex-col gap-1 data-[state=active]:text-green-600 data-[state=active]:bg-green-50 dark:data-[state=active]:bg-green-900/20 rounded-none"
                >
                  <Recycle className="h-5 w-5" />
                  <span className="text-xs">Home</span>
                </TabsTrigger>
                <TabsTrigger
                  value="map"
                  className="flex flex-col gap-1 data-[state=active]:text-green-600 data-[state=active]:bg-green-50 dark:data-[state=active]:bg-green-900/20 rounded-none"
                >
                  <MapPin className="h-5 w-5" />
                  <span className="text-xs">Map</span>
                </TabsTrigger>
                <TabsTrigger
                  value="scan"
                  className="flex flex-col gap-1 data-[state=active]:text-green-600 data-[state=active]:bg-green-50 dark:data-[state=active]:bg-green-900/20 rounded-none"
                >
                  <QrCode className="h-5 w-5" />
                  <span className="text-xs">Scan</span>
                </TabsTrigger>
                <TabsTrigger
                  value="rewards"
                  className="flex flex-col gap-1 data-[state=active]:text-green-600 data-[state=active]:bg-green-50 dark:data-[state=active]:bg-green-900/20 rounded-none"
                >
                  <Gift className="h-5 w-5" />
                  <span className="text-xs">Rewards</span>
                </TabsTrigger>
                <TabsTrigger
                  value="profile"
                  className="flex flex-col gap-1 data-[state=active]:text-green-600 data-[state=active]:bg-green-50 dark:data-[state=active]:bg-green-900/20 rounded-none"
                >
                  <User className="h-5 w-5" />
                  <span className="text-xs">Profile</span>
                </TabsTrigger>
              </TabsList>
            </div>
          </Tabs>
        </main>
      </div>
    </div>
  )
}
