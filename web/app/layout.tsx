import "./globals.css"
import "./coinflip.css"
import type { Metadata, Viewport } from "next"
import Header from "./components/Header"
import PwaRegister from "./components/PwaRegister"

export const viewport: Viewport = {
  themeColor: "#0a0a0f",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
}

export const metadata: Metadata = {
  title: "PAPPY",
  description: "Киберпанк сообщество PAPPY",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "PAPPY",
    statusBarStyle: "black-translucent"
  },
  icons: {
    icon: [{ url: "/pwa-icon.svg" }],
    apple: [{ url: "/pwa-icon.svg" }]
  }
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body>
        <div className="min-h-screen bg-base bg-cyber overflow-x-hidden">
          <Header />
          <PwaRegister />
          <main className="max-w-7xl mx-auto px-4 py-6 pb-24 lg:pb-6">{children}</main>
        </div>
      </body>
    </html>
  )
}
