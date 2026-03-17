import fs from "fs"
import path from "path"
import { v4 as uuid } from "uuid"

// Используем /app/data если мы в Railway, иначе текущую папку
const dataDir = process.env.NODE_ENV === "production" ? "/app/data" : "./data"
const dbFile = path.join(dataDir, "db.json")

export function ensureDataDir() {
  try {
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
      console.log("Directory created:", dataDir);
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
        levels: [
          { id: "lvl1", name: "Новичок", iconUrl: "https://cdn-icons-png.flaticon.com/512/2583/2583344.png" },
          { id: "lvl2", name: "Игрок", iconUrl: "https://cdn-icons-png.flaticon.com/512/2583/2583319.png" },
          { id: "lvl3", name: "Ветеран", iconUrl: "https://cdn-icons-png.flaticon.com/512/2583/2583434.png" },
          { id: "lvl4", name: "Мастер", iconUrl: "https://cdn-icons-png.flaticon.com/512/2583/2583350.png" },
          { id: "lvl5", name: "Легенда", iconUrl: "https://cdn-icons-png.flaticon.com/512/2583/2583386.png" }
        ],
        matches: [],
        bets: [],
        rewards: [
          { id: "cheap", name: "Дешёвый скин", price: 2 },
          { id: "standard", name: "Стандартный скин", price: 5 },
          { id: "rare", name: "Редкий скин", price: 15 },
          { id: "premium", name: "Премиум скин", price: 100 }
        ],
        orders: [],
        reports: [],
        notifications: [],
        posts: [],
        polls: [],
        votes: [],
        about: {
          contentHtml: "<h1>О нас</h1><p>Киберпанк сообщество PAPPY</p>",
          links: { telegram: "", discord: "", twitter: "", steam: "", youtube: "", tiktok: "", kick: "", twitch: "", donation: "" }
        },
        schedule: {
          contentHtml: "<h1>Расписание стримов</h1><p>Следите за нашими трансляциями!</p>",
          streams: []
        },
        emailVerifications: []
      };
      fs.writeFileSync(dbFile, JSON.stringify(initial, null, 2), "utf-8");
      console.log("db.json created");
    }
  } catch (error) {
    console.error("DB Init Error:", error);
  }
}

