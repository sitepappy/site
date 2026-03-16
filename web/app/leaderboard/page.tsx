"use client"
import { useEffect, useState } from "react"
import { api } from "../../lib/api"

export default function LeaderboardPage() {
  const [data, setData] = useState<any>({ richest:[], referrals:[], bettors:[], questers:[] })
  useEffect(()=>{ api("/leaderboard").then(setData).catch(()=>{}) },[])
  return (
    <div className="grid md:grid-cols-2 gap-4">
      <Board title="Топ богачей" items={data.richest} render={(i:any)=>(
        <div className="flex items-center gap-2">
          <span>{i.username}</span>
          {i.referralLevel && <span className="text-[10px] px-1.5 py-0.5 rounded-full border" style={{ borderColor: i.referralColor, color: i.referralColor }}>{i.referralLevel}</span>}
          <span className="ml-auto font-mono text-acid">{i.balance} 🪙</span>
        </div>
      )} />
      <Board title="Топ рефералов" items={data.referrals} render={(i:any)=>(
        <div className="flex items-center gap-2">
          <span>{i.username || i.code}</span>
          {i.referralLevel && <span className="text-[10px] px-1.5 py-0.5 rounded-full border" style={{ borderColor: i.referralColor, color: i.referralColor }}>{i.referralLevel}</span>}
          <span className="ml-auto font-mono text-neon">{i.activations}</span>
        </div>
      )} />
      <Board title="Топ ставок" items={data.bettors} render={(i:any)=>(
        <div className="flex items-center gap-2">
          <span>{i.username}</span>
          {i.referralLevel && <span className="text-[10px] px-1.5 py-0.5 rounded-full border" style={{ borderColor: i.referralColor, color: i.referralColor }}>{i.referralLevel}</span>}
          <span className="ml-auto font-mono text-acid">{i.total} 🪙</span>
        </div>
      )} />
      <Board title="Топ квестов" items={data.questers} render={(i:any)=>(
        <div className="flex items-center gap-2">
          <span>{i.username}</span>
          {i.referralLevel && <span className="text-[10px] px-1.5 py-0.5 rounded-full border" style={{ borderColor: i.referralColor, color: i.referralColor }}>{i.referralLevel}</span>}
          <span className="ml-auto font-mono text-neon">{i.count}</span>
        </div>
      )} />
    </div>
  )
}

function Board({ title, items, render }: any) {
  return (
    <div className="glass p-4 rounded">
      <div className="font-semibold mb-2">{title}</div>
      <div className="space-y-1">
        {items?.map((it:any, idx:number)=> (
          <div key={idx} className="flex items-center gap-2">
            <span className="text-white/40 w-4 text-xs">{idx+1}.</span>
            <div className="flex-1">{render(it)}</div>
          </div>
        ))}
        {(!items || items.length===0) && <div className="text-white/60">Нет данных</div>}
      </div>
    </div>
  )
}
