$env:PGPASSWORD = "Disbauxa2001"
$psql = "C:\Program Files\PostgreSQL\18\bin\psql.exe"

Write-Host "=== PASSWORD DE L'USUARI ===" -ForegroundColor Cyan
Write-Host ""

$query = "SELECT username, password FROM users WHERE username = 'ESQUADRA VILASECA';"
& $psql -U postgres -d fantasy_betting -c $query

Remove-Item Env:\PGPASSWORD
