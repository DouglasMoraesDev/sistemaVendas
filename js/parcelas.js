// js/parcelas.js

const { jsPDF } = window.jspdf;
const listaParcelasDiv = document.getElementById('listaParcelas');
const searchInput      = document.getElementById('searchCliente');

// --- Lê as vendas UMA VEZ em memória ---
let vendas = getData('vendas') || [];

/**
 * Exibe somente as vendas parceladas com parcelas pendentes
 */
function carregarParcelas() {
  // Recarrega do storage para refletir qualquer mudança externa
  vendas = getData('vendas') || [];
  const clientes = getData('clientes');
  const produtos = getData('produtos');

  // Filtra só vendas com parcelas > 1 e ainda não quitadas
  const pendentes = vendas.filter(v =>
    v.parcelas > 1 && (v.paidInstallments || 0) < v.parcelas
  );

  // Busca por nome de cliente (opcional)
  const termo = searchInput.value.toLowerCase();
  const lista = termo
    ? pendentes.filter(v => {
        const cli = clientes.find(c => c.id === v.cliente);
        return cli && cli.nome.toLowerCase().includes(termo);
      })
    : pendentes;

  listaParcelasDiv.innerHTML = '';
  lista.forEach(v => {
    const cli  = clientes.find(c => c.id === v.cliente);
    const prod = produtos.find(p => p.id === v.produto);
    if (!cli || !prod) return;

    // Cálculo do valor da parcela e restante
    const valorNum   = (prod.preco * v.qtd - v.entrada) / v.parcelas;
    const valorStr   = valorNum.toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
    const restante   = v.parcelas - (v.paidInstallments || 0);

    // Monta o card
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <h3>${cli.nome}</h3>
      <p><strong>Produto:</strong> ${prod.nome}</p>
      <p><strong>Valor Parcela:</strong> ${valorStr}</p>
      <p><strong>Restam:</strong> ${restante} / ${v.parcelas}</p>
      <button class="btn-pagar">Registrar Comprovante</button>
      <button class="btn-pdf">Gerar Recibo</button>
    `;

    // Ao clicar em "Registrar Comprovante"
    card.querySelector('.btn-pagar').onclick = () => {
      const inp = document.createElement('input');
      inp.type = 'file';
      inp.accept = 'image/*';
      inp.onchange = e => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
          // Adiciona o comprovante e incrementa contador
          v.proofs = v.proofs || [];
          v.proofs.push(reader.result);
          v.paidInstallments = (v.paidInstallments || 0) + 1;

          // Salva de volta o array completo
          vendas = vendas.map(x => x.id === v.id ? v : x);
          saveData('vendas', vendas);

          // Re-renderiza a lista
          carregarParcelas();
        };
        reader.readAsDataURL(file);
      };
      inp.click();
    };

    // Ao clicar em "Gerar Recibo"
    card.querySelector('.btn-pdf').onclick = () => {
      gerarPDF(cli, prod, v, valorStr);
    };

    listaParcelasDiv.appendChild(card);
  });
}


/**
 * Gera um recibo estilizado em PDF
 */
function gerarPDF(cli, prod, venda, valorParcelaStr) {
  const doc = new jsPDF();
  const dataAtual   = new Date().toLocaleDateString('pt-BR');
  const entradaStr  = venda.entrada.toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
  const totalVenda  = (prod.preco * venda.qtd)
                        .toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
  const parcelasTxt = `${venda.paidInstallments} / ${venda.parcelas}`;
  const obs         = venda.obs || '-';

  // Cabeçalho
  doc.setFontSize(16);
  doc.text('RECIBO DE PAGAMENTO', 105, 20, null, null, 'center');

  // Corpo do recibo
  doc.setFontSize(12);
  let y = 40;
  doc.text(`Recebi de ${cli.nome} a quantia de ${valorParcelaStr},`, 20, y); y += 10;
  doc.text(`referente à parcela ${parcelasTxt} do produto ${prod.nome},`, 20, y); y += 10;
  doc.text(`venda realizada em ${venda.data}.`, 20, y); y += 10;
  doc.text(`Entrada: ${entradaStr} | Total da Venda: ${totalVenda}`, 20, y); y += 10;
  doc.text(`Observações: ${obs}`, 20, y); y += 20;
  doc.text(`Local e Data: ___________________  ${dataAtual}`, 20, y); y += 20;
  doc.text('Assinatura do Vendedor: __________________________', 20, y);

  // Download
  const nomeArquivo = `recibo_${cli.nome.replace(/\s+/g,'_')}_${Date.now()}.pdf`;
  doc.save(nomeArquivo);
}

// Dispara o carregamento inicial e o filtro de busca
searchInput.addEventListener('input', carregarParcelas);
document.addEventListener('DOMContentLoaded', carregarParcelas);