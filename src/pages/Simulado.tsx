import { useState, useEffect, useCallback } from 'react';
import {
  User,
  Briefcase,
  Building2,
  ChevronRight,
  ChevronLeft,
  Send,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Trash2,
  Search,
  Download,
  Cloud,
  Copy,
  Link2,
  Check
} from 'lucide-react';
import { jsPDF } from 'jspdf';

const INDICADORES = [
  { codigo: 'i-Amb', nome: 'Meio Ambiente', cor: 'bg-green-500' },
  { codigo: 'i-Cidade', nome: 'Cidade', cor: 'bg-blue-400' },
  { codigo: 'i-Educ', nome: 'Educação', cor: 'bg-orange-500' },
  { codigo: 'i-Fiscal', nome: 'Fiscal', cor: 'bg-red-500' },
  { codigo: 'i-GovTI', nome: 'Governança TI', cor: 'bg-purple-500' },
  { codigo: 'i-Saude', nome: 'Saúde', cor: 'bg-red-600' },
  { codigo: 'i-Plan', nome: 'Planejamento', cor: 'bg-yellow-500' },
];

interface Questao {
  id: number;
  chaveQuestao: string | null;
  texto: string;
  indiceQuestao: string | null;
  respostaRef: string | null;
  notaRef: number | null;
  tipo: 'boolean' | 'text';
}

// Cada resposta guarda quem respondeu
interface RespostaComAutor {
  resposta: string;
  nome: string;
  funcao: string;
  setor: string;
}

interface RespostaSimulado {
  questaoId: number;
  chaveQuestao: string | null;
  textoQuestao: string;
  resposta: string;
}

