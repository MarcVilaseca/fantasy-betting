$env:PGPASSWORD = "Disbauxa2001"
$psql = "C:\Program Files\PostgreSQL\18\bin\psql.exe"

Write-Host "=== ACTUALITZANT PERMISOS D'ADMIN ===" -ForegroundColor Cyan
Write-Host ""

$query = "UPDATE users SET is_admin = true WHERE username = 'ESQUADRA VILASECA';"
& $psql -U postgres -d fantasy_betting -c $query

Write-Host "Verificant canvis..." -ForegroundColor Yellow
$checkQuery = "SELECT username, is_admin FROM users WHERE username = 'ESQUADRA VILASECA';"
& $psql -U postgres -d fantasy_betting -c $checkQuery

Write-Host ""
Write-Host "Admin activat correctament!" -ForegroundColor Green

Remove-Item Env:\PGPASSWORD
