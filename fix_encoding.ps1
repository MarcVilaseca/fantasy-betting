$files = @(
    "frontend\src\components\BetSlip.jsx",
    "frontend\src\pages\Leaderboard.jsx",
    "frontend\src\pages\Admin.jsx"
)

foreach ($file in $files) {
    Write-Host "Fixing $file..."
    $content = Get-Content $file -Raw -Encoding UTF8

    $content = $content -creplace 'vÃ lida', 'vàlida'
    $content = $content -creplace 'comenÃ§ar', 'començar'
    $content = $content -creplace 'RÃ nking', 'Rànking'
    $content = $content -creplace 'perÃ²', 'però'
    $content = $content -creplace 'accÃ©s', 'accés'
    $content = $content -creplace 'ð.*°', '💰'

    $Utf8NoBomEncoding = New-Object System.Text.UTF8Encoding $False
    [System.IO.File]::WriteAllText("$PWD\$file", $content, $Utf8NoBomEncoding)
}

Write-Host "Done!"
