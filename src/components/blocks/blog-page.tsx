"use client";

import { useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import Link from "next/link";

import { cn } from "@/lib/utils";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import type { BlogPost } from "@/data/blog";

interface Message {
  role: "user" | "ai";
  content: string;
}

const aiResponses = [
  "Thanks for reaching out! That sounds like an interesting project. Can you tell me a bit more about your timeline and budget?",
  "Great, that helps! What's the main problem you're trying to solve with this solution?",
  "I understand. And who would be the primary users of this application?",
  "Perfect. One last question - do you have any existing systems this would need to integrate with?",
  "Thanks for all the details! I've captured everything and will send this to the team. Someone will reach out within 24 hours to discuss next steps. Is there anything else you'd like to add?",
];

interface BlogPageProps {
  posts: BlogPost[];
  className?: string;
}

const categoryColors: Record<string, string> = {
  company: "bg-blue-500/10 text-blue-700 hover:bg-blue-500/20",
  hiring: "bg-green-500/10 text-green-700 hover:bg-green-500/20",
  product: "bg-purple-500/10 text-purple-700 hover:bg-purple-500/20",
  announcement: "bg-orange-500/10 text-orange-700 hover:bg-orange-500/20",
  engineering: "bg-indigo-500/10 text-indigo-700 hover:bg-indigo-500/20",
};

const BlogPage = ({ posts, className }: BlogPageProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    const newMessages: Message[] = [...messages, { role: "user", content: inputValue }];
    setMessages(newMessages);
    setInputValue("");

    setIsTyping(true);
    setTimeout(() => {
      const aiResponseIndex = Math.min(
        Math.floor(newMessages.filter((m) => m.role === "user").length - 1),
        aiResponses.length - 1
      );
      setMessages([...newMessages, { role: "ai", content: aiResponses[aiResponseIndex] }]);
      setIsTyping(false);
    }, 1500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

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

      <div className="py-32">
        <div className="container mx-auto flex flex-col items-center gap-16 lg:px-16">
          <div className="text-center">
            <div className="mb-6 flex justify-center">
              <span className="h-1 w-12 rounded-full bg-orange-500"></span>
            </div>
            <h2 className="mb-3 text-3xl font-semibold tracking-tighter font-sans md:mb-4 md:text-4xl lg:mb-6 lg:max-w-3xl lg:text-5xl">
              News & Updates
            </h2>
            <p className="mb-8 text-muted-foreground md:text-base lg:max-w-2xl lg:text-lg">
              Stay up to date with the latest from Siphio AI. Company news, product updates,
              hiring announcements, and engineering insights.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8 w-full">
            {posts.map((post) => (
              <Card
                key={post.id}
                className="grid grid-rows-[auto_auto_1fr_auto] overflow-hidden pt-0"
              >
                <div className="aspect-16/9 w-full">
                  <Link
                    href={`/blog/${post.slug}`}
                    className="transition-opacity duration-200 fade-in hover:opacity-70"
                  >
                    {post.image ? (
                      <img
                        src={post.image}
                        alt={post.title}
                        className="h-full w-full object-cover object-center"
                      />
                    ) : (
                      <div className="h-full w-full bg-gradient-to-br from-orange-500/20 via-amber-500/10 to-yellow-500/20 flex items-center justify-center">
                        <span className="text-4xl font-bold text-orange-500/30">
                          {post.title.charAt(0)}
                        </span>
                      </div>
                    )}
                  </Link>
                </div>
                <CardHeader>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge
                      variant="secondary"
                      className={cn("capitalize", categoryColors[post.category])}
                    >
                      {post.category}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {new Date(post.publishedAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold hover:underline md:text-xl">
                    <Link href={`/blog/${post.slug}`}>
                      {post.title}
                    </Link>
                  </h3>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{post.excerpt}</p>
                </CardContent>
                <CardFooter>
                  <Link
                    href={`/blog/${post.slug}`}
                    className="flex items-center text-foreground hover:underline"
                  >
                    Read more
                    <ArrowRight className="ml-2 size-4" />
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>

          {/* Empty State */}
          {posts.length === 0 && (
            <div className="text-center py-16">
              <p className="text-muted-foreground text-lg">
                No posts yet. Check back soon for updates!
              </p>
            </div>
          )}
        </div>
      </div>

      {/* AI Chat Section */}
      <div className="relative w-full">
        <div className="relative overflow-hidden py-24 bg-gradient-to-b from-background via-orange-50/30 to-orange-100/50">
          <div className="relative z-10 container mx-auto px-4 flex flex-col items-center">
            <h2 className="py-2 text-center font-sans text-3xl font-semibold tracking-tighter md:text-4xl lg:text-5xl">
              Got Questions? Ask SIPHIO
            </h2>
            <p className="text-md mx-auto max-w-xl text-center text-black font-medium lg:text-lg mt-4">
              Have questions about our news or products? Our AI assistant is here to help.
            </p>

            {/* Chat container */}
            <div className="relative z-20 mt-10 w-full max-w-lg">
              {/* Messages area */}
              {messages.length > 0 && (
                <div className="mb-4 rounded-2xl bg-white/90 backdrop-blur-sm p-4 shadow-lg max-h-80 overflow-y-auto transition-all duration-300">
                  <div className="space-y-3">
                    {messages.map((message, index) => (
                      <div
                        key={index}
                        className={cn(
                          "flex",
                          message.role === "user" ? "justify-end" : "justify-start"
                        )}
                      >
                        <div
                          className={cn(
                            "max-w-[80%] rounded-2xl px-4 py-2 text-sm",
                            message.role === "user"
                              ? "bg-black text-white"
                              : "bg-muted text-foreground"
                          )}
                        >
                          {message.content}
                        </div>
                      </div>
                    ))}
                    {isTyping && (
                      <div className="flex justify-start">
                        <div className="bg-muted text-foreground rounded-2xl px-4 py-2 text-sm">
                          <span className="inline-flex gap-1">
                            <span className="animate-bounce">.</span>
                            <span className="animate-bounce" style={{ animationDelay: "0.1s" }}>.</span>
                            <span className="animate-bounce" style={{ animationDelay: "0.2s" }}>.</span>
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Input area */}
              <div className="flex w-full items-center gap-3 rounded-full bg-white/90 backdrop-blur-sm p-2 shadow-lg">
                <Input
                  className="h-10 w-full rounded-xl border-none bg-muted shadow-none ring-0 focus-visible:ring-0 focus-visible:outline-none active:ring-0 active:outline-0"
                  placeholder="Ask us anything..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={isTyping}
                />
                <Button
                  className="h-10 rounded-xl"
                  onClick={handleSendMessage}
                  disabled={isTyping || !inputValue.trim()}
                >
                  Send Message
                </Button>
              </div>
            </div>

            {/* Logo */}
            <div className="mt-12 flex justify-center">
              <img
                src="/siphio-logo-black.png"
                alt="Siphio AI"
                className="h-14 w-auto opacity-80"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export { BlogPage };
