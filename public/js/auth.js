const API_URL = window.location.origin;
const formLogin = document.getElementById('form-login');

if (formLogin) {
  formLogin.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const errorMsg = document.getElementById('error-msg');
    errorMsg.classList.add('d-none');

    try {
      const respuesta = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const datos = await respuesta.json();

      if (!respuesta.ok) {
        errorMsg.textContent = datos.error || 'No se pudo iniciar sesión';
        errorMsg.classList.remove('d-none');
        return;
      }

      localStorage.setItem('token', datos.token);
      localStorage.setItem('usuario', JSON.stringify(datos.usuario));
      window.location.href = 'dashboard.html';
    } catch (error) {
      errorMsg.textContent = 'No se pudo conectar con el servidor';
      errorMsg.classList.remove('d-none');
    }
  });
}