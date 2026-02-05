CREATE TABLE `respostas_detalhadas` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`tribunal` text NOT NULL,
	`codigo_ibge` text NOT NULL,
	`municipio` text NOT NULL,
	`indicador` text NOT NULL,
	`questao` text NOT NULL,
	`resposta` text NOT NULL,
	`pontuacao` real,
	`peso` real DEFAULT 1,
	`nota` real,
	`ano_ref` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `resposta_detalhada_municipio_ano_idx` ON `respostas_detalhadas` (`municipio`,`ano_ref`);--> statement-breakpoint
CREATE INDEX `resposta_detalhada_indicador_idx` ON `respostas_detalhadas` (`indicador`);--> statement-breakpoint
CREATE INDEX `resposta_detalhada_tribunal_idx` ON `respostas_detalhadas` (`tribunal`);