function gerarCodigo(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

export default function Simulado() {

  const [etapa, setEtapa] = useState<'identificacao' | 'selecao' | 'questionario' | 'sucesso'>('identificacao');

  const [identificacao, setIdentificacao] = useState({ nome: '', funcao: '', setor: '' });

  const [codigoSessao, setCodigoSessao] = useState('');
  const [codigoInput, setCodigoInput] = useState('');
  const [copiado, setCopiado] = useState(false);

  const [indicadorSelecionado, setIndicadorSelecionado] = useState<typeof INDICADORES[0] | null>(null);
  const [questoes, setQuestoes] = useState<Questao[]>([]);
  // Cada resposta agora inclui o autor
  const [respostas, setRespostas] = useState<Record<string, RespostaComAutor>>({});
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [mensagem, setMensagem] = useState<{tipo: 'sucesso' | 'erro', texto: string} | null>(null);

  // Carregar dados do localStorage
  useEffect(() => {
    const savedId = localStorage.getItem('simulado_id');
    if (savedId) setIdentificacao(JSON.parse(savedId));

    const savedCodigo = localStorage.getItem('simulado_codigo_sessao');
    if (savedCodigo) {
      setCodigoSessao(savedCodigo);
      setCodigoInput(savedCodigo);
    }

    const savedRespostas = localStorage.getItem('simulado_respostas');
    if (savedRespostas) {
      try {
        const parsed = JSON.parse(savedRespostas);
        // Ignorar formato antigo (valores eram strings simples)
        const primeiroValor = Object.values(parsed)[0];
        if (primeiroValor && typeof primeiroValor === 'object' && 'resposta' in (primeiroValor as object)) {
          setRespostas(parsed);
        }
      } catch {
        // dado corrompido — ignora
      }
    }
  }, []);

  useEffect(() => {
    if (codigoSessao) localStorage.setItem('simulado_codigo_sessao', codigoSessao);
  }, [codigoSessao]);

  const fetchRascunhoKV = useCallback(async (codigo: string, indicador: string) => {
    if (!codigo) return;
    try {
      const key = `simulado:sessao:${indicador}:${codigo}`;
      const response = await fetch(`/api/kv/get?key=${encodeURIComponent(key)}`);
      const data = await response.json();

      if (data.value) {
        const remoteRespostas: Record<string, RespostaComAutor> = JSON.parse(data.value);
        // Merge: local tem prioridade (resposta mais recente do usuário atual); remoto preenche o que falta
        setRespostas(prev => ({ ...remoteRespostas, ...prev }));
        setLastSync(new Date());
      }
    } catch (err) {
      console.error('Erro ao buscar rascunho no KV:', err);
    }
  }, []);

  const saveRascunhoKV = useCallback(async (codigo: string, indicador: string, data: Record<string, RespostaComAutor>) => {
    if (!codigo || !indicador || Object.keys(data).length === 0) return;
    try {
      const key = `simulado:sessao:${indicador}:${codigo}`;
      await fetch('/api/kv/put', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, value: JSON.stringify(data), ttl: 2592000 })
      });
      setLastSync(new Date());
    } catch {
      console.warn('Falha no sync com KV, mantendo apenas local.');
    }
  }, []);

  useEffect(() => {
    if (identificacao.nome) localStorage.setItem('simulado_id', JSON.stringify(identificacao));
  }, [identificacao]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (Object.keys(respostas).length > 0) {
        localStorage.setItem('simulado_respostas', JSON.stringify(respostas));
        if (indicadorSelecionado && codigoSessao) {
          saveRascunhoKV(codigoSessao, indicadorSelecionado.codigo, respostas);
        }
      }
    }, 1500);
    return () => clearTimeout(timer);
  }, [respostas, indicadorSelecionado, codigoSessao, saveRascunhoKV]);

  const handleProximoIdentificacao = () => {
    const codigo = codigoInput.trim().toUpperCase() || gerarCodigo();
    setCodigoSessao(codigo);
    setCodigoInput(codigo);
    setEtapa('selecao');
  };

  const handleCopiarCodigo = () => {
    navigator.clipboard.writeText(codigoSessao).then(() => {
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    });
  };

  const handleIndicadorSelect = async (indicador: typeof INDICADORES[0]) => {
    setIndicadorSelecionado(indicador);
    setLoading(true);
    try {
      const response = await fetch(`/api/simulado/questoes?indicador=${indicador.codigo}`);
      if (!response.ok) throw new Error('Falha ao carregar questões');
      setQuestoes(await response.json());

      if (codigoSessao) await fetchRascunhoKV(codigoSessao, indicador.codigo);

      setEtapa('questionario');
    } catch {
      setMensagem({ tipo: 'erro', texto: 'Erro ao conectar com o servidor. Verifique se o backend está rodando.' });
    } finally {
      setLoading(false);
    }
  };

  // Resposta agora inclui identificação de quem respondeu
  const handleRespostaChange = (questaoId: string, valor: string) => {
    setRespostas(prev => ({
      ...prev,
      [questaoId]: {
        resposta: valor,
        nome: identificacao.nome,
        funcao: identificacao.funcao,
        setor: identificacao.setor,
      }
    }));
  };

  const handleEnviar = async () => {
    if (!indicadorSelecionado) return;

    setSending(true);
    setMensagem(null);

    try {
      const respostasFormatadas: RespostaSimulado[] = questoes
        .map(q => ({
          questaoId: q.id,
          chaveQuestao: q.chaveQuestao,
          textoQuestao: q.texto,
          resposta: respostas[q.id]?.resposta || ''
        }))
        .filter(r => r.resposta.trim() !== '');

      if (respostasFormatadas.length < questoes.length) {
        const faltam = questoes.length - respostasFormatadas.length;
        setMensagem({
          tipo: 'erro',
          texto: `Por favor, responda a todas as questões antes de enviar. Faltam ${faltam} perguntas.`
        });
        setSending(false);
        return;
      }

      const payload = {
        ...identificacao,
        indicadorCodigo: indicadorSelecionado.codigo,
        respostas: respostasFormatadas
      };

      const response = await fetch('/api/simulado/enviar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || errorData.error || 'Falha ao enviar respostas');
      }
      setEtapa('sucesso');
    } catch (err: any) {
      setMensagem({ tipo: 'erro', texto: `Erro ao enviar dados: ${err.message || 'Tente novamente.'}` });
    } finally {
      setSending(false);
    }
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    const margin = 20;
    let y = 20;

    // ── Cabeçalho: sem identificação individual ──────────────────────────────
    doc.setFontSize(18);
    doc.setTextColor(0, 71, 187);
    doc.text('Simulado IEGM', margin, y); y += 9;

    doc.setFontSize(13);
    doc.setTextColor(30, 30, 30);
    doc.setFont('helvetica', 'bold');
    doc.text(`${indicadorSelecionado?.nome} (${indicadorSelecionado?.codigo})`, margin, y); y += 7;

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(120, 120, 120);
    doc.text(`Código de sessão: ${codigoSessao}`, margin, y); y += 3;

    doc.setDrawColor(220, 220, 220);
    doc.line(margin, y + 3, 190, y + 3); y += 10;

    // ── Respostas com autoria ────────────────────────────────────────────────
    questoes.forEach((q, idx) => {
      const entry = respostas[q.id];
      if (!entry?.resposta) return;

      if (y > 260) {
        doc.addPage();
        y = 20;
      }

      // Texto da questão
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(30, 30, 30);
      const textLines = doc.splitTextToSize(`${idx + 1}. ${q.texto}`, 170);
      doc.text(textLines, margin, y);
      y += textLines.length * 5 + 2;

      // Resposta
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(50, 50, 50);
      const respLines = doc.splitTextToSize(`Resposta: ${entry.resposta}`, 160);
      doc.text(respLines, margin + 5, y);
      y += respLines.length * 5 + 2;

      // Autoria
      doc.setFontSize(8);
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(100, 100, 100);
      const autoria = `Respondido por: ${entry.nome}  |  ${entry.funcao}  |  ${entry.setor}`;
      const autoriaLines = doc.splitTextToSize(autoria, 155);
      doc.text(autoriaLines, margin + 5, y);
      y += autoriaLines.length * 4.5 + 2;

      // Referência oficial (se houver)
      if (q.respostaRef) {
        if (y > 265) { doc.addPage(); y = 20; }
        doc.setFont('helvetica', 'italic');
        doc.setTextColor(130, 130, 130);
        const refLines = doc.splitTextToSize(`Referência Betim 2024: ${q.respostaRef}`, 150);
        doc.text(refLines, margin + 10, y);
        y += refLines.length * 4.5 + 2;

        doc.setFont('helvetica', 'bold');
        doc.setTextColor(0, 128, 0);
        doc.text(`Nota Oficial TCE: ${q.notaRef ?? 0}`, margin + 10, y);
        y += 7;
      }

      // Separador entre questões
      doc.setDrawColor(240, 240, 240);
      doc.line(margin, y, 190, y);
      y += 5;
    });

    // ── Rodapé: data + paginação ─────────────────────────────────────────────
    const pageCount = doc.internal.pages.length - 1;
    const now = new Date().toLocaleString('pt-BR');
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(7);
      doc.setTextColor(180, 180, 180);
      doc.setFont('helvetica', 'normal');
      doc.text(`Gerado em ${now}  —  Sessão ${codigoSessao}`, margin, 292);
      doc.text(`${i} / ${pageCount}`, 190, 292, { align: 'right' });
    }

    doc.save(`Simulado_${indicadorSelecionado?.codigo}_${codigoSessao}.pdf`);
  };

  const handleLimparTudo = () => {
    if (confirm('Deseja realmente apagar todo o seu progresso?')) {
      localStorage.removeItem('simulado_respostas');
      localStorage.removeItem('simulado_id');
      localStorage.removeItem('simulado_codigo_sessao');
      setRespostas({});
      setIdentificacao({ nome: '', funcao: '', setor: '' });
      setCodigoSessao('');
      setCodigoInput('');
      setEtapa('identificacao');
    }
  };

  const filteredQuestoes = questoes.filter(q =>
    q.texto.toLowerCase().includes(search.toLowerCase())
  );

  const answeredCount = questoes.filter(q => respostas[q.id]?.resposta?.trim()).length;
  const progress = questoes.length > 0 ? (answeredCount / questoes.length) * 100 : 0;

  return (
    <div className="max-w-4xl mx-auto pb-20 px-4 sm:px-0">
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">Simulado IEGM</h1>
          <p className="text-gray-600 dark:text-gray-400">Preencha suas respostas para preparação ao questionário oficial de Betim.</p>
        </div>
        <div className="flex items-center gap-4">
          {lastSync && (
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 bg-gray-50 dark:bg-gray-800 px-3 py-1.5 rounded-full border border-gray-100 dark:border-gray-700">
              <Cloud size={12} className="text-betim-blue" />
              Salvo: {lastSync.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          )}
          <button
            onClick={handleLimparTudo}
            className="text-gray-300 hover:text-red-500 p-2 rounded-full transition-colors"
            title="Limpar todo o progresso"
          >
            <Trash2 size={20} />
          </button>
        </div>
      </div>

      {mensagem && (
        <div className={`p-4 rounded-lg mb-6 flex items-start gap-3 animate-in fade-in zoom-in duration-300 ${
          mensagem.tipo === 'sucesso' ? 'bg-green-100 text-green-800 border-green-200' : 'bg-red-100 text-red-800 border-red-200'
        } border`}>
          {mensagem.tipo === 'sucesso' ? <CheckCircle2 className="mt-0.5" /> : <AlertCircle className="mt-0.5" />}
          <p>{mensagem.texto}</p>
        </div>
      )}

      {/* Progress Stepper */}
      <div className="flex items-center gap-4 mb-10 overflow-x-auto py-2 px-1">
        <StepIndicator active={etapa === 'identificacao'} completed={identificacao.nome !== ''} label="Identificação" />
        <ChevronRight size={16} className="text-gray-300 flex-shrink-0" />
        <StepIndicator active={etapa === 'selecao'} completed={indicadorSelecionado !== null} label="Indicador" />
        <ChevronRight size={16} className="text-gray-300 flex-shrink-0" />
        <StepIndicator active={etapa === 'questionario'} completed={etapa === 'sucesso'} label="Respostas" />
      </div>

      {/* Etapa 1: Identificação */}
      {etapa === 'identificacao' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 border border-gray-100 dark:border-gray-700 animate-in slide-in-from-left-4 duration-500">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <User className="text-betim-blue" /> Seus Dados
          </h2>
          <div className="grid gap-6">
            <InputGroup label="Nome Completo" icon={<User size={18}/>} value={identificacao.nome}
              onChange={v => setIdentificacao({...identificacao, nome: v})} placeholder="Ex: João da Silva" />
            <InputGroup label="Função / Cargo" icon={<Briefcase size={18}/>} value={identificacao.funcao}
              onChange={v => setIdentificacao({...identificacao, funcao: v})} placeholder="Ex: Secretário de Educação" />
            <InputGroup label="Setor / Secretaria" icon={<Building2 size={18}/>} value={identificacao.setor}
              onChange={v => setIdentificacao({...identificacao, setor: v})} placeholder="Ex: Secretaria de Educação" />

            {/* Sessão compartilhada */}
            <div className="border-t border-gray-100 dark:border-gray-700 pt-6">
              <div className="flex items-center gap-2 mb-2">
                <Link2 size={16} className="text-betim-blue" />
                <span className="text-sm font-bold text-gray-700 dark:text-gray-300">Sessão Compartilhada</span>
                <span className="text-xs text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full">opcional</span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 leading-relaxed">
                Se um colega de outra secretaria já começou a preencher este questionário, insira o <strong>código da sessão</strong> para continuar — as respostas já registradas serão carregadas automaticamente.<br/>
                Se deixar em branco, um código novo será gerado para você compartilhar.
              </p>
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1">Código de Sessão</label>
                <div className="relative group">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-betim-blue transition-colors">
                    <Link2 size={18} />
                  </div>
                  <input
                    type="text"
                    value={codigoInput}
                    onChange={e => setCodigoInput(e.target.value.toUpperCase())}
                    placeholder="Ex: AB12CD  (deixe vazio para nova sessão)"
                    maxLength={8}
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-betim-blue focus:border-transparent outline-none transition-all font-mono tracking-widest uppercase"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-10 flex justify-end">
            <button
              onClick={handleProximoIdentificacao}
              disabled={!identificacao.nome || !identificacao.funcao || !identificacao.setor}
              className="bg-betim-blue text-white px-8 py-3 rounded-lg font-bold hover:bg-betim-blue-dark disabled:opacity-50 flex items-center gap-2 transition-all shadow-md active:scale-95"
            >
              Próximo <ChevronRight size={20} />
            </button>
          </div>
        </div>
      )}

      {/* Etapa 2: Seleção de Indicador */}
      {etapa === 'selecao' && (
        <div className="animate-in slide-in-from-right-4 duration-500">
          <div className="flex justify-between items-center mb-4">
            <button onClick={() => setEtapa('identificacao')} className="text-gray-600 flex items-center gap-1 hover:text-betim-blue transition-colors">
              <ChevronLeft size={20}/> Voltar
            </button>
            <span className="text-sm font-medium text-gray-500">
              Olá, <span className="text-gray-900 dark:text-white font-bold">{identificacao.nome}</span>
              <span className="text-gray-400"> · {identificacao.setor}</span>
            </span>
          </div>

          {/* Código de sessão ativo */}
          <div className="flex items-center justify-between bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-xl px-4 py-3 mb-6">
            <div className="flex items-center gap-2">
              <Link2 size={14} className="text-betim-blue" />
              <span className="text-xs text-gray-600 dark:text-gray-400">Código da sessão:</span>
              <code className="font-mono font-bold text-betim-blue text-sm tracking-widest">{codigoSessao}</code>
            </div>
            <button
              onClick={handleCopiarCodigo}
              className="flex items-center gap-1.5 text-xs font-bold text-betim-blue hover:text-betim-blue-dark transition-colors"
              title="Copiar código para compartilhar"
            >
              {copiado ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
              {copiado ? 'Copiado!' : 'Copiar'}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {INDICADORES.map((ind) => (
              <button
                key={ind.codigo}
                onClick={() => handleIndicadorSelect(ind)}
                disabled={loading}
                className="group relative bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 text-left hover:shadow-xl hover:-translate-y-1 transition-all flex flex-col h-full active:scale-95 overflow-hidden"
              >
                <div className={`w-12 h-12 ${ind.cor} rounded-lg flex items-center justify-center text-white mb-4 shadow-sm`}>
                  {ind.codigo.split('-')[1]?.[0] || 'I'}
                </div>
                <h3 className="text-lg font-bold mb-1">{ind.nome}</h3>
                <p className="text-sm text-gray-500 flex-1">Questões oficiais do {ind.codigo}.</p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-xs font-bold uppercase text-gray-400 group-hover:text-betim-blue transition-colors">Iniciar</span>
                  <ChevronRight size={18} className="text-gray-300 group-hover:text-betim-blue transition-transform" />
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Etapa 3: Questionário */}
      {etapa === 'questionario' && indicadorSelecionado && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md sticky top-4 z-20 p-4 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 mb-8 flex flex-col gap-4">
            <div className="flex flex-wrap gap-4 items-center justify-between">
              <div className="flex items-center gap-3">
                <button onClick={() => setEtapa('selecao')} className="bg-gray-100 dark:bg-gray-700 p-2 rounded-lg hover:bg-gray-200 transition-colors">
                  <ChevronLeft size={20}/>
                </button>
                <div>
                  <h2 className="font-bold text-lg">{indicadorSelecionado.nome}</h2>
                  <div className="flex items-center gap-2 text-xs text-gray-500 flex-wrap">
                    <span className="bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded font-mono font-bold text-betim-blue-dark">{indicadorSelecionado.codigo}</span>
                    <span>•</span>
                    <span className="font-bold">{questoes.length} perguntas</span>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                      <Link2 size={11} className="text-gray-400" />
                      <span>Sessão:</span>
                      <code className="font-mono font-bold text-betim-blue tracking-widest">{codigoSessao}</code>
                      <button onClick={handleCopiarCodigo} className="ml-0.5" title="Copiar código">
                        {copiado ? <Check size={11} className="text-green-500" /> : <Copy size={11} className="text-gray-400 hover:text-betim-blue transition-colors" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 flex-1 md:max-w-xs">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type="text"
                    placeholder="Buscar pergunta..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-betim-blue focus:border-transparent outline-none transition-all"
                  />
                </div>
                <button
                  onClick={handleEnviar}
                  disabled={sending}
                  className="bg-betim-blue text-white px-5 py-2 rounded-lg font-bold hover:bg-betim-blue-dark disabled:opacity-50 flex items-center gap-2 transition-all shadow-md shrink-0"
                >
                  {sending ? <Loader2 className="animate-spin" size={20}/> : <Send size={18}/>}
                  <span className="hidden sm:inline">Enviar</span>
                </button>
              </div>
            </div>

            <div className="relative h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className="absolute h-full bg-betim-blue transition-all duration-500 rounded-full"
                style={{ width: `${progress}%` }}
              />
              <span className="absolute right-0 -top-5 text-[10px] font-bold text-gray-400">
                {answeredCount} de {questoes.length} respondidas ({Math.round(progress)}%)
              </span>
            </div>
          </div>

          <div className="grid gap-6">
            {filteredQuestoes.length === 0 ? (
              <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-2xl border-2 border-dashed border-gray-200">
                <Search className="mx-auto text-gray-300 mb-4" size={48} />
                <p className="text-gray-500">Nenhuma pergunta encontrada para "{search}"</p>
              </div>
            ) : filteredQuestoes.map((q) => {
              const originalIdx = questoes.findIndex(item => item.id === q.id);
              const entrada = respostas[q.id];
              const respondidoPorOutro = entrada && entrada.nome !== identificacao.nome;

              return (
                <div key={q.id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-md transition-all p-6 border border-gray-100 dark:border-gray-700">
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-xs font-bold text-betim-blue bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded">
                      Questão {originalIdx + 1}
                    </span>
                    {entrada?.resposta && (
                      <div className="flex flex-col items-end gap-0.5">
                        <span className="text-[10px] font-bold text-green-500 flex items-center gap-1 uppercase tracking-wider">
                          <CheckCircle2 size={12}/> Respondido
                        </span>
                        <span className="text-[10px] text-gray-400">
                          {respondidoPorOutro
                            ? `${entrada.nome} · ${entrada.setor}`
                            : 'por você'
                          }
                        </span>
                      </div>
                    )}
                  </div>
                  <h3 className="text-gray-800 dark:text-gray-100 font-bold mb-6 leading-relaxed text-lg">
                    {q.texto}
                  </h3>

                  <div className="space-y-4">
                    {q.tipo === 'boolean' ? (
                      <div className="flex gap-4">
                        {['Sim', 'Não'].map(opcao => (
                          <button
                            key={opcao}
                            onClick={() => handleRespostaChange(String(q.id), opcao)}
                            className={`flex-1 py-3 rounded-xl border-2 font-bold transition-all ${
                              entrada?.resposta === opcao
                                ? 'bg-betim-blue border-betim-blue text-white shadow-md'
                                : 'bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-700 text-gray-500 hover:border-betim-blue/30'
                            }`}
                          >
                            {opcao}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <textarea
                        value={entrada?.resposta || ''}
                        onChange={e => handleRespostaChange(String(q.id), e.target.value)}
                        placeholder="Escreva sua resposta detalhada aqui..."
                        className="w-full min-h-[120px] p-4 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-betim-blue focus:border-transparent transition-all outline-none resize-y"
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-12 bg-white dark:bg-gray-800 p-8 rounded-3xl border-2 border-dashed border-gray-100 dark:border-gray-700 flex flex-col items-center text-center shadow-sm">
            <CheckCircle2 size={48} className="text-green-500 mb-4 opacity-20" />
            <h3 className="text-2xl font-bold mb-2">Pronto para finalizar?</h3>
            <p className="text-gray-500 mb-8 max-w-sm">
              Suas respostas estão sendo salvas na nuvem em tempo real — qualquer colega com o código{' '}
              <code className="font-mono font-bold text-betim-blue">{codigoSessao}</code> pode continuar de onde você parou.
            </p>
            <button
              onClick={handleEnviar}
              disabled={sending}
              className="bg-betim-blue text-white px-10 py-4 rounded-2xl font-bold text-lg hover:bg-betim-blue-dark flex items-center gap-3 transition-all shadow-xl active:scale-95 disabled:grayscale"
            >
              {sending ? <Loader2 className="animate-spin" /> : <Send />}
              Finalizar e Enviar Simulado
            </button>
          </div>
        </div>
      )}

      {/* Etapa 4: Sucesso */}
      {etapa === 'sucesso' && (
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-12 text-center border border-gray-100 dark:border-gray-700 animate-in zoom-in duration-500">
          <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={40} />
          </div>
          <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">Simulado Enviado!</h2>
          <p className="text-gray-500 mb-10 max-w-md mx-auto">
            Suas respostas foram registradas com sucesso. Baixe o PDF com o gabarito completo — cada resposta identifica quem a preencheu.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg mx-auto">
            <button
              onClick={generatePDF}
              className="flex items-center justify-center gap-2 bg-betim-blue text-white px-6 py-4 rounded-2xl font-bold hover:bg-betim-blue-dark transition-all shadow-lg active:scale-95"
            >
              <Download size={20} />
              Baixar PDF de respostas
            </button>
            <button
              onClick={() => { setRespostas({}); setEtapa('selecao'); }}
              className="flex items-center justify-center gap-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 px-6 py-4 rounded-2xl font-bold hover:bg-gray-200 dark:hover:bg-gray-600 transition-all active:scale-95"
            >
              Novo Simulado
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function InputGroup({ label, icon, value, onChange, placeholder }: {
  label: string; icon: any; value: string; onChange: (v: string) => void; placeholder: string
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1">{label}</label>
      <div className="relative group">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-betim-blue transition-colors">
          {icon}
        </div>
        <input
          type="text"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-betim-blue focus:border-transparent outline-none transition-all"
        />
      </div>
    </div>
  );
}

function StepIndicator({ active, completed, label }: { active: boolean; completed: boolean; label: string }) {
  return (
    <div className={`flex items-center gap-2 flex-shrink-0 transition-all ${active ? 'opacity-100 scale-105' : 'opacity-60 grayscale'}`}>
      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shadow-sm transition-colors ${
        completed ? 'bg-green-500 text-white' : active ? 'bg-betim-blue text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
      }`}>
        {completed ? <CheckCircle2 size={16}/> : label[0]}
      </div>
      <span className={`text-sm font-bold ${active ? 'text-betim-blue dark:text-betim-blue' : 'text-gray-500'}`}>{label}</span>
    </div>
  );
}
