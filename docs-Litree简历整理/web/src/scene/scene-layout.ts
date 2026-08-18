export interface ExhibitLayout {
  id: string;
  projectId: 'litree' | 'welink' | 'senge';
  label: string;
  shortLabel: string;
  position: readonly [number, number, number];
  accent: 'signal' | 'safety' | 'cyber';
}

export const EXHIBITS: readonly ExhibitLayout[] = [
  { id: 'litree-overview', projectId: 'litree', label: '平台总览', shortLabel: 'CORE', position: [0, 0, -8], accent: 'signal' },
  { id: 'litree-device-data', projectId: 'litree', label: '设备与数据', shortLabel: 'DATA', position: [-7, 0, -3], accent: 'signal' },
  { id: 'litree-aiot', projectId: 'litree', label: 'AIoT 协议', shortLabel: 'AIoT', position: [7, 0, -3], accent: 'signal' },
  { id: 'litree-gis', projectId: 'litree', label: 'GIS / DMA', shortLabel: 'GIS', position: [-7, 0, 4], accent: 'signal' },
  { id: 'litree-oa', projectId: 'litree', label: 'OA / HR', shortLabel: 'OA', position: [7, 0, 4], accent: 'safety' },
  { id: 'litree-agent', projectId: 'litree', label: 'Agent 工程化', shortLabel: 'AGENT', position: [0, 0, 8], accent: 'cyber' },
  { id: 'welink-search', projectId: 'welink', label: '华为 WeLink', shortLabel: 'WELINK', position: [-11, 0, 9], accent: 'safety' },
  { id: 'senge-platform', projectId: 'senge', label: '森格智慧水务', shortLabel: 'SENGE', position: [11, 0, 9], accent: 'safety' }
] as const;

export const SCENE_BOUNDS = {
  minX: -15,
  maxX: 15,
  minZ: -12,
  maxZ: 18,
} as const;
