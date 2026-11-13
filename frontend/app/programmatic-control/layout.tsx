"use client"; // HARNESS: not on the doc. Verbatim (without it) the route 500s: "Attempted to call defineToolCallRenderer() from the server but defineToolCallRenderer is on the client." (minor: missing "use client")
// --- Doc: https://docs.copilotkit.ai/ag2/programmatic-control ("Register your tool renderers with CopilotKit", layout.tsx, verbatim) ---
// HARNESS: used as this route's layout (the doc calls it RootLayout); no agent prop, so useAgent() resolves "default".
import { CopilotKit } from "@copilotkit/react-core/v2";
import { weatherToolRender } from "./components/weather-tool";

export default function RootLayout({ children }) {
  return (
    <CopilotKit
      runtimeUrl="/api/copilotkit"
      renderToolCalls={[weatherToolRender]}
    >
      {children}
    </CopilotKit>
  );
}
