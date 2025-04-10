const formCliente = document.getElementById('formCliente');
const listaClientes = document.getElementById('listaClientes');
let clientes = getData('clientes');
let editClienteId = null;

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

formCliente.addEventListener('submit', e => {
  e.preventDefault();
  const nome = document.getElementById('nome').value;
  const cpf = document.getElementById('cpf').value;
  const endereco = document.getElementById('endereco').value;
  const contato = document.getElementById('contato').value;
  if (editClienteId) {
    clientes = clientes.map(c => c.id === editClienteId
      ? { ...c, nome, cpf, endereco, contato }
      : c
    );
    editClienteId = null;
    document.getElementById('btnSalvarCliente').textContent = 'Adicionar Cliente';
  } else {
    clientes.push({ id: generateID(), nome, cpf, endereco, contato });
  }
  formCliente.reset();
  renderClientes();
});

function editCliente(id) {
  const c = clientes.find(c => c.id === id);
  document.getElementById('nome').value = c.nome;
  document.getElementById('cpf').value = c.cpf;
  document.getElementById('endereco').value = c.endereco;
  document.getElementById('contato').value = c.contato;
  editClienteId = id;
  document.getElementById('btnSalvarCliente').textContent = 'Atualizar Cliente';
}

function deleteCliente(id) {
  clientes = clientes.filter(c => c.id !== id);
  renderClientes();
}

renderClientes();
