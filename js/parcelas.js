const { jsPDF } = window.jspdf;

const listaParcelasDiv = document.getElementById('listaParcelas');
const searchInput      = document.getElementById('searchCliente');

function carregarParcelas() {
  const clientes = getData('clientes');
  const produtos = getData('produtos');
  let vendasList = getData('vendas');

  // filtra vendas parceladas que ainda têm parcelas a pagar
  vendasList = vendasList.filter(v =>
    v.parcelas > 1 && (v.paidInstallments || 0) < v.parcelas
  );

  // filtro por nome do cliente
  const termo = searchInput.value.toLowerCase();
  if (termo) {
    vendasList = vendasList.filter(v => {
      const cli = clientes.find(c => c.id === v.cliente);
      return cli && cli.nome.toLowerCase().includes(termo);
    });
  }

  listaParcelasDiv.innerHTML = '';
  vendasList.forEach(v => {
    const cli = clientes.find(c => c.id === v.cliente);
    const prod = produtos.find(p => p.id === v.produto);
    if (!cli || !prod) return;

    const parcelaValorNum = (prod.preco * v.qtd - v.entrada) / v.parcelas;
    const parcelaValorStr = parcelaValorNum.toLocaleString('pt-BR', {
      style: 'currency', currency: 'BRL'
    });
    const pagas = v.paidInstallments || 0;
    const restante = v.parcelas - pagas;

    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <h3>${cli.nome}</h3>
      <p><strong>Produto:</strong> ${prod.nome}</p>
      <p><strong>Valor Parcela:</strong> ${parcelaValorStr}</p>
      <p><strong>Restam:</strong> ${pagas} / ${v.parcelas}</p>
      <button class="btn-pagar">Registrar Parcela</button>
      <button class="btn-pdf">Gerar comprovante</button>
    `;

    // Registrar Parcela com comprovante
    card.querySelector('.btn-pagar').onclick = () => {
      const inp = document.createElement('input');
      inp.type = 'file';
      inp.accept = 'image/*';
      inp.onchange = e => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
          const vendas = getData('vendas');
          const index = vendas.findIndex(x => x.id === v.id);
          if (index === -1) return;

          // Atualiza proofs e parcelas pagas
          vendas[index].proofs = vendas[index].proofs || [];
          vendas[index].proofs.push(reader.result);
          vendas[index].paidInstallments = (vendas[index].paidInstallments || 0) + 1;

          // Salva no localStorage
          saveData('vendas', vendas);

          // Atualiza a interface
          carregarParcelas();
        };
        reader.readAsDataURL(file);
      };
      inp.click();
    };

    // Gerar comprovante PDF
    card.querySelector('.btn-pdf').onclick = () => gerarPDF(cli, prod, v, parcelaValorStr);

    listaParcelasDiv.appendChild(card);
  });
}

function gerarPDF(cli, prod, venda, valorParcelaStr) {
  const doc = new jsPDF();

  const dataAtual = new Date().toLocaleDateString('pt-BR');
  const entradaStr = venda.entrada.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  const nomeCliente = cli.nome;
  const nomeProduto = prod.nome;
  const parcelas = `${venda.paidInstallments || 0} / ${venda.parcelas}`;
  const dataVenda = venda.data;
  const obs = venda.obs || '-';

  doc.setFont('Times', 'Normal');
  doc.setFontSize(16);
  doc.text('RECIBO DE PAGAMENTO', 105, 20, null, null, 'center');

  doc.setFontSize(12);
  let y = 40;

  doc.text(`Eu, Diego de Moraes Abilio, declaro que recebi de ${nomeCliente} o valor de ${valorParcelaStr},`, 20, y); y += 10;
  doc.text(`referente à parcela ${parcelas} do produto ${nomeProduto}, vendido em ${dataVenda}.`, 20, y); y += 10;
  doc.text(`Forma de pagamento: entrada de ${entradaStr} e saldo parcelado.`, 20, y); y += 10;
  doc.text(``, 20, y); y += 10;
  doc.text(`Observações: ${obs}`, 20, y); y += 20;
  doc.text(`Data: ${dataAtual}`, 20, y); y += 20;
  doc.text('Assinatura: _________________________________________', 20, y); y += 10;

  const nomeArquivo = `recibo_${nomeCliente.replace(/\s+/g, '_')}_${Date.now()}.pdf`;
  doc.save(nomeArquivo);
}

// Inicializa
searchInput.addEventListener('input', carregarParcelas);
document.addEventListener('DOMContentLoaded', carregarParcelas);
