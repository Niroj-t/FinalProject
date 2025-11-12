declare module 'pdf-parse' {
  interface PDFParseData {
    text: string;
  }

  function pdf(buffer: Buffer): Promise<PDFParseData>;

  export default pdf;
}

