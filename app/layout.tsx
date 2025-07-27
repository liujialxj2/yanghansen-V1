import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Navigation } from '@/components/Navigation'
import { Footer } from '@/components/Footer'
import { LocaleProvider } from '@/components/LocaleProvider'
import { ChineseDetector } from '@/components/ChineseDetector'
import { detectLocale } from '@/lib/locale'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  metadataBase: new URL('https://yanghansen.blog'),
  title: 'Yang Hansen | NBA Portland Trail Blazers',
  description: 'Yang Hansen Official Website - Portland Trail Blazers Center, Rising Chinese NBA Star',
  keywords: 'Yang Hansen, NBA, Trail Blazers, Chinese Basketball, Center',
  authors: [{ name: 'Yang Hansen Official Team' }],
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
  openGraph: {
    title: 'Yang Hansen | NBA Portland Trail Blazers',
    description: 'Yang Hansen Official Website - Portland Trail Blazers Center, Rising Chinese NBA Star',
    type: 'website',
    locale: 'zh_CN',
    alternateLocale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Yang Hansen | NBA Portland Trail Blazers',
    description: 'Yang Hansen Official Website - Portland Trail Blazers Center, Rising Chinese NBA Star',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // 服务端默认英文，客户端检测后切换
  const locale = 'en'; // 改为默认英文
  
  // 加载翻译文件
  const messages = (await import(`../messages/${locale}.json`)).default;

  return (
    <html lang="en">
      <head>
        <meta name="google-adsense-account" content="ca-pub-1093223025550160" />
        <script 
          async 
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1093223025550160"
          crossOrigin="anonymous"
        />
      </head>
      <body className={inter.className}>
        <LocaleProvider messages={messages} locale="en">
          <ChineseDetector>
            <div className="min-h-screen flex flex-col">
            <Navigation />
            <main className="flex-1">
              {children}
            </main>
            <Footer />
          </div>
          </ChineseDetector>
        </LocaleProvider>
      </body>
    </html>
  )
}