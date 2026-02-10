import pandas as pd
from tabulate import tabulate
from openpyxl.utils import get_column_letter
import glob
import os
import shutil

# ==========================================
# CONFIGURAÇÃO
# ==========================================
MUNICIPIO_FILTRO = "BETIM"  # Altere aqui para outro município se necessário

# Pasta de dados (relativa ao script)
PASTA_DATA = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'data'))

# Subpasta onde os CSVs brutos devem ser colocados
PASTA_CSV_BRUTOS = os.path.join(PASTA_DATA, 'csv_brutos')

# Subpasta para CSVs organizados/renomeados
PASTA_CSV_ORGANIZADOS = os.path.join(PASTA_DATA, 'csv_organizados')

# ==========================================
# FUNÇÕES AUXILIARES
# ==========================================
def tentar_ler_csv(caminho):
    """Tenta ler um CSV com diferentes encodings e separadores."""
    for enc in ['utf-16', 'utf-8', 'utf-8-sig', 'latin-1', 'cp1252']:
        for sep in [';', ',', '\t']:
            try:
                df = pd.read_csv(caminho, sep=sep, encoding=enc, nrows=5)
                # Verificar se leu mais de 1 coluna (indica separador correto)
                if len(df.columns) > 1:
                    # Ler o arquivo completo
                    df_full = pd.read_csv(caminho, sep=sep, encoding=enc)
                    df_full.columns = df_full.columns.str.strip().str.lower()
                    return df_full, enc, sep
            except (UnicodeDecodeError, UnicodeError, pd.errors.ParserError):
                continue
    return None, None, None


def detectar_indicador(df):
    """Detecta o indicador a partir da coluna 'indicador' do DataFrame."""
    if 'indicador' not in df.columns:
        return None
    indicadores = df['indicador'].dropna().unique()
    if len(indicadores) == 1:
        return str(indicadores[0]).strip()
    elif len(indicadores) > 1:
        # Se tiver múltiplos, retornar todos separados
        return sorted([str(i).strip() for i in indicadores])
    return None


def detectar_ano(df):
    """Detecta o ano de referência a partir da coluna 'ano_ref'."""
    if 'ano_ref' not in df.columns:
        return None
    anos = df['ano_ref'].dropna().unique()
    if len(anos) == 1:
        return int(anos[0])
    elif len(anos) > 1:
        return sorted([int(a) for a in anos])
    return None


def normalizar_indicador(ind):
    """Normaliza o nome do indicador para o padrão do projeto."""
    mapa = {
        'i-amb': 'i-Amb',
        'i-cidade': 'i-Cidade', 
        'i-educ': 'i-Educ',
        'i-fiscal': 'i-Fiscal',
        'i-govti': 'i-GovTI',
        'i-plan': 'i-Plan',
        'i-saude': 'i-Saude',
    }
    return mapa.get(ind.lower().strip(), ind)

# ==========================================
# 1. INÍCIO
# ==========================================
print("=" * 60)
print("  EXTRATOR COMPLETO DE RESPOSTAS IEGM")
print("  Detecção automática de Ano e Indicador")
print("=" * 60)

# Criar pastas se não existirem
os.makedirs(PASTA_CSV_BRUTOS, exist_ok=True)
os.makedirs(PASTA_CSV_ORGANIZADOS, exist_ok=True)

# ==========================================
# 2. BUSCAR CSVs
# ==========================================
# Buscar em data/ e data/csv_brutos/
locais_busca = [
    os.path.join(PASTA_DATA, "*.csv"),
    os.path.join(PASTA_CSV_BRUTOS, "*.csv"),
]

arquivos_csv = []
for padrao in locais_busca:
    arquivos_csv.extend(glob.glob(padrao))

# Remover duplicatas e excluir arquivos de saída
arquivos_csv = list(dict.fromkeys(arquivos_csv))
arquivos_csv = [f for f in arquivos_csv 
                if 'cleaned' not in os.path.basename(f).lower()
                and 'relatorio' not in os.path.basename(f).lower()
                and 'respostas_betim' not in os.path.basename(f).lower()
                and os.path.basename(f) != 'respostas_betim_completo.csv']

if not arquivos_csv:
    print(f"\n❌ ERRO: Nenhum arquivo CSV encontrado!")
    print(f"   Coloque os CSVs baixados do portal IEGM em uma destas pastas:")
    print(f"   • {PASTA_DATA}")
    print(f"   • {PASTA_CSV_BRUTOS}")
    exit()

print(f"\n📁 Pasta de dados: {PASTA_DATA}")
print(f"📄 {len(arquivos_csv)} arquivo(s) CSV encontrado(s)")

