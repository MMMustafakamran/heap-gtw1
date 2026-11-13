/**
 * Which handler serves which page id. Pages not listed here use runStandardAction
 * (send the page's prompt, wait for the reply).
 */
import { type ActionContext, type PageActionHandler, type PageRecordConfig } from '../core/types';
import { runStandardAction } from '../core/actions';
import { type Page } from 'playwright';

import { waitForPageReady } from './page-ready';
import {
  runFrontendToolsAction,
  runHeadlessInterruptAction,
  runHitlAction,
  runInspectorAction,
  runSharedStateAction,
  runStandardWithFinding,
  runStateRenderingAction,
  runSubagentsAction,
  runChatControlsAction,
  runUseInterruptAction,
  runThreadsDrawerAction,
  runHeadlessThreadsAction,
  runRouteErrorWithFinding,
  runSurfaceWithFinding,
  runHeadlessThreadsWithFinding,
  runHashbrownWithFinding,
  runFixedSchemaWithFinding,
  runGovernedWithFinding,
  runMcpAppsWithFinding,
  runDocumentStateAction,
  runAttachmentsAction,
  runJsonRenderAction,
  runQuickstartAction,
} from './ag2.actions';

/** Keys are page ids from `config/pages.config.ts`. Doctor flags any orphans. */
import { MAP_A } from './group-a.map';
import { MAP_B } from './group-b.map';
import { MAP_C } from './group-c.map';

export const ACTION_MAP: Record<string, PageActionHandler> = {
  quickstart: runQuickstartAction,
  ...MAP_A,
  ...MAP_B,
  ...MAP_C,
};

export async function executePageAction(
  page: Page,
  config: PageRecordConfig,
  rootPath: string,
  ctx: ActionContext,
): Promise<void> {
  // A dev server compiles client chunks lazily, so markup can be on screen before
  // anything is wired to it. Wait for the page to settle before any handler runs.
  await waitForPageReady(page, { label: config.id });

  const handler = ACTION_MAP[config.id] ?? runStandardAction;
  await handler(page, config, rootPath, ctx);
}
