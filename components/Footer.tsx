import Link from 'next/link'

export function Footer() {
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
                <div className="text-xl font-bold">杨瀚森</div>
                <div className="text-sm text-gray-300">Yang Hansen</div>
              </div>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed">
              中国篮球新星，NBA选秀前景球员。
              <br />
              Rising Chinese Basketball Star, NBA Draft Prospect.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">快速链接</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="text-gray-300 hover:text-white transition-colors">
                  个人档案
                </Link>
              </li>
              <li>
                <Link href="/stats" className="text-gray-300 hover:text-white transition-colors">
                  数据统计
                </Link>
              </li>
              <li>
                <Link href="/media" className="text-gray-300 hover:text-white transition-colors">
                  媒体中心
                </Link>
              </li>
              <li>
                <Link href="/news" className="text-gray-300 hover:text-white transition-colors">
                  最新动态
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">联系信息</h3>
            <div className="space-y-2 text-gray-300 text-sm">
              <p>中国青年篮球联赛</p>
              <p>北京，中国</p>
              <p>Beijing, China</p>
              <p className="mt-4">
                <span className="text-white">身高:</span> 7'3" (2.21m)
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-700 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <div className="text-gray-300 text-sm">
            © 2024 杨瀚森官方网站. All rights reserved.
          </div>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link href="/privacy" className="text-gray-300 hover:text-white text-sm transition-colors">
              隐私政策
            </Link>
            <Link href="/terms" className="text-gray-300 hover:text-white text-sm transition-colors">
              使用条款
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}