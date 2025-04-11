// js/configuracoes.js

// Botões e elementos
const btnBackup    = document.getElementById('btnBackup');
const fileRestore  = document.getElementById('fileRestore');
const btnRestore   = document.getElementById('btnRestore');
const restoreStatus= document.getElementById('restoreStatus');

// Logout
document.getElementById('logout').onclick = () => {
  localStorage.removeItem('logado');
  window.location = 'index.html';
};

/**
 * Faz backup: coleta os arrays do LocalStorage,
 * monta um objeto e dispara o download de um .json
 */
btnBackup.addEventListener('click', () => {
  const data = {
    clientes: getData('clientes'),
    produtos: getData('produtos'),
    vendas:   getData('vendas')
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `backup_sistema_${new Date().toISOString().slice(0,10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
});

/**
 * Restaura dados: lê o arquivo JSON selecionado,
 * valida se tem as chaves esperadas e grava no LocalStorage.
 */
btnRestore.addEventListener('click', () => {
  const file = fileRestore.files[0];
  if (!file) {
    restoreStatus.textContent = 'Selecione um arquivo JSON.';
    return;
  }
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const obj = JSON.parse(reader.result);
      // valida estrutura mínima
      if (!obj.clientes || !obj.produtos || !obj.vendas) {
        restoreStatus.textContent = 'Arquivo JSON inválido.';
        return;
      }
      // salva cada array
      saveData('clientes', obj.clientes);
      saveData('produtos', obj.produtos);
      saveData('vendas', obj.vendas);
      restoreStatus.textContent = 'Restauração concluída com sucesso!';
      // opcional: recarregar página
      setTimeout(() => window.location.reload(), 1500);
    } catch (err) {
      console.error(err);
      restoreStatus.textContent = 'Erro ao ler o arquivo.';
    }
  };
  reader.readAsText(file);
});
