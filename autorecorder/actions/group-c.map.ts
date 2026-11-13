/** Group C: page id -> handler (merged into ACTION_MAP in index.ts). Handlers live in ag2.actions.ts (add new ones there or here). */
import { type PageActionHandler } from '../core/types';
import { runStandardWithFinding, runSurfaceWithFinding, runSurfaceFirstWithFinding } from './ag2.actions';

export const MAP_C: Record<string, PageActionHandler> = {
  'gen-ui-components': runSurfaceWithFinding,
  'gen-ui-surfaces': runSurfaceFirstWithFinding,
  'gen-ui-catalogs': runSurfaceFirstWithFinding,
  'gen-ui-standard-catalog': runSurfaceFirstWithFinding,
  'gen-ui-state-actions': runSurfaceFirstWithFinding,
  'gen-ui-theming': runSurfaceFirstWithFinding,
  'gen-ui-transports': runSurfaceFirstWithFinding,
  'gen-ui-markdown-mode': runStandardWithFinding, // inline markdown card, not a surface element
  'gen-ui-from-a2ui': runSurfaceFirstWithFinding,
  webmcp: runStandardWithFinding,
  auth: runStandardWithFinding,
};
