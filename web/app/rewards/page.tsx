"use client"
import { useEffect, useState } from "react"
import { api } from "../../lib/api"

export default function RewardsPage() {
  const [list, setList] = useState<any[]>([])
  const [select, setSelect] = useState<any>(null)
  const [link, setLink] = useState("")
  const [msg, setMsg] = useState("")
  const [loading, setLoading] = useState(true)

  const load = async () => {
    try {
      const res = await api("/rewards")
      setList(res)
    } catch {
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const order = async () => {
    try {
      if (!link.includes("steamcommunity.com/tradeoffer/new")) {
        throw new Error("Неверный формат Trade Link")
      }
      await api("/orders", { method: "POST", body: JSON.stringify({ rewardId: select.id, tradeLink: link }) })
      setMsg("Заказ успешно оформлен! Ожидайте обработки.")
      setSelect(null)
      setLink("")
      setTimeout(() => setMsg(""), 5000)
    } catch (e: any) { 
      setMsg(e.message)
      setTimeout(() => setMsg(""), 5000)
    }
  }

  if (loading) return <div className="text-center py-20 text-neon animate-pulse uppercase font-black tracking-widest">Загрузка арсенала...</div>

  return (
    <div className="max-w-6xl mx-auto py-10 px-4 space-y-12 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-white/10 pb-8">
        <div>
          <h1 className="text-5xl md:text-7xl font-black italic tracking-tighter bg-gradient-to-r from-neon to-acid bg-clip-text text-transparent uppercase">
            Награды
          </h1>
          <p className="text-white/40 uppercase font-bold tracking-[0.2em] text-xs mt-2">Магазин эксклюзивных предметов PAPPY</p>
        </div>
        {msg && (
          <div className="px-6 py-3 rounded-xl bg-neon/10 border border-neon/30 text-neon text-sm font-black uppercase animate-bounce">
            {msg}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {list.map(r => (
          <div key={r.id} className="group relative">
            <div className="absolute inset-0 bg-gradient-to-b from-neon/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl -z-10 blur-xl"></div>
            <div className="glass p-6 rounded-3xl border border-white/5 hover:border-neon/50 transition-all duration-500 flex flex-col h-full relative overflow-hidden">
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-neon/5 rounded-full blur-2xl group-hover:bg-neon/10 transition-colors"></div>
              
              <div className="mb-6 aspect-square rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center group-hover:scale-105 transition-transform duration-500 overflow-hidden relative">
                {r.imageUrl ? (
                  <img src={r.imageUrl} alt={r.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-6xl group-hover:rotate-12 transition-transform">🎁</span>
                )}
                <div className="absolute bottom-3 right-3 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[10px] font-black text-acid uppercase">
                  PAPPY STOCK
                </div>
              </div>

              <div className="space-y-2 flex-1">
                <h3 className="text-xl font-black text-white uppercase tracking-tighter group-hover:text-neon transition-colors line-clamp-2">
                  {r.name}
                </h3>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-mono font-black text-acid italic">
                    {r.price}
                  </span>
                  <span className="text-xs font-black text-white/30 uppercase tracking-widest">монет</span>
                </div>
              </div>

              <button 
                onClick={() => setSelect(r)} 
                className="mt-6 w-full py-4 rounded-2xl bg-white/5 border border-white/10 text-xs font-black uppercase tracking-widest text-white hover:bg-neon hover:text-black hover:shadow-neon transition-all duration-300"
              >
                Получить предмет
              </button>
            </div>
          </div>
        ))}
      </div>

      {list.length === 0 && (
        <div className="text-center py-40 border-2 border-dashed border-white/5 rounded-3xl">
          <div className="text-4xl mb-4">📦</div>
          <p className="text-white/20 uppercase font-black tracking-widest">Склад временно пуст</p>
        </div>
      )}

      {/* Modal */}
      {select && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-base/90 backdrop-blur-md" onClick={() => setSelect(null)}></div>
          <div className="glass p-8 rounded-[40px] border border-white/10 max-w-md w-full relative overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-neon via-acid to-neon"></div>
            
            <div className="mb-8">
              <h2 className="text-2xl font-black text-white uppercase tracking-tighter mb-2">Оформление заказа</h2>
              <p className="text-white/40 text-xs font-bold uppercase leading-relaxed">
                Вы собираетесь приобрести <span className="text-neon">{select.name}</span> за <span className="text-acid">{select.price} монет</span>
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">Steam Trade Link</label>
                <input 
                  autoFocus
                  className="w-full p-4 rounded-2xl bg-white/5 border border-white/10 text-white text-sm outline-none focus:border-neon transition-all placeholder:text-white/10 font-mono" 
                  placeholder="https://steamcommunity.com/tradeoffer/new/..."
                  value={link} 
                  onChange={e => setLink(e.target.value)} 
                />
              </div>

              <div className="flex flex-col gap-3 pt-4">
                <button 
                  onClick={order} 
                  className="w-full py-4 rounded-2xl bg-neon text-black text-xs font-black uppercase tracking-widest shadow-neon hover:scale-[1.02] active:scale-95 transition-all"
                >
                  Подтвердить покупку
                </button>
                <button 
                  onClick={() => setSelect(null)} 
                  className="w-full py-4 rounded-2xl bg-white/5 border border-white/10 text-xs font-black uppercase tracking-widest text-white/40 hover:text-white hover:bg-white/10 transition-all"
                >
                  Отмена
                </button>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-white/5 text-[9px] text-white/20 uppercase font-bold text-center leading-relaxed">
              Нажимая кнопку, вы соглашаетесь с тем, что ваш Trade Link верен. <br/>Возврат монет невозможен.
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
