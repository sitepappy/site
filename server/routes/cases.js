import { Router } from "express"
import { db } from "../lib/db.js"
import { authRequired } from "../lib/auth.js"

const r = Router()

// Конфигурация кейсов и скинов
const CASES = [
  {
    id: "roshen",
    name: "ROSHEN",
    price: 5,
    description: "Дешёвые скины",
    image: "https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdNaW6tc4w70rrW59dXOf-zN3869269ux9v-02NAvOD8S689IDp_S_f6zO7V5_df3_df-f15_f14_f1b-d19_d10_d1a_d14_d1b_d10_d1a_d14_d1b/360fx360f",
    chances: { low: 75, medium: 20, high: 4, premium: 1 },
    rewards: {
      low: [
        { name: "P250 | Sand Dune", image: "https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdNaW6tc4w70rrW59dXOf-zN3869269ux9v-03NAfOB_p-p-S_f14-d19_d10_d1a_d14_d1b_d10_d1a_d14_d1b/360fx360f", minPrice: 1, maxPrice: 3 },
        { name: "Nova | Sand Dune", image: "https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdNaW6tc4w70rrW59dXOf-zN3869269ux9v-03NAfOB_p-p-S_f14-d19_d10_d1a_d14_d1b_d10_d1a_d14_d1b/360fx360f", minPrice: 1, maxPrice: 3 }
      ],
      medium: [
        { name: "AK-47 | Safari Mesh", image: "https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdNaW6tc4w70rrW59dXOf-zN3869269ux9v-03NAfOB_p-p-S_f14-d19_d10_d1a_d14_d1b_d10_d1a_d14_d1b/360fx360f", minPrice: 3, maxPrice: 6 }
      ],
      high: [
        { name: "AWP | Pit Viper", image: "https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdNaW6tc4w70rrW59dXOf-zN3869269ux9v-03NAfOB_p-p-S_f14-d19_d10_d1a_d14_d1b_d10_d1a_d14_d1b/360fx360f", minPrice: 6, maxPrice: 10 }
      ],
      premium: [
        { name: "Glock-18 | High Beam", image: "https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdNaW6tc4w70rrW59dXOf-zN3869269ux9v-03NAfOB_p-p-S_f14-d19_d10_d1a_d14_d1b_d10_d1a_d14_d1b/360fx360f", minPrice: 10, maxPrice: 20 }
      ]
    }
  },
  {
    id: "cs2",
    name: "CS2",
    price: 10,
    description: "Средние скины",
    image: "https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdNaW6tc4w70rrW59dXOf-zN3869269ux9v-02NAvOD8S689IDp_S_f6zO7V5_df3_df-f15_f14_f1b-d19_d10_d1a_d14_d1b_d10_d1a_d14_d1b/360fx360f",
    chances: { low: 60, medium: 28, high: 10, premium: 2 },
    rewards: {
      low: [
        { name: "M4A4 | Poly Mag", image: "https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdNaW6tc4w70rrW59dXOf-zN3869269ux9v-03NAfOB_p-p-S_f14-d19_d10_d1a_d14_d1b_d10_d1a_d14_d1b/360fx360f", minPrice: 2, maxPrice: 6 }
      ],
      medium: [
        { name: "USP-S | Ticket to Hell", image: "https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdNaW6tc4w70rrW59dXOf-zN3869269ux9v-03NAfOB_p-p-S_f14-d19_d10_d1a_d14_d1b_d10_d1a_d14_d1b/360fx360f", minPrice: 6, maxPrice: 12 }
      ],
      high: [
        { name: "Glock-18 | Water Elemental", image: "https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdNaW6tc4w70rrW59dXOf-zN3869269ux9v-03NAfOB_p-p-S_f14-d19_d10_d1a_d14_d1b_d10_d1a_d14_d1b/360fx360f", minPrice: 12, maxPrice: 25 }
      ],
      premium: [
        { name: "AK-47 | Redline", image: "https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdNaW6tc4w70rrW59dXOf-zN3869269ux9v-03NAfOB_p-p-S_f14-d19_d10_d1a_d14_d1b_d10_d1a_d14_d1b/360fx360f", minPrice: 25, maxPrice: 60 }
      ]
    }
  },
  {
    id: "pappy",
    name: "PAPPY",
    price: 66,
    description: "Дорогие скины",
    image: "https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdNaW6tc4w70rrW59dXOf-zN3869269ux9v-02NAvOD8S689IDp_S_f6zO7V5_df3_df-f15_f14_f1b-d19_d10_d1a_d14_d1b_d10_d1a_d14_d1b/360fx360f",
    chances: { low: 45, medium: 35, high: 15, premium: 5 },
    rewards: {
      low: [
        { name: "M4A1-S | Decimator", image: "https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdNaW6tc4w70rrW59dXOf-zN3869269ux9v-03NAfOB_p-p-S_f14-d19_d10_d1a_d14_d1b_d10_d1a_d14_d1b/360fx360f", minPrice: 10, maxPrice: 30 }
      ],
      medium: [
        { name: "AWP | Asiimov", image: "https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdNaW6tc4w70rrW59dXOf-zN3869269ux9v-03NAfOB_p-p-S_f14-d19_d10_d1a_d14_d1b_d10_d1a_d14_d1b/360fx360f", minPrice: 30, maxPrice: 70 }
      ],
      high: [
        { name: "AK-47 | Vulcan", image: "https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdNaW6tc4w70rrW59dXOf-zN3869269ux9v-03NAfOB_p-p-S_f14-d19_d10_d1a_d14_d1b_d10_d1a_d14_d1b/360fx360f", minPrice: 70, maxPrice: 140 }
      ],
      premium: [
        { name: "Butterfly Knife | Doppler", image: "https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdNaW6tc4w70rrW59dXOf-zN3869269ux9v-03NAfOB_p-p-S_f14-d19_d10_d1a_d14_d1b_d10_d1a_d14_d1b/360fx360f", minPrice: 140, maxPrice: 400 }
      ]
    }
  }
]

