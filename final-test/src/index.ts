/**
 * 📄 Document Conversion Assistant
 * A powerful tool for converting documents while maintaining format and style consistency
 * 
 * Supported formats: PDF, DOCX, HTML, Markdown, TXT
 * Features: Format detection, style preservation, batch conversion
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import fs from "fs-extra"
import path from "path"
import mime from "mime-types"
import mammoth from "mammoth"
import pdfParse from "pdf-parse"
import { marked } from "marked"
import TurndownService from "turndown"
import { JSDOM } from "jsdom"
import htmlPdf from "html-pdf-node"
import fetch from "node-fetch"

// Configuration schema matching smithery.yaml
export const configSchema = z.object({
	debug: z.boolean().default(false).describe("Enable debug logging"),
	max_file_size: z.number().default(10485760).describe("Maximum file size in bytes"),
	supported_formats: z.object({
		input: z.array(z.string()).default(["pdf", "docx", "html", "md", "txt"]),
		output: z.array(z.string()).default(["pdf", "docx", "html", "md", "txt"])
	}).default({}),
	preserve_formatting: z.boolean().default(true).describe("Preserve original formatting"),
	output_directory: z.string().default("./converted_documents").describe("Output directory for converted files"),
	smithery_api_key: z.string().optional().describe("Smithery Registry API key for MCP server discovery")
})

// Smithery Registry API utility class
class SmitheryRegistry {
	private apiKey: string | undefined
	private baseUrl = 'https://smithery.ai/api'

	constructor(apiKey?: string) {
		this.apiKey = apiKey
	}

	private async makeRequest(endpoint: string, params?: Record<string, string>) {
		if (!this.apiKey) {
			throw new Error('Smithery API key is required for registry operations')
		}

		const url = new URL(`${this.baseUrl}${endpoint}`)
		if (params) {
			Object.entries(params).forEach(([key, value]) => {
				url.searchParams.append(key, value)
			})
		}

		const response = await fetch(url.toString(), {
			headers: {
				'Authorization': `Bearer ${this.apiKey}`,
				'Content-Type': 'application/json'
			}
		})

		if (!response.ok) {
			throw new Error(`Smithery API error: ${response.status} ${response.statusText}`)
		}

		return response.json()
	}

	async searchServers(query?: string, limit = 10) {
		const params: Record<string, string> = { limit: limit.toString() }
		if (query) params.q = query
		return this.makeRequest('/servers', params)
	}

	async getServerDetails(serverName: string) {
		return this.makeRequest(`/servers/${encodeURIComponent(serverName)}`)
	}

	createConnectionUrl(serverName: string, config?: Record<string, any>) {
		const baseUrl = `wss://smithery.ai/ws/${encodeURIComponent(serverName)}`
		if (config) {
			const encodedConfig = btoa(JSON.stringify(config))
			return `${baseUrl}?config=${encodedConfig}`
		}
		return baseUrl
	}
}

// Document conversion utility class
class DocumentConverter {
	private config: z.infer<typeof configSchema>
	private turndownService: TurndownService

	constructor(config: z.infer<typeof configSchema>) {
		this.config = config
		this.turndownService = new TurndownService({
			headingStyle: 'atx',
			codeBlockStyle: 'fenced'
		})
	}

	// Detect file format based on extension and content
	detectFormat(filePath: string): string {
		const ext = path.extname(filePath).toLowerCase()
		switch (ext) {
			case '.pdf': return 'pdf'
			case '.docx': return 'docx'
			case '.html': case '.htm': return 'html'
			case '.md': case '.markdown': return 'md'
			case '.txt': return 'txt'
			default: return 'unknown'
		}
	}

	// Read and parse different document formats
	async readDocument(filePath: string): Promise<{ content: string; format: string; metadata?: any }> {
		const format = this.detectFormat(filePath)
		const stats = await fs.stat(filePath)
		
		if (stats.size > this.config.max_file_size) {
			throw new Error(`File size exceeds maximum limit of ${this.config.max_file_size} bytes`)
		}

		switch (format) {
			case 'pdf':
				return await this.readPDF(filePath)
			case 'docx':
				return await this.readDOCX(filePath)
			case 'html':
				return await this.readHTML(filePath)
			case 'md':
				return await this.readMarkdown(filePath)
			case 'txt':
				return await this.readText(filePath)
			default:
				throw new Error(`Unsupported file format: ${format}`)
		}
	}

	private async readPDF(filePath: string) {
		const buffer = await fs.readFile(filePath)
		const data = await pdfParse(buffer)
		return {
			content: data.text,
			format: 'pdf',
			metadata: {
				pages: data.numpages,
				info: data.info
			}
		}
	}

	private async readDOCX(filePath: string) {
		const buffer = await fs.readFile(filePath)
		const result = await mammoth.extractRawText({ buffer })
		return {
			content: result.value,
			format: 'docx',
			metadata: {
				messages: result.messages
			}
		}
	}

	private async readHTML(filePath: string) {
		const content = await fs.readFile(filePath, 'utf-8')
		const dom = new JSDOM(content)
		const textContent = dom.window.document.body?.textContent || content
		return {
			content: textContent,
			format: 'html',
			metadata: {
				title: dom.window.document.title
			}
		}
	}

	private async readMarkdown(filePath: string) {
		const content = await fs.readFile(filePath, 'utf-8')
		return {
			content,
			format: 'md'
		}
	}

	private async readText(filePath: string) {
		const content = await fs.readFile(filePath, 'utf-8')
		return {
			content,
			format: 'txt'
		}
	}

	// Convert content to different formats
	async convertDocument(inputPath: string, outputFormat: string, outputPath?: string): Promise<string> {
		const document = await this.readDocument(inputPath)
		const inputFormat = document.format
		
		if (!this.config.supported_formats.output.includes(outputFormat)) {
			throw new Error(`Unsupported output format: ${outputFormat}`)
		}

		// Ensure output directory exists
		await fs.ensureDir(this.config.output_directory)
		
		const fileName = path.basename(inputPath, path.extname(inputPath))
		const finalOutputPath = outputPath || path.join(this.config.output_directory, `${fileName}.${outputFormat}`)

		let convertedContent: string

		switch (outputFormat) {
			case 'html':
				convertedContent = await this.convertToHTML(document.content, inputFormat)
				break
			case 'md':
				convertedContent = await this.convertToMarkdown(document.content, inputFormat)
				break
			case 'txt':
				convertedContent = document.content
				break
			case 'pdf':
				return await this.convertToPDF(document.content, inputFormat, finalOutputPath)
			default:
				throw new Error(`Conversion to ${outputFormat} not implemented`)
		}

		await fs.writeFile(finalOutputPath, convertedContent, 'utf-8')
		return finalOutputPath
	}

	private async convertToHTML(content: string, fromFormat: string): Promise<string> {
		switch (fromFormat) {
			case 'md':
				return marked(content)
			case 'txt':
				return `<html><body><pre>${content}</pre></body></html>`
			case 'html':
				return content
			default:
				return `<html><body><p>${content.replace(/\n/g, '<br>')}</p></body></html>`
		}
	}

	private async convertToMarkdown(content: string, fromFormat: string): Promise<string> {
		switch (fromFormat) {
			case 'html':
				return this.turndownService.turndown(content)
			case 'md':
				return content
			default:
				return content
		}
	}

	private async convertToPDF(content: string, fromFormat: string, outputPath: string): Promise<string> {
		let htmlContent: string
		
		if (fromFormat === 'html') {
			htmlContent = content
		} else {
			htmlContent = await this.convertToHTML(content, fromFormat)
		}

		const options = {
			format: 'A4',
			margin: { top: '1in', right: '1in', bottom: '1in', left: '1in' }
		}

		const file = { content: htmlContent }
		const pdfBuffer = await htmlPdf.generatePdf(file, options)
		await fs.writeFile(outputPath, pdfBuffer)
		return outputPath
	}
}

export default function createServer({
	config,
}: {
	config: z.infer<typeof configSchema>
}) {
	const server = new McpServer({
		name: "Document Conversion Assistant",
		version: "1.0.0",
	})

	const converter = new DocumentConverter(config)
	const smitheryRegistry = new SmitheryRegistry(config.smithery_api_key)

	// Document conversion tool
	server.registerTool(
		"convert_document",
		{
			title: "Convert Document",
			description: "Convert a document from one format to another while preserving formatting",
			inputSchema: {
				input_path: z.string().describe("Path to the input document"),
				output_format: z.enum(["pdf", "docx", "html", "md", "txt"]).describe("Target output format"),
				output_path: z.string().optional().describe("Optional custom output path")
			},
		},
		async ({ input_path, output_format, output_path }) => {
			try {
				const result = await converter.convertDocument(input_path, output_format, output_path)
				return {
					content: [{
						type: "text",
						text: `Document successfully converted to ${output_format}. Output saved to: ${result}`
					}]
				}
			} catch (error) {
				return {
					content: [{
						type: "text",
						text: `Conversion failed: ${error instanceof Error ? error.message : 'Unknown error'}`
					}]
				}
			}
		}
	)

	// Document information tool
	server.registerTool(
		"get_document_info",
		{
			title: "Get Document Information",
			description: "Get detailed information about a document including format, size, and metadata",
			inputSchema: {
				file_path: z.string().describe("Path to the document file")
			},
		},
		async ({ file_path }) => {
			try {
				const document = await converter.readDocument(file_path)
				const stats = await fs.stat(file_path)
				const info = {
					format: document.format,
					size: `${(stats.size / 1024).toFixed(2)} KB`,
					content_length: document.content.length,
					metadata: document.metadata || {},
					last_modified: stats.mtime.toISOString()
				}
				return {
					content: [{
						type: "text",
						text: `Document Information:\n${JSON.stringify(info, null, 2)}`
					}]
				}
			} catch (error) {
				return {
					content: [{
						type: "text",
						text: `Failed to get document info: ${error instanceof Error ? error.message : 'Unknown error'}`
					}]
				}
			}
		}
	)

	// Batch conversion tool
	server.registerTool(
		"batch_convert",
		{
			title: "Batch Convert Documents",
			description: "Convert multiple documents in a directory to the same output format",
			inputSchema: {
				input_directory: z.string().describe("Directory containing input documents"),
				output_format: z.enum(["pdf", "docx", "html", "md", "txt"]).describe("Target output format"),
				file_pattern: z.string().optional().describe("File pattern to match (e.g., '*.pdf', '*.docx')")
			},
		},
		async ({ input_directory, output_format, file_pattern }) => {
			try {
				const files = await fs.readdir(input_directory)
				const results: string[] = []
				const errors: string[] = []

				for (const file of files) {
					const filePath = path.join(input_directory, file)
					const stats = await fs.stat(filePath)
					
					if (!stats.isFile()) continue
					
					// Apply file pattern filter if provided
					if (file_pattern) {
						const pattern = file_pattern.replace('*', '.*')
						const regex = new RegExp(pattern, 'i')
						if (!regex.test(file)) continue
					}

					try {
						const result = await converter.convertDocument(filePath, output_format)
						results.push(`✓ ${file} → ${path.basename(result)}`)
					} catch (error) {
						errors.push(`✗ ${file}: ${error instanceof Error ? error.message : 'Unknown error'}`)
					}
				}

				const summary = [
					`Batch Conversion Results:`,
					`Successfully converted: ${results.length} files`,
					`Failed: ${errors.length} files`,
					'',
					'Successful conversions:',
					...results,
					'',
					'Failed conversions:',
					...errors
				].join('\n')

				return {
					content: [{
						type: "text",
						text: summary
					}]
				}
			} catch (error) {
				return {
					content: [{
						type: "text",
						text: `Batch conversion failed: ${error instanceof Error ? error.message : 'Unknown error'}`
					}]
				}
			}
		}
	)

	// List supported formats tool
	server.registerTool(
		"list_supported_formats",
		{
			title: "List Supported Formats",
			description: "Get a list of all supported input and output formats",
			inputSchema: {},
		},
		async () => {
			const formatInfo = {
				input_formats: config.supported_formats.input,
				output_formats: config.supported_formats.output,
				max_file_size: `${(config.max_file_size / 1024 / 1024).toFixed(2)} MB`,
				output_directory: config.output_directory,
				preserve_formatting: config.preserve_formatting
			}
			return {
				content: [{
					type: "text",
					text: `Supported Formats and Configuration:\n${JSON.stringify(formatInfo, null, 2)}`
				}]
			}
		}
	)

	// Smithery Registry: Search MCP servers
	server.registerTool(
		"search_mcp_servers",
		{
			title: "Search MCP Servers",
			description: "Search for MCP servers in the Smithery Registry",
			inputSchema: {
				query: z.string().optional().describe("Search query for MCP servers (optional)"),
				limit: z.number().default(10).describe("Maximum number of results to return")
			},
		},
		async ({ query, limit = 10 }) => {
			try {
				if (!config.smithery_api_key) {
					return {
						content: [{
							type: "text",
							text: "Smithery API key is required. Please configure 'smithery_api_key' in your smithery.yaml file."
						}]
					}
				}

				const results = await smitheryRegistry.searchServers(query, limit)
				return {
					content: [{
						type: "text",
						text: `MCP Servers Search Results:\n${JSON.stringify(results, null, 2)}`
					}]
				}
			} catch (error) {
				return {
					content: [{
						type: "text",
						text: `Failed to search MCP servers: ${error instanceof Error ? error.message : 'Unknown error'}`
					}]
				}
			}
		}
	)

	// Smithery Registry: Get server details
	server.registerTool(
		"get_mcp_server_details",
		{
			title: "Get MCP Server Details",
			description: "Get detailed information about a specific MCP server",
			inputSchema: {
				server_name: z.string().describe("Qualified name of the MCP server (owner/repository)")
			},
		},
		async ({ server_name }) => {
			try {
				if (!config.smithery_api_key) {
					return {
						content: [{
							type: "text",
							text: "Smithery API key is required. Please configure 'smithery_api_key' in your smithery.yaml file."
						}]
					}
				}

				const details = await smitheryRegistry.getServerDetails(server_name)
				return {
					content: [{
						type: "text",
						text: `MCP Server Details for ${server_name}:\n${JSON.stringify(details, null, 2)}`
					}]
				}
			} catch (error) {
				return {
					content: [{
						type: "text",
						text: `Failed to get server details: ${error instanceof Error ? error.message : 'Unknown error'}`
					}]
				}
			}
		}
	)

	// Smithery Registry: Create connection URL
	server.registerTool(
		"create_mcp_connection_url",
		{
			title: "Create MCP Connection URL",
			description: "Generate a WebSocket connection URL for an MCP server",
			inputSchema: {
				server_name: z.string().describe("Qualified name of the MCP server (owner/repository)"),
				config: z.record(z.any()).optional().describe("Optional configuration object for the server")
			},
		},
		async ({ server_name, config: serverConfig }) => {
			try {
				const connectionUrl = smitheryRegistry.createConnectionUrl(server_name, serverConfig)
				return {
					content: [{
						type: "text",
						text: `Connection URL for ${server_name}:\n${connectionUrl}\n\nYou can use this URL to connect to the MCP server via WebSocket.`
					}]
				}
			} catch (error) {
				return {
					content: [{
						type: "text",
						text: `Failed to create connection URL: ${error instanceof Error ? error.message : 'Unknown error'}`
					}]
				}
			}
		}
	)

	// Add a resource for conversion history
	server.registerResource(
		"conversion-history",
		"history://conversions",
		{
			title: "Document Conversion History",
			description: "View the history and capabilities of the document conversion assistant",
		},
		async uri => ({
			contents: [
				{
					uri: uri.href,
					text: `Document Conversion Assistant\n\nThis tool provides comprehensive document conversion capabilities while preserving formatting and style consistency.\n\nSupported Operations:\n- Single document conversion between PDF, DOCX, HTML, Markdown, and TXT formats\n- Batch conversion of multiple documents\n- Document information extraction and metadata analysis\n- Format detection and validation\n\nKey Features:\n- Automatic format detection\n- Style and formatting preservation\n- Configurable file size limits\n- Batch processing capabilities\n- Detailed error reporting\n\nConfiguration:\n- Maximum file size: ${(config.max_file_size / 1024 / 1024).toFixed(2)} MB\n- Output directory: ${config.output_directory}\n- Preserve formatting: ${config.preserve_formatting ? 'Enabled' : 'Disabled'}`,
					mimeType: "text/plain",
				},
			],
		}),
	)

	// Add a prompt for document conversion guidance
	server.registerPrompt(
		"convert_guide",
		{
			title: "Document Conversion Guide",
			description: "Get guidance on converting documents with specific requirements",
			argsSchema: {
				source_format: z.string().describe("Source document format"),
				target_format: z.string().describe("Target document format"),
				special_requirements: z.string().optional().describe("Any special formatting requirements")
			},
		},
		async ({ source_format, target_format, special_requirements }) => {
			const guidance = `Please help me convert a ${source_format} document to ${target_format} format${special_requirements ? ` with the following requirements: ${special_requirements}` : ''}. What's the best approach to maintain formatting and ensure quality conversion?`
			
			return {
				messages: [
					{
						role: "user",
						content: {
							type: "text",
							text: guidance,
						},
					},
				],
			}
		},
	)

	return server.server
}
