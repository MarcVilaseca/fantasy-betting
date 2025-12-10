$env:PGPASSWORD = "Disbauxa2001"
$psql = "C:\Program Files\PostgreSQL\18\bin\psql.exe"

Write-Host "=== USUARI ADMIN ===" -ForegroundColor Cyan
Write-Host ""

$query = "SELECT username, coins, is_admin, created_at FROM users WHERE is_admin = true;"
& $psql -U postgres -d fantasy_betting -c $query

Remove-Item Env:\PGPASSWORD
