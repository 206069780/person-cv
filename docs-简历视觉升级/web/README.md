# 付道品数字简历展馆

## 本地运行

```powershell
npm install
npm run dev
```

## 生产构建

```powershell
npm run build
npm run preview -- --host 0.0.0.0 --port 4173
```

## Docker 部署

```powershell
docker build -t fu-daopin-resume .
docker run --rm -p 8080:80 fu-daopin-resume
```

浏览器访问 `http://localhost:8080/`。最终 PDF 位于 `public/resume/付道品-高级Java开发工程师.pdf`，构建后可通过 `/resume/付道品-高级Java开发工程师.pdf` 下载。

桌面端以程序化 PBR 几何呈现设备、协议、GIS/DMA、OA/HR、Agent、WeLink 与水厂展区，项目规模统一为国内外 `10w+` 水站。手机端会先提示使用电脑端获取完整体验，随后进入内容完整的纵向简历；桌面端 WebGL 不可用时自动使用同一降级页面。
