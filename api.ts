const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "/api"

class ApiClient {
  private getAuthHeaders() {
    const token = typeof window !== "undefined" ? localStorage.getItem("smartwaste_token") : null
    return {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    }
  }

  async request(endpoint: string, options: RequestInit = {}) {
    const url = `${API_BASE_URL}${endpoint}`

    const config: RequestInit = {
      headers: this.getAuthHeaders(),
      ...options,
    }

    try {
      const response = await fetch(url, config)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`)
      }

      return data
    } catch (error) {
      console.error("API request failed:", error)
      throw error
    }
  }

  // Auth endpoints
  async register(userData: { name: string; email: string; phone: string; password: string }) {
    return this.request("/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    })
  }

  async login(credentials: { email: string; password: string }) {
    return this.request("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    })
  }

  async getProfile() {
    return this.request("/auth/profile")
  }

  async completeOnboarding() {
    return this.request("/auth/complete-onboarding", {
      method: "POST",
    })
  }

  // Pickup endpoints
  async createPickup(pickupData: {
    type: "Plastic" | "Organic" | "E-waste"
    locationLat?: number
    locationLng?: number
    locationAddress?: string
    notes?: string
    scheduledAt?: string
  }) {
    return this.request("/pickups", {
      method: "POST",
      body: JSON.stringify(pickupData),
    })
  }

  async getPickups(params?: { status?: string; limit?: number; offset?: number }) {
    const queryString = params ? "?" + new URLSearchParams(params as any).toString() : ""
    return this.request(`/pickups${queryString}`)
  }

  async completePickup(pickupId: string, data: { weight: number; binCode: string }) {
    return this.request(`/pickups/${pickupId}/complete`, {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async getPickupStats() {
    return this.request("/pickups/stats")
  }

  // Reward endpoints
  async getRewards() {
    return this.request("/rewards")
  }

  async redeemReward(rewardId: string) {
    return this.request(`/rewards/${rewardId}/redeem`, {
      method: "POST",
    })
  }

  async getRedemptions() {
    return this.request("/rewards/redemptions")
  }

  // User endpoints
  async getUserAchievements() {
    return this.request("/users/achievements")
  }

  async getMonthlyStats() {
    return this.request("/users/monthly-stats")
  }
}

export const api = new ApiClient()
