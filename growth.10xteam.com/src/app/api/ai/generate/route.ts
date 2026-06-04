import { NextResponse } from "next/server";
import { generateWithAI } from "@/lib/ai/client";
import type { AITask } from "@/types/ai.types";

interface GenerateRequestBody {
  task?: AITask;
  systemPrompt?: string;
  userPrompt?: string;
  businessId?: string;
  metadata?: Record<string, unknown>;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as GenerateRequestBody;

    if (!body.task || !body.systemPrompt || !body.userPrompt) {
      return NextResponse.json(
        { error: "task, systemPrompt and userPrompt are required." },
        { status: 400 }
      );
    }

    const response = await generateWithAI({
      task: body.task,
      systemPrompt: body.systemPrompt,
      userPrompt: body.userPrompt,
      businessId: body.businessId,
      metadata: body.metadata,
    });

    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unexpected AI generation error.",
      },
      { status: 500 }
    );
  }
}