# ==========================================
# 3. ANALISAR E ORGANIZAR CADA CSV
# ==========================================
print("\n" + "=" * 60)
print("  FASE 1: ANÁLISE E ORGANIZAÇÃO DOS CSVs")
print("=" * 60)

arquivos_info = []

for i, arquivo in enumerate(arquivos_csv, 1):
    nome_original = os.path.basename(arquivo)
    print(f"\n{'─' * 50}")
    print(f"📄 [{i}/{len(arquivos_csv)}] {nome_original}")
    
    df_temp, encoding, separador = tentar_ler_csv(arquivo)
    
    if df_temp is None:
        print(f"   ❌ Não foi possível ler o arquivo")
        continue
    
    print(f"   Encoding: {encoding} | Separador: '{separador}'")
    print(f"   Registros: {len(df_temp)} | Colunas: {len(df_temp.columns)}")
    print(f"   Colunas: {list(df_temp.columns)}")
    
    # Detectar ano e indicador
    ano = detectar_ano(df_temp)
    indicador = detectar_indicador(df_temp)
    
    if isinstance(ano, list):
        print(f"   📅 Anos encontrados: {ano}")
    else:
        print(f"   📅 Ano: {ano}")
    
    if isinstance(indicador, list):
        print(f"   📊 Indicadores encontrados: {indicador}")
    else:
        print(f"   📊 Indicador: {indicador}")
    
    # Se tem múltiplos indicadores ou anos, precisamos separar
    if isinstance(indicador, list) or isinstance(ano, list):
        # Separar por indicador e ano
        grupos = df_temp.groupby(['indicador', 'ano_ref']) if 'indicador' in df_temp.columns and 'ano_ref' in df_temp.columns else [(None, df_temp)]
        
        for (ind_val, ano_val), grupo in grupos:
            ind_norm = normalizar_indicador(str(ind_val))
            ano_int = int(ano_val)
            novo_nome = f"respostas_iegm_{ind_norm}_{ano_int}_nota.csv"
            novo_caminho = os.path.join(PASTA_CSV_ORGANIZADOS, novo_nome)
            
            # Salvar o grupo separado
            grupo.to_csv(novo_caminho, sep=';', index=False, encoding='utf-8')
            
            print(f"   ✅ Separado: {novo_nome} ({len(grupo)} registros)")
            arquivos_info.append({
                'arquivo_original': nome_original,
                'arquivo_organizado': novo_nome,
                'caminho': novo_caminho,
                'ano': ano_int,
                'indicador': ind_norm,
                'registros': len(grupo),
                'df': grupo
            })
    else:
        # Arquivo com um único indicador/ano
        if indicador and ano:
            ind_norm = normalizar_indicador(str(indicador))
            novo_nome = f"respostas_iegm_{ind_norm}_{ano}_nota.csv"
        else:
            novo_nome = nome_original  # Manter nome original se não detectar
        
        novo_caminho = os.path.join(PASTA_CSV_ORGANIZADOS, novo_nome)
        df_temp.to_csv(novo_caminho, sep=';', index=False, encoding='utf-8')
        
        print(f"   ✅ Organizado como: {novo_nome}")
        arquivos_info.append({
            'arquivo_original': nome_original,
            'arquivo_organizado': novo_nome,
            'caminho': novo_caminho,
            'ano': ano if not isinstance(ano, list) else None,
            'indicador': normalizar_indicador(str(indicador)) if indicador and not isinstance(indicador, list) else None,
            'registros': len(df_temp),
            'df': df_temp
        })

# ==========================================
# 4. RESUMO DA ORGANIZAÇÃO
# ==========================================
print(f"\n{'=' * 60}")
print(f"  RESUMO DA ORGANIZAÇÃO")
print(f"{'=' * 60}")
print(f"\n📁 Arquivos organizados em: {PASTA_CSV_ORGANIZADOS}/")

# Tabela de resumo
resumo_org = pd.DataFrame([{
    'Original': info['arquivo_original'][:40],
    'Organizado': info['arquivo_organizado'],
    'Ano': info['ano'],
    'Indicador': info['indicador'],
    'Registros': info['registros']
} for info in arquivos_info])

print(tabulate(resumo_org, headers='keys', tablefmt='fancy_grid', showindex=False))

# Matriz de cobertura: anos × indicadores
print(f"\n📊 Matriz de Cobertura (Ano × Indicador):")
indicadores_todos = ['i-Amb', 'i-Cidade', 'i-Educ', 'i-Fiscal', 'i-GovTI', 'i-Plan', 'i-Saude']
anos_todos = sorted(set(info['ano'] for info in arquivos_info if info['ano']))

