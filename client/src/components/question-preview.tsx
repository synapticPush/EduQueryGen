import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Eye, ChevronLeft, ChevronRight, CheckCircle } from "lucide-react";
import type { Question } from "@shared/schema";

interface QuestionPreviewProps {
  questions: Question[];
}

export default function QuestionPreview({ questions }: QuestionPreviewProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);

  if (!questions || questions.length === 0) {
    return null;
  }

  const currentQuestion = questions[currentQuestionIndex];
  const totalQuestions = questions.length;

  const handlePrevious = () => {
    setCurrentQuestionIndex((prev) => Math.max(0, prev - 1));
    setShowAnswer(false);
  };

  const handleNext = () => {
    setCurrentQuestionIndex((prev) => Math.min(totalQuestions - 1, prev + 1));
    setShowAnswer(false);
  };

  const handleQuestionSelect = (index: number) => {
    setCurrentQuestionIndex(index);
    setShowAnswer(false);
  };

  const toggleShowAnswer = () => {
    setShowAnswer(!showAnswer);
  };

  const renderQuestionNavigation = () => {
    const maxButtons = 10;
    const startIndex = Math.max(0, currentQuestionIndex - Math.floor(maxButtons / 2));
    const endIndex = Math.min(totalQuestions, startIndex + maxButtons);
    const adjustedStartIndex = Math.max(0, endIndex - maxButtons);

    const buttons = [];
    
    for (let i = adjustedStartIndex; i < endIndex; i++) {
      buttons.push(
        <Button
          key={i}
          data-testid={`button-question-${i + 1}`}
          onClick={() => handleQuestionSelect(i)}
          variant={i === currentQuestionIndex ? "default" : "outline"}
          size="sm"
          className={`w-8 h-8 text-xs font-medium ${
            i === currentQuestionIndex 
              ? 'bg-primary-500 text-white' 
              : 'border-gray-300 text-gray-600 hover:bg-gray-50'
          }`}
        >
          {i + 1}
        </Button>
      );
    }

    if (adjustedStartIndex > 0) {
      buttons.unshift(
        <span key="start-ellipsis" className="flex items-center px-2 text-gray-400">...</span>
      );
    }

    if (endIndex < totalQuestions) {
      buttons.push(
        <span key="end-ellipsis" className="flex items-center px-2 text-gray-400">...</span>
      );
      buttons.push(
        <Button
          key={totalQuestions - 1}
          data-testid={`button-question-${totalQuestions}`}
          onClick={() => handleQuestionSelect(totalQuestions - 1)}
          variant={totalQuestions - 1 === currentQuestionIndex ? "default" : "outline"}
          size="sm"
          className={`w-8 h-8 text-xs font-medium ${
            totalQuestions - 1 === currentQuestionIndex 
              ? 'bg-primary-500 text-white' 
              : 'border-gray-300 text-gray-600 hover:bg-gray-50'
          }`}
        >
          {totalQuestions}
        </Button>
      );
    }

    return buttons;
  };

  return (
    <Card className="mt-8 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Eye className="text-primary-500 h-5 w-5" />
          <h2 className="text-lg font-semibold text-gray-900">Question Preview</h2>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <span>Question</span>
          <span className="bg-gray-200 px-2 py-1 rounded text-xs font-medium" data-testid="text-current-question">
            {currentQuestionIndex + 1}
          </span>
          <span>of</span>
          <span data-testid="text-total-questions">{totalQuestions}</span>
        </div>
      </div>

      {/* Question Content */}
      <div className="border border-gray-200 rounded-lg p-6">
        <div className="flex items-start space-x-3 mb-4">
          <span className="bg-primary-100 text-primary-700 px-2 py-1 rounded text-xs font-medium">
            Q{currentQuestionIndex + 1}
          </span>
          <div className="flex-1">
            <p className="text-gray-900 font-medium mb-4" data-testid="text-question">
              {currentQuestion.question}
            </p>
            
            {/* Options */}
            {currentQuestion.options ? (
              <RadioGroup className="space-y-3" data-testid="radio-options">
                {currentQuestion.options.map((option, index) => {
                  const letter = String.fromCharCode(65 + index); // A, B, C, D
                  const isCorrect = showAnswer && option === currentQuestion.correctAnswer;
                  
                  return (
                    <Label
                      key={index}
                      className={`flex items-start space-x-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                        isCorrect 
                          ? 'border-green-500 bg-green-50' 
                          : 'border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <RadioGroupItem 
                        value={option} 
                        className="mt-1 text-primary-500 focus:ring-primary-500"
                        disabled
                      />
                      <span className={`text-sm ${isCorrect ? 'text-green-900 font-medium' : 'text-gray-700'}`}>
                        {letter}. {option}
                        {isCorrect && <CheckCircle className="inline ml-2 h-4 w-4 text-green-500" />}
                      </span>
                    </Label>
                  );
                })}
              </RadioGroup>
            ) : (
              <RadioGroup className="space-y-3" data-testid="radio-true-false">
                {['True', 'False'].map((option, index) => {
                  const letter = String.fromCharCode(65 + index); // A, B
                  const isCorrect = showAnswer && option === currentQuestion.correctAnswer;
                  
                  return (
                    <Label
                      key={index}
                      className={`flex items-start space-x-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                        isCorrect 
                          ? 'border-green-500 bg-green-50' 
                          : 'border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <RadioGroupItem 
                        value={option} 
                        className="mt-1 text-primary-500 focus:ring-primary-500"
                        disabled
                      />
                      <span className={`text-sm ${isCorrect ? 'text-green-900 font-medium' : 'text-gray-700'}`}>
                        {letter}. {option}
                        {isCorrect && <CheckCircle className="inline ml-2 h-4 w-4 text-green-500" />}
                      </span>
                    </Label>
                  );
                })}
              </RadioGroup>
            )}

            {/* Show Answer Button and Answer */}
            <div className="mt-4 space-y-3">
              <Button
                data-testid="button-toggle-answer"
                onClick={toggleShowAnswer}
                variant="outline"
                size="sm"
                className="text-primary-600 border-primary-600 hover:bg-primary-50"
              >
                {showAnswer ? 'Hide Answer' : 'Show Answer'}
              </Button>

              {showAnswer && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg" data-testid="answer-explanation">
                  <div className="flex items-center space-x-2 mb-2">
                    <CheckCircle className="text-green-500 h-4 w-4" />
                    <span className="text-sm font-medium text-green-900">
                      Correct Answer: {currentQuestion.correctAnswer}
                    </span>
                  </div>
                  <p className="text-xs text-green-700" data-testid="text-explanation">
                    Explanation: {currentQuestion.explanation}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
        <Button
          data-testid="button-previous"
          onClick={handlePrevious}
          disabled={currentQuestionIndex === 0}
          variant="outline"
          className="flex items-center space-x-2"
        >
          <ChevronLeft className="h-4 w-4" />
          <span>Previous</span>
        </Button>
        
        <div className="flex space-x-1">
          {renderQuestionNavigation()}
        </div>
        
        <Button
          data-testid="button-next"
          onClick={handleNext}
          disabled={currentQuestionIndex === totalQuestions - 1}
          className="flex items-center space-x-2 bg-primary-600 hover:bg-primary-700 px-6 py-2 font-semibold text-black"
        >
          <span>Next Question</span>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  );
}
