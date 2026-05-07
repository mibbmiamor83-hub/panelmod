// firebase-config.js
// -----------------------------------------------------------------------------
// Este módulo centraliza la inicialización de Firebase utilizando la sintaxis
// modular de la versión 9+. Se encarga de exponer las instancias compartidas
// de autenticación y base de datos que serán reutilizadas por el login y el
// panel, evitando inicializaciones duplicadas.
// -----------------------------------------------------------------------------

import {
    getApp,
    getApps,
    initializeApp,
} from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import {
    getAuth,
    browserSessionPersistence,
    inMemoryPersistence,
    setPersistence,
} from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-database.js";

// Configuración del proyecto. El valor de databaseURL DEBE incluir el protocolo
// https:// para que los SDK puedan resolver correctamente el host del Realtime
// Database. Sin el protocolo, las peticiones fallan y no se recuperan datos.
const firebaseConfig = {
    apiKey: "AIzaSyADcEYKamrewxL8CDA8NmAuRZjp8eZ2XzY",
    authDomain: "femon-play.firebaseapp.com",
    databaseURL: "https://femon-play-default-rtdb.firebaseio.com",
    projectId: "femon-play",
    storageBucket: "femon-play.firebasestorage.app",
    messagingSenderId: "887768250224",
    appId: "1:63456783638:android:1e18d5484b58fc1411f437",
};

// App principal: usada para autenticar al administrador y leer datos protegidos.
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);

// La persistencia de sesión mantiene la autenticación activa mientras dure la
// pestaña del navegador, evitando conflictos con cuentas de Google abiertas en
// otras ventanas o perfiles del navegador.
setPersistence(auth, browserSessionPersistence).catch((error) => {
    console.error("No se pudo establecer la persistencia de sesión para Auth:", error);
});

// Instancia del Realtime Database ligada al proyecto anterior.
const database = getDatabase(app);

// App secundaria: se usa únicamente para crear cuentas de clientes sin cerrar la
// sesión del administrador autenticado en la app principal.
const secondaryApp =
    getApps().find((firebaseApp) => firebaseApp.name === "secondary") ||
    initializeApp(firebaseConfig, "secondary");
const secondaryAuth = getAuth(secondaryApp);

// Para la app secundaria basta con una persistencia en memoria; así evitamos
// contaminar el almacenamiento local del navegador con sesiones adicionales.
setPersistence(secondaryAuth, inMemoryPersistence).catch((error) => {
    console.warn("Persistencia en memoria no disponible para la app secundaria:", error);
});

export { auth, database, secondaryAuth };
