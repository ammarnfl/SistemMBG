# scripts/inject-uat-env.ps1
# Set backend BACKEND_URL = URL backend-tunnel, supaya FOTO yang diunggah saat
# sesi UAT (upload.service membuat URL `${BACKEND_URL}/uploads/...`) bisa diakses
# dari perangkat responden.
#
# PENTING: env FRONTEND TIDAK diubah. NEXT_PUBLIC_BACKEND_URL sengaja dibiarkan
# `http://localhost:3001` karena semua API di-proxy server-side oleh Next.js
# (route /api/proxy & /api/auth/login) yang berjalan di PC ini — mengarahkannya
# ke URL tunnel justru membuat login gagal bila tunnel mati/belum di-restart.
$ErrorActionPreference = 'Stop'
$root    = Split-Path -Parent $PSScriptRoot
$urlFile = Join-Path $root '.uat-tunnel-urls'

if (-not (Test-Path $urlFile)) {
  Write-Host "ERROR: .uat-tunnel-urls tidak ada. Jalankan 'npm run tunnel:uat' dulu." -ForegroundColor Red
  exit 1
}
$vals = @{}
Get-Content $urlFile | ForEach-Object { if ($_ -match '^(\w+)=(.+)$') { $vals[$matches[1]] = $matches[2].Trim() } }
$backendUrl = $vals['BACKEND_URL']
if (-not $backendUrl) { Write-Host "ERROR: BACKEND_URL tidak ada di $urlFile" -ForegroundColor Red; exit 1 }

$beEnv = Join-Path $root 'backend\.env'
Copy-Item $beEnv "$beEnv.bak" -Force
$be = Get-Content $beEnv
$be = if ($be -match '^BACKEND_URL=') { $be -replace '^BACKEND_URL=.*', "BACKEND_URL=$backendUrl" } else { $be + "BACKEND_URL=$backendUrl" }
$be | Set-Content $beEnv -Encoding utf8

Write-Host "OK backend/.env : BACKEND_URL -> $backendUrl  (untuk URL foto upload)" -ForegroundColor Green
Write-Host "   frontend TIDAK diubah (NEXT_PUBLIC_BACKEND_URL tetap localhost:3001)" -ForegroundColor DarkGray
Write-Host "OK Backup: backend/.env.bak" -ForegroundColor Green
Write-Host "-> Restart BACKEND saja agar env baru terbaca (frontend tidak perlu)." -ForegroundColor Yellow
