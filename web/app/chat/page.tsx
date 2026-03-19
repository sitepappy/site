"use client"
import { useEffect, useState, useRef } from "react"
import { api } from "../../lib/api"
import Link from "next/link"

export default function GlobalChatPage() {
  const [messages, setMessages] = useState<any[]>([])
  const [input, setInput] = useState("")
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [staff, setStaff] = useState<any[]>([])
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    loadUser()
    loadMessages()
    loadStaff()
    const interval = setInterval(() => {
      loadMessages()
      loadStaff()
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  const loadStaff = async () => {
    try {
      const data = await api("/public/staff")
      setStaff(data)
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const loadUser = async () => {
    try {
      const u = await api("/users/me")
      setUser(u)
    } catch (e) {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const loadMessages = async () => {
    try {
      const data = await api("/chat")
      const levels = await api("/levels")
      setMessages(data.map((m: any) => {
        const userLevel = levels.find((l: any) => l.id === m.levelId)
        return { ...m, levelIcon: userLevel?.iconUrl, levelName: userLevel?.name }
      }))
    } catch (e) {
      console.error(e)
    }
  }

  const sendMessage = async (e: any) => {
    e.preventDefault()
    if (!input.trim() || !user) return
    
    const text = input
    setInput("")
    
    try {
      await api("/chat", {
        method: "POST",
        body: JSON.stringify({ message: text })
      })
      loadMessages()
    } catch (e: any) {
      alert(e.message)
    }
  }

  const deleteMessage = async (id: string) => {
    if (!confirm("Удалить сообщение?")) return
    try {
      await api(`/chat/${id}`, { method: "DELETE" })
      loadMessages()
    } catch (e: any) {
      alert(e.message)
    }
  }

  const isMod = user && (user.role === "admin" || user.role === "moderator")

  return (
    <div className="max-w-6xl mx-auto h-[calc(100vh-120px)] flex flex-col gap-4 animate-in fade-in duration-500">
      <div className="flex items-center justify-between px-2">
        <h1 className="text-xl font-black uppercase italic tracking-tighter text-white flex items-center gap-3">
          <span className="w-2 h-2 rounded-full bg-neon animate-pulse shadow-neon"></span>
          Общий Чат
        </h1>
        <div className="text-[10px] font-black uppercase tracking-widest text-white/30">
          {messages.length} сообщений онлайн
        </div>
      </div>

      <div className="flex flex-1 gap-4 overflow-hidden">
        {/* ЧАТ */}
        <div className="flex-1 glass rounded-3xl border border-white/5 flex flex-col overflow-hidden shadow-2xl relative">
          <div className="absolute inset-0 bg-gradient-to-b from-base/50 to-transparent pointer-events-none"></div>
          
          <div 
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 custom-scrollbar"
          >
            {messages.map((m, idx) => {
              const isMe = user && m.userId === user.id
              const showAvatar = idx === 0 || messages[idx-1].userId !== m.userId
              
              return (
                <div key={m.id} className={`flex gap-3 ${isMe ? "flex-row-reverse" : "flex-row"} animate-in fade-in slide-in-from-bottom-2`}>
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full border border-white/10 overflow-hidden bg-white/5 flex items-center justify-center text-[10px] font-bold ${!showAvatar && "opacity-0 h-0"}`}>
                    {m.avatar ? (
                      <img src={m.avatar} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-neon">{m.username?.[0]?.toUpperCase()}</span>
                    )}
                  </div>
                  
                  <div className={`flex flex-col max-w-[80%] ${isMe ? "items-end" : "items-start"}`}>
                    {showAvatar && (
                      <div className="flex items-center gap-2 mb-1 px-1">
                        <div className="flex items-center gap-1 bg-white/5 px-1.5 py-0.5 rounded border border-white/5">
                          {m.levelIcon && <img src={m.levelIcon} alt="" className="w-2.5 h-2.5 object-contain" />}
                          {m.levelName && <span className="text-[8px] font-black text-neon uppercase">{m.levelName}</span>}
                        </div>
                        <Link href={`/profile/${m.userId}`} className={`text-[10px] font-black uppercase hover:underline ${m.role === 'admin' ? 'text-acid' : m.role === 'moderator' ? 'text-blue-400' : 'text-white/60'}`}>
                          {m.username}
                        </Link>
                        <span className="text-[8px] text-white/20 font-mono">{new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    )}
                    
                    <div className="relative group">
                      <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                        isMe 
                          ? "bg-neon text-black font-medium rounded-tr-none shadow-[0_0_15px_rgba(57,255,20,0.1)]" 
                          : "bg-white/5 border border-white/5 text-white/80 rounded-tl-none"
                      }`}>
                        {m.message}
                      </div>
                      
                      {isMod && (
                        <button 
                          onClick={() => deleteMessage(m.id)}
                          className={`absolute -top-2 ${isMe ? "-left-6" : "-right-6"} p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110`}
                          title="Удалить"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
            {messages.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-white/10 italic space-y-4">
                <div className="text-6xl">💬</div>
                <p className="uppercase tracking-widest text-[10px] font-black">Чат пуст. Будь первым!</p>
              </div>
            )}
          </div>

          <div className="p-4 bg-white/5 border-t border-white/5 backdrop-blur-md">
            {user ? (
              <form onSubmit={sendMessage} className="flex gap-2">
                <input 
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  placeholder="Написать в чат..."
                  className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-5 py-3 text-sm outline-none focus:border-neon transition-all shadow-inner"
                />
                <button className="bg-neon text-black w-12 h-12 rounded-2xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-neon group">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                  </svg>
                </button>
              </form>
            ) : (
              <div className="text-center py-2">
                <Link href="/login" className="text-neon font-black uppercase italic text-xs hover:underline">Войдите, чтобы общаться</Link>
              </div>
            )}
          </div>
        </div>

        {/* СПИСОК АДМИНОВ */}
        <div className="hidden md:flex w-64 glass rounded-3xl border border-white/5 flex-col overflow-hidden shadow-2xl">
          <div className="p-4 border-b border-white/5 bg-white/5">
            <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-acid"></span>
              Администрация
            </h2>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
            {staff.map(s => (
              <Link 
                key={s.id} 
                href={`/profile/${s.id}`}
                className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition-all group"
              >
                <div className="relative">
                  <div className={`w-10 h-10 rounded-full border border-white/10 overflow-hidden bg-white/5 flex items-center justify-center text-xs font-bold`}>
                    {s.avatar ? (
                      <img src={s.avatar} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className={s.role === 'admin' ? 'text-acid' : 'text-blue-400'}>
                        {s.username?.[0]?.toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[#0a0a0f] ${s.role === 'admin' ? 'bg-acid shadow-[0_0_5px_#39FF14]' : 'bg-blue-400 shadow-[0_0_5px_#60A5FA]'}`}></div>
                </div>
                <div className="flex flex-col min-w-0">
                  <span className={`text-[11px] font-black uppercase truncate group-hover:underline ${s.role === 'admin' ? 'text-acid' : 'text-blue-400'}`}>
                    {s.username}
                  </span>
                  <span className="text-[7px] font-bold text-white/20 uppercase tracking-widest">
                    {s.role === 'admin' ? 'Администратор' : 'Модератор'}
                  </span>
                </div>
              </Link>
            ))}
            {staff.length === 0 && (
              <div className="text-center py-10 text-[8px] font-black uppercase text-white/10 tracking-widest italic">
                Никого нет в сети
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
