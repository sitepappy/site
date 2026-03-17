import Link from "next/link"
import { API_URL } from "../lib/api"
import RecentBets from "./components/RecentBets"
import PostCard from "./components/PostCard"

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
    
    // Объединяем всё в одну ленту и сортируем по времени
    const feed = [
      ...posts.map((p: any) => ({ ...p, type: 'post' })),
      ...polls.map((p: any) => ({ ...p, type: 'poll' })),
      ...matches.map((m: any) => ({ ...m, type: 'match' }))
    ].sort((a: any, b: any) => {
      const dateA = new Date(a.createdAt || 0).getTime();
      const dateB = new Date(b.createdAt || 0).getTime();
      return dateB - dateA;
    });
    
    return { feed }
  } catch (e) {
    console.error("Ошибка загрузки данных:", e)
    return { feed: [] }
  }
}

export default async function Home() {
  const { feed } = await getData()
  
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="space-y-4">
        {feed.map((item: any) => {
          if (item.type === 'post') {
            return <PostCard key={`post-${item.id}`} post={item} />
          }
          
          if (item.type === 'match') {
            return (
              <div key={`match-${item.id}`} className="glass p-5 rounded-lg border border-white/5 bg-neon/5">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] bg-neon text-black px-2 py-0.5 rounded font-bold uppercase">Активный матч</span>
                  <span className="text-[10px] text-white/40">{new Date(item.createdAt).toLocaleString()}</span>
                </div>
                <h3 className="text-lg font-bold mb-4 text-center">{item.name}</h3>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  {item.options?.map((o: any) => (
                    <Link href="/bets" key={o.id} className="p-3 rounded bg-white/5 border border-white/10 hover:border-neon text-center transition-all">
                      <div className="text-xs text-white/60 mb-1">{o.name}</div>
                      <div className="text-neon font-mono font-bold">x{o.odds}</div>
                    </Link>
                  ))}
                </div>
                <div className="text-center">
                  <Link href="/bets" className="text-xs text-neon hover:underline">Сделать ставку →</Link>
                </div>
              </div>
            )
          }

          if (item.type === 'poll') {
            return (
              <div key={`poll-${item.id}`} className="glass p-5 rounded-lg border border-white/5 bg-acid/5">
                 <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] bg-acid text-black px-2 py-0.5 rounded font-bold uppercase">Опрос</span>
                  <span className="text-[10px] text-white/40">{new Date(item.createdAt).toLocaleString()}</span>
                </div>
                <h3 className="text-lg font-semibold mb-4">{item.question}</h3>
                <div className="space-y-2">
                  {item.options?.map((o: any) => (
                    <div key={o.id} className="w-full p-3 rounded bg-white/5 border border-white/10 text-sm flex justify-between items-center">
                      <span>{o.text}</span>
                      <span className="text-acid font-mono">0%</span>
                    </div>
                  ))}
                </div>
              </div>
            )
          }
          return null;
        })}

        {feed.length === 0 && (
          <div className="text-center py-20 glass rounded-lg">
            <div className="text-white/20 text-5xl mb-4">∅</div>
            <div className="text-white/40">Лента пока пуста. Заходите позже!</div>
          </div>
        )}
      </div>
    </div>
  )
}
