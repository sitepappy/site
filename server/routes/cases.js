import { Router } from "express"
import { db } from "../lib/db.js"
import { authRequired } from "../lib/auth.js"

const r = Router()

const getCases = () => {
  const data = db.get()
  if (!data.casesConfig) {
    data.casesConfig = [
      {
        id: "roshen",
        name: "ROSHEN",
        price: 5,
        description: "Дешёвые скины",
        image: "https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdNaW6tc4w70rrW59dXOf-zN3869269ux9v-02NAvOD8S689IDp_S_f6zO7V5_df3_df-f15_f14_f1b-d19_d10_d1a_d14_d1b_d10_d1a_d14_d1b/360fx360f",
        chances: { low: 80, medium: 15, high: 4.5, premium: 0.5 },
        rewards: {
          low: [
            { name: "P250 | Sand Dune", image: "https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdNaW6tc4w70rrW59dXOf-zN3869269ux9v-03NAfOB_p-p-S_f14-d19_d10_d1a_d14_d1b_d10_d1a_d14_d1b/360fx360f", minPrice: 1, maxPrice: 2 },
            { name: "Nova | Sand Dune", image: "https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdNaW6tc4w70rrW59dXOf-zN3869269ux9v-03NAfOB_p-p-S_f14-d19_d10_d1a_d14_d1b_d10_d1a_d14_d1b/360fx360f", minPrice: 1, maxPrice: 2 },
            { name: "SG 553 | Army Sheen", image: "https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdNaW6tc4w70rrW59dXOf-zN3869269ux9v-03NAfOB_p-p-S_f14-d19_d10_d1a_d14_d1b_d10_d1a_d14_d1b/360fx360f", minPrice: 1, maxPrice: 2 },
            { name: "G3SG1 | Polar Camo", image: "https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdNaW6tc4w70rrW59dXOf-zN3869269ux9v-03NAfOB_p-p-S_f14-d19_d10_d1a_d14_d1b_d10_d1a_d14_d1b/360fx360f", minPrice: 1, maxPrice: 2 },
            { name: "Dual Berettas | Colony", image: "https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdNaW6tc4w70rrW59dXOf-zN3869269ux9v-03NAfOB_p-p-S_f14-d19_d10_d1a_d14_d1b_d10_d1a_d14_d1b/360fx360f", minPrice: 1, maxPrice: 2 }
          ],
          medium: [
            { name: "AK-47 | Safari Mesh", image: "https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdNaW6tc4w70rrW59dXOf-zN3869269ux9v-03NAfOB_p-p-S_f14-d19_d10_d1a_d14_d1b_d10_d1a_d14_d1b/360fx360f", minPrice: 3, maxPrice: 5 },
            { name: "M4A4 | Urban DDPAT", image: "https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdNaW6tc4w70rrW59dXOf-zN3869269ux9v-03NAfOB_p-p-S_f14-d19_d10_d1a_d14_d1b_d10_d1a_d14_d1b/360fx360f", minPrice: 3, maxPrice: 5 },
            { name: "AWP | Safari Mesh", image: "https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdNaW6tc4w70rrW59dXOf-zN3869269ux9v-03NAfOB_p-p-S_f14-d19_d10_d1a_d14_d1b_d10_d1a_d14_d1b/360fx360f", minPrice: 4, maxPrice: 6 }
          ],
          high: [
            { name: "AWP | Pit Viper", image: "https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdNaW6tc4w70rrW59dXOf-zN3869269ux9v-03NAfOB_p-p-S_f14-d19_d10_d1a_d14_d1b_d10_d1a_d14_d1b/360fx360f", minPrice: 7, maxPrice: 10 },
            { name: "M4A1-S | Nitro", image: "https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdNaW6tc4w70rrW59dXOf-zN3869269ux9v-03NAfOB_p-p-S_f14-d19_d10_d1a_d14_d1b_d10_d1a_d14_d1b/360fx360f", minPrice: 8, maxPrice: 12 }
          ],
          premium: [
            { name: "Glock-18 | High Beam", image: "https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdNaW6tc4w70rrW59dXOf-zN3869269ux9v-03NAfOB_p-p-S_f14-d19_d10_d1a_d14_d1b_d10_d1a_d14_d1b/360fx360f", minPrice: 15, maxPrice: 25 }
          ]
        }
      },
      {
        id: "cs2",
        name: "CS2",
        price: 10,
        description: "Средние скины",
        image: "https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdNaW6tc4w70rrW59dXOf-zN3869269ux9v-02NAvOD8S689IDp_S_f6zO7V5_df3_df-f15_f14_f1b-d19_d10_d1a_d14_d1b_d10_d1a_d14_d1b/360fx360f",
        chances: { low: 65, medium: 25, high: 9.5, premium: 0.5 },
        rewards: {
          low: [
            { name: "M4A4 | Poly Mag", image: "https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdNaW6tc4w70rrW59dXOf-zN3869269ux9v-03NAfOB_p-p-S_f14-d19_d10_d1a_d14_d1b_d10_d1a_d14_d1b/360fx360f", minPrice: 2, maxPrice: 4 },
            { name: "Glock-18 | Oxide Blaze", image: "https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdNaW6tc4w70rrW59dXOf-zN3869269ux9v-03NAfOB_p-p-S_f14-d19_d10_d1a_d14_d1b_d10_d1a_d14_d1b/360fx360f", minPrice: 2, maxPrice: 4 },
            { name: "USP-S | Forest Leaves", image: "https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdNaW6tc4w70rrW59dXOf-zN3869269ux9v-03NAfOB_p-p-S_f14-d19_d10_d1a_d14_d1b_d10_d1a_d14_d1b/360fx360f", minPrice: 2, maxPrice: 4 },
            { name: "P90 | Sand Spray", image: "https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdNaW6tc4w70rrW59dXOf-zN3869269ux9v-03NAfOB_p-p-S_f14-d19_d10_d1a_d14_d1b_d10_d1a_d14_d1b/360fx360f", minPrice: 2, maxPrice: 4 },
            { name: "FAMAS | Colony", image: "https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdNaW6tc4w70rrW59dXOf-zN3869269ux9v-03NAfOB_p-p-S_f14-d19_d10_d1a_d14_d1b_d10_d1a_d14_d1b/360fx360f", minPrice: 2, maxPrice: 4 }
          ],
          medium: [
            { name: "USP-S | Ticket to Hell", image: "https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdNaW6tc4w70rrW59dXOf-zN3869269ux9v-03NAfOB_p-p-S_f14-d19_d10_d1a_d14_d1b_d10_d1a_d14_d1b/360fx360f", minPrice: 6, maxPrice: 10 },
            { name: "MP9 | Food Chain", image: "https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdNaW6tc4w70rrW59dXOf-zN3869269ux9v-03NAfOB_p-p-S_f14-d19_d10_d1a_d14_d1b_d10_d1a_d14_d1b/360fx360f", minPrice: 7, maxPrice: 11 },
            { name: "Desert Eagle | Night", image: "https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdNaW6tc4w70rrW59dXOf-zN3869269ux9v-03NAfOB_p-p-S_f14-d19_d10_d1a_d14_d1b_d10_d1a_d14_d1b/360fx360f", minPrice: 8, maxPrice: 12 }
          ],
          high: [
            { name: "Glock-18 | Water Elemental", image: "https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdNaW6tc4w70rrW59dXOf-zN3869269ux9v-03NAfOB_p-p-S_f14-d19_d10_d1a_d14_d1b_d10_d1a_d14_d1b/360fx360f", minPrice: 15, maxPrice: 22 },
            { name: "M4A1-S | Leaden Glass", image: "https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdNaW6tc4w70rrW59dXOf-zN3869269ux9v-03NAfOB_p-p-S_f14-d19_d10_d1a_d14_d1b_d10_d1a_d14_d1b/360fx360f", minPrice: 18, maxPrice: 25 }
          ],
          premium: [
            { name: "AK-47 | Redline", image: "https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdNaW6tc4w70rrW59dXOf-zN3869269ux9v-03NAfOB_p-p-S_f14-d19_d10_d1a_d14_d1b_d10_d1a_d14_d1b/360fx360f", minPrice: 40, maxPrice: 65 }
          ]
        }
      },
      {
        id: "pappy",
        name: "PAPPY",
        price: 66,
        description: "Дорогие скины",
        image: "https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdNaW6tc4w70rrW59dXOf-zN3869269ux9v-02NAvOD8S689IDp_S_f6zO7V5_df3_df-f15_f14_f1b-d19_d10_d1a_d14_d1b_d10_d1a_d14_d1b/360fx360f",
        chances: { low: 50, medium: 30, high: 18, premium: 2 },
        rewards: {
          low: [
            { name: "M4A1-S | Decimator", image: "https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdNaW6tc4w70rrW59dXOf-zN3869269ux9v-03NAfOB_p-p-S_f14-d19_d10_d1a_d14_d1b_d10_d1a_d14_d1b/360fx360f", minPrice: 15, maxPrice: 25 },
            { name: "USP-S | Neo-Noir", image: "https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdNaW6tc4w70rrW59dXOf-zN3869269ux9v-03NAfOB_p-p-S_f14-d19_d10_d1a_d14_d1b_d10_d1a_d14_d1b/360fx360f", minPrice: 18, maxPrice: 28 },
            { name: "Glock-18 | Neo-Noir", image: "https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdNaW6tc4w70rrW59dXOf-zN3869269ux9v-03NAfOB_p-p-S_f14-d19_d10_d1a_d14_d1b_d10_d1a_d14_d1b/360fx360f", minPrice: 15, maxPrice: 25 },
            { name: "AK-47 | Frontside Misty", image: "https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdNaW6tc4w70rrW59dXOf-zN3869269ux9v-03NAfOB_p-p-S_f14-d19_d10_d1a_d14_d1b_d10_d1a_d14_d1b/360fx360f", minPrice: 20, maxPrice: 35 },
            { name: "AWP | Redline", image: "https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdNaW6tc4w70rrW59dXOf-zN3869269ux9v-03NAfOB_p-p-S_f14-d19_d10_d1a_d14_d1b_d10_d1a_d14_d1b/360fx360f", minPrice: 25, maxPrice: 45 }
          ],
          medium: [
            { name: "AWP | Asiimov", image: "https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdNaW6tc4w70rrW59dXOf-zN3869269ux9v-03NAfOB_p-p-S_f14-d19_d10_d1a_d14_d1b_d10_d1a_d14_d1b/360fx360f", minPrice: 50, maxPrice: 85 },
            { name: "AK-47 | Empress", image: "https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdNaW6tc4w70rrW59dXOf-zN3869269ux9v-03NAfOB_p-p-S_f14-d19_d10_d1a_d14_d1b_d10_d1a_d14_d1b/360fx360f", minPrice: 45, maxPrice: 75 },
            { name: "M4A4 | The Emperor", image: "https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdNaW6tc4w70rrW59dXOf-zN3869269ux9v-03NAfOB_p-p-S_f14-d19_d10_d1a_d14_d1b_d10_d1a_d14_d1b/360fx360f", minPrice: 40, maxPrice: 70 }
          ],
          high: [
            { name: "AK-47 | Vulcan", image: "https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdNaW6tc4w70rrW59dXOf-zN3869269ux9v-03NAfOB_p-p-S_f14-d19_d10_d1a_d14_d1b_d10_d1a_d14_d1b/360fx360f", minPrice: 120, maxPrice: 250 },
            { name: "M4A1-S | Printstream", image: "https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdNaW6tc4w70rrW59dXOf-zN3869269ux9v-03NAfOB_p-p-S_f14-d19_d10_d1a_d14_d1b_d10_d1a_d14_d1b/360fx360f", minPrice: 100, maxPrice: 220 }
          ],
          premium: [
            { name: "Butterfly Knife | Doppler", image: "https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdNaW6tc4w70rrW59dXOf-zN3869269ux9v-03NAfOB_p-p-S_f14-d19_d10_d1a_d14_d1b_d10_d1a_d14_d1b/360fx360f", minPrice: 450, maxPrice: 950 }
          ]
        }
      }
    ]
    db.save(data)
  }
  return data.casesConfig
}

r.get("/", (req, res) => {
  const cases = getCases()
  res.json(cases.map(c => ({
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

r.get("/config", authRequired, (req, res) => {
  const data = db.get()
  const u = data.users.find(x => x.id === req.user.id)
  if (!u || u.role !== 'admin') return res.status(403).json({ error: "Нет доступа" })
  res.json(getCases())
})

r.post("/open/:id", authRequired, (req, res) => {
  const caseId = req.params.id
  const cases = getCases()
  const c = cases.find(x => x.id === caseId)
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

  db.save(data)
  res.json({ drop, balance: u.balance })
})

// Админские роуты для управления кейсами
r.put("/config", authRequired, (req, res) => {
  const data = db.get()
  const u = data.users.find(x => x.id === req.user.id)
  if (!u || u.role !== 'admin') return res.status(403).json({ error: "Нет доступа" })

  data.casesConfig = req.body
  db.save(data)
  res.json({ ok: true })
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
