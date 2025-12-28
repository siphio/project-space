import { NextRequest, NextResponse } from "next/server";
import type { LeadFormData } from "@/types/chat";

const AGENT_API_URL = process.env.AGENT_API_URL || "http://localhost:8000";

interface LeadCaptureResponse {
  success: boolean;
  reference_id?: string;
  error?: string;
}

export async function POST(request: NextRequest): Promise<NextResponse<LeadCaptureResponse>> {
  try {
    const body: LeadFormData = await request.json();

    // Validate required fields
    if (!body.name || body.name.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: "Name is required" },
        { status: 400 }
      );
    }

    if (!body.email || body.email.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: "Email is required" },
        { status: 400 }
      );
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      return NextResponse.json(
        { success: false, error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Forward to Python agent's lead capture
    const agentResponse = await fetch(`${AGENT_API_URL}/lead`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: body.name.trim(),
        email: body.email.trim(),
        conversation_summary: body.summary || "",
        inquiry_type: "freelance_project",
      }),
    });

    if (!agentResponse.ok) {
      const errorText = await agentResponse.text();
      console.error("Lead capture API error:", errorText);

      return NextResponse.json(
        { success: false, error: "Failed to capture lead" },
        { status: agentResponse.status }
      );
    }

    const data = await agentResponse.json();

    return NextResponse.json({
      success: true,
      reference_id: data.reference_id,
    });
  } catch (error) {
    console.error("Lead API error:", error);

    // Check if it's a connection error
    if (error instanceof TypeError && error.message.includes("fetch")) {
      return NextResponse.json(
        { success: false, error: "Service unavailable. Please try again later." },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { success: false, error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
