import { NextRequest, NextResponse } from "next/server";
import { performVibeCheck } from "@/services/vibecheck.service";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, jobDescription } = body;

    if (!username || !jobDescription) {
      return NextResponse.json(
        { success: false, error: "Both username and jobDescription are required" },
        { status: 400 }
      );
    }

    const result = await performVibeCheck(username, jobDescription);

    return NextResponse.json({
      success: true,
      result,
    });
  } catch (error: any) {
    console.error("[VibeCheckAPI] Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to analyze Job Description" },
      { status: 500 }
    );
  }
}
