@echo off
title Contabil Studio Pro - Windows 11 Desktop
echo ====================================================
echo   Contabil Studio Pro - ERP Desktop (Windows 11)
echo ====================================================
cd /d "%~dp0"

if exist "src-tauri\target\release\contabil-studio-pro.exe" (
    echo Iniciando executavel nativo compilado (Release)...
    start "" "src-tauri\target\release\contabil-studio-pro.exe"
    exit /b 0
)

if exist "src-tauri\target\release\Contabil Studio Pro.exe" (
    echo Iniciando executavel nativo compilado (Release)...
    start "" "src-tauri\target\release\Contabil Studio Pro.exe"
    exit /b 0
)

echo Executavel de release nao localizado. Iniciando ambiente Tauri Desktop...
call npm run tauri:dev
pause
