const API_BASE = window.location.origin + '/api';

async function apiFetch(path, options = {}) {
  const token = localStorage.getItem('token');

  const respuesta = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...(options.headers || {})
    }
  });

  if (respuesta.status === 401 || respuesta.status === 403) {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    window.location.href = 'index.html';
    return;
  }

  const datos = await respuesta.json();
  return { ok: respuesta.ok, status: respuesta.status, datos };
}