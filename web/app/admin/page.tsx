"use client"
import { useEffect, useState } from "react"
import { api } from "../../lib/api"

const tabs = ["Пользователи","Посты","Ставки","Награды","Заказы","РАБОТА","Квесты","Уровни","Промокоды","Аналитика","О НАС","СОТРУДНИЧЕСТВО"]

export default function AdminPage() {
  const [tab, setTab] = useState("Пользователи")
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Админ-панель</h1>
      <div className="flex flex-wrap gap-2">
        {tabs.map(t => <button key={t} onClick={()=>setTab(t)} className={`px-3 py-2 rounded ${tab===t? "bg-purple-600":"glass"}`}>{t}</button>)}
      </div>
      {tab==="Пользователи" && <UsersTab />}
      {tab==="Посты" && <PostsTab />}
      {tab==="Награды" && <RewardsTab />}
      {tab==="Заказы" && <OrdersTab />}
      {tab==="РАБОТА" && <WorkTab />}
      {tab==="Квесты" && <QuestsTab />}
      {tab==="Уровни" && <LevelsTab />}
      {tab==="Промокоды" && <PromosTab />}
      {tab==="Аналитика" && <AnalyticsTab />}
      {tab==="Ставки" && <BetsTab />}
      {tab==="О НАС" && <AboutTab />}
      {tab==="СОТРУДНИЧЕСТВО" && <CoopTab />}
    </div>
  )
}

function AboutTab() {
  const [contentHtml, setContentHtml] = useState("")
  const [links, setLinks] = useState<any>({})
  const load = () => api("/admin/about").then(r => { setContentHtml(r.contentHtml); setLinks(r.links) })
  const save = () => api("/admin/about", { method: "POST", body: JSON.stringify({ contentHtml, links }) })
  useEffect(()=>{ load() },[])
  return (
    <div className="glass p-4 rounded space-y-2">
      <h2 className="font-semibold mb-1 text-neon">О нас</h2>
      <textarea className="w-full h-40 p-3 rounded bg-white/10" value={contentHtml} onChange={e=>setContentHtml(e.target.value)} placeholder="HTML контент" />
      <div className="grid grid-cols-2 gap-2">
        <input className="p-3 rounded bg-white/10" placeholder="Telegram" value={links.telegram || ""} onChange={e=>setLinks({...links, telegram: e.target.value})} />
        <input className="p-3 rounded bg-white/10" placeholder="Discord" value={links.discord || ""} onChange={e=>setLinks({...links, discord: e.target.value})} />
      </div>
      <button onClick={save} className="btn btn-primary">Сохранить</button>
    </div>
  )
}

function CoopTab() {
  const [contentHtml, setContentHtml] = useState("")
  const [links, setLinks] = useState<any>({})
  const load = () => api("/admin/coop").then(r => { setContentHtml(r.contentHtml); setLinks(r.links) })
  const save = () => api("/admin/coop", { method: "POST", body: JSON.stringify({ contentHtml, links }) })
  useEffect(()=>{ load() },[])
  return (
    <div className="glass p-4 rounded space-y-2">
      <h2 className="font-semibold mb-1 text-acid">Сотрудничество</h2>
      <textarea className="w-full h-40 p-3 rounded bg-white/10" value={contentHtml} onChange={e=>setContentHtml(e.target.value)} placeholder="HTML контент" />
      <div className="grid grid-cols-2 gap-2">
        <input className="p-3 rounded bg-white/10" placeholder="Telegram" value={links.telegram || ""} onChange={e=>setLinks({...links, telegram: e.target.value})} />
        <input className="p-3 rounded bg-white/10" placeholder="Email" value={links.email || ""} onChange={e=>setLinks({...links, email: e.target.value})} />
      </div>
      <button onClick={save} className="btn btn-primary">Сохранить</button>
    </div>
  )
}