// Список всех скинов для ленты и предпросмотра
const ALL_SKINS = CASES.flatMap(c => 
  Object.entries(c.rewards).flatMap(([rarity, skins]) => 
    skins.map(s => ({ ...s, rarity, caseId: c.id }))
  )
)

r.get("/", (req, res) => {
  res.json(CASES.map(c => ({
    id: c.id,
    name: c.name,
    price: c.price,
    description: c.description,
    image: c.image,
    skins: Object.entries(c.rewards).flatMap(([rarity, skins]) => 
      skins.map(s => ({ ...s, rarity }))
    )
  })))
})

r.get("/drops", (req, res) => {
  const data = db.get()
  res.json((data.caseDrops || []).slice(-20).reverse())
})

r.post("/open/:id", authRequired, (req, res) => {
  const caseId = req.params.id
  const c = CASES.find(x => x.id === caseId)
  if (!c) return res.status(404).json({ error: "Кейс не найден" })

  const data = db.get()
  const u = data.users.find(x => x.id === req.user.id)
  if (!u) return res.status(404).json({ error: "Пользователь не найден" })

  if (u.balance < c.price) {
    return res.status(400).json({ error: "Недостаточно монет" })
  }

  // 1. Списываем баланс
  u.balance -= c.price
  
  // 2. Определяем редкость (псевдорандом)
  // Скрытая логика: после серии неудач шанс на редкий дроп чуть выше (упрощенно)
  const rand = Math.random() * 100
  let rarity = "low"
  if (rand < c.chances.premium) rarity = "premium"
  else if (rand < c.chances.premium + c.chances.high) rarity = "high"
  else if (rand < c.chances.premium + c.chances.high + c.chances.medium) rarity = "medium"

  // 3. Выбираем скин из этой редкости
  const pool = c.rewards[rarity]
  const skinTemplate = pool[Math.floor(Math.random() * pool.length)]
  
  // 4. Генерируем цену продажи
  const sellPrice = Math.floor(skinTemplate.minPrice + Math.random() * (skinTemplate.maxPrice - skinTemplate.minPrice + 1))
  
  const drop = {
    id: Math.random().toString(36).substring(2),
    userId: u.id,
    username: u.username,
    caseId: c.id,
    caseName: c.name,
    skinName: skinTemplate.name,
    skinImage: skinTemplate.image,
    rarity,
    sellPrice,
    createdAt: new Date().toISOString()
  }

  // 5. Добавляем в инвентарь пользователя
  if (!u.inventory) u.inventory = []
  u.inventory.push({
    ...drop,
    isSold: false,
    inShowcase: false
  })

  // 6. Добавляем в общую ленту дропов
  if (!data.caseDrops) data.caseDrops = []
  data.caseDrops.push(drop)
  if (data.caseDrops.length > 100) data.caseDrops.shift()

  // 7. Логируем
  if (!data.logs) data.logs = []
  data.logs.push({
    userId: u.id,
    username: u.username,
    type: "case_open",
    message: `Открыл кейс ${c.name} и получил ${skinTemplate.name}`,
    amount: -c.price,
    createdAt: new Date().toISOString()
  })

  db.save(data)
  res.json({ drop, balance: u.balance })
})

r.post("/sell/:dropId", authRequired, (req, res) => {
  const data = db.get()
  const u = data.users.find(x => x.id === req.user.id)
  if (!u) return res.status(404).json({ error: "Пользователь не найден" })

  const itemIdx = (u.inventory || []).findIndex(x => x.id === req.params.dropId && !x.isSold)
  if (itemIdx === -1) return res.status(404).json({ error: "Предмет не найден или уже продан" })

  const item = u.inventory[itemIdx]
  u.balance += item.sellPrice
  item.isSold = true
  
  // Удаляем из инвентаря после продажи (или оставляем с флагом isSold, если нужна история)
  u.inventory.splice(itemIdx, 1)

  if (!data.logs) data.logs = []
  data.logs.push({
    userId: u.id,
    username: u.username,
    type: "case_sell",
    message: `Продал скин ${item.skinName} за ${item.sellPrice} монет`,
    amount: item.sellPrice,
    createdAt: new Date().toISOString()
  })

  db.save(data)
  res.json({ balance: u.balance, ok: true })
})

export default r
