import { Router } from "express"
import { db } from "../lib/db.js"
import { authRequired, moderatorOrAdmin } from "../lib/auth.js"
import { nowIso } from "../lib/utils.js"

const r = Router()

r.get("/", (req, res) => {
  const data = db.get()
  const list = data.globalChat || []
  res.json(list)
})

r.post("/", authRequired, (req, res) => {
  const { message } = req.body || {}
  if (!message || message.trim().length === 0) return res.status(400).json({ error: "Пустое сообщение" })
  if (message.length > 500) return res.status(400).json({ error: "Слишком длинное сообщение" })
  
  const data = db.get()
  if (!data.globalChat) data.globalChat = []
  
  const user = data.users.find(u => u.id === req.user.id)
  if (!user) return res.status(404).json({ error: "Пользователь не найден" })
  if (user.isBanned) return res.status(403).json({ error: "Вы забанены" })

  const msg = {
    id: db.id(),
    userId: user.id,
    username: user.username,
    avatar: user.avatarUrl,
    levelId: user.levelId,
    role: user.role,
    message: message.trim(),
    createdAt: nowIso()
  }
  
  data.globalChat.push(msg)
  if (data.globalChat.length > 200) data.globalChat.shift()
  
  db.save(data)
  res.json(msg)
})

r.delete("/:id", authRequired, moderatorOrAdmin, (req, res) => {
  const data = db.get()
  if (!data.globalChat) return res.status(404).json({ error: "Чат пуст" })
  
  data.globalChat = data.globalChat.filter(m => m.id !== req.params.id)
  db.save(data)
  res.json({ ok: true })
})

export default r
