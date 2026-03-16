import { Router } from "express"
import { db } from "../lib/db.js"
import { authRequired, adminOnly } from "../lib/auth.js"

const r = Router()

r.get("/", authRequired, (req, res) => {
  const data = db.get()
  res.json(data.levels)
})

r.post("/", authRequired, adminOnly, (req, res) => {
  const { name, iconUrl } = req.body || {}
  const data = db.get()
  const level = { id: db.id(), name, iconUrl }
  data.levels.push(level)
  db.save(data)
  res.json(level)
})

r.post("/assign", authRequired, adminOnly, (req, res) => {
  const { userId, levelId } = req.body || {}
  const data = db.get()
  const u = data.users.find(x => x.id === userId)
  const l = data.levels.find(x => x.id === levelId)
  if (!u || !l) return res.status(400).json({ error: "Ошибка" })
  u.levelId = l.id
  db.save(data)
  res.json({ ok: true })
})

export default r
