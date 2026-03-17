import { Router } from "express"
import { db } from "../lib/db.js"
import { authRequired } from "../lib/auth.js"
import { calculateReferralLevel } from "./quests.js"

const r = Router()
const REFERRAL_REWARD = 10
const DAILY_LIMIT = 50

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
  const promoType = promo.type || "referral"
  
  const u = data.users.find(x => x.id === req.user.id)
  if (!u) return res.status(404).json({ error: "Пользователь не найден" })
  if (!Array.isArray(u.activatedPromoCodes)) u.activatedPromoCodes = []
  
  if (u.activatedPromoCodes.includes(promo.code)) {
    return res.status(400).json({ error: "Вы уже активировали этот промокод" })
  }

  // Если это реферальный код
  if (promoType === "referral") {
    if (promo.ownerUserId === u.id) return res.status(400).json({ error: "Нельзя активировать свой код" })
    
    if (!Array.isArray(promo.lastActivations)) promo.lastActivations = []
    if (!promo.dailyActivations || typeof promo.dailyActivations !== "object") promo.dailyActivations = {}
    if (typeof promo.totalActivations !== "number") promo.totalActivations = 0

    const dayKey = new Date().toISOString().slice(0, 10)
    promo.dailyActivations[dayKey] = promo.dailyActivations[dayKey] || 0
    if (promo.dailyActivations[dayKey] >= DAILY_LIMIT) return res.status(400).json({ error: "Лимит активаций на сегодня исчерпан" })

    const deviceId = Array.isArray(u.deviceIds) ? u.deviceIds[0] : null
    const ip = Array.isArray(u.ips) ? u.ips[0] : null
    const dupDevice = deviceId ? promo.lastActivations.find(a => a.deviceId && a.deviceId === deviceId) : null
    const dupIp = ip ? promo.lastActivations.find(a => a.ip && a.ip === ip) : null
    if (dupDevice || dupIp) return res.status(400).json({ error: "Подозрительная активация" })

    u.balance += REFERRAL_REWARD
    
    const owner = data.users.find(x => x.id === promo.ownerUserId)
    if (owner) {
      owner.balance += REFERRAL_REWARD
      owner.referralCount = (owner.referralCount || 0) + 1
      const lvlObj = calculateReferralLevel(owner.referralCount)
      owner.referralLevel = lvlObj?.name || null
      owner.referralColor = lvlObj?.color || null
      data.transactions.push({ id: db.id(), userId: owner.id, type: "referral_reward", amount: REFERRAL_REWARD, balanceAfter: owner.balance, note: `Реферальный бонус: ${u.username}`, createdAt: new Date().toISOString() })
    }
    
    promo.totalActivations = (promo.totalActivations || 0) + 1
    promo.dailyActivations[dayKey] += 1
    promo.lastActivations.push({ userId: u.id, deviceId: deviceId || "", ip: ip || "", date: new Date().toISOString() })
    
    data.transactions.push({ id: db.id(), userId: u.id, type: "referral_activate", amount: REFERRAL_REWARD, balanceAfter: u.balance, note: `Активация реферала: ${promo.code}`, createdAt: new Date().toISOString() })
  } 
  // Если это ивент-код
  else if (promoType === "event") {
    if (promo.maxActivations && (promo.totalActivations || 0) >= promo.maxActivations) {
      return res.status(400).json({ error: "Лимит активаций исчерпан" })
    }
    
    const reward = Number(promo.rewardAmount) || 0
    u.balance += reward
    
    promo.totalActivations = (promo.totalActivations || 0) + 1
    data.transactions.push({ id: db.id(), userId: u.id, type: "event_promo", amount: reward, balanceAfter: u.balance, note: `Ивент промокод: ${promo.code}`, createdAt: new Date().toISOString() })
  }

  u.activatedPromoCodes.push(promo.code)
  
  db.save(data)
  res.json({ ok: true, reward: promoType === "referral" ? REFERRAL_REWARD : promo.rewardAmount })
})

export default r
