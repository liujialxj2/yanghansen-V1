'use client'

import { useTranslations } from 'next-intl'

export default function TermsPage() {
  const t = useTranslations('TermsPage')

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-800 mb-8">
            Terms of Service
          </h1>
          
          <div className="prose prose-lg max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-700 mb-4">Acceptance of Terms</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                By accessing and using this website, you accept and agree to be bound by the terms 
                and provision of this agreement.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-700 mb-4">Use License</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                Permission is granted to temporarily download one copy of the materials on this website 
                for personal, non-commercial transitory viewing only.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-700 mb-4">Disclaimer</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                The materials on this website are provided on an 'as is' basis. We make no warranties, 
                expressed or implied, and hereby disclaim all other warranties.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-700 mb-4">Limitations</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                In no event shall Yang Hansen's official website or its suppliers be liable for any damages 
                arising out of the use or inability to use the materials on this website.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-700 mb-4">Revisions</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                We may revise these terms of service at any time without notice. By using this website, 
                you are agreeing to be bound by the current version of these terms.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-700 mb-4">Contact Information</h2>
              <p className="text-gray-600 leading-relaxed">
                If you have any questions about these Terms of Service, please contact us at legal@yanghansen.com
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}