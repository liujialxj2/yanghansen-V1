import playerData from '@/data/player.json'
import statsData from '@/data/stats.json'
import { HomePageClient } from '@/components/HomePageClient'

export default function HomePage() {
  const { basicInfo, biography } = playerData
  const { currentSeason, recentGames } = statsData

  return <HomePageClient 
    basicInfo={basicInfo} 
    biography={biography} 
    currentSeason={currentSeason} 
    recentGames={recentGames} 
  />
}