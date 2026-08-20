let citaEditandoId = null;

async function renderCitas() {
  const contenido = document.getElementById('contenido');
  contenido.innerHTML = `
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h4>Citas</h4>
      <button class="btn btn-success" onclick="abrirModalCita()">+ Nueva cita</button>
    </div>
    <div class="table-responsive">
      <table class="table table-hover bg-white shadow-sm rounded">
        <thead class="table-light">
          <tr><th>Mascota</th><th>Veterinario</th><th>Fecha</th><th>Hora</th><th>Motivo</th><th>Estado</th><th>Acciones</th></tr>
        </thead>
        <tbody id="tabla-citas"><tr><td colspan="7" class="text-center text-muted">Cargando...</td></tr></tbody>
      </table>
    </div>

    <div class="modal fade" id="modalCita" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="modalCitaTitulo">Nueva cita</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <form id="form-cita">
              <div class="mb-3">
                <label class="form-label">Mascota</label>
                <select class="form-select" id="ci-mascota" required></select>
              </div>
              <div class="mb-3">
                <label class="form-label">Veterinario</label>
                <select class="form-select" id="ci-veterinario" required></select>
              </div>
              <div class="row">
                <div class="col mb-3">
                  <label class="form-label">Fecha</label>
                  <input type="date" class="form-control" id="ci-fecha" required>
                </div>
                <div class="col mb-3">
                  <label class="form-label">Hora</label>
                  <input type="time" class="form-control" id="ci-hora" required>
                </div>
              </div>
              <div class="mb-3">
                <label class="form-label">Motivo</label>
                <input type="text" class="form-control" id="ci-motivo">
              </div>
              <div class="mb-3">
                <label class="form-label">Estado</label>
                <select class="form-select" id="ci-estado">
                  <option value="pendiente">Pendiente</option>
                  <option value="confirmada">Confirmada</option>
                  <option value="completada">Completada</option>
                  <option value="cancelada">Cancelada</option>
                </select>
              </div>
              <div id="cita-error" class="alert alert-danger d-none"></div>
              <button type="submit" class="btn btn-success w-100">Guardar</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  `;

  document.getElementById('form-cita').addEventListener('submit', guardarCita);
  await cargarSelectMascotasCitas();
  await cargarSelectVeterinarios();
  cargarCitas();
}

async function cargarCitas() {
  const resultado = await apiFetch('/citas');
  const tabla = document.getElementById('tabla-citas');
  if (!resultado.ok) {
    tabla.innerHTML = `<tr><td colspan="7" class="text-danger text-center">Error al cargar citas</td></tr>`;
    return;
  }
  const citas = resultado.datos;
  if (citas.length === 0) {
    tabla.innerHTML = `<tr><td colspan="7" class="text-center text-muted">No hay citas registradas</td></tr>`;
    return;
  }
  tabla.innerHTML = citas.map(c => `
    <tr>
      <td>${c.mascota_nombre}</td>
      <td>${c.veterinario_nombre}</td>
      <td>${c.fecha.split('T')[0]}</td>
      <td>${c.hora}</td>
      <td>${c.motivo || '-'}</td>
      <td><span class="badge bg-${badgeColor(c.estado)}">${c.estado}</span></td>
      <td>
        <button class="btn btn-sm btn-outline-secondary" onclick='editarCita(${JSON.stringify(c)})'>Editar</button>
        <button class="btn btn-sm btn-outline-danger" onclick="eliminarCita(${c.id})">Eliminar</button>
      </td>
    </tr>
  `).join('');
}

function badgeColor(estado) {
  return { pendiente: 'warning', confirmada: 'primary', completada: 'success', cancelada: 'secondary' }[estado] || 'secondary';
}

async function cargarSelectMascotasCitas() {
  const resultado = await apiFetch('/mascotas');
  const select = document.getElementById('ci-mascota');
  if (!resultado.ok) return;
  select.innerHTML = resultado.datos.map(m => `<option value="${m.id}">${m.nombre} (${m.cliente_nombre})</option>`).join('');
}

async function cargarSelectVeterinarios() {
  const resultado = await apiFetch('/veterinarios');
  const select = document.getElementById('ci-veterinario');
  if (!resultado.ok) return;
  select.innerHTML = resultado.datos.map(v => `<option value="${v.id}">${v.nombre}</option>`).join('');
}

function abrirModalCita() {
  citaEditandoId = null;
  document.getElementById('modalCitaTitulo').textContent = 'Nueva cita';
  document.getElementById('form-cita').reset();
  document.getElementById('cita-error').classList.add('d-none');
  new bootstrap.Modal(document.getElementById('modalCita')).show();
}

function editarCita(cita) {
  citaEditandoId = cita.id;
  document.getElementById('modalCitaTitulo').textContent = 'Editar cita';
  document.getElementById('ci-mascota').value = cita.mascota_id;
  document.getElementById('ci-veterinario').value = cita.veterinario_id;
  document.getElementById('ci-fecha').value = cita.fecha.split('T')[0];
  document.getElementById('ci-hora').value = cita.hora;
  document.getElementById('ci-motivo').value = cita.motivo || '';
  document.getElementById('ci-estado').value = cita.estado;
  document.getElementById('cita-error').classList.add('d-none');
  new bootstrap.Modal(document.getElementById('modalCita')).show();
}

async function guardarCita(e) {
  e.preventDefault();
  const cuerpo = {
    mascota_id: document.getElementById('ci-mascota').value,
    veterinario_id: document.getElementById('ci-veterinario').value,
    fecha: document.getElementById('ci-fecha').value,
    hora: document.getElementById('ci-hora').value,
    motivo: document.getElementById('ci-motivo').value,
    estado: document.getElementById('ci-estado').value
  };

  const errorDiv = document.getElementById('cita-error');
  errorDiv.classList.add('d-none');

  const metodo = citaEditandoId ? 'PUT' : 'POST';
  const ruta = citaEditandoId ? `/citas/${citaEditandoId}` : '/citas';
  const resultado = await apiFetch(ruta, { method: metodo, body: JSON.stringify(cuerpo) });

  if (!resultado.ok) {
    errorDiv.textContent = resultado.datos.error || 'Ocurrió un error';
    errorDiv.classList.remove('d-none');
    return;
  }

  bootstrap.Modal.getInstance(document.getElementById('modalCita')).hide();
  cargarCitas();
}

async function eliminarCita(id) {
  if (!confirm('¿Seguro que quieres eliminar esta cita?')) return;
  const resultado = await apiFetch(`/citas/${id}`, { method: 'DELETE' });
  if (!resultado.ok) {
    alert(resultado.datos.error || 'No se pudo eliminar');
    return;
  }
  cargarCitas();
}