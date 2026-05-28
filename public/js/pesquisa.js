// pesquisa.js — lógica do formulário + envio ao Supabase

const { createClient } = supabase;
const db = createClient(
  window.SUPABASE_CONFIG.url,
  window.SUPABASE_CONFIG.anonKey
);

// Redireciona para index se não tem nome na sessão
const nome = sessionStorage.getItem('pesquisa_nome');
if (!nome) {
  window.location.href = 'index.html';
}

document.getElementById('saudacao').textContent = `Olá, ${nome}! Responda com calma.`;

// ── Mostrar campo "outra" quando checkbox marcado ────────────────
function toggleCampoOutro(cbId, campoId) {
  const cb = document.getElementById(cbId);
  const campo = document.getElementById(campoId);
  if (!cb || !campo) return;
  cb.addEventListener('change', () => {
    campo.style.display = cb.checked ? 'block' : 'none';
    if (!cb.checked) campo.querySelector('input, textarea').value = '';
  });
}

toggleCampoOutro('cb-area-outra', 'campo-area-outra');
toggleCampoOutro('cb-tipo-outro', 'campo-tipo-outro');

// ── Highlight visual nas escalas de rádio ────────────────────────
document.querySelectorAll('.escala').forEach(escala => {
  escala.querySelectorAll('input[type="radio"]').forEach(radio => {
    radio.addEventListener('change', () => {
      escala.querySelectorAll('label').forEach(lbl => lbl.classList.remove('selecionada'));
      radio.closest('label').classList.add('selecionada');
    });
  });
});

// ── Barra de progresso (5 blocos) ────────────────────────────────
function atualizarProgresso() {
  const blocos = document.querySelectorAll('.bloco');
  blocos.forEach((bloco, i) => {
    const passo = document.getElementById(`p${i + 1}`);
    if (!passo) return;
    const temResposta = bloco.querySelector('input:checked, textarea:not(:placeholder-shown), input[type="text"]:not(:placeholder-shown)');
    passo.className = 'progresso-passo ' + (temResposta ? 'feito' : 'ativo');
  });
}

document.getElementById('form-pesquisa').addEventListener('input', atualizarProgresso);
document.getElementById('form-pesquisa').addEventListener('change', atualizarProgresso);

// ── Coleta todos os checkboxes de um grupo ───────────────────────
function coletarCheckboxes(name) {
  return Array.from(document.querySelectorAll(`input[name="${name}"]:checked`))
    .map(cb => cb.value);
}

// ── Envio do formulário ──────────────────────────────────────────
document.getElementById('form-pesquisa').addEventListener('submit', async function (e) {
  e.preventDefault();

  const aviso = document.getElementById('aviso');
  const botao = document.getElementById('botao-enviar');

  aviso.style.display = 'none';

  // Campos obrigatórios
  const obrigatorios = [
    { name: 'conhecimento_previo',    label: 'nível de familiaridade com IA (Bloco 1)' },
    { name: 'atendimento_expectativa', label: 'se o treinamento atendeu sua expectativa (Bloco 2)' },
    { name: 'nps',                    label: 'nota de recomendação (Bloco 3)' },
    { name: 'confianca_uso',          label: 'nível de confiança para usar IA (Bloco 4)' },
    { name: 'pretende_usar_claude',   label: 'se pretende usar o Claude (Bloco 4)' },
    { name: 'mais_treinamentos',      label: 'se quer mais treinamentos (Bloco 5)' },
  ];

  for (const campo of obrigatorios) {
    if (!document.querySelector(`input[name="${campo.name}"]:checked`)) {
      aviso.textContent = `Por favor, responda: ${campo.label}.`;
      aviso.style.display = 'block';
      aviso.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
  }

  botao.disabled = true;
  botao.textContent = 'Enviando...';

  const dados = {
    nome,
    conhecimento_previo:        parseInt(document.querySelector('input[name="conhecimento_previo"]:checked').value),
    ferramentas_anteriores:     coletarCheckboxes('ferramentas_anteriores'),
    palavra_antes:              document.getElementById('palavra_antes').value.trim() || null,
    expectativa_inicial:        document.getElementById('expectativa_inicial').value.trim() || null,
    atendimento_expectativa:    parseInt(document.querySelector('input[name="atendimento_expectativa"]:checked').value),
    surpresa:                   document.getElementById('surpresa').value.trim() || null,
    nps:                        parseInt(document.querySelector('input[name="nps"]:checked').value),
    nps_motivo:                 document.getElementById('nps_motivo').value.trim() || null,
    melhorias:                  document.getElementById('melhorias').value.trim() || null,
    confianca_uso:              parseInt(document.querySelector('input[name="confianca_uso"]:checked').value),
    areas_aplicacao:            coletarCheckboxes('areas_aplicacao'),
    areas_aplicacao_outro:      document.getElementById('areas_aplicacao_outro').value.trim() || null,
    pretende_usar_claude:       document.querySelector('input[name="pretende_usar_claude"]:checked').value,
    primeira_situacao:          document.getElementById('primeira_situacao').value.trim() || null,
    mais_treinamentos:          document.querySelector('input[name="mais_treinamentos"]:checked').value,
    tipo_treinamento_desejado:  coletarCheckboxes('tipo_treinamento_desejado'),
    tipo_treinamento_outro:     document.getElementById('tipo_treinamento_outro').value.trim() || null,
    comentario_livre:           document.getElementById('comentario_livre').value.trim() || null,
  };

  const { error } = await db.from('respostas_treinamento').insert(dados);

  if (error) {
    aviso.textContent = 'Erro ao enviar. Tente novamente ou fale com Ricardo.';
    aviso.style.display = 'block';
    botao.disabled = false;
    botao.textContent = 'Enviar respostas →';
    console.error(error);
    return;
  }

  sessionStorage.removeItem('pesquisa_nome');
  window.location.href = 'obrigada.html';
});
