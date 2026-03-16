import { Router } from "express"
import { db } from "../lib/db.js"
import { authRequired } from "../lib/auth.js"

const r = Router()

r.get("/", authRequired, (req, res) => {
  const data = db.get()
  const my = data.promoCodes.find(p => p.ownerUserId === req.user.id) || null
  const u = data.users.find(x => x.id === req.user.id)
  
  let activationsList = []
  if (my && my.lastActivations) {
    activationsList = my.lastActivations.map(act => {
      const user = data.users.find(x => x.id === act.userId)
      return {
        username: user?.username || "Аноним",
        date: act.date
      }
    })
  }

  const stats = my && u ? {
    code: my.code,
    totalActivations: my.totalActivations || 0,
    referralLevel: u.referralLevel || null,
    referralColor: u.referralColor || null,
    referralCount: typeof u.referralCount === "number" ? u.referralCount : my.totalActivations || 0,
    activations: activationsList
  } : null
  res.json({ my, stats })
})

export default r
