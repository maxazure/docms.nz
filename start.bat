@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

echo ========================================
echo  Docms 一键启动脚本
echo  Docms One-Click Startup Script
echo ========================================
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
:: 1. API 构建
:: ========================================
echo ========================================
echo [步骤 1/4] 编译 API
echo [Step 1/4] Building API
echo ========================================
cd api

echo [信息] 检查 API 依赖...
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

echo.
echo [信息] 编译 API...
call npm run build
if %errorlevel% neq 0 (
    echo [错误] API 编译失败
    echo [ERROR] API build failed
    pause
    exit /b 1
)

echo [成功] API 编译完成
echo [SUCCESS] API build completed
cd ..
echo.

:: ========================================
:: 2. Admin 构建
:: ========================================
echo ========================================
echo [步骤 2/4] 编译 Admin
echo [Step 2/4] Building Admin
echo ========================================
cd admin

echo [信息] 检查 Admin 依赖...
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

echo.
echo [信息] 编译 Admin...
call npm run build
if %errorlevel% neq 0 (
    echo [错误] Admin 编译失败
    echo [ERROR] Admin build failed
    pause
    exit /b 1
)

echo [成功] Admin 编译完成
echo [SUCCESS] Admin build completed
cd ..
echo.

:: ========================================
:: 3. 启动服务
:: ========================================
echo ========================================
echo [步骤 3/4] 启动服务
echo [Step 3/4] Starting Services
echo ========================================
echo.

echo [信息] 在新窗口中启动 API 服务...
echo [INFO] Starting API service in new window...
start "Docms API Server" cmd /k "cd /d %~dp0api && echo ================================ && echo  Docms API Server && echo  运行在: http://localhost:3000 && echo  API文档: http://localhost:3000/api && echo ================================ && echo. && npm run start:prod"

:: 等待2秒让API启动
timeout /t 2 /nobreak >nul

echo [信息] 在新窗口中启动 Admin 服务...
echo [INFO] Starting Admin service in new window...
start "Docms Admin Panel" cmd /k "cd /d %~dp0admin && echo ================================ && echo  Docms Admin Panel && echo  运行在: http://localhost:4173 && echo ================================ && echo. && npm run preview"

echo.
echo ========================================
echo [步骤 4/4] 启动完成
echo [Step 4/4] Startup Complete
echo ========================================
echo.
echo [成功] 所有服务已启动！
echo [SUCCESS] All services started!
echo.
echo 服务信息 / Service Info:
echo --------------------------------
echo API Server:   http://localhost:3000
echo API Docs:     http://localhost:3000/api
echo Admin Panel:  http://localhost:4173
echo --------------------------------
echo.
echo [提示] 请等待几秒钟让服务完全启动
echo [TIP] Please wait a few seconds for services to fully start
echo.
echo [提示] 关闭此窗口不会停止服务，请关闭各服务窗口来停止
echo [TIP] Closing this window won't stop services, close service windows to stop
echo.

pause
