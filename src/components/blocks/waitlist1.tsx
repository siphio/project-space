"use client";

import React, { useState } from "react";

import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Waitlist1Props {
  className?: string;
}

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

const Waitlist1 = ({ className }: Waitlist1Props) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    // Add user message
    const newMessages: Message[] = [...messages, { role: "user", content: inputValue }];
    setMessages(newMessages);
    setInputValue("");

    // Simulate AI typing and response
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
    <section
      className={cn(
        "relative w-full -mt-32",
        className,
      )}
    >
      {/* Background image - dictates section height */}
      <div className="relative overflow-hidden" style={{ minHeight: '75vh' }}>
        <img
          src="/BQiYmiVXsJHqfjf3bLqlc.png"
          alt=""
          className="w-full h-full object-cover absolute inset-0"
          aria-hidden="true"
        />
        {/* Top gradient - natural rounded fade from white into image */}
        <div
          className="absolute top-0 left-0 right-0 h-[50%] pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse 150% 70% at 50% 0%, white 0%, white 40%, rgba(255,255,255,0.8) 55%, rgba(255,255,255,0.4) 70%, transparent 100%)'
          }}
          aria-hidden="true"
        />

        {/* Content - positioned over the image */}
        <div className="relative z-10 container mx-auto px-4 pt-32 pb-16 flex flex-col items-center">
          <h2 className="relative z-20 py-2 text-center font-sans text-4xl font-semibold tracking-tighter md:py-10 lg:text-6xl">
            Got Questions? Ask SIPHIO
          </h2>
          <p className="text-md mx-auto max-w-xl text-center text-muted-foreground lg:text-lg">
            Describe your idea or problem - our AI will ask the right questions and send your details to the team.
          </p>

          {/* Chat container */}
          <div className="relative z-20 mt-10 w-full max-w-lg">
            {/* Messages area - grows as conversation continues */}
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
                placeholder="Tell us what you need..."
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
        </div>
      </div>
    </section>
  );
};

export { Waitlist1 };
