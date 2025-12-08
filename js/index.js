// ⚠️⚠️ ¡ASEGURATE QUE ESTA URL SEA LA BUENA! ⚠️⚠️
        const scriptURL = 'https://script.google.com/macros/s/AKfycbwqgW2tb86Z0gEwIvI8UmbFJJx43Qr2nor5NVEIp06OivMrDRE85JmAJxfKxdZC2_gd/exec'; 

        sessionStorage.clear();

        function togglePassword() {
            const input = document.getElementById('pass');
            const icon = document.getElementById('eyeIcon');
            if (input.type === "password") {
                input.type = "text"; icon.classList.replace('ph-eye', 'ph-eye-slash');
            } else {
                input.type = "password"; icon.classList.replace('ph-eye-slash', 'ph-eye');
            }
        }

        document.getElementById('loginForm').addEventListener('submit', e => {
            e.preventDefault();
            const btn = document.getElementById('btnLogin');
            const alertPass = document.getElementById('alertBadPass');
            const alertConn = document.getElementById('alertConnection');
            const originalContent = btn.innerHTML;
            
            // UI de Carga
            btn.innerHTML = '<i class="ph ph-spinner animate-spin text-xl"></i> Verificando...';
            btn.disabled = true;
            btn.classList.add('opacity-80');
            
            // Ocultamos ambas alertas al intentar de nuevo
            alertPass.classList.add('hidden');
            alertConn.classList.add('hidden');

            const user = document.getElementById('user').value;
            const pass = document.getElementById('pass').value;

            fetch(`${scriptURL}?action=login&user=${user}&pass=${pass}`)
            .then(res => res.json())
            .then(data => {
                if(data.result === "success") {
                    sessionStorage.setItem('logueado', 'true');
                    sessionStorage.setItem('rol', data.role);
                    sessionStorage.setItem('nombreUsuario', data.usuario);
                    
                    // --- GUARDAMOS LA FOTO ---
                    sessionStorage.setItem('fotoUsuario', data.foto || ""); 
                    // -------------------------
                    
                    btn.innerHTML = '<i class="ph ph-check text-xl"></i> ¡Correcto!';
                    btn.classList.replace('from-blue-600', 'bg-green-500');
                    setTimeout(() => window.location.href = 'menu.html', 500);
                } else {
                    // ERROR: CONTRASEÑA MAL
                    alertPass.classList.remove('hidden'); 
                    resetBtn();
                }
            })
            .catch(error => {
                // ERROR: CONEXIÓN (URL MAL O SIN INTERNET)
                console.error("Error real:", error); // Míralo en consola con F12
                alertConn.classList.remove('hidden'); // MOSTRAR ALERTA ROJA NUEVA
                resetBtn();
            });

            function resetBtn() {
                btn.innerHTML = originalContent;
                btn.disabled = false;
                btn.classList.remove('opacity-80');
            }
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