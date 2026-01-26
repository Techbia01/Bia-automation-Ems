@echo off
cd /d "%~dp0"
del .git\index.lock 2>nul
timeout /t 1 /nobreak >nul
git checkout mi-rama-del-ems
git add -A
git commit -m "Actualización: nuevos tests de widgets y notificaciones, mejoras en scripts y configuración"
git push origin mi-rama-del-ems
pause
