"use client";

import { useState } from "react";
import { ArrowLeft, Calendar, ChevronDown } from "lucide-react";
import Link from "next/link";

import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { AppData, AppUpdate } from "@/data/apps";

interface NoticeBoardProps {
  app: AppData;
  className?: string;
}

const NoticeBoard = ({ app, className }: NoticeBoardProps) => {
  return (
    <section className={cn("min-h-screen bg-background", className)}>
      {/* Header with back button */}
      <div className="border-b">
        <div className="container py-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="size-4" />
            Back to Home
          </Link>
        </div>
      </div>

      <div className="container py-12">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Left Side - App Info */}
          <div className="space-y-8">
            {/* Banner Image */}
            <div className="relative overflow-hidden rounded-2xl border shadow-lg">
              <img
                src={app.banner}
                alt={app.name}
                className="w-full h-64 object-cover"
              />
            </div>

            {/* App Header */}
            <div className="flex items-start gap-4">
              <div className="size-16 rounded-xl overflow-hidden border shadow-sm flex-shrink-0">
                <img
                  src={app.icon}
                  alt={`${app.name} icon`}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight">{app.name}</h1>
                <p className="text-muted-foreground mt-1">{app.tagline}</p>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-4">
              <p className="text-lg text-foreground/90 leading-relaxed">
                {app.description}
              </p>
            </div>

            {/* Tech Stack */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Tech Stack
              </h3>
              <div className="flex flex-wrap gap-2">
                {app.techStack.map((tech) => (
                  <Badge
                    key={tech}
                    variant="secondary"
                    className="bg-orange-500/10 text-orange-700 hover:bg-orange-500/20"
                  >
                    {tech}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Why We Built This */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Why We Built This
              </h3>
              <p className="text-foreground/80 leading-relaxed">{app.whyBuilt}</p>
            </div>

            {/* How We Built This */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                How We Built This
              </h3>
              <p className="text-foreground/80 leading-relaxed">{app.howBuilt}</p>
            </div>
          </div>

          {/* Right Side - Updates */}
          <div className="lg:sticky lg:top-8 lg:self-start">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Updates</h2>
                <span className="text-sm text-muted-foreground">
                  {app.updates.length} update{app.updates.length !== 1 ? "s" : ""}
                </span>
              </div>

              {/* Scrollable Updates Container */}
              <div className="max-h-[calc(100vh-200px)] overflow-y-auto pr-2 space-y-4 scrollbar-thin">
                {app.updates.length === 0 ? (
                  <Card className="border-dashed">
                    <CardContent className="py-8 text-center text-muted-foreground">
                      No updates yet. Check back soon!
                    </CardContent>
                  </Card>
                ) : (
                  app.updates.map((update) => (
                    <UpdateCard key={update.id} update={update} />
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const UpdateCard = ({ update }: { update: AppUpdate }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const formattedDate = new Date(update.date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <Card
      className={cn(
        "transition-all duration-300 cursor-pointer hover:shadow-md hover:border-orange-500/30",
        isExpanded && "border-orange-500/50 shadow-md"
      )}
      onClick={() => setIsExpanded(!isExpanded)}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="size-4 text-orange-500" />
            <time dateTime={update.date}>{formattedDate}</time>
          </div>
          <ChevronDown
            className={cn(
              "size-4 text-muted-foreground transition-transform duration-300",
              isExpanded && "rotate-180"
            )}
          />
        </div>
      </CardHeader>
      <CardContent>
        <h3 className="font-semibold text-foreground">{update.title}</h3>
        <div
          className={cn(
            "grid transition-all duration-300 ease-in-out",
            isExpanded ? "grid-rows-[1fr] opacity-100 mt-4" : "grid-rows-[0fr] opacity-0"
          )}
        >
          <div className="overflow-hidden">
            {update.description && (
              <p className="text-sm text-muted-foreground leading-relaxed">
                {update.description}
              </p>
            )}
            {!update.description && (
              <p className="text-sm text-muted-foreground italic">
                No additional details for this update.
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export { NoticeBoard };
