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
  Cloud
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

interface RespostaSimulado {
  questaoId: number;
  chaveQuestao: string | null;
  textoQuestao: string;
  resposta: string;
}

export default function Simulado() {
  
  // Etapas: 'identificacao' | 'selecao' | 'questionario' | 'sucesso'
  const [etapa, setEtapa] = useState<'identificacao' | 'selecao' | 'questionario' | 'sucesso'>('identificacao');
  
  // Dados de Identificação
  const [identificacao, setIdentificacao] = useState({
    nome: '',
    funcao: '',
    setor: ''
  });

  // Estado do Simulado
  const [indicadorSelecionado, setIndicadorSelecionado] = useState<typeof INDICADORES[0] | null>(null);
  const [questoes, setQuestoes] = useState<Questao[]>([]);
  const [respostas, setRespostas] = useState<Record<string, string>>({}); // chaveQuestao -> resposta
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [mensagem, setMensagem] = useState<{tipo: 'sucesso' | 'erro', texto: string} | null>(null);

  // Carregar dados salvos do localStorage inicialmente
  useEffect(() => {
    const savedId = localStorage.getItem('simulado_id');
    if (savedId) {
      setIdentificacao(JSON.parse(savedId));
    }

    const savedRespostas = localStorage.getItem('simulado_respostas');
    if (savedRespostas) {
      setRespostas(JSON.parse(savedRespostas));
    }
  }, []);

  // Sincronizar com Cloudflare KV (Busca Rascunho)
  const fetchRascunhoKV = useCallback(async (nome: string, indicador: string) => {
    try {
        const key = `simulado:rascunho:${nome.trim().toLowerCase()}:${indicador}`;
        const response = await fetch(`/api/kv/get?key=${encodeURIComponent(key)}`);
        const data = await response.json();
        
        if (data.value) {
            const remoteRespostas = JSON.parse(data.value);
            // Mesclar com local, priorizando o que tiver mais respostas ou o remoto se for mais recente?
            // Por simplicidade, vamos usar o remoto se ele existir
            setRespostas(remoteRespostas);
            setLastSync(new Date());
            console.log("☁️ Rascunho recuperado da nuvem (KV)");
        }
    } catch (err) {
        console.error("Erro ao buscar rascunho no KV:", err);
    }
  }, []);

  // Salvar rascunho no KV (com TTL de 30 dias)
  const saveRascunhoKV = useCallback(async (nome: string, indicador: string, data: any) => {
    if (!nome || !indicador || Object.keys(data).length === 0) return;
    
    try {
        const key = `simulado:rascunho:${nome.trim().toLowerCase()}:${indicador}`;
        await fetch('/api/kv/put', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                key,
                value: JSON.stringify(data),
                ttl: 2592000 // 30 dias
            })
        });
        setLastSync(new Date());
    } catch (err) {
        console.warn("Falha no sync com KV, mantendo apenas local.");
    }
  }, []);

  // Salvar identificação ao mudar
  useEffect(() => {
    if (identificacao.nome) {
      localStorage.setItem('simulado_id', JSON.stringify(identificacao));
    }
  }, [identificacao]);

  // Salvar respostas ao mudar (debounce) e Push para KV
  useEffect(() => {
    const timer = setTimeout(() => {
      if (Object.keys(respostas).length > 0) {
        localStorage.setItem('simulado_respostas', JSON.stringify(respostas));
        
        if (indicadorSelecionado && identificacao.nome) {
            saveRascunhoKV(identificacao.nome, indicadorSelecionado.codigo, respostas);
        }
      }
    }, 1500);
    return () => clearTimeout(timer);
  }, [respostas, indicadorSelecionado, identificacao.nome, saveRascunhoKV]);

  const handleIndicadorSelect = async (indicador: typeof INDICADORES[0]) => {
    setIndicadorSelecionado(indicador);
    setLoading(true);
    try {
      const response = await fetch(`/api/simulado/questoes?indicador=${indicador.codigo}`);
      if (!response.ok) throw new Error('Falha ao carregar questões');
      const data = await response.json();
      setQuestoes(data);
      
      // Tentar buscar rascunho na nuvem ao entrar
      if (identificacao.nome) {
          await fetchRascunhoKV(identificacao.nome, indicador.codigo);
      }
      
      setEtapa('questionario');
    } catch (err) {
      setMensagem({ tipo: 'erro', texto: 'Erro ao conectar com o servidor. Verifique se o backend está rodando.' });
    } finally {
      setLoading(false);
    }
  };

  const handleRespostaChange = (chave: string, valor: string) => {
    setRespostas(prev => ({ ...prev, [chave]: valor }));
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
          resposta: respostas[q.id] || ""
        }))
        .filter(r => r.resposta.trim() !== "");

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

      if (!response.ok) throw new Error('Falha ao enviar respostas');

      setEtapa('sucesso');
    } catch (err) {
      setMensagem({ tipo: 'erro', texto: 'Erro ao enviar dados. Tente novamente.' });
    } finally {
      setSending(false);
    }
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    const margin = 20;
    let y = 30; // Começar um pouco mais abaixo para dar espaço ao cabeçalho

    // --- FASE 1: Renderizar Conteúdo ---

    // Título Principal (apenas na pág 1)
    doc.setFontSize(20);
    doc.setTextColor(0, 71, 187); // Betim Blue
    doc.text('Simulado IEGM - Resultados e Gabarito', margin, 25);
    y = 40;

    // Identificação
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'bold');
    doc.text(`Participante: ${identificacao.nome}`, margin, y); y += 7;
    doc.text(`Cargo: ${identificacao.funcao}`, margin, y); y += 7;
    doc.text(`Setor: ${identificacao.setor}`, margin, y); y += 7;
    doc.text(`Indicador: ${indicadorSelecionado?.nome} (${indicadorSelecionado?.codigo})`, margin, y); y += 12;

    doc.setDrawColor(200, 200, 200);
    doc.line(margin, y - 5, 190, y - 5);
    y += 5;

    // Respostas
    questoes.forEach((q, idx) => {
      const resp = respostas[q.id];
      if (!resp) return;

      if (y > 270) {
        doc.addPage();
        y = 30; // Margem superior para novas páginas
      }

      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      const textLines = doc.splitTextToSize(`${idx + 1}. ${q.texto}`, 170);
      doc.text(textLines, margin, y);
      y += (textLines.length * 5) + 2;

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(50, 50, 50);
      const respLines = doc.splitTextToSize(`Sua Resposta: ${resp}`, 160);
      doc.text(respLines, margin + 5, y);
      y += (respLines.length * 5) + 4;

      // Referência e Nota (Se existir)
      if (q.respostaRef) {
        doc.setFont('helvetica', 'italic');
        doc.setTextColor(100, 100, 100);
        const refLines = doc.splitTextToSize(`Referência (Betim 2024): ${q.respostaRef}`, 150);
        doc.text(refLines, margin + 10, y);
        y += (refLines.length * 5) + 2;

        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(0, 128, 0); // Verde para nota
        doc.text(`Nota Oficial TCE: ${q.notaRef ?? 0}`, margin + 10, y);
        y += 8;
      } else {
        y += 4;
      }
      
      doc.setTextColor(0, 0, 0);
    });

    // --- FASE 2: Adicionar Cabeçalhos (Data/Página) em todas as páginas ---
    const pageCount = doc.internal.pages.length - 1;
    const now = new Date().toLocaleString();
    
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        
        if (i === 1) {
            doc.text(`Gerado em: ${now}`, 190, 12, { align: 'right' });
            doc.text(`Página ${i} de ${pageCount}`, 190, 16, { align: 'right' });
        } else {
            doc.text(`Página ${i} de ${pageCount}`, 190, 12, { align: 'right' });
        }
    }

    doc.save(`Simulado_IEGM_Gabarito_${indicadorSelecionado?.codigo}_${identificacao.nome.replace(/\s+/g, '_')}.pdf`);
  };

  const handleLimparTudo = () => {
    if (confirm("Deseja realmente apagar todo o seu progresso?")) {
      localStorage.removeItem('simulado_respostas');
      localStorage.removeItem('simulado_id');
      setRespostas({});
      setIdentificacao({ nome: '', funcao: '', setor: '' });
      setEtapa('identificacao');
    }
  };

  const filteredQuestoes = questoes.filter(q => 
    q.texto.toLowerCase().includes(search.toLowerCase())
  );

  const answeredCount = questoes.filter(q => {
    const resp = respostas[q.id];
    return resp && resp.trim() !== "";
  }).length;

  const progress = questoes.length > 0 ? (answeredCount / questoes.length) * 100 : 0;

  // Renderização das etapas
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
                    Salvo na Nuvem: {lastSync.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
            <InputGroup 
              label="Nome Completo" 
              icon={<User size={18}/>} 
              value={identificacao.nome} 
              onChange={v => setIdentificacao({...identificacao, nome: v})} 
              placeholder="Ex: João da Silva"
            />
            <InputGroup 
              label="Função / Cargo" 
              icon={<Briefcase size={18}/>} 
              value={identificacao.funcao} 
              onChange={v => setIdentificacao({...identificacao, funcao: v})} 
              placeholder="Ex: Secretário de Educação"
            />
            <InputGroup 
              label="Setor / Departamento" 
              icon={<Building2 size={18}/>} 
              value={identificacao.setor} 
              onChange={v => setIdentificacao({...identificacao, setor: v})} 
              placeholder="Ex: Gerência de TI"
            />
          </div>
          <div className="mt-10 flex justify-end">
            <button
              onClick={() => setEtapa('selecao')}
              disabled={!identificacao.nome || !identificacao.funcao}
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
          <div className="flex justify-between items-center mb-6">
            <button onClick={() => setEtapa('identificacao')} className="text-gray-600 flex items-center gap-1 hover:text-betim-blue transition-colors">
              <ChevronLeft size={20}/> Voltar
            </button>
            <span className="text-sm font-medium text-gray-500">Olá, <span className="text-gray-900 font-bold">{identificacao.nome}</span></span>
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
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span className="bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded font-mono font-bold text-betim-blue-dark">{indicadorSelecionado.codigo}</span>
                    <span>•</span>
                    <span className="font-bold">{questoes.length} perguntas</span>
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
              // Buscar índice original
              const originalIdx = questoes.findIndex(item => item.id === q.id);
              
              return (
              <div key={q.id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-md transition-all p-6 border border-gray-100 dark:border-gray-700">
                <div className="flex justify-between items-start mb-4">
                  <span className="text-xs font-bold text-betim-blue bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded">Questão {originalIdx + 1}</span>
                  {respostas[q.id] && (
                    <span className="text-[10px] font-bold text-green-500 flex items-center gap-1 uppercase tracking-wider">
                        <CheckCircle2 size={12}/> Respondido
                    </span>
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
                            respostas[q.id] === opcao
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
                        value={respostas[q.id] || ''}
                        onChange={e => handleRespostaChange(String(q.id), e.target.value)}
                        placeholder="Escreva sua resposta detalhada aqui..."
                        className="w-full min-h-[120px] p-4 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-betim-blue focus:border-transparent transition-all outline-none resize-y"
                    />
                  )}
                </div>
              </div>
            )})}
          </div>

          <div className="mt-12 bg-white dark:bg-gray-800 p-8 rounded-3xl border-2 border-dashed border-gray-100 dark:border-gray-700 flex flex-col items-center text-center shadow-sm">
            <CheckCircle2 size={48} className="text-green-500 mb-4 opacity-20" />
            <h3 className="text-2xl font-bold mb-2">Pronto para finalizar?</h3>
            <p className="text-gray-500 mb-8 max-w-sm">Suas respostas estão sendo salvas localmente e na nuvem enquanto você digita. Clique abaixo para consolidar no banco de dados.</p>
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
                  Suas respostas foram registradas com sucesso. Agora você pode baixar o seu documento completo em PDF para conferência ou impressão.
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
                    onClick={() => {
                        setRespostas({});
                        setEtapa('selecao');
                    }}
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

// Subcomponentes utilitários
function InputGroup({ label, icon, value, onChange, placeholder }: { label: string, icon: any, value: string, onChange: (v: string) => void, placeholder: string }) {
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

function StepIndicator({ active, completed, label }: { active: boolean, completed: boolean, label: string }) {
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
