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
  const [userCount, setUserCount] = useState(55)
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
    const loadData = async () => {
      // Load user
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
      if (token) {
        try {
          const data = await api("/users/me")
          setUser(data)
        } catch (e: any) {
          if (e.message === "UNAUTHORIZED") {
            localStorage.removeItem("token")
          }
          setUser(null)
        }
      } else {
        setUser(null)
      }

      // Load stats
      try {
        const stats = await api("/public/stats")
        setUserCount(stats.userCount || 55)
      } catch (e) {
        console.error("Failed to load stats", e)
      }
    }
    loadData()

    // Listen for balance updates from other components
    window.addEventListener("balanceUpdate", loadData)
    return () => window.removeEventListener("balanceUpdate", loadData)
  }, [pathname])

  // Закрываем меню при переходе по ссылке
  useEffect(() => {
    setMobileMenuOpen(false)
    setNotificationsOpen(false)
    setBottomMoreOpen(false)
  }, [pathname])

  // Блокируем скролл при открытом меню
  useEffect(() => {
    if (mobileMenuOpen || bottomMoreOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => { document.body.style.overflow = 'unset' }
  }, [mobileMenuOpen, bottomMoreOpen])

  const logout = () => {
    localStorage.removeItem("token")
    setUser(null)
    window.location.href = "/"
  }

  const isAdminOrModerator = user && (user.role === "admin" || user.role === "moderator")

  const mainLinks = [
    { name: "Главная", href: "/" },
    { name: "Чат", href: "/chat" },
    { name: "Ставки", href: "/bets" },
    { name: "Награды", href: "/rewards" },
    { name: "Лидерборд", href: "/leaderboard" },
    { name: "Квесты", href: "/quests" },
  ]

  const extraLinks = [
    { name: "Я реферал", href: "/referral" },
    { name: "О нас", href: "/about" },
    { name: "Репорт", href: "/report" },
    { name: "Заявки", href: "/apply" },
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
    <>
      <header className="fixed top-0 left-0 right-0 z-[1000] border-b border-white/5 bg-black/40 backdrop-blur-xl h-[56px] flex items-center transition-all">
        <div className="max-w-7xl mx-auto px-4 w-full flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex flex-col items-center leading-none">
              <span className="text-[12px] xl:text-[14px] font-black text-neon">{userCount}</span>
              <span className="text-[7px] xl:text-[8px] font-bold text-white/30 uppercase tracking-tighter">Юзеров</span>
            </div>
            <Link href="/" className="flex items-center gap-2 group relative">
              <span className="text-xl xl:text-2xl font-black tracking-tighter italic text-white group-hover:text-neon transition-all duration-300 drop-shadow-[0_0_8px_rgba(57,255,20,0.5)]">
                PAPPY
              </span>
            </Link>
          </div>

          {/* Десктопная навигация */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            {mainLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-2 py-1.5 rounded-lg text-[10px] xl:text-[11px] font-black uppercase tracking-widest transition-all ${
                  pathname === link.href ? "bg-neon text-black shadow-neon" : "text-white/50 hover:text-white hover:bg-white/5"
                }`}
              >
                {link.name}
              </Link>
            ))}

            {/* Выпадающее меню "Ещё" */}
            <div className="relative group">
              <button className="px-2 py-1.5 rounded-lg text-[10px] xl:text-[11px] font-black uppercase tracking-widest text-white/50 hover:text-white hover:bg-white/5 flex items-center gap-1 transition-all">
                <span>Ещё</span>
                <span className="text-[8px] opacity-50 group-hover:rotate-180 transition-transform duration-300">▼</span>
              </button>
              <div className="absolute top-full left-0 pt-2 opacity-0 translate-y-2 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-all duration-300">
                <div className="w-40 glass rounded-xl border border-white/10 p-2 shadow-2xl backdrop-blur-2xl">
                  {extraLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`block px-3 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                        pathname === link.href ? "bg-neon/20 text-neon" : "text-white/60 hover:text-white hover:bg-white/5"
                      }`}
                    >
                      {link.name}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
            
            {mounted && isAdminOrModerator && (
              <Link 
                href="/admin"
                className={`ml-1 px-3 py-1.5 rounded-lg text-[10px] xl:text-[11px] font-black uppercase transition-all border border-acid/30 ${
                  pathname.startsWith("/admin") ? "bg-acid text-black shadow-acid" : "text-acid hover:bg-acid/10"
                }`}
              >
                Админ
              </Link>
            )}
          </nav>

          <div className="flex items-center gap-2">
            {mounted && user ? (
              <div className="flex items-center gap-2">
                <div className="hidden sm:block text-right">
                  <div className="text-[9px] font-black text-white uppercase leading-none">{user.username}</div>
                  <div className="text-[9px] text-acid font-mono font-bold">{user.balance} 🪙</div>
                </div>
                <button 
                  onClick={() => setNotificationsOpen(!notificationsOpen)}
                  className="relative p-1.5 text-white/40 hover:text-neon transition-colors"
                >
                  <span className="text-lg">🔔</span>
                </button>
                <button onClick={logout} className="p-1.5 text-white/40 hover:text-red-400 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" /></svg>
                </button>
              </div>
            ) : mounted && (
              <div className="flex items-center gap-2">
                <Link href="/login" className="text-[10px] font-black uppercase text-white/60 hover:text-neon px-2">Войти</Link>
                <Link href="/register" className="px-3 py-1.5 rounded-xl bg-neon text-black text-[10px] font-black uppercase tracking-widest shadow-neon active:scale-95 transition-all">Регистрация</Link>
              </div>
            )}
            
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="lg:hidden p-2 text-white/60 hover:text-neon">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {mobileMenuOpen ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /> : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Мобильное меню (старое) */}
      {mounted && mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-[2000] bg-[#0a0a0f]/95 backdrop-blur-2xl animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileMenuOpen(false)}></div>
          <nav className="relative z-10 flex flex-col pt-[72px] px-6 pb-10 gap-2 h-full overflow-y-auto">
            <div className="text-[11px] font-black text-white/60 uppercase tracking-[0.3em] mb-4 border-b border-white/10 pb-3">Навигация</div>
            {[
              { href: "/", label: "Главная", icon: "🏠" },
              { href: "/chat", label: "Чат", icon: "💬" },
              { href: "/bets", label: "Ставки", icon: "🎮" },
              { href: "/rewards", label: "Награды", icon: "🎁" },
              { href: "/leaderboard", label: "Топ", icon: "🏆" },
              { href: "/referral", label: "Рефералы", icon: "🧬" },
              { href: "/quests", label: "Квесты", icon: "🎯" },
              { href: "/about", label: "О проекте", icon: "ℹ️" }
            ].map((link) => (
              <Link key={link.href} href={link.href} onClick={() => setMobileMenuOpen(false)} className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${pathname === link.href ? "bg-neon text-black border-neon" : "bg-white/5 border-white/5 text-white active:bg-white/10"}`}>
                <span className="text-[11px] font-black uppercase tracking-widest">{link.label}</span>
                <span className="text-xl">{link.icon}</span>
              </Link>
            ))}
          </nav>
        </div>
      )}

      {/* Нижняя панель (Только для мобильных устройств) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-[1500] pwa-bottom-nav bg-[#0a0a0f]/95 backdrop-blur-xl border-t border-white/10">
        <div className="grid grid-cols-5 h-[64px] max-w-lg mx-auto">
          {[
            { href: "/", icon: "🏠", label: "Дом" },
            { href: "/chat", icon: "💬", label: "Чат" },
            { href: "/bets", icon: "🎮", label: "Игры" },
            { href: "/rewards", icon: "🎁", label: "Бонус" },
            { id: "more", icon: "⚙️", label: "Ещё" }
          ].map((item) => (
            <button
              key={item.label}
              onClick={() => {
                if (item.id === "more") setBottomMoreOpen(true);
                else router.push(item.href as string);
              }}
              className={`flex flex-col items-center justify-center gap-1 transition-all ${
                (item.href && pathname === item.href) || (item.id === "more" && bottomMoreOpen) ? "text-neon" : "text-white/40"
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="text-[9px] font-black uppercase tracking-tighter">{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ПАНЕЛЬ "ЕЩЁ" (v6.0 - Гарантированный фикс) */}
      {mounted && bottomMoreOpen && (
        <div className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-sm flex items-end animate-in fade-in duration-300">
          <div className="absolute inset-0" onClick={() => setBottomMoreOpen(false)}></div>
          <div 
            className="relative w-full bg-[#0a0a0f] border-t border-white/10 rounded-t-[32px] p-6 space-y-4 animate-in slide-in-from-bottom-full duration-500 max-h-[90vh] overflow-y-auto"
            style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 20px)' }}
          >
            <div className="w-12 h-1.5 bg-white/10 rounded-full mx-auto mb-4"></div>
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-black uppercase tracking-widest text-white/40">Меню</div>
              <button onClick={() => setBottomMoreOpen(false)} className="text-white/40 text-xl">✕</button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                { href: "/leaderboard", label: "Топ", icon: "🏆" },
                { href: "/referral", label: "Рефералы", icon: "🧬" },
                { href: "/about", label: "О нас", icon: "ℹ️" },
                { href: "/quests", label: "Квесты", icon: "🎯" },
                { href: "/schedule", label: "Расписание", icon: "📅" },
                { href: "/report", label: "Репорт", icon: "🧾" },
                { href: "/apply", label: "Заявки", icon: "📄" },
                { href: "/profile", label: "Профиль", icon: "👤" },
                ...(isAdminOrModerator ? [{ href: "/admin", label: "Админ", icon: "⚡" }] : [])
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setBottomMoreOpen(false)}
                  className="flex flex-col items-center justify-center gap-2 p-5 rounded-2xl bg-white/5 border border-white/5 active:bg-white/10 transition-all"
                >
                  <span className="text-2xl">{item.icon}</span>
                  <span className="text-[10px] font-black uppercase tracking-widest">{item.label}</span>
                </Link>
              ))}
            </div>

            {user && (
              <button 
                onClick={() => { logout(); setBottomMoreOpen(false); }} 
                className="w-full p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 font-black uppercase text-[10px] tracking-widest"
              >Выйти из аккаунта</button>
            )}

            <button 
              onClick={() => {
                if ('serviceWorker' in navigator) {
                  navigator.serviceWorker.getRegistrations().then(regs => regs.forEach(r => r.unregister()));
                }
                window.location.reload();
              }}
              className="w-full p-2 text-[8px] font-black uppercase text-white/10 tracking-widest text-center"
            >Сбросить кеш</button>
          </div>
        </div>
      )}
    </>
  )
}
