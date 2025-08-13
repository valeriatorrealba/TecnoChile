// ================== ESTADO DEL CARRITO ==================
let carrito = [];

// ================== UTILIDADES ==================
function guardarLSCarrito() {
    try {
        const carritoJSON = JSON.stringify(carrito);
        localStorage.setItem('carrito', carritoJSON);
        console.log('Carrito guardado en localStorage');
    } catch (error) {
        console.warn('No se pudo guardar el carrito en localStorage:', error);
    }
}

function cargarLSCarrito() {
    try {
        const carritoGuardado = localStorage.getItem('carrito');
        if (carritoGuardado) {
            carrito = JSON.parse(carritoGuardado);
            console.log('Carrito cargado desde localStorage:', carrito.length, 'items');
        }
    } catch (error) {
        console.warn('No se pudo cargar el carrito desde localStorage:', error);
        carrito = [];
    }
}

function formatearPrecio(valor) {
    return new Intl.NumberFormat('es-CL', {
        style: 'currency',
        currency: 'CLP'
    }).format(valor);
}

function updateCartBadge() {
    const badge = document.getElementById('cartBadge');
    if (!badge) return;
    
    const totalItems = carrito.reduce((acc, p) => acc + (p.cantidad || 0), 0);
    badge.textContent = totalItems;
    badge.style.display = totalItems > 0 ? 'grid' : 'none';
}

