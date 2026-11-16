import { type Page } from 'playwright';
import { fileURLToPath } from 'url';
import { waitForPageReady } from './page-ready';
import { type PageActionHandler, type PageRecordConfig, type ActionContext } from '../core/types';
import { sendPrompt, waitForAgentResponseCompletion } from '../core/actions';
import { sleep } from '../core/overlays/cursor';
import { glideClick, glideTo } from './glide-click';
import { runStandardAction } from '../core/actions';
import { type DocEvidence, showFinding } from './doc-evidence';
import { checkpoint, mark, probeText } from '../core/timeline';
import { registerDocEvidence } from '../core/doc-evidence';
import { SELECTORS } from '../config/selectors.config';

/**
 * Finding clips: back to the doc, drag-select each cited text like a person, then the finding
 * pasted into Notepad in hurried casual words (AUTORECORDER.md section 2). Nothing drawn on the page.
 */
import { NOTES_A, EVIDENCE_A, KNOWN_A } from './group-a';
import { NOTES_B, EVIDENCE_B, KNOWN_B } from './group-b';
import { NOTES_C, EVIDENCE_C, KNOWN_C } from './group-c';

export const FINDING_NOTES: Record<string, string> = { ...NOTES_A, ...NOTES_B, ...NOTES_C };

/** Every `text` must be checked visible on the rendered doc page. */
export const FINDING_EVIDENCE: Record<string, DocEvidence[]> = { ...EVIDENCE_A, ...EVIDENCE_B, ...EVIDENCE_C };

/** Level-2 pages (already reported by the team): clip ends after the demo. */
export const KNOWN_ISSUE = new Set<string>([...KNOWN_A, ...KNOWN_B, ...KNOWN_C]);

/** Doc step: highlight each page's faulty doc text before the IDE (level-2 pages get none). */
registerDocEvidence(FINDING_EVIDENCE, { skip: KNOWN_ISSUE });

export async function writeFinding(page: Page, id: string, config?: PageRecordConfig): Promise<void> {
  if (!FINDING_NOTES[id] || !config) return;
  if (KNOWN_ISSUE.has(id)) return;
  await showFinding(page, config, FINDING_EVIDENCE[id], FINDING_NOTES[id]);
}

/** The standard prompt-and-reply take, then the finding in Notepad. */
export const runStandardWithFinding: PageActionHandler = async (page, config, root, ctx) => {
  try {
    await runStandardAction(page, config, root, ctx);
  } finally {
    // A failed take still gets its explanation.
    await writeFinding(page, config.id, config);
  }
};

const NEXT_ERROR_DIALOG = 'nextjs-portal [data-nextjs-dialog], nextjs-portal [role=dialog]';

/**
 * Pages whose route never renders a chat (compile error, Blocking Route, runtime crash): don't wait
 * 60 s for an input that never comes. Show the Next error overlay, fail the take, then the finding.
 * If the chat does render (route fixed upstream), fall back to the standard take.
 */
export const runRouteErrorWithFinding: PageActionHandler = async (page, config, root, ctx) => {
  try {
    const input = page.locator(SELECTORS.chatInput).first();
    const dialog = page.locator(NEXT_ERROR_DIALOG).first();
    const which = await Promise.race([
      input.waitFor({ state: 'visible', timeout: 12000 }).then(() => 'chat' as const),
      dialog.waitFor({ state: 'visible', timeout: 12000 }).then(() => 'error' as const),
    ]).catch(() => 'none' as const);
    if (which === 'chat') {
      await runStandardAction(page, config, root, ctx);
      return;
    }
    const shown = (await dialog.isVisible().catch(() => false)) ? dialog : page.locator('body');
    const text = ((await shown.innerText().catch(() => '')) || '').replace(/\s+/g, ' ').trim().slice(0, 200);
    mark('error', text || 'route rendered no chat');
    void checkpoint('chat', 'chat input rendered', () => null);
    await glideTo(page, shown, 6000);
    ctx.fail(`Route never rendered a chat: ${text || 'no chat input, no error overlay'}`);
  } finally {
    await writeFinding(page, config.id, config);
  }
};

/**
 * Generative UI pages: the reply must render a surface (`data-generative-ui-surface`) and no
 * "Unable to display" error card. Otherwise the take fails, then the finding.
 */
