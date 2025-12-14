        const scriptURL = 'https://script.google.com/macros/s/AKfycbxLXduf1p_8rNXSy-uvgsvy_lHR8xWD0EYD2Wv98nr8Y_42WilL_xNZEoS9-WReE48U/exec'; // ⚠️ PEGA TU URL AQUI

        const diaSelect = document.getElementById('diaSelect');
        diaSelect.add(new Option("-- Sin fecha --", ""));
        for(let i=1; i<=30; i++) diaSelect.add(new Option(`Día ${i}`, i));

        const mzSelect = document.getElementById('mzSelect');
        mzSelect.add(new Option("--", ""));
        "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").forEach(l => mzSelect.add(new Option(`Mz ${l}`, l)));

        const ltSelect = document.getElementById('ltSelect');
        ltSelect.add(new Option("--", ""));
        for(let i=1; i<=22; i++) ltSelect.add(new Option(`Lote ${i}`, i));

        const form = document.getElementById('registroForm');
        
        form.addEventListener('submit', e => {
            e.preventDefault();
            const btn = document.getElementById('btnGuardar');
            const originalContent = btn.innerHTML;
            btn.innerHTML = '<i class="ph ph-spinner animate-spin text-xl"></i> Guardando...'; btn.disabled = true;

            const fd = new FormData(form);
            // El campo 'edad' ahora manda la FECHA (YYYY-MM-DD) gracias al input type="date"
            const url = `${scriptURL}?action=registro` +
                        `&nombre=${fd.get('nombre')}` +
                        `&apellido=${fd.get('apellido')}` +
                        `&edad=${fd.get('edad')}` + 
                        `&celular=${fd.get('celular')}` +
                        `&etapa=${fd.get('etapa')}` +
                        `&mz=${fd.get('mz')}` +
                        `&lt=${fd.get('lt')}` +
                        `&tieneLote=${fd.get('tieneLote')}` +
                        `&dia=${fd.get('dia')}`;

            fetch(url, { method: 'POST' })
                .then(() => { document.getElementById('modalExito').classList.remove('hidden'); form.reset(); })
                .catch(e => { alert('Error al guardar'); })
                .finally(() => { btn.innerHTML = originalContent; btn.disabled = false; });
        });

        function cerrarModal(){ document.getElementById('modalExito').classList.add('hidden'); }
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