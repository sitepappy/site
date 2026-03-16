"use client"
import { useEffect, useState } from "react"
import { api } from "../../lib/api"

export default function RewardsPage() {
  const [list, setList] = useState<any[]>([])
  const [select, setSelect] = useState<any>(null)
  const [link, setLink] = useState("")
  const [msg, setMsg] = useState("")
  const load = async () => {
    try {
      const res = await api("/rewards")
      setList(res)
    } catch {}
  }
  useEffect(()=>{ load() },[])
  const order = async () => {
    try {
      await api("/orders", { method: "POST", body: JSON.stringify({ rewardId: select.id, tradeLink: link }) })
      setMsg("Заказ оформлен")
      setSelect(null)
      setLink("")
    } catch (e:any) { setMsg(e.message) }
  }
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Награды</h1>
      <div className="grid md:grid-cols-3 gap-4">
        {list.map(r => (
          <div key={r.id} className="glass p-4 rounded">
            <div className="font-semibold">{r.name}</div>
            <div className="text-acid">{r.price} монет</div>
            <button onClick={()=>setSelect(r)} className="btn btn-primary mt-2">Заказать</button>
          </div>
        ))}
      </div>
      {select && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center">
          <div className="glass p-6 rounded max-w-md w-full">
            <div className="font-semibold mb-2">Введите ваш Steam Trade Link</div>
            <input className="w-full p-3 rounded bg-white/10" value={link} onChange={e=>setLink(e.target.value)} />
            <div className="flex gap-2 mt-3">
              <button onClick={order} className="btn btn-primary flex-1">Подтвердить</button>
              <button onClick={()=>setSelect(null)} className="btn glass flex-1">Отмена</button>
            </div>
          </div>
        </div>
      )}
      {msg && <div className="text-sm">{msg}</div>}
    </div>
  )
}
