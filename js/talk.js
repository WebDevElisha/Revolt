import { initializeApp } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut, updateProfile } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyBy1UzC4LqJKq5APWErR-wVG0fp6vDOKjA",
    authDomain: "revolt-17d9e.firebaseapp.com",
    projectId: "revolt-17d9e",
    storageBucket: "revolt-17d9e.firebasestorage.app",
    messagingSenderId: "487309195882",
    appId: "1:487309195882:web:17222edab9a8c25768a813"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const authSection = document.getElementById('auth-section');
const chatSection = document.getElementById('chat-section');
const usernameInput = document.getElementById('username-input');
const emailInput = document.getElementById('email-input');
const passwordInput = document.getElementById('password-input');
const loginBtn = document.getElementById('login-btn');
const signupBtn = document.getElementById('signup-btn');
const logoutBtn = document.getElementById('logout-btn');

signupBtn.addEventListener('click', () => {
    const email = emailInput.value;
    const password = passwordInput.value;
    const username = usernameInput.value;

    if (!username) {
        alert("Please enter a username to sign up.");
        return;
    }

    createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            updateProfile(userCredential.user, {
                displayName: username
            });
        })
        .catch((error) => {
            alert(error.message);
        });
});

loginBtn.addEventListener('click', () => {
    const email = emailInput.value;
    const password = passwordInput.value;

    signInWithEmailAndPassword(auth, email, password)
        .catch((error) => {
            alert(error.message);
        });
});

logoutBtn.addEventListener('click', () => {
    signOut(auth);
});

onAuthStateChanged(auth, (user) => {
    if (user) {
        authSection.classList.add('hidden');
        chatSection.style.display = 'flex';
    } else {
        authSection.classList.remove('hidden');
        chatSection.style.display = 'none';
        emailInput.value = '';
        passwordInput.value = '';
        usernameInput.value = '';
    }
});
