declare module 'turndown' {
  interface TurndownOptions {
    headingStyle?: 'setext' | 'atx';
    hr?: string;
    bulletListMarker?: '-' | '+' | '*';
    codeBlockStyle?: 'indented' | 'fenced';
    fence?: '```' | '~~~';
    emDelimiter?: '_' | '*';
    strongDelimiter?: '**' | '__';
    linkStyle?: 'inlined' | 'referenced';
    linkReferenceStyle?: 'full' | 'collapsed' | 'shortcut';
    br?: string;
    preformattedCode?: boolean;
    blankReplacement?: (content: string, node: any) => string;
    keepReplacement?: (content: string, node: any) => string;
    defaultReplacement?: (content: string, node: any) => string;
  }

  class TurndownService {
    constructor(options?: TurndownOptions);
    turndown(html: string): string;
    use(plugin: any): TurndownService;
    addRule(key: string, rule: any): TurndownService;
    keep(filter: any): TurndownService;
    remove(filter: any): TurndownService;
    escape(string: string): string;
  }

  export = TurndownService;
}