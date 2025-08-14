// =================== INICIALIZACIÓN DEL CARRUSEL ===================
document.addEventListener('DOMContentLoaded', function() {
    const carousel = document.querySelector('#techCarousel');
    
    if (!carousel) {
        console.warn('Elemento carousel no encontrado');
        return;
    }

    // Configuración del carrusel con mejor manejo de eventos
    let carouselInstance = new bootstrap.Carousel(carousel, {
        interval: 6000,
        wrap: true,
        keyboard: true,
        pause: 'hover',
        touch: true
    });

    // Mejorar la accesibilidad de los controles
    const prevButton = document.querySelector('.carousel-control-prev');
    const nextButton = document.querySelector('.carousel-control-next');
    const indicators = document.querySelectorAll('.carousel-indicators button');

    // Asegurar que los botones sean clickeables
    if (prevButton) {
        prevButton.style.pointerEvents = 'auto';
        prevButton.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            carouselInstance.prev();
        });
    }

    if (nextButton) {
        nextButton.style.pointerEvents = 'auto';
        nextButton.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            carouselInstance.next();
        });
    }

    // Mejorar indicadores
    indicators.forEach((indicator, index) => {
        indicator.style.pointerEvents = 'auto';
        indicator.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            carouselInstance.to(index);
        });
    });

    // Eventos del carrusel con mejores animaciones
    carousel.addEventListener('slide.bs.carousel', function (e) {
        const activeSlide = e.relatedTarget;
        
        if (!activeSlide) return;

        // Reiniciar animaciones en cada slide
        const animations = activeSlide.querySelectorAll('.hero-title, .hero-subtitle, .hero-description, .btn-modern, .product-features');
        
        animations.forEach(el => {
            if (el) {
                el.style.animation = 'none';
                el.offsetHeight; // Trigger reflow
                el.style.animation = null;
            }
        });

        // Efecto de transición más sutil
        document.body.style.transition = 'filter 0.5s ease';
        document.body.style.filter = 'hue-rotate(10deg)';
        
        setTimeout(() => {
            document.body.style.filter = 'hue-rotate(0deg)';
        }, 500);
    });

    // Control por teclado mejorado
    document.addEventListener('keydown', function(e) {
        if (!carousel) return;
        
        // Solo si no hay elementos de formulario enfocados
        if (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA') {
            return;
        }

        if (e.key === 'ArrowLeft') {
            e.preventDefault();
            carouselInstance.prev();
        } else if (e.key === 'ArrowRight') {
            e.preventDefault();
            carouselInstance.next();
        }
    });

    // Efecto parallax más sutil y optimizado
    let ticking = false;
    
    function updateParallax() {
        const scrolled = window.pageYOffset;
        const rate = scrolled * -0.2;
        const carousel = document.querySelector('.hero-carousel');
        
        if (carousel && scrolled < window.innerHeight) {
            carousel.style.transform = `translateY(${rate}px) scale(${1 + scrolled * 0.00005})`;
        }
        ticking = false;
    }

    window.addEventListener('scroll', function() {
        if (!ticking && window.innerWidth > 768) {
            requestAnimationFrame(updateParallax);
            ticking = true;
        }
    });

    // Efectos de hover mejorados para botones
    const buttons = document.querySelectorAll('.btn-modern');
    buttons.forEach(button => {
        button.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-3px) scale(1.05)';
            this.style.boxShadow = '0 15px 35px rgba(0,0,0,0.3), 0 0 25px rgba(255,255,255,0.2)';
        });
        
        button.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
            this.style.boxShadow = '0 8px 25px rgba(0,0,0,0.3), 0 0 20px rgba(255,255,255,0.1)';
        });
    });

    // Sistema de partículas más eficiente
    let particleCount = 0;
    const maxParticles = 8;
    
    function createParticle() {
        if (particleCount >= maxParticles) return;
        
        const particle = document.createElement('div');
        particle.style.cssText = `
            position: fixed;
            width: 3px;
            height: 3px;
            background: hsl(${Math.random() * 360}, 70%, 60%);
            border-radius: 50%;
            pointer-events: none;
            z-index: 1000;
            left: ${Math.random() * window.innerWidth}px;
            top: -10px;
            box-shadow: 0 0 8px currentColor;
        `;
        
        document.body.appendChild(particle);
        particleCount++;
        
        const duration = 4000 + Math.random() * 3000;
        const animation = particle.animate([
            { 
                transform: 'translateY(0px) rotate(0deg)', 
                opacity: 1 
            },
            { 
                transform: `translateY(${window.innerHeight + 100}px) rotate(720deg)`, 
                opacity: 0 
            }
        ], {
            duration: duration,
            easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
        });
        
        animation.addEventListener('finish', () => {
            if (particle.parentNode) {
                particle.parentNode.removeChild(particle);
            }
            particleCount--;
        });
    }

    // Generar partículas menos frecuentemente
    setInterval(createParticle, 1500);

    // Pausar efectos cuando la página no está visible
    document.addEventListener('visibilitychange', function() {
        if (document.hidden) {
            carouselInstance.pause();
        } else {
            carouselInstance.cycle();
        }
    });

    // Optimización para dispositivos táctiles
    if ('ontouchstart' in window) {
        carousel.addEventListener('touchstart', function() {
            carouselInstance.pause();
        });
        
        carousel.addEventListener('touchend', function() {
            setTimeout(() => {
                carouselInstance.cycle();
            }, 3000);
        });
    }

    console.log('Carrusel inicializado correctamente');
});

