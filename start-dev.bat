@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

echo ========================================
echo  Docms 开发模式启动脚本
echo  Docms Development Mode Startup
echo ========================================
echo.

:: ========================================
:: 0. 停止现有服务
:: ========================================
echo ========================================
echo [步骤 0/3] 停止现有服务
echo [Step 0/3] Stopping Existing Services
echo ========================================
echo.

echo [信息] 正在停止现有的 Docms 服务...
echo [INFO] Stopping existing Docms services...
echo.

:: 停止API服务
taskkill /FI "WINDOWTITLE eq Docms API*" /F 2>nul

:: 停止Admin服务
taskkill /FI "WINDOWTITLE eq Docms Admin*" /F 2>nul

:: 清理端口占用
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3000 ^| findstr LISTENING 2^>nul') do (
    taskkill /F /PID %%a 2>nul
)

for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5173 ^| findstr LISTENING 2^>nul') do (
    taskkill /F /PID %%a 2>nul
)

echo [成功] 现有服务已停止
echo [SUCCESS] Existing services stopped
echo.

:: 检查Node.js是否安装
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [错误] 未检测到Node.js，请先安装Node.js
    echo [ERROR] Node.js not found, please install Node.js first
    pause
    exit /b 1
)

echo [信息] Node.js 版本:
node --version
echo.

:: 检查npm是否安装
where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo [错误] 未检测到npm，请先安装npm
    echo [ERROR] npm not found, please install npm first
    pause
    exit /b 1
)

echo [信息] npm 版本:
npm --version
echo.

:: ========================================
:: 1. 安装依赖
:: ========================================
echo ========================================
echo [步骤 1/4] 检查并安装依赖
echo [Step 1/4] Checking and Installing Dependencies
echo ========================================

:: API 依赖
echo [信息] 检查 API 依赖...
cd api
if not exist "node_modules\" (
    echo [信息] 安装 API 依赖...
    call npm install
    if %errorlevel% neq 0 (
        echo [错误] API 依赖安装失败
        echo [ERROR] API dependencies installation failed
        pause
        exit /b 1
    )
) else (
    echo [信息] API 依赖已存在
)

echo.
echo [信息] 生成 Prisma Client...
call npm run prisma:generate
if %errorlevel% neq 0 (
    echo [错误] Prisma Client 生成失败
    echo [ERROR] Prisma Client generation failed
    pause
    exit /b 1
)

cd ..

:: Admin 依赖
echo.
echo [信息] 检查 Admin 依赖...
cd admin
if not exist "node_modules\" (
    echo [信息] 安装 Admin 依赖...
    call npm install
    if %errorlevel% neq 0 (
        echo [错误] Admin 依赖安装失败
        echo [ERROR] Admin dependencies installation failed
        pause
        exit /b 1
    )
) else (
    echo [信息] Admin 依赖已存在
)
cd ..

echo.
echo [成功] 依赖检查完成
echo [SUCCESS] Dependencies check completed
echo.

:: ========================================
:: 2. 启动开发服务
:: ========================================
echo ========================================
echo [步骤 2/4] 启动开发服务
echo [Step 2/4] Starting Development Services
echo ========================================
echo.

echo [信息] 在新窗口中启动 API 开发服务（热重载）...
echo [INFO] Starting API dev server (hot reload) in new window...
start "Docms API Dev Server" cmd /k "cd /d %~dp0api && echo ================================ && echo  Docms API Dev Server && echo  开发模式 (热重载) && echo  运行在: http://localhost:3000 && echo  API文档: http://localhost:3000/api && echo ================================ && echo. && npm run start:dev"

:: 等待3秒让API启动
timeout /t 3 /nobreak >nul

echo [信息] 在新窗口中启动 Admin 开发服务（热重载）...
echo [INFO] Starting Admin dev server (hot reload) in new window...
start "Docms Admin Dev Server" cmd /k "cd /d %~dp0admin && echo ================================ && echo  Docms Admin Dev Server && echo  开发模式 (热重载) && echo  运行在: http://localhost:5173 && echo ================================ && echo. && npm run dev"

echo.
echo ========================================
echo [步骤 3/4] 启动完成
echo [Step 3/4] Startup Complete
echo ========================================
echo.
echo [成功] 所有开发服务已启动！
echo [SUCCESS] All development services started!
echo.
echo 开发服务信息 / Development Service Info:
echo --------------------------------
echo API Server:   http://localhost:3000
echo API Docs:     http://localhost:3000/api
echo Admin Panel:  http://localhost:5173
echo --------------------------------
echo.
echo [特性] Features:
echo - 热重载 / Hot Reload Enabled
echo - 自动重启 / Auto Restart Enabled
echo - 源码监听 / Source Watch Enabled
echo.
echo [提示] 请等待几秒钟让服务完全启动
echo [TIP] Please wait a few seconds for services to fully start
echo.
echo [提示] 关闭此窗口不会停止服务，请关闭各服务窗口来停止
echo [TIP] Closing this window won't stop services, close service windows to stop
echo.
echo [提示] 开发模式下修改代码会自动重新加载
echo [TIP] Code changes will auto-reload in development mode
echo.

pause
