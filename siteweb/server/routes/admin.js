import { Router } from "express"
import { db } from "../lib/db.js"
import { authRequired, adminOnly } from "../lib/auth.js"
import { nowIso } from "../lib/utils.js"

const r = Router()
r.use(authRequired, adminOnly)

r.get("/users", (req, res) => {
  const q = String(req.query.q || "").toLowerCase()
  const data = db.get()
  const list = data.users
    .filter(u => !q || u.username.toLowerCase().includes(q) || u.email.toLowerCase().includes(q))
    .map(u => ({ id: u.id, username: u.username, email: u.email, balance: u.balance, role: u.role, levelId: u.levelId, createdAt: u.createdAt }))
  res.json(list)
})

r.post("/users/role", (req, res) => {
  const { userId, role } = req.body || {}
  const data = db.get()
  const u = data.users.find(x => x.id === userId)
  if (!u) return res.status(404).json({ error: "Не найдено" })
  u.role = role
  db.save(data)
  res.json({ ok: true })
})

r.post("/users/balance", (req, res) => {
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

r.get("/promos", (req, res) => {
  const data = db.get()
  const list = data.promoCodes.map(p => ({ code: p.code, ownerUserId: p.ownerUserId, activations: p.totalActivations, disabled: p.disabled }))
  res.json(list)
})

r.post("/promos/disable", (req, res) => {
  const { code, disabled } = req.body || {}
  const data = db.get()
  const p = data.promoCodes.find(x => x.code === code)
  if (!p) return res.status(404).json({ error: "Не найдено" })
  p.disabled = !!disabled
  db.save(data)
  res.json({ ok: true })
})

r.get("/about", (req, res) => {
  const data = db.get()
  res.json(data.about)
})

r.post("/about", (req, res) => {
  const { contentHtml, links } = req.body || {}
  const data = db.get()
  data.about = { contentHtml: String(contentHtml || ""), links: { ...data.about.links, ...(links || {}) } }
  db.save(data)
  res.json({ ok: true })
})

r.get("/coop", (req, res) => {
  const data = db.get()
  res.json(data.coop || { contentHtml: "", links: {} })
})

r.post("/coop", (req, res) => {
  const { contentHtml, links } = req.body || {}
  const data = db.get()
  data.coop = { contentHtml: String(contentHtml || ""), links: { ...(data.coop?.links || {}), ...(links || {}) } }
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

export default r
