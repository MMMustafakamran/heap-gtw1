/**
 * Group C finding clips (owned by the group C worker). Notes: hurried casual text (AUTORECORDER.md §2),
 * passed through humanizeNote by showFinding. Evidence `text` must be visible on the RENDERED doc page.
 */
import { type DocEvidence } from './doc-evidence';

export const NOTES_C: Record<string, string> = {
  auth: `page says the authorization property gets forwarded to the ag2 chat endpoint as a request header
so i put the token in properties on copilotkit like the frontend setup shows
and used the self hosted chat code from the same page
but the header never shows up, backend log is all 401 unauthorized
the chat just stays empty, no reply on any run
so following the page u cant get an authenticated run at all`,
  // Level 2 (KNOWN_C): the clip ends after the demo, no Notepad. Notes kept for the recorder log only.
  'gen-ui-components': `doc runtime route from step 2, chat never answers, chat needs a threadid error in console`,
  'gen-ui-surfaces': `surface never renders, agent says it cant access the product catalog`,
};

export const EVIDENCE_C: Record<string, DocEvidence[]> = {
  auth: [
    { text: 'authorization: userToken, // forwarded to AG2 /chat', caption: 'frontend setup: token passed in properties' },
    { text: 'is forwarded to your AG2 /chat endpoint as a request header', caption: 'claim: properties.authorization becomes a request header (it does not: 401 every run)' },
  ],
};

/** Level-2 pages (already reported by the team): clip ends after the demo. */
export const KNOWN_C: string[] = ['gen-ui-components', 'gen-ui-surfaces'];
