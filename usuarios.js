import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getDatabase, ref, get, update, remove } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

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

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);

const listaUsuarios = document.getElementById("listaUsuarios");
const buscarCorreo = document.getElementById("buscarCorreo");

let adminUID = null;

// Verificar si el administrador está autenticado
onAuthStateChanged(auth, (user) => {
    if (user) {
        adminUID = user.uid;
        cargarUsuarios();
    } else {
        alert("No estás autenticado. Redirigiendo...");
        window.location.href = "index.html";
    }
});

// Verificar límite de usuarios disponibles
async function verificarLimiteDisponible() {
    if (!adminUID) return false;
    
    try {
        const adminRef = ref(database, `Admin/${adminUID}`);
        const snapshot = await get(adminRef);
        
        if (snapshot.exists()) {
            const adminData = snapshot.val();
            const limite = parseInt(adminData.limiteUsuarios, 10);
            return limite > 0;
        }
        return false;
    } catch (error) {
        console.error("Error al verificar límite:", error);
        return false;
    }
}

// Actualizar límite de usuarios
async function actualizarLimiteUsuarios() {
    if (!adminUID) return false;

    try {
        const adminRef = ref(database, `Admin/${adminUID}`);
        const snapshot = await get(adminRef);
        
        if (snapshot.exists()) {
            const adminData = snapshot.val();
            let nuevoLimite = parseInt(adminData.limiteUsuarios, 10);
            
            if (nuevoLimite > 0) {
                nuevoLimite--;
                await update(adminRef, { limiteUsuarios: nuevoLimite });
                return true;
            }
        }
        return false;
    } catch (error) {
        console.error("Error al actualizar límite:", error);
        return false;
    }
}

// Función para convertir fechas al formato correcto sin comas
function convertirFecha(fechaStr) {
    try {
        const [dia, mes, anioHora] = fechaStr.split("/");
        const [anio, hora] = anioHora.split(" ");
        const fechaISO = `${anio}-${mes}-${dia}T${hora}`;
        const fecha = new Date(fechaISO);

        if (isNaN(fecha.getTime())) throw new Error("Formato inválido");

        return `${fecha.getDate().toString().padStart(2, "0")}/${(fecha.getMonth() + 1)
            .toString()
            .padStart(2, "0")}/${fecha.getFullYear()} ${fecha
            .getHours()
            .toString()
            .padStart(2, "0")}:${fecha.getMinutes().toString().padStart(2, "0")}:${fecha
            .getSeconds()
            .toString()
            .padStart(2, "0")}`;
    } catch {
        return null;
    }
}

// Cargar usuarios creados por el administrador
async function cargarUsuarios() {
    const usuariosRef = ref(database, "usuarios");
    const snapshot = await get(usuariosRef);

    if (snapshot.exists()) {
        const usuarios = snapshot.val();
        listaUsuarios.innerHTML = "";

        for (const uid in usuarios) {
            const usuario = usuarios[uid];
            if (usuario.idv === adminUID && usuario.email) {
                const usuarioDiv = document.createElement("div");
                usuarioDiv.classList.add("usuario");

                const fechaCreacion = convertirFecha(usuario.creacion);
                // Se lee la fecha desde el campo 'benzymyentou'
                const fechaVencimiento = convertirFecha(usuario.benzymyentou);

                usuarioDiv.innerHTML = `
                    <p>Correo: ${usuario.email || "No disponible"}</p>
                    <p>Vencimiento: ${fechaVencimiento || "Fecha inválida"}</p>
                    <p>Contraseña: ${usuario.password}</p>
                    <p>Creación: ${fechaCreacion || "Fecha inválida"}</p>
                    <hr />
                `;
                usuarioDiv.addEventListener("contextmenu", (e) => mostrarOpciones(e, uid, usuario));
                listaUsuarios.appendChild(usuarioDiv);
            }
        }

        if (listaUsuarios.innerHTML === "") {
            listaUsuarios.innerHTML = "<p>No se encontraron usuarios con correo electrónico.</p>";
        }
    } else {
        listaUsuarios.innerHTML = "<p>No se encontraron usuarios creados por este administrador.</p>";
    }
}

// Mostrar opciones al hacer clic derecho
function mostrarOpciones(event, uid, usuario) {
    event.preventDefault();

    const menusExistentes = document.querySelectorAll(".menu-contextual");
    menusExistentes.forEach(menu => menu.remove());

    const menu = document.createElement("div");
    menu.classList.add("menu-contextual");
    menu.innerHTML = `
        <!-- Se pasa el campo 'benzymyentou' en lugar de 'vencimiento' -->
        <button onclick="renovarCuenta('${uid}', '${usuario.benzymyentou}')">Renovar Cuenta</button>
        <button onclick="eliminarDeviceID('${uid}')">Reiniciar Device ID</button>
        <button onclick="copiarUsuario('${usuario.email}', '${usuario.password}')">Copiar Usuario Creado</button>
        <button onclick="eliminarCuenta('${uid}')">Eliminar Cuenta</button>
    `;
    document.body.appendChild(menu);

    menu.style.top = `${event.clientY}px`;
    menu.style.left = `${event.clientX}px`;

    document.addEventListener("click", () => menu.remove(), { once: true });
}

