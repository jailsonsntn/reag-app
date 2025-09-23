param(
  [switch]$AutoImportExcel = $false
)

$ErrorActionPreference = 'Stop'

Write-Host '==============================='
Write-Host '  Reag App - Instalador Win'
Write-Host '==============================='

# Caminhos
$Root = Split-Path -Parent $MyInvocation.MyCommand.Path | Split-Path -Parent
$DataDir = Join-Path $Root 'data'
$StartRapido = Join-Path $Root 'StartRapido.cmd'
$StartServidor = Join-Path $Root 'StartServidor.cmd'
$Desktop = [Environment]::GetFolderPath('Desktop')

# 1) Verificar/instalar Node.js (orientado)
function Test-Node {
  try { node -v | Out-Null; return $true } catch { return $false }
}

if (-not (Test-Node)) {
  Write-Host 'Node.js nao encontrado. Abrindo pagina de download (LTS)...'
  Start-Process 'https://nodejs.org/en/download'
  Read-Host 'Instale o Node.js e pressione Enter para continuar'
  if (-not (Test-Node)) { throw 'Node.js ainda nao disponivel no PATH. Reinicie o terminal e execute novamente este instalador.' }
}

# 2) Pasta de dados
if (-not (Test-Path $DataDir)) { New-Item -ItemType Directory -Path $DataDir | Out-Null }

# 3) Instalar dependencias (se necessario)
Push-Location $Root
try {
  if (-not (Test-Path (Join-Path $Root 'node_modules'))) {
    if (Test-Path (Join-Path $Root 'package-lock.json')) {
      Write-Host 'Instalando dependencias (npm ci)...'
      npm ci
    } else {
      Write-Host 'Instalando dependencias (npm install)...'
      npm install
    }
  } else {
    Write-Host 'Dependencias ja instaladas. Pulando.'
  }
}
finally { Pop-Location }

# 4) Gerar cliente Prisma e criar DB se necessario
$env:DATABASE_URL = 'file:./data/reag.db'
Push-Location $Root
try {
  Write-Host 'Gerando cliente Prisma...'
  npx prisma generate | Out-Null
  Write-Host 'Aplicando schema ao banco (db push)...'
  npx prisma db push | Out-Null
}
finally { Pop-Location }

# 5) Importar Excel automaticamente (opcional)
$excel = $null
$xlsx = Join-Path $Root 'ReagendamentoForm2025.xlsx'
$xls = Join-Path $Root 'ReagendamentoForm2025.xls'
if (Test-Path $xlsx) { $excel = $xlsx } elseif (Test-Path $xls) { $excel = $xls }
if ($AutoImportExcel -and $excel) {
  Write-Host ("Importando Excel: {0}" -f $excel)
  Push-Location $Root
  try { npm run process-excel } finally { Pop-Location }
} else {
  if ($excel) { Write-Host 'Planilha detectada. Execute manualmente: npm run process-excel (opcional).'}
}

# 6) Criar atalhos na Area de Trabalho
function New-Shortcut($Path, $Target, $Arguments, $WorkingDirectory, $Description) {
  $WScript = New-Object -ComObject WScript.Shell
  $sc = $WScript.CreateShortcut($Path)
  $sc.TargetPath = $Target
  if ($Arguments) { $sc.Arguments = $Arguments }
  if ($WorkingDirectory) { $sc.WorkingDirectory = $WorkingDirectory }
  if ($Description) { $sc.Description = $Description }
  $sc.IconLocation = 'shell32.dll,0'
  $sc.Save()
}

$lnk1 = Join-Path $Desktop 'Reag App - Start Rapido.lnk'
$lnk2 = Join-Path $Desktop 'Reag App - Start (Producao).lnk'

New-Shortcut -Path $lnk1 -Target 'cmd.exe' -Arguments ("/c \"{0}\"" -f $StartRapido) -WorkingDirectory $Root -Description 'Inicia rapido em modo desenvolvimento'
New-Shortcut -Path $lnk2 -Target 'cmd.exe' -Arguments ("/c \"{0}\" --build" -f $StartServidor) -WorkingDirectory $Root -Description 'Build e inicia em producao'

Write-Host '---'
Write-Host 'Instalacao concluida.'
Write-Host ('Atalhos criados em: {0}' -f $Desktop)
Write-Host 'Para iniciar: use o atalho "Reag App - Start Rapido".'
