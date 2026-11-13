"use client"; // HARNESS: not on the doc. Verbatim (without it) the route 500s: "Attempted to call defineToolCallRenderer() from the server but defineToolCallRenderer is on the client." (minor: missing "use client")
// --- Doc: https://docs.copilotkit.ai/ag2/programmatic-control ("Rendering Tool Calls", components/weather-tool.tsx, verbatim) ---
import { defineToolCallRenderer } from "@copilotkit/react-core/v2";

export const weatherToolRender = defineToolCallRenderer({
  name: "get_weather",
  render: ({ args, status }) => {
    return <WeatherCard location={args.location} status={status} />;
  },
});

function WeatherCard({
  location,
  status,
}: {
  location?: string;
  status: string;
}) {
  return (
    <div className="rounded-lg border p-6 shadow-sm">
      <h3 className="text-xl font-semibold">Weather in {location}</h3>
      <div className="mt-4">
        <span className="text-5xl font-light">70°F</span>
      </div>
      {status === "executing" && <div className="spinner">Loading...</div>}
    </div>
  );
}