export const runSurfaceWithFinding: PageActionHandler = async (page, config, root, ctx) => {
  try {
    await runStandardAction(page, config, root, ctx);
    const surface = page.locator('[data-generative-ui-surface], [data-generative-ui-chat-surface], [data-generative-ui-root], .a2ui-surface');
    const errorCard = page.getByText('Unable to display', { exact: false }).first();
    const rendered = (await surface.count()) > 0;
    const broken = await errorCard.isVisible().catch(() => false);
    void checkpoint('render', 'generative UI surface rendered', () => (rendered && !broken ? probeText(surface.last()) : null));
    if (broken) {
      await glideTo(page, errorCard, 2500);
      ctx.fail(`Surface error: ${(await errorCard.innerText().catch(() => '')).slice(0, 160)}`);
    } else if (!rendered) {
      ctx.fail('No generative UI surface rendered; the reply is plain text/markdown.');
    }
  } finally {
    await writeFinding(page, config.id, config);
  }
};

/**
 * Fixed Schema A2UI (FINDINGS.md #8): the flight card must show the flight. The card renders, but
 * the data-bound fields (airports, airline, price) stay empty, so the take fails on the card's text.
 */
export const runFixedSchemaWithFinding: PageActionHandler = async (page, config, root, ctx) => {
  try {
    await runStandardAction(page, config, root, ctx);
    const card = page.locator('[data-testid="a2ui-fixed-card"]').last();
    const shown = (await card.count()) > 0;
    const text = shown ? ((await card.innerText().catch(() => '')) || '') : '';
    const hasFlight = /SFO/.test(text) && /JFK/.test(text);
    void checkpoint('render', 'flight card shows SFO and JFK', () => (hasFlight ? text.replace(/\s+/g, ' ').slice(0, 120) : null));
    if (shown) await glideTo(page, card, 3000);
    if (!shown) ctx.fail('No flight card rendered.');
    else if (!hasFlight) ctx.fail('Flight card rendered with empty airports, airline and price (data-bound fields blank).');
  } finally {
    await writeFinding(page, config.id, config);
  }
};

/** Governed actions (FINDINGS.md #21): an approval card must appear before the action runs. */
export const runGovernedWithFinding: PageActionHandler = async (page, config, root, ctx) => {
  try {
    await runStandardAction(page, config, root, ctx);
    const card = page.getByText('User approval required', { exact: false }).first();
    const shown = await card.isVisible().catch(() => false);
    void checkpoint('render', 'approval card shown', () => (shown ? 'User approval required' : null));
    if (shown) await glideTo(page, card, 2500);
    else ctx.fail('No approval card appeared; the agent replied in text.');
  } finally {
    await writeFinding(page, config.id, config);
  }
};

/**
 * Page actions for Google ADK + React (generic helpers kept from the Antigravity template). Each one drives the feature its doc page
 * teaches and checks the effect the page promises. A missing effect calls ctx.fail, so a
 * broken page records as a failing clip instead of a quiet pass.
 */

async function settle(page: Page, msgCount: number, ctx: ActionContext): Promise<void> {
  try {
    await waitForAgentResponseCompletion(page, 2500, msgCount);
  } catch (e) {
    ctx.warn(`Reply did not complete cleanly: ${String(e).slice(0, 160)}`);
  }
}

/** Frontend Tools: the agent calls change_background and the page background changes. */
export const runFrontendToolsAction: PageActionHandler = async (page, config, _root, ctx) => {
  const bg = page.locator('[data-testid="frontend-tools-background"]');
  const before = await bg.getAttribute('data-background-value').catch(() => null);
  const msgCount = await sendPrompt(page, config.prompt, { timeoutMs: 15000 });
  const changed = await page
    .waitForFunction(
      (prev) => document.querySelector('[data-testid="frontend-tools-background"]')?.getAttribute('data-background-value') !== prev,
      before,
      { timeout: 60000 },
    )
    .then(() => true)
    .catch(() => false);
  if (!changed) ctx.fail('change_background never ran: the background did not change.');
  await settle(page, msgCount, ctx);
  await sleep(2500);
};

/** Topic the last picker card showed (read before the slot is clicked; the card then collapses). */
let lastTopic: string | null = null;

/** HITL and useInterrupt: a picker appears in the chat, the user picks a slot, the run resumes. */
function pickSlotAction(slotLabel: string): PageActionHandler {
  return async (page: Page, config: PageRecordConfig, _root, ctx) => {
    const msgCount = await sendPrompt(page, config.prompt, { timeoutMs: 15000 });
    const slot = page.getByRole('button', { name: slotLabel }).first();
    const appeared = await slot.waitFor({ state: 'visible', timeout: 90000 }).then(() => true).catch(() => false);
    if (!appeared) {
      ctx.fail(`The time picker never appeared (no "${slotLabel}" button).`);
      return;
    }
    // Show the card's header first: on the useInterrupt page it reads "a call" (payload lost, FINDINGS.md #20).
    await glideTo(page, page.getByText('Book a call', { exact: false }).first(), 2500);
    lastTopic = (await page.locator('[data-testid="time-picker-card"] h3').first().textContent().catch(() => null))?.trim() ?? null;
    await glideClick(page, slot);
    await sleep(1500);
    await settle(page, msgCount, ctx);
    await sleep(3000);
  };
}

