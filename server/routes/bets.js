import { Router } from "express"
import { db } from "../lib/db.js"
import { authRequired } from "../lib/auth.js"
import { nowIso } from "../lib/utils.js"

const r = Router()

r.post("/", authRequired, (req, res) => {
  const { matchId, optionId, amount } = req.body || {}
  const data = db.get()
  const m = data.matches.find(x => x.id === matchId)
  if (!m) return res.status(404).json({ error: "Матч не найден" })
  if (m.status !== "open" || new Date(m.deadline).getTime() <= Date.now()) return res.status(400).json({ error: "Приём ставок закрыт" })
  const opt = m.options.find(o => o.id === optionId)
  if (!opt) return res.status(400).json({ error: "Опция не найдена" })
  const amt = Number(amount)
  if (amt < 1 || amt > 50) return res.status(400).json({ error: "Ставка 1-50 монет" })
  const u = data.users.find(x => x.id === req.user.id)
  if (u.balance < amt) return res.status(400).json({ error: "Недостаточно монет" })
  u.balance -= amt
  const createdAt = nowIso()
  data.transactions.push({ id: db.id(), userId: u.id, type: "bet", amount: -amt, balanceAfter: u.balance, note: `Ставка: ${m.name}`, createdAt })
  data.bets.push({ id: db.id(), userId: u.id, matchId: m.id, optionId, amount: amt, odds: opt.odds, status: "pending", createdAt })
  db.save(data)
  res.json({ ok: true })
})

r.get("/my", authRequired, (req, res) => {
  const data = db.get()
  const list = data.bets.filter(b => b.userId === req.user.id).sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  res.json(list)
})

r.get("/recent", authRequired, (req, res) => {
  const data = db.get()
  const list = data.bets.sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 50).map(b => {
    const u = data.users.find(x => x.id === b.userId)
    const m = data.matches.find(x => x.id === b.matchId)
    const opt = m?.options.find(o => o.id === b.optionId)
    return {
      id: b.id,
      username: u?.username || "Аноним",
      matchName: m?.name || "Матч",
      optionName: opt?.name || "Ставка",
      amount: b.amount,
      status: b.status,
      createdAt: b.createdAt
    }
  })
  res.json(list)
})

export default r
