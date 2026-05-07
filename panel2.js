import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
    getAuth,
    createUserWithEmailAndPassword,
    onAuthStateChanged,
    signOut,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import {
    getDatabase,
    ref,
    get,
    set,
    update,
    onValue,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

// Configuración de Firebase
const firebaseConfig = {
    apiKey: "AIzaSyADcEYKamrewxL8CDA8NmAuRZjp8eZ2XzY",
    authDomain: "femon-play.firebaseapp.com",
    databaseURL: "femon-play-default-rtdb.firebaseio.com",
    projectId: "femon-play",
    storageBucket: "femon-play.firebasestorage.app",
    messagingSenderId: "887768250224",
    appId: "1:63456783638:android:1e18d5484b58fc1411f437"
};

// Inicializar Firebase
const adminApp = initializeApp(firebaseConfig);
const adminAuth = getAuth(adminApp);
const database = getDatabase(adminApp);
const secondaryApp = initializeApp(firebaseConfig, 'secondary');
const secondaryAuth = getAuth(secondaryApp);

// Elementos de la interfaz
const userUIDElement = document.getElementById("userUID");
const limiteUsuariosElement = document.getElementById("limiteUsuarios");
const logoutButton = document.getElementById("logout");
const totalUsuariosElement = document.getElementById("totalUsuarios");
const usuariosActivosElement = document.getElementById("usuariosActivos");
const usuariosVencidosElement = document.getElementById("usuariosVencidos");
const totalUsuariosDetalle = document.getElementById("totalUsuariosDetalle");
const usuariosActivosDetalle = document.getElementById("usuariosActivosDetalle");
const usuariosVencidosDetalle = document.getElementById("usuariosVencidosDetalle");
const totalUsuariosBar = document.getElementById("totalUsuariosBar");
const usuariosActivosBar = document.getElementById("usuariosActivosBar");
const usuariosVencidosBar = document.getElementById("usuariosVencidosBar");
const totalUsuariosTrend = document.getElementById("totalUsuariosTrend");
const usuariosActivosTrend = document.getElementById("usuariosActivosTrend");
const usuariosVencidosTrend = document.getElementById("usuariosVencidosTrend");
const receiptAction = document.getElementById("receiptAction");
const receiptNote = document.getElementById("receiptNote");
const viewReceiptButton = document.getElementById("viewReceiptButton");
const downloadReceiptButton = document.getElementById("downloadReceiptButton");
const adminMessageModal = document.getElementById("admin-message-modal");
const adminMessageText = document.getElementById("admin-message-text");

let ultimoComprobanteGenerado = null;
let detachAdminMessageListener = null;

if (viewReceiptButton) {
    viewReceiptButton.addEventListener("click", () => {
        if (!ultimoComprobanteGenerado) {
            alert("No hay comprobante disponible todavía.");
            return;
        }
        abrirComprobanteEnVentana(ultimoComprobanteGenerado);
    });
}

if (downloadReceiptButton) {
    downloadReceiptButton.addEventListener("click", () => {
        if (!ultimoComprobanteGenerado) {
            alert("No hay comprobante disponible todavía.");
            return;
        }
        descargarComprobante(ultimoComprobanteGenerado);
    });
}

function showAdminMessage(text) {
    if (!adminMessageModal || !adminMessageText) return;
    adminMessageText.textContent = text;
    adminMessageModal.setAttribute("aria-hidden", "false");
    adminMessageModal.style.display = "flex";
    document.body.style.overflow = "hidden";
}

function hideAdminMessage() {
    if (!adminMessageModal || !adminMessageText) return;
    adminMessageText.textContent = "";
    adminMessageModal.setAttribute("aria-hidden", "true");
    adminMessageModal.style.display = "none";
    document.body.style.overflow = "";
}

let adminUID = null;
let adminLimite = 0;

// Verificar límite de usuarios disponibles
async function verificarLimiteDisponible(duracion) {
    if (!adminUID) return false;
    
    try {
        const adminRef = ref(database, `Admin/${adminUID}`);
        const snapshot = await get(adminRef);
        
        if (snapshot.exists()) {
            const adminData = snapshot.val();
            const limite = parseInt(adminData.limiteUsuarios, 10);
            return limite >= duracion;
        }
        return false;
    } catch (error) {
        console.error("Error al verificar límite:", error);
        return false;
    }
}

// Actualizar límite de usuarios
async function actualizarLimiteUsuarios(duracion, unidad) {
    if (!adminUID) {
        console.error("Admin UID no está definido.");
        return false;
    }

    const adminRef = ref(database, `Admin/${adminUID}`);

    try {
        const snapshot = await get(adminRef);
        if (snapshot.exists()) {
            const adminData = snapshot.val();
            let nuevoLimite = parseInt(adminData.limiteUsuarios, 10);

            if (typeof nuevoLimite !== 'number' || isNaN(nuevoLimite)) {
                console.error("'limiteUsuarios' no es un número válido.");
                return false;
            }

            if (unidad === 'meses') {
                if (nuevoLimite >= duracion) {
                    nuevoLimite -= duracion;
                    await update(adminRef, { limiteUsuarios: nuevoLimite });
                    adminLimite = nuevoLimite;
                    limiteUsuariosElement.textContent = nuevoLimite;
                    return true;
                }
            }
            return false;
        }
        console.error("No se encontró el administrador en la base de datos.");
        return false;
    } catch (error) {
        console.error("Error actualizando límite:", error);
        return false;
    }
}

// Crear cuenta de usuario
window.crearCuenta = async function(duracion, unidad) {
    // Verificar límite disponible antes de crear la cuenta
    if (unidad === 'meses') {
        const tieneCreditos = await verificarLimiteDisponible(duracion);
        if (!tieneCreditos) {
            alert("No tienes créditos suficientes para crear esta cuenta.");
            return;
        }
    }

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!email || !password) {
        alert("Por favor, complete todos los campos.");
        return;
    }

    if (password.length < 6) {
        alert("La contraseña debe tener al menos 6 caracteres.");
        return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        alert("Formato de correo electrónico inválido.");
        return;
    }

    try {
        // Calcular fechas
        const fechas = calcularFechas(duracion, unidad);
        
        // Intentar actualizar el límite primero si es una cuenta por meses
        if (unidad === 'meses') {
            const limiteActualizado = await actualizarLimiteUsuarios(duracion, unidad);
            if (!limiteActualizado) {
                alert("No hay créditos suficientes para crear la cuenta.");
                return;
            }
        }

        // Crear usuario con la instancia secundaria
        const userCredential = await createUserWithEmailAndPassword(secondaryAuth, email, password);
        const nuevoUsuario = userCredential.user;

        // Guardar datos del usuario en la base de datos
        const userRef = ref(database, `usuarios/${nuevoUsuario.uid}`);
        await set(userRef, {
            email,
            password,
            creacion: fechas.creacion,
            benzymyentou: fechas.vencimiento,
            idv: adminUID,
            deviceID: null
        });

        await secondaryAuth.signOut();

        // Copiar credenciales al portapapeles
        const credenciales = `Correo: ${email}\nContraseña: ${password}`;
        const textarea = document.createElement("textarea");
        textarea.value = credenciales;
        document.body.appendChild(textarea);
        textarea.select();
        
        if (document.execCommand("copy")) {
            alert("Cuenta creada exitosamente. Las credenciales se han copiado al portapapeles.");
        } else {
            alert("Cuenta creada exitosamente, pero no se pudieron copiar las credenciales automáticamente.");
        }

        document.body.removeChild(textarea);
        document.getElementById("email").value = "";
        document.getElementById("password").value = "";

        const unidadLabel = unidad === "meses"
            ? `${duracion} ${duracion === 1 ? "mes" : "meses"}`
            : `${duracion} ${duracion === 1 ? "hora" : "horas"}`;

        guardarComprobante({
            tipo: unidad === "meses" ? "Creación de cuenta" : "Creación de cuenta demo",
            correo: email,
            password,
            vencimiento: fechas.vencimiento,
            creacion: fechas.creacion,
            operacion: fechas.creacion,
            detalle: `Duración contratada: ${unidadLabel}.`
        });

        await actualizarEstadisticas();

    } catch (error) {
        console.error("Error al crear cuenta:", error);
        alert("Error al crear la cuenta: " + error.message);
        try {
            await secondaryAuth.signOut();
        } catch (signOutError) {
            console.error("Error durante la limpieza:", signOutError);
        }
    }
};

