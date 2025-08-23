import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, FileText, Key, ClipboardList, CheckCircle } from "lucide-react";

interface OutputSectionProps {
  generatedQuestions: {
    questionSetId: string;
    questions: any[];
    metadata: {
      questionCount: number;
      difficulty: string;
      questionType: string;
      generatedAt: string;
    };
  } | null;
}

export default function OutputSection({ generatedQuestions }: OutputSectionProps) {
  const handleDownload = (type: 'questions' | 'answers', format: 'pdf' | 'docx') => {
    if (!generatedQuestions) return;
    
    const url = `/api/download/${type}/${generatedQuestions.questionSetId}/${format}`;
    window.open(url, '_blank');
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="lg:col-span-1">
      <Card className="p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Download className="text-primary-500 h-5 w-5" />
          <h2 className="text-lg font-semibold text-gray-900">Step 3: Download Results</h2>
        </div>

        {generatedQuestions ? (
          <div data-testid="generation-results" className="space-y-4">
            {/* Success Message */}
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <CheckCircle className="text-green-500 h-5 w-5" />
                <span className="text-sm font-medium text-green-900">Questions Generated Successfully!</span>
              </div>
              <p className="text-xs text-green-700" data-testid="text-generation-stats">
                {generatedQuestions.metadata.questionCount} {generatedQuestions.metadata.difficulty}-level {generatedQuestions.metadata.questionType.toUpperCase()} questions created
              </p>
            </div>

            {/* Download Options */}
            <div className="space-y-3">
              {/* Question Paper */}
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Question Paper</h4>
                    <p className="text-xs text-gray-500">Student version without answers</p>
                  </div>
                  <FileText className="text-2xl text-blue-500 h-8 w-8" />
                </div>
                <div className="flex space-x-2">
                  <Button
                    data-testid="button-download-questions-pdf"
                    onClick={() => handleDownload('questions', 'pdf')}
                    className="flex-1 bg-blue-500 text-white py-2 px-3 text-xs font-medium hover:bg-blue-600"
                  >
                    <FileText className="h-3 w-3 mr-1" />
                    PDF
                  </Button>
                  <Button
                    data-testid="button-download-questions-docx"
                    onClick={() => handleDownload('questions', 'docx')}
                    className="flex-1 bg-blue-500 text-white py-2 px-3 text-xs font-medium hover:bg-blue-600"
                  >
                    <FileText className="h-3 w-3 mr-1" />
                    DOCX
                  </Button>
                </div>
              </div>

              {/* Answer Key */}
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Answer Key</h4>
                    <p className="text-xs text-gray-500">Teacher version with solutions</p>
                  </div>
                  <Key className="text-2xl text-amber-500 h-8 w-8" />
                </div>
                <div className="flex space-x-2">
                  <Button
                    data-testid="button-download-answers-pdf"
                    onClick={() => handleDownload('answers', 'pdf')}
                    className="flex-1 bg-amber-500 text-white py-2 px-3 text-xs font-medium hover:bg-amber-600"
                  >
                    <FileText className="h-3 w-3 mr-1" />
                    PDF
                  </Button>
                  <Button
                    data-testid="button-download-answers-docx"
                    onClick={() => handleDownload('answers', 'docx')}
                    className="flex-1 bg-amber-500 text-white py-2 px-3 text-xs font-medium hover:bg-amber-600"
                  >
                    <FileText className="h-3 w-3 mr-1" />
                    DOCX
                  </Button>
                </div>
              </div>
            </div>

            {/* Generation Summary */}
            <div className="border-t border-gray-200 pt-4">
              <h4 className="text-sm font-medium text-gray-900 mb-2">Generation Summary</h4>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-gray-500">Questions:</span>
                  <span className="font-medium text-gray-900 ml-1" data-testid="text-question-count">
                    {generatedQuestions.metadata.questionCount}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Difficulty:</span>
                  <span className="font-medium text-gray-900 ml-1 capitalize" data-testid="text-difficulty">
                    {generatedQuestions.metadata.difficulty}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Type:</span>
                  <span className="font-medium text-gray-900 ml-1" data-testid="text-question-type">
                    {generatedQuestions.metadata.questionType.toUpperCase()}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Generated:</span>
                  <span className="font-medium text-gray-900 ml-1" data-testid="text-timestamp">
                    {formatTimeAgo(generatedQuestions.metadata.generatedAt)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div data-testid="empty-state" className="text-center py-8">
            <ClipboardList className="text-4xl text-gray-300 mb-4 h-16 w-16 mx-auto" />
            <p className="text-sm text-gray-500 mb-2">No questions generated yet</p>
            <p className="text-xs text-gray-400">Upload a PDF and configure your preferences to get started</p>
          </div>
        )}
      </Card>
    </div>
  );
}
