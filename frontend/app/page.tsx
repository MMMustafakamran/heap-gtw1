// HARNESS: plain index of the doc-page routes. The doc's app/page.tsx lives at app/quickstart/page.tsx.
// Each page route wraps itself in its own <CopilotKit> provider pointed at /api/copilotkit.
import Link from "next/link";

const ROUTES: { href: string; label: string }[] = [
  { href: "/quickstart", label: "Quickstart (use an existing agent)" },
  // page agents: add { href: "/<route>", label: "<doc page title>" } here
  { href: "/prebuilt-components", label: "Prebuilt Components" },
  { href: "/prebuilt-components/chat", label: "CopilotChat" },
  { href: "/custom-look-and-feel/slots", label: "Slots" },
  { href: "/custom-look-and-feel/markdown", label: "Markdown Rendering" },
  { href: "/custom-look-and-feel/headless-ui", label: "Fully Headless UI" },
  { href: "/programmatic-control", label: "Programmatic Control" },
  { href: "/prebuilt-components/copilot-threads-drawer", label: "Threads Drawer" },
  { href: "/headless-threads", label: "Headless Threads" },
  { href: "/frontend-tools", label: "Frontend Tools" },
  { href: "/human-in-the-loop/index", label: "HITL Overview" },
  { href: "/human-in-the-loop/governed-actions", label: "Governed Action Approval UI" },
];

export default function Index() {
  return (
    <main style={{ padding: 24, fontFamily: "sans-serif" }}>
      <h1>AG2-React QA harness</h1>
      <ul>
        {ROUTES.map((r) => (
          <li key={r.href}><Link href={r.href}>{r.label}</Link></li>
        ))}
      </ul>
    </main>
  );
}
