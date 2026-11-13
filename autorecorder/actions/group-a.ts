/**
 * Group A finding clips (owned by the group A worker). Notes: hurried casual text (AUTORECORDER.md §2),
 * passed through humanizeNote by showFinding. Evidence `text` must be visible on the RENDERED doc page.
 */
import { type DocEvidence } from './doc-evidence';

export const NOTES_A: Record<string, string> = {
  'headless-threads': [
    'thread sidebar snippet lists threads for agentId my-agent',
    'but the App snippet renders CopilotChat with no agentId so the chat runs on the default agent',
    'so after chatting the sidebar stays empty, even after a reload',
    'and ThreadSidebar never calls onSelectThread so a row couldnt open a thread anyway',
    'page never says which agent both should share so the list cant work as written',
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
