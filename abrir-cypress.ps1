# Script para abrir Cypress
Set-Location "C:\Users\User\OneDrive\Desktop\EMS"

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "Abriendo Cypress..." -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Ejecutar Cypress directamente desde node_modules/.bin
& ".\node_modules\.bin\cypress.cmd" open
