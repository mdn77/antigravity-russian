# install_auto.ps1 — Автоматический установщик русификации Antigravity
# Скачивает нужные файлы с GitHub во временную папку и запускает установку.

$ErrorActionPreference = "Stop"

# Проверка наличия Node.js
try {
    $nodeVersion = node -v
    Write-Host "[RU] Найдена Node.js: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Error "[RU] ОШИБКА: Node.js не установлен! Установите Node.js (https://nodejs.org) перед запуском."
    exit 1
}

# Временная папка
$tempDir = Join-Path $env:TEMP "antigravity-russify-temp"
if (Test-Path $tempDir) {
    Remove-Item $tempDir -Recurse -Force | Out-Null
}
New-Item -ItemType Directory -Path $tempDir | Out-Null

$baseUrl = "https://raw.githubusercontent.com/mdn77/antigravity-russian/main"
$files = @("install.js", "russify.js")

Write-Host "[RU] Загрузка файлов установки..." -ForegroundColor Cyan
foreach ($file in $files) {
    $url = "$baseUrl/$file"
    $dest = Join-Path $tempDir $file
    Write-Host "  Скачивание $file..."
    Invoke-WebRequest -Uri $url -OutFile $dest -UseBasicParsing
}

Write-Host "[RU] Запуск процесса установки через Node.js..." -ForegroundColor Cyan
Push-Location $tempDir
try {
    node install.js
} finally {
    Pop-Location
    # Очистка
    Remove-Item $tempDir -Recurse -Force -ErrorAction SilentlyContinue
}
