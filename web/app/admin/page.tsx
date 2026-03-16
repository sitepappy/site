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

  // Состояния для О нас и Сотрудничества
  const [aboutHtml, setAboutHtml] = useState("")
  const [aboutLinks, setAboutLinks] = useState({ telegram: "", discord: "", twitter: "", steam: "", youtube: "" })
  const [coopHtml, setCoopHtml] = useState("")
  const [coopLinks, setCoopLinks] = useState({ telegram: "", email: "" })

  // Данные для списков
  const [usersList, setUsersList] = useState<any[]>([])
  const [postsList, setPostsList] = useState<any[]>([])
  const [questsList, setQuestsList] = useState<any[]>([])
  const [chatMessages, setChatMessages] = useState<any[]>([])
  const [chatInput, setChatInput] = useState("")

  // Просмотр профиля юзера
  const [selectedUser, setSelectedUser] = useState<any>(null)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const data = await api("/users/me")
        if (data.role !== "admin" && data.role !== "moderator") {
          router.push("/")
          return
        }
        setUser(data)
        loadData(activeTab)
      } catch (e) {
        router.push("/login")
      } finally {
        setLoading(false)
      }
    }
    checkAuth()
  }, [])

  useEffect(() => {
    if (user) loadData(activeTab)
  }, [activeTab])

  const loadData = async (tab: string) => {
    try {
      if (tab === "users") {
        const data = await api("/admin/users")
        setUsersList(data)
      } else if (tab === "posts") {
        const data = await api("/posts")
        setPostsList(data)
      } else if (tab === "quests") {
        const data = await api("/quests")
        setQuestsList(data)
      } else if (tab === "chat") {
        const data = await api("/admin/chat")
        setChatMessages(data)
      } else if (tab === "about") {
        const data = await api("/admin/about")
        setAboutHtml(data.contentHtml || "")
        setAboutLinks(data.links || { telegram: "", discord: "", twitter: "", steam: "", youtube: "" })
      } else if (tab === "coop") {
        const data = await api("/admin/coop")
        setCoopHtml(data.contentHtml || "")
        setCoopLinks(data.links || { telegram: "", email: "" })
      }
    } catch (e) { console.error(e) }
  }

  const handleCreatePost = async (e: any) => {
    e.preventDefault()
    try {
      await api("/posts", { 
        method: "POST", 
        body: JSON.stringify({ title: postTitle, content: postContent }) 
      })
      setPostTitle(""); setPostContent(""); setMsg("Пост создан!")
      loadData("posts")
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

  const handleDeletePost = async (id: string) => {
    if (!confirm("Удалить пост?")) return
    try {
      await api(`/admin/posts/${id}`, { method: "DELETE" })
      loadData("posts")
    } catch (e: any) { alert(e.message) }
  }

  const handleDeleteQuest = async (id: string) => {
    if (!confirm("Удалить квест?")) return
    try {
      await api(`/admin/quests/${id}`, { method: "DELETE" })
      loadData("quests")
    } catch (e: any) { alert(e.message) }
  }

  const handleBanUser = async (userId: string, isBanned: boolean) => {
    try {
      await api("/admin/users/ban", { method: "POST", body: JSON.stringify({ userId, isBanned }) })
      loadData("users")
      if (selectedUser?.user?.id === userId) viewUser(userId)
    } catch (e: any) { alert(e.message) }
  }

  const viewUser = async (id: string) => {
    try {
      const data = await api(`/admin/users/${id}`)
      setSelectedUser(data)
    } catch (e: any) { alert(e.message) }
  }

  const sendChatMessage = async (e: any) => {
    e.preventDefault()
    if (!chatInput.trim()) return
    try {
      await api("/admin/chat", { method: "POST", body: JSON.stringify({ message: chatInput }) })
      setChatInput("")
      loadData("chat")
    } catch (e: any) { alert(e.message) }
  }

  const handleSaveAbout = async (e: any) => {
    e.preventDefault()
    try {
      await api("/admin/about", { method: "POST", body: JSON.stringify({ contentHtml: aboutHtml, links: aboutLinks }) })
      setMsg("О нас сохранено!")
      setTimeout(() => setMsg(""), 3000)
    } catch (e: any) { alert(e.message) }
  }

  const handleSaveCoop = async (e: any) => {
    e.preventDefault()
    try {
      await api("/admin/coop", { method: "POST", body: JSON.stringify({ contentHtml: coopHtml, links: coopLinks }) })
      setMsg("Сотрудничество сохранено!")
      setTimeout(() => setMsg(""), 3000)
    } catch (e: any) { alert(e.message) }
  }

  const handleUpdateRole = async (userId: string, role: string) => {
    try {
      await api("/admin/users/role", { method: "POST", body: JSON.stringify({ userId, role }) })
      loadData("users")
      if (selectedUser?.user?.id === userId) viewUser(userId)
    } catch (e: any) { alert(e.message) }
  }

  const handleUpdateBalance = async (userId: string, delta: number) => {
    try {
      await api("/admin/users/balance", { method: "POST", body: JSON.stringify({ userId, delta }) })
      loadData("users")
      if (selectedUser?.user?.id === userId) viewUser(userId)
    } catch (e: any) { alert(e.message) }
  }

  if (loading) return <div className="p-10 text-center text-neon animate-pulse uppercase font-bold tracking-widest">Инициализация протоколов доступа...</div>

  const isOnlyModerator = user?.role === "moderator"

  return (
    <div className="glass rounded-lg border border-white/5 overflow-hidden max-w-6xl mx-auto">
      <div className="bg-white/5 border-b border-white/10 p-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-acid tracking-tighter uppercase">Панель управления</h1>
        <div className="flex items-center gap-4">
          {msg && <span className="text-neon text-xs font-bold animate-bounce">{msg}</span>}
          <div className="text-[10px] px-2 py-1 rounded border border-acid/50 text-acid font-mono uppercase">
            Доступ: {user?.role}
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row min-h-[700px]">
        {/* Sidebar */}
        <div className="w-full md:w-64 bg-black/20 border-r border-white/5 p-2 space-y-1">
          <button onClick={() => setActiveTab("posts")} className={`w-full text-left p-3 rounded text-sm transition-all ${activeTab === "posts" ? "bg-neon text-black font-bold" : "hover:bg-white/5 text-white/60"}`}>Лента (Посты)</button>
          <button onClick={() => setActiveTab("matches")} className={`w-full text-left p-3 rounded text-sm transition-all ${activeTab === "matches" ? "bg-neon text-black font-bold" : "hover:bg-white/5 text-white/60"}`}>Матчи (Ставки)</button>
          <button onClick={() => setActiveTab("users")} className={`w-full text-left p-3 rounded text-sm transition-all ${activeTab === "users" ? "bg-neon text-black font-bold" : "hover:bg-white/5 text-white/60"}`}>Пользователи</button>
          <button onClick={() => setActiveTab("quests")} className={`w-full text-left p-3 rounded text-sm transition-all ${activeTab === "quests" ? "bg-neon text-black font-bold" : "hover:bg-white/5 text-white/60"}`}>Квесты</button>
          <button onClick={() => setActiveTab("chat")} className={`w-full text-left p-3 rounded text-sm transition-all ${activeTab === "chat" ? "bg-neon text-black font-bold" : "hover:bg-white/5 text-white/60"}`}>Админ-чат 💬</button>
          <button onClick={() => setActiveTab("about")} className={`w-full text-left p-3 rounded text-sm transition-all ${activeTab === "about" ? "bg-neon text-black font-bold" : "hover:bg-white/5 text-white/60"}`}>О нас</button>
          <button onClick={() => setActiveTab("coop")} className={`w-full text-left p-3 rounded text-sm transition-all ${activeTab === "coop" ? "bg-neon text-black font-bold" : "hover:bg-white/5 text-white/60"}`}>Сотрудничество</button>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-6 overflow-y-auto max-h-[800px]">
          {activeTab === "posts" && (
            <div className="space-y-8">
              <form onSubmit={handleCreatePost} className="space-y-4 max-w-xl glass p-4 rounded-lg">
                <h2 className="text-lg font-bold text-neon uppercase">Новый пост</h2>
                <input required value={postTitle} onChange={e=>setPostTitle(e.target.value)} className="w-full p-2 rounded bg-white/5 border border-white/10 text-sm" placeholder="Заголовок..." />
                <textarea required value={postContent} onChange={e=>setPostContent(e.target.value)} rows={3} className="w-full p-2 rounded bg-white/5 border border-white/10 text-sm" placeholder="Текст..." />
                <button className="btn btn-primary w-full py-2">Опубликовать</button>
              </form>
              
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-white/40 uppercase">Существующие посты</h3>
                {postsList.map(p => (
                  <div key={p.id} className="flex items-center justify-between p-3 rounded bg-white/5 border border-white/10">
                    <span className="text-sm truncate mr-4">{p.title}</span>
                    <button onClick={() => handleDeletePost(p.id)} className="text-red-400 hover:text-red-300 text-xs uppercase font-bold">Удалить</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "matches" && (
            <form onSubmit={handleCreateMatch} className="space-y-4 max-w-xl glass p-4 rounded-lg">
              <h2 className="text-lg font-bold text-neon uppercase">Добавить матч</h2>
              <input required value={matchName} onChange={e=>setMatchName(e.target.value)} className="w-full p-2 rounded bg-white/5 border border-white/10 text-sm" placeholder="Турнир..." />
              <div className="grid grid-cols-2 gap-4">
                <input required value={team1} onChange={e=>setTeam1(e.target.value)} className="p-2 rounded bg-white/5 border border-white/10 text-sm" placeholder="Команда 1" />
                <input required value={team2} onChange={e=>setTeam2(e.target.value)} className="p-2 rounded bg-white/5 border border-white/10 text-sm" placeholder="Команда 2" />
              </div>
              <input required type="datetime-local" value={deadline} onChange={e=>setDeadline(e.target.value)} className="w-full p-2 rounded bg-white/5 border border-white/10 text-sm" />
              <button className="btn btn-primary w-full py-2">Создать</button>
            </form>
          )}

          {activeTab === "users" && (
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <h2 className="text-lg font-bold text-neon uppercase">Пользователи</h2>
                {usersList.map(u => (
                  <div key={u.id} onClick={() => viewUser(u.id)} className="flex items-center justify-between p-3 rounded bg-white/5 border border-white/10 cursor-pointer hover:border-neon/50 transition-colors">
                    <div className="text-sm">
                      <div className="font-bold">{u.username} {u.isBanned && <span className="text-red-500">[БАН]</span>}</div>
                      <div className="text-[10px] text-white/40">{u.email}</div>
                    </div>
                    <div className="text-xs font-mono text-acid">{u.balance} 🪙</div>
                  </div>
                ))}
              </div>

              <div className="glass p-4 rounded-lg min-h-[400px]">
                {selectedUser ? (
                  <div className="space-y-6">
                    <div className="flex justify-between items-start">
                      <h3 className="text-xl font-bold text-neon">{selectedUser.user.username}</h3>
                      <button onClick={() => handleBanUser(selectedUser.user.id, !selectedUser.user.isBanned)} 
                        className={`px-3 py-1 rounded text-[10px] font-bold uppercase ${selectedUser.user.isBanned ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>
                        {selectedUser.user.isBanned ? "Разбанить" : "Забанить"}
                      </button>
                    </div>
                    
                    <div>
                      <h4 className="text-xs font-bold text-white/40 uppercase mb-2">Логи транзакций</h4>
                      <div className="space-y-1 max-h-40 overflow-y-auto pr-2">
                        {selectedUser.logs.map((l:any) => (
                          <div key={l.id} className="text-[10px] p-1.5 rounded bg-black/20 flex justify-between">
                            <span className="text-white/60">{l.note}</span>
                            <span className={l.amount > 0 ? "text-green-400" : "text-red-400"}>{l.amount > 0 ? "+" : ""}{l.amount}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {!isOnlyModerator && (
                      <div className="pt-4 border-t border-white/10">
                         <h4 className="text-xs font-bold text-white/40 uppercase mb-2">Админ-действия</h4>
                         <div className="flex flex-wrap gap-2">
                           <button onClick={()=>handleUpdateBalance(selectedUser.user.id, 100)} className="flex-1 py-2 rounded bg-white/5 border border-white/10 text-[10px] uppercase font-bold hover:bg-white/10">+100 монет</button>
                           <button onClick={()=>handleUpdateBalance(selectedUser.user.id, -100)} className="flex-1 py-2 rounded bg-white/5 border border-white/10 text-[10px] uppercase font-bold hover:bg-white/10">-100 монет</button>
                           <button onClick={()=>handleUpdateRole(selectedUser.user.id, selectedUser.user.role === 'admin' ? 'user' : 'admin')} className="w-full py-2 rounded bg-acid/20 border border-acid/30 text-[10px] uppercase font-bold hover:bg-acid/30">
                             {selectedUser.user.role === 'admin' ? 'Снять админку' : 'Сделать админом'}
                           </button>
                           <button onClick={()=>handleUpdateRole(selectedUser.user.id, selectedUser.user.role === 'moderator' ? 'user' : 'moderator')} className="w-full py-2 rounded bg-neon/20 border border-neon/30 text-[10px] uppercase font-bold hover:bg-neon/30">
                             {selectedUser.user.role === 'moderator' ? 'Снять модератора' : 'Сделать модератором'}
                           </button>
                         </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full text-white/20 text-sm italic">Выберите пользователя для просмотра логов</div>
                )}
              </div>
            </div>
          )}

          {activeTab === "quests" && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-neon uppercase">Активные квесты</h2>
              <div className="grid gap-2">
                {questsList.map(q => (
                  <div key={q.id} className="flex items-center justify-between p-4 rounded bg-white/5 border border-white/10">
                    <div>
                      <div className="font-bold">{q.name}</div>
                      <div className="text-xs text-acid">{q.reward} 🪙</div>
                    </div>
                    <button onClick={() => handleDeleteQuest(q.id)} className="text-red-400 hover:text-red-300 text-xs uppercase font-bold">Удалить</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "chat" && (
            <div className="flex flex-col h-[600px] glass rounded-lg">
              <div className="flex-1 p-4 space-y-3 overflow-y-auto">
                {chatMessages.map(m => (
                  <div key={m.id} className={`max-w-[80%] ${m.username === user.username ? "ml-auto" : ""}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[10px] font-bold ${m.role === 'admin' ? 'text-acid' : 'text-neon'}`}>{m.username}</span>
                      <span className="text-[8px] text-white/30">{new Date(m.createdAt).toLocaleTimeString()}</span>
                    </div>
                    <div className="p-3 rounded-lg bg-white/5 border border-white/10 text-sm">{m.message}</div>
                  </div>
                ))}
              </div>
              <form onSubmit={sendChatMessage} className="p-4 border-t border-white/10 flex gap-2">
                <input value={chatInput} onChange={e=>setChatInput(e.target.value)} className="flex-1 p-2 rounded bg-white/5 border border-white/10 text-sm" placeholder="Сообщение для персонала..." />
                <button className="btn btn-primary px-4 py-2 text-xs uppercase font-bold">Отправить</button>
              </form>
            </div>
          )}

          {activeTab === "about" && (
            <form onSubmit={handleSaveAbout} className="space-y-4 max-w-xl glass p-4 rounded-lg">
              <h2 className="text-lg font-bold text-neon uppercase">Редактировать "О нас"</h2>
              <div>
                <label className="block text-xs text-white/40 mb-1">HTML контент</label>
                <textarea rows={10} value={aboutHtml} onChange={e=>setAboutHtml(e.target.value)} className="w-full p-2 rounded bg-white/5 border border-white/10 text-xs font-mono" placeholder="<h1>О нас</h1>..." />
              </div>
              <div className="space-y-2">
                <label className="block text-xs text-white/40 uppercase">Ссылки</label>
                {Object.keys(aboutLinks).map(k => (
                  <div key={k} className="flex items-center gap-2">
                    <span className="text-[10px] w-20 text-white/60">{k}:</span>
                    <input value={(aboutLinks as any)[k]} onChange={e=>setAboutLinks({...aboutLinks, [k]: e.target.value})} className="flex-1 p-1.5 rounded bg-white/5 border border-white/10 text-xs" />
                  </div>
                ))}
              </div>
              <button className="btn btn-primary w-full py-2 uppercase font-bold text-xs">Сохранить</button>
            </form>
          )}

          {activeTab === "coop" && (
            <form onSubmit={handleSaveCoop} className="space-y-4 max-w-xl glass p-4 rounded-lg">
              <h2 className="text-lg font-bold text-neon uppercase">Редактировать "Сотрудничество"</h2>
              <div>
                <label className="block text-xs text-white/40 mb-1">HTML контент</label>
                <textarea rows={10} value={coopHtml} onChange={e=>setCoopHtml(e.target.value)} className="w-full p-2 rounded bg-white/5 border border-white/10 text-xs font-mono" placeholder="<h1>Сотрудничество</h1>..." />
              </div>
              <div className="space-y-2">
                <label className="block text-xs text-white/40 uppercase">Контакты</label>
                {Object.keys(coopLinks).map(k => (
                  <div key={k} className="flex items-center gap-2">
                    <span className="text-[10px] w-20 text-white/60">{k}:</span>
                    <input value={(coopLinks as any)[k]} onChange={e=>setCoopLinks({...coopLinks, [k]: e.target.value})} className="flex-1 p-1.5 rounded bg-white/5 border border-white/10 text-xs" />
                  </div>
                ))}
              </div>
              <button className="btn btn-primary w-full py-2 uppercase font-bold text-xs">Сохранить</button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
