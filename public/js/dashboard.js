const token = localStorage.getItem('token');
const usuarioGuardado = localStorage.getItem('usuario');

if (!token || !usuarioGuardado) {
  window.location.href = 'index.html';
}

const usuario = JSON.parse(usuarioGuardado);
document.getElementById('nombre-usuario').textContent = `Hola, ${usuario.nombre}`;

document.getElementById('btn-logout').addEventListener('click', () => {
  localStorage.removeItem('token');
  localStorage.removeItem('usuario');
  window.location.href = 'index.html';
});

const botones = document.querySelectorAll('#tabs .nav-link');
const contenido = document.getElementById('contenido');

const renderPorTab = {
  clientes: renderClientes,
  mascotas: renderMascotas,
  citas: renderCitas,
};

botones.forEach(boton => {
  boton.addEventListener('click', () => {
    botones.forEach(b => b.classList.remove('active'));
    boton.classList.add('active');
    renderPorTab[boton.dataset.tab]();
  });
});

renderClientes();