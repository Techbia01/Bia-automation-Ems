# Script para subir cambios a GitHub
# Ejecutar desde PowerShell o Git Bash

Write-Host "=== Subiendo cambios a GitHub ===" -ForegroundColor Green

# Cambiar al directorio del proyecto
Set-Location $PSScriptRoot

# Intentar eliminar archivos de bloqueo
Write-Host "`nEliminando archivos de bloqueo..." -ForegroundColor Yellow
$maxAttempts = 5
$attempt = 0
while ($attempt -lt $maxAttempts) {
    $attempt++
    Remove-Item ".git\index.lock" -Force -ErrorAction SilentlyContinue
    Remove-Item ".git\config.lock" -Force -ErrorAction SilentlyContinue
    Start-Sleep -Milliseconds 500
    
    if (-not (Test-Path ".git\index.lock") -and -not (Test-Path ".git\config.lock")) {
        Write-Host "Archivos de bloqueo eliminados exitosamente" -ForegroundColor Green
        break
    }
    Write-Host "Intento $attempt de $maxAttempts..." -ForegroundColor Yellow
}

if ((Test-Path ".git\index.lock") -or (Test-Path ".git\config.lock")) {
    Write-Host "`nERROR: No se pudieron eliminar los archivos de bloqueo." -ForegroundColor Red
    Write-Host "Por favor:" -ForegroundColor Yellow
    Write-Host "1. Cierra completamente Cursor" -ForegroundColor Yellow
    Write-Host "2. Pausa OneDrive temporalmente (clic derecho en el icono -> Pausar sincronización)" -ForegroundColor Yellow
    Write-Host "3. Ejecuta este script nuevamente" -ForegroundColor Yellow
    exit 1
}

# Cambiar a la rama correcta
Write-Host "`nCambiando a la rama mi-rama-del-ems..." -ForegroundColor Yellow
git checkout mi-rama-del-ems
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR al cambiar de rama" -ForegroundColor Red
    exit 1
}

# Agregar todos los cambios
Write-Host "`nAgregando cambios..." -ForegroundColor Yellow
git add -A
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR al agregar cambios" -ForegroundColor Red
    exit 1
}

# Hacer commit
Write-Host "`nCreando commit..." -ForegroundColor Yellow
git commit -m "Actualización: nuevos tests de widgets y notificaciones, mejoras en scripts y configuración"
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR al crear commit" -ForegroundColor Red
    exit 1
}

# Hacer push
Write-Host "`nSubiendo cambios a GitHub..." -ForegroundColor Yellow
git push origin mi-rama-del-ems
if ($LASTEXITCODE -eq 0) {
    Write-Host "`n=== ¡Cambios subidos exitosamente! ===" -ForegroundColor Green
} else {
    Write-Host "`nERROR al subir cambios" -ForegroundColor Red
    exit 1
}
