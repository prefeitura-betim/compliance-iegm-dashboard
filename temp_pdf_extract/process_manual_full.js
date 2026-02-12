const { createWorker } = require('tesseract.js');
const fs = require('fs');
const pdfLib = require('pdf-parse');

const dataBuffer = fs.readFileSync('/home/dg/develop/compliance-iegm-dashboard/data/Manual_IEGM_2025_exercício_2024.pdf');

async function run() {
    let worker = null;
    try {
        console.log("Initializing PDF parser...");
        const PDFParse = pdfLib.PDFParse || pdfLib.default?.PDFParse || pdfLib;
        const parser = new PDFParse({ data: dataBuffer });

        console.log("Initializing Tesseract worker...");
        worker = await createWorker('por');

        const startPage = 24;
        const endPage = 148;
        const pagesToProcess = [];
        for (let i = startPage; i <= endPage; i++) pagesToProcess.push(i);

        console.log(`Extracting images from pages ${startPage}-${endPage}...`);

        // We process in small batches to avoid memory issues if possible, although getImage takes partial array
        // Let's do batch of 10 pages for robustness
        const BATCH_SIZE = 10;
        let fullText = '';

        for (let i = 0; i < pagesToProcess.length; i += BATCH_SIZE) {
            const batchPages = pagesToProcess.slice(i, i + BATCH_SIZE);
            console.log(`Processing batch: Pages ${batchPages[0]} to ${batchPages[batchPages.length - 1]}...`);

            const result = await parser.getImage({ partial: batchPages });

            if (!result.pages) continue;

            for (const page of result.pages) {
                // Find the largest image on the page (likely the main content)
                let mainImage = null;
                let maxSize = 0;

                for (const img of page.images) {
                    const size = img.width * img.height;
                    if (size > maxSize) {
                        maxSize = size;
                        mainImage = img;
                    }
                }

                if (mainImage) {
                    console.log(`  - OCR Page ${page.pageNumber} (Image: ${mainImage.width}x${mainImage.height})...`);
                    const ret = await worker.recognize(mainImage.data);

                    fullText += `\n\n--- PAGE ${page.pageNumber} ---\n`;
                    fullText += ret.data.text;
                } else {
                    console.log(`  - Warning: No image found on Page ${page.pageNumber}`);
                }
            }

            // Periodically save progress
            fs.writeFileSync('manual_iegm_extracted_partial.txt', fullText);
        }

        fs.writeFileSync('manual_iegm_extracted_final.txt', fullText);
        console.log("Success! Full text saved to manual_iegm_extracted_final.txt");

    } catch (err) {
        console.error("Error:", err);
    } finally {
        if (worker) await worker.terminate();
    }
}

run();
