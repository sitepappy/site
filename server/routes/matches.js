import { Router } from "express"
import { db } from "../lib/db.js"
import { authRequired, adminOnly } from "../lib/auth.js"
import { nowIso } from "../lib/utils.js"

const r = Router()

r.get("/", authRequired, (req, res) => {
  const data = db.get()
  const list = data.matches.filter(m => m.status !== "settled")
  res.json(list)
})

r.post("/", authRequired, adminOnly, (req, res) => {
  const { name, teams, options, deadline } = req.body || {}
  const data = db.get()
  const m = { id: db.id(), name, teams, options: (options || []).map(o => ({ id: db.id(), name: o.name, odds: Number(o.odds) })), deadline, status: "open", createdAt: nowIso() }
  data.matches.push(m)
  db.save(data)
  res.json(m)
})

r.post("/:id/close", authRequired, adminOnly, (req, res) => {
  const data = db.get()
  const m = data.matches.find(x => x.id === req.params.id)
  if (!m) return res.status(404).json({ error: "Матч не найден" })
  m.status = "closed"
  db.save(data)
  res.json({ ok: true })
})

r.post("/:id/settle", authRequired, adminOnly, (req, res) => {
  const { optionId } = req.body || {}
  const data = db.get()
  const m = data.matches.find(x => x.id === req.params.id)
  if (!m) return res.status(404).json({ error: "Матч не найден" })
  m.status = "settled"
  m.resultOptionId = optionId
  const createdAt = nowIso()
  const bets = data.bets.filter(b => b.matchId === m.id)
  for (const b of bets) {
    if (b.optionId === optionId) {
      b.status = "won"
      const u = data.users.find(x => x.id === b.userId)
      const win = Math.round(b.amount * b.odds)
      u.balance += win
      data.transactions.push({ id: db.id(), userId: u.id, type: "bet_win", amount: win, balanceAfter: u.balance, note: `Выигрыш: ${m.name}`, createdAt })
    } else {
      b.status = "lost"
    }
  }
  db.save(data)
  res.json({ ok: true })
})

export default r
