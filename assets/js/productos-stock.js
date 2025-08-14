let productos = [];

window.productos = productos; // referencia global

// Función para formatear precios CLP
function formatearPrecio(precio) {
    return new Intl.NumberFormat('es-CL', {
        style: 'currency',
        currency: 'CLP'
    }).format(precio);
}

// Función para cargar productos desde un archivo JSON
async function cargarProductosDesdeJSON() {
    try {
        const container = document.getElementById('productosContainer');
        if (container) {
            container.innerHTML = `<div class="text-center p-5">
                <div class="spinner-border text-primary" role="status"></div>
                <p class="mt-3">Cargando productos...</p>
            </div>`;
        }

        const respuesta = await fetch('./assets/data/productos.json');
        if (!respuesta.ok) throw new Error('Error al cargar el archivo JSON');

        // Cargar datos y mantener la misma referencia de array global
        const data = await respuesta.json();
        productos.splice(0, productos.length, ...data);
        console.log("Productos cargados:", productos.length);

        cargarProductos(productos);
    } catch (error) {
        console.error("Error cargando productos:", error);
    }
}

// Función para renderizar productos en el DOM con mensajes de stock
function cargarProductos(productosAMostrar = productos) {
    const container = document.getElementById('productosContainer');
    if (!container) return;

    container.innerHTML = '';

    if (productosAMostrar.length === 0) {
        container.innerHTML = `
            <div class="col-12 text-center">
                <div class="alert alert-info">
                    <i class="fas fa-search"></i> No se encontraron productos con ese criterio.
                </div>
            </div>
        `;
        return;
    }

    productosAMostrar.forEach(producto => {
        let estadoStock = '';
        let disabled = '';

        if (producto.stock === 0) {
            estadoStock = '<span class="badge bg-danger">Agotado</span>';
            disabled = 'disabled';
        } else if (producto.stock === 1) {
            estadoStock = '<span class="badge bg-warning text-dark">¡Último producto!</span>';
        } else if (producto.stock < 4) {
            estadoStock = `<span class="badge bg-info text-dark">Stock: ${producto.stock}</span>`;
        }

        const col = document.createElement('div');
        col.className = 'col-md-4 mb-4';

        col.innerHTML = `
            <div class="card product-card h-100 shadow-sm">
                <img src="${producto.imagen}" class="card-img-top" alt="${producto.nombre}" 
                    style="height: 250px; object-fit: cover; background: #f8f9fa;">
                <div class="card-body d-flex flex-column">
                    <h5 class="card-title text-primary">${producto.nombre}</h5>
                    <p class="card-text text-muted">${producto.descripcion}</p>
                    <p>${estadoStock}</p>
                    <div class="mt-auto">
                        <p class="price mb-3 fw-bold text-success fs-5">${formatearPrecio(producto.precio)}</p>
                        <button class="btn btn-primary w-100 btn-lg" 
                                onclick="agregarAlCarrito(${producto.id})"
                                ${disabled}>
                            <i class="fas fa-cart-plus me-2"></i>Agregar al Carrito
                        </button>
                    </div>
                </div>
            </div>
        `;

        container.appendChild(col);
    });
}

// Función para filtrar productos
function filtrarProductos() {
    const texto = (document.getElementById('filtroProductos')?.value || '').toLowerCase();
    const categoria = (document.getElementById('filtroCategoria')?.value || '').toLowerCase();
    const precioMax = parseFloat(document.getElementById('filtroPrecio')?.value) || Infinity;

    const filtrados = productos.filter(p =>
        (p.nombre + p.descripcion + (p.categoria || '') + (p.etiqueta || ''))
            .toLowerCase()
            .includes(texto) &&
        (!categoria || (p.categoria || '').toLowerCase() === categoria) &&
        p.precio <= precioMax
    );

    cargarProductos(filtrados);
}

// Función para limpiar la búsqueda
function limpiarBusqueda() {
    const filtro = document.getElementById('filtroProductos');
    if (filtro) {
        filtro.value = '';
        cargarProductos(productos);
    }
}

// Inicialización al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    cargarProductosDesdeJSON();

    const filtroInput = document.getElementById('filtroProductos');
    if (filtroInput) {
        filtroInput.addEventListener('input', filtrarProductos);
        filtroInput.addEventListener('keyup', filtrarProductos);

        filtroInput.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                limpiarBusqueda();
            }
        });
    }
});

// Hacer funciones accesibles globalmente
window.cargarProductos = cargarProductos;
window.filtrarProductos = filtrarProductos;
window.limpiarBusqueda = limpiarBusqueda;
window.formatearPrecio = formatearPrecio;
window.productos = productos;