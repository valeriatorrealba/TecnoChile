// ================== ESTADO DEL CLIENTE ==================
let clienteInfo = { nombre: '', apellido: '' };

// ================== UTILIDADES ==================
function guardarLSCliente() {
    try {
        localStorage.setItem('clienteInfo', JSON.stringify(clienteInfo));
        console.log('Información del cliente guardada en localStorage');
    } catch (error) {
        console.warn('No se pudo guardar la información del cliente:', error);
    }
}

function cargarLSCliente() {
    try {
        const datosGuardados = localStorage.getItem('clienteInfo');
        if (datosGuardados) {
            clienteInfo = JSON.parse(datosGuardados);
            console.log('Información del cliente cargada desde localStorage');
        }
    } catch (error) {
        console.warn('No se pudo cargar la información del cliente:', error);
        clienteInfo = { nombre: '', apellido: '' };
    }
}

function validarDatosCliente(nombre, apellido) {
    const errores = [];
    
    // Validar nombre
    if (!nombre || nombre.trim().length < 2) {
        errores.push('El nombre debe tener al menos 2 caracteres');
    } else if (nombre.trim().length > 50) {
        errores.push('El nombre no puede tener más de 50 caracteres');
    } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(nombre.trim())) {
        errores.push('El nombre solo puede contener letras y espacios');
    }
    
    // Validar apellido
    if (!apellido || apellido.trim().length < 2) {
        errores.push('El apellido debe tener al menos 2 caracteres');
    } else if (apellido.trim().length > 50) {
        errores.push('El apellido no puede tener más de 50 caracteres');
    } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(apellido.trim())) {
        errores.push('El apellido solo puede contener letras y espacios');
    }
    
    return errores;
}

function capitalizarTexto(texto) {
    return texto.trim()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
}

// ================== INTERFAZ DE USUARIO ==================
function mostrarCliente() {
    const infoDiv = document.getElementById('infoCliente');
    const formDiv = document.getElementById('formCliente');
    const vistaDiv = document.getElementById('vistaCliente');

    if (clienteInfo.nombre && clienteInfo.apellido) {
        // Cliente registrado - mostrar información
        if (infoDiv) {
            const fechaRegistro = localStorage.getItem('clienteFechaRegistro') || 'Hoy';
            infoDiv.innerHTML = `
                <div class="d-flex align-items-center">
                    <i class="fas fa-user-circle fa-2x text-success me-3"></i>
                    <div>
                        <strong>Cliente registrado:</strong> ${clienteInfo.nombre} ${clienteInfo.apellido}
                        <br>
                        <small class="text-muted">
                            <i class="fas fa-calendar me-1"></i>
                            Registrado: ${fechaRegistro}
                        </small>
                    </div>
                </div>
            `;
        }
        
        // Ocultar formulario y mostrar vista de cliente
        if (formDiv) formDiv.style.display = 'none';
        if (vistaDiv) vistaDiv.style.display = 'block';
        
        // Actualizar título de la sección
        const tituloSeccion = document.querySelector('#cliente h2');
        if (tituloSeccion) {
            tituloSeccion.innerHTML = `
                <i class="fas fa-user-check text-success me-2"></i>
                Cliente Registrado
            `;
        }
        
    } else {
        // No hay cliente registrado - mostrar formulario
        if (formDiv) formDiv.style.display = 'flex';
        if (vistaDiv) vistaDiv.style.display = 'none';
        if (infoDiv) infoDiv.innerHTML = '';
        
        // Restaurar título original
        const tituloSeccion = document.querySelector('#cliente h2');
        if (tituloSeccion) {
            tituloSeccion.innerHTML = `
                <i class="fas fa-user-plus text-primary me-2"></i>
                Datos del Cliente
            `;
        }
    }
}

function mostrarNotificacionCliente(mensaje, tipo = 'info') {
    // Remover notificación existente si la hay
    const notificacionExistente = document.getElementById('notificacion-cliente');
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
    notificacion.id = 'notificacion-cliente';
    notificacion.className = `alert ${config.clase} mt-3`;
    notificacion.innerHTML = `
        <div class="d-flex align-items-center">
            <i class="${config.icono} me-2"></i>
            <span>${mensaje}</span>
            <button type="button" class="btn-close ms-auto" onclick="this.parentElement.parentElement.remove()"></button>
        </div>
    `;
    
    // Insertar después del formulario o vista del cliente
    const contenedor = document.getElementById('cliente');
    if (contenedor) {
        contenedor.appendChild(notificacion);
        
        // Auto-remover después de 4 segundos
        setTimeout(() => {
            if (notificacion.parentNode) {
                notificacion.style.opacity = '0';
                notificacion.style.transition = 'opacity 0.3s ease';
                setTimeout(() => {
                    if (notificacion.parentNode) {
                        notificacion.remove();
                    }
                }, 300);
            }
        }, 4000);
    }
}

