import { useState } from "react";
import UploadSection from "@/components/upload-section";
import ConfigurationPanel from "@/components/configuration-panel";
import OutputSection from "@/components/output-section";
import QuestionPreview from "@/components/question-preview";
import { Question } from "@shared/schema";
import { FileText, User } from "lucide-react";

export default function Home() {
  const [uploadedDocument, setUploadedDocument] = useState<{
    id: string;
    filename: string;
    fileSize: number;
    wordCount: number;
    pageCount: number;
  } | null>(null);
  
  const [extractedKeywords, setExtractedKeywords] = useState<string[]>([]);
  
  const [generatedQuestions, setGeneratedQuestions] = useState<{
    questionSetId: string;
    questions: Question[];
    metadata: {
      questionCount: number;
      difficulty: string;
      questionType: string;
      generatedAt: string;
    };
  } | null>(null);

  const handleUploadSuccess = (document: any, keywords: string[]) => {
    setUploadedDocument(document);
    setExtractedKeywords(keywords);
    setGeneratedQuestions(null); // Reset questions when new document uploaded
  };

  const handleQuestionsGenerated = (result: any) => {
    setGeneratedQuestions(result);
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
                <FileText className="text-white text-lg h-5 w-5" />
              </div>
              <h1 className="text-xl font-semibold text-gray-900">AI Powered EduQueryGen</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                <User className="text-gray-600 text-sm h-4 w-4" />
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Main Workflow */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <UploadSection 
            onUploadSuccess={handleUploadSuccess}
            uploadedDocument={uploadedDocument}
            keywords={extractedKeywords}
          />
          
          <ConfigurationPanel 
            documentId={uploadedDocument?.id}
            onQuestionsGenerated={handleQuestionsGenerated}
            disabled={!uploadedDocument}
          />
          
          <OutputSection 
            generatedQuestions={generatedQuestions}
          />
        </div>

        {/* Question Preview */}
        {generatedQuestions && (
          <QuestionPreview questions={generatedQuestions.questions} />
        )}
      </main>

      {/* Footer */}
      <footer className="mt-16 bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Features</h3>
              <ul className="space-y-2 text-xs text-gray-600">
                <li>• AI-powered question generation</li>
                <li>• Context-based content analysis</li>
                <li>• Multiple difficulty levels</li>
                <li>• MCQ and True/False formats</li>
                <li>• Separate answer keys</li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Supported Formats</h3>
              <ul className="space-y-2 text-xs text-gray-600">
                <li>• Input: PDF documents</li>
                <li>• Output: PDF and DOCX</li>
                <li>• Text-based PDFs only</li>
                <li>• Maximum file size: 10MB</li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">AI Technology</h3>
              <ul className="space-y-2 text-xs text-gray-600">
                <li>• Powered by Google Gemini</li>
                <li>• Advanced NLP processing</li>
                <li>• Context-aware generation</li>
                <li>• Quality assurance checks</li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-gray-200 text-center">
            <p className="text-xs text-gray-500">Made with love by Pushpendra Sharma ❤️</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
