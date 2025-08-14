const LS_KEY = 'productos';

function getProductos() {
    return JSON.parse(localStorage.getItem(LS_KEY) || '[]');
}
function setProductos(arr) {
    localStorage.setItem(LS_KEY, JSON.stringify(arr));
}
function nextId(lista) {
    return lista.length ? Math.max(...lista.map(p => p.id)) + 1 : 1;
}

(function init() {
    const params = new URLSearchParams(location.search);
    const editId = Number(params.get('id')) || null;

    const titulo = document.getElementById('titulo');
    const form = document.getElementById('formProducto');

    const $ = id => document.getElementById(id);

    if (editId) {
        titulo.textContent = 'Editar producto';
        const lista = getProductos();
        const p = lista.find(x => x.id === editId);
        
        if (!p) {
            alert('Producto no encontrado');
            location.href = 'admin.html';
            return;
        }

        $('nombre').value = p.nombre || '';
        $('precio').value = p.precio ?? 0;
        $('descripcion').value = p.descripcion || '';
        $('categoria').value = p.categoria || 'Sin categoría';
        $('etiqueta').value = p.etiqueta || '';
        $('stock').value = p.stock ?? 0;
        $('imagen').value = p.imagen || '';
    }

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const lista = getProductos();

        const data = {
            nombre: $('nombre').value.trim(),
            precio: Number($('precio').value),
            descripcion: $('descripcion').value.trim(),
            categoria: $('categoria').value,
            etiqueta: $('etiqueta').value.trim(),
            stock: Number($('stock').value),
            imagen: $('imagen').value.trim()
        };

        if (!data.nombre || !data.categoria || isNaN(data.precio)) {
            alert('Completa nombre, categoría y un precio válido.');
            return;
        }

        if (editId) {
            const idx = lista.findIndex(x => x.id === editId);

            if (idx === -1) {
                alert('Producto no encontrado');
                return;
        }
        lista[idx] = { ...lista[idx], ...data, id: editId };
        
        } else {    
            const id = nextId(lista);
            lista.push({ id, ...data });
        }

        setProductos(lista);

        location.href = 'admin.html';
    });
})();
