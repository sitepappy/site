import { Router } from "express"
import { db } from "../lib/db.js"
import { authRequired, adminOnly, moderatorOrAdmin } from "../lib/auth.js"
import { nowIso } from "../lib/utils.js"
import { calculateReferralLevel } from "./quests.js"
import { pushNotification } from "../lib/notifications.js"

const r = Router()
const REFERRAL_REWARD = 10

// Модераторы и Админы могут заходить в панель в целом
r.use(authRequired, moderatorOrAdmin)

r.get("/stats", (req, res) => {
  const data = db.get()
  const usersCount = data.users.length
  const activeBetsCount = data.bets.filter(b => b.status === "open").length
  const totalBalance = data.users.reduce((sum, u) => sum + (u.balance || 0), 0)
  const pendingReports = (data.reports || []).filter(r => r.status === "pending").length

  res.json({
    usersCount,
    activeBetsCount,
    totalBalance,
    pendingReports
  })
})

r.get("/logs", (req, res) => {
  const data = db.get()
  const logs = [...(data.transactions || [])]
    .sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""))
    .slice(0, 50)
    .map(l => {
      const u = data.users.find(x => x.id === l.userId)
      return { ...l, username: u?.username || "System" }
    })
  res.json(logs)
})

r.post("/broadcast", adminOnly, (req, res) => {
  const { title, body } = req.body || {}
  if (!title || !body) return res.status(400).json({ error: "Пустые данные" })
  
  const data = db.get()
  data.users.forEach(u => {
    pushNotification(data, { userId: u.id, type: "system", title, body })
  })
  db.save(data)
  res.json({ ok: true })
})

r.post("/logs/clear", adminOnly, (req, res) => {
  const data = db.get()
  data.transactions = []
  db.save(data)
  res.json({ ok: true })
})

r.get("/users", (req, res) => {
  const q = String(req.query.q || "").toLowerCase()
  const data = db.get()
  const list = data.users
    .filter(u => !q || u.username.toLowerCase().includes(q) || u.email.toLowerCase().includes(q))
    .map(u => ({ id: u.id, username: u.username, email: u.email, balance: u.balance, role: u.role, levelId: u.levelId, createdAt: u.createdAt }))
  res.json(list)
})

// ТОЛЬКО АДМИН может менять роли
r.post("/users/role", adminOnly, (req, res) => {
  const { userId, role } = req.body || {}
  if (!["admin", "moderator", "user"].includes(role)) return res.status(400).json({ error: "Неверная роль" })
  
  const data = db.get()
  const u = data.users.find(x => x.id === userId)
  if (!u) return res.status(404).json({ error: "Не найдено" })
  
  u.role = role
  db.save(data)
  res.json({ ok: true, role })
})

r.post("/users/level", adminOnly, (req, res) => {
  const { userId, levelId } = req.body || {}
  const data = db.get()
  const u = data.users.find(x => x.id === userId)
  if (!u) return res.status(404).json({ error: "Не найдено" })
  
  u.levelId = levelId
  db.save(data)
  res.json({ ok: true, levelId })
})

// APPLICATIONS (ЗАЯВКИ)
r.get("/forms", (req, res) => {
  const data = db.get()
  res.json(data.applicationForms || [])
})

r.post("/forms", adminOnly, (req, res) => {
  const { title, description, fields } = req.body || {}
  if (!title) return res.status(400).json({ error: "Заголовок обязателен" })
  
  const data = db.get()
  if (!data.applicationForms) data.applicationForms = []
  
  const form = {
    id: db.id(),
    title,
    description,
    fields: fields || [], // [{ label: string, type: 'text'|'textarea'|'select', options?: string[] }]
    active: true,
    createdAt: nowIso()
  }
  
  data.applicationForms.push(form)
  db.save(data)
  res.json(form)
})

r.delete("/forms/:id", adminOnly, (req, res) => {
  const data = db.get()
  data.applicationForms = (data.applicationForms || []).filter(f => f.id !== req.params.id)
  db.save(data)
  res.json({ ok: true })
})

r.get("/applications", (req, res) => {
  const data = db.get()
  const apps = (data.applications || []).map(a => {
    const user = data.users.find(u => u.id === a.userId)
    const form = (data.applicationForms || []).find(f => f.id === a.formId)
    return { ...a, username: user?.username || "Unknown", formTitle: form?.title || "Deleted Form" }
  })
  res.json(apps)
})

r.post("/applications/:id/status", adminOnly, (req, res) => {
  const { status, adminComment } = req.body || {}
  const data = db.get()
  const app = (data.applications || []).find(a => a.id === req.params.id)
  if (!app) return res.status(404).json({ error: "Заявка не найдена" })
  
  app.status = status // 'pending' | 'approved' | 'rejected'
  app.adminComment = adminComment
  app.updatedAt = nowIso()
  
  db.save(data)
  res.json({ ok: true })
})

