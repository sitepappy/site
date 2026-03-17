"use client"
import { getAchievementMeta } from "../../lib/achievements"

export default function AchievementsPanel({ achievements }: { achievements: any[] }) {
  const list = Array.isArray(achievements) ? achievements : []
  const enriched = list
    .map(a => ({ ...a, meta: getAchievementMeta(a.id) }))
    .filter(a => a.meta)

  return (
    <div className="glass p-6 rounded-2xl border border-white/5">
      <div className="flex items-end justify-between gap-4">
        <div>
          <div className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em]">Достижения</div>
          <div className="text-xl font-black text-white uppercase tracking-tighter">Витрина</div>
        </div>
        <div className="text-[10px] px-2 py-1 rounded-full bg-white/5 border border-white/10 text-white/40 font-black uppercase tracking-widest">
          {enriched.length}
        </div>
      </div>

      {enriched.length === 0 ? (
        <div className="text-center py-10 text-white/20 font-black uppercase tracking-widest">
          Пока пусто
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-3 mt-6">
          {enriched.map((a: any) => (
            <div key={a.id} className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/30 p-4">
              <div className="absolute -top-10 -right-10 w-28 h-28 rounded-full blur-2xl opacity-30" style={{ background: a.meta.color }}></div>
              <div className="flex items-start gap-3 relative">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center border border-white/10 bg-white/5 text-2xl">
                  {a.meta.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="text-sm font-black uppercase tracking-tight text-white">{a.meta.title}</div>
                    <span className="text-[9px] px-2 py-0.5 rounded-full border font-black uppercase tracking-widest" style={{ borderColor: a.meta.color, color: a.meta.color }}>
                      Получено
                    </span>
                  </div>
                  <div className="text-[11px] text-white/50 mt-1">{a.meta.description}</div>
                  {a.createdAt && (
                    <div className="text-[9px] text-white/25 font-mono mt-2">
                      {new Date(a.createdAt).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

