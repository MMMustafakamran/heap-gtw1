/**
 * Group A finding clips (owned by the group A worker). Notes: hurried casual text (AUTORECORDER.md §2),
 * passed through humanizeNote by showFinding. Evidence `text` must be visible on the RENDERED doc page.
 */
import { type DocEvidence } from './doc-evidence';

export const NOTES_A: Record<string, string> = {
  'headless-threads': [
    "page says the thread sidebar lists ur conversations and u can switch between them",
    "chatted a bit, sidebar stays empty,even after reload",
    "sidebar uses useThreads with agentId my-agent but the chat has no agentId so it runs on the default agent",
    "and ThreadSidebar never calls onSelectThread so a row cant open a thread anyway",
  ].join('\n'),
};

export const EVIDENCE_A: Record<string, DocEvidence[]> = {
  'headless-threads': [
    { text: 'useThreads({ agentId: "my-agent" })', caption: 'sidebar lists my-agent threads' },
    { text: '<CopilotChat threadId={activeThreadId} />', caption: 'chat has no agentId (default agent)' },
  ],
};

/** Level-2 pages (already reported by the team): clip ends after the demo. */
export const KNOWN_A: string[] = ['programmatic-control'];
