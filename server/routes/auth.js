import { Router } from "express"
import { db } from "../lib/db.js"
import { hashPassword, verifyPassword, createCaptcha, verifyCaptcha } from "../lib/utils.js"
import { signToken } from "../lib/auth.js"
import { calculateReferralLevel } from "./quests.js"
import { sendVerificationEmail } from "../lib/email.js"

const r = Router()
const REFERRAL_REWARD = 10
const DAILY_LIMIT = 50

const verificationCodes = new Map()

r.get("/captcha", (req, res) => {
  res.json(createCaptcha())
})

r.post("/send-verification", async (req, res) => {
  const { email } = req.body || {}
  if (!email || !email.includes("@")) return res.status(400).json({ error: "Некорректный email" })
  
  const data = db.get()
  if (data.users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
    return res.status(400).json({ error: "Email уже зарегистрирован" })
  }

  const code = Math.floor(100000 + Math.random() * 900000).toString()
  verificationCodes.set(email.toLowerCase(), { code, exp: Date.now() + 15 * 60 * 1000 })
  
  const result = await sendVerificationEmail(email.toLowerCase(), code)
  
  if (result.ok) {
    res.json({ ok: true, message: "Код подтверждения отправлен на почту" })
  } else {
    // В случае ошибки возвращаем 500 и детали, чтобы пользователь мог понять причину
    res.status(500).json({ 
      error: "Ошибка отправки письма", 
      details: result.error,
      debug: "Проверьте логи сервера для деталей [EMAIL ERROR DETAILS]"
    })
  }
})

