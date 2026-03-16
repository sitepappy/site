import { Router } from "express"
import { db } from "../lib/db.js"
import { authRequired, adminOnly } from "../lib/auth.js"
import { nowIso } from "../lib/utils.js"

export function calculateReferralLevel(count) {
  if (count >= 60) return { name: "Титан", color: "#FF0000" } // Red
  if (count >= 50) return { name: "Божество", color: "#FFD700" } // Gold
  if (count >= 40) return { name: "Властелин", color: "#800080" } // Purple
  if (count >= 30) return { name: "Легенда", color: "#00BFFF" } // DeepSkyBlue
  if (count >= 20) return { name: "Герой", color: "#32CD32" } // LimeGreen
  if (count >= 15) return { name: "Рыцарь", color: "#FF8C00" } // DarkOrange
  if (count >= 10) return { name: "Страж", color: "#708090" } // SlateGray
  if (count >= 5) return { name: "Рекрут", color: "#A9A9A9" } // DarkGray
  return null
}

const r = Router()

r.get("/", authRequired, (req, res) => {
  const data = db.get()
  const list = data.quests.filter(q => q.active !== false)
  res.json(list)
})

r.post("/:id/complete", authRequired, (req, res) => {
  const data = db.get()
  const q = data.quests.find(x => x.id === req.params.id)
  if (!q) return res.status(404).json({ error: "Квест не найден" })
  const already = data.userQuests.find(uq => uq.userId === req.user.id && uq.questId === q.id)
  if (already) return res.status(400).json({ error: "Уже выполнено" })
  const u = data.users.find(x => x.id === req.user.id)
  const createdAt = nowIso()
  data.userQuests.push({ id: db.id(), userId: u.id, questId: q.id, completedAt: createdAt })
  u.balance += q.reward
  data.transactions.push({ id: db.id(), userId: u.id, type: "quest", amount: q.reward, balanceAfter: u.balance, note: `Квест: ${q.name}`, createdAt })
  if (u.referralByPromo && !u.referralRewarded && u.emailVerified) {
    const promo = data.promoCodes.find(p => p.code === u.referralByPromo && !p.disabled)
    if (promo) {
      const day = new Date().toISOString().slice(0, 10)
      promo.dailyActivations[day] = promo.dailyActivations[day] || 0
      if (promo.dailyActivations[day] < 50) {
        const dupDevice = promo.lastActivations.find(a => a.deviceId && u.deviceIds.includes(a.deviceId))
        const dupIp = promo.lastActivations.find(a => a.ip && u.ips.includes(a.ip))
        if (!dupDevice && !dupIp) {
          u.balance += 1
          data.transactions.push({ id: db.id(), userId: u.id, type: "referral", amount: 1, balanceAfter: u.balance, note: "Бонус за промокод", createdAt })
          const owner = data.users.find(x => x.id === promo.ownerUserId)
          if (owner) {
            owner.balance += 1
            data.transactions.push({ id: db.id(), userId: owner.id, type: "referral_owner", amount: 1, balanceAfter: owner.balance, note: `Активация промокода ${promo.code}`, createdAt })
            owner.referralCount = (owner.referralCount || 0) + 1
            const lvlObj = calculateReferralLevel(owner.referralCount)
            owner.referralLevel = lvlObj?.name || null
            owner.referralColor = lvlObj?.color || null
          }
          promo.totalActivations += 1
          promo.dailyActivations[day] += 1
          promo.lastActivations.push({ userId: u.id, deviceId: u.deviceIds[0] || "", ip: u.ips[0] || "", date: createdAt })
          u.referralRewarded = true
        }
      }
    }
  }
  db.save(data)
  res.json({ ok: true })
})

r.post("/", authRequired, moderatorOrAdmin, (req, res) => {
  const { name, reward } = req.body || {}
  const data = db.get()
  const q = { id: db.id(), name, reward: Number(reward) || 1, active: true }
  data.quests.push(q)
  db.save(data)
  res.json(q)
})

export default r
