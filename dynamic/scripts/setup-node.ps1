# Creates a project-local Node.js in dynamic/.node (no global install).
# Version comes from .node-version; the download is checked against the official SHASUMS256.
# Keep this file ASCII-only: Windows PowerShell 5.1 reads BOM-less files as ANSI.
$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$ver = (Get-Content "$root\.node-version" -Raw).Trim()
$name = "node-v$ver-win-x64"
$dst = Join-Path $root '.node'

if (Test-Path "$dst\node.exe") {
  $have = (& "$dst\node.exe" -v).TrimStart('v')
  if ($have -eq $ver) { Write-Host "Node $ver already in place: $dst"; exit 0 }
}

$tmp = Join-Path ([IO.Path]::GetTempPath()) "node-setup-$([guid]::NewGuid())"
New-Item -ItemType Directory -Path $tmp | Out-Null
try {
  Invoke-WebRequest -UseBasicParsing "https://nodejs.org/dist/v$ver/$name.zip" -OutFile "$tmp\node.zip"
  Invoke-WebRequest -UseBasicParsing "https://nodejs.org/dist/v$ver/SHASUMS256.txt" -OutFile "$tmp\sums.txt"
  $expected = (Select-String -Path "$tmp\sums.txt" -Pattern "$name.zip$").Line.Split(' ')[0]
  $actual = (Get-FileHash "$tmp\node.zip" -Algorithm SHA256).Hash.ToLower()
  if ($expected -ne $actual) { throw "SHA256 mismatch: expected $expected, actual $actual" }
  Expand-Archive "$tmp\node.zip" -DestinationPath "$tmp\x" -Force
  if (Test-Path $dst) { Remove-Item $dst -Recurse -Force }
  Move-Item "$tmp\x\$name" $dst
  Write-Host "Node $ver installed to $dst"
} finally {
  Remove-Item $tmp -Recurse -Force -ErrorAction SilentlyContinue
}
