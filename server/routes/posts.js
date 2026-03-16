import { Router } from "express"
import { db } from "../lib/db.js"
import { authRequired, adminOnly, moderatorOrAdmin } from "../lib/auth.js"
import { nowIso } from "../lib/utils.js"

const r = Router()

r.get("/", (req, res) => {
  const data = db.get()
  const list = data.posts.sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""))
  res.json(list)
})

r.post("/", authRequired, adminOnly, (req, res) => {
  const { title, content, imageUrl } = req.body || {}
  const data = db.get()
  const p = { id: db.id(), title, content, imageUrl, createdAt: nowIso() }
  data.posts.push(p)
  db.save(data)
  res.json(p)
})

r.delete("/:id", authRequired, moderatorOrAdmin, (req, res) => {
  const data = db.get()
  data.posts = data.posts.filter(p => p.id !== req.params.id)
  db.save(data)
  res.json({ ok: true })
})

export default r
