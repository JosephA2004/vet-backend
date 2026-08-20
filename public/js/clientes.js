let clienteEditandoId = null;

async function renderClientes() {
  const contenido = document.getElementById('contenido');
  contenido.innerHTML = `
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h4>Clientes</h4>
      <button class="btn btn-success" onclick="abrirModalCliente()">+ Nuevo cliente</button>
    </div>
    <div class="table-responsive">
      <table class="table table-hover bg-white shadow-sm rounded">
        <thead class="table-light">
          <tr>
            <th>Nombre</th><th>Teléfono</th><th>Email</th><th>Dirección</th><th>Acciones</th>
          </tr>
        </thead>
        <tbody id="tabla-clientes">
          <tr><td colspan="5" class="text-center text-muted">Cargando...</td></tr>
        </tbody>
      </table>
    </div>

    <div class="modal fade" id="modalCliente" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="modalClienteTitulo">Nuevo cliente</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <form id="form-cliente">
              <div class="mb-3">
                <label class="form-label">Nombre</label>
                <input type="text" class="form-control" id="c-nombre" required>
              </div>
              <div class="mb-3">
                <label class="form-label">Teléfono</label>
                <input type="text" class="form-control" id="c-telefono">
              </div>
              <div class="mb-3">
                <label class="form-label">Email</label>
                <input type="email" class="form-control" id="c-email">
              </div>
              <div class="mb-3">
                <label class="form-label">Dirección</label>
                <input type="text" class="form-control" id="c-direccion">
              </div>
              <div id="cliente-error" class="alert alert-danger d-none"></div>
              <button type="submit" class="btn btn-success w-100">Guardar</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  `;

  document.getElementById('form-cliente').addEventListener('submit', guardarCliente);
  cargarClientes();
}

async function cargarClientes() {
  const resultado = await apiFetch('/clientes');
  const tabla = document.getElementById('tabla-clientes');

  if (!resultado.ok) {
    tabla.innerHTML = `<tr><td colspan="5" class="text-danger text-center">Error al cargar clientes</td></tr>`;
    return;
  }

  const clientes = resultado.datos;

  if (clientes.length === 0) {
    tabla.innerHTML = `<tr><td colspan="5" class="text-center text-muted">No hay clientes registrados</td></tr>`;
    return;
  }

  tabla.innerHTML = clientes.map(c => `
    <tr>
      <td>${c.nombre}</td>
      <td>${c.telefono || '-'}</td>
      <td>${c.email || '-'}</td>
      <td>${c.direccion || '-'}</td>
      <td>
        <button class="btn btn-sm btn-outline-secondary" onclick='editarCliente(${JSON.stringify(c)})'>Editar</button>
        <button class="btn btn-sm btn-outline-danger" onclick="eliminarCliente(${c.id})">Eliminar</button>
      </td>
    </tr>
  `).join('');
}

function abrirModalCliente() {
  clienteEditandoId = null;
  document.getElementById('modalClienteTitulo').textContent = 'Nuevo cliente';
  document.getElementById('form-cliente').reset();
  document.getElementById('cliente-error').classList.add('d-none');
  new bootstrap.Modal(document.getElementById('modalCliente')).show();
}

function editarCliente(cliente) {
  clienteEditandoId = cliente.id;
  document.getElementById('modalClienteTitulo').textContent = 'Editar cliente';
  document.getElementById('c-nombre').value = cliente.nombre;
  document.getElementById('c-telefono').value = cliente.telefono || '';
  document.getElementById('c-email').value = cliente.email || '';
  document.getElementById('c-direccion').value = cliente.direccion || '';
  document.getElementById('cliente-error').classList.add('d-none');
  new bootstrap.Modal(document.getElementById('modalCliente')).show();
}

async function guardarCliente(e) {
  e.preventDefault();

  const cuerpo = {
    nombre: document.getElementById('c-nombre').value,
    telefono: document.getElementById('c-telefono').value,
    email: document.getElementById('c-email').value,
    direccion: document.getElementById('c-direccion').value
  };

  const errorDiv = document.getElementById('cliente-error');
  errorDiv.classList.add('d-none');

  const metodo = clienteEditandoId ? 'PUT' : 'POST';
  const ruta = clienteEditandoId ? `/clientes/${clienteEditandoId}` : '/clientes';

  const resultado = await apiFetch(ruta, { method: metodo, body: JSON.stringify(cuerpo) });

  if (!resultado.ok) {
    errorDiv.textContent = resultado.datos.error || 'Ocurrió un error';
    errorDiv.classList.remove('d-none');
    return;
  }

  bootstrap.Modal.getInstance(document.getElementById('modalCliente')).hide();
  cargarClientes();
}

async function eliminarCliente(id) {
  if (!confirm('¿Seguro que quieres eliminar este cliente? Esto también eliminará sus mascotas asociadas.')) return;

  const resultado = await apiFetch(`/clientes/${id}`, { method: 'DELETE' });
  if (!resultado.ok) {
    alert(resultado.datos.error || 'No se pudo eliminar');
    return;
  }
  cargarClientes();
}