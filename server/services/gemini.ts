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
      
      console.log("Sending request to Gemini API...");
      
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
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

      console.log("Received response from Gemini API");
      
      const rawJson = response.text;
      console.log("Raw response:", rawJson ? "received" : "empty");
      
      if (!rawJson || rawJson.trim().length === 0) {
        console.error("Empty response from Gemini API");
        throw new Error("The AI service returned an empty response. Please try again with a shorter document or simpler content.");
      }

      const data = JSON.parse(rawJson);
      
      if (!data.questions || !Array.isArray(data.questions) || data.questions.length === 0) {
        throw new Error("No valid questions were generated. Please try again with different content.");
      }
      
      console.log(`Successfully generated ${data.questions.length} questions`);
      return data.questions as Question[];
    } catch (error) {
      console.error("Gemini API error:", error);
      throw new Error(`Failed to generate questions: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private buildPrompt(textContent: string, config: GenerateQuestionsRequest): string {
    const { questionCount, difficulty, questionType } = config;
    
    // Limit text content to prevent API overload (keep first 8000 characters)
    const limitedContent = textContent.length > 8000 ? textContent.substring(0, 8000) + "..." : textContent;
    
    const basePrompt = `Create ${questionCount} ${difficulty}-level ${questionType} questions from this text. Only use information from the provided content.

${questionType === 'mcq' ? 'For MCQ: 4 options each, one correct.' : 'For True/False: correctAnswer must be "True" or "False".'}

TEXT CONTENT:
${limitedContent}

Return JSON with "questions" array. Each question needs:
- id: "q1", "q2", etc.
- question: clear question text
- ${questionType === 'mcq' ? 'options: array of 4 choices' : '(no options for true/false)'}  
- correctAnswer: correct choice
- explanation: why answer is correct (reference source text)
- difficulty: "${difficulty}"`;

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
