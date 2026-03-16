"use client"
import Link from "next/link"
import { useEffect, useState } from "react"
import { api } from "../../lib/api"
import { useRouter, usePathname } from "next/navigation"

export default function Header() {
  const [user, setUser] = useState<any>(null)
  const [mounted, setMounted] = useState(false)
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
      } catch (e) {
        setUser(null)
      }
    }
    loadUser()
  }, [pathname])

  const logout = () => {
    localStorage.removeItem("token")
    setUser(null)
    router.push("/")
    router.refresh()
  }

  const isAdminOrModerator = user && (user.role === "admin" || user.role === "moderator")

  // Функция для активного класса
  const getLinkClass = (p: string) => {
    const base = "hover:text-neon transition-colors"
    if (!mounted) return `${base} text-white/70`
    return `${base} ${pathname === p ? "text-neon font-bold" : "text-white/70"}`
  }

  return (
    <header className="border-b border-white/10 sticky top-0 z-50 bg-base/80 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center gap-6">
        <Link href="/" className="text-3xl font-extrabold glow">
          <span className="bg-gradient-to-r from-neon to-acid bg-clip-text text-transparent">PAPPY</span>
        </Link>
        
        <nav className="hidden md:flex gap-4 text-xs lg:text-sm font-medium">
          <Link className={getLinkClass("/")} href="/">Главная</Link>
          <Link className={getLinkClass("/bets")} href="/bets">Ставки</Link>
          <Link className={getLinkClass("/quests")} href="/quests">Квесты</Link>
          <Link className={getLinkClass("/rewards")} href="/rewards">Награды</Link>
          <Link className={getLinkClass("/leaderboard")} href="/leaderboard">Лидерборд</Link>
          <Link className={getLinkClass("/referral")} href="/referral">Я реферал</Link>
          <Link className={getLinkClass("/about")} href="/about">О нас</Link>
          <Link className={getLinkClass("/coop")} href="/coop">Сотрудничество</Link>
          
          {mounted && user && (
            <Link className={getLinkClass("/profile")} href="/profile">Профиль</Link>
          )}

          {mounted && isAdminOrModerator && (
            <Link className={`hover:text-acid transition-colors font-bold ${mounted && pathname?.startsWith("/admin") ? "text-acid" : "text-acid/70"}`} href="/admin">Админ</Link>
          )}
        </nav>

        <div className="ml-auto flex items-center gap-3">
          {!mounted ? (
            <div className="w-20 h-8 bg-white/5 animate-pulse rounded" />
          ) : user ? (
            <div className="flex items-center gap-3">
              <div className="hidden sm:block text-right">
                <div className="text-xs font-bold text-white leading-none">{user.username}</div>
                <div className="text-[10px] text-acid font-mono">{user.balance} 🪙</div>
              </div>
              <button onClick={logout} className="text-[10px] uppercase font-bold text-white/40 hover:text-red-400 transition-colors">Выход</button>
            </div>
          ) : (
            <>
              <Link href="/login" className="text-xs font-bold uppercase hover:text-neon transition-colors">Войти</Link>
              <Link href="/register" className="btn btn-primary px-4 py-2 text-xs">Регистрация</Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
