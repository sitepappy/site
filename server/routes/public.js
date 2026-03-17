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

export default r
