const scriptURL = 'https://script.google.com/macros/s/AKfycbxLXduf1p_8rNXSy-uvgsvy_lHR8xWD0EYD2Wv98nr8Y_42WilL_xNZEoS9-WReE48U/exec'; // ⚠️ URL AQUI

// --- ALERTAS ---
function mostrarAlerta(mensaje) {
    document.getElementById('textoAlerta').innerText = mensaje;
    document.getElementById('modalAlerta').classList.remove('hidden');
}
function cerrarAlerta() {
    document.getElementById('modalAlerta').classList.add('hidden');
}

// --- CONFIGURACION ---
const diaSelect = document.getElementById('diaSelect');
for (let i = 1; i <= 30; i++) diaSelect.add(new Option(`Día ${i}`, i));
document.getElementById('fechaReunion').valueAsDate = new Date();

let todosLosDatos = [];
let listaVisible = [];

// --- CARGAR BD Y MOSTRAR AUTOMÁTICAMENTE ---
async function descargarBD() {
    try {
        const res = await fetch(`${scriptURL}?action=busqueda`);
        const json = await res.json();
        todosLosDatos = json.data;

        // UNA VEZ CARGADO, LLAMAMOS DIRECTAMENTE A BUSCAR (Sin filtros, muestra todo)
        buscarParticipantes();

    } catch (e) { mostrarAlerta("Error de conexión"); }
}
descargarBD();

// --- BUSCADOR FLEXIBLE ---
function buscarParticipantes() {
    const texto = document.getElementById('buscadorNombre').value.toLowerCase();
    const dia = diaSelect.value;
    const contenedor = document.getElementById('listaAsistencia');

    if (todosLosDatos.length === 0) return; // Si aún carga, no hace nada visualmente

    // 1. FILTRADO
    const filtrados = todosLosDatos.filter(u => {
        const nombreCompleto = (u.datos[0] + " " + u.datos[1]).toLowerCase();
        const grupoUsuario = String(u.datos[3]);

        const matchTexto = texto === "" || nombreCompleto.includes(texto);
        const matchDia = dia === "" || grupoUsuario === dia;

        return matchTexto && matchDia;
    });

    // 2. SINCRONIZACIÓN DE ESTADO
    // Truco: Queremos mantener el estado (PRESENTE/FALTA) si ya lo marcamos, 
    // pero si es nuevo en la vista, empieza en NULL (Neutro).

    // Creamos un mapa temporal de los IDs actuales
    const estadoPrevio = {};
    listaVisible.forEach(item => {
        estadoPrevio[item.idUnico] = item.estado;
    });

    // Reconstruimos listaVisible con los filtrados
    listaVisible = filtrados.map(u => {
        // Generamos un ID único basado en fila excel para rastrear
        const id = u.fila;
        return {
            info: u.datos,
            fila: u.fila,
            idUnico: id,
            // Si ya tenía estado, lo mantenemos. Si no, empieza en null (Neutro)
            estado: estadoPrevio[id] || null
        };
    });

    renderizarLista();
    document.getElementById('panelGuardar').classList.remove('hidden');
}

