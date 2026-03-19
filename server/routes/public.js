import { Router } from "express"
import { db } from "../lib/db.js"

const r = Router()

r.get("/about", (req, res) => {
  const data = db.get()
  res.json(data.about || { contentHtml: "", links: {} })
})

r.get("/schedule", (req, res) => {
  const data = db.get()
  res.json(data.schedule || { contentHtml: "", streams: [] })
})

r.get("/stats", (req, res) => {
  const data = db.get()
  const userCount = Array.isArray(data.users) ? data.users.length : 0
  res.json({ userCount: userCount + 55 })
})

r.get("/staff", (req, res) => {
  const data = db.get()
  const staff = data.users
    .filter(u => u.role === "admin" || u.role === "moderator")
    .map(u => ({
      id: u.id,
      username: u.username,
      role: u.role,
      avatar: u.avatar || null,
      levelId: u.levelId || null
    }))
    .sort((a, b) => {
      if (a.role === "admin" && b.role !== "admin") return -1
      if (a.role !== "admin" && b.role === "admin") return 1
      return a.username.localeCompare(b.username)
    })
  res.json(staff)
})

export default r
