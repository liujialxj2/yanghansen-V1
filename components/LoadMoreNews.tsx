'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'

interface LoadMoreNewsProps {
  onLoadMore: () => void
  hasMore: boolean
  loading: boolean
}

export default function LoadMoreNews({ onLoadMore, hasMore, loading }: LoadMoreNewsProps) {
  const tCommon = useTranslations('Common')
  const tNews = useTranslations('NewsPage')
  
  if (!hasMore) {
    return (
      <div className="text-center mt-12">
        <p className="text-gray-500">All news displayed</p>
      </div>
    )
  }

  return (
    <div className="text-center mt-12">
      <Button 
        variant="blazers" 
        size="lg"
        onClick={onLoadMore}
        disabled={loading}
      >
        {loading ? tCommon('loading') : `${tCommon('loadMore')} ${tNews('title')}`}
      </Button>
    </div>
  )
}