'use client'

import Link from 'next/link'
import { useTranslations } from 'next-intl'

export function Footer() {
  const t = useTranslations('Footer')
  return (
    <footer className="bg-blazers-black text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-10 h-10 bg-blazers-red rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">YH</span>
              </div>
              <div>
                <div className="text-xl font-bold">Yang Hansen</div>
                <div className="text-sm text-gray-300">NBA Player</div>
              </div>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed">
              {t('description')}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">{t('quickLinks')}</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="text-gray-300 hover:text-white transition-colors">
                  {t('personalProfile')}
                </Link>
              </li>
              <li>
                <Link href="/stats" className="text-gray-300 hover:text-white transition-colors">
                  {t('dataStats')}
                </Link>
              </li>
              <li>
                <Link href="/videos" className="text-gray-300 hover:text-white transition-colors">
                  {t('mediaCenter')}
                </Link>
              </li>
              <li>
                <Link href="/news" className="text-gray-300 hover:text-white transition-colors">
                  {t('latestNews')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">{t('contactInfo')}</h3>
            <div className="space-y-2 text-gray-300 text-sm">
              <p>Chinese Basketball League</p>
              <p>{t('location')}</p>
              <p className="mt-4">
                <span className="text-white">{t('height')}:</span> 7'3" (2.21m)
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-700 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <div className="text-gray-300 text-sm">
            © 2024 {t('copyright')}
          </div>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link href="/privacy" className="text-gray-300 hover:text-white text-sm transition-colors">
              {t('privacy')}
            </Link>
            <Link href="/terms" className="text-gray-300 hover:text-white text-sm transition-colors">
              {t('terms')}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}