import { Router } from "express"
import { db } from "../lib/db.js"
import { authRequired } from "../lib/auth.js"

const r = Router()

r.get("/", authRequired, (req, res) => {
  const data = db.get()
  const richest = [...data.users].sort((a, b) => b.balance - a.balance).slice(0, 10).map(u => ({ username: u.username, balance: u.balance, referralLevel: u.referralLevel, referralColor: u.referralColor }))
  const referrals = [...data.promoCodes].sort((a, b) => b.totalActivations - a.totalActivations).slice(0, 10).map(p => {
    const u = data.users.find(x => x.id === p.ownerUserId)
    return { username: u?.username, code: p.code, activations: p.totalActivations, referralLevel: u?.referralLevel, referralColor: u?.referralColor }
  })
  const bettors = data.users.map(u => {
    const sum = data.bets.filter(b => b.userId === u.id).reduce((s, b) => s + b.amount, 0)
    return { username: u.username, total: sum, referralLevel: u.referralLevel, referralColor: u.referralColor }
  }).sort((a, b) => b.total - a.total).slice(0, 10)
  const questers = data.users.map(u => {
    const cnt = data.userQuests.filter(q => q.userId === u.id).length
    return { username: u.username, count: cnt, referralLevel: u.referralLevel, referralColor: u.referralColor }
  }).sort((a, b) => b.count - a.count).slice(0, 10)
  res.json({ richest, referrals, bettors, questers })
})

export default r
