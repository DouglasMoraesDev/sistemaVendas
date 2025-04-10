function renderHistorico() {
    const clientesH = getData('clientes');
    const produtosH = getData('produtos');
    const vendasH = getData('vendas');
    const histDiv = document.getElementById('listaHistorico');
    histDiv.innerHTML = '';
  
    vendasH.forEach(v => {
      const cli = clientesH.find(c => c.id === v.cliente);
      const prod = produtosH.find(p => p.id === v.produto);
      if (!cli || !prod) return; // evita erros se não achar
  
      const card = document.createElement('div');
      card.className = 'card';
      card.innerHTML = `
        <h3>${cli.nome}</h3>
        <p><strong>Produto:</strong> ${prod.nome}</p>
        <img src="${prod.foto||'https://via.placeholder.com/100'}" class="produto">
        <p><strong>Qtd:</strong> ${v.qtd}</p>
        <p><strong>Total:</strong> R$ ${(prod.preco*v.qtd).toFixed(2)}</p>
        <p><strong>Entrada:</strong> R$ ${v.entrada.toFixed(2)}</p>
        <p><strong>Parcelas:</strong> ${v.parcelas}</p>
        <p><strong>Valor Parcela:</strong> R$ ${((prod.preco*v.qtd - v.entrada)/v.parcelas).toFixed(2)}</p>
        <p><strong>Data:</strong> ${v.data}</p>
        <p><strong>Obs:</strong> ${v.obs||'-'}</p>
        <button onclick="editVenda('${v.id}')">✏️ Editar</button>
        <button onclick="deleteVenda('${v.id}')">❌ Deletar</button>`;
      histDiv.appendChild(card);
    });
  }
  
  renderHistorico();
  