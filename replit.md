# Question Generator Application

## Overview

This is a full-stack web application that automatically generates questions from PDF documents using AI. Users can upload PDF files, configure question parameters (type, difficulty, count), and download the generated questions in various formats. The application leverages Google's Gemini AI to analyze document content and create relevant questions with multiple choice or true/false formats.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
The client-side is built with React and TypeScript, utilizing a component-based architecture with the following key decisions:
- **React Router**: Uses Wouter for lightweight client-side routing
- **State Management**: React Query for server state management with local React state for UI interactions
- **UI Framework**: Shadcn/ui components built on Radix UI primitives for accessible, customizable components
- **Styling**: Tailwind CSS with CSS custom properties for theming and responsive design
- **Build Tool**: Vite for fast development and optimized production builds

### Backend Architecture
The server is built with Express.js and TypeScript, following a service-oriented pattern:
- **Express.js Server**: RESTful API with middleware for logging, error handling, and file uploads
- **Service Layer**: Modular services for PDF processing, AI integration, and document generation
- **File Upload**: Multer middleware for handling PDF file uploads with validation
- **PDF Processing**: pdf-parse library for extracting text content from uploaded PDFs
- **Document Generation**: PDFKit and docx libraries for creating downloadable question papers

### Data Storage Solutions
The application uses a flexible storage abstraction with the following approach:
- **Storage Interface**: Abstract storage layer that can be implemented with different backends
- **Memory Storage**: Current implementation using in-memory storage for development
- **Database Schema**: Drizzle ORM configured for PostgreSQL with tables for documents and question sets
- **Data Models**: TypeScript interfaces with Zod validation schemas for type safety

### Authentication and Authorization
Currently, the application does not implement user authentication, operating as a single-user application. All data is accessible without access controls.

### AI Integration Architecture
The application integrates with Google's Gemini AI service:
- **Gemini Service**: Dedicated service class for AI interactions with structured JSON response schemas
- **Question Generation**: AI generates questions based on document content with specified difficulty and type
- **Keyword Extraction**: Additional AI service for extracting relevant keywords from document content
- **Error Handling**: Comprehensive error handling for AI API failures and response validation

## External Dependencies

### Core Backend Dependencies
- **Express.js**: Web application framework for the REST API
- **Multer**: File upload middleware for handling PDF uploads
- **pdf-parse**: Library for extracting text content from PDF files
- **PDFKit & docx**: Document generation libraries for creating downloadable files
- **@google/genai**: Google Gemini AI SDK for question generation

### Frontend Dependencies  
- **React & React DOM**: Core frontend framework
- **@tanstack/react-query**: Server state management and caching
- **Wouter**: Lightweight client-side routing
- **Radix UI**: Accessible UI component primitives
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Icon library for consistent iconography

### Database and ORM
- **Drizzle ORM**: Type-safe ORM with PostgreSQL support
- **@neondatabase/serverless**: PostgreSQL database adapter
- **Drizzle Kit**: Migration and schema management tools

### Development and Build Tools
- **TypeScript**: Static type checking across the entire stack
- **Vite**: Frontend build tool and development server
- **ESBuild**: Backend bundling for production deployments
- **TSX**: TypeScript execution for development server

### Third-Party Services
- **Google Gemini AI**: AI service for generating questions and extracting keywords from document content
- **Neon Database**: Serverless PostgreSQL database hosting (configured but not actively used in current implementation)