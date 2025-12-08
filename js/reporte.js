
        const scriptURL = 'https://script.google.com/macros/s/AKfycbwqgW2tb86Z0gEwIvI8UmbFJJx43Qr2nor5NVEIp06OivMrDRE85JmAJxfKxdZC2_gd/exec'; // ⚠️ URL AQUI

        // 1. Inicializar Filtro Día
        const diaFilter = document.getElementById('diaFilter');
        for(let i=1; i<=30; i++) diaFilter.add(new Option(`Día ${i}`, i));

        let todosLosUsuarios = [];

        // 2. Cargar Directorio al inicio (Para la búsqueda rápida)
        async function cargarDirectorio() {
            try {
                const res = await fetch(`${scriptURL}?action=busqueda`);
                const json = await res.json();
                todosLosUsuarios = json.data; 
                document.getElementById('statusCarga').innerText = "Busca por nombre o selecciona un día.";
                // Opcional: Mostrar todos al inicio
                // filtrarUsuarios(); 
            } catch (e) {
                document.getElementById('statusCarga').innerText = "Error de conexión.";
            }
        }
        cargarDirectorio();

        // 3. Filtrar y Mostrar Lista (PASO 1)
        function filtrarUsuarios() {
            const txt = document.getElementById('searchInput').value.toLowerCase();
            const dia = document.getElementById('diaFilter').value;
            const container = document.getElementById('listaUsuariosResultados');
            
            container.innerHTML = "";

            if(!todosLosUsuarios.length) return;

            const filtrados = todosLosUsuarios.filter(u => {
                // u.datos = [Nom, Ape, Edad, Dia, ...]
                const nombreFull = (u.datos[0] + " " + u.datos[1]).toLowerCase();
                const diaUser = String(u.datos[3]);
                
                // Lógica de filtro: Si hay texto, busca texto. Si hay día, busca día.
                const matchTexto = txt === "" || nombreFull.includes(txt);
                const matchDia = dia === "" || diaUser === dia;

                return matchTexto && matchDia;
            });

            if(filtrados.length === 0) {
                container.innerHTML = "<div class='text-center py-10 text-slate-400'>No se encontraron coincidencias.</div>";
                return;
            }

            // Generar Tarjetas de Usuario
            filtrados.forEach(u => {
                const [nom, ape, edad, diaUser] = u.datos;
                const diaTxt = diaUser ? `Día ${diaUser}` : "Sin día";
                
                const card = `
                <div class="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex justify-between items-center hover:shadow-md transition group">
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 bg-slate-100 text-slate-500 rounded-full flex items-center justify-center font-bold text-sm">
                            ${nom.charAt(0)}${ape.charAt(0)}
                        </div>
                        <div>
                            <h4 class="font-bold text-slate-800 capitalize leading-tight">${nom} ${ape}</h4>
                            <span class="text-xs font-bold text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded">${diaTxt}</span>
                        </div>
                    </div>
                    
                    <button onclick="verReporteDetallado('${nom} ${ape}', '${diaTxt}')" 
                        class="bg-blue-600 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-blue-700 transition active:scale-95 shadow-lg shadow-blue-500/30">
                        Ver Informe
                    </button>
                </div>`;
                container.innerHTML += card;
            });
        }

        // 4. Ver Reporte Detallado (PASO 2)
        function verReporteDetallado(nombreCompleto, diaTexto) {
            // Cambiar Vista
            document.getElementById('vistaLista').classList.add('hidden');
            document.getElementById('vistaReporte').classList.remove('hidden');
            
            // Llenar Encabezado
            document.getElementById('repNombre').innerText = nombreCompleto;
            document.getElementById('repDia').innerText = diaTexto;

            // Resetear Gráficos
            document.getElementById('listaHistorial').innerHTML = "<p class='text-center text-blue-500 py-10 animate-pulse'>Descargando historial...</p>";
            document.getElementById('txtPorcentaje').innerText = "--";
            document.getElementById('graficoDonut').style.background = "conic-gradient(#e5e7eb 0% 100%)";

            // Buscar Historial en el Backend
            fetch(`${scriptURL}?action=historial&nombre=${nombreCompleto}`)
            .then(res => res.json())
            .then(json => {
                const datos = json.data;
                const lista = document.getElementById('listaHistorial');
                lista.innerHTML = ""; // Limpiar loading

                if(datos.length === 0) {
                    lista.innerHTML = `
                    <div class="text-center py-10 text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                        <i class="ph ph-ghost text-3xl mb-2"></i>
                        <p>No hay registros de asistencia aún.</p>
                    </div>`;
                    actualizarGrafico(0, 0);
                    return;
                }

                // Contar y Listar
                let asistencias = 0;
                let faltas = 0;
                let htmlRows = "";

                // Ordenar más reciente primero
                datos.reverse().forEach(row => {
                    const esAsistencia = row.estado === "ASISTIO";
                    if(esAsistencia) asistencias++; else faltas++;

                    const icono = esAsistencia 
                        ? '<div class="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center shrink-0"><i class="ph ph-check text-lg font-bold"></i></div>'
                        : '<div class="w-8 h-8 rounded-full bg-red-100 text-red-500 flex items-center justify-center shrink-0"><i class="ph ph-x text-lg font-bold"></i></div>';
                    
                    const fechaFmt = row.fecha; // Ya viene formateada del excel o script

                    htmlRows += `
                    <div class="bg-white p-3 rounded-xl shadow-sm border border-slate-100 flex items-center gap-3">
                        ${icono}
                        <div>
                            <p class="font-bold text-slate-700 text-sm">${fechaFmt}</p>
                            <p class="text-[10px] text-slate-400 uppercase font-bold tracking-wide">${row.mes} ${row.anio}</p>
                        </div>
                        <div class="ml-auto">
                            <span class="text-[10px] font-black px-2 py-1 rounded-md ${esAsistencia ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'}">
                                ${row.estado}
                            </span>
                        </div>
                    </div>`;
                });

                lista.innerHTML = htmlRows;
                actualizarGrafico(asistencias, faltas);
            })
            .catch(e => alert("Error cargando historial"));
        }

        // 5. Actualizar Gráfico Visual
        function actualizarGrafico(asistencias, faltas) {
            document.getElementById('totalAsistencias').innerText = asistencias;
            document.getElementById('totalFaltas').innerText = faltas;

            const total = asistencias + faltas;
            const porcentaje = total === 0 ? 0 : Math.round((asistencias / total) * 100);
            
            document.getElementById('txtPorcentaje').innerText = `${porcentaje}%`;
            
            // Animación del Donut
            const grados = (porcentaje * 360) / 100;
            const colorVerde = "#10b981";
            const colorRojo = "#ef4444";
            
            // Si es 0 registros, dejar gris. Si hay registros, pintar.
            const colorFondo = total === 0 ? "#e5e7eb" : colorRojo;

            document.getElementById('graficoDonut').style.background = 
                `conic-gradient(${colorVerde} 0deg ${grados}deg, ${colorFondo} ${grados}deg 360deg)`;
        }

        // 6. Volver
        function volverALista() {
            document.getElementById('vistaReporte').classList.add('hidden');
            document.getElementById('vistaLista').classList.remove('hidden');
        }