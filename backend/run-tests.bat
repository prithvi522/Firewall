@echo off
REM Run lightweight integration tests against a live backend on port 5000
python tests\test_scan_samples.py
if %ERRORLEVEL% equ 0 (
  echo Tests passed
) else (
  echo Tests failed with exit code %ERRORLEVEL%
)
pause
