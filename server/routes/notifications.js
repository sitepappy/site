import { Router } from "express"
import { db } from "../lib/db.js"
import { authRequired } from "../lib/auth.js"

const r = Router()

r.get("/", authRequired, (req, res) => {
  const data = db.get()
  const list = (data.notifications || []).filter(n => n.userId === req.user.id)
  const unreadCount = list.filter(n => !n.read).length
  const items = list.sort((a, b) => String(b.createdAt || "").localeCompare(String(a.createdAt || ""))).slice(0, 30)
  res.json({ unreadCount, items })
})

r.post("/read-all", authRequired, (req, res) => {
  const data = db.get()
  let changed = false
  for (const n of (data.notifications || [])) {
    if (n.userId === req.user.id && !n.read) {
      n.read = true
      changed = true
    }
  }
  if (changed) db.save(data)
  res.json({ ok: true })
})

r.post("/:id/read", authRequired, (req, res) => {
  const data = db.get()
  const n = (data.notifications || []).find(x => x.id === req.params.id && x.userId === req.user.id)
  if (!n) return res.status(404).json({ error: "Не найдено" })
  n.read = true
  db.save(data)
  res.json({ ok: true })
})

export default r

