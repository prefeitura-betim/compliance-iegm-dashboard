import { parse } from 'csv-parse/sync';
import { readFileSync, existsSync } from 'fs';
import { ImportConfig } from '../config/importConfig';

export interface CSVRecord {
  [key: string]: string | number | null;
}

export interface ProcessingStats {
  totalRecords: number;
  filteredRecords: number;
  validRecords: number;
  invalidRecords: number;
  processingTime: number;
  errors: string[];
}

export class CSVProcessor {
  private config: ImportConfig;

  constructor(config: ImportConfig) {
    this.config = config;
  }

  processFile(filePath: string, filters?: Record<string, any>): { records: CSVRecord[], stats: ProcessingStats } {
    const startTime = Date.now();
    const stats: ProcessingStats = {
      totalRecords: 0,
      filteredRecords: 0,
      validRecords: 0,
      invalidRecords: 0,
      processingTime: 0,
      errors: []
    };

    if (!existsSync(filePath)) {
      stats.errors.push(`Arquivo não encontrado: ${filePath}`);
      return { records: [], stats };
    }

    try {
      // Ler o arquivo com encoding UTF-8
      const fileContent = readFileSync(filePath, 'utf8');

      // Tentar diferentes configurações de parsing para lidar com problemas de CSV
      let records: CSVRecord[] = [];

      // Primeira tentativa: configuração padrão
      try {
        records = parse(fileContent, {
          columns: true,
          skip_empty_lines: true,
          trim: true,
          delimiter: ';',
          relax_quotes: true, // Permite aspas relaxadas
          relax_column_count: true, // Permite colunas inconsistentes
          skip_records_with_error: true // Pula registros com erro
        });
      } catch (error) {
        // Segunda tentativa: configuração mais permissiva
        try {
          records = parse(fileContent, {
            columns: true,
            skip_empty_lines: true,
            trim: true,
            delimiter: ';',
            relax_quotes: true,
            relax_column_count: true,
            skip_records_with_error: true,
            quote: '"',
            escape: '"',
            relax: true // Modo mais relaxado
          });
        } catch (secondError) {
          // Terceira tentativa: limpar o conteúdo antes de processar
          try {
            const cleanedContent = this.cleanCSVContent(fileContent);
            records = parse(cleanedContent, {
              columns: true,
              skip_empty_lines: true,
              trim: true,
              delimiter: ';',
              relax_quotes: true,
              relax_column_count: true,
              skip_records_with_error: true
            });
          } catch (thirdError) {
            stats.errors.push(`Erro ao processar CSV: ${thirdError instanceof Error ? thirdError.message : 'Erro desconhecido'}`);
            return { records: [], stats };
          }
        }
      }

      stats.totalRecords = records.length;

      // Aplicar filtros se fornecidos
      let filteredRecords = records;
      if (filters) {
        filteredRecords = this.applyFilters(records, filters);
        stats.filteredRecords = filteredRecords.length;
      } else {
        stats.filteredRecords = records.length;
      }

      // Validar registros
      const { validRecords, invalidRecords } = this.validateRecords(filteredRecords);
      stats.validRecords = validRecords.length;
      stats.invalidRecords = invalidRecords.length;

      // Adicionar erros de validação
      if (invalidRecords.length > 0) {
        stats.errors.push(`${invalidRecords.length} registros inválidos encontrados`);
      }

      stats.processingTime = Date.now() - startTime;

      return { records: validRecords, stats };

    } catch (error) {
      stats.errors.push(`Erro geral ao processar arquivo: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
      stats.processingTime = Date.now() - startTime;
      return { records: [], stats };
    }
  }

  private cleanCSVContent(content: string): string {
    // Remover caracteres problemáticos
    const cleaned = content
      .replace(/\r\n/g, '\n') // Normalizar quebras de linha
      .replace(/\r/g, '\n')   // Normalizar quebras de linha
      .replace(/\t/g, ' ')    // Substituir tabs por espaços
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, ''); // Remover caracteres de controle

    // Corrigir aspas malformadas
    const lines = cleaned.split('\n');
    const cleanedLines = lines.map(line => {
      // Contar aspas na linha
      const quoteCount = (line.match(/"/g) || []).length;

      // Se o número de aspas for ímpar, adicionar uma aspa no final
      if (quoteCount % 2 === 1) {
        line += '"';
      }

      // Remover aspas duplas consecutivas problemáticas
      line = line.replace(/""""/g, '""');
      line = line.replace(/"""/g, '""');

      return line;
    });

    return cleanedLines.join('\n');
  }

  private applyFilters(records: CSVRecord[], filters: Record<string, any>): CSVRecord[] {
    return records.filter(record => {
      for (const [key, value] of Object.entries(filters)) {
        if (value !== undefined && value !== null && value !== '') {
          const recordValue = record[key];

          // Se o valor do filtro é um array, verificar se o valor do registro está no array
          if (Array.isArray(value)) {
            if (!value.includes(recordValue)) {
              return false;
            }
          }
          // Se o valor do filtro é uma string, fazer comparação exata
          else if (typeof value === 'string') {
            if (recordValue !== value) {
              return false;
            }
          }
          // Se o valor do filtro é um número, fazer comparação numérica
          else if (typeof value === 'number') {
            if (Number(recordValue) !== value) {
              return false;
            }
          }
        }
      }
      return true;
    });
  }

  private validateRecords(records: CSVRecord[]): { validRecords: CSVRecord[], invalidRecords: CSVRecord[] } {
    const validRecords: CSVRecord[] = [];
    const invalidRecords: CSVRecord[] = [];

    for (const record of records) {
      // Verificar se o registro tem pelo menos algumas colunas essenciais
      const hasEssentialFields = record.tribunal_id || record.municipio_id || record.ano_ref;

      if (hasEssentialFields) {
        validRecords.push(record);
      } else {
        invalidRecords.push(record);
      }
    }

    return { validRecords, invalidRecords };
  }

  // Método para processar arquivos grandes em chunks
  processLargeFile(filePath: string, chunkSize: number = 1000, filters?: Record<string, any>): Array<{ records: CSVRecord[], stats: ProcessingStats }> {
    if (!existsSync(filePath)) {
      throw new Error(`Arquivo não encontrado: ${filePath}`);
    }

    const fileContent = readFileSync(filePath, 'utf8');
    const cleanedContent = this.cleanCSVContent(fileContent);
    const lines = cleanedContent.split('\n');

    // Pular o cabeçalho
    const header = lines[0];
    const dataLines = lines.slice(1);

    const result: Array<{ records: CSVRecord[], stats: ProcessingStats }> = [];
    for (let i = 0; i < dataLines.length; i += chunkSize) {
      const chunkLines = dataLines.slice(i, i + chunkSize);
      const chunkContent = [header, ...chunkLines].join('\n');

      try {
        const records = parse(chunkContent, {
          columns: true,
          skip_empty_lines: true,
          trim: true,
          delimiter: ';',
          relax_quotes: true,
          relax_column_count: true,
          skip_records_with_error: true
        });

        const filteredRecords = filters ? this.applyFilters(records, filters) : records;
        const { validRecords } = this.validateRecords(filteredRecords);

        const stats: ProcessingStats = {
          totalRecords: records.length,
          filteredRecords: filteredRecords.length,
          validRecords: validRecords.length,
          invalidRecords: records.length - validRecords.length,
          processingTime: 0,
          errors: []
        };

        result.push({ records: validRecords, stats });
      } catch (error) {
        result.push({ records: [], stats: { totalRecords: 0, filteredRecords: 0, validRecords: 0, invalidRecords: 0, processingTime: 0, errors: [error instanceof Error ? error.message : 'Erro desconhecido'] } });
      }
    }
    return result;
  }
}
