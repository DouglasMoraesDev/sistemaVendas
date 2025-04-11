// js/vendas.js

// DOM
const formVenda      = document.getElementById('formVenda');
const selectCliente  = document.getElementById('selectCliente');
const selectProduto  = document.getElementById('selectProduto');
const precoVenda     = document.getElementById('precoVenda');
const qtdVenda       = document.getElementById('qtdVenda');
const totalVenda     = document.getElementById('totalVenda');
const entradaVenda   = document.getElementById('entradaVenda');
const parcelasVenda  = document.getElementById('parcelasVenda');
const valorParcela   = document.getElementById('valorParcela');
const tituloVenda    = document.getElementById('tituloVenda');
const btnSubmitVenda = document.getElementById('btnSubmitVenda');
const obsVenda       = document.getElementById('obsVenda');

// Dados
let clientesV = getData('clientes') || [];
let produtosV = getData('produtos') || [];
let vendas     = getData('vendas')   || [];

let editVendaId = null; // ID da venda em edição

/**
 * Popula selects de cliente e produto
 */
function populateSelects() {
  selectCliente.innerHTML = '<option value="">Selecione o Cliente</option>';
  clientesV.forEach(c => {
    selectCliente.innerHTML += `<option value="${c.id}">${c.nome}</option>`;
  });

  selectProduto.innerHTML = '<option value="">Selecione a mercadoria</option>';
  produtosV.forEach(p => {
    selectProduto.innerHTML += `<option value="${p.id}">${p.nome} (Qtd: ${p.qtd})</option>`;
  });
}

/**
 * Recalcula totais e formata em BRL
 */
function updateTotals() {
  // usa preço do objeto produto (número)
  const prod = produtosV.find(p => p.id === selectProduto.value);
  const precoNum = prod ? prod.preco : 0;
  // exibe formatado
  precoVenda.value = precoNum.toLocaleString('pt-BR', {
    style:'currency', currency:'BRL'
  });

  const qtd = parseInt(qtdVenda.value, 10) || 1;
  const total = precoNum * qtd;
  totalVenda.value = total.toLocaleString('pt-BR', {
    style:'currency', currency:'BRL'
  });

  // parse entrada (string com vírgula)
  const entradaNum = parseFloat(
    entradaVenda.value.replace(/\./g,'').replace(',','.')
  ) || 0;
  const restante = total - entradaNum;
  const parcelas = parseInt(parcelasVenda.value, 10) || 1;

  valorParcela.value = parcelas > 0
    ? (restante / parcelas).toLocaleString('pt-BR', {
        style:'currency', currency:'BRL'
      })
    : '';
}

// ao mudar produto
selectProduto.addEventListener('change', updateTotals);
// ao digitar qtd, entrada ou parcelas
[qtdVenda, entradaVenda, parcelasVenda].forEach(el =>
  el.addEventListener('input', updateTotals)
);

/**
 * Cria ou atualiza uma venda
 */
formVenda.addEventListener('submit', e => {
  e.preventDefault();
  const cid      = selectCliente.value;
  const pid      = selectProduto.value;
  const qtd      = parseInt(qtdVenda.value, 10);
  const entrada  = parseFloat(
    entradaVenda.value.replace(/\./g,'').replace(',','.')
  ) || 0;
  const parcelas = parseInt(parcelasVenda.value, 10) || 1;
  const obs      = obsVenda.value.trim();

  if (!cid || !pid || qtd < 1) {
    alert('Preencha todos os campos corretamente.');
    return;
  }

  const prod = produtosV.find(p => p.id === pid);
  if (!prod) return;

  if (!editVendaId) {
    // Nova venda
    if (prod.qtd < qtd) { alert('Estoque insuficiente.'); return; }
    prod.qtd -= qtd;
    vendas.push({
      id: generateID(),
      cliente: cid,
      produto: pid,
      qtd,
      entrada,
      parcelas,
      paidInstallments: 0,      // inicializa controle de parcelas
      proofs: [],               // comprovantes de pagamento
      obs,
      data: new Date().toLocaleString('pt-BR')
    });
  } else {
    // Edição de venda
    const vOld  = vendas.find(v => v.id === editVendaId);
    const pOld  = produtosV.find(p => p.id === vOld.produto);
    pOld.qtd += vOld.qtd;      // devolve estoque antigo
    if (prod.qtd < qtd) { alert('Estoque insuficiente.'); return; }
    prod.qtd -= qtd;

    Object.assign(vOld, {
      cliente: cid,
      produto: pid,
      qtd,
      entrada,
      parcelas,
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
 * Carrega dados para editar
 */
function editVenda(id) {
  const v = vendas.find(v => v.id === id);
  if (!v) return;
  editVendaId = id;
  selectCliente.value  = v.cliente;
  selectProduto.value  = v.produto;
  qtdVenda.value       = v.qtd;
  entradaVenda.value   = v.entrada
    .toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2});
  parcelasVenda.value  = v.parcelas;
  obsVenda.value       = v.obs;
  updateTotals();
  btnSubmitVenda.textContent = 'Atualizar Venda';
  tituloVenda.textContent    = 'Editar Venda';
}

/**
 * Remove venda e devolve estoque
 */
function deleteVenda(id) {
  const v    = vendas.find(v => v.id === id);
  const prod = produtosV.find(p => p.id === v.produto);
  if (prod) prod.qtd += v.qtd;
  vendas = vendas.filter(v => v.id !== id);
  saveData('produtos', produtosV);
  saveData('vendas', vendas);
  if (typeof renderHistorico === 'function') renderHistorico();
}

// inicializa
populateSelects();
updateTotals();
