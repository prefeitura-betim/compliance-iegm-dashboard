DROP TABLE IF EXISTS resultados_indicadores;
DROP TABLE IF EXISTS resultados_municipios;
DROP TABLE IF EXISTS resultados_estados;
DROP TABLE IF EXISTS respostas_detalhadas;
DROP TABLE IF EXISTS respostas;
DROP TABLE IF EXISTS questionario_respostas;
DROP TABLE IF EXISTS questoes;
DROP TABLE IF EXISTS questionarios;
DROP TABLE IF EXISTS indicadores;
DROP TABLE IF EXISTS municipios;
DROP TABLE IF EXISTS tribunais;

CREATE TABLE `tribunais` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`codigo` text NOT NULL,
	`nome` text NOT NULL,
	`uf` text NOT NULL
);

CREATE UNIQUE INDEX `tribunais_codigo_unique` ON `tribunais` (`codigo`);
CREATE INDEX `tribunal_codigo_idx` ON `tribunais` (`codigo`);
CREATE INDEX `tribunal_uf_idx` ON `tribunais` (`uf`);

CREATE TABLE `municipios` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`codigo_ibge` text NOT NULL,
	`nome` text NOT NULL,
	`uf` text NOT NULL
);

CREATE UNIQUE INDEX `municipios_codigo_ibge_unique` ON `municipios` (`codigo_ibge`);
CREATE INDEX `municipio_codigo_ibge_idx` ON `municipios` (`codigo_ibge`);
CREATE INDEX `municipio_nome_idx` ON `municipios` (`nome`);
CREATE INDEX `municipio_uf_idx` ON `municipios` (`uf`);

CREATE TABLE `indicadores` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`codigo` text NOT NULL,
	`nome` text NOT NULL,
	`descricao` text,
	`ordem` integer NOT NULL
);

CREATE UNIQUE INDEX `indicadores_codigo_unique` ON `indicadores` (`codigo`);
CREATE INDEX `indicador_codigo_idx` ON `indicadores` (`codigo`);
CREATE INDEX `indicador_ordem_idx` ON `indicadores` (`ordem`);

CREATE TABLE `questionarios` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`tribunal_id` integer NOT NULL,
	`indicador_id` integer NOT NULL,
	`ano_ref` integer NOT NULL,
	`nome` text NOT NULL,
	`codigo` text,
	FOREIGN KEY (`tribunal_id`) REFERENCES `tribunais`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`indicador_id`) REFERENCES `indicadores`(`id`) ON UPDATE no action ON DELETE no action
);

CREATE INDEX `questionario_tribunal_ano_idx` ON `questionarios` (`tribunal_id`,`ano_ref`);
CREATE INDEX `questionario_indicador_ano_idx` ON `questionarios` (`indicador_id`,`ano_ref`);
CREATE INDEX `questionario_unique_idx` ON `questionarios` (`tribunal_id`,`indicador_id`,`ano_ref`);

CREATE TABLE `questoes` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`questionario_id` integer NOT NULL,
	`questao_id` integer NOT NULL,
	`sequencia_bloco_repeticao` integer,
	`indice_questao` text,
	`chave_questao` text NOT NULL,
	`texto` text NOT NULL,
	`peso` real DEFAULT 1,
	FOREIGN KEY (`questionario_id`) REFERENCES `questionarios`(`id`) ON UPDATE no action ON DELETE no action
);

CREATE INDEX `questao_questionario_idx` ON `questoes` (`questionario_id`);
CREATE INDEX `questao_chave_idx` ON `questoes` (`chave_questao`);
CREATE INDEX `questao_indice_idx` ON `questoes` (`indice_questao`);

CREATE TABLE `questionario_respostas` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`tribunal_id` integer NOT NULL,
	`municipio_id` integer NOT NULL,
	`questionario_id` integer NOT NULL,
	`questionario_resposta_id` integer NOT NULL,
	`data_termino` text,
	`ano_ref` integer NOT NULL,
	FOREIGN KEY (`tribunal_id`) REFERENCES `tribunais`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`municipio_id`) REFERENCES `municipios`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`questionario_id`) REFERENCES `questionarios`(`id`) ON UPDATE no action ON DELETE no action
);

CREATE INDEX `questionario_resposta_municipio_ano_idx` ON `questionario_respostas` (`municipio_id`,`ano_ref`);
CREATE INDEX `questionario_resposta_questionario_idx` ON `questionario_respostas` (`questionario_id`);
CREATE INDEX `questionario_resposta_tribunal_ano_idx` ON `questionario_respostas` (`tribunal_id`,`ano_ref`);

CREATE TABLE `respostas` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`questionario_resposta_id` integer NOT NULL,
	`questao_id` integer NOT NULL,
	`chave_resposta` text,
	`resposta` text NOT NULL,
	`nota` real,
	FOREIGN KEY (`questionario_resposta_id`) REFERENCES `questionario_respostas`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`questao_id`) REFERENCES `questoes`(`id`) ON UPDATE no action ON DELETE no action
);

