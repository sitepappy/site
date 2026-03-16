import { Router } from "express"
import { db } from "../lib/db.js"
import { hashPassword, verifyPassword, createCaptcha, verifyCaptcha } from "../lib/utils.js"
import { signToken } from "../lib/auth.js"

const r = Router()

r.get("/captcha", (req, res) => {
  res.json(createCaptcha())
})

r.post("/register", (req, res) => {
  const { username, email, password, deviceId, promoCode, captchaId, captchaAnswer } = req.body || {}
  
  if (!username || !email || !password) {
    return res.status(400).json({ error: "Заполните все поля" })
  }

  if (!verifyCaptcha(captchaId, captchaAnswer)) {
    return res.status(400).json({ error: "Неверная капча" })
  }
  
  const data = db.get()
  const exists = data.users.find(u => u.email.toLowerCase() === email.toLowerCase())
  
  if (exists) {
    return res.status(400).json({ error: "Email уже зарегистрирован" })
  }
  
  const id = db.id()
  const createdAt = new Date().toISOString()
  const verifyToken = db.id().slice(0, 8) // Упрощённый токен

  const user = {
    id, username, email,
    passwordHash: hashPassword(password),
    balance: 5, // Даём 5 монет при регистрации
    role: "user",
    createdAt,
    deviceIds: deviceId ? [deviceId] : [],
    ips: [req.ip],
    emailVerified: false,
    verifyToken,
    referralByPromo: promoCode || null
  }
  
  data.users.push(user)
  db.save(data)
  res.json({ ok: true, verifyToken })
})

r.post("/verify-email", (req, res) => {
  const { token } = req.query
  const data = db.get()
  const u = data.users.find(x => x.verifyToken === token)
  if (!u) return res.status(400).json({ error: "Неверный токен" })
  u.emailVerified = true
  db.save(data)
  res.json({ ok: true })
})

// Роут логина с авто-админкой
r.post("/login", (req, res) => {
  const { email, password } = req.body || {}
  const data = db.get()
  
  const user = data.users.find(u => u.email.toLowerCase() === String(email).toLowerCase())
  if (!user || !verifyPassword(password, user.passwordHash)) {
    return res.status(400).json({ error: "Неверные данные" })
  }

  // Проверка: если это ты, повышаем права до admin
  if (user.email.toLowerCase() === "bmax28042004@gmail.com") {
    if (user.role !== "admin") {
      user.role = "admin"
      db.save(data) // Сохраняем изменение в базу
    }
  }

  // Генерируем токен с актуальной ролью
  const token = signToken({ id: user.id, role: user.role })
  res.json({ token })
})

export default r
