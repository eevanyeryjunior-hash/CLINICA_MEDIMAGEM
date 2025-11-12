// --- Variáveis de elementos HTML ---
const cpfInput = document.getElementById('cpf');
const leftPanel = document.getElementById('leftPanel');
const smiley = document.getElementById('smiley');
const scoreSlider = document.getElementById('scoreSlider'); // Slider de notas
const enviarBtn = document.getElementById('btnEnviar');
const thankYouScreen = document.getElementById('thankYouScreen');
const btnRelatorio = document.getElementById('btnRelatorio');
const loginOverlay = document.getElementById('loginOverlay');
const reportOverlay = document.getElementById('reportOverlay');
const reportTableBody = document.querySelector('#reportTable tbody');
const btnExportXLS = document.getElementById('btnExportXLS'); // Botão XLS

// --- Contadores e armazenamento temporário ---
let respostas = JSON.parse(localStorage.getItem('respostas')) || [];
let totalRespostas = 0;
let totalNPS = 0;
let totalComentarios = 0;
let totalPromotores = 0;

// --- Inicializa contadores a partir do localStorage ---
function inicializarContadores() {
  totalRespostas = respostas.length;
  totalNPS = respostas.reduce((acc, r) => acc + r.nota, 0);
  totalComentarios = respostas.filter(r => r.comentario && r.comentario.trim() !== '').length;
  totalPromotores = respostas.filter(r => r.nota >= 9).length;
}
inicializarContadores();

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

// --- Geração das notas de 0 a 10 no slider ---
if (scoreSlider) {
  scoreSlider.innerHTML = ''; // limpa antes de criar
  for (let i = 0; i <= 10; i++) {
    const span = document.createElement('span');
    span.textContent = i; // mostra o número dentro da bolinha
    span.dataset.value = i;
    scoreSlider.appendChild(span);
  }
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
    smiley.classList.remove('animate');
    void smiley.offsetWidth;
    smiley.classList.add('animate');

    const opiniaoSection = document.querySelector('.right-panel');
    if (opiniaoSection) {
      opiniaoSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      opiniaoSection.classList.add('highlight');
      setTimeout(() => opiniaoSection.classList.remove('highlight'), 1500);
    }
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

  // Detectar dispositivo
  const isMobile = /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(navigator.userAgent);
  const dispositivo = isMobile ? 'Celular/Tablet' : 'PC';

  const resposta = {
    cpf,
    nota: notaAtual,
    opinioes: { ...opinioes },
    comentario,
    data: new Date().toLocaleString(),
    dispositivo
  };

  respostas.push(resposta);
  localStorage.setItem('respostas', JSON.stringify(respostas));

  totalRespostas++;
  totalNPS += notaAtual;
  if (comentario !== "") totalComentarios++;
  if (notaAtual >= 9) totalPromotores++;

  atualizarMetricas();

  document.getElementById('formContainer').style.display = 'none';
  thankYouScreen.style.display = 'flex';
  thankYouScreen.classList.add('show');

  // Mensagem de dispositivo
  const msg = document.createElement('div');
  msg.textContent = `📌 Feedback enviado pelo ${dispositivo}!`;
  msg.style.marginTop = '20px';
  msg.style.fontWeight = 'bold';
  msg.style.color = '#007bff';
  thankYouScreen.appendChild(msg);

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

  // remove mensagem do dispositivo
  const msg = thankYouScreen.querySelector('div');
  if(msg) thankYouScreen.removeChild(msg);
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
    atualizarTabela();
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

// --- Atualizar tabela de respostas ---
function atualizarTabela() {
  if (!reportTableBody) return;
  reportTableBody.innerHTML = '';
  respostas.forEach(r => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${r.cpf}</td>
      <td>${r.nota}</td>
      <td>${r.opinioes.Espera || ''}</td>
      <td>${r.opinioes.Estrutura || ''}</td>
      <td>${r.opinioes.Recepção || ''}</td>
      <td>${r.opinioes.Enfermagem || ''}</td>
      <td>${r.opinioes.Médicos || ''}</td>
      <td>${r.comentario}</td>
      <td>${r.data}</td>
      <td>${r.dispositivo}</td>
    `;
    reportTableBody.appendChild(tr);
  });
}

// --- Exportar para Excel (.xls) ---
function removerAcentos(str) {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function exportXLS() {
  if (respostas.length === 0) {
    alert("Nenhum dado para exportar.");
    return;
  }

  const table = document.getElementById('reportTable');
  if (!table) return;

  const cloneTable = table.cloneNode(true);

  cloneTable.querySelectorAll('tbody td').forEach(td => {
    td.innerHTML = td.innerHTML
      .replace(/👍/g, 'positivo')
      .replace(/👎/g, 'negativo');
    td.innerHTML = removerAcentos(td.innerHTML);
  });

  const html = `
    <html xmlns:x="urn:schemas-microsoft-com:office:excel">
      <head>
        <!--[if gte mso 9]><xml>
        <x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet>
        <x:Name>Relatorio</x:Name>
        <x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions>
        </x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook>
        </xml><![endif]-->
      </head>
      <body>${cloneTable.outerHTML}</body>
    </html>
  `;

  const blob = new Blob([html], { type: 'application/vnd.ms-excel' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = 'relatorio_pesquisa.xls';
  a.click();

  URL.revokeObjectURL(url);
  alert("✅ Relatório exportado em .xls com sucesso!");
}

btnExportXLS.addEventListener('click', exportXLS);

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
    localStorage.removeItem('respostas');
    atualizarMetricas();
    atualizarTabela();
    alert("⚠️ Todas as contagens foram zeradas!");
  }
}
