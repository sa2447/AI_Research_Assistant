declare module 'pdfjs-dist/build/pdf.mjs' {
  export interface PDFTextItem {
    str: string
    [key: string]: string | number | boolean
  }

  export interface PDFDocument {
    numPages: number
    getPage(pageNum: number): Promise<PDFPage>
  }

  export interface PDFPage {
    getTextContent(): Promise<PDFTextContent>
  }

  export interface PDFTextContent {
    items: PDFTextItem[]
  }

  export interface PDFWorker {
    promise: Promise<PDFDocument>
  }

  export interface GetDocumentParams {
    data: Buffer | ArrayBuffer | Uint8Array
    [key: string]: Buffer | ArrayBuffer | Uint8Array | string | number | boolean
  }

  export function getDocument(params: GetDocumentParams): PDFWorker

  export const GlobalWorkerOptions: {
    workerSrc?: string
  }

  export const version: string
}
