@echo off
setlocal enableextensions enabledelayedexpansion
cd /d "%~dp0"

echo ===============================
echo   Reag App - Start Rapido
echo ===============================

:: Checa Node
where node >nul 2>nul || (
  echo Node.js nao encontrado. Instale a versao LTS em https://nodejs.org/en/download
  start "" "https://nodejs.org/en/download"
  pause
  exit /b 1
)

:: Variáveis de ambiente essenciais
set "DATABASE_URL=file:./data/reag.db"
set "NEXT_TELEMETRY_DISABLED=1"

if not exist "data" mkdir "data"

:: Instala dependencias se necessário (rápido quando já instaladas)
if not exist "node_modules" (
  echo Instalando dependencias ^(primeira vez^)...
  npm ci || npm install || (
    echo Falha ao instalar dependencias.
    pause & exit /b 1
  )
)

:: Garantir que a porta 3000 esteja livre para evitar prompt de troca de porta
echo Encerrando servidor anterior (porta 3000), se houver...
for /f "tokens=5" %%p in ('netstat -ano ^| findstr :3000 ^| findstr LISTENING') do (
  echo Encerrando PID %%p...
  taskkill /F /PID %%p >nul 2>nul
)

:: Start em modo desenvolvimento (sem rebuild, sem prisma push, sem processar Excel)
echo Iniciando servidor de desenvolvimento (porta 3000)...
start "Reag App (DEV)" cmd /k "set DATABASE_URL=%DATABASE_URL% && npm run dev -- -p 3000"

echo Abrindo o navegador assim que responder...
set "WAIT_SECS=45"
set /a _i=0
:wait
powershell -NoProfile -Command "try{(Invoke-WebRequest -UseBasicParsing -Uri 'http://localhost:3000').StatusCode}catch{exit 1}" >nul 2>nul
if not errorlevel 1 goto up
set /a _i+=1
if %_i% geq %WAIT_SECS% goto fail
timeout /t 1 /nobreak >nul
goto wait
:up
start "" "http://localhost:3000"
goto end
:fail
echo Nao foi possivel detectar o servidor apos %WAIT_SECS%s. Verifique a janela.
:end
exit /b 0
