#!/bin/bash

echo "🚀 启动 AI Design Agent 项目"
echo "================================"

# 检查是否存在 .env 文件
if [ ! -f .env ]; then
    echo "⚠️  未找到 .env 文件，正在从 .env.example 复制..."
    cp .env.example .env
    echo "✅ 已创建 .env 文件"
    echo "📝 请编辑 .env 文件并设置您的 OpenRouter API 密钥"
    echo ""
fi

# 检查是否安装了依赖
if [ ! -d "node_modules" ]; then
    echo "📦 正在安装依赖..."
    npm install
    echo "✅ 依赖安装完成"
    echo ""
fi

echo "🌟 启动开发服务器..."
echo "📍 服务器将在 http://localhost:5173 启动"
echo "⏹️  按 Ctrl+C 停止服务器"
echo ""

npm run dev