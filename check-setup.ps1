# CodeIt Setup Verification Script
Write-Host "CodeIt Setup Verification" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Check Node.js
Write-Host "Checking Node.js..." -ForegroundColor Yellow
$nodeVersion = node --version
Write-Host "OK Node.js installed: $nodeVersion" -ForegroundColor Green

# Check npm
Write-Host ""
Write-Host "Checking npm..." -ForegroundColor Yellow
$npmVersion = npm --version
Write-Host "OK npm installed: v$npmVersion" -ForegroundColor Green

# Check Backend dependencies
Write-Host ""
Write-Host "Checking Backend dependencies..." -ForegroundColor Yellow
if (Test-Path ".\backend\node_modules") {
    Write-Host "OK Backend dependencies installed" -ForegroundColor Green
} else {
    Write-Host "ERROR Backend dependencies not installed" -ForegroundColor Red
}

# Check Frontend dependencies
Write-Host ""
Write-Host "Checking Frontend dependencies..." -ForegroundColor Yellow
if (Test-Path ".\frontend\node_modules") {
    Write-Host "OK Frontend dependencies installed" -ForegroundColor Green
} else {
    Write-Host "ERROR Frontend dependencies not installed" -ForegroundColor Red
}

# Check Backend .env
Write-Host ""
Write-Host "Checking Backend environment file..." -ForegroundColor Yellow
if (Test-Path ".\backend\.env") {
    Write-Host "OK Backend .env file exists" -ForegroundColor Green
    
    $envContent = Get-Content ".\backend\.env" -Raw
    
    if ($envContent -match "<username>") {
        Write-Host "WARNING MongoDB URI needs configuration" -ForegroundColor Yellow
    }
    
    if ($envContent -match "your_gemini_api_key_here") {
        Write-Host "WARNING Gemini API key needs configuration" -ForegroundColor Yellow
    }
} else {
    Write-Host "ERROR Backend .env file missing" -ForegroundColor Red
}

# Check Frontend .env
Write-Host ""
Write-Host "Checking Frontend environment file..." -ForegroundColor Yellow
if (Test-Path ".\frontend\.env") {
    Write-Host "OK Frontend .env file exists" -ForegroundColor Green
} else {
    Write-Host "ERROR Frontend .env file missing" -ForegroundColor Red
}

# Check ports
Write-Host ""
Write-Host "Checking port availability..." -ForegroundColor Yellow
$port5000 = Get-NetTCPConnection -LocalPort 5000 -ErrorAction SilentlyContinue
if ($port5000) {
    Write-Host "WARNING Port 5000 is already in use" -ForegroundColor Yellow
} else {
    Write-Host "OK Port 5000 is available" -ForegroundColor Green
}

$port5173 = Get-NetTCPConnection -LocalPort 5173 -ErrorAction SilentlyContinue
if ($port5173) {
    Write-Host "WARNING Port 5173 is already in use" -ForegroundColor Yellow
} else {
    Write-Host "OK Port 5173 is available" -ForegroundColor Green
}

# Summary
Write-Host ""
Write-Host "================================" -ForegroundColor Cyan
Write-Host "Summary" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor White
Write-Host "1. Configure backend/.env with your API keys" -ForegroundColor White
Write-Host "   - MongoDB Atlas connection string" -ForegroundColor White
Write-Host "   - Google Gemini API key" -ForegroundColor White
Write-Host ""
Write-Host "2. Start the backend server:" -ForegroundColor White
Write-Host "   cd backend" -ForegroundColor Gray
Write-Host "   npm run dev" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Start the frontend server (in another terminal):" -ForegroundColor White
Write-Host "   cd frontend" -ForegroundColor Gray
Write-Host "   npm run dev" -ForegroundColor Gray
Write-Host ""
Write-Host "4. Open http://localhost:5173 in your browser" -ForegroundColor White
Write-Host ""
Write-Host "Check SETUP_CHECKLIST.md for detailed instructions" -ForegroundColor Cyan
