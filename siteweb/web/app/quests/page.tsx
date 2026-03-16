"use client"
import { useEffect, useState } from "react"
import { api } from "../../lib/api"

export default function QuestsPage() {
  const [quests, setQuests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [msg, setMsg] = useState("")

  const load = async () => {
    try {
      const res = await api("/quests")
      setQuests(res)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const complete = async (id: string) => {
    setMsg("")
    setError("")
    try {
      await api(`/quests/${id}/complete`, { method: "POST" })
      setMsg("Квест выполнен! Награда начислена.")
      load()
    } catch (e: any) {
      setError(e.message)
    }
  }

  if (loading) return <div className="text-white/60">Загрузка квестов...</div>

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-neon">Доступные квесты</h1>
      {msg && <div className="p-3 bg-acid/20 text-acid rounded border border-acid/50">{msg}</div>}
      {error && <div className="p-3 bg-red-500/20 text-red-400 rounded border border-red-500/50">{error}</div>}
      
      <div className="grid gap-4">
        {quests.map((q: any) => (
          <div key={q.id} className="glass p-4 rounded-lg flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold">{q.name}</h2>
              <div className="text-sm text-white/60">Награда: <span className="text-acid">{q.reward} 🪙</span></div>
            </div>
            <button 
              onClick={() => complete(q.id)}
              className="btn btn-primary"
            >
              Выполнить
            </button>
          </div>
        ))}
        {quests.length === 0 && <div className="text-white/60">Квестов пока нет</div>}
      </div>
    </div>
  )
}
