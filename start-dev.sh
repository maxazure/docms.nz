#!/bin/bash

echo "========================================"
echo " Docms 开发模式启动脚本"
echo " Docms Development Mode Startup"
echo "========================================"
echo ""

# ========================================
# 0. Stop Existing Services
# ========================================
echo "========================================"
echo "[步骤 0/4] 停止现有服务"
echo "[Step 0/4] Stopping Existing Services"
echo "========================================"
echo ""

echo "[信息] 正在停止现有的 Docms 服务..."
echo "[INFO] Stopping existing Docms services..."

# Stop services using PID files if they exist
if [ -f "logs/api.pid" ]; then
    API_PID=$(cat logs/api.pid)
    kill $API_PID 2>/dev/null
    rm -f logs/api.pid
fi

if [ -f "logs/admin.pid" ]; then
    ADMIN_PID=$(cat logs/admin.pid)
    kill $ADMIN_PID 2>/dev/null
    rm -f logs/admin.pid
fi

# Kill processes on ports 3000, 5173, and 3001
lsof -ti:3000 | xargs kill -9 2>/dev/null
lsof -ti:5173 | xargs kill -9 2>/dev/null
lsof -ti:3001 | xargs kill -9 2>/dev/null

echo "[成功] 现有服务已停止"
echo "[SUCCESS] Existing services stopped"
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "[错误] 未检测到Node.js，请先安装Node.js"
    echo "[ERROR] Node.js not found, please install Node.js first"
    exit 1
fi

echo "[信息] Node.js 版本:"
node --version
echo ""

# Check npm
if ! command -v npm &> /dev/null; then
    echo "[错误] 未检测到npm，请先安装npm"
    echo "[ERROR] npm not found, please install npm first"
    exit 1
fi

echo "[信息] npm 版本:"
npm --version
echo ""

# ========================================
# 1. Install Dependencies
# ========================================
echo "========================================"
echo "[步骤 1/4] 检查并安装依赖"
echo "[Step 1/4] Checking and Installing Dependencies"
echo "========================================"

# API dependencies
echo "[信息] 检查 API 依赖..."
cd api
if [ ! -d "node_modules" ]; then
    echo "[信息] 安装 API 依赖..."
    npm install
    if [ $? -ne 0 ]; then
        echo "[错误] API 依赖安装失败"
        echo "[ERROR] API dependencies installation failed"
        exit 1
    fi
else
    echo "[信息] API 依赖已存在"
fi

echo ""
echo "[信息] 跳过 Prisma Client 生成（已存在）..."
# npm run prisma:generate
# if [ $? -ne 0 ]; then
#     echo "[错误] Prisma Client 生成失败"
#     echo "[ERROR] Prisma Client generation failed"
#     exit 1
# fi

cd ..

# Admin dependencies
echo ""
echo "[信息] 检查 Admin 依赖..."
cd admin
if [ ! -d "node_modules" ]; then
    echo "[信息] 安装 Admin 依赖..."
    npm install
    if [ $? -ne 0 ]; then
        echo "[错误] Admin 依赖安装失败"
        echo "[ERROR] Admin dependencies installation failed"
        exit 1
    fi
else
    echo "[信息] Admin 依赖已存在"
fi
cd ..

# Website dependencies
if [ -d "website" ]; then
    echo ""
    echo "[信息] 检查 Website 依赖..."
    cd website
    if [ ! -d "node_modules" ]; then
        echo "[信息] 安装 Website 依赖..."
        npm install
        if [ $? -ne 0 ]; then
            echo "[错误] Website 依赖安装失败"
            echo "[ERROR] Website dependencies installation failed"
            exit 1
        fi
    else
        echo "[信息] Website 依赖已存在"
    fi
    cd ..
fi

echo ""
echo "[成功] 依赖检查完成"
echo "[SUCCESS] Dependencies check completed"
echo ""

# ========================================
# 2. Start Development Services
# ========================================
echo "========================================"
echo "[步骤 2/4] 启动开发服务"
echo "[Step 2/4] Starting Development Services"
echo "========================================"
echo ""

echo "[信息] 启动 API 开发服务（后台运行）..."
echo "[INFO] Starting API dev server (background)..."
cd api
npm run start:dev > ../logs/api.log 2>&1 &
API_PID=$!
echo "[信息] API Server PID: $API_PID"
cd ..

# Wait 3 seconds for API to start
sleep 3

echo "[信息] 启动 Admin 开发服务（后台运行）..."
echo "[INFO] Starting Admin dev server (background)..."
cd admin
npm run dev > ../logs/admin.log 2>&1 &
ADMIN_PID=$!
echo "[信息] Admin Server PID: $ADMIN_PID"
cd ..

# Start Website if exists
WEBSITE_PID=""
if [ -d "website" ]; then
    sleep 2
    echo "[信息] 启动 Website 开发服务（后台运行）..."
    echo "[INFO] Starting Website dev server (background)..."
    cd website
    npm run dev > ../logs/website.log 2>&1 &
    WEBSITE_PID=$!
    echo "[信息] Website Server PID: $WEBSITE_PID"
    cd ..
fi

echo ""
echo "========================================"
echo "[步骤 3/4] 启动完成"
echo "[Step 3/4] Startup Complete"
echo "========================================"
echo ""
echo "[成功] 所有开发服务已启动！"
echo "[SUCCESS] All development services started!"
echo ""
echo "开发服务信息 / Development Service Info:"
echo "--------------------------------"
echo "API Server:   http://localhost:3000"
echo "API Docs:     http://localhost:3000/api"
echo "Admin Panel:  http://localhost:5173"
if [ -d "website" ]; then
    echo "Website:      http://localhost:3001"
fi
echo "--------------------------------"
echo ""
echo "进程信息 / Process Info:"
echo "API PID:      $API_PID"
echo "Admin PID:    $ADMIN_PID"
if [ -n "$WEBSITE_PID" ]; then
    echo "Website PID:  $WEBSITE_PID"
fi
echo ""
echo "日志文件 / Log Files:"
echo "API Log:      logs/api.log"
echo "Admin Log:    logs/admin.log"
if [ -d "website" ]; then
    echo "Website Log:  logs/website.log"
fi
echo ""
echo "[提示] 查看日志: tail -f logs/api.log 或 tail -f logs/admin.log"
echo "[TIP] View logs: tail -f logs/api.log or tail -f logs/admin.log"
echo ""
if [ -n "$WEBSITE_PID" ]; then
    echo "[提示] 停止服务: kill $API_PID $ADMIN_PID $WEBSITE_PID"
    echo "[TIP] Stop services: kill $API_PID $ADMIN_PID $WEBSITE_PID"
else
    echo "[提示] 停止服务: kill $API_PID $ADMIN_PID"
    echo "[TIP] Stop services: kill $API_PID $ADMIN_PID"
fi
echo ""

# Save PIDs to file for easy stopping
mkdir -p logs
echo $API_PID > logs/api.pid
echo $ADMIN_PID > logs/admin.pid
if [ -n "$WEBSITE_PID" ]; then
    echo $WEBSITE_PID > logs/website.pid
fi

echo "[信息] PID 已保存到 logs/*.pid"
echo "[INFO] PIDs saved to logs/*.pid"
echo ""
