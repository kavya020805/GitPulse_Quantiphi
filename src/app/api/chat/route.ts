import { NextRequest, NextResponse } from "next/server";
import { generateChatResponse } from "@/services/chatbot.service";
import { getChatHistory } from "@/services/cache.service";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, message } = body;

    if (!username || !message) {
      return NextResponse.json(
        { success: false, error: "Both username and message are required" },
        { status: 400 }
      );
    }

    const reply = await generateChatResponse(username, message);

    return NextResponse.json({
      success: true,
      reply,
    });
  } catch (error: any) {
    console.error("[ChatAPI] Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to generate chat response" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get("username");

    if (!username) {
      return NextResponse.json(
        { success: false, error: "Username query param is required" },
        { status: 400 }
      );
    }

    const history = getChatHistory(username);
    return NextResponse.json({
      success: true,
      history,
    });
  } catch (error: any) {
    console.error("[ChatAPI] History Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch chat history" },
      { status: 500 }
    );
  }
}

