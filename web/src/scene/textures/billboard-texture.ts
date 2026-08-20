import * as THREE from 'three';

export interface BillboardTextureOptions {
  title: string;
  subtitle: string;
  tags: readonly string[];
  accent: string;
}

/**
 * 绘制侧边霓虹广告看板纹理 (512x256 高性能轻量版)
 */
export function createBillboardTexture({
  title,
  subtitle,
  tags,
  accent,
}: BillboardTextureOptions): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(canvas);

  // 背景
  ctx.fillStyle = '#050f14';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // 边框发光
  ctx.strokeStyle = accent;
  ctx.lineWidth = 4;
  ctx.strokeRect(8, 8, canvas.width - 16, canvas.height - 16);

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
  ctx.lineWidth = 1;
  ctx.strokeRect(14, 14, canvas.width - 28, canvas.height - 28);

  // 装饰网格
  ctx.fillStyle = 'rgba(40, 215, 229, 0.06)';
  for (let y = 18; y < canvas.height - 18; y += 8) {
    ctx.fillRect(18, y, canvas.width - 36, 1);
  }

  // 标题
  ctx.fillStyle = accent;
  ctx.font = 'bold 22px "IBM Plex Mono", Consolas, sans-serif';
  ctx.fillText(title, 24, 45);

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 15px "PingFang SC", "Microsoft YaHei", sans-serif';
  ctx.fillText(subtitle, 24, 76);

  // 分割线
  ctx.fillStyle = accent;
  ctx.fillRect(24, 94, canvas.width - 48, 2);

  // 标签
  let tx = 24;
  let ty = 125;
  tags.forEach((tag) => {
    ctx.font = 'bold 12px "IBM Plex Mono", Consolas, monospace';
    const tw = ctx.measureText(tag).width + 16;
    if (tx + tw > canvas.width - 24) {
      tx = 24;
      ty += 34;
    }

    ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.fillRect(tx, ty - 14, tw, 22);
    ctx.strokeStyle = accent;
    ctx.lineWidth = 1;
    ctx.strokeRect(tx, ty - 14, tw, 22);

    ctx.fillStyle = '#e8f7fa';
    ctx.fillText(tag, tx + 8, ty + 2);
    tx += tw + 10;
  });

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  return texture;
}
