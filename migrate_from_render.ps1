# Script per migrar dades des de Render a la base de dades local
$env:PGPASSWORD = "Or68jeGSQEbNcatWndEVZsLrSygyiqGR"
$psql = "C:\Program Files\PostgreSQL\18\bin\psql.exe"
$pgdump = "C:\Program Files\PostgreSQL\18\bin\pg_dump.exe"

$renderUrl = "postgresql://fantasy_betting_db_user:Or68jeGSQEbNcatWndEVZsLrSygyiqGR@dpg-d4shvrmmcj7s73c0oll0-a.frankfurt-postgres.render.com/fantasy_betting_db"

Write-Host "=== MIGRACIO DE DADES DES DE RENDER ===" -ForegroundColor Cyan
Write-Host ""

# Crear arxiu de backup temporal
$timestamp = Get-Date -Format 'yyyyMMdd_HHmmss'
$backupFile = "render_backup_$timestamp.sql"

Write-Host "1. Exportant dades des de Render..." -ForegroundColor Yellow
& $pgdump $renderUrl --no-owner --no-acl -f $backupFile

if ($LASTEXITCODE -ne 0) {
    Write-Host "Error en exportar dades des de Render" -ForegroundColor Red
    Remove-Item Env:\PGPASSWORD
    exit 1
}

Write-Host "Dades exportades correctament a $backupFile" -ForegroundColor Green
Write-Host ""

# Canviar password per la local
$env:PGPASSWORD = "Disbauxa2001"

Write-Host "2. Important dades a la base de dades local..." -ForegroundColor Yellow

# Esborrar base de dades local i recrear-la
$dropCmd = "DROP DATABASE IF EXISTS fantasy_betting;"
$createCmd = "CREATE DATABASE fantasy_betting;"

& $psql -U postgres -c $dropCmd
& $psql -U postgres -c $createCmd

# Importar dades
& $psql -U postgres -d fantasy_betting -f $backupFile

if ($LASTEXITCODE -ne 0) {
    Write-Host "Error en importar dades" -ForegroundColor Red
    Remove-Item Env:\PGPASSWORD
    exit 1
}

Write-Host "Dades importades correctament!" -ForegroundColor Green
Write-Host ""

# Verificar dades
Write-Host "3. Verificant dades importades..." -ForegroundColor Yellow
$countUsersCmd = "SELECT COUNT(*) FROM users;"
$countMatchesCmd = "SELECT COUNT(*) FROM matches;"

$userCount = & $psql -U postgres -d fantasy_betting -t -c $countUsersCmd
$matchCount = & $psql -U postgres -d fantasy_betting -t -c $countMatchesCmd

Write-Host "   Usuaris: $($userCount.Trim())" -ForegroundColor Cyan
Write-Host "   Partits: $($matchCount.Trim())" -ForegroundColor Cyan
Write-Host ""

Write-Host "MIGRACIO COMPLETADA!" -ForegroundColor Green
Write-Host ""
Write-Host "El backup s'ha desat a: $backupFile" -ForegroundColor Gray
Write-Host ""

# Netejar variable d'entorn
Remove-Item Env:\PGPASSWORD
