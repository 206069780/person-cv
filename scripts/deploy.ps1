# 一键构建并部署数字简历展馆（Docker Compose）
$ErrorActionPreference = "Stop"

$Root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
Set-Location $Root

$Port = if ($env:PORT) { $env:PORT } else { "8090" }

function Write-Info($msg) { Write-Host "[INFO] $msg" -ForegroundColor Cyan }
function Write-Ok($msg)   { Write-Host "[OK]   $msg" -ForegroundColor Green }
function Write-Warn($msg) { Write-Host "[WARN] $msg" -ForegroundColor Yellow }

if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    throw "未找到 docker，请先安装 Docker Desktop"
}

Write-Info "项目目录: $Root"

# 若为 Git 仓库且已安装 git，先拉取最新代码
if (Test-Path "$Root\.git" -PathType Container) {
    if (Get-Command git -ErrorAction SilentlyContinue) {
        Write-Info "拉取最新代码 (git pull)..."
        try {
            git pull
        } catch {
            Write-Warn "git pull 执行遇到警告，继续尝试构建..."
        }
    }
}

Write-Info "构建并启动容器..."
docker compose up -d --build
if ($LASTEXITCODE -ne 0) { throw "docker compose 执行失败" }

Write-Info "等待服务就绪..."
$ready = $false
for ($i = 1; $i -le 30; $i++) {
    try {
        $resp = Invoke-WebRequest -Uri "http://127.0.0.1:$Port/" -UseBasicParsing -TimeoutSec 3
        if ($resp.StatusCode -eq 200) {
            Write-Ok "服务已就绪 (http://127.0.0.1:$Port/)"
            $ready = $true
            break
        }
    } catch {
        Start-Sleep -Seconds 2
    }
}

if (-not $ready) {
    Write-Warn "健康检查超时，请查看日志: docker compose logs -f"
    exit 1
}

Write-Host ""
Write-Ok "部署完成"
Write-Host "  本地访问:  http://127.0.0.1:$Port/"
Write-Host "  PDF 下载:  http://127.0.0.1:$Port/resume/付道品-高级Java开发工程师.pdf"
Write-Host ""
Write-Host "常用命令:"
Write-Host "  docker compose ps"
Write-Host "  docker compose logs -f"
Write-Host "  docker compose down"
