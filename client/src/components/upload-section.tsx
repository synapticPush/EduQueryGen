import { useState, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Upload, CloudUpload, CheckCircle, X, AlertCircle } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface UploadSectionProps {
  onUploadSuccess: (document: any, keywords: string[]) => void;
  uploadedDocument: any;
  keywords: string[];
}

export default function UploadSection({ onUploadSuccess, uploadedDocument, keywords }: UploadSectionProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('pdf', file);
      
      const response = await apiRequest('POST', '/api/upload', formData);
      return response.json();
    },
    onSuccess: (data) => {
      setUploadProgress(100);
      onUploadSuccess(data.document, data.keywords);
      toast({
        title: "Upload successful",
        description: `PDF processed successfully. ${data.document.wordCount} words extracted.`,
      });
    },
    onError: (error: any) => {
      setUploadProgress(0);
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload PDF",
        variant: "destructive",
      });
    },
  });

  const handleFileSelect = (file: File) => {
    if (file.type !== 'application/pdf') {
      toast({
        title: "Invalid file type",
        description: "Please select a PDF file",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "File size must be less than 10MB",
        variant: "destructive",
      });
      return;
    }

    setUploadProgress(0);
    uploadMutation.mutate(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const clearUpload = () => {
    onUploadSuccess(null, []);
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="lg:col-span-1">
      <Card className="p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Upload className="text-primary-500 h-5 w-5" />
          <h2 className="text-lg font-semibold text-gray-900">Step 1: Upload PDF</h2>
        </div>

        {!uploadedDocument && !uploadMutation.isPending ? (
          <div
            data-testid="upload-zone"
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
              isDragOver ? 'border-primary-400 bg-primary-50' : 'border-gray-300 hover:border-primary-400'
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={handleClick}
          >
            <CloudUpload className="text-4xl text-gray-400 mb-4 h-16 w-16 mx-auto" />
            <p className="text-lg font-medium text-gray-700 mb-2">Drop your PDF here</p>
            <p className="text-sm text-gray-500 mb-4">or click to browse files</p>
            <Button 
              data-testid="button-select-file"
              className="bg-primary-500 hover:bg-primary-600"
            >
              Select PDF File
            </Button>
            <p className="text-xs text-gray-400 mt-3">Maximum file size: 10MB</p>
          </div>
        ) : uploadMutation.isPending ? (
          <div data-testid="upload-progress" className="mt-4">
            <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
              <span>Uploading and processing...</span>
              <span>{uploadProgress}%</span>
            </div>
            <Progress value={uploadProgress} className="w-full" />
          </div>
        ) : uploadedDocument ? (
          <div data-testid="upload-success" className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <CheckCircle className="text-green-500 h-5 w-5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-green-900" data-testid="text-filename">
                  {uploadedDocument.filename}
                </p>
                <p className="text-xs text-green-600" data-testid="text-file-stats">
                  {uploadedDocument.pageCount} pages • {formatFileSize(uploadedDocument.fileSize)} • {uploadedDocument.wordCount.toLocaleString()} words extracted
                </p>
              </div>
              <Button
                data-testid="button-clear-upload"
                variant="ghost"
                size="sm"
                onClick={clearUpload}
                className="text-green-600 hover:text-green-700"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : null}

        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf"
          onChange={handleFileInput}
          className="hidden"
        />

        {/* File Validation Info */}
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="text-sm font-medium text-blue-900 mb-2 flex items-center">
            <AlertCircle className="h-4 w-4 mr-1" />
            PDF Requirements:
          </h4>
          <ul className="text-xs text-blue-700 space-y-1">
            <li>• Text-based content (not scanned images)</li>
            <li>• Educational or informational material</li>
            <li>• Minimum 500 words for quality questions</li>
            <li>• File size under 10MB</li>
          </ul>
        </div>

        {/* Keywords Preview */}
        {keywords.length > 0 && (
          <div className="mt-4 p-4 bg-purple-50 border border-purple-200 rounded-lg">
            <h4 className="text-sm font-medium text-purple-900 mb-2">Extracted Keywords:</h4>
            <div className="flex flex-wrap gap-1">
              {keywords.slice(0, 10).map((keyword, index) => (
                <span
                  key={index}
                  className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded"
                >
                  {keyword}
                </span>
              ))}
              {keywords.length > 10 && (
                <span className="text-xs text-purple-600">+{keywords.length - 10} more</span>
              )}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
