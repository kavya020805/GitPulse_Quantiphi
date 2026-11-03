import { NextRequest, NextResponse } from "next/server";
import { generateRecruiterPitch } from "@/services/chatbot.service";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, jobDescription } = body;

    if (!username) {
      return NextResponse.json(
        { success: false, error: "Username is required" },
        { status: 400 }
      );
    }

    const data = await generateRecruiterPitch(username, jobDescription);

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error: any) {
    console.error("[PitchAPI] Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to generate recruiter pitch" },
      { status: 500 }
    );
  }
}

