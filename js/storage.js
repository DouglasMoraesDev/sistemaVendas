function getData(key) {
    return JSON.parse(localStorage.getItem(key) || '[]');
  }
  function saveData(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
  }
  function generateID() {
    return '_' + Math.random().toString(36).substr(2, 9);
  }
  