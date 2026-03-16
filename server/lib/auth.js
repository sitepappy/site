import jwt from "jsonwebtoken"
import { db } from "./db.js"

const secret = process.env.JWT_SECRET || "dev_secret"

export function signToken(payload) {
  return jwt.sign(payload, secret, { expiresIn: "7d" })
}

export function authRequired(req, res, next) {
  const h = req.headers.authorization || ""
  const t = h.startsWith("Bearer ") ? h.slice(7) : null
  if (!t) return res.status(401).json({ error: "Требуется вход" })
  try {
    const data = jwt.verify(t, secret)
    const dbData = db.get()
    const user = dbData.users.find(u => u.id === data.id)
    if (!user) return res.status(401).json({ error: "Пользователь не найден" })
    if (user.isBanned) return res.status(403).json({ error: "Ваш аккаунт заблокирован" })
    
    req.user = data
    next()
  } catch {
    res.status(401).json({ error: "Недействительный токен" })
  }
}

export function adminOnly(req, res, next) {
  if (!req.user || req.user.role !== "admin") return res.status(403).json({ error: "Доступ запрещён" })
  next()
}

export function moderatorOrAdmin(req, res, next) {
  if (!req.user) return res.status(403).json({ error: "Доступ запрещён" })
  if (req.user.role === "admin" || req.user.role === "moderator") return next()
  return res.status(403).json({ error: "Доступ запрещён" })
}

