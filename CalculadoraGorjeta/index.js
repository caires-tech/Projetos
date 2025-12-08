/* ====== Funções utilitárias ====== */

/* Formata número em moeda BRL (R$ 0,00) */
function formatMoney(value) {
  const n = isFinite(Number(value)) ? Number(value) : 0;
  const rounded = Math.round(n * 100) / 100;
  return rounded.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

/* Formata "1 pessoa" ou "x pessoas" */
function formatSplit(value) {
  const n = Number(value) || 1;
  return n === 1 ? '1 pessoa' : `${n} pessoas`;
}

/* Aplica animação de reaparecer em um elemento (remove e re-adiciona classe) */
function animateValueEl(el) {
  if (!el) return;
  el.classList.remove('show');
  // força reflow para reiniciar a animação
  // eslint-disable-next-line no-unused-expressions
  void el.offsetWidth;
  el.classList.add('show');
}

/* ====== Cache de elementos do DOM ====== */
const yourBillEl = document.getElementById('yourBill');
const tipInputEl = document.getElementById('tipInput');
const splitInputEl = document.getElementById('splitInput');

const tipPercentEl = document.getElementById('tipPercent');
const tipValueEl = document.getElementById('tipValue');
const totalWithTipEl = document.getElementById('totalWithTip');
const splitValueEl = document.getElementById('splitValue');
const billEachEl = document.getElementById('billEach');

const themeToggleBtn = document.getElementById('themeToggle'); // botão de tema
const tipButtons = document.querySelectorAll('.tip-btn');      // botões rápidos de gorjeta

/* ====== Função principal: calcula e atualiza a UI ====== */
function update() {
  // lê os valores atuais (garante número válido)
  const bill = isFinite(Number(yourBillEl.value)) ? Number(yourBillEl.value) : 0;
  const tipPercent = isFinite(Number(tipInputEl.value)) ? Number(tipInputEl.value) : 0;
  let split = Math.floor(Number(splitInputEl.value)) || 1;
  if (split < 1) split = 1;

  // cálculos
  const tipValue = bill * (tipPercent / 100);
  const billTotal = bill + tipValue;
  const billEach = billTotal / split;

  // atualiza displays
  tipPercentEl.textContent = `${tipPercent} %`;
  tipValueEl.textContent = formatMoney(tipValue);
  totalWithTipEl.textContent = formatMoney(billTotal);
  billEachEl.textContent = formatMoney(billEach);
  splitValueEl.textContent = formatSplit(split);

  // animações suaves
  animateValueEl(tipValueEl);
  animateValueEl(totalWithTipEl);
  animateValueEl(billEachEl);
}

/* ====== Sincronização/Listeners de inputs (robusto mesmo sem oninput no HTML) ====== */
if (yourBillEl) yourBillEl.addEventListener('input', update);
if (tipInputEl) tipInputEl.addEventListener('input', () => {
  // quando usuário arrasta o slider, limpa seleção dos tip-buttons (se houver)
  tipButtons.forEach(b => b.classList.remove('active'));
  update();
});
if (splitInputEl) splitInputEl.addEventListener('input', update);

/* ====== Tip Quick Buttons (5/10/15/20%) ====== */
tipButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    // remove active dos demais
    tipButtons.forEach(b => b.classList.remove('active'));

    // marca o clicado
    btn.classList.add('active');

    // pega valor do data-value e atualiza slider
    const value = Number(btn.getAttribute('data-value')) || 0;
    if (tipInputEl) tipInputEl.value = value;

    // recalcula
    update();
  });
});

/* ====== Toggle de tema (único listener, padronizado) ====== */

/*
  Estratégia:
  - Mantemos apenas UM listener no botão de tema.
  - Aplicamos/removemos a classe "light" no <body> (ou "dark" conforme sua preferência).
  - Atualizamos o ícone do botão e salvamos a preferência no localStorage.
  - Isso evita conflitos entre múltiplos listeners que mexem em elementos diferentes.
*/

function applyTheme(isLight) {
  // Se isLight true -> aplica tema claro, senão escuro
  if (isLight) {
    document.body.classList.add('light');
    themeToggleBtn.textContent = '☀️';
    themeToggleBtn.setAttribute('aria-pressed', 'true');
  } else {
    document.body.classList.remove('light');
    themeToggleBtn.textContent = '🌙';
    themeToggleBtn.setAttribute('aria-pressed', 'false');
  }
  // persiste preferência
  try { localStorage.setItem('calc-theme', isLight ? 'light' : 'dark'); } catch (e) {}
}

/* Listener único para alternar tema */
if (themeToggleBtn) {
  themeToggleBtn.addEventListener('click', () => {
    const isLightNow = document.body.classList.toggle('light'); // toggles and returns current state
    applyTheme(isLightNow);
  });
}

/* ====== Inicialização (restaura tema e roda update inicial) ====== */
(function init() {
  // Restaura preferência de tema se existir
  try {
    const saved = localStorage.getItem('calc-theme');
    if (saved === 'light') applyTheme(true);
    else applyTheme(false);
  } catch (e) {
    // ignora se localStorage bloqueado
  }

  // Garante valores padrão nos inputs se estiverem vazios
  if (yourBillEl && yourBillEl.value === '') yourBillEl.value = '';
  if (tipInputEl && !tipInputEl.value) tipInputEl.value = '0';
  if (splitInputEl && !splitInputEl.value) splitInputEl.value = '1';

  // Atualiza a UI de início
  update();
})();
