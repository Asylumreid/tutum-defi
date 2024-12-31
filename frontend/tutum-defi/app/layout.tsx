import './globals.css'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Tutum - Web 2.5 Hybrid Lending Fintech Platform',
  description: 'Tutum is a pioneering Web 2.5 company bridging the divide between blockchain technology and traditional finance',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}

