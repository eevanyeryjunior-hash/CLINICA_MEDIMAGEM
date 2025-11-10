// Variáveis de elementos HTML
const cpfInput = document.getElementById('cpf');
const leftPanel = document.getElementById('leftPanel');
const smiley = document.getElementById('smiley');
const scoreSlider = document.getElementById('scoreSlider');
const enviarBtn = document.getElementById('btnEnviar');
const thankYouScreen = document.getElementById('thankYouScreen');
const btnRelatorio = document.getElementById('btnRelatorio');
const loginOverlay = document.getElementById('loginOverlay');
const reportOverlay = document.getElementById('reportOverlay');
const reportTable = document.getElementById('reportTable');
const exportCSVBtn = document.getElementById('exportCSV');
const gerarContagensBtn = document.getElementById('gerarContagens');
const zerarContagensBtn = document.getElementById('zerarContagens');

// --- Máscara de CPF ---
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
let opiniaoSelecionada = false;

// --- Notas e rostinho ---
scoreSlider.addEventListener('click', (e) => {
  if (e.target.tagName === 'SPAN') {
    document.querySelectorAll('.slider span').forEach(s => s.classList.remove('selected'));
    e.target.classList.add('selected');

    const score = parseInt(e.target.textContent);
    notaSelecionada = true;
    validarEnvio();

    leftPanel.className = 'left-panel';
    if (score <= 3) { leftPanel.classList.add('red'); smiley.textContent = '😞'; }
    else if (score <= 7) { leftPanel.classList.add('orange'); smiley.textContent = '😐'; }
    else { leftPanel.classList.add('green'); smiley.textContent = '😊'; }

    smiley.classList.add('selected');

    if (window.innerWidth <= 768) {
      document.getElementById('formContainer').scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }
});

// --- Thumbs feedback ---
document.querySelectorAll('.thumbs button').forEach(btn => {
  btn.addEventListener('click', () => {
    const group = btn.parentNode.querySelectorAll('button');
    group.forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    opiniaoSelecionada = true;
    validarEnvio();
  });
});

function validarEnvio() {
  if (notaSelecionada || opiniaoSelecionada) enviarBtn.disabled = false;
}

// --- Envio feedback ---
function enviarFeedback() {
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
  smiley.classList.remove('selected');
  leftPanel.className = 'left-panel';

  document.querySelectorAll('.slider span').forEach(s => s.classList.remove('selected'));
  document.querySelectorAll('.thumbs button').forEach(b => b.classList.remove('selected'));
  document.querySelector('textarea').value = '';
  enviarBtn.disabled = true;
  notaSelecionada = false;
  opiniaoSelecionada = false;
}

// --- Botão Relatório ---
btnRelatorio.addEventListener('click', () => {
  loginOverlay.style.display = 'flex'; // Exibe o overlay de login
});

// --- Verificar login ---
function verificarLogin() {
  const user = document.getElementById('loginUser').value.trim();
  const pass = document.getElementById('loginPass').value.trim();

  if (user === 'admin' && pass === 'admin') {
    loginOverlay.style.display = 'none';
    reportOverlay.style.display = 'flex';
    alert('✅ Login bem-sucedido! Exibindo relatórios...');
    atualizarDados(); // Atualiza os dados do relatório após o login
  } else {
    alert('❌ Usuário ou senha incorretos!');
  }
}

// --- Fechar relatório ---
function fecharRelatorio() {
  reportOverlay.style.display = 'none';
}

// Função para atualizar dados na tabela (contagem fictícia)
function atualizarDados() {
  const tbody = reportTable.querySelector('tbody');
  tbody.innerHTML = ''; // Limpa a tabela

  const categorias = ['Espera', 'Estrutura', 'Recepção', 'Enfermagem', 'Médicos', 'Nota geral'];
  categorias.forEach(cat => {
    const row = document.createElement('tr');
    row.innerHTML = `<td>${cat}</td><td>${Math.floor(Math.random() * 100)}</td>`;
    tbody.appendChild(row);
  });
}

// --- Exportar CSV ---
exportCSVBtn.addEventListener('click', exportCSV);
function exportCSV() {
  const table = reportTable;
  let csv = '';
  for (let row of table.rows) {
    const cells = Array.from(row.cells).map(cell => `"${cell.textContent}"`);
    csv += cells.join(',') + '\n';
  }
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'relatorio.csv';
  a.click();
  URL.revokeObjectURL(url);
}

// --- Gerar todas as contagens ---
gerarContagensBtn.addEventListener('click', gerarTodasContagens);
function gerarTodasContagens() {
  alert('✅ Todas as contagens geradas!');
  atualizarDados();
}

// --- Zerar todas as contagens ---
zerarContagensBtn.addEventListener('click', zerarTodasContagens);
function zerarTodasContagens() {
  const tbody = reportTable.querySelector('tbody');
  tbody.querySelectorAll('td:nth-child(2)').forEach(td => td.textContent = 0);
  alert('⚠️ Todas as contagens zeradas!');
}
document.querySelectorAll('.cat-filter').forEach(chk => {
  chk.addEventListener('change', () => {
    const valor = chk.value.toLowerCase();
    document.querySelectorAll('#reportTable tbody tr').forEach(row => {
      const categoria = row.cells[0].textContent.toLowerCase();
      row.style.display = chk.checked || categoria !== valor ? '' : 'none';
    });
  });
});
