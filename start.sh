#!/bin/bash

# 杨瀚森网站启动脚本
echo "🏀 杨瀚森个人网站启动脚本"
echo "================================"

# 检查Node.js是否安装
if ! command -v node &> /dev/null; then
    echo "❌ Node.js未安装，请先安装Node.js 18+"
    echo "下载地址: https://nodejs.org/"
    exit 1
fi

# 检查Node.js版本
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js版本过低，当前版本: $(node -v)"
    echo "请升级到Node.js 18+版本"
    exit 1
fi

echo "✅ Node.js版本: $(node -v)"

# 检查是否已安装依赖
if [ ! -d "node_modules" ]; then
    echo "📦 正在安装依赖..."
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ 依赖安装失败"
        exit 1
    fi
    echo "✅ 依赖安装完成"
else
    echo "✅ 依赖已安装"
fi

# 启动开发服务器
echo "🚀 启动开发服务器..."
echo "网站将在 http://localhost:3000 打开"
echo "按 Ctrl+C 停止服务器"
echo "================================"

npm run dev