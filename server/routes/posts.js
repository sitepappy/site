import { Router } from "express"
import { db } from "../lib/db.js"
import { authRequired, adminOnly, moderatorOrAdmin } from "../lib/auth.js"
import { nowIso } from "../lib/utils.js"

const r = Router()

r.get("/", (req, res) => {
  const data = db.get()
  const list = data.posts.map(p => {
    const user = data.users.find(u => u.id === p.userId) || { username: "PAPPY", avatar: null };
    return {
      ...p,
      author: {
        id: user.id,
        username: user.username,
        avatar: user.avatar,
        role: user.role
      }
    };
  }).sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""))
  res.json(list)
})

r.post("/", authRequired, moderatorOrAdmin, (req, res) => {
  const { title, content, imageUrl } = req.body || {}
  const data = db.get()
  const p = { 
    id: db.id(), 
    title, 
    content, 
    imageUrl, 
    userId: req.user.id, // Store author ID
    createdAt: nowIso() 
  }
  data.posts.push(p)
  db.save(data)
  res.json(p)
})

r.post("/:id/comment", authRequired, (req, res) => {
  const { content } = req.body || {}
  if (!content) return res.status(400).json({ error: "Напишите комментарий" })
  
  const data = db.get()
  const p = data.posts.find(x => x.id === req.params.id)
  if (!p) return res.status(404).json({ error: "Пост не найден" })
  
  if (!p.comments) p.comments = []
  
  const user = data.users.find(u => u.id === req.user.id)
  const comment = {
    id: db.id(),
    userId: user.id,
    username: user.username,
    content,
    createdAt: nowIso()
  }
  
  p.comments.push(comment)
  db.save(data)
  res.json(comment)
})

export default r
