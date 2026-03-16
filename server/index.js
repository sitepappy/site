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
import { ensureDataDir } from "./lib/db.js"

dotenv.config()

const app = express()

// 1. CORS ДОЛЖЕН БЫТЬ ПЕРВЫМ
app.use(cors()); 
app.options("*", cors());

app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(express.json({ limit: "1mb" }))

app.set("trust proxy", 1)

const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 120
})

app.use(limiter)

try {
  ensureDataDir()
} catch (e) {
  console.error("CRITICAL: Failed to init data dir:", e)
}

app.get("/", (req, res) => {
  res.json({ ok: true, name: "PAPPY API", status: "online" })
})

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

const PORT = process.env.PORT || 4000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`SERVER_STARTED_ON_PORT: ${PORT}`);
});
