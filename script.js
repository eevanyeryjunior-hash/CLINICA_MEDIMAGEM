// --- Variáveis de elementos HTML ---
const cpfInput = document.getElementById('cpf');
const leftPanel = document.getElementById('leftPanel');
const smiley = document.getElementById('smiley');
const scoreSlider = document.getElementById('scoreSlider');
const enviarBtn = document.getElementById('btnEnviar');
const thankYouScreen = document.getElementById('thankYouScreen');
const btnRelatorio = document.getElementById('btnRelatorio');
const loginOverlay = document.getElementById('loginOverlay');
const reportOverlay = document.getElementById('reportOverlay');

// --- Contadores e armazenamento temporário ---
let respostas = [];
let totalRespostas = 0;
let totalNPS = 0;
let totalComentarios = 0;
let totalPromotores = 0;

// --- Máscara CPF ---
cpfInput.addEventListener('input', () => {
  let value = cpfInput.value.replace(/\D/g, '');
  value = value.replace(/(\d{3})(\d)/, '$1.$2');
  value = value.replace(/(\d{3})(\d)/, '$1.$2');
  value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  cpfInput.value = value;
});

// --- Validação CPF ---
function validarCPF(cpf) {
  cpf = cpf.replace(/[^\d]+/g, '');
  if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false;
  let soma = 0, resto;
  for (let i = 1; i <= 9; i++) soma += parseInt(cpf.substring(i - 1, i)) * (11 - i);
  resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cpf.substring(9, 10))) return false;
  soma = 0;
  for (let i = 1; i <= 10; i++) soma += parseInt(cpf.substring(i - 1, i)) * (12 - i);
  resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  return resto === parseInt(cpf.substring(10, 11));
}

// --- Iniciar pesquisa ---
function iniciarPesquisa() {
  const cpf = cpfInput.value;
  if (!validarCPF(cpf)) {
    alert('❌ CPF inválido. Verifique e tente novamente.');
    return;
  }
  document.getElementById('cpfOverlay').style.display = 'none';
}

// --- Controle feedback ---
let notaSelecionada = false;
let notaAtual = null;

// --- Notas e rostinho com animação ---
scoreSlider.addEventListener('click', (e) => {
  if (e.target.tagName === 'SPAN') {
    document.querySelectorAll('.slider span').forEach(s => s.classList.remove('selected'));
    e.target.classList.add('selected');

    notaAtual = parseInt(e.target.textContent);
    notaSelecionada = true;
    validarEnvio();

    leftPanel.className = 'left-panel';
    let emoji = '🙂';
    if (notaAtual <= 1) { emoji = '😡'; leftPanel.classList.add('red'); }
    else if (notaAtual === 2) { emoji = '😠'; leftPanel.classList.add('red'); }
    else if (notaAtual === 3) { emoji = '😞'; leftPanel.classList.add('red'); }
    else if (notaAtual === 4) { emoji = '🙁'; leftPanel.classList.add('orange'); }
    else if (notaAtual === 5) { emoji = '😐'; leftPanel.classList.add('orange'); }
    else if (notaAtual === 6) { emoji = '😕'; leftPanel.classList.add('orange'); }
    else if (notaAtual === 7) { emoji = '🙂'; leftPanel.classList.add('green'); }
    else if (notaAtual === 8) { emoji = '😊'; leftPanel.classList.add('green'); }
    else if (notaAtual === 9) { emoji = '😃'; leftPanel.classList.add('green'); }
    else if (notaAtual === 10) { emoji = '🤩'; leftPanel.classList.add('green'); }

    smiley.textContent = emoji;

    // 🔥 Reinicia a animação do rostinho
    smiley.classList.remove('animate');
    void smiley.offsetWidth; // força reflow
    smiley.classList.add('animate');

    // 🪄 NOVO: rola suavemente até a área das opiniões
    const opiniaoSection = document.querySelector('.right-panel');
    if (opiniaoSection) {
      opiniaoSection.scrollIntoView({ behavior: 'smooth', block: 'start' });

      // ✨ Destaque suave na área de opinião
      opiniaoSection.classList.add('highlight');
      setTimeout(() => opiniaoSection.classList.remove('highlight'), 1500);
    }
  }
});

// --- Thumbs feedback ---
const categorias = ["Espera", "Estrutura", "Recepção", "Enfermagem", "Médicos"];
let opinioes = {};

// Inicializa todas as categorias como não respondidas
categorias.forEach(cat => opinioes[cat] = null);