// ================== ACCIONES PRINCIPALES ==================
function guardarCliente() {
    const nombreInput = document.getElementById('nombre');
    const apellidoInput = document.getElementById('apellido');
    
    if (!nombreInput || !apellidoInput) {
        console.error('Inputs de nombre o apellido no encontrados');
        mostrarNotificacionCliente('Error: Campos de formulario no encontrados', 'error');
        return;
    }
    
    const nombre = nombreInput.value.trim();
    const apellido = apellidoInput.value.trim();
    
    // Validar datos
    const errores = validarDatosCliente(nombre, apellido);
    if (errores.length > 0) {
        const mensajeError = errores.join('\n• ');
        mostrarNotificacionCliente(`Errores de validación:\n• ${mensajeError}`, 'error');
        
        // Enfocar el primer campo con error
        if (errores.some(e => e.includes('nombre'))) {
            nombreInput.focus();
        } else {
            apellidoInput.focus();
        }
        return;
    }
    
    // Capitalizar nombres antes de guardar
    const nombreCapitalizado = capitalizarTexto(nombre);
    const apellidoCapitalizado = capitalizarTexto(apellido);
    
    // Confirmar si ya hay un cliente registrado
    if (clienteInfo.nombre && clienteInfo.apellido) {
        const confirmar = confirm(`Ya hay un cliente registrado: ${clienteInfo.nombre} ${clienteInfo.apellido}\n\n¿Deseas reemplazarlo con: ${nombreCapitalizado} ${apellidoCapitalizado}?`);
        if (!confirmar) {
            return;
        }
    }
    
    // Guardar información
    clienteInfo = { 
        nombre: nombreCapitalizado, 
        apellido: apellidoCapitalizado 
    };
    
    // Guardar fecha de registro
    const fechaActual = new Date().toLocaleDateString('es-CL', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    localStorage.setItem('clienteFechaRegistro', fechaActual);
    
    guardarLSCliente();
    mostrarCliente();
    
    // Limpiar campos del formulario
    nombreInput.value = '';
    apellidoInput.value = '';
    
    mostrarNotificacionCliente(`¡Bienvenido/a ${nombreCapitalizado} ${apellidoCapitalizado}! Tu información ha sido guardada correctamente.`, 'success');
    
    console.log('Cliente guardado exitosamente:', clienteInfo);
}

function cerrarSesionCliente() {
    const confirmar = confirm(`¿Estás seguro de que deseas cerrar la sesión de ${clienteInfo.nombre} ${clienteInfo.apellido}?\n\nEsto eliminará toda la información del cliente.`);
    
    if (!confirmar) return;
    
    // Limpiar localStorage
    localStorage.removeItem('clienteInfo');
    localStorage.removeItem('clienteFechaRegistro');
    
    // Resetear estado
    clienteInfo = { nombre: '', apellido: '' };

    // Limpiar campos del formulario
    const nombreEl = document.getElementById('nombre');
    const apellidoEl = document.getElementById('apellido');
    if (nombreEl) nombreEl.value = '';
    if (apellidoEl) apellidoEl.value = '';

    // Actualizar UI
    mostrarCliente();
    
    mostrarNotificacionCliente('Sesión cerrada correctamente. Puedes registrar un nuevo cliente.', 'info');
    
    // Enfocar el campo nombre para facilitar nuevo registro
    setTimeout(() => {
        if (nombreEl) nombreEl.focus();
    }, 500);
    
    console.log('Sesión de cliente cerrada');
}

function editarCliente() {
    const nuevoNombre = prompt('Nuevo nombre:', clienteInfo.nombre);
    if (nuevoNombre === null) return; // Usuario canceló
    
    const nuevoApellido = prompt('Nuevo apellido:', clienteInfo.apellido);
    if (nuevoApellido === null) return; // Usuario canceló
    
    // Validar nuevos datos
    const errores = validarDatosCliente(nuevoNombre, nuevoApellido);
    if (errores.length > 0) {
        alert('Errores de validación:\n• ' + errores.join('\n• '));
        return;
    }
    
    // Actualizar información
    const nombreAnterior = `${clienteInfo.nombre} ${clienteInfo.apellido}`;
    clienteInfo = {
        nombre: capitalizarTexto(nuevoNombre),
        apellido: capitalizarTexto(nuevoApellido)
    };
    
    guardarLSCliente();
    mostrarCliente();
    
    mostrarNotificacionCliente(`Información actualizada: ${nombreAnterior} → ${clienteInfo.nombre} ${clienteInfo.apellido}`, 'success');
}

// ================== UTILIDADES ADICIONALES ==================
function obtenerInfoCliente() {
    return {
        ...clienteInfo,
        estaRegistrado: !!(clienteInfo.nombre && clienteInfo.apellido),
        fechaRegistro: localStorage.getItem('clienteFechaRegistro') || null,
        nombreCompleto: clienteInfo.nombre && clienteInfo.apellido ? `${clienteInfo.nombre} ${clienteInfo.apellido}` : null
    };
}

function validarClienteParaCompra() {
    if (!clienteInfo.nombre || !clienteInfo.apellido) {
        mostrarNotificacionCliente('Debes registrarte antes de realizar una compra', 'warning');
        
        // Enfocar el formulario
        const nombreInput = document.getElementById('nombre');
        if (nombreInput) {
            document.getElementById('cliente').scrollIntoView({ behavior: 'smooth' });
            setTimeout(() => nombreInput.focus(), 500);
        }
        
        return false;
    }
    return true;
}

// ================== EVENTOS DE FORMULARIO ==================
function configurarEventosFormulario() {
    const nombreInput = document.getElementById('nombre');
    const apellidoInput = document.getElementById('apellido');
    
    if (!nombreInput || !apellidoInput) return;
    
    // Enter para enviar formulario
    [nombreInput, apellidoInput].forEach(input => {
        input.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                guardarCliente();
            }
        });
        
        // Capitalización automática mientras se escribe
        input.addEventListener('input', function() {
            const cursorPos = this.selectionStart;
            const valorAnterior = this.value;
            this.value = this.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '');
            
            // Mantener posición del cursor
            if (this.value.length !== valorAnterior.length) {
                this.setSelectionRange(cursorPos - 1, cursorPos - 1);
            }
        });
        
        // Validación en tiempo real
        input.addEventListener('blur', function() {
            if (this.value.trim().length > 0 && this.value.trim().length < 2) {
                this.classList.add('is-invalid');
                mostrarNotificacionCliente(`${this.placeholder} debe tener al menos 2 caracteres`, 'warning');
            } else {
                this.classList.remove('is-invalid');
            }
        });
    });
}

