"use client"
import { useEffect, useState } from "react"
import { api } from "../../lib/api"

export default function ReferralPage() {
  const [my, setMy] = useState<any>(null)
  const [code, setCode] = useState("")
  const [err, setErr] = useState("")
  const [stats, setStats] = useState<any>(null)
  const load = async () => {
    try {
      const res = await api("/promos")
      setMy(res.my)
      setStats(res.stats || null)
    } catch {}
  }
  useEffect(()=>{ load() },[])
  const create = async () => {
    try {
      const r = await api("/users/promo-code", { method: "POST", body: JSON.stringify({ code }) })
      setMy({ code: r.code })
    } catch (e:any) { setErr(e.message) }
  }
  return (
    <div className="max-w-lg">
      <h1 className="text-xl font-semibold mb-2">Мой промокод</h1>
      {my ? (
        <div className="space-y-4">
          <div className="glass p-4 rounded">
            <div className="text-2xl">{my.code}</div>
            <div className="text-white/70 mt-2">Делитесь кодом, чтобы получать монеты</div>
          </div>
          {stats && (
            <div className="glass p-4 rounded space-y-4">
              <div className="flex items-center justify-between">
                <div className="font-semibold">Статистика</div>
                {stats.referralLevel && (
                  <span className="text-xs px-2 py-0.5 rounded-full border" style={{ borderColor: stats.referralColor, color: stats.referralColor }}>
                    Уровень: {stats.referralLevel} ({stats.referralCount} рефералов)
                  </span>
                )}
              </div>
              <div className="text-sm text-white/70">
                Всего активаций промокода: <span className="text-acid font-bold">{stats.totalActivations}</span>
              </div>
              {stats.activations && stats.activations.length > 0 && (
                <div className="space-y-2">
                  <div className="text-xs font-semibold text-white/50 uppercase">Последние активации:</div>
                  <div className="space-y-1 max-h-40 overflow-auto pr-2">
                    {stats.activations.map((a: any, i: number) => (
                      <div key={i} className="flex justify-between text-xs border-b border-white/5 pb-1">
                        <span className="text-neon">{a.username}</span>
                        <span className="text-white/40">{new Date(a.date).toLocaleDateString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="glass p-4 rounded">
          <input className="w-full p-3 rounded bg-white/10" placeholder="Ваш промокод" value={code} onChange={e=>setCode(e.target.value)} />
          <button onClick={create} className="btn btn-primary mt-2">Создать</button>
          {err && <div className="text-red-400 mt-2">{err}</div>}
        </div>
      )}
    </div>
  )
}
