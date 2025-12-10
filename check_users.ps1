$env:PGPASSWORD = "Disbauxa2001"
$psql = "C:\Program Files\PostgreSQL\18\bin\psql.exe"

Write-Host "=== TOTS ELS USUARIS ===" -ForegroundColor Cyan
Write-Host ""

$query = "SELECT id, username, coins, is_admin, created_at FROM users;"
& $psql -U postgres -d fantasy_betting -c $query

Remove-Item Env:\PGPASSWORD