function UsersTab() {
  const [q, setQ] = useState("")
  const [list, setList] = useState<any[]>([])
  const load = () => api(`/admin/users?q=${encodeURIComponent(q)}`).then(setList)
  useEffect(()=>{ load() },[])
  return (
    <div className="glass p-4 rounded">
      <div className="flex gap-2 mb-2">
        <input className="flex-1 p-3 rounded bg-white/10" placeholder="Поиск" value={q} onChange={e=>setQ(e.target.value)} />
        <button onClick={load} className="btn glass">Найти</button>
      </div>
      <div className="space-y-2 max-h-96 overflow-auto">
        {list.map(u => <UserRow key={u.id} u={u} onUpdated={load} />)}
      </div>
    </div>
  )
}

function UserRow({ u, onUpdated }: any) {
  const [role, setRole] = useState(u.role)
  const [delta, setDelta] = useState("0")
  const saveRole = () => api("/admin/users/role", { method: "POST", body: JSON.stringify({ userId: u.id, role }) }).then(onUpdated)
  const changeBal = () => api("/admin/users/balance", { method: "POST", body: JSON.stringify({ userId: u.id, delta: Number(delta) }) }).then(onUpdated)
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1">{u.username} <span className="text-white/60">{u.email}</span></div>
      <div className="w-24 text-acid">{u.balance}</div>
      <select value={role} onChange={e=>setRole(e.target.value)} className="bg-white/10 p-2 rounded">
        <option value="user">user</option>
        <option value="admin">admin</option>
      </select>
      <button onClick={saveRole} className="btn glass">Роль</button>
      <input className="w-20 p-2 rounded bg-white/10" value={delta} onChange={e=>setDelta(e.target.value)} />
      <button onClick={changeBal} className="btn btn-primary">Баланс</button>
    </div>
  )
}

function PostsTab() {
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [imageUrl, setImageUrl] = useState("")
  const [list, setList] = useState<any[]>([])
  const load = () => api("/posts").then(setList).catch(()=>{})
  const create = () => api("/posts", { method: "POST", body: JSON.stringify({ title, content, imageUrl }) }).then(load)
  const remove = (id: string) => api(`/posts/${id}`, { method: "DELETE" }).then(load)
  useEffect(()=>{ load() },[])
  return (
    <div className="space-y-4">
      <div className="glass p-4 rounded space-y-2">
        <input className="w-full p-3 rounded bg-white/10" placeholder="Заголовок" value={title} onChange={e=>setTitle(e.target.value)} />
        <textarea className="w-full p-3 rounded bg-white/10" placeholder="Текст" value={content} onChange={e=>setContent(e.target.value)} />
        <input className="w-full p-3 rounded bg-white/10" placeholder="URL изображения" value={imageUrl} onChange={e=>setImageUrl(e.target.value)} />
        <button onClick={create} className="btn btn-primary">Опубликовать</button>
      </div>
      <div className="glass p-4 rounded space-y-2 max-h-96 overflow-auto">
        {list.map(p => (
          <div key={p.id} className="flex items-center justify-between gap-2">
            <div className="truncate">{p.title}</div>
            <button onClick={()=>remove(p.id)} className="btn glass text-red-300">Удалить</button>
          </div>
        ))}
        {list.length===0 && <div className="text-white/60 text-sm">Постов нет</div>}
      </div>
    </div>
  )
}

function RewardsTab() {
  const [name, setName] = useState("")
  const [price, setPrice] = useState("")
  const create = () => api("/rewards", { method: "POST", body: JSON.stringify({ name, price: Number(price) }) })
  return (
    <div className="glass p-4 rounded space-y-2">
      <input className="w-full p-3 rounded bg-white/10" placeholder="Название" value={name} onChange={e=>setName(e.target.value)} />
      <input className="w-full p-3 rounded bg-white/10" placeholder="Цена" value={price} onChange={e=>setPrice(e.target.value)} />
      <button onClick={create} className="btn btn-primary">Создать</button>
    </div>
  )
}

function OrdersTab() {
  const [list, setList] = useState<any[]>([])
  const load = () => api("/orders").then(setList)
  useEffect(()=>{ load() },[])
  return (
    <div className="glass p-4 rounded">
      <div className="space-y-2">
        {list.map(o => <OrderRow key={o.id} o={o} onUpdated={load} />)}
      </div>
    </div>
  )
}

