-- Atualização de textos para remover ambiguidades no i-Saude

UPDATE questoes SET texto = 'O município realiza medidas para a redução desta taxa de absenteísmo? (Atenção Básica - Consultas)' WHERE chave_questao = 'M02Q07220';
UPDATE questoes SET texto = 'O município realiza medidas para a redução desta taxa de absenteísmo? (Atenção Especializada - Consultas)' WHERE chave_questao = 'M02Q10906';
UPDATE questoes SET texto = 'O município realiza medidas para a redução desta taxa de absenteísmo? (Atenção Especializada - Exames)' WHERE chave_questao = 'M02Q09884';
