import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { CloudIcon } from 'lucide-react'
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import Link from 'next/link'
import { Toaster } from 'sonner'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Cloud Service Dashboard',
  description: 'A modern and minimalist cloud service dashboard',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen bg-gray-50">
          <header className="bg-[#1a237e] text-white shadow-lg">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center h-16 justify-between">
                <div className="flex items-center">
                  <Link href="/" className="flex items-center space-x-2">
                    <CloudIcon className="h-8 w-8" />
                    <span className="text-xl font-semibold">CloudConnect</span>
                  </Link>
                  <nav className="ml-10 space-x-8">
                    <Link href="/dashboard" className="text-white/90 hover:text-white">Dashboard</Link>
                    <Link href="/resources" className="text-white/90 hover:text-white">Resources</Link>
                    <Link href="/billing" className="text-white/90 hover:text-white">Billing</Link>
                    <Link href="/support" className="text-white/90 hover:text-white">Support</Link>
                  </nav>
                </div>
                <div className="flex items-center">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>SC</AvatarFallback>
                  </Avatar>
                </div>
              </div>
            </div>
          </header>
          <main>
            <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
              {children}
            </div>
          </main>
        </div>
        <Toaster />
      </body>
    </html>
  )
}

