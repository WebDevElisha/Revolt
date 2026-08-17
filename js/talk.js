import { initializeApp } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut, updateProfile } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-auth.js";
import { getFirestore, collection, addDoc, serverTimestamp, query, orderBy, onSnapshot, doc, setDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js";

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
const mainAuthBtn = document.getElementById('main-auth-btn');
const authSubtitle = document.getElementById('auth-subtitle');
const toggleAuthMode = document.getElementById('toggle-auth-mode');
const logoutBtn = document.getElementById('logout-btn');
const messagesContainer = document.getElementById('messages-container');
const messageInput = document.getElementById('message-input');
const sendBtn = document.getElementById('send-btn');
const usersList = document.getElementById('users-list');
const totalUsers = document.getElementById('total-users');

let isLoginMode = true;
let messagesUnsubscribe = null;
let usersUnsubscribe = null;

toggleAuthMode.addEventListener('click', () => {
    isLoginMode = !isLoginMode;
    
    if (isLoginMode) {
        authSubtitle.textContent = "Sign in to your existing account.";
        usernameInput.classList.add('hidden');
        mainAuthBtn.textContent = "Log In";
        toggleAuthMode.innerHTML = 'Need an account? <span>Sign Up</span>';
    } else {
        authSubtitle.textContent = "Create an account to get started.";
        usernameInput.classList.remove('hidden');
        mainAuthBtn.textContent = "Sign Up";
        toggleAuthMode.innerHTML = 'Already have an account? <span>Log In</span>';
    }
});

mainAuthBtn.addEventListener('click', async () => {
    const email = emailInput.value;
    const password = passwordInput.value;

    if (isLoginMode) {
        try {
            await signInWithEmailAndPassword(auth, email, password);
        } catch (error) {
            alert(error.message);
        }
    } else {
        const username = usernameInput.value;
        if (!username) {
            alert("Please enter a username.");
            return;
        }
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            await updateProfile(userCredential.user, { displayName: username });
            await setDoc(doc(db, "online_users", userCredential.user.uid), {
                username: username
            });
        } catch (error) {
            alert(error.message);
        }
    }
});

logoutBtn.addEventListener('click', async () => {
    if (auth.currentUser) {
        await deleteDoc(doc(db, "online_users", auth.currentUser.uid));
    }
    signOut(auth);
});

window.addEventListener('beforeunload', () => {
    if (auth.currentUser) {
        deleteDoc(doc(db, "online_users", auth.currentUser.uid));
    }
});

function initChat() {
    const q = query(collection(db, "messages"), orderBy("timestamp", "asc"));
    messagesUnsubscribe = onSnapshot(q, (snapshot) => {
        messagesContainer.innerHTML = '';
        snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            const msgEl = document.createElement('div');
            const isMe = data.uid === auth.currentUser.uid;
            msgEl.className = `message ${isMe ? 'me' : 'other'}`;
            msgEl.innerHTML = `
                <div class="sender">${data.sender || 'Unknown'}</div>
                <div class="text">${data.text}</div>
            `;
            messagesContainer.appendChild(msgEl);
        });
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    });

    const usersQuery = query(collection(db, "online_users"));
    usersUnsubscribe = onSnapshot(usersQuery, (snapshot) => {
        usersList.innerHTML = '';
        let count = 0;
        snapshot.forEach((docSnap) => {
            count++;
            const data = docSnap.data();
            const userEl = document.createElement('div');
            userEl.className = 'user-item';
            userEl.innerHTML = `
                <div class="user-status"></div>
                <span>${data.username || 'Unknown'}</span>
            `;
            usersList.appendChild(userEl);
        });
        totalUsers.textContent = `Total Users: ${count}`;
    });
}

function stopChat() {
    if (messagesUnsubscribe) {
        messagesUnsubscribe();
        messagesUnsubscribe = null;
    }
    if (usersUnsubscribe) {
        usersUnsubscribe();
        usersUnsubscribe = null;
    }
    messagesContainer.innerHTML = '';
    usersList.innerHTML = '';
    totalUsers.textContent = 'Total Users: 0';
}

sendBtn.addEventListener('click', async () => {
    const text = messageInput.value.trim();
    if (text && auth.currentUser) {
        try {
            await addDoc(collection(db, "messages"), {
                text: text,
                sender: auth.currentUser.displayName || emailInput.value.split('@')[0],
                uid: auth.currentUser.uid,
                timestamp: serverTimestamp()
            });
            messageInput.value = '';
        } catch (error) {
            console.error("Error sending message: ", error);
        }
    }
});

messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendBtn.click();
    }
});

onAuthStateChanged(auth, async (user) => {
    if (user) {
        authSection.classList.add('hidden');
        chatSection.style.display = 'flex';
        
        await setDoc(doc(db, "online_users", user.uid), {
            username: user.displayName || user.email.split('@')[0]
        });
        
        initChat();
    } else {
        authSection.classList.remove('hidden');
        chatSection.style.display = 'none';
        emailInput.value = '';
        passwordInput.value = '';
        usernameInput.value = '';
        
        isLoginMode = true;
        authSubtitle.textContent = "Sign in to your existing account.";
        usernameInput.classList.add('hidden');
        mainAuthBtn.textContent = "Log In";
        toggleAuthMode.innerHTML = 'Need an account? <span>Sign Up</span>';
        
        stopChat();
    }
});
