@echo off
cd /d "%~dp0"
echo ================================================
echo Abriendo Cypress...
echo ================================================
echo.
call npm run test:open
pause
