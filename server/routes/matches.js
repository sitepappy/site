import { Router } from "express"
import { db } from "../lib/db.js"
import { authRequired, adminOnly, moderatorOrAdmin } from "../lib/auth.js"
import { nowIso } from "../lib/utils.js"
import { ensureAchievementState, grantAchievement } from "../lib/achievements.js"
import { pushNotification } from "../lib/notifications.js"

const r = Router()

r.get("/", (req, res) => {
  const data = db.get()
  const list = data.matches.filter(m => m.status !== "settled").sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""))
  res.json(list)
})

r.get("/all", authRequired, moderatorOrAdmin, (req, res) => {
  const data = db.get()
  const list = data.matches.sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""))
  res.json(list)
})

r.delete("/:id", authRequired, moderatorOrAdmin, (req, res) => {
  const data = db.get()
  data.matches = data.matches.filter(m => m.id !== req.params.id)
  // Also delete associated bets? 
  // Probably better to keep them in history but for now let's just delete the match
  db.save(data)
  res.json({ ok: true })
})

r.post("/", authRequired, moderatorOrAdmin, (req, res) => {
  const { name, teams, options, deadline } = req.body || {}
  const data = db.get()
  const m = { id: db.id(), name, teams, options: (options || []).map(o => ({ id: db.id(), name: o.name, odds: Number(o.odds) })), deadline, status: "open", createdAt: nowIso() }
  data.matches.push(m)
  db.save(data)
  res.json(m)
})

r.post("/:id/close", authRequired, moderatorOrAdmin, (req, res) => {
  const data = db.get()
  const m = data.matches.find(x => x.id === req.params.id)
  if (!m) return res.status(404).json({ error: "Матч не найден" })
  m.status = "closed"
  db.save(data)
  res.json({ ok: true })
})

r.post("/:id/settle", authRequired, moderatorOrAdmin, (req, res) => {
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
      ensureAchievementState(u)
      u.achievementProgress.noLossStreak = (u.achievementProgress.noLossStreak || 0) + 1
      if (u.achievementProgress.noLossStreak >= 10) grantAchievement(u, "no_loss_10", createdAt)
      pushNotification(data, { userId: u.id, type: "bet_win", title: "Выигрыш!", body: `+${win} 🪙 — ${m.name}`, meta: { matchId: m.id, betId: b.id } })
    } else {
      b.status = "lost"
      const u = data.users.find(x => x.id === b.userId)
      if (u) {
        ensureAchievementState(u)
        u.achievementProgress.noLossStreak = 0
      }
    }
  }
  db.save(data)
  res.json({ ok: true })
})

export default r
