const formCliente    = document.getElementById('formCliente');
const listaClientes  = document.getElementById('listaClientes');

// Carrega do LocalStorage ou inicia vazio
let clientes      = getData('clientes');
let editClienteId = null;

/**
 * Renderiza a tabela de clientes
 */
function renderClientes() {
  listaClientes.innerHTML = '';
  clientes.forEach(c => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${c.nome}</td>
      <td>${c.cpf}</td>
      <td>${c.endereco}</td>
      <td>${c.contato}</td>
      <td>
        <button onclick="editCliente('${c.id}')">✏️</button>
        <button onclick="deleteCliente('${c.id}')">❌</button>
      </td>`;
    listaClientes.appendChild(tr);
  });
  saveData('clientes', clientes);
}

// Ao submeter o form: cria ou atualiza cliente
formCliente.addEventListener('submit', e => {
  e.preventDefault();
  const nome     = document.getElementById('nome').value.trim();
  const cpf      = document.getElementById('cpf').value.trim();
  const endereco = document.getElementById('endereco').value.trim();
  const contato  = document.getElementById('contato').value.trim();

  if (editClienteId) {
    // Atualiza existente
    clientes = clientes.map(c =>
      c.id === editClienteId
        ? { ...c, nome, cpf, endereco, contato }
        : c
    );
    editClienteId = null;
    document.getElementById('btnSalvarCliente').textContent = 'Adicionar Cliente';
  } else {
    // Cria novo
    clientes.push({ id: generateID(), nome, cpf, endereco, contato });
  }

  formCliente.reset();
  renderClientes();
});

/** Preenche o form para edição */
function editCliente(id) {
  const c = clientes.find(c => c.id === id);
  if (!c) return;
  document.getElementById('nome').value     = c.nome;
  document.getElementById('cpf').value      = c.cpf;
  document.getElementById('endereco').value = c.endereco;
  document.getElementById('contato').value  = c.contato;
  editClienteId = id;
  document.getElementById('btnSalvarCliente').textContent = 'Atualizar Cliente';
}

/** Deleta um cliente */
function deleteCliente(id) {
  clientes = clientes.filter(c => c.id !== id);
  renderClientes();
}

// Inicializa tabela
renderClientes();
