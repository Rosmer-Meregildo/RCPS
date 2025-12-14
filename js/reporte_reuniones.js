const scriptURL = 'https://script.google.com/macros/s/AKfycbxLXduf1p_8rNXSy-uvgsvy_lHR8xWD0EYD2Wv98nr8Y_42WilL_xNZEoS9-WReE48U/exec'; // ⚠️ URL AQUI

        // --- VERIFICACIÓN DE SEGURIDAD FINAL ---
        const rolUsuario = sessionStorage.getItem('rol');
        const esAdmin = (rolUsuario && rolUsuario.trim().toLowerCase() === 'admin');

        if(esAdmin) {
            // Si es admin, quitamos la capa de seguridad y cargamos
            document.getElementById('capaSeguridad').classList.add('hidden');
            cargarDatos();
        } else {
            // Si NO es admin, mostramos el modal de denegado
            document.getElementById('capaSeguridad').classList.add('hidden');
            document.getElementById('modalDenegado').classList.remove('hidden');
        }

        // ----------------------------------------

        let rawData = [];
        let reunionesUnicas = {};

        async function cargarDatos() {
            const select = document.getElementById('selectReunion');
            select.innerHTML = '<option>Cargando...</option>';
            
            try {
                const res = await fetch(`${scriptURL}?action=getReunionesData`);
                const json = await res.json();
                rawData = json.data;

                rawData.forEach(row => {
                    const fecha = row[0];
                    const tema = row[3];
                    const key = `${fecha} - ${tema}`;
                    
                    if (!reunionesUnicas[key]) reunionesUnicas[key] = { fecha: fecha, tema: tema, registros: [] };
                    reunionesUnicas[key].registros.push(row);
                });

                select.innerHTML = '<option value="">-- Selecciona una fecha --</option>';
                Object.keys(reunionesUnicas).reverse().forEach(key => { 
                    select.add(new Option(key, key));
                });

            } catch (e) {
                select.innerHTML = '<option>Error</option>';
                alert("Error cargando datos"); // Aquí puedes usar el modal bonito si quieres, pero en admin el alert es pasable
            }
        }

        function cargarReporte() {
            const key = document.getElementById('selectReunion').value;
            if(!key) return;

            const dataReunion = reunionesUnicas[key];
            const lista = dataReunion.registros;

            document.getElementById('lblFecha').innerText = dataReunion.fecha;
            document.getElementById('lblTema').innerText = dataReunion.tema;

            let presentes = 0; let faltas = 0; let htmlFilas = "";
            
            lista.sort((a, b) => a[5].localeCompare(b[5]));

            lista.forEach((row, index) => {
                const [fecha, mes, anio, tema, grupo, nombre, apellido, estado] = row;
                if(estado === 'ASISTIO') presentes++; else faltas++;
                const colorEstado = estado === 'ASISTIO' ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50';
                
                htmlFilas += `
                <tr class="border-b border-slate-100 hover:bg-slate-50 transition print:border-black">
                    <td class="py-3 pl-2 font-bold text-slate-400 text-xs">${index + 1}</td>
                    <td class="py-3 font-medium capitalize text-slate-700">${nombre} ${apellido}</td>
                    <td class="py-3 text-slate-500 text-xs">Día ${grupo}</td>
                    <td class="py-3 text-right pr-2"><span class="px-2 py-1 rounded font-bold text-[10px] uppercase border print:border-0 ${colorEstado}">${estado}</span></td>
                </tr>`;
            });

            document.getElementById('tablaCuerpo').innerHTML = htmlFilas;
            document.getElementById('statPresentes').innerText = presentes;
            document.getElementById('statFaltas').innerText = faltas;
            document.getElementById('statTotal').innerText = lista.length;
            document.getElementById('printPresentes').innerText = presentes;
            document.getElementById('printFaltas').innerText = faltas;
            document.getElementById('printTotal').innerText = lista.length;

            document.getElementById('hojaReporte').classList.remove('hidden');
            document.getElementById('btnImprimir').classList.remove('hidden');
            document.getElementById('btnImprimir').classList.add('flex');
        }