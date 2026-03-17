import { nowIso } from "./utils.js"
import { db } from "./db.js"

export function pushNotification(data, { userId, type, title, body, meta }) {
  if (!data.notifications) data.notifications = []
  const createdAt = nowIso()
  const n = {
    id: db.id(),
    userId,
    type: String(type || "info"),
    title: String(title || ""),
    body: String(body || ""),
    meta: meta || null,
    read: false,
    createdAt
  }
  data.notifications.push(n)
  if (data.notifications.length > 2000) data.notifications.splice(0, data.notifications.length - 2000)
  return n
}
