"use client"
import { useEffect, useState } from "react"
import { api } from "../../lib/api"

export default function SchedulePage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api("/public/schedule")
        setData(res)
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="w-12 h-12 border-4 border-neon border-t-transparent rounded-full animate-spin"></div>
        <div className="text-neon font-bold animate-pulse uppercase tracking-widest text-xs">Загрузка расписания...</div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="max-w-md mx-auto glass p-8 rounded-2xl text-center space-y-6">
        <div className="text-5xl mb-4">🗓️</div>
        <h1 className="text-2xl font-black uppercase italic tracking-tighter">Расписание недоступно</h1>
        <p className="text-white/50 text-sm leading-relaxed">Не удалось загрузить расписание. Попробуйте позже.</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="prose prose-invert prose-headings:text-neon prose-headings:font-black prose-headings:tracking-tighter prose-a:text-acid hover:prose-a:text-neon prose-strong:text-white">
        <div dangerouslySetInnerHTML={{ __html: data.contentHtml }} />
      </div>

      {data.streams && data.streams.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-black text-white tracking-tighter">Активные стримы</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {data.streams.map((s: any) => (
              <a key={s.id} href={s.link} target="_blank" rel="noopener noreferrer" className="block glass p-5 rounded-xl border border-white/5 hover:border-neon transition-all group">
                <div className="flex justify-between items-center">
                  <div className="text-lg font-bold text-white group-hover:text-neon transition-colors">{s.title}</div>
                  <div className="text-sm font-mono bg-acid/10 text-acid px-3 py-1 rounded-full font-bold">{s.time}</div>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
