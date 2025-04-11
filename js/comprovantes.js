// js/comprovantes.js

/**
 * Renderiza todos os comprovantes anexados às vendas
 */
function renderComprovantes() {
    const clientes = getData('clientes');
    const produtos = getData('produtos');
    const vendas    = getData('vendas');
    const container = document.getElementById('listaComprovantes');
    container.innerHTML = '';
  
    vendas.forEach(v => {
      // só exibe vendas que têm proofs (array de Base64)
      if (!v.proofs || v.proofs.length === 0) return;
  
      const cli  = clientes.find(c => c.id === v.cliente);
      const prod = produtos.find(p => p.id === v.produto);
      const card = document.createElement('div');
      card.className = 'card comprovante-card';
  
      // cabeçalho com informações da venda
      card.innerHTML = `
        <h3>${cli ? cli.nome : 'Cliente Desconhecido'}</h3>
        <p><strong>Produto:</strong> ${prod ? prod.nome : '---'}</p>
        <p><strong>Data da Venda:</strong> ${v.data}</p>
        <p><strong>Entrada:</strong> ${v.entrada.toLocaleString('pt-BR',{style:'currency',currency:'BRL'})}</p>
        <p><strong>Parcelas:</strong> ${v.parcelas}</p>
        <p><strong>Pagas:</strong> ${v.paidInstallments || 0}</p>
        <div class="proofs-container"></div>
      `;
  
      // insere cada comprovante como <img>
      const proofsDiv = card.querySelector('.proofs-container');
      v.proofs.forEach((src, idx) => {
        const img = document.createElement('img');
        img.src = src;
        img.alt = `Comprovante ${idx+1}`;
        img.className = 'proof-img';
        proofsDiv.appendChild(img);
      });
  
      container.appendChild(card);
    });
  }
  
  // chama ao carregar a página
  document.addEventListener('DOMContentLoaded', () => {
    renderComprovantes();
    // logout
    document.getElementById('logout').onclick = () => {
      localStorage.removeItem('logado');
      window.location = 'index.html';
    };
  });
  