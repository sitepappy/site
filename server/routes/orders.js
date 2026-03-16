import { Router } from "express"
import { db } from "../lib/db.js"
import { authRequired, adminOnly } from "../lib/auth.js"
import { nowIso } from "../lib/utils.js"

const r = Router()

r.post("/", authRequired, (req, res) => {
  const { rewardId, tradeLink } = req.body || {}
  const data = db.get()
  const reward = data.rewards.find(r => r.id === rewardId)
  if (!reward) return res.status(404).json({ error: "Награда не найдена" })
  const u = data.users.find(x => x.id === req.user.id)
  if (u.balance < reward.price) return res.status(400).json({ error: "Недостаточно монет" })
  u.balance -= reward.price
  const createdAt = nowIso()
  data.transactions.push({ id: db.id(), userId: u.id, type: "reward_order", amount: -reward.price, balanceAfter: u.balance, note: `Заказ: ${reward.name}`, createdAt })
  const order = { id: db.id(), userId: u.id, rewardId: reward.id, tradeLink, status: "Pending", createdAt, updatedAt: createdAt }
  data.orders.push(order)
  db.save(data)
  res.json(order)
})

r.get("/my", authRequired, (req, res) => {
  const data = db.get()
  const list = data.orders.filter(o => o.userId === req.user.id).sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  res.json(list)
})

r.get("/", authRequired, adminOnly, (req, res) => {
  const data = db.get()
  const list = data.orders.map(o => {
    const u = data.users.find(x => x.id === o.userId)
    const r = data.rewards.find(x => x.id === o.rewardId)
    return { ...o, username: u?.username, rewardName: r?.name }
  })
  res.json(list)
})

r.post("/:id/status", authRequired, adminOnly, (req, res) => {
  const { status } = req.body || {}
  const data = db.get()
  const o = data.orders.find(x => x.id === req.params.id)
  if (!o) return res.status(404).json({ error: "Заказ не найден" })
  o.status = status
  o.updatedAt = nowIso()
  db.save(data)
  res.json({ ok: true })
})

export default r
