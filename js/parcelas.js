// js/parcelas.js
const { jsPDF } = window.jspdf;

const listaParcelasDiv = document.getElementById('listaParcelas');
const searchInput      = document.getElementById('searchCliente');

/**
 * Carrega e exibe vendas com parcelas pendentes
 */
function carregarParcelas() {
  const clientes = getData('clientes');
  const produtos = getData('produtos');
  let vendasList = getData('vendas');

  // filtra apenas parceladas e com paidInstallments < parcelas
  vendasList = vendasList.filter(v =>
    v.parcelas > 1 && (v.paidInstallments || 0) < v.parcelas
  );

  // busca opcional
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
    const prod= produtos.find(p => p.id === v.produto);
    if (!cli || !prod) return;

    const parcelaValorNum = (prod.preco * v.qtd - v.entrada) / v.parcelas;
    const parcelaValorStr = parcelaValorNum.toLocaleString('pt-BR',{
      style:'currency', currency:'BRL'
    });
    const restante = v.parcelas - (v.paidInstallments||0);

    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <h3>${cli.nome}</h3>
      <p><strong>Produto:</strong> ${prod.nome}</p>
      <p><strong>Valor Parcela:</strong> ${parcelaValorStr}</p>
      <p><strong>Restam:</strong> ${restante} / ${v.parcelas}</p>
      <button class="btn-pagar">Registrar Parcela</button>
      <button class="btn-pdf">Gerar PDF</button>
    `;

    // Registrar Parcela com anexo de comprovante
    card.querySelector('.btn-pagar').onclick = () => {
      // solicita arquivo
      const inp = document.createElement('input');
      inp.type = 'file';
      inp.accept = 'image/*';
      inp.onchange = e => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
          // salva prova e incrementa parcela
          v.proofs = v.proofs || [];
          v.proofs.push(reader.result);
          v.paidInstallments = (v.paidInstallments||0) + 1;
          saveData('vendas',
            getData('vendas').map(x => x.id === v.id ? v : x)
          );
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

/**
 * Gera PDF de comprovante de parcela
 */
function gerarPDF(cli, prod, venda, valorParcelaStr) {
  const doc = new jsPDF();
  doc.setFontSize(16);
  doc.text('Comprovante de Parcela', 20, 20);
  doc.setFontSize(12);
  doc.text(`Cliente: ${cli.nome}`, 20, 40);
  doc.text(`Produto: ${prod.nome}`, 20, 50);
  doc.text(`Data da Venda: ${venda.data}`, 20, 60);
  doc.text(`Entrada: ${venda.entrada.toLocaleString('pt-BR',{style:'currency',currency:'BRL'})}`, 20, 70);
  doc.text(`Parcela: ${venda.paidInstallments} / ${venda.parcelas}`, 20, 80);
  doc.text(`Valor Parcela: ${valorParcelaStr}`, 20, 90);
  doc.text(`Obs: ${venda.obs||'-'}`, 20, 100);
  doc.save(`comprovante_${cli.nome.replace(/\s+/g,'_')}_${Date.now()}.pdf`);
}

searchInput.addEventListener('input', carregarParcelas);
document.addEventListener('DOMContentLoaded', carregarParcelas);