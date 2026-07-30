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
    return msgDiv;
}

inputForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const text = userInput.value.trim();
    if (!text) return;

    appendMessage(text, 'user-msg');
    userInput.value = '';

    const loadingMsg = appendMessage('Thinking...', 'ai-msg');

    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ prompt: text })
        });

        const data = await response.json();

        if (response.ok) {
            loadingMsg.querySelector('p').textContent = data.reply;
        } else {
            loadingMsg.querySelector('p').textContent = `Error: ${data.error || 'Failed to fetch response.'}`;
        }
    } catch (err) {
        loadingMsg.querySelector('p').textContent = 'API key not configured yet.';
    }
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
