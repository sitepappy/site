import { Router } from "express"
import { db } from "../lib/db.js"
import { authRequired } from "../lib/auth.js"

const r = Router()

r.get("/", authRequired, (req, res) => {
  const data = db.get()
  const my = data.promoCodes.find(p => p.ownerUserId === req.user.id) || null
  const u = data.users.find(x => x.id === req.user.id)
  
  let activationsList = []
  if (my && my.lastActivations) {
    activationsList = my.lastActivations.map(act => {
      const user = data.users.find(x => x.id === act.userId)
      return {
        username: user?.username || "Аноним",
        date: act.date
      }
    })
  }

  const stats = my && u ? {
    code: my.code,
    totalActivations: my.totalActivations || 0,
    referralLevel: u.referralLevel || null,
    referralColor: u.referralColor || null,
    referralCount: typeof u.referralCount === "number" ? u.referralCount : my.totalActivations || 0,
    activations: activationsList
  } : null
  res.json({ my, stats })
})

r.post("/activate", authRequired, (req, res) => {
  const { code } = req.body || {}
  if (!code) return res.status(400).json({ error: "Введите промокод" })
  
  const data = db.get()
  const promo = data.promoCodes.find(p => p.code.toLowerCase() === code.toLowerCase())
  if (!promo) return res.status(404).json({ error: "Промокод не найден" })
  if (promo.disabled) return res.status(400).json({ error: "Промокод отключен" })
  
  const u = data.users.find(x => x.id === req.user.id)
  if (!u) return res.status(404).json({ error: "Пользователь не найден" })
  
  if (u.activatedPromoCodes && u.activatedPromoCodes.includes(promo.code)) {
    return res.status(400).json({ error: "Вы уже активировали этот промокод" })
  }

  // Если это реферальный код
  if (promo.type === "referral") {
    if (promo.ownerUserId === u.id) return res.status(400).json({ error: "Нельзя активировать свой код" })
    
    // Выдаем награду обоим по 10 монет
    const reward = 10
    u.balance += reward
    
    const owner = data.users.find(x => x.id === promo.ownerUserId)
    if (owner) {
      owner.balance += reward
      data.transactions.push({ id: db.id(), userId: owner.id, type: "referral_reward", amount: reward, balanceAfter: owner.balance, note: `Реферальный бонус: ${u.username}`, createdAt: new Date().toISOString() })
    }
    
    promo.totalActivations = (promo.totalActivations || 0) + 1
    if (!promo.lastActivations) promo.lastActivations = []
    promo.lastActivations.push({ userId: u.id, date: new Date().toISOString() })
    
    data.transactions.push({ id: db.id(), userId: u.id, type: "referral_activate", amount: reward, balanceAfter: u.balance, note: `Активация реферала: ${promo.code}`, createdAt: new Date().toISOString() })
  } 
  // Если это ивент-код
  else if (promo.type === "event") {
    if (promo.maxActivations && (promo.totalActivations || 0) >= promo.maxActivations) {
      return res.status(400).json({ error: "Лимит активаций исчерпан" })
    }
    
    const reward = Number(promo.rewardAmount) || 0
    u.balance += reward
    
    promo.totalActivations = (promo.totalActivations || 0) + 1
    data.transactions.push({ id: db.id(), userId: u.id, type: "event_promo", amount: reward, balanceAfter: u.balance, note: `Ивент промокод: ${promo.code}`, createdAt: new Date().toISOString() })
  }

  if (!u.activatedPromoCodes) u.activatedPromoCodes = []
  u.activatedPromoCodes.push(promo.code)
  
  db.save(data)
  res.json({ ok: true, reward: promo.type === "referral" ? 10 : promo.rewardAmount })
})

export default r
