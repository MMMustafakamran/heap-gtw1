"use client"; // HARNESS: hooks need a client component in an App Router page.

// --- Doc: https://docs.copilotkit.ai/ag2/generative-ui/tool-based (verbatim) ---
import { useComponent } from "@copilotkit/react-core/v2";
import { z } from "zod";
// --- end ---
import { CopilotKit, CopilotChat } from "@copilotkit/react-core/v2"; // HARNESS: provider + chat (quickstart setup)
import { BarChart, barChartPropsSchema } from "./bar-chart"; // HARNESS: never shown on the page

function Chat() {
  // --- Doc: src/app/demos/gen-ui-tool-based/page.tsx (verbatim) ---
  useComponent({
    name: "render_bar_chart",
    description: "Display a bar chart with labeled numeric values.",
    parameters: barChartPropsSchema,
    render: BarChart,
  });
  // --- end ---
  return <CopilotChat agentId="my_agent" />;
}

// HARNESS: provider pointed at the group B runtime, where "my_agent" is the page's chart_agent.py (8066/tool-based).
export default function ToolBasedPage() {
  void z;
  return (
    <CopilotKit runtimeUrl="/api/copilotkit-b" agent="my_agent">
      <div style={{ height: "100vh" }}><Chat /></div>
    </CopilotKit>
  );
}
