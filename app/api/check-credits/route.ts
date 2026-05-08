import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { freeTierRateLimit } from "@/lib/rate-limit";
import { shouldRateLimitImageGeneration } from "@/lib/image-provider";

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { hasApiKey } = await request.json();

    if (!shouldRateLimitImageGeneration({ hasUserApiKey: hasApiKey })) {
      return NextResponse.json({
        hasApiKey: true,
        creditsRemaining: "unlimited",
        resetTime: null,
      });
    }

    // For free tier, check rate limit status via Redis
    const limitResult = await freeTierRateLimit.getRemaining(userId);

    return NextResponse.json({
      hasApiKey: false,
      creditsRemaining: limitResult.remaining,
      resetTime: limitResult.reset,
    });
  } catch (error) {
    console.error("Error in check-credits API:", error);
    return NextResponse.json(
      {
        error: `Internal server error: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      },
      { status: 500 }
    );
  }
}
