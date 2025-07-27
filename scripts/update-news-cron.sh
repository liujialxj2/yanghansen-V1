#!/bin/bash
# Yang Hansen新闻自动更新脚本
# 每天早上8点执行

cd "$(dirname "$0")/.."
node scripts/update-yang-hansen-news.js >> logs/news-update.log 2>&1
