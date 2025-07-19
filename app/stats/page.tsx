import { TrendingUp, Target, Shield, Clock } from 'lucide-react'
import statsData from '@/data/stats.json'
import { formatNumber, formatDate, getGameResultColor } from '@/lib/utils'

export default function StatsPage() {
  const { currentSeason, recentGames, milestones } = statsData

  return (
    <div className="min-h-screen py-8">
      {/* Header */}
      <section className="py-16 bg-gradient-to-r from-blazers-red to-blazers-black text-white">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl lg:text-5xl font-bold mb-4">
            数据统计 <span className="block text-2xl font-normal text-gray-200 mt-2">Statistics</span>
          </h1>
          <p className="text-xl text-gray-200 max-w-2xl mx-auto">
            追踪杨瀚森在NBA赛场上的每一个精彩表现和数据记录
          </p>
        </div>
      </section>

      {/* Current Season Overview */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">
            {currentSeason.season} 赛季概览 <span className="text-blazers-red">Season Overview</span>
          </h2>
          
          {/* Games Played Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white rounded-lg p-6 shadow-md text-center">
              <div className="text-4xl font-bold text-blazers-red mb-2">{currentSeason.gamesPlayed}</div>
              <div className="text-gray-600">出场比赛 Games Played</div>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-md text-center">
              <div className="text-4xl font-bold text-blazers-red mb-2">{currentSeason.gamesStarted}</div>
              <div className="text-gray-600">首发比赛 Games Started</div>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-md text-center">
              <div className="text-4xl font-bold text-blazers-red mb-2">
                {formatNumber(currentSeason.averages.minutes)}
              </div>
              <div className="text-gray-600">场均时间 Minutes/Game</div>
            </div>
          </div>

          {/* Main Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
            <div className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <Target className="w-8 h-8 text-blazers-red" />
                <div className="text-right">
                  <div className="text-2xl font-bold text-blazers-red">
                    {formatNumber(currentSeason.averages.points)}
                  </div>
                  <div className="text-sm text-gray-600">场均得分</div>
                </div>
              </div>
              <div className="text-xs text-gray-500">Points Per Game</div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <TrendingUp className="w-8 h-8 text-blazers-red" />
                <div className="text-right">
                  <div className="text-2xl font-bold text-blazers-red">
                    {formatNumber(currentSeason.averages.rebounds)}
                  </div>
                  <div className="text-sm text-gray-600">场均篮板</div>
                </div>
              </div>
              <div className="text-xs text-gray-500">Rebounds Per Game</div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <Shield className="w-8 h-8 text-blazers-red" />
                <div className="text-right">
                  <div className="text-2xl font-bold text-blazers-red">
                    {formatNumber(currentSeason.averages.blocks)}
                  </div>
                  <div className="text-sm text-gray-600">场均盖帽</div>
                </div>
              </div>
              <div className="text-xs text-gray-500">Blocks Per Game</div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <Clock className="w-8 h-8 text-blazers-red" />
                <div className="text-right">
                  <div className="text-2xl font-bold text-blazers-red">
                    {formatNumber(currentSeason.averages.assists)}
                  </div>
                  <div className="text-sm text-gray-600">场均助攻</div>
                </div>
              </div>
              <div className="text-xs text-gray-500">Assists Per Game</div>
            </div>
          </div>

          {/* Shooting Stats */}
          <div className="bg-white rounded-lg p-8 shadow-md">
            <h3 className="text-2xl font-bold mb-6 text-gray-800 text-center">
              投篮数据 <span className="text-blazers-red">Shooting Statistics</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="relative w-32 h-32 mx-auto mb-4">
                  <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#e5e7eb"
                      strokeWidth="3"
                    />
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#CE1141"
                      strokeWidth="3"
                      strokeDasharray={`${currentSeason.shooting.fieldGoalPercentage * 100}, 100`}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-bold text-blazers-red">
                      {(currentSeason.shooting.fieldGoalPercentage * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
                <div className="text-gray-800 font-semibold">投篮命中率</div>
                <div className="text-sm text-gray-600">Field Goal %</div>
              </div>

              <div className="text-center">
                <div className="relative w-32 h-32 mx-auto mb-4">
                  <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#e5e7eb"
                      strokeWidth="3"
                    />
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#CE1141"
                      strokeWidth="3"
                      strokeDasharray={`${currentSeason.shooting.threePointPercentage * 100}, 100`}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-bold text-blazers-red">
                      {(currentSeason.shooting.threePointPercentage * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
                <div className="text-gray-800 font-semibold">三分命中率</div>
                <div className="text-sm text-gray-600">3-Point %</div>
              </div>

              <div className="text-center">
                <div className="relative w-32 h-32 mx-auto mb-4">
                  <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#e5e7eb"
                      strokeWidth="3"
                    />
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#CE1141"
                      strokeWidth="3"
                      strokeDasharray={`${currentSeason.shooting.freeThrowPercentage * 100}, 100`}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-bold text-blazers-red">
                      {(currentSeason.shooting.freeThrowPercentage * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
                <div className="text-gray-800 font-semibold">罚球命中率</div>
                <div className="text-sm text-gray-600">Free Throw %</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Games */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">
            最近比赛 <span className="text-blazers-red">Recent Games</span>
          </h2>
          <div className="max-w-6xl mx-auto">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-blazers-red text-white">
                    <tr>
                      <th className="px-6 py-4 text-left">日期</th>
                      <th className="px-6 py-4 text-left">对手</th>
                      <th className="px-6 py-4 text-center">结果</th>
                      <th className="px-6 py-4 text-center">得分</th>
                      <th className="px-6 py-4 text-center">篮板</th>
                      <th className="px-6 py-4 text-center">助攻</th>
                      <th className="px-6 py-4 text-center">盖帽</th>
                      <th className="px-6 py-4 text-center">时间</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentGames.map((game, index) => (
                      <tr key={index} className="border-b hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {formatDate(game.date)}
                        </td>
                        <td className="px-6 py-4 font-medium text-gray-800">
                          {game.opponent}
                        </td>
                        <td className={`px-6 py-4 text-center font-bold ${getGameResultColor(game.result)}`}>
                          {game.result}
                        </td>
                        <td className="px-6 py-4 text-center font-semibold text-blazers-red">
                          {game.stats.points}
                        </td>
                        <td className="px-6 py-4 text-center font-semibold text-blazers-red">
                          {game.stats.rebounds}
                        </td>
                        <td className="px-6 py-4 text-center font-semibold text-blazers-red">
                          {game.stats.assists}
                        </td>
                        <td className="px-6 py-4 text-center font-semibold text-blazers-red">
                          {game.stats.blocks}
                        </td>
                        <td className="px-6 py-4 text-center text-gray-600">
                          {game.stats.minutes}min
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Career Milestones */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">
            职业生涯里程碑 <span className="text-blazers-red">Career Milestones</span>
          </h2>
          <div className="max-w-4xl mx-auto">
            <div className="space-y-6">
              {milestones.map((milestone, index) => (
                <div key={index} className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-800 mb-2">
                        {milestone.achievement}
                      </h3>
                      <p className="text-gray-600 leading-relaxed">
                        {milestone.description}
                      </p>
                    </div>
                    <div className="mt-4 md:mt-0 md:ml-6">
                      <div className="bg-blazers-red text-white px-4 py-2 rounded-full text-sm font-semibold">
                        {formatDate(milestone.date)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Performance Insights */}
      <section className="py-16 bg-blazers-red text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-8">
            表现亮点 <span className="text-gray-200">Performance Highlights</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div>
              <div className="text-4xl font-bold mb-2">14</div>
              <div className="text-lg text-gray-200">职业生涯单场最高得分</div>
              <div className="text-sm text-gray-300">Career High Points</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">11</div>
              <div className="text-lg text-gray-200">职业生涯单场最高篮板</div>
              <div className="text-sm text-gray-300">Career High Rebounds</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">4</div>
              <div className="text-lg text-gray-200">职业生涯单场最高盖帽</div>
              <div className="text-sm text-gray-300">Career High Blocks</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}