import Link from "next/link"
import { API_URL } from "../lib/api"
import RecentBets from "./components/RecentBets"

async function getData() {
  try {
    const [postsRes, pollsRes, matchesRes] = await Promise.all([
      fetch(`${API_URL}/posts`, { cache: "no-store" }).catch(() => ({ ok: false })),
      fetch(`${API_URL}/polls`, { cache: "no-store" }).catch(() => ({ ok: false })),
      fetch(`${API_URL}/matches`, { cache: "no-store" }).catch(() => ({ ok: false })),
    ])
    
    const posts = (postsRes as any).ok ? await (postsRes as any).json() : []
    const polls = (pollsRes as any).ok ? await (pollsRes as any).json() : []
    const matches = (matchesRes as any).ok ? await (matchesRes as any).json() : []
    
    return { posts, polls, matches }
  } catch (e) {
    console.error("Ошибка загрузки данных:", e)
    return { posts: [], polls: [], matches: [] }
  }
}

export default async function Home() {
  const data = await getData()
  const openMatches = (data.matches || []).filter((m: any) => m.status !== "settled")
  return (
    <div className="space-y-6">
      <div className="glass p-6 rounded-lg shadow-neon">
        <h1 className="text-2xl font-bold glow">Киберпанк платформа сообщества</h1>
        <p className="text-white/80">Ставки, награды, квесты и лидерборды</p>
        <div className="mt-4 flex gap-2">
          <Link href="/register" className="btn btn-primary">Присоединиться</Link>
          <Link href="/bets" className="btn glass">К матчам</Link>
        </div>
      </div>
      <div className="glass p-4 rounded-lg">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-acid">Активные ставки</h2>
          <Link href="/bets" className="text-sm text-white/70 hover:text-white underline">Все матчи</Link>
        </div>
        <div className="space-y-3">
          {openMatches.slice(0,3).map((m:any) => (
            <div key={m.id} className="flex items-center justify-between gap-3 border border-white/10 rounded-lg px-3 py-2">
              <div>
                <div className="font-medium">{m.name}</div>
                <div className="text-xs text-white/60">Дедлайн: {new Date(m.deadline).toLocaleString()}</div>
              </div>
              <div className="flex flex-wrap gap-1 text-xs">
                {m.options?.slice(0,3).map((o:any) => (
                  <span key={o.id} className="px-2 py-1 rounded bg-white/5 border border-white/10">
                    {o.name} x{o.odds}
                  </span>
                ))}
              </div>
            </div>
          ))}
          {openMatches.length === 0 && <div className="text-white/60 text-sm">Пока нет активных матчей. Загляни позже.</div>}
        </div>
      </div>
      <div className="glass p-4 rounded-lg">
        <h2 className="font-semibold mb-3 text-neon">Последние ставки</h2>
        <RecentBets />
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <div className="glass p-4 rounded-lg">
          <h2 className="font-semibold mb-2 text-neon">Лента</h2>
          <div className="space-y-3">
            {data.posts.length === 0 && <div className="text-white/60">Пока нет постов</div>}
          </div>
        </div>
        <div className="glass p-4 rounded-lg">
          <h2 className="font-semibold mb-2 text-acid">Опросы</h2>
          <div className="space-y-3">
            {data.polls.length === 0 && <div className="text-white/60">Пока нет опросов</div>}
          </div>
        </div>
      </div>
    </div>
  )
}
