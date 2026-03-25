import { Router } from "express"
import { db } from "../lib/db.js"
import { authRequired } from "../lib/auth.js"
import { isAlnum } from "../lib/utils.js"

const r = Router()

r.get("/me", authRequired, (req, res) => {
  const data = db.get()
  const u = data.users.find(x => x.id === req.user.id)
  if (!u) return res.status(404).json({ error: "Не найдено" })
  const level = data.levels.find(l => l.id === u.levelId) || null
  res.json({
    id: u.id,
    username: u.username,
    email: u.email,
    balance: u.balance,
    level,
    role: u.role,
    promoCode: u.promoCode,
    avatarUrl: u.avatarUrl || "",
    bannerUrl: u.bannerUrl || "",
    referralLevel: u.referralLevel || null,
    referralColor: u.referralColor || null,
    referralCount: typeof u.referralCount === "number" ? u.referralCount : null,
    steamTradeLink: u.steamTradeLink,
    telegram: u.telegram || "",
    achievements: Array.isArray(u.achievements) ? u.achievements : [],
    achievementProgress: u.achievementProgress || null,
    settings: data.settings || { cs2ThemesEnabled: true },
    createdAt: u.createdAt
  })
})

r.put("/trade-link", authRequired, (req, res) => {
  const { link, telegram } = req.body || {}
  const data = db.get()
  const u = data.users.find(x => x.id === req.user.id)
  if (!u) return res.status(404).json({ error: "Не найдено" })
  if (typeof link === "string") u.steamTradeLink = String(link).trim()
  if (typeof telegram === "string") {
    let tg = telegram.trim()
    if (tg && tg.startsWith("@")) tg = tg.substring(1)
    u.telegram = tg
  }
  db.save(data)
  res.json({ ok: true })
})

r.get("/profile/:id", (req, res) => {
  const data = db.get()
  const u = data.users.find(x => x.id === req.params.id)
  if (!u) return res.status(404).json({ error: "Пользователь не найден" })
  
  const level = data.levels.find(l => l.id === u.levelId) || null
  const posts = data.posts.filter(p => p.userId === u.id).sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  
  res.json({
    id: u.id,
    username: u.username,
    avatarUrl: u.avatarUrl || "",
    bannerUrl: u.bannerUrl || "",
    level,
    role: u.role,
    achievements: Array.isArray(u.achievements) ? u.achievements : [],
    referralLevel: u.referralLevel || null,
    referralColor: u.referralColor || null,
    referralCount: typeof u.referralCount === "number" ? u.referralCount : 0,
    createdAt: u.createdAt,
    posts: posts.map(p => ({
      ...p,
      author: {
        id: u.id,
        username: u.username,
        avatar: u.avatarUrl,
        role: u.role
      }
    }))
  })
})

r.put("/me", authRequired, (req, res) => {
  const { username, avatarUrl, bannerUrl } = req.body || {}
  const data = db.get()
  const u = data.users.find(x => x.id === req.user.id)
  if (!u) return res.status(404).json({ error: "Не найдено" })

  if (typeof username === "string") {
    const nm = username.trim()
    if (nm.length < 3 || nm.length > 24) {
      return res.status(400).json({ error: "Никнейм 3-24 символа" })
    }
    u.username = nm
  }

  if (typeof avatarUrl === "string") {
    const url = avatarUrl.trim()
    if (url && !/^https?:\/\//i.test(url)) {
      return res.status(400).json({ error: "Аватарка должна быть ссылкой http(s)" })
    }
    u.avatarUrl = url
  }

  if (typeof bannerUrl === "string") {
    const url = bannerUrl.trim()
    if (url && !/^https?:\/\//i.test(url)) {
      return res.status(400).json({ error: "Баннер должен быть ссылкой http(s)" })
    }
    u.bannerUrl = url
  }

  db.save(data)
  res.json({ ok: true })
})

r.post("/promo-code", authRequired, (req, res) => {
  const { code } = req.body || {}
  const data = db.get()
  const u = data.users.find(x => x.id === req.user.id)
  if (!u) return res.status(404).json({ error: "Не найдено" })
  if (u.promoCode) return res.status(400).json({ error: "Промокод уже создан" })
  const c = String(code || "").trim().toUpperCase()
  if (c.length < 4 || c.length > 12 || !isAlnum(c)) return res.status(400).json({ error: "4-12 символов, только буквы и цифры" })
  if (data.promoCodes.find(p => p.code.toLowerCase() === c.toLowerCase())) return res.status(400).json({ error: "Занято" })
  u.promoCode = c
  data.promoCodes.push({ code: c, type: "referral", ownerUserId: u.id, totalActivations: 0, lastActivations: [], dailyActivations: {}, disabled: false })
  db.save(data)
  res.json({ ok: true, code: c })
})

r.get("/:id/transactions", authRequired, (req, res) => {
  if (req.params.id !== req.user.id) return res.status(403).json({ error: "Доступ запрещён" })
  const data = db.get()
  const list = data.transactions.filter(t => t.userId === req.user.id).sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  res.json(list)
})

r.post("/reports", authRequired, (req, res) => {
  const { title, content } = req.body || {}
  if (!title || !content) return res.status(400).json({ error: "Заполните все поля" })
  
  const data = db.get()
  if (!data.reports) data.reports = []
  
  const report = {
    id: db.id(),
    userId: req.user.id,
    username: (data.users.find(u => u.id === req.user.id))?.username || "Unknown",
    title,
    content,
    status: "pending",
    adminResponses: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
  
  data.reports.push(report)
  db.save(data)
  res.json({ ok: true, report })
})

r.get("/reports", authRequired, (req, res) => {
  const data = db.get()
  const list = (data.reports || []).filter(r => r.userId === req.user.id)
  res.json(list)
})

export default r
