# PostgreSQL Local Setup for Development
# Run with: powershell -ExecutionPolicy Bypass -File setup-local-db.ps1

Write-Host ""
Write-Host "╔════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  PostgreSQL Local Setup for Development   ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Check Docker
Write-Host "[1/5] Checking Docker installation..." -ForegroundColor Yellow
try {
    $dockerVersion = docker --version
    Write-Host "✅ Docker is installed: $dockerVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker is not installed or not running" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please install Docker Desktop from:" -ForegroundColor Yellow
    Write-Host "https://www.docker.com/products/docker-desktop" -ForegroundColor Cyan
    Write-Host ""
    pause
    exit 1
}

# Clean up old container
Write-Host ""
Write-Host "[2/5] Stopping existing container (if any)..." -ForegroundColor Yellow
docker stop n8n-postgres 2>$null | Out-Null
docker rm n8n-postgres 2>$null | Out-Null
Write-Host "✅ Cleaned up old container" -ForegroundColor Green

# Create new container
Write-Host ""
Write-Host "[3/5] Creating new PostgreSQL container..." -ForegroundColor Yellow
$result = docker run --name n8n-postgres `
    -e POSTGRES_PASSWORD=localpass `
    -e POSTGRES_DB=n8n `
    -p 5432:5432 `
    -d postgres:15

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to create container" -ForegroundColor Red
    pause
    exit 1
}
Write-Host "✅ PostgreSQL container created" -ForegroundColor Green

# Wait for PostgreSQL
Write-Host ""
Write-Host "[4/5] Waiting for PostgreSQL to start (10 seconds)..." -ForegroundColor Yellow
Start-Sleep -Seconds 10
Write-Host "✅ PostgreSQL should be ready" -ForegroundColor Green

# Run schema scripts
Write-Host ""
Write-Host "[5/5] Running database schema scripts..." -ForegroundColor Yellow

# Copy scripts to container
docker cp scripts/create-all-missing-tables.sql n8n-postgres:/tmp/
docker cp scripts/insert-sample-data.sql n8n-postgres:/tmp/

# Execute scripts
Write-Host ""
Write-Host "Running create-all-missing-tables.sql..." -ForegroundColor Cyan
docker exec n8n-postgres psql -U postgres -d n8n -f /tmp/create-all-missing-tables.sql

Write-Host ""
Write-Host "Running insert-sample-data.sql..." -ForegroundColor Cyan
docker exec n8n-postgres psql -U postgres -d n8n -f /tmp/insert-sample-data.sql

# Success message
Write-Host ""
Write-Host "╔════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║         ✅ Setup Complete!                 ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""
Write-Host "📊 PostgreSQL is running on localhost:5432" -ForegroundColor Cyan
Write-Host "🗄️  Database: n8n" -ForegroundColor Cyan
Write-Host "👤 User: postgres" -ForegroundColor Cyan
Write-Host "🔑 Password: localpass" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Update your server/.env file with these credentials:" -ForegroundColor White
Write-Host ""
Write-Host "   DB_HOST=localhost" -ForegroundColor Gray
Write-Host "   DB_PORT=5432" -ForegroundColor Gray
Write-Host "   DB_NAME=n8n" -ForegroundColor Gray
Write-Host "   DB_USER=postgres" -ForegroundColor Gray
Write-Host "   DB_PASSWORD=localpass" -ForegroundColor Gray
Write-Host "   DB_SSL=false" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Restart your backend server" -ForegroundColor White
Write-Host ""
Write-Host "To stop the database: docker stop n8n-postgres" -ForegroundColor Yellow
Write-Host "To start it again: docker start n8n-postgres" -ForegroundColor Yellow
Write-Host ""
pause
