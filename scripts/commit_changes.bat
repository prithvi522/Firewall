@echo off
REM Helper script to commit current changes with a message
if "%1"=="" (
  echo Usage: commit_changes.bat "Commit message"
  exit /b 1
)

git add -A
git commit -m "%~1"
if %errorlevel% neq 0 (
  echo Commit failed. Review `git status` and try again.
  exit /b %errorlevel%
)

echo Committed changes.
*** End Patch