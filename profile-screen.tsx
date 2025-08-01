"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { User, Star, Trophy, Recycle, Leaf, Award, Calendar } from "lucide-react"
import { type User as UserType, useAuth } from "@/hooks/use-auth"

interface ProfileScreenProps {
  user: UserType
}

export function ProfileScreen({ user }: ProfileScreenProps) {
  const { signOut } = useAuth()

  const achievements = [
    { name: "Welcome Aboard", icon: Star, earned: user.achievements.some((a) => a.id === "welcome") },
    { name: "First Pickup", icon: Recycle, earned: user.pickupRequests.length > 0 },
    { name: "Eco Warrior", icon: Leaf, earned: user.points >= 500 },
    { name: "100kg Recycled", icon: Trophy, earned: user.totalWasteRecycled >= 100 },
    { name: "Point Master", icon: Award, earned: user.points >= 1000 },
    { name: "Community Hero", icon: Award, earned: user.points >= 2000 },
  ]

  // Calculate level progress
  const levelThresholds = {
    "Eco Beginner": { min: 0, max: 100 },
    "Eco Explorer": { min: 100, max: 500 },
    "Eco Warrior": { min: 500, max: 1000 },
    "Eco Champion": { min: 1000, max: 2000 },
    "Eco Master": { min: 2000, max: 5000 },
  }

  const currentLevelData =
    levelThresholds[user.level as keyof typeof levelThresholds] || levelThresholds["Eco Beginner"]
  const progress = Math.min(
    ((user.points - currentLevelData.min) / (currentLevelData.max - currentLevelData.min)) * 100,
    100,
  )
  const pointsToNext = Math.max(currentLevelData.max - user.points, 0)

  return (
    <div className="p-4 space-y-6">
      {/* Profile Header */}
      <Card>
        <CardContent className="p-6 text-center">
          <div className="w-20 h-20 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="h-10 w-10 text-green-600" />
          </div>
          <h2 className="text-xl font-bold">{user.name}</h2>
          <p className="text-gray-500">{user.level}</p>
          <div className="flex justify-center gap-4 mt-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{user.points.toLocaleString()}</div>
              <div className="text-sm text-gray-500">Points</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{user.totalWasteRecycled.toFixed(1)}kg</div>
              <div className="text-sm text-gray-500">Recycled</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{user.pickupRequests.length}</div>
              <div className="text-sm text-gray-500">Pickups</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Member Since */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Calendar className="h-5 w-5 text-gray-500" />
            <div>
              <div className="font-medium">Member Since</div>
              <div className="text-sm text-gray-500">
                {new Date(user.joinedDate).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Level Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Level Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">{user.level}</span>
            <span className="text-sm text-gray-500">
              {user.points} / {currentLevelData.max} pts
            </span>
          </div>
          <Progress value={progress} className="h-2" />
          {pointsToNext > 0 ? (
            <p className="text-xs text-gray-500 mt-2">{pointsToNext} points to next level</p>
          ) : (
            <p className="text-xs text-green-600 mt-2">Maximum level achieved! 🎉</p>
          )}
        </CardContent>
      </Card>

      {/* Achievements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-green-600" />
            Achievements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            {achievements.map((achievement) => (
              <div
                key={achievement.name}
                className={`p-3 border rounded-lg text-center ${
                  achievement.earned
                    ? "bg-green-50 border-green-200 dark:bg-green-900/20"
                    : "bg-gray-50 border-gray-200 dark:bg-gray-800"
                }`}
              >
                <achievement.icon
                  className={`h-6 w-6 mx-auto mb-2 ${achievement.earned ? "text-green-600" : "text-gray-400"}`}
                />
                <div
                  className={`text-sm font-medium ${
                    achievement.earned ? "text-green-800 dark:text-green-200" : "text-gray-500"
                  }`}
                >
                  {achievement.name}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Monthly Impact */}
      {user.monthlyStats.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Recycle className="h-5 w-5 text-blue-600" />
              Monthly Impact
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {user.monthlyStats.slice(-3).map((stat) => (
                <div key={`${stat.month}-${stat.year}`} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">
                      {stat.month} {stat.year}
                    </span>
                    <span className="text-sm text-gray-500">
                      {(stat.plastic + stat.organic + stat.ewaste).toFixed(1)}kg total
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="bg-blue-100 dark:bg-blue-900/20 p-2 rounded text-center">
                      <div className="font-medium text-blue-800 dark:text-blue-200">{stat.plastic.toFixed(1)}kg</div>
                      <div className="text-blue-600">Plastic</div>
                    </div>
                    <div className="bg-green-100 dark:bg-green-900/20 p-2 rounded text-center">
                      <div className="font-medium text-green-800 dark:text-green-200">{stat.organic.toFixed(1)}kg</div>
                      <div className="text-green-600">Organic</div>
                    </div>
                    <div className="bg-purple-100 dark:bg-purple-900/20 p-2 rounded text-center">
                      <div className="font-medium text-purple-800 dark:text-purple-200">{stat.ewaste.toFixed(1)}kg</div>
                      <div className="text-purple-600">E-waste</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-2">
        <Button className="w-full bg-green-600 hover:bg-green-700">Edit Profile</Button>
        <Button variant="outline" onClick={signOut} className="w-full bg-transparent">
          Sign Out
        </Button>
      </div>
    </div>
  )
}
