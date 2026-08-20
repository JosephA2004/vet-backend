let mascotaEditandoId = null;

async function renderMascotas() {
  const contenido = document.getElementById('contenido');
  contenido.innerHTML = `
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h4>Mascotas</h4>
      <button class="btn btn-success" onclick="abrirModalMascota()">+ Nueva mascota</button>
    </div>
    <div class="table-responsive">
      <table class="table table-hover bg-white shadow-sm rounded">
        <thead class="table-light">
          <tr><th>Nombre</th><th>Dueño</th><th>Especie</th><th>Raza</th><th>Sexo</th><th>Peso</th><th>Acciones</th></tr>
        </thead>
        <tbody id="tabla-mascotas"><tr><td colspan="7" class="text-center text-muted">Cargando...</td></tr></tbody>
      </table>
    </div>

    <div class="modal fade" id="modalMascota" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="modalMascotaTitulo">Nueva mascota</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <form id="form-mascota">
              <div class="mb-3">
                <label class="form-label">Nombre</label>
                <input type="text" class="form-control" id="m-nombre" required>
              </div>
              <div class="mb-3">
                <label class="form-label">Dueño (cliente)</label>
                <select class="form-select" id="m-cliente" required></select>
              </div>
              <div class="row">
                <div class="col mb-3">
                  <label class="form-label">Especie</label>
                  <select class="form-select" id="m-especie" required></select>
                </div>
                <div class="col mb-3">
                  <label class="form-label">Raza</label>
                  <select class="form-select" id="m-raza"><option value="">-</option></select>
                </div>
              </div>
              <div class="row">
                <div class="col mb-3">
                  <label class="form-label">Sexo</label>
                  <select class="form-select" id="m-sexo">
                    <option value="">-</option>
                    <option value="macho">Macho</option>
                    <option value="hembra">Hembra</option>
                  </select>
                </div>
                <div class="col mb-3">
                  <label class="form-label">Peso (kg)</label>
                  <input type="number" step="0.01" class="form-control" id="m-peso">
                </div>
              </div>
              <div class="mb-3">
                <label class="form-label">Fecha de nacimiento</label>
                <input type="date" class="form-control" id="m-fecha">
              </div>
              <div id="mascota-error" class="alert alert-danger d-none"></div>
              <button type="submit" class="btn btn-success w-100">Guardar</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  `;

  document.getElementById('form-mascota').addEventListener('submit', guardarMascota);
  document.getElementById('m-especie').addEventListener('change', (e) => cargarRazas(e.target.value));

  await cargarSelectClientes();
  await cargarSelectEspecies();
  cargarMascotas();
}

async function cargarMascotas() {
  const resultado = await apiFetch('/mascotas');
  const tabla = document.getElementById('tabla-mascotas');
  if (!resultado.ok) {
    tabla.innerHTML = `<tr><td colspan="7" class="text-danger text-center">Error al cargar mascotas</td></tr>`;
    return;
  }
  const mascotas = resultado.datos;
  if (mascotas.length === 0) {
    tabla.innerHTML = `<tr><td colspan="7" class="text-center text-muted">No hay mascotas registradas</td></tr>`;
    return;
  }
  tabla.innerHTML = mascotas.map(m => `
    <tr>
      <td>${m.nombre}</td>
      <td>${m.cliente_nombre}</td>
      <td>${m.especie_nombre}</td>
      <td>${m.raza_nombre || '-'}</td>
      <td>${m.sexo || '-'}</td>
      <td>${m.peso || '-'}</td>
      <td>
        <button class="btn btn-sm btn-outline-secondary" onclick='editarMascota(${JSON.stringify(m)})'>Editar</button>
        <button class="btn btn-sm btn-outline-danger" onclick="eliminarMascota(${m.id})">Eliminar</button>
      </td>
    </tr>
  `).join('');
}

async function cargarSelectClientes() {
  const resultado = await apiFetch('/clientes');
  const select = document.getElementById('m-cliente');
  if (!resultado.ok) return;
  select.innerHTML = resultado.datos.map(c => `<option value="${c.id}">${c.nombre}</option>`).join('');
}

async function cargarSelectEspecies() {
  const resultado = await apiFetch('/especies');
  const select = document.getElementById('m-especie');
  if (!resultado.ok) return;
  select.innerHTML = resultado.datos.map(e => `<option value="${e.id}">${e.nombre}</option>`).join('');
  cargarRazas(select.value);
}

async function cargarRazas(especieId, razaSeleccionada = '') {
  const resultado = await apiFetch(`/razas?especie_id=${especieId}`);
  const select = document.getElementById('m-raza');
  if (!resultado.ok) return;
  select.innerHTML = '<option value="">-</option>' + resultado.datos.map(r =>
    `<option value="${r.id}" ${r.id == razaSeleccionada ? 'selected' : ''}>${r.nombre}</option>`
  ).join('');
}

function abrirModalMascota() {
  mascotaEditandoId = null;
  document.getElementById('modalMascotaTitulo').textContent = 'Nueva mascota';
  document.getElementById('form-mascota').reset();
  document.getElementById('mascota-error').classList.add('d-none');
  cargarRazas(document.getElementById('m-especie').value);
  new bootstrap.Modal(document.getElementById('modalMascota')).show();
}

async function editarMascota(mascota) {
  mascotaEditandoId = mascota.id;
  document.getElementById('modalMascotaTitulo').textContent = 'Editar mascota';
  document.getElementById('m-nombre').value = mascota.nombre;
  document.getElementById('m-cliente').value = mascota.cliente_id;
  document.getElementById('m-especie').value = mascota.especie_id;
  await cargarRazas(mascota.especie_id, mascota.raza_id);
  document.getElementById('m-sexo').value = mascota.sexo || '';
  document.getElementById('m-peso').value = mascota.peso || '';
  document.getElementById('m-fecha').value = mascota.fecha_nacimiento ? mascota.fecha_nacimiento.split('T')[0] : '';
  document.getElementById('mascota-error').classList.add('d-none');
  new bootstrap.Modal(document.getElementById('modalMascota')).show();
}

async function guardarMascota(e) {
  e.preventDefault();
  const cuerpo = {
    cliente_id: document.getElementById('m-cliente').value,
    nombre: document.getElementById('m-nombre').value,
    especie_id: document.getElementById('m-especie').value,
    raza_id: document.getElementById('m-raza').value || null,
    sexo: document.getElementById('m-sexo').value || null,
    peso: document.getElementById('m-peso').value || null,
    fecha_nacimiento: document.getElementById('m-fecha').value || null
  };

  const errorDiv = document.getElementById('mascota-error');
  errorDiv.classList.add('d-none');

  const metodo = mascotaEditandoId ? 'PUT' : 'POST';
  const ruta = mascotaEditandoId ? `/mascotas/${mascotaEditandoId}` : '/mascotas';
  const resultado = await apiFetch(ruta, { method: metodo, body: JSON.stringify(cuerpo) });

  if (!resultado.ok) {
    errorDiv.textContent = resultado.datos.error || 'Ocurrió un error';
    errorDiv.classList.remove('d-none');
    return;
  }

  bootstrap.Modal.getInstance(document.getElementById('modalMascota')).hide();
  cargarMascotas();
}

async function eliminarMascota(id) {
  if (!confirm('¿Seguro que quieres eliminar esta mascota?')) return;
  const resultado = await apiFetch(`/mascotas/${id}`, { method: 'DELETE' });
  if (!resultado.ok) {
    alert(resultado.datos.error || 'No se pudo eliminar');
    return;
  }
  cargarMascotas();
}