"use client";
// HARNESS: `BarChart` and `barChartPropsSchema` are used by the page's useComponent snippet but never shown.
// The page only says the example "uses Recharts". Props follow the doc's SYSTEM_PROMPT: title + data[{label, value}].
import { z } from "zod";
import { Bar, BarChart as RBarChart, Tooltip, XAxis, YAxis } from "recharts";

export const barChartPropsSchema = z.object({
  title: z.string(),
  data: z.array(z.object({ label: z.string(), value: z.number() })),
});

export function BarChart(props: Partial<z.infer<typeof barChartPropsSchema>>) {
  return (
    <div style={{ border: "1px solid #ddd", borderRadius: 8, padding: 12, background: "#fff" }}>
      <h3 style={{ fontWeight: 600 }}>{props.title}</h3>
      <RBarChart width={460} height={240} data={props.data ?? []}>
        <XAxis dataKey="label" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="value" fill="#6366f1" />
      </RBarChart>
    </div>
  );
}
