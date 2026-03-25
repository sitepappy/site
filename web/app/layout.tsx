"use client"
import "./globals.css"
import "./coinflip.css"
import { useEffect, useState } from "react"
import Header from "./components/Header"
import PwaRegister from "./components/PwaRegister"
import { api } from "../lib/api"
import { usePathname } from "next/navigation"

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [isBanned, setIsBanned] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [userSettings, setUserSettings] = useState<any>(null)
  const pathname = usePathname()

  useEffect(() => {
    setMounted(true)
    const checkBan = async () => {
      const token = localStorage.getItem("token")
      if (!token) {
        setIsBanned(false)
        return
      }
      try {
        const user = await api("/users/me")
        setIsBanned(!!user.isBanned)
        setUserSettings(user.settings)
      } catch (e: any) {
        if (e.message === "FORBIDDEN" || (e.status === 403)) {
          setIsBanned(true)
        } else {
          setIsBanned(false)
        }
      }
    }
    checkBan()
    
    // Перепроверяем при смене пути, но не на странице логина/регистрации
    if (pathname !== "/login" && pathname !== "/register") {
      checkBan()
    }
  }, [pathname])

  const getDayTheme = () => {
    if (!userSettings?.cs2ThemesEnabled) return null;
    
    const day = new Date().getDay(); // 0 (Sun) to 6 (Sat)
    const themes = [
      { name: "Vertigo", bg: "bg-vertigo" }, // Sun
      { name: "Mirage", bg: "bg-mirage" },  // Mon
      { name: "Ancient", bg: "bg-ancient" }, // Tue
      { name: "Train", bg: "bg-train" },   // Wed
      { name: "Overpass", bg: "bg-overpass" }, // Thu
      { name: "Nuke", bg: "bg-nuke" },     // Fri
      { name: "Inferno", bg: "bg-inferno" }  // Sat
    ];
    return themes[day];
  }

  const activeTheme = getDayTheme();

  return (
    <html lang="ru">
      <head>
        <title>PAPPY</title>
        <meta name="description" content="Киберпанк сообщество PAPPY" />
        <link rel="manifest" href="/manifest.webmanifest" />
        <meta name="theme-color" content="#0a0a0f" />
      </head>
      <body className={`${activeTheme ? `theme-${activeTheme.name.toLowerCase()} ${activeTheme.bg}` : "bg-[#0a0a0f]"} text-white min-h-screen transition-all duration-700`}>
        {!mounted ? (
          <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
             <div className="w-12 h-12 border-4 border-[#7B2EFF] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="min-h-screen overflow-x-hidden relative">
            {activeTheme && (
              <>
                {/* Side Slices - Immersive HUD Effect */}
                <div className="fixed left-0 top-0 bottom-0 w-[20%] pointer-events-none z-[1] opacity-40 bg-gradient-to-r from-black/80 to-transparent">
                   <div className="absolute inset-0 map-slice-left"></div>
                </div>
                <div className="fixed right-0 top-0 bottom-0 w-[20%] pointer-events-none z-[1] opacity-40 bg-gradient-to-l from-black/80 to-transparent">
                   <div className="absolute inset-0 map-slice-right"></div>
                </div>

                <div className="map-slice-top"></div>
                <div className="fixed inset-0 pointer-events-none z-[2]">
                  <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/90"></div>
                  <div className="absolute inset-0 opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
                  
                  {/* Map Info HUD */}
                  <div className="absolute top-24 right-8 opacity-40 flex flex-col items-end pointer-events-none select-none font-mono group">
                    <div className="text-5xl font-black text-white italic tracking-tighter drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">{activeTheme.name}</div>
                    <div className="text-[10px] text-white/70 uppercase tracking-[0.5em] mt-2 flex items-center gap-2">
                       <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                       Active Environment
                    </div>
                    <div className="w-48 h-[2px] bg-gradient-to-r from-transparent via-white/50 to-transparent mt-4"></div>
                  </div>
                </div>
              </>
            )}
            <div className="relative z-10">
              {isBanned ? (
              <div className="fixed inset-0 z-[9999] flex items-center justify-center p-6 bg-black">
                <div className="max-w-md w-full glass p-10 rounded-[40px] border-2 border-red-500 shadow-[0_0_50px_rgba(239,68,68,0.3)] text-center space-y-8 animate-in zoom-in duration-500 relative overflow-hidden">
                  {/* Анимированный фон */}
                  <div className="absolute inset-0 bg-red-500/5 animate-pulse"></div>
                  <div className="absolute -top-24 -left-24 w-48 h-48 bg-red-500/20 blur-[80px] rounded-full"></div>
                  <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-red-500/20 blur-[80px] rounded-full"></div>

                  <div className="relative">
                    <div className="w-24 h-24 bg-red-500/10 border-2 border-red-500/30 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(239,68,68,0.2)]">
                      <span className="text-5xl">🚫</span>
                    </div>
                    
                    <h1 className="text-4xl font-black text-white uppercase tracking-tighter italic mb-2 drop-shadow-lg">
                      ДОСТУП <span className="text-red-500">ОГРАНИЧЕН</span>
                    </h1>
                    
                    <div className="h-px w-20 bg-red-500 mx-auto mb-6"></div>
                    
                    <div className="space-y-4">
                      <p className="text-xl font-bold text-red-400 uppercase tracking-widest">
                        Ваш аккаунт временно заблокирован
                      </p>
                      <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                        <p className="text-sm text-white/60 leading-relaxed">
                          Администрация проверяет ваш аккаунт.<br/>
                          Пожалуйста, дождитесь завершения проверки.
                        </p>
                      </div>
                    </div>
                  </div>

                  <button 
                    onClick={() => {
                      localStorage.removeItem("token");
                      window.location.href = "/login";
                    }}
                    className="w-full py-4 rounded-2xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-[0.2em] text-white/40 hover:text-white hover:bg-white/10 transition-all relative z-10"
                  >
                    Выйти из системы
                  </button>
                </div>
              </div>
            ) : (
              <>
                <Header />
                <PwaRegister />
                {!pathname.startsWith("/admin") && <div className="h-[56px]"></div>}
                <main className={`${pathname.startsWith("/admin") ? "w-full" : "max-w-7xl mx-auto px-4 py-6 pb-24 lg:pb-6"}`}>
                  {children}
                </main>
              </>
            )}
            </div>
          </div>
        )}
      </body>
    </html>
  )
}
