const CATEGORIAS = ['smartphones', 'laptops'];
let productos = [];
const LS_KEY = "productos";
const container = document.getElementById("productosContainer");
window.productos = productos; // referencia global

// Función para formatear precios CLP
function formatearPrecio(precio) {
    return new Intl.NumberFormat('es-CL', {
        style: 'currency',
        currency: 'CLP'
    }).format(precio);
}

async function cargarProductosDesdeAPI() {
    if (!container) return console.error("No se encontró el contenedor de productos");

    try {
        const enLS = localStorage.getItem(LS_KEY);
        if (enLS) {
            const productosLS = JSON.parse(enLS).map(p => ({ ...p, categoria: (p.categoria || '').toLowerCase() }));
            productos.splice(0, productos.length, ...productosLS);
            cargarProductos(productos);
            return;
        }
        

        container.innerHTML = `<div class="text-center p-5">
                                <div class="spinner-border text-primary" role="status"></div>
                                <p class="mt-3">Cargando productos...</p>
                            </div>`;
        
        let todosProductos = [];

        for (const cat of CATEGORIAS) {
            const res = await fetch(`https://dummyjson.com/products/category/${cat}`);
            if (!res.ok) throw new Error(`Error cargando ${cat}`);
            const data = await res.json();
            const normalizados = data.products.map(p => ({
                id: p.id,
                nombre: p.title,
                descripcion: p.description,
                precio: p.price,
                stock: p.stock ?? 5,
                categoria: (p.category || cat).toLowerCase(),
                imagen: p.thumbnail,
                etiqueta: p.brand || ''
            }));
            todosProductos.push(...normalizados);
        }

        productos.splice(0, productos.length, ...todosProductos);
        localStorage.setItem(LS_KEY, JSON.stringify(productos));

        cargarProductos(productos);
    } catch (error) {
        console.error("Error cargando productos:", error);
        container.innerHTML = `<p class="text-danger">Error al cargar productos.</p>`;
    }
}

function cargarProductos(productosAMostrar) {

    container.innerHTML = '';

    if (!productosAMostrar || productosAMostrar.length === 0) {
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
        const estadoStock = producto.stock > 0 
        ? `<span class="text-success">En stock: ${producto.stock}</span>` 
        : `<span class="text-danger">Sin stock</span>`;
        
        const disabled = producto.stock > 0 ? "" : "disabled";

        const col = document.createElement('div');
        col.className = 'col-md-4 mb-4';

        col.innerHTML = `
            <div class="card product-card h-100 shadow-sm">
                <img src="${producto.imagen}" class="card-img-top" alt="${producto.nombre}" 
                    style="height: 250px; object-fit: contain; background: #f8f9fa;">
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
    cargarProductosDesdeAPI();

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