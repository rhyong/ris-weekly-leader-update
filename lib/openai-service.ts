import OpenAI from "openai";

// Create an OpenAI instance with your API key
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// This service provides functions to interact with OpenAI API
export async function enhanceText(
  text: string,
  context: string
): Promise<string> {
  try {
    if (!text || text.trim() === "") {
      throw new Error("Text is empty");
    }

    const prompt = createPromptForContext(text, context);

    const response = await openai.chat.completions.create({
      model: "gpt-4o", // Using gpt-4o for cost-effectiveness
      messages: [
        {
          role: "system",
          content:
            "You are a helpful assistant that improves professional text for leadership updates. Your task is to enhance the text while keeping it concise and professional. Focus on clarity, impact, and actionable insights. Do not add unnecessary details or fluff. Do not be verbose. IMPORTANT: Return ONLY the enhanced text without any quotes, explanations, or additional formatting.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0,
      max_tokens: 2500,
    });

    // Extract the enhanced text from the response
    let enhancedText = response.choices[0]?.message?.content?.trim();

    if (!enhancedText) {
      throw new Error("Failed to enhance text - empty response");
    }

    // Remove any surrounding quotes that might have been added by the AI
    if (enhancedText.startsWith('"') && enhancedText.endsWith('"')) {
      enhancedText = enhancedText.slice(1, -1);
    }

    return enhancedText;
  } catch (error: any) {
    console.error("Error enhancing text with OpenAI:", error);
    throw new Error(
      `Failed to enhance text: ${error.message || "Unknown error"}`
    );
  }
}

// Helper function to create appropriate prompt based on context
function createPromptForContext(text: string, context: string): string {
  switch (context) {
    case "top_3_bullets":
      return `Improve these top 3 bullets for a leadership update. Make them concise (under 35 words), impactful, and easy to scan. Maintain emojis if present:\n\n${text}`;

    case "team_health":
      return `Improve this summary about team health. Be concise but insightful:\n\n${text}`;

    case "overall_status":
      return `Enhance this team status update to be clear, balanced, and actionable:\n\n${text}`;

    case "accomplishments":
      return `Improve this team accomplishment to highlight impact and value. Be specific and concise:\n\n${text}`;

    case "misses_delays":
      return `Improve this description of a missed deadline or delay. Be honest but constructive, include context and next steps if possible:\n\n${text}`;

    case "stakeholder_feedback":
      return `Improve this stakeholder feedback note to be clear and actionable:\n\n${text}`;

    case "escalations":
      return `Enhance this escalation text to be clear about the issue, impact, and needed decision:\n\n${text}`;

    case "risks":
      return `Improve this risk description to clearly communicate severity, impact, and mitigations if applicable:\n\n${text}`;

    case "wins":
      return `Enhance this win description to highlight the achievement and its value:\n\n${text}`;

    case "growth_opportunities":
      return `Improve this description of a growth opportunity to be specific and actionable:\n\n${text}`;

    case "support_needed":
      return `Enhance this support request to be specific about what's needed, why, and by when:\n\n${text}`;

    default:
      return `Enhance this professional text to be more clear, concise, and impactful:\n\n${text}`;
  }
}
