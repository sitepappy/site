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
    // По умолчанию темы ВКЛЮЧЕНЫ, если только пользователь явно не выключил их
    if (userSettings?.cs2ThemesEnabled === false) return null;
    
    const day = new Date().getDay(); // 0 (Sun) to 6 (Sat)
    const themes = [
      { name: "Vertigo", bg: "bg-vertigo", url: "https://wallpapercave.com/wp/wp12811464.jpg" }, // Sun
      { name: "Mirage", bg: "bg-mirage", url: "https://wallpapercave.com/wp/wp12811434.jpg" },  // Mon
      { name: "Ancient", bg: "bg-ancient", url: "https://wallpapercave.com/wp/wp12811454.jpg" }, // Tue
      { name: "Train", bg: "bg-train", url: "https://wallpapercave.com/wp/wp12811462.jpg" },   // Wed
      { name: "Overpass", bg: "bg-overpass", url: "https://wallpapercave.com/wp/wp12811458.jpg" }, // Thu
      { name: "Nuke", bg: "bg-nuke", url: "https://wallpapercave.com/wp/wp12811460.jpg" },     // Fri
      { name: "Inferno", bg: "bg-inferno", url: "https://wallpapercave.com/wp/wp12811456.jpg" }  // Sat
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
      <body 
        suppressHydrationWarning
        className={`${activeTheme ? `theme-${activeTheme.name.toLowerCase()} bg-transparent` : "bg-[#050505]"} text-white min-h-screen transition-all duration-700`}
      >
        {!mounted ? (
          <div className="min-h-screen bg-[#050505] flex items-center justify-center">
             <div className="w-12 h-12 border-4 border-[#7B2EFF] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="min-h-screen overflow-x-hidden relative bg-transparent">
            {activeTheme && (
              <>
                {/* Global Background Image - High Priority */}
                <div className="fixed inset-0 z-[-1] pointer-events-none bg-[#050505]">
                  <img 
                    src={activeTheme.url} 
                    alt="" 
                    className="w-full h-full object-cover opacity-80"
                    style={{ filter: 'brightness(0.6) contrast(1.1)' }}
                  />
                  <div className="absolute inset-0 bg-black/30"></div>
                </div>

                {/* Side Slices - Immersive HUD Effect */}
                <div className="fixed left-0 top-0 bottom-0 w-[15%] pointer-events-none z-[1] opacity-60">
                   <div className="absolute inset-0 bg-gradient-to-r from-black via-black/40 to-transparent z-10"></div>
                   <img src={activeTheme.url} alt="" className="absolute inset-0 w-full h-full object-cover map-slice-left" />
                </div>
                <div className="fixed right-0 top-0 bottom-0 w-[15%] pointer-events-none z-[1] opacity-60">
                   <div className="absolute inset-0 bg-gradient-to-l from-black via-black/40 to-transparent z-10"></div>
                   <img src={activeTheme.url} alt="" className="absolute inset-0 w-full h-full object-cover map-slice-right" />
                </div>

                <div className="map-slice-top overflow-hidden">
                   <img src={activeTheme.url} alt="" className="w-full h-full object-cover opacity-40" />
                </div>
                
                {/* HUD Overlays */}
                <div className="fixed inset-0 pointer-events-none z-[2]">
                  <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/90"></div>
                  <div className="absolute inset-0 opacity-[0.05] bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
                  
                  {/* Map Info HUD */}
                  <div className="absolute top-24 right-12 opacity-80 flex flex-col items-end pointer-events-none select-none font-mono">
                    <div className="text-6xl font-black text-white italic tracking-tighter drop-shadow-[0_0_20px_rgba(255,255,255,0.5)] leading-none">{activeTheme.name}</div>
                    <div className="text-[10px] text-white/80 uppercase tracking-[0.6em] mt-3 flex items-center gap-2 font-bold">
                       <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse shadow-[0_0_10px_rgba(220,38,38,0.8)]"></span>
                       ACTIVE ENVIRONMENT
                    </div>
                    <div className="w-64 h-[2px] bg-gradient-to-r from-transparent via-white/40 to-transparent mt-4"></div>
                  </div>
                </div>
              </>
            )}
            <div className="relative z-10 min-h-screen bg-transparent">
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
