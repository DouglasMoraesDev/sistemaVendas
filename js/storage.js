// Lê um array do LocalStorage; se não existir, retorna []
function getData(key) {
  return JSON.parse(localStorage.getItem(key) || '[]');
}

// Grava um array no LocalStorage
function saveData(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

// Gera um ID único (string) para novos registros
function generateID() {
  return '_' + Math.random().toString(36).substr(2, 9);
}
