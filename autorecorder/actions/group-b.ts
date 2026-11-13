/**
 * Group B finding clips (owned by the group B worker). Notes: hurried casual text (AUTORECORDER.md §2),
 * passed through humanizeNote by showFinding. Evidence `text` must be visible on the RENDERED doc page.
 */
import { type DocEvidence } from './doc-evidence';

export const NOTES_B: Record<string, string> = {
  'a2ui-dynamic-schema': `page shows page.tsx importing chat from ./chat and renderers using badge and button from _components
none of those files are on the page so i had to make them up
then asking for a sales kpi dashboard,the agent calls generate_a2ui
but the card just says a2ui render error cannot read properties of undefined reading map
no dashboard renders,every run
page also talks about langgraph on the ag2 page`,
  'shared-state-write': `page says toggle the language button and talk to the agent,it should match the state
i clicked toggle,ui shows language spanish
then asked the agent what language it should answer in
it says english every time,and the ui flips back to english on some runs
the agent never sees what the ui wrote,so writing state does nothing`,
};

export const EVIDENCE_B: Record<string, DocEvidence[]> = {
  'a2ui-dynamic-schema': [
    { text: 'import { Chat } from "./chat";', caption: 'page.tsx imports ./chat, never shown' },
    { text: 'The tool call streams through LangGraph as TOOL_CALL_ARGS events.', caption: 'LangGraph wording on the AG2 page' },
  ],
  'shared-state-write': [
    { text: 'agent.setState({ ...(agent.state ?? {}), language: state.language === "english" ? "spanish" : "english" });', caption: 'UI write' },
    { text: "Try toggling the language button and talking to your agent. You'll see the language change to match the agent's state.", caption: 'promised result' },
  ],
};

/** Level-2 pages (already reported by the team): clip ends after the demo. */
export const KNOWN_B: string[] = ['a2ui-fixed-schema'];
