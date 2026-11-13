"use client"; // HARNESS: the doc snippet omits it; hooks need a client component in an App Router page.

// --- Doc: https://docs.copilotkit.ai/ag2/frontend-tools, page.tsx (verbatim from here) ---
import { z } from "zod";
import { useFrontendTool } from "@copilotkit/react-core/v2" // [!code highlight]

export function Page() {
  // ...

  // [!code highlight:12]
  useFrontendTool({
    name: "sayHello",
    description: "Say hello to the user",
    parameters: z.object({
      name: z.string().describe("The name of the user to say hello to"),
    }),
    handler: async ({ name }) => {
      alert(`Hello, ${name}!`);
      return `Said hello to ${name}!`;
    },
  });

  // ...
}
// --- Doc snippet ends here ---

// HARNESS: the doc says "Setup CopilotKit" is covered by the quickstart and elides the rest ("// ...").
// Minimal completion: the provider (runtime + the page's agent.py on 8063) and a chat, with Page() returning it.
import { CopilotKit, CopilotChat } from "@copilotkit/react-core/v2";

function PageWithChat() {
  Page();
  return <CopilotChat />;
}

export default function FrontendToolsRoute() {
  return (
    <CopilotKit runtimeUrl="/api/copilotkit" agent="frontend_tools">
      <div style={{ height: "100vh" }}><PageWithChat /></div>
    </CopilotKit>
  );
}
