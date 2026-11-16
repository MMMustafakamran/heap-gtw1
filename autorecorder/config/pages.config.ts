/**
 * One entry per tested doc page of https://docs.copilotkit.ai/ag2, in the order
 * the clips are numbered. docUrl, demoUrl and the filename are derived from project.config.ts.
 *
 * Every demo route is served from the root of the app (demoSuffix is ''), because this harness
 * puts each doc page on its own route rather than a `/demo-chat` sub-page.
 * Not registered: intelligence/*, backend/*, deploy pages (QA-RULES §9).
 */
import { definePages } from '../core/types';

/** Registered but not recorded, with the reason printed on every run. */
/** Registered but not recorded, with the reason printed on every run. */
export const SKIP_RECORDING: Record<string, string> = {
  // Owner (2026-11-11): doc pages that say "Not available on this framework" get no clip (N/A row).
};

export const PAGES = definePages([
  {
    id: 'quickstart',
    name: 'Quickstart',
    videoName: 'Quickstart',
    docPath: 'quickstart',
    route: 'quickstart',
    // The quickstart is the doc's own clone of ag2ai/ag2-samples (quickstart/), whose UI runs on its own
    // dev server. HARNESS: ports 3000/8000 -> 3061/8062 (QA-RULES §4; the sample hardcodes both).
    devServer: {
      cwd: 'quickstart/ui',
      command: 'pnpm',
      args: ['dev'],
      env: { AUTH_SECRET: 'harness-qa-long-random-string-0123456789' },
      readyPattern: /Ready in/,
      readyTimeoutMs: 180_000,
      originUrl: 'http://localhost:3061',
      warmUrl: 'http://localhost:3061/',
      title: 'ui — AUTH_SECRET=... pnpm dev',
    },
    ideFile: 'quickstart/ui/package.json',
    startLine: 1,
    endLine: 30,
    extraTabs: [
      { filePath: 'quickstart/backend/agent.py', startLine: 1, endLine: 60 },
      { filePath: 'quickstart/backend/__main__.py', startLine: 1, endLine: 5 },
      { filePath: 'quickstart/ui/app/api/copilotkit/route.ts', startLine: 1, endLine: 27 },
      { filePath: 'quickstart/pyproject.toml', startLine: 1, endLine: 16 },
    ],
    prompt: "What's the weather in London?",
    waitAfterPromptMs: 4000,
  },
  // ── GROUP A pages ──
  { id: 'prebuilt-components', name: 'Prebuilt Components', videoName: 'PrebuiltComponents', docPath: 'prebuilt-components', route: 'prebuilt-components', ideFile: 'frontend/app/prebuilt-components/page.tsx', startLine: 1, endLine: 24, extraTabs: [{ filePath: 'frontend/app/prebuilt-components/layout.tsx', startLine: 1, endLine: 10 }], prompt: 'Say hello in one short sentence.', waitAfterPromptMs: 3000 },
  { id: 'copilot-chat', name: 'CopilotChat', videoName: 'CopilotChat', docPath: 'prebuilt-components/chat', route: 'prebuilt-components/chat', ideFile: 'frontend/app/prebuilt-components/chat/page.tsx', startLine: 1, endLine: 25, prompt: 'Say hello in one short sentence.', waitAfterPromptMs: 3000 },
  { id: 'slots', name: 'Slots', videoName: 'Slots', docPath: 'custom-look-and-feel/slots', route: 'custom-look-and-feel/slots', ideFile: 'frontend/app/custom-look-and-feel/slots/page.tsx', startLine: 1, endLine: 42, prompt: 'Say hello in one short sentence.', waitAfterPromptMs: 3000 },
  { id: 'markdown-rendering', name: 'Markdown Rendering', videoName: 'MarkdownRendering', docPath: 'custom-look-and-feel/markdown', route: 'custom-look-and-feel/markdown', ideFile: 'frontend/app/custom-look-and-feel/markdown/page.tsx', startLine: 1, endLine: 40, prompt: 'Reply with a markdown h2 heading and a link to example.com.', waitAfterPromptMs: 3000 },
  { id: 'headless-ui', name: 'Fully Headless UI', videoName: 'HeadlessUi', docPath: 'custom-look-and-feel/headless-ui', route: 'custom-look-and-feel/headless-ui', ideFile: 'frontend/app/custom-look-and-feel/headless-ui/components/custom-chat.tsx', startLine: 1, endLine: 80, prompt: 'Say hello in one short sentence.', waitAfterPromptMs: 3000 },
  { id: 'programmatic-control', name: 'Programmatic Control', videoName: 'ProgrammaticControl', docPath: 'programmatic-control', route: 'programmatic-control', ideFile: 'frontend/app/programmatic-control/page.tsx', startLine: 1, endLine: 70, extraTabs: [{ filePath: 'frontend/app/programmatic-control/components/agent-trigger.tsx', startLine: 1, endLine: 25 }, { filePath: 'frontend/app/programmatic-control/layout.tsx', startLine: 1, endLine: 16 }], prompt: 'Summarize the latest sales data', waitAfterPromptMs: 3000, demoMayError: true /* HARNESS: the dashboard has no chat input, so do not wait for one */ },
  { id: 'threads-drawer', name: 'Threads Drawer', videoName: 'ThreadsDrawer', docPath: 'prebuilt-components/copilot-threads-drawer', route: 'prebuilt-components/copilot-threads-drawer', ideFile: 'frontend/app/prebuilt-components/copilot-threads-drawer/page.tsx', startLine: 1, endLine: 24, prompt: 'Say hello in one short sentence.', waitAfterPromptMs: 3000 },
  { id: 'headless-threads', name: 'Headless Threads', videoName: 'HeadlessThreads', docPath: 'headless-threads', route: 'headless-threads', ideFile: 'frontend/app/headless-threads/page.tsx', ideAddedText: "function ThreadSidebar({ onSelectThread }: { onSelectThread?: (id: string) => void }) { // HARNESS: doc's ThreadSidebar takes no props, but App passes onSelectThread", startLine: 1, endLine: 60, prompt: 'Say hello in one short sentence.', waitAfterPromptMs: 3000 },
  { id: 'frontend-tools', name: 'Frontend Tools', videoName: 'FrontendTools', docPath: 'frontend-tools', route: 'frontend-tools', ideFile: 'frontend/app/frontend-tools/page.tsx', startLine: 1, endLine: 40, extraTabs: [{ filePath: 'backend/frontend_tools.py', startLine: 1, endLine: 28 }], prompt: 'Say hello to me, my name is Alex.', waitAfterPromptMs: 3000 },
  { id: 'hitl', name: 'HITL Overview', videoName: 'Hitl', docPath: 'human-in-the-loop/index', route: 'human-in-the-loop/index', ideFile: 'frontend/app/human-in-the-loop/index/page.tsx', startLine: 1, endLine: 75, extraTabs: [{ filePath: 'frontend/app/human-in-the-loop/index/time-picker-card.tsx', startLine: 1, endLine: 40 }], prompt: 'Please book an intro call with the sales team to discuss pricing.', waitAfterPromptMs: 3000 },
  { id: 'governed-actions', name: 'Governed Action Approval UI', videoName: 'GovernedActions', docPath: 'human-in-the-loop/governed-actions', route: 'human-in-the-loop/governed-actions', ideFile: 'frontend/app/human-in-the-loop/governed-actions/governed.tsx', startLine: 1, endLine: 60, prompt: 'Send an email to bob@example.com saying hi. It needs my approval first, so ask me with the approval tool.', waitAfterPromptMs: 3000 },
  // ── END GROUP A ──
  // ── GROUP B pages ──
  { id: 'gen-ui-tool-based', name: 'Components as Tools', videoName: 'GenUiToolBased', docPath: 'generative-ui/tool-based', route: 'gen-ui-tool-based', ideFile: 'frontend/app/gen-ui-tool-based/page.tsx', startLine: 1, endLine: 31, extraTabs: [{ filePath: 'backend/chart_agent.py', startLine: 1, endLine: 41 }, { filePath: 'frontend/app/gen-ui-tool-based/bar-chart.tsx', startLine: 1, endLine: 25 }], prompt: 'Show me a bar chart of quarterly revenue: Q1 120, Q2 150, Q3 170, Q4 210.', waitAfterPromptMs: 3000 },
  { id: 'gen-ui-tool-rendering', name: 'Tool Call Rendering', videoName: 'GenUiToolRendering', docPath: 'generative-ui/tool-rendering', route: 'gen-ui-tool-rendering', ideFile: 'frontend/app/gen-ui-tool-rendering/page.tsx', startLine: 1, endLine: 37, extraTabs: [{ filePath: 'backend/tool_rendering.py', startLine: 1, endLine: 40 }], prompt: 'What is the weather in Tokyo?', waitAfterPromptMs: 3000 },
  { id: 'gen-ui-state-rendering', name: 'State Rendering', videoName: 'GenUiStateRendering', docPath: 'generative-ui/state-rendering', route: 'gen-ui-state-rendering', ideFile: 'frontend/app/gen-ui-state-rendering/page.tsx', startLine: 1, endLine: 54, extraTabs: [{ filePath: 'backend/state_rendering.py', startLine: 1, endLine: 80 }], prompt: 'Search for pizza places and coffee shops in Berlin.', waitAfterPromptMs: 4000 },
  { id: 'a2ui', name: 'A2UI', videoName: 'A2UI', docPath: 'generative-ui/a2ui', route: 'a2ui', ideFile: 'backend/a2ui_server.py', startLine: 1, endLine: 31, extraTabs: [{ filePath: 'frontend/app/api/copilotkit-a2ui/route.ts', startLine: 1, endLine: 23 }, { filePath: 'frontend/app/a2ui/page.tsx', startLine: 1, endLine: 17 }], prompt: 'I want to book a dinner table for 4 tonight, show me the time options.', waitAfterPromptMs: 4000 },
  { id: 'a2ui-dynamic-schema', name: 'Dynamic Schema A2UI', videoName: 'A2UIDynamicSchema', docPath: 'generative-ui/a2ui/dynamic-schema', route: 'a2ui-dynamic-schema', ideFile: 'frontend/app/a2ui-dynamic-schema/page.tsx', startLine: 1, endLine: 43, extraTabs: [{ filePath: 'frontend/app/a2ui-dynamic-schema/chat.tsx', startLine: 1, endLine: 12, addedText: "// HARNESS: `./chat` (Chat) is imported by the Code tab's page.tsx but never shown. Minimal stand-in: the prebuilt chat on the page's agent." }, { filePath: 'backend/b_agents/a2ui_dynamic.py', startLine: 1, endLine: 60 }, { filePath: 'frontend/app/api/copilotkit-declarative-gen-ui/route.ts', startLine: 1, endLine: 60 }], prompt: 'Show me a KPI dashboard for our sales team this quarter.', waitAfterPromptMs: 4000 },
  { id: 'a2ui-fixed-schema', name: 'Fixed Schema A2UI', videoName: 'A2UIFixedSchema', docPath: 'generative-ui/a2ui/fixed-schema', route: 'a2ui-fixed-schema', ideFile: 'frontend/app/a2ui-fixed-schema/page.tsx', startLine: 1, endLine: 38, extraTabs: [{ filePath: 'backend/b_agents/a2ui_fixed.py', startLine: 1, endLine: 97 }, { filePath: 'frontend/app/api/copilotkit-a2ui-fixed-schema/route.ts', startLine: 1, endLine: 50 }], prompt: 'Show me a United flight from SFO to JFK for $289.', waitAfterPromptMs: 4000 },
  { id: 'gen-ui-mcp-apps', name: 'MCP Apps', videoName: 'GenUiMcpApps', docPath: 'generative-ui/mcp-apps', route: 'gen-ui-mcp-apps', ideFile: 'frontend/app/api/copilotkit-mcp-apps/[[...slug]]/route.ts', startLine: 1, endLine: 42, extraTabs: [{ filePath: 'frontend/app/gen-ui-mcp-apps/page.tsx', startLine: 1, endLine: 37 }], prompt: 'Open the budget allocator so I can plan a $50,000 budget.', waitAfterPromptMs: 4000 },
  { id: 'gen-ui-open-gen-ui', name: 'Open Generative UI', videoName: 'GenUiOpenGenUi', docPath: 'generative-ui/open-generative-ui', route: 'gen-ui-open-gen-ui', ideFile: 'frontend/app/api/copilotkit-ogui/route.ts', startLine: 1, endLine: 50, extraTabs: [{ filePath: 'frontend/app/gen-ui-open-gen-ui/page.tsx', startLine: 1, endLine: 45 }, { filePath: 'backend/b_agents/open_gen_ui_agent.py', startLine: 1, endLine: 51 }], prompt: 'Build me a simple greeting card.', waitAfterPromptMs: 4000 },
  { id: 'shared-state-read', name: 'Reading agent state', videoName: 'SharedStateRead', docPath: 'shared-state/read', route: 'shared-state-read', ideFile: 'frontend/app/shared-state-read/page.tsx', startLine: 1, endLine: 50, extraTabs: [{ filePath: 'backend/shared_state_read.py', startLine: 1, endLine: 40 }], prompt: 'Please switch the language to spanish.', waitAfterPromptMs: 4000 },
  { id: 'shared-state-write', name: 'Writing agent state', videoName: 'SharedStateWrite', docPath: 'shared-state/write', route: 'shared-state-write', ideFile: 'frontend/app/shared-state-write/page.tsx', startLine: 1, endLine: 57, extraTabs: [{ filePath: 'backend/shared_state_write.py', startLine: 1, endLine: 40 }], prompt: 'Hi, what can you do?', waitAfterPromptMs: 4000 },
  { id: 'subagents', name: 'Sub-agents', videoName: 'Subagents', docPath: 'multi-agent/subagents', route: 'g6-subagents', ideFile: 'frontend/app/g6-subagents/page.tsx', startLine: 1, endLine: 41, extraTabs: [{ filePath: 'frontend/app/g6-subagents/agent-panel.tsx', startLine: 1, endLine: 52 }, { filePath: 'backend/subagents.py', startLine: 1, endLine: 62 }], prompt: 'Research how streaming works in the product and write it up in one paragraph.', waitAfterPromptMs: 5000 },
  // ── END GROUP B ──
  // ── GROUP C pages ──
  // Components & surfaces section: the doc's own TanStack runtime (/api/copilotkit-genui) on the Components
  // page; the child pages ("Already have CopilotKit running? Do step 3 only") run on the quickstart AG2 agent.
  { id: 'gen-ui-components', name: 'Components and surfaces', videoName: 'GenUiComponents', docPath: 'generative-ui/components', route: 'gen-ui-components', ideFile: 'frontend/app/api/copilotkit-genui/[[...slug]]/route.ts', startLine: 1, endLine: 40, extraTabs: [{ filePath: 'frontend/app/gen-ui-components/providers.tsx', startLine: 1, endLine: 14 }, { filePath: 'frontend/app/gen-ui-components/page.tsx', startLine: 1, endLine: 6 }], prompt: 'Compare the Starter, Team, and Enterprise plans in a table', waitAfterPromptMs: 4000 },
  { id: 'gen-ui-surfaces', name: 'Surfaces', videoName: 'GenUiSurfaces', docPath: 'generative-ui/components/surfaces', route: 'gen-ui-surfaces', ideFile: 'frontend/app/gen-ui-surfaces/featured.tsx', ideAddedText: "// HARNESS: Product and ProductRow are used by the doc but never defined on the page; minimal stubs.", startLine: 1, endLine: 24, extraTabs: [{ filePath: 'frontend/app/gen-ui-surfaces/layout.tsx', startLine: 1, endLine: 14 }], prompt: 'Show me cheap running shoes in the featured products row', waitAfterPromptMs: 4000 },
  { id: 'gen-ui-catalogs', name: 'Catalogs', videoName: 'GenUiCatalogs', docPath: 'generative-ui/components/catalogs', route: 'gen-ui-catalogs', ideFile: 'frontend/app/gen-ui-catalogs/catalog.tsx', startLine: 1, endLine: 45, prompt: 'Show a grid of two product cards: Trail Runner at $120 and Road Racer at $90', waitAfterPromptMs: 4000 },
  { id: 'gen-ui-standard-catalog', name: 'Standard catalog', videoName: 'GenUiStandardCatalog', docPath: 'generative-ui/components/standard-catalog', route: 'gen-ui-standard-catalog', ideFile: 'frontend/app/gen-ui-standard-catalog/catalog.tsx', startLine: 1, endLine: 25, prompt: 'Show a card with a short welcome text', waitAfterPromptMs: 4000 },
  { id: 'gen-ui-state-actions', name: 'State and actions', videoName: 'GenUiStateActions', docPath: 'generative-ui/components/state-and-actions', route: 'gen-ui-state-actions', ideFile: 'frontend/app/gen-ui-state-actions/catalog.tsx', startLine: 1, endLine: 45, extraTabs: [{ filePath: 'frontend/app/gen-ui-state-actions/actions.tsx', startLine: 1, endLine: 14 }], prompt: 'Show a product card for product p1 named Trail Runner', waitAfterPromptMs: 4000 },
  { id: 'gen-ui-theming', name: 'Theming', videoName: 'GenUiTheming', docPath: 'generative-ui/components/theming', route: 'gen-ui-theming', ideFile: 'frontend/app/gen-ui-theming/layout.tsx', startLine: 1, endLine: 25, prompt: 'Show a card with a title and a button', waitAfterPromptMs: 4000 },
  { id: 'gen-ui-transports', name: 'Transports', videoName: 'GenUiTransports', docPath: 'generative-ui/components/transports', route: 'gen-ui-transports', ideFile: 'frontend/app/gen-ui-transports/layout.tsx', startLine: 1, endLine: 14, prompt: 'Show a card with a title and a button', waitAfterPromptMs: 4000 },
  { id: 'gen-ui-markdown-mode', name: 'Markdown mode', videoName: 'GenUiMarkdownMode', docPath: 'generative-ui/components/markdown-mode', route: 'gen-ui-markdown-mode', ideFile: 'frontend/app/gen-ui-markdown-mode/layout.tsx', startLine: 1, endLine: 14, prompt: 'Show a card with a title and a button', waitAfterPromptMs: 4000 },
  { id: 'gen-ui-from-a2ui', name: 'Adopt from A2UI', videoName: 'GenUiFromA2ui', docPath: 'generative-ui/components/from-a2ui', route: 'gen-ui-from-a2ui', ideFile: 'frontend/app/gen-ui-from-a2ui/catalog.tsx', startLine: 1, endLine: 30, prompt: 'Show the flight from SFO San Francisco to JFK New York with airports and an arrow', waitAfterPromptMs: 4000 },
  { id: 'webmcp', name: 'WebMCP', videoName: 'WebMcp', docPath: 'webmcp', route: 'webmcp', ideFile: 'frontend/app/webmcp/OrderSearch.tsx', startLine: 1, endLine: 28, prompt: 'Search my open orders.', waitAfterPromptMs: 4000 },
  { id: 'auth', name: 'Authentication', videoName: 'Auth', docPath: 'auth', route: 'auth', ideFile: 'frontend/app/auth/layout.tsx', ideAddedText: "// HARNESS: the doc never defines `userToken`; the value its own backend snippet accepts (\"valid-token\").", startLine: 1, endLine: 22, extraTabs: [{ filePath: 'backend/auth_page.py', startLine: 1, endLine: 70 }], prompt: 'Get the account data for account acct_456.', waitAfterPromptMs: 4000 },
  // ── END GROUP C ──
]);
