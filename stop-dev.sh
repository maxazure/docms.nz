#!/bin/bash

echo "========================================"
echo " Docms 开发服务停止脚本"
echo " Docms Development Services Stop"
echo "========================================"
echo ""

echo "[信息] 正在停止所有 Docms 开发服务..."
echo "[INFO] Stopping all Docms development services..."
echo ""

# Stop services using PID files if they exist
if [ -f "logs/api.pid" ]; then
    API_PID=$(cat logs/api.pid)
    echo "[信息] 停止 API Server (PID: $API_PID)..."
    kill $API_PID 2>/dev/null
    if [ $? -eq 0 ]; then
        echo "[成功] API Server 已停止"
    else
        echo "[信息] API Server 进程不存在或已停止"
    fi
    rm -f logs/api.pid
else
    echo "[信息] 未找到 API Server PID 文件"
fi

if [ -f "logs/admin.pid" ]; then
    ADMIN_PID=$(cat logs/admin.pid)
    echo "[信息] 停止 Admin Server (PID: $ADMIN_PID)..."
    kill $ADMIN_PID 2>/dev/null
    if [ $? -eq 0 ]; then
        echo "[成功] Admin Server 已停止"
    else
        echo "[信息] Admin Server 进程不存在或已停止"
    fi
    rm -f logs/admin.pid
else
    echo "[信息] 未找到 Admin Server PID 文件"
fi

# Kill any remaining processes on ports 3000 and 5173
echo "[信息] 清理端口 3000..."
lsof -ti:3000 | xargs kill -9 2>/dev/null
if [ $? -eq 0 ]; then
    echo "[成功] 端口 3000 已清理"
else
    echo "[信息] 端口 3000 无占用"
fi

echo "[信息] 清理端口 5173..."
lsof -ti:5173 | xargs kill -9 2>/dev/null
if [ $? -eq 0 ]; then
    echo "[成功] 端口 5173 已清理"
else
    echo "[信息] 端口 5173 无占用"
fi

echo ""
echo "========================================"
echo "[完成] 所有服务已停止"
echo "[DONE] All services stopped"
echo "========================================"
echo ""
