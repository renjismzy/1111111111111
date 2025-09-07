declare module 'html-pdf-node' {
  interface Options {
    format?: 'A4' | 'A3' | 'A2' | 'A1' | 'A0' | 'Legal' | 'Letter' | 'Tabloid';
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
  }

  interface File {
    url?: string;
    content?: string;
  }

  function generatePdf(file: File, options?: Options): Promise<Buffer>;
  export { generatePdf, Options, File };
}