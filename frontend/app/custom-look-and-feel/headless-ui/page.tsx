"use client";
// HARNESS: the page never shows where CustomChat is mounted; a full-height page renders it.
import { CustomChat } from "./components/custom-chat";

export default function HeadlessUiPage() {
  return (
    <div style={{ height: "100vh" }}>
      <CustomChat />
    </div>
  );
}