// Calcular fechas de creación y vencimiento
function calcularFechas(duracion, unidad) {
    const fechaCreacion = new Date();
    const fechaVencimiento = new Date();

    if (unidad === 'meses') {
        fechaVencimiento.setMonth(fechaVencimiento.getMonth() + duracion);
    } else if (unidad === 'horas') {
        fechaVencimiento.setHours(fechaVencimiento.getHours() + duracion);
    }

    return {
        creacion: formatDate(fechaCreacion),
        vencimiento: formatDate(fechaVencimiento)
    };
}

// Formatear fecha
function formatDate(date) {
    return (
        `${date.getDate().toString().padStart(2, '0')}/` +
        `${(date.getMonth() + 1).toString().padStart(2, '0')}/` +
        `${date.getFullYear()} ` +
        `${date.getHours().toString().padStart(2, '0')}:` +
        `${date.getMinutes().toString().padStart(2, '0')}:` +
        `${date.getSeconds().toString().padStart(2, '0')}`
    );
}

function guardarComprobante(datos) {
    ultimoComprobanteGenerado = datos;

    if (receiptAction) {
        receiptAction.hidden = false;
    }

    if (receiptNote && typeof datos?.tipo === "string") {
        receiptNote.textContent = `Último comprobante: ${datos.tipo}.`;
    }
}

