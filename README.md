# 付道品 - 高级 Java 开发工程师简历包

个人在线简历与数字孪生展馆，包含可投递 PDF/Word、3D 交互站点及 Docker 一键部署配置。

**在线访问：** [http://cv.bookfree.online](http://cv.bookfree.online)

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

## 目录说明

| 路径 | 说明 |
|------|------|
| `付道品-高级Java开发工程师.pdf` | 7 页正式投递版，可搜索文本 |
| `付道品-高级Java开发工程师.docx` | 可编辑 Word 版本 |
| `web/` | 数字孪生简历展馆源码、构建产物与部署配置 |
| `web/public/` | 静态资源（PDF、域名验证文件等），构建时复制到站点根目录 |
| `web/src/data/resume-data.json` | 简历单一数据源 |
| `tools/generate_resume.py` | 从 JSON 同源生成 DOCX/PDF |
| `scripts/deploy.sh` | Linux/macOS 一键 Docker 部署 |
| `scripts/deploy.ps1` | Windows 一键 Docker 部署 |
| `docker-compose.yml` | 服务器一键构建与启动 |

## 技术栈

- **前端：** React 19 + TypeScript + Vite 7
- **3D：** Three.js + React Three Fiber + GSAP
- **部署：** Nginx（容器内）+ Docker Compose
- **反向代理：** Nginx Proxy Manager（可选）

## 本地开发

```powershell
cd web
npm install
npm run dev
```

桌面端提供工业数字孪生 3D 展馆（WASD/鼠标探索、展项热点），覆盖设备、协议、GIS/DMA、OA/HR、Agent、WeLink 与森格水厂链路；核心项目规模统一为国内外 `10w+` 水站。手机端先提示使用电脑端获取最佳体验，确认后进入完整纵向简历；WebGL 不可用时自动降级为纵向简历。

PDF 下载地址：`/resume/付道品-高级Java开发工程师.pdf`

## Docker 部署

### 一键部署（推荐）

**Linux / macOS / 服务器：**

```bash
chmod +x scripts/deploy.sh
./scripts/deploy.sh
```

**Windows（PowerShell）：**

```powershell
.\scripts\deploy.ps1
```

脚本会自动执行 `docker compose up -d --build`、等待 `8090` 端口就绪，并在检测到本机 NPM 时尝试将容器加入同一 Docker 网络。

### 手动部署

在项目根目录执行：

```powershell
docker compose up -d --build
```

| 项目 | 值 |
|------|-----|
| 容器内端口 | `80` |
| 宿主机映射 | `8090` |
| 本地验证 | `http://localhost:8090/` |
| 服务器直连 | `http://服务器IP:8090/` |

常用运维命令：

```powershell
docker compose ps          # 查看状态
docker compose logs -f     # 查看日志
docker compose down        # 停止并移除容器
docker compose up -d --build   # 更新代码后重新构建
```

## Nginx Proxy Manager 反向代理

若 NPM 与 Docker **在同一台服务器**，推荐如下配置（**不要用 `127.0.0.1`**，NPM 在容器内时它指向 NPM 自身）：

| 字段 | 值 |
|------|-----|
| Domain Names | `cv.bookfree.online` |
| Scheme | `http` |
| Forward Hostname / IP | `172.17.0.1` |
| Forward Port | `8090` |

访问：`http://cv.bookfree.online/`（无需加 `:8090`）

**常见踩坑：**

| Forward 地址 | 结果 |
|-------------|------|
| `127.0.0.1:8090` | 502（NPM 容器内连不到宿主机） |
| `175.24.228.48:8090` | 504 超时（容器内走公网回连不稳定） |
| `172.17.0.1:8090` | 正常 |

若上述方式不通，可将简历容器加入 NPM 同一 Docker 网络，Forward 填容器名 `person-cv-resume-museum-1`、端口 `80`。

## DNS 配置

在域名服务商（如 DNSPod）为 `bookfree.online` 添加：

| 主机记录 | 类型 | 记录值 |
|---------|------|--------|
| `cv` | A | 服务器公网 IP |

生效后 `cv.bookfree.online` 解析到该 IP。`web/public/` 下的域名验证文件会在构建时自动部署到站点根目录。

## 静态部署

`web/dist/` 为已构建的纯静态站点，可上传到 Nginx、对象存储或静态托管平台。Nginx 需将未知路由回退到 `index.html`，示例配置见 `web/nginx.conf`。

```powershell
cd web
npm run build
```

## 重新生成 PDF / Word

修改 `web/src/data/resume-data.json` 后：

```powershell
python tools/generate_resume.py
```

会同步更新根目录下的 `.pdf` 与 `.docx`，并将 PDF 复制到 `web/public/resume/` 供站点下载。

## 开源协议

本项目采用 [MIT License](LICENSE) 开源。

| 范围 | 说明 |
|------|------|
| **源代码** | 可自由使用、修改、分发，需保留版权与许可声明 |
| **简历内容** | `resume-data.json`、PDF、Word 中的个人经历与表述版权归作者所有；Fork 作模板使用时请替换为你的个人信息 |
| **第三方依赖** | 见 `web/package.json`，各依赖遵循其自身开源协议（如 React/Three.js 等多为 MIT） |

```text
Copyright (c) 2026 付道品
Licensed under the MIT License
```

如需基于本项目搭建自己的数字简历，欢迎 Fork；发布衍生作品时请注明原项目出处即可。