// SETTINGS
r.get("/settings", adminOnly, (req, res) => {
  const data = db.get()
  res.json(data.settings || { cs2ThemesEnabled: true })
})

r.post("/settings", adminOnly, (req, res) => {
  const { cs2ThemesEnabled } = req.body || {}
  const data = db.get()
  if (!data.settings) data.settings = {}
  data.settings.cs2ThemesEnabled = !!cs2ThemesEnabled
  db.save(data)
  res.json(data.settings)
})

r.get("/reports", (req, res) => {
  const data = db.get()
  res.json(data.reports || [])
})

r.post("/reports/:id/resolve", (req, res) => {
  const data = db.get()
  const r = (data.reports || []).find(x => x.id === req.params.id)
  if (!r) return res.status(404).json({ error: "Не найдено" })
  r.status = "resolved"
  r.updatedAt = nowIso()
  pushNotification(data, { userId: r.userId, type: "ticket", title: "Тикет закрыт", body: `Тикет: ${r.title}`, meta: { reportId: r.id } })
  db.save(data)
  res.json({ ok: true })
})

 r.post("/reports/:id/reply", (req, res) => {
  const { message, status } = req.body || {}
  const text = String(message || "").trim()
  if (!text) return res.status(400).json({ error: "Пустой ответ" })
  const data = db.get()
  const rep = (data.reports || []).find(x => x.id === req.params.id)
  if (!rep) return res.status(404).json({ error: "Не найдено" })
  if (!Array.isArray(rep.adminResponses)) rep.adminResponses = []
  const admin = data.users.find(u => u.id === req.user.id)
  const entry = { id: db.id(), adminId: req.user.id, adminUsername: admin?.username || "Admin", message: text, createdAt: nowIso() }
  rep.adminResponses.push(entry)
  rep.status = status && ["pending", "in_progress", "resolved"].includes(status) ? status : "in_progress"
  rep.updatedAt = nowIso()
  pushNotification(data, { userId: rep.userId, type: "ticket", title: "Ответ по тикету", body: text, meta: { reportId: rep.id } })
  db.save(data)
  res.json({ ok: true, report: rep })
})

r.post("/reports/:id/referral-credit", adminOnly, (req, res) => {
  const { code } = req.body || {}
  const promoCode = String(code || "").trim()
  if (!promoCode) return res.status(400).json({ error: "Введите промокод" })
  const data = db.get()
  const rep = (data.reports || []).find(x => x.id === req.params.id)
  if (!rep) return res.status(404).json({ error: "Тикет не найден" })
  if (rep.referralManualAppliedAt) return res.status(400).json({ error: "Уже начислено" })

  const promo = (data.promoCodes || []).find(p => p.code && p.code.toLowerCase() === promoCode.toLowerCase())
  if (!promo) return res.status(404).json({ error: "Промокод не найден" })
  if (promo.disabled) return res.status(400).json({ error: "Промокод отключен" })
  const promoType = promo.type || "referral"
  if (promoType !== "referral") return res.status(400).json({ error: "Это не реферальный промокод" })

  const u = data.users.find(x => x.id === rep.userId)
  if (!u) return res.status(404).json({ error: "Пользователь тикета не найден" })
  if (!Array.isArray(u.activatedPromoCodes)) u.activatedPromoCodes = []
  if (u.activatedPromoCodes.includes(promo.code)) return res.status(400).json({ error: "Уже активировано этим пользователем" })
  if (promo.ownerUserId === u.id) return res.status(400).json({ error: "Нельзя начислить за свой код" })

  const owner = data.users.find(x => x.id === promo.ownerUserId)
  if (!owner) return res.status(404).json({ error: "Владелец промокода не найден" })

  u.balance += REFERRAL_REWARD
  owner.balance += REFERRAL_REWARD

  owner.referralCount = (owner.referralCount || 0) + 1
  const lvlObj = calculateReferralLevel(owner.referralCount)
  owner.referralLevel = lvlObj?.name || null
  owner.referralColor = lvlObj?.color || null

  const createdAt = nowIso()
  data.transactions.push({ id: db.id(), userId: u.id, type: "referral_manual", amount: REFERRAL_REWARD, balanceAfter: u.balance, note: `Реферальный бонус (ручной): ${promo.code}`, createdAt })
  data.transactions.push({ id: db.id(), userId: owner.id, type: "referral_manual_owner", amount: REFERRAL_REWARD, balanceAfter: owner.balance, note: `Реферальный бонус (ручной): ${u.username}`, createdAt })

  if (!Array.isArray(promo.lastActivations)) promo.lastActivations = []
  if (!promo.dailyActivations || typeof promo.dailyActivations !== "object") promo.dailyActivations = {}
  if (typeof promo.totalActivations !== "number") promo.totalActivations = 0
  const dayKey = createdAt.slice(0, 10)
  promo.dailyActivations[dayKey] = (promo.dailyActivations[dayKey] || 0) + 1
  promo.totalActivations += 1
  promo.lastActivations.push({ userId: u.id, deviceId: "", ip: "", date: createdAt, manual: true })

  u.activatedPromoCodes.push(promo.code)
  rep.referralManualAppliedAt = createdAt
  rep.updatedAt = createdAt
  pushNotification(data, { userId: u.id, type: "referral", title: "Рефералка начислена", body: `Начислено ${REFERRAL_REWARD} 🪙 по промокоду ${promo.code}`, meta: { reportId: rep.id } })
  pushNotification(data, { userId: owner.id, type: "referral", title: "Рефералка начислена", body: `Начислено ${REFERRAL_REWARD} 🪙 за пользователя ${u.username}`, meta: { reportId: rep.id } })
  db.save(data)
  res.json({ ok: true })
})

