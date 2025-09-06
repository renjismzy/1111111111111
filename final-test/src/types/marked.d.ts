declare module 'marked' {
  export interface MarkedOptions {
    gfm?: boolean;
    breaks?: boolean;
    pedantic?: boolean;
    sanitize?: boolean;
    smartLists?: boolean;
    smartypants?: boolean;
    tables?: boolean;
    renderer?: any;
    highlight?: (code: string, lang: string) => string;
  }

  export function parse(markdown: string, options?: MarkedOptions): string;
  export function setOptions(options: MarkedOptions): void;
  export const defaults: MarkedOptions;
}