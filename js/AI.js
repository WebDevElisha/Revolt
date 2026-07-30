lucide.createIcons();

const chatHistory = document.getElementById('chat-history');
const inputForm = document.getElementById('ai-input-form');
const userInput = document.getElementById('ai-user-input');
const btnNewChat = document.getElementById('btn-new-chat');
const savedChatsList = document.getElementById('saved-chats-list');

function appendMessage(text, type) {
    const msgDiv = document.createElement('div');
    msgDiv.className = `message ${type}`;
    
    const p = document.createElement('p');
    p.textContent = text;
    
    msgDiv.appendChild(p);
    chatHistory.appendChild(msgDiv);
    chatHistory.scrollTop = chatHistory.scrollHeight;
}

inputForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = userInput.value.trim();
    if (!text) return;

    appendMessage(text, 'user-msg');
    userInput.value = '';

    setTimeout(() => {
        appendMessage('API key not configured yet.', 'ai-msg');
    }, 500);
});

btnNewChat.addEventListener('click', () => {
    chatHistory.innerHTML = `
        <div class="message system-msg">
            <p>New chat session started.</p>
        </div>
    `;

    const chatItem = document.createElement('div');
    chatItem.className = 'chat-item active';
    chatItem.innerHTML = `
        <i data-lucide="message-square"></i>
        <span class="chat-item-title">Chat ${savedChatsList.children.length + 1}</span>
    `;

    document.querySelectorAll('.chat-item').forEach(item => item.classList.remove('active'));
    savedChatsList.appendChild(chatItem);
    lucide.createIcons({ root: chatItem });
});
