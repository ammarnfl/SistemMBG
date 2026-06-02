# scripts/start-uat-tunnel.ps1
# Membuka 2 quick-tunnel cloudflared (frontend :3000 & backend :3001),
# menampilkan URL publik, menyimpannya ke .uat-tunnel-urls, lalu tetap
# berjalan sampai Ctrl+C (kemudian menutup tunnel & menghapus file sementara).
$ErrorActionPreference = 'Stop'
$root    = Split-Path -Parent $PSScriptRoot
$urlFile = Join-Path $root '.uat-tunnel-urls'

# Cari cloudflared. Terminal yang dibuka SEBELUM install belum punya cloudflared
# di PATH-nya, jadi jangan hanya andalkan Get-Command: refresh PATH dari registry
# (Machine+User) lalu cek lokasi install standar sebagai fallback.
function Resolve-Cloudflared {
  $cmd = Get-Command cloudflared -ErrorAction SilentlyContinue
  if ($cmd) { return $cmd.Source }
  $env:Path = [Environment]::GetEnvironmentVariable('Path','Machine') + ';' +
              [Environment]::GetEnvironmentVariable('Path','User')
  $cmd = Get-Command cloudflared -ErrorAction SilentlyContinue
  if ($cmd) { return $cmd.Source }
  $candidates = @(
    "$env:ProgramFiles\cloudflared\cloudflared.exe",
    "${env:ProgramFiles(x86)}\cloudflared\cloudflared.exe",
    "$env:LOCALAPPDATA\Microsoft\WinGet\Links\cloudflared.exe"
  )
  foreach ($c in $candidates) { if (Test-Path $c) { return $c } }
  return $null
}

$cf = Resolve-Cloudflared
if (-not $cf) {
  Write-Host "ERROR: cloudflared belum terpasang (atau tidak ditemukan)." -ForegroundColor Red
  Write-Host "  Install: winget install --id Cloudflare.cloudflared" -ForegroundColor Yellow
  Write-Host "  Jika baru saja install, TUTUP terminal ini dan buka yang baru." -ForegroundColor Yellow
  exit 1
}

$feLog = Join-Path $env:TEMP 'uat-tunnel-fe.err'
$beLog = Join-Path $env:TEMP 'uat-tunnel-be.err'
Remove-Item $feLog, $beLog -ErrorAction SilentlyContinue

Write-Host "Memulai tunnel cloudflared (frontend :3000, backend :3001)..." -ForegroundColor Cyan
$fe = Start-Process $cf -ArgumentList 'tunnel','--no-autoupdate','--url','http://localhost:3000' `
        -RedirectStandardError $feLog -RedirectStandardOutput "$feLog.out" -PassThru -NoNewWindow
$be = Start-Process $cf -ArgumentList 'tunnel','--no-autoupdate','--url','http://localhost:3001' `
        -RedirectStandardError $beLog -RedirectStandardOutput "$beLog.out" -PassThru -NoNewWindow

function Wait-Url($log) {
  $deadline = (Get-Date).AddSeconds(45)
  while ((Get-Date) -lt $deadline) {
    if (Test-Path $log) {
      $m = Select-String -Path $log -Pattern 'https://[a-z0-9-]+\.trycloudflare\.com' -ErrorAction SilentlyContinue | Select-Object -First 1
      if ($m) { return $m.Matches[0].Value }
    }
    Start-Sleep -Milliseconds 700
  }
  return $null
}

$feUrl = Wait-Url $feLog
$beUrl = Wait-Url $beLog
if (-not $feUrl -or -not $beUrl) {
  Write-Host "ERROR: Gagal mendapatkan URL tunnel (timeout). Cek $feLog / $beLog" -ForegroundColor Red
  Stop-Process -Id $fe.Id, $be.Id -ErrorAction SilentlyContinue
  exit 1
}

"BACKEND_URL=$beUrl`r`nFRONTEND_URL=$feUrl" | Set-Content -Path $urlFile -Encoding utf8

Write-Host ""
Write-Host "============================================" -ForegroundColor Green
Write-Host " UAT TUNNEL READY"                            -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Green
Write-Host " FRONTEND  -> $feUrl"
Write-Host " BACKEND   -> $beUrl"
Write-Host "============================================" -ForegroundColor Green
Write-Host " Langkah selanjutnya:"
Write-Host "   1. npm run env:uat   (set BACKEND_URL backend = URL tunnel, utk foto upload)"
Write-Host "   2. Restart BACKEND : cd backend ; npm run start:dev   (FRONTEND tidak perlu)"
Write-Host "   3. Test dari HP (matikan WiFi, pakai data seluler)"
Write-Host "   4. Kalau OK, share URL FRONTEND ke responden"
Write-Host "============================================" -ForegroundColor Green
Write-Host " (Biarkan jendela ini terbuka. Ctrl+C untuk berhenti.)" -ForegroundColor DarkGray

try {
  Wait-Process -Id $fe.Id, $be.Id
} finally {
  Write-Host "`nMenutup tunnel & membersihkan..." -ForegroundColor Cyan
  Stop-Process -Id $fe.Id, $be.Id -ErrorAction SilentlyContinue
  Remove-Item $urlFile, $feLog, $beLog, "$feLog.out", "$beLog.out" -ErrorAction SilentlyContinue
  Write-Host "Tunnel dihentikan." -ForegroundColor Green
}
