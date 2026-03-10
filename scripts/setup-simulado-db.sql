-- Script de Configuração Cirúrgica para Produção
-- Este script adiciona apenas o que falta para o Simulado sem mexer nos dados existentes.

-- 1. Criar a tabela de respostas se não existir
CREATE TABLE IF NOT EXISTS `simulado_respostas` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`nome` text NOT NULL,
	`funcao` text NOT NULL,
	`setor` text NOT NULL,
	`indicador_codigo` text NOT NULL,
	`questao_id` integer NOT NULL,
	`chave_questao` text NOT NULL,
	`texto_questao` text NOT NULL,
	`resposta` text NOT NULL,
	`criado_em` text NOT NULL
);

-- 2. Índices para performance
CREATE INDEX IF NOT EXISTS `simulado_nome_idx` ON `simulado_respostas` (`nome`);
CREATE INDEX IF NOT EXISTS `simulado_indicador_idx` ON `simulado_respostas` (`indicador_codigo`);
CREATE INDEX IF NOT EXISTS `simulado_criado_em_idx` ON `simulado_respostas` (`criado_em`);

-- 3. Adicionar colunas de gabarito e tipo à tabela questoes
-- Nota: SQLite não suporta IF NOT EXISTS em ADD COLUMN, 
-- então se a coluna já existir o comando apenas falhará sem quebrar nada.
ALTER TABLE `questoes` ADD `resposta_ref` text;
ALTER TABLE `questoes` ADD `nota_ref` real;
ALTER TABLE `questoes` ADD `tipo` text;
