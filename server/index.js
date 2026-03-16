import express from "express"
import cors from "cors"
import helmet from "helmet"
import dotenv from "dotenv"
import rateLimit from "express-rate-limit"
import authRoutes from "./routes/auth.js"
import userRoutes from "./routes/users.js"
import questRoutes from "./routes/quests.js"
import promoRoutes from "./routes/promos.js"
import levelRoutes from "./routes/levels.js"
import matchRoutes from "./routes/matches.js"
import betRoutes from "./routes/bets.js"
import rewardRoutes from "./routes/rewards.js"
import orderRoutes from "./routes/orders.js"
import postRoutes from "./routes/posts.js"
import pollRoutes from "./routes/polls.js"
import leaderboardRoutes from "./routes/leaderboard.js"
import adminRoutes from "./routes/admin.js"
import publicRoutes from "./routes/public.js"
import { ensureDataDir } from "./lib/db.js"

dotenv.config()
console.log("=== PAPPY API STARTING ===")

const app = express()

// 1. СТАТИЧЕСКИЙ ОТВЕТ ДЛЯ RAILWAY (Health Check) - ДО ВСЕХ МИДЛВАРЕЙ
app.get("/", (req, res) => {
  res.status(200).send("PAPPY API IS ALIVE");
})

// 2. Настройки безопасности и CORS
app.use(cors())
app.options("*", cors())
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}))
app.use(express.json({ limit: "1mb" }))
app.set("trust proxy", 1)

// 3. Лимитер (после проверки здоровья)
const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 1000 // Сильно увеличил, чтобы не было ложных блокировок
})
app.use(limiter)

// 4. Инициализация БД
try {
  ensureDataDir()
  console.log("DB check: OK");
} catch (e) {
  console.error("DB check: FAILED", e);
}

// 5. Остальные роуты
app.use("/auth", authRoutes)
app.use("/users", userRoutes)
app.use("/quests", questRoutes)
app.use("/promos", promoRoutes)
app.use("/levels", levelRoutes)
app.use("/matches", matchRoutes)
app.use("/bets", betRoutes)
app.use("/rewards", rewardRoutes)
app.use("/orders", orderRoutes)
app.use("/posts", postRoutes)
app.use("/polls", pollRoutes)
app.use("/leaderboard", leaderboardRoutes)
app.use("/admin", adminRoutes)
app.use("/public", publicRoutes)

const PORT = process.env.PORT || 4000
app.listen(PORT, '0.0.0.0', () => {
  console.log(`=== SERVER READY ON PORT: ${PORT} ===`);
})
