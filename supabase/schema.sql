-- ============================================================
-- Pesquisa de Avaliação do Treinamento de IA
-- Departamento Financeiro do Grupo SN
-- ============================================================
-- Como aplicar:
-- 1. Acesse o painel do Supabase do projeto
-- 2. Vá em "SQL Editor"
-- 3. Cole TODO este arquivo e clique em "Run"
-- ============================================================

-- Tabela principal de respostas
create table if not exists public.respostas_treinamento (
  id                          uuid primary key default gen_random_uuid(),
  created_at                  timestamptz not null default now(),

  -- Identificação
  nome                        text not null,

  -- Bloco 1: Conhecimento prévio
  conhecimento_previo         int  check (conhecimento_previo between 1 and 5),
  ferramentas_anteriores      text[] default '{}',
  palavra_antes               text,

  -- Bloco 2: Expectativa vs realidade
  expectativa_inicial         text,
  atendimento_expectativa     int  check (atendimento_expectativa between 1 and 5),
  surpresa                    text,

  -- Bloco 3: NPS
  nps                         int  check (nps between 0 and 10),
  nps_motivo                  text,
  melhorias                   text,

  -- Bloco 4: Aplicação prática
  confianca_uso               int  check (confianca_uso between 1 and 5),
  areas_aplicacao             text[] default '{}',
  areas_aplicacao_outro       text,
  pretende_usar_claude        text,
  primeira_situacao           text,

  -- Bloco 5: Próximos passos
  mais_treinamentos           text,
  tipo_treinamento_desejado   text[] default '{}',
  tipo_treinamento_outro      text,
  comentario_livre            text
);

-- Habilita Row Level Security
alter table public.respostas_treinamento enable row level security;

-- Política 1: qualquer um (anon) pode INSERIR uma resposta
drop policy if exists "permite_insert_publico" on public.respostas_treinamento;
create policy "permite_insert_publico"
  on public.respostas_treinamento
  for insert
  to anon
  with check (true);

-- Política 2: qualquer um pode LER (a senha do /admin protege no front)
drop policy if exists "permite_select_publico" on public.respostas_treinamento;
create policy "permite_select_publico"
  on public.respostas_treinamento
  for select
  to anon
  using (true);

-- Índice por data (ajuda no admin a ordenar)
create index if not exists idx_respostas_created_at
  on public.respostas_treinamento (created_at desc);
