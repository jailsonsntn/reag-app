@echo off
setlocal enableextensions enabledelayedexpansion
cd /d "%~dp0"

echo ===============================
echo   Reag App - Servidor (Windows)
echo ===============================

:: Verifica Node.js
where node >nul 2>nul
if errorlevel 1 (
  echo.
  echo Node.js nao encontrado. Instale a versao LTS:
  echo   https://nodejs.org/en/download
  start "" "https://nodejs.org/en/download"
  pause
  exit /b 1
)

:: Define caminho do banco de dados relativo a esta pasta
set "DATABASE_URL=file:./data/reag.db"

if not exist "data" (
  mkdir "data"
)

:: Instala dependencias na primeira execucao
if not exist "node_modules" (
  echo.
  echo Instalando dependencias. Aguarde...
  npm install
  if errorlevel 1 (
    echo.
    echo Falha ao instalar dependencias.
    pause
    exit /b 1
  )
)

echo.
echo Sincronizando banco de dados...
call npx prisma generate
call npx prisma db push
if errorlevel 1 (
  echo.
  echo Falha ao sincronizar o banco de dados.
  pause
  exit /b 1
)

echo.
echo Compilando a aplicacao...
call npm run build
if errorlevel 1 (
  echo.
  echo Falha na compilacao.
  pause
  exit /b 1
)

echo.
echo Iniciando servidor em nova janela...
start "Reag App" cmd /c "set DATABASE_URL=%DATABASE_URL% && npm run start"

echo Abrindo o navegador...
timeout /t 4 /nobreak >nul
start "" "http://localhost:3000"

echo.
echo Servidor iniciado. Esta janela pode ser fechada.
exit /b 0
