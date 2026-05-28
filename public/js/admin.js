// admin.js - dashboard de resultados

const { createClient } = supabase;
const db = createClient(
  window.SUPABASE_CONFIG.url,
  window.SUPABASE_CONFIG.anonKey
);

// Login
document.getElementById('form-login').addEventListener('submit', function(e) {
  e.preventDefault();
  const senha = document.getElementById('senha-admin').value;
  if (senha === window.ADMIN_SENHA) {
    document.getElementById('login-overlay').style.display = 'none';
    document.getElementById('painel').style.display = 'block';
    carregarDados();
  } else {
    document.getElementById('erro-login').style.display = 'block';
  }
});

let todasRespostas = [];

async function carregarDados() {
  const { data, error } = await db
    .from('respostas_treinamento')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) {
    document.getElementById('corpo-tabela').innerHTML =
      '<tr><td colspan="8" style="color:red;padding:16px;">Erro ao carregar: ' + error.message + '</td></tr>';
    return;
  }

  todasRespostas = data || [];
  renderizarKPIs(todasRespostas);
  renderizarTabela(todasRespostas);
  renderizarRespostasAbertas(todasRespostas);
}

function media(arr, campo) {
  const vals = arr.map(r => r[campo]).filter(v => v != null);
  if (!vals.length) return '-';
  return (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1);
}

function calcularNPS(arr) {
  const vals = arr.map(r => r.nps).filter(v => v != null);
  if (!vals.length) return { nps: '-', desc: 'sem dados' };
  const promotores = vals.filter(v => v >= 9).length;
  const detratores = vals.filter(v => v <= 6).length;
  const nps = Math.round(((promotores - detratores) / vals.length) * 100);
  let desc = nps >= 75 ? 'Excelente' : nps >= 50 ? 'Muito bom' : nps >= 0 ? 'Bom' : 'Precisa melhorar';
  return { nps, desc, promotores, detratores, neutros: vals.length - promotores - detratores };
}

function renderizarKPIs(data) {
  document.getElementById('kpi-total').textContent = data.length;

  const npsCalc = calcularNPS(data);
  const kpiNps = document.getElementById('kpi-nps');
  kpiNps.textContent = npsCalc.nps;
  kpiNps.className = 'kpi-valor ' + (
    typeof npsCalc.nps === 'number'
      ? (npsCalc.nps >= 50 ? 'kpi-nps-positivo' : npsCalc.nps >= 0 ? 'kpi-nps-neutro' : 'kpi-nps-negativo')
      : ''
  );
  document.getElementById('kpi-nps-desc').textContent =
    typeof npsCalc.nps === 'number'
      ? npsCalc.desc + ' (' + npsCalc.promotores + 'P / ' + npsCalc.neutros + 'N / ' + npsCalc.detratores + 'D)'
      : 'sem dados';

  document.getElementById('kpi-expectativa').textContent = media(data, 'atendimento_expectativa');
  document.getElementById('kpi-confianca').textContent = media(data, 'confianca_uso');

  const pretendem = data.filter(r => r.pretende_usar_claude === 'Sim' || r.pretende_usar_claude === 'Ja comecei').length;
  document.getElementById('kpi-uso').textContent = pretendem;
}

function badgeNPS(nps) {
  if (nps == null) return '-';
  if (nps >= 9) return '<span class="badge badge-promotor">' + nps + ' Promotor</span>';
  if (nps >= 7) return '<span class="badge badge-neutro">' + nps + ' Neutro</span>';
  return '<span class="badge badge-detrator">' + nps + ' Detrator</span>';
}

function formatarData(iso) {
  if (!iso) return '-';
  const d = new Date(iso);
  return d.toLocaleDateString('pt-BR') + ' ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

function renderizarTabela(data) {
  const tbody = document.getElementById('corpo-tabela');
  if (!data.length) {
    tbody.innerHTML = '<tr><td colspan="8" style="padding:16px;color:#6b7280;">Nenhuma resposta ainda.</td></tr>';
    return;
  }
  tbody.innerHTML = data.map(r => `
    <tr>
      <td><strong>${r.nome}</strong></td>
      <td>${formatarData(r.created_at)}</td>
      <td>${badgeNPS(r.nps)}</td>
      <td>${r.conhecimento_previo || '-'}</td>
      <td>${r.atendimento_expectativa || '-'}</td>
      <td>${r.confianca_uso || '-'}</td>
      <td>${r.pretende_usar_claude || '-'}</td>
      <td>${r.mais_treinamentos || '-'}</td>
    </tr>
  `).join('');
}

function secaoAberta(titulo, campo, data) {
  const resps = data.filter(r => r[campo] && r[campo].trim());
  if (!resps.length) return '';
  const itens = resps.map(r =>
    `<li><strong>${r.nome}</strong>${r[campo]}</li>`
  ).join('');
  return `
    <div class="secao-aberta">
      <h3>${titulo}</h3>
      <ul class="lista-respostas">${itens}</ul>
    </div>
  `;
}

function renderizarRespostasAbertas(data) {
  const el = document.getElementById('secoes-abertas');
  el.innerHTML = [
    secaoAberta('Palavra associada a IA antes', 'palavra_antes', data),
    secaoAberta('Expectativa inicial', 'expectativa_inicial', data),
    secaoAberta('O que surpreendeu', 'surpresa', data),
    secaoAberta('Motivo da nota NPS', 'nps_motivo', data),
    secaoAberta('O que poderia melhorar', 'melhorias', data),
    secaoAberta('Primeira situacao de uso', 'primeira_situacao', data),
    secaoAberta('Comentarios livres', 'comentario_livre', data),
  ].join('');
}

function exportarCSV() {
  if (!todasRespostas.length) return alert('Nenhuma resposta para exportar.');
  const cols = Object.keys(todasRespostas[0]);
  const linhas = [
    cols.join(';'),
    ...todasRespostas.map(r =>
      cols.map(c => {
        const v = r[c];
        if (Array.isArray(v)) return '"' + v.join(', ') + '"';
        if (v == null) return '';
        return '"' + String(v).replace(/"/g, '""') + '"';
      }).join(';')
    )
  ];
  const blob = new Blob(['﻿' + linhas.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'pesquisa-treinamento-ia.csv';
  a.click();
  URL.revokeObjectURL(url);
}
