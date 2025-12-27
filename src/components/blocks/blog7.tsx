import { ArrowRight } from "lucide-react";

import { cn } from "@/lib/utils";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";

interface Post {
  id: string;
  title: string;
  summary: string;
  label: string;
  author: string;
  published: string;
  url: string;
  image: string;
}

interface Blog7Props {
  tagline?: string;
  heading?: string;
  description?: string;
  buttonText?: string;
  buttonUrl?: string;
  posts?: Post[];
  className?: string;
}

const Blog7 = ({
  tagline = "Latest Updates",
  heading = "Software We Own & Operate",
  description = "These aren't client projects—they're ours. Built from scratch, fully managed, and continuously improved. Here's what's currently live in our product suite.",
  buttonText = "View all articles",
  buttonUrl = "https://shadcnblocks.com",
  posts = [
    {
      id: "post-1",
      title: "Spending Insights - Web App",
      summary:
        "AI-driven financial clarity. Connect your accounts and let the AI surface spending patterns, flag anomalies, and deliver insights you'd actually miss. Track every subscription in one place, get alerts before they renew, and see exactly where your money goes—all on a dashboard that makes sense of your finances at a glance.",
      label: "Tutorial",
      author: "Sarah Chen",
      published: "1 Jan 2024",
      url: "https://shadcnblocks.com",
      image: "/spending-inisghts.png",
    },
    {
      id: "post-2",
      title: "Checklist Manager - Web App",
      summary:
        "AI-native task management built for clarity. Organize your checklists while intelligent agents analyze completion patterns, predict blockers, and recommend smarter workflows. Track streaks, visualize progress, and let AI surface the insights you'd miss—all in one focused dashboard.",
      label: "Accessibility",
      author: "Marcus Rodriguez",
      published: "1 Jan 2024",
      url: "https://shadcnblocks.com",
      image: "/checklist-master.png",
    },
    {
      id: "post-3",
      title: "AI Agents - Workflows & Use Cases",
      summary:
        "Genuinely intelligent agents, not glorified chatbots. Our AI understands context, reasons through complexity, and adapts to situations it hasn't seen before. They synthesize information across systems, spot patterns humans miss, and make decisions grounded in your business reality. Intelligence that scales expertise, not just tasks.",
      label: "Design Systems",
      author: "Emma Thompson",
      published: "1 Jan 2024",
      url: "https://shadcnblocks.com",
      image: "/ai-agent.png",
    },
  ],
  className,
}: Blog7Props) => {
  return (
    <section className={cn("py-32", className)}>
      <div className="container mx-auto flex flex-col items-center gap-16 lg:px-16">
        <div className="text-center">
          <Badge variant="secondary" className="mb-6 bg-orange-400/40 text-black hover:bg-orange-400/50">
            {tagline}
          </Badge>
          <h2 className="mb-3 text-3xl font-semibold text-pretty md:mb-4 md:text-4xl lg:mb-6 lg:max-w-3xl lg:text-5xl">
            {heading}
          </h2>
          <p className="mb-8 text-muted-foreground md:text-base lg:max-w-2xl lg:text-lg">
            {description}
          </p>
          <Button variant="link" className="w-full sm:w-auto" asChild>
            <a href={buttonUrl} target="_blank">
              {buttonText}
              <ArrowRight className="ml-2 size-4" />
            </a>
          </Button>
        </div>
        <div className="grid grid-cols-3 gap-4 lg:gap-8">
          {posts.map((post) => (
            <Card
              key={post.id}
              className="grid grid-rows-[auto_auto_1fr_auto] overflow-hidden pt-0"
            >
              <div className="aspect-16/9 w-full">
                <a
                  href={post.url}
                  target="_blank"
                  className="transition-opacity duration-200 fade-in hover:opacity-70"
                >
                  <img
                    src={post.image}
                    alt={post.title}
                    className="h-full w-full object-cover object-center"
                  />
                </a>
              </div>
              <CardHeader>
                <h3 className="text-lg font-semibold hover:underline md:text-xl">
                  <a href={post.url} target="_blank">
                    {post.title}
                  </a>
                </h3>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{post.summary}</p>
              </CardContent>
              <CardFooter>
                <a
                  href={post.url}
                  target="_blank"
                  className="flex items-center text-foreground hover:underline"
                >
                  Read more
                  <ArrowRight className="ml-2 size-4" />
                </a>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export { Blog7 };
