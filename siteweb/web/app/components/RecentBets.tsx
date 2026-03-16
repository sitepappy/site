"use client"
import { useEffect, useState } from "react"
import { api } from "../../lib/api"

export default function RecentBets() {
  const [bets, setBets] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api("/bets/recent")
        setBets(res)
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    load()
    const interval = setInterval(load, 10000) // Обновляем каждые 10 сек
    return () => clearInterval(interval)
  }, [])

  if (loading && bets.length === 0) return <div className="text-white/40 text-sm">Загрузка последних ставок...</div>
  if (bets.length === 0) return <div className="text-white/40 text-sm">Ставок пока нет</div>

  return (
    <div className="space-y-2">
      {bets.map((b: any) => (
        <div key={b.id} className="flex items-center justify-between gap-2 p-2 rounded bg-white/5 border border-white/10 text-xs">
          <div className="flex-1 truncate">
            <span className="font-bold text-acid">{b.username}</span> поставил на <span className="text-neon">{b.optionName}</span> ({b.matchName})
          </div>
          <div className="flex items-center gap-2">
            <span className="font-mono">{b.amount} 🪙</span>
            <span className={`px-1.5 py-0.5 rounded-full text-[10px] uppercase ${
              b.status === "won" ? "bg-green-500/20 text-green-400" :
              b.status === "lost" ? "bg-red-500/20 text-red-400" :
              "bg-blue-500/20 text-blue-400"
            }`}>
              {b.status === "won" ? "Победа" : b.status === "lost" ? "Проигрыш" : "Ожидание"}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}
