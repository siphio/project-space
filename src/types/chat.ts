/**
 * Chat API type definitions
 * Mirrors backend models from agent/main.py
 */

export interface MessageHistoryItem {
  role: "user" | "assistant";
  content: string;
}

export interface ChatRequest {
  message: string;
  conversation_history: MessageHistoryItem[];
}

export interface ChatResponse {
  response: string;
  tokens_used: number;
  tools_called: string[];
  timestamp: string;
  // Handoff fields - when agent is ready to pass to team
  handoff_ready: boolean;
  handoff_summary: string | null;
}

export interface ChatAPIResponse {
  success: boolean;
  data?: ChatResponse;
  error?: string;
}

export interface ChatSession {
  session_id: string;
  messages: MessageHistoryItem[];
  tokens_used: number;
  created_at: string;
}

// Lead form data for handoff
export interface LeadFormData {
  name: string;
  email: string;
  summary: string;
}

// Constants
export const MAX_TOKENS_PER_SESSION = 15000;
export const TOKEN_WARNING_THRESHOLD = 0.8; // 80%
export const TOKEN_WARNING_AMOUNT = MAX_TOKENS_PER_SESSION * TOKEN_WARNING_THRESHOLD; // 12,000
