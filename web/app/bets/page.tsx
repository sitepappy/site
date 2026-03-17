"use client"
import { useEffect, useState } from "react"
import { api } from "../../lib/api"

export default function BetsPage() {
  const [activeTab, setActiveTab] = useState("matches")
  const [list, setList] = useState<any[]>([])
  const [error, setError] = useState("")
  
  const load = async () => {
    try {
      const res = await api("/matches")
      setList(res)
    } catch (e:any) { setError(e.message) }
  }

  useEffect(()=>{ load() },[])

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black uppercase italic tracking-tighter text-white">Игровой Центр</h1>
        <div className="flex bg-white/5 p-1 rounded-xl border border-white/5">
          <button 
            onClick={() => setActiveTab("matches")}
            className={`px-6 py-2 rounded-lg text-xs font-black uppercase italic transition-all ${activeTab === "matches" ? "bg-neon text-black shadow-neon" : "text-white/40 hover:text-white"}`}
          >
            Матчи
          </button>
          <button 
            onClick={() => setActiveTab("roulette")}
            className={`px-6 py-2 rounded-lg text-xs font-black uppercase italic transition-all ${activeTab === "roulette" ? "bg-acid text-black shadow-acid" : "text-white/40 hover:text-white"}`}
          >
            Рулетка
          </button>
          <button 
            onClick={() => setActiveTab("coinflip")}
            className={`px-6 py-2 rounded-lg text-xs font-black uppercase italic transition-all ${activeTab === "coinflip" ? "bg-yellow-500 text-black shadow-yellow-500" : "text-white/40 hover:text-white"}`}
          >
            Coinflip
          </button>
        </div>
      </div>

      {activeTab === "matches" ? (
        <div className="grid md:grid-cols-2 gap-6">
          {list.map(m => <MatchCard key={m.id} m={m} onDone={load} />)}
          {list.length === 0 && (
            <div className="col-span-full py-20 glass rounded-3xl text-center border border-dashed border-white/10">
              <div className="text-4xl mb-4 opacity-20">🏟️</div>
              <div className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20">Активных матчей пока нет</div>
            </div>
          )}
        </div>
      ) : activeTab === "roulette" ? (
        <RouletteGame />
      ) : (
        <CoinflipGame />
      )}

      {error && <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs font-bold text-center">{error}</div>}
    </div>
  )
}

