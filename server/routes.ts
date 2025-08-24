import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import { storage } from "./storage";
import { pdfProcessor } from "./services/pdfProcessor";
import { geminiService } from "./services/gemini";
import { documentGenerator } from "./services/documentGenerator";
import { generateQuestionsSchema } from "@shared/schema";
import type { QuestionPaper } from "@shared/schema";

// Configure multer for file uploads
const upload = multer({
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Upload and process PDF
  app.post("/api/upload", upload.single('pdf'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No PDF file uploaded" });
      }

      const result = await pdfProcessor.processPDF(req.file.buffer, req.file.originalname);
      
      if (!result.isValid) {
        return res.status(400).json({ 
          message: "PDF Validation Failed",
          errors: result.errors 
        });
      }

      const document = await storage.createDocument({
        filename: req.file.originalname,
        fileSize: result.fileSize,
        textContent: result.textContent,
        wordCount: result.wordCount
      });

      // Extract keywords for preview
      const keywords = await geminiService.extractKeywords(result.textContent);

      res.json({
        document: {
          id: document.id,
          filename: document.filename,
          fileSize: document.fileSize,
          wordCount: document.wordCount,
          pageCount: result.pageCount
        },
        keywords
      });
    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Failed to process PDF" 
      });
    }
  });

  // Generate questions
  app.post("/api/generate-questions", async (req, res) => {
    try {
      const validatedData = generateQuestionsSchema.parse(req.body);
      
      const document = await storage.getDocument(validatedData.documentId);
      if (!document) {
        return res.status(404).json({ message: "Document not found" });
      }

      const questions = await geminiService.generateQuestions(
        document.textContent, 
        validatedData
      );

      const questionSet = await storage.createQuestionSet({
        documentId: document.id,
        questionCount: validatedData.questionCount,
        difficulty: validatedData.difficulty,
        questionType: validatedData.questionType,
        questions
      });

      res.json({
        questionSetId: questionSet.id,
        questions,
        metadata: {
          questionCount: validatedData.questionCount,
          difficulty: validatedData.difficulty,
          questionType: validatedData.questionType,
          generatedAt: questionSet.generatedAt?.toISOString() || new Date().toISOString()
        }
      });
    } catch (error) {
      console.error("Question Generation Error:", error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Failed to Generate Questions" 
      });
    }
  });

  // Download question paper
  app.get("/api/download/questions/:questionSetId/:format", async (req, res) => {
    try {
      const { questionSetId, format } = req.params;
      
      if (!['pdf', 'docx'].includes(format)) {
        return res.status(400).json({ message: "Invalid Format. Use 'pdf' or 'docx'" });
      }

      const questionSet = await storage.getQuestionSet(questionSetId);
      if (!questionSet) {
        return res.status(404).json({ message: "Question set not found" });
      }

      const document = await storage.getDocument(questionSet.documentId);
      if (!document) {
        return res.status(404).json({ message: "Document not found" });
      }

      const questionPaper: QuestionPaper = {
        title: `Question Paper - ${document.filename}`,
        instructions: `Instructions: Answer All Questions. Each Question Carries Equal Marks. Total Questions: ${questionSet.questionCount}`,
        questions: questionSet.questions as any[],
        metadata: {
          questionCount: questionSet.questionCount,
          difficulty: questionSet.difficulty,
          questionType: questionSet.questionType,
          generatedAt: questionSet.generatedAt?.toISOString() || new Date().toISOString()
        }
      };

      let buffer: Buffer;
      let mimeType: string;
      let filename: string;

      if (format === 'pdf') {
        buffer = await documentGenerator.generateQuestionPaperPDF(questionPaper);
        mimeType = 'application/pdf';
        filename = `questions-${questionSetId}.pdf`;
      } else {
        buffer = await documentGenerator.generateQuestionPaperDOCX(questionPaper);
        mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        filename = `questions-${questionSetId}.docx`;
      }

      res.setHeader('Content-Type', mimeType);
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.send(buffer);
    } catch (error) {
      console.error("Download error:", error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Failed to Generate Document" 
      });
    }
  });

  // Download answer key
  app.get("/api/download/answers/:questionSetId/:format", async (req, res) => {
    try {
      const { questionSetId, format } = req.params;
      
      if (!['pdf', 'docx'].includes(format)) {
        return res.status(400).json({ message: "Invalid format. Use 'pdf' or 'docx'" });
      }

      const questionSet = await storage.getQuestionSet(questionSetId);
      if (!questionSet) {
        return res.status(404).json({ message: "Question set not found" });
      }

      const document = await storage.getDocument(questionSet.documentId);
      if (!document) {
        return res.status(404).json({ message: "Document not found" });
      }

      const questionPaper: QuestionPaper = {
        title: `Answer Key - ${document.filename}`,
        instructions: `This is the Answer key for the Question Paper. Contains correct Answers and Explanations.`,
        questions: questionSet.questions as any[],
        metadata: {
          questionCount: questionSet.questionCount,
          difficulty: questionSet.difficulty,
          questionType: questionSet.questionType,
          generatedAt: questionSet.generatedAt?.toISOString() || new Date().toISOString()
        }
      };

      let buffer: Buffer;
      let mimeType: string;
      let filename: string;

      if (format === 'pdf') {
        buffer = await documentGenerator.generateAnswerKeyPDF(questionPaper);
        mimeType = 'application/pdf';
        filename = `answers-${questionSetId}.pdf`;
      } else {
        buffer = await documentGenerator.generateAnswerKeyDOCX(questionPaper);
        mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        filename = `answers-${questionSetId}.docx`;
      }

      res.setHeader('Content-Type', mimeType);
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.send(buffer);
    } catch (error) {
      console.error("Download error:", error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Failed to generate document" 
      });
    }
  });

  // Get question set details
  app.get("/api/question-sets/:id", async (req, res) => {
    try {
      const questionSet = await storage.getQuestionSet(req.params.id);
      if (!questionSet) {
        return res.status(404).json({ message: "Question set not found" });
      }

      res.json(questionSet);
    } catch (error) {
      console.error("Get question set error:", error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Failed to get question set" 
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
