@echo off
setlocal

echo ======================================
echo    TrackSim CLI Windows Uninstaller   
echo ======================================

:: Check for Node.js
where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo [!] Node.js is not installed. TrackSim CLI requires Node.js.
    echo Please install Node.js manually from https://nodejs.org/
    pause
    exit /b 1
)

:: Check for pnpm
where pnpm >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo [!] pnpm is not installed. Installing pnpm globally...
    call npm install -g pnpm
    if %ERRORLEVEL% neq 0 (
        echo [!] Failed to install pnpm.
        pause
        exit /b 1
    )
)

echo Ensuring project dependencies are installed using pnpm...
call pnpm install
if %ERRORLEVEL% neq 0 (
    echo [!] Failed to install dependencies.
    pause
    exit /b 1
)

echo.
echo Which game do you want to uninstall TrackSim for?
echo 1) Euro Truck Simulator 2 (ETS2)
echo 2) American Truck Simulator (ATS)
echo.

choice /c 12 /m "Enter your choice:"

if %ERRORLEVEL% equ 1 set game=ets2
if %ERRORLEVEL% equ 2 set game=ats

echo.
echo Running TrackSim uninstallation for %game%...
node index.js uninstall %game%

echo.
pause