/** Headless interrupts: the hook should surface the pending interrupt. It never does on Antigravity. */
export const runHeadlessInterruptAction: PageActionHandler = async (page, config, _root, ctx) => {
  await sendPrompt(page, config.prompt, { timeoutMs: 15000 });
  const surfaced = await page
    .getByRole('button', { name: 'Tomorrow 2:00 PM' })
    .waitFor({ state: 'visible', timeout: 20000 })
    .then(() => true)
    .catch(() => false);
  if (!surfaced) mark('error');
  await glideTo(page, page.locator('[data-testid="app-surface"]'), 3000);
  await writeFinding(page, config.id, config);
  if (!surfaced) ctx.fail('Headless hook never received the interrupt: "no pending interrupt" (FINDINGS.md #31).');
};

/** Shared State: the UI writes a name into state, the agent reads it and writes a note back. */
export const runSharedStateAction: PageActionHandler = async (page, config, _root, ctx) => {
  const name = page.locator('[data-testid="pref-name"]');
  await glideClick(page, name);
  await name.pressSequentially('Zara', { delay: 120 });
  await name.blur();
  await sleep(1200);
  const msgCount = await sendPrompt(page, config.prompt, { timeoutMs: 15000 });
  const noted = await page
    .locator('[data-testid="notes-list"] li')
    .first()
    .waitFor({ state: 'visible', timeout: 90000 })
    .then(() => true)
    .catch(() => false);
  if (!noted) ctx.fail('set_notes never updated the notes panel.');
  await settle(page, msgCount, ctx);
  await glideTo(page, page.locator('[data-testid="notes-list"]'), 2500);
};

/** Inspector: run one turn, open the launcher, walk the panes the doc names. */
export const runInspectorAction: PageActionHandler = async (page, config, _root, ctx) => {
  const msgCount = await sendPrompt(page, config.prompt, { timeoutMs: 15000 });
  await settle(page, msgCount, ctx);
  const inspector = page.locator('cpk-web-inspector');
  if ((await inspector.count()) === 0) {
    ctx.fail('No <cpk-web-inspector> on the page.');
    return;
  }
  await glideClick(page, inspector.locator('button').first());
  await sleep(2500);
  for (const pane of ['Agent', 'AG-UI Events', 'Frontend Tools', 'Rich Threads']) {
    const link = inspector.getByText(pane, { exact: true }).first();
    if (await link.isVisible().catch(() => false)) {
      await glideClick(page, link);
      await sleep(3500);
    } else if (pane !== 'Frontend Tools') {
      ctx.warn(`Inspector pane "${pane}" not found.`);
    }
  }
};

export const runHitlAction = pickSlotAction('Tomorrow 2:00 PM');
const pickSlot = pickSlotAction('Tomorrow 2:00 PM');
/**
 * useInterrupt (level 2, ❌): runs only on harness wiring (the page's backend is LangGraph, #19, and
 * `gen-ui-interrupt` is never registered, #22). Even then the card reads "a call": the doc's
 * frontend reads `event.value`, empty for an Antigravity interrupt (#20).
 */
export const runUseInterruptAction: PageActionHandler = async (page, config, root, ctx) => {
  lastTopic = null;
  await pickSlot(page, config, root, ctx);
  if (lastTopic === 'a call') {
    mark('error', 'card header reads "a call": interrupt payload lost (event.value)');
    ctx.fail('The card shows "a call" instead of the topic: event.value is empty for Antigravity (FINDINGS.md #20). Backend on the page is LangGraph (#19).');
  }
  await writeFinding(page, config.id, config);
};

