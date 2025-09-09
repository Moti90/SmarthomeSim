@echo off
echo ========================================
echo    Smarthome Project GitHub Upload
echo ========================================
echo.

REM Check if git is installed
git --version >nul 2>&1
if %errorlevel% neq 0 (
    echo FEJL: Git er ikke installeret!
    echo Download Git fra: https://git-scm.com/downloads
    pause
    exit /b 1
)

echo Git er installeret - fortsætter...
echo.

REM Initialize git repository if not already done
if not exist ".git" (
    echo Initialiserer Git repository...
    git init
    echo.
)

REM Add all files
echo Tilføjer alle filer til Git...
git add .

REM Commit changes
echo.
echo Committer ændringer...
git commit -m "Initial commit: Smarthome application with E-Learning, Advanced Mode, and multiple themes"

REM Get repository URL from user
echo.
echo ========================================
echo    GitHub Repository Setup
echo ========================================
echo.
set /p REPO_URL="Indtast din GitHub repository URL (fx: https://github.com/brugernavn/repository-navn.git): "

if "%REPO_URL%"=="" (
    echo FEJL: Ingen repository URL indtastet!
    pause
    exit /b 1
)

REM Add remote origin
echo.
echo Tilføjer remote origin...
git remote add origin %REPO_URL% 2>nul
if %errorlevel% neq 0 (
    echo Opdaterer eksisterende remote origin...
    git remote set-url origin %REPO_URL%
)

REM Push to GitHub
echo.
echo Uploader til GitHub...
git branch -M main
git push -u origin main

if %errorlevel% equ 0 (
    echo.
    echo ========================================
    echo    SUCCESS!
    echo ========================================
    echo Dit Smarthome projekt er nu uploadet til GitHub!
    echo Repository: %REPO_URL%
    echo.
) else (
    echo.
    echo ========================================
    echo    FEJL!
    echo ========================================
    echo Der opstod en fejl under upload. Prøv igen.
    echo.
)

echo Tryk på en vilkårlig tast for at afslutte...
pause >nul
