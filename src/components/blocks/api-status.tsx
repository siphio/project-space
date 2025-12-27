"use client";

import { useState } from "react";
import { ArrowLeft, CheckCircle, Circle, AlertCircle, Clock, Code, Server, Database, Zap, Copy, Check } from "lucide-react";
import Link from "next/link";

import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ApiStatusProps {
  className?: string;
}

interface ServiceStatus {
  name: string;
  status: "operational" | "degraded" | "outage";
  uptime: string;
  lastChecked: string;
  description: string;
  endpoints: Endpoint[];
}

interface Endpoint {
  method: "GET" | "POST" | "PUT" | "DELETE";
  path: string;
  description: string;
  responseTime: string;
  status: "operational" | "degraded" | "outage";
}

const services: ServiceStatus[] = [
  {
    name: "Spending Insights",
    status: "operational",
    uptime: "99.98%",
    lastChecked: "2 minutes ago",
    description: "AI-powered financial analytics and spending pattern detection",
    endpoints: [
      {
        method: "GET",
        path: "/api/spending/transactions",
        description: "Retrieve user transactions with AI categorization",
        responseTime: "120ms",
        status: "operational",
      },
      {
        method: "GET",
        path: "/api/spending/insights",
        description: "Get AI-generated spending insights and patterns",
        responseTime: "250ms",
        status: "operational",
      },
      {
        method: "POST",
        path: "/api/spending/connect",
        description: "Connect a new bank account via Plaid",
        responseTime: "1.2s",
        status: "operational",
      },
      {
        method: "GET",
        path: "/api/spending/subscriptions",
        description: "List detected recurring subscriptions",
        responseTime: "180ms",
        status: "operational",
      },
    ],
  },
  {
    name: "Checklist Manager",
    status: "operational",
    uptime: "99.95%",
    lastChecked: "2 minutes ago",
    description: "AI-native task management with intelligent workflow recommendations",
    endpoints: [
      {
        method: "GET",
        path: "/api/checklists",
        description: "Retrieve all user checklists",
        responseTime: "85ms",
        status: "operational",
      },
      {
        method: "POST",
        path: "/api/checklists",
        description: "Create a new checklist",
        responseTime: "95ms",
        status: "operational",
      },
      {
        method: "GET",
        path: "/api/checklists/insights",
        description: "Get AI-powered productivity insights",
        responseTime: "200ms",
        status: "operational",
      },
      {
        method: "PUT",
        path: "/api/checklists/:id/items",
        description: "Update checklist items",
        responseTime: "75ms",
        status: "operational",
      },
    ],
  },
];

const StatusIcon = ({ status }: { status: "operational" | "degraded" | "outage" }) => {
  switch (status) {
    case "operational":
      return <CheckCircle className="size-5 text-green-500" />;
    case "degraded":
      return <AlertCircle className="size-5 text-yellow-500" />;
    case "outage":
      return <Circle className="size-5 text-red-500 fill-red-500" />;
  }
};

const StatusBadge = ({ status }: { status: "operational" | "degraded" | "outage" }) => {
  const variants = {
    operational: "bg-green-500/10 text-green-700 border-green-500/20",
    degraded: "bg-yellow-500/10 text-yellow-700 border-yellow-500/20",
    outage: "bg-red-500/10 text-red-700 border-red-500/20",
  };

  const labels = {
    operational: "Operational",
    degraded: "Degraded",
    outage: "Outage",
  };

  return (
    <Badge variant="outline" className={cn("font-medium", variants[status])}>
      {labels[status]}
    </Badge>
  );
};

const MethodBadge = ({ method }: { method: "GET" | "POST" | "PUT" | "DELETE" }) => {
  const variants = {
    GET: "bg-blue-500/10 text-blue-700",
    POST: "bg-green-500/10 text-green-700",
    PUT: "bg-orange-500/10 text-orange-700",
    DELETE: "bg-red-500/10 text-red-700",
  };

  return (
    <Badge variant="secondary" className={cn("font-mono text-xs", variants[method])}>
      {method}
    </Badge>
  );
};

const CodeBlock = ({ children }: { children: string }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(children);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group">
      <pre className="bg-muted rounded-lg p-4 overflow-x-auto text-sm font-mono">
        <code>{children}</code>
      </pre>
      <button
        onClick={handleCopy}
        className="absolute top-2 right-2 p-2 rounded-md bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        {copied ? <Check className="size-4 text-green-500" /> : <Copy className="size-4" />}
      </button>
    </div>
  );
};

