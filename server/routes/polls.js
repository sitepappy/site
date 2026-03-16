import { Router } from "express"
import { db } from "../lib/db.js"
import { authRequired, adminOnly } from "../lib/auth.js"
import { nowIso } from "../lib/utils.js"

const r = Router()

r.get("/", authRequired, (req, res) => {
  const data = db.get()
  res.json(data.polls)
})

r.post("/", authRequired, adminOnly, (req, res) => {
  const { question, options } = req.body || {}
  const data = db.get()
  const poll = { id: db.id(), question, options: (options || []).map(o => ({ id: db.id(), text: o })), createdAt: nowIso() }
  data.polls.push(poll)
  db.save(data)
  res.json(poll)
})

r.post("/:id/vote", authRequired, (req, res) => {
  const { optionId } = req.body || {}
  const data = db.get()
  const poll = data.polls.find(p => p.id === req.params.id)
  if (!poll) return res.status(404).json({ error: "Опрос не найден" })
  const already = data.votes.find(v => v.userId === req.user.id && v.pollId === poll.id)
  if (already) return res.status(400).json({ error: "Уже проголосовали" })
  const opt = poll.options.find(o => o.id === optionId)
  if (!opt) return res.status(400).json({ error: "Опция не найдена" })
  data.votes.push({ id: db.id(), pollId: poll.id, userId: req.user.id, optionId })
  db.save(data)
  res.json({ ok: true })
})

export default r