function CoinflipGame() {
  const [amount, setAmount] = useState("5")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [isFlipping, setIsFlipping] = useState(false)

  const play = async (side: string) => {
    if (loading || isFlipping) return
    setLoading(true)
    setIsFlipping(true)
    setResult(null)

    try {
      const res = await api("/bets/coinflip", {
        method: "POST",
        body: JSON.stringify({ side, amount })
      })
      
      setTimeout(() => {
        setResult(res)
        setIsFlipping(false)
        window.dispatchEvent(new Event("balanceUpdate"))
      }, 2000) // Длительность анимации

    } catch (e: any) {
      alert(e.message)
      setIsFlipping(false)
    } finally {
      setTimeout(() => setLoading(false), 2000)
    }
  }

  return (
    <div className="glass p-8 rounded-3xl border border-white/5 space-y-8 shadow-2xl relative overflow-hidden">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-black italic tracking-tighter uppercase">COINFLIP</h2>
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20">Выигрыш x2</p>
      </div>

      <div className="flex justify-center items-center h-48 perspective-1000">
        <div className={`coin ${isFlipping ? 'flipping' : ''} ${result ? (result.resultSide === 'heads' ? 'heads' : 'tails') : ''}`}>
          <div className="side-a"></div>
          <div className="side-b"></div>
        </div>
      </div>

      {result && !isFlipping && (
        <div className="text-center animate-in fade-in zoom-in">
          <div className={`text-2xl font-black uppercase tracking-widest ${result.win ? 'text-neon' : 'text-red-400'}`}>
            {result.win ? `ПОБЕДА! +${result.winAmount - Number(amount)} 🪙` : 'ПРОИГРЫШ'}
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
        <button 
          disabled={loading || isFlipping}
          onClick={() => play("heads")}
          className="group relative overflow-hidden bg-blue-600 hover:bg-blue-500 p-6 rounded-2xl transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50"
        >
          <div className="relative z-10 text-center">
            <div className="text-2xl font-black italic mb-1">ОРЕЛ</div>
          </div>
        </button>
        <button 
          disabled={loading || isFlipping}
          onClick={() => play("tails")}
          className="group relative overflow-hidden bg-red-600 hover:bg-red-500 p-6 rounded-2xl transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50"
        >
          <div className="relative z-10 text-center">
            <div className="text-2xl font-black italic mb-1">РЕШКА</div>
          </div>
        </button>
      </div>

      <div className="max-w-xs mx-auto">
        <div className="relative">
          <input 
            type="number" 
            value={amount} 
            onChange={e => setAmount(e.target.value)}
            className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-center text-xl font-black font-mono text-acid outline-none focus:border-acid transition-all"
            min="1"
          />
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-acid opacity-40 font-bold">🪙</div>
        </div>
        <div className="flex justify-between mt-2 px-2">
          <button onClick={() => setAmount("1")} className="text-[9px] font-black text-white/20 hover:text-white uppercase">Мин</button>
          <button onClick={() => setAmount(prev => (Number(prev) * 2).toString())} className="text-[9px] font-black text-white/20 hover:text-white uppercase">x2</button>
          <button onClick={() => setAmount(prev => Math.max(1, Math.floor(Number(prev) / 2)).toString())} className="text-[9px] font-black text-white/20 hover:text-white uppercase">1/2</button>
        </div>
      </div>
    </div>
  )
}

function RouletteGame() {
  const [amount, setAmount] = useState("5")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [history, setHistory] = useState<string[]>([])

  const play = async (color: string) => {
    if (loading) return
    setLoading(true)
    setResult(null)
    try {
      const res = await api("/bets/roulette", {
        method: "POST",
        body: JSON.stringify({ color, amount })
      })
      setResult(res)
      setHistory(prev => [res.resultColor, ...prev].slice(0, 10))
      // Force update header balance
      window.dispatchEvent(new Event("balanceUpdate"))
    } catch (e: any) {
      alert(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="glass p-8 rounded-3xl border border-white/5 space-y-8 shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 via-green-500 to-black/50"></div>
      
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-black italic tracking-tighter uppercase">Классическая Рулетка</h2>
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20">Ставка без лимита</p>
      </div>

      <div className="flex justify-center gap-2 mb-8">
        {history.map((h, i) => (
          <div key={i} className={`w-6 h-6 rounded-full shadow-lg ${h === 'red' ? 'bg-red-500' : h === 'black' ? 'bg-zinc-800' : 'bg-green-500'} border border-white/10`}></div>
        ))}
        {history.length === 0 && <div className="text-[10px] text-white/10 uppercase font-black italic">История пуста</div>}
      </div>

      <div className="relative h-24 bg-black/40 rounded-2xl border border-white/5 flex items-center justify-center overflow-hidden">
        {loading ? (
          <div className="flex gap-2 animate-pulse">
            {[...Array(10)].map((_, i) => (
              <div key={i} className={`w-12 h-16 rounded-lg ${i % 2 === 0 ? 'bg-red-500/20' : 'bg-zinc-800/20'}`}></div>
            ))}
          </div>
        ) : result ? (
          <div className="flex flex-col items-center animate-in zoom-in duration-300">
            <div className={`w-16 h-16 rounded-2xl shadow-2xl flex items-center justify-center border-2 border-white/20 ${result.resultColor === 'red' ? 'bg-red-500' : result.resultColor === 'black' ? 'bg-zinc-900' : 'bg-green-500'}`}>
              <span className="text-2xl">🎲</span>
            </div>
            <div className={`mt-2 text-[10px] font-black uppercase tracking-widest ${result.win ? 'text-neon' : 'text-red-400'}`}>
              {result.win ? `ВЫИГРЫШ: ${result.winAmount} 🪙` : 'ПРОИГРЫШ'}
            </div>
          </div>
        ) : (
          <div className="text-white/10 font-black uppercase italic tracking-[0.3em]">Делайте ваши ставки</div>
        )}
        <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-acid shadow-neon z-10"></div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <button 
          disabled={loading}
          onClick={() => play("red")}
          className="group relative overflow-hidden bg-red-600 hover:bg-red-500 p-6 rounded-2xl transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50"
        >
          <div className="relative z-10 text-center">
            <div className="text-2xl font-black italic mb-1">x2</div>
            <div className="text-[10px] font-black uppercase tracking-widest opacity-60">Красное</div>
          </div>
          <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
        </button>

        <button 
          disabled={loading}
          onClick={() => play("green")}
          className="group relative overflow-hidden bg-green-600 hover:bg-green-500 p-6 rounded-2xl transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 border-2 border-acid/50"
        >
          <div className="relative z-10 text-center">
            <div className="text-2xl font-black italic mb-1 text-acid">x10</div>
            <div className="text-[10px] font-black uppercase tracking-widest text-acid">Зеленое</div>
          </div>
          <div className="absolute inset-0 bg-gradient-to-br from-acid/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
        </button>

        <button 
          disabled={loading}
          onClick={() => play("black")}
          className="group relative overflow-hidden bg-zinc-900 hover:bg-zinc-800 p-6 rounded-2xl transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50"
        >
          <div className="relative z-10 text-center">
            <div className="text-2xl font-black italic mb-1">x2</div>
            <div className="text-[10px] font-black uppercase tracking-widest opacity-60">Черное</div>
          </div>
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
        </button>
      </div>

      <div className="max-w-xs mx-auto">
        <div className="relative">
          <input 
            type="number" 
            value={amount} 
            onChange={e => setAmount(e.target.value)}
            className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-center text-xl font-black font-mono text-acid outline-none focus:border-acid transition-all"
            min="1"
          />
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-acid opacity-40 font-bold">🪙</div>
        </div>
        <div className="flex justify-between mt-2 px-2">
          <button onClick={() => setAmount("1")} className="text-[9px] font-black text-white/20 hover:text-white uppercase">Мин</button>
          <button onClick={() => setAmount(Math.floor(Number(amount) * 2).toString())} className="text-[9px] font-black text-white/20 hover:text-white uppercase">x2</button>
          <button onClick={() => setAmount(Math.floor(Number(amount) / 2).toString())} className="text-[9px] font-black text-white/20 hover:text-white uppercase">1/2</button>
        </div>
      </div>
    </div>
  )
}

function MatchCard({ m, onDone }: any) {
  const [amount, setAmount] = useState("1")
  const [opt, setOpt] = useState("")
  const [msg, setMsg] = useState("")
  const [loading, setLoading] = useState(false)

  const bet = async () => {
    if (!opt) return setMsg("Выберите исход")
    setMsg("")
    setLoading(true)
    try {
      await api("/bets", { method: "POST", body: JSON.stringify({ matchId: m.id, optionId: opt, amount: Number(amount) }) })
      setMsg("Ставка принята!")
      window.dispatchEvent(new Event("balanceUpdate"))
      onDone()
    } catch (e:any) { setMsg(e.message) }
    finally { setLoading(false) }
  }

  return (
    <div className="glass p-6 rounded-3xl border border-white/5 bg-gradient-to-br from-white/[0.02] to-transparent hover:border-neon/30 transition-all duration-300">
      <div className="flex justify-between items-start mb-4">
        <div className="text-[10px] font-black uppercase italic tracking-widest text-white/30 bg-white/5 px-2 py-1 rounded">Match ID: {m.id.slice(0, 8)}</div>
        <div className="text-[10px] font-black uppercase text-acid bg-acid/10 px-2 py-1 rounded">Live Now</div>
      </div>
      
      <h3 className="text-xl font-black italic tracking-tighter mb-1 text-white">{m.name}</h3>
      <div className="text-[10px] text-white/20 font-mono mb-6 flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Дедлайн: {m.deadline ? new Date(m.deadline).toLocaleString() : "Не указан"}
      </div>

      <div className="grid grid-cols-2 gap-3 mb-6">
        {m.options.map((o:any)=>(
          <button 
            key={o.id} 
            onClick={()=>setOpt(o.id)} 
            className={`p-4 rounded-2xl border transition-all text-center group ${opt===o.id ? "bg-neon border-neon text-black shadow-neon scale-[0.98]" : "bg-white/5 border-white/10 text-white/60 hover:border-white/20"}`}
          >
            <div className={`text-[10px] font-black uppercase mb-1 ${opt===o.id ? "text-black/60" : "text-white/20"}`}>{o.name}</div>
            <div className="text-lg font-black font-mono italic">x{o.odds}</div>
          </button>
        ))}
      </div>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <input className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-3 text-sm font-black font-mono text-acid outline-none focus:border-neon transition-all" value={amount} onChange={e=>setAmount(e.target.value)} />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-acid/40">🪙</div>
        </div>
        <button 
          disabled={loading}
          onClick={bet} 
          className="btn btn-primary px-8 rounded-2xl text-[10px] font-black uppercase italic tracking-widest"
        >
          {loading ? "..." : "Поставить"}
        </button>
      </div>
      
      {msg && <div className={`text-[10px] mt-3 font-black uppercase italic text-center ${msg.includes("принята") ? "text-neon" : "text-red-400"}`}>{msg}</div>}
    </div>
  )
}
