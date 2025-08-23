import { GoogleGenAI } from "@google/genai";
import type { Question, GenerateQuestionsRequest } from "@shared/schema";

const ai = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY || "" 
});

export class GeminiService {
  async generateQuestions(
    textContent: string, 
    config: GenerateQuestionsRequest
  ): Promise<Question[]> {
    try {
      const prompt = this.buildPrompt(textContent, config);
      
      const response = await ai.models.generateContent({
        model: "gemini-2.5-pro",
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: "object",
            properties: {
              questions: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    id: { type: "string" },
                    question: { type: "string" },
                    options: { 
                      type: "array", 
                      items: { type: "string" },
                      description: "For MCQ only, exactly 4 options"
                    },
                    correctAnswer: { type: "string" },
                    explanation: { type: "string" },
                    difficulty: { type: "string" }
                  },
                  required: ["id", "question", "correctAnswer", "explanation", "difficulty"]
                }
              }
            },
            required: ["questions"]
          }
        },
        contents: prompt,
      });

      const rawJson = response.text;
      if (!rawJson) {
        throw new Error("Empty response from Gemini API");
      }

      const data = JSON.parse(rawJson);
      return data.questions as Question[];
    } catch (error) {
      console.error("Gemini API error:", error);
      throw new Error(`Failed to generate questions: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private buildPrompt(textContent: string, config: GenerateQuestionsRequest): string {
    const { questionCount, difficulty, questionType } = config;
    
    const basePrompt = `
You are an expert educator creating assessment questions from the provided text content. 

STRICT REQUIREMENTS:
1. Generate EXACTLY ${questionCount} questions
2. All questions MUST be based ONLY on the provided text content
3. Do NOT use any external knowledge or information not present in the text
4. Difficulty level: ${difficulty}
5. Question type: ${questionType}

TEXT CONTENT TO ANALYZE:
${textContent}

DIFFICULTY GUIDELINES:
- Easy: Basic recall and understanding, straightforward facts
- Medium: Application and analysis, requiring deeper comprehension
- Hard: Synthesis and evaluation, complex reasoning

QUESTION TYPE INSTRUCTIONS:
${questionType === 'mcq' 
  ? `- Multiple Choice Questions with exactly 4 options (A, B, C, D)
- Only ONE correct answer per question
- Make incorrect options plausible but clearly wrong
- Avoid "all of the above" or "none of the above" options`
  : `- True/False Questions only
- correctAnswer should be either "True" or "False"
- No options array needed for True/False questions`
}

FORMAT REQUIREMENTS:
- Each question must have a unique ID (q1, q2, etc.)
- Questions must be clear and unambiguous
- Explanations must reference specific parts of the source text
- Ensure questions cover different sections of the content when possible

Generate the questions now as a JSON object with a "questions" array.
`;

    return basePrompt;
  }

  async extractKeywords(textContent: string): Promise<string[]> {
    try {
      const prompt = `
Analyze the following text and extract the most important keywords and key phrases that would be relevant for educational assessment. 

REQUIREMENTS:
- Focus on concepts, terminology, processes, and important facts
- Exclude common words, articles, prepositions, and filler words
- Return 15-25 most significant keywords/phrases
- Prioritize educational and subject-specific terms

TEXT CONTENT:
${textContent.substring(0, 5000)} // Limit for keyword extraction

Return the keywords as a JSON array of strings.
`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: "object",
            properties: {
              keywords: {
                type: "array",
                items: { type: "string" }
              }
            },
            required: ["keywords"]
          }
        },
        contents: prompt,
      });

      const rawJson = response.text;
      if (!rawJson) {
        throw new Error("Empty response from Gemini API");
      }

      const data = JSON.parse(rawJson);
      return data.keywords as string[];
    } catch (error) {
      console.error("Keyword extraction error:", error);
      throw new Error(`Failed to extract keywords: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

export const geminiService = new GeminiService();
