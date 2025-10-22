@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

echo ========================================
echo  Docms 停止服务脚本
echo  Docms Stop Services Script
echo ========================================
echo.

echo [信息] 正在查找并停止 Docms 相关进程...
echo [INFO] Finding and stopping Docms processes...
echo.

:: 停止API服务
echo [信息] 停止 API 服务...
taskkill /FI "WINDOWTITLE eq Docms API*" /F 2>nul
if %errorlevel% equ 0 (
    echo [成功] API 服务已停止
) else (
    echo [信息] 未找到运行中的 API 服务
)

:: 停止Admin服务
echo [信息] 停止 Admin 服务...
taskkill /FI "WINDOWTITLE eq Docms Admin*" /F 2>nul
if %errorlevel% equ 0 (
    echo [成功] Admin 服务已停止
) else (
    echo [信息] 未找到运行中的 Admin 服务
)

:: 清理node进程（备用方案）
echo.
echo [信息] 检查并清理可能残留的 Node.js 进程...

:: 获取API端口的进程（3000）
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3000 ^| findstr LISTENING') do (
    echo [信息] 发现占用端口3000的进程: %%a
    taskkill /F /PID %%a 2>nul
    if !errorlevel! equ 0 (
        echo [成功] 已终止进程 %%a
    )
)

:: 获取Admin端口的进程（5173开发模式 或 4173生产模式）
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5173 ^| findstr LISTENING') do (
    echo [信息] 发现占用端口5173的进程: %%a
    taskkill /F /PID %%a 2>nul
    if !errorlevel! equ 0 (
        echo [成功] 已终止进程 %%a
    )
)

for /f "tokens=5" %%a in ('netstat -aon ^| findstr :4173 ^| findstr LISTENING') do (
    echo [信息] 发现占用端口4173的进程: %%a
    taskkill /F /PID %%a 2>nul
    if !errorlevel! equ 0 (
        echo [成功] 已终止进程 %%a
    )
)

echo.
echo ========================================
echo [完成] 所有服务已停止
echo [DONE] All services stopped
echo ========================================
echo.

pause
