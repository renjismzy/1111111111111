declare module 'mammoth' {
  export interface ConvertToHtmlOptions {
    styleMap?: string[];
    includeEmbeddedStyleMap?: boolean;
    includeDefaultStyleMap?: boolean;
    convertImage?: (image: any) => any;
    ignoreEmptyParagraphs?: boolean;
    idPrefix?: string;
    transformDocument?: (document: any) => any;
  }

  export interface ConvertToMarkdownOptions {
    styleMap?: string[];
    includeEmbeddedStyleMap?: boolean;
    includeDefaultStyleMap?: boolean;
    convertImage?: (image: any) => any;
    ignoreEmptyParagraphs?: boolean;
    idPrefix?: string;
    transformDocument?: (document: any) => any;
  }

  export interface ConvertResult {
    value: string;
    messages: any[];
  }

  export function convertToHtml(input: Buffer | ArrayBuffer, options?: ConvertToHtmlOptions): Promise<ConvertResult>;
  export function convertToMarkdown(input: Buffer | ArrayBuffer, options?: ConvertToMarkdownOptions): Promise<ConvertResult>;
  export function extractRawText(input: Buffer | ArrayBuffer): Promise<ConvertResult>;
}