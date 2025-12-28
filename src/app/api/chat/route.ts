import { NextRequest, NextResponse } from "next/server";
import type { ChatRequest, ChatResponse, ChatAPIResponse } from "@/types/chat";

const AGENT_API_URL = process.env.AGENT_API_URL || "http://localhost:8000";

export async function POST(request: NextRequest): Promise<NextResponse<ChatAPIResponse>> {
  try {
    const body: ChatRequest = await request.json();

    // Validate required fields
    if (!body.message || body.message.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: "Message is required" },
        { status: 400 }
      );
    }

    if (body.message.length > 4000) {
      return NextResponse.json(
        { success: false, error: "Message exceeds maximum length of 4000 characters" },
        { status: 400 }
      );
    }

    // Forward request to Python agent
    const agentResponse = await fetch(`${AGENT_API_URL}/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: body.message,
        conversation_history: body.conversation_history || [],
      }),
    });

    if (!agentResponse.ok) {
      const errorText = await agentResponse.text();
      console.error("Agent API error:", errorText);

      // Handle specific error codes
      if (agentResponse.status === 429) {
        return NextResponse.json(
          { success: false, error: "Rate limit exceeded. Please wait a moment before sending another message." },
          { status: 429 }
        );
      }

      return NextResponse.json(
        { success: false, error: "Failed to get response from AI assistant" },
        { status: agentResponse.status }
      );
    }

    const data: ChatResponse = await agentResponse.json();

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Chat API error:", error);

    // Check if it's a connection error (agent not running)
    if (error instanceof TypeError && error.message.includes("fetch")) {
      return NextResponse.json(
        { success: false, error: "AI assistant is currently unavailable. Please try again later." },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { success: false, error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
