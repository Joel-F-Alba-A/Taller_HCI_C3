document.addEventListener('DOMContentLoaded', () => {
    const messageInput = document.getElementById('message-input');
    const sendButton = document.getElementById('send-button');
    const messagesContainer = document.getElementById('messages-container');
    const chatListContainer = document.getElementById('chat-list');
    const phoneSelector = document.getElementById('user-phone-selector');
    const simulatedAvatar = document.getElementById('simulated-user-avatar');
    
    // State
    let activePhoneUserId = null;
    let activePhoneUserName = '';
    let activeChatId = ''; 
    let activeChatName = '';
    
    // In-memory read receipts for opticalia specifically
    // maps clientId -> timestamp string of last view
    const opticaliaReadReceipts = {};

    // Specific user mock chat data dictionaries
    const SIMULATED_PROFILES = {
        'Carlos Ruiz': {
            'amor': { name: 'Mi Amor ❤️', messages: [{ sender: 'them', text: 'Hola amor, a qué hora llegas?', time: '09:00', read: true }, { sender: 'me', text: 'Sobre las 6, tengo mucho tráfico', time: '09:05', read: true }] },
            'mama': { name: 'Mamá', messages: [{ sender: 'them', text: 'Hijo, ¿cómo estás?', time: 'Ayer', read: true }, { sender: 'me', text: 'Bien mamá, trabajando en la U.', time: 'Ayer', read: true }] },
            'trabajo': { name: 'Grupo Universidad', messages: [{ sender: 'them', text: 'Ya subí el documento a Drive.', time: 'Ayer', read: true }] }
        },
        'Juan Pérez': {
            'jefe': { name: 'Jefe (Ing. Ramírez)', messages: [{ sender: 'them', text: 'Juan, necesito el reporte a las 3pm.', time: '10:00', read: true }, { sender: 'me', text: 'Claro jefe, ya lo envío.', time: '10:05', read: true }] },
            'socio': { name: 'Esteban (Socio)', messages: [{ sender: 'them', text: 'Hermano, miraste los números?', time: '11:00', read: false }] },
            'futbol': { name: 'Cancha Fútbol 5', messages: [{ sender: 'me', text: 'Muchachos, nos falta 1 para el jueves', time: 'Ayer', read: true }] }
        },
        'María Gómez': {
            'hija': { name: 'Andrea (Hija)', messages: [{ sender: 'them', text: 'Mami, pásame porfis en la tarde.', time: '14:00', read: true }, { sender: 'me', text: 'Dale mi reina, allá estaré.', time: '14:01', read: true }] },
            'comadres': { name: 'Las Comadres 💅', messages: [{ sender: 'them', text: 'Amigaaaas, chisme nuevo!', time: 'Ayer', read: true }] },
            'gimnasio': { name: 'Gym Club', messages: [{ sender: 'them', text: 'Hoy clase aeróbica 7pm', time: 'Ayer', read: true }] }
        },
        'Ana Torres': {
            'novio': { name: 'Sebas', messages: [{ sender: 'them', text: 'Paso por ti a las 8?', time: '12:00', read: true }] },
            'papa': { name: 'Papá', messages: [{ sender: 'them', text: 'Anita, por favor comprar leche.', time: '10:00', read: true }] },
            'oficina': { name: 'Gente Oficina', messages: [{ sender: 'them', text: '¿Quién lleva el pastel?', time: 'Ayer', read: true }] }
        },
        'Luis Mendoza': {
            'taller': { name: 'Taller Mecánico', messages: [{ sender: 'them', text: 'Don Luis, el carro quedó listo.', time: '08:00', read: true }] },
            'esposa': { name: 'Camila', messages: [{ sender: 'me', text: 'Amor compre pollo para almorzar', time: '11:30', read: true }] },
            'universidad': { name: 'Maestría', messages: [{ sender: 'them', text: 'Clase cancelada hoy.', time: 'Ayer', read: true }] }
        }
    };

    const FALLBACK_PROFILE = {
        'amigo': { name: 'Amigo', messages: [{ sender: 'them', text: 'Qué más bro.', time: '10:00', read: true }] },
        'familia': { name: 'Familia', messages: [{ sender: 'them', text: 'Hola a todos!', time: 'Ayer', read: true }] }
    };

    let sessionDummyMessages = {};

    // Get centralized DB data
    const getClients = () => JSON.parse(localStorage.getItem('opticalia_clients_v3') || '[]');
    const getMessages = () => JSON.parse(localStorage.getItem('whatsapp_messages_bridge') || '[]');
    
    const saveMessages = (msgs) => {
        localStorage.setItem('whatsapp_messages_bridge', JSON.stringify(msgs));
        window.dispatchEvent(new Event('local_storage_update')); 
    };

    const scrollToBottom = () => { messagesContainer.scrollTop = messagesContainer.scrollHeight; };
    const updateSendIcon = () => { sendButton.innerHTML = messageInput.value.trim().length > 0 ? '<i class="fas fa-paper-plane" aria-hidden="true"></i>' : '<i class="fas fa-microphone" aria-hidden="true"></i>'; };

    // Initialize Profile Switcher
    const initPhoneSelector = () => {
        const clients = getClients();
        phoneSelector.innerHTML = '';
        clients.forEach(c => {
            const opt = document.createElement('option');
            opt.value = c.id;
            opt.innerText = c.name;
            phoneSelector.appendChild(opt);
        });

        const activeClient = clients.find(c => c.name === 'Carlos Ruiz') || clients[0];
        if (activeClient) {
            phoneSelector.value = activeClient.id;
            changePhoneUser(activeClient.id, activeClient.name);
        }

        phoneSelector.addEventListener('change', (e) => {
            const selected = clients.find(c => c.id === e.target.value);
            if (selected) changePhoneUser(selected.id, selected.name);
        });
    };

    const changePhoneUser = (id, name) => {
        activePhoneUserId = id;
        activePhoneUserName = name;
        simulatedAvatar.src = `https://i.pravatar.cc/150?u=${id}`;
        
        // Load specific mock data for this user
        const template = SIMULATED_PROFILES[name] || FALLBACK_PROFILE;
        sessionDummyMessages = {};
        Object.keys(template).forEach(k => {
            sessionDummyMessages[k] = [...template[k].messages];
        });

        // Setup default chat selection
        const firstKey = Object.keys(sessionDummyMessages)[0];
        activeChatId = firstKey;
        activeChatName = template[firstKey].name;
        
        renderChatList();
        renderMessages();
    };

    const renderChatList = () => {
        chatListContainer.innerHTML = '';
        const allOpticaliaMsgs = getMessages();
        const myOpticaliaMsgs = allOpticaliaMsgs.filter(m => m.clientId === activePhoneUserId);
        
        const chatItemsData = [];

        // Opticalia CRM Chat Logic (Dynamic Unread Badge)
        if (myOpticaliaMsgs.length > 0) {
            const latest = myOpticaliaMsgs[myOpticaliaMsgs.length - 1];
            const dt = new Date(latest.timestamp);
            const timeStr = isNaN(dt) ? 'Ahora' : `${String(dt.getHours()).padStart(2, '0')}:${String(dt.getMinutes()).padStart(2, '0')}`;
            
            // Check if unread (if last message timestamp is newer than our recorded read receipt)
            const lastRead = opticaliaReadReceipts[activePhoneUserId];
            const unreadCount = (!lastRead || new Date(latest.timestamp) > new Date(lastRead)) && latest.direction === 'received' ? 1 : 0;
            
            // If the opticalia chat is currently open, dynamically mark as read immediately
            if (activeChatId === 'opticalia' && unreadCount > 0) {
                opticaliaReadReceipts[activePhoneUserId] = new Date().toISOString();
            }

            chatItemsData.push({
                id: 'opticalia',
                name: 'Opticalia (Oficial) ✅',
                time: timeStr,
                previewText: latest.text,
                avatarId: 'opticalia_brand',
                unreadCount: activeChatId === 'opticalia' ? 0 : unreadCount
            });
        }

        // Dummy Chats Logic
        const template = SIMULATED_PROFILES[activePhoneUserName] || FALLBACK_PROFILE;
        Object.keys(template).forEach(key => {
            const chatObj = template[key];
            const msgs = sessionDummyMessages[key];
            const latest = msgs[msgs.length - 1];
            chatItemsData.push({
                id: key,
                name: chatObj.name,
                time: latest.time,
                previewText: latest.text,
                avatarId: `dummy_${key}`,
                unreadCount: 0 
            });
        });

        // Element rendering
        chatItemsData.forEach(chat => {
            const cItem = document.createElement('div');
            cItem.className = `chat-item ${chat.id === activeChatId ? 'active' : ''}`;
            cItem.tabIndex = 0;

            const badgeHtml = chat.unreadCount > 0 ? `<span class="unread-badge" style="background-color: #25D366; color: white; border-radius: 50%; padding: 2px 7px; font-size: 0.7rem; margin-left: 10px;">${chat.unreadCount}</span>` : '';

            cItem.innerHTML = `
                <div class="chat-avatar"><img src="https://i.pravatar.cc/150?u=${chat.avatarId}" alt="Avatar"></div>
                <div class="chat-info">
                    <div class="chat-header-info">
                        <h4>${chat.name}</h4>
                        <span class="time">${chat.time}</span>
                    </div>
                    <div class="chat-message-preview">
                        <p style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; width: 15vw;">${chat.previewText}</p>
                        ${badgeHtml}
                    </div>
                </div>
            `;
            
            cItem.addEventListener('click', () => {
                activeChatId = chat.id;
                activeChatName = chat.name;
                
                if (chat.id === 'opticalia') {
                    // Mark as read
                    opticaliaReadReceipts[activePhoneUserId] = new Date().toISOString();
                }

                renderChatList(); // Rerender to clear badge and update active block
                renderMessages();
            });
            chatListContainer.appendChild(cItem);
        });
    };

    const renderMessages = () => {
        messagesContainer.innerHTML = '';
        
        document.getElementById('current-chat-name').innerText = activeChatName;
        document.querySelector('.chat-area-profile img').src = `https://i.pravatar.cc/150?u=${activeChatId === 'opticalia' ? 'opticalia_brand' : 'dummy_' + activeChatId}`;

        if (activeChatId === 'opticalia') {
            const allMsgs = getMessages();
            const myOpticaliaMsgs = allMsgs.filter(m => m.clientId === activePhoneUserId);
            
            myOpticaliaMsgs.forEach(msg => {
                const dt = new Date(msg.timestamp);
                const timeStr = `${String(dt.getHours()).padStart(2, '0')}:${String(dt.getMinutes()).padStart(2, '0')}`;
                const isMyMessage = msg.direction === 'client_reply'; // Meaning WE simulate client messaging Opticalia

                const msgDiv = document.createElement('div');
                msgDiv.className = isMyMessage ? 'message sent' : 'message received';
                msgDiv.innerHTML = `<p>${msg.text}</p><span class="message-time">${timeStr} ${isMyMessage ? '<i class="fas fa-check-double read" style="color:var(--blue-tick)"></i>' : ''}</span>`;
                messagesContainer.appendChild(msgDiv);
            });
        } else {
            const msgs = sessionDummyMessages[activeChatId] || [];
            msgs.forEach(msg => {
                const isMyMessage = msg.sender === 'me';
                const msgDiv = document.createElement('div');
                msgDiv.className = isMyMessage ? 'message sent' : 'message received';
                msgDiv.innerHTML = `<p>${msg.text}</p><span class="message-time">${msg.time} ${isMyMessage ? '<i class="fas fa-check-double read" style="color:var(--blue-tick)"></i>' : ''}</span>`;
                messagesContainer.appendChild(msgDiv);
            });
        }
        scrollToBottom();
    };

    const handleSendMessage = () => {
        const text = messageInput.value.trim();
        if (text === '') return;

        const now = new Date();
        const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

        if (activeChatId === 'opticalia') {
            const messages = getMessages();
            messages.push({
                id: Date.now().toString(),
                clientId: activePhoneUserId,
                clientName: activePhoneUserName,
                text,
                timestamp: now.toISOString(),
                direction: 'client_reply'
            });
            saveMessages(messages);
            opticaliaReadReceipts[activePhoneUserId] = new Date().toISOString();
        } else {
            sessionDummyMessages[activeChatId].push({ sender: 'me', text, time: timeStr, read: true });
        }

        messageInput.value = '';
        updateSendIcon();
        messageInput.focus();
        
        renderChatList();
        renderMessages();
    };

    // Binding
    messageInput.addEventListener('input', updateSendIcon);
    messageInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') handleSendMessage(); });
    sendButton.addEventListener('click', () => { if (messageInput.value.trim().length > 0) handleSendMessage(); });

    window.addEventListener('storage', () => {
        // Only ring and redraw if there's actual new traffic targeting us
        renderChatList();
        renderMessages();
    });
    window.addEventListener('local_storage_update', () => {
        renderChatList();
        renderMessages();
    });

    setTimeout(() => { initPhoneSelector(); }, 500);
});
