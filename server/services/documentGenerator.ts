import PDFDocument from 'pdfkit';
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';
import type { Question, QuestionPaper } from '@shared/schema';

export class DocumentGenerator {
  async generateQuestionPaperPDF(questionPaper: QuestionPaper): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument();
        const chunks: Buffer[] = [];

        doc.on('data', (chunk) => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));

        // Header
        doc.fontSize(20).font('Helvetica-Bold').text(questionPaper.title, { align: 'center' });
        doc.moveDown();
        
        // Instructions
        doc.fontSize(12).font('Helvetica').text(questionPaper.instructions);
        doc.moveDown();

        // Metadata
        const metadata = questionPaper.metadata;
        doc.fontSize(10).text(`Questions: ${metadata.questionCount} | Difficulty: ${metadata.difficulty} | Type: ${metadata.questionType} | Generated: ${new Date(metadata.generatedAt).toLocaleDateString()}`);
        doc.moveDown(2);

        // Questions
        questionPaper.questions.forEach((question, index) => {
          doc.fontSize(12).font('Helvetica-Bold').text(`Q${index + 1}. ${question.question}`);
          doc.moveDown(0.5);

          if (question.options) {
            // MCQ options
            question.options.forEach((option, optIndex) => {
              const letter = String.fromCharCode(65 + optIndex); // A, B, C, D
              doc.fontSize(11).font('Helvetica').text(`${letter}. ${option}`, { indent: 20 });
            });
          } else {
            // True/False
            doc.fontSize(11).font('Helvetica').text('A. True', { indent: 20 });
            doc.text('B. False', { indent: 20 });
          }
          
          doc.moveDown(1.5);
        });

        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }

  async generateAnswerKeyPDF(questionPaper: QuestionPaper): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument();
        const chunks: Buffer[] = [];

        doc.on('data', (chunk) => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));

        // Header
        doc.fontSize(20).font('Helvetica-Bold').text(`${questionPaper.title} - Answer Key`, { align: 'center' });
        doc.moveDown(2);

        // Metadata
        const metadata = questionPaper.metadata;
        doc.fontSize(10).text(`Questions: ${metadata.questionCount} | Difficulty: ${metadata.difficulty} | Type: ${metadata.questionType} | Generated: ${new Date(metadata.generatedAt).toLocaleDateString()}`);
        doc.moveDown(2);

        // Answers
        questionPaper.questions.forEach((question, index) => {
          doc.fontSize(12).font('Helvetica-Bold').text(`Q${index + 1}. ${question.question}`);
          doc.moveDown(0.5);

          // Correct Answer
          doc.fontSize(11).font('Helvetica-Bold').fillColor('green').text(`Correct Answer: ${question.correctAnswer}`);
          doc.fillColor('black');
          doc.moveDown(0.3);

          // Explanation
          doc.fontSize(10).font('Helvetica').text(`Explanation: ${question.explanation}`);
          doc.moveDown(1);
        });

        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }

  async generateQuestionPaperDOCX(questionPaper: QuestionPaper): Promise<Buffer> {
    const children = [];

    // Title
    children.push(
      new Paragraph({
        children: [new TextRun({ text: questionPaper.title, bold: true, size: 32 })],
        heading: HeadingLevel.TITLE,
        alignment: 'center'
      })
    );

    // Instructions
    children.push(
      new Paragraph({
        children: [new TextRun({ text: questionPaper.instructions, size: 24 })],
        spacing: { after: 200 }
      })
    );

    // Metadata
    const metadata = questionPaper.metadata;
    children.push(
      new Paragraph({
        children: [new TextRun({ 
          text: `Questions: ${metadata.questionCount} | Difficulty: ${metadata.difficulty} | Type: ${metadata.questionType} | Generated: ${new Date(metadata.generatedAt).toLocaleDateString()}`,
          size: 20
        })],
        spacing: { after: 400 }
      })
    );

    // Questions
    questionPaper.questions.forEach((question, index) => {
      // Question text
      children.push(
        new Paragraph({
          children: [new TextRun({ text: `Q${index + 1}. ${question.question}`, bold: true, size: 24 })],
          spacing: { before: 200, after: 100 }
        })
      );

      // Options
      if (question.options) {
        question.options.forEach((option, optIndex) => {
          const letter = String.fromCharCode(65 + optIndex);
          children.push(
            new Paragraph({
              children: [new TextRun({ text: `${letter}. ${option}`, size: 22 })],
              indent: { left: 400 }
            })
          );
        });
      } else {
        children.push(
          new Paragraph({
            children: [new TextRun({ text: 'A. True', size: 22 })],
            indent: { left: 400 }
          })
        );
        children.push(
          new Paragraph({
            children: [new TextRun({ text: 'B. False', size: 22 })],
            indent: { left: 400 }
          })
        );
      }
    });

    const doc = new Document({
      sections: [{
        properties: {},
        children
      }]
    });

    return await Packer.toBuffer(doc);
  }

  async generateAnswerKeyDOCX(questionPaper: QuestionPaper): Promise<Buffer> {
    const children = [];

    // Title
    children.push(
      new Paragraph({
        children: [new TextRun({ text: `${questionPaper.title} - Answer Key`, bold: true, size: 32 })],
        heading: HeadingLevel.TITLE,
        alignment: 'center',
        spacing: { after: 400 }
      })
    );

    // Metadata
    const metadata = questionPaper.metadata;
    children.push(
      new Paragraph({
        children: [new TextRun({ 
          text: `Questions: ${metadata.questionCount} | Difficulty: ${metadata.difficulty} | Type: ${metadata.questionType} | Generated: ${new Date(metadata.generatedAt).toLocaleDateString()}`,
          size: 20
        })],
        spacing: { after: 400 }
      })
    );

    // Answers
    questionPaper.questions.forEach((question, index) => {
      // Question
      children.push(
        new Paragraph({
          children: [new TextRun({ text: `Q${index + 1}. ${question.question}`, bold: true, size: 24 })],
          spacing: { before: 200, after: 100 }
        })
      );

      // Correct Answer
      children.push(
        new Paragraph({
          children: [new TextRun({ text: `Correct Answer: ${question.correctAnswer}`, bold: true, color: '00AA00', size: 22 })],
          spacing: { after: 50 }
        })
      );

      // Explanation
      children.push(
        new Paragraph({
          children: [new TextRun({ text: `Explanation: ${question.explanation}`, size: 20 })],
          spacing: { after: 200 }
        })
      );
    });

    const doc = new Document({
      sections: [{
        properties: {},
        children
      }]
    });

    return await Packer.toBuffer(doc);
  }
}

export const documentGenerator = new DocumentGenerator();
