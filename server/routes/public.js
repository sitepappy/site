import { Router } from "express"
import { db } from "../lib/db.js"

const r = Router()

r.get("/about", (req, res) => {
  const data = db.get()
  res.json(data.about || { contentHtml: "", links: {} })
})

r.get("/coop", (req, res) => {
  const data = db.get()
  res.json(data.coop || { contentHtml: "", links: {} })
})

export default r