const ApiStatus = ({ className }: ApiStatusProps) => {
  const allOperational = services.every((s) => s.status === "operational");

  return (
    <section className={cn("min-h-screen bg-background", className)}>
      {/* Header */}
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
        {/* Page Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-orange-500/10">
              <Server className="size-6 text-orange-500" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">API Status</h1>
          </div>
          <p className="text-muted-foreground max-w-2xl">
            Real-time status and documentation for Siphio AI services. Monitor uptime,
            response times, and explore our API endpoints.
          </p>
        </div>

        {/* Overall Status Banner */}
        <Card className={cn(
          "mb-8 border-2",
          allOperational ? "border-green-500/30 bg-green-500/5" : "border-yellow-500/30 bg-yellow-500/5"
        )}>
          <CardContent className="py-6">
            <div className="flex items-center gap-4">
              {allOperational ? (
                <CheckCircle className="size-8 text-green-500" />
              ) : (
                <AlertCircle className="size-8 text-yellow-500" />
              )}
              <div>
                <h2 className="text-xl font-semibold">
                  {allOperational ? "All Systems Operational" : "Some Systems Experiencing Issues"}
                </h2>
                <p className="text-muted-foreground">
                  Last updated: {new Date().toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="status" className="space-y-8">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="status" className="gap-2">
              <Zap className="size-4" />
              Status
            </TabsTrigger>
            <TabsTrigger value="docs" className="gap-2">
              <Code className="size-4" />
              Documentation
            </TabsTrigger>
          </TabsList>

          {/* Status Tab */}
          <TabsContent value="status" className="space-y-6">
            {services.map((service) => (
              <Card key={service.name}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <StatusIcon status={service.status} />
                      <div>
                        <CardTitle>{service.name}</CardTitle>
                        <CardDescription>{service.description}</CardDescription>
                      </div>
                    </div>
                    <StatusBadge status={service.status} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 sm:grid-cols-3 mb-6">
                    <div className="flex items-center gap-2">
                      <Clock className="size-4 text-muted-foreground" />
                      <span className="text-sm">
                        <span className="text-muted-foreground">Uptime:</span>{" "}
                        <span className="font-medium">{service.uptime}</span>
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Database className="size-4 text-muted-foreground" />
                      <span className="text-sm">
                        <span className="text-muted-foreground">Endpoints:</span>{" "}
                        <span className="font-medium">{service.endpoints.length}</span>
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="size-4 text-muted-foreground" />
                      <span className="text-sm">
                        <span className="text-muted-foreground">Last checked:</span>{" "}
                        <span className="font-medium">{service.lastChecked}</span>
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                      Endpoints
                    </h4>
                    <div className="rounded-lg border divide-y">
                      {service.endpoints.map((endpoint, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <MethodBadge method={endpoint.method} />
                            <code className="text-sm font-mono">{endpoint.path}</code>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="text-sm text-muted-foreground">
                              {endpoint.responseTime}
                            </span>
                            <StatusIcon status={endpoint.status} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* Documentation Tab */}
          <TabsContent value="docs" className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Getting Started</CardTitle>
                <CardDescription>
                  Learn how to authenticate and make your first API request
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="font-semibold mb-2">Authentication</h4>
                  <p className="text-muted-foreground mb-4">
                    All API requests require authentication using a Bearer token in the Authorization header.
                  </p>
                  <CodeBlock>{`curl -X GET "https://api.siphio.ai/v1/spending/transactions" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json"`}</CodeBlock>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Base URL</h4>
                  <p className="text-muted-foreground mb-4">
                    All API endpoints are relative to the following base URL:
                  </p>
                  <CodeBlock>https://api.siphio.ai/v1</CodeBlock>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Rate Limits</h4>
                  <p className="text-muted-foreground">
                    API requests are limited to 1000 requests per minute per API key.
                    Rate limit headers are included in all responses.
                  </p>
                </div>
              </CardContent>
            </Card>

            {services.map((service) => (
              <Card key={service.name}>
                <CardHeader>
                  <CardTitle>{service.name} API</CardTitle>
                  <CardDescription>{service.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {service.endpoints.map((endpoint, index) => (
                    <div key={index} className="space-y-3">
                      <div className="flex items-center gap-3">
                        <MethodBadge method={endpoint.method} />
                        <code className="font-mono font-semibold">{endpoint.path}</code>
                      </div>
                      <p className="text-muted-foreground text-sm">{endpoint.description}</p>
                      <CodeBlock>{`curl -X ${endpoint.method} "https://api.siphio.ai/v1${endpoint.path}" \\
  -H "Authorization: Bearer YOUR_API_KEY"`}</CodeBlock>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
};

export { ApiStatus };
