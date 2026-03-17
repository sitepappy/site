import { Router } from "express"
import { db } from "../lib/db.js"
import { authRequired } from "../lib/auth.js"
import { nowIso } from "../lib/utils.js"

const r = Router()

r.post("/", authRequired, (req, res) => {
  const { matchId, optionId, amount } = req.body || {}
  const data = db.get()
  const m = data.matches.find(x => x.id === matchId)
  if (!m) return res.status(404).json({ error: "Матч не найден" })
  if (m.status !== "open" || new Date(m.deadline).getTime() <= Date.now()) return res.status(400).json({ error: "Приём ставок закрыт" })
  const opt = m.options.find(o => o.id === optionId)
  if (!opt) return res.status(400).json({ error: "Опция не найдена" })
  const amt = Number(amount)
  if (amt < 1 || amt > 50) return res.status(400).json({ error: "Ставка 1-50 монет" })
  const u = data.users.find(x => x.id === req.user.id)
  if (u.balance < amt) return res.status(400).json({ error: "Недостаточно монет" })
  u.balance -= amt
  const createdAt = nowIso()
  data.transactions.push({ id: db.id(), userId: u.id, type: "bet", amount: -amt, balanceAfter: u.balance, note: `Ставка: ${m.name}`, createdAt })
  data.bets.push({ id: db.id(), userId: u.id, matchId: m.id, optionId, amount: amt, odds: opt.odds, status: "pending", createdAt })
  db.save(data)
  res.json({ ok: true })
})

r.get("/my", authRequired, (req, res) => {
  const data = db.get()
  const list = data.bets.filter(b => b.userId === req.user.id).sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  res.json(list)
})

r.get("/recent", (req, res) => {
  const data = db.get()
  const list = (data.bets || []).sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || "")).slice(0, 50).map(b => {
    const u = data.users.find(x => x.id === b.userId)
    const m = data.matches.find(x => x.id === b.matchId)
    const opt = m?.options.find(o => o.id === b.optionId)
    return {
      id: b.id,
      username: u?.username || "Аноним",
      matchName: m?.name || "Матч",
      optionName: opt?.name || "Ставка",
      amount: b.amount,
      status: b.status,
      createdAt: b.createdAt
    }
  })
  res.json(list)
})

r.post("/roulette", authRequired, (req, res) => {
  const { color, amount } = req.body || {}
  const amt = Math.floor(Number(amount))
  if (amt < 1) return res.status(400).json({ error: "Минимальная ставка 1 монета" })
  if (!["red", "black", "green"].includes(color)) return res.status(400).json({ error: "Неверный цвет" })
  
  const data = db.get()
  const u = data.users.find(x => x.id === req.user.id)
  if (!u || u.balance < amt) return res.status(400).json({ error: "Недостаточно монет" })
  
  // Тихая логика шансов
  // Зеленое: 1%
  // Общий шанс на выигрыш: 33%
  // Красное/Черное: (33 - 1) / 2 = 16% каждое
  const rng = Math.random() * 100
  let resultColor = "lose" // Default to losing
  
  if (rng < 1) {
    resultColor = "green"
  } else if (rng < 17) {
    resultColor = "red"
  } else if (rng < 33) {
    resultColor = "black"
  } else {
    // 67% chance to lose (anything else)
    // To make it look real, we pick a color that the user DID NOT bet on
    const colors = ["red", "black", "green"]
    const otherColors = colors.filter(c => c !== color)
    resultColor = otherColors[Math.floor(Math.random() * otherColors.length)]
  }

  const win = resultColor === color
  let winAmount = 0
  if (win) {
    if (color === "green") winAmount = amt * 10
    else winAmount = amt * 2
  }

  u.balance -= amt
  if (win) u.balance += winAmount

  const createdAt = nowIso()
  data.transactions.push({ 
    id: db.id(), 
    userId: u.id, 
    type: "roulette", 
    amount: win ? (winAmount - amt) : -amt, 
    balanceAfter: u.balance, 
    note: `Рулетка: ${color} (${win ? 'Победа' : 'Проигрыш'})`, 
    createdAt 
  })
  
  // Добавляем в общие ставки для истории
  data.bets.push({
    id: db.id(),
    userId: u.id,
    matchName: "Рулетка",
    optionName: color,
    amount: amt,
    odds: color === "green" ? 10 : 2,
    status: win ? "won" : "lost",
    createdAt
  })

  db.save(data)
  
  res.json({ 
    ok: true, 
    win, 
    winAmount, 
    resultColor, 
    newBalance: u.balance 
  })
})

r.post("/coinflip", authRequired, (req, res) => {
  const { side, amount } = req.body || {}
  const amt = Math.floor(Number(amount))
  if (amt < 1) return res.status(400).json({ error: "Минимальная ставка 1 монета" })
  if (!["heads", "tails"].includes(side)) return res.status(400).json({ error: "Неверная сторона" })

  const data = db.get()
  const u = data.users.find(x => x.id === req.user.id)
  if (!u || u.balance < amt) return res.status(400).json({ error: "Недостаточно монет" })

  // Тихая логика: 33% шанс на победу
  const rng = Math.random() * 100
  let resultSide = "lose"
  
  if (rng < 33) {
    resultSide = side // User wins
  } else {
    // User loses, result is the other side
    resultSide = side === "heads" ? "tails" : "heads"
  }

  const win = resultSide === side
  const winAmount = win ? amt * 2 : 0

  u.balance -= amt
  if (win) u.balance += winAmount

  const createdAt = nowIso()
  data.transactions.push({ 
    id: db.id(), 
    userId: u.id, 
    type: "coinflip", 
    amount: win ? amt : -amt, 
    balanceAfter: u.balance, 
    note: `Coinflip: ${side} (${win ? 'Победа' : 'Проигрыш'})`, 
    createdAt 
  })

  db.save(data)

  res.json({ 
    ok: true, 
    win, 
    winAmount, 
    resultSide, 
    newBalance: u.balance 
  })
})

export default r
