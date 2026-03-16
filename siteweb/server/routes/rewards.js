import { Router } from "express"
import { db } from "../lib/db.js"
import { authRequired, adminOnly } from "../lib/auth.js"

const r = Router()

r.get("/", authRequired, (req, res) => {
  const data = db.get()
  res.json(data.rewards)
})

r.post("/", authRequired, adminOnly, (req, res) => {
  const { name, price } = req.body || {}
  const data = db.get()
  const reward = { id: db.id(), name, price: Number(price) || 0 }
  data.rewards.push(reward)
  db.save(data)
  res.json(reward)
})

export default r
