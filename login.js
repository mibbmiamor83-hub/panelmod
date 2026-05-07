import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// Your web app's Firebase configuration
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

const submit = document.getElementById("submit");

// Cargar datos del almacenamiento local (si existen)
window.addEventListener("load", () => {
    const savedEmail = localStorage.getItem("email");
    const savedPassword = localStorage.getItem("password");
    if (savedEmail) document.getElementById("email").value = savedEmail;
    if (savedPassword) document.getElementById("password").value = savedPassword;
});

submit.addEventListener("click", function (event) {
    event.preventDefault();

    // Get email and password values after clicking the submit button
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    // Check if email and password are not empty
    if (email.trim() === "" || password.trim() === "") {
        alert("Email and password cannot be empty");
        return;
    }

    // Check if the email is in the correct format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        alert("Invalid email format");
        return;
    }

    // Check if the password is at least 6 characters long
    if (password.length < 6) {
        alert("Password must be at least 6 characters long");
        return;
    }

    // Sign in with email and password
    signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            const user = userCredential.user;

            // Guardar el correo y la contraseña en el almacenamiento local
            localStorage.setItem("email", email);
            localStorage.setItem("password", password);

            alert("Logging in...");
            window.location.href = "panel.html";
        })
        .catch((error) => {
            const errorMessage = error.message;
            alert(errorMessage);
        });
});
