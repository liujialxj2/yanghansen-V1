import Image from 'next/image'
import { Calendar, MapPin, GraduationCap, Heart } from 'lucide-react'
import playerData from '@/data/player.json'
import { calculateAge, formatDate } from '@/lib/utils'

export default function AboutPage() {
  const { basicInfo, biography, careerTimeline, personalLife } = playerData

  return (
    <div className="min-h-screen py-8">
      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-r from-blazers-red to-blazers-black text-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl lg:text-5xl font-bold mb-6">
                关于我 <span className="block text-2xl font-normal text-gray-200">About Me</span>
              </h1>
              <p className="text-xl leading-relaxed mb-8">
                {biography.story}
              </p>
              <div className="grid grid-cols-2 gap-6">
                <div className="flex items-center space-x-3">
                  <Calendar className="w-6 h-6 text-gray-300" />
                  <div>
                    <div className="text-sm text-gray-300">年龄 Age</div>
                    <div className="font-semibold">{calculateAge(basicInfo.birthDate)} 岁</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <MapPin className="w-6 h-6 text-gray-300" />
                  <div>
                    <div className="text-sm text-gray-300">出生地 Birthplace</div>
                    <div className="font-semibold">{basicInfo.birthPlace}</div>
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
            基本信息 <span className="text-blazers-red">Basic Information</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg p-6 shadow-md text-center">
              <div className="text-3xl font-bold text-blazers-red mb-2">{basicInfo.height}</div>
              <div className="text-gray-600">身高 Height</div>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-md text-center">
              <div className="text-3xl font-bold text-blazers-red mb-2">{basicInfo.weight}</div>
              <div className="text-gray-600">体重 Weight</div>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-md text-center">
              <div className="text-3xl font-bold text-blazers-red mb-2">#{basicInfo.jerseyNumber}</div>
              <div className="text-gray-600">球衣号码 Jersey</div>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-md text-center">
              <div className="text-3xl font-bold text-blazers-red mb-2">{basicInfo.position}</div>
              <div className="text-gray-600">位置 Position</div>
            </div>
          </div>
        </div>
      </section>

      {/* Career Timeline */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">
            职业生涯 <span className="text-blazers-red">Career Timeline</span>
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
            我的故事 <span className="text-blazers-red">My Story</span>
          </h2>
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h3 className="text-2xl font-bold mb-4 text-gray-800">成长背景</h3>
                <p className="text-gray-600 leading-relaxed mb-6">
                  {biography.background}
                </p>
                <h3 className="text-2xl font-bold mb-4 text-gray-800">NBA之路</h3>
                <p className="text-gray-600 leading-relaxed">
                  {biography.journey}
                </p>
              </div>
              <div className="space-y-6">
                <div className="bg-white rounded-lg p-6 shadow-md">
                  <div className="flex items-center space-x-3 mb-4">
                    <GraduationCap className="w-6 h-6 text-blazers-red" />
                    <h4 className="text-lg font-semibold text-gray-800">教育背景</h4>
                  </div>
                  <p className="text-gray-600">{personalLife.education}</p>
                </div>
                
                <div className="bg-white rounded-lg p-6 shadow-md">
                  <div className="flex items-center space-x-3 mb-4">
                    <Heart className="w-6 h-6 text-blazers-red" />
                    <h4 className="text-lg font-semibold text-gray-800">兴趣爱好</h4>
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
                  <h4 className="text-lg font-semibold text-gray-800 mb-3">语言能力</h4>
                  <div className="space-y-2">
                    {personalLife.languages.map((language, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-gray-600">{language}</span>
                        <div className="w-20 h-2 bg-gray-200 rounded-full">
                          <div className="w-full h-2 bg-blazers-red rounded-full"></div>
                        </div>
                      </div>
                    ))}
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
            趣味小知识 <span className="text-blazers-red">Fun Facts</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            <div className="bg-white rounded-lg p-6 shadow-md text-center">
              <div className="text-4xl mb-4">🍜</div>
              <h3 className="text-lg font-semibold mb-2 text-gray-800">最爱美食</h3>
              <p className="text-gray-600">{personalLife.favoriteFood}</p>
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow-md text-center">
              <div className="text-4xl mb-4">📏</div>
              <h3 className="text-lg font-semibold mb-2 text-gray-800">身高优势</h3>
              <p className="text-gray-600">NBA历史上最高的中国球员之一</p>
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow-md text-center">
              <div className="text-4xl mb-4">🏀</div>
              <h3 className="text-lg font-semibold mb-2 text-gray-800">篮球启蒙</h3>
              <p className="text-gray-600">14岁时身高就超过了2米</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}