/** State Rendering: set_steps streams the plan into agent state; the steps panel re-renders mid-run. */
export const runStateRenderingAction: PageActionHandler = async (page, config, _root, ctx) => {
  await sendPrompt(page, config.prompt, { timeoutMs: 15000 });
  const firstStep = page.locator('[data-testid="step-item"]').first();
  const appeared = await firstStep.waitFor({ state: 'visible', timeout: 120000 }).then(() => true).catch(() => false);
  if (!appeared) {
    mark('error');
    ctx.fail('set_steps never rendered: the steps panel stayed empty.');
    return;
  }
  mark('action', 'steps rendered from agent state');
  await glideTo(page, page.locator('[data-testid="steps-panel"]'), 2000);
  // The agent mostly talks through set_steps tool calls, not chat text, so the chat-reply wait
  // gives up early. Follow the run itself: the LIVE badge (OnRunStatusChanged) goes away at the end.
  const finished = await page
    .locator('[data-testid="live-badge"]')
    .waitFor({ state: 'detached', timeout: 240000 })
    .then(() => true)
    .catch(() => false);
  if (!finished) ctx.warn('Run still LIVE after 4 minutes.');
  await sleep(2000);
  const statuses = await page.locator('[data-testid="step-item"]').evaluateAll((els) => els.map((e) => e.getAttribute('data-status')));
  if (!statuses.length || statuses.some((s) => s !== 'completed')) {
    ctx.warn(`Run ended with steps not all completed: ${statuses.join(', ')}`);
  }
  await glideTo(page, page.locator('[data-testid="steps-progress"]'), 2500);
};

/** Sub-Agents: the supervisor delegates; each sub-agent call lands in the delegation log mid-run. */
export const runSubagentsAction: PageActionHandler = async (page, config, root, ctx) => {
  try {
    await runSubagentsTake(page, config, root, ctx);
  } finally {
    // FINDINGS.md #49: on today's versions the sub-agents server never starts.
    await writeFinding(page, config.id, config);
  }
};

const runSubagentsTake: PageActionHandler = async (page, config, _root, ctx) => {
  const msgCount = await sendPrompt(page, config.prompt, { timeoutMs: 15000 });
  const entries = page.locator('[data-testid="delegation-entry"]');
  // Stop waiting as soon as the run errors (e.g. "fetch failed" when the sub-agents server is
  // down, FINDINGS.md #49): minutes of a frozen chat explain nothing.
  const runError = page.locator('[data-testid="copilot-error-banner"]').or(page.getByText(/fetch failed|Agent error/i)).first();
  const outcome = await Promise.race([
    entries.first().waitFor({ state: 'visible', timeout: 180000 }).then(() => 'delegated' as const),
    runError.waitFor({ state: 'visible', timeout: 180000 }).then(() => 'error' as const),
  ]).catch(() => 'timeout' as const);
  if (outcome !== 'delegated') {
    mark('error');
    if (outcome === 'error') await glideTo(page, runError, 2500).catch(() => {});
    await sleep(3000);
    ctx.fail(
      outcome === 'error'
        ? 'The run failed before any delegation (error shown in the chat).'
        : 'No delegation ever reached the log (agent.state.delegations stayed empty).',
    );
    return;
  }
  mark('action', 'first delegation in the log');
  await glideTo(page, entries.first(), 2000);
  await settle(page, msgCount, ctx);
  const fired = await page
    .locator('[data-testid="subagent-indicators"] [data-fired="true"]')
    .evaluateAll((els) => els.map((e) => e.getAttribute('data-role')));
  if (fired.length < 3) ctx.warn(`Supervisor called only: ${fired.join(', ') || 'none'} (doc: research, write, critique).`);
  await glideTo(page, page.locator('[data-testid="delegation-count"]'), 1500);
  // Scroll the log (the wheel scrolls what is under the cursor) so every delegation is seen.
  await glideTo(page, entries.first(), 500);
  for (let i = 0; i < 4; i++) {
    await page.mouse.wheel(0, 250);
    await sleep(700);
  }
  await sleep(1500);
};

/** Open, close, and feedback: the sidebar starts closed, so open it with the page's own button first. */
export const runChatControlsAction: PageActionHandler = async (page, config, root, ctx) => {
  const open = page.getByRole('button', { name: 'Ask the assistant' }).first();
  if (await open.isVisible({ timeout: 10000 }).catch(() => false)) {
    mark('click', 'Ask the assistant');
    await glideClick(page, open);
    await sleep(1500);
  } else {
    ctx.warn('No "Ask the assistant" button on the page.');
  }
  await runStandardAction(page, config, root, ctx);
};

// ---------------------------------------------------------------------------------------------
// Threads pages, tested with the CopilotKit Intelligence key (2026-11-10). Runtime:
// frontend/app/api/copilotkit-threads (the headless page's server.ts). Threads are per user
// (antigravity-qa-user) and persist between runs, so older rows can already be listed.
// ---------------------------------------------------------------------------------------------
const DRAWER_ROW = 'copilotkit-threads-drawer li[role="option"][data-thread-id]';
const promptHead = (config: PageRecordConfig) => config.prompt.slice(0, 24);