if anos_todos and any(info['indicador'] for info in arquivos_info):
    matriz = {}
    for ano in anos_todos:
        matriz[ano] = {}
        for ind in indicadores_todos:
            match = [info for info in arquivos_info if info['ano'] == ano and info['indicador'] == ind]
            if match:
                matriz[ano][ind] = f"✅ ({match[0]['registros']})"
            else:
                matriz[ano][ind] = "❌"
    
    df_matriz = pd.DataFrame(matriz).T
    df_matriz.index.name = 'Ano'
    print(tabulate(df_matriz.reset_index(), headers='keys', tablefmt='fancy_grid', showindex=False))

# ==========================================
# 5. CONCATENAR TODOS OS DADOS
# ==========================================
print(f"\n{'=' * 60}")
print(f"  FASE 2: EXTRAÇÃO COMPLETA DOS DADOS")
print(f"{'=' * 60}")

if not arquivos_info:
    print("\n❌ Nenhum arquivo processado!")
    exit()

# Juntar todos os DataFrames
df = pd.concat([info['df'] for info in arquivos_info], ignore_index=True)
print(f"\n📊 Total combinado: {len(df)} registros")

# ==========================================
# 6. NORMALIZAÇÃO
# ==========================================
print("\n🔧 Normalizando dados...")

# Renomear 'respostas' → 'resposta' se necessário
if 'respostas' in df.columns and 'resposta' not in df.columns:
    df = df.rename(columns={'respostas': 'resposta'})
    print("   ✓ Renomeada 'respostas' → 'resposta'")

# Converter nota
if 'nota' in df.columns:
    df['nota'] = df['nota'].astype(str).str.replace(',', '.').astype(float)
    print("   ✓ Coluna 'nota' convertida para numérico")

# Normalizar município
if 'municipio' in df.columns:
    df['municipio'] = df['municipio'].astype(str).str.strip().str.upper()
    print("   ✓ Coluna 'municipio' normalizada")

# ==========================================
# 7. FILTRAR BETIM
# ==========================================
df_betim = df[df['municipio'] == MUNICIPIO_FILTRO].copy()
print(f"\n🏙️  Registros de {MUNICIPIO_FILTRO}: {len(df_betim)} (de {len(df)} total)")

if len(df_betim) == 0:
    print(f"\n⚠️  Nenhum registro para {MUNICIPIO_FILTRO}!")
    print("   Municípios disponíveis (amostra):")
    for m in sorted(df['municipio'].unique())[:15]:
        print(f"      • {m}")
    exit()

# ==========================================
# 8. REMOÇÃO DE DUPLICATAS
# ==========================================
qtd_antes = len(df_betim)
df_betim = df_betim.drop_duplicates()
duplicadas = qtd_antes - len(df_betim)

if duplicadas > 0:
    print(f"⚠️  Removidas {duplicadas} linhas duplicadas.")
else:
    print("✅ Nenhuma duplicidade encontrada.")

# ==========================================
# 9. SELEÇÃO DE COLUNAS
# ==========================================
colunas_desejadas = [
    # --- Dados já usados no dashboard ---
    'municipio', 'indicador', 'questao', 'resposta', 'nota', 'ano_ref',
    # --- Dados NOVOS (identificadores) ---
    'questao_id', 'indice_questao', 'chave_questao',
    # --- Dados NOVOS (contexto) ---
    'nome_questionario', 'codigo_ibge', 'tribunal',
    # --- Opcionais ---
    'questionario_id', 'data_termino', 'sequencia_bloco_repeticao',
]

colunas_finais = [col for col in colunas_desejadas if col in df_betim.columns]
colunas_ausentes = [col for col in colunas_desejadas if col not in df_betim.columns]

print(f"\n📋 Colunas extraídas ({len(colunas_finais)}):")
novas = ['questao_id', 'indice_questao', 'chave_questao', 'nome_questionario',
         'codigo_ibge', 'tribunal', 'questionario_id', 'data_termino', 'sequencia_bloco_repeticao']
for col in colunas_finais:
    marcador = "🆕" if col in novas else "✅"
    print(f"   {marcador} {col}")

if colunas_ausentes:
    print(f"\n⚠️  Colunas não encontradas ({len(colunas_ausentes)}):")
    for col in colunas_ausentes:
        print(f"   ❌ {col}")

df_excel = df_betim[colunas_finais].copy()

