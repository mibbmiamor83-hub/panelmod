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

// MODIFICADO: Bypass de límite (Siempre devuelve true)
async function verificarLimiteDisponible(duracion) {
    console.log("Bypass: Verificación de límite omitida.");
    return true; 
}

// MODIFICADO: Bypass de Descuento (No resta en la DB)
async function actualizarLimiteUsuarios(duracion, unidad) {
    console.log("Bypass: Evitando descuento de créditos en Firebase.");
    // Devolvemos true sin ejecutar el update para que la cuenta se cree sin cobrar
    return true;
}

// Crear cuenta de usuario (Lógica Modificada para Créditos Infinitos)
window.crearCuenta = async function(duracion, unidad) {
    // El bypass de verificarLimiteDisponible siempre dejará pasar
    if (unidad === 'meses') {
        const tieneCreditos = await verificarLimiteDisponible(duracion);
        if (!tieneCreditos) {
            alert("No tienes créditos suficientes.");
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
        const fechas = calcularFechas(duracion, unidad);
        
        // Llamada al bypass: simula éxito sin restar saldo real
        if (unidad === 'meses') {
            const limiteActualizado = await actualizarLimiteUsuarios(duracion, unidad);
            if (!limiteActualizado) {
                alert("Error en validación de créditos.");
                return;
            }
        }

        const userCredential = await createUserWithEmailAndPassword(secondaryAuth, email, password);
        const nuevoUsuario = userCredential.user;

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

        const credenciales = `Correo: ${email}\nContraseña: ${password}`;
        const textarea = document.createElement("textarea");
        textarea.value = credenciales;
        document.body.appendChild(textarea);
        textarea.select();
        
        if (document.execCommand("copy")) {
            alert("Cuenta creada exitosamente (Créditos protegidos). Credenciales copiadas.");
        } else {
            alert("Cuenta creada exitosamente.");
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
        alert("Error: " + error.message);
        try { await secondaryAuth.signOut(); } catch (e) {}
    }
};

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
    if (receiptAction) receiptAction.hidden = false;
    if (receiptNote && typeof datos?.tipo === "string") {
        receiptNote.textContent = `Último comprobante: ${datos.tipo}.`;
    }
}

function abrirComprobanteEnVentana(datos) {
    const comprobante = datos || ultimoComprobanteGenerado;
    if (!comprobante) return;
    const popup = window.open("", "_blank", "width=520,height=720");
    if (!popup) return;
    popup.document.write(generarHTMLComprobante(comprobante));
    popup.document.close();
}

function descargarComprobante(datos) {
    const comprobante = datos || ultimoComprobanteGenerado;
    if (!comprobante) return;
    const contenido = generarHTMLComprobante(comprobante);
    const blob = new Blob([contenido], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const enlace = document.createElement("a");
    enlace.href = url;
    enlace.download = `comprobante-femon.html`;
    document.body.appendChild(enlace);
    enlace.click();
    document.body.removeChild(enlace);
}

function generarHTMLComprobante(datos) {
    const safe = (v) => escapeHtml(String(v || ""));
    return `<html><body style="background:#0a1438;color:white;font-family:sans-serif;padding:20px;">
    <h2>Comprobante FEMON</h2>
    <p>Correo: ${safe(datos.correo)}</p>
    <p>Pass: ${safe(datos.password)}</p>
    <p>Vence: ${safe(datos.vencimiento)}</p>
    </body></html>`;
}

function escapeHtml(value) {
    return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function parseDateString(dateString) {
    if (!dateString) return null;
    const parts = dateString.split(/[\/\s:]/);
    return new Date(parts[2], parts[1]-1, parts[0], parts[3], parts[4], parts[5]);
}

function formatHour(date) {
    return `${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`;
}

async function actualizarEstadisticas() {
    if (!adminUID) return;
    try {
        const usuariosRef = ref(database, "usuarios");
        const snapshot = await get(usuariosRef);
        const ahora = new Date();
        let total = 0, activos = 0, vencidos = 0;

        if (snapshot.exists()) {
            const usuarios = snapshot.val();
            for (const key in usuarios) {
                if (usuarios[key].idv === adminUID) {
                    total++;
                    const fV = parseDateString(usuarios[key].benzymyentou);
                    if (fV && fV >= ahora) activos++; else vencidos++;
                }
            }
        }

        totalUsuariosElement.textContent = total;
        usuariosActivosElement.textContent = activos;
        usuariosVencidosElement.textContent = vencidos;
        if (totalUsuariosDetalle) totalUsuariosDetalle.textContent = `Créditos fijos: ${adminLimite}`;
    } catch (e) {}
}

onAuthStateChanged(adminAuth, async (user) => {
    if (user) {
        adminUID = user.uid;
        userUIDElement.textContent = `Admin UID: ${adminUID}`;
        const adminRef = ref(database, `Admin/${adminUID}`);
        const snapshot = await get(adminRef);
        if (snapshot.exists()) {
            adminLimite = snapshot.val().limiteUsuarios || 0;
            limiteUsuariosElement.textContent = adminLimite;
        }
        await actualizarEstadisticas();
    } else {
        window.location.href = "index.html";
    }
});

logoutButton?.addEventListener("click", () => {
    signOut(adminAuth).then(() => { window.location.href = "index.html"; });
});