// ================== INICIALIZACIÓN ==================
document.addEventListener('DOMContentLoaded', () => {
    // Cargar información del cliente desde localStorage
    cargarLSCliente();
    
    // Configurar eventos del formulario
    configurarEventosFormulario();
    
    // Mostrar interfaz apropiada
    mostrarCliente();
    
    // Agregar botón de edición si el cliente está registrado
    if (clienteInfo.nombre && clienteInfo.apellido) {
        const vistaCliente = document.getElementById('vistaCliente');
        if (vistaCliente && !document.getElementById('btnEditarCliente')) {
            const btnEditar = document.createElement('button');
            btnEditar.id = 'btnEditarCliente';
            btnEditar.className = 'btn btn-outline-primary btn-sm me-2';
            btnEditar.innerHTML = '<i class="fas fa-edit"></i> Editar';
            btnEditar.onclick = editarCliente;
            
            const btnCerrar = vistaCliente.querySelector('.btn-danger');
            if (btnCerrar) {
                btnCerrar.parentNode.insertBefore(btnEditar, btnCerrar);
            }
        }
    }
    
    console.log('Sistema de cliente inicializado correctamente');
});

// ================== SCOPE GLOBAL (para onclick del HTML) ==================
window.guardarCliente = guardarCliente;
window.cerrarSesionCliente = cerrarSesionCliente;
window.editarCliente = editarCliente;
window.obtenerInfoCliente = obtenerInfoCliente;
window.validarClienteParaCompra = validarClienteParaCompra;