"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";

import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type {
  MessageHistoryItem,
  ChatSession,
  ChatAPIResponse,
  LeadFormData,
} from "@/types/chat";

interface Waitlist1Props {
  className?: string;
}

interface Message {
  role: "user" | "ai";
  content: string;
}

// Constants
const MAX_TOKENS = 15000;
const WARNING_THRESHOLD = 12000; // 80% of 15000
const STORAGE_KEY = "siphio_chat_session";

// Generate a unique session ID
const generateSessionId = (): string => {
  return `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
};

// Convert internal Message format to API format
const toApiFormat = (messages: Message[]): MessageHistoryItem[] => {
  return messages.map((msg) => ({
    role: msg.role === "ai" ? "assistant" : "user",
    content: msg.content,
  }));
};

// Check if user message is affirmative (for handoff trigger)
const isAffirmative = (message: string): boolean => {
  const lower = message.toLowerCase().trim();
  const affirmatives = [
    "yes", "yeah", "yep", "sure", "ok", "okay", "please", "go ahead",
    "yes please", "sounds good", "let's do it", "absolutely", "definitely"
  ];
  return affirmatives.some(a => lower.includes(a));
};

// Lead Form Component - inline version for chat
const LeadForm = ({
  summary,
  onSubmit,
  onCancel,
  isSubmitting,
}: {
  summary: string;
  onSubmit: (data: LeadFormData) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [editedSummary, setEditedSummary] = useState(summary);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;
    onSubmit({ name: name.trim(), email: email.trim(), summary: editedSummary });
  };

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-3">
      <p className="text-sm font-medium text-gray-700">Almost there! Fill in your details:</p>

      <Input
        type="text"
        placeholder="Your name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="h-9 w-full rounded-lg border border-gray-200 bg-white text-sm shadow-none"
        required
        disabled={isSubmitting}
      />

      <Input
        type="email"
        placeholder="Your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="h-9 w-full rounded-lg border border-gray-200 bg-white text-sm shadow-none"
        required
        disabled={isSubmitting}
      />

      <div>
        <label className="text-xs text-gray-500 mb-1 block">Project summary</label>
        <textarea
          value={editedSummary}
          onChange={(e) => setEditedSummary(e.target.value)}
          className="w-full h-16 px-3 py-2 text-xs rounded-lg border border-gray-200 bg-white resize-none focus:outline-none focus:ring-2 focus:ring-black/10"
          disabled={isSubmitting}
        />
      </div>

      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="flex-1 h-9 rounded-lg text-sm"
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          className="flex-1 h-9 rounded-lg text-sm"
          disabled={isSubmitting || !name.trim() || !email.trim()}
        >
          {isSubmitting ? "Sending..." : "Send to Team"}
        </Button>
      </div>
    </form>
  );
};

const Waitlist1 = ({ className }: Waitlist1Props) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [sessionId, setSessionId] = useState<string>("");
  const [tokensUsed, setTokensUsed] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Lead form state
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [pendingSummary, setPendingSummary] = useState<string | null>(null);
  const [isSubmittingLead, setIsSubmittingLead] = useState(false);

  // Track if we're waiting for handoff confirmation
  const [awaitingHandoffResponse, setAwaitingHandoffResponse] = useState(false);

  // Refs for scrolling
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);

  // Load session from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const session: ChatSession = JSON.parse(stored);
        const sessionAge = Date.now() - new Date(session.created_at).getTime();
        const maxAge = 24 * 60 * 60 * 1000;

        if (sessionAge < maxAge) {
          setSessionId(session.session_id);
          setTokensUsed(session.tokens_used);
          setMessages(
            session.messages.map((msg) => ({
              role: msg.role === "assistant" ? "ai" : "user",
              content: msg.content,
            }))
          );
          return;
        }
      }
    } catch (e) {
      console.error("Failed to load chat session:", e);
    }
    setSessionId(generateSessionId());
  }, []);

  // Save session to localStorage
  useEffect(() => {
    if (!sessionId) return;

    const session: ChatSession = {
      session_id: sessionId,
      messages: toApiFormat(messages),
      tokens_used: tokensUsed,
      created_at: new Date().toISOString(),
    };

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    } catch (e) {
      console.error("Failed to save chat session:", e);
    }
  }, [sessionId, messages, tokensUsed]);

  // Auto-scroll to the bottom of chat container
  useEffect(() => {
    if (chatContainerRef.current) {
      const container = chatContainerRef.current;
      // Check if the latest message is a confirmation (has reference ID)
      const lastMessage = messages[messages.length - 1];
      const isConfirmation = lastMessage?.role === "ai" && lastMessage.content.includes("reference ID");

      if (isConfirmation) {
        // Instant scroll chat to bottom
        container.scrollTop = container.scrollHeight;

        // Scroll page to center the chat component on screen
        if (chatContainerRef.current) {
          const chatRect = chatContainerRef.current.getBoundingClientRect();
          const chatCenter = window.scrollY + chatRect.top + (chatRect.height / 2);
          const viewportCenter = window.innerHeight / 2;
          const scrollTarget = chatCenter - viewportCenter;

          window.scrollTo({
            top: Math.max(0, scrollTarget),
            behavior: "instant"
          });
        }
      } else {
        // Smooth scroll for regular messages (chat container only)
        container.scrollTo({
          top: container.scrollHeight,
          behavior: "smooth"
        });
      }
    }
  }, [messages, showLeadForm]);

  const handleSendMessage = useCallback(async () => {
    if (!inputValue.trim() || isTyping) return;

    setError(null);

    if (tokensUsed >= MAX_TOKENS) {
      setError("You've reached the conversation limit. Please start a new session.");
      return;
    }

    const userMessage = inputValue.trim();

    // Check if this is a response to handoff offer
    if (awaitingHandoffResponse && isAffirmative(userMessage) && pendingSummary) {
      // User said yes - show the form
      setShowLeadForm(true);
      setAwaitingHandoffResponse(false);
      setInputValue("");
      // Add user message to chat
      setMessages(prev => [...prev, { role: "user", content: userMessage }]);
      return;
    }

    const newMessages: Message[] = [...messages, { role: "user", content: userMessage }];
    setMessages(newMessages);
    setInputValue("");
    setIsTyping(true);
    setAwaitingHandoffResponse(false);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage,
          conversation_history: toApiFormat(newMessages.slice(0, -1)),
        }),
      });

      const result: ChatAPIResponse = await response.json();

      if (!result.success || !result.data) {
        throw new Error(result.error || "Failed to get response");
      }

      setMessages([...newMessages, { role: "ai", content: result.data.response }]);
      setTokensUsed((prev) => prev + result.data!.tokens_used);

      // Check if agent is offering handoff
      if (result.data.handoff_ready && result.data.handoff_summary) {
        setPendingSummary(result.data.handoff_summary);
        setAwaitingHandoffResponse(true);
      }
    } catch (e) {
      console.error("Chat error:", e);
      setError(e instanceof Error ? e.message : "Failed to send message. Please try again.");
      setMessages(messages);
    } finally {
      setIsTyping(false);
    }
  }, [inputValue, isTyping, messages, tokensUsed, awaitingHandoffResponse, pendingSummary]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleLeadSubmit = async (data: LeadFormData) => {
    setIsSubmittingLead(true);

    try {
      // Call the lead capture endpoint
      const response = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          summary: data.summary,
        }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || "Failed to submit");
      }

      // Add confirmation message with reference ID
      const refId = result.reference_id ? ` Your reference ID is ${result.reference_id}.` : "";
      setMessages(prev => [...prev, {
        role: "ai",
        content: `Thanks ${data.name}! I've passed your details to the team.${refId} They'll reach out to ${data.email} within 24-48 hours to discuss your project. Is there anything else I can help with in the meantime?`
      }]);

      // Reset form state
      setShowLeadForm(false);
      setPendingSummary(null);
    } catch (e) {
      console.error("Lead capture error:", e);
      setError(e instanceof Error ? e.message : "Failed to submit. Please try again.");
    } finally {
      setIsSubmittingLead(false);
    }
  };

  const handleLeadCancel = () => {
    setShowLeadForm(false);
    // Add a message saying they declined
    setMessages(prev => [...prev, {
      role: "ai",
      content: "No problem! Feel free to ask more questions. I can always pass your details to the team later if you'd like."
    }]);
  };

  const handleClearSession = () => {
    localStorage.removeItem(STORAGE_KEY);
    setMessages([]);
    setTokensUsed(0);
    setSessionId(generateSessionId());
    setError(null);
    setShowLeadForm(false);
    setPendingSummary(null);
    setAwaitingHandoffResponse(false);
  };

  const showTokenWarning = tokensUsed >= WARNING_THRESHOLD && tokensUsed < MAX_TOKENS;
  const tokensRemaining = MAX_TOKENS - tokensUsed;

  return (
    <section
      ref={sectionRef}
      id="ai-assistant"
      className={cn("relative w-full -mt-32", className)}
    >
      <div className="relative overflow-hidden" style={{ minHeight: '100vh' }}>
        <img
          src="/BQiYmiVXsJHqfjf3bLqlc.png"
          alt=""
          className="w-full h-full object-cover absolute inset-0"
          aria-hidden="true"
        />
        <div
          className="absolute top-0 left-0 right-0 h-[50%] pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse 150% 70% at 50% 0%, white 0%, white 40%, rgba(255,255,255,0.8) 55%, rgba(255,255,255,0.4) 70%, transparent 100%)'
          }}
          aria-hidden="true"
        />

        <div className="relative z-10 container mx-auto px-4 min-h-[100vh] flex flex-col items-center justify-center pt-32">
          <h2 className="relative z-20 py-2 text-center font-sans text-4xl font-semibold tracking-tighter md:py-10 lg:text-6xl">
            Got Questions? Ask SIPHIO
          </h2>
          <p className="text-md mx-auto max-w-xl text-center text-black font-medium lg:text-lg">
            Describe your idea or problem - our AI will ask the right questions and send your details to the team.
          </p>

          <div className="relative z-20 mt-10 w-full max-w-lg">
            {showTokenWarning && (
              <div className="mb-4 rounded-xl bg-amber-100 border border-amber-300 p-3 text-sm text-amber-800">
                <span className="font-medium">Approaching limit:</span> {tokensRemaining.toLocaleString()} tokens remaining.
              </div>
            )}

            {error && (
              <div className="mb-4 rounded-xl bg-red-100 border border-red-300 p-3 text-sm text-red-800 flex items-center justify-between">
                <span>{error}</span>
                <button
                  onClick={() => setError(null)}
                  className="ml-2 text-red-600 hover:text-red-800 font-medium"
                >
                  Dismiss
                </button>
              </div>
            )}

            {messages.length > 0 && (
              <div className="relative mb-4">
                {/* Chat container */}
                <div ref={chatContainerRef} className="relative rounded-2xl bg-white/90 backdrop-blur-sm p-4 shadow-lg max-h-96 overflow-y-auto">
                {/* Show form OR conversation - not both */}
                {showLeadForm && pendingSummary ? (
                  <LeadForm
                    summary={pendingSummary}
                    onSubmit={handleLeadSubmit}
                    onCancel={handleLeadCancel}
                    isSubmitting={isSubmittingLead}
                  />
                ) : (
                  <div className="space-y-3">
                    {messages.map((message, index) => {
                      const isLastMessage = index === messages.length - 1;
                      const isConfirmationMessage = isLastMessage && message.role === "ai" && message.content.includes("reference ID");

                      return (
                        <div
                          key={index}
                          className={cn(
                            "flex",
                            message.role === "user" ? "justify-end" : "justify-start"
                          )}
                        >
                          <div
                            className={cn(
                              "max-w-[80%] rounded-2xl px-4 py-2 text-sm relative",
                              message.role === "user"
                                ? "bg-black text-white"
                                : "bg-muted text-foreground",
                              isConfirmationMessage && "ring-2 ring-green-400/50 bg-green-50"
                            )}
                          >
                            {isConfirmationMessage && (
                              <span className="absolute -top-2 -right-2 text-lg">🎉</span>
                            )}
                            {message.content}
                          </div>
                        </div>
                      );
                    })}
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
                )}
                </div>
              </div>
            )}

            {/* Input area - hidden when form is showing */}
            {!showLeadForm && (
              <div className="flex w-full items-center gap-3 rounded-full bg-white/90 backdrop-blur-sm p-2 shadow-lg">
                <Input
                  className="h-10 w-full rounded-xl border-none bg-muted shadow-none ring-0 focus-visible:ring-0 focus-visible:outline-none"
                  placeholder="Tell us what you need..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={isTyping || tokensUsed >= MAX_TOKENS}
                />
                <Button
                  className="h-10 rounded-xl"
                  onClick={handleSendMessage}
                  disabled={isTyping || !inputValue.trim() || tokensUsed >= MAX_TOKENS}
                >
                  Send Message
                </Button>
              </div>
            )}

            {messages.length > 0 && !showLeadForm && (
              <div className="mt-3 flex justify-center">
                <button
                  onClick={handleClearSession}
                  className="text-xs text-black/50 hover:text-black/70 underline"
                >
                  Clear conversation
                </button>
              </div>
            )}
          </div>

          <div className="mt-16 flex justify-center">
            <img
              src="/siphio-logo-black.png"
              alt="Siphio AI"
              className="h-14 w-auto opacity-80"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export { Waitlist1 };
