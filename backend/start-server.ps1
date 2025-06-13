# Kill any process using port 3001
$processId = (Get-NetTCPConnection -LocalPort 3001 -ErrorAction SilentlyContinue).OwningProcess
if ($processId) {
    Write-Host "Killing process $processId that is using port 3001..."
    Stop-Process -Id $processId -Force
    Start-Sleep -Seconds 2
}

# Start the server
Write-Host "Starting server..."
npm run dev 