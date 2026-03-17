"use client"
import { useEffect, useState } from "react"
import { api } from "../../lib/api"

export default function ReferralPage() {
  const [my, setMy] = useState<any>(null)
  const [code, setCode] = useState("")
  const [err, setErr] = useState("")
  const [msg, setMsg] = useState("")
  const [promoInput, setPromoInput] = useState("")
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const load = async () => {
    try {
      const res = await api("/promos")
      setMy(res.my)
      setStats(res.stats || null)
    } catch {}
  }

  useEffect(()=>{ load() },[])

  const create = async () => {
    setErr("")
    try {
      const r = await api("/users/promo-code", { method: "POST", body: JSON.stringify({ code }) })
      setMy({ code: r.code })
      load()
    } catch (e:any) { setErr(e.message) }
  }

  const activatePromo = async (e: any) => {
    e.preventDefault()
    if (!promoInput.trim()) return
    setLoading(true)
    setErr("")
    setMsg("")
    try {
      const res = await api("/promos/activate", {
        method: "POST",
        body: JSON.stringify({ code: promoInput })
      })
      setMsg(`Успешно! Вы получили ${res.reward} 🪙`)
      setPromoInput("")
      window.dispatchEvent(new Event("balanceUpdate"))
      load()
    } catch (e: any) {
      setErr(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="grid md:grid-cols-2 gap-8">
        {/* Левая колонка: Ввод промокода */}
        <div className="space-y-6">
          <div className="glass p-8 rounded-3xl border border-white/5 space-y-6 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-neon via-acid to-transparent"></div>
            <div className="space-y-2">
              <h2 className="text-2xl font-black italic tracking-tighter uppercase">Активация</h2>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20">Введите промокод для получения бонуса</p>
            </div>

            <form onSubmit={activatePromo} className="space-y-4">
              <div className="relative">
                <input 
                  value={promoInput}
                  onChange={e => setPromoInput(e.target.value)}
                  placeholder="ПРОМОКОД..."
                  className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-xl font-black font-mono text-neon outline-none focus:border-neon transition-all uppercase placeholder:text-white/5"
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-neon/20">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                  </svg>
                </div>
              </div>
              <button 
                disabled={loading}
                className="btn btn-primary w-full py-4 text-xs font-black uppercase italic tracking-widest shadow-neon hover:scale-[1.02] active:scale-95 transition-all"
              >
                {loading ? "..." : "Активировать бонус"}
              </button>
            </form>

            {err && <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-[10px] font-black uppercase text-center tracking-widest">{err}</div>}
            {msg && <div className="p-3 bg-neon/10 border border-neon/20 rounded-xl text-neon text-[10px] font-black uppercase text-center tracking-widest animate-bounce">{msg}</div>}
          </div>

          <div className="glass p-6 rounded-2xl border border-white/5 bg-white/5">
            <h3 className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-4 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-neon"></span>
              Как это работает?
            </h3>
            <ul className="space-y-3">
              <li className="flex gap-3 text-xs text-white/60">
                <span className="text-neon font-black">01</span>
                Введите реферальный код друга и получите <span className="text-white font-bold">10 монет</span> сразу на баланс.
              </li>
              <li className="flex gap-3 text-xs text-white/60">
                <span className="text-neon font-black">02</span>
                Ваш друг также получит <span className="text-white font-bold">10 монет</span> за вашу активность.
              </li>
              <li className="flex gap-3 text-xs text-white/60">
                <span className="text-neon font-black">03</span>
                Следите за соцсетями проекта, чтобы не пропустить секретные ивент-коды с большими призами!
              </li>
            </ul>
          </div>
        </div>

        {/* Правая колонка: Мой код и статистика */}
        <div className="space-y-6">
          <h2 className="text-2xl font-black italic tracking-tighter uppercase px-2">Партнерская программа</h2>
          
          {my ? (
            <div className="space-y-6">
              <div className="glass p-8 rounded-3xl border border-neon/20 bg-neon/5 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:rotate-12 transition-transform">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                </div>
                <div className="text-[10px] font-black text-neon uppercase tracking-[0.3em] mb-2">Ваш уникальный код</div>
                <div className="text-5xl font-black italic tracking-tighter text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">{my.code}</div>
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(my.code);
                    setMsg("Код скопирован!");
                    setTimeout(() => setMsg(""), 2000);
                  }}
                  className="mt-6 text-[10px] font-black uppercase text-white/40 hover:text-white transition-colors flex items-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                  </svg>
                  Нажмите, чтобы скопировать
                </button>
              </div>

              {stats && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="glass p-6 rounded-2xl border border-white/5 text-center">
                    <div className="text-[10px] font-black text-white/30 uppercase mb-1 tracking-widest">Всего рефералов</div>
                    <div className="text-3xl font-black text-white italic">{stats.totalActivations}</div>
                  </div>
                  <div className="glass p-6 rounded-2xl border border-white/5 text-center">
                    <div className="text-[10px] font-black text-white/30 uppercase mb-1 tracking-widest">Заработано</div>
                    <div className="text-3xl font-black text-acid italic">{stats.totalActivations * 10} 🪙</div>
                  </div>
                </div>
              )}

              {stats?.activations?.length > 0 && (
                <div className="glass p-6 rounded-2xl border border-white/5 space-y-4">
                  <h3 className="text-[10px] font-black text-white/40 uppercase tracking-widest flex items-center justify-between">
                    Последние активности
                    <span className="w-12 h-[1px] bg-white/10"></span>
                  </h3>
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                    {stats.activations.map((a: any, i: number) => (
                      <div key={i} className="flex justify-between items-center p-3 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full bg-neon shadow-neon"></div>
                          <span className="text-xs font-black text-white uppercase italic">{a.username}</span>
                        </div>
                        <span className="text-[10px] text-white/20 font-mono">{new Date(a.date).toLocaleDateString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="glass p-8 rounded-3xl border border-white/5 space-y-6">
              <div className="text-sm text-white/50 leading-relaxed">У вас еще нет промокода. Создайте его сейчас, чтобы начать приглашать друзей и зарабатывать монеты!</div>
              <div className="space-y-4">
                <input 
                  className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-xl font-black font-mono text-white outline-none focus:border-neon transition-all uppercase" 
                  placeholder="ПРИДУМАЙТЕ КОД..." 
                  value={code} 
                  onChange={e=>setCode(e.target.value)} 
                />
                <button onClick={create} className="btn btn-primary w-full py-4 text-xs font-black uppercase italic tracking-widest shadow-neon transition-all">
                  Создать мой код
                </button>
                {err && <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-[10px] font-black uppercase text-center tracking-widest">{err}</div>}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
