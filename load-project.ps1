# PowerShell script to load projects
param([string]$ProjectPath, [switch]$Clear, [switch]$List, [switch]$Help)

if ($Help -or (-not $ProjectPath -and -not $Clear -and -not $List)) {
    Write-Host "Load Project" -ForegroundColor Cyan
    Write-Host "Usage: ./load-project.ps1 PROJECT_PATH"
    Write-Host "Examples:"
    Write-Host "  ./load-project.ps1 'C:\dev\my-project'"
    Write-Host "  ./load-project.ps1 -Clear"
    Write-Host "  ./load-project.ps1 -List"
    exit 0
}

$containerId = docker-compose ps -q dev
if (-not $containerId) {
    Write-Host "ERROR: Container not running. Start with: docker-compose up -d" -ForegroundColor Red
    exit 1
}

if ($Clear) {
    Write-Host " Clearing /target..." -ForegroundColor Yellow
    docker exec -u root $containerId bash -c "rm -rf /target/* /target/.[^.]*"
    Write-Host " Cleared" -ForegroundColor Green
    exit 0
}

if ($List) {
    Write-Host " Target contents:" -ForegroundColor Cyan
    docker exec $containerId ls -la /target
    exit 0
}

if ($ProjectPath) {
    if (-not (Test-Path $ProjectPath)) {
        Write-Host " ERROR: Path not found: $ProjectPath" -ForegroundColor Red
        exit 1
    }
    
    Write-Host " Loading: $ProjectPath" -ForegroundColor Cyan
    docker exec -u root $containerId bash -c "rm -rf /target/* /target/.[^.]*"
    
    $copyResult = docker cp "$ProjectPath\." "${containerId}:/target/"
    if ($LASTEXITCODE -eq 0) {
        docker exec -u root $containerId chmod -R 755 /target
        docker exec -u root $containerId chown -R dev:dev /target
        $files = docker exec $containerId find /target -type f | Measure-Object | Select -ExpandProperty Count
        Write-Host " SUCCESS! Copied $files files" -ForegroundColor Green
        docker exec $containerId ls -la /target | Select -First 5
    } else {
        Write-Host " FAILED: $copyResult" -ForegroundColor Red
        exit 1
    }
}