function OrderRow({ o, onUpdated }: any) {
  const [status, setStatus] = useState(o.status)
  const save = () => api(`/orders/${o.id}/status`, { method: "POST", body: JSON.stringify({ status }) }).then(onUpdated)
  return (
    <div className="grid grid-cols-6 items-center gap-2">
      <div className="truncate">{o.username}</div>
      <div className="truncate">{o.rewardName}</div>
      <div className="truncate col-span-2">{o.tradeLink}</div>
      <select value={status} onChange={e=>setStatus(e.target.value)} className="bg-white/10 p-2 rounded">
        <option>Pending</option>
        <option>Processing</option>
        <option>Completed</option>
        <option>Rejected</option>
      </select>
      <button onClick={save} className="btn btn-primary">Сохранить</button>
    </div>
  )
}

function WorkTab() {
  return (
    <div className="glass p-4 rounded">
      <div>РАБОТА: обработка заказов и выдача скинов через Steam</div>
    </div>
  )
}

function QuestsTab() {
  const [name, setName] = useState("")
  const [reward, setReward] = useState("1")
  const create = () => api("/quests", { method: "POST", body: JSON.stringify({ name, reward: Number(reward) }) })
  return (
    <div className="glass p-4 rounded space-y-2">
      <input className="w-full p-3 rounded bg-white/10" placeholder="Название квеста" value={name} onChange={e=>setName(e.target.value)} />
      <input className="w-full p-3 rounded bg-white/10" placeholder="Награда" value={reward} onChange={e=>setReward(e.target.value)} />
      <button onClick={create} className="btn btn-primary">Создать квест</button>
    </div>
  )
}

function LevelsTab() {
  const [name, setName] = useState("")
  const [iconUrl, setIconUrl] = useState("")
  const create = () => api("/levels", { method: "POST", body: JSON.stringify({ name, iconUrl }) })
  return (
    <div className="glass p-4 rounded space-y-2">
      <input className="w-full p-3 rounded bg-white/10" placeholder="Название уровня" value={name} onChange={e=>setName(e.target.value)} />
      <input className="w-full p-3 rounded bg-white/10" placeholder="URL иконки" value={iconUrl} onChange={e=>setIconUrl(e.target.value)} />
      <button onClick={create} className="btn btn-primary">Создать уровень</button>
    </div>
  )
}

function PromosTab() {
  const [list, setList] = useState<any[]>([])
  const load = () => api("/admin/promos").then(setList)
  useEffect(()=>{ load() },[])
  const disable = (code: string, disabled: boolean) => api("/admin/promos/disable", { method: "POST", body: JSON.stringify({ code, disabled }) }).then(load)
  return (
    <div className="glass p-4 rounded space-y-2">
      {list.map(p => (
        <div key={p.code} className="flex items-center gap-2">
          <div className="flex-1">{p.code} — {p.activations}</div>
          <button onClick={()=>disable(p.code, !p.disabled)} className="btn glass">{p.disabled? "Включить":"Отключить"}</button>
        </div>
      ))}
      {list.length===0 && <div className="text-white/60">Нет промокодов</div>}
    </div>
  )
}

