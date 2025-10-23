@echo off
echo ╔════════════════════════════════════════════╗
echo ║  PostgreSQL Local Setup for Development   ║
echo ╚════════════════════════════════════════════╝
echo.

echo [1/5] Checking Docker installation...
docker --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker is not installed or not running
    echo.
    echo Please install Docker Desktop from:
    echo https://www.docker.com/products/docker-desktop
    echo.
    pause
    exit /b 1
)
echo ✅ Docker is installed

echo.
echo [2/5] Stopping existing container (if any)...
docker stop n8n-postgres >nul 2>&1
docker rm n8n-postgres >nul 2>&1
echo ✅ Cleaned up old container

echo.
echo [3/5] Creating new PostgreSQL container...
docker run --name n8n-postgres -e POSTGRES_PASSWORD=localpass -e POSTGRES_DB=n8n -p 5432:5432 -d postgres:15
if errorlevel 1 (
    echo ❌ Failed to create container
    pause
    exit /b 1
)
echo ✅ PostgreSQL container created

echo.
echo [4/5] Waiting for PostgreSQL to start (10 seconds)...
timeout /t 10 /nobreak >nul
echo ✅ PostgreSQL should be ready

echo.
echo [5/5] Running database schema scripts...
docker cp scripts\create-all-missing-tables.sql n8n-postgres:/tmp/
docker cp scripts\insert-sample-data.sql n8n-postgres:/tmp/

docker exec n8n-postgres psql -U postgres -d n8n -f /tmp/create-all-missing-tables.sql
docker exec n8n-postgres psql -U postgres -d n8n -f /tmp/insert-sample-data.sql

echo.
echo ╔════════════════════════════════════════════╗
echo ║         ✅ Setup Complete!                 ║
echo ╚════════════════════════════════════════════╝
echo.
echo 📊 PostgreSQL is running on localhost:5432
echo 🗄️  Database: n8n
echo 👤 User: postgres
echo 🔑 Password: localpass
echo.
echo Next steps:
echo 1. Update your server/.env file with these credentials:
echo.
echo    DB_HOST=localhost
echo    DB_PORT=5432
echo    DB_NAME=n8n
echo    DB_USER=postgres
echo    DB_PASSWORD=localpass
echo    DB_SSL=false
echo.
echo 2. Restart your backend server
echo.
pause