/** Threads Drawer: chat once, the thread is listed, New Conversation resets the chat, the row replays it. */
export const runThreadsDrawerAction: PageActionHandler = async (page, config, root, ctx) => {
  await page.locator('copilotkit-threads-drawer').first().waitFor({ state: 'attached', timeout: 30000 }).catch(() => {});
  await sleep(3000); // the drawer loads its list
  // Start on a fresh thread: the backend keeps threads per anonymous user, so the drawer can resume
  // the last page's thread (Governed Actions left an unanswered approval → 400 on the next run,
  // review 2026-11-16). A reader clicking "New Conversation" first is ordinary use, not a fix.
  const fresh = page.getByText('New Conversation', { exact: true }).first();
  if (await fresh.isVisible().catch(() => false)) {
    await glideClick(page, fresh);
    await sleep(1500);
  }
  const rowsBefore = await page.locator(DRAWER_ROW).count();
  await runStandardAction(page, config, root, ctx);
  const mine = page.locator(DRAWER_ROW).filter({ hasText: promptHead(config) });
  const listed = await page
    .waitForFunction((n) => (document.querySelector('copilotkit-threads-drawer')?.shadowRoot
      ?.querySelectorAll('li[role="option"][data-thread-id]').length ?? 0) > n, rowsBefore, { timeout: 45000, polling: 500 })
    .then(() => true)
    .catch(() => false);
  void checkpoint('thread', 'the new conversation is listed in the drawer', async () => `${await page.locator(DRAWER_ROW).count()} row(s), was ${rowsBefore}`, {
    ok: () => listed,
  });
  if (!listed) {
    ctx.fail('The Threads Drawer did not list the new conversation.');
    return;
  }
  await sleep(4000); // the thread name fills in
  await glideTo(page, page.locator(DRAWER_ROW).first(), 2000);
  mark('click', 'New Conversation');
  await glideClick(page, page.getByText('New Conversation', { exact: true }).first());
  const userBubble = page.getByText(config.prompt, { exact: false }).first();
  const reset = await userBubble.waitFor({ state: 'hidden', timeout: 15000 }).then(() => true).catch(() => false);
  void checkpoint('new', '"New Conversation" clears the chat', async () => reset);
  if (!reset) ctx.fail('"New Conversation" did not reset the chat.');
  await sleep(2500);
  mark('click', 'reopen thread');
  const row = (await mine.count()) > 0 ? mine.first() : page.locator(DRAWER_ROW).first();
  await glideClick(page, row);
  const replayed = await userBubble.waitFor({ state: 'visible', timeout: 20000 }).then(() => true).catch(() => false);
  void checkpoint('replay', 'selecting the thread replays its history', () => probeText(page.getByText(config.prompt, { exact: false })));
  if (!replayed) ctx.fail('Selecting the thread in the drawer did not replay its conversation.');
  await sleep(4000);
};

/** Headless Threads: chat once, the useThreads sidebar lists it, selecting another row switches the chat, and back. */
export const runHeadlessThreadsAction: PageActionHandler = async (page, config, root, ctx) => {
  await runStandardAction(page, config, root, ctx);
  // The doc's ThreadSidebar: <div><span>{name}</span><button>Rename</button><button>Archive</button></div>
  const rows = page.locator('div:has(> button:text-is("Rename")) > span');
  const listed = await rows.first().waitFor({ state: 'visible', timeout: 45000 }).then(() => true).catch(() => false);
  void checkpoint('thread', 'the useThreads sidebar lists the thread (Rename / Archive row)', async () => `${await rows.count()} row(s)`, {
    ok: () => listed,
  });
  if (!listed) {
    ctx.fail('The chat ran, but the useThreads sidebar lists no threads.');
    return;
  }
  await sleep(4000); // the thread name fills in
  const userBubble = page.getByText(config.prompt, { exact: false }).first();
  const other = rows.filter({ hasNotText: promptHead(config) });
  if ((await other.count()) > 0) {
    mark('click', 'other thread');
    await glideClick(page, other.first());
    const switched = await userBubble.waitFor({ state: 'hidden', timeout: 20000 }).then(() => true).catch(() => false);
    void checkpoint('switch', 'selecting another thread switches the chat away from this one', async () => switched);
    if (!switched) ctx.fail('Selecting another thread in the sidebar did not switch the chat.');
    await sleep(3000);
  }
  mark('click', 'reopen thread');
  const mine = rows.filter({ hasText: promptHead(config) });
  await glideClick(page, (await mine.count()) > 0 ? mine.first() : rows.first());
  const replayed = await userBubble.waitFor({ state: 'visible', timeout: 20000 }).then(() => true).catch(() => false);
  void checkpoint('replay', 'selecting the thread replays its history', () => probeText(page.getByText(config.prompt, { exact: false })));
  if (!replayed) ctx.fail('Selecting the thread in the sidebar did not replay its conversation.');
  await sleep(4000);
};

