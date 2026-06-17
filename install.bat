@echo off
setlocal

echo ======================================
echo     TrackSim CLI Windows Installer    
echo ======================================

:: Check for Node.js
where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo [!] Node.js is not installed.
    echo Attempting to install Node.js automatically using winget...
    
    where winget >nul 2>nul
    if %ERRORLEVEL% neq 0 (
        echo [!] 'winget' is not available on this system.
        echo Please download and install Node.js manually from https://nodejs.org/
        pause
        exit /b 1
    )
    
    winget install --id OpenJS.NodeJS -e --accept-source-agreements --accept-package-agreements
    
    :: Refresh environment variables for the current session (basic workaround)
    :: A full terminal restart might be required if Node isn't immediately in PATH
    echo Please note: If Node.js was just installed, you may need to restart this window.
)

:: Re-check for Node.js just in case
where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo [!] Node.js is still not found in PATH.
    echo Please restart this window or install Node.js manually from https://nodejs.org/
    pause
    exit /b 1
)

echo [OK] Node.js is installed.

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

echo Installing project dependencies using pnpm...
call pnpm install
if %ERRORLEVEL% neq 0 (
    echo [!] Failed to install dependencies.
    pause
    exit /b 1
)

echo.
echo Which game do you want to install TrackSim for?
echo 1) Euro Truck Simulator 2 (ETS2)
echo 2) American Truck Simulator (ATS)
echo.

choice /c 12 /m "Enter your choice:"

if %ERRORLEVEL% equ 1 set game=ets2
if %ERRORLEVEL% equ 2 set game=ats

echo.
echo Running TrackSim installation for %game%...
node index.js install %game%

echo.
pause
