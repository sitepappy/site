"use client"
import { useEffect, useState } from "react"
import { api } from "../../lib/api"
import { useRouter } from "next/navigation"

export default function AdminPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("posts")
  const router = useRouter()

  // Состояния для форм
  const [postTitle, setPostTitle] = useState("")
  const [postContent, setPostContent] = useState("")
  const [matchName, setMatchName] = useState("")
  const [team1, setTeam1] = useState("")
  const [team2, setTeam2] = useState("")
  const [odds1, setOdds1] = useState("1.5")
  const [odds2, setOdds2] = useState("1.5")
  const [deadline, setDeadline] = useState("")
  const [msg, setMsg] = useState("")

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const data = await api("/users/me")
        if (data.role !== "admin" && data.role !== "moderator") {
          router.push("/")
          return
        }
        setUser(data)
      } catch (e) {
        router.push("/login")
      } finally {
        setLoading(false)
      }
    }
    checkAuth()
  }, [])

  const handleCreatePost = async (e: any) => {
    e.preventDefault()
    try {
      await api("/posts", { 
        method: "POST", 
        body: JSON.stringify({ title: postTitle, content: postContent }) 
      })
      setPostTitle(""); setPostContent(""); setMsg("Пост создан!")
      setTimeout(() => setMsg(""), 3000)
    } catch (err: any) { alert(err.message) }
  }

  const handleCreateMatch = async (e: any) => {
    e.preventDefault()
    try {
      await api("/matches", {
        method: "POST",
        body: JSON.stringify({
          name: matchName,
          options: [
            { name: team1, odds: odds1 },
            { name: team2, odds: odds2 }
          ],
          deadline: new Date(deadline).toISOString()
        })
      })
      setMatchName(""); setTeam1(""); setTeam2(""); setMsg("Матч добавлен!")
      setTimeout(() => setMsg(""), 3000)
    } catch (err: any) { alert(err.message) }
  }

  if (loading) return <div className="p-10 text-center text-neon animate-pulse uppercase font-bold tracking-widest">Инициализация протоколов доступа...</div>

  const isOnlyModerator = user?.role === "moderator"

  return (
    <div className="glass rounded-lg border border-white/5 overflow-hidden max-w-5xl mx-auto">
      <div className="bg-white/5 border-b border-white/10 p-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-acid tracking-tighter uppercase">Панель управления</h1>
        <div className="flex items-center gap-4">
          {msg && <span className="text-neon text-xs font-bold animate-bounce">{msg}</span>}
          <div className="text-[10px] px-2 py-1 rounded border border-acid/50 text-acid font-mono uppercase">
            Доступ: {user?.role}
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row min-h-[600px]">
        <div className="w-full md:w-64 bg-black/20 border-r border-white/5 p-2 space-y-1">
          <button onClick={() => setActiveTab("posts")} className={`w-full text-left p-3 rounded text-sm transition-all ${activeTab === "posts" ? "bg-neon text-black font-bold" : "hover:bg-white/5 text-white/60"}`}>Лента (Посты)</button>
          <button onClick={() => setActiveTab("matches")} className={`w-full text-left p-3 rounded text-sm transition-all ${activeTab === "matches" ? "bg-neon text-black font-bold" : "hover:bg-white/5 text-white/60"}`}>Матчи (Ставки)</button>
          <button onClick={() => setActiveTab("users")} className={`w-full text-left p-3 rounded text-sm transition-all ${activeTab === "users" ? "bg-neon text-black font-bold" : "hover:bg-white/5 text-white/60"}`}>Пользователи</button>
        </div>

        <div className="flex-1 p-6 relative">
          {activeTab === "posts" && (
            <form onSubmit={handleCreatePost} className="space-y-4 max-w-xl">
              <h2 className="text-2xl font-bold mb-6 text-neon uppercase">Создать новый пост</h2>
              <div>
                <label className="block text-xs text-white/40 mb-1">Заголовок</label>
                <input required value={postTitle} onChange={e=>setPostTitle(e.target.value)} className="w-full p-3 rounded bg-white/5 border border-white/10 focus:border-neon outline-none" placeholder="Заголовок поста..." />
              </div>
              <div>
                <label className="block text-xs text-white/40 mb-1">Текст поста</label>
                <textarea required value={postContent} onChange={e=>setPostContent(e.target.value)} rows={5} className="w-full p-3 rounded bg-white/5 border border-white/10 focus:border-neon outline-none" placeholder="О чем хотите рассказать?" />
              </div>
              <button className="btn btn-primary w-full">Опубликовать в ленту</button>
            </form>
          )}

          {activeTab === "matches" && (
            <form onSubmit={handleCreateMatch} className="space-y-4 max-w-xl">
              <h2 className="text-2xl font-bold mb-6 text-neon uppercase">Добавить матч</h2>
              <div>
                <label className="block text-xs text-white/40 mb-1">Название турнира / матча</label>
                <input required value={matchName} onChange={e=>setMatchName(e.target.value)} className="w-full p-3 rounded bg-white/5 border border-white/10 focus:border-neon outline-none" placeholder="Напр: PAPPY CUP 2026" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-white/40 mb-1">Команда 1</label>
                  <input required value={team1} onChange={e=>setTeam1(e.target.value)} className="w-full p-3 rounded bg-white/5 border border-white/10 outline-none" placeholder="Имя команды" />
                  <input type="number" step="0.1" value={odds1} onChange={e=>setOdds1(e.target.value)} className="w-full mt-2 p-2 text-xs rounded bg-white/5 border border-white/10" placeholder="Коэффициент" />
                </div>
                <div>
                  <label className="block text-xs text-white/40 mb-1">Команда 2</label>
                  <input required value={team2} onChange={e=>setTeam2(e.target.value)} className="w-full p-3 rounded bg-white/5 border border-white/10 outline-none" placeholder="Имя команды" />
                  <input type="number" step="0.1" value={odds2} onChange={e=>setOdds2(e.target.value)} className="w-full mt-2 p-2 text-xs rounded bg-white/5 border border-white/10" placeholder="Коэффициент" />
                </div>
              </div>
              <div>
                <label className="block text-xs text-white/40 mb-1">Дедлайн (до когда можно ставить)</label>
                <input required type="datetime-local" value={deadline} onChange={e=>setDeadline(e.target.value)} className="w-full p-3 rounded bg-white/5 border border-white/10 outline-none" />
              </div>
              <button className="btn btn-primary w-full">Создать матч</button>
            </form>
          )}

          {activeTab === "users" && (
            <div className="relative">
              {isOnlyModerator && (
                <div className="absolute inset-0 z-10 bg-base/80 backdrop-blur-sm flex items-center justify-center p-6 text-center">
                  <div className="glass p-8 rounded-lg border border-red-500/30 max-w-sm">
                    <div className="text-red-500 text-4xl mb-4">⚠️</div>
                    <h2 className="text-xl font-bold mb-2 uppercase">Отказ в доступе</h2>
                    <p className="text-white/60 text-sm">Модераторам запрещено изменять данные пользователей. Эта функция доступна только администратору.</p>
                  </div>
                </div>
              )}
              <h2 className="text-2xl font-bold mb-4 uppercase">Пользователи</h2>
              <div className="text-white/40 italic">Здесь будет список пользователей (доступно только админу)...</div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