CREATE INDEX `resposta_questionario_resposta_idx` ON `respostas` (`questionario_resposta_id`);
CREATE INDEX `resposta_questao_idx` ON `respostas` (`questao_id`);
CREATE INDEX `resposta_chave_idx` ON `respostas` (`chave_resposta`);

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

CREATE INDEX `resposta_detalhada_municipio_ano_idx` ON `respostas_detalhadas` (`municipio`,`ano_ref`);
CREATE INDEX `resposta_detalhada_indicador_idx` ON `respostas_detalhadas` (`indicador`);
CREATE INDEX `resposta_detalhada_tribunal_idx` ON `respostas_detalhadas` (`tribunal`);

CREATE TABLE `resultados_estados` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`tribunal_id` integer NOT NULL,
	`uf` text NOT NULL,
	`ano_ref` integer NOT NULL,
	`percentual_iamb` real,
	`percentual_icidade` real,
	`percentual_ieduc` real,
	`percentual_ifiscal` real,
	`percentual_igov_ti` real,
	`percentual_isaude` real,
	`percentual_iplan` real,
	`percentual_iegm_estado` real,
	`faixa_iamb` text,
	`faixa_icidade` text,
	`faixa_ieduc` text,
	`faixa_ifiscal` text,
	`faixa_igov_ti` text,
	`faixa_isaude` text,
	`faixa_iplan` text,
	`faixa_iegm_estado` text,
	`quantidade_municipios_responderam` integer,
	FOREIGN KEY (`tribunal_id`) REFERENCES `tribunais`(`id`) ON UPDATE no action ON DELETE no action
);

CREATE INDEX `resultado_estado_uf_ano_idx` ON `resultados_estados` (`uf`,`ano_ref`);
CREATE INDEX `resultado_estado_tribunal_ano_idx` ON `resultados_estados` (`tribunal_id`,`ano_ref`);
CREATE INDEX `resultado_estado_unique_idx` ON `resultados_estados` (`tribunal_id`,`uf`,`ano_ref`);

CREATE TABLE `resultados_municipios` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`tribunal_id` integer NOT NULL,
	`municipio_id` integer NOT NULL,
	`ano_ref` integer NOT NULL,
	`percentual_iamb` real,
	`percentual_icidade` real,
	`percentual_ieduc` real,
	`percentual_ifiscal` real,
	`percentual_igov_ti` real,
	`percentual_isaude` real,
	`percentual_iplan` real,
	`percentual_iegm_municipio` real,
	`faixa_iamb` text,
	`faixa_icidade` text,
	`faixa_ieduc` text,
	`faixa_ifiscal` text,
	`faixa_igov_ti` text,
	`faixa_isaude` text,
	`faixa_iplan` text,
	`faixa_iegm_municipio` text,
	FOREIGN KEY (`tribunal_id`) REFERENCES `tribunais`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`municipio_id`) REFERENCES `municipios`(`id`) ON UPDATE no action ON DELETE no action
);

CREATE INDEX `resultado_municipio_consolidado_idx` ON `resultados_municipios` (`municipio_id`,`ano_ref`);
CREATE INDEX `resultado_municipio_tribunal_ano_idx` ON `resultados_municipios` (`tribunal_id`,`ano_ref`);
CREATE INDEX `resultado_municipio_unique_idx` ON `resultados_municipios` (`tribunal_id`,`municipio_id`,`ano_ref`);

CREATE TABLE `resultados_indicadores` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`tribunal_id` integer NOT NULL,
	`municipio_id` integer NOT NULL,
	`indicador_id` integer NOT NULL,
	`ano_ref` integer NOT NULL,
	`quantidade_respostas` integer,
	`quantidade_respostas_pontuadas` integer,
	`nota_final` real,
	`nota_ajustada_dentro_faixa` real,
	`percentual_indice` real,
	`faixa` text,
	`rebaixamentos` integer,
	`percentual_indice_apos_rebaixamento` real,
	`faixa_apos_rebaixamento` text,
	FOREIGN KEY (`tribunal_id`) REFERENCES `tribunais`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`municipio_id`) REFERENCES `municipios`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`indicador_id`) REFERENCES `indicadores`(`id`) ON UPDATE no action ON DELETE no action
);

CREATE INDEX `resultado_municipio_ano_idx` ON `resultados_indicadores` (`municipio_id`,`ano_ref`);
CREATE INDEX `resultado_indicador_ano_idx` ON `resultados_indicadores` (`indicador_id`,`ano_ref`);
CREATE INDEX `resultado_tribunal_ano_idx` ON `resultados_indicadores` (`tribunal_id`,`ano_ref`);
CREATE INDEX `resultado_unique_idx` ON `resultados_indicadores` (`tribunal_id`,`municipio_id`,`indicador_id`,`ano_ref`);

