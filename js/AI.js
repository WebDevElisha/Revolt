lucide.createIcons();

const chatHistory = document.getElementById('chat-history');
const inputForm = document.getElementById('ai-input-form');
const userInput = document.getElementById('ai-user-input');
const btnNewChat = document.getElementById('btn-new-chat');
const savedChatsList = document.getElementById('saved-chats-list');

const renameModal = document.getElementById('rename-modal');
const renameInput = document.getElementById('rename-input');
const btnCancelRename = document.getElementById('btn-cancel-rename');
const btnConfirmRename = document.getElementById('btn-confirm-rename');

let chats = [];
let activeChatId = null;
let chatToRenameId = null;

function saveChats() {
    localStorage.setItem('revolt_ai_chats', JSON.stringify(chats));
    localStorage.setItem('revolt_ai_active', activeChatId);
}

function init() {
    const storedChats = localStorage.getItem('revolt_ai_chats');
    const storedActive = localStorage.getItem('revolt_ai_active');

    if (storedChats) {
        chats = JSON.parse(storedChats);
        if (chats.length > 0) {
            activeChatId = storedActive && chats.find(c => c.id === storedActive) ? storedActive : chats[0].id;
            renderChatList();
            renderMessages();
            return;
        }
    }
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
    saveChats();
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
            saveChats();
            renderChatList();
        }
    }
}

function openRenameModal(id, e) {
    e.stopPropagation();
    const chat = chats.find(c => c.id === id);
    if (!chat) return;

    chatToRenameId = id;
    renameInput.value = chat.title;
    renameModal.classList.remove('hidden');
    renameInput.focus();
}

function closeRenameModal() {
    renameModal.classList.add('hidden');
    chatToRenameId = null;
    renameInput.value = '';
}

btnCancelRename.addEventListener('click', closeRenameModal);

btnConfirmRename.addEventListener('click', () => {
    if (!chatToRenameId) return;
    const newTitle = renameInput.value.trim();
    
    if (newTitle) {
        const chat = chats.find(c => c.id === chatToRenameId);
        if (chat) {
            chat.title = newTitle;
            saveChats();
            renderChatList();
        }
    }
    closeRenameModal();
});

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

        renameBtn.addEventListener('click', (e) => openRenameModal(chat.id, e));
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
    saveChats();
    renderMessages();
}

inputForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const text = userInput.value.trim();
    if (!text) return;

    addMessageToActiveChat(text, 'user-msg');
    userInput.value = '';

    addMessageToActiveChat('Thinking...', 'ai-msg');

    const fallbackErrorMessage = "Revolt AI is having some trouble right now, talk to the owner of Revolt to fix it";

    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ prompt: text })
        });

        const contentType = response.headers.get('content-type') || '';
        if (!contentType.includes('application/json')) {
            throw new Error('Server returned non-JSON response');
        }

        const data = await response.json();

        const activeChat = chats.find(c => c.id === activeChatId);
        if (activeChat && activeChat.messages.length) {
            if (response.ok) {
                activeChat.messages[activeChat.messages.length - 1].text = data.reply;
            } else {
                activeChat.messages[activeChat.messages.length - 1].text = fallbackErrorMessage;
            }
            saveChats();
            renderMessages();
        }
    } catch (err) {
        const activeChat = chats.find(c => c.id === activeChatId);
        if (activeChat && activeChat.messages.length) {
            activeChat.messages[activeChat.messages.length - 1].text = fallbackErrorMessage;
            saveChats();
            renderMessages();
        }
    }
});

btnNewChat.addEventListener('click', () => createNewChat());

init();
