import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const documents = pgTable("documents", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  filename: text("filename").notNull(),
  fileSize: integer("file_size").notNull(),
  textContent: text("text_content").notNull(),
  wordCount: integer("word_count").notNull(),
  uploadedAt: timestamp("uploaded_at").defaultNow().notNull(),
});

export const questionSets = pgTable("question_sets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  documentId: varchar("document_id").references(() => documents.id).notNull(),
  questionCount: integer("question_count").notNull(),
  difficulty: text("difficulty").notNull(), // 'easy', 'medium', 'hard'
  questionType: text("question_type").notNull(), // 'mcq', 'truefalse'
  questions: jsonb("questions").notNull(), // Array of question objects
  generatedAt: timestamp("generated_at").defaultNow().notNull(),
});

export const insertDocumentSchema = createInsertSchema(documents).omit({
  id: true,
  uploadedAt: true,
});

export const insertQuestionSetSchema = createInsertSchema(questionSets).omit({
  id: true,
  generatedAt: true,
});

export const generateQuestionsSchema = z.object({
  documentId: z.string(),
  questionCount: z.number().min(5).max(30),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  questionType: z.enum(['mcq', 'truefalse']),
});

export type Document = typeof documents.$inferSelect;
export type InsertDocument = z.infer<typeof insertDocumentSchema>;
export type QuestionSet = typeof questionSets.$inferSelect;
export type InsertQuestionSet = z.infer<typeof insertQuestionSetSchema>;
export type GenerateQuestionsRequest = z.infer<typeof generateQuestionsSchema>;

export interface Question {
  id: string;
  question: string;
  options?: string[]; // For MCQ
  correctAnswer: string;
  explanation: string;
  difficulty: string;
}

export interface QuestionPaper {
  title: string;
  instructions: string;
  questions: Question[];
  metadata: {
    questionCount: number;
    difficulty: string;
    questionType: string;
    generatedAt: string;
  };
}