// ТОЛЬКО АДМИН может менять баланс
r.post("/users/ban", (req, res) => {
  const { userId, isBanned } = req.body || {}
  const data = db.get()
  const u = data.users.find(x => x.id === userId)
  if (!u) return res.status(404).json({ error: "Не найдено" })
  u.isBanned = !!isBanned
  db.save(data)
  res.json({ ok: true })
})

r.get("/users/:id", (req, res) => {
  const data = db.get()
  const u = data.users.find(x => x.id === req.params.id)
  if (!u) return res.status(404).json({ error: "Пользователь не найден" })
  
  const transactions = data.transactions.filter(t => t.userId === u.id).sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""))
  const bets = data.bets.filter(b => b.userId === u.id).sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""))
  
  // Connections
  const sameIps = data.users.filter(other => 
    other.id !== u.id && 
    Array.isArray(other.ips) && 
    Array.isArray(u.ips) && 
    other.ips.some(ip => u.ips.includes(ip))
  ).map(other => ({ id: other.id, username: other.username, commonIps: other.ips.filter(ip => u.ips.includes(ip)) }))

  const sameDevices = data.users.filter(other => 
    other.id !== u.id && 
    Array.isArray(other.deviceIds) && 
    Array.isArray(u.deviceIds) && 
    other.deviceIds.some(did => u.deviceIds.includes(did))
  ).map(other => ({ id: other.id, username: other.username, commonDevices: other.deviceIds.filter(did => u.deviceIds.includes(did)) }))

  // Risk Score calculation (simple version)
  let riskScore = 0
  if (sameIps.length > 0) riskScore += 30 + (sameIps.length * 5)
  if (sameDevices.length > 0) riskScore += 40 + (sameDevices.length * 10)
  if (u.isBanned) riskScore = 100
  riskScore = Math.min(riskScore, 100)

  // Timeline
  const timeline = [
    ...transactions.map(t => ({ type: "transaction", ...t })),
    ...bets.map(b => ({ type: "bet", ...b })),
    { type: "registration", createdAt: u.createdAt, note: "Регистрация в системе" }
  ].sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""))

  res.json({ 
    user: { 
      id: u.id, 
      username: u.username, 
      email: u.email, 
      balance: u.balance, 
      role: u.role, 
      levelId: u.levelId, 
      isBanned: u.isBanned, 
      createdAt: u.createdAt,
      telegram: u.telegram || "",
      ips: u.ips || [],
      deviceIds: u.deviceIds || []
    },
    logs: transactions,
    bets,
    connections: { sameIps, sameDevices },
    riskScore,
    timeline
  })
})

r.post("/users/balance", adminOnly, (req, res) => {
  const { userId, delta } = req.body || {}
  const data = db.get()
  const u = data.users.find(x => x.id === userId)
  if (!u) return res.status(404).json({ error: "Не найдено" })
  const change = Number(delta) || 0
  u.balance += change
  data.transactions.push({ id: db.id(), userId: u.id, type: "admin_adjust", amount: change, balanceAfter: u.balance, note: "Коррекция администратора", createdAt: nowIso() })
  db.save(data)
  res.json({ ok: true, balance: u.balance })
})

r.delete("/posts/:id", (req, res) => {
  const data = db.get()
  data.posts = data.posts.filter(p => p.id !== req.params.id)
  db.save(data)
  res.json({ ok: true })
})

r.delete("/quests/:id", (req, res) => {
  const data = db.get()
  data.quests = data.quests.filter(q => q.id !== req.params.id)
  db.save(data)
  res.json({ ok: true })
})

