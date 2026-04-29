/**
 * Extrai opções de múltipla escolha dos PDFs do questionário IEGM.
 *
 * Uso:
 *   node scripts/extrair-opcoes-pdf.js <caminho-do-pdf> [indicador]
 *
 * Exemplos:
 *   node scripts/extrair-opcoes-pdf.js ~/Downloads/questionario-igovti.pdf i-GovTI
 *   node scripts/extrair-opcoes-pdf.js ~/Downloads/questionario-iamb.pdf i-Amb
 *
 * Saídas (na pasta scripts/):
 *   opcoes-extraidas-<indicador>.txt   → texto bruto do PDF (para inspeção manual)
 *   opcoes-extraidas-<indicador>.json  → opções parseadas prontas para importar
 */

const fs = require('fs');
const path = require('path');

// pdf-parse está instalado em temp_pdf_extract
const pdfParse = require(path.join(__dirname, '../temp_pdf_extract/node_modules/pdf-parse'));

const pdfPath = process.argv[2];
const indicador = process.argv[3] || 'desconhecido';

if (!pdfPath) {
  console.error('Uso: node scripts/extrair-opcoes-pdf.js <caminho-do-pdf> [indicador]');
  process.exit(1);
}

const pdfBuffer = fs.readFileSync(pdfPath);
const outputDir = path.join(__dirname);
const txtPath = path.join(outputDir, `opcoes-extraidas-${indicador}.txt`);
const jsonPath = path.join(outputDir, `opcoes-extraidas-${indicador}.json`);

pdfParse(pdfBuffer).then(data => {
  const texto = data.text;

  // Salvar texto bruto para inspeção
  fs.writeFileSync(txtPath, texto, 'utf8');
  console.log(`\n✓ Texto bruto salvo em: ${txtPath}`);
  console.log(`  Total de páginas: ${data.numpages}`);
  console.log(`  Total de caracteres: ${texto.length}`);

  // ─── Parser de opções ────────────────────────────────────────────────────
  // Estratégia: varredura linha a linha buscando padrões de questão + opções.
  //
  // Padrões reconhecidos no questionário IEGM:
  //   Questão / header: linha que contém chave tipo M05Q00900 ou número "1."
  //   Opção checkbox:   linha que começa com ( ) / □ / ■ / • / - + texto
  //   Bloco "Assinale": qualquer sequência após linha com "Assinale" / "Marque"

  const linhas = texto.split('\n').map(l => l.trim()).filter(Boolean);

  // Regex para detectar chave de questão IEGM (ex: M05Q00900, M07Q01010)
  const reChave = /\b(M\d{2}Q\d{5}[A-Z0-9]*)\b/;
  // Regex para detectar item de opção: ( ) texto, □ texto, • texto, - texto, * texto
  const reOpcao = /^[\(\[{][\s\-x\*]?[\)\]}]\s+(.+)$|^[□■●○•\-\*]\s+(.+)$|^\d+[\.\)]\s{1,3}([A-ZÁÉÍÓÚ].{3,})$/;

  const resultado = {}; // { chaveQuestao: string[] }
  const blocos = [];   // para questões sem chave (só texto)

  let chaveAtual = null;
  let textoAtual = null;
  let coletandoOpcoes = false;
  let opcoesAtuais = [];
  let modoAssinale = false;

  const salvarBloco = () => {
    if (!coletandoOpcoes || opcoesAtuais.length < 2) return;
    const chave = chaveAtual || textoAtual?.substring(0, 60);
    if (chave) {
      resultado[chave] = opcoesAtuais;
    }
    if (!chaveAtual && textoAtual) {
      blocos.push({ texto: textoAtual, opcoes: opcoesAtuais });
    }
  };

  for (let i = 0; i < linhas.length; i++) {
    const linha = linhas[i];

    // Detectar chave IEGM na linha
    const matchChave = linha.match(reChave);
    if (matchChave) {
      salvarBloco();
      chaveAtual = matchChave[1];
      textoAtual = linha;
      coletandoOpcoes = false;
      opcoesAtuais = [];
      modoAssinale = false;
      continue;
    }

    // Detectar palavra-gatilho de múltipla escolha
    const lLower = linha.toLowerCase();
    if (
      lLower.startsWith('assinale') ||
      lLower.startsWith('marque') ||
      lLower.startsWith('selecione') ||
      lLower.startsWith('indique') ||
      (lLower.includes('quais') && lLower.length < 120)
    ) {
      salvarBloco();
      textoAtual = linha;
      coletandoOpcoes = true;
      opcoesAtuais = [];
      modoAssinale = true;
      continue;
    }

    // Coletar opções
    if (coletandoOpcoes || modoAssinale) {
      const matchOpcao = linha.match(reOpcao);
      if (matchOpcao) {
        const opcaoTexto = (matchOpcao[1] || matchOpcao[2] || matchOpcao[3] || '').trim();
        if (opcaoTexto.length > 2 && opcaoTexto.length < 300) {
          opcoesAtuais.push(opcaoTexto);
        }
        continue;
      }

      // Linha sem formato de opção — parar coleta se já temos opções
      if (opcoesAtuais.length > 0) {
        // Linha em branco ou muito curta encerra o bloco
        if (linha.length < 5 || /^[\-_=]{3,}/.test(linha)) {
          salvarBloco();
          chaveAtual = null;
          textoAtual = null;
          coletandoOpcoes = false;
          opcoesAtuais = [];
          modoAssinale = false;
        }
        // Linhas longas que parecem texto de questão nova também encerram
        else if (linha.length > 80 && !reChave.test(linha)) {
          salvarBloco();
          chaveAtual = null;
          textoAtual = linha;
          coletandoOpcoes = false;
          opcoesAtuais = [];
          modoAssinale = false;
        }
      }
    }
  }

  salvarBloco(); // último bloco

  // ─── Resultado ───────────────────────────────────────────────────────────
  const totalComChave = Object.keys(resultado).filter(k => /^M\d{2}Q/.test(k)).length;
  const totalSemChave = Object.keys(resultado).length - totalComChave;

  const saida = {
    indicador,
    extraidoEm: new Date().toISOString(),
    totalQuestoes: Object.keys(resultado).length,
    totalComChaveIEGM: totalComChave,
    totalSemChave,
    questoes: resultado,
    blocosSemChave: blocos,
  };

  fs.writeFileSync(jsonPath, JSON.stringify(saida, null, 2), 'utf8');

  console.log('\n─── Resultado do parser ───────────────────────────────');
  console.log(`  Questões com opções extraídas: ${Object.keys(resultado).length}`);
  console.log(`    Com chave IEGM (M..Q..):     ${totalComChave}`);
  console.log(`    Sem chave (só texto):        ${totalSemChave}`);
  console.log(`\n✓ JSON salvo em: ${jsonPath}`);
  console.log('\n─── Próximo passo ─────────────────────────────────────');
  console.log('  1. Abra o .txt para verificar se o texto foi extraído corretamente.');
  console.log('  2. Revise o .json e ajuste opções se necessário.');
  console.log('  3. Rode:  node scripts/importar-opcoes-db.js ' + jsonPath);
  console.log('────────────────────────────────────────────────────────\n');

}).catch(err => {
  console.error('Erro ao ler o PDF:', err.message);
  console.error('\nSe o PDF for escaneado (imagem), tente converter com:');
  console.error('  pdfimages -all arquivo.pdf paginas/page && tesseract paginas/page-001.ppm saida');
  process.exit(1);
});
