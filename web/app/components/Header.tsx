"use client"
import Link from "next/link"
import { useEffect, useState } from "react"
import { api } from "../../lib/api"
import { useRouter, usePathname } from "next/navigation"

export default function Header() {
  const [user, setUser] = useState<any>(null)
  const [mounted, setMounted] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [notifications, setNotifications] = useState<any[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [bottomMoreOpen, setBottomMoreOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
    const loadUser = async () => {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
      if (!token) {
        setUser(null)
        return
      }
      try {
        const data = await api("/users/me")
        setUser(data)
      } catch (e: any) {
        if (e.message === "UNAUTHORIZED") {
          localStorage.removeItem("token")
        }
        setUser(null)
      }
    }
    loadUser()

    // Listen for balance updates from other components
    window.addEventListener("balanceUpdate", loadUser)
    return () => window.removeEventListener("balanceUpdate", loadUser)
  }, [pathname])

  // Закрываем меню при переходе по ссылке
  useEffect(() => {
    setMobileMenuOpen(false)
    setNotificationsOpen(false)
    setBottomMoreOpen(false)
  }, [pathname])

  // Блокируем скролл при открытом меню
  useEffect(() => {
    if (mobileMenuOpen || notificationsOpen || bottomMoreOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => { document.body.style.overflow = 'unset' }
  }, [mobileMenuOpen, notificationsOpen, bottomMoreOpen])

  const logout = () => {
    localStorage.removeItem("token")
    setUser(null)
    window.location.href = "/"
  }

  const isAdminOrModerator = user && (user.role === "admin" || user.role === "moderator")

  const navLinks = [
    { name: "Главная", href: "/" },
    { name: "Лидерборд", href: "/leaderboard" },
    { name: "Чат", href: "/chat" },
    { name: "Ставки", href: "/bets" },
    { name: "Награды", href: "/rewards" },
    { name: "Я реферал", href: "/referral" },
    { name: "О нас", href: "/about" },
    { name: "Расписание", href: "/schedule" },
    { name: "Репорт", href: "/report" },
    { name: "Профиль", href: "/profile" },
  ]

  const loadNotifications = async () => {
    try {
      const res = await api("/notifications")
      setUnreadCount(Number(res.unreadCount) || 0)
      setNotifications(Array.isArray(res.items) ? res.items : [])
    } catch {
      setUnreadCount(0)
      setNotifications([])
    }
  }

  useEffect(() => {
    if (!mounted || !user) return
    loadNotifications()
    const t = window.setInterval(loadNotifications, 20000)
    return () => window.clearInterval(t)
  }, [mounted, user?.id])

  return (
    <header className="border-b border-white/5 fixed top-0 left-0 right-0 z-[1000] bg-[#0a0a0f]/90 backdrop-blur-xl h-[56px] flex items-center transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 w-full flex items-center justify-between gap-4">
        {/* Логотип */}
        <Link href="/" className="flex items-center group relative">
          <span className="text-2xl md:text-3xl font-black tracking-tighter italic text-white group-hover:text-neon transition-all duration-300 drop-shadow-[0_0_8px_rgba(57,255,20,0.5)]">
            PAPPY
          </span>
          <div className="absolute -bottom-1 left-0 w-full h-[1.5px] bg-gradient-to-r from-transparent via-neon to-transparent opacity-50 group-hover:opacity-100 transition-opacity"></div>
        </Link>
        
        {/* Десктопная навигация */}
        <nav className="hidden lg:flex items-center gap-0.5 xl:gap-1">
          {navLinks.map((link) => {
            // Если ссылка на профиль, показываем её только если залогинен
            if (link.href === "/profile" && !user) return null;
            
            return (
              <Link 
                key={link.href}
                href={link.href}
                className={`px-2.5 py-1 rounded-md text-[10px] xl:text-[11px] font-black uppercase transition-all duration-200 ${
                  pathname === link.href 
                    ? "bg-neon text-black" 
                    : "text-white/50 hover:text-white hover:bg-white/5"
                }`}
              >
                {link.name}
              </Link>
            )
          })}
          
          {mounted && isAdminOrModerator && (
            <Link 
              href="/admin"
              className={`px-2.5 py-1 rounded-md text-[10px] xl:text-[11px] font-black uppercase transition-all duration-200 ${
                pathname.startsWith("/admin") ? "bg-acid text-black" : "text-acid/70 hover:text-acid hover:bg-acid/10 border border-acid/20"
              }`}
            >
              Админ
            </Link>
          )}
        </nav>

        {/* Правая часть (Баланс / Вход) */}
        <div className="flex items-center gap-2 md:gap-3">
          {mounted && user ? (
            <div className="flex items-center gap-2 md:gap-3">
              <div className="hidden sm:block text-right">
                <div className="text-[9px] font-black text-white uppercase leading-none flex items-center justify-end gap-1">
                  {user.level?.iconUrl && <img src={user.level.iconUrl} alt="" className="w-3 h-3 object-contain" />}
                  {user.username}
                </div>
                <div className="text-[9px] text-acid font-mono font-bold">{user.balance} 🪙</div>
              </div>

              <button
                onClick={() => {
                  const next = !notificationsOpen
                  setNotificationsOpen(next)
                  if (next) loadNotifications()
                }}
                className="relative p-2 text-white/40 hover:text-neon transition-colors"
                title="Уведомления"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10 2a6 6 0 00-6 6v2.586l-.707.707A1 1 0 004 13h12a1 1 0 00.707-1.707L16 10.586V8a6 6 0 00-6-6z" />
                  <path d="M10 18a3 3 0 01-2.995-2.824L7 15h6a3 3 0 01-3 3z" />
                </svg>
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-neon text-black text-[10px] font-black flex items-center justify-center shadow-neon">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>

              <button onClick={logout} className="p-2 text-white/40 hover:text-red-400 transition-colors" title="Выход">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          ) : mounted && (
            <div className="flex items-center gap-2">
              <Link href="/login" className="text-[10px] md:text-xs font-black uppercase text-white/60 hover:text-neon px-2">Войти</Link>
              <Link href="/register" className="btn btn-primary px-3 py-1.5 md:px-5 md:py-2 text-[10px] md:text-xs font-black italic">Регистрация</Link>
            </div>
          )}

          {/* Мобильная кнопка меню */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-white/60 hover:text-neon"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Мобильное меню */}
      {mounted && mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-[2000] bg-[#0a0a0f]/95 backdrop-blur-2xl animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileMenuOpen(false)}></div>
          <div className="absolute inset-0 bg-cyber opacity-20 pointer-events-none"></div>
          <nav className="relative z-10 flex flex-col pt-[72px] px-6 pb-10 gap-2 h-full overflow-y-auto custom-scrollbar">
            <div className="text-[11px] font-black text-white/60 uppercase tracking-[0.3em] mb-4 border-b border-white/10 pb-3">
              Протоколы Навигации
            </div>
            {navLinks.map((link) => (
              <Link 
                key={link.href}
                href={link.href}
                className={`p-4 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all flex items-center justify-between group ${
                  pathname === link.href ? "bg-neon text-black shadow-neon" : "text-white/60 bg-white/5 active:bg-white/10"
                }`}
              >
                {link.name}
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity ${pathname === link.href ? 'text-black' : 'text-neon'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            ))}
            
            {isAdminOrModerator && (
              <Link 
                href="/admin"
                className={`p-4 rounded-2xl text-[11px] font-black uppercase tracking-widest border border-acid/30 transition-all flex items-center justify-between group ${
                  pathname.startsWith("/admin") ? "bg-acid text-black" : "text-acid bg-acid/5 active:bg-acid/10"
                }`}
              >
                Админ Панель
                <div className="w-2 h-2 rounded-full bg-acid animate-pulse shadow-[0_0_8px_#39FF14]"></div>
              </Link>
            )}

            <div className="mt-auto pt-10 space-y-4">
              {user && (
                <div className="glass p-4 rounded-2xl border border-white/10">
                   <div className="text-[10px] font-black text-white/40 uppercase mb-2">Авторизован как:</div>
                   <div className="flex items-center justify-between">
                     <span className="text-sm font-black text-white">{user.username}</span>
                     <span className="text-xs font-mono text-acid">{user.balance} 🪙</span>
                   </div>
                   <button onClick={logout} className="mt-4 w-full p-3 rounded-xl text-[10px] font-black uppercase tracking-widest text-red-400 bg-red-400/10 active:bg-red-400/20 text-center border border-red-500/20 transition-all">
                    Выйти из системы
                  </button>
                </div>
              )}
              {!user && (
                <div className="glass p-4 rounded-2xl border border-white/10 space-y-3">
                  <div className="text-[10px] font-black text-white/40 uppercase tracking-widest">Авторизация</div>
                  <Link href="/login" className="w-full block text-center p-3 rounded-xl text-[10px] font-black uppercase tracking-widest text-white/70 bg-white/5 border border-white/10 active:bg-white/10">
                    Войти
                  </Link>
                  <Link href="/register" className="w-full block text-center p-3 rounded-xl text-[10px] font-black uppercase tracking-widest text-black bg-neon shadow-neon active:scale-95 transition-all">
                    Регистрация
                  </Link>
                </div>
              )}
            </div>
          </nav>
        </div>
      )}

      {mounted && user && notificationsOpen && (
        <div className="fixed inset-0 z-[2200]">
          <div className="absolute inset-0 bg-black/40" onClick={() => setNotificationsOpen(false)}></div>
          <div className="absolute top-[56px] right-0 left-0 lg:left-auto lg:right-4 lg:top-[64px] lg:w-[420px] p-4">
            <div className="glass rounded-3xl border border-white/10 overflow-hidden shadow-2xl">
              <div className="p-4 border-b border-white/10 flex items-center justify-between">
                <div className="text-[11px] font-black uppercase tracking-widest text-white/60">Уведомления</div>
                <button
                  onClick={async () => {
                    try {
                      await api("/notifications/read-all", { method: "POST" })
                      loadNotifications()
                    } catch {}
                  }}
                  className="text-[10px] font-black uppercase tracking-widest text-neon hover:text-white transition-colors"
                >
                  Прочитать все
                </button>
              </div>
              <div className="max-h-[60vh] overflow-y-auto custom-scrollbar">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center text-white/20 font-black uppercase tracking-widest">
                    Пусто
                  </div>
                ) : (
                  <div className="p-2">
                    {notifications.map((n: any) => (
                      <button
                        key={n.id}
                        onClick={async () => {
                          try {
                            await api(`/notifications/${n.id}/read`, { method: "POST" })
                          } catch {}
                          if (n.meta?.reportId) router.push("/report")
                          else if (n.meta?.orderId) router.push("/profile")
                          else if (n.meta?.matchId) router.push("/bets")
                          setNotificationsOpen(false)
                          loadNotifications()
                        }}
                        className={`w-full text-left p-4 rounded-2xl border transition-all ${
                          n.read ? "bg-white/5 border-white/5 text-white/50" : "bg-neon/10 border-neon/20 text-white hover:border-neon/40"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-1">
                            <div className="text-[11px] font-black uppercase tracking-widest">{n.title}</div>
                            <div className="text-sm text-white/80">{n.body}</div>
                            <div className="text-[10px] text-white/30 font-mono">{n.createdAt ? new Date(n.createdAt).toLocaleString() : ""}</div>
                          </div>
                          {!n.read && <div className="w-2 h-2 rounded-full bg-neon shadow-neon mt-1"></div>}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {mounted && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-[1500]">
          <div className="absolute inset-0 bg-[#0a0a0f]/95 backdrop-blur-xl border-t border-white/10"></div>
          <div className="relative max-w-7xl mx-auto px-2 py-2">
            <div className="grid grid-cols-5 gap-2">
              <Link href="/" className={`flex flex-col items-center justify-center rounded-2xl py-2 transition-all ${pathname === "/" ? "bg-neon text-black shadow-neon" : "bg-white/5 text-white/60 active:bg-white/10"}`}>
                <span className="text-lg leading-none">🏠</span>
                <span className="text-[9px] font-black uppercase tracking-widest mt-1">Дом</span>
              </Link>
              <Link href="/chat" className={`flex flex-col items-center justify-center rounded-2xl py-2 transition-all ${pathname === "/chat" ? "bg-neon text-black shadow-neon" : "bg-white/5 text-white/60 active:bg-white/10"}`}>
                <span className="text-lg leading-none">💬</span>
                <span className="text-[9px] font-black uppercase tracking-widest mt-1">Чат</span>
              </Link>
              <Link href="/bets" className={`flex flex-col items-center justify-center rounded-2xl py-2 transition-all ${pathname === "/bets" ? "bg-neon text-black shadow-neon" : "bg-white/5 text-white/60 active:bg-white/10"}`}>
                <span className="text-lg leading-none">🎲</span>
                <span className="text-[9px] font-black uppercase tracking-widest mt-1">Ставки</span>
              </Link>
              <Link href="/rewards" className={`flex flex-col items-center justify-center rounded-2xl py-2 transition-all ${pathname === "/rewards" ? "bg-neon text-black shadow-neon" : "bg-white/5 text-white/60 active:bg-white/10"}`}>
                <span className="text-lg leading-none">🎁</span>
                <span className="text-[9px] font-black uppercase tracking-widest mt-1">Награды</span>
              </Link>
              <button onClick={() => setBottomMoreOpen(true)} className={`flex flex-col items-center justify-center rounded-2xl py-2 transition-all ${bottomMoreOpen ? "bg-white/10 text-white border border-white/20" : "bg-white/5 text-white/60 active:bg-white/10"}`}>
                <span className="text-lg leading-none">⋯</span>
                <span className="text-[9px] font-black uppercase tracking-widest mt-1">Ещё</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {mounted && bottomMoreOpen && (
        <div className="fixed inset-0 z-[2300]">
          <div className="absolute inset-0 bg-black/50" onClick={() => setBottomMoreOpen(false)}></div>
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <div className="glass rounded-[32px] border border-white/10 overflow-hidden shadow-2xl">
              <div className="p-4 border-b border-white/10 flex items-center justify-between">
                <div className="text-[11px] font-black uppercase tracking-widest text-white/60">Меню</div>
                <button onClick={() => setBottomMoreOpen(false)} className="text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-colors">
                  Закрыть
                </button>
              </div>
              <div className="p-4 space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar">
                {user ? (
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                    <div className="text-[10px] font-black uppercase tracking-widest text-white/30">Аккаунт</div>
                    <div className="flex items-center justify-between mt-2">
                      <div className="text-sm font-black text-white">{user.username}</div>
                      <div className="text-xs font-mono text-acid">{user.balance} 🪙</div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mt-3">
                      <Link href="/profile" onClick={() => setBottomMoreOpen(false)} className="text-center p-3 rounded-xl bg-neon text-black text-[10px] font-black uppercase tracking-widest shadow-neon">
                        Профиль
                      </Link>
                      <button onClick={logout} className="p-3 rounded-xl bg-red-500/15 border border-red-500/25 text-red-300 text-[10px] font-black uppercase tracking-widest">
                        Выход
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                    <div className="text-[10px] font-black uppercase tracking-widest text-white/30">Аккаунт</div>
                    <div className="grid grid-cols-2 gap-2 mt-3">
                      <Link href="/login" onClick={() => setBottomMoreOpen(false)} className="text-center p-3 rounded-xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-white/70">
                        Войти
                      </Link>
                      <Link href="/register" onClick={() => setBottomMoreOpen(false)} className="text-center p-3 rounded-xl bg-neon text-black text-[10px] font-black uppercase tracking-widest shadow-neon">
                        Регистрация
                      </Link>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2">
                  {[
                    { href: "/leaderboard", label: "Топ", icon: "🏆" },
                    { href: "/referral", label: "Рефералы", icon: "🧬" },
                    { href: "/about", label: "О нас", icon: "ℹ️" },
                    { href: "/schedule", label: "Расписание", icon: "📅" },
                    { href: "/report", label: "Репорт", icon: "🧾" }
                  ].map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setBottomMoreOpen(false)}
                      className={`p-4 rounded-2xl border transition-all flex items-center justify-between ${
                        pathname === item.href ? "bg-neon text-black border-neon shadow-neon" : "bg-white/5 border-white/10 text-white/70 active:bg-white/10"
                      }`}
                    >
                      <span className="text-[11px] font-black uppercase tracking-widest">{item.label}</span>
                      <span className="text-lg leading-none">{item.icon}</span>
                    </Link>
                  ))}
                </div>

                {isAdminOrModerator && (
                  <Link
                    href="/admin"
                    onClick={() => setBottomMoreOpen(false)}
                    className={`p-4 rounded-2xl border transition-all flex items-center justify-between ${
                      pathname.startsWith("/admin") ? "bg-acid text-black border-acid/20 shadow-acid" : "bg-acid/10 text-acid border-acid/20 active:bg-acid/15"
                    }`}
                  >
                    <span className="text-[11px] font-black uppercase tracking-widest">Админ</span>
                    <span className="text-lg leading-none">🛠️</span>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