function abrirComprobanteEnVentana(datos) {
    const comprobante = datos || ultimoComprobanteGenerado;

    if (!comprobante) {
        alert("No hay comprobante disponible.");
        return;
    }

    const popup = window.open("", "_blank", "width=520,height=720");

    if (!popup) {
        alert("No se pudo abrir el comprobante. Habilita las ventanas emergentes e inténtalo nuevamente.");
        return;
    }

    popup.document.write(generarHTMLComprobante(comprobante));
    popup.document.close();
}

function descargarComprobante(datos) {
    const comprobante = datos || ultimoComprobanteGenerado;

    if (!comprobante) {
        alert("No hay comprobante disponible.");
        return;
    }

    try {
        const contenido = generarHTMLComprobante(comprobante);
        const blob = new Blob([contenido], { type: "text/html;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const enlace = document.createElement("a");
        const timestamp = new Date().toISOString().replace(/[:.]/g, "-");

        enlace.href = url;
        enlace.download = `comprobante-femon-${timestamp}.html`;

        document.body.appendChild(enlace);
        enlace.click();
        document.body.removeChild(enlace);

        setTimeout(() => {
            URL.revokeObjectURL(url);
        }, 0);
    } catch (error) {
        console.error("No se pudo descargar el comprobante:", error);
        alert("No se pudo descargar el comprobante. Inténtalo nuevamente.");
    }
}

function generarHTMLComprobante(datos) {
    const safe = (value) => escapeHtml(typeof value === "string" ? value : value == null ? "" : String(value));
    const rows = [];

    const correo = datos.correo ?? datos.usuario;

    if (correo) {
        rows.push({ label: "Correo", value: correo });
    }

    rows.push({ label: "Contraseña", value: datos.password });
    rows.push({ label: "Vencimiento", value: datos.vencimiento });

    if (datos.creacion) {
        rows.push({ label: "Creación", value: datos.creacion });
    }

    const rowsHtml = rows
        .filter((row) => row.value != null && row.value !== "")
        .map(
            (row) => `
                <div class="row">
                    <span>${safe(row.label)}</span>
                    <strong>${safe(row.value)}</strong>
                </div>
            `
        )
        .join("");

    const detalleHtml = datos.detalle
        ? `<p class="note">${safe(datos.detalle)}</p>`
        : "";

    const fechaOperacionHtml = datos.operacion
        ? `<p class="note"><strong>Fecha de emisión:</strong> ${safe(datos.operacion)}</p>`
        : "";

    return `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Comprobante FEMON</title>
    <style>
        :root {
            color-scheme: light dark;
        }
        body {
            margin: 0;
            font-family: 'Poppins', 'Segoe UI', sans-serif;
            background: #0a1438;
            background: linear-gradient(165deg, #050924, #0a1438 45%, #020513 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: clamp(24px, 6vw, 48px) clamp(16px, 5vw, 32px);
            color: #f5f7ff;
            font-size: clamp(0.95rem, 2.5vw, 1rem);
        }
        .receipt-card {
            width: min(520px, 100%);
            max-width: 520px;
            background: rgba(17, 24, 64, 0.92);
            border-radius: 24px;
            padding: clamp(24px, 6vw, 36px) clamp(20px, 6vw, 32px);
            border: 1px solid rgba(255, 255, 255, 0.12);
            box-shadow: 0 25px 60px rgba(5, 12, 55, 0.45);
        }
        .receipt-card h1 {
            margin: 18px 0 6px;
            font-size: clamp(1.5rem, 4vw, 1.8rem);
        }
        .receipt-type {
            margin: 0 0 18px;
            color: rgba(245, 247, 255, 0.75);
            font-weight: 500;
            font-size: clamp(1rem, 2.8vw, 1.1rem);
        }
        .logo {
            width: clamp(140px, 40vw, 180px);
            height: auto;
            display: block;
            margin: 0 auto;
        }
        .info {
            margin-top: 20px;
            padding: clamp(16px, 4.5vw, 22px);
            border-radius: 18px;
            background: rgba(9, 15, 56, 0.65);
            border: 1px solid rgba(255, 255, 255, 0.12);
        }
        .row {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            gap: 12px;
            padding: 10px 0;
            border-bottom: 1px solid rgba(255, 255, 255, 0.08);
            flex-wrap: wrap;
        }
        .row:last-child {
            border-bottom: none;
        }
        .row span {
            color: rgba(245, 247, 255, 0.75);
            font-weight: 500;
            flex: 1 1 160px;
        }
        .row strong {
            font-weight: 600;
            color: #ffe36d;
            word-break: break-word;
            flex: 1 1 180px;
        }
        .note {
            margin: 14px 0 0;
            color: rgba(245, 247, 255, 0.78);
            font-size: 0.95rem;
        }
        .footer {
            margin-top: 24px;
            font-size: 0.85rem;
            color: rgba(245, 247, 255, 0.6);
            text-align: center;
        }
        @media (max-width: 480px) {
            body {
                font-size: 1rem;
            }
            .receipt-card {
                border-radius: 20px;
            }
            .row {
                flex-direction: column;
                align-items: flex-start;
                gap: 6px;
            }
            .row span,
            .row strong {
                flex: 1 1 auto;
                width: 100%;
                text-align: left;
            }
            .logo {
                margin-bottom: 12px;
            }
        }
    </style>
</head>
<body>
    <div class="receipt-card">
        <img src="femonplay-logo.png" alt="Logo de FEMON" class="logo" />
        <h1>Comprobante</h1>
        <p class="receipt-type">${safe(datos.tipo || "Operación")}</p>
        ${detalleHtml}
        ${fechaOperacionHtml}
        <div class="info">
            ${rowsHtml}
        </div>
        <p class="footer">Guarda este comprobante para tus registros.</p>
    </div>
</body>
</html>`;
}

function escapeHtml(value) {
    return value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

function parseDateString(dateString) {
    if (!dateString || typeof dateString !== "string") {
        return null;
    }

    try {
        const cleaned = dateString.replace(",", "").trim();
        const [datePart, timePart = "00:00:00"] = cleaned.split(" ");
        const [day, month, year] = datePart.split("/").map((value) => value.padStart(2, "0"));
        const timeSegments = timePart.split(":");

        while (timeSegments.length < 3) {
            timeSegments.push("00");
        }

        const [hours, minutes, seconds] = timeSegments;
        const isoDate = `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
        const parsedDate = new Date(isoDate);

        return Number.isNaN(parsedDate.getTime()) ? null : parsedDate;
    } catch (error) {
        console.error("No se pudo analizar la fecha", dateString, error);
        return null;
    }
}

function formatHour(date) {
    return `${date.getHours().toString().padStart(2, "0")}:${date
        .getMinutes()
        .toString()
        .padStart(2, "0")}`;
}

function formatNumber(value) {
    return new Intl.NumberFormat("es-ES").format(value);
}

async function actualizarEstadisticas() {
    if (!adminUID) {
        return;
    }

    try {
        const usuariosRef = ref(database, "usuarios");
        const snapshot = await get(usuariosRef);
        const ahora = new Date();

        let total = 0;
        let activos = 0;
        let vencidos = 0;

        if (snapshot.exists()) {
            const usuarios = snapshot.val();
            for (const key in usuarios) {
                const usuario = usuarios[key];
                if (usuario && usuario.idv === adminUID) {
                    total += 1;
                    const fechaVencimiento = parseDateString(usuario.benzymyentou);
                    if (fechaVencimiento && fechaVencimiento.getTime() >= ahora.getTime()) {
                        activos += 1;
                    } else {
                        vencidos += 1;
                    }
                }
            }
        }

        if (activos + vencidos > total) {
            vencidos = Math.min(vencidos, total);
            activos = Math.max(0, total - vencidos);
        }

        const totalPosible = total + Math.max(adminLimite, 0);
        const usoPorcentaje = totalPosible > 0 ? Math.round((total / totalPosible) * 100) : 0;
        const activosPorcentaje = total > 0 ? Math.round((activos / total) * 100) : 0;
        const vencidosPorcentaje = total > 0 ? Math.round((vencidos / total) * 100) : 0;

        const horaActual = formatHour(ahora);

        totalUsuariosElement.textContent = formatNumber(total);
        usuariosActivosElement.textContent = formatNumber(activos);
        usuariosVencidosElement.textContent = formatNumber(vencidos);

        if (totalUsuariosDetalle) {
            totalUsuariosDetalle.textContent = `Créditos disponibles: ${formatNumber(Math.max(adminLimite, 0))}`;
        }
        if (usuariosActivosDetalle) {
            usuariosActivosDetalle.textContent = `${activosPorcentaje}% del total`;
        }
        if (usuariosVencidosDetalle) {
            usuariosVencidosDetalle.textContent = `${vencidosPorcentaje}% del total`;
        }

        if (totalUsuariosBar) {
            totalUsuariosBar.style.width = `${Math.min(usoPorcentaje, 100)}%`;
        }
        if (usuariosActivosBar) {
            usuariosActivosBar.style.width = `${Math.min(activosPorcentaje, 100)}%`;
        }
        if (usuariosVencidosBar) {
            usuariosVencidosBar.style.width = `${Math.min(vencidosPorcentaje, 100)}%`;
        }

        if (totalUsuariosTrend) {
            totalUsuariosTrend.textContent = `Actualizado ${horaActual}`;
        }
        if (usuariosActivosTrend) {
            usuariosActivosTrend.textContent = `Actualizado ${horaActual}`;
        }
        if (usuariosVencidosTrend) {
            usuariosVencidosTrend.textContent = `Actualizado ${horaActual}`;
        }
    } catch (error) {
        console.error("Error al calcular estadísticas:", error);
    }
}

// Detectar cambios en el estado de autenticación
onAuthStateChanged(adminAuth, async (user) => {
    if (detachAdminMessageListener) {
        detachAdminMessageListener();
        detachAdminMessageListener = null;
    }

    if (user) {
        adminUID = user.uid;
        userUIDElement.textContent = `Admin UID: ${adminUID}`;

        const adminRef = ref(database, `Admin/${adminUID}`);
        const snapshot = await get(adminRef);
        if (snapshot.exists()) {
            const adminData = snapshot.val();
            adminLimite = parseInt(adminData.limiteUsuarios, 10) || 0;
            limiteUsuariosElement.textContent = adminData.limiteUsuarios;
        }

        const messageRef = ref(database, `adminMessages/${adminUID}`);
        detachAdminMessageListener = onValue(
            messageRef,
            (snapshot) => {
                const data = snapshot.val();
                let messageText = "";

                if (typeof data === "string") {
                    messageText = data;
                } else if (data && typeof data.text === "string") {
                    messageText = data.text;
                }

                const cleaned = messageText.trim();
                if (cleaned) {
                    showAdminMessage(cleaned);
                } else {
                    hideAdminMessage();
                }
            },
            (error) => {
                console.error("Error al obtener mensaje del administrador:", error);
                hideAdminMessage();
            }
        );

        await actualizarEstadisticas();
    } else {
        hideAdminMessage();
        window.location.href = "index.html";
    }
});

// Función para cerrar sesión
logoutButton?.addEventListener("click", () => {
    signOut(adminAuth)
        .then(() => {
            window.location.href = "index.html";
        })
        .catch((error) => {
            console.error("Error al cerrar sesión:", error);
        });
});