export interface ExhibitLayout {
  id: string;
  projectId: 'litree' | 'welink' | 'senge';
  label: string;
  shortLabel: string;
  position: readonly [number, number, number];
  accent: 'signal' | 'safety' | 'cyber';
  zone: 'core' | 'device' | 'protocol' | 'gis' | 'oa' | 'agent' | 'search' | 'plant';
}

export const EXHIBITS: readonly ExhibitLayout[] = [
  { id: 'litree-overview', projectId: 'litree', label: '微服务与数据底座', shortLabel: 'ARCH', position: [0, 0, -8], accent: 'signal', zone: 'core' },
  { id: 'litree-aiot', projectId: 'litree', label: 'AIoT 与空间拓扑', shortLabel: 'AIoT', position: [-7, 0, -2], accent: 'signal', zone: 'protocol' },
  { id: 'litree-agent', projectId: 'litree', label: 'OA 中台与 Agent', shortLabel: 'AGENT', position: [7, 0, -2], accent: 'cyber', zone: 'agent' },
  { id: 'welink-search', projectId: 'welink', label: 'WeLink 统一搜索', shortLabel: 'SEARCH', position: [-8, 0, 6], accent: 'safety', zone: 'search' },
  { id: 'welink-data', projectId: 'welink', label: 'WeLink 双路数据湖', shortLabel: 'LAKE', position: [-3, 0, 8], accent: 'safety', zone: 'search' },
  { id: 'senge-gateway', projectId: 'senge', label: '森格实时通信网关', shortLabel: 'GATEWAY', position: [3, 0, 8], accent: 'safety', zone: 'plant' },
  { id: 'senge-platform', projectId: 'senge', label: '森格 0-1 平台架构', shortLabel: 'SENGE', position: [8, 0, 6], accent: 'safety', zone: 'plant' }
] as const;

export function getZoneFocus(activeId: string | null, zoneId: string) {
  if (!activeId) return { intensity: 1, interactive: true } as const;
  if (activeId === zoneId) return { intensity: 1.35, interactive: true } as const;
  return { intensity: 0.28, interactive: false } as const;
}

export const SCENE_BOUNDS = {
  minX: -15,
  maxX: 15,
  minZ: -12,
  maxZ: 18,
} as const;
