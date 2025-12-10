# Script per configurar la base de dades local PostgreSQL
$env:PGPASSWORD = "Disbauxa2001"
$psql = "C:\Program Files\PostgreSQL\18\bin\psql.exe"

Write-Host "Verificant connexió a PostgreSQL..." -ForegroundColor Cyan

# Comprovar si la base de dades ja existeix
$dbExists = & $psql -U postgres -lqt | Select-String -Pattern "fantasy_betting"

if ($dbExists) {
    Write-Host "La base de dades 'fantasy_betting' ja existeix!" -ForegroundColor Yellow
    $response = Read-Host "Vols esborrar-la i crear-la de nou? (s/n)"
    if ($response -eq "s") {
        Write-Host "Esborrant base de dades existent..." -ForegroundColor Yellow
        & $psql -U postgres -c "DROP DATABASE fantasy_betting;"
        Write-Host "Creant nova base de dades..." -ForegroundColor Green
        & $psql -U postgres -c "CREATE DATABASE fantasy_betting;"
    }
} else {
    Write-Host "Creant base de dades 'fantasy_betting'..." -ForegroundColor Green
    & $psql -U postgres -c "CREATE DATABASE fantasy_betting;"
}

Write-Host ""
Write-Host "✅ Base de dades configurada correctament!" -ForegroundColor Green
Write-Host ""
Write-Host "Pots iniciar el servidor amb: npm start" -ForegroundColor Cyan

# Netejar variable d'entorn
Remove-Item Env:\PGPASSWORD
