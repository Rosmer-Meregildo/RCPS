
// ==========================================
// 1. CARGA DE DATOS DE SESIÓN
// ==========================================
const nombreUser = sessionStorage.getItem('nombreUsuario') || "Usuario";
const rolUser = sessionStorage.getItem('rol') || "Invitado";
const fotoUser = sessionStorage.getItem('fotoUsuario');

// Poner textos en pantalla
document.getElementById('nombreDisplay').innerText = nombreUser;
document.getElementById('rolBadge').innerText = rolUser;

// ==========================================
// 2. LÓGICA DE FOTO DE PERFIL
// ==========================================
const container = document.getElementById('avatarContainer');
if (fotoUser && fotoUser.trim().length > 5) {
    // Si hay enlace, mostramos la imagen
    container.innerHTML = `
                <img src="${fotoUser}" 
                     alt="Perfil" 
                     class="w-full h-full object-cover" 
                     onerror="this.parentElement.innerHTML='<i class=\'ph ph-user\'></i>'">`;
} else {
    // Si no hay, mostramos el icono por defecto
    container.innerHTML = '<i class="ph ph-user"></i>';
}

// ==========================================
// 3. SALUDO AUTOMÁTICO (DÍA/TARDE/NOCHE)
// ==========================================
const hora = new Date().getHours();
const saludoLabel = document.getElementById('saludoDia');

if (hora < 12) saludoLabel.innerText = "Buenos días,";
else if (hora < 18) saludoLabel.innerText = "Buenas tardes,";
else saludoLabel.innerText = "Buenas noches,";

// ==========================================
// 4. PERMISOS DE ADMINISTRADOR
// ==========================================
// Convertimos a minúsculas para comparar seguro
const ES_ADMIN = (rolUser.trim().toLowerCase() === 'admin');

if (ES_ADMIN) {
    // Mostrar botón de Ajustes
    const btnAjustes = document.getElementById('btnAjustes');
    if (btnAjustes) {
        btnAjustes.classList.remove('hidden');
        btnAjustes.classList.add('flex');
    }

    // Mostrar botón de Actas
    const btnActas = document.getElementById('btnActas');
    if (btnActas) {
        btnActas.classList.remove('hidden');
        btnActas.classList.add('block');
    }
}

// ==========================================
// 5. LÓGICA DEL MODAL SALIDA
// ==========================================
const modal = document.getElementById('modalSalida');

function abrirModalSalida() { modal.classList.remove('hidden'); }
function cerrarModalSalida() { modal.classList.add('hidden'); }

function confirmarSalida() {
    sessionStorage.clear();
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.4s';
    setTimeout(() => { window.location.href = 'index.html'; }, 400);
}

// Cerrar si tocan fuera del modal
if (modal) {
    modal.addEventListener('click', (e) => {
        if (e.target === modal) cerrarModalSalida();
    });
}

// ==========================================
// 6. SEGURIDAD (BLOQUEO DE TECLAS)
// ==========================================
// Deshabilitar Ctrl+U, Ctrl+S y F12
document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && (e.key === 'u' || e.key === 's')) {
        e.preventDefault();
    }
    if (e.key === 'F12') {
        e.preventDefault();
    }
});

// Deshabilitar Clic Derecho
document.addEventListener('contextmenu', (e) => {
    e.preventDefault();
});