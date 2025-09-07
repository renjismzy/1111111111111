declare module 'turndown' {
  interface Options {
    headingStyle?: 'setext' | 'atx';
    hr?: string;
    bulletListMarker?: '*' | '+' | '-';
    codeBlockStyle?: 'indented' | 'fenced';
    fence?: '```' | '~~~';
    emDelimiter?: '_' | '*';
    strongDelimiter?: '**' | '__';
    linkStyle?: 'inlined' | 'referenced';
    linkReferenceStyle?: 'full' | 'collapsed' | 'shortcut';
    preformattedCode?: boolean;
  }

  class TurndownService {
    constructor(options?: Options);
    turndown(html: string): string;
    addRule(key: string, rule: any): this;
    keep(filter: string | string[] | Function): this;
    remove(filter: string | string[] | Function): this;
    use(plugins: Function | Function[]): this;
  }

  export = TurndownService;
}