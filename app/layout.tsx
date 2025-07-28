import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Navigation } from '@/components/Navigation'
import { Footer } from '@/components/Footer'
import { LocaleProvider } from '@/components/LocaleProvider'
import { ChineseDetector } from '@/components/ChineseDetector'
import { detectLocale } from '@/lib/locale'
import { StructuredData } from './structured-data'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  metadataBase: new URL('https://yanghansen.blog'),
  title: {
    default: 'Yang Hansen | NBA Portland Trail Blazers',
    template: '%s | Yang Hansen Official'
  },
  description: 'Yang Hansen Official Website - Portland Trail Blazers Center, Rising Chinese NBA Star. Latest news, stats, videos and career highlights.',
  keywords: 'Yang Hansen, 杨瀚森, NBA, Portland Trail Blazers, Chinese Basketball, Center, CBA, Basketball Player, NBA Draft 2025',
  authors: [{ name: 'Yang Hansen Official Team' }],
  creator: 'Yang Hansen Official Team',
  publisher: 'Yang Hansen Official',
  category: 'Sports',
  classification: 'Basketball Player Official Website',
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
  openGraph: {
    title: 'Yang Hansen | NBA Portland Trail Blazers',
    description: 'Yang Hansen Official Website - Portland Trail Blazers Center, Rising Chinese NBA Star. Latest news, stats, videos and career highlights.',
    type: 'website',
    locale: 'en_US',
    alternateLocale: 'zh_CN',
    url: 'https://yanghansen.blog',
    siteName: 'Yang Hansen Official',
    images: [
      {
        url: '/favicon.svg',
        width: 1200,
        height: 630,
        alt: 'Yang Hansen - NBA Portland Trail Blazers',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Yang Hansen | NBA Portland Trail Blazers',
    description: 'Yang Hansen Official Website - Portland Trail Blazers Center, Rising Chinese NBA Star',
    creator: '@YangHansenNBA',
    images: ['/favicon.svg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'google-site-verification-code-here',
  },
  alternates: {
    canonical: 'https://yanghansen.blog',
    languages: {
      'en-US': 'https://yanghansen.blog',
      'zh-CN': 'https://yanghansen.blog',
    },
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
        <StructuredData />
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