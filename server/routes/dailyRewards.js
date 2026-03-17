import { Router } from "express"
import { db } from "../lib/db.js"
import { authRequired } from "../lib/auth.js"
import { nowIso } from "../lib/utils.js"
import { ensureAchievementState, grantAchievement } from "../lib/achievements.js"

const r = Router()

const DAY_MS = 24 * 60 * 60 * 1000
const LOCK_DAYS = 7
const BUYOUT_COST = 5

const DAILY_PATH = [
  { day: 1, type: "coins", amount: 1 },
  { day: 2, type: "coins", amount: 1 },
  { day: 3, type: "coins", amount: 1 },
  { day: 4, type: "coins", amount: 1 },
  { day: 5, type: "coins", amount: 1 },
  { day: 6, type: "coins", amount: 1 },
  { day: 7, type: "coins", amount: 1 },
  { day: 8, type: "coins", amount: 1 },
  { day: 9, type: "coins", amount: 1 },
  { day: 10, type: "item", itemKind: "sticker", title: "Наклейка" },
  { day: 11, type: "coins", amount: 1 },
  { day: 12, type: "coins", amount: 1 },
  { day: 13, type: "coins", amount: 1 },
  { day: 14, type: "coins", amount: 1 },
  { day: 15, type: "item", itemKind: "cheap_skin", title: "Дешёвый скин" },
  { day: 16, type: "coins", amount: 1 },
  { day: 17, type: "coins", amount: 1 },
  { day: 18, type: "coins", amount: 1 },
  { day: 19, type: "coins", amount: 1 },
  { day: 20, type: "item", itemKind: "sticker", title: "Наклейка" },
  { day: 21, type: "coins", amount: 1 },
  { day: 22, type: "coins", amount: 1 },
  { day: 23, type: "coins", amount: 1 },
  { day: 24, type: "coins", amount: 1 },
  { day: 25, type: "coins", amount: 1 },
  { day: 26, type: "coins", amount: 1 },
  { day: 27, type: "coins", amount: 1 },
  { day: 28, type: "coins", amount: 1 },
  { day: 29, type: "coins", amount: 1 },
  { day: 30, type: "item", itemKind: "medium_skin", title: "Средний скин" }
]

function getRewardByDay(day) {
  return DAILY_PATH.find(x => x.day === day) || DAILY_PATH[0]
}

function normalizeDaily(u) {
  if (!u.dailyRewards || typeof u.dailyRewards !== "object") {
    u.dailyRewards = { day: 1, lastClaimAt: null, lockedUntil: null, cycleCount: 0 }
  }
  if (typeof u.dailyRewards.day !== "number" || u.dailyRewards.day < 1 || u.dailyRewards.day > 30) u.dailyRewards.day = 1
  if (typeof u.dailyRewards.cycleCount !== "number" || u.dailyRewards.cycleCount < 0) u.dailyRewards.cycleCount = 0
  if (typeof u.dailyRewards.lastClaimAt === "undefined") u.dailyRewards.lastClaimAt = null
  if (typeof u.dailyRewards.lockedUntil === "undefined") u.dailyRewards.lockedUntil = null
}

function toIso(ms) {
  return new Date(ms).toISOString()
}

function parseIso(iso) {
  if (!iso) return null
  const ms = Date.parse(iso)
  return Number.isFinite(ms) ? ms : null
}

r.get("/status", authRequired, (req, res) => {
  const data = db.get()
  const u = data.users.find(x => x.id === req.user.id)
  if (!u) return res.status(404).json({ error: "Не найдено" })

  normalizeDaily(u)

  const now = Date.now()
  const lockedUntilMs = parseIso(u.dailyRewards.lockedUntil)
  const lastMs = parseIso(u.dailyRewards.lastClaimAt)
  const nextDay = u.dailyRewards.day
  const reward = getRewardByDay(nextDay)

  if (lockedUntilMs && now < lockedUntilMs) {
    return res.json({
      day: nextDay,
      progress: nextDay === 1 ? 0 : nextDay - 1,
      canClaim: false,
      missed: false,
      lockedUntil: toIso(lockedUntilMs),
      nextClaimAt: null,
      buyoutCost: BUYOUT_COST,
      reward
    })
  }

  if (!lastMs) {
    return res.json({
      day: nextDay,
      progress: nextDay === 1 ? 0 : nextDay - 1,
      canClaim: true,
      missed: false,
      lockedUntil: null,
      nextClaimAt: null,
      buyoutCost: BUYOUT_COST,
      reward
    })
  }

  const elapsed = now - lastMs
  if (elapsed < DAY_MS) {
    return res.json({
      day: nextDay,
      progress: nextDay === 1 ? 0 : nextDay - 1,
      canClaim: false,
      missed: false,
      lockedUntil: null,
      nextClaimAt: toIso(lastMs + DAY_MS),
      buyoutCost: BUYOUT_COST,
      reward
    })
  }

  if (elapsed >= 2 * DAY_MS) {
    return res.json({
      day: nextDay,
      progress: nextDay === 1 ? 0 : nextDay - 1,
      canClaim: true,
      missed: true,
      lockedUntil: null,
      nextClaimAt: null,
      buyoutCost: BUYOUT_COST,
      reward
    })
  }

  return res.json({
    day: nextDay,
    progress: nextDay === 1 ? 0 : nextDay - 1,
    canClaim: true,
    missed: false,
    lockedUntil: null,
    nextClaimAt: null,
    buyoutCost: BUYOUT_COST,
    reward
  })
})

