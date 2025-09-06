# Document Conversion Assistant

📄 A powerful document conversion tool built with Smithery that maintains format and style consistency across different document types.

## Features

- **Multi-format Support**: Convert between PDF, DOCX, HTML, Markdown, and TXT formats
- **Style Preservation**: Maintains original formatting and styling during conversion
- **Batch Processing**: Convert multiple documents at once
- **Format Detection**: Automatically detects input document formats
- **Metadata Extraction**: Extracts and preserves document metadata
- **Configurable Limits**: Set file size limits and output directories
- **Error Handling**: Comprehensive error reporting and validation

## Supported Formats

### Input Formats
- **PDF** (.pdf) - Portable Document Format
- **DOCX** (.docx) - Microsoft Word Document
- **HTML** (.html, .htm) - HyperText Markup Language
- **Markdown** (.md, .markdown) - Markdown files
- **TXT** (.txt) - Plain text files

### Output Formats
- **PDF** - High-quality PDF generation with formatting preservation
- **DOCX** - Microsoft Word compatible documents
- **HTML** - Web-ready HTML with proper styling
- **Markdown** - Clean, readable Markdown format
- **TXT** - Plain text with content extraction

## Quick Start

### Installation

```bash
npm create smithery document-converter
cd document-converter
npm install
```

### Running the Server

```bash
npm run dev
```

### Basic Usage

Once the server is running, you can use the following tools:

#### 1. Convert Single Document
```javascript
// Convert a PDF to Markdown
convert_document({
  input_path: "/path/to/document.pdf",
  output_format: "md",
  output_path: "/path/to/output.md" // optional
})
```

#### 2. Get Document Information
```javascript
// Get detailed info about a document
get_document_info({
  file_path: "/path/to/document.pdf"
})
```

#### 3. Batch Convert Documents
```javascript
// Convert all PDFs in a directory to HTML
batch_convert({
  input_directory: "/path/to/documents",
  output_format: "html",
  file_pattern: "*.pdf" // optional filter
})
```

#### 4. List Supported Formats
```javascript
// Get configuration and supported formats
list_supported_formats()
```

## Configuration

Edit `smithery.yaml` to customize the conversion settings:

```yaml
runtime: typescript
config:
  debug: false
  max_file_size: 10485760  # 10MB
  supported_formats:
    input: ["pdf", "docx", "html", "md", "txt"]
    output: ["pdf", "docx", "html", "md", "txt"]
  preserve_formatting: true
  output_directory: "./converted_documents"
```

### Configuration Options

- **debug**: Enable debug logging for troubleshooting
- **max_file_size**: Maximum file size in bytes (default: 10MB)
- **supported_formats**: Define which formats are supported for input/output
- **preserve_formatting**: Whether to maintain original document formatting
- **output_directory**: Default directory for converted files

## Advanced Features

### Format-Specific Conversions

#### PDF to Markdown
- Extracts text content while preserving structure
- Maintains headings and paragraph formatting
- Includes metadata like page count and document info

#### DOCX to HTML
- Preserves text formatting (bold, italic, etc.)
- Maintains document structure and headings
- Extracts embedded content

#### HTML to PDF
- Generates high-quality PDFs with proper margins
- Preserves CSS styling and layout
- Configurable page formatting

#### Markdown to HTML
- Full Markdown syntax support
- Code block highlighting
- Table and list formatting

### Batch Processing

The batch conversion feature allows you to:
- Process entire directories of documents
- Filter files by pattern (e.g., `*.pdf`, `*.docx`)
- Get detailed conversion reports
- Handle errors gracefully with individual file reporting

### Error Handling

The tool provides comprehensive error handling:
- File size validation
- Format compatibility checking
- Detailed error messages
- Graceful failure recovery in batch operations

## API Reference

### Tools

#### `convert_document`
Convert a single document to another format.

**Parameters:**
- `input_path` (string): Path to the input document
- `output_format` (enum): Target format (pdf, docx, html, md, txt)
- `output_path` (string, optional): Custom output file path

#### `get_document_info`
Get detailed information about a document.

**Parameters:**
- `file_path` (string): Path to the document

#### `batch_convert`
Convert multiple documents in a directory.

**Parameters:**
- `input_directory` (string): Directory containing input files
- `output_format` (enum): Target format for all files
- `file_pattern` (string, optional): File filter pattern

#### `list_supported_formats`
Get current configuration and supported formats.

**Parameters:** None

### Resources

#### `conversion-history`
Access documentation and capability information.

### Prompts

#### `convert_guide`
Get guidance for specific conversion scenarios.

**Parameters:**
- `source_format` (string): Source document format
- `target_format` (string): Target document format
- `special_requirements` (string, optional): Special formatting needs

## Development

### Local Development

1. Clone the repository
2. Install dependencies: `npm install`
3. Build the project: `npm run build`
4. Run in development mode: `npm run dev`

### Project Structure

```
document-conversion-assistant/
├── src/
│   └── index.ts          # Main server implementation
├── package.json          # Dependencies and scripts
├── smithery.yaml         # Configuration
├── tsconfig.json         # TypeScript configuration
└── README.md            # This file
```

### Dependencies

- **@modelcontextprotocol/sdk**: MCP server framework
- **mammoth**: DOCX processing
- **pdf-parse**: PDF text extraction
- **html-pdf-node**: PDF generation
- **marked**: Markdown parsing
- **turndown**: HTML to Markdown conversion
- **jsdom**: HTML processing
- **fs-extra**: Enhanced file system operations

## Troubleshooting

### Common Issues

1. **File Size Errors**: Increase `max_file_size` in configuration
2. **Format Not Supported**: Check `supported_formats` in config
3. **Permission Errors**: Ensure read/write access to input/output directories
4. **PDF Generation Issues**: Verify HTML content is valid for PDF conversion

### Debug Mode

Enable debug logging by setting `debug: true` in `smithery.yaml`:

```yaml
config:
  debug: true
```

## License

ISC License - see package.json for details.

## Contributing

Contributions are welcome! Please ensure all tests pass and follow the existing code style.
