const formVenda = document.getElementById('formVenda');
const selectCliente = document.getElementById('selectCliente');
const selectProduto = document.getElementById('selectProduto');
const precoVenda = document.getElementById('precoVenda');
const qtdVenda = document.getElementById('qtdVenda');
const totalVenda = document.getElementById('totalVenda');
const entradaVenda = document.getElementById('entradaVenda');
const parcelasVenda = document.getElementById('parcelasVenda');
const valorParcela = document.getElementById('valorParcela');
const tituloVenda = document.getElementById('tituloVenda');
const btnSubmitVenda = document.getElementById('btnSubmitVenda');

let clientesV = getData('clientes');
let produtosV = getData('produtos');
let vendas = getData('vendas');
let editVendaId = null;

function populateSelects() {
  selectCliente.innerHTML = '<option value="">Selecione o Cliente</option>';
  clientesV.forEach(c =>
    selectCliente.innerHTML += `<option value="${c.id}">${c.nome}</option>`
  );
  selectProduto.innerHTML = '<option value="">Selecione o Produto</option>';
  produtosV.forEach(p =>
    selectProduto.innerHTML += `<option value="${p.id}">${p.nome} (Qtd: ${p.qtd})</option>`
  );
}

function updateTotals() {
  const preco = parseFloat(precoVenda.value) || 0;
  const qtd = parseInt(qtdVenda.value) || 1;
  const total = preco * qtd;
  totalVenda.value = total.toFixed(2);
  const entrada = parseFloat(entradaVenda.value) || 0;
  const restante = total - entrada;
  const parcelas = parseInt(parcelasVenda.value) || 1;
  valorParcela.value = parcelas > 0
    ? (restante / parcelas).toFixed(2)
    : '';
}

selectProduto.addEventListener('change', () => {
  const p = produtosV.find(p => p.id === selectProduto.value);
  precoVenda.value = p ? p.preco.toFixed(2) : '';
  updateTotals();
});
[qtdVenda, entradaVenda, parcelasVenda].forEach(el =>
  el.addEventListener('input', updateTotals)
);

formVenda.addEventListener('submit', e => {
  e.preventDefault();
  const cid = selectCliente.value;
  const pid = selectProduto.value;
  const qtd = parseInt(qtdVenda.value, 10);
  const entrada = parseFloat(entradaVenda.value);
  const parcelas = parseInt(parcelasVenda.value, 10);
  const obs = document.getElementById('obsVenda').value;
  if (!cid || !pid || qtd < 1) { alert('Preencha todos os campos'); return; }
  const prod = produtosV.find(p => p.id === pid);
  if (!editVendaId) {
    if (prod.qtd < qtd) { alert('Estoque insuficiente'); return; }
    prod.qtd -= qtd;
    vendas.push({
      id: generateID(),
      cliente: cid,
      produto: pid,
      qtd,
      entrada,
      parcelas,
      obs,
      data: new Date().toLocaleString()
    });
  } else {
    const old = vendas.find(v => v.id === editVendaId);
    const prodOld = produtosV.find(p => p.id === old.produto);
    prodOld.qtd += old.qtd;
    if (prod.qtd < qtd) { alert('Estoque insuficiente'); return; }
    prod.qtd -= qtd;
    Object.assign(old, { cliente: cid, produto: pid, qtd, entrada, parcelas, obs });
    editVendaId = null;
    btnSubmitVenda.textContent = 'Registrar Venda';
    tituloVenda.textContent = 'Registrar Venda';
  }
  saveData('produtos', produtosV);
  saveData('vendas', vendas);
  formVenda.reset();
  populateSelects();
});

function editVenda(id) {
  const v = vendas.find(v => v.id === id);
  editVendaId = id;
  selectCliente.value = v.cliente;
  selectProduto.value = v.produto;
  precoVenda.value = produtosV.find(p => p.id === v.produto).preco.toFixed(2);
  qtdVenda.value = v.qtd;
  entradaVenda.value = v.entrada;
  parcelasVenda.value = v.parcelas;
  updateTotals();
  btnSubmitVenda.textContent = 'Atualizar Venda';
  tituloVenda.textContent = 'Editar Venda';
}

function deleteVenda(id) {
  const v = vendas.find(v => v.id === id);
  const prod = produtosV.find(p => p.id === v.produto);
  prod.qtd += v.qtd;
  vendas = vendas.filter(v => v.id !== id);
  saveData('produtos', produtosV);
  saveData('vendas', vendas);
  renderHistorico();
}

populateSelects();
