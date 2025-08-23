import type { Document, InsertDocument, QuestionSet, InsertQuestionSet } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getDocument(id: string): Promise<Document | undefined>;
  createDocument(document: InsertDocument): Promise<Document>;
  getQuestionSet(id: string): Promise<QuestionSet | undefined>;
  createQuestionSet(questionSet: InsertQuestionSet): Promise<QuestionSet>;
}

export class MemStorage implements IStorage {
  private documents: Map<string, Document>;
  private questionSets: Map<string, QuestionSet>;

  constructor() {
    this.documents = new Map();
    this.questionSets = new Map();
  }

  async getDocument(id: string): Promise<Document | undefined> {
    return this.documents.get(id);
  }

  async createDocument(insertDocument: InsertDocument): Promise<Document> {
    const id = randomUUID();
    const document: Document = {
      ...insertDocument,
      id,
      uploadedAt: new Date()
    };
    this.documents.set(id, document);
    return document;
  }

  async getQuestionSet(id: string): Promise<QuestionSet | undefined> {
    return this.questionSets.get(id);
  }

  async createQuestionSet(insertQuestionSet: InsertQuestionSet): Promise<QuestionSet> {
    const id = randomUUID();
    const questionSet: QuestionSet = {
      ...insertQuestionSet,
      id,
      generatedAt: new Date()
    };
    this.questionSets.set(id, questionSet);
    return questionSet;
  }
}

export const storage = new MemStorage();
