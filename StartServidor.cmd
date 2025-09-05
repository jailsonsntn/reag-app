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
echo Processamento opcional do Excel (se o arquivo existir)...
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

echo.
echo Limpando build anterior...
if exist ".next" (
  rmdir /s /q ".next"
)

echo Compilando a aplicacao...
call npm run build
if errorlevel 1 (
  echo.
  echo Falha na compilacao.
  pause
  exit /b 1
)

echo.
echo Encerrando servidor anterior (porta 3000), se houver...
for /f "tokens=5" %%p in ('netstat -ano ^| findstr :3000 ^| findstr LISTENING') do (
  echo Encerrando PID %%p...
  taskkill /F /PID %%p >nul 2>nul
)

echo Iniciando servidor em nova janela...
start "Reag App" cmd /k "set DATABASE_URL=%DATABASE_URL% && npm run start"

echo Aguardando servidor subir em http://localhost:3000 ...
set "WAIT_SECS=60"
set /a "_i=0"
:__wait_loop
rem Testa com PowerShell (Invoke-WebRequest)
powershell -NoProfile -Command "try{(Invoke-WebRequest -UseBasicParsing -Uri 'http://localhost:3000').StatusCode}catch{exit 1}" >nul 2>nul
if not errorlevel 1 goto __server_up
set /a "_i+=1"
if %_i% geq %WAIT_SECS% goto __server_fail
timeout /t 1 /nobreak >nul
goto __wait_loop

:__server_up
echo.
echo Servidor disponivel. Abrindo o navegador...
start "" "http://localhost:3000"
goto __end

:__server_fail
echo.
echo Nao foi possivel detectar o servidor na porta 3000 apos %WAIT_SECS% segundos.
echo Verifique a janela "Reag App" para erros e tente novamente.

:__end
echo.
echo Pressione qualquer tecla para sair...
pause >nul
exit /b 0
