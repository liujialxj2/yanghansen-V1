'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTranslations, useLocale } from 'next-intl'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false)
  const t = useTranslations('Navigation')
  const locale = useLocale()

  const navItems = [
    { href: '/', key: 'home' },
    { href: '/about', key: 'about' },
    { href: '/stats', key: 'stats' },
    { href: '/videos', key: 'videos' },
    { href: '/news', key: 'news' },
  ]

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-blazers-red rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-lg">YH</span>
            </div>
            <div className="hidden sm:block">
              <div className="text-xl font-bold text-blazers-red">Yang Hansen</div>
              <div className="text-sm text-gray-600">Yang Hansen</div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-gray-700 hover:text-blazers-red transition-colors duration-200 font-medium"
              >
                <span className="block">{t(item.key)}</span>
              </Link>
            ))}
            <LanguageSwitcher />
          </div>

          {/* Mobile menu button and language switcher */}
          <div className="flex items-center space-x-2">
            <div className="md:hidden">
              <LanguageSwitcher />
            </div>
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Toggle menu"
              >
                {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-white border-t">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="block px-3 py-2 text-gray-700 hover:text-blazers-red hover:bg-gray-50 rounded-md transition-colors duration-200"
                  onClick={() => setIsOpen(false)}
                >
                  <span className="font-medium">{t(item.key)}</span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}