export interface ProfileHologramContent {
  name: string;
  title: string;
  experience: string;
}

/**
 * 用 HTML5 Canvas 动态绘制极高分辨率的赛博全息个人 Profile 与架构主看板 (1024x560 高性能版)
 */
export function createProfileHologramCanvas(
  content: ProfileHologramContent,
  coverImage?: HTMLImageElement | null,
): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 560;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  // 背景：深邃赛博金属渐变与网格
  const grad = ctx.createLinearGradient(0, 0, 1024, 560);
  grad.addColorStop(0, '#040d12');
  grad.addColorStop(0.5, '#071820');
  grad.addColorStop(1, '#051117');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // 赛博网格背景
  ctx.strokeStyle = 'rgba(40, 215, 229, 0.07)';
  ctx.lineWidth = 1;
  const gridSize = 24;
  for (let x = 0; x < canvas.width; x += gridSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }
  for (let y = 0; y < canvas.height; y += gridSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }

  // 四角赛博裁切瞄准角标
  ctx.strokeStyle = '#28d7e5';
  ctx.lineWidth = 2.5;
  const bracketSize = 20;
  const pad = 12;
  // 左上
  ctx.beginPath();
  ctx.moveTo(pad, pad + bracketSize);
  ctx.lineTo(pad, pad);
  ctx.lineTo(pad + bracketSize, pad);
  ctx.stroke();
  // 右上
  ctx.beginPath();
  ctx.moveTo(canvas.width - pad - bracketSize, pad);
  ctx.lineTo(canvas.width - pad, pad);
  ctx.lineTo(canvas.width - pad, pad + bracketSize);
  ctx.stroke();
  // 左下
  ctx.beginPath();
  ctx.moveTo(pad, canvas.height - pad - bracketSize);
  ctx.lineTo(pad, canvas.height - pad);
  ctx.lineTo(pad + bracketSize, canvas.height - pad);
  ctx.stroke();
  // 右下
  ctx.beginPath();
  ctx.moveTo(canvas.width - pad - bracketSize, canvas.height - pad);
  ctx.lineTo(canvas.width - pad, canvas.height - pad);
  ctx.lineTo(canvas.width - pad, canvas.height - pad - bracketSize);
  ctx.stroke();

  // 顶部状态栏
  ctx.fillStyle = 'rgba(40, 215, 229, 0.12)';
  ctx.fillRect(pad + 6, pad + 6, canvas.width - (pad + 6) * 2, 26);
  ctx.fillStyle = '#28d7e5';
  ctx.font = 'bold 12px "IBM Plex Mono", Consolas, monospace';
  ctx.fillText('/// SYS.STATUS: LIVE 24/7 · NEURAL BACKEND ARCHITECTURE DISPLAY · NODE: 0x7F001', 28, 30);
  ctx.fillStyle = '#ff6b3d';
  ctx.fillText('● 100,000+ WATER STATIONS ONLINE', canvas.width - 260, 30);

  // 左侧：如果有简历封面图，绘制带霓虹框的图片；否则绘制赛博形象/徽标
  const picX = 40;
  const picY = 60;
  const picW = 290;
  const picH = 410;

  ctx.fillStyle = '#0a1a22';
  ctx.fillRect(picX, picY, picW, picH);

  if (coverImage && coverImage.complete && coverImage.naturalWidth > 0) {
    ctx.drawImage(coverImage, picX + 4, picY + 4, picW - 8, picH - 8);
    // 扫描线滤镜
    ctx.fillStyle = 'rgba(40, 215, 229, 0.04)';
    for (let sy = picY; sy < picY + picH; sy += 4) {
      ctx.fillRect(picX, sy, picW, 1);
    }
  } else {
    // 动态绘制极客头像徽章
    const avatarGrad = ctx.createRadialGradient(picX + picW / 2, picY + picH / 2, 20, picX + picW / 2, picY + picH / 2, 140);
    avatarGrad.addColorStop(0, '#133e45');
    avatarGrad.addColorStop(1, '#061318');
    ctx.fillStyle = avatarGrad;
    ctx.fillRect(picX, picY, picW, picH);

    ctx.strokeStyle = '#28d7e5';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(picX + 20, picY + 30, picW - 40, picH - 60);

    ctx.fillStyle = '#28d7e5';
    ctx.font = 'bold 32px "IBM Plex Mono", Consolas, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('F D P', picX + picW / 2, picY + 140);
    ctx.font = 'bold 14px "IBM Plex Mono", Consolas, sans-serif';
    ctx.fillText('FU DAO PIN', picX + picW / 2, picY + 175);
    ctx.fillStyle = '#83a8b4';
    ctx.font = '10px "IBM Plex Mono", Consolas, sans-serif';
    ctx.fillText('SENIOR JAVA ARCHITECT', picX + picW / 2, picY + 200);
    ctx.fillText('AIoT · GIS · AGENT · DATA LAKE', picX + picW / 2, picY + 220);

    // 绘制装饰电路环
    ctx.strokeStyle = 'rgba(255, 107, 61, 0.6)';
    ctx.beginPath();
    ctx.arc(picX + picW / 2, picY + picH / 2 + 60, 55, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = '#28d7e5';
    ctx.beginPath();
    ctx.arc(picX + picW / 2, picY + picH / 2 + 60, 45, 0, Math.PI * 1.5);
    ctx.stroke();
    ctx.textAlign = 'left';
  }

  // 霓虹框线
  ctx.strokeStyle = '#28d7e5';
  ctx.lineWidth = 2;
  ctx.strokeRect(picX, picY, picW, picH);
  ctx.strokeStyle = '#ff6b3d';
  ctx.lineWidth = 1;
  ctx.strokeRect(picX - 3, picY - 3, picW + 6, picH + 6);

  // 右侧核心信息面板
  const infoX = 360;
  const infoY = 65;

  // 姓名与职位主标题
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 38px "PingFang SC", "Microsoft YaHei", sans-serif';
  ctx.fillText(content.name, infoX, infoY + 32);

  ctx.fillStyle = '#28d7e5';
  ctx.font = 'bold 18px "IBM Plex Mono", Consolas, sans-serif';
  ctx.fillText(`${content.title}  |  ${content.experience}`, infoX + 150, infoY + 24);

  ctx.fillStyle = '#83a8b4';
  ctx.font = '12px "IBM Plex Mono", Consolas, sans-serif';
  ctx.fillText('CORE VALUES: 高并发 · AIoT 空间计算 · 双路数据湖 · 智能体微服务中台', infoX, infoY + 60);

  // 分割装饰光带
  ctx.fillStyle = '#28d7e5';
  ctx.fillRect(infoX, infoY + 72, 610, 2);
  ctx.fillStyle = '#ff6b3d';
  ctx.fillRect(infoX, infoY + 72, 120, 3);

  // 4 个核心架构指标卡（矩阵排布）
  const metrics = [
    { label: 'GLOBAL WATER NETWORK', value: '100,000+', desc: '国内外水站高并发 AIoT 接入 · 毫秒调度', color: '#28d7e5' },
    { label: 'WELINK UNIFIED SEARCH', value: '10,000,000+', desc: '华为云千亿级文档搜索 · 动态个性化打分', color: '#ff6b3d' },
    { label: 'HIGH-FREQUENCY GATEWAY', value: '10,000+ TPS', desc: 'Netty/WebSocket 长连接网关 · 告警风暴治理', color: '#34d399' },
    { label: 'AGENT ORCHESTRATION', value: '99.95%', desc: 'LangChain/Spring AI 智能体编排 · 沙箱执行', color: '#c084fc' },
  ];

  metrics.forEach((m, idx) => {
    const col = idx % 2;
    const row = Math.floor(idx / 2);
    const mx = infoX + col * 310;
    const my = infoY + 90 + row * 95;
    const mw = 295;
    const mh = 82;

    // 卡片背景
    ctx.fillStyle = 'rgba(10, 26, 34, 0.85)';
    ctx.fillRect(mx, my, mw, mh);
    ctx.strokeStyle = m.color;
    ctx.lineWidth = 1;
    ctx.strokeRect(mx, my, mw, mh);

    // 左侧彩色指示条
    ctx.fillStyle = m.color;
    ctx.fillRect(mx, my, 4, mh);

    // 内容
    ctx.fillStyle = '#83a8b4';
    ctx.font = 'bold 9px "IBM Plex Mono", Consolas, monospace';
    ctx.fillText(m.label, mx + 12, my + 18);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 22px "IBM Plex Mono", Consolas, sans-serif';
    ctx.fillText(m.value, mx + 12, my + 46);

    ctx.fillStyle = '#94b3be';
    ctx.font = '9px "PingFang SC", "Microsoft YaHei", sans-serif';
    ctx.fillText(m.desc, mx + 12, my + 68);
  });

  // 底部技术栈霓虹芯片矩阵
  const skills = [
    'JAVA 17/21', 'SPRING CLOUD', 'NETTY', 'POSTGIS', 'FLINK', 'SPARK', 'ELASTICSEARCH',
    'REDIS CLUSTER', 'KAFKA', 'DOCKER', 'LANGCHAIN', 'TDENGINE',
  ];

  const skillY = infoY + 300;
  ctx.fillStyle = '#28d7e5';
  ctx.font = 'bold 11px "IBM Plex Mono", Consolas, monospace';
  ctx.fillText('/// CORE ENGINEERING STACK MATRIX:', infoX, skillY);

  let sx = infoX;
  let sy = skillY + 10;
  skills.forEach((skill, idx) => {
    ctx.font = 'bold 9px "IBM Plex Mono", Consolas, monospace';
    const tagW = ctx.measureText(skill).width + 16;
    if (sx + tagW > infoX + 610) {
      sx = infoX;
      sy += 24;
    }

    ctx.fillStyle = 'rgba(40, 215, 229, 0.12)';
    ctx.fillRect(sx, sy, tagW, 18);
    ctx.strokeStyle = idx % 3 === 0 ? '#ff6b3d' : idx % 2 === 0 ? '#28d7e5' : '#c084fc';
    ctx.lineWidth = 1;
    ctx.strokeRect(sx, sy, tagW, 18);

    ctx.fillStyle = '#e2f4f8';
    ctx.fillText(skill, sx + 8, sy + 13);
    sx += tagW + 8;
  });

  // 底部版权装饰
  ctx.fillStyle = 'rgba(131, 168, 180, 0.6)';
  ctx.font = '9px "IBM Plex Mono", Consolas, monospace';
  ctx.fillText('FU DAOPIN · 3D INTERACTIVE RESUME & ENGINEERING MUSEUM · 2026', infoX, 535);

  return canvas;
}
