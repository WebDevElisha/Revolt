lucide.createIcons();

const chatHistory = document.getElementById('chat-history');
const inputForm = document.getElementById('ai-input-form');
const userInput = document.getElementById('ai-user-input');
const btnNewChat = document.getElementById('btn-new-chat');
const savedChatsList = document.getElementById('saved-chats-list');

let chats = [];
let activeChatId = null;

function init() {
    createNewChat('Current Chat');
}

function createNewChat(title = null) {
    const id = `chat-${Date.now()}`;
    const chatTitle = title || `Chat ${chats.length + 1}`;
    
    const newChat = {
        id,
        title: chatTitle,
        messages: [
            { type: 'system-msg', text: 'Revolt AI initialized. How can I assist you today?' }
        ]
    };

    chats.push(newChat);
    renderChatList();
    switchChat(id);
}

function switchChat(id) {
    activeChatId = id;
    renderChatList();
    renderMessages();
}

function deleteChat(id, e) {
    e.stopPropagation();
    chats = chats.filter(c => c.id !== id);

    if (chats.length === 0) {
        createNewChat();
    } else {
        if (activeChatId === id) {
            switchChat(chats[chats.length - 1].id);
        } else {
            renderChatList();
        }
    }
}

function renameChat(id, e) {
    e.stopPropagation();
    const chat = chats.find(c => c.id === id);
    if (!chat) return;

    const newTitle = prompt('Enter new chat name:', chat.title);
    if (newTitle && newTitle.trim()) {
        chat.title = newTitle.trim();
        renderChatList();
    }
}

function renderChatList() {
    savedChatsList.innerHTML = '';

    chats.forEach(chat => {
        const item = document.createElement('div');
        item.className = `chat-item ${chat.id === activeChatId ? 'active' : ''}`;
        
        item.innerHTML = `
            <div class="chat-item-left">
                <i data-lucide="message-square"></i>
                <span class="chat-item-title">${chat.title}</span>
            </div>
            <div class="chat-actions">
                <button class="action-btn btn-rename" title="Rename">
                    <i data-lucide="edit-3"></i>
                </button>
                <button class="action-btn btn-delete" title="Delete">
                    <i data-lucide="trash-2"></i>
                </button>
            </div>
        `;

        item.addEventListener('click', () => switchChat(chat.id));
        
        const renameBtn = item.querySelector('.btn-rename');
        const deleteBtn = item.querySelector('.btn-delete');

        renameBtn.addEventListener('click', (e) => renameChat(chat.id, e));
        deleteBtn.addEventListener('click', (e) => deleteChat(chat.id, e));

        savedChatsList.appendChild(item);
    });

    lucide.createIcons({ root: savedChatsList });
}

function renderMessages() {
    chatHistory.innerHTML = '';
    const activeChat = chats.find(c => c.id === activeChatId);
    if (!activeChat) return;

    activeChat.messages.forEach(msg => {
        const msgDiv = document.createElement('div');
        msgDiv.className = `message ${msg.type}`;
        
        const p = document.createElement('p');
        p.textContent = msg.text;
        
        msgDiv.appendChild(p);
        chatHistory.appendChild(msgDiv);
    });

    chatHistory.scrollTop = chatHistory.scrollHeight;
}

function addMessageToActiveChat(text, type) {
    const activeChat = chats.find(c => c.id === activeChatId);
    if (!activeChat) return null;

    activeChat.messages.push({ type, text });
    renderMessages();
}

inputForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const text = userInput.value.trim();
    if (!text) return;

    addMessageToActiveChat(text, 'user-msg');
    userInput.value = '';

    addMessageToActiveChat('Thinking...', 'ai-msg');

    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ prompt: text })
        });

        const data = await response.json();

        const activeChat = chats.find(c => c.id === activeChatId);
        if (activeChat && activeChat.messages.length) {
            if (response.ok) {
                activeChat.messages[activeChat.messages.length - 1].text = data.reply;
            } else {
                activeChat.messages[activeChat.messages.length - 1].text = `Error: ${data.error || 'Failed to fetch response.'}`;
            }
            renderMessages();
        }
    } catch (err) {
        const activeChat = chats.find(c => c.id === activeChatId);
        if (activeChat && activeChat.messages.length) {
            activeChat.messages[activeChat.messages.length - 1].text = 'Error connecting to Vercel API endpoint.';
            renderMessages();
        }
    }
});

btnNewChat.addEventListener('click', () => createNewChat());

init();
