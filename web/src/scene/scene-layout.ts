export const EXHIBIT_IDS = [
  'litree-overview',
  'litree-aiot',
  'litree-agent',
  'oa-hr',
  'welink-search',
  'welink-data',
  'senge-gateway',
  'senge-platform',
] as const;

export type ExhibitId = (typeof EXHIBIT_IDS)[number];

export interface ExhibitLayout {
  id: ExhibitId;
  projectId: 'litree' | 'oa' | 'welink' | 'senge';
  label: string;
  shortLabel: string;
  position: readonly [number, number, number];
  accent: 'signal' | 'safety' | 'cyber';
  zone: 'core' | 'device' | 'protocol' | 'gis' | 'oa' | 'agent' | 'search' | 'plant';
}

export const EXHIBITS = [
  { id: 'litree-overview', projectId: 'litree', label: '微服务与数据底座', shortLabel: 'ARCH', position: [0, 0, -10.5], accent: 'signal', zone: 'core' },
  { id: 'litree-aiot', projectId: 'litree', label: 'AIoT 与空间拓扑', shortLabel: 'AIoT', position: [-8.8, 0, -3.8], accent: 'signal', zone: 'protocol' },
  { id: 'litree-agent', projectId: 'litree', label: '水务智能体', shortLabel: 'AGENT', position: [8.8, 0, -3.8], accent: 'cyber', zone: 'agent' },
  { id: 'oa-hr', projectId: 'oa', label: '立升 OA / HR', shortLabel: 'OA', position: [9.6, 0, 3.6], accent: 'signal', zone: 'oa' },
  { id: 'welink-search', projectId: 'welink', label: 'WeLink 统一搜索', shortLabel: 'SEARCH', position: [-9.6, 0, 3.6], accent: 'safety', zone: 'search' },
  { id: 'welink-data', projectId: 'welink', label: 'WeLink 双路数据湖', shortLabel: 'LAKE', position: [-5.4, 0, 11.8], accent: 'safety', zone: 'search' },
  { id: 'senge-gateway', projectId: 'senge', label: '森格实时通信网关', shortLabel: 'GATEWAY', position: [4.0, 0, 12.0], accent: 'safety', zone: 'plant' },
  { id: 'senge-platform', projectId: 'senge', label: '森格 0-1 平台架构', shortLabel: 'SENGE', position: [9.8, 0, 11.2], accent: 'safety', zone: 'plant' },
] as const satisfies readonly ExhibitLayout[];

export function getZoneFocus(activeId: string | null, zoneId: string) {
  if (!activeId) return { intensity: 1, interactive: true } as const;
  if (activeId === zoneId) return { intensity: 1.35, interactive: true } as const;
  return { intensity: 0.32, interactive: true } as const;
}

export const SCENE_BOUNDS = {
  minX: -15.5,
  maxX: 15.5,
  minZ: -14.5,
  maxZ: 19.5,
} as const;
