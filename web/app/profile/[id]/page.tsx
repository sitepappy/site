"use client"
import { useEffect, useState } from "react"
import { api } from "../../../lib/api"
import PostCard from "../../components/PostCard"
import Link from "next/link"
import AchievementsPanel from "../../components/AchievementsPanel"

export default function PublicProfilePage({ params }: { params: { id: string } }) {
  const { id } = params
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    load()
  }, [id])

  const load = async () => {
    try {
      const data = await api(`/users/profile/${id}`)
      setUser(data)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="w-12 h-12 border-4 border-neon border-t-transparent rounded-full animate-spin"></div>
        <div className="text-neon font-black animate-pulse uppercase tracking-widest text-xs">Загрузка профиля...</div>
      </div>
    )
  }

  if (error || !user) {
    return (
      <div className="max-w-md mx-auto glass p-8 rounded-2xl text-center space-y-6">
        <div className="text-5xl mb-4">🕵️‍♂️</div>
        <h1 className="text-2xl font-black uppercase italic tracking-tighter">Пользователь не найден</h1>
        <p className="text-white/50 text-sm leading-relaxed">Профиль не существует или был удален.</p>
        <Link href="/" className="btn btn-primary px-8 py-3 text-xs font-black uppercase italic inline-block">На Главную</Link>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Шапка профиля */}
      <div className="relative glass rounded-3xl overflow-hidden border border-white/5 shadow-2xl">
        <div className="h-48 md:h-72 bg-gradient-to-br from-base-light to-base relative overflow-hidden">
          {user.bannerUrl ? (
            <img src={user.bannerUrl} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_50%_50%,rgba(57,255,20,0.1),transparent)]"></div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>
        </div>

        <div className="px-6 pb-8 relative">
          <div className="flex flex-col md:flex-row items-end gap-6 -mt-16 md:-mt-24 mb-8">
            <div className="relative">
              <div className="w-32 h-32 md:w-48 md:h-48 rounded-full bg-base border-4 border-base-light overflow-hidden shadow-2xl flex items-center justify-center">
                {user.avatarUrl ? (
                  <img src={user.avatarUrl} alt={user.username} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-6xl font-black text-neon/20">{user.username?.[0]?.toUpperCase()}</span>
                )}
              </div>
              <div className="absolute -bottom-1 -right-1 bg-acid text-black text-xs font-black px-4 py-1.5 rounded-full uppercase italic tracking-tighter shadow-xl border-2 border-base">
                {user.level?.name || "1"}
              </div>
            </div>

            <div className="flex-1 text-center md:text-left pb-2">
              <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-5 mb-3">
                <h1 className="text-4xl font-black italic tracking-tighter text-white drop-shadow-2xl">
                  {user.username}
                </h1>
                <span className={`inline-block px-4 py-1.5 rounded-full text-[10px] font-black uppercase italic tracking-[0.2em] shadow-lg ${
                  user.role === 'admin' ? 'bg-acid text-black' : user.role === 'moderator' ? 'bg-blue-500 text-white' : 'bg-white/5 border border-white/10 text-white/40'
                }`}>
                  {user.role}
                </span>
              </div>
              <div className="text-[11px] text-white/40 font-mono flex items-center justify-center md:justify-start gap-2 uppercase tracking-widest">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-neon" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                </svg>
                Участник сообщества с {new Date(user.createdAt).toLocaleDateString()}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 pt-4 border-t border-white/5">
            <div className="glass-light px-6 py-4 rounded-2xl border border-white/5 text-center flex-1 min-w-[140px]">
              <div className="text-[10px] font-black text-white/30 uppercase mb-1 tracking-widest">Публикаций</div>
              <div className="text-2xl font-black text-white italic">{user.posts?.length || 0}</div>
            </div>
            <div className="glass-light px-6 py-4 rounded-2xl border border-white/5 text-center flex-1 min-w-[140px]">
              <div className="text-[10px] font-black text-white/30 uppercase mb-1 tracking-widest">Репутация</div>
              <div className="text-2xl font-black text-neon italic">Coming Soon</div>
            </div>
            <div className="glass-light px-6 py-4 rounded-2xl border border-white/5 text-center flex-1 min-w-[140px]">
              <div className="text-[10px] font-black text-white/30 uppercase mb-1 tracking-widest">Награды</div>
              <div className="text-2xl font-black text-acid italic">0</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <AchievementsPanel achievements={user.achievements} />
        
        <div className="space-y-6">
          <h3 className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] flex items-center gap-2 px-2">
            <span className="w-1.5 h-1.5 rounded-full bg-acid"></span>
            Реферальный статус
          </h3>
          <div className="glass p-6 rounded-[32px] border border-white/5 bg-gradient-to-br from-white/[0.02] to-transparent relative overflow-hidden h-full">
            <div className="relative z-10 flex items-center gap-6">
              <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-3xl shadow-2xl">
                {user.referralLevel ? "🏆" : "🥚"}
              </div>
              <div>
                <div className="text-[10px] text-white/30 font-black uppercase tracking-widest mb-1">Статус игрока</div>
                <div className="text-2xl font-black italic uppercase tracking-tighter" style={{ color: user.referralColor || '#ffffff' }}>
                  {user.referralLevel || "Новичок"}
                </div>
                <div className="text-[10px] text-white/40 mt-1 font-mono">
                  Рефералов: {user.referralCount || 0}
                </div>
              </div>
            </div>
            <div className="mt-6 h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
               <div className="h-full bg-neon shadow-[0_0_10px_rgba(57,255,20,0.5)] transition-all duration-1000" style={{ width: `${Math.min(((user.referralCount || 0) / 60) * 100, 100)}%` }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Публичный инвентарь */}
      <div className="space-y-6">
        <h3 className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] flex items-center gap-2 px-2">
          <span className="w-1.5 h-1.5 rounded-full bg-neon"></span>
          Арсенал скинов
        </h3>
        <div className="glass p-8 rounded-[40px] border border-white/5">
          {(!user.inventory || user.inventory.length === 0) ? (
            <div className="py-12 text-center">
              <div className="text-4xl mb-4 opacity-10">🎒</div>
              <p className="text-white/20 font-black uppercase tracking-widest text-[10px]">Инвентарь пуст</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {user.inventory.map((item: any) => {
                const RARITY_CLASSES = {
                  low: "border-gray-500/30 bg-gray-500/5",
                  medium: "border-[#39FF14]/30 bg-[#39FF14]/5",
                  high: "border-[#FF00FF]/30 bg-[#FF00FF]/5",
                  premium: "border-[#FFD700]/30 bg-[#FFD700]/5"
                }
                const rarityColor = item.rarity === 'low' ? 'text-gray-400' : item.rarity === 'medium' ? 'text-[#39FF14]' : item.rarity === 'high' ? 'text-[#FF00FF]' : 'text-[#FFD700]'
                
                return (
                  <div key={item.id} className={`p-4 rounded-2xl border flex flex-col items-center text-center group transition-all hover:scale-[1.05] hover:shadow-2xl ${RARITY_CLASSES[item.rarity as keyof typeof RARITY_CLASSES]}`}>
                    <div className="relative mb-3">
                      <img src={item.skinImage} alt="" className="w-20 h-20 object-contain group-hover:scale-110 transition-transform relative z-10" />
                      <div className={`absolute inset-0 blur-2xl opacity-20 group-hover:opacity-40 transition-opacity rounded-full ${rarityColor.replace('text-', 'bg-')}`}></div>
                    </div>
                    <div className={`text-[9px] font-black uppercase tracking-tighter mb-1 truncate w-full ${rarityColor}`}>{item.skinName}</div>
                    <div className="text-[7px] text-white/20 uppercase font-bold">{item.caseName} Case</div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Лента пользователя */}
      <div className="space-y-6">
        <h2 className="text-sm font-black uppercase italic tracking-[0.3em] text-white/30 flex items-center gap-4 px-2">
          <span className="w-12 h-[1px] bg-white/10"></span>
          Лента Активности
          <span className="flex-1 h-[1px] bg-white/10"></span>
        </h2>
        
        <div className="grid gap-6">
          {user.posts?.map((post: any) => (
            <PostCard key={post.id} post={post} />
          ))}
          
          {(!user.posts || user.posts.length === 0) && (
            <div className="glass p-16 rounded-3xl text-center border border-dashed border-white/10">
              <div className="text-4xl mb-4 opacity-20">📭</div>
              <div className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20">Пользователь еще ничего не публиковал</div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
