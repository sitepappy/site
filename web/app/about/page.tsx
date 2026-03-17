"use client"
import { useEffect, useState } from "react"
import { api } from "../../lib/api"

export default function AboutPage() {
  const [data, setData] = useState<any>(null)

  useEffect(() => {
    api("/public/about").then(setData).catch(() => {})
  }, [])

  const socialIcons = {
    telegram: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.161c-.18.717-.962 4.084-1.362 5.441-.168.575-.337.768-.541.787-.448.041-.788-.297-1.223-.586-.68-.453-1.064-.735-1.723-1.17-.763-.504-.268-.781.167-1.233.114-.118 2.086-1.913 2.124-2.076.005-.02.009-.096-.05-.12-.059-.024-.146-.016-.209.002-.089.025-1.513.967-4.27 1.933-.404.139-.769.208-1.096.201-.359-.008-1.05-.203-1.563-.37-.63-.204-1.13-.312-1.086-.659.023-.181.271-.366.743-.555 2.901-1.264 4.835-2.1 5.803-2.507 2.746-1.158 3.316-1.359 3.688-1.365.082-.001.265.02.384.117.1.081.128.19.135.267.007.077.012.252-.001.323z"/>
      </svg>
    ),
    discord: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037 19.736 19.736 0 0 0-4.885 1.515.069.07 0 0 0-.032.027C.533 9.048-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.419-2.157 2.419zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.419-2.157 2.419z"/>
      </svg>
    ),
    twitter: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.84 4.996 4.904 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
      </svg>
    ),
    steam: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm-.13 18.18c-1.31 0-2.37-1.06-2.37-2.37 0-.13.01-.26.03-.38l-2.41-1.01c-.3.31-.72.5-1.18.5-1.01 0-1.83-.82-1.83-1.83s.82-1.83 1.83-1.83c.46 0 .88.19 1.18.5l2.41-1.01c-.02-.12-.03-.25-.03-.38 0-1.31 1.06-2.37 2.37-2.37s2.37 1.06 2.37 2.37-1.06 2.37-2.37 2.37c-.13 0-.26-.01-.38-.03l-1.01 2.41c.31.3.5.72.5 1.18 0 1.01-.82 1.83-1.83 1.83s-1.83-.82-1.83-1.83c0-.46.19-.88.5-1.18l-1.01-2.41c-.12.02-.25.03-.38.03-1.31 0-2.37-1.06-2.37-2.37s1.06-2.37 2.37-2.37 2.37 1.06 2.37 2.37c0 .13-.01.26-.03.38l2.41 1.01c.3-.31.72-.5 1.18-.5 1.01 0 1.83.82 1.83 1.83s-.82 1.83-1.83 1.83c-.46 0-.88-.19-1.18-.5l-2.41 1.01c.02.12.03.25.03.38 0 1.31-1.06-2.37-2.37 2.37s-2.37-1.06-2.37-2.37 1.06-2.37 2.37-2.37 2.37 1.06 2.37 2.37z"/>
      </svg>
    ),
    youtube: (
      <svg className="w-6 h-6" fill="#FF0000" viewBox="0 0 24 24">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.016 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.016 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
      </svg>
    ),
    tiktok: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 16 16">
        <path d="M9 0h1.98c.144.715.54 1.617 1.235 2.512C12.895 3.389 13.797 4 15 4v2c-1.753 0-3.07-.814-4-1.829V11a5 5 0 1 1-5-5v2a3 3 0 1 0 3 3z"/>
      </svg>
    ),
    twitch: (
      <svg className="w-6 h-6" fill="#9146FF" viewBox="0 0 16 16">
        <path d="M3.857 0 1 2.857v10.286h3.429V16l2.857-2.857H9.57L14.714 8V0zm9.714 7.429-2.285 2.285H9l-2 2v-2H4.429V1.143h9.142z"/>
        <path d="M11.857 3.143h-1.143V6.57h1.143zm-3.143 0H7.571V6.57h1.143z"/>
      </svg>
    ),
    kick: (
      <svg className="w-6 h-6" fill="#53FC18" viewBox="0 0 24 24">
        <path d="M19.4 0H4.6C2.1 0 0 2.1 0 4.6v14.8C0 21.9 2.1 24 4.6 24h14.8c2.5 0 4.6-2.1 4.6-4.6V4.6C24 2.1 21.9 0 19.4 0zm-3.6 17.5h-2.3l-2.6-4.1-1.4 1.3v2.8H7.1V6.5h2.4v5.4l3.7-3.6h2.8l-4.1 3.9 4.1 5.3z"/>
      </svg>
    ),
    donation: (
      <svg className="w-6 h-6" fill="#FFD700" viewBox="0 0 16 16">
        <path d="M5.5 9.511c.076.473.446.827.925.827h2.15c.421 0 .773-.273.832-.644l.203-1.227L8.83 6.907c-.135-.135-.226-.311-.26-.503l-.033-.192c-.081-.466-.469-.812-.942-.812h-2.15c-.43 0-.789.277-.84.66l-.21 1.606.77.77a.677.677 0 0 1 .177.304l.158.771z"/>
        <path d="M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V4zm15 0a1 1 0 0 0-1-1H2a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4z"/>
        <path d="M8 10a2 2 0 1 0 0-4 2 2 0 0 0 0 4z"/>
      </svg>
    )
  }

  if (!data) return <div className="text-center py-20 text-neon animate-pulse uppercase font-black tracking-widest">Загрузка протоколов...</div>

  return (
    <div className="max-w-4xl mx-auto space-y-12 py-10 animate-in fade-in duration-700">
      <div className="relative">
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-neon/10 rounded-full blur-3xl -z-10"></div>
        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-acid/10 rounded-full blur-3xl -z-10"></div>
        
        <div className="glass p-8 md:p-12 rounded-3xl border border-white/5 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none">
            <span className="text-[200px] font-black italic tracking-tighter">PAPPY</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-black italic tracking-tighter mb-8 bg-gradient-to-r from-neon to-acid bg-clip-text text-transparent uppercase">
            О нас
          </h1>
          
          <div 
            className="prose prose-invert max-w-none text-white/80 leading-relaxed text-lg mb-12"
            dangerouslySetInnerHTML={{ __html: data.contentHtml }}
          />

          <div className="space-y-6">
            <h3 className="text-xs font-black uppercase tracking-widest text-white/40 border-b border-white/10 pb-2 inline-block">Наши каналы связи</h3>
            <div className="flex flex-wrap gap-4">
              {Object.entries(data.links || {}).map(([key, url]) => {
                if (!url) return null;
                return (
                  <a 
                    key={key} 
                    href={url as string} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-white/5 border border-white/10 hover:border-neon hover:bg-neon/10 hover:scale-105 transition-all duration-300 group"
                  >
                    <span className="text-white/60 group-hover:text-neon transition-colors">
                      {(socialIcons as any)[key] || key}
                    </span>
                    <span className="text-sm font-black uppercase tracking-tighter text-white/80 group-hover:text-white">
                      {key}
                    </span>
                  </a>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {[
          { title: "Честность", desc: "Все результаты матчей проверяются администрацией в реальном времени.", icon: "⚖️" },
          { title: "Скорость", desc: "Выплаты наград и обработка заказов занимают минимум времени.", icon: "⚡" },
          { title: "Сообщество", desc: "Мы строим крупнейшее СНГ сообщество любителей киберспорта.", icon: "🌐" }
        ].map((item, i) => (
          <div key={i} className="glass p-6 rounded-2xl border border-white/5 hover:border-white/20 transition-all group">
            <div className="text-3xl mb-4 group-hover:scale-110 transition-transform inline-block">{item.icon}</div>
            <h4 className="text-lg font-black uppercase text-neon mb-2">{item.title}</h4>
            <p className="text-sm text-white/50">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
