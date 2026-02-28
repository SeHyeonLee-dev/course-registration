@echo off
setlocal

cd /d "%~dp0\.."

git config core.hooksPath .githooks
if errorlevel 1 (
  echo Failed to set core.hooksPath. Make sure Git is installed and this is a Git repository.
  exit /b 1
)

echo Configured git hooks path: .githooks
if exist ".githooks\commit-msg" (
  echo Note: If you use Git Bash, you can run "chmod +x .githooks/commit-msg" once.
)
echo Done. Commit messages will now be validated by .githooks/commit-msg

endlocal
