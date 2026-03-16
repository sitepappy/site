import bcrypt from "bcryptjs"
import { v4 as uuid } from "uuid"
const captchas = new Map()

export function hashPassword(p) {
  const salt = bcrypt.genSaltSync(10)
  return bcrypt.hashSync(p, salt)
}

export function verifyPassword(p, hash) {
  return bcrypt.compareSync(p, hash)
}

export function isAlnum(str) {
  return /^[A-Za-z0-9]+$/.test(str)
}

export function createCaptcha() {
  const a = Math.floor(Math.random() * 9) + 1
  const b = Math.floor(Math.random() * 9) + 1
  const id = uuid()
  captchas.set(id, { sum: a + b, exp: Date.now() + 5 * 60 * 1000 })
  return { id, question: `${a} + ${b}` }
}

export function verifyCaptcha(id, answer) {
  const c = captchas.get(id)
  if (!c) return false
  if (Date.now() > c.exp) {
    captchas.delete(id)
    return false
  }
  const ok = Number(answer) === c.sum
  if (ok) captchas.delete(id)
  return ok
}

export function nowIso() {
  return new Date().toISOString()
}

export function dayKey(d = new Date()) {
  return d.toISOString().slice(0, 10)
}

