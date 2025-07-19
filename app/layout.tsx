import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Navigation } from '@/components/Navigation'
import { Footer } from '@/components/Footer'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  metadataBase: new URL('https://yang-hansen.vercel.app'),
  title: '杨瀚森 | Yang Hansen - NBA Portland Trail Blazers',
  description: '杨瀚森官方网站 - 波特兰开拓者队中锋，中国NBA球员的新星',
  keywords: '杨瀚森, Yang Hansen, NBA, 开拓者, Trail Blazers, 中国篮球, 中锋',
  authors: [{ name: '杨瀚森官方团队' }],
  openGraph: {
    title: '杨瀚森 | Yang Hansen - NBA Portland Trail Blazers',
    description: '杨瀚森官方网站 - 波特兰开拓者队中锋，中国NBA球员的新星',
    type: 'website',
    locale: 'zh_CN',
    alternateLocale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: '杨瀚森 | Yang Hansen - NBA Portland Trail Blazers',
    description: '杨瀚森官方网站 - 波特兰开拓者队中锋，中国NBA球员的新星',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body className={inter.className}>
        <div className="min-h-screen flex flex-col">
          <Navigation />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
        </div>
      </body>
    </html>
  )
}