const scriptURL = 'https://script.google.com/macros/s/AKfycbwqgW2tb86Z0gEwIvI8UmbFJJx43Qr2nor5NVEIp06OivMrDRE85JmAJxfKxdZC2_gd/exec'; // ⚠️ URL AQUI
        
        // 🟢 CONFIGURA AQUÍ EL NÚMERO DEL ADMIN (Código País + Número)
        const NUMERO_ADMIN = "51918180274"; 

        const rolBruto = sessionStorage.getItem('rol'); 
        const rolLimpio = rolBruto ? rolBruto.trim().toLowerCase() : "";
        const ES_ADMIN = (rolLimpio === 'admin');

        let todosLosDatos = [];
        
        const diaFilter = document.getElementById('diaFilter');
        const editDia = document.getElementById('editDia');
        const editMz = document.getElementById('editMz');
        const editLt = document.getElementById('editLt');

        editDia.add(new Option("-- Sin fecha --", ""));
        for(let i=1; i<=30; i++){
            diaFilter.add(new Option(`Día ${i}`, i));
            editDia.add(new Option(`Día ${i}`, i));
        }
        editMz.add(new Option("--", ""));
        "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").forEach(l => editMz.add(new Option(l, l)));
        editLt.add(new Option("--", ""));
        for(let i=1; i<=22; i++) editLt.add(new Option(i, i));

        async function cargarDatos() {
            try {
                const res = await fetch(`${scriptURL}?action=busqueda`);
                const json = await res.json();
                todosLosDatos = json.data;
                document.getElementById('statusCarga').parentElement.innerHTML = "";
                buscarDatos();
            } catch (e) { document.getElementById('statusCarga').innerText = "Error cargando datos."; }
        }
        cargarDatos();

        function buscarDatos() {
            const txt = document.getElementById('searchInput').value.toLowerCase();
            const dia = document.getElementById('diaFilter').value;
            const container = document.getElementById('resultados');
            container.innerHTML = "";

            if(!todosLosDatos.length) return;

            const filtrados = todosLosDatos.filter(obj => {
                const n = (obj.datos[0] + " " + obj.datos[1]).toLowerCase();
                const d = String(obj.datos[3]);
                return (txt === "" || n.includes(txt)) && (dia === "" || d === dia);
            });

            if(filtrados.length === 0) { container.innerHTML = "<div class='col-span-full text-center py-10 text-slate-400'>No se encontraron resultados 🔍</div>"; return; }

            filtrados.forEach(obj => {
                const [nom, ape, edad, dia, cel, etapa, mz, lt] = obj.datos;
                const fila = obj.fila;
                const diaBadge = dia ? `<span class="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs font-bold">📅 Día ${dia}</span>` : "";
                const celBadge = cel ? `<span class="text-green-600 font-bold text-xs flex items-center gap-1"><i class="ph ph-whatsapp-logo"></i> ${cel}</span>` : "";
                const direccionFull = `${etapa||"Sin Etapa"} ${mz?`Mz ${mz}`:""} ${lt?`Lt ${lt}`:""}`.trim();

                const cardHTML = `
                <div class="bg-white p-5 rounded-2xl shadow-sm hover:shadow-md border border-slate-100 transition group relative">
                    <div class="flex justify-between items-start">
                        <div>
                            <h3 class="font-bold text-slate-800 text-lg capitalize leading-tight">${nom} ${ape}</h3>
                            <div class="flex flex-wrap gap-2 mt-2">
                                ${diaBadge}
                                <span class="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-xs font-bold">🎂 ${edad || "?"} años</span>
                            </div>
                            <div class="mt-3 flex items-start gap-1.5 text-slate-500 text-sm bg-slate-50 p-2 rounded-lg border border-slate-100">
                                <i class="ph ph-map-pin text-blue-500 mt-0.5"></i>
                                <span class="font-medium">${direccionFull}</span>
                            </div>
                            <div class="mt-2 ml-1">${celBadge}</div>
                        </div>
                    </div>
                    <div class="flex gap-2 mt-4 pt-4 border-t border-slate-50">
                        <button onclick="intentarEditar(${fila}, '${nom}', '${ape}', '${edad}', '${dia}', '${cel}', '${etapa||""}', '${mz||""}', '${lt||""}')" 
                            class="flex-1 bg-yellow-50 text-yellow-600 hover:bg-yellow-100 py-2 rounded-xl text-sm font-bold transition flex items-center justify-center gap-1"><i class="ph ph-pencil-simple"></i> Editar</button>
                        <button onclick="intentarBorrar(${fila}, '${nom} ${ape}')" 
                            class="flex-1 bg-red-50 text-red-500 hover:bg-red-100 py-2 rounded-xl text-sm font-bold transition flex items-center justify-center gap-1"><i class="ph ph-trash"></i> Borrar</button>
                    </div>
                </div>`;
                container.innerHTML += cardHTML;
            });
        }

        function cerrarModal(id) { document.getElementById(id).classList.add('hidden'); }

        // --- FUNCIÓN PARA GENERAR LINK DE WHATSAPP ---
        function prepararWhatsApp(nombre, accion) {
            // Mensaje: "Hola Admin, quiero editar el usuario: Juan Perez. Motivo: "
            const mensaje = `Hola Admin, quiero *${accion}* el registro de: *${nombre.toUpperCase()}*.\n\n📝 *Motivo:* `;
            const link = `https://wa.me/${NUMERO_ADMIN}?text=${encodeURIComponent(mensaje)}`;
            document.getElementById('btnWspAdmin').href = link;
        }

        // BORRAR
        let filaABorrar = null;
        function intentarBorrar(fila, nombre) {
            if (!ES_ADMIN) { 
                prepararWhatsApp(nombre, "ELIMINAR"); // Prepara el link
                document.getElementById('modalDenegado').classList.remove('hidden'); 
                return; 
            }
            filaABorrar = fila;
            document.getElementById('txtBorrarNombre').innerText = nombre;
            document.getElementById('modalBorrar').classList.remove('hidden');
        }
        document.getElementById('btnConfirmarBorrar').addEventListener('click', () => {
             const btn = document.getElementById('btnConfirmarBorrar');
             btn.innerText = "Eliminando..."; btn.disabled = true;
             fetch(`${scriptURL}?action=borrar&fila=${filaABorrar}`, { method: 'POST' }).then(() => location.reload());
        });

        // EDITAR
        function intentarEditar(fila, nom, ape, edad, dia, cel, etapa, mz, lt) {
            if (!ES_ADMIN) { 
                prepararWhatsApp(`${nom} ${ape}`, "EDITAR"); // Prepara el link
                document.getElementById('modalDenegado').classList.remove('hidden'); 
                return; 
            }
            
            document.getElementById('editFila').value = fila;
            document.getElementById('editNombre').value = nom;
            document.getElementById('editApellido').value = ape;
            document.getElementById('editEdad').value = (edad === "undefined") ? "" : edad;
            document.getElementById('editCelular').value = (cel === "undefined") ? "" : cel;
            document.getElementById('editDia').value = (dia === "undefined") ? "" : dia;
            document.getElementById('editEtapa').value = (etapa === "undefined") ? "" : etapa;
            document.getElementById('editMz').value = (mz === "undefined") ? "" : mz;
            document.getElementById('editLt').value = (lt === "undefined") ? "" : lt;

            document.getElementById('modalEditar').classList.remove('hidden');
        }

        document.getElementById('formEditar').addEventListener('submit', e => {
            e.preventDefault();
            const btn = document.getElementById('btnGuardarEdit');
            const original = btn.innerHTML;
            btn.innerHTML = '<i class="ph ph-spinner animate-spin"></i> Guardando...'; btn.disabled = true;

            const fd = {
                f: document.getElementById('editFila').value,
                n: document.getElementById('editNombre').value,
                a: document.getElementById('editApellido').value,
                e: document.getElementById('editEdad').value,
                c: document.getElementById('editCelular').value,
                d: document.getElementById('editDia').value,
                et: document.getElementById('editEtapa').value,
                mz: document.getElementById('editMz').value,
                lt: document.getElementById('editLt').value
            };

            const url = `${scriptURL}?action=editar&fila=${fd.f}&nombre=${fd.n}&apellido=${fd.a}&edad=${fd.e}&dia=${fd.d}&celular=${fd.c}&etapa=${fd.et}&mz=${fd.mz}&lt=${fd.lt}`;

            fetch(url, { method: 'POST' })
            .then(() => location.reload())
            .catch(() => { btn.innerHTML = original; btn.disabled = false; alert("Error"); });
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