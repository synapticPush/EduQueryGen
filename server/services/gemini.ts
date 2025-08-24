import { GoogleGenerativeAI } from "@google/generative-ai";
import type { Question, GenerateQuestionsRequest } from "@shared/schema";

const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY;

// Throw a clear, helpful error if the key is missing
if (!apiKey) {
  throw new Error(
    'GEMINI_API_KEY environment variable is not set. ' +
    'Please set it to your Google AI Studio API key. ' +
    'If you are running locally, create a .env file in your server directory.'
  );
}

// Now initialize the AI client with the confirmed key
const ai = new GoogleGenerativeAI(apiKey);

export class GeminiService {
async generateQuestions(
  textContent: string,
  config: GenerateQuestionsRequest
): Promise<Question[]> {
  try {
    const prompt = this.buildPrompt(textContent, config);
    console.log("Sending request to Gemini API...");

    const model = ai.getGenerativeModel({ model: "gemini-2.0-flash" });
    const response = await model.generateContent(prompt);

    const rawText =
      response.response.candidates?.[0]?.content?.parts?.[0]?.text || "";

    if (!rawText.trim()) {
      throw new Error(
        "The AI service returned an empty response. Try again with a shorter document."
      );
    }

    // Clean the response by removing markdown code blocks
    let cleanedText = rawText.trim();
    
    // Remove ```json and ``` markers
    cleanedText = cleanedText.replace(/^```json\s*/i, ''); // Remove starting ```json
    cleanedText = cleanedText.replace(/```$/i, '');        // Remove ending ```
    cleanedText = cleanedText.trim();                      // Trim any extra whitespace

    const data = JSON.parse(cleanedText);

    if (
      !data.questions ||
      !Array.isArray(data.questions) ||
      data.questions.length === 0
    ) {
      throw new Error("No valid questions generated.");
    }

    console.log(`✅ Generated ${data.questions.length} questions`);
    return data.questions as Question[];
  } catch (error) {
    console.error("Gemini API error:", error);
    
    throw new Error(
      `Failed to generate questions: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}

  private buildPrompt(textContent: string, config: GenerateQuestionsRequest): string {
    const { questionCount, difficulty, questionType } = config;

    const limitedContent =
      textContent.length > 8000
        ? textContent.substring(0, 8000) + "..."
        : textContent;

    return `Create ${questionCount} ${difficulty}-level ${questionType} questions from this text. Only use information from the provided content.

${
  questionType === "mcq"
    ? "For MCQ: 4 options each, one correct."
    : 'For True/False: correctAnswer must be "True" or "False".'
}

TEXT CONTENT:
${limitedContent}

Return JSON with "questions" array. Each question needs:
- id: "q1", "q2", etc.
- question: clear question text
- ${
      questionType === "mcq"
        ? "options: array of 4 choices"
        : "(no options for true/false)"
    }  
- correctAnswer: correct choice
- explanation: why answer is correct (reference source text)
- difficulty: "${difficulty}"`;
  }

async extractKeywords(textContent: string): Promise<string[]> {
  try {
    const prompt = `
Analyze the following text and extract the most important keywords and key phrases for educational assessment.

REQUIREMENTS:
- Focus on concepts, terminology, processes, and important facts
- Exclude common/filler words
- Return 15-25 keywords/phrases
- Prioritize educational terms
- Return ONLY valid JSON without any markdown formatting or code blocks

TEXT CONTENT:
${textContent.substring(0, 5000)}

Return JSON with { "keywords": [ ... ] }
`;

    const model = ai.getGenerativeModel({ model: "gemini-2.0-flash" });
    const response = await model.generateContent(prompt);

    const rawText =
      response.response.candidates?.[0]?.content?.parts?.[0]?.text || "";

    if (!rawText.trim()) {
      throw new Error("Empty response from Gemini API");
    }

    // Clean the response by removing markdown code blocks
    let cleanedText = rawText.trim();
    
    // Remove ```json and ``` markers
    cleanedText = cleanedText.replace(/^```json\s*/i, ''); // Remove starting ```json
    cleanedText = cleanedText.replace(/```$/i, '');        // Remove ending ```
    cleanedText = cleanedText.trim();                      // Trim any extra whitespace

    // Parse the cleaned JSON
    const data = JSON.parse(cleanedText);
    
    return data.keywords as string[];
  } catch (error) {
    console.error("Keyword extraction error:", error);
    
    throw new Error(
      `Failed to extract keywords: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}
}

export const geminiService = new GeminiService();
