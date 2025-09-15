import pdf from 'pdf-parse';


export interface PDFProcessingResult {
  textContent: string;
  wordCount: number;
  pageCount: number;
  fileSize: number;
  isValid: boolean;
  errors?: string[];
}

export class PDFProcessor {
  async processPDF(buffer: Buffer, filename: string): Promise<PDFProcessingResult> {
    try {
      const data = await pdf(buffer);
      
      const textContent = data.text;
      const wordCount = this.countWords(textContent);
      const pageCount = data.numpages;
      const fileSize = buffer.length;

      // Validation
      const validation = this.validatePDF(textContent, wordCount, fileSize);
      
      return {
        textContent,
        wordCount,
        pageCount,
        fileSize,
        isValid: validation.isValid,
        errors: validation.errors
      };
    } catch (error) {
      console.error('PDF processing error:', error);
      return {
        textContent: '',
        wordCount: 0,
        pageCount: 0,
        fileSize: buffer.length,
        isValid: false,
        errors: ['Failed to Extract text from PDF. Please Ensure the PDF contains selectable text, not Scanned Images.']
      };
    }
  }

  private countWords(text: string): number {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  }

  private validatePDF(textContent: string, wordCount: number, fileSize: number): { isValid: boolean; errors?: string[] } {
    const errors: string[] = [];

    // Check file size (10MB limit)
    if (fileSize > 10 * 1024 * 1024) {
      errors.push('File size exceeds 10MB limit');
    }

    // Check if text was extracted
    if (!textContent || textContent.trim().length === 0) {
      errors.push('No text content found in PDF. Please ensure the PDF contains selectable text.');
    }

    // Check minimum word count for quality questions
    if (wordCount < 500) {
      errors.push('Document contains too few words (minimum 500 words required for quality question generation)');
    }

    // Check for excessive whitespace or formatting issues
    const whitespaceRatio = (textContent.length - textContent.replace(/\s/g, '').length) / textContent.length;
    if (whitespaceRatio > 0.7) {
      errors.push('Document appears to contain mostly formatting characters. Please ensure it contains readable educational content.');
    }

    return {
      isValid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined
    };
  }

  extractKeyPhrases(textContent: string): string[] {
    // Basic keyword extraction as fallback
    const words = textContent.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 3);

    // Remove common stop words
    const stopWords = new Set([
      'this', 'that', 'with', 'have', 'will', 'from', 'they', 'know', 'want', 'been',
      'good', 'much', 'some', 'time', 'very', 'when', 'come', 'here', 'just', 'like',
      'long', 'make', 'many', 'over', 'such', 'take', 'than', 'them', 'well', 'were'
    ]);

    const filteredWords = words.filter(word => !stopWords.has(word));
    
    // Count frequency and return top keywords
    const wordFreq = new Map();
    filteredWords.forEach(word => {
      wordFreq.set(word, (wordFreq.get(word) || 0) + 1);
    });

    return Array.from(wordFreq.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map(([word]) => word);
  }
}

export const pdfProcessor = new PDFProcessor();