function read() {
  try {
    if (!fs.existsSync(dbFile)) return { users: [], transactions: [], promoCodes: [], quests: [], userQuests: [], levels: [], matches: [], bets: [], rewards: [], orders: [], reports: [], notifications: [], posts: [], polls: [], votes: [], about: {}, schedule: {}, coop: {}, emailVerifications: [] };
    const raw = fs.readFileSync(dbFile, "utf-8");
    const data = JSON.parse(raw);
    let changed = false;
    
    // Миграция: если уровней нет или они пустые, добавляем дефолтные
    if (!data.levels || data.levels.length === 0) {
      data.levels = [
        { id: "lvl1", name: "Новичок", iconUrl: "https://cdn-icons-png.flaticon.com/512/2583/2583344.png" },
        { id: "lvl2", name: "Игрок", iconUrl: "https://cdn-icons-png.flaticon.com/512/2583/2583319.png" },
        { id: "lvl3", name: "Ветеран", iconUrl: "https://cdn-icons-png.flaticon.com/512/2583/2583434.png" },
        { id: "lvl4", name: "Мастер", iconUrl: "https://cdn-icons-png.flaticon.com/512/2583/2583350.png" },
        { id: "lvl5", name: "Легенда", iconUrl: "https://cdn-icons-png.flaticon.com/512/2583/2583386.png" }
      ];
      changed = true;
    }

    if (!Array.isArray(data.orders)) {
      data.orders = [];
      changed = true;
    }

    for (const o of data.orders) {
      if (!o.status) {
        o.status = "Pending";
        changed = true;
      }
      const s = String(o.status)
      const sLow = s.toLowerCase()
      const normalized =
        sLow === "pending" ? "Pending" :
        sLow === "inprogress" ? "InProgress" :
        sLow === "issued" ? "Issued" :
        sLow === "rejected" ? "Rejected" :
        sLow === "completed" ? "Completed" :
        s
      if (normalized !== o.status) {
        o.status = normalized
        changed = true
      }
      if (!Array.isArray(o.messages)) {
        o.messages = []
        changed = true
      }
      if (!o.updatedAt) {
        o.updatedAt = o.createdAt || new Date().toISOString()
        changed = true
      }
    }

    if (!Array.isArray(data.reports)) {
      data.reports = [];
      changed = true;
    }

    for (const rep of data.reports) {
      if (!rep.status) {
        rep.status = "pending";
        changed = true;
      }
      if (!Array.isArray(rep.adminResponses)) {
        rep.adminResponses = [];
        changed = true;
      }
      if (!rep.updatedAt) {
        rep.updatedAt = rep.createdAt || new Date().toISOString();
        changed = true;
      }
      if (typeof rep.referralManualAppliedAt === "undefined") {
        rep.referralManualAppliedAt = null;
        changed = true;
      }
    }

    if (!Array.isArray(data.users)) {
      data.users = [];
      changed = true;
    }

    if (!Array.isArray(data.promoCodes)) {
      data.promoCodes = [];
      changed = true;
    }

    for (const p of data.promoCodes) {
      if (!p.type) {
        p.type = "referral";
        changed = true;
      }
      if (typeof p.totalActivations !== "number") {
        p.totalActivations = 0;
        changed = true;
      }
      if (!Array.isArray(p.lastActivations)) {
        p.lastActivations = [];
        changed = true;
      }
      if (!p.dailyActivations || typeof p.dailyActivations !== "object") {
        p.dailyActivations = {};
        changed = true;
      }
      if (typeof p.disabled === "undefined") {
        p.disabled = false;
        changed = true;
      }
    }

    if (!Array.isArray(data.notifications)) {
      data.notifications = [];
      changed = true;
    }

    for (const n of data.notifications) {
      if (typeof n.read === "undefined") {
        n.read = false;
        changed = true;
      }
      if (!n.createdAt) {
        n.createdAt = new Date().toISOString();
        changed = true;
      }
      if (typeof n.meta === "undefined") {
        n.meta = null;
        changed = true;
      }
      if (typeof n.type === "undefined") {
        n.type = "info";
        changed = true;
      }
      if (typeof n.title === "undefined") {
        n.title = "";
        changed = true;
      }
      if (typeof n.body === "undefined") {
        n.body = "";
        changed = true;
      }
    }

    for (const u of data.users) {
      if (!u.dailyRewards || typeof u.dailyRewards !== "object") {
        u.dailyRewards = { day: 1, lastClaimAt: null, lockedUntil: null, cycleCount: 0 };
        changed = true;
      }

      if (typeof u.dailyRewards.day !== "number" || u.dailyRewards.day < 1 || u.dailyRewards.day > 30) {
        u.dailyRewards.day = 1;
        changed = true;
      }
      if (typeof u.dailyRewards.cycleCount !== "number" || u.dailyRewards.cycleCount < 0) {
        u.dailyRewards.cycleCount = 0;
        changed = true;
      }
      if (typeof u.dailyRewards.lastClaimAt === "undefined") {
        u.dailyRewards.lastClaimAt = null;
        changed = true;
      }
      if (typeof u.dailyRewards.lockedUntil === "undefined") {
        u.dailyRewards.lockedUntil = null;
        changed = true;
      }

      if (!Array.isArray(u.achievements)) {
        u.achievements = [];
        changed = true;
      }
      if (!u.achievementProgress || typeof u.achievementProgress !== "object") {
        u.achievementProgress = { dailyStreak: 0, noLossStreak: 0, lastDailyClaimAt: null };
        changed = true;
      }
      if (typeof u.achievementProgress.dailyStreak !== "number") {
        u.achievementProgress.dailyStreak = 0;
        changed = true;
      }
      if (typeof u.achievementProgress.noLossStreak !== "number") {
        u.achievementProgress.noLossStreak = 0;
        changed = true;
      }
      if (typeof u.achievementProgress.lastDailyClaimAt === "undefined") {
        u.achievementProgress.lastDailyClaimAt = null;
        changed = true;
      }

      if (typeof u.usedReferralCode === "undefined") {
        u.usedReferralCode = null;
        changed = true;
      }
      if (typeof u.usedReferralOwnerId === "undefined") {
        u.usedReferralOwnerId = null;
        changed = true;
      }
      if (!u.usedReferralCode && Array.isArray(u.activatedPromoCodes)) {
        const first = u.activatedPromoCodes.find((c) => {
          const p = data.promoCodes.find((pp) => pp.code && pp.code.toLowerCase() === String(c).toLowerCase())
          return p && (p.type || "referral") === "referral" && p.ownerUserId !== u.id
        })
        if (first) {
          const p = data.promoCodes.find((pp) => pp.code && pp.code.toLowerCase() === String(first).toLowerCase())
          u.usedReferralCode = p?.code || first
          u.usedReferralOwnerId = p?.ownerUserId || null
          changed = true
        }
      }
    }

    if (changed) {
      fs.writeFileSync(dbFile, JSON.stringify(data, null, 2), "utf-8");
    }
    
    return data;
  } catch (e) {
    console.error("Read DB Error:", e);
    return {};
  }
}

function write(data) {
  try {
    fs.writeFileSync(dbFile, JSON.stringify(data, null, 2), "utf-8");
  } catch (e) {
    console.error("Write DB Error:", e);
  }
}

export const db = {
  get() { return read(); },
  save(data) { write(data); },
  id() { return uuid(); }
};
