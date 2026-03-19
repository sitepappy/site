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
    <>
      {/* 1. ВЕРХНЯЯ ШАПКА (Header) */}
      <header 
        className="fixed top-0 left-0 right-0 z-[8000] border-b border-white/5 bg-[#0a0a0f]/90 backdrop-blur-xl transition-all pwa-top-bar"
        style={{ height: 'var(--header-h, 56px)' }}
      >
        <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-neon flex items-center justify-center shadow-neon group-hover:scale-105 transition-all">
              <span className="text-black font-black text-xl italic">P</span>
            </div>
            <span className="font-black text-xl text-white tracking-tighter italic hidden sm:block">PAPPY</span>
          </Link>

          {/* Десктопная навигация */}
          <nav className="hidden lg:flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/5">
            {[
              { href: "/", label: "Главная" },
              { href: "/chat", label: "Чат" },
              { href: "/bets", label: "Ставки" },
              { href: "/rewards", label: "Награды" },
              { href: "/quests", label: "Квесты" }
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2 rounded-lg text-[11px] font-black uppercase tracking-widest transition-all ${
                  pathname === link.href ? "bg-neon text-black shadow-neon" : "text-white/40 hover:text-white hover:bg-white/5"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Правая часть: Баланс и Уведомления */}
          <div className="flex items-center gap-3">
            {mounted && user ? (
              <>
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10">
                  <span className="text-xs font-black text-white italic">{user.balance}</span>
                  <span className="text-xs">🪙</span>
                </div>
                
                <button 
                  onClick={() => setNotificationsOpen(!notificationsOpen)}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all ${
                    notificationsOpen ? "bg-neon border-neon text-black" : "bg-white/5 border-white/5 text-white/60 hover:border-white/20"
                  }`}
                >
                  <span className="text-xl">🔔</span>
                </button>

                <Link href="/profile" className="hidden sm:flex w-10 h-10 rounded-xl bg-neon items-center justify-center shadow-neon active:scale-95 transition-all">
                  <span className="text-black font-black">👤</span>
                </Link>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login" className="hidden sm:block text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-colors">Войти</Link>
                <Link href="/register" className="px-4 py-2 rounded-xl bg-neon text-black text-[10px] font-black uppercase tracking-widest shadow-neon active:scale-95 transition-all">Регистрация</Link>
              </div>
            )}
            
            {/* Кнопка меню (только не в PWA) */}
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/60 border border-white/5 pwa-hidden-btn"
            >
              {mobileMenuOpen ? "✕" : "☰"}
            </button>
          </div>
        </div>
      </header>

      {/* 2. НИЖНЯЯ ПАНЕЛЬ (Только для PWA/Мобилок) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-[8000] pwa-bottom-nav bg-[#0a0a0f] border-t border-white/10">
        <div className="grid grid-cols-5 h-full max-w-lg mx-auto">
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
              <span className="text-2xl">{item.icon}</span>
              <span className="text-[9px] font-black uppercase tracking-tighter">{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 3. ОВЕРЛЕЙ МЕНЮ "ЕЩЁ" (v4.0) */}
      {mounted && bottomMoreOpen && (
        <div className="fixed inset-0 z-[9999] bg-[#0a0a0f] animate-in fade-in slide-in-from-bottom-10 duration-300">
          <div className="h-full flex flex-col pwa-safe-area-all">
            {/* Заголовок меню */}
            <div 
              style={{ paddingTop: 'var(--safe-top, 20px)' }}
              className="px-6 pb-6 flex items-center justify-between border-b border-white/5"
            >
              <div>
                <div className="text-[10px] font-black text-neon uppercase tracking-[0.3em]">Система PAPPY</div>
                <div className="text-2xl font-black text-white italic">МЕНЮ v4.0</div>
              </div>
              <button 
                onClick={() => setBottomMoreOpen(false)}
                className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white text-2xl"
              >✕</button>
            </div>

            {/* Контент меню */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {user && (
                <div className="p-6 rounded-[32px] bg-white/5 border border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-neon flex items-center justify-center text-3xl">👤</div>
                    <div>
                      <div className="text-xl font-black text-white">{user.username}</div>
                      <div className="text-acid font-mono font-bold">{user.balance} 🪙</div>
                    </div>
                  </div>
                  <Link href="/profile" onClick={() => setBottomMoreOpen(false)} className="px-6 py-3 rounded-2xl bg-neon text-black font-black uppercase text-xs shadow-neon italic">Профиль</Link>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                {[
                  { href: "/leaderboard", label: "Топ Игроков", icon: "🏆" },
                  { href: "/referral", label: "Рефералы", icon: "🧬" },
                  { href: "/about", label: "Инфо", icon: "ℹ️" },
                  { href: "/quests", label: "Квесты", icon: "🎯" },
                  { href: "/schedule", label: "События", icon: "📅" },
                  { href: "/report", label: "Поддержка", icon: "🧾" }
                ].map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setBottomMoreOpen(false)}
                    className="flex flex-col items-center justify-center gap-3 p-6 rounded-[32px] bg-white/5 border border-white/5 active:bg-neon/10 active:border-neon transition-all"
                  >
                    <span className="text-4xl">{item.icon}</span>
                    <span className="text-[11px] font-black uppercase tracking-widest text-center">{item.label}</span>
                  </Link>
                ))}
              </div>

              {isAdminOrModerator && (
                <Link href="/admin" onClick={() => setBottomMoreOpen(false)} className="flex items-center justify-between p-6 rounded-[32px] bg-acid/10 border border-acid/30 text-acid active:bg-acid/20 transition-all">
                  <span className="font-black uppercase tracking-widest italic">Панель Управления</span>
                  <span className="text-2xl">🛠️</span>
                </Link>
              )}

              {user && (
                <button onClick={() => { logout(); setBottomMoreOpen(false); }} className="w-full p-6 rounded-[32px] bg-red-500/10 border border-red-500/20 text-red-500 font-black uppercase tracking-widest italic transition-all">Выйти из аккаунта</button>
              )}
            </div>

            {/* Футер меню */}
            <div 
              style={{ paddingBottom: 'calc(var(--safe-bottom, 20px) + 20px)' }}
              className="px-6 pt-4 border-t border-white/5 text-center"
            >
              <button 
                onClick={() => {
                  if ('serviceWorker' in navigator) {
                    navigator.serviceWorker.getRegistrations().then(regs => regs.forEach(r => r.unregister()));
                  }
                  window.location.reload();
                }}
                className="text-[10px] font-black uppercase tracking-widest text-white/20 hover:text-white transition-colors"
              >Сбросить и обновить приложение</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
