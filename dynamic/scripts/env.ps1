# Usage (PowerShell, inside dynamic/):  . .\scripts\env.ps1
# Puts the project-local Node first on PATH for this shell only; closing the shell undoes it.
# Keep this file ASCII-only: Windows PowerShell 5.1 reads BOM-less files as ANSI.
$node = Join-Path (Split-Path -Parent $PSScriptRoot) '.node'
if (-not (Test-Path "$node\node.exe")) {
  Write-Host "No .node folder. Run .\scripts\setup-node.ps1 first." -ForegroundColor Yellow
  return
}
$env:PATH = "$node;$env:PATH"
Write-Host "Using project-local Node $(node -v) / npm $(npm -v)" -ForegroundColor Green
