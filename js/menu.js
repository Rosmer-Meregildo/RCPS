// DATOS DEL USUARIO
        const nombreUser = sessionStorage.getItem('nombreUsuario') || "Usuario";
        const rolUser = sessionStorage.getItem('rol') || "Invitado";
        const fotoUser = sessionStorage.getItem('fotoUsuario'); // Aquí llega el link del excel

        document.getElementById('nombreDisplay').innerText = nombreUser;
        document.getElementById('rolBadge').innerText = rolUser;

        // --- VALIDACIÓN DE FOTO ---
        const container = document.getElementById('avatarContainer');

        if(fotoUser && fotoUser.trim().length > 5) { 
            // SI HAY ENLACE: Ponemos la imagen
            // Agregamos 'onerror' para que si el link no sirve, regrese al icono
            container.innerHTML = `
                <img src="${fotoUser}" 
                     alt="Perfil" 
                     class="w-full h-full object-cover" 
                     onerror="this.parentElement.innerHTML='<i class=\'ph ph-user\'></i>'">
            `;
        } else {
            // SI NO HAY ENLACE: Dejamos el icono (por defecto ya está, pero aseguramos)
            container.innerHTML = '<i class="ph ph-user"></i>';
        }

        // SALUDO
        const hora = new Date().getHours();
        const saludoLabel = document.getElementById('saludoDia');
        if (hora < 12) saludoLabel.innerText = "Buenos días,";
        else if (hora < 18) saludoLabel.innerText = "Buenas tardes,";
        else saludoLabel.innerText = "Buenas noches,";

        // MODAL SALIDA
        const modal = document.getElementById('modalSalida');
        function abrirModalSalida() { modal.classList.remove('hidden'); }
        function cerrarModalSalida() { modal.classList.add('hidden'); }
        function confirmarSalida() {
            sessionStorage.clear();
            document.body.style.opacity = '0';
            document.body.style.transition = 'opacity 0.4s';
            setTimeout(() => { window.location.href = 'index.html'; }, 400);
        }
        modal.addEventListener('click', (e) => {
            if (e.target === modal) cerrarModalSalida();
        });
         // Script para deshabilitar Ctrl+U, Ctrl+S y F12
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && (e.key === 'u' || e.key === 's')) {
                e.preventDefault();
            }
            if (e.key === 'F12') {
                e.preventDefault();
            }
        });
         // Script para deshabilitar el clic derecho
        document.addEventListener('contextmenu', (e) => {
            e.preventDefault();
        });