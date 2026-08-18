# 付道品 - 高级 Java 开发工程师简历包

## 目录说明

- `付道品-高级Java开发工程师.pdf`：10 页正式投递版，可搜索文本。
- `付道品-高级Java开发工程师.docx`：可编辑 Word 版本。
- `web/`：电影级数字孪生简历展馆源码、预构建文件与部署配置。
- `tools/generate_resume.py`：从 `web/src/data/resume-data.json` 同源生成 DOCX/PDF 的脚本。
- `docker-compose.yml`：服务器一键构建和启动配置。

## Docker 部署

在本目录执行：

```powershell
docker compose up -d --build
```

浏览器访问 `http://服务器地址:8090/`。如服务器已有反向代理（如 NPM），可将域名转发到本机 `8090` 端口。

## 静态部署

`web/dist/` 是已构建的纯静态站点，可直接上传到 Nginx、对象存储或静态托管平台。Nginx 需将未知路由回退到 `index.html`，示例配置见 `web/nginx.conf`。

## 本地开发

```powershell
cd web
npm install
npm run dev
```

桌面端提供工业数字孪生 3D 展馆、WASD/鼠标探索和展项热点，覆盖设备、协议、GIS/DMA、OA/HR、Agent、WeLink 与森格水厂链路；核心项目规模统一为国内外 `10w+` 水站。手机端先提示使用电脑端获取最佳体验，确认后进入完整纵向简历。WebGL 不可用时自动降级为纵向简历。

PDF 下载地址为 `/resume/付道品-高级Java开发工程师.pdf`。
