@echo off
echo ========================================
echo   SUBIENDO CAMBIOS A GITHUB
echo ========================================
echo.
echo IMPORTANTE: Ejecuta este archivo DESPUES de:
echo   1. Cerrar Cursor completamente
echo   2. Pausar OneDrive (clic derecho en icono -^> Pausar sincronizacion)
echo.
pause

cd /d "%~dp0"

echo.
echo Eliminando archivos de bloqueo...
del .git\index.lock 2>nul
del .git\config.lock 2>nul
timeout /t 2 /nobreak >nul

echo.
echo Cambiando a la rama mi-rama-del-ems...
git checkout mi-rama-del-ems
if errorlevel 1 (
    echo ERROR: No se pudo cambiar de rama
    pause
    exit /b 1
)

echo.
echo Agregando cambios...
git add -A
if errorlevel 1 (
    echo ERROR: No se pudieron agregar los cambios
    pause
    exit /b 1
)

echo.
echo Creando commit...
git commit -m "Actualización: nuevos tests de widgets y notificaciones, mejoras en scripts y configuración"
if errorlevel 1 (
    echo ERROR: No se pudo crear el commit
    pause
    exit /b 1
)

echo.
echo Subiendo cambios a GitHub...
git push origin mi-rama-del-ems
if errorlevel 1 (
    echo ERROR: No se pudieron subir los cambios
    pause
    exit /b 1
)

echo.
echo ========================================
echo   ¡CAMBIOS SUBIDOS EXITOSAMENTE!
echo ========================================
pause
