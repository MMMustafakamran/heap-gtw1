/**
 * Group B finding clips (owned by the group B worker). Notes: hurried casual text (AUTORECORDER.md §2),
 * passed through humanizeNote by showFinding. Evidence `text` must be visible on the RENDERED doc page.
 */
import { type DocEvidence } from './doc-evidence';

export const NOTES_B: Record<string, string> = {
  'a2ui-dynamic-schema': [
    "page says the agent generates the dashboard ui on the fly with a2ui",
    "asked for a sales kpi dashboard,agent calls generate_a2ui but the card says a2ui render error cannot read properties of undefined reading map",
    "same every run, no dashboard",
    "page imports ./chat, badge, button and _loop_cap which are never shown, i had to make them up",
    "and it talks about langgraph on the ag2 page",
  ].join('\n'),
  'shared-state-write': [
    "page says toggle the language and the agent will match the state",
    "toggled to spanish, ui shows spanish but agent still says english every time,sometimes the ui flips back",
    "the setState write never reaches the agent and the page doesnt show how the ag2 agent reads it",
  ].join('\n'),
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
