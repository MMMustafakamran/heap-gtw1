/** Group A: page id -> handler (merged into ACTION_MAP in index.ts). Handlers live in ag2.actions.ts (add new ones there or here). */
import { type PageActionHandler } from '../core/types';
import {
  runStandardWithFinding,
  runThreadsDrawerAction,
  runHeadlessThreadsWithFinding,
  runHitlAction,
  runGovernedWithFinding,
  runSayHelloAction,
  runProgrammaticControlAction,
  runHeadlessUiAction,
} from './ag2.actions';

export const MAP_A: Record<string, PageActionHandler> = {
  'prebuilt-components': runStandardWithFinding,
  'copilot-chat': runStandardWithFinding,
  slots: runStandardWithFinding,
  'markdown-rendering': runStandardWithFinding,
  'headless-ui': runHeadlessUiAction,
  'programmatic-control': runProgrammaticControlAction,
  'threads-drawer': runThreadsDrawerAction,
  'headless-threads': runHeadlessThreadsWithFinding,
  'frontend-tools': runSayHelloAction,
  hitl: runHitlAction,
  'governed-actions': runGovernedWithFinding,
};
