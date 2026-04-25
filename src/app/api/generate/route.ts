import { NextRequest, NextResponse } from "next/server";
import { generateContent, BriefInput } from "@/lib/gemini";

export async function POST(req: NextRequest) {
  try {
    const body: BriefInput = await req.json();

    const required: (keyof BriefInput)[] = [
      "industry", "audience", "tone",
      "goal", "platform", "brandName",
    ];

    for (const field of required) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    const content = await generateContent(body);
    return NextResponse.json({ success: true, data: content });

  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Internal server error";
    console.error("[API /generate] Error:", message);

    // Return 503 for overload errors so frontend can show the right message
    const isOverloaded =
      message.includes("busy") || message.includes("try again");

    return NextResponse.json(
      { error: message },
      { status: isOverloaded ? 503 : 500 }
    );
  }
}