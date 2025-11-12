declare module 'mammoth' {
  interface ExtractRawTextOptions {
    path: string;
  }

  interface ExtractRawTextResult {
    value: string;
  }

  interface Mammoth {
    extractRawText(options: ExtractRawTextOptions): Promise<ExtractRawTextResult>;
  }

  const mammoth: Mammoth;

  export default mammoth;
}

