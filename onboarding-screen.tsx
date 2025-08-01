"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Recycle, MapPin, Gift, QrCode, ArrowRight, CheckCircle } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"

const onboardingSteps = [
  {
    title: "Welcome to SmartWaste KE",
    description: "Join Kenya's leading digital waste collection platform",
    icon: Recycle,
    content:
      "Transform your waste into rewards while helping build a cleaner, greener Kenya. Every piece of waste you recycle earns you points that can be redeemed for airtime, food vouchers, and more!",
  },
  {
    title: "Request Pickups",
    description: "Schedule waste collection at your convenience",
    icon: MapPin,
    content:
      "Simply select your waste type (Plastic, Organic, or E-waste), set your location, and our verified collectors will come to you. Track your pickup in real-time through the app.",
  },
  {
    title: "Scan & Earn",
    description: "Use QR codes to verify and earn points",
    icon: QrCode,
    content:
      "When collectors arrive, scan the QR code on their collection bin to verify the pickup. You'll instantly earn points based on the weight and type of waste collected.",
  },
  {
    title: "Redeem Rewards",
    description: "Turn your points into valuable rewards",
    icon: Gift,
    content:
      "Use your earned points to get Safaricom airtime, KFC vouchers, shopping credits, and more. The more you recycle, the more you earn!",
  },
]

export function OnboardingScreen() {
  const [currentStep, setCurrentStep] = useState(0)
  const { completeOnboarding } = useAuth()

  const nextStep = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      // Complete onboarding and redirect to main app
      try {
        completeOnboarding()
      } catch (error) {
        console.error("Error completing onboarding:", error)
        // Force completion even if there's an error
        completeOnboarding()
      }
    }
  }

  const skipOnboarding = () => {
    try {
      completeOnboarding()
    } catch (error) {
      console.error("Error skipping onboarding:", error)
      // Force completion even if there's an error
      completeOnboarding()
    }
  }

  const currentStepData = onboardingSteps[currentStep]
  const progress = ((currentStep + 1) / onboardingSteps.length) * 100

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-900 dark:to-blue-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
              Step {currentStep + 1} of {onboardingSteps.length}
            </span>
            <Button variant="ghost" size="sm" onClick={skipOnboarding} className="text-gray-500">
              Skip
            </Button>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Content Card */}
        <Card className="mb-8">
          <CardHeader className="text-center pb-4">
            <div className="w-20 h-20 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <currentStepData.icon className="h-10 w-10 text-green-600" />
            </div>
            <CardTitle className="text-xl">{currentStepData.title}</CardTitle>
            <CardDescription>{currentStepData.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-300 text-center leading-relaxed">{currentStepData.content}</p>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex gap-4">
          {currentStep > 0 && (
            <Button variant="outline" onClick={() => setCurrentStep(currentStep - 1)} className="flex-1">
              Previous
            </Button>
          )}
          <Button onClick={nextStep} className="flex-1 bg-green-600 hover:bg-green-700">
            {currentStep === onboardingSteps.length - 1 ? (
              <>
                Get Started
                <CheckCircle className="ml-2 h-4 w-4" />
              </>
            ) : (
              <>
                Next
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </div>

        {/* Step Indicators */}
        <div className="flex justify-center gap-2 mt-8">
          {onboardingSteps.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-colors ${
                index <= currentStep ? "bg-green-600" : "bg-gray-300 dark:bg-gray-600"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
