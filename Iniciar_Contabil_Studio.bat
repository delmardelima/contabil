@echo off
title Contabil Studio Pro - Windows 11
echo ====================================================
echo   Iniciando Contabil Studio Pro (Windows 11 Local)
echo ====================================================
cd /d "%~dp0"
echo Abrindo servidor local e interface moderna...
start "" http://localhost:5173
call npm run dev
pause
