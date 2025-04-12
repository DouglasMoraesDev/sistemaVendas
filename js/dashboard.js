// js/dashboard.js

document.getElementById('logout').onclick = () => {
    localStorage.removeItem('logado');
    window.location = 'index.html';
  };
  
  document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('countClientes').textContent = getData('clientes').length;
    document.getElementById('countProdutos').textContent = getData('produtos').length;
    document.getElementById('countVendas').textContent   = getData('vendas').length;
  
    const notifyList = document.getElementById('notifyParcelas');
    const today = new Date().getDate();
    const clientes = getData('clientes');
    const vendas    = getData('vendas');
  
    const vencemHoje = vendas.filter(v =>
      (v.paidInstallments||0) < v.parcelas && v.dueDay === today
    );
  
    notifyList.innerHTML = '';
    if (vencemHoje.length === 0) {
      notifyList.innerHTML = '<li>Nenhuma parcela vence hoje.</li>';
    } else {
      vencemHoje.forEach(v => {
        const cli = clientes.find(c => c.id === v.cliente);
        const prox = (v.paidInstallments||0) + 1;
        const li = document.createElement('li');
        li.textContent = `${cli.nome}: Parcela ${prox}/${v.parcelas}`;
        notifyList.appendChild(li);
      });
    }
  });
  