const LS_KEY = 'productos';

const clp = v => new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(v);

async function obtenerProductos() {
    const enLS = localStorage.getItem(LS_KEY);
    if (enLS) return JSON.parse(enLS);

    const resp = await fetch('./assets/data/productos.json');
    const base = await resp.json();

    const normalizados = base.map(p => ({
        ...p,
        categoria: p.categoria || 'Sin categoría',
        etiqueta: p.etiqueta || ''
    }));

    localStorage.setItem(LS_KEY, JSON.stringify(normalizados));
    return normalizados;
}

function guardarProductos(arr) {
    localStorage.setItem(LS_KEY, JSON.stringify(arr));
}

function pintarTabla(productos) {
    const tbody = document.getElementById('tbodyProductos');
    tbody.innerHTML = '';

    if (!productos.length) {
        tbody.innerHTML = `<tr><td colspan="7" class="text-center text-muted py-4">Sin productos</td></tr>`;
        return;
    }

    for (const p of productos) {
        const tr = document.createElement('tr');
        tr.innerHTML = `
                        <td>${p.id}</td>
                        <td>${p.nombre}</td>
                        <td class="text-truncate" style="max-width: 340px">${p.descripcion || ''}</td>
                        <td>${clp(p.precio)}</td>
                        <td>${p.categoria || ''}</td>
                        <td>${p.stock ?? 0}</td>
                        <td>
                            <div class="btn-group">
                            <a class="btn btn-sm btn-outline-primary" title="Editar" href="producto.html?id=${p.id}">
                                <i class="fa-solid fa-pen"></i>
                            </a>
                            <button class="btn btn-sm btn-outline-danger" title="Eliminar" data-id="${p.id}">
                                <i class="fa-solid fa-trash"></i>
                            </button>
                            </div>
                        </td>
                        `;
        tbody.appendChild(tr);
    }

    tbody.addEventListener('click', async (e) => {
        const btn = e.target.closest('button[data-id]');
        if (!btn) return;
        const id = Number(btn.dataset.id);

        if (confirm('¿Eliminar este producto?')) {
        let lista = await obtenerProductos();
        lista = lista.filter(p => p.id !== id);
        guardarProductos(lista);
        pintarTabla(lista);
        }
    }, { once: true });
}

(async function init() {
    const productos = await obtenerProductos();
    pintarTabla(productos);
})();