// =================== PRODUCTOS ===================
// Array de productos (disponible globalmente)
const productos = [
    {
        id: 1,
        nombre: "MacBook Pro 13\"",
        precio: 1299000,
        imagen: "assets/image/img1.png",
        descripcion: "Laptop profesional con chip M2"
    },
    {
        id: 2,
        nombre: "iPhone 14",
        precio: 899000,
        imagen: "assets/image/img2.png",
        descripcion: "Smartphone último modelo"
    },
    {
        id: 3,
        nombre: "iPad Air",
        precio: 649000,
        imagen: "assets/image/img3.png",
        descripcion: "Tablet versátil y potente"
    },
    {
        id: 4,
        nombre: "Samsung Galaxy S23",
        precio: 799000,
        imagen: "assets/image/img4.png",
        descripcion: "Android flagship premium"
    },
    {
        id: 5,
        nombre: "Dell XPS 13",
        precio: 1099000,
        imagen: "assets/image/img5.png",
        descripcion: "Ultrabook profesional"
    },
    {
        id: 6,
        nombre: "AirPods Pro",
        precio: 249000,
        imagen: "assets/image/img6.png",
        descripcion: "Auriculares inalámbricos premium"
    }
];

// Hacer productos disponible globalmente para el carrito
window.productos = productos;

// Función para formatear precios
function formatearPrecio(precio) {
    return new Intl.NumberFormat('es-CL', {
        style: 'currency',
        currency: 'CLP'
    }).format(precio);
}

// Función para inicializar tooltips
function inicializarTooltips() {
    const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
    tooltipTriggerList.forEach(tooltipTriggerEl => {
        new bootstrap.Tooltip(tooltipTriggerEl);
    });
}

// Función para cargar productos en el DOM
function cargarProductos(productosAMostrar = productos) {
    const container = document.getElementById('productosContainer');
    if (!container) return;
    
    container.innerHTML = '';

    if (productosAMostrar.length === 0) {
        container.innerHTML = `
            <div class="col-12 text-center">
                <div class="alert alert-info">
                    <i class="fas fa-search"></i> No se encontraron productos con ese criterio de búsqueda.
                </div>
            </div>
        `;
        return;
    }

    productosAMostrar.forEach(producto => {
        const col = document.createElement('div');
        col.className = 'col-md-4 mb-4';
        
        col.innerHTML = `
            <div class="card product-card h-100 shadow-sm">
                <img src="${producto.imagen}" class="card-img-top" alt="${producto.nombre}" 
                     style="height: 250px; object-fit: cover; background: #f8f9fa;" 
                     onerror="this.src='https://via.placeholder.com/300x250/f8f9fa/6c757d?text=${encodeURIComponent(producto.nombre)}'">
                <div class="card-body d-flex flex-column">
                    <h5 class="card-title text-primary">${producto.nombre}</h5>
                    <p class="card-text text-muted">${producto.descripcion}</p>
                    <div class="mt-auto">
                        <p class="price mb-3 fw-bold text-success fs-5">${formatearPrecio(producto.precio)}</p>
                        <button class="btn btn-primary w-100 btn-lg" 
                                onclick="agregarAlCarrito(${producto.id})"
                                data-bs-toggle="tooltip" 
                                title="Agregar ${producto.nombre} al carrito">
                            <i class="fas fa-cart-plus me-2"></i>Agregar al Carrito
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        container.appendChild(col);
    });

    // Reinicializar tooltips
    inicializarTooltips();
}

// Función para filtrar productos (búsqueda)
function filtrarProductos() {
    const filtro = document.getElementById('filtroProductos');
    if (!filtro) return;
    
    const termino = filtro.value.toLowerCase().trim();
    
    if (termino === '') {
        // Si no hay término de búsqueda, mostrar todos los productos
        cargarProductos(productos);
    } else {
        // Filtrar productos que coincidan con el término de búsqueda
        const productosFiltrados = productos.filter(producto =>
            producto.nombre.toLowerCase().includes(termino) ||
            producto.descripcion.toLowerCase().includes(termino)
        );
        cargarProductos(productosFiltrados);
    }
}

// Función para limpiar búsqueda
function limpiarBusqueda() {
    const filtro = document.getElementById('filtroProductos');
    if (filtro) {
        filtro.value = '';
        cargarProductos(productos);
    }
}

// Inicialización cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    // Cargar productos inicialmente
    cargarProductos();
    
    // Configurar el buscador
    const filtroInput = document.getElementById('filtroProductos');
    if (filtroInput) {
        // Búsqueda en tiempo real
        filtroInput.addEventListener('input', filtrarProductos);
        filtroInput.addEventListener('keyup', filtrarProductos);
        
        // Limpiar con Escape
        filtroInput.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                limpiarBusqueda();
            }
        });
        
        // Placeholder más descriptivo
        filtroInput.placeholder = "Buscar por nombre o descripción...";
    }
    
    // Inicializar tooltips
    inicializarTooltips();
    
    console.log('Productos cargados correctamente:', productos.length);
});

// Hacer funciones disponibles globalmente
window.cargarProductos = cargarProductos;
window.filtrarProductos = filtrarProductos;
window.limpiarBusqueda = limpiarBusqueda;
window.formatearPrecio = formatearPrecio;