/** headless-threads (FINDINGS.md #25): the take, then the finding. */
export const runHeadlessThreadsWithFinding: PageActionHandler = async (page, config, root, ctx) => {
  try {
    await runHeadlessThreadsAction(page, config, root, ctx);
  } finally {
    await writeFinding(page, config.id, config);
  }
};

/** Pages whose reply must render something in the chat (selector); otherwise the take fails, then the finding. */
function renderedWithFinding(selector: string, what: string): PageActionHandler {
  return async (page, config, root, ctx) => {
    try {
      await runStandardAction(page, config, root, ctx);
      const el = page.locator(selector);
      const ok = (await el.count()) > 0;
      void checkpoint('render', what, () => (ok ? probeText(el.last()) : null));
      if (!ok) ctx.fail(`Nothing rendered: ${what} missing; the reply is text only.`);
    } finally {
      await writeFinding(page, config.id, config);
    }
  };
}
/** gen-ui-hashbrown (#26): a chart/metric must render in the reply. */
export const runHashbrownWithFinding = renderedWithFinding(`${SELECTORS.assistantMessage} svg, ${SELECTORS.assistantMessage} canvas`, 'hashbrown chart in the reply');
/** gen-ui-mcp-apps (#27): the MCP app iframe must render. */
export const runMcpAppsWithFinding = renderedWithFinding('iframe', 'MCP app iframe');

// ---------------------------------------------------------------------------------------------
// ✅ pages whose effect is not a plain chat reply (CI 2026-11-11 recorded them badly).
// ---------------------------------------------------------------------------------------------

/** gen-ui-state-rendering: the agent writes into the Document pane (agent state), no chat reply. */
export const runDocumentStateAction: PageActionHandler = async (page, config, _root, ctx) => {
  await sendPrompt(page, config.prompt, { timeoutMs: 15000 });
  const content = page.locator('[data-testid="document-content"]');
  const filled = await page
    .waitForFunction(() => (document.querySelector('[data-testid="document-content"]')?.textContent ?? '').trim().length > 0, null, { timeout: 120000, polling: 500 })
    .then(() => true)
    .catch(() => false);
  if (!filled) {
    mark('error');
    ctx.fail('The Document pane stayed empty: no text streamed into agent state.');
    return;
  }
  mark('action', 'document streaming from agent state');
  await glideTo(page, content, 1500);
  // The LIVE badge (isStreaming) goes away when the run ends.
  const finished = await page
    .locator('[data-testid="document-live-badge"]')
    .waitFor({ state: 'detached', timeout: 180000 })
    .then(() => true)
    .catch(() => false);
  if (!finished) ctx.warn('Document still LIVE after 3 minutes.');
  void checkpoint('document', 'the Document pane holds the written text', () => probeText(content));
  await glideTo(page, page.locator('[data-testid="document-char-count"]'), 2500);
};

const ATTACH_FIXTURE = fileURLToPath(new URL('../fixtures/red-circle.png', import.meta.url)); // HARNESS test asset

/** multimodal-attachments: attach a small image with the chat's "+" control, then ask about it. */
export const runAttachmentsAction: PageActionHandler = async (page, config, root, ctx) => {
  const add = page.locator('[data-testid="copilot-add-menu-button"]').first();
  let attached = false;
  if (await add.isVisible({ timeout: 15000 }).catch(() => false)) {
    mark('click', 'Add attachments');
    await glideClick(page, add);
    await sleep(800);
    const item = page.getByRole('menuitem').filter({ hasText: /attach|upload|file|photo|image/i }).first();
    const chooser = page.waitForEvent('filechooser', { timeout: 8000 }).catch(() => null);
    if (await item.isVisible({ timeout: 3000 }).catch(() => false)) await glideClick(page, item);
    const fc = await chooser;
    if (fc) {
      await fc.setFiles(ATTACH_FIXTURE);
      attached = true;
    }
  }
  if (!attached) {
    // No chooser opened (menu shape changed): put the file on the chat's own file input.
    await page.keyboard.press('Escape').catch(() => {});
    const input = page.locator('input[type="file"]').first();
    attached = await input.setInputFiles(ATTACH_FIXTURE).then(() => true).catch(() => false);
  }
  const queued = page.locator('[data-testid="copilot-attachment-queue"]').first();
  const shown = attached && (await queued.waitFor({ state: 'visible', timeout: 15000 }).then(() => true).catch(() => false));
  void checkpoint('attach', 'the image shows in the attachment queue', async () => shown);
  if (!shown) {
    mark('error');
    ctx.fail('The attach control did not queue the image.');
    return;
  }
  mark('action', 'image attached');
  await glideTo(page, queued, 1500);
  await runStandardAction(page, config, root, ctx);
  const sent = page.locator('img[src^="data:"], img[src^="blob:"], img[alt*="red-circle"]').first();
  void checkpoint('sent', 'the sent message carries the image', async () => (await sent.count()) > 0);
};

