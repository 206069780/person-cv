import type { ComponentType } from 'react';

import type { ExhibitId } from '../scene-layout';
import type { ExhibitVisualProps } from './exhibit-types';
import { LitreeAgentZone } from './zones/LitreeAgentZone';
import { LitreeAiotZone } from './zones/LitreeAiotZone';
import { LitreeOaZone } from './zones/LitreeOaZone';
import { LitreeOverviewZone } from './zones/LitreeOverviewZone';
import { SengeGatewayZone } from './zones/SengeGatewayZone';
import { SengePlatformZone } from './zones/SengePlatformZone';
import { WelinkDataLakeZone } from './zones/WelinkDataLakeZone';
import { WelinkSearchZone } from './zones/WelinkSearchZone';

export const EXHIBIT_VISUALS = {
  'litree-overview': LitreeOverviewZone,
  'litree-aiot': LitreeAiotZone,
  'litree-agent': LitreeAgentZone,
  'oa-hr': LitreeOaZone,
  'welink-search': WelinkSearchZone,
  'welink-data': WelinkDataLakeZone,
  'senge-gateway': SengeGatewayZone,
  'senge-platform': SengePlatformZone,
} satisfies Record<ExhibitId, ComponentType<ExhibitVisualProps>>;

export function getExhibitVisual(id: ExhibitId) {
  return EXHIBIT_VISUALS[id];
}
