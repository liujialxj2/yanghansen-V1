#!/bin/bash

echo "🏀 杨瀚森网站项目验证脚本"
echo "================================"

# 检查关键文件
echo "📁 检查项目文件..."

files=(
    "package.json"
    "next.config.js"
    "tailwind.config.js"
    "tsconfig.json"
    "app/layout.tsx"
    "app/page.tsx"
    "app/about/page.tsx"
    "app/stats/page.tsx"
    "app/media/page.tsx"
    "app/news/page.tsx"
    "components/Navigation.tsx"
    "components/Footer.tsx"
    "components/ui/button.tsx"
    "data/player.json"
    "data/stats.json"
    "lib/utils.ts"
    "app/globals.css"
)

missing_files=0

for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file"
    else
        echo "❌ $file - 文件缺失"
        missing_files=$((missing_files + 1))
    fi
done

echo ""
echo "📊 验证结果:"
echo "总文件数: ${#files[@]}"
echo "存在文件: $((${#files[@]} - missing_files))"
echo "缺失文件: $missing_files"

if [ $missing_files -eq 0 ]; then
    echo ""
    echo "🎉 所有文件验证通过！"
    echo "项目结构完整，可以开始使用。"
    echo ""
    echo "下一步操作："
    echo "1. 运行 npm install 安装依赖"
    echo "2. 运行 npm run dev 启动开发服务器"
    echo "3. 访问 http://localhost:3000 查看网站"
else
    echo ""
    echo "⚠️  发现缺失文件，请检查项目完整性"
fi

echo ""
echo "🚀 准备部署到Vercel："
echo "1. 将代码推送到GitHub"
echo "2. 在Vercel中连接仓库"
echo "3. 一键部署完成"

echo ""
echo "================================"