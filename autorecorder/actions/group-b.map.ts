/** Group B: page id -> handler (merged into ACTION_MAP in index.ts). Handlers live in ag2.actions.ts (add new ones there or here). */
import { type Page } from 'playwright';
import { type ActionContext, type PageActionHandler, type PageRecordConfig } from '../core/types';
import { runStandardAction, sendPrompt, waitForAgentResponseCompletion } from '../core/actions';
import { sleep } from '../core/overlays/cursor';
import { checkpoint, mark, probeText } from '../core/timeline';
import { glideClick, glideTo } from './glide-click';
import { writeFinding } from './ag2.actions';

/**
 * The page's prompt-and-reply take, then the effect the doc promises must be on screen (`selector`,
 * optionally containing `text`). A missing effect fails the take; a finding page then gets its Notepad.
 */
function expectEffect(selector: string, what: string, opts: { text?: RegExp; waitMs?: number; before?: (page: Page) => Promise<void> } = {}): PageActionHandler {
  return async (page: Page, config: PageRecordConfig, root: string, ctx: ActionContext) => {
    try {
      if (opts.before) await opts.before(page);
      // The effect may be the whole reply (chart, iframe, card, no assistant text): wait for it, not for text.
      const msgCount = await sendPrompt(page, config.prompt, { timeoutMs: 15000 });
      let el = page.locator(selector);
      if (opts.text) el = el.filter({ hasText: opts.text });
      const ok = await el.first().waitFor({ state: 'visible', timeout: opts.waitMs ?? 90000 }).then(() => true).catch(() => false);
      await waitForAgentResponseCompletion(page, 3000, msgCount, undefined, {}).catch(() => {});
      void root;
      void checkpoint('render', what, () => (ok ? probeText(el.last()) : null));
      if (ok) {
        mark('action', what);
        await glideTo(page, el.last(), 3000);
      } else {
        mark('error', `${what} missing`);
        ctx.fail(`Nothing rendered: ${what} missing.`);
      }
    } finally {
      await writeFinding(page, config.id, config);
    }
  };
}

/** Writing agent state: the doc's Toggle Language button writes state, then the agent answers in that language. */
const runSharedStateWriteAction: PageActionHandler = async (page, config, _root, ctx) => {
  const label = page.getByText(/^Language: /).first();
  await label.waitFor({ state: 'visible', timeout: 30000 });
  await glideTo(page, label, 1200);
  await glideClick(page, page.getByRole('button', { name: 'Toggle Language' }));
  mark('click', 'Toggle Language');
  const spanish = await page.getByText('Language: spanish').waitFor({ state: 'visible', timeout: 8000 }).then(() => true).catch(() => false);
  void checkpoint('state', 'UI wrote language: spanish', () => (spanish ? 'Language: spanish' : null));
  if (!spanish) ctx.fail('Toggle Language did not change the language.');
  await sleep(1200);
  try {
    const msgCount = await sendPrompt(page, config.prompt, { timeoutMs: 15000 });
    await waitForAgentResponseCompletion(page, 4000, msgCount).catch(() => {});
    await sleep(2000);
    // The doc promises the agent answers in the language the UI wrote.
    const reply = (await page.locator('body').innerText().catch(() => '')).toLowerCase();
    const englishAnswer = /answer in english|respond in english|in english/.test(reply) && !/espa[nñ]ol|spanish\./.test(reply);
    void checkpoint('reply', 'agent answers in spanish', () => (englishAnswer ? null : 'spanish'));
    if (englishAnswer) ctx.fail('The UI wrote language: spanish, but the agent still answers in English.');
  } finally {
    await writeFinding(page, config.id, config);
  }
};

/** MCP Apps: the app renders inside its own iframe, so look for its title in every frame. */
const runMcpAppsAction: PageActionHandler = async (page, config, _root, ctx) => {
  try {
    const msgCount = await sendPrompt(page, config.prompt, { timeoutMs: 15000 });
    const deadline = Date.now() + 90000;
    let found = false;
    while (!found && Date.now() < deadline) {
      for (const f of page.frames()) {
        if (await f.getByText('Budget Allocator').first().isVisible().catch(() => false)) { found = true; break; }
      }
      if (!found) await sleep(1000);
    }
    void checkpoint('render', 'Budget Allocator MCP app', () => (found ? 'Budget Allocator' : null));
    if (found) {
      mark('action', 'Budget Allocator MCP app');
      const frameEl = page.locator('iframe').last();
      if (await frameEl.isVisible().catch(() => false)) await glideTo(page, frameEl, 3000);
    } else {
      mark('error', 'MCP app missing');
      ctx.fail('Nothing rendered: Budget Allocator MCP app missing.');
    }
    await waitForAgentResponseCompletion(page, 2000, msgCount).catch(() => {});
  } finally {
    await writeFinding(page, config.id, config);
  }
};

export const MAP_B: Record<string, PageActionHandler> = {
  'gen-ui-tool-based': expectEffect('.recharts-wrapper', 'bar chart rendered in the chat'),
  'gen-ui-tool-rendering': expectEffect('p', 'tool call rendered (Called the weather API for ...)', { text: /Called the weather API for/ }),
  'gen-ui-state-rendering': expectEffect('div.flex-row', 'searches from agent state', { text: /✅/ }),
  'a2ui': expectEffect('[data-generative-ui-surface], [data-a2ui-surface], .a2ui-surface, [class*="a2ui"]', 'A2UI surface in the chat'),
  'a2ui-dynamic-schema': expectEffect('[data-generative-ui-surface], [data-a2ui-surface], [data-testid="declarative-card"], [class*="a2ui"]', 'A2UI dashboard in the chat'),
  'a2ui-fixed-schema': expectEffect('[data-testid="a2ui-fixed-card"], [data-a2ui-surface], [class*="a2ui"]', 'flight card with SFO and JFK', { text: /SFO[\s\S]*JFK/, waitMs: 30000 /* review 11-16: the card renders empty (#7); 90 s only froze the clip */ }),
  'gen-ui-mcp-apps': runMcpAppsAction,
  'gen-ui-open-gen-ui': expectEffect('iframe', 'generated UI iframe', { waitMs: 60000 }),
  'shared-state-read': expectEffect('p', 'Language: spanish from agent state', { text: /Language: spanish/ }),
  'shared-state-write': runSharedStateWriteAction,
  'subagents': expectEffect('li', 'delegation done in the SubagentPanel', { text: /done/ }),
};
