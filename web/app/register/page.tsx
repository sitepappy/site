"use client"
import { useState } from "react"
import { api } from "../../lib/api"
import { getDeviceId } from "../../lib/device"
import { useRouter } from "next/navigation"

export default function RegisterPage() {
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [promo, setPromo] = useState("")
  const [verificationCode, setVerificationCode] = useState("")
  const [codeSent, setCodeSent] = useState(false)
  const [sendingCode, setSendingCode] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const sendCode = async () => {
    if (!email || !email.includes("@")) {
      setError("Введите корректный email")
      return
    }
    setError("")
    setSuccess("")
    setSendingCode(true)
    try {
      await api("/auth/send-verification", {
        method: "POST",
        body: JSON.stringify({ email })
      })
      setCodeSent(true)
      setSuccess("Код подтверждения отправлен на вашу почту")
    } catch (e: any) {
      setError(e.message)
    } finally {
      setSendingCode(false)
    }
  }

  const onSubmit = async (e: any) => {
    e.preventDefault()
    if (!codeSent) {
      setError("Сначала получите код подтверждения")
      return
    }
    setError("")
    setSuccess("")
    setLoading(true)
    try {
      const res = await api("/auth/register", { 
        method: "POST", 
        body: JSON.stringify({ 
          username, 
          email, 
          password, 
          verificationCode,
          promoCode: promo || undefined, 
          deviceId: getDeviceId() 
        }) 
      })
      
      // Сохраняем токен и редиректим
      if (res.token) {
        localStorage.setItem("token", res.token)
        window.location.href = "/profile"
      } else {
        window.location.href = "/login"
      }
    } catch (e:any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto glass p-6 rounded-lg shadow-neon mt-10">
      <h1 className="text-2xl font-bold mb-6 text-neon">Создать аккаунт</h1>
      
      {error && (
        <div className="bg-red-500/20 border border-red-500/50 text-red-400 p-3 rounded mb-4 text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-500/20 border border-green-500/50 text-green-400 p-3 rounded mb-4 text-sm">
          {success}
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-xs text-white/50 mb-1 uppercase font-semibold">Никнейм</label>
          <input 
            className="w-full p-3 rounded bg-white/10 border border-white/5 focus:border-neon outline-none transition-all" 
            placeholder="Ваше имя" 
            value={username} 
            onChange={e=>setUsername(e.target.value)} 
            required
          />
        </div>

        <div>
          <label className="block text-xs text-white/50 mb-1 uppercase font-semibold">Email</label>
          <div className="flex gap-2">
            <input 
              className="flex-1 p-3 rounded bg-white/10 border border-white/5 focus:border-neon outline-none transition-all" 
              placeholder="example@mail.com" 
              type="email"
              value={email} 
              onChange={e=>setEmail(e.target.value)} 
              required
              disabled={codeSent}
            />
            {!codeSent && (
              <button 
                type="button"
                onClick={sendCode}
                disabled={sendingCode}
                className="px-4 rounded bg-neon/20 border border-neon/50 text-neon text-xs font-bold uppercase hover:bg-neon/30 disabled:opacity-50"
              >
                {sendingCode ? "..." : "Код"}
              </button>
            )}
          </div>
        </div>

        {codeSent && (
          <div>
            <label className="block text-xs text-white/50 mb-1 uppercase font-semibold">Код подтверждения</label>
            <input 
              className="w-full p-3 rounded bg-white/10 border border-neon/50 focus:border-neon outline-none transition-all font-mono tracking-[0.5em] text-center text-lg" 
              placeholder="000000" 
              value={verificationCode} 
              onChange={e=>setVerificationCode(e.target.value)} 
              required
            />
            <button 
              type="button" 
              onClick={() => setCodeSent(false)} 
              className="text-[10px] text-white/30 hover:text-white mt-1 underline uppercase"
            >
              Изменить почту
            </button>
          </div>
        )}

        <div>
          <label className="block text-xs text-white/50 mb-1 uppercase font-semibold">Пароль</label>
          <input 
            className="w-full p-3 rounded bg-white/10 border border-white/5 focus:border-neon outline-none transition-all" 
            placeholder="••••••••" 
            type="password" 
            value={password} 
            onChange={e=>setPassword(e.target.value)} 
            required
          />
        </div>

        <div>
          <label className="block text-xs text-white/50 mb-1 uppercase font-semibold">Промокод (если есть)</label>
          <input 
            className="w-full p-3 rounded bg-white/10 border border-white/5 focus:border-acid outline-none transition-all" 
            placeholder="Введите код" 
            value={promo} 
            onChange={e=>setPromo(e.target.value)} 
          />
        </div>

        <button 
          disabled={loading}
          className={`btn btn-primary w-full py-4 text-lg font-bold uppercase tracking-wider ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {loading ? "Создание..." : "Зарегистрироваться"}
        </button>
      </form>

      <div className="mt-6 text-center text-sm text-white/40">
        Уже есть аккаунт? <button onClick={() => router.push('/login')} className="text-neon hover:underline">Войти</button>
      </div>
    </div>
  )
}
