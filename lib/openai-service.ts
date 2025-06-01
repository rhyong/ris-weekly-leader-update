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
            "You are an Rocket AI, a helpful, honest, and intelligent AI assistant. You provide clear, concise, and thoughtful answers. You ask clarifying questions when needed, reason carefully, and adapt your tone based on the user's intent — whether casual or professional. When improving writing, preserve the original meaning while enhancing clarity, tone, and grammar. When coding, follow best practices and explain reasoning where helpful. Be user-friendly and avoid unnecessary verbosity.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0,
      max_tokens: 500,
    });

    // Extract the enhanced text from the response
    const enhancedText = response.choices[0]?.message?.content?.trim();

    if (!enhancedText) {
      throw new Error("Failed to enhance text - empty response");
    }

    // Remove any surrounding quotes that might be returned by the model
    // This handles both single and double quotes
    let cleanedText = enhancedText;

    // Check if the text begins and ends with matching quotes
    if (
      (enhancedText.startsWith('"') && enhancedText.endsWith('"')) ||
      (enhancedText.startsWith("'") && enhancedText.endsWith("'"))
    ) {
      cleanedText = enhancedText.substring(1, enhancedText.length - 1);
    }

    return cleanedText;
  } catch (error: any) {
    console.error("Error enhancing text with OpenAI:", error);
    throw new Error(
      `Failed to enhance text: ${error.message || "Unknown error"}`
    );
  }
}

// Helper function to create appropriate prompt based on context
function createPromptForContext(text: string, context: string): string {
  // Common instruction to not include quotes in the response
  const baseInstruction =
    "You improve user writing while preserving their original intent and voice. Keep it natural and don’t over-edit.";

  switch (context) {
    case "top_3_bullets":
      return `Improve these top 3 bullets for a leadership update. Make them concise (under 35 words), impactful, and easy to scan. Maintain emojis if present, add emoji 🟢 and 🟡 for wherever make sense. ${baseInstruction} Text to improve: "${text}"`;

    case "team_health":
      return `Improve this summary about team health. Be concise but insightful. ${baseInstruction} Text to improve: "${text}"`;

    case "overall_status":
      return `Enhance this team status update to be clear, balanced, and actionable. ${baseInstruction} Text to improve: "${text}"`;

    case "accomplishments":
      return `Improve this team accomplishment to highlight impact and value. ${baseInstruction} Text to improve: "${text}"`;

    case "misses_delays":
      return `Improve this description of a missed deadline or delay. Be honest but constructive, include context and next steps if possible. ${baseInstruction} Text to improve: "${text}"`;

    case "stakeholder_feedback":
      return `Improve this stakeholder feedback note to be clear and actionable. ${baseInstruction} Text to improve: "${text}"`;

    case "escalations":
      return `Enhance this escalation text to be clear about the issue, impact, and needed decision. ${baseInstruction} Text to improve: "${text}"`;

    case "risks":
      return `Improve this risk description to clearly communicate severity, impact, and mitigations if applicable. ${baseInstruction} Text to improve: "${text}"`;

    case "wins":
      return `Enhance this win description to highlight the achievement and its value. ${baseInstruction} Text to improve: "${text}"`;

    case "growth_opportunities":
      return `Improve this description of a growth opportunity to be specific and actionable. ${baseInstruction} Text to improve: "${text}"`;

    case "support_needed":
      return `Enhance this support request to be specific about what's needed, why, and by when. ${baseInstruction} Text to improve: "${text}"`;

    case "people_changes":
      return `Improve this description of team composition changes and people issues to be clear and informative. ${baseInstruction} Text to improve: "${text}"`;

    case "contributor_name":
      return `Improve this team member name to be more professional and complete. ${baseInstruction} Text to improve: "${text}"`;

    case "achievements":
      return `Enhance this description of a team member's achievement to highlight their impact and contribution. ${baseInstruction} Text to improve: "${text}"`;

    case "recognition":
      return `Improve this description of how a team member was recognized for their contributions. ${baseInstruction} Text to improve: "${text}"`;

    case "member_name":
      return `Improve this team member name to be more professional and complete. ${baseInstruction} Text to improve: "${text}"`;

    case "member_issue":
      return `Enhance this description of a team member's challenge to be clear, constructive, and specific. ${baseInstruction} Text to improve: "${text}"`;

    case "support_plan":
      return `Improve this support plan for a team member to be specific, actionable, and supportive. ${baseInstruction} Text to improve: "${text}"`;

    case "personal_wins":
      return `Enhance this description of a personal win to be clear, specific, and highlight the impact. ${baseInstruction} Text to improve: "${text}"`;

    case "reflections":
      return `Improve this personal reflection to be insightful and show learning. ${baseInstruction} Text to improve: "${text}"`;

    case "goal_description":
      return `Enhance this goal description to be specific, measurable, and impactful. ${baseInstruction} Text to improve: "${text}"`;

    case "goal_update":
      return `Improve this goal update to clearly communicate progress, challenges, and next steps. ${baseInstruction} Text to improve: "${text}"`;

    default:
      return `Enhance this professional text to be more clear, concise, and impactful. ${baseInstruction} Text to improve: "${text}"`;
  }
}
