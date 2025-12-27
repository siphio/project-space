import { Code, RefreshCw, Brain } from "lucide-react";
import React from "react";

import { cn } from "@/lib/utils";

interface ExperienceItem {
  title: string;
  details: string;
  icon: React.ReactNode;
  description: string;
}

interface Experience5Props {
  title?: string;
  experience?: ExperienceItem[];
  className?: string;
}

const Experience5 = ({
  title = "Our Approach",
  experience = [
    {
      title: "Claude Code Native",
      details: "Agentic Workflows • Context Engineering • System Orchestration",
      icon: <Code className="size-5" />,
      description:
        "We don't write code line by line anymore. Claude Code is embedded in everything we do. While others are still experimenting, we're endlessly developing our own systems - allowing us to ship validated, production-ready builds in days. The real skill now is architecture, task and context management, and knowing exactly how you want your codebase structured.",
    },
    {
      title: "Always Current",
      details: "Continuous Learning • Latest Models • Real-World Testing",
      icon: <RefreshCw className="size-5" />,
      description:
        "The AI space moves weekly. New model drops, new capabilities, new ways to break things. We're not reading about it - we're in it daily, testing what works and ditching what doesn't. By the time most agencies catch on to a technique, we've already stress-tested it across real projects and moved on.",
    },
    {
      title: "Senior Decisions, AI Execution",
      details: "Architecture-First • Clean Systems • No Bloat",
      icon: <Brain className="size-5" />,
      description:
        "Experience matters more now than ever. AI can write code all day - but it can't tell you what's going to break at scale or what shortcuts will haunt you in six months. We've seen enough projects to know what actually holds up. You get systems that are built right the first time, at a speed that used to be impossible.",
    },
  ],
  className,
}: Experience5Props) => {
  return (
    <section className={cn("py-16 md:py-32", className)}>
      <div className="container">
        <div className="mx-auto max-w-7xl">
          <h2 className="mb-12 font-serif text-4xl leading-tight font-medium md:text-7xl">
            {title}
          </h2>

          <div className="space-y-8">
            {experience.map(
              ({ title, details, icon, description }, idx) => (
                <div
                  key={idx}
                  className="border-b border-border pb-6 last:border-b-0"
                >
                  <div className="flex flex-col gap-4">
                    <div>
                      <div className="mb-2 flex items-center gap-3">
                        <span className="text-foreground">{icon}</span>
                        <h3 className="text-xl">{title}</h3>
                      </div>
                      <p className="mb-3 text-sm text-muted-foreground">
                        {details}
                      </p>
                      <p className="text-sm leading-relaxed text-muted-foreground">
                        {description}
                      </p>
                    </div>
                  </div>
                </div>
              ),
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export { Experience5 };
