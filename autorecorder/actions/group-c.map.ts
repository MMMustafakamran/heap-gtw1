/** Group C: page id -> handler (merged into ACTION_MAP in index.ts). Handlers live in ag2.actions.ts (add new ones there or here). */
import { type PageActionHandler } from '../core/types';
import { runStandardWithFinding, runSurfaceWithFinding } from './ag2.actions';

export const MAP_C: Record<string, PageActionHandler> = {
  'gen-ui-components': runSurfaceWithFinding,
  'gen-ui-surfaces': runSurfaceWithFinding,
  'gen-ui-catalogs': runSurfaceWithFinding,
  'gen-ui-standard-catalog': runSurfaceWithFinding,
  'gen-ui-state-actions': runSurfaceWithFinding,
  'gen-ui-theming': runSurfaceWithFinding,
  'gen-ui-transports': runSurfaceWithFinding,
  'gen-ui-markdown-mode': runSurfaceWithFinding,
  'gen-ui-from-a2ui': runSurfaceWithFinding,
  webmcp: runStandardWithFinding,
  auth: runStandardWithFinding,
};
