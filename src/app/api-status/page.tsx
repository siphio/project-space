import { Metadata } from "next";

import { ApiStatus } from "@/components/blocks/api-status";

export const metadata: Metadata = {
  title: "API Status | Siphio AI",
  description: "Real-time status and documentation for Siphio AI services",
};

export default function ApiStatusPage() {
  return <ApiStatus />;
}
