export interface AppUpdate {
  id: string;
  date: string;
  title: string;
  description?: string;
}

export interface AppData {
  slug: string;
  name: string;
  icon: string;
  banner: string;
  tagline: string;
  description: string;
  techStack: string[];
  whyBuilt: string;
  howBuilt: string;
  updates: AppUpdate[];
}

export const apps: Record<string, AppData> = {
  "spending-insights": {
    slug: "spending-insights",
    name: "Spending Insights",
    icon: "/spending-inisghts.png",
    banner: "/spending-inisghts.png",
    tagline: "AI-driven financial clarity",
    description: "Connect your accounts and let the AI surface spending patterns, flag anomalies, and deliver insights you'd actually miss. Track every subscription in one place, get alerts before they renew, and see exactly where your money goes.",
    techStack: ["Next.js", "TypeScript", "Tailwind CSS", "Supabase", "Claude AI", "Plaid API"],
    whyBuilt: "We built Spending Insights because managing personal finances shouldn't require a spreadsheet degree. Traditional budgeting apps show you numbers—we wanted an app that actually thinks about your money and surfaces the patterns you'd miss.",
    howBuilt: "Built with Next.js for a fast, responsive frontend. Supabase handles authentication and real-time data. Claude AI powers the intelligent insights engine, analyzing transactions to find patterns and anomalies. Plaid API securely connects to bank accounts.",
    updates: [
      {
        id: "1",
        date: "2024-12-27",
        title: "Initial release of Spending Insights",
        description: "We're excited to announce the official launch of Spending Insights! This release includes the core dashboard with real-time spending analytics, AI-powered categorization of transactions, and our signature anomaly detection system. Users can connect their bank accounts securely via Plaid and immediately start seeing insights about their spending patterns. The AI engine analyzes historical data to establish baselines and flag unusual activity."
      },
      {
        id: "2",
        date: "2024-12-26",
        title: "Added subscription tracking feature",
        description: "Managing subscriptions just got easier. This update introduces a dedicated subscription tracker that automatically detects recurring charges from your transaction history. You'll get notifications before renewals, see your total monthly subscription spend at a glance, and can mark subscriptions as 'keep' or 'review' to help with budgeting decisions. The AI also identifies potential duplicate subscriptions and forgotten trials that are still charging."
      }
    ]
  },
  "checklist-manager": {
    slug: "checklist-manager",
    name: "Checklist Manager",
    icon: "/checklist-master.png",
    banner: "/checklist-master.png",
    tagline: "AI-native task management built for clarity",
    description: "Organize your checklists while intelligent agents analyze completion patterns, predict blockers, and recommend smarter workflows. Track streaks, visualize progress, and let AI surface the insights you'd miss.",
    techStack: ["Next.js", "TypeScript", "Tailwind CSS", "Supabase", "Claude AI"],
    whyBuilt: "Task management apps are everywhere, but most just store your todos. We wanted something that actually learns from your habits, predicts when you'll get stuck, and helps you build better workflows over time.",
    howBuilt: "Next.js powers the frontend with server components for optimal performance. Supabase provides real-time sync across devices. Claude AI analyzes task patterns to provide intelligent recommendations and predict potential blockers.",
    updates: [
      {
        id: "1",
        date: "2024-12-27",
        title: "Initial release of Checklist Manager",
        description: "Checklist Manager is now live! This first release brings you a clean, focused interface for creating and managing checklists with full real-time sync across all your devices. The AI completion patterns feature is active from day one—it starts learning your habits immediately to provide smarter recommendations over time. Includes streak tracking, progress visualization, and the ability to organize checklists into categories. Dark mode support included."
      }
    ]
  },
  "ai-agents": {
    slug: "ai-agents",
    name: "AI Agents",
    icon: "/ai-agent.png",
    banner: "/ai-agent.png",
    tagline: "Genuinely intelligent agents, not glorified chatbots",
    description: "Our AI understands context, reasons through complexity, and adapts to situations it hasn't seen before. They synthesize information across systems, spot patterns humans miss, and make decisions grounded in your business reality.",
    techStack: ["Python", "Claude AI", "LangChain", "FastAPI", "PostgreSQL"],
    whyBuilt: "Most 'AI agents' are just chatbots with fancy prompts. We built genuine reasoning agents that can handle ambiguity, maintain context across complex workflows, and actually think through problems rather than pattern-match responses.",
    howBuilt: "Built on Claude's advanced reasoning capabilities with custom orchestration layers. LangChain manages agent workflows and tool integration. FastAPI provides high-performance API endpoints. PostgreSQL stores conversation history and agent state.",
    updates: [
      {
        id: "1",
        date: "2024-12-27",
        title: "AI Agents documentation published",
        description: "We've released comprehensive documentation covering everything you need to know about our AI agent capabilities. This includes detailed guides on agent workflows, integration patterns, and best practices for deploying agents in production environments. The documentation covers our reasoning engine architecture, how agents maintain context across complex multi-step tasks, and examples of real-world use cases. API reference documentation is included with code samples in Python and TypeScript."
      }
    ]
  }
};

export function getAppBySlug(slug: string): AppData | undefined {
  return apps[slug];
}

export function getAllApps(): AppData[] {
  return Object.values(apps);
}
