import { sqliteTable, text, integer, real, index } from 'drizzle-orm/sqlite-core';

// ============================================================================
// TABELAS DE REFERÊNCIA
// ============================================================================

// Tribunais de Contas
export const tribunais = sqliteTable('tribunais', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  codigo: text('codigo').notNull().unique(), // ex: TCEMG
  nome: text('nome').notNull(), // ex: Tribunal de Contas do Estado de Minas Gerais
  uf: text('uf').notNull(), // ex: MG
}, (table) => ({
  codigoIdx: index('tribunal_codigo_idx').on(table.codigo),
  ufIdx: index('tribunal_uf_idx').on(table.uf),
}));

// Municípios
export const municipios = sqliteTable('municipios', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  codigoIbge: text('codigo_ibge').notNull().unique(),
  nome: text('nome').notNull(),
  uf: text('uf').notNull(),
}, (table) => ({
  codigoIbgeIdx: index('municipio_codigo_ibge_idx').on(table.codigoIbge),
  nomeIdx: index('municipio_nome_idx').on(table.nome),
  ufIdx: index('municipio_uf_idx').on(table.uf),
}));

// Indicadores IEGM
export const indicadores = sqliteTable('indicadores', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  codigo: text('codigo').notNull().unique(), // ex: i-Amb, i-Cidade, i-Educ
  nome: text('nome').notNull(), // ex: Indicador de Meio Ambiente
  descricao: text('descricao'),
  ordem: integer('ordem').notNull(), // para ordenação na interface
}, (table) => ({
  codigoIdx: index('indicador_codigo_idx').on(table.codigo),
  ordemIdx: index('indicador_ordem_idx').on(table.ordem),
}));

// ============================================================================
// TABELAS DE QUESTIONÁRIOS E QUESTÕES
// ============================================================================

// Questionários por ano e indicador
export const questionarios = sqliteTable('questionarios', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  tribunalId: integer('tribunal_id').notNull().references(() => tribunais.id),
  indicadorId: integer('indicador_id').notNull().references(() => indicadores.id),
  anoRef: integer('ano_ref').notNull(),
  nome: text('nome').notNull(), // ex: "I-Amb Nacional [25]"
  codigo: text('codigo'), // ex: "25"
}, (table) => ({
  tribunalAnoIdx: index('questionario_tribunal_ano_idx').on(table.tribunalId, table.anoRef),
  indicadorAnoIdx: index('questionario_indicador_ano_idx').on(table.indicadorId, table.anoRef),
  uniqueQuestionario: index('questionario_unique_idx').on(table.tribunalId, table.indicadorId, table.anoRef),
}));

// Questões dos questionários
export const questoes = sqliteTable('questoes', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  questionarioId: integer('questionario_id').notNull().references(() => questionarios.id),
  questaoId: integer('questao_id').notNull(), // ID da questão no sistema original
  sequenciaBlocoRepeticao: integer('sequencia_bloco_repeticao'),
  indiceQuestao: text('indice_questao'), // ex: "001.", "001.001."
  chaveQuestao: text('chave_questao').notNull(), // ex: "M05Q00900"
  texto: text('texto').notNull(), // texto da questão
  peso: real('peso').default(1.0),
}, (table) => ({
  questionarioIdx: index('questao_questionario_idx').on(table.questionarioId),
  chaveQuestaoIdx: index('questao_chave_idx').on(table.chaveQuestao),
  indiceQuestaoIdx: index('questao_indice_idx').on(table.indiceQuestao),
}));

// ============================================================================
// TABELAS DE RESPOSTAS
// ============================================================================

// Respostas dos questionários por município
export const questionarioRespostas = sqliteTable('questionario_respostas', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  tribunalId: integer('tribunal_id').notNull().references(() => tribunais.id),
  municipioId: integer('municipio_id').notNull().references(() => municipios.id),
  questionarioId: integer('questionario_id').notNull().references(() => questionarios.id),
  questionarioRespostaId: integer('questionario_resposta_id').notNull(), // ID original
  dataTermino: text('data_termino'), // ex: "24/10/2023"
  anoRef: integer('ano_ref').notNull(),
}, (table) => ({
  municipioAnoIdx: index('questionario_resposta_municipio_ano_idx').on(table.municipioId, table.anoRef),
  questionarioIdx: index('questionario_resposta_questionario_idx').on(table.questionarioId),
  tribunalAnoIdx: index('questionario_resposta_tribunal_ano_idx').on(table.tribunalId, table.anoRef),
}));

