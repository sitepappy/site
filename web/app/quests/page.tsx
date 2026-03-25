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
    <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in duration-700 pb-20">
      <div className="text-center space-y-4">
        <h1 className="text-5xl font-black text-white uppercase italic tracking-tighter drop-shadow-[0_0_30px_rgba(57,255,20,0.2)]">
          Доступные <span className="text-neon">Квесты</span>
        </h1>
        <p className="text-white/40 text-[10px] uppercase tracking-[0.4em] font-black">Выполняй задания — получай монеты</p>
      </div>

      {msg && (
        <div className="p-6 bg-neon/10 border border-neon/30 rounded-[32px] text-neon text-xs font-black uppercase text-center tracking-widest animate-in zoom-in shadow-[0_0_40px_rgba(57,255,20,0.1)]">
          {msg}
        </div>
      )}

      {error && (
        <div className="p-6 bg-red-500/10 border border-red-500/30 rounded-[32px] text-red-400 text-xs font-black uppercase text-center tracking-widest animate-shake">
          {error}
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {quests.map((q: any) => (
          <div key={q.id} className="glass p-8 rounded-[40px] border border-white/5 hover:border-neon/30 hover:bg-neon/5 transition-all group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-neon/5 blur-3xl group-hover:bg-neon/10 transition-all"></div>
            
            <div className="relative z-10 flex flex-col h-full justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                    {q.name.includes("ТГ") ? "📱" : q.name.includes("ставку") ? "🎮" : "🎯"}
                  </div>
                  <div className="px-3 py-1 bg-acid/10 border border-acid/30 rounded-full text-[10px] font-black text-acid uppercase tracking-widest">
                    +{q.reward} 🪙
                  </div>
                </div>
                
                <div className="space-y-1">
                  <h2 className="text-xl font-black text-white uppercase italic tracking-tight group-hover:text-neon transition-colors">{q.name}</h2>
                  <p className="text-xs text-white/40 leading-relaxed">
                    {q.name.includes("ТГ") ? "Подпишитесь на наш официальный Telegram канал и привяжите юзернейм в профиле." : 
                     q.name.includes("ставку") ? "Испытайте удачу в любом из доступных режимов игры." : 
                     "Выполните условия задания, чтобы забрать награду."}
                  </p>
                </div>
              </div>

              <div className="mt-8">
                <button 
                  onClick={() => complete(q.id)}
                  className="w-full py-4 rounded-2xl bg-white text-black text-[10px] font-black uppercase tracking-[0.2em] hover:bg-neon hover:shadow-[0_0_30px_rgba(57,255,20,0.4)] transition-all active:scale-95"
                >
                  Забрать награду
                </button>
              </div>
            </div>
          </div>
        ))}

        {quests.length === 0 && (
          <div className="col-span-full py-24 text-center glass rounded-[40px] border border-white/5">
            <div className="text-7xl mb-6 opacity-10">📁</div>
            <div className="text-sm font-black text-white/20 uppercase tracking-[0.3em]">На данный момент квестов нет</div>
          </div>
        )}
      </div>
    </div>
  )
}
