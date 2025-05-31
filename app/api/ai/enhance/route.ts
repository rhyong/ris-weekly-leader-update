import { NextRequest, NextResponse } from "next/server";
import { enhanceText } from "@/lib/openai-service";

// Rate limiting state
const RATE_LIMIT = {
  WINDOW_MS: 60000, // 1 minute
  MAX_REQUESTS: 20, // 20 requests per minute
  requestCount: 0,
  resetTime: Date.now() + 60000,
};

// Reset rate limit if the window has passed
function resetRateLimitIfNeeded() {
  const now = Date.now();
  if (now > RATE_LIMIT.resetTime) {
    RATE_LIMIT.requestCount = 0;
    RATE_LIMIT.resetTime = now + RATE_LIMIT.WINDOW_MS;
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check rate limit
    resetRateLimitIfNeeded();
    if (RATE_LIMIT.requestCount >= RATE_LIMIT.MAX_REQUESTS) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Try again in a minute." },
        { status: 429 }
      );
    }
    RATE_LIMIT.requestCount++;

    // Validate environment variable
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OpenAI API key is not configured" },
        { status: 500 }
      );
    }

    // Parse request body
    const body = await request.json();
    
    // Validate request parameters
    if (!body.text || typeof body.text !== "string") {
      return NextResponse.json(
        { error: "Text parameter is required" },
        { status: 400 }
      );
    }

    const { text, context = "default" } = body;
    
    // Skip enhancement for very short or empty text
    if (text.trim().length < 3) {
      return NextResponse.json({ 
        enhancedText: text,
        enhanced: false,
        message: "Text too short to enhance" 
      });
    }

    // Call OpenAI service to enhance the text
    const enhancedText = await enhanceText(text, context);

    // Return the enhanced text
    return NextResponse.json({ 
      enhancedText, 
      enhanced: true 
    });
  } catch (error: any) {
    console.error("Error in text enhancement API:", error);
    return NextResponse.json(
      { error: error.message || "Failed to enhance text" },
      { status: 500 }
    );
  }
}