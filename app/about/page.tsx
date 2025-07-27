'use client'

import Image from 'next/image'
import { Calendar, MapPin, GraduationCap, Heart } from 'lucide-react'
import playerData from '@/data/player.json'
import { calculateAge, formatDate } from '@/lib/utils'
import { useTranslations, useLocale } from 'next-intl'
import { ConditionalContent } from '@/components/ConditionalContent'
import { useLocalizedPlayerData } from '@/components/LocalizedData'
import { useSafeData } from '@/hooks/useSafeData'
import { ChineseDetector } from '@/components/ChineseDetector'
import playerDataRaw from '@/data/player.json'

export default function AboutPage() {
  const t = useTranslations('AboutPage')
  const locale = useLocale()
  
  // 使用安全数据过滤
  const playerData = useSafeData(playerDataRaw)
  const { basicInfo, biography, careerTimeline, personalLife } = playerData

  return (
    <ChineseDetector>
      <div className="min-h-screen py-8">
      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-r from-blazers-red to-blazers-black text-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl lg:text-5xl font-bold mb-6">
                {t('title')}
              </h1>
              <p className="text-xl leading-relaxed mb-8">
                {biography.story}
              </p>
              <div className="grid grid-cols-2 gap-6">
                <div className="flex items-center space-x-3">
                  <Calendar className="w-6 h-6 text-gray-300" />
                  <div>
                    <div className="text-sm text-gray-300">
                      <ConditionalContent zh="年龄" en="Age" />
                    </div>
                    <div className="font-semibold">
                      <ConditionalContent 
                        zh={`${calculateAge(basicInfo.birthDate)} 岁`}
                        en={`${calculateAge(basicInfo.birthDate)} years old`}
                      />
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <MapPin className="w-6 h-6 text-gray-300" />
                  <div>
                    <div className="text-sm text-gray-300">
                      <ConditionalContent zh="出生地" en="Birthplace" />
                    </div>
                    <div className="font-semibold">
                      <ConditionalContent 
                        zh={basicInfo.birthPlace}
                        en="Zibo, Shandong Province, China"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-center">
              <div className="relative">
                <div className="w-80 h-80 lg:w-96 lg:h-96 rounded-2xl overflow-hidden border-4 border-white shadow-2xl">
                  <Image
                    src="https://images.unsplash.com/photo-1546519638-68e109498ffc?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                    alt={`${basicInfo.name} - ${basicInfo.englishName}`}
                    width={400}
                    height={400}
                    className="object-cover w-full h-full"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Basic Info */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">
            {t('basicInfo')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg p-6 shadow-md text-center">
              <div className="text-3xl font-bold text-blazers-red mb-2">{basicInfo.height}</div>
              <div className="text-gray-600">{t('height')}</div>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-md text-center">
              <div className="text-3xl font-bold text-blazers-red mb-2">{basicInfo.weight}</div>
              <div className="text-gray-600">{t('weight')}</div>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-md text-center">
              <div className="text-3xl font-bold text-blazers-red mb-2">#{basicInfo.jerseyNumber}</div>
              <div className="text-gray-600">{t('jersey')}</div>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-md text-center">
              <div className="text-3xl font-bold text-blazers-red mb-2">{basicInfo.position}</div>
              <div className="text-gray-600">{t('position')}</div>
            </div>
          </div>
        </div>
      </section>

      {/* Career Timeline */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">
            {t('careerTimeline')}
          </h2>
          <div className="max-w-4xl mx-auto">
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-blazers-red"></div>
              
              {careerTimeline.map((milestone, index) => (
                <div key={index} className="relative flex items-start mb-8">
                  {/* Timeline dot */}
                  <div className="absolute left-6 w-4 h-4 bg-blazers-red rounded-full border-4 border-white shadow-md"></div>
                  
                  {/* Content */}
                  <div className="ml-16 bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-3">
                      <h3 className="text-xl font-bold text-gray-800">{milestone.event}</h3>
                      <span className="text-blazers-red font-semibold">{milestone.year}</span>
                    </div>
                    <p className="text-gray-600 leading-relaxed">{milestone.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Personal Story */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">
            <ConditionalContent zh="我的故事" en="My Story" />
          </h2>
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h3 className="text-2xl font-bold mb-4 text-gray-800">
                  <ConditionalContent zh="成长背景" en="Background" />
                </h3>
                <p className="text-gray-600 leading-relaxed mb-6">
                  <ConditionalContent 
                    zh={biography.background}
                    en="Yang Hansen was born in Zibo, Shandong Province, and started playing basketball at a young age. He entered club training in the third grade of elementary school and later attended Zibo Sports School. Around 2020, he joined the youth training system of Qingdao Guoxin Haitian Club."
                  />
                </p>
                <h3 className="text-2xl font-bold mb-4 text-gray-800">
                  <ConditionalContent zh="NBA之路" en="NBA Journey" />
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  <ConditionalContent 
                    zh={biography.journey}
                    en="Yang Hansen excelled in Qingdao Guoxin Haitian youth team, helping the team win U17 national championships for two consecutive years and earning individual honors. In 2023, he was promoted to the CBA first team and won multiple important honors in his first season, including CBA Rookie of the Year. In 2025, he successfully entered the NBA, starting a new chapter in his professional career."
                  />
                </p>
              </div>
              <div className="space-y-6">
                <div className="bg-white rounded-lg p-6 shadow-md">
                  <div className="flex items-center space-x-3 mb-4">
                    <GraduationCap className="w-6 h-6 text-blazers-red" />
                    <h4 className="text-lg font-semibold text-gray-800">
                      <ConditionalContent zh="教育背景" en="Education" />
                    </h4>
                  </div>
                  <p className="text-gray-600">
                    <ConditionalContent 
                      zh={personalLife.education}
                      en="Zibo Sports School"
                    />
                  </p>
                </div>
                
                <div className="bg-white rounded-lg p-6 shadow-md">
                  <div className="flex items-center space-x-3 mb-4">
                    <Heart className="w-6 h-6 text-blazers-red" />
                    <h4 className="text-lg font-semibold text-gray-800">
                      <ConditionalContent zh="兴趣爱好" en="Hobbies" />
                    </h4>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {personalLife.hobbies.map((hobby, index) => (
                      <span key={index} className="bg-blazers-red text-white px-3 py-1 rounded-full text-sm">
                        {hobby}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="bg-white rounded-lg p-6 shadow-md">
                  <h4 className="text-lg font-semibold text-gray-800 mb-3">
                    <ConditionalContent zh="语言能力" en="Languages" />
                  </h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">
                        <ConditionalContent zh="中文（母语）" en="Chinese (Native)" />
                      </span>
                      <div className="w-20 h-2 bg-gray-200 rounded-full">
                        <div className="w-full h-2 bg-blazers-red rounded-full"></div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">
                        <ConditionalContent zh="英语（学习中）" en="English (Learning)" />
                      </span>
                      <div className="w-20 h-2 bg-gray-200 rounded-full">
                        <div className="w-3/4 h-2 bg-blazers-red rounded-full"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Personal Quote */}
      <section className="py-16 bg-blazers-red text-white">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <div className="text-6xl text-blazers-red/20 mb-4">"</div>
            <blockquote className="text-2xl lg:text-3xl font-light italic mb-6 leading-relaxed">
              {personalLife.motto}
            </blockquote>
            <div className="text-lg text-gray-200">
              — {basicInfo.name} ({basicInfo.englishName})
            </div>
          </div>
        </div>
      </section>

      {/* Fun Facts */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">
            <ConditionalContent zh="趣味小知识" en="Fun Facts" />
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            <div className="bg-white rounded-lg p-6 shadow-md text-center">
              <div className="text-4xl mb-4">🍜</div>
              <h3 className="text-lg font-semibold mb-2 text-gray-800">
                <ConditionalContent zh="家乡特色" en="Hometown" />
              </h3>
              <p className="text-gray-600">
                <ConditionalContent 
                  zh={`来自${personalLife.hometown}`}
                  en="From Zibo, Shandong Province"
                />
              </p>
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow-md text-center">
              <div className="text-4xl mb-4">📏</div>
              <h3 className="text-lg font-semibold mb-2 text-gray-800">
                <ConditionalContent zh="身高优势" en="Height Advantage" />
              </h3>
              <p className="text-gray-600">
                <ConditionalContent 
                  zh="NBA历史上最高的中国球员之一"
                  en="One of the tallest Chinese players in NBA history"
                />
              </p>
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow-md text-center">
              <div className="text-4xl mb-4">🏀</div>
              <h3 className="text-lg font-semibold mb-2 text-gray-800">
                <ConditionalContent zh="篮球启蒙" en="Basketball Start" />
              </h3>
              <p className="text-gray-600">
                <ConditionalContent 
                  zh="14岁时身高就超过了2米"
                  en="Already over 2 meters tall at age 14"
                />
              </p>
            </div>
          </div>
        </div>
      </section>
      </div>
    </ChineseDetector>
  )
}