"use client"
import { useEffect, useState } from "react"
import { api } from "../../lib/api"
import { useRouter } from "next/navigation"
import Link from "next/link"
import AchievementsPanel from "../components/AchievementsPanel"

export default function ProfilePage() {
  const [me, setMe] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [mounted, setMounted] = useState(false)
  const [orders, setOrders] = useState<any[]>([])
  
  const [link, setLink] = useState("")
  const [telegram, setTelegram] = useState("")
  const [username, setUsername] = useState("")
  const [avatarUrl, setAvatarUrl] = useState("")
  const [bannerUrl, setBannerUrl] = useState("")
  
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
    load()
  }, [])

  const load = async () => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
    if (!token) {
      setLoading(false)
      return
    }

    try {
      const m = await api("/users/me")
      setMe(m)
      setLink(m.steamTradeLink || "")
      setTelegram(m.telegram || "")
      setUsername(m.username || "")
      setAvatarUrl(m.avatarUrl || "")
      setBannerUrl(m.bannerUrl || "")
      const myOrders = await api("/orders/my")
      setOrders(Array.isArray(myOrders) ? myOrders : [])
    } catch (e: any) {
      if (e.message === "UNAUTHORIZED") {
        localStorage.removeItem("token")
        setMe(null)
      } else {
        setError(e.message)
      }
    } finally {
      setLoading(false)
    }
  }

  const save = async () => {
    setError("")
    try {
      await api("/users/me", { method: "PUT", body: JSON.stringify({ username, avatarUrl, bannerUrl }) })
      await api("/users/trade-link", { method: "PUT", body: JSON.stringify({ link, telegram }) })
      load()
    } catch (e: any) {
      setError(e.message)
    }
  }

  if (!mounted) return null
  
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="w-12 h-12 border-4 border-neon border-t-transparent rounded-full animate-spin"></div>
        <div className="text-neon font-bold animate-pulse uppercase tracking-widest text-xs">Синхронизация профиля...</div>
      </div>
    )
  }

  if (!me) {
    return (
      <div className="max-w-md mx-auto glass p-8 rounded-lg text-center space-y-6">
        <div className="text-5xl mb-4">🔐</div>
        <h1 className="text-2xl font-black uppercase italic tracking-tighter">Доступ Ограничен</h1>
        <p className="text-white/50 text-sm leading-relaxed">Чтобы увидеть свой профиль, необходимо войти в систему.</p>
        <div className="flex gap-3 justify-center">
          <Link href="/login" className="btn btn-primary px-8 py-3 text-xs font-black uppercase italic">Войти</Link>
          <Link href="/register" className="btn glass px-8 py-3 text-xs font-black uppercase italic">Создать Аккаунт</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Шапка профиля с баннером */}
      <div className="relative glass rounded-2xl overflow-hidden border border-white/5 shadow-2xl">
        <div className="h-48 md:h-64 bg-gradient-to-br from-base-light to-base relative overflow-hidden">
          {me.bannerUrl ? (
            <img src={me.bannerUrl} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(57,255,20,0.1),transparent)]"></div>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
        </div>

        <div className="px-6 pb-6 relative">
          <div className="flex flex-col md:flex-row items-end gap-6 -mt-16 md:-mt-20 mb-6">
            <div className="relative group">
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-base border-4 border-base-light overflow-hidden shadow-2xl flex items-center justify-center">
                {me.avatarUrl ? (
                  <img src={me.avatarUrl} alt={me.username} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-5xl font-black text-neon/20">{me.username?.[0]?.toUpperCase()}</span>
                )}
              </div>
              <div className="absolute -bottom-1 -right-1 bg-acid text-black text-[10px] font-black px-3 py-1 rounded-full uppercase italic tracking-tighter shadow-lg">
                {me.level?.name || "1"}
              </div>
            </div>

            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 mb-2">
                <h1 className="text-3xl font-black italic tracking-tighter text-white drop-shadow-md">
                  {me.username}
                </h1>
                <span className="inline-block px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-black uppercase italic tracking-widest text-white/40">
                  {me.role}
                </span>
              </div>
              <div className="text-xs text-white/40 font-mono flex items-center justify-center md:justify-start gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                </svg>
                В системе с {new Date(me.createdAt).toLocaleDateString()}
              </div>
            </div>

            <div className="flex gap-2">
              <div className="glass px-6 py-3 rounded-xl border border-white/5 bg-white/5 text-center">
                <div className="text-[10px] font-black text-white/40 uppercase mb-1 tracking-widest">Баланс</div>
                <div className="text-xl font-black text-acid font-mono">{me.balance} 🪙</div>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6 pt-6 border-t border-white/5">
            <div className="space-y-4">
              <h3 className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-neon"></span>
                Основные Настройки
              </h3>
              <div className="space-y-4">
                <div className="group">
                  <label className="text-[10px] font-black text-white/20 uppercase ml-2 mb-1 block tracking-widest">Никнейм</label>
                  <input className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-neon transition-all" value={username} onChange={e=>setUsername(e.target.value)} />
                </div>
                <div className="group">
                  <label className="text-[10px] font-black text-white/20 uppercase ml-2 mb-1 block tracking-widest">Аватарка (URL)</label>
                  <input className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-neon transition-all" value={avatarUrl} onChange={e=>setAvatarUrl(e.target.value)} />
                </div>
                <div className="group">
                  <label className="text-[10px] font-black text-white/20 uppercase ml-2 mb-1 block tracking-widest">Баннер профиля (URL)</label>
                  <input className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-neon transition-all" value={bannerUrl} onChange={e=>setBannerUrl(e.target.value)} />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-acid"></span>
                Игровые Настройки
              </h3>
              <div className="space-y-4">
                <div className="group">
                  <label className="text-[10px] font-black text-white/20 uppercase ml-2 mb-1 block tracking-widest">Steam Trade Link</label>
                  <input className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-neon transition-all" value={link} onChange={e=>setLink(e.target.value)} />
                </div>
                <div className="group">
                  <label className="text-[10px] font-black text-white/20 uppercase ml-2 mb-1 block tracking-widest">Telegram Username</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 text-sm">@</span>
                    <input className="w-full bg-white/5 border border-white/10 rounded-xl px-4 pl-8 py-3 text-sm outline-none focus:border-neon transition-all" value={telegram} onChange={e=>setTelegram(e.target.value)} placeholder="username" />
                  </div>
                </div>
                <div className="pt-5">
                  <button onClick={save} className="btn btn-primary w-full py-4 text-xs font-black uppercase italic tracking-widest shadow-[0_0_20px_rgba(57,255,20,0.2)] hover:shadow-neon transition-all">
                    Сохранить изменения
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-[10px] font-black uppercase text-center tracking-widest animate-shake">
          Ошибка: {error}
        </div>
      )}

      <AchievementsPanel achievements={me.achievements} />

      <div className="glass p-6 rounded-2xl border border-white/5">
        <div className="flex items-end justify-between gap-4">
          <div>
            <div className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em]">Заказы</div>
            <div className="text-xl font-black text-white uppercase tracking-tighter">Статусы и SLA</div>
          </div>
          <button
            onClick={async () => {
              try {
                const myOrders = await api("/orders/my")
                setOrders(Array.isArray(myOrders) ? myOrders : [])
              } catch {}
            }}
            className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-white/50 hover:text-white hover:border-neon/30 transition-all"
          >
            Обновить
          </button>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-10 text-white/20 font-black uppercase tracking-widest">
            Заказов пока нет
          </div>
        ) : (
          <div className="grid gap-3 mt-6">
            {orders
              .slice()
              .sort((a, b) => String(b.createdAt || "").localeCompare(String(a.createdAt || "")))
              .map((o: any) => {
                const createdMs = o.createdAt ? Date.parse(o.createdAt) : null
                const updatedMs = o.updatedAt ? Date.parse(o.updatedAt) : null
                const ageMs = createdMs ? Date.now() - createdMs : 0
                const ageH = Math.floor(ageMs / 3600000)
                const ageM = Math.floor((ageMs % 3600000) / 60000)
                const slaBad = (o.status === "Pending" || o.status === "InProgress") && ageH >= 24
                const statusRu =
                  o.status === "Pending" ? "Ожидает" :
                  o.status === "InProgress" ? "В работе" :
                  o.status === "Issued" ? "Выдано" :
                  o.status === "Rejected" ? "Отклонено" : "Выполнено"
                const lastMsg = Array.isArray(o.messages) && o.messages.length > 0 ? o.messages[o.messages.length - 1] : null
                return (
                  <div key={o.id} className="p-4 rounded-2xl bg-white/5 border border-white/10">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                      <div className="space-y-1">
                        <div className="text-sm font-black text-white uppercase tracking-tight">{o.rewardName || "Заказ"}</div>
                        <div className="text-[10px] text-white/30 font-mono">
                          {o.createdAt ? new Date(o.createdAt).toLocaleString() : ""}{updatedMs ? ` • upd ${new Date(o.updatedAt).toLocaleString()}` : ""}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-[9px] px-2 py-1 rounded-full font-black uppercase tracking-widest ${
                          o.status === "Pending" ? "bg-yellow-500/20 text-yellow-300 border border-yellow-500/20" :
                          o.status === "InProgress" ? "bg-neon/15 text-neon border border-neon/20" :
                          o.status === "Issued" ? "bg-acid/15 text-acid border border-acid/20" :
                          o.status === "Rejected" ? "bg-red-500/10 text-red-300 border border-red-500/20" :
                          "bg-white/10 text-white/60 border border-white/10"
                        }`}>{statusRu}</span>
                        <span className={`text-[9px] px-2 py-1 rounded-full font-black uppercase tracking-widest ${slaBad ? "bg-red-500/10 text-red-300 border border-red-500/20" : "bg-white/5 text-white/30 border border-white/10"}`}>
                          SLA {ageH}h {ageM}m
                        </span>
                      </div>
                    </div>
                    {lastMsg && (
                      <div className="mt-3 bg-black/30 border border-white/5 rounded-xl p-3">
                        <div className="text-[9px] text-white/30 uppercase font-black tracking-widest">Сообщение</div>
                        <div className="text-sm text-white/80 mt-1">{lastMsg.message}</div>
                        <div className="text-[9px] text-white/25 font-mono mt-2">{lastMsg.adminUsername} • {new Date(lastMsg.createdAt).toLocaleString()}</div>
                      </div>
                    )}
                  </div>
                )
              })}
          </div>
        )}
      </div>
    </div>
  )
}
