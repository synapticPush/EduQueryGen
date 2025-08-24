import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { Settings, Wand2, List, CheckSquare, Clock } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface ConfigurationPanelProps {
  documentId?: string;
  onQuestionsGenerated: (result: any) => void;
  disabled: boolean;
}

export default function ConfigurationPanel({ documentId, onQuestionsGenerated, disabled }: ConfigurationPanelProps) {
  const [questionCount, setQuestionCount] = useState("10");
  const [difficulty, setDifficulty] = useState("medium");
  const [questionType, setQuestionType] = useState("mcq");
  const { toast } = useToast();

  const generateMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/generate-questions', {
        documentId,
        questionCount: parseInt(questionCount),
        difficulty,
        questionType,
      });
      return response.json();
    },
    onSuccess: (data) => {
      onQuestionsGenerated(data);
      toast({
        title: "Questions Generated Successfully",
        description: `Created ${data.questions.length} ${difficulty} level ${questionType.toUpperCase()} questions`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Generation failed",
        description: error.message || "Failed to Generate Questions",
        variant: "destructive",
      });
    },
  });

  const handleGenerate = () => {
    if (!documentId) {
      toast({
        title: "No document uploaded",
        description: "Please upload a PDF first",
        variant: "destructive",
      });
      return;
    }
    generateMutation.mutate();
  };

  const difficultyOptions = [
    {
      value: "easy",
      label: "Easy",
      description: "Basic recall and understanding",
      badge: "Beginner",
      badgeColor: "bg-green-100 text-green-600"
    },
    {
      value: "medium",
      label: "Medium",
      description: "Application and analysis",
      badge: "Intermediate",
      badgeColor: "bg-amber-100 text-amber-600"
    },
    {
      value: "hard",
      label: "Hard",
      description: "Synthesis and evaluation",
      badge: "Advanced",
      badgeColor: "bg-red-100 text-red-600"
    }
  ];

  const questionTypeOptions = [
    {
      value: "mcq",
      label: "Multiple Choice",
      description: "4 options with 1 correct answer",
      icon: List
    },
    {
      value: "truefalse",
      label: "True/False",
      description: "Binary choice questions",
      icon: CheckSquare
    }
  ];

  return (
    <div className="lg:col-span-1">
      <Card className="p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Settings className="text-primary-500 h-5 w-5" />
          <h2 className="text-lg font-semibold text-gray-900">Step 2: Configure Questions</h2>
        </div>

        <div className="space-y-6">
          {/* Number of Questions */}
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-2 block">
              Number of Questions
            </Label>
            <Select 
              value={questionCount} 
              onValueChange={setQuestionCount}
              disabled={disabled}
              data-testid="select-question-count"
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5 Questions</SelectItem>
                <SelectItem value="10">10 Questions</SelectItem>
                <SelectItem value="15">15 Questions</SelectItem>
                <SelectItem value="20">20 Questions</SelectItem>
                <SelectItem value="25">25 Questions</SelectItem>
                <SelectItem value="30">30 Questions</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Difficulty Level */}
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-3 block">
              Difficulty Level
            </Label>
            <RadioGroup 
              value={difficulty} 
              onValueChange={setDifficulty}
              disabled={disabled}
              data-testid="radio-difficulty"
            >
              <div className="space-y-2">
                {difficultyOptions.map((option) => (
                  <div key={option.value}>
                    <Label
                      htmlFor={`difficulty-${option.value}`}
                      className={`flex items-center p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-all ${
                        difficulty === option.value
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-gray-200'
                      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <RadioGroupItem 
                        value={option.value} 
                        id={`difficulty-${option.value}`}
                        className="text-primary-500 focus:ring-primary-500"
                      />
                      <div className="ml-3 flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-900">{option.label}</span>
                          <span className={`text-xs px-2 py-1 rounded-full ${option.badgeColor}`}>
                            {option.badge}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500">{option.description}</p>
                      </div>
                    </Label>
                  </div>
                ))}
              </div>
            </RadioGroup>
          </div>

          {/* Question Types */}
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-3 block">
              Question Type
            </Label>
            <RadioGroup 
              value={questionType} 
              onValueChange={setQuestionType}
              disabled={disabled}
              data-testid="radio-question-type"
            >
              <div className="grid grid-cols-2 gap-3">
                {questionTypeOptions.map((option) => {
                  const IconComponent = option.icon;
                  return (
                    <div key={option.value}>
                      <Label
                        htmlFor={`type-${option.value}`}
                        className={`flex flex-col items-center p-4 border rounded-lg cursor-pointer transition-all ${
                          questionType === option.value
                            ? 'border-primary-500 bg-primary-50'
                            : 'border-gray-200 hover:bg-gray-50'
                        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <RadioGroupItem 
                          value={option.value} 
                          id={`type-${option.value}`}
                          className="sr-only"
                        />
                        <IconComponent 
                          className={`text-2xl mb-2 h-8 w-8 ${
                            questionType === option.value ? 'text-primary-500' : 'text-gray-400'
                          }`} 
                        />
                        <span className="text-sm font-medium text-gray-900">{option.label}</span>
                        <span className="text-xs text-gray-500 text-center">{option.description}</span>
                      </Label>
                    </div>
                  );
                })}
              </div>
            </RadioGroup>
          </div>

          {/* Generate Button */}
          <div className={`space-y-3 ${generateMutation.isPending ? 'p-4 bg-amber-50 border border-amber-200 rounded-lg' : ''}`}>
            <Button
              data-testid="button-generate"
              onClick={handleGenerate}
              disabled={disabled || generateMutation.isPending}
              className={`w-full py-4 text-lg font-semibold transition-all text-black ${
                generateMutation.isPending 
                  ? 'bg-amber-500 hover:bg-amber-600' 
                  : 'bg-primary-500 hover:bg-primary-600'
              }`}
            >
              {generateMutation.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3" />
                  <span>Generating Questions...</span>
                </>
              ) : (
                <>
                  <Wand2 className="h-5 w-5 mr-3" />
                  <span>🚀 Generate Questions</span>
                </>
              )}
            </Button>

            {/* Generation Status */}
            {generateMutation.isPending && (
              <div className="text-center space-y-2">
                <p className="text-sm font-medium text-amber-800">
                  ⚡ AI is analyzing your document and creating questions...
                </p>
                <div className="flex items-center justify-center space-x-2 text-xs text-amber-600">
                  <Clock className="h-3 w-3" />
                  <span>This may take 10-20 seconds</span>
                </div>
              </div>
            )}

            {/* Estimated Time for non-generating state */}
            {!generateMutation.isPending && (
              <div className="flex items-center justify-center space-x-2 text-xs text-gray-500">
                <Clock className="h-3 w-3" />
                <span>Estimated processing time: 10-20 seconds</span>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
