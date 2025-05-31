import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

// Create an OpenAI instance with your API key
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Rate limiting state (shared with other AI routes)
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
    if (!body.teamHealthNotes || !body.overallStatus) {
      return NextResponse.json(
        { error: "Both teamHealthNotes and overallStatus parameters are required" },
        { status: 400 }
      );
    }

    const { teamHealthNotes, overallStatus } = body;
    
    // Call OpenAI to analyze sentiment
    const sentimentScore = await analyzeSentiment(teamHealthNotes, overallStatus);

    // Return the sentiment score
    return NextResponse.json({ 
      sentimentScore, 
      success: true 
    });
  } catch (error: any) {
    console.error("Error in sentiment analysis API:", error);
    return NextResponse.json(
      { error: error.message || "Failed to analyze sentiment" },
      { status: 500 }
    );
  }
}

async function analyzeSentiment(
  teamHealthNotes: string,
  overallStatus: string
): Promise<number> {
  try {
    // Skip analysis for very short or empty text
    if ((teamHealthNotes.trim().length < 3) && (overallStatus.trim().length < 3)) {
      return 3.5; // Neutral score as default
    }

    const prompt = `
You are analyzing the sentiment in a weekly leadership update to determine a team health score.

Team Health Notes: "${teamHealthNotes}"
Overall Team Status: "${overallStatus}"

Analyze the sentiment expressed in these texts and determine a team health score from 1.0 to 5.0, where:
1.0 = Extremely negative/critical issues
2.0 = Significant problems
3.0 = Neutral/mixed
4.0 = Generally positive with minor issues
5.0 = Extremely positive

Consider factors like:
- Morale and team dynamics
- Stress levels and burnout indicators
- Progress and accomplishments
- Challenges and blockers
- Overall tone and language used

Return ONLY a single number between 1.0 and 5.0 (to one decimal place) representing the sentiment score.
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o", // Using gpt-4o for cost-effectiveness
      messages: [
        {
          role: "system",
          content: "You are an AI that analyzes team health sentiment and returns a numerical score between 1.0 and 5.0.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0,
      max_tokens: 10, // Very short response expected
    });

    // Extract the sentiment score from the response
    const scoreText = response.choices[0]?.message?.content?.trim();
    
    if (!scoreText) {
      throw new Error("Failed to analyze sentiment - empty response");
    }

    // Parse the score
    const score = parseFloat(scoreText);
    
    if (isNaN(score) || score < 1 || score > 5) {
      console.warn("Invalid sentiment score returned:", scoreText);
      return 3.5; // Return neutral if parsing failed
    }

    return Number(score.toFixed(1)); // Return with one decimal place
  } catch (error: any) {
    console.error("Error analyzing sentiment with OpenAI:", error);
    throw new Error(
      `Failed to analyze sentiment: ${error.message || "Unknown error"}`
    );
  }
}