"use client"
import { useEffect, useState, useRef } from "react"
import { api } from "../../lib/api"
import Link from "next/link"

const RARITY_COLORS = {
  low: "border-gray-500 shadow-gray-500/20 text-gray-400",
  medium: "border-[#39FF14] shadow-[#39FF14]/20 text-[#39FF14]",
  high: "border-[#FF00FF] shadow-[#FF00FF]/20 text-[#FF00FF]",
  premium: "border-[#FFD700] shadow-[#FFD700]/20 text-[#FFD700]"
}

export default function CasesPage() {
  const [cases, setCases] = useState<any[]>([])
  const [drops, setDrops] = useState<any[]>([])
  const [selectedCase, setSelectedCase] = useState<any>(null)
  const [opening, setOpening] = useState(false)
  const [winItem, setWinItem] = useState<any>(null)
  const [rollItems, setRollItems] = useState<any[]>([])
  const [user, setUser] = useState<any>(null)
  const [mounted, setMounted] = useState(false)
  
  const rollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMounted(true)
    loadData()
    const interval = setInterval(loadDrops, 5000)
    return () => clearInterval(interval)
  }, [])

  const loadData = async () => {
    try {
      const [casesData, dropsData, userData] = await Promise.all([
        api("/cases"),
        api("/cases/drops"),
        api("/users/me").catch(() => null)
      ])
      setCases(casesData)
      setDrops(dropsData)
      setUser(userData)
    } catch (e) { console.error(e) }
  }

  const loadDrops = async () => {
    try {
      const dropsData = await api("/cases/drops")
      setDrops(dropsData)
    } catch (e) {}
  }

  const handleOpen = async (c: any) => {
    if (opening) return
    if (!user) return alert("Войдите, чтобы открывать кейсы")
    if (user.balance < c.price) return alert("Недостаточно монет")

    try {
      setOpening(true)
      setWinItem(null)
      
      // Сброс позиции рулетки перед новым открытием
      if (rollRef.current) {
        rollRef.current.style.transition = "none"
        rollRef.current.style.transform = "translate3d(0, 0, 0)"
      }

      const { drop, balance } = await api(`/cases/open/${c.id}`, { method: "POST" })
      
      // Генерируем ленту (120 предметов)
      const allSkins = c.skins
      const roll = []
      for (let i = 0; i < 120; i++) {
        if (i > 90 && i < 100 && i !== 95 && Math.random() > 0.3) {
          const rare = allSkins.filter((s: any) => s.rarity === 'high' || s.rarity === 'premium')
          roll.push(rare[Math.floor(Math.random() * rare.length)] || allSkins[Math.floor(Math.random() * allSkins.length)])
        } else {
          roll.push(allSkins[Math.floor(Math.random() * allSkins.length)])
        }
      }
      
      roll[95] = drop
      setRollItems(roll)
      setUser({ ...user, balance })

      // Запускаем анимацию с небольшой задержкой для корректного сброса
      setTimeout(() => {
        if (rollRef.current) {
          rollRef.current.style.transition = "transform 9s cubic-bezier(0.1, 0, 0.05, 1)"
          const itemWidth = 128 + 8; // 128px width + 8px gap
          const targetScroll = (95 * itemWidth) + (itemWidth / 2);
          rollRef.current.style.transform = `translate3d(-${targetScroll}px, 0, 0)`
        }
      }, 50)

      setTimeout(() => {
        setWinItem(drop)
        setOpening(false)
        loadDrops()
        window.dispatchEvent(new Event("balanceUpdate"))
      }, 9500)

    } catch (e: any) {
      alert(e.message)
      setOpening(false)
    }
  }

  const sellItem = async (dropId: string) => {
    try {
      const { balance } = await api(`/cases/sell/${dropId}`, { method: "POST" })
      setUser({ ...user, balance })
      setWinItem(null)
      window.dispatchEvent(new Event("balanceUpdate"))
      alert("Скин продан!")
    } catch (e: any) {
      alert(e.message)
    }
  }

  if (!mounted) return null

  return (
    <div className="space-y-8 pb-20">
      {/* Лента дропов */}
      <div className="glass rounded-2xl p-2 overflow-hidden relative h-20 flex items-center gap-2">
        <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-[#0a0a0f] to-transparent z-10"></div>
        <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-[#0a0a0f] to-transparent z-10"></div>
        <div className="flex gap-2 animate-in fade-in duration-500">
          {drops.map((drop, idx) => (
            <div key={idx} className={`shrink-0 w-16 h-16 rounded-xl border-b-2 bg-white/5 flex flex-col items-center justify-center p-1 group relative ${RARITY_COLORS[drop.rarity as keyof typeof RARITY_COLORS]}`}>
              <img src={drop.skinImage} alt="" className="w-10 h-10 object-contain group-hover:scale-110 transition-transform" />
              <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 bg-black/90 text-[8px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20">
                {drop.username}: {drop.skinName}
              </div>
            </div>
          ))}
        </div>
      </div>

      {!selectedCase ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {cases.map((c) => (
            <div key={c.id} className="glass p-6 rounded-[32px] border border-white/5 hover:border-neon/30 transition-all group flex flex-col items-center text-center">
              <div className="relative mb-6">
                <img src={c.image} alt="" className="w-48 h-48 object-contain group-hover:scale-110 transition-all duration-500 drop-shadow-[0_0_30px_rgba(123,46,255,0.2)]" />
                <div className="absolute inset-0 bg-neon/10 blur-[50px] rounded-full -z-10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </div>
              <h3 className="text-2xl font-black italic uppercase tracking-tighter text-white mb-2">{c.name}</h3>
              <p className="text-white/40 text-xs uppercase font-bold tracking-widest mb-6">{c.description}</p>
              <button 
                onClick={() => setSelectedCase(c)}
                className="w-full py-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-neon hover:text-black hover:border-neon transition-all font-black uppercase italic tracking-widest flex items-center justify-center gap-2"
              >
                <span>{c.price} 🪙</span>
                <span className="text-[10px] opacity-50">Открыть</span>
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-8 animate-in zoom-in-95 duration-500">
          <button 
            onClick={() => { 
              setSelectedCase(null); 
              setWinItem(null); 
              setRollItems([]); 
              if (rollRef.current) {
                rollRef.current.style.transition = "none";
                rollRef.current.style.transform = "translate3d(0, 0, 0)";
              }
            }} 
            className="text-white/40 hover:text-white transition-colors uppercase font-black text-xs tracking-widest"
          >
            ← Назад к кейсам
          </button>

          <div className="flex flex-col lg:flex-row gap-8 items-center lg:items-start">
            {/* Анимация открытия */}
            <div className="flex-1 w-full glass rounded-[40px] p-8 border border-white/5 relative overflow-hidden flex flex-col items-center">
              {winItem && (
                <div className="mb-8 text-center animate-in zoom-in duration-500">
                  <div className={`text-sm font-black uppercase tracking-[0.3em] mb-2 ${RARITY_COLORS[winItem.rarity as keyof typeof RARITY_COLORS]}`}>ВЫ ВЫИГРАЛИ!</div>
                  <h2 className="text-3xl font-black italic text-white uppercase mb-6">{winItem.skinName}</h2>
                  <div className="flex gap-4 justify-center">
                    <button onClick={() => sellItem(winItem.id)} className="px-8 py-4 rounded-2xl bg-acid text-black font-black uppercase italic text-xs shadow-acid hover:scale-105 active:scale-95 transition-all">
                      Продать за {winItem.sellPrice} 🪙
                    </button>
                    <Link href="/profile" className="px-8 py-4 rounded-2xl bg-white/10 border border-white/10 text-white font-black uppercase italic text-xs hover:bg-white/20 transition-all">
                      В инвентарь
                    </Link>
                  </div>
                </div>
              )}

              <div className="relative w-full h-40 bg-black/40 rounded-3xl border border-white/5 overflow-hidden flex items-center">
                <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-[2px] bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.8)] z-20"></div>
                <div 
                  ref={rollRef}
                  className="flex gap-2 transition-transform"
                  style={{ transform: 'translateX(0px)', paddingLeft: '50%' }}
                >
                  {rollItems.length > 0 ? rollItems.map((item, i) => (
                    <div key={i} className={`shrink-0 w-32 h-32 rounded-2xl border-b-4 bg-white/5 flex flex-col items-center justify-center p-2 ${RARITY_COLORS[item.rarity as keyof typeof RARITY_COLORS]}`}>
                      <img src={item.image || item.skinImage} alt="" className="w-20 h-20 object-contain" />
                    </div>
                  )) : (
                    <div className="absolute inset-0 flex items-center justify-center text-white/10 uppercase font-black italic tracking-widest">
                      Готов к открытию
                    </div>
                  )}
                </div>
              </div>

              {!winItem && (
                <button 
                  disabled={opening}
                  onClick={() => handleOpen(selectedCase)}
                  className={`mt-8 px-12 py-5 rounded-2xl font-black uppercase italic tracking-[0.2em] transition-all ${opening ? 'bg-white/5 text-white/20 cursor-wait' : 'bg-neon text-black shadow-neon hover:scale-105 active:scale-95'}`}
                >
                  {opening ? 'ОТКРЫВАЕМ...' : `ОТКРЫТЬ КЕЙС (${selectedCase.price} 🪙)`}
                </button>
              )}
            </div>

            {/* Содержимое кейса */}
            <div className="w-full lg:w-80 glass rounded-[40px] p-6 border border-white/5">
              <h3 className="text-sm font-black text-white/40 uppercase tracking-widest mb-6 px-2">Содержимое кейса</h3>
              <div className="grid grid-cols-2 gap-3">
                {selectedCase.skins.sort((a: any, b: any) => {
                  const rarities = { low: 0, medium: 1, high: 2, premium: 3 }
                  return rarities[b.rarity as keyof typeof rarities] - rarities[a.rarity as keyof typeof rarities]
                }).map((s: any, i: number) => (
                  <div key={i} className={`p-3 rounded-2xl border bg-white/5 flex flex-col items-center text-center group ${RARITY_COLORS[s.rarity as keyof typeof RARITY_COLORS]}`}>
                    <img src={s.image} alt="" className="w-16 h-16 object-contain group-hover:scale-110 transition-transform" />
                    <div className="mt-2 text-[8px] font-bold uppercase tracking-tighter text-white/60 truncate w-full">{s.name}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