// Función para renovar cuenta
async function renovarCuenta(uid, vencimientoActual) {
    const tieneCreditos = await verificarLimiteDisponible();
    if (!tieneCreditos) {
        alert("No tienes créditos disponibles para renovar la cuenta.");
        return;
    }

    try {
        const vencimientoLimpio = vencimientoActual.replace(",", "");
        const [dia, mes, anioHora] = vencimientoLimpio.split("/");
        const [anio, hora] = anioHora.split(" ");
        const fechaActual = new Date(`${anio}-${mes}-${dia}T${hora}`);

        if (isNaN(fechaActual.getTime())) {
            throw new Error("Fecha de vencimiento inválida.");
        }

        fechaActual.setMonth(fechaActual.getMonth() + 1);

        const nuevaFecha = `${fechaActual.getDate().toString().padStart(2, "0")}/${(fechaActual.getMonth() + 1)
            .toString()
            .padStart(2, "0")}/${fechaActual.getFullYear()} ${fechaActual
            .getHours()
            .toString()
            .padStart(2, "0")}:${fechaActual.getMinutes().toString().padStart(2, "0")}:${fechaActual
            .getSeconds()
            .toString()
            .padStart(2, "0")}`;

        const limiteActualizado = await actualizarLimiteUsuarios();
        if (!limiteActualizado) {
            alert("No se pudo actualizar el límite de usuarios. La renovación ha sido cancelada.");
            return;
        }

        const usuarioRef = ref(database, `usuarios/${uid}`);
        // Se actualiza el campo 'benzymyentou' en lugar de 'vencimiento'
        await update(usuarioRef, { benzymyentou: nuevaFecha });

        alert(`Cuenta renovada. Nuevo vencimiento: ${nuevaFecha}`);
        cargarUsuarios();
    } catch (error) {
        console.error("Error al renovar cuenta:", error.message);
        alert("No se pudo renovar la cuenta. Verifica el formato de la fecha.");
    }
}

// Función para eliminar Device ID
async function eliminarDeviceID(uid) {
    try {
        const deviceIDRef = ref(database, `usuarios/${uid}/deviceID`);
        await remove(deviceIDRef);

        alert("Device ID eliminado exitosamente.");
        cargarUsuarios();
    } catch (error) {
        console.error("Error al eliminar Device ID:", error);
        alert("No se pudo eliminar el Device ID. Intenta de nuevo.");
    }
}

// Función para copiar usuario creado
function copiarUsuario(email, password) {
    const texto = `Correo: ${email}\nContraseña: ${password}`;
    const textarea = document.createElement("textarea");
    textarea.value = texto;
    document.body.appendChild(textarea);
    textarea.select();

    if (document.execCommand("copy")) {
        alert("Usuario copiado al portapapeles.");
    } else {
        alert("Error al intentar copiar el contenido. Asegúrese de que el navegador permita el acceso al portapapeles.");
    }

    document.body.removeChild(textarea);
}

// Función para eliminar cuenta
async function eliminarCuenta(uid) {
    if (confirm("¿Estás seguro de que deseas eliminar la cuenta? Esto eliminará el campo de correo electrónico del usuario.")) {
        try {
            const emailRef = ref(database, `usuarios/${uid}/email`);
            await remove(emailRef);

            alert("Cuenta eliminada exitosamente (campo 'email' eliminado).");
            cargarUsuarios();
        } catch (error) {
            console.error("Error al eliminar cuenta:", error);
            alert("No se pudo eliminar la cuenta. Intenta de nuevo.");
        }
    }
}

// Hacer que las funciones estén disponibles globalmente
window.renovarCuenta = renovarCuenta;
window.eliminarDeviceID = eliminarDeviceID;
window.copiarUsuario = copiarUsuario;
window.eliminarCuenta = eliminarCuenta;

// Filtrar usuarios por correo electrónico
buscarCorreo.addEventListener("input", () => {
    const filtro = buscarCorreo.value.toLowerCase();
    const usuarios = document.querySelectorAll(".usuario");

    usuarios.forEach((usuario) => {
        const correo = usuario.querySelector("p:first-child").textContent.toLowerCase();
        usuario.style.display = correo.includes(filtro) ? "" : "none";
    });
});
