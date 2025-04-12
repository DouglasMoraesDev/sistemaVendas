// js/vendas.js

// Elementos do DOM
const formVenda      = document.getElementById('formVenda');
const selectCliente  = document.getElementById('selectCliente');
const selectProduto  = document.getElementById('selectProduto');
const precoVenda     = document.getElementById('precoVenda');
const qtdVenda       = document.getElementById('qtdVenda');
const totalVenda     = document.getElementById('totalVenda');
const entradaVenda   = document.getElementById('entradaVenda');
const parcelasVenda  = document.getElementById('parcelasVenda');
const dueDayInput    = document.getElementById('dueDay');     // novo
const valorParcela   = document.getElementById('valorParcela');
const tituloVenda    = document.getElementById('tituloVenda');
const btnSubmitVenda = document.getElementById('btnSubmitVenda');
const obsVenda       = document.getElementById('obsVenda');

// Dados em memória
let clientesV = getData('clientes') || [];
let produtosV = getData('produtos') || [];
let vendas    = getData('vendas')   || [];

let editVendaId = null; // ID da venda em edição

function populateSelects() {
  selectCliente.innerHTML = '<option value="">Selecione o Cliente</option>';
  clientesV.forEach(c =>
    selectCliente.innerHTML += `<option value="${c.id}">${c.nome}</option>`
  );
  selectProduto.innerHTML = '<option value="">Selecione a mercadoria</option>';
  produtosV.forEach(p =>
    selectProduto.innerHTML += `<option value="${p.id}">${p.nome} (Qtd: ${p.qtd})</option>`
  );
}

function updateTotals() {
  const prod = produtosV.find(p => p.id === selectProduto.value);
  const precoNum = prod ? prod.preco : 0;
  precoVenda.value = precoNum.toLocaleString('pt-BR',{style:'currency',currency:'BRL'});

  const qtd = parseInt(qtdVenda.value, 10) || 1;
  const total = precoNum * qtd;
  totalVenda.value = total.toLocaleString('pt-BR',{style:'currency',currency:'BRL'});

  const entradaNum = parseFloat(
    entradaVenda.value.replace(/\./g,'').replace(',','.')
  ) || 0;
  const restante = total - entradaNum;
  const parcelas = parseInt(parcelasVenda.value, 10) || 1;

  valorParcela.value = parcelas > 0
    ? (restante / parcelas).toLocaleString('pt-BR',{style:'currency',currency:'BRL'})
    : '';
}

// Eventos de recalcular
selectProduto.addEventListener('change', updateTotals);
[qtdVenda, entradaVenda, parcelasVenda].forEach(el =>
  el.addEventListener('input', updateTotals)
);

formVenda.addEventListener('submit', e => {
  e.preventDefault();
  const cid      = selectCliente.value;
  const pid      = selectProduto.value;
  const qtd      = parseInt(qtdVenda.value, 10);
  const entrada  = parseFloat(
    entradaVenda.value.replace(/\./g,'').replace(',','.')
  ) || 0;
  const parcelas = parseInt(parcelasVenda.value, 10) || 1;
  const dueDay   = parseInt(dueDayInput.value, 10) || 1;  // novo
  const obs      = obsVenda.value.trim();

  if (!cid || !pid || qtd < 1 || dueDay < 1 || dueDay > 28) {
    alert('Preencha todos os campos corretamente.');
    return;
  }

  const prod = produtosV.find(p => p.id === pid);
  if (!prod) return;

  if (!editVendaId) {
    // nova venda
    if (prod.qtd < qtd) { alert('Estoque insuficiente.'); return; }
    prod.qtd -= qtd;
    vendas.push({
      id: generateID(),
      cliente: cid,
      produto: pid,
      qtd,
      entrada,
      parcelas,
      dueDay,                // salva dia de vencimento
      paidInstallments: 0,   // inicia contador
      proofs: [],            // array de comprovantes
      obs,
      data: new Date().toLocaleDateString('pt-BR')
    });
  } else {
    // edição
    const vOld = vendas.find(v => v.id === editVendaId);
    const pOld = produtosV.find(p => p.id === vOld.produto);
    pOld.qtd += vOld.qtd;
    if (prod.qtd < qtd) { alert('Estoque insuficiente.'); return; }
    prod.qtd -= qtd;
    Object.assign(vOld, {
      cliente: cid,
      produto: pid,
      qtd,
      entrada,
      parcelas,
      dueDay,               // atualiza vencimento
      obs
    });
    editVendaId = null;
    btnSubmitVenda.textContent = 'Registrar Venda';
    tituloVenda.textContent    = 'Registrar Venda';
  }

  saveData('produtos', produtosV);
  saveData('vendas', vendas);

  formVenda.reset();
  updateTotals();
  populateSelects();
});

/**
 * Carrega dados de uma venda para edição
 */
function editVenda(id) {
  const v = vendas.find(v => v.id === id);
  if (!v) return;
  editVendaId = id;
  selectCliente.value = v.cliente;
  selectProduto.value = v.produto;
  qtdVenda.value      = v.qtd;
  entradaVenda.value  = v.entrada.toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2});
  parcelasVenda.value = v.parcelas;
  dueDayInput.value   = v.dueDay;     // carrega vencimento
  obsVenda.value      = v.obs;
  updateTotals();
  btnSubmitVenda.textContent = 'Atualizar Venda';
  tituloVenda.textContent    = 'Editar Venda';
}

function deleteVenda(id) {
  const v    = vendas.find(v => v.id === id);
  const prod = produtosV.find(p => p.id === v.produto);
  if (prod) prod.qtd += v.qtd;
  vendas = vendas.filter(v => v.id !== id);
  saveData('produtos', produtosV);
  saveData('vendas', vendas);
  if (typeof renderHistorico === 'function') renderHistorico();
}

// Inicialização após carregar o DOM
document.addEventListener('DOMContentLoaded', () => {
  populateSelects();
  updateTotals();

  // Se houver ?editId=... na URL, já carrega em modo edição
  const params = new URLSearchParams(window.location.search);
  const editId = params.get('editId');
  if (editId) {
    editVenda(editId);
  }
});
