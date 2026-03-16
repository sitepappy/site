import "./globals.css"
import Link from "next/link"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "PAPPY",
  description: "Киберпанк сообщество PAPPY"
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body>
        <div className="min-h-screen bg-base bg-cyber">
          <header className="border-b border-white/10">
            <div className="max-w-6xl mx-auto px-4 py-4 flex items-center gap-6">
              <Link href="/" className="text-3xl font-extrabold glow">
                <span className="bg-gradient-to-r from-neon to-acid bg-clip-text text-transparent">PAPPY</span>
              </Link>
              <nav className="flex gap-4 text-sm">
                <Link className="hover:underline" href="/">Главная</Link>
                <Link className="hover:underline" href="/bets">Ставки</Link>
                <Link className="hover:underline" href="/quests">Квесты</Link>
                <Link className="hover:underline" href="/rewards">Награды</Link>
                <Link className="hover:underline" href="/leaderboard">Лидерборд</Link>
                <Link className="hover:underline" href="/referral">Я реферал</Link>
                <Link className="hover:underline" href="/about">О нас</Link>
                <Link className="hover:underline" href="/coop">Сотрудничество</Link>
                <Link className="hover:underline" href="/profile">Профиль</Link>
                <Link className="hover:underline text-acid" href="/admin">Админ</Link>
              </nav>
              <div className="ml-auto flex gap-2">
                <Link href="/login" className="btn glass">Войти</Link>
                <Link href="/register" className="btn btn-primary">Регистрация</Link>
              </div>
            </div>
          </header>
          <main className="max-w-6xl mx-auto px-4 py-6">{children}</main>
        </div>
      </body>
    </html>
  )
}
