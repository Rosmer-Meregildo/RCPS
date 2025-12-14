// ⚠️ PEGA AQUÍ TU URL CORRECTA ⚠️
        const scriptURL = 'https://script.google.com/macros/s/AKfycbxLXduf1p_8rNXSy-uvgsvy_lHR8xWD0EYD2Wv98nr8Y_42WilL_xNZEoS9-WReE48U/exec'; 

        // --- Funciones de Alerta ---
        function mostrarAlerta(mensaje) {
            document.getElementById('textoAlerta').innerText = mensaje;
            document.getElementById('modalAlerta').classList.remove('hidden');
        }
        function cerrarAlerta() {
            document.getElementById('modalAlerta').classList.add('hidden');
        }

        // --- Configuración Inicial ---
        const diaSelect = document.getElementById('diaSelect');
        for(let i=1; i<=30; i++) diaSelect.add(new Option(`Día ${i}`, i));
        document.getElementById('fechaAsistencia').valueAsDate = new Date();

        let todosLosDatos = [];
        let grupoActual = [];

        // --- Descargar Datos ---
        async function descargarBD() {
            try {
                document.getElementById('loadingTxt').classList.remove('hidden');
                const res = await fetch(`${scriptURL}?action=busqueda`);
                const json = await res.json();
                todosLosDatos = json.data;
                document.getElementById('loadingTxt').innerText = "✅ Base de datos lista.";
                document.getElementById('loadingTxt').className = "text-green-600 font-bold text-sm mt-4";
            } catch (e) {
                mostrarAlerta("Error de conexión al cargar datos.");
            }
        }
        descargarBD();

        // --- Cargar Grupo y Generar Lista ---
        function cargarGrupo() {
            const dia = diaSelect.value;
            const contenedor = document.getElementById('listaAsistencia');
            
            if(!dia) { mostrarAlerta("⚠️ Selecciona un día primero"); return; }
            if(todosLosDatos.length === 0) { mostrarAlerta("⏳ Cargando datos, espera un segundo..."); return; }

            grupoActual = todosLosDatos.filter(u => String(u.datos[3]) === String(dia));
            
            contenedor.innerHTML = "";
            document.getElementById('panelGuardar').classList.add('hidden');

            if(grupoActual.length === 0) {
                contenedor.innerHTML = `
                    <div class='bg-orange-50 p-6 rounded-2xl border border-orange-100 text-center text-orange-600'>
                        <i class="ph ph-warning-circle text-3xl mb-2"></i>
                        <p class="font-bold">Sin resultados</p>
                        <p class="text-sm opacity-80">Nadie asignado al Día ${dia}</p>
                    </div>`;
                return;
            }

            // Encabezado de columnas
            contenedor.innerHTML = `
                <div class="flex justify-between items-end px-4 mb-2 animate-pulse">
                    <p class="text-xs font-bold text-slate-400 uppercase tracking-wider">Rondero</p>
                    <p class="text-xs font-bold text-slate-400 uppercase tracking-wider text-center w-20">Estado</p>
                </div>`;

            // Generar filas
            grupoActual.forEach((u, index) => {
                const [nom, ape] = u.datos;
                const idCheck = `chk-${index}`;
                const idLabel = `lbl-${index}`;
                const delay = index * 0.05; 
                
                const fila = `
                <div class="item-animado bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between group hover:shadow-md transition-shadow mb-3" style="animation-delay: ${delay}s">
                    
                    <div class="flex items-center gap-3">
                        <div class="w-12 h-12 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400">
                            <i class="ph ph-user text-2xl"></i>
                        </div>
                        <div>
                            <h4 class="font-bold text-slate-700 capitalize text-lg leading-tight">${nom} <br>${ape}</h4>
                        </div>
                    </div>

                    <div class="flex flex-col items-center gap-1 w-24">
                        <span id="${idLabel}" class="text-[10px] font-black tracking-wider text-emerald-500 uppercase transition-colors">ASISTIÓ</span>
                        
                        <label class="switch">
                            <input type="checkbox" id="${idCheck}" checked onchange="actualizarEstado(${index})">
                            <span class="slider"></span>
                        </label>
                    </div>
                </div>`;
                
                contenedor.innerHTML += fila;
            });

            document.getElementById('panelGuardar').classList.remove('hidden');
        }

        // --- Función para cambiar el texto visualmente ---
        function actualizarEstado(index) {
            const chk = document.getElementById(`chk-${index}`);
            const lbl = document.getElementById(`lbl-${index}`);
            
            if (chk.checked) {
                lbl.innerText = "ASISTIÓ";
                lbl.className = "text-[10px] font-black tracking-wider text-emerald-500 uppercase transition-colors";
            } else {
                lbl.innerText = "FALTÓ";
                lbl.className = "text-[10px] font-black tracking-wider text-red-500 uppercase transition-colors";
            }
        }

        // --- Guardar Asistencia ---
        function guardarAsistencia() {
            const btn = document.getElementById('btnGuardar');
            const fechaInput = document.getElementById('fechaAsistencia').value;
            const diaRonda = diaSelect.value;
            
            if(!fechaInput) { mostrarAlerta("⚠️ Falta la fecha"); return; }

            const fechaObj = new Date(fechaInput + "T00:00:00");
            const mesStr = fechaObj.toLocaleString('es-ES', { month: 'long' });
            const anioStr = fechaObj.getFullYear();
            const fechaStr = fechaObj.toLocaleDateString('es-ES');

            const filasParaEnviar = grupoActual.map((u, index) => {
                const checkbox = document.getElementById(`chk-${index}`);
                const estado = checkbox.checked ? "ASISTIO" : "FALTO";
                return [fechaStr, mesStr, anioStr, diaRonda, u.datos[0], u.datos[1], estado];
            });

            const originalContent = btn.innerHTML;
            btn.innerHTML = '<i class="ph ph-spinner animate-spin text-2xl"></i> Guardando...';
            btn.disabled = true;

            const formData = new FormData();
            formData.append('datos', JSON.stringify(filasParaEnviar));

            fetch(`${scriptURL}?action=guardarAsistencia`, { method: 'POST', body: formData })
            .then(res => res.json())
            .then(data => {
                if(data.result === "success") {
                    document.getElementById('modalExito').classList.remove('hidden');
                } else {
                    mostrarAlerta("Error en el servidor de Google");
                    btn.innerHTML = originalContent; 
                    btn.disabled = false;
                }
            })
            .catch(e => {
                mostrarAlerta("Error de conexión. Verifica tu internet.");
                btn.innerHTML = originalContent; 
                btn.disabled = false;
            });
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