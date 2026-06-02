# scripts/restore-uat-env.ps1
$ErrorActionPreference = 'Stop'
$root  = Split-Path -Parent $PSScriptRoot
$feEnv = Join-Path $root 'frontend\.env.local'
$beEnv = Join-Path $root 'backend\.env'

if (Test-Path "$feEnv.bak") { Move-Item "$feEnv.bak" $feEnv -Force; Write-Host "OK frontend/.env.local dipulihkan" -ForegroundColor Green }
else { Write-Host ".. frontend/.env.local.bak tidak ada (lewati)" -ForegroundColor DarkGray }
if (Test-Path "$beEnv.bak") { Move-Item "$beEnv.bak" $beEnv -Force; Write-Host "OK backend/.env dipulihkan" -ForegroundColor Green }
else { Write-Host ".. backend/.env.bak tidak ada (lewati)" -ForegroundColor DarkGray }

Remove-Item (Join-Path $root '.uat-tunnel-urls') -ErrorAction SilentlyContinue
Write-Host "OK ENV restored. Tunnel env cleared." -ForegroundColor Green
Write-Host "-> Restart BACKEND & FRONTEND untuk kembali ke localhost." -ForegroundColor Yellow