// Respostas individuais às questões
export const respostas = sqliteTable('respostas', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  questionarioRespostaId: integer('questionario_resposta_id').notNull().references(() => questionarioRespostas.id),
  questaoId: integer('questao_id').notNull().references(() => questoes.id),
  chaveResposta: text('chave_resposta'), // ex: "M05Q00900R00100"
  resposta: text('resposta').notNull(), // ex: "Sim", "Não"
  nota: real('nota'), // pontuação da resposta
}, (table) => ({
  questionarioRespostaIdx: index('resposta_questionario_resposta_idx').on(table.questionarioRespostaId),
  questaoIdx: index('resposta_questao_idx').on(table.questaoId),
  chaveRespostaIdx: index('resposta_chave_idx').on(table.chaveResposta),
}));

// ============================================================================
// TABELAS DE RESULTADOS E CÁLCULOS
// ============================================================================

// Resultados dos indicadores por município
export const resultadosIndicadores = sqliteTable('resultados_indicadores', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  tribunalId: integer('tribunal_id').notNull().references(() => tribunais.id),
  municipioId: integer('municipio_id').notNull().references(() => municipios.id),
  indicadorId: integer('indicador_id').notNull().references(() => indicadores.id),
  anoRef: integer('ano_ref').notNull(),

  // Métricas de resposta
  quantidadeRespostas: integer('quantidade_respostas'),
  quantidadeRespostasPontuadas: integer('quantidade_respostas_pontuadas'),

  // Notas e percentuais
  notaFinal: real('nota_final'),
  notaAjustadaDentroFaixa: real('nota_ajustada_dentro_faixa'),
  percentualIndice: real('percentual_indice'),

  // Faixas
  faixa: text('faixa'), // ex: "C", "B", "A"
  rebaixamentos: integer('rebaixamentos'),
  percentualIndiceAposRebaixamento: real('percentual_indice_apos_rebaixamento'),
  faixaAposRebaixamento: text('faixa_apos_rebaixamento'),
}, (table) => ({
  municipioAnoIdx: index('resultado_municipio_ano_idx').on(table.municipioId, table.anoRef),
  indicadorAnoIdx: index('resultado_indicador_ano_idx').on(table.indicadorId, table.anoRef),
  tribunalAnoIdx: index('resultado_tribunal_ano_idx').on(table.tribunalId, table.anoRef),
  uniqueResultado: index('resultado_unique_idx').on(table.tribunalId, table.municipioId, table.indicadorId, table.anoRef),
}));

// Resultados consolidados por município (IEGM Municipal)
export const resultadosMunicipios = sqliteTable('resultados_municipios', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  tribunalId: integer('tribunal_id').notNull().references(() => tribunais.id),
  municipioId: integer('municipio_id').notNull().references(() => municipios.id),
  anoRef: integer('ano_ref').notNull(),

  // Percentuais dos indicadores
  percentualIamb: real('percentual_iamb'),
  percentualIcidade: real('percentual_icidade'),
  percentualIeduc: real('percentual_ieduc'),
  percentualIfiscal: real('percentual_ifiscal'),
  percentualIgovTi: real('percentual_igov_ti'),
  percentualIsaude: real('percentual_isaude'),
  percentualIplan: real('percentual_iplan'),
  percentualIegmMunicipio: real('percentual_iegm_municipio'),

  // Faixas dos indicadores
  faixaIamb: text('faixa_iamb'),
  faixaIcidade: text('faixa_icidade'),
  faixaIeduc: text('faixa_ieduc'),
  faixaIfiscal: text('faixa_ifiscal'),
  faixaIgovTi: text('faixa_igov_ti'),
  faixaIsaude: text('faixa_isaude'),
  faixaIplan: text('faixa_iplan'),
  faixaIegmMunicipio: text('faixa_iegm_municipio'),
}, (table) => ({
  municipioAnoIdx: index('resultado_municipio_consolidado_idx').on(table.municipioId, table.anoRef),
  tribunalAnoIdx: index('resultado_municipio_tribunal_ano_idx').on(table.tribunalId, table.anoRef),
  uniqueMunicipioAno: index('resultado_municipio_unique_idx').on(table.tribunalId, table.municipioId, table.anoRef),
}));

// Resultados consolidados por estado/UF
export const resultadosEstados = sqliteTable('resultados_estados', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  tribunalId: integer('tribunal_id').notNull().references(() => tribunais.id),
  uf: text('uf').notNull(),
  anoRef: integer('ano_ref').notNull(),

  // Percentuais dos indicadores
  percentualIamb: real('percentual_iamb'),
  percentualIcidade: real('percentual_icidade'),
  percentualIeduc: real('percentual_ieduc'),
  percentualIfiscal: real('percentual_ifiscal'),
  percentualIgovTi: real('percentual_igov_ti'),
  percentualIsaude: real('percentual_isaude'),
  percentualIplan: real('percentual_iplan'),
  percentualIegmEstado: real('percentual_iegm_estado'),

  // Faixas dos indicadores
  faixaIamb: text('faixa_iamb'),
  faixaIcidade: text('faixa_icidade'),
  faixaIeduc: text('faixa_ieduc'),
  faixaIfiscal: text('faixa_ifiscal'),
  faixaIgovTi: text('faixa_igov_ti'),
  faixaIsaude: text('faixa_isaude'),
  faixaIplan: text('faixa_iplan'),
  faixaIegmEstado: text('faixa_iegm_estado'),

  // Estatísticas
  quantidadeMunicipiosResponderam: integer('quantidade_municipios_responderam'),
}, (table) => ({
  ufAnoIdx: index('resultado_estado_uf_ano_idx').on(table.uf, table.anoRef),
  tribunalAnoIdx: index('resultado_estado_tribunal_ano_idx').on(table.tribunalId, table.anoRef),
  uniqueEstadoAno: index('resultado_estado_unique_idx').on(table.tribunalId, table.uf, table.anoRef),
}));

