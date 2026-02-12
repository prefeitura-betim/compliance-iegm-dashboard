const { createWorker } = require('tesseract.js');
const fs = require('fs');

async function run() {
    try {
        console.log("Creating Tesseract worker (Portuguese)...");
        const worker = await createWorker('por');

        console.log("Worker created. Recognizing text...");
        const ret = await worker.recognize('page_24_img_0.png');

        console.log("OCR completed.");
        console.log("Confidence:", ret.data.confidence);
        console.log("Text preview:", ret.data.text.substring(0, 500));

        fs.writeFileSync('ocr_result_page24.txt', ret.data.text);

        await worker.terminate();
    } catch (err) {
        console.error("Error during OCR:", err);
    }
}

run();
