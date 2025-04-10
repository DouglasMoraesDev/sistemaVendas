const formProduto = document.getElementById('formProduto');
const listaProdutos = document.getElementById('listaProdutos');
let produtos = getData('produtos');
let editProdutoId = null;

function renderProdutos() {
  listaProdutos.innerHTML = '';
  produtos.forEach(p => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><img src="${p.foto||'https://via.placeholder.com/50'}" class="produto"></td>
      <td>${p.nome}</td>
      <td>R$ ${p.preco.toFixed(2)}</td>
      <td>${p.qtd}</td>
      <td>
        <button onclick="editProduto('${p.id}')">✏️</button>
        <button onclick="deleteProduto('${p.id}')">❌</button>
      </td>`;
    listaProdutos.appendChild(tr);
  });
  saveData('produtos', produtos);
}

formProduto.addEventListener('submit', e => {
  e.preventDefault();
  const nome = document.getElementById('nomeProd').value;
  const preco = parseFloat(document.getElementById('precoProd').value);
  const qtd = parseInt(document.getElementById('qtdProd').value, 10);
  const file = document.getElementById('fotoProd').files[0];

  const processData = fotoData => {
    if (editProdutoId) {
      produtos = produtos.map(p => p.id === editProdutoId
        ? { ...p, nome, preco, qtd, foto: fotoData }
        : p
      );
      editProdutoId = null;
      document.getElementById('btnSalvarProduto').textContent = 'Adicionar Produto';
    } else {
      produtos.push({ id: generateID(), nome, preco, qtd, foto: fotoData });
    }
    formProduto.reset();
    renderProdutos();
  };

  if (file) {
    const reader = new FileReader();
    reader.onload = () => processData(reader.result);
    reader.readAsDataURL(file);
  } else {
    processData(null);
  }
});

function editProduto(id) {
  const p = produtos.find(p => p.id === id);
  document.getElementById('nomeProd').value = p.nome;
  document.getElementById('precoProd').value = p.preco;
  document.getElementById('qtdProd').value = p.qtd;
  editProdutoId = id;
  document.getElementById('btnSalvarProduto').textContent = 'Atualizar Produto';
}

function deleteProduto(id) {
  produtos = produtos.filter(p => p.id !== id);
  renderProdutos();
}

renderProdutos();
