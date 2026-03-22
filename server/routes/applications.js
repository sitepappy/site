import { Router } from "express"
import { db } from "../lib/db.js"
import { authRequired } from "../lib/auth.js"
import { nowIso } from "../lib/utils.js"

const r = Router()

// Получить активные формы для пользователя
r.get("/forms", authRequired, (req, res) => {
  const data = db.get()
  const forms = (data.applicationForms || []).filter(f => f.active)
  res.json(forms)
})

// Отправить заявку
r.post("/submit", authRequired, (req, res) => {
  const { formId, answers } = req.body || {}
  if (!formId || !answers) return res.status(400).json({ error: "Неполные данные" })
  
  const data = db.get()
  const form = (data.applicationForms || []).find(f => f.id === formId)
  if (!form) return res.status(404).json({ error: "Форма не найдена" })
  
  if (!data.applications) data.applications = []
  
  // Проверка: не подавал ли уже этот юзер на эту форму
  const existing = data.applications.find(a => a.userId === req.user.id && a.formId === formId && a.status === 'pending')
  if (existing) return res.status(400).json({ error: "Вы уже подали заявку, она на рассмотрении" })

  const application = {
    id: db.id(),
    userId: req.user.id,
    formId,
    answers, // { "Label": "Value" }
    status: 'pending',
    createdAt: nowIso(),
    updatedAt: nowIso()
  }
  
  data.applications.push(application)
  db.save(data)
  res.json({ ok: true })
})

export default r
