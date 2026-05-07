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
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const database = firebase.database();

// Selección del formulario
const registerForm = document.getElementById('registerForm');

registerForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const phone = document.getElementById('phone').value;
    const isReseller = document.getElementById('isReseller').checked;

    // Crear el usuario en Firebase Authentication
    auth.createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
            const user = userCredential.user;

            // Crear datos del usuario
            const userData = {
                email,
                name,
                phone,
                isTeacher: isReseller ? "1" : "0",
                limiteDemos: 0,
                limiteUsuarios: 0
            };

            // Guardar en "usuarios"
            database.ref('usuarios/' + user.uid).set(userData)
                .then(() => console.log("Usuario guardado en usuarios correctamente."))
                .catch((error) => console.error("Error al guardar en usuarios:", error));

            // Guardar en "Admin" si es revendedor
            if (isReseller) {
                database.ref('Admin/' + user.uid).set(userData)
                    .then(() => console.log("Usuario guardado en Admin correctamente."))
                    .catch((error) => console.error("Error al guardar en Admin:", error));
            }

            // Alerta al finalizar el proceso
            alert('Cuenta creada exitosamente');
        })
        .catch((error) => {
            console.error('Error al crear la cuenta:', error);
            alert('Error: ' + error.message);
        });
});