function ensureFloatingCartButton() {
    if (document.getElementById('btnCartFloat')) return;

    const btn = document.createElement('button');
    btn.id = 'btnCartFloat';
    btn.className = 'btn btn-primary';
    btn.title = 'Ver carrito de compras';
    btn.setAttribute('aria-label', 'Ver carrito de compras');
    btn.innerHTML = `
        <i class="fas fa-shopping-cart"></i>
        <span id="cartBadge"
              class="position-absolute translate-middle badge rounded-pill bg-danger"
              style="top:0; right:0; min-width:24px; height:24px; display:grid; place-items:center; font-size:12px;">0</span>
    `;
    
    // Aplicar estilos desde CSS
    document.body.appendChild(btn);

    btn.addEventListener('click', () => {
        const carritoSection = document.getElementById('carrito');
        if (carritoSection) {
            carritoSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
}

// ================== RENDERIZADO DEL CARRITO ==================
function actualizarCarrito() {
    const contenedor = document.getElementById('carritoProductos');
    const totalSpan = document.getElementById('totalCarrito');
    
    if (!contenedor || !totalSpan) {
        console.warn('Elementos del carrito no encontrados en el DOM');
        return;
    }

    contenedor.innerHTML = '';
    let total = 0;

    if (carrito.length === 0) {
        contenedor.innerHTML = `
            <div class="alert alert-light text-center p-4">
                <i class="fas fa-shopping-cart fa-3x text-muted mb-3"></i>
                <h5 class="text-muted">Tu carrito está vacío</h5>
                <p class="text-muted">Agrega algunos productos para comenzar a comprar</p>
                <button class="btn btn-primary mt-2" onclick="document.getElementById('productos').scrollIntoView({behavior: 'smooth'})">
                    <i class="fas fa-shopping-bag me-2"></i>Ver Productos
                </button>
            </div>
        `;
        totalSpan.textContent = formatearPrecio(0);
        updateCartBadge();
        return;
    }

    carrito.forEach(prod => {
        const subtotal = prod.precio * prod.cantidad;
        total += subtotal;

        const itemDiv = document.createElement('div');
        itemDiv.className = 'card mb-3 border-0 shadow-sm';
        itemDiv.innerHTML = `
            <div class="card-body">
                <div class="row align-items-center">
                    <div class="col-md-8">
                        <div class="d-flex align-items-center">
                            <img src="${prod.imagen}" alt="${prod.nombre}" 
                                 class="me-3 rounded" style="width: 60px; height: 60px; object-fit: cover;"
                                 onerror="this.src='https://via.placeholder.com/60x60/f8f9fa/6c757d?text=IMG'">
                            <div>
                                <h6 class="mb-1 text-primary">${prod.nombre}</h6>
                                <small class="text-muted">${prod.descripcion}</small>
                                <div class="mt-1">
                                    <small class="text-success">Precio unitario: ${formatearPrecio(prod.precio)}</small>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-4 text-md-end">
                        <div class="mb-2">
                            <span class="badge bg-secondary fs-6">Cantidad: ${prod.cantidad}</span>
                        </div>
                        <div class="mb-2">
                            <strong class="text-success fs-5">${formatearPrecio(subtotal)}</strong>
                        </div>
                        <div class="btn-group" role="group" aria-label="Controles de cantidad">
                            <button class="btn btn-outline-secondary btn-sm" 
                                    onclick="cambiarCantidad(${prod.id}, ${prod.cantidad - 1})" 
                                    title="Disminuir cantidad"
                                    ${prod.cantidad <= 1 ? 'disabled' : ''}>
                                <i class="fas fa-minus"></i>
                            </button>
                            <button class="btn btn-outline-secondary btn-sm" 
                                    onclick="cambiarCantidad(${prod.id}, ${prod.cantidad + 1})" 
                                    title="Aumentar cantidad">
                                <i class="fas fa-plus"></i>
                            </button>
                            <button class="btn btn-outline-danger btn-sm" 
                                    onclick="eliminarDelCarrito(${prod.id})" 
                                    title="Eliminar producto del carrito">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        contenedor.appendChild(itemDiv);
    });

    totalSpan.textContent = formatearPrecio(total);
    updateCartBadge();
}

// ================== ACCIONES DEL CARRITO ==================
function agregarAlCarrito(productoOId) {
    let producto = productoOId;

    // Si llega un id (número), búscalo en window.productos
    if (typeof productoOId === 'number') {
        if (!window.productos || window.productos.length === 0) {
            mostrarNotificacion('Error: Catálogo no disponible', 'warning');
            return;
        }
        producto = window.productos.find(p => p.id === productoOId);
        if (!producto) {
            console.error('Producto no encontrado con ID:', productoOId);
            mostrarNotificacion('Error: Producto no encontrado', 'error');
            return;
        }
    }

    // Verificar que el producto tenga las propiedades necesarias
    if (!producto.id || !producto.nombre || !producto.precio) {
        console.error('Producto inválido:', producto);
        mostrarNotificacion('Error: Producto inválido', 'error');
        return;
    }

    const item = carrito.find(p => p.id === producto.id);
    if (item) {
        if(item.cantidad >= producto.stock){
            mostrarNotificacion(`No puedes agregar más unidades, solo hay ${producto.stock} en stock.`, 'warning');
            return;
        }
        item.cantidad++;
        mostrarNotificacion(`Se agregó otra unidad de ${producto.nombre}`, 'info');
    } else {
        if (producto.stock <= 0) {
            mostrarNotificacion(`Producto ${producto.nombre} agotado`, 'error');
            return;
        }
        carrito.push({ ...producto, cantidad: 1 });
        mostrarNotificacion(`${producto.nombre} agregado al carrito`, 'success');
    }
    
    guardarLSCarrito();
    actualizarCarrito();
    
    console.log('Producto agregado al carrito:', producto.nombre);
}

function cambiarCantidad(id, nuevaCantidad) {
    if (nuevaCantidad < 1) {
        eliminarDelCarrito(id);
        return;
    }
    
    const producto = carrito.find(p => p.id === id);
    if (!producto) return;
    
    producto.cantidad = nuevaCantidad;
    
    guardarLSCarrito();
    actualizarCarrito();
    
    mostrarNotificacion(`Cantidad actualizada: ${producto.nombre}`, 'info');
}

function eliminarDelCarrito(id) {
    const producto = carrito.find(p => p.id === id);
    if (!producto) return;
    
    const nombreProducto = producto.nombre;
    carrito = carrito.filter(p => p.id !== id);
    
    guardarLSCarrito();
    actualizarCarrito();
    
    mostrarNotificacion(`${nombreProducto} eliminado del carrito`, 'warning');
}

function vaciarCarrito() {
    if (carrito.length === 0) {
        mostrarNotificacion('El carrito ya está vacío', 'info');
        return;
    }
    
    const cantidadItems = carrito.length;
    
    if (confirm(`¿Estás seguro de que quieres vaciar el carrito?\nSe eliminarán ${cantidadItems} producto${cantidadItems > 1 ? 's' : ''}.`)) {
        carrito = [];
        guardarLSCarrito();
        actualizarCarrito();
        mostrarNotificacion('Carrito vaciado correctamente', 'success');
    }
}

function procesarCompra() {
    // Verificar que hay productos en el carrito
    if (carrito.length === 0) {
        mostrarNotificacion('El carrito está vacío. Agrega productos antes de procesar la compra.', 'warning');
        const productosSection = document.getElementById('productos');
        if (productosSection) {
            productosSection.scrollIntoView({ behavior: 'smooth' });
        }
        return;
    }
    
    // Verificar información del cliente
    let clienteInfo;
    try {
        clienteInfo = JSON.parse(localStorage.getItem('clienteInfo') || '{"nombre":"","apellido":""}');
    } catch (error) {
        clienteInfo = { nombre: "", apellido: "" };
    }
    
    if (!clienteInfo.nombre || !clienteInfo.apellido) {
        mostrarNotificacion('Debes ingresar los datos del cliente antes de procesar la compra.', 'warning');
        const clienteSection = document.getElementById('cliente');
        if (clienteSection) {
            clienteSection.scrollIntoView({ behavior: 'smooth' });
        }
        const nombreInput = document.getElementById('nombre');
        if (nombreInput) {
            setTimeout(() => nombreInput.focus(), 500);
        }
        return;
    }
    
    // Calcular totales
    const total = carrito.reduce((acc, p) => acc + (p.precio * p.cantidad), 0);
    const totalItems = carrito.reduce((acc, p) => acc + p.cantidad, 0);
    
    // Crear resumen detallado
    const resumenItems = carrito.map(p => 
        `• ${p.nombre} - Cantidad: ${p.cantidad} - Subtotal: ${formatearPrecio(p.precio * p.cantidad)}`
    ).join('\n');
    
    const mensaje = `🛒 RESUMEN DE COMPRA 🛒\n\n` +
                   `Cliente: ${clienteInfo.nombre} ${clienteInfo.apellido}\n\n` +
                   `Productos (${totalItems} items):\n${resumenItems}\n\n` +
                   `💰 TOTAL: ${formatearPrecio(total)}\n\n` +
                   `¡Gracias por tu compra en Tecno Chile!`;
    
    // Mostrar confirmación
    if (confirm('¿Confirmar la compra?\n\n' + mensaje)) {
        carrito.forEach(item => {
            const prodCatalogo = window.productos.find(p => p.id === item.id);
            if (prodCatalogo) {
                prodCatalogo.stock -= item.cantidad;
                if (prodCatalogo.stock <= 0) {
                    mostrarNotificacion(`El producto "${prodCatalogo.nombre}" ha quedado sin stock.`, 'error');
                    console.log(`ALERTA: Producto ${prodCatalogo.nombre} sin stock. Enviar correo al responsable.`);
                }
            }
        });

        if (typeof cargarProductos === 'function') {
            cargarProductos(productos);
        }
        // Simular procesamiento
        mostrarNotificacion('Procesando compra...', 'info');
        
        setTimeout(() => {
            mostrarNotificacion('¡Compra realizada exitosamente! Gracias por elegirnos.', 'success');
            
            // Limpiar carrito después de la compra exitosa
            carrito = [];
            guardarLSCarrito();
            actualizarCarrito();
            
            console.log('Compra procesada exitosamente');
        }, 1500);
    }
}

// ================== SISTEMA DE NOTIFICACIONES ==================
function mostrarNotificacion(mensaje, tipo = 'info') {
    // Remover notificación existente si la hay
    const notificacionExistente = document.getElementById('notificacion-temp');
    if (notificacionExistente) {
        notificacionExistente.remove();
    }
    
    // Configurar colores según el tipo
    const tiposConfig = {
        success: { clase: 'alert-success', icono: 'fas fa-check-circle' },
        error: { clase: 'alert-danger', icono: 'fas fa-exclamation-circle' },
        warning: { clase: 'alert-warning', icono: 'fas fa-exclamation-triangle' },
        info: { clase: 'alert-info', icono: 'fas fa-info-circle' }
    };
    
    const config = tiposConfig[tipo] || tiposConfig.info;
    
    // Crear elemento de notificación
    const notificacion = document.createElement('div');
    notificacion.id = 'notificacion-temp';
    notificacion.className = `alert ${config.clase} position-fixed shadow-lg`;
    notificacion.style.cssText = `
        top: 90px;
        right: 20px;
        z-index: 9999;
        min-width: 300px;
        max-width: 400px;
        animation: slideInRight 0.3s ease-out;
        border: none;
        border-radius: 8px;
    `;
    
    notificacion.innerHTML = `
        <div class="d-flex align-items-center">
            <i class="${config.icono} me-2"></i>
            <span>${mensaje}</span>
            <button type="button" class="btn-close ms-auto" onclick="this.parentElement.parentElement.remove()"></button>
        </div>
    `;
    
    document.body.appendChild(notificacion);
    
    // Auto-remover después de 4 segundos
    setTimeout(() => {
        if (notificacion.parentNode) {
            notificacion.style.animation = 'slideOutRight 0.3s ease-in';
            setTimeout(() => {
                if (notificacion.parentNode) {
                    notificacion.remove();
                }
            }, 300);
        }
    }, 4000);
}

// ================== UTILIDADES ADICIONALES ==================
function obtenerEstadisticasCarrito() {
    return {
        totalItems: carrito.reduce((acc, p) => acc + p.cantidad, 0),
        totalProductosUnicos: carrito.length,
        valorTotal: carrito.reduce((acc, p) => acc + (p.precio * p.cantidad), 0),
        productos: carrito.map(p => ({ 
            nombre: p.nombre, 
            cantidad: p.cantidad, 
            subtotal: p.precio * p.cantidad 
        }))
    };
}

function buscarEnCarrito(terminoBusqueda) {
    const termino = terminoBusqueda.toLowerCase();
    return carrito.filter(p => 
        p.nombre.toLowerCase().includes(termino) ||
        p.descripcion.toLowerCase().includes(termino)
    );
}

function aplicarDescuento(porcentaje) {
    if (carrito.length === 0) {
        mostrarNotificacion('No hay productos en el carrito para aplicar descuento', 'warning');
        return;
    }
    
    if (porcentaje < 0 || porcentaje > 100) {
        mostrarNotificacion('El descuento debe estar entre 0% y 100%', 'error');
        return;
    }
    
    const descuentoDecimal = porcentaje / 100;
    carrito.forEach(producto => {
        producto.precio = producto.precio * (1 - descuentoDecimal);
    });
    
    guardarLSCarrito();
    actualizarCarrito();
    mostrarNotificacion(`Descuento del ${porcentaje}% aplicado correctamente`, 'success');
}

// ================== INICIALIZACIÓN ==================
document.addEventListener('DOMContentLoaded', () => {
    // Cargar carrito desde localStorage
    cargarLSCarrito();
    
    // Inicializar elementos UI
    ensureFloatingCartButton();
    updateCartBadge();
    actualizarCarrito();
    
    // Agregar estilos CSS para las animaciones si no existen
    if (!document.getElementById('cart-animations-css')) {
        const style = document.createElement('style');
        style.id = 'cart-animations-css';
        style.textContent = `
            @keyframes slideInRight {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOutRight {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    }
    
    console.log('Sistema de carrito inicializado correctamente');
});

// ================== EVENTOS DE LIMPIEZA ==================
// Limpiar recursos cuando se cierra/recarga la página
window.addEventListener('beforeunload', () => {
    // Guardar estado final del carrito
    guardarLSCarrito();
});

// Manejar cambios de visibilidad de la página
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        // Página oculta - guardar estado
        guardarLSCarrito();
    } else {
        // Página visible - actualizar UI
        updateCartBadge();
        actualizarCarrito();
    }
});

// ================== SCOPE GLOBAL (para onclick del HTML) ==================
window.agregarAlCarrito = agregarAlCarrito;
window.cambiarCantidad = cambiarCantidad;
window.eliminarDelCarrito = eliminarDelCarrito;
window.vaciarCarrito = vaciarCarrito;
window.procesarCompra = procesarCompra;
window.obtenerEstadisticasCarrito = obtenerEstadisticasCarrito;
window.buscarEnCarrito = buscarEnCarrito;
window.aplicarDescuento = aplicarDescuento;