@echo off
setlocal enableextensions
cd /d "%~dp0"

echo ===============================
echo   Reag App - Instalador

echo ===============================

:: Requer PowerShell para criar atalhos e instalar deps
where powershell >nul 2>nul || (
  echo PowerShell nao encontrado. Aborte.
  pause
  exit /b 1
)

echo Executando script de instalacao...
powershell -NoProfile -ExecutionPolicy Bypass -File "scripts\install-windows.ps1"
if errorlevel 1 (
  echo.
  echo Falha na instalacao.
  pause
  exit /b 1
)

echo.
echo Concluido. Pressione qualquer tecla para sair.
pause >nul
exit /b 0
