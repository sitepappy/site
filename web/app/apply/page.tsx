"use client"
import { useEffect, useState } from "react"
import { api } from "../../lib/api"
import Link from "next/link"

export default function ApplyPage() {
  const [forms, setForms] = useState<any[]>([])
  const [selectedForm, setSelectedSelectedForm] = useState<any>(null)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [msg, setMsg] = useState("")
  const [error, setError] = useState("")

  useEffect(() => {
    load()
  }, [])

  const load = async () => {
    try {
      const data = await api("/applications/forms")
      setForms(data)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  const handleSubmit = async (e: any) => {
    e.preventDefault()
    
    // ПРОВЕРКА: Все ли вопросы заполнены?
    const unanswered = selectedForm.fields.find((f: any) => !answers[f.label]?.trim());
    if (unanswered) {
      setError(`Пожалуйста, ответьте на вопрос: "${unanswered.label}"`);
      return;
    }

    setSubmitting(true)
    setError("")
    try {
      await api("/applications/submit", { method: "POST", body: JSON.stringify({ formId: selectedForm.id, answers }) })
      setMsg("Заявка успешно отправлена!")
      setSelectedSelectedForm(null)
      setAnswers({})
    } catch (e: any) {
      setError(e.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <div className="text-center py-20 text-neon animate-pulse uppercase font-black">Загрузка форм...</div>

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-black text-white uppercase italic tracking-tighter">Подача Заявок</h1>
        <p className="text-white/40 text-xs uppercase tracking-widest font-bold">Выберите интересующее вас направление</p>
      </div>

      {msg && (
        <div className="p-6 bg-neon/10 border border-neon/20 rounded-3xl text-neon text-sm font-black uppercase text-center tracking-widest animate-in zoom-in">
          {msg}
        </div>
      )}

      {error && (
        <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-3xl text-red-400 text-sm font-black uppercase text-center tracking-widest">
          {error}
        </div>
      )}

      {!selectedForm ? (
        <div className="grid gap-4">
          {forms.length > 0 ? forms.map(f => (
            <button 
              key={f.id}
              onClick={() => setSelectedSelectedForm(f)}
              className="glass p-8 rounded-[32px] border border-white/5 hover:border-neon/30 hover:bg-neon/5 transition-all text-left group relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-neon/5 blur-3xl group-hover:bg-neon/10 transition-all"></div>
              <div className="relative z-10">
                <h3 className="text-xl font-black text-white uppercase mb-2 group-hover:text-neon transition-colors">{f.title}</h3>
                <p className="text-sm text-white/40 leading-relaxed">{f.description}</p>
                <div className="mt-6 flex items-center gap-2 text-[10px] font-black text-neon uppercase tracking-widest">
                  Заполнить анкету <span>→</span>
                </div>
              </div>
            </button>
          )) : (
            <div className="glass p-20 rounded-[40px] border border-white/5 text-center">
              <div className="text-6xl mb-4 opacity-10">📄</div>
              <div className="text-xs font-black text-white/20 uppercase tracking-widest">В данный момент нет активных наборов</div>
            </div>
          )}
        </div>
      ) : (
        <div className="glass p-8 rounded-[40px] border border-white/10 space-y-8 animate-in slide-in-from-right-4">
          <div className="flex items-center justify-between">
            <button onClick={() => setSelectedSelectedForm(null)} className="text-[10px] font-black text-white/20 uppercase hover:text-white transition-colors flex items-center gap-2">
              <span>←</span> Назад к списку
            </button>
            <div className="text-[10px] font-black text-neon uppercase tracking-widest px-3 py-1 bg-neon/10 rounded-full">Анкета</div>
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-black text-white uppercase italic tracking-tight">{selectedForm.title}</h2>
            <p className="text-sm text-white/50">{selectedForm.description}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {selectedForm.fields.map((field: any) => (
              <div key={field.label} className="space-y-2">
                <label className="text-[10px] font-black text-white/30 uppercase ml-2 tracking-widest">{field.label}</label>
                {field.type === 'textarea' ? (
                  <textarea 
                    required
                    value={answers[field.label] || ""}
                    onChange={e => setAnswers(prev => ({ ...prev, [field.label]: e.target.value }))}
                    className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-sm outline-none focus:border-neon transition-all"
                    rows={4}
                    placeholder="Введите ваш ответ..."
                  />
                ) : (
                  <input 
                    required
                    value={answers[field.label] || ""}
                    onChange={e => setAnswers(prev => ({ ...prev, [field.label]: e.target.value }))}
                    className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-sm outline-none focus:border-neon transition-all"
                    placeholder="..."
                  />
                )}
              </div>
            ))}

            <button 
              disabled={submitting}
              type="submit"
              className="w-full py-5 rounded-2xl bg-neon text-black font-black uppercase italic tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-neon disabled:opacity-50 disabled:grayscale"
            >
              {submitting ? "Отправка..." : "Отправить заявку"}
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
