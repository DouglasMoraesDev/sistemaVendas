// js/historico.js

/**
 * Renderiza o histórico de vendas em cards
 */
function renderHistorico() {
  const clientesH = getData('clientes');
  const produtosH = getData('produtos');
  const vendasH   = getData('vendas');
  const histDiv   = document.getElementById('listaHistorico');

  histDiv.innerHTML = '';
  vendasH.forEach(v => {
    const cli  = clientesH.find(c => c.id === v.cliente);
    const prod = produtosH.find(p => p.id === v.produto);
    if (!cli || !prod) return;

    const total       = prod.preco * v.qtd;
    const totalStr    = total.toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
    const entradaStr  = v.entrada.toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
    const parcelaVal  = ((total - v.entrada)/v.parcelas)
                          .toLocaleString('pt-BR',{style:'currency',currency:'BRL'});

    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <h3>${cli.nome}</h3>
      <p><strong>Produto:</strong> ${prod.nome}</p>
      <img src="${prod.foto||'https://via.placeholder.com/100'}" class="produto">
      <p><strong>Qtd:</strong> ${v.qtd}</p>
      <p><strong>Total:</strong> ${totalStr}</p>
      <p><strong>Entrada:</strong> ${entradaStr}</p>
      <p><strong>Parcelas:</strong> ${v.parcelas}</p>
      <p><strong>Valor Parcela:</strong> ${parcelaVal}</p>
      <p><strong>Data:</strong> ${v.data}</p>
      <p><strong>Obs:</strong> ${v.obs||'-'}</p>
      <!-- Agora redireciona para vendas.html?editId=... -->
      <button onclick="window.location.href='vendas.html?editId=${v.id}'">
        ✏️ Editar
      </button>
      <button onclick="deleteVenda('${v.id}')">❌ Deletar</button>`;

    histDiv.appendChild(card);
  });
}

// inicializa histórico
renderHistorico();
