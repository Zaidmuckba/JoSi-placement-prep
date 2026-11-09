import * as pdfjsLib from 'pdfjs-dist';

// The workerSrc property needs to be specified for PDF.js to work
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export { pdfjsLib };
