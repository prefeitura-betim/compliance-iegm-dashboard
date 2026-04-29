-- Migration 0005: Suporte a múltipla escolha e anexos no Simulado
-- Adiciona coluna opcoes em questoes, cria tabela simulado_anexos
-- e atualiza o tipo das questões conforme o padrão IEGM.

ALTER TABLE `questoes` ADD `opcoes` text;
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS `simulado_anexos` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`questao_id` integer NOT NULL,
	`codigo_sessao` text NOT NULL,
	`nome_arquivo` text NOT NULL,
	`tipo_arquivo` text NOT NULL,
	`tamanho` integer,
	`dados` text NOT NULL,
	`criado_em` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `simulado_anexo_questao_idx` ON `simulado_anexos` (`questao_id`);
--> statement-breakpoint
CREATE INDEX `simulado_anexo_sessao_idx` ON `simulado_anexos` (`codigo_sessao`);
--> statement-breakpoint

-- Corrigir tipos: questões Sim/Não → boolean
UPDATE `questoes`
SET `tipo` = 'boolean'
WHERE `resposta_ref` IN ('Sim', 'Não', 'Nao')
  AND (`tipo` IS NULL OR `tipo` = 'text');
--> statement-breakpoint

-- Marcar questões de múltipla escolha pelo texto
UPDATE `questoes`
SET `tipo` = 'multipla_escolha'
WHERE (`tipo` IS NULL OR `tipo` = 'text')
  AND (
    LOWER(`texto`) LIKE 'assinale%'
    OR LOWER(`texto`) LIKE 'marque%'
  );
