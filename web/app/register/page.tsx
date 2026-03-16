"use client"
import { useEffect, useState } from "react"
import { api, API_URL } from "../../lib/api"
import { getDeviceId } from "../../lib/device"
import { useRouter } from "next/navigation"

export default function RegisterPage() {
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [promo, setPromo] = useState("")
  const [captcha, setCaptcha] = useState<{id:string, question:string} | null>(null)
  const [answer, setAnswer] = useState("")
  const [error, setError] = useState("")
  const [verifyToken, setVerifyToken] = useState("")
  const router = useRouter()
  const loadCaptcha = async () => {
    const res = await fetch(`${API_URL}/auth/captcha`)
    const data = await res.json()
    setCaptcha(data)
  }
  useEffect(()=>{ loadCaptcha() },[])
  const onSubmit = async (e: any) => {
    e.preventDefault()
    setError("")
    try {
      const res = await api("/auth/register", { method: "POST", body: JSON.stringify({ username, email, password, promoCode: promo || undefined, captchaId: captcha?.id, captchaAnswer: answer, deviceId: getDeviceId() }) })
      setVerifyToken(res.verifyToken)
    } catch (e:any) {
      setError(e.message)
      loadCaptcha()
    }
  }
  const onVerify = async () => {
    try {
      await api(`/auth/verify-email?token=${verifyToken}`)
      router.push("/login")
    } catch (e:any) {
      setError(e.message)
    }
  }
  return (
    <div className="max-w-md mx-auto glass p-6 rounded-lg">
      <h1 className="text-xl font-semibold mb-4">Регистрация</h1>
      {error && <div className="text-red-400 mb-2">{error}</div>}
      <form onSubmit={onSubmit} className="space-y-3">
        <input className="w-full p-3 rounded bg-white/10" placeholder="Никнейм" value={username} onChange={e=>setUsername(e.target.value)} />
        <input className="w-full p-3 rounded bg-white/10" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
        <input className="w-full p-3 rounded bg-white/10" placeholder="Пароль" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
        <input className="w-full p-3 rounded bg-white/10" placeholder="Введите промокод" value={promo} onChange={e=>setPromo(e.target.value)} />
        {captcha && (
          <div className="flex items-center gap-2">
            <div className="px-3 py-2 rounded bg-white/10">{captcha.question} = ?</div>
            <input className="flex-1 p-3 rounded bg-white/10" placeholder="Ответ" value={answer} onChange={e=>setAnswer(e.target.value)} />
          </div>
        )}
        <button className="btn btn-primary w-full">Создать аккаунт</button>
      </form>
      {verifyToken && (
        <div className="mt-4 text-sm">
          <div className="mb-2">Подтверждение email: используйте токен</div>
          <div className="font-mono break-all">{verifyToken}</div>
          <button onClick={onVerify} className="btn glass mt-2">Подтвердить</button>
        </div>
      )}
    </div>
  )
}
