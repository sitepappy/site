"use client"
import { useEffect, useState } from "react"
import { api } from "../../lib/api"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function AdminPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("dashboard")
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [stats, setStats] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [logs, setLogs] = useState<any[]>([])
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
  const [reportReplies, setReportReplies] = useState<Record<string, string>>({})
  const [reportPromoCodes, setReportPromoCodes] = useState<Record<string, string>>({})
  const [balanceDelta, setBalanceDelta] = useState("")
  const [reportsView, setReportsView] = useState<"active" | "history">("active")
  const [ticketBalanceAmount, setTicketBalanceAmount] = useState<Record<string, string>>({})
  const [ticketBalanceNote, setTicketBalanceNote] = useState<Record<string, string>>({})

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
  const [antifraudList, setAntifraudList] = useState<any[]>([])
  const [applicationForms, setApplicationForms] = useState<any[]>([])
  const [applications, setApplications] = useState<any[]>([])
  const [settings, setSettings] = useState<any>({ cs2ThemesEnabled: true })
  const [newFormFields, setNewFormFields] = useState<{label: string, type: string}[]>([
    { label: "Ваш Discord/TG", type: "text" },
    { label: "Почему мы должны выбрать вас?", type: "textarea" }
  ])
  const [orderMessages, setOrderMessages] = useState<Record<string, string>>({})
  const [orderStatusDraft, setOrderStatusDraft] = useState<Record<string, string>>({})

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
      if (tab === "dashboard") {
        const [statsData, logsData, settingsData] = await Promise.all([
          api("/admin/stats"),
          api("/admin/logs"),
          api("/admin/settings")
        ])
        setStats(statsData)
        setLogs(logsData)
        setSettings(settingsData)
      } else if (tab === "users") {
        const usersData = await api("/admin/users")
        setUsersList(usersData)
        const levelsData = await api("/levels")
        setLevelsList(levelsData)
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
      } else if (tab === "antifraud") {
        const data = await api("/admin/antifraud")
        setAntifraudList(data)
      } else if (tab === "applications") {
        const [formsData, appsData] = await Promise.all([
          api("/admin/forms"),
          api("/admin/applications")
        ])
        setApplicationForms(formsData)
        setApplications(appsData)
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

  const handleUpdateRole = async (userId: string, role: string) => {
    try {
      await api("/admin/users/role", { method: "POST", body: JSON.stringify({ userId, role }) })
      loadData("users")
      if (selectedUser?.user?.id === userId) {
        setSelectedUser((prev: any) => ({
          ...prev,
          user: { ...prev.user, role }
        }))
      }
      setMsg(`Роль изменена на ${role}`)
      setTimeout(() => setMsg(""), 3000)
    } catch (e: any) { alert(e.message) }
  }

  const handleResolveReport = async (id: string) => {
    try {
      await api(`/admin/reports/${id}/resolve`, { method: "POST" })
      loadData("reports")
    } catch (e: any) { alert(e.message) }
  }

  const handleReplyReport = async (id: string) => {
    try {
      const message = String(reportReplies[id] || "").trim()
      if (!message) return alert("Пустой ответ")
      await api(`/admin/reports/${id}/reply`, { method: "POST", body: JSON.stringify({ message, status: "in_progress" }) })
      setReportReplies(prev => ({ ...prev, [id]: "" }))
      loadData("reports")
      setMsg("Ответ отправлен!")
      setTimeout(() => setMsg(""), 3000)
    } catch (e: any) { alert(e.message) }
  }

  const handleManualReferralCredit = async (id: string) => {
    try {
      const code = String(reportPromoCodes[id] || "").trim()
      if (!code) return alert("Введите промокод")
      await api(`/admin/reports/${id}/referral-credit`, { method: "POST", body: JSON.stringify({ code }) })
      await api(`/admin/reports/${id}/reply`, { method: "POST", body: JSON.stringify({ message: "Бонус по промокоду начислен. Проверьте баланс.", status: "in_progress" }) })
      loadData("reports")
      setMsg("Бонус начислен!")
      setTimeout(() => setMsg(""), 3000)
    } catch (e: any) { alert(e.message) }
  }

  const handleTicketBalance = async (r: any, sign: 1 | -1) => {
    try {
      const amount = Math.floor(Number(ticketBalanceAmount[r.id]))
      if (!Number.isFinite(amount) || amount <= 0) return alert("Введите сумму > 0")
      const delta = amount * sign
      await api("/admin/users/balance", { method: "POST", body: JSON.stringify({ userId: r.userId, delta }) })
      const note = String(ticketBalanceNote[r.id] || "").trim()
      const text = `${delta > 0 ? "Баланс пополнен" : "Баланс списан"} на ${Math.abs(delta)} 🪙.${note ? ` Причина: ${note}` : ""}`
      await api(`/admin/reports/${r.id}/reply`, { method: "POST", body: JSON.stringify({ message: text, status: "in_progress" }) })
      setTicketBalanceAmount(prev => ({ ...prev, [r.id]: "" }))
      setTicketBalanceNote(prev => ({ ...prev, [r.id]: "" }))
      loadData("reports")
      setMsg("Баланс изменён!")
      setTimeout(() => setMsg(""), 3000)
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

  const handleUpdateOrderStatus = async (orderId: string, status: string, message?: string) => {
    try {
      await api(`/orders/${orderId}/complete`, {
        method: "POST",
        body: JSON.stringify({ status, message })
      })
      loadData("orders")
      setMsg("Заказ обновлен!")
      setTimeout(() => setMsg(""), 3000)
    } catch (e: any) { alert(e.message) }
  }

  const handleResolveAntifraud = async (alertId: string, action: "ban" | "ignore") => {
    try {
      await api(`/admin/antifraud/${alertId}/resolve`, { method: "POST", body: JSON.stringify({ action }) })
      loadData("antifraud")
      setMsg(action === "ban" ? "Пользователь заблокирован" : "Алерт проигнорирован")
      setTimeout(() => setMsg(""), 3000)
    } catch (e: any) { alert(e.message) }
  }

  const handleUpdateBalance = async (userId: string, delta: number) => {
    try {
      await api("/admin/users/balance", { method: "POST", body: JSON.stringify({ userId, delta }) })
      loadData("users")
      if (selectedUser?.user?.id === userId) viewUser(userId)
    } catch (e: any) { alert(e.message) }
  }

  if (loading) return (
    <div className="p-10 text-center text-neon animate-pulse uppercase font-bold tracking-widest">Инициализация протоколов доступа...</div>
  );

  const isOnlyModerator = user?.role === "moderator"

  const sidebarLinks = [
    { id: "dashboard", name: "Дашборд", icon: "📊" },
    { id: "antifraud", name: "АНТИФРОД", icon: "🛡️" },
    { id: "applications", name: "ЗАЯВКИ", icon: "📄" },
    { id: "posts", name: "Лента", icon: "📝" },
    { id: "matches", name: "Матчи", icon: "🎮" },
    { id: "users", name: "Пользователи", icon: "👥" },
    { id: "reports", name: "Тикеты", icon: "🎫" },
    { id: "chat", name: "Админ-чат", icon: "💬" },
    { id: "orders", name: "Заказы", icon: "🛒" },
    { id: "promos", name: "Промокоды", icon: "🎁" },
    { id: "quests", name: "Квесты", icon: "🎯" },
    { id: "rewards", name: "Награды", icon: "🏆" },
    { id: "about", name: "О нас", icon: "ℹ️" },
    { id: "schedule", name: "Расписание", icon: "📅" },
  ]

  return (<div className="min-h-screen text-white font-sans selection:bg-neon/30 selection:text-neon">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 glass sticky top-0 z-50 border-b border-white/10">
        <h1 className="text-lg font-black text-acid uppercase tracking-tighter">ADMIN PANEL</h1>
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 bg-white/5 rounded-lg">
          {mobileMenuOpen ? "✕" : "☰"}
        </button>
      </div>

      <div className="flex flex-col md:flex-row max-w-[1600px] mx-auto min-h-screen relative">
        {/* Sidebar */}
        <aside className={`
          fixed md:sticky top-0 left-0 z-40
          w-[280px] h-screen
          bg-black/90 md:bg-black/20 
          border-r border-white/5
          transition-transform duration-300 ease-in-out
          ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
          flex flex-col
        `}>
          <div className="p-6 border-b border-white/5 hidden md:block">
            <h1 className="text-xl font-black text-acid uppercase tracking-tighter">ADMIN CORE</h1>
            <div className="mt-1 text-[10px] text-white/30 uppercase font-bold tracking-widest">v2.0 Beta</div>
          </div>

          <nav className="flex-1 p-4 space-y-1 overflow-y-auto custom-scrollbar">
            {sidebarLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => {
                  setActiveTab(link.id)
                  setMobileMenuOpen(false)
                }}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-200 group
                  ${activeTab === link.id 
                    ? "bg-neon text-black shadow-lg shadow-neon/20 translate-x-1" 
                    : "text-white/60 hover:text-white hover:bg-white/5"}
                `}
              >
                <span className="text-lg group-hover:scale-110 transition-transform">{link.icon}</span>
                <span className="flex-1 text-left">{link.name}</span>
                {activeTab === link.id && <div className="w-1.5 h-1.5 rounded-full bg-black"></div>}
              </button>
            ))}
          </nav>

          <div className="p-4 mt-auto border-t border-white/5">
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5">
              <div className="w-10 h-10 rounded-xl bg-acid/20 flex items-center justify-center text-acid font-black border border-acid/20">
                {user?.username?.[0]?.toUpperCase()}
              </div>
              <div className="flex-1 overflow-hidden text-left">
                <div className="text-xs font-black text-white truncate uppercase">{user?.username}</div>
                <div className="text-[9px] text-acid font-mono uppercase tracking-widest">{user?.role}</div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0 p-4 md:p-8">
          <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6 animate-in fade-in slide-in-from-top-4 duration-500">
            <div>
              <div className="text-[10px] text-white/30 font-black uppercase tracking-widest mb-1">Системный раздел</div>
              <h2 className="text-3xl font-black text-white uppercase tracking-tighter">
                {sidebarLinks.find(l => l.id === activeTab)?.name}
              </h2>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="relative group">
                <input
                  type="text"
                  placeholder="Поиск по системе..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full md:w-64 bg-white/5 border border-white/10 rounded-2xl px-4 py-2.5 pl-10 text-xs outline-none focus:border-neon focus:ring-1 focus:ring-neon/20 transition-all"
                />
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-neon">🔍</span>
              </div>
              
              <button onClick={() => loadData(activeTab)} className="p-2.5 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all" title="Обновить данные">
                🔄
              </button>
              
              {msg && (
                <div className="fixed bottom-8 right-8 z-[100] bg-neon text-black px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl shadow-neon/40 animate-in fade-in slide-in-from-bottom-4">
                  {msg}
                </div>
              )}
            </div>
          </header>

          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            {activeTab === "antifraud" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {antifraudList.length > 0 ? antifraudList.sort((a,b) => b.createdAt.localeCompare(a.createdAt)).map((alert: any) => (
                    <div key={alert.id} className={`glass p-6 rounded-[32px] border transition-all ${alert.status === 'pending' ? 'border-red-500/30 bg-red-500/5' : 'border-white/5 opacity-50'}`}>
                      <div className="flex justify-between items-start mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-red-500/20 flex items-center justify-center text-2xl">🛡️</div>
                        <span className={`text-[8px] px-2 py-1 rounded-full font-black uppercase tracking-widest ${
                          alert.status === 'pending' ? 'bg-red-500 text-white' : 
                          alert.status === 'banned' ? 'bg-black text-red-500 border border-red-500/30' : 'bg-white/10 text-white/40'
                        }`}>
                          {alert.status === 'pending' ? 'Внимание' : alert.status === 'banned' ? 'Забанен' : 'Проигнорировано'}
                        </span>
                      </div>
                      
                      <div className="space-y-1 mb-6">
                        <div className="text-xl font-black text-white uppercase tracking-tighter">{alert.username}</div>
                        <div className="text-[10px] text-white/30 font-mono">{new Date(alert.createdAt).toLocaleString()}</div>
                      </div>

                      <div className="p-4 rounded-2xl bg-black/40 border border-white/5 mb-6">
                        <div className="text-[9px] text-red-400 font-black uppercase tracking-widest mb-1">Причина срабатывания</div>
                        <div className="text-xs text-white/70 leading-relaxed">{alert.reason}</div>
                      </div>

                      {alert.status === 'pending' && (
                        <div className="grid grid-cols-2 gap-3">
                          <button 
                            onClick={() => handleResolveAntifraud(alert.id, "ban")}
                            className="py-3 rounded-xl bg-red-500 text-white text-[10px] font-black uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-red-500/20"
                          >
                            Заблокировать
                          </button>
                          <button 
                            onClick={() => handleResolveAntifraud(alert.id, "ignore")}
                            className="py-3 rounded-xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all"
                          >
                            Игнорировать
                          </button>
                        </div>
                      )}
                      
                      <button 
                        onClick={() => { setActiveTab("users"); viewUser(alert.userId); }}
                        className="w-full mt-3 py-2 text-[9px] font-black uppercase tracking-widest text-white/20 hover:text-neon transition-colors"
                      >
                        Проверить логи и связи →
                      </button>
                    </div>
                  )) : (
                    <div className="col-span-full py-20 text-center glass rounded-[40px] border border-white/5">
                      <div className="text-6xl mb-4 opacity-10">🛡️</div>
                      <div className="text-sm font-black text-white/20 uppercase tracking-[0.3em]">Угроз не обнаружено</div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === "dashboard" && (
              <div className="space-y-8">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { label: "Всего пользователей", value: stats?.usersCount || 0, icon: "👥", trend: "+12%" },
                    { label: "Активные ставки", value: stats?.activeBetsCount || 0, icon: "🎮", trend: "+5%" },
                    { label: "Баланс системы", value: stats?.totalBalance || 0, icon: "🪙", trend: "-2%" },
                    { label: "Новые тикеты", value: stats?.pendingReports || 0, icon: "🎫", color: "text-yellow-400" },
                  ].map((s, idx) => (
                    <div key={idx} className="glass p-6 rounded-3xl border border-white/5 hover:border-white/10 transition-all group">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-2xl">{s.icon}</span>
                        {s.trend && (
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${s.trend.startsWith('+') ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                            {s.trend}
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-white/30 uppercase font-black tracking-widest mb-1">{s.label}</div>
                      <div className={`text-2xl font-black ${s.color || 'text-white'}`}>{s.value.toLocaleString()}</div>
                    </div>
                  ))}
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                  {/* Recent Logs */}
                  <div className="lg:col-span-2 space-y-4">
                    <div className="flex items-center justify-between px-2">
                      <h3 className="text-sm font-black text-white/40 uppercase tracking-widest">Последние действия</h3>
                      <button className="text-[10px] text-neon font-black uppercase tracking-widest hover:underline">Все логи</button>
                    </div>
                    <div className="glass rounded-3xl border border-white/5 overflow-hidden">
                      <div className="max-h-[500px] overflow-y-auto custom-scrollbar">
                        {logs.length > 0 ? logs.map((log: any, idx: number) => (
                          <div key={idx} className="flex items-center gap-4 p-4 border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                            <div className={`w-1.5 h-1.5 rounded-full ${
                              log.type === 'error' ? 'bg-red-500' : 
                              log.type === 'admin' ? 'bg-neon' : 'bg-acid'
                            }`}></div>
                            <div className="flex-1 min-w-0">
                              <div className="text-xs font-bold text-white/90 truncate">{log.message || log.note}</div>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-[9px] text-white/30 font-mono uppercase">{log.username || 'System'}</span>
                                <span className="text-[9px] text-white/20">•</span>
                                <span className="text-[9px] text-white/30 font-mono">{new Date(log.createdAt).toLocaleString()}</span>
                              </div>
                            </div>
                            {log.amount && (
                              <div className={`text-[10px] font-black font-mono ${log.amount > 0 ? 'text-green-400' : 'text-red-400'}`}>
                                {log.amount > 0 ? '+' : ''}{log.amount} 🪙
                              </div>
                            )}
                          </div>
                        )) : (
                          <div className="p-12 text-center text-white/10 uppercase font-black italic tracking-widest text-xs">
                            Логов пока нет
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-black text-white/40 uppercase tracking-widest px-2">Быстрые действия</h3>
                    <div className="grid grid-cols-1 gap-3">
                      {[
                        { 
                          label: "Разослать уведомление", 
                          icon: "🔔", 
                          action: async () => {
                            const title = prompt("Заголовок уведомления:")
                            const body = prompt("Текст уведомления:")
                            if (!title || !body) return
                            try {
                              await api("/admin/broadcast", { method: "POST", body: JSON.stringify({ title, body }) })
                              setMsg("Уведомление отправлено всем!")
                              setTimeout(() => setMsg(""), 3000)
                            } catch (e: any) { alert(e.message) }
                          } 
                        },
                        { 
                          label: "Экспорт пользователей (CSV)", 
                          icon: "📥", 
                          action: () => {
                            const headers = ["ID", "Username", "Email", "Balance", "Role", "Banned"]
                            const csv = [
                              headers.join(","),
                              ...usersList.map(u => [u.id, u.username, u.email, u.balance, u.role, u.isBanned].join(","))
                            ].join("\n")
                            const blob = new Blob([csv], { type: 'text/csv' })
                            const url = window.URL.createObjectURL(blob)
                            const a = document.createElement('a')
                            a.setAttribute('hidden', '')
                            a.setAttribute('href', url)
                            a.setAttribute('download', 'users.csv')
                            document.body.appendChild(a)
                            a.click()
                            document.body.removeChild(a)
                          } 
                        },
                        { 
                          label: "Очистить логи транзакций", 
                          icon: "🗑️", 
                          action: async () => {
                            if (!confirm("ВНИМАНИЕ! Это удалит ВСЕ логи транзакций. Продолжить?")) return
                            try {
                              await api("/admin/logs/clear", { method: "POST" })
                              loadData("dashboard")
                              setMsg("Логи очищены")
                              setTimeout(() => setMsg(""), 3000)
                            } catch (e: any) { alert(e.message) }
                          } 
                        },
                      ].map((a, idx) => (
                        <button key={idx} onClick={a.action} className="flex items-center gap-3 p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-neon/30 hover:bg-neon/5 transition-all text-left group">
                          <span className="text-xl group-hover:scale-110 transition-transform">{a.icon}</span>
                          <span className="text-xs font-black uppercase tracking-widest text-white/80 group-hover:text-neon">{a.label}</span>
                        </button>
                      ))}
                    </div>
                    
                    <div className="glass p-6 rounded-3xl border border-white/5 mt-8">
                      <div className="text-[10px] text-white/30 uppercase font-black tracking-widest mb-4 flex justify-between items-center">
                        <span>Настройки Системы</span>
                        <div className={`w-1.5 h-1.5 rounded-full ${settings.cs2ThemesEnabled ? 'bg-neon' : 'bg-white/10'}`}></div>
                      </div>
                      <div className="space-y-4">
                        <button 
                          onClick={async () => {
                            const newStatus = !settings.cs2ThemesEnabled;
                            await api("/admin/settings", { method: "POST", body: JSON.stringify({ cs2ThemesEnabled: newStatus }) });
                            setSettings({ ...settings, cs2ThemesEnabled: newStatus });
                            setMsg(newStatus ? "CS2 Темы включены" : "Старый стиль возвращен");
                          }}
                          className="w-full flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all group"
                        >
                          <div className="text-left">
                            <div className="text-[10px] font-black uppercase text-white/80">Темы карт CS2</div>
                            <div className="text-[8px] text-white/30 uppercase">Динамический фон по дням</div>
                          </div>
                          <div className={`w-10 h-5 rounded-full relative transition-colors ${settings.cs2ThemesEnabled ? 'bg-neon' : 'bg-white/10'}`}>
                            <div className={`absolute top-1 w-3 h-3 bg-black rounded-full transition-all ${settings.cs2ThemesEnabled ? 'left-6' : 'left-1'}`}></div>
                          </div>
                        </button>
                      </div>
                    </div>
                    
                    {/* Activity Preview */}
                    <div className="glass p-6 rounded-3xl border border-white/5 mt-8 relative overflow-hidden group">
                      <div className="absolute inset-0 map-slice-top !h-full !position-absolute opacity-20 group-hover:scale-110 transition-transform duration-1000"></div>
                      <div className="relative z-10">
                        <div className="text-[10px] text-white/30 uppercase font-black tracking-widest mb-4">Активность (24ч)</div>
                        <div className="flex items-end justify-between h-24 gap-1">
                          {[40, 70, 45, 90, 65, 80, 50, 60, 85, 40, 75, 95].map((h, i) => (
                            <div key={i} className="flex-1 bg-neon/20 hover:bg-neon transition-all rounded-t-sm" style={{ height: `${h}%` }}></div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
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
            <div className="grid lg:grid-cols-12 gap-8">
              {/* User List Sidebar */}
              <div className="lg:col-span-4 space-y-4">
                <div className="flex items-center justify-between px-2">
                  <h3 className="text-xs font-black text-white/40 uppercase tracking-widest">База пользователей</h3>
                  <span className="text-[10px] bg-white/5 px-2 py-0.5 rounded-full text-white/40">{usersList.length}</span>
                </div>
                
                <div className="glass rounded-3xl border border-white/5 overflow-hidden">
                  <div className="max-h-[700px] overflow-y-auto custom-scrollbar">
                    {usersList
                      .filter(u => !searchTerm || u.username.toLowerCase().includes(searchTerm.toLowerCase()) || u.email.toLowerCase().includes(searchTerm.toLowerCase()))
                      .map(u => (
                      <div key={u.id} onClick={() => viewUser(u.id)} className={`
                        flex items-center gap-4 p-4 cursor-pointer transition-all border-b border-white/5
                        ${selectedUser?.user?.id === u.id ? "bg-neon/10 border-l-4 border-l-neon" : "hover:bg-white/[0.02]"}
                      `}>
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs ${u.isBanned ? 'bg-red-500/20 text-red-500' : 'bg-white/5 text-white/40'}`}>
                          {u.username[0].toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-white truncate">{u.username}</span>
                            {u.role !== 'user' && <span className="text-[8px] px-1 rounded bg-acid text-black font-black uppercase">{u.role}</span>}
                            <Link 
                              href={`/profile/${u.id}`} 
                              target="_blank"
                              onClick={(e) => e.stopPropagation()}
                              className="text-white/20 hover:text-neon transition-colors"
                              title="Открыть публичный профиль"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                              </svg>
                            </Link>
                          </div>
                          <div className="text-[10px] text-white/30 truncate">{u.email}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs font-black text-acid font-mono">{u.balance} 🪙</div>
                          {u.isBanned && <div className="text-[8px] text-red-500 font-black uppercase">BANNED</div>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* User Dossier View */}
              <div className="lg:col-span-8 min-h-[600px]">
                {selectedUser ? (
                  <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-500">
                    {/* Header Card */}
                    <div className="glass p-8 rounded-[40px] border border-white/5 relative overflow-hidden">
                      {/* Background Risk Indicator */}
                      <div className={`absolute top-0 right-0 w-64 h-64 blur-[100px] opacity-20 transition-all ${
                        selectedUser.riskScore > 60 ? 'bg-red-500' : selectedUser.riskScore > 30 ? 'bg-yellow-500' : 'bg-green-500'
                      }`}></div>

                      <div className="relative flex flex-col md:flex-row justify-between items-start gap-8">
                        <div className="flex gap-6">
                          <div className="w-24 h-24 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center text-4xl font-black shadow-2xl">
                            {selectedUser.user.username[0].toUpperCase()}
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center gap-3">
                              <h2 className="text-3xl font-black text-white uppercase tracking-tighter">{selectedUser.user.username}</h2>
                              {selectedUser.user.isBanned && <span className="px-3 py-1 bg-red-500 text-black text-[10px] font-black rounded-full uppercase">Terminated</span>}
                            </div>
                            <div className="flex flex-wrap items-center gap-3">
                              <div className="text-xs text-white/40 font-mono">ID: {selectedUser.user.id}</div>
                              {selectedUser.user.telegram && (
                                <>
                                  <div className="w-1 h-1 rounded-full bg-white/10"></div>
                                  <div className="text-xs text-neon font-bold flex items-center gap-1">
                                    <span className="opacity-50 text-[10px]">TG:</span> @{selectedUser.user.telegram}
                                  </div>
                                </>
                              )}
                              <div className="w-1 h-1 rounded-full bg-white/10"></div>
                              <div className="text-xs text-white/40">Joined {new Date(selectedUser.user.createdAt).toLocaleDateString()}</div>
                            </div>
                            <div className="flex gap-2 pt-2">
                              <span className="px-2 py-1 bg-white/5 border border-white/10 rounded-lg text-[9px] font-black uppercase text-white/60 tracking-widest">{selectedUser.user.role}</span>
                              <span className="px-2 py-1 bg-acid/10 border border-acid/20 rounded-lg text-[9px] font-black uppercase text-acid tracking-widest">Level {selectedUser.user.levelId || 1}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col items-center md:items-end gap-2">
                          <div className="text-[10px] text-white/30 uppercase font-black tracking-widest">Risk Analysis</div>
                          <div className="flex items-center gap-4">
                             <div className="text-4xl font-black text-white">{selectedUser.riskScore}%</div>
                             <div className="w-12 h-12 relative">
                               <svg className="w-full h-full transform -rotate-90">
                                 <circle cx="24" cy="24" r="20" fill="none" stroke="currentColor" strokeWidth="4" className="text-white/5" />
                                 <circle cx="24" cy="24" r="20" fill="none" stroke="currentColor" strokeWidth="4" 
                                   strokeDasharray={125.6} 
                                   strokeDashoffset={125.6 - (125.6 * selectedUser.riskScore / 100)}
                                   className={`${selectedUser.riskScore > 60 ? 'text-red-500' : selectedUser.riskScore > 30 ? 'text-yellow-500' : 'text-green-500'}`}
                                 />
                               </svg>
                             </div>
                          </div>
                        </div>
                      </div>

                      {/* Stats Quick Grid */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-10">
                        <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                          <div className="text-[9px] text-white/30 uppercase font-black tracking-widest mb-1">Balance</div>
                          <div className="text-xl font-black text-acid font-mono">{selectedUser.user.balance} 🪙</div>
                        </div>
                        <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                          <div className="text-[9px] text-white/30 uppercase font-black tracking-widest mb-1">Total Bets</div>
                          <div className="text-xl font-black text-white">{selectedUser.bets.length}</div>
                        </div>
                        <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                          <div className="text-[9px] text-white/30 uppercase font-black tracking-widest mb-1">Devices</div>
                          <div className="text-xl font-black text-white">{selectedUser.user.deviceIds.length}</div>
                        </div>
                        <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                          <div className="text-[9px] text-white/30 uppercase font-black tracking-widest mb-1">IP Addresses</div>
                          <div className="text-xl font-black text-white">{selectedUser.user.ips.length}</div>
                        </div>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                      {/* Connections (Graph-like view) */}
                      <div className="space-y-4">
                        <h3 className="text-xs font-black text-white/40 uppercase tracking-widest px-2">Связи и Мультиаккаунты</h3>
                        <div className="glass p-6 rounded-[32px] border border-white/5 space-y-6 overflow-hidden">
                          {/* Visual Graph Area */}
                          <div className="h-48 relative flex items-center justify-center bg-black/40 rounded-2xl border border-white/5">
                            {/* Central User */}
                            <div className="relative z-10 w-16 h-16 rounded-2xl bg-neon text-black flex items-center justify-center font-black shadow-[0_0_30px_rgba(0,255,255,0.3)]">
                              YOU
                            </div>
                            
                            {/* Connection Lines & Other Users */}
                            {selectedUser.connections.sameIps.concat(selectedUser.connections.sameDevices).slice(0, 4).map((c: any, i: number) => {
                              const angle = (i * (360 / Math.min(4, selectedUser.connections.sameIps.length + selectedUser.connections.sameDevices.length))) * (Math.PI / 180)
                              const x = Math.cos(angle) * 80
                              const y = Math.sin(angle) * 60
                              return (
                                <div key={i} className="absolute transition-all duration-700 animate-in zoom-in fade-in" style={{ transform: `translate(${x}px, ${y}px)` }}>
                                  <div className="w-1 h-px bg-red-500/20 absolute top-1/2 left-1/2 -translate-x-full origin-right" style={{ width: '60px', transform: `rotate(${angle * 180 / Math.PI}deg)` }}></div>
                                  <div className="w-10 h-10 rounded-xl bg-red-500/20 border border-red-500/40 flex items-center justify-center text-[8px] font-black text-red-500 uppercase text-center p-1 leading-tight backdrop-blur-sm">
                                    {c.username.slice(0, 6)}
                                  </div>
                                </div>
                              )
                            })}
                            
                            {selectedUser.connections.sameIps.length === 0 && selectedUser.connections.sameDevices.length === 0 && (
                              <div className="text-[10px] text-white/10 uppercase font-black tracking-widest">No connections found</div>
                            )}
                          </div>

                          <div className="space-y-4">
                            <div>
                              <div className="text-[10px] text-white/30 uppercase font-black mb-3">Совпадения по IP ({selectedUser.connections.sameIps.length})</div>
                              <div className="space-y-2">
                                {selectedUser.connections.sameIps.map((c: any) => (
                                  <div key={c.id} className="flex items-center justify-between p-3 rounded-xl bg-red-500/5 border border-red-500/10 hover:bg-red-500/10 transition-colors">
                                    <div className="text-xs font-bold text-white">{c.username}</div>
                                    <div className="text-[9px] text-red-400 font-mono">{c.commonIps[0]}</div>
                                  </div>
                                ))}
                              </div>
                            </div>

                            <div>
                              <div className="text-[10px] text-white/30 uppercase font-black mb-3">Совпадения по Устройствам ({selectedUser.connections.sameDevices.length})</div>
                              <div className="space-y-2">
                                {selectedUser.connections.sameDevices.map((c: any) => (
                                  <div key={c.id} className="flex items-center justify-between p-3 rounded-xl bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 transition-colors">
                                    <div className="text-xs font-bold text-white">{c.username}</div>
                                    <div className="text-[9px] text-red-500 font-black uppercase tracking-tighter">DUPLICATE DEVICE</div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Playbooks */}
                        <h3 className="text-xs font-black text-white/40 uppercase tracking-widest px-2 pt-4">Сценарии (Playbooks)</h3>
                        <div className="grid grid-cols-1 gap-2">
                          {[
                            { 
                              name: "Подозрительный пользователь", 
                              desc: "Проверка IP, логов и временная блокировка",
                              action: async () => {
                                if (!confirm("Запустить сценарий 'Подозрительный пользователь'?")) return
                                setMsg("Запуск сценария...")
                                await handleBanUser(selectedUser.user.id, true)
                                await handleUpdateRole(selectedUser.user.id, "user")
                                setMsg("Сценарий выполнен: пользователь заблокирован для проверки")
                              }
                            },
                            { 
                              name: "Амнистия", 
                              desc: "Разблокировка и сброс риск-скора",
                              action: async () => {
                                await handleBanUser(selectedUser.user.id, false)
                                setMsg("Амнистия применена")
                              }
                            },
                            { 
                              name: "PERMANENT BAN", 
                              desc: "Полная блокировка доступа к системе без возможности разблокировки пользователем",
                              action: async () => {
                                if (!confirm("ВНИМАНИЕ! Применить ПЕРМАНЕНТНУЮ блокировку для этого пользователя? Он потеряет доступ ко всем функциям сайта.")) return
                                setMsg("Блокировка...")
                                await handleBanUser(selectedUser.user.id, true)
                                setMsg("Пользователь заблокирован перманентно")
                              }
                            }
                          ].map((p, idx) => (
                            <button key={idx} onClick={p.action} className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-acid/30 hover:bg-acid/5 transition-all text-left group">
                              <div className="text-[10px] font-black uppercase tracking-widest text-acid mb-1">{p.name}</div>
                              <div className="text-[9px] text-white/40">{p.desc}</div>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Timeline */}
                      <div className="space-y-4">
                        <h3 className="text-xs font-black text-white/40 uppercase tracking-widest px-2">Timeline Событий</h3>
                        <div className="glass p-6 rounded-[32px] border border-white/5 relative">
                          <div className="absolute left-8 top-10 bottom-10 w-px bg-white/5"></div>
                          <div className="space-y-8 max-h-[600px] overflow-y-auto custom-scrollbar pr-2">
                            {selectedUser.timeline.map((item: any, idx: number) => (
                              <div key={idx} className="relative flex gap-6 group">
                                <div className={`w-4 h-4 rounded-full border-4 border-black z-10 mt-1 transition-all group-hover:scale-125 ${
                                  item.type === 'registration' ? 'bg-acid' : 
                                  item.type === 'bet' ? 'bg-blue-500' : 
                                  item.amount > 0 ? 'bg-green-500' : 'bg-red-500'
                                }`}></div>
                                <div className="flex-1 min-w-0">
                                  <div className="text-[10px] text-white/30 font-mono mb-1">{new Date(item.createdAt).toLocaleString()}</div>
                                  <div className="text-xs font-bold text-white/90">{item.note || (item.type === 'bet' ? `Ставка на ${item.matchName}` : "Транзакция")}</div>
                                  {item.amount && (
                                    <div className={`text-[10px] font-black mt-1 ${item.amount > 0 ? 'text-green-400' : 'text-red-400'}`}>
                                      {item.amount > 0 ? '+' : ''}{item.amount} 🪙
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Quick Balance Actions */}
                        <div className="space-y-4">
                           <label className="text-[9px] text-white/30 uppercase font-black">Управление Правами</label>
                           <div className="grid grid-cols-3 gap-2">
                             {[
                               { id: "admin", name: "Админ", color: "bg-acid" },
                               { id: "moderator", name: "Модер", color: "bg-blue-500" },
                               { id: "user", name: "Юзер", color: "bg-white/10" }
                             ].map((role) => (
                               <button 
                                 key={role.id}
                                 onClick={() => handleUpdateRole(selectedUser.user.id, role.id)}
                                 className={`px-2 py-3 rounded-xl text-[9px] font-black uppercase transition-all border ${
                                   selectedUser.user.role === role.id 
                                     ? `${role.color} text-black border-transparent shadow-lg` 
                                     : "bg-white/5 text-white/40 border-white/5 hover:bg-white/10"
                                 }`}
                               >
                                 {role.name}
                               </button>
                             ))}
                           </div>
                         </div>

                         <div className="space-y-4">
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
                           </div>
                         </div>

                         <div className="glass p-6 rounded-[32px] border border-white/5 space-y-4">
                           <div className="text-[10px] text-white/30 uppercase font-black tracking-widest">Коррекция баланса</div>
                           <div className="flex gap-2">
                              <input 
                                type="number" 
                                value={balanceDelta}
                                onChange={(e) => setBalanceDelta(e.target.value)}
                                className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-sm outline-none focus:border-neon"
                                placeholder="Сумма..."
                              />
                              <button 
                                onClick={() => {
                                  const val = Number(balanceDelta)
                                  if (val) handleUpdateBalance(selectedUser.user.id, val)
                                }}
                                className="px-6 py-2 bg-neon text-black rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-lg shadow-neon/20"
                              >
                                Применить
                              </button>
                           </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-white/10 space-y-6">
                    <div className="text-8xl">📁</div>
                    <div className="text-sm font-black uppercase tracking-[0.2em] animate-pulse text-center">
                      Выберите объект для анализа данных<br/>
                      <span className="text-[10px] opacity-30">Ожидание входящих запросов...</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}


          {activeTab === "applications" && (
            <div className="space-y-8 animate-in fade-in duration-500">
              <div className="grid lg:grid-cols-3 gap-8">
                {/* Создание Формы */}
                <div className="lg:col-span-1 space-y-6">
                  <h2 className="text-xl font-black text-white uppercase tracking-tighter flex items-center gap-3 px-2">
                    <span className="text-2xl">📝</span> Конструктор Форм
                  </h2>
                  <div className="glass p-6 rounded-[32px] border border-white/5 space-y-4">
                    <div className="space-y-4">
                      <div className="group">
                        <label className="text-[10px] font-black text-white/20 uppercase ml-2 mb-1 block tracking-widest">Название формы</label>
                        <input 
                          id="form-title"
                          className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm outline-none focus:border-neon transition-all" 
                          placeholder="Например: Заявка на модератора" 
                        />
                      </div>
                      <div className="group">
                        <label className="text-[10px] font-black text-white/20 uppercase ml-2 mb-1 block tracking-widest">Описание</label>
                        <textarea 
                          id="form-desc"
                          rows={2}
                          className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm outline-none focus:border-neon transition-all" 
                          placeholder="Опишите требования..." 
                        />
                      </div>

                      <div className="space-y-3">
                        <div className="flex justify-between items-center px-2">
                          <label className="text-[10px] font-black text-white/20 uppercase tracking-widest">Вопросы формы</label>
                          <button 
                            onClick={() => setNewFormFields([...newFormFields, { label: "", type: "text" }])}
                            className="text-[10px] text-neon font-black uppercase hover:underline"
                          >+ Добавить</button>
                        </div>
                        {newFormFields.map((f, i) => (
                          <div key={i} className="flex gap-2 animate-in slide-in-from-left-2">
                            <input 
                              value={f.label}
                              onChange={(e) => {
                                const copy = [...newFormFields];
                                copy[i].label = e.target.value;
                                setNewFormFields(copy);
                              }}
                              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs outline-none focus:border-neon"
                              placeholder={`Вопрос #${i+1}`}
                            />
                            <select 
                              value={f.type}
                              onChange={(e) => {
                                const copy = [...newFormFields];
                                copy[i].type = e.target.value;
                                setNewFormFields(copy);
                              }}
                              className="bg-white/5 border border-white/10 rounded-xl px-2 py-2 text-[10px] outline-none text-white/60"
                            >
                              <option value="text">Текст</option>
                              <option value="textarea">Абзац</option>
                            </select>
                            {newFormFields.length > 1 && (
                              <button onClick={() => setNewFormFields(newFormFields.filter((_, idx) => idx !== i))} className="text-white/20 hover:text-red-500">✕</button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                    <button 
                      onClick={async () => {
                        const title = (document.getElementById('form-title') as HTMLInputElement).value;
                        const description = (document.getElementById('form-desc') as HTMLTextAreaElement).value;
                        if (!title) return alert("Введите заголовок");
                        if (newFormFields.some(f => !f.label.trim())) return alert("Заполните все названия вопросов");
                        try {
                          await api("/admin/forms", { method: "POST", body: JSON.stringify({ title, description, fields: newFormFields }) });
                          (document.getElementById('form-title') as HTMLInputElement).value = "";
                          (document.getElementById('form-desc') as HTMLTextAreaElement).value = "";
                          setNewFormFields([{ label: "Ваш Discord/TG", type: "text" }, { label: "Почему мы должны выбрать вас?", type: "textarea" }]);
                          loadData("applications");
                          setMsg("Форма создана!");
                        } catch (e: any) { alert(e.message); }
                      }}
                      className="w-full py-4 rounded-2xl bg-neon text-black text-[10px] font-black uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-neon"
                    >
                      Создать форму
                    </button>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-[10px] font-black text-white/30 uppercase tracking-widest px-2">Активные формы</h3>
                    {applicationForms.map(f => (
                      <div key={f.id} className="glass p-4 rounded-2xl border border-white/5 flex items-center justify-between group">
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-white truncate">{f.title}</div>
                          <div className="text-[9px] text-white/30 font-mono">ID: {f.id.slice(0,8)}</div>
                        </div>
                        <button 
                          onClick={async () => {
                            if (!confirm("Удалить форму? Все заявки по ней останутся, но новые подать будет нельзя.")) return;
                            await api(`/admin/forms/${f.id}`, { method: "DELETE" });
                            loadData("applications");
                          }}
                          className="p-2 text-white/20 hover:text-red-500 transition-colors"
                        >✕</button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Список Заявок */}
                <div className="lg:col-span-2 space-y-6">
                  <h2 className="text-xl font-black text-white uppercase tracking-tighter flex items-center gap-3 px-2">
                    <span className="text-2xl">📩</span> Поступившие Заявки
                  </h2>
                  <div className="grid gap-4">
                    {applications.length > 0 ? applications.sort((a,b) => b.createdAt.localeCompare(a.createdAt)).map(app => (
                      <div key={app.id} className={`glass p-6 rounded-[32px] border transition-all ${
                        app.status === 'pending' ? 'border-neon/30 bg-neon/5' : 'border-white/5 opacity-80'
                      }`}>
                        <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6">
                          <div className="space-y-1">
                            <div className="flex items-center gap-3">
                              <span className="text-lg font-black text-white uppercase">{app.username}</span>
                              <span className={`text-[8px] px-2 py-1 rounded-full font-black uppercase ${
                                app.status === 'pending' ? 'bg-neon text-black' : 
                                app.status === 'approved' ? 'bg-acid text-black' : 'bg-red-500 text-white'
                              }`}>
                                {app.status === 'pending' ? 'На рассмотрении' : app.status === 'approved' ? 'Принято' : 'Отклонено'}
                              </span>
                            </div>
                            <div className="text-[10px] text-white/30 font-mono">
                              Форма: <span className="text-white/60">{app.formTitle}</span> • {new Date(app.createdAt).toLocaleString()}
                            </div>
                          </div>
                          
                          {app.status === 'pending' && (
                            <div className="flex gap-2 w-full md:w-auto">
                              <button 
                                onClick={async () => {
                                  await api(`/admin/applications/${app.id}/status`, { method: "POST", body: JSON.stringify({ status: 'approved', adminComment: 'Заявка одобрена администратором' }) });
                                  loadData("applications");
                                  setMsg("Заявка одобрена!");
                                }}
                                className="flex-1 md:flex-none px-4 py-2 rounded-xl bg-acid text-black text-[9px] font-black uppercase tracking-widest hover:scale-105 transition-all"
                              >Принять</button>
                              <button 
                                onClick={async () => {
                                  const reason = prompt("Причина отказа:");
                                  await api(`/admin/applications/${app.id}/status`, { method: "POST", body: JSON.stringify({ status: 'rejected', adminComment: reason || 'Отклонено без комментария' }) });
                                  loadData("applications");
                                  setMsg("Заявка отклонена");
                                }}
                                className="flex-1 md:flex-none px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white/40 text-[9px] font-black uppercase tracking-widest hover:bg-red-500/20 hover:text-red-400 transition-all"
                              >Отказать</button>
                            </div>
                          )}
                        </div>

                        <div className="grid gap-3">
                          {Object.entries(app.answers || {}).map(([label, val]: [string, any]) => (
                            <div key={label} className="p-4 rounded-2xl bg-black/40 border border-white/5">
                              <div className="text-[9px] text-white/30 uppercase font-black mb-1">{label}</div>
                              <div className="text-sm text-white/80">{String(val)}</div>
                            </div>
                          ))}
                        </div>

                        {app.adminComment && (
                          <div className="mt-4 p-4 rounded-2xl bg-white/5 border border-white/10 italic text-xs text-white/40">
                            Коммент админа: {app.adminComment}
                          </div>
                        )}
                      </div>
                    )) : (
                      <div className="py-20 text-center glass rounded-[40px] border border-white/5">
                        <div className="text-6xl mb-4 opacity-10">📂</div>
                        <div className="text-sm font-black text-white/20 uppercase tracking-[0.3em]">Заявок пока нет</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === "reports" && (
            <div className="space-y-4">
              <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-neon uppercase">Тикеты / Репорты</h2>
                  <div className="text-[10px] text-white/30 uppercase font-bold tracking-widest">
                    Активные: {(reportsList || []).filter((x: any) => x.status !== "resolved").length} • История: {(reportsList || []).filter((x: any) => x.status === "resolved").length}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setReportsView("active")}
                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                      reportsView === "active" ? "bg-neon text-black border-neon shadow-neon" : "bg-white/5 text-white/50 border-white/10 hover:text-white hover:border-white/20"
                    }`}
                  >
                    Активные
                  </button>
                  <button
                    onClick={() => setReportsView("history")}
                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                      reportsView === "history" ? "bg-white/10 text-white border-white/20" : "bg-white/5 text-white/50 border-white/10 hover:text-white hover:border-white/20"
                    }`}
                  >
                    История
                  </button>
                  <button
                    onClick={() => loadData("reports")}
                    className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-white/50 hover:text-white hover:border-neon/30 transition-all"
                  >
                    Обновить
                  </button>
                </div>
              </div>
              <div className="grid gap-3">
                {(reportsView === "active"
                  ? (reportsList || []).filter((x: any) => x.status !== "resolved")
                  : (reportsList || []).filter((x: any) => x.status === "resolved")
                ).map(r => (
                  <div key={r.id} className={`p-4 rounded border transition-all ${
                    r.status === "pending" ? "bg-yellow-500/5 border-yellow-500/20" : r.status === "in_progress" ? "bg-neon/5 border-neon/20" : "bg-white/5 border-white/10 opacity-60"
                  }`}>
                    <div className="flex flex-col lg:flex-row justify-between items-start gap-4">
                      <div className="space-y-3 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-white">{r.title}</span>
                          <span className={`text-[8px] px-1.5 py-0.5 rounded font-black uppercase ${
                            r.status === "pending" ? "bg-yellow-500 text-black" : r.status === "in_progress" ? "bg-neon text-black" : "bg-green-500 text-black"
                          }`}>
                            {r.status === "pending" ? "Новый" : r.status === "in_progress" ? "В работе" : "Решено"}
                          </span>
                          {r.referralManualAppliedAt && (
                            <span className="text-[8px] px-1.5 py-0.5 rounded font-black uppercase bg-acid/20 border border-acid/30 text-acid">
                              Реф начислен
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-white/40">От: {r.username} • {new Date(r.createdAt).toLocaleString()}</div>
                        <p className="text-sm text-white/70 bg-black/30 p-3 rounded italic">"{r.content}"</p>

                        {Array.isArray(r.adminResponses) && r.adminResponses.length > 0 && (
                          <div className="bg-neon/10 border border-neon/20 rounded-xl p-3">
                            <div className="text-[9px] font-black uppercase tracking-widest text-neon">Последний ответ</div>
                            <div className="text-sm text-white/80 mt-1">{r.adminResponses[r.adminResponses.length - 1].message}</div>
                            <div className="text-[10px] text-white/30 mt-2 font-mono">
                              {r.adminResponses[r.adminResponses.length - 1].adminUsername} • {new Date(r.adminResponses[r.adminResponses.length - 1].createdAt).toLocaleString()}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="w-full lg:w-[360px] space-y-3">
                        <div className="glass p-3 rounded-2xl border border-white/10 space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="text-[10px] text-white/40 uppercase font-black tracking-widest">Действия</div>
                            <div className="text-[9px] text-white/20 font-mono">{r.id?.slice?.(0, 8)}</div>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            {[
                              { title: "Взялся за работу", text: "Взяли тикет в работу. Ожидайте." },
                              { title: "Нужны детали", text: "Нужно уточнение: пришлите детали (скрин/ID/время) и что именно не сработало." },
                              { title: "Проверяем", text: "Проверяем ситуацию. Если подтвердится — компенсируем." },
                              { title: "Решили", text: "Проблема решена. Проверьте сейчас, пожалуйста." }
                            ].map(t => (
                              <button
                                key={t.title}
                                onClick={() => setReportReplies(prev => ({ ...prev, [r.id]: t.text }))}
                                className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-white/50 hover:text-white hover:border-neon/30 transition-all"
                              >
                                {t.title}
                              </button>
                            ))}
                          </div>

                          {r.status !== "resolved" && (
                            <>
                              <textarea
                                rows={3}
                                value={reportReplies[r.id] || ""}
                                onChange={(e) => setReportReplies(prev => ({ ...prev, [r.id]: e.target.value }))}
                                className="w-full p-3 rounded-xl bg-black/40 border border-white/10 text-sm outline-none focus:border-neon transition-all"
                                placeholder="Сообщение пользователю"
                              />
                              <div className="grid grid-cols-2 gap-2">
                                <button
                                  onClick={() => handleReplyReport(r.id)}
                                  className="py-3 rounded-xl bg-neon text-black text-[10px] font-black uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-neon"
                                >
                                  Отправить
                                </button>
                                <button
                                  onClick={async () => {
                                    try {
                                      await api(`/admin/reports/${r.id}/reply`, { method: "POST", body: JSON.stringify({ message: "Тикет закрыт. Спасибо за обращение.", status: "resolved" }) })
                                      await handleResolveReport(r.id)
                                    } catch (e: any) {
                                      alert(e.message)
                                    }
                                  }}
                                  className="py-3 rounded-xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-white/60 hover:text-white hover:border-white/20 transition-all"
                                >
                                  Закрыть
                                </button>
                              </div>
                            </>
                          )}
                        </div>

                        {!isOnlyModerator && r.status !== "resolved" && (
                          <div className="glass p-3 rounded-2xl border border-white/10 space-y-3">
                            <div className="text-[10px] text-white/40 uppercase font-black tracking-widest">Баланс</div>
                            <div className="grid grid-cols-2 gap-2">
                              <input
                                value={ticketBalanceAmount[r.id] || ""}
                                onChange={(e) => setTicketBalanceAmount(prev => ({ ...prev, [r.id]: e.target.value }))}
                                className="p-3 rounded-xl bg-black/40 border border-white/10 text-sm outline-none focus:border-neon transition-all font-mono"
                                placeholder="Сумма"
                              />
                              <input
                                value={ticketBalanceNote[r.id] || ""}
                                onChange={(e) => setTicketBalanceNote(prev => ({ ...prev, [r.id]: e.target.value }))}
                                className="p-3 rounded-xl bg-black/40 border border-white/10 text-sm outline-none focus:border-white/20 transition-all"
                                placeholder="Причина (опц.)"
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <button
                                onClick={() => handleTicketBalance(r, 1)}
                                className="py-3 rounded-xl bg-acid text-black text-[10px] font-black uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-acid"
                              >
                                Пополнить
                              </button>
                              <button
                                onClick={() => handleTicketBalance(r, -1)}
                                className="py-3 rounded-xl bg-red-500/15 border border-red-500/25 text-red-300 text-[10px] font-black uppercase tracking-widest hover:bg-red-500/25 transition-all"
                              >
                                Списать
                              </button>
                            </div>
                          </div>
                        )}

                        {!isOnlyModerator && !r.referralManualAppliedAt && r.status !== "resolved" && (
                          <div className="glass p-3 rounded-2xl border border-white/10 space-y-2">
                            <div className="text-[10px] text-white/40 uppercase font-black tracking-widest">Фикс бонуса по промокоду</div>
                            <input
                              value={reportPromoCodes[r.id] || ""}
                              onChange={(e) => setReportPromoCodes(prev => ({ ...prev, [r.id]: e.target.value }))}
                              className="w-full p-3 rounded-xl bg-black/40 border border-white/10 text-sm outline-none focus:border-acid transition-all font-mono"
                              placeholder="Промокод"
                            />
                            <button onClick={() => handleManualReferralCredit(r.id)} className="w-full py-3 rounded-xl bg-acid text-black text-[10px] uppercase font-black hover:scale-[1.02] active:scale-95 transition-all shadow-acid">
                              Начислить бонус
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {(reportsView === "active"
                  ? (reportsList || []).filter((x: any) => x.status !== "resolved").length === 0
                  : (reportsList || []).filter((x: any) => x.status === "resolved").length === 0
                ) && (
                  <div className="text-center py-20 text-white/20 uppercase tracking-widest font-bold italic">
                    {reportsView === "active" ? "Активных тикетов нет" : "История пуста"}
                  </div>
                )}
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
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <div className="text-sm font-black text-white uppercase tracking-tight">
                              {o.rewardName || "Заказ"}
                            </div>
                            {(() => {
                              const createdMs = o.createdAt ? Date.parse(o.createdAt) : null
                              const ageMs = createdMs ? Date.now() - createdMs : 0
                              const ageH = Math.floor(ageMs / 3600000)
                              const ageM = Math.floor((ageMs % 3600000) / 60000)
                              const slaBad = (o.status === "Pending" || o.status === "InProgress") && ageH >= 24
                              const statusRu =
                                o.status === "Pending" ? "Ожидает" :
                                o.status === "InProgress" ? "В работе" :
                                o.status === "Issued" ? "Выдано" :
                                o.status === "Rejected" ? "Отклонено" : "Выполнено"
                              return (
                                <>
                                  <span className={`text-[9px] px-2 py-1 rounded-full font-black uppercase tracking-widest ${
                                    o.status === "Pending" ? "bg-yellow-500/20 text-yellow-300 border border-yellow-500/20" :
                                    o.status === "InProgress" ? "bg-neon/15 text-neon border border-neon/20" :
                                    o.status === "Issued" ? "bg-acid/15 text-acid border border-acid/20" :
                                    o.status === "Rejected" ? "bg-red-500/10 text-red-300 border border-red-500/20" :
                                    "bg-white/10 text-white/60 border border-white/10"
                                  }`}>
                                    {statusRu}
                                  </span>
                                  <span className={`text-[9px] px-2 py-1 rounded-full font-black uppercase tracking-widest ${slaBad ? "bg-red-500/10 text-red-300 border border-red-500/20" : "bg-white/5 text-white/30 border border-white/10"}`}>
                                    SLA {ageH}h {ageM}m
                                  </span>
                                </>
                              )
                            })()}
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
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-3 mt-4">
                        <div className="glass p-3 rounded-2xl border border-white/10 space-y-2">
                          <div className="text-[10px] font-black uppercase tracking-widest text-white/40">Статус</div>
                          <select
                            value={orderStatusDraft[o.id] || o.status}
                            onChange={(e) => setOrderStatusDraft(prev => ({ ...prev, [o.id]: e.target.value }))}
                            className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-3 text-[11px] font-black uppercase tracking-widest outline-none focus:border-neon"
                          >
                            <option value="Pending">Ожидает</option>
                            <option value="InProgress">В работе</option>
                            <option value="Issued">Выдано</option>
                            <option value="Completed">Выполнено</option>
                            <option value="Rejected">Отклонено</option>
                          </select>
                        </div>

                        <div className="glass p-3 rounded-2xl border border-white/10 space-y-2">
                          <div className="text-[10px] font-black uppercase tracking-widest text-white/40">Сообщение пользователю</div>
                          <textarea
                            rows={3}
                            value={orderMessages[o.id] || ""}
                            onChange={(e) => setOrderMessages(prev => ({ ...prev, [o.id]: e.target.value }))}
                            className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-3 text-sm outline-none focus:border-neon transition-all"
                            placeholder="Например: Взяли в работу. Ожидайте."
                          />
                          <div className="flex flex-wrap gap-2">
                            {[
                              "Взяли в работу. Ожидайте.",
                              "Нужна новая Trade Link (проверьте доступность).",
                              "Заказ выдан. Проверьте инвентарь.",
                              "Отклонено: неверная Trade Link."
                            ].map(t => (
                              <button
                                key={t}
                                onClick={() => setOrderMessages(prev => ({ ...prev, [o.id]: t }))}
                                className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-white/50 hover:text-white hover:border-white/20 transition-all"
                              >
                                Шаблон
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-2 mt-3">
                        <button
                          onClick={() => {
                            const status = orderStatusDraft[o.id] || o.status || "Pending"
                            const msgText = String(orderMessages[o.id] || "").trim()
                            handleUpdateOrderStatus(o.id, status, msgText || undefined)
                            setOrderMessages(prev => ({ ...prev, [o.id]: "" }))
                          }}
                          className="w-full sm:w-auto px-4 py-3 rounded-xl bg-neon text-black text-[10px] font-black uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-neon"
                        >
                          Применить и уведомить
                        </button>
                        <button
                          onClick={() => handleUpdateOrderStatus(o.id, "Rejected", "Отклонено")}
                          className="w-full sm:w-auto px-4 py-3 rounded-xl bg-red-500/15 border border-red-500/25 text-red-300 text-[10px] font-black uppercase tracking-widest hover:bg-red-500/25 transition-all"
                        >
                          Быстро отклонить
                        </button>
                      </div>

                      {Array.isArray(o.messages) && o.messages.length > 0 && (
                        <div className="mt-4 bg-black/30 border border-white/5 rounded-2xl p-4">
                          <div className="text-[10px] font-black uppercase tracking-widest text-white/40">История</div>
                          <div className="grid gap-2 mt-2">
                            {o.messages.slice(-3).reverse().map((m: any) => (
                              <div key={m.id} className="p-3 rounded-xl bg-white/5 border border-white/10">
                                <div className="text-[10px] text-white/30 font-mono">{m.adminUsername} • {new Date(m.createdAt).toLocaleString()}</div>
                                <div className="text-sm text-white/80 mt-1">{m.message}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
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
      </main>
    </div>
  </div>
)
}
