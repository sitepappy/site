"use client"
import { useEffect, useState } from "react"
import { api } from "../../lib/api"

export default function ReportPage() {
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [reports, setReports] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState("")

  useEffect(() => {
    loadReports()
  }, [])

  const loadReports = async () => {
    try {
      const data = await api("/users/reports")
      setReports(data)
    } catch (e) {}
  }

  const onSubmit = async (e: any) => {
    e.preventDefault()
    setLoading(true)
    try {
      await api("/users/reports", {
        method: "POST",
        body: JSON.stringify({ title, content })
      })
      setTitle("")
      setContent("")
      setMsg("Репорт успешно отправлен!")
      loadReports()
      setTimeout(() => setMsg(""), 3000)
    } catch (err: any) {
      alert(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="glass p-6 md:p-8 rounded-2xl border border-white/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-32 w-32" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>

        <h1 className="text-3xl font-black text-neon uppercase tracking-tighter mb-2">Техподдержка</h1>
        <p className="text-white/40 text-sm mb-8 uppercase font-bold tracking-widest">Создайте тикет, и наша команда ответит вам в ближайшее время</p>

        <form onSubmit={onSubmit} className="space-y-4 max-w-2xl relative z-10">
          {msg && <div className="p-4 bg-neon/20 border border-neon/30 text-neon rounded-xl text-xs font-bold uppercase animate-bounce">{msg}</div>}
          
          <div className="space-y-1">
            <label className="text-[10px] font-black text-white/40 uppercase ml-1">Тема обращения</label>
            <input 
              required 
              value={title} 
              onChange={e=>setTitle(e.target.value)}
              className="w-full p-4 rounded-xl bg-white/5 border border-white/10 focus:border-neon outline-none transition-all text-sm font-bold" 
              placeholder="Напр: Проблема с балансом" 
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-white/40 uppercase ml-1">Описание проблемы</label>
            <textarea 
              required 
              rows={5} 
              value={content} 
              onChange={e=>setContent(e.target.value)}
              className="w-full p-4 rounded-xl bg-white/5 border border-white/10 focus:border-neon outline-none transition-all text-sm" 
              placeholder="Опишите ситуацию максимально подробно..." 
            />
          </div>

          <button 
            disabled={loading}
            className="btn btn-primary w-full py-4 text-xs font-black uppercase tracking-widest shadow-neon disabled:opacity-50"
          >
            {loading ? "Отправка..." : "Отправить тикет"}
          </button>
        </form>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-black text-white uppercase tracking-tighter flex items-center gap-2">
          Ваши обращения
          <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded-full text-white/40">{reports.length}</span>
        </h2>
        
        <div className="grid gap-3">
          {reports.map(r => (
            <div key={r.id} className="glass p-5 rounded-xl border border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-white text-sm">{r.title}</span>
                  <span className={`text-[8px] px-2 py-0.5 rounded font-black uppercase ${
                    r.status === "pending" ? "bg-yellow-500 text-black" : r.status === "in_progress" ? "bg-neon text-black" : "bg-green-500 text-black"
                  }`}>
                    {r.status === "pending" ? "Новый" : r.status === "in_progress" ? "В работе" : "Решено"}
                  </span>
                </div>
                <div className="text-[10px] text-white/30 uppercase font-bold tracking-tighter">
                  ID: {r.id.slice(0,8)} • {new Date(r.createdAt).toLocaleDateString()}
                </div>
              </div>
              <div className="w-full md:max-w-xs space-y-2">
                <div className="text-xs text-white/60 italic bg-black/20 p-3 rounded-lg">
                  {r.content.length > 100 ? r.content.slice(0, 100) + "..." : r.content}
                </div>
                {Array.isArray(r.adminResponses) && r.adminResponses.length > 0 && (
                  <div className="bg-neon/10 border border-neon/20 rounded-lg p-3">
                    <div className="text-[9px] font-black uppercase tracking-widest text-neon">Ответ администрации</div>
                    <div className="text-xs text-white/80 mt-1">
                      {r.adminResponses[r.adminResponses.length - 1].message}
                    </div>
                    <div className="text-[9px] text-white/30 mt-2 font-mono">
                      {r.adminResponses[r.adminResponses.length - 1].adminUsername} • {new Date(r.adminResponses[r.adminResponses.length - 1].createdAt).toLocaleString()}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {reports.length === 0 && (
            <div className="text-center py-12 glass rounded-xl border border-white/5">
              <div className="text-white/10 font-black uppercase tracking-widest italic">Истории обращений пока нет</div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
