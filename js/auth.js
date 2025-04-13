// Usuário padrão (pode depois vir de um array ou API)
const userDefault = { user: 'Diego', pass: '1234', user: 'admin', pass: 'admin' };

document.getElementById('btnLogin')?.addEventListener('click', () => {
  const u = document.getElementById('username').value;
  const p = document.getElementById('password').value;

  if (u === userDefault.user && p === userDefault.pass) {
    localStorage.setItem('logado', 'true');
    window.location = 'dashboard.html';
  } else {
    document.getElementById('erro-login').textContent = 'Usuário ou senha inválidos';
  }
});
