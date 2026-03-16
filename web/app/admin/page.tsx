"use client"
import { useEffect, useState } from "react"
import { api } from "../../lib/api"
import { useRouter } from "next/navigation"

export default function AdminPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("users")
  const router = useRouter()

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

  if (loading) return <div className="p-10 text-center text-neon animate-pulse uppercase font-bold tracking-widest">Инициализация протоколов доступа...</div>

  const isOnlyModerator = user?.role === "moderator"

  return (
    <div className="glass rounded-lg border border-white/5 overflow-hidden">
      <div className="bg-white/5 border-b border-white/10 p-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-acid tracking-tighter uppercase">Панель управления</h1>
        <div className="text-[10px] px-2 py-1 rounded border border-acid/50 text-acid font-mono uppercase">
          Доступ: {user?.role}
        </div>
      </div>

      <div className="flex flex-col md:flex-row min-h-[600px]">
        {/* Боковое меню */}
        <div className="w-full md:w-64 bg-black/20 border-r border-white/5 p-2 space-y-1">
          <button onClick={() => setActiveTab("users")} className={`w-full text-left p-3 rounded text-sm transition-all ${activeTab === "users" ? "bg-neon text-black font-bold" : "hover:bg-white/5 text-white/60"}`}>Пользователи</button>
          <button onClick={() => setActiveTab("posts")} className={`w-full text-left p-3 rounded text-sm transition-all ${activeTab === "posts" ? "bg-neon text-black font-bold" : "hover:bg-white/5 text-white/60"}`}>Посты / Лента</button>
          <button onClick={() => setActiveTab("matches")} className={`w-full text-left p-3 rounded text-sm transition-all ${activeTab === "matches" ? "bg-neon text-black font-bold" : "hover:bg-white/5 text-white/60"}`}>Ставки / Матчи</button>
          <button onClick={() => setActiveTab("orders")} className={`w-full text-left p-3 rounded text-sm transition-all ${activeTab === "orders" ? "bg-neon text-black font-bold" : "hover:bg-white/5 text-white/60"}`}>Заказы</button>
          <button onClick={() => setActiveTab("quests")} className={`w-full text-left p-3 rounded text-sm transition-all ${activeTab === "quests" ? "bg-neon text-black font-bold" : "hover:bg-white/5 text-white/60"}`}>Квесты</button>
        </div>

        {/* Контент */}
        <div className="flex-1 p-6 relative">
          {/* Плашка ограничения для модератора */}
          {isOnlyModerator && (activeTab === "users") && (
            <div className="absolute inset-0 z-10 bg-base/60 backdrop-blur-[2px] flex items-center justify-center p-6 text-center">
              <div className="glass p-8 rounded-lg border border-red-500/30 max-w-sm">
                <div className="text-red-500 text-4xl mb-4">⚠️</div>
                <h2 className="text-xl font-bold mb-2 uppercase">Отказ в доступе</h2>
                <p className="text-white/60 text-sm">Модераторам запрещено изменять данные пользователей, балансы и роли. Обратитесь к главному администратору.</p>
              </div>
            </div>
          )}

          {activeTab === "users" && <h2 className="text-2xl font-bold mb-4">Управление пользователями</h2>}
          {activeTab === "posts" && <h2 className="text-2xl font-bold mb-4">Создать пост</h2>}
          {activeTab === "matches" && <h2 className="text-2xl font-bold mb-4">Добавить матч</h2>}
          {activeTab === "orders" && <h2 className="text-2xl font-bold mb-4">Обработка заказов</h2>}
          {activeTab === "quests" && <h2 className="text-2xl font-bold mb-4">Управление квестами</h2>}
          
          <div className="text-white/40 italic">Здесь находятся инструменты управления {activeTab}...</div>
        </div>
      </div>
    </div>
  )
}