document.querySelectorAll('.thumbs button').forEach(btn => {
  btn.addEventListener('click', () => {
    const row = btn.closest('.feedback-row');
    const categoria = row.querySelector('span').textContent.trim();

    // Alterna o botão selecionado
    row.querySelectorAll('button').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    opinioes[categoria] = btn.classList.contains('up') ? '👍' : '👎';

    validarEnvio();
  });
});

function validarEnvio() {
  const todasAvaliadas = categorias.every(cat => opinioes[cat] !== null);
  if (notaSelecionada && todasAvaliadas) {
    enviarBtn.disabled = false;
  } else {
    enviarBtn.disabled = true;
  }
}

// --- Envio feedback ---
function enviarFeedback() {
  const comentario = document.querySelector('textarea').value.trim();

  respostas.push({
    nota: notaAtual,
    opinioes: { ...opinioes },
    comentario
  });

  totalRespostas++;
  totalNPS += notaAtual;
  if (comentario !== "") totalComentarios++;
  if (notaAtual >= 9) totalPromotores++;

  atualizarMetricas();

  document.getElementById('formContainer').style.display = 'none';
  thankYouScreen.style.display = 'flex';
  thankYouScreen.classList.add('show');
  setTimeout(voltarInicio, 5000);
}

// --- Reiniciar formulário ---
function voltarInicio() {
  thankYouScreen.classList.remove('show');
  thankYouScreen.style.display = 'none';
  document.getElementById('formContainer').style.display = 'flex';
  document.getElementById('cpfOverlay').style.display = 'flex';

  cpfInput.value = '';
  smiley.textContent = '🙂';
  smiley.classList.remove('animate');
  leftPanel.className = 'left-panel';
  document.querySelectorAll('.slider span').forEach(s => s.classList.remove('selected'));
  document.querySelectorAll('.thumbs button').forEach(b => b.classList.remove('selected'));
  document.querySelector('textarea').value = '';
  enviarBtn.disabled = true;
  notaSelecionada = false;
  notaAtual = null;
  categorias.forEach(cat => opinioes[cat] = null);
}

// --- Login / Relatório ---
btnRelatorio.addEventListener('click', () => {
  loginOverlay.style.display = 'flex';
});

function verificarLogin() {
  const user = document.getElementById('loginUser').value.trim();
  const pass = document.getElementById('loginPass').value.trim();

  if (user === 'admin' && pass === 'admin') {
    loginOverlay.style.display = 'none';
    reportOverlay.style.display = 'flex';
    alert('✅ Login bem-sucedido! Exibindo relatórios...');
    atualizarMetricas();
  } else {
    alert('❌ Usuário ou senha incorretos!');
  }
}

function fecharRelatorio() {
  reportOverlay.style.display = 'none';
}

// --- Atualizar métricas ---
function atualizarMetricas() {
  const metrics = document.querySelectorAll('.metrics div strong');
  if (metrics.length < 4) return;

  const npsScore = totalRespostas > 0 ? (totalNPS / totalRespostas).toFixed(1) : 0;
  const percPromotores = totalRespostas > 0 ? ((totalPromotores / totalRespostas) * 100).toFixed(0) + "%" : "0%";

  metrics[0].textContent = totalRespostas;
  metrics[1].textContent = npsScore;
  metrics[2].textContent = totalComentarios;
  metrics[3].textContent = percPromotores;
}

// --- Exportar CSV completo ---
function exportCSV() {
  if (respostas.length === 0) {
    alert("Nenhum dado para exportar.");
    return;
  }

  let csv = "Nota,Espera,Estrutura,Recepção,Enfermagem,Médicos,Comentário\n";
  respostas.forEach(r => {
    csv += `${r.nota},${r.opinioes.Espera},${r.opinioes.Estrutura},${r.opinioes.Recepção},${r.opinioes.Enfermagem},${r.opinioes.Médicos},"${r.comentario.replace(/"/g, '""')}"\n`;
  });

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "relatorio_pesquisa.csv";
  a.click();
  URL.revokeObjectURL(url);

  alert("✅ Relatório exportado com sucesso!");
}

// --- Funções auxiliares ---
function gerarTodasContagens() {
  alert('✅ Contagens atualizadas!');
  atualizarMetricas();
}

function zerarTodasContagens() {
  if (confirm("Tem certeza que deseja zerar todas as contagens?")) {
    respostas = [];
    totalRespostas = 0;
    totalNPS = 0;
    totalComentarios = 0;
    totalPromotores = 0;
    atualizarMetricas();
    alert("⚠️ Todas as contagens foram zeradas!");
  }
}
