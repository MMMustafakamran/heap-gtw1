/**
 * Group C finding clips (owned by the group C worker). Notes: hurried casual text (AUTORECORDER.md §2),
 * passed through humanizeNote by showFinding. Evidence `text` must be visible on the RENDERED doc page.
 */
import { type DocEvidence } from './doc-evidence';

export const NOTES_C: Record<string, string> = {
  auth: [
    "page says the authorization property gets forwarded to the ag2 chat endpoint as a request header",
    "put the token in properties like the frontend setup shows,chat stays empty no reply",
    "backend log is all 401 unauthorized, the header never arrives",
    "so the forwarding the page promises doesnt happen, also userToken is never defined on the page",
  ].join('\n'),
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