// ============================================================================
// TABELA DE RESPOSTAS DETALHADAS
// ============================================================================

export const respostasDetalhadas = sqliteTable('respostas_detalhadas', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  tribunal: text('tribunal').notNull(), // ex: "TCEMG"
  codigoIbge: text('codigo_ibge').notNull(),
  municipio: text('municipio').notNull(),
  indicador: text('indicador').notNull(), // ex: "i-Educ", "i-Saude"
  questao: text('questao').notNull(),
  resposta: text('resposta').notNull(), // ex: "Adequado", "Necessita Melhoria"
  pontuacao: real('pontuacao'), // percentual (0-100)
  peso: real('peso').default(1.0),
  nota: real('nota'), // pontuação na escala 0-1000
  anoRef: integer('ano_ref').notNull(),

  // Novos campos (importação completa)
  questaoId: text('questao_id'),
  indiceQuestao: text('indice_questao'),
  chaveQuestao: text('chave_questao'),
  nomeQuestionario: text('nome_questionario'),
  questionarioId: text('questionario_id'),
  dataTermino: text('data_termino'),
  sequenciaBlocoRepeticao: integer('sequencia_bloco_repeticao'),
  rotulo: text('rotulo'),
}, (table) => ({
  municipioAnoIdx: index('resposta_detalhada_municipio_ano_idx').on(table.municipio, table.anoRef),
  indicadorIdx: index('resposta_detalhada_indicador_idx').on(table.indicador),
  tribunalIdx: index('resposta_detalhada_tribunal_idx').on(table.tribunal),
  questaoIdIdx: index('resposta_detalhada_questao_id_idx').on(table.questaoId),
  chaveQuestaoIdx: index('resposta_detalhada_chave_questao_idx').on(table.chaveQuestao),
}));

// ============================================================================
// TABELA DE CONTROLE DE MIGRAÇÕES
// ============================================================================

export const migracoes = sqliteTable('migracoes', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  nomeArquivo: text('nome_arquivo').notNull().unique(),
  dataMigracao: integer('data_migracao', { mode: 'timestamp' }).notNull(),
  tipoArquivo: text('tipo_arquivo').notNull(), // 'calculo', 'geral_municipio', 'geral_estado', 'respostas'
  anoRef: integer('ano_ref'),
  tribunal: text('tribunal'),
});

// ============================================================================
// TIPOS TYPESCRIPT
// ============================================================================

export type Tribunal = typeof tribunais.$inferSelect;
export type NewTribunal = typeof tribunais.$inferInsert;

export type Municipio = typeof municipios.$inferSelect;
export type NewMunicipio = typeof municipios.$inferInsert;

export type Indicador = typeof indicadores.$inferSelect;
export type NewIndicador = typeof indicadores.$inferInsert;

export type Questionario = typeof questionarios.$inferSelect;
export type NewQuestionario = typeof questionarios.$inferInsert;

export type Questao = typeof questoes.$inferSelect;
export type NewQuestao = typeof questoes.$inferInsert;

export type QuestionarioResposta = typeof questionarioRespostas.$inferSelect;
export type NewQuestionarioResposta = typeof questionarioRespostas.$inferInsert;

export type Resposta = typeof respostas.$inferSelect;
export type NewResposta = typeof respostas.$inferInsert;

export type ResultadoIndicador = typeof resultadosIndicadores.$inferSelect;
export type NewResultadoIndicador = typeof resultadosIndicadores.$inferInsert;

export type ResultadoMunicipio = typeof resultadosMunicipios.$inferSelect;
export type NewResultadoMunicipio = typeof resultadosMunicipios.$inferInsert;

export type ResultadoEstado = typeof resultadosEstados.$inferSelect;
export type NewResultadoEstado = typeof resultadosEstados.$inferInsert;

export type RespostaDetalhada = typeof respostasDetalhadas.$inferSelect;
export type NewRespostaDetalhada = typeof respostasDetalhadas.$inferInsert;

export type Migracao = typeof migracoes.$inferSelect;
export type NewMigracao = typeof migracoes.$inferInsert;
