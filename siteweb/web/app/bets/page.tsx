"use client"
import { useEffect, useState } from "react"
import { api } from "../../lib/api"

export default function BetsPage() {
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
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Ставки</h1>
      <div className="grid md:grid-cols-2 gap-4">
        {list.map(m => <MatchCard key={m.id} m={m} onDone={load} />)}
        {list.length===0 && <div className="text-white/60">Матчей нет</div>}
      </div>
      {error && <div className="text-red-400">{error}</div>}
    </div>
  )
}

function MatchCard({ m, onDone }: any) {
  const [amount, setAmount] = useState("1")
  const [opt, setOpt] = useState("")
  const [msg, setMsg] = useState("")
  const bet = async () => {
    setMsg("")
    try {
      await api("/bets", { method: "POST", body: JSON.stringify({ matchId: m.id, optionId: opt, amount: Number(amount) }) })
      setMsg("Ставка принята")
      onDone()
    } catch (e:any) { setMsg(e.message) }
  }
  return (
    <div className="glass p-4 rounded">
      <div className="font-semibold">{m.name}</div>
      <div className="text-sm text-white/70 mb-2">Дедлайн: {new Date(m.deadline).toLocaleString()}</div>
      <div className="flex flex-wrap gap-2 mb-2">
        {m.options.map((o:any)=>(
          <button key={o.id} onClick={()=>setOpt(o.id)} className={`px-3 py-2 rounded ${opt===o.id? "bg-purple-600":"bg-white/10"}`}>{o.name} x{o.odds}</button>
        ))}
      </div>
      <div className="flex gap-2">
        <input className="flex-1 p-3 rounded bg-white/10" value={amount} onChange={e=>setAmount(e.target.value)} />
        <button onClick={bet} className="btn btn-primary">Поставить</button>
      </div>
      {msg && <div className="text-sm mt-2">{msg}</div>}
    </div>
  )
}
