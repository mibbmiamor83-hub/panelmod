<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Panel de Administrador</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            background-color: #f4f7f9;
            color: #333;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            margin: 0;
            padding: 20px;
            box-sizing: border-box;
        }
        .container {
            background-color: white;
            padding: 2em;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            max-width: 600px;
            width: 100%;
        }
        /* Estilos del Login */
        #login-container h1 { color: #333; }
        #login-form { display: flex; flex-direction: column; gap: 1em; }
        #login-form input { padding: 12px; border: 1px solid #ccc; border-radius: 4px; font-size: 16px; }
        #login-form button { background-color: #1a73e8; color: white; padding: 12px; border: none; border-radius: 4px; font-size: 16px; cursor: pointer; }
        #login-form button:hover { background-color: #1558b8; }
        #login-error { color: #d9534f; margin-top: 10px; min-height: 1em; }

        /* Estilos del Panel */
        #panel-container h1 { color: #1a73e8; border-bottom: 2px solid #e0e0e0; padding-bottom: 0.5em; }
        .auth-status { display: flex; justify-content: space-between; align-items: center; background-color: #e8f0fe; padding: 10px; border-radius: 4px; margin-bottom: 1.5em; }
        #logout-button { background: none; border: 1px solid #1a73e8; color: #1a73e8; padding: 8px 12px; border-radius: 4px; cursor: pointer; }
        #logout-button:hover { background: #d2e3fc; }
        .warning { background-color: #fffbe6; border: 1px solid #ffe58f; padding: 1em; border-radius: 4px; margin: 1.5em 0; }
        .controls { margin-bottom: 1.5em; padding: 1em; border: 1px solid #ddd; border-radius: 4px; }
        label { display: flex; align-items: center; font-weight: bold; cursor: pointer; }
        input[type="checkbox"] { margin-right: 10px; width: 18px; height: 18px; }
        #resetButton { background-color: #d9534f; color: white; border: none; padding: 12px 20px; border-radius: 5px; font-size: 16px; cursor: pointer; width: 100%; margin-top: 1em; }
        #resetButton:hover { background-color: #c9302c; }
        #resetButton:disabled { background-color: #ccc; cursor: not-allowed; }
        #logOutput { background-color: #2d2d2d; color: #f0f0f0; padding: 1em; border-radius: 4px; white-space: pre-wrap; word-wrap: break-word; min-height: 100px; max-height: 300px; overflow-y: auto; font-family: "Courier New", Courier, monospace; }
        
        /* Visibilidad */
        .hidden { display: none; }
    </style>
</head>
<body>

    <div class="container">
        <!-- Contenedor del Login (Visible al inicio) -->
        <div id="login-container">
            <h1>Iniciar Sesión - Admin</h1>
            <form id="login-form">
                <input type="email" id="email" placeholder="Correo Electrónico" required>
                <input type="password" id="password" placeholder="Contraseña" required>
                <button type="submit" id="login-button">Ingresar</button>
                <p id="login-error"></p>
            </form>
        </div>

        <!-- Contenedor del Panel (Oculto al inicio) -->
        <div id="panel-container" class="hidden">
            <div class="auth-status">
                <span>Conectado como: <strong id="user-email"></strong></span>
                <button id="logout-button">Cerrar Sesión</button>
            </div>
            <h1>Panel de Control de Device ID</h1>
            <p>Este panel permite reiniciar (eliminar) el campo <strong>deviceID</strong> de todos los usuarios.</p>
            <div class="warning">
                <strong>¡Atención!</strong> Esta acción es destructiva y no se puede deshacer. Úsala con precaución.
            </div>
            <div class="controls">
                <label>
                    <input type="checkbox" id="dryRunCheckbox" checked>
                    Activar Modo Prueba (no se harán cambios reales)
                </label>
                <p style="font-size: 0.9em; color: #666; margin-top: 5px;">
                    Si está marcado, solo se mostrará qué usuarios serían afectados. Desmarca para aplicar los cambios.
                </p>
                <button id="resetButton">Reiniciar TODOS los Device IDs</button>
            </div>
            <h3>Registro de Actividad:</h3>
            <pre id="logOutput">Inicia sesión para usar el panel...</pre>
        </div>
    </div>

    <script type="module">
        // Importaciones de Firebase SDK v10
        import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
        import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
        import { getDatabase, ref, get, set } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

        // TU Configuración de Firebase
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
        const app = initializeApp(firebaseConfig);
        const auth = getAuth(app);
        const db = getDatabase(app);

        // Referencias a los elementos del DOM
        const loginContainer = document.getElementById('login-container');
        const panelContainer = document.getElementById('panel-container');
        const loginForm = document.getElementById('login-form');
        const loginButton = document.getElementById('login-button');
        const loginError = document.getElementById('login-error');
        const userEmailSpan = document.getElementById('user-email');
        const logoutButton = document.getElementById('logout-button');
        
        const resetButton = document.getElementById('resetButton');
        const dryRunCheckbox = document.getElementById('dryRunCheckbox');
        const logOutput = document.getElementById('logOutput');

        // --- MANEJO DE AUTENTICACIÓN ---

        // Observador que reacciona a los cambios de estado de login
        onAuthStateChanged(auth, (user) => {
            if (user) {
                // Usuario ha iniciado sesión
                loginContainer.classList.add('hidden');
                panelContainer.classList.remove('hidden');
                userEmailSpan.textContent = user.email;
                logOutput.textContent = "¡Sesión iniciada! Listo para operar.";
            } else {
                // Usuario ha cerrado sesión o no está logueado
                panelContainer.classList.add('hidden');
                loginContainer.classList.remove('hidden');
                logOutput.textContent = "Inicia sesión para usar el panel...";
            }
        });

        // Evento para el formulario de login
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            
            loginButton.disabled = true;
            loginButton.textContent = 'Ingresando...';
            loginError.textContent = '';

            signInWithEmailAndPassword(auth, email, password)
                .then((userCredential) => {
                    // El observador onAuthStateChanged se encargará de mostrar el panel
                    console.log("Login exitoso:", userCredential.user.email);
                })
                .catch((error) => {
                    loginError.textContent = `Error: ${error.code.replace('auth/', '')}`;
                    console.error("Error de login:", error);
                })
                .finally(() => {
                    loginButton.disabled = false;
                    loginButton.textContent = 'Ingresar';
                });
        });

        // Evento para cerrar sesión
        logoutButton.addEventListener('click', () => {
            signOut(auth).catch(error => console.error("Error al cerrar sesión:", error));
        });


        // --- LÓGICA DEL PANEL ---

        const log = (message) => {
            console.log(message);
            logOutput.textContent += message + '\n';
            logOutput.scrollTop = logOutput.scrollHeight; // Auto-scroll
        };

        const resetAllDeviceIDs = async () => {
            const isDryRun = dryRunCheckbox.checked;
            resetButton.disabled = true;
            logOutput.textContent = ''; // Limpiar registro

            if (isDryRun) {
                log('--- INICIANDO EN MODO PRUEBA (NO SE HARÁN CAMBIOS) ---');
            } else {
                if (!confirm('¿Estás seguro de que quieres ELIMINAR PERMANENTEMENTE los deviceID de TODOS los usuarios?')) {
                    log('Operación cancelada.');
                    resetButton.disabled = false;
                    return;
                }
                log('--- INICIANDO EN MODO REAL (APLICANDO CAMBIOS) ---');
            }

            const usersRef = ref(db, 'usuarios');
            let usersProcessed = 0, usersAffected = 0;
            
            try {
                const snapshot = await get(usersRef);
                if (!snapshot.exists()) {
                    log('No se encontró el nodo "usuarios" en la base de datos.');
                    return;
                }

                const usersData = snapshot.val();
                const uids = Object.keys(usersData);
                const updatePromises = [];
                log(`Se encontraron ${uids.length} usuarios. Analizando...`);

                for (const uid of uids) {
                    usersProcessed++;
                    if (usersData[uid] && typeof usersData[uid].deviceID !== 'undefined') {
                        usersAffected++;
                        const deviceIdPath = `usuarios/${uid}/deviceID`;
                        
                        if (isDryRun) {
                            log(`[PRUEBA] Se eliminaría el campo en: ${deviceIdPath}`);
                        } else {
                            log(`[REAL] Eliminando campo en: ${deviceIdPath}`);
                            updatePromises.push(set(ref(db, deviceIdPath), null));
                        }
                    }
                }

                if (!isDryRun && updatePromises.length > 0) {
                    log(`\nEjecutando ${updatePromises.length} operaciones de borrado...`);
                    await Promise.all(updatePromises);
                    log('¡Operaciones completadas con éxito!');
                }

            } catch (error) {
                log(`\n--- ERROR ---`);
                log(`Ocurrió un error: ${error.message}`);
                log('Verifica los permisos de tu base de datos y que estés autenticado.');
                console.error(error);
            } finally {
                log(`\n--- PROCESO COMPLETADO ---`);
                log(`Usuarios analizados: ${usersProcessed}`);
                log(`Usuarios afectados: ${usersAffected}`);
                resetButton.disabled = false;
            }
        };

        resetButton.addEventListener('click', resetAllDeviceIDs);
    </script>

</body>
</html>