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
set "NEXT_TELEMETRY_DISABLED=1"

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

set "DO_DB_SYNC=%1"
if /i "%DO_DB_SYNC%"=="--db" (
  echo.
  echo Sincronizando banco de dados (forcado por --db)...
  call npx prisma generate
  call npx prisma db push
  if errorlevel 1 (
    echo.
    echo Falha ao sincronizar o banco de dados.
    pause
    exit /b 1
  )
 ) else (
  echo.
  echo Pulando sincronizacao do banco (use --db para forcar).
)

set "DO_EXCEL=%2"
if /i "%DO_EXCEL%"=="--excel" (
  echo.
  echo Processamento opcional do Excel (forcado por --excel)...
  set "EXCEL_FILE="
  if exist "ReagendamentoForm2025.xlsx" set "EXCEL_FILE=ReagendamentoForm2025.xlsx"
  if not defined EXCEL_FILE if exist "ReagendamentoForm2025.xls" set "EXCEL_FILE=ReagendamentoForm2025.xls"

  if defined EXCEL_FILE (
    echo Processando Excel: %EXCEL_FILE% ...
    call npm run process-excel
    if errorlevel 1 (
      rem Evitar parenteses em mensagens dentro de blocos
      echo Aviso: falha ao processar Excel - prosseguindo mesmo assim...
    )
  ) else (
    echo Nenhum arquivo de Excel encontrado. Pulando processamento.
  )
) else (
  echo.
  echo Pulando processamento de Excel (use --excel para forcar).
)

set "DO_BUILD=%3"
if /i "%DO_BUILD%"=="--build" (
  echo.
  echo Limpando build anterior e compilando (forcado por --build)...
  if exist ".next" rmdir /s /q ".next"
  call npm run build
  if errorlevel 1 (
    echo.
    echo Falha na compilacao.
    pause
    exit /b 1
  )
) else (
  echo.
  echo Pulando build (use --build para forcar). Usando build existente se houver, senao dev server.
)

echo.
echo Encerrando servidor anterior (porta 3000), se houver...
for /f "tokens=5" %%p in ('netstat -ano ^| findstr :3000 ^| findstr LISTENING') do (
  echo Encerrando PID %%p...
  taskkill /F /PID %%p >nul 2>nul
)

echo Iniciando servidor nesta janela...
set "LAUNCH_CMD=npm run dev"
if /i "%DO_BUILD%"=="--build" set "LAUNCH_CMD=npm run start"

rem Abrir navegador em processo separado quando o servidor responder
start "Abrir navegador" powershell -NoProfile -Command "for($i=0;$i -lt 60;$i++){try{ if((Invoke-WebRequest -UseBasicParsing -Uri 'http://localhost:3000').StatusCode -eq 200){ Start-Process 'http://localhost:3000'; break } }catch{}; Start-Sleep -Seconds 1 }"

rem Exporta variavel e inicia servidor no mesmo console
set DATABASE_URL=%DATABASE_URL%
%LAUNCH_CMD%

echo.
echo Servidor finalizado. Pressione qualquer tecla para fechar...
pause >nul
exit /b 0
