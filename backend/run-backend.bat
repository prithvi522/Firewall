@echo off
setlocal

cd /d "%~dp0"

REM Usage: run-backend.bat [port]
setlocal
set PORT=%1
if "%PORT%"=="" set PORT=5000

REM Kill any process listening on the selected port to avoid bind errors
for /f "tokens=5" %%a in ('netstat -a -n -o ^| findstr ":%PORT%" ^| findstr LISTENING') do (
    echo Terminating process listening on port %PORT%: PID=%%a
    taskkill /PID %%a /F >nul 2>&1
)

REM Export APP_PORT for the Python process to pick up
set APP_PORT=%PORT%

if exist ".venv\Scripts\python.exe" (
    ".venv\Scripts\python.exe" app\main.py
) else (
    python app\main.py
)

endlocal

endlocal