function BetsTab() {
  const [name, setName] = useState("")
  const [teams, setTeams] = useState("")
  const [deadline, setDeadline] = useState("")
  const [options, setOptions] = useState<{ name: string; odds: string }[]>([
    { name: "", odds: "1.5" },
    { name: "", odds: "2.5" },
  ])
  const [list, setList] = useState<any[]>([])
  const load = () => api("/matches").then(setList).catch(()=>{})
  useEffect(()=>{ load() },[])

  const updateOption = (idx: number, field: "name" | "odds", value: string) => {
    setOptions(prev => prev.map((o, i) => i === idx ? { ...o, [field]: value } : o))
  }
  const addOption = () => setOptions(prev => [...prev, { name: "", odds: "1.5" }])
  const create = async () => {
    const payload = {
      name,
      teams,
      deadline,
      options: options.filter(o => o.name && o.odds).map(o => ({ name: o.name, odds: Number(o.odds) || 1 })),
    }
    await api("/matches", { method: "POST", body: JSON.stringify(payload) })
    setName("")
    setTeams("")
    setDeadline("")
    setOptions([{ name: "", odds: "1.5" }, { name: "", odds: "2.5" }])
    load()
  }
  const closeMatch = (id: string) => api(`/matches/${id}/close`, { method: "POST" }).then(load)
  const settleMatch = (id: string, optionId: string) => api(`/matches/${id}/settle`, { method: "POST", body: JSON.stringify({ optionId }) }).then(load)

  return (
    <div className="space-y-4">
      <div className="glass p-4 rounded space-y-2">
        <h2 className="font-semibold mb-1">Создать матч</h2>
        <input className="w-full p-3 rounded bg-white/10" placeholder="Название матча" value={name} onChange={e=>setName(e.target.value)} />
        <input className="w-full p-3 rounded bg-white/10" placeholder="Команды / описание" value={teams} onChange={e=>setTeams(e.target.value)} />
        <input className="w-full p-3 rounded bg-white/10" placeholder="Дедлайн (ISO, напр. 2026-03-11T18:00:00Z)" value={deadline} onChange={e=>setDeadline(e.target.value)} />
        <div className="space-y-2">
          <div className="text-sm text-white/70">Опции и коэффициенты</div>
          {options.map((o, idx) => (
            <div key={idx} className="flex gap-2">
              <input className="flex-1 p-2 rounded bg-white/10" placeholder="Название" value={o.name} onChange={e=>updateOption(idx,"name",e.target.value)} />
              <input className="w-24 p-2 rounded bg-white/10" placeholder="Кэф" value={o.odds} onChange={e=>updateOption(idx,"odds",e.target.value)} />
            </div>
          ))}
          <button onClick={addOption} className="btn glass text-sm">+ Опция</button>
        </div>
        <button onClick={create} className="btn btn-primary">Создать матч</button>
      </div>
      <div className="glass p-4 rounded space-y-2 max-h-96 overflow-auto">
        <h2 className="font-semibold mb-1">Текущие матчи</h2>
        {list.map(m => (
          <div key={m.id} className="border border-white/10 rounded p-2 space-y-1">
            <div className="flex items-center justify-between text-sm">
              <div className="font-medium truncate">{m.name}</div>
              <div className="text-xs text-white/60">{m.status}</div>
            </div>
            <div className="text-xs text-white/60">Дедлайн: {new Date(m.deadline).toLocaleString()}</div>
            <div className="flex flex-wrap gap-1 text-xs mt-1">
              {m.options?.map((o:any)=>(
                <button
                  key={o.id}
                  onClick={()=>settleMatch(m.id, o.id)}
                  className="px-2 py-1 rounded bg-white/5 border border-white/10"
                  disabled={m.status === "settled"}
                >
                  {o.name} x{o.odds}
                </button>
              ))}
            </div>
            <div className="flex gap-2 mt-2">
              {m.status === "open" && (
                <button onClick={()=>closeMatch(m.id)} className="btn glass text-xs">Закрыть приём</button>
              )}
              {m.status !== "settled" && (
                <div className="text-xs text-white/60">Нажмите на опцию, чтобы рассчитать исход</div>
              )}
            </div>
          </div>
        ))}
        {list.length===0 && <div className="text-white/60 text-sm">Матчей нет</div>}
      </div>
    </div>
  )
}

function AnalyticsTab() {
  const [a, setA] = useState<any>(null)
  useEffect(()=>{ api("/admin/analytics").then(setA).catch(()=>{}) },[])
  if (!a) return <div className="text-white/60">Загрузка...</div>
  return (
    <div className="glass p-4 rounded grid md:grid-cols-4 gap-4">
      <Card title="Пользователи" value={a.totalUsers} />
      <Card title="Монеты в обороте" value={a.coinsInCirculation} />
      <Card title="Активации реферал" value={a.referralActivations} />
      <Card title="Ставки" value={a.bets} />
    </div>
  )
}

function Card({ title, value }: any) {
  return (
    <div className="glass p-4 rounded">
      <div className="text-white/60">{title}</div>
      <div className="text-2xl">{value}</div>
    </div>
  )
}