r.post("/claim", authRequired, (req, res) => {
  const { tradeLink, payBuyout, acceptLock } = req.body || {}
  const data = db.get()
  const u = data.users.find(x => x.id === req.user.id)
  if (!u) return res.status(404).json({ error: "Не найдено" })

  normalizeDaily(u)

  const now = Date.now()
  const lockedUntilMs = parseIso(u.dailyRewards.lockedUntil)
  if (lockedUntilMs && now < lockedUntilMs) {
    return res.status(400).json({ error: "Стрик заблокирован", lockedUntil: toIso(lockedUntilMs) })
  }

  const lastMs = parseIso(u.dailyRewards.lastClaimAt)
  if (lastMs && now - lastMs < DAY_MS) {
    return res.status(400).json({ error: "Слишком рано", nextClaimAt: toIso(lastMs + DAY_MS) })
  }

  const missed = !!(lastMs && now - lastMs >= 2 * DAY_MS)
  if (missed && !payBuyout) {
    if (!acceptLock) {
      return res.status(400).json({ error: "Пропуск дня", buyoutCost: BUYOUT_COST, lockDays: LOCK_DAYS, requiresAction: true })
    }
    const lockUntil = now + LOCK_DAYS * DAY_MS
    u.dailyRewards.lockedUntil = toIso(lockUntil)
    u.dailyRewards.day = 1
    u.dailyRewards.lastClaimAt = null
    ensureAchievementState(u)
    u.achievementProgress.dailyStreak = 0
    u.achievementProgress.lastDailyClaimAt = null
    db.save(data)
    return res.json({ ok: true, locked: true, lockedUntil: toIso(lockUntil) })
  }

  if (missed && payBuyout) {
    if (u.balance < BUYOUT_COST) return res.status(400).json({ error: "Недостаточно монет для откупа" })
    u.balance -= BUYOUT_COST
    data.transactions.push({
      id: db.id(),
      userId: u.id,
      type: "daily_buyout",
      amount: -BUYOUT_COST,
      balanceAfter: u.balance,
      note: "Откуп за пропуск ежедневной награды",
      createdAt: nowIso()
    })
  }

  const day = u.dailyRewards.day
  const reward = getRewardByDay(day)
  const createdAt = nowIso()

  if (reward.type === "coins") {
    const amount = Number(reward.amount) || 1
    u.balance += amount
    data.transactions.push({
      id: db.id(),
      userId: u.id,
      type: "daily_reward",
      amount,
      balanceAfter: u.balance,
      note: `Ежедневная награда: День ${day}`,
      createdAt
    })
  } else {
    const link = String(tradeLink || "").trim()
    if (!link.includes("steamcommunity.com/tradeoffer/new")) {
      return res.status(400).json({ error: "Введите корректный Steam Trade Link" })
    }
    const order = {
      id: db.id(),
      userId: u.id,
      rewardId: null,
      title: `Ежедневная награда: День ${day} — ${reward.title}`,
      tradeLink: link,
      status: "Pending",
      messages: [],
      dailyDay: day,
      dailyKind: reward.itemKind,
      createdAt,
      updatedAt: createdAt
    }
    data.orders.push(order)
  }

  u.dailyRewards.lastClaimAt = createdAt
  u.dailyRewards.lockedUntil = null
  ensureAchievementState(u)
  if (!lastMs) {
    u.achievementProgress.dailyStreak = 1
  } else {
    u.achievementProgress.dailyStreak = (u.achievementProgress.dailyStreak || 0) + 1
  }
  u.achievementProgress.lastDailyClaimAt = createdAt
  if (u.achievementProgress.dailyStreak >= 5) {
    grantAchievement(u, "daily_5", createdAt)
  }
  if (day >= 30) {
    u.dailyRewards.day = 1
    u.dailyRewards.cycleCount = (u.dailyRewards.cycleCount || 0) + 1
  } else {
    u.dailyRewards.day = day + 1
  }

  db.save(data)
  res.json({ ok: true, dayClaimed: day, reward, balance: u.balance })
})

export default r
