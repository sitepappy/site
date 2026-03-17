import { Router } from "express"
import { db } from "../lib/db.js"
import { authRequired, adminOnly, moderatorOrAdmin } from "../lib/auth.js"
import { nowIso } from "../lib/utils.js"
import { pushNotification } from "../lib/notifications.js"

const r = Router()
const ALLOWED_STATUSES = ["Pending", "InProgress", "Issued", "Rejected", "Completed"]

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
  const order = { id: db.id(), userId: u.id, rewardId: reward.id, tradeLink, status: "Pending", messages: [], createdAt, updatedAt: createdAt }
  data.orders.push(order)
  db.save(data)
  res.json(order)
})

r.get("/my", authRequired, (req, res) => {
  const data = db.get()
  const list = data.orders
    .filter(o => o.userId === req.user.id)
    .map(o => {
      const reward = o.rewardId ? data.rewards.find(x => x.id === o.rewardId) : null
      return { ...o, rewardName: reward?.name || o.title || "Заказ" }
    })
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  res.json(list)
})

r.get("/", authRequired, adminOnly, (req, res) => {
  const data = db.get()
  const list = data.orders.map(o => {
    const u = data.users.find(x => x.id === o.userId)
    const reward = o.rewardId ? data.rewards.find(x => x.id === o.rewardId) : null
    return { ...o, username: u?.username, rewardName: reward?.name || o.title || "Заказ" }
  })
  res.json(list)
})

r.post("/:id/complete", authRequired, moderatorOrAdmin, (req, res) => {
  const { status, message } = req.body || {}
  const data = db.get()
  const o = data.orders.find(x => x.id === req.params.id)
  if (!o) return res.status(404).json({ error: "Заказ не найден" })
  const nextStatus = String(status || o.status || "Pending")
  if (!ALLOWED_STATUSES.includes(nextStatus)) return res.status(400).json({ error: "Неверный статус" })
  o.status = nextStatus
  o.updatedAt = nowIso()
  if (!Array.isArray(o.messages)) o.messages = []
  const text = String(message || "").trim()
  if (text) {
    const admin = data.users.find(u => u.id === req.user.id)
    o.messages.push({ id: db.id(), adminId: req.user.id, adminUsername: admin?.username || "Admin", message: text, createdAt: o.updatedAt })
  }
  const statusRu =
    nextStatus === "Pending" ? "Ожидает" :
    nextStatus === "InProgress" ? "В работе" :
    nextStatus === "Issued" ? "Выдано" :
    nextStatus === "Rejected" ? "Отклонено" : "Выполнено"
  pushNotification(data, {
    userId: o.userId,
    type: "order",
    title: "Статус заказа обновлён",
    body: text ? `${statusRu}: ${text}` : `Статус: ${statusRu}`,
    meta: { orderId: o.id, status: nextStatus }
  })
  db.save(data)
  res.json({ ok: true })
})

export default r
