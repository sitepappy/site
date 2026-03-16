import fs from "fs"
import path from "path"
import { v4 as uuid } from "uuid"

// Прямой путь к папке, которую мы примонтировали в Railway
const dataDir = "/app/data" 
const dbFile = path.join(dataDir, "db.json")

export function ensureDataDir() {
  try {
    // Проверяем, существует ли папка. Если нет - создаем.
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
      console.log("Папка data создана");
    }
    
    if (!fs.existsSync(dbFile)) {
      const initial = {
        users: [],
        transactions: [],
        promoCodes: [],
        quests: [
          { id: "q1", name: "Первый вход", reward: 1, active: true },
          { id: "q2", name: "Подписаться на ТГ", reward: 2, active: true },
          { id: "q3", name: "Сделать первую ставку", reward: 5, active: true }
        ],
        userQuests: [],
        levels: [],
        matches: [],
        bets: [],
        rewards: [
          { id: "cheap", name: "Дешёвый скин", price: 2 },
          { id: "standard", name: "Стандартный скин", price: 5 },
          { id: "rare", name: "Редкий скин", price: 15 },
          { id: "premium", name: "Премиум скин", price: 100 }
        ],
        orders: [],
        posts: [],
        polls: [],
        votes: [],
        about: {
          contentHtml: "<h1>О нас</h1><p>Киберпанк сообщество PAPPY</p>",
          links: { telegram: "", discord: "", twitter: "", steam: "", youtube: "" }
        },
        coop: {
          contentHtml: "<h1>Сотрудничество</h1><p>Свяжитесь с нами для сотрудничества.</p>",
          links: { telegram: "", email: "" }
        },
        emailVerifications: []
      };
      fs.writeFileSync(dbFile, JSON.stringify(initial, null, 2), "utf-8");
      console.log("Файл db.json создан");
    }
  } catch (error) {
    console.error("Ошибка при создании базы данных:", error);
  }
}

// Функции read и write оставляем без изменений, но убедись, что они используют dbFile
function read() {
  const raw = fs.readFileSync(dbFile, "utf-8");
  return JSON.parse(raw);
}

function write(data) {
  fs.writeFileSync(dbFile, JSON.stringify(data, null, 2), "utf-8");
}

export const db = {
  get() { return read(); },
  save(data) { write(data); },
  id() { return uuid(); }
};

