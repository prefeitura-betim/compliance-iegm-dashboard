const fs = require('fs');
const pdfLib = require('pdf-parse');

const dataBuffer = fs.readFileSync('/home/dg/develop/compliance-iegm-dashboard/data/Manual_IEGM_2025_exercício_2024.pdf');

async function run() {
    try {
        const PDFParse = pdfLib.PDFParse || pdfLib.default?.PDFParse || pdfLib;
        const parser = new PDFParse({ data: dataBuffer });

        console.log("Checking for images on page 24...");
        // internal page index 23
        // expected params: partial: [24] (if 1-based matching CLI)

        const result = await parser.getImage({ partial: [24] });

        console.log(`Found ${result.total} images total (in this subset).`);
        if (result.pages && result.pages.length > 0) {
            result.pages.forEach(p => {
                console.log(`Page ${p.pageNumber} has ${p.images.length} images.`);
                p.images.forEach((img, idx) => {
                    console.log(` - Image ${idx}: ${img.width}x${img.height}, kind: ${img.kind}, size: ${img.data.length}`);
                    // Save one to check
                    if (idx < 1) {
                        fs.writeFileSync(`page_${p.pageNumber}_img_${idx}.${img.kind || 'png'}`, img.data);
                    }
                });
            });
        }

    } catch (err) {
        console.error("Error:", err);
    }
}

run();