# ==========================================
# 10. CRIAR COLUNA RÓTULO
# ==========================================
if 'indice_questao' in df_excel.columns:
    df_excel['rotulo'] = df_excel['indice_questao'].astype(str).str.strip()
    print("\n✅ Coluna 'rotulo' criada a partir de 'indice_questao'")
elif 'chave_questao' in df_excel.columns:
    df_excel['rotulo'] = df_excel['chave_questao'].astype(str).str.strip()
    print("\n✅ Coluna 'rotulo' criada a partir de 'chave_questao'")
else:
    df_excel['rotulo'] = ''
    print("\n⚠️  Coluna 'rotulo' vazia (sem indice_questao ou chave_questao)")

# ==========================================
# 11. PRÉVIA NO TERMINAL
# ==========================================
df_visual = df_excel.copy()

def cortar(texto, limite=35):
    s = str(texto)
    return s[:limite] + "..." if len(s) > limite else s

for col in ['questao', 'resposta', 'chave_questao', 'nome_questionario']:
    if col in df_visual.columns:
        df_visual[col] = df_visual[col].apply(cortar)

print(f"\n--- PRÉVIA (primeiras 15 linhas) ---")
print(tabulate(df_visual.head(15), headers='keys', tablefmt='fancy_grid', showindex=False))

# Resumo por ano e indicador
print(f"\n--- RESUMO POR ANO E INDICADOR ---")
resumo = df_excel.groupby(['ano_ref', 'indicador']).agg(
    questoes=('questao', 'count'),
    nota_media=('nota', 'mean'),
    nota_max=('nota', 'max'),
    nota_min=('nota', 'min')
).round(2)
print(tabulate(resumo.reset_index(), headers='keys', tablefmt='fancy_grid', showindex=False))

# ==========================================
# 12. EXPORTAR EXCEL
# ==========================================
nome_excel = os.path.join(PASTA_DATA, "Relatorio_Betim_Completo.xlsx")
print(f"\n📝 Gerando Excel: {os.path.basename(nome_excel)}...")

with pd.ExcelWriter(nome_excel, engine='openpyxl') as writer:
    df_excel.to_excel(writer, sheet_name='Dados Completos', index=False)
    resumo.reset_index().to_excel(writer, sheet_name='Resumo Indicadores', index=False)
    
    for sheet_name in writer.sheets:
        ws = writer.sheets[sheet_name]
        df_ref = df_excel if sheet_name == 'Dados Completos' else resumo.reset_index()
        for i, col in enumerate(df_ref.columns):
            max_len = max(len(str(col)), int(df_ref[col].astype(str).str.len().max() or 0)) + 2
            ws.column_dimensions[get_column_letter(i + 1)].width = min(max_len, 80)

# ==========================================
# 13. EXPORTAR CSV PARA IMPORTAÇÃO
# ==========================================
nome_csv = os.path.join(PASTA_DATA, "respostas_betim_completo.csv")
df_excel.to_csv(nome_csv, sep=';', index=False, encoding='utf-8')
print(f"📝 CSV para importação: {os.path.basename(nome_csv)}")

# ==========================================
# 14. RESUMO FINAL
# ==========================================
anos = sorted(df_excel['ano_ref'].unique())
inds = sorted(df_excel['indicador'].unique())

print(f"\n{'=' * 60}")
print(f"  ✅ EXTRAÇÃO CONCLUÍDA!")
print(f"{'=' * 60}")
print(f"  Município: {MUNICIPIO_FILTRO}")
print(f"  Anos: {', '.join(str(int(a)) for a in anos)}")
print(f"  Indicadores: {', '.join(inds)}")
print(f"  Total de registros: {len(df_excel)}")
print(f"  Soma das notas: {df_excel['nota'].sum():.2f}")
print(f"")
print(f"  � Arquivos organizados: {PASTA_CSV_ORGANIZADOS}/")
print(f"  📊 Excel: {os.path.basename(nome_excel)}")
print(f"  📄 CSV: {os.path.basename(nome_csv)}")
print(f"{'=' * 60}")

# Verificação de dados novos
print(f"\n🔍 Dados NOVOS extraídos:")
for col in ['questao_id', 'indice_questao', 'chave_questao']:
    if col in df_excel.columns:
        preenchidos = df_excel[col].notna().sum()
        unicos = df_excel[col].nunique()
        print(f"   ✅ {col}: {preenchidos} preenchidos, {unicos} únicos")
        amostra = df_excel[col].dropna().unique()[:5]
        print(f"      Exemplos: {list(amostra)}")
    else:
        print(f"   ❌ {col}: não encontrado no CSV")
