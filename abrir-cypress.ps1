# Script para abrir Cypress desde el directorio correcto
Set-Location "C:\Users\User\OneDrive\Desktop\EMS"

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "Abriendo Cypress desde el directorio correcto" -ForegroundColor Cyan
Write-Host "Directorio: $(Get-Location)" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Verificar que existe cypress.config.js
if (Test-Path "cypress.config.js") {
    Write-Host "✅ cypress.config.js encontrado" -ForegroundColor Green
} else {
    Write-Host "❌ ERROR: cypress.config.js no encontrado" -ForegroundColor Red
    exit 1
}

# Verificar que existe la carpeta cypress/e2e
if (Test-Path "cypress\e2e") {
    Write-Host "✅ Carpeta cypress\e2e encontrada" -ForegroundColor Green
    
    # Contar archivos de prueba
    $archivos = Get-ChildItem "cypress\e2e" -Recurse -Filter "*.cy.js"
    Write-Host "✅ Archivos de prueba encontrados: $($archivos.Count)" -ForegroundColor Green
    Write-Host ""
} else {
    Write-Host "❌ ERROR: Carpeta cypress\e2e no encontrada" -ForegroundColor Red
    exit 1
}

# Limpiar caché de Cypress si existe
if (Test-Path "cypress\.cache") {
    Write-Host "🧹 Limpiando caché de Cypress..." -ForegroundColor Yellow
    Remove-Item -Recurse -Force "cypress\.cache" -ErrorAction SilentlyContinue
}

Write-Host ""
Write-Host "🚀 Iniciando Cypress..." -ForegroundColor Cyan
Write-Host ""

# Ejecutar Cypress
npm run test:open

