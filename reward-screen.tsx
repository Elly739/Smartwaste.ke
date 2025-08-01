"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Gift, Smartphone, Coffee, ShoppingBag, Star, Coins, Loader2 } from "lucide-react"
import { type User, useAuth } from "@/hooks/use-auth"
import { api } from "@/lib/api"

interface RewardScreenProps {
  user: User
}

interface Reward {
  id: string
  name: string
  description: string
  category: string
  pointsCost: number
  valueKes: number
  available: boolean
}

interface Redemption {
  id: string
  rewardName: string
  rewardDescription: string
  pointsSpent: number
  status: string
  redemptionCode: string
  redeemedAt: string
}

export function RewardScreen({ user }: RewardScreenProps) {
  const [rewards, setRewards] = useState<Reward[]>([])
  const [redemptions, setRedemptions] = useState<Redemption[]>([])
  const [redeeming, setRedeeming] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const { redeemReward } = useAuth()

  useEffect(() => {
    loadRewards()
    loadRedemptions()
  }, [])

  const loadRewards = async () => {
    try {
      const response = await api.getRewards()
      setRewards(response.rewards)
    } catch (error) {
      console.error("Failed to load rewards:", error)
    } finally {
      setLoading(false)
    }
  }

  const loadRedemptions = async () => {
    try {
      const response = await api.getRedemptions()
      setRedemptions(response.redemptions)
    } catch (error) {
      console.error("Failed to load redemptions:", error)
    }
  }

  const handleRedeem = async (reward: Reward) => {
    if (user.points < reward.pointsCost) return

    try {
      setRedeeming(reward.id)
      const response = await redeemReward(reward.id)

      // Reload redemptions
      await loadRedemptions()

      alert(`Successfully redeemed ${reward.name}! Redemption code: ${response.redemptionCode}`)
    } catch (error: any) {
      console.error("Failed to redeem reward:", error)
      alert(`Failed to redeem reward: ${error.message}`)
    } finally {
      setRedeeming(null)
    }
  }

  // Calculate next reward threshold
  const nextReward = rewards.filter((r) => r.pointsCost > user.points).sort((a, b) => a.pointsCost - b.pointsCost)[0]
  const pointsToNext = nextReward ? nextReward.pointsCost - user.points : 0

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case "airtime":
        return Smartphone
      case "food":
        return Coffee
      case "shopping":
        return ShoppingBag
      default:
        return Gift
    }
  }

  if (loading) {
    return (
      <div className="p-4 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-green-600" />
          <p className="text-gray-600">Loading rewards...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 space-y-6">
      {/* Points Balance */}
      <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
        <CardContent className="p-6 text-center">
          <Coins className="h-12 w-12 mx-auto mb-4 text-green-100" />
          <div className="text-3xl font-bold mb-2">{user.points.toLocaleString()}</div>
          <div className="text-green-100">Available Points</div>
          {nextReward && (
            <div className="mt-4 bg-green-400/20 rounded-full p-2">
              <div className="text-sm">Next reward in {pointsToNext} points</div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* New User Message */}
      {user.points === 0 && (
        <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
          <CardContent className="p-4 text-center">
            <Gift className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <h3 className="font-medium text-blue-800 dark:text-blue-200 mb-1">Start Earning Points!</h3>
            <p className="text-sm text-blue-600 dark:text-blue-300">
              Complete pickup requests to earn points and unlock amazing rewards
            </p>
          </CardContent>
        </Card>
      )}

      {/* Reward Categories */}
      <div className="grid grid-cols-3 gap-3">
        {["Airtime", "Food", "Shopping"].map((category) => {
          const Icon = getCategoryIcon(category)
          return (
            <Card key={category} className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800">
              <CardContent className="p-3 text-center">
                <Icon className="h-6 w-6 text-blue-600 mx-auto mb-1" />
                <div className="text-sm font-medium">{category}</div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Available Rewards */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5 text-green-600" />
            Available Rewards
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {rewards.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Gift className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No rewards available</p>
              <p className="text-sm">Check back later for new rewards!</p>
            </div>
          ) : (
            rewards.map((reward) => {
              const canRedeem = user.points >= reward.pointsCost && reward.available
              const isRedeeming = redeeming === reward.id
              const Icon = getCategoryIcon(reward.category)

              return (
                <div key={reward.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full">
                      <Icon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                    </div>
                    <div>
                      <div className="font-medium">{reward.name}</div>
                      <div className="text-sm text-gray-500">{reward.description}</div>
                      <Badge variant="outline" className="text-xs mt-1">
                        {reward.category}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-green-600 mb-1">{reward.pointsCost.toLocaleString()} pts</div>
                    <Button
                      size="sm"
                      disabled={!canRedeem || isRedeeming}
                      onClick={() => handleRedeem(reward)}
                      className="bg-green-600 hover:bg-green-700 disabled:bg-gray-300"
                    >
                      {isRedeeming ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Redeeming...
                        </>
                      ) : canRedeem ? (
                        "Redeem"
                      ) : (
                        "Locked"
                      )}
                    </Button>
                  </div>
                </div>
              )
            })
          )}
        </CardContent>
      </Card>

      {/* Redemption History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500" />
            Redemption History
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {redemptions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Star className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No redemptions yet</p>
              <p className="text-sm">Redeem your first reward to see history here</p>
            </div>
          ) : (
            redemptions.slice(0, 5).map((redemption) => (
              <div
                key={redemption.id}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
              >
                <div>
                  <div className="font-medium">{redemption.rewardName}</div>
                  <div className="text-sm text-gray-500">
                    Code: {redemption.redemptionCode} • {new Date(redemption.redeemedAt).toLocaleDateString()}
                  </div>
                  <Badge variant={redemption.status === "Completed" ? "default" : "secondary"} className="text-xs mt-1">
                    {redemption.status}
                  </Badge>
                </div>
                <div className="text-right">
                  <div className="text-sm text-red-600">-{redemption.pointsSpent} pts</div>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}