const JSON_RENDER_OUTPUT = '[data-testid="metric-card"], [data-testid="bar-chart"], [data-testid="pie-chart"]';

/**
 * Wait for the json-render output, or for a text-only reply that has stopped changing.
 * The page swaps in its own assistant message slot and the agent can take over 30 s, so the
 * standard reply wait (which threw in CI and locally on the raw-JSON reply) is not used.
 */
async function waitJsonRender(page: Page, timeoutMs: number): Promise<'rendered' | 'text' | 'timeout'> {
  const deadline = Date.now() + timeoutMs;
  let last = '';
  let stableSince = Date.now();
  while (Date.now() < deadline) {
    if (await page.locator(JSON_RENDER_OUTPUT).first().isVisible().catch(() => false)) return 'rendered';
    const text = await page.locator(SELECTORS.assistantMessage).last().innerText({ timeout: 1000 }).catch(() => '');
    if (text !== last) {
      last = text;
      stableSince = Date.now();
    } else if (text.trim().length > 0 && Date.now() - stableSince > 10000) {
      return 'text';
    }
    await sleep(1000);
  }
  return 'timeout';
}

/** gen-ui-json-render: the reply must render a metric card or chart; one retry in a new thread. */
export const runJsonRenderAction: PageActionHandler = async (page, config, _root, ctx) => {
  for (let attempt = 1; attempt <= 2; attempt++) {
    await sendPrompt(page, config.prompt, { timeoutMs: 15000 });
    const outcome = await waitJsonRender(page, 150000);
    const out = page.locator(JSON_RENDER_OUTPUT);
    void checkpoint('render', `json-render dashboard (try ${attempt})`, async () => (outcome === 'rendered' ? probeText(out.first()) : outcome));
    if (outcome === 'rendered') {
      await sleep(3000); // the rest of the spec streams in
      mark('action', 'dashboard rendered');
      await glideTo(page, out.first(), 2500);
      if ((await out.count()) > 1) await glideTo(page, out.last(), 2500);
      return;
    }
    if (attempt === 1) {
      ctx.warn(`No metric card or chart rendered (${outcome}); retrying once in a new thread.`);
      await sleep(2000);
      await page.reload({ waitUntil: 'domcontentloaded' });
      await waitForPageReady(page, { label: config.id });
    }
  }
  mark('error');
  ctx.fail('No metric card or chart rendered after two tries: the reply stayed raw JSON / text.');
};

/**
 * Quickstart (ag2-samples UI on 3061): the sample serves the agent only to a signed-in user, so the
 * reader enters a name first (the doc's "Enter a name to sign in"), then asks the weather question.
 */
export const runQuickstartAction: PageActionHandler = async (page, config, root, ctx) => {
  const name = page.locator('input[placeholder="Your name"]').first();
  if (await name.isVisible({ timeout: 15000 }).catch(() => false)) {
    mark('click', 'sign in');
    await glideClick(page, name);
    await page.keyboard.type('Tester', { delay: 140 });
    await sleep(500);
    await page.keyboard.press('Enter');
    await sleep(3000);
  } else {
    ctx.warn('No sign-in form on the quickstart page.');
  }
  await runStandardAction(page, config, root, ctx);
};

// ── GROUP A handlers ──
/** Frontend Tools (AG2): the agent calls sayHello, whose handler shows `alert("Hello, <name>!")`. */
export const runSayHelloAction: PageActionHandler = async (page, config, _root, ctx) => {
  let alertText: string | null = null;
  const onDialog = async (d: import('playwright').Dialog) => {
    alertText = d.message();
    await sleep(2500); // keep the browser alert up a moment
    await d.accept().catch(() => {});
  };
  page.on('dialog', onDialog);
  try {
    const msgCount = await sendPrompt(page, config.prompt, { timeoutMs: 15000 });
    for (let i = 0; i < 120 && !alertText; i++) await sleep(500);
    const shown = !!alertText;
    mark('action', alertText ?? 'no alert');
    void checkpoint('tool', 'sayHello handler ran (alert shown)', () => alertText);
    if (!shown) ctx.fail('sayHello never ran: no "Hello, ...!" alert appeared.');
    await settle(page, msgCount, ctx);
    await sleep(2500);
  } finally {
    page.off('dialog', onDialog);
  }
};

