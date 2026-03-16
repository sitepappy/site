"use client"
import { useState } from "react"
import { api } from "../../lib/api"
import { getDeviceId } from "../../lib/device"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const router = useRouter()

  const onSubmit = async (e: any) => {
    e.preventDefault()
    setError("")
    try {
      const res = await api("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password, deviceId: getDeviceId() })
      })
      localStorage.setItem("token", res.token)
      router.push("/profile")
    } catch (e: any) {
      setError(e.message)
    }
  }

  return (
    <div className="max-w-md mx-auto glass p-6 rounded-lg">
      <h1 className="text-xl font-semibold mb-4">Вход</h1>
      {error && <div className="text-red-400 mb-2">{error}</div>}
      <form onSubmit={onSubmit} className="space-y-3">
        <input
          className="w-full p-3 rounded bg-white/10"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
        <input
          className="w-full p-3 rounded bg-white/10"
          placeholder="Пароль"
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
        <button className="btn btn-primary w-full">Войти</button>
      </form>
    </div>
  )
}
