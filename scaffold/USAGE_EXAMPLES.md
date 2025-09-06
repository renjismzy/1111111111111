# Document Conversion Assistant - Usage Examples

This document provides practical examples of how to use the Document Conversion Assistant for various document conversion scenarios.

## Table of Contents

1. [Basic Single Document Conversion](#basic-single-document-conversion)
2. [Batch Document Processing](#batch-document-processing)
3. [Document Information Extraction](#document-information-extraction)
4. [Advanced Conversion Scenarios](#advanced-conversion-scenarios)
5. [Configuration Examples](#configuration-examples)
6. [Error Handling Examples](#error-handling-examples)

## Basic Single Document Conversion

### Convert PDF to Markdown

```javascript
// Convert a research paper from PDF to Markdown for editing
convert_document({
  input_path: "/documents/research-paper.pdf",
  output_format: "md",
  output_path: "/documents/research-paper.md"
})

// Expected output:
// "Document successfully converted to md. Output saved to: /documents/research-paper.md"
```

### Convert DOCX to HTML

```javascript
// Convert a Word document to HTML for web publishing
convert_document({
  input_path: "/documents/report.docx",
  output_format: "html"
  // output_path is optional - will use default output directory
})

// Expected output:
// "Document successfully converted to html. Output saved to: ./converted_documents/report.html"
```

### Convert Markdown to PDF

```javascript
// Convert documentation from Markdown to PDF for distribution
convert_document({
  input_path: "/docs/user-manual.md",
  output_format: "pdf",
  output_path: "/distribution/user-manual.pdf"
})

// Expected output:
// "Document successfully converted to pdf. Output saved to: /distribution/user-manual.pdf"
```

## Batch Document Processing

### Convert All PDFs in a Directory

```javascript
// Convert all PDF files in a directory to Markdown
batch_convert({
  input_directory: "/documents/pdfs",
  output_format: "md"
})

// Expected output:
// "Batch Conversion Results:
// Successfully converted: 5 files
// Failed: 0 files
// 
// Successful conversions:
// ✓ document1.pdf → document1.md
// ✓ document2.pdf → document2.md
// ✓ document3.pdf → document3.md
// ✓ document4.pdf → document4.md
// ✓ document5.pdf → document5.md"
```

### Convert Specific File Types with Pattern Matching

```javascript
// Convert only Word documents to HTML
batch_convert({
  input_directory: "/mixed-documents",
  output_format: "html",
  file_pattern: "*.docx"
})

// Convert files with specific naming pattern
batch_convert({
  input_directory: "/reports",
  output_format: "pdf",
  file_pattern: "*-final.md"
})
```

### Process Multiple Directories

```javascript
// Process documents from different project folders
const directories = [
  "/project1/docs",
  "/project2/documentation",
  "/project3/reports"
]

// Convert each directory's Markdown files to HTML
directories.forEach(dir => {
  batch_convert({
    input_directory: dir,
    output_format: "html",
    file_pattern: "*.md"
  })
})
```

## Document Information Extraction

### Get Basic Document Information

```javascript
// Get information about a PDF document
get_document_info({
  file_path: "/documents/annual-report.pdf"
})

// Expected output:
// "Document Information:
// {
//   "format": "pdf",
//   "size": "2048.50 KB",
//   "content_length": 15420,
//   "metadata": {
//     "pages": 25,
//     "info": {
//       "Title": "Annual Report 2023",
//       "Author": "Company Name",
//       "Creator": "Microsoft Word"
//     }
//   },
//   "last_modified": "2023-12-15T10:30:00.000Z"
// }"
```

### Analyze Document Before Conversion

```javascript
// Check document properties before batch conversion
get_document_info({
  file_path: "/large-documents/massive-file.pdf"
})

// If file is too large, you might get:
// "Failed to get document info: File size exceeds maximum limit of 10485760 bytes"
```

## Advanced Conversion Scenarios

### Converting Academic Papers

```javascript
// Convert research papers while preserving citations and formatting
convert_document({
  input_path: "/research/machine-learning-paper.pdf",
  output_format: "md"
})

// The tool will:
// - Extract text while maintaining paragraph structure
// - Preserve headings and subheadings
// - Maintain reference formatting
// - Extract metadata like author and title
```

### Web Content Processing

```javascript
// Convert HTML articles to clean Markdown
convert_document({
  input_path: "/web-content/article.html",
  output_format: "md"
})

// Convert blog posts to PDF for offline reading
convert_document({
  input_path: "/blog-posts/post.html",
  output_format: "pdf",
  output_path: "/offline-reading/blog-post.pdf"
})
```

### Documentation Workflows

```javascript
// Convert technical documentation from various sources

// 1. Convert Word docs from SMEs to Markdown
batch_convert({
  input_directory: "/sme-contributions",
  output_format: "md",
  file_pattern: "*.docx"
})

// 2. Convert final Markdown to HTML for web publishing
batch_convert({
  input_directory: "/converted_documents",
  output_format: "html",
  file_pattern: "*.md"
})

// 3. Generate PDF versions for distribution
batch_convert({
  input_directory: "/converted_documents",
  output_format: "pdf",
  file_pattern: "*.md"
})
```

## Configuration Examples

### High-Volume Processing Configuration

```yaml
# smithery.yaml for processing large documents
runtime: typescript
config:
  debug: false
  max_file_size: 52428800  # 50MB for large documents
  supported_formats:
    input: ["pdf", "docx", "html", "md", "txt"]
    output: ["pdf", "docx", "html", "md", "txt"]
  preserve_formatting: true
  output_directory: "/bulk-processing/output"
```

### Development/Testing Configuration

```yaml
# smithery.yaml for development and testing
runtime: typescript
config:
  debug: true  # Enable detailed logging
  max_file_size: 5242880  # 5MB for testing
  supported_formats:
    input: ["md", "txt", "html"]  # Limited formats for testing
    output: ["html", "md", "txt"]
  preserve_formatting: true
  output_directory: "./test-output"
```

### Specialized Workflow Configuration

```yaml
# smithery.yaml for PDF-focused workflow
runtime: typescript
config:
  debug: false
  max_file_size: 20971520  # 20MB
  supported_formats:
    input: ["pdf", "html", "md"]
    output: ["pdf", "html", "md"]  # Focus on PDF generation
  preserve_formatting: true
  output_directory: "/pdf-workflow/converted"
```

## Error Handling Examples

### Handling File Size Errors

```javascript
// Attempt to convert a large file
convert_document({
  input_path: "/large-files/huge-document.pdf",
  output_format: "md"
})

// Possible error response:
// "Conversion failed: File size exceeds maximum limit of 10485760 bytes"

// Solution: Increase max_file_size in smithery.yaml or split the document
```

### Handling Unsupported Formats

```javascript
// Try to convert to unsupported format
convert_document({
  input_path: "/documents/presentation.pptx",
  output_format: "md"
})

// Error response:
// "Conversion failed: Unsupported file format: pptx"

// Solution: Add format support or convert manually to supported format first
```

### Batch Processing with Mixed Results

```javascript
// Process directory with mixed file types and sizes
batch_convert({
  input_directory: "/mixed-documents",
  output_format: "html",
  file_pattern: "*.*"
})

// Example output with some failures:
// "Batch Conversion Results:
// Successfully converted: 8 files
// Failed: 3 files
// 
// Successful conversions:
// ✓ document1.pdf → document1.html
// ✓ document2.md → document2.html
// ✓ document3.txt → document3.html
// ...
// 
// Failed conversions:
// ✗ large-file.pdf: File size exceeds maximum limit
// ✗ presentation.pptx: Unsupported file format: pptx
// ✗ corrupted.docx: Error reading DOCX file"
```

## Best Practices

### 1. Pre-Processing Checks

```javascript
// Always check document info before batch processing
get_document_info({ file_path: "/documents/sample.pdf" })

// Check supported formats
list_supported_formats()
```

### 2. Organized Output Management

```javascript
// Use descriptive output paths
convert_document({
  input_path: "/source/report.docx",
  output_format: "pdf",
  output_path: "/final-reports/2023/annual-report.pdf"
})
```

### 3. Error Recovery in Batch Operations

```javascript
// Process directories in smaller batches for better error handling
const smallBatches = [
  "/documents/batch1",
  "/documents/batch2",
  "/documents/batch3"
]

smallBatches.forEach((batch, index) => {
  console.log(`Processing batch ${index + 1}...`)
  batch_convert({
    input_directory: batch,
    output_format: "html"
  })
})
```

### 4. Format-Specific Optimization

```javascript
// For PDF generation, start with clean HTML or Markdown
convert_document({
  input_path: "/clean-markdown/document.md",
  output_format: "pdf"  // Better results than PDF → PDF conversion
})

// For web publishing, use HTML as intermediate format
convert_document({
  input_path: "/documents/source.docx",
  output_format: "html"  // Then further process HTML if needed
})
```

These examples demonstrate the flexibility and power of the Document Conversion Assistant. Adjust the paths, formats, and configurations according to your specific use case and requirements.