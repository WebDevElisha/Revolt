import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc, collection, addDoc, query, where, orderBy, onSnapshot, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

lucide.createIcons();

const authContainer = document.getElementById('auth-container');
const appContainer = document.getElementById('app-container');
const authForm = document.getElementById('auth-form');
const authError = document.getElementById('auth-error');
const logoutBtn = document.getElementById('logout-btn');

const roomItems = document.querySelectorAll('.room-item');
const currentRoomName = document.getElementById('current-room-name');
const chatForm = document.getElementById('chat-form');
const chatInput = document.getElementById('chat-input');
const messagesContainer = document.getElementById('chat-messages');
const onlineUsersList = document.getElementById('online-users-list');

let currentUser = null;
let currentRoom = "Revolt room 1";
let unsubMessages = null;
let unsubUsers = null;

onAuthStateChanged(auth, async (user) => {
    if (user) {
        currentUser = user;
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
            const userData = userDoc.data();
            document.getElementById('my-username').textContent = userData.username;
            document.getElementById('my-pfp').src = userData.pfp;
            
            await setDoc(doc(db, "users", user.uid), { online: true }, { merge: true });
        }
        
        authContainer.classList.add('hidden');
        appContainer.classList.remove('hidden');
        
        loadMessages();
        listenToOnlineUsers();
    } else {
        if (currentUser) {
            await setDoc(doc(db, "users", currentUser.uid), { online: false }, { merge: true });
        }
        currentUser = null;
        authContainer.classList.remove('hidden');
        appContainer.classList.add('hidden');
        if (unsubMessages) unsubMessages();
        if (unsubUsers) unsubUsers();
    }
});

authForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    authError.textContent = '';
    
    const username = document.getElementById('username-input').value.trim();
    const email = document.getElementById('email-input').value.trim();
    const password = document.getElementById('password-input').value;
    const fileInput = document.getElementById('pfp-input');
    
    if (!fileInput.files[0]) {
        authError.textContent = "Profile picture required.";
        return;
    }

    try {
        const reader = new FileReader();
        reader.onload = async (e) => {
            const base64Img = e.target.result;
            
            try {
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                await setDoc(doc(db, "users", userCredential.user.uid), {
                    username: username,
                    email: email,
                    pfp: base64Img,
                    online: true
                });
            } catch (err) {
                if (err.code === 'auth/email-already-in-use') {
                    await signInWithEmailAndPassword(auth, email, password);
                    await setDoc(doc(db, "users", auth.currentUser.uid), { online: true }, { merge: true });
                } else {
                    authError.textContent = err.message;
                }
            }
        };
        reader.readAsDataURL(fileInput.files[0]);
    } catch (err) {
        authError.textContent = err.message;
    }
});

logoutBtn.addEventListener('click', () => {
    signOut(auth);
});

roomItems.forEach(item => {
    item.addEventListener('click', () => {
        roomItems.forEach(i => i.classList.remove('active'));
        item.classList.add('active');
        currentRoom = item.getAttribute('data-room');
        currentRoomName.textContent = currentRoom;
        loadMessages();
    });
});

chatForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const text = chatInput.value.trim();
    if (!text || !currentUser) return;
    
    chatInput.value = '';
    
    const userDoc = await getDoc(doc(db, "users", currentUser.uid));
    const userData = userDoc.data();

    await addDoc(collection(db, "messages"), {
        room: currentRoom,
        text: text,
        uid: currentUser.uid,
        username: userData.username,
        pfp: userData.pfp,
        timestamp: serverTimestamp()
    });
});

function loadMessages() {
    if (unsubMessages) unsubMessages();
    
    const q = query(
        collection(db, "messages"),
        where("room", "==", currentRoom),
        orderBy("timestamp", "asc")
    );

    unsubMessages = onSnapshot(q, (snapshot) => {
        messagesContainer.innerHTML = '';
        snapshot.forEach((doc) => {
            const data = doc.data();
            const time = data.timestamp ? new Date(data.timestamp.toDate()).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'Sending...';
            
            const msgDiv = document.createElement('div');
            msgDiv.className = 'message-wrapper';
            msgDiv.innerHTML = `
                <img src="${data.pfp}" class="message-pfp" alt="PFP">
                <div class="message-content">
                    <div class="message-header">
                        <span class="message-author">${data.username}</span>
                        <span class="message-time">${time}</span>
                    </div>
                    <div class="message-text">${data.text}</div>
                </div>
            `;
            messagesContainer.appendChild(msgDiv);
        });
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    });
}

function listenToOnlineUsers() {
    if (unsubUsers) unsubUsers();
    
    const q = query(collection(db, "users"), where("online", "==", true));
    
    unsubUsers = onSnapshot(q, (snapshot) => {
        onlineUsersList.innerHTML = '';
        snapshot.forEach((doc) => {
            const data = doc.data();
            const userDiv = document.createElement('div');
            userDiv.className = 'user-card';
            userDiv.innerHTML = `
                <img src="${data.pfp}" alt="PFP">
                <span>${data.username}</span>
                <div class="status-dot"></div>
            `;
            onlineUsersList.appendChild(userDiv);
        });
    });
}
