const scriptURL = 'https://script.google.com/macros/s/AKfycbwqgW2tb86Z0gEwIvI8UmbFJJx43Qr2nor5NVEIp06OivMrDRE85JmAJxfKxdZC2_gd/exec'; // ⚠️ URL AQUI

        function buscarHistorial() {
            const nombre = document.getElementById('searchInput').value;
            const contenedor = document.getElementById('contenedorResultados');
            const empty = document.getElementById('emptyState');
            const lista = document.getElementById('listaHistorial');
            
            if(!nombre) { alert("Escribe un nombre"); return; }

            // UI Loading
            lista.innerHTML = "<p class='text-center text-blue-500 font-bold animate-pulse'>🔍 Buscando en los archivos...</p>";
            contenedor.classList.remove('hidden');
            empty.classList.add('hidden');

            fetch(`${scriptURL}?action=historial&nombre=${nombre}`)
            .then(res => res.json())
            .then(json => {
                const datos = json.data;
                
                if(datos.length === 0) {
                    lista.innerHTML = "<p class='text-center text-slate-400'>No se encontraron registros de asistencia para este nombre.</p>";
                    return;
                }

                // 1. CÁLCULOS MATEMÁTICOS
                let asistencias = 0;
                let faltas = 0;
                
                // Ordenar por fecha (Más reciente primero) - Truco: Convertir fecha string a objeto para ordenar
                // Asumimos formato dd/mm/yyyy. Si es simple string, lo mostramos tal cual viene del excel.
                
                let htmlList = "";

                datos.reverse().forEach(row => {
                    const esAsistencia = row.estado === "ASISTIO";
                    if(esAsistencia) asistencias++; else faltas++;

                    const icono = esAsistencia 
                        ? '<div class="w-10 h-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center"><i class="ph ph-check text-xl font-bold"></i></div>'
                        : '<div class="w-10 h-10 rounded-full bg-red-100 text-red-500 flex items-center justify-center"><i class="ph ph-x text-xl font-bold"></i></div>';
                    
                    const borde = esAsistencia ? 'border-green-100' : 'border-red-100';

                    htmlList += `
                    <div class="bg-white p-4 rounded-2xl shadow-sm border ${borde} flex items-center gap-4 animate-card">
                        ${icono}
                        <div>
                            <p class="font-bold text-slate-700">${row.fecha}</p>
                            <p class="text-xs text-slate-400 capitalize">${row.mes} ${row.anio}</p>
                        </div>
                        <div class="ml-auto">
                            <span class="text-xs font-bold px-3 py-1 rounded-full ${esAsistencia ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'}">
                                ${row.estado}
                            </span>
                        </div>
                    </div>`;
                });

                // 2. ACTUALIZAR UI
                document.getElementById('totalAsistencias').innerText = asistencias;
                document.getElementById('totalFaltas').innerText = faltas;
                lista.innerHTML = htmlList;

                // 3. ACTUALIZAR GRÁFICO (DONUT)
                const total = asistencias + faltas;
                const porcentaje = Math.round((asistencias / total) * 100) || 0;
                
                document.getElementById('txtPorcentaje').innerText = `${porcentaje}%`;
                
                // Magia del degradado cónico para el gráfico
                const grados = (porcentaje * 360) / 100;
                document.getElementById('graficoDonut').style.background = 
                    `conic-gradient(#10b981 0deg ${grados}deg, #ef4444 ${grados}deg 360deg)`;

            })
            .catch(e => {
                alert("Error de conexión");
                lista.innerHTML = "";
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