export const ACHIEVEMENTS = [
  {
    id: "daily_5",
    title: "Стабильность",
    description: "5 дней подряд забирал ежедневную награду",
    icon: "📅",
    color: "#39FF14"
  },
  {
    id: "no_loss_10",
    title: "Без слива",
    description: "10 ставок подряд без проигрыша",
    icon: "🛡️",
    color: "#B026FF"
  }
]

export function ensureAchievementState(u) {
  if (!Array.isArray(u.achievements)) u.achievements = []
  if (!u.achievementProgress || typeof u.achievementProgress !== "object") {
    u.achievementProgress = { dailyStreak: 0, noLossStreak: 0, lastDailyClaimAt: null }
  }
  if (typeof u.achievementProgress.dailyStreak !== "number") u.achievementProgress.dailyStreak = 0
  if (typeof u.achievementProgress.noLossStreak !== "number") u.achievementProgress.noLossStreak = 0
  if (typeof u.achievementProgress.lastDailyClaimAt === "undefined") u.achievementProgress.lastDailyClaimAt = null
}

export function grantAchievement(u, id, createdAt) {
  ensureAchievementState(u)
  if (u.achievements.find(a => a.id === id)) return false
  u.achievements.push({ id, createdAt })
  return true
}

