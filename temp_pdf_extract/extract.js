const fs = require('fs');
const pdfLib = require('pdf-parse');

const dataBuffer = fs.readFileSync('/home/dg/develop/compliance-iegm-dashboard/data/Manual_IEGM_2025_exercício_2024.pdf');

async function run() {
    try {
        // Access the Class
        const PDFParse = pdfLib.PDFParse || pdfLib.default?.PDFParse || pdfLib;

        console.log("PDFParse type:", typeof PDFParse);

        // Instantiate
        const parser = new PDFParse({ data: dataBuffer });

        // Generate page range 24 to 148
        const pages = [];
        for (let i = 24; i <= 148; i++) {
            pages.push(i);
        }

        console.log(`Extracting ${pages.length} pages...`);

        const result = await parser.getText({ partial: pages });

        // Result is likely an object with .text or just text string depending on library version logic.
        // CLI says: const output = ... result.text;

        const text = result.text || result; // Fallback

        fs.writeFileSync('manual_extracted_subset.txt', text);
        console.log(`Extraction complete.`);
        console.log(`Extracted content written to manual_extracted_subset.txt`);

        // Cleanup
        if (parser.destroy) await parser.destroy();

    } catch (err) {
        console.error("Error extracting PDF:", err);
    }
}

run();
