// ⚠️⚠️ PEGA AQUÍ TU URL DEL SCRIPT ⚠️⚠️
        const scriptURL = 'https://script.google.com/macros/s/AKfycbwqgW2tb86Z0gEwIvI8UmbFJJx43Qr2nor5NVEIp06OivMrDRE85JmAJxfKxdZC2_gd/exec'; 

        // 1. GENERAR DÍAS (1-30)
        const diaSelect = document.getElementById('diaSelect');
        diaSelect.add(new Option("-- Sin fecha --", ""));
        for(let i=1; i<=30; i++) diaSelect.add(new Option(`Día ${i}`, i));

        // 2. GENERAR MANZANAS (A-Z) - LO NUEVO
        const mzSelect = document.getElementById('mzSelect');
        mzSelect.add(new Option("-- Sin Mz --", ""));
        const letras = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
        letras.forEach(letra => {
            mzSelect.add(new Option(`Mz ${letra}`, letra));
        });

        // 3. GENERAR LOTES (1-22) - LO NUEVO
        const ltSelect = document.getElementById('ltSelect');
        ltSelect.add(new Option("-- Sin Lt --", ""));
        for(let i=1; i<=22; i++) ltSelect.add(new Option(`Lote ${i}`, i));


        // 4. LÓGICA DE ENVÍO
        const form = document.getElementById('registroForm');
        
        form.addEventListener('submit', e => {
            e.preventDefault();
            const btn = document.getElementById('btnGuardar');
            const originalContent = btn.innerHTML;
            
            // Animación de carga en el botón
            btn.innerHTML = '<i class="ph ph-spinner animate-spin text-xl"></i> Guardando...';
            btn.disabled = true;
            btn.classList.add('opacity-75');

            const fd = new FormData(form);
            
            // Construimos la URL con los NUEVOS campos
            // Asegúrate que los nombres (etapa, mz, lt) coincidan con el e.parameter del script
            const url = `${scriptURL}?action=registro` +
                        `&nombre=${fd.get('nombre')}` +
                        `&apellido=${fd.get('apellido')}` +
                        `&edad=${fd.get('edad')}` +
                        `&celular=${fd.get('celular')}` +
                        `&etapa=${fd.get('etapa')}` + // Nuevo
                        `&mz=${fd.get('mz')}` +       // Nuevo
                        `&lt=${fd.get('lt')}` +       // Nuevo
                        `&dia=${fd.get('dia')}`;

            fetch(url, { method: 'POST' })
                .then(() => {
                    document.getElementById('modalExito').classList.remove('hidden');
                    form.reset();
                })
                .catch(e => {
                    alert('Error al guardar: ' + e);
                })
                .finally(() => {
                    btn.innerHTML = originalContent;
                    btn.disabled = false;
                    btn.classList.remove('opacity-75');
                });
        });

        function cerrarModal(){ 
            document.getElementById('modalExito').classList.add('hidden'); 
        }
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