/** Programmatic Control: click the page's own "Run Agent" button; the dashboard shows the run and the reply. */
export const runProgrammaticControlAction: PageActionHandler = async (page, _config, _root, ctx) => {
  const btn = page.getByRole('button', { name: 'Run Agent' }).first();
  const ready = await btn.waitFor({ state: 'visible', timeout: 30000 }).then(() => true).catch(() => false);
  if (!ready) {
    ctx.fail('No "Run Agent" button rendered.');
    return;
  }
  await sleep(1500);
  mark('click', 'Run Agent');
  await glideClick(page, btn);
  const agentMsg = page.locator('div.font-semibold:text-is("Agent")').first();
  const replied = await agentMsg.waitFor({ state: 'visible', timeout: 60000 }).then(() => true).catch(() => false);
  await sleep(6000); // let the reply stream in
  void checkpoint('reply', 'the dashboard shows an Agent message', () => (replied ? probeText(agentMsg.locator('xpath=..')) : null));
  if (!replied) ctx.fail('Run Agent sent the message, but no Agent reply appeared in the dashboard.');
  else await glideTo(page, agentMsg, 2500);
  await sleep(2500);
};
/** Headless UI (AG2): the doc's own <input placeholder="Type a message..."> (no type attr) and gray assistant bubbles. */
export const runHeadlessUiAction: PageActionHandler = async (page, config, _root, ctx) => {
  const msgSel = 'div.bg-gray-100';
  const msgCount = await sendPrompt(page, config.prompt, { inputSelector: 'input[placeholder="Type a message..."]', messageSelector: msgSel, timeoutMs: 20000 });
  const reply = page.locator(msgSel).nth(msgCount);
  const ok = await reply.waitFor({ state: 'visible', timeout: 90000 }).then(() => true).catch(() => false);
  void checkpoint('reply', 'assistant bubble rendered', () => (ok ? probeText(reply) : null));
  if (!ok) ctx.fail('No assistant reply appeared in the headless chat.');
  await sleep(5000);
};
// ── END GROUP A handlers ──

// ── COORDINATOR handlers (CI round 1)
/**
 * Generative UI pages whose reply is often ONLY a component (no assistant text): the standard wait
 * ("assistant message got content") times out although the card is on screen. Wait for the surface
 * (or an error card / plain text reply) instead, then let the reply settle.
 */
export const runSurfaceFirstWithFinding: PageActionHandler = async (page, config, _root, ctx) => {
  try {
    mark('action', 'prompt');
    const msgCount = await sendPrompt(page, config.prompt, { timeoutMs: 15000 });
    const surface = page.locator('[data-generative-ui-surface], [data-generative-ui-chat-surface], [data-generative-ui-root], .a2ui-surface');
    const errorCard = page.getByText('Unable to display', { exact: false }).first();
    const deadline = Date.now() + 60_000; // was 120 s: on a page that never renders it only froze the clip (review 2026-11-16)
    while (Date.now() < deadline) {
      if ((await surface.count()) > 0 || (await errorCard.isVisible().catch(() => false))) break;
      await sleep(1000);
    }
    // A card-only reply never produces assistant text: settle() would sit out its whole text wait on
    // a card that is already on screen (frozen tails, review 2026-11-16 round 2). Card or error card
    // seen: give it a few seconds to fill in. Nothing seen: settle as before (text reply / silence).
    if ((await surface.count()) > 0 || (await errorCard.isVisible().catch(() => false))) await sleep(6000);
    else await settle(page, msgCount, ctx);
    await sleep(2500);
    const rendered = (await surface.count()) > 0;
    const broken = await errorCard.isVisible().catch(() => false);
    void checkpoint('render', 'generative UI surface rendered', () => (rendered && !broken ? probeText(surface.last()) : null));
    if (broken) {
      await glideTo(page, errorCard, 2500);
      ctx.fail(`Surface error: ${(await errorCard.innerText().catch(() => '')).slice(0, 160)}`);
    } else if (!rendered) {
      ctx.fail('No generative UI surface rendered; the reply is plain text/markdown.');
    } else {
      await glideTo(page, surface.last(), 2500);
    }
  } finally {
    await writeFinding(page, config.id, config);
  }
};
