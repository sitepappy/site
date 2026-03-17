"use client"
import Link from "next/link"
import { useEffect, useState } from "react"
import { api } from "../../lib/api"
import { useRouter, usePathname } from "next/navigation"

export default function Header() {
  const [user, setUser] = useState<any>(null)
  const [mounted, setMounted] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
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
  }, [pathname])

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

  return (
    <header className="border-b border-white/10 sticky top-0 z-50 bg-base/80 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 py-2 flex items-center justify-between gap-4">
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
        <div className="lg:hidden fixed inset-0 top-[61px] z-[100] bg-base/95 backdrop-blur-xl animate-in fade-in slide-in-from-top-4">
          <nav className="flex flex-col p-4 gap-2">
            {navLinks.map((link) => (
              <Link 
                key={link.href}
                href={link.href}
                className={`p-4 rounded-lg text-sm font-black uppercase tracking-widest ${
                  pathname === link.href ? "bg-neon text-black" : "text-white/60 bg-white/5"
                }`}
              >
                {link.name}
              </Link>
            ))}
            {user && (
              <Link 
                href="/profile"
                className={`p-4 rounded-lg text-sm font-black uppercase tracking-widest ${
                  pathname === "/profile" ? "bg-neon text-black" : "text-white/60 bg-white/5"
                }`}
              >
                Профиль ({user.balance} 🪙)
              </Link>
            )}
            {isAdminOrModerator && (
              <Link 
                href="/admin"
                className={`p-4 rounded-lg text-sm font-black uppercase tracking-widest border border-acid/30 ${
                  pathname.startsWith("/admin") ? "bg-acid text-black" : "text-acid bg-acid/10"
                }`}
              >
                Админ Панель
              </Link>
            )}
            {user && (
              <button onClick={logout} className="p-4 rounded-lg text-sm font-black uppercase tracking-widest text-red-400 bg-red-400/10 text-left">
                Выйти из аккаунта
              </button>
            )}
          </nav>
        </div>
      )}
    </header>
  )
}
