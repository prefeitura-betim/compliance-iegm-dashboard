CREATE TABLE `simulado_respostas` (
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
--> statement-breakpoint
CREATE INDEX `simulado_nome_idx` ON `simulado_respostas` (`nome`);--> statement-breakpoint
CREATE INDEX `simulado_indicador_idx` ON `simulado_respostas` (`indicador_codigo`);--> statement-breakpoint
CREATE INDEX `simulado_criado_em_idx` ON `simulado_respostas` (`criado_em`);--> statement-breakpoint
ALTER TABLE `respostas_detalhadas` ADD `questao_id` text;--> statement-breakpoint
ALTER TABLE `respostas_detalhadas` ADD `indice_questao` text;--> statement-breakpoint
ALTER TABLE `respostas_detalhadas` ADD `chave_questao` text;--> statement-breakpoint
ALTER TABLE `respostas_detalhadas` ADD `nome_questionario` text;--> statement-breakpoint
ALTER TABLE `respostas_detalhadas` ADD `questionario_id` text;--> statement-breakpoint
ALTER TABLE `respostas_detalhadas` ADD `data_termino` text;--> statement-breakpoint
ALTER TABLE `respostas_detalhadas` ADD `sequencia_bloco_repeticao` integer;--> statement-breakpoint
ALTER TABLE `respostas_detalhadas` ADD `rotulo` text;--> statement-breakpoint
CREATE INDEX `resposta_detalhada_questao_id_idx` ON `respostas_detalhadas` (`questao_id`);--> statement-breakpoint
CREATE INDEX `resposta_detalhada_chave_questao_idx` ON `respostas_detalhadas` (`chave_questao`);