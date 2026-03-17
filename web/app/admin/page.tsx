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
  const [postImage, setPostImage] = useState("")
  const [questName, setQuestName] = useState("")
  const [questReward, setQuestReward] = useState("10")
  const [matchName, setMatchName] = useState("")
  const [team1, setTeam1] = useState("")
  const [team2, setTeam2] = useState("")
  const [odds1, setOdds1] = useState("1.5")
  const [odds2, setOdds2] = useState("1.5")
  const [deadline, setDeadline] = useState("")
  const [msg, setMsg] = useState("")

  // Состояния для О нас и Расписания
  const [aboutHtml, setAboutHtml] = useState("")
  const [aboutLinks, setAboutLinks] = useState({ telegram: "", discord: "", twitter: "", steam: "", youtube: "", tiktok: "", kick: "", twitch: "", donation: "" })
  const [scheduleHtml, setScheduleHtml] = useState("")
  const [streams, setStreams] = useState<any[]>([])
  const [rewardsList, setRewardsList] = useState<any[]>([])

  // Данные для списков
  const [usersList, setUsersList] = useState<any[]>([])
  const [postsList, setPostsList] = useState<any[]>([])
  const [matchesList, setMatchesList] = useState<any[]>([])
  const [questsList, setQuestsList] = useState<any[]>([])
  const [chatMessages, setChatMessages] = useState<any[]>([])
  const [chatInput, setChatInput] = useState("")
  const [reportsList, setReportsList] = useState<any[]>([])
  const [levelsList, setLevelsList] = useState<any[]>([])
  const [promosList, setPromosList] = useState<any[]>([])
  const [ordersList, setOrdersList] = useState<any[]>([])

  // Состояние для создания ивент-промо
  const [promoCode, setPromoCode] = useState("")
  const [promoReward, setPromoReward] = useState("50")
  const [promoLimit, setPromoLimit] = useState("100")

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
        // Загружаем уровни один раз при входе
        const levelsData = await api("/levels")
        setLevelsList(levelsData)
        loadData(activeTab)
      } catch (e: any) {
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
        const usersData = await api("/admin/users")
        setUsersList(usersData)
      } else if (tab === "posts") {
        const data = await api("/posts")
        setPostsList(data)
      } else if (tab === "matches") {
        const data = await api("/matches/all")
        setMatchesList(data)
      } else if (tab === "quests") {
        const data = await api("/quests")
        setQuestsList(data)
      } else if (tab === "chat") {
        const data = await api("/admin/chat")
        setChatMessages(data)
      } else if (tab === "about") {
        const data = await api("/public/about")
        setAboutHtml(data.contentHtml || "")
        setAboutLinks({ telegram: "", discord: "", twitter: "", steam: "", youtube: "", tiktok: "", kick: "", twitch: "", donation: "", ...data.links })
      } else if (tab === "schedule") {
        const data = await api("/public/schedule")
        setScheduleHtml(data.contentHtml || "")
        setStreams(data.streams || [])
      } else if (tab === "rewards") {
        const data = await api("/rewards")
        setRewardsList(data)
      } else if (tab === "reports") {
        const data = await api("/admin/reports")
        setReportsList(data)
      } else if (tab === "levels") {
        const data = await api("/levels")
        setLevelsList(data)
      } else if (tab === "promos") {
        const data = await api("/admin/promos")
        setPromosList(data)
      } else if (tab === "orders") {
        const data = await api("/orders")
        setOrdersList(data)
      }
    } catch (e) { console.error(e) }
  }

  const handleCreatePost = async (e: any) => {
    e.preventDefault()
    try {
      await api("/posts", { 
        method: "POST", 
        body: JSON.stringify({ title: postTitle, content: postContent, imageUrl: postImage }) 
      })
      setPostTitle(""); setPostContent(""); setPostImage(""); setMsg("Пост создан!")
      loadData("posts")
      setTimeout(() => setMsg(""), 3000)
    } catch (err: any) { alert(err.message) }
  }

  const handleCreateQuest = async (e: any) => {
    e.preventDefault()
    try {
      await api("/quests", {
        method: "POST",
        body: JSON.stringify({ name: questName, reward: Number(questReward) })
      })
      setQuestName(""); setQuestReward("10"); setMsg("Квест добавлен!")
      loadData("quests")
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
      loadData("matches")
      setTimeout(() => setMsg(""), 3000)
    } catch (err: any) { alert(err.message) }
  }

  const handleDeleteMatch = async (id: string) => {
    if (!confirm("Удалить этот матч и все ставки на него?")) return
    try {
      await api(`/matches/${id}`, { method: "DELETE" })
      loadData("matches")
      setMsg("Матч удален")
      setTimeout(() => setMsg(""), 3000)
    } catch (e: any) { alert(e.message) }
  }

  const handleSettleMatch = async (matchId: string, optionId: string) => {
    if (!confirm("Рассчитать ставки с этим победителем?")) return
    try {
      await api(`/matches/${matchId}/settle`, { 
        method: "POST", 
        body: JSON.stringify({ optionId }) 
      })
      loadData("matches")
      setMsg("Ставки рассчитаны!")
      setTimeout(() => setMsg(""), 3000)
    } catch (e: any) { alert(e.message) }
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

  const handleSaveSchedule = async (e: any) => {
    e.preventDefault()
    try {
      await api("/admin/schedule", { method: "POST", body: JSON.stringify({ contentHtml: scheduleHtml, streams }) })
      setMsg("Расписание сохранено!")
      setTimeout(() => setMsg(""), 3000)
    } catch (e: any) { alert(e.message) }
  }

  const handleSaveRewards = async (e: any) => {
    e.preventDefault()
    try {
      await api("/admin/rewards", { method: "POST", body: JSON.stringify({ rewards: rewardsList }) })
      setMsg("Награды сохранены!")
      setTimeout(() => setMsg(""), 3000)
    } catch (e: any) { alert(e.message) }
  }

  const handleDeleteBet = async (id: string) => {
    if (!confirm("Удалить эту ставку?")) return
    try {
      await api(`/admin/bets/${id}`, { method: "DELETE" })
      if (selectedUser) viewUser(selectedUser.user.id)
      setMsg("Ставка удалена!")
      setTimeout(() => setMsg(""), 3000)
    } catch (e: any) { alert(e.message) }
  }

  const handleUpdateLevel = async (userId: string, levelId: string) => {
    try {
      await api("/admin/users/level", { method: "POST", body: JSON.stringify({ userId, levelId }) })
      loadData("users")
      // Обновляем выбранного пользователя вручную, чтобы увидеть изменения мгновенно
      setSelectedUser((prev: any) => prev ? {
        ...prev,
        user: { ...prev.user, levelId }
      } : null)
      setMsg("Уровень обновлен!")
      setTimeout(() => setMsg(""), 3000)
    } catch (e: any) { alert(e.message) }
  }

  const handleResolveReport = async (id: string) => {
    try {
      await api(`/admin/reports/${id}/resolve`, { method: "POST" })
      loadData("reports")
    } catch (e: any) { alert(e.message) }
  }

  const handleCreateEventPromo = async (e: any) => {
    e.preventDefault()
    try {
      await api("/admin/promos", {
        method: "POST",
        body: JSON.stringify({
          code: promoCode,
          type: "event",
          rewardAmount: Number(promoReward),
          maxActivations: Number(promoLimit)
        })
      })
      setPromoCode("")
      setMsg("Промокод создан!")
      loadData("promos")
      setTimeout(() => setMsg(""), 3000)
    } catch (e: any) { alert(e.message) }
  }

  const handleDisablePromo = async (code: string, disabled: boolean) => {
    try {
      await api("/admin/promos/disable", {
        method: "POST",
        body: JSON.stringify({ code, disabled })
      })
      loadData("promos")
    } catch (e: any) { alert(e.message) }
  }

  const handleUpdateOrderStatus = async (orderId: string, status: string) => {
    try {
      await api(`/orders/${orderId}/complete`, {
        method: "POST",
        body: JSON.stringify({ status })
      })
      loadData("orders")
      setMsg("Заказ обновлен!")
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

  const sidebarLinks = [
    { id: "posts", name: "Лента (Посты)" },
    { id: "matches", name: "Матчи (Ставки)" },
    { id: "users", name: "Пользователи" },
    { id: "quests", name: "Квесты" },
    { id: "reports", name: "Репорты / Тикеты" },
    { id: "chat", name: "Админ-чат 💬" },
    { id: "about", name: "О нас" },
    { id: "schedule", name: "РАСПИСАНИЕ" },
    { id: "rewards", name: "Награды" },
    { id: "orders", name: "Заказы" },
    { id: "promos", name: "Промокоды 🎁" },
  ]

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
        <div className="w-full md:w-64 bg-black/20 border-r border-white/5 p-2">
          <div className="md:hidden">
            <select
              value={activeTab}
              onChange={(e) => setActiveTab(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-[11px] font-black uppercase tracking-widest outline-none focus:border-neon"
            >
              {sidebarLinks.map((l) => (
                <option key={l.id} value={l.id}>{l.name}</option>
              ))}
            </select>
          </div>

          <div className="hidden md:flex md:flex-col gap-1">
            {sidebarLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => setActiveTab(link.id)}
                className={`whitespace-nowrap md:whitespace-normal text-left p-3 rounded text-xs md:text-sm transition-all ${activeTab === link.id ? "bg-neon text-black font-bold shadow-neon" : "hover:bg-white/5 text-white/60"}`}
              >
                {link.name}
              </button>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-4 md:p-6 overflow-y-auto max-h-[1000px] md:max-h-[800px]">
          {activeTab === "posts" && (
            <div className="space-y-8">
              <form onSubmit={handleCreatePost} className="space-y-4 max-w-xl glass p-4 rounded-lg">
                <h2 className="text-lg font-bold text-neon uppercase">Новый пост</h2>
                <input required value={postTitle} onChange={e=>setPostTitle(e.target.value)} className="w-full p-2 rounded bg-white/5 border border-white/10 text-sm outline-none focus:border-neon" placeholder="Заголовок..." />
                <textarea required value={postContent} onChange={e=>setPostContent(e.target.value)} rows={3} className="w-full p-2 rounded bg-white/5 border border-white/10 text-sm outline-none focus:border-neon" placeholder="Текст..." />
                <div className="space-y-1">
                  <label className="text-[10px] text-white/30 uppercase font-black ml-1">Ссылка на фото (URL)</label>
                  <input value={postImage} onChange={e=>setPostImage(e.target.value)} className="w-full p-2 rounded bg-white/5 border border-white/10 text-sm outline-none focus:border-neon" placeholder="https://..." />
                </div>
                <button className="btn btn-primary w-full py-2 uppercase font-black text-xs">Опубликовать</button>
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
            <div className="space-y-10">
              <form onSubmit={handleCreateMatch} className="space-y-4 max-w-xl glass p-4 rounded-lg">
                <h2 className="text-lg font-bold text-neon uppercase">Добавить новый матч</h2>
                <input required value={matchName} onChange={e=>setMatchName(e.target.value)} className="w-full p-2 rounded bg-white/5 border border-white/10 text-sm outline-none focus:border-neon" placeholder="Название турнира / матча..." />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] text-white/30 uppercase font-black ml-1">Команда 1</label>
                    <input required value={team1} onChange={e=>setTeam1(e.target.value)} className="w-full p-2 rounded bg-white/5 border border-white/10 text-sm outline-none focus:border-neon" placeholder="Название..." />
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-white/30 uppercase font-black">Коэф:</span>
                      <input required type="number" step="0.1" value={odds1} onChange={e=>setOdds1(e.target.value)} className="w-20 p-1.5 rounded bg-white/5 border border-white/10 text-xs text-neon font-mono" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] text-white/30 uppercase font-black ml-1">Команда 2</label>
                    <input required value={team2} onChange={e=>setTeam2(e.target.value)} className="w-full p-2 rounded bg-white/5 border border-white/10 text-sm outline-none focus:border-neon" placeholder="Название..." />
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-white/30 uppercase font-black">Коэф:</span>
                      <input required type="number" step="0.1" value={odds2} onChange={e=>setOdds2(e.target.value)} className="w-20 p-1.5 rounded bg-white/5 border border-white/10 text-xs text-neon font-mono" />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] text-white/30 uppercase font-black ml-1">Дедлайн (до когда ставки)</label>
                  <input required type="datetime-local" value={deadline} onChange={e=>setDeadline(e.target.value)} className="w-full p-2 rounded bg-white/5 border border-white/10 text-sm outline-none focus:border-neon" />
                </div>
                
                <button className="btn btn-primary w-full py-3 uppercase font-black text-xs shadow-neon">Создать матч</button>
              </form>

              <div className="space-y-4">
                <h2 className="text-lg font-bold text-white uppercase tracking-widest">Управление матчами</h2>
                <div className="grid gap-4">
                  {matchesList.map(m => (
                    <div key={m.id} className={`glass p-5 rounded-xl border ${m.status === 'settled' ? 'border-white/5 opacity-60' : 'border-white/10'}`}>
                      <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-1">
                            <span className="text-lg font-black text-white italic">{m.name}</span>
                            <span className={`text-[8px] px-2 py-0.5 rounded font-black uppercase ${m.status === 'open' ? 'bg-neon text-black' : m.status === 'closed' ? 'bg-yellow-500 text-black' : 'bg-white/10 text-white/40'}`}>
                              {m.status === 'open' ? 'Открыт' : m.status === 'closed' ? 'Закрыт' : 'Рассчитан'}
                            </span>
                          </div>
                          <div className="text-[10px] text-white/30 font-mono uppercase tracking-widest">Дедлайн: {new Date(m.deadline).toLocaleString()}</div>
                          
                          <div className="grid grid-cols-2 gap-4 mt-4">
                            {m.options.map((opt: any) => (
                              <div key={opt.id} className={`p-3 rounded-lg border flex flex-col items-center gap-1 ${m.resultOptionId === opt.id ? 'bg-neon/20 border-neon' : 'bg-white/5 border-white/5'}`}>
                                <span className="text-xs font-bold text-white/80">{opt.name}</span>
                                <span className="text-neon font-mono font-black italic text-sm">x{opt.odds}</span>
                                {m.status !== 'settled' && (
                                  <button 
                                    onClick={() => handleSettleMatch(m.id, opt.id)}
                                    className="mt-2 w-full py-1.5 rounded bg-neon text-black text-[9px] font-black uppercase tracking-tighter hover:scale-105 transition-all shadow-neon"
                                  >
                                    Выбрать победителем
                                  </button>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        <div className="flex flex-col gap-2">
                          <button 
                            onClick={() => handleDeleteMatch(m.id)}
                            className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500 hover:text-white transition-all group"
                            title="Удалить матч"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {matchesList.length === 0 && <div className="text-center py-10 text-white/20 italic uppercase tracking-widest text-xs">Матчей пока нет</div>}
                </div>
              </div>
            </div>
          )}

          {activeTab === "users" && (
            <div className="grid lg:grid-cols-2 gap-6">
              <div className="space-y-2">
                <h2 className="text-lg font-bold text-neon uppercase">Пользователи</h2>
                <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
                  {usersList.map(u => (
                    <div key={u.id} onClick={() => viewUser(u.id)} className={`flex items-center justify-between p-3 rounded border transition-colors cursor-pointer ${selectedUser?.user?.id === u.id ? "bg-neon/10 border-neon" : "bg-white/5 border-white/10 hover:border-white/20"}`}>
                      <div className="text-sm">
                        <div className="font-bold flex items-center gap-2">
                          {u.username} 
                          {u.role === 'admin' && <span className="text-[8px] bg-acid text-black px-1 rounded">ADM</span>}
                          {u.role === 'moderator' && <span className="text-[8px] bg-neon text-black px-1 rounded">MOD</span>}
                          {u.isBanned && <span className="text-[8px] bg-red-500 text-white px-1 rounded">BAN</span>}
                        </div>
                        <div className="text-[10px] text-white/40 truncate max-w-[150px]">{u.email}</div>
                      </div>
                      <div className="text-xs font-mono text-acid">{u.balance} 🪙</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="glass p-4 rounded-lg min-h-[400px]">
                {selectedUser ? (
                  <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                    <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                      <div>
                        <h3 className="text-xl font-bold text-neon">{selectedUser.user.username}</h3>
                        <div className="text-[10px] text-white/40 font-mono">ID: {selectedUser.user.id}</div>
                      </div>
                      <button onClick={() => handleBanUser(selectedUser.user.id, !selectedUser.user.isBanned)} 
                        className={`w-full md:w-auto px-4 py-2 rounded text-[10px] font-bold uppercase transition-all ${selectedUser.user.isBanned ? "bg-green-500 text-black hover:bg-green-400" : "bg-red-500 text-white hover:bg-red-400"}`}>
                        {selectedUser.user.isBanned ? "Разбанить" : "Забанить пользователя"}
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <div className="p-3 bg-black/20 rounded border border-white/5 text-center">
                        <div className="text-[10px] text-white/40 uppercase">Баланс</div>
                        <div className="text-lg font-black text-acid">{selectedUser.user.balance}</div>
                      </div>
                      <div className="p-3 bg-black/20 rounded border border-white/5 text-center">
                        <div className="text-[10px] text-white/40 uppercase">Роль</div>
                        <div className="text-lg font-black uppercase text-white">{selectedUser.user.role}</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-xs font-bold text-white/40 uppercase mb-2">Ставки пользователя</h4>
                        <div className="space-y-1 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                          {selectedUser.bets.map((b:any) => (
                            <div key={b.id} className="text-[10px] p-2 rounded bg-white/5 flex justify-between items-center border-l-2 border-blue-500/30">
                              <div>
                                <div className="text-white/80">{b.matchName || "Ставка"}</div>
                                <div className="text-white/40 italic">{b.optionName} x{b.odds}</div>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-acid">{b.amount} 🪙</span>
                                <button onClick={() => handleDeleteBet(b.id)} className="text-red-400 hover:text-red-300 ml-2" title="Удалить ставку">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                  </svg>
                                </button>
                              </div>
                            </div>
                          ))}
                          {selectedUser.bets.length === 0 && <div className="text-[10px] text-white/20 italic">Ставок нет</div>}
                        </div>
                      </div>

                      <div>
                        <h4 className="text-xs font-bold text-white/40 uppercase mb-2">Логи транзакций</h4>
                        <div className="space-y-1 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                          {selectedUser.logs.map((l:any) => (
                            <div key={l.id} className="text-[10px] p-2 rounded bg-white/5 flex justify-between border-l-2 border-neon/30">
                              <span className="text-white/60 truncate mr-2">{l.note}</span>
                              <span className={l.amount > 0 ? "text-green-400 font-bold" : "text-red-400 font-bold"}>
                                {l.amount > 0 ? "+" : ""}{l.amount}
                              </span>
                            </div>
                          ))}
                          {selectedUser.logs.length === 0 && <div className="text-[10px] text-white/20 italic">Логов нет</div>}
                        </div>
                      </div>
                    </div>

                    {!isOnlyModerator && (
                      <div className="pt-4 border-t border-white/10 space-y-4">
                         <h4 className="text-xs font-bold text-white/40 uppercase mb-2">Админ-действия</h4>
                         
                         <div className="space-y-2">
                           <label className="text-[9px] text-white/30 uppercase font-black">Выдать Уровень</label>
                           <div className="flex flex-wrap gap-1">
                             {levelsList.map((lvl: any) => (
                               <button 
                                 key={lvl.id}
                                 onClick={() => handleUpdateLevel(selectedUser.user.id, lvl.id)}
                                 className={`px-2 py-1 rounded text-[9px] font-black uppercase transition-all ${selectedUser.user.levelId === lvl.id ? "bg-acid text-black" : "bg-white/5 text-white/40 hover:bg-white/10"}`}
                               >
                                 {lvl.name}
                               </button>
                             ))}
                             {levelsList.length === 0 && <span className="text-[9px] text-red-400">Уровни не загружены. Обновите страницу.</span>}
                           </div>
                         </div>

                         <div className="grid grid-cols-2 gap-2">
                           <button onClick={()=>handleUpdateBalance(selectedUser.user.id, 100)} className="py-2 rounded bg-white/5 border border-white/10 text-[10px] uppercase font-bold hover:bg-white/10 hover:text-neon transition-all">+100</button>
                           <button onClick={()=>handleUpdateBalance(selectedUser.user.id, -100)} className="py-2 rounded bg-white/5 border border-white/10 text-[10px] uppercase font-bold hover:bg-white/10 hover:text-red-400 transition-all">-100</button>
                         </div>
                         <div className="grid grid-cols-2 gap-2">
                           <button onClick={()=>handleUpdateRole(selectedUser.user.id, selectedUser.user.role === 'admin' ? 'user' : 'admin')} className={`py-2 rounded border text-[10px] uppercase font-bold transition-all ${selectedUser.user.role === 'admin' ? 'bg-red-500/20 border-red-500/30 text-red-400' : 'bg-acid/20 border-acid/30 text-acid hover:bg-acid hover:text-black'}`}>
                             {selectedUser.user.role === 'admin' ? 'Снять админ' : 'Дать админ'}
                           </button>
                           <button onClick={()=>handleUpdateRole(selectedUser.user.id, selectedUser.user.role === 'moderator' ? 'user' : 'moderator')} className={`py-2 rounded border text-[10px] uppercase font-bold transition-all ${selectedUser.user.role === 'moderator' ? 'bg-red-500/20 border-red-500/30 text-red-400' : 'bg-neon/20 border-neon/30 text-neon hover:bg-neon hover:text-black'}`}>
                             {selectedUser.user.role === 'moderator' ? 'Снять модер' : 'Дать модер'}
                           </button>
                         </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-white/20 text-sm italic space-y-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 opacity-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span>Выберите пользователя для управления</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "reports" && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-neon uppercase">Тикеты / Репорты</h2>
              <div className="grid gap-3">
                {reportsList.map(r => (
                  <div key={r.id} className={`p-4 rounded border transition-all ${r.status === 'pending' ? 'bg-red-500/5 border-red-500/20' : 'bg-white/5 border-white/10 opacity-60'}`}>
                    <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white">{r.title}</span>
                          <span className={`text-[8px] px-1.5 py-0.5 rounded font-black uppercase ${r.status === 'pending' ? 'bg-red-500 text-white' : 'bg-green-500 text-black'}`}>
                            {r.status === 'pending' ? 'Новый' : 'Решено'}
                          </span>
                        </div>
                        <div className="text-[10px] text-white/40">От: {r.username} • {new Date(r.createdAt).toLocaleString()}</div>
                        <p className="text-sm text-white/70 bg-black/30 p-3 rounded mt-2 italic">"{r.content}"</p>
                      </div>
                      {r.status === 'pending' && (
                        <button onClick={() => handleResolveReport(r.id)} className="w-full md:w-auto btn btn-primary px-4 py-2 text-[10px] uppercase font-black">
                          Закрыть тикет
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                {reportsList.length === 0 && <div className="text-center py-20 text-white/20 uppercase tracking-widest font-bold italic">Тикетов нет</div>}
              </div>
            </div>
          )}

          {activeTab === "quests" && (
            <div className="space-y-8">
              <form onSubmit={handleCreateQuest} className="space-y-4 max-w-xl glass p-4 rounded-lg">
                <h2 className="text-lg font-bold text-neon uppercase">Создать новый квест</h2>
                <input required value={questName} onChange={e=>setQuestName(e.target.value)} className="w-full p-2 rounded bg-white/5 border border-white/10 text-sm outline-none focus:border-neon" placeholder="Название квеста (например, Подписка на ТГ)..." />
                <div className="space-y-1">
                  <label className="text-[10px] text-white/30 uppercase font-black ml-1">Награда (🪙)</label>
                  <input required type="number" value={questReward} onChange={e=>setQuestReward(e.target.value)} className="w-full p-2 rounded bg-white/5 border border-white/10 text-sm outline-none focus:border-neon font-mono text-acid" />
                </div>
                <button className="btn btn-primary w-full py-2 uppercase font-black text-xs shadow-neon">Добавить квест</button>
              </form>

              <div className="space-y-4">
                <h2 className="text-lg font-bold text-white uppercase tracking-widest">Активные квесты</h2>
                <div className="grid gap-2">
                  {questsList.map(q => (
                    <div key={q.id} className="flex items-center justify-between p-4 rounded bg-white/5 border border-white/10 group">
                      <div>
                        <div className="font-bold text-white group-hover:text-neon transition-colors">{q.name}</div>
                        <div className="text-xs text-acid font-mono">Награда: {q.reward} 🪙</div>
                      </div>
                      <button onClick={() => handleDeleteQuest(q.id)} className="text-red-400 hover:text-red-300 text-[10px] uppercase font-bold border border-red-500/20 px-2 py-1 rounded bg-red-500/5 hover:bg-red-500/20 transition-all">Удалить</button>
                    </div>
                  ))}
                  {questsList.length === 0 && <div className="text-center py-10 text-white/20 italic">Квестов пока нет</div>}
                </div>
              </div>
            </div>
          )}

          {activeTab === "chat" && (
            <div className="flex flex-col h-[600px] glass rounded-lg overflow-hidden border border-white/10">
              <div className="bg-white/5 p-3 border-b border-white/10 flex justify-between items-center">
                <span className="text-[10px] font-black uppercase tracking-widest text-white/60">Внутренний канал персонала</span>
                <div className="flex gap-1">
                  <div className="w-2 h-2 rounded-full bg-neon animate-pulse"></div>
                  <div className="w-2 h-2 rounded-full bg-acid animate-pulse delay-75"></div>
                </div>
              </div>
              <div className="flex-1 p-4 space-y-4 overflow-y-auto custom-scrollbar bg-black/40">
                {chatMessages.map(m => (
                  <div key={m.id} className={`max-w-[85%] ${m.username === user.username ? "ml-auto" : ""}`}>
                    <div className={`flex items-center gap-2 mb-1 ${m.username === user.username ? "justify-end" : ""}`}>
                      <span className={`text-[10px] font-black uppercase ${m.role === 'admin' ? 'text-acid' : 'text-neon'}`}>{m.username}</span>
                      <span className="text-[8px] text-white/30">{new Date(m.createdAt).toLocaleTimeString()}</span>
                    </div>
                    <div className={`p-3 rounded-2xl text-sm ${m.username === user.username ? "bg-neon/20 border border-neon/30 rounded-tr-none text-white" : "bg-white/5 border border-white/10 rounded-tl-none text-white/80"}`}>
                      {m.message}
                    </div>
                  </div>
                ))}
              </div>
              <form onSubmit={sendChatMessage} className="p-3 bg-white/5 border-t border-white/10 flex gap-2">
                <input value={chatInput} onChange={e=>setChatInput(e.target.value)} className="flex-1 p-3 rounded-xl bg-black/40 border border-white/10 text-sm outline-none focus:border-neon transition-all" placeholder="Написать коллегам..." />
                <button className="bg-neon text-black p-3 rounded-xl hover:scale-105 active:scale-95 transition-all shadow-neon">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                  </svg>
                </button>
              </form>
            </div>
          )}

          {activeTab === "about" && (
            <form onSubmit={handleSaveAbout} className="space-y-4 max-w-xl glass p-4 rounded-lg">
              <h2 className="text-lg font-bold text-neon uppercase">Редактировать "О нас"</h2>
              <div className="p-3 bg-acid/10 border border-acid/20 rounded text-[10px] text-acid uppercase font-bold">Поддерживается HTML разметка</div>
              <textarea rows={10} value={aboutHtml} onChange={e=>setAboutHtml(e.target.value)} className="w-full p-3 rounded bg-black/40 border border-white/10 text-xs font-mono outline-none focus:border-neon" />
              <div className="space-y-2">
                <label className="block text-xs font-black text-white/40 uppercase">Социальные сети (Ссылки)</label>
                {Object.keys(aboutLinks).map(k => (
                  <div key={k} className="flex items-center gap-3 bg-white/5 p-2 rounded border border-white/5">
                    <span className="text-[10px] w-20 text-neon font-black uppercase">{k}</span>
                    <input value={(aboutLinks as any)[k]} onChange={e=>setAboutLinks({...aboutLinks, [k]: e.target.value})} className="flex-1 p-1.5 rounded bg-black/40 border border-white/10 text-xs outline-none focus:border-neon" />
                  </div>
                ))}
              </div>
              <button className="btn btn-primary w-full py-3 uppercase font-black text-xs shadow-neon">Сохранить изменения</button>
            </form>
          )}

          {activeTab === "schedule" && (
            <form onSubmit={handleSaveSchedule} className="space-y-4 max-w-xl glass p-4 rounded-lg">
              <h2 className="text-lg font-bold text-neon uppercase">Редактировать "РАСПИСАНИЕ"</h2>
              <div className="p-3 bg-acid/10 border border-acid/20 rounded text-[10px] text-acid uppercase font-bold">Поддерживается HTML разметка</div>
              <textarea rows={10} value={scheduleHtml} onChange={e=>setScheduleHtml(e.target.value)} className="w-full p-3 rounded bg-black/40 border border-white/10 text-xs font-mono outline-none focus:border-neon" />
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black text-white/40 uppercase tracking-widest">Стримы</h3>
                  <button type="button" onClick={() => setStreams([...streams, { id: Date.now(), title: "", time: "", link: "" }])} className="text-[10px] bg-neon text-black px-2 py-1 rounded font-black uppercase tracking-tighter shadow-neon">Добавить</button>
                </div>
                {streams.map((s, idx) => (
                  <div key={s.id || idx} className="p-3 bg-white/5 rounded border border-white/5 space-y-2 relative">
                    <button type="button" onClick={() => setStreams(streams.filter((_, i) => i !== idx))} className="absolute top-2 right-2 text-red-400">×</button>
                    <input value={s.title} onChange={e => {
                      const newStreams = [...streams];
                      newStreams[idx].title = e.target.value;
                      setStreams(newStreams);
                    }} className="w-full bg-black/40 border border-white/10 rounded px-3 py-2 text-xs" placeholder="Название стрима" />
                    <div className="grid grid-cols-2 gap-2">
                      <input value={s.time} onChange={e => {
                        const newStreams = [...streams];
                        newStreams[idx].time = e.target.value;
                        setStreams(newStreams);
                      }} className="bg-black/40 border border-white/10 rounded px-3 py-2 text-xs" placeholder="Время (напр. 18:00)" />
                      <input value={s.link} onChange={e => {
                        const newStreams = [...streams];
                        newStreams[idx].link = e.target.value;
                        setStreams(newStreams);
                      }} className="bg-black/40 border border-white/10 rounded px-3 py-2 text-xs" placeholder="Ссылка (URL)" />
                    </div>
                  </div>
                ))}
              </div>
              <button className="btn btn-primary w-full py-3 uppercase font-black text-xs shadow-neon">Сохранить расписание</button>
            </form>
          )}

          {activeTab === "rewards" && (
            <div className="space-y-6 max-w-xl">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-neon uppercase">Управление Наградами</h2>
                <button onClick={() => setRewardsList([...rewardsList, { id: Date.now().toString(), name: "Новая награда", price: 0, imageUrl: "" }])} className="btn btn-primary px-4 py-2 text-[10px] font-black uppercase italic">Добавить Награду</button>
              </div>
              
              <div className="grid gap-3">
                {rewardsList.map((r, idx) => (
                  <div key={r.id || idx} className="glass p-4 rounded-xl border border-white/5 space-y-3 relative group">
                    <button onClick={() => setRewardsList(rewardsList.filter((_, i) => i !== idx))} className="absolute top-2 right-2 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">Удалить</button>
                    <input value={r.name} onChange={e => {
                      const newList = [...rewardsList];
                      newList[idx].name = e.target.value;
                      setRewardsList(newList);
                    }} className="w-full bg-black/40 border border-white/10 rounded px-3 py-2 text-sm font-bold" placeholder="Название награды" />
                    <input value={r.imageUrl} onChange={e => {
                      const newList = [...rewardsList];
                      newList[idx].imageUrl = e.target.value;
                      setRewardsList(newList);
                    }} className="w-full bg-black/40 border border-white/10 rounded px-3 py-2 text-[10px] font-mono" placeholder="Ссылка на изображение (URL)" />
                    <div className="flex items-center gap-3">
                      <div className="flex-1">
                        <label className="text-[9px] text-white/20 uppercase font-black ml-1 mb-1 block">Стоимость (🪙)</label>
                        <input type="number" value={r.price} onChange={e => {
                          const newList = [...rewardsList];
                          newList[idx].price = Number(e.target.value);
                          setRewardsList(newList);
                        }} className="w-full bg-black/40 border border-white/10 rounded px-3 py-2 text-sm text-acid font-mono" />
                      </div>
                      <div className="flex-1">
                        <label className="text-[9px] text-white/20 uppercase font-black ml-1 mb-1 block">ID Награды</label>
                        <input value={r.id} readOnly className="w-full bg-black/10 border border-white/5 rounded px-3 py-2 text-[10px] text-white/30 font-mono" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <button onClick={handleSaveRewards} className="btn btn-primary w-full py-3 uppercase font-black text-xs shadow-neon">Сохранить все награды</button>
            </div>
          )}

          {activeTab === "orders" && (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-neon uppercase">Заказы</h2>
                  <div className="text-[10px] text-white/30 uppercase font-bold tracking-widest">Магазин + ежедневные награды</div>
                </div>
                <button onClick={() => loadData("orders")} className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-white/50 hover:text-white hover:border-neon/40 transition-all">
                  Обновить
                </button>
              </div>

              <div className="grid gap-3">
                {ordersList
                  .slice()
                  .sort((a, b) => String(b.createdAt || "").localeCompare(String(a.createdAt || "")))
                  .map((o: any) => (
                    <div key={o.id} className="glass p-4 rounded-2xl border border-white/5">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <div className="text-sm font-black text-white uppercase tracking-tight">
                              {o.rewardName || "Заказ"}
                            </div>
                            <span className={`text-[9px] px-2 py-1 rounded-full font-black uppercase tracking-widest ${
                              String(o.status).toLowerCase() === "pending" ? "bg-yellow-500/20 text-yellow-300 border border-yellow-500/20" :
                              String(o.status).toLowerCase() === "completed" ? "bg-neon/15 text-neon border border-neon/20" :
                              "bg-red-500/10 text-red-300 border border-red-500/20"
                            }`}>
                              {o.status}
                            </span>
                          </div>
                          <div className="text-[10px] text-white/30 font-mono">
                            {o.username ? `${o.username} • ` : ""}{o.createdAt ? new Date(o.createdAt).toLocaleString() : ""}
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-2">
                          <button
                            onClick={async () => {
                              try {
                                await navigator.clipboard.writeText(String(o.tradeLink || ""))
                                setMsg("Trade Link скопирован")
                                setTimeout(() => setMsg(""), 2000)
                              } catch {
                                alert("Не удалось скопировать")
                              }
                            }}
                            className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-white/50 hover:text-white hover:border-white/20 transition-all"
                          >
                            Copy Trade Link
                          </button>
                          <button
                            onClick={() => handleUpdateOrderStatus(o.id, "Completed")}
                            className="px-4 py-2 rounded-xl bg-neon text-black text-[10px] font-black uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-neon"
                          >
                            Выполнено
                          </button>
                          <button
                            onClick={() => handleUpdateOrderStatus(o.id, "Rejected")}
                            className="px-4 py-2 rounded-xl bg-red-500/15 border border-red-500/25 text-red-300 text-[10px] font-black uppercase tracking-widest hover:bg-red-500/25 transition-all"
                          >
                            Отклонить
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}

                {ordersList.length === 0 && (
                  <div className="text-center py-20 text-white/20 uppercase tracking-widest font-black">
                    Заказов пока нет
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "promos" && (
            <div className="space-y-10">
              <form onSubmit={handleCreateEventPromo} className="space-y-4 max-w-xl glass p-4 rounded-lg">
                <h2 className="text-lg font-bold text-neon uppercase">Создать Ивент-Промокод</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] text-white/30 uppercase font-black ml-1">Код</label>
                    <input required value={promoCode} onChange={e=>setPromoCode(e.target.value.toUpperCase())} className="w-full p-2 rounded bg-white/5 border border-white/10 text-sm font-mono text-neon outline-none focus:border-neon" placeholder="SPRING2024" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] text-white/30 uppercase font-black ml-1">Награда (🪙)</label>
                    <input required type="number" value={promoReward} onChange={e=>setPromoReward(e.target.value)} className="w-full p-2 rounded bg-white/5 border border-white/10 text-sm font-mono text-acid outline-none focus:border-neon" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] text-white/30 uppercase font-black ml-1">Лимит активаций</label>
                  <input required type="number" value={promoLimit} onChange={e=>setPromoLimit(e.target.value)} className="w-full p-2 rounded bg-white/5 border border-white/10 text-sm outline-none focus:border-neon" />
                </div>
                <button className="btn btn-primary w-full py-3 uppercase font-black text-xs shadow-neon">Создать ивент-код</button>
              </form>

              <div className="space-y-4">
                <h2 className="text-lg font-bold text-white uppercase tracking-widest">Список промокодов</h2>
                <div className="grid gap-3">
                  {promosList.map((p: any) => (
                    <div key={p.code} className={`glass p-4 rounded-xl border flex flex-col md:flex-row justify-between items-center gap-4 ${p.disabled ? 'opacity-40 border-white/5' : 'border-white/10'}`}>
                      <div className="flex items-center gap-4">
                        <div className="text-xl font-black italic text-white">{p.code}</div>
                        <div className="flex flex-col">
                          <span className={`text-[8px] px-1.5 py-0.5 rounded font-black uppercase w-fit ${p.type === 'referral' ? 'bg-blue-500 text-white' : 'bg-purple-500 text-white'}`}>
                            {p.type === 'referral' ? 'Реферал' : 'Ивент'}
                          </span>
                          <span className="text-[10px] text-white/40 mt-1">
                            {p.type === 'event' ? `Награда: ${p.rewardAmount} 🪙 | Лимит: ${p.activations}/${p.maxActivations}` : `Активаций: ${p.activations}`}
                          </span>
                        </div>
                      </div>
                      <button 
                        onClick={() => handleDisablePromo(p.code, !p.disabled)}
                        className={`px-4 py-2 rounded text-[10px] font-black uppercase transition-all ${p.disabled ? "bg-neon text-black" : "bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500 hover:text-white"}`}
                      >
                        {p.disabled ? "Включить" : "Отключить"}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
