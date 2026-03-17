import "./globals.css"
import "./coinflip.css"
import type { Metadata } from "next"
import Header from "./components/Header"

export const metadata: Metadata = {
  title: "PAPPY",
  description: "Киберпанк сообщество PAPPY"
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body>
        <div className="min-h-screen bg-base bg-cyber">
          <Header />
          <main className="max-w-6xl mx-auto px-4 py-6">{children}</main>
        </div>
      </body>
    </html>
  )
}
