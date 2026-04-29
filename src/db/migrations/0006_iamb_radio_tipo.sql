-- Migration 0006: Corrige tipo das questões radio do i-Amb
-- Questões de seleção única (radio) estavam marcadas como multipla_escolha.
-- Fonte: scripts/i-Amb.json (campo tipo_resposta: "radio")

UPDATE `questoes` SET `tipo` = 'radio' WHERE `chave_questao` = 'M05Q00600';
--> statement-breakpoint
UPDATE `questoes` SET `tipo` = 'radio' WHERE `chave_questao` = 'M05Q44100';
--> statement-breakpoint
UPDATE `questoes` SET `tipo` = 'radio' WHERE `chave_questao` = 'M05Q01132';
--> statement-breakpoint
UPDATE `questoes` SET `tipo` = 'radio' WHERE `chave_questao` = 'M05Q01140';
--> statement-breakpoint
UPDATE `questoes` SET `tipo` = 'radio' WHERE `chave_questao` = 'M05Q00253';
--> statement-breakpoint
UPDATE `questoes` SET `tipo` = 'radio' WHERE `chave_questao` = 'M05Q00260';
--> statement-breakpoint
UPDATE `questoes` SET `tipo` = 'radio' WHERE `chave_questao` = 'M05Q03330';
--> statement-breakpoint
UPDATE `questoes` SET `tipo` = 'radio' WHERE `chave_questao` = 'M05Q00366';
--> statement-breakpoint
UPDATE `questoes` SET `tipo` = 'radio' WHERE `chave_questao` = 'M05Q02500';
--> statement-breakpoint
UPDATE `questoes` SET `tipo` = 'radio' WHERE `chave_questao` = 'M05Q04100';
--> statement-breakpoint
UPDATE `questoes` SET `tipo` = 'radio' WHERE `chave_questao` = 'M05Q04200';
--> statement-breakpoint

-- Questão sub (sem chave_questao): "Detalhe se as metas do Plano não estão sendo cumpridas..."
-- Corresponde ao item 11.2.2.1 do questionário i-Amb
UPDATE `questoes`
SET
  `tipo` = 'radio',
  `opcoes` = '[{"texto":"A maior parte das metas foram cumpridas dentro do prazo","valor":30},{"texto":"A menor parte das metas foram cumpridas dentro do prazo","valor":10},{"texto":"As metas não foram cumpridas dentro do prazo","valor":0}]'
WHERE (`chave_questao` IS NULL OR `chave_questao` = '')
  AND `texto` LIKE 'Detalhe se as metas do Plano não estão sendo cumpridas%';
