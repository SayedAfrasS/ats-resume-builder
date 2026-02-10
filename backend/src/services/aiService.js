const Groq = require("groq-sdk");

let client = null;
function getClient() {
  if (!client) {
    if (!process.env.GROQ_API_KEY) {
      throw new Error("GROQ_API_KEY is not set. Add it to your .env file.");
    }
    client = new Groq({ apiKey: process.env.GROQ_API_KEY });
  }
  return client;
}

/**
 * Extracts the first valid JSON object from AI output safely.
 * Prevents crashes when model adds explanations or extra text.
 */
function extractJSON(text) {
  try {
    const firstBrace = text.indexOf("{");
    const lastBrace = text.lastIndexOf("}");

    if (firstBrace === -1 || lastBrace === -1) {
      throw new Error("No JSON object found in AI response");
    }

    const jsonString = text.slice(firstBrace, lastBrace + 1);

    return JSON.parse(jsonString);

  } catch (err) {
    console.error("JSON parsing failed.");
    console.error("Raw AI Output:\n", text);
    throw err;
  }
}

exports.generateResumeContent = async (jobRole, rawInput) => {
  try {

    const prompt = `
You are an ATS resume optimizer.

Job Role: ${jobRole}

User Details:
${JSON.stringify(rawInput)}

Generate:
1. Professional summary
2. ATS-friendly project descriptions
3. Impact-based bullet points

Rules:
- Use action verbs
- Max 20 words per bullet
- ATS readable format only
- No decorative language

Return ONLY valid JSON.
Do NOT include explanations, markdown, or extra text.

Required JSON format:
{
  "summary": "",
  "projects": [],
  "experience": []
}
`;

    const response = await getClient().chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "system",
          content: "You generate ATS optimized resume content."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.4,
    });

    const rawOutput = response.choices[0].message.content;

    // Safely extract JSON
    return extractJSON(rawOutput);

  } catch (error) {
    console.error("Groq AI Error:", error);
    throw error;
  }
};
