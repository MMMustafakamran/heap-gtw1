"use client"; // HARNESS: hooks need a client component.
// Doc: https://docs.copilotkit.ai/ag2/multi-agent/subagents, components/agent-panel.tsx (verbatim below)
import type {
  SubagentErrorEvent,
  SubagentFinishedEvent,
  SubagentStartedEvent,
} from "@ag-ui/client";
import { useAgent } from "@copilotkit/react-core/v2";
import { useEffect, useState } from "react";

export function SubagentPanel() {
  const { agent } = useAgent({ agentId: "my_agent" });
  const [started, setStarted] = useState<SubagentStartedEvent[]>([]);
  const [finished, setFinished] = useState<Record<string, SubagentFinishedEvent>>({});
  const [failed, setFailed] = useState<Record<string, SubagentErrorEvent>>({});

  useEffect(() => {
    const subscription = agent.subscribe({
      onRunStartedEvent: () => {
        setStarted([]);
        setFinished({});
        setFailed({});
      },
      onSubagentStartedEvent: ({ event }) => setStarted((all) => [...all, event]),
      onSubagentFinishedEvent: ({ event }) =>
        setFinished((all) => ({ ...all, [event.subagentRunId]: event })),
      onSubagentErrorEvent: ({ event }) =>
        setFailed((all) => ({ ...all, [event.subagentRunId]: event })),
    });
    return () => subscription.unsubscribe();
  }, [agent]);

  return (
    <ul>
      {started.map((run) => (
        <li key={run.subagentRunId}>
          {run.name}:{" "}
          {failed[run.subagentRunId] ? "failed" : finished[run.subagentRunId] ? "done" : "running…"}
        </li>
      ))}
    </ul>
  );
}
