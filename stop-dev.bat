@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

echo ========================================
echo  Docms 开发服务停止脚本
echo  Docms Development Services Stop
echo ========================================
echo.

echo [信息] 正在停止所有 Docms 开发服务...
echo [INFO] Stopping all Docms development services...
echo.

:: 停止API服务窗口
echo [信息] 停止 API Server...
taskkill /FI "WINDOWTITLE eq Docms API*" /F 2>nul
if %errorlevel% equ 0 (
    echo [成功] API Server 窗口已关闭
) else (
    echo [信息] 未找到 API Server 窗口
)

:: 停止Admin服务窗口
echo [信息] 停止 Admin Server...
taskkill /FI "WINDOWTITLE eq Docms Admin*" /F 2>nul
if %errorlevel% equ 0 (
    echo [成功] Admin Server 窗口已关闭
) else (
    echo [信息] 未找到 Admin Server 窗口
)

:: 清理3000端口占用
echo [信息] 清理端口 3000...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3000 ^| findstr LISTENING 2^>nul') do (
    echo [信息] 结束进程 PID: %%a
    taskkill /F /PID %%a 2>nul
)

:: 清理5173端口占用
echo [信息] 清理端口 5173...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5173 ^| findstr LISTENING 2^>nul') do (
    echo [信息] 结束进程 PID: %%a
    taskkill /F /PID %%a 2>nul
)

echo.
echo ========================================
echo [完成] 所有服务已停止
echo [DONE] All services stopped
echo ========================================
echo.

pause
