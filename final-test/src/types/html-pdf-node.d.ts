declare module 'html-pdf-node' {
  interface PDFOptions {
    format?: string;
    width?: string;
    height?: string;
    margin?: {
      top?: string;
      right?: string;
      bottom?: string;
      left?: string;
    };
    printBackground?: boolean;
    landscape?: boolean;
    preferCSSPageSize?: boolean;
    displayHeaderFooter?: boolean;
    headerTemplate?: string;
    footerTemplate?: string;
    scale?: number;
    pageRanges?: string;
  }

  interface FileOptions {
    content: string;
    url?: string;
  }

  function generatePdf(file: FileOptions, options?: PDFOptions): Promise<Buffer>;

  export { generatePdf };
}