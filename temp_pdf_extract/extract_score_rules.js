const fs = require('fs');

const text = fs.readFileSync('manual_iegm_extracted_final.txt', 'utf8');

// Regex to find "Pontuação máxima (Pmáx) = X pontos"
// and try to associate it with the preceding question number like "1.1.4"
// The text is unstructured, so this is heuristic.

const lines = text.split('\n');
let currentQuestion = null;
const mappings = [];

// Regex for question start: e.g. "1.2.3 Qual a..."
const questRegex = /^(\d+(\.\d+)+)\s+(.+)/;
// Regex for Pmax: "Pontuação máxima (Pmáx) = 02 pontos"
const pmaxRegex = /Pontuação máxima.*=\s*(\d+)/i;

lines.forEach((line, index) => {
    const qMatch = line.match(questRegex);
    if (qMatch) {
        currentQuestion = {
            id: qMatch[1],
            text: qMatch[3].trim(),
            lineIndex: index
        };
    }

    const pMatch = line.match(pmaxRegex);
    if (pMatch && currentQuestion) {
        // Assume this Pmax belongs to the last seen question
        // Heuristic: check lines distance?
        if (index - currentQuestion.lineIndex < 20) {
            mappings.push({
                id: currentQuestion.id,
                pmax: parseInt(pMatch[1], 10),
                textSample: currentQuestion.text.substring(0, 30) + '...'
            });
            currentQuestion = null; // Reset to avoid double assignment
        }
    }
});

console.log(`Found ${mappings.length} mappings.`);
console.log(mappings.slice(0, 10));

// let's check one specific example that was 0 in Excel: 
// 'Há estrutura administrativa voltada para a administração tributária?' -> This is 1.0/1.1 probably.
// In the text earlier: "1.2 tributários preenchidos? Efetivo - 1,5" 
// The structure is tricky. Let's list a few to see if IDs match what we might see in Excel.
