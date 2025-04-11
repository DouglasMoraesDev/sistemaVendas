// js/produtos.js

// -----------------------------
// Máscara de moeda pt-BR para o campo de preço
// -----------------------------
const precoInput = document.getElementById('precoProd');
precoInput.addEventListener('input', e => {
  // remove tudo que não for dígito
  let v = e.target.value.replace(/\D/g, '');
  // converte para número real e formata em pt-BR com duas casas decimais
  v = (parseInt(v, 10) / 100).toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  e.target.value = v;
});

// -----------------------------
// Elementos do DOM
// -----------------------------
const formProduto   = document.getElementById('formProduto');
const listaProdutos = document.getElementById('listaProdutos');

// -----------------------------
// Dados em memória (LocalStorage)
// -----------------------------
let produtos      = getData('produtos') || [];
let editProdutoId = null; // guarda o ID quando estamos editando

// -----------------------------
// Função: renderProdutos()
// Atualiza a tabela de produtos na tela
// -----------------------------
function renderProdutos() {
  listaProdutos.innerHTML = '';
  produtos.forEach(p => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>
        <img src="${p.foto || 'https://via.placeholder.com/50'}" class="produto">
      </td>
      <td>${p.nome}</td>
      <td>${p.preco.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      })}</td>
      <td>${p.qtd}</td>
      <td>
        <button onclick="editProduto('${p.id}')">✏️</button>
        <button onclick="deleteProduto('${p.id}')">❌</button>
      </td>`;
    listaProdutos.appendChild(tr);
  });
  // salva no LocalStorage sempre que renderiza
  saveData('produtos', produtos);
}

// -----------------------------
// Evento: ao submeter o formulário
// Cria ou atualiza um produto
// -----------------------------
formProduto.addEventListener('submit', e => {
  e.preventDefault();
  // coleta valores do form
  const nome    = document.getElementById('nomeProd').value.trim();
  const precoStr= document.getElementById('precoProd').value;
  // converte "15.000,00" para número 15000.00
  const preco   = parseFloat(precoStr.replace(/\./g, '').replace(',', '.')) || 0;
  const qtd     = parseInt(document.getElementById('qtdProd').value, 10) || 0;
  const file    = document.getElementById('fotoProd').files[0];

  // função auxiliar para finalizar criação/edição
  const processData = fotoData => {
    if (editProdutoId) {
      // estamos em modo edição
      produtos = produtos.map(p =>
        p.id === editProdutoId
          ? { ...p, nome, preco, qtd, foto: fotoData }
          : p
      );
      editProdutoId = null;
      document.getElementById('btnSalvarProduto').textContent = 'Adicionar Mercadoria';
    } else {
      // criando novo produto
      produtos.push({ id: generateID(), nome, preco, qtd, foto: fotoData });
    }
    formProduto.reset();
    renderProdutos();
  };

  // se houver arquivo de imagem, lê como Base64
  if (file) {
    const reader = new FileReader();
    reader.onload = () => processData(reader.result);
    reader.readAsDataURL(file);
  } else {
    processData(null);
  }
});

// -----------------------------
// Função: editProduto(id)
// Preenche o form para edição de um produto existente
// -----------------------------
function editProduto(id) {
  const p = produtos.find(p => p.id === id);
  if (!p) return;
  document.getElementById('nomeProd').value  = p.nome;
  // formata de volta para pt-BR "15.000,00"
  document.getElementById('precoProd').value = p.preco.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  document.getElementById('qtdProd').value   = p.qtd;
  editProdutoId = id;
  document.getElementById('btnSalvarProduto').textContent = 'Atualizar Mercadoria';
}

// -----------------------------
// Função: deleteProduto(id)
// Remove produto e atualiza tabela
// -----------------------------
function deleteProduto(id) {
  produtos = produtos.filter(p => p.id !== id);
  renderProdutos();
}

// -----------------------------
// Inicialização
// -----------------------------
renderProdutos();
