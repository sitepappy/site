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
] as const

export function getAchievementMeta(id: string) {
  return (ACHIEVEMENTS as any).find((a: any) => a.id === id) || null
}

