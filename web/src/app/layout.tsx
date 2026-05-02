import type { Metadata } from "next"
import type { ReactNode } from "react"
import { Geist } from "next/font/google"
import { Providers } from "@/lib/providers"
import "./globals.css"

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" })

export const metadata: Metadata = {
  title: {
    template: "%s | Products",
    default: "Products",
  },
  description: "Product management dashboard",
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={geist.variable}>
      <body className="min-h-screen bg-background antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
