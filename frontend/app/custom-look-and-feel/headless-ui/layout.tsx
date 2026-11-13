// HARNESS: the page shows no provider; wrap it in the quickstart's Providers (agent my_agent on :8063/quickstart).
// useAgent() with no id resolves the agent "default" (registered to the quickstart agent).
import { Providers } from "../../providers";

export default function Layout({ children }: { children: React.ReactNode }) {
  return <Providers>{children}</Providers>;
}
