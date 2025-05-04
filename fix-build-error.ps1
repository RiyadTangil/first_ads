Write-Host "Fixing Next.js build error..." -ForegroundColor Green

# Stop any Node.js processes that may be locking files
Write-Host "Stopping Node.js processes..." -ForegroundColor Yellow
Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue

# Wait a moment for processes to stop
Start-Sleep -Seconds 2

# Remove the .next directory
Write-Host "Removing .next directory..." -ForegroundColor Yellow
if (Test-Path ".next") {
    try {
        # Make sure the files are not read-only
        Get-ChildItem -Path ".next" -Recurse | 
            Where-Object { -not $_.PSIsContainer } | 
            ForEach-Object { $_.IsReadOnly = $false }
        
        # Try to remove the directory
        Remove-Item -Path ".next" -Recurse -Force -ErrorAction Stop
    } catch {
        Write-Host "Could not remove .next folder completely. Trying alternate method..." -ForegroundColor Red
        
        # If directly removing doesn't work, try to use cmd.exe to remove it
        cmd /c "rmdir /s /q .next"
    }
}

# Create the directory structure with proper permissions
Write-Host "Creating new .next directory structure..." -ForegroundColor Yellow
New-Item -Path ".next" -ItemType Directory -Force | Out-Null
New-Item -Path ".next\trace" -ItemType Directory -Force | Out-Null

# Fix the permissions
Write-Host "Setting permissions..." -ForegroundColor Yellow
icacls ".next" /grant "${env:USERNAME}:(OI)(CI)F" /T

Write-Host "Done! Now try running 'npm run build' again." -ForegroundColor Green 