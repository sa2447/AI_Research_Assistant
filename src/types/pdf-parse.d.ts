declare module 'pdf-parse' {
  export interface PdfParseResult {
    text: string
    numpages: number
  }

  export default function pdfParse(dataBuffer: Buffer): Promise<PdfParseResult>
}

declare module 'pdf-parse/lib/pdf-parse.js' {
  export interface PdfParseResult {
    text: string
    numpages: number
  }

  export default function pdfParse(dataBuffer: Buffer): Promise<PdfParseResult>
}