r.post("/register", (req, res) => {
  const { username, email, password, deviceId, promoCode, verificationCode } = req.body || {}
  
  if (!username || !email || !password || !verificationCode) {
    return res.status(400).json({ error: "Заполните все поля" })
  }

  const v = verificationCodes.get(email.toLowerCase())
  if (!v || v.code !== String(verificationCode)) {
    return res.status(400).json({ error: "Неверный код подтверждения" })
  }
  if (Date.now() > v.exp) {
    verificationCodes.delete(email.toLowerCase())
    return res.status(400).json({ error: "Код подтверждения истек" })
  }
  
  const data = db.get()
  const exists = data.users.find(u => u.email.toLowerCase() === email.toLowerCase())
  
  if (exists) {
    return res.status(400).json({ error: "Email уже зарегистрирован" })
  }
  
  const id = db.id()
  const createdAt = new Date().toISOString()

  const user = {
    id, username, email,
    passwordHash: hashPassword(password),
    balance: 5, // Даём 5 монет при регистрации
    role: "user",
    createdAt,
    deviceIds: deviceId ? [deviceId] : [],
    ips: [req.ip],
    emailVerified: true, // Сразу подтвержден
    referralByPromo: null,
    usedReferralCode: null,
    usedReferralOwnerId: null
  }
  
  data.users.push(user)

  if (promoCode) {
    const promo = data.promoCodes.find(p => p.code && p.code.toLowerCase() === String(promoCode).toLowerCase())
    if (!promo) return res.status(404).json({ error: "Промокод не найден" })
    if (promo.disabled) return res.status(400).json({ error: "Промокод отключен" })

    const promoType = promo.type || "referral"
    if (!Array.isArray(user.activatedPromoCodes)) user.activatedPromoCodes = []
    if (user.activatedPromoCodes.includes(promo.code)) return res.status(400).json({ error: "Вы уже активировали этот промокод" })

    if (promoType === "referral") {
      if (promo.ownerUserId === user.id) return res.status(400).json({ error: "Нельзя активировать свой код" })
      if (user.usedReferralCode || user.usedReferralOwnerId) return res.status(400).json({ error: "Реферальный промокод можно активировать только один раз" })

      const owner = data.users.find(x => x.id === promo.ownerUserId)
      if (owner && owner.usedReferralOwnerId === user.id) {
        return res.status(400).json({ error: "Взаимное использование реферальных кодов запрещено" })
      }

      if (!Array.isArray(promo.lastActivations)) promo.lastActivations = []
      if (!promo.dailyActivations || typeof promo.dailyActivations !== "object") promo.dailyActivations = {}
      if (typeof promo.totalActivations !== "number") promo.totalActivations = 0

      const dayKey = new Date().toISOString().slice(0, 10)
      promo.dailyActivations[dayKey] = promo.dailyActivations[dayKey] || 0
      if (promo.dailyActivations[dayKey] >= DAILY_LIMIT) return res.status(400).json({ error: "Лимит активаций на сегодня исчерпан" })

      const dev = user.deviceIds?.[0] || ""
      const ip = user.ips?.[0] || ""
      const dupDevice = dev ? promo.lastActivations.find(a => a.deviceId && a.deviceId === dev) : null
      const dupIp = ip ? promo.lastActivations.find(a => a.ip && a.ip === ip) : null
      if (dupDevice || dupIp) return res.status(400).json({ error: "Подозрительная активация" })

      user.balance += REFERRAL_REWARD
      if (owner) {
        owner.balance += REFERRAL_REWARD
        owner.referralCount = (owner.referralCount || 0) + 1
        const lvlObj = calculateReferralLevel(owner.referralCount)
        owner.referralLevel = lvlObj?.name || null
        owner.referralColor = lvlObj?.color || null
        data.transactions.push({ id: db.id(), userId: owner.id, type: "referral_reward", amount: REFERRAL_REWARD, balanceAfter: owner.balance, note: `Реферальный бонус: ${user.username}`, createdAt })
      }

      promo.totalActivations = (promo.totalActivations || 0) + 1
      promo.dailyActivations[dayKey] += 1
      promo.lastActivations.push({ userId: user.id, deviceId: dev, ip, date: createdAt })
      data.transactions.push({ id: db.id(), userId: user.id, type: "referral_activate", amount: REFERRAL_REWARD, balanceAfter: user.balance, note: `Активация реферала: ${promo.code}`, createdAt })
      user.usedReferralCode = promo.code
      user.usedReferralOwnerId = promo.ownerUserId
    } else if (promoType === "event") {
      if (promo.maxActivations && (promo.totalActivations || 0) >= promo.maxActivations) {
        return res.status(400).json({ error: "Лимит активаций исчерпан" })
      }
      const reward = Number(promo.rewardAmount) || 0
      user.balance += reward
      promo.totalActivations = (promo.totalActivations || 0) + 1
      data.transactions.push({ id: db.id(), userId: user.id, type: "event_promo", amount: reward, balanceAfter: user.balance, note: `Ивент промокод: ${promo.code}`, createdAt })
    }

    user.activatedPromoCodes.push(promo.code)
  }

  db.save(data)
  verificationCodes.delete(email.toLowerCase())
  
  // Сразу логиним после регистрации
  const token = signToken({ id: user.id, role: user.role })
  res.json({ ok: true, token })
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

  // Специальный вход для главного админа
  if (email === "admin" && password === "Monkastan123") {
    let adminUser = data.users.find(u => u.email === "admin")
    if (!adminUser) {
      adminUser = {
        id: db.id(),
        username: "Admin",
        email: "admin",
        passwordHash: hashPassword("Monkastan123"),
        balance: 999999,
        role: "admin",
        createdAt: new Date().toISOString(),
        deviceIds: [],
        ips: [],
        emailVerified: true
      }
      data.users.push(adminUser)
      db.save(data)
    }
    const token = signToken({ id: adminUser.id, role: "admin" })
    return res.json({ token })
  }
  
  const user = data.users.find(u => u.email.toLowerCase() === String(email).toLowerCase())
  if (!user || !verifyPassword(password, user.passwordHash)) {
    return res.status(400).json({ error: "Неверные данные" })
  }

  if (user.referralByPromo && !user.referralRewarded) {
    const promo = data.promoCodes.find(p => p.code && p.code.toLowerCase() === String(user.referralByPromo).toLowerCase())
    if (promo && !promo.disabled) {
      const promoType = promo.type || "referral"
      if (!Array.isArray(user.activatedPromoCodes)) user.activatedPromoCodes = []
      if (!user.activatedPromoCodes.includes(promo.code) && promoType === "referral" && promo.ownerUserId !== user.id) {
        if (!Array.isArray(promo.lastActivations)) promo.lastActivations = []
        if (!promo.dailyActivations || typeof promo.dailyActivations !== "object") promo.dailyActivations = {}
        if (typeof promo.totalActivations !== "number") promo.totalActivations = 0

        const dayKey = new Date().toISOString().slice(0, 10)
        promo.dailyActivations[dayKey] = promo.dailyActivations[dayKey] || 0
        if (promo.dailyActivations[dayKey] < DAILY_LIMIT) {
          const dev = Array.isArray(user.deviceIds) ? (user.deviceIds[0] || "") : ""
          const ip = req.ip
          const dupDevice = dev ? promo.lastActivations.find(a => a.deviceId && a.deviceId === dev) : null
          const dupIp = ip ? promo.lastActivations.find(a => a.ip && a.ip === ip) : null
          if (!dupDevice && !dupIp) {
            user.balance += REFERRAL_REWARD
            const owner = data.users.find(x => x.id === promo.ownerUserId)
            if (owner) {
              owner.balance += REFERRAL_REWARD
              owner.referralCount = (owner.referralCount || 0) + 1
              const lvlObj = calculateReferralLevel(owner.referralCount)
              owner.referralLevel = lvlObj?.name || null
              owner.referralColor = lvlObj?.color || null
              data.transactions.push({ id: db.id(), userId: owner.id, type: "referral_reward", amount: REFERRAL_REWARD, balanceAfter: owner.balance, note: `Реферальный бонус: ${user.username}`, createdAt: new Date().toISOString() })
            }

            promo.totalActivations = (promo.totalActivations || 0) + 1
            promo.dailyActivations[dayKey] += 1
            promo.lastActivations.push({ userId: user.id, deviceId: dev, ip, date: new Date().toISOString() })
            data.transactions.push({ id: db.id(), userId: user.id, type: "referral_activate", amount: REFERRAL_REWARD, balanceAfter: user.balance, note: `Активация реферала: ${promo.code}`, createdAt: new Date().toISOString() })

            user.activatedPromoCodes.push(promo.code)
            user.referralRewarded = true
            user.referralByPromo = null
            db.save(data)
          }
        }
      }
    }
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
