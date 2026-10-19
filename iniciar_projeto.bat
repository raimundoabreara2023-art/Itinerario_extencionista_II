@echo off

start cmd /k "pnpm.cmd dev"

timeout /t 5 /nobreak > nul

start http://localhost:5173