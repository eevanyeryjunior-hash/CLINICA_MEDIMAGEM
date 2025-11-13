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

// --- Contadores e armazenamento ---
let respostas = JSON.parse(localStorage.getItem('respostas')) || [];
let totalRespostas = parseInt(localStorage.getItem('totalRespostas')) || 0;
let totalNPS = parseFloat(localStorage.getItem('totalNPS')) || 0;
let totalComentarios = parseInt(localStorage.getItem('totalComentarios')) || 0;
let totalPromotores = parseInt(localStorage.getItem('totalPromotores')) || 0;

// --- Função para salvar tudo no localStorage ---
function salvarNoLocalStorage() {
  localStorage.setItem('respostas', JSON.stringify(respostas));
  localStorage.setItem('totalRespostas', totalRespostas);
  localStorage.setItem('totalNPS', totalNPS);
  localStorage.setItem('totalComentarios', totalComentarios);
  localStorage.setItem('totalPromotores', totalPromotores);
}

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

// --- Notas e rostinho ---
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

    smiley.classList.remove('animate');
    void smiley.offsetWidth;
    smiley.classList.add('animate');
  }
});

// --- Thumbs feedback ---
const categorias = ["Espera", "Estrutura", "Recepção", "Enfermagem", "Médicos"];
let opinioes = {};
categorias.forEach(cat => opinioes[cat] = null);

document.querySelectorAll('.thumbs button').forEach(btn => {
  btn.addEventListener('click', () => {
    const row = btn.closest('.feedback-row');
    const categoria = row.querySelector('span').textContent.trim();
    row.querySelectorAll('button').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    opinioes[categoria] = btn.classList.contains('up') ? '👍' : '👎';
    validarEnvio();
  });
});

function validarEnvio() {
  const todasAvaliadas = categorias.every(cat => opinioes[cat] !== null);
  enviarBtn.disabled = !(notaSelecionada && todasAvaliadas);
}

// --- Envio feedback ---
function enviarFeedback() {
  const comentario = document.querySelector('textarea').value.trim();
  const cpf = cpfInput.value.trim();

  respostas.push({
    cpf,
    nota: notaAtual,
    opinioes: { ...opinioes },
    comentario
  });

  totalRespostas++;
  totalNPS += notaAtual;
  if (comentario !== "") totalComentarios++;
  if (notaAtual >= 9) totalPromotores++;

  salvarNoLocalStorage(); // 🔴 Salva tudo no armazenamento local
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
    atualizarMetricas();
    atualizarTabelaRelatorio();
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

// --- Atualizar tabela ---
function atualizarTabelaRelatorio() {
  const tbody = document.querySelector('#reportTable tbody');
  if (!tbody) return;

  tbody.innerHTML = '';

  if (respostas.length === 0) {
    const tr = document.createElement('tr');
    const td = document.createElement('td');
    td.colSpan = 8;
    td.textContent = 'Nenhuma resposta registrada ainda.';
    tr.appendChild(td);
    tbody.appendChild(tr);
    return;
  }

  respostas.forEach((r) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${r.cpf}</td>
      <td>${r.nota}</td>
      <td>${r.opinioes.Espera}</td>
      <td>${r.opinioes.Estrutura}</td>
      <td>${r.opinioes.Recepção}</td>
      <td>${r.opinioes.Enfermagem}</td>
      <td>${r.opinioes.Médicos}</td>
      <td>${r.comentario || '-'}</td>
    `;
    tbody.appendChild(tr);
  });
}

// --- Exportar Excel (.xlsx) ---
function exportXLSX() {
  if (respostas.length === 0) {
    alert("Nenhum dado para exportar.");
    return;
  }

  const dados = respostas.map(r => ({
    CPF: r.cpf,
    Nota: r.nota,
    Espera: r.opinioes.Espera === '👍' ? 'Positivo' : (r.opinioes.Espera === '👎' ? 'Negativo' : ''),
    Estrutura: r.opinioes.Estrutura === '👍' ? 'Positivo' : (r.opinioes.Estrutura === '👎' ? 'Negativo' : ''),
    Recepção: r.opinioes.Recepção === '👍' ? 'Positivo' : (r.opinioes.Recepção === '👎' ? 'Negativo' : ''),
    Enfermagem: r.opinioes.Enfermagem === '👍' ? 'Positivo' : (r.opinioes.Enfermagem === '👎' ? 'Negativo' : ''),
    Médicos: r.opinioes.Médicos === '👍' ? 'Positivo' : (r.opinioes.Médicos === '👎' ? 'Negativo' : ''),
    Comentário: r.comentario || '-'
  }));

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(dados);
  XLSX.utils.book_append_sheet(wb, ws, "Relatório");

  XLSX.writeFile(wb, "relatorio_pesquisa.xlsx");
  alert("✅ Relatório Excel (.xlsx) exportado com sucesso!");
}

// --- Botão exportar ---
const btnExportXLS = document.getElementById('btnExportXLS');
if (btnExportXLS) btnExportXLS.addEventListener('click', exportXLSX);

// --- Contagens e reset ---
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
    salvarNoLocalStorage(); // 🔴 Limpa o armazenamento também
    atualizarMetricas();
    atualizarTabelaRelatorio();
    alert("⚠️ Todas as contagens foram zeradas!");
  }
}

// --- Ao carregar, atualiza a tela se já havia dados ---
window.addEventListener('DOMContentLoaded', () => {
  atualizarMetricas();
  atualizarTabelaRelatorio();
});