function renderizarLista() {
    const contenedor = document.getElementById('listaAsistencia');
    contenedor.innerHTML = "";

    if (listaVisible.length === 0) {
        contenedor.innerHTML = "<div class='text-center py-10 text-slate-400'>No se encontraron personas.</div>";
        return;
    }

    // Contador
    contenedor.innerHTML = `<p class="text-xs font-bold text-slate-400 px-2 mb-2 text-right">${listaVisible.length} personas</p>`;

    listaVisible.forEach((item, index) => {
        const [nom, ape, edad, dia] = item.info;
        const estado = item.estado;

        // Clases dinámicas
        const claseBtnAsistio = estado === 'ASISTIO' ? 'btn-activo-asistio' : 'btn-inactivo';
        const claseBtnFalto = estado === 'FALTO' ? 'btn-activo-falto' : 'btn-inactivo';

        const diaBadge = dia ? `<span class="text-[10px] bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded font-bold ml-2">Día ${dia}</span>` : "";

        const fila = `
                <div class="item-animado bg-white p-4 rounded-2xl shadow-sm border border-slate-100 mb-3 group">
                    <div class="flex items-center justify-between mb-3">
                        <div class="flex items-center gap-3">
                            <div class="w-10 h-10 rounded-full bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 font-bold">
                                ${nom.charAt(0)}
                            </div>
                            <div>
                                <h4 class="font-bold text-slate-700 capitalize text-lg leading-tight flex items-center">
                                    ${nom} ${ape}
                                </h4>
                                ${diaBadge}
                            </div>
                        </div>
                    </div>
                    
                    <div class="flex gap-2">
                        <button onclick="cambiarEstado(${index}, 'ASISTIO')" class="flex-1 py-3 rounded-xl font-bold text-xs border-2 transition-all duration-200 flex items-center justify-center gap-1 ${claseBtnAsistio}">
                            <i class="ph ph-check-circle text-lg"></i> PRESENTE
                        </button>
                        <button onclick="cambiarEstado(${index}, 'FALTO')" class="flex-1 py-3 rounded-xl font-bold text-xs border-2 transition-all duration-200 flex items-center justify-center gap-1 ${claseBtnFalto}">
                            <i class="ph ph-x-circle text-lg"></i> FALTA
                        </button>
                    </div>
                </div>`;
        contenedor.innerHTML += fila;
    });
}

function cambiarEstado(index, nuevoEstado) {
    // Si tocan el mismo botón que ya estaba activo, lo desmarcan (vuelve a neutro)
    if (listaVisible[index].estado === nuevoEstado) {
        listaVisible[index].estado = null;
    } else {
        listaVisible[index].estado = nuevoEstado;
    }
    renderizarLista();
}

function guardarReunion() {
    const btn = document.getElementById('btnGuardar');
    const fechaInput = document.getElementById('fechaReunion').value;
    const tema = document.getElementById('temaReunion').value;

    if (!fechaInput) { mostrarAlerta("📅 Falta la fecha"); return; }
    if (!tema) { mostrarAlerta("📝 Selecciona el motivo de la asamblea"); return; }

    const fechaObj = new Date(fechaInput + "T00:00:00");
    const mesStr = fechaObj.toLocaleString('es-ES', { month: 'long' });
    const anioStr = fechaObj.getFullYear();
    const fechaStr = fechaObj.toLocaleDateString('es-ES');

    // Recopilar datos (¡OJO! Guardamos SOLO lo visible en el filtro o TODO? 
    // Lo lógico en una reunión general es guardar TODO el array 'todosLosDatos', no solo lo filtrado.
    // Pero para ser seguros, guardaremos lo que el usuario está viendo y manipulando en 'listaVisible'.
    // SI quieres guardar A TODOS aunque no los veas, deberíamos usar 'todosLosDatos' y mapear el estado.
    // Haremos una mezcla: Iteramos 'listaVisible' para enviar lo que vemos.

    const filasParaEnviar = listaVisible.map(u => {
        // Si el estado es NULL (no tocó nada), asumimos FALTO
        const estadoFinal = u.estado || 'FALTO';

        return [fechaStr, mesStr, anioStr, tema, u.info[3], u.info[0], u.info[1], estadoFinal];
    });

    btn.innerHTML = '<i class="ph ph-spinner animate-spin text-2xl"></i> Guardando...';
    btn.disabled = true;

    fetch(`${scriptURL}?action=guardarReunion`, {
        method: 'POST',
        body: JSON.stringify({ action: 'guardarReunion', datos: filasParaEnviar })
    })
        .then(res => res.json())
        .then(data => {
            if (data.result === "success") document.getElementById('modalExito').classList.remove('hidden');
            else { mostrarAlerta("❌ Error en el servidor"); btn.disabled = false; btn.innerHTML = "Reintentar"; }
        })
        .catch(e => { mostrarAlerta("❌ Error de conexión"); btn.disabled = false; btn.innerHTML = "Reintentar"; });
}