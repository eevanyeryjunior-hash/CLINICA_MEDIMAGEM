const cpfInput = document.getElementById('cpf');
const leftPanel = document.getElementById('leftPanel');
const smiley = document.getElementById('smiley');
const scoreSlider = document.getElementById('scoreSlider');
const enviarBtn = document.getElementById('btnEnviar');
const thankYouScreen = document.getElementById('thankYouScreen');
const btnRelatorio = document.getElementById('btnRelatorio');

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
  document.getElementById('loginOverlay').style.display = 'flex';
});

// --- Verificar login ---
function verificarLogin() {
  const user = document.getElementById('loginUser').value.trim();
  const pass = document.getElementById('loginPass').value.trim();

  if (user === 'admin' && pass === 'admin') {
    document.getElementById('loginOverlay').style.display = 'none';
    alert('✅ Login bem-sucedido! Exibindo relatórios...');
    // Aqui você pode chamar a função para mostrar os relatórios
  } else {
    alert('❌ Usuário ou senha incorretos!');
  }
}

// --- ENTER NO MODAL DE CPF ---
cpfInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    iniciarPesquisa();
  }
});

// --- ENTER NO FEEDBACK (fora do textarea) ---
document.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    if (document.activeElement.tagName === 'TEXTAREA') return; // não interferir no textarea
    if (!enviarBtn.disabled) {
      enviarFeedback();
    }
  }
});

// --- ENTER NO LOGIN ---
const loginUser = document.getElementById('loginUser');
const loginPass = document.getElementById('loginPass');

[loginUser, loginPass].forEach(input => {
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      verificarLogin();
    }
  });
});
// Após login correto, abrir tela de relatórios
function verificarLogin() {
  const user = document.getElementById('loginUser').value.trim();
  const pass = document.getElementById('loginPass').value.trim();

  if (user === 'admin' && pass === 'admin') {
    document.getElementById('loginOverlay').style.display = 'none';
    document.getElementById('reportOverlay').style.display = 'flex';
    atualizarDados();
  } else {
    alert('❌ Usuário ou senha incorretos!');
  }
}

// Fechar relatório
function fecharRelatorio() {
  document.getElementById('reportOverlay').style.display = 'none';
}

// Função para atualizar dados na tabela (exemplo com contagens fictícias)
function atualizarDados() {
  const tbody = document.getElementById('reportTable').querySelector('tbody');
  tbody.innerHTML = '';

  const categorias = ['Espera', 'Estrutura', 'Recepção', 'Enfermagem', 'Médicos', 'Nota geral'];
  categorias.forEach(cat => {
    const row = document.createElement('tr');
    row.innerHTML = `<td>${cat}</td><td>${Math.floor(Math.random()*100)}</td>`;
    tbody.appendChild(row);
  });
}

// Exportar CSV
function exportCSV() {
  const table = document.getElementById('reportTable');
  let csv = '';
  for (let row of table.rows) {
    const cells = Array.from(row.cells).map(cell => `"${cell.textContent}"`);
    csv += cells.join(',') + '\n';
  }
  const blob = new Blob([csv], {type: 'text/csv'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'relatorio.csv';
  a.click();
  URL.revokeObjectURL(url);
}

// Gerar todas as contagens
function gerarTodasContagens() {
  alert('✅ Todas as contagens geradas!');
  atualizarDados();
}

// Zerar todas as contagens
function zerarTodasContagens() {
  const tbody = document.getElementById('reportTable').querySelector('tbody');
  tbody.querySelectorAll('td:nth-child(2)').forEach(td => td.textContent = 0);
  alert('⚠️ Todas as contagens zeradas!');
}