r.get("/chat", (req, res) => {
  const data = db.get()
  res.json(data.adminChat || [])
})

r.post("/chat", (req, res) => {
  const { message } = req.body || {}
  if (!message) return res.status(400).json({ error: "Пустое сообщение" })
  
  const data = db.get()
  if (!data.adminChat) data.adminChat = []
  
  const user = data.users.find(u => u.id === req.user.id)
  const msg = {
    id: db.id(),
    username: user.username,
    role: user.role,
    message,
    createdAt: nowIso()
  }
  
  data.adminChat.push(msg)
  if (data.adminChat.length > 100) data.adminChat.shift()
  
  db.save(data)
  res.json(msg)
})

r.get("/promos", adminOnly, (req, res) => {
  const data = db.get()
  const list = data.promoCodes.map(p => ({ 
    code: p.code, 
    type: p.type || "referral",
    ownerUserId: p.ownerUserId, 
    activations: p.totalActivations || 0, 
    maxActivations: p.maxActivations,
    rewardAmount: p.rewardAmount,
    disabled: p.disabled 
  }))
  res.json(list)
})

r.post("/promos", adminOnly, (req, res) => {
  const { code, type, maxActivations, rewardAmount } = req.body || {}
  if (!code) return res.status(400).json({ error: "Введите код" })
  
  const data = db.get()
  if (data.promoCodes.find(p => p.code.toLowerCase() === code.toLowerCase())) {
    return res.status(400).json({ error: "Код уже существует" })
  }

  const promo = {
    id: db.id(),
    code: code.toUpperCase(),
    type: type || "event",
    maxActivations: maxActivations ? Number(maxActivations) : null,
    rewardAmount: rewardAmount ? Number(rewardAmount) : 0,
    totalActivations: 0,
    disabled: false,
    createdAt: new Date().toISOString()
  }

  data.promoCodes.push(promo)
  db.save(data)
  res.json(promo)
})

r.post("/promos/disable", adminOnly, (req, res) => {
  const { code, disabled } = req.body || {}
  const data = db.get()
  const p = data.promoCodes.find(x => x.code === code)
  if (!p) return res.status(404).json({ error: "Не найдено" })
  p.disabled = !!disabled
  db.save(data)
  res.json({ ok: true })
})

r.post("/about", (req, res) => {
  const { contentHtml, links } = req.body || {}
  const data = db.get()
  data.about = { contentHtml: String(contentHtml || ""), links: { ...data.about.links, ...(links || {}) } }
  db.save(data)
  res.json({ ok: true })
})

r.post("/schedule", (req, res) => {
  const { contentHtml, streams } = req.body || {}
  const data = db.get()
  data.schedule = { contentHtml: String(contentHtml || ""), streams: streams || [] }
  db.save(data)
  res.json({ ok: true })
})

r.post("/rewards", adminOnly, (req, res) => {
  const { rewards } = req.body || {}
  if (!Array.isArray(rewards)) return res.status(400).json({ error: "Неверный формат" })
  const data = db.get()
  data.rewards = rewards
  db.save(data)
  res.json({ ok: true })
})

r.delete("/bets/:id", (req, res) => {
  const data = db.get()
  const bet = data.bets.find(b => b.id === req.params.id)
  if (!bet) return res.status(404).json({ error: "Ставка не найдена" })
  
  // Optional: refund coins if bet is pending? 
  // User didn't ask for refund, just "possibility to delete bets"
  data.bets = data.bets.filter(b => b.id !== req.params.id)
  db.save(data)
  res.json({ ok: true })
})

r.get("/analytics", (req, res) => {
  const data = db.get()
  const totalUsers = data.users.length
  const coins = data.users.reduce((s, u) => s + u.balance, 0)
  const referrals = data.promoCodes.reduce((s, p) => s + p.totalActivations, 0)
  const bets = data.bets.length
  res.json({ totalUsers, coinsInCirculation: coins, referralActivations: referrals, bets })
})

// ANTIFRAUD
r.get("/antifraud", (req, res) => {
  const data = db.get()
  res.json(data.antifraud || [])
})

r.post("/antifraud/:id/resolve", (req, res) => {
  const { action } = req.body || {}
  const data = db.get()
  const alert = (data.antifraud || []).find(a => a.id === req.params.id)
  if (!alert) return res.status(404).json({ error: "Алерт не найден" })
  
  alert.status = action === "ban" ? "banned" : "ignored"
  alert.resolvedAt = new Date().toISOString()
  
  if (action === "ban") {
    const u = data.users.find(x => x.id === alert.userId)
    if (u) u.isBanned = true
  }
  
  db.save(data)
  res.json({ ok: true })
})

export default r
