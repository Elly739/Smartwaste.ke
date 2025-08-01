"use client"

import { useState, useEffect, useCallback } from "react"
import { api } from "@/lib/api"

export interface User {
  id: string
  name: string
  email: string
  phone: string
  points: number
  totalWasteRecycled: number
  level: string
  joinedDate: string
  hasCompletedOnboarding: boolean
}

export interface PickupRequest {
  id: string
  type: "Plastic" | "Organic" | "E-waste"
  status: "Pending" | "Assigned" | "In Progress" | "Collected" | "Completed"
  weight?: number
  pointsEarned?: number
  createdAt: string
  collectedAt?: string
  locationAddress?: string
  collectorName?: string
}

export interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  earned: boolean
  earnedAt?: string
}

export interface MonthlyStats {
  month: string
  year: number
  plastic: number
  organic: number
  ewaste: number
  totalPoints: number
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [pickupRequests, setPickupRequests] = useState<PickupRequest[]>([])
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [monthlyStats, setMonthlyStats] = useState<MonthlyStats[]>([])

  const loadUserData = useCallback(async () => {
    try {
      const token = localStorage.getItem("smartwaste_token")
      if (!token) {
        setIsLoading(false)
        return
      }

      // Load user profile
      const profileResponse = await api.getProfile()
      setUser(profileResponse.user)

      // Load user's pickup requests
      const pickupsResponse = await api.getPickups({ limit: 50 })
      setPickupRequests(pickupsResponse.pickups)

      // Load achievements (when endpoint is available)
      try {
        const achievementsResponse = await api.getUserAchievements()
        setAchievements(achievementsResponse.achievements)
      } catch (error) {
        // Achievements endpoint might not be implemented yet
        console.log("Achievements not loaded:", error)
      }

      // Load monthly stats (when endpoint is available)
      try {
        const statsResponse = await api.getMonthlyStats()
        setMonthlyStats(statsResponse.monthlyStats)
      } catch (error) {
        // Monthly stats endpoint might not be implemented yet
        console.log("Monthly stats not loaded:", error)
      }
    } catch (error) {
      console.error("Failed to load user data:", error)
      // If token is invalid, clear it
      localStorage.removeItem("smartwaste_token")
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadUserData()
  }, [loadUserData])

  const signUp = async (userData: {
    name: string
    email: string
    phone: string
    password: string
  }) => {
    try {
      setIsLoading(true)
      const response = await api.register(userData)

      // Store token
      localStorage.setItem("smartwaste_token", response.token)

      // Set user data
      setUser(response.user)
      setPickupRequests([])
      setAchievements([])
      setMonthlyStats([])

      return response.user
    } catch (error) {
      console.error("Sign up error:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      setIsLoading(true)
      const response = await api.login({ email, password })

      // Store token
      localStorage.setItem("smartwaste_token", response.token)

      // Load all user data
      await loadUserData()

      return response.user
    } catch (error) {
      console.error("Sign in error:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const signOut = () => {
    localStorage.removeItem("smartwaste_token")
    setUser(null)
    setPickupRequests([])
    setAchievements([])
    setMonthlyStats([])
  }

  const completeOnboarding = async () => {
    try {
      await api.completeOnboarding()
      if (user) {
        setUser({ ...user, hasCompletedOnboarding: true })
      }
    } catch (error) {
      console.error("Complete onboarding error:", error)
      throw error
    }
  }

  const addPickupRequest = async (request: {
    type: "Plastic" | "Organic" | "E-waste"
    locationAddress?: string
    notes?: string
  }) => {
    try {
      const response = await api.createPickup({
        type: request.type,
        locationAddress: request.locationAddress || "Current Location",
        notes: request.notes,
      })

      // Reload pickup requests
      const pickupsResponse = await api.getPickups({ limit: 50 })
      setPickupRequests(pickupsResponse.pickups)

      return response.pickup
    } catch (error) {
      console.error("Add pickup request error:", error)
      throw error
    }
  }

  const completePickup = async (requestId: string, weight: number, binCode = "BIN001") => {
    try {
      const response = await api.completePickup(requestId, { weight, binCode })

      // Reload user data to get updated points and stats
      await loadUserData()

      return response
    } catch (error) {
      console.error("Complete pickup error:", error)
      throw error
    }
  }

  const redeemReward = async (rewardId: string) => {
    try {
      const response = await api.redeemReward(rewardId)

      // Reload user data to get updated points
      await loadUserData()

      return response
    } catch (error) {
      console.error("Redeem reward error:", error)
      throw error
    }
  }

  return {
    user,
    isLoading,
    pickupRequests,
    achievements,
    monthlyStats,
    signUp,
    signIn,
    signOut,
    completeOnboarding,
    addPickupRequest,
    completePickup,
    redeemReward,
    refreshData: loadUserData,
  }
}
