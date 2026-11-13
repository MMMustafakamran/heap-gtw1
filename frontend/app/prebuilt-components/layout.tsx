// --- Doc: https://docs.copilotkit.ai/ag2/prebuilt-components ("Setup", layout.tsx, verbatim) ---
import "@copilotkit/react-core/v2/styles.css";
// --- doc ends ---

// HARNESS: the page says the quickstart already set up the provider; the quickstart's Providers (agent my_agent on :8063/quickstart).
import { Providers } from "../providers";

export default function Layout({ children }: { children: React.ReactNode }) {
  return <Providers>{children}</Providers>;
}
