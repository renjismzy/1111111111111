declare module 'jsdom' {
  interface DOMWindow extends Window {
    document: Document;
  }

  interface JSDOMOptions {
    url?: string;
    referrer?: string;
    contentType?: string;
    includeNodeLocations?: boolean;
    storageQuota?: number;
    runScripts?: 'dangerously' | 'outside-only';
    resources?: any;
    virtualConsole?: any;
    cookieJar?: any;
    beforeParse?: (window: DOMWindow) => void;
    pretendToBeVisual?: boolean;
    userAgent?: string;
  }

  class JSDOM {
    constructor(html?: string, options?: JSDOMOptions);
    window: DOMWindow;
    serialize(): string;
    nodeLocation(node: Node): any;
    getInternalVMContext(): any;
    reconfigure(settings: { windowTop?: DOMWindow; url?: string }): void;
  }

  function fromURL(url: string, options?: JSDOMOptions): Promise<JSDOM>;
  function fromFile(filename: string, options?: JSDOMOptions): Promise<JSDOM>;
  function fragment(html: string): DocumentFragment;

  export { JSDOM, fromURL, fromFile, fragment };
}