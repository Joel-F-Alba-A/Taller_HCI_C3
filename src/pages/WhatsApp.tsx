import React, { useState, useMemo } from 'react';
import { useData } from '../store/DataContext';
import { Send, CheckCheck, Phone, Video, Search, Smile, Paperclip } from 'lucide-react';

export default function WhatsApp({ isClientMode = false }: { isClientMode?: boolean }) {
  const { whatsappMessages, clients } = useData();
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  
  // View mode
  const viewMode = isClientMode ? 'client' : 'business';
  
  // Client Profile Selector (Who's phone are we looking at?)
  const [activeClientProfileId, setActiveClientProfileId] = useState<string | null>(null);
  const [showProfileSelector, setShowProfileSelector] = useState(false);

  // Helper for profile pics
  const getAvatar = (seed: string) => `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(seed)}&backgroundColor=004182,4299E1,A3CFFF&textColor=ffffff`;

  // Extract unique clients that have messages
  const chatList = useMemo(() => {
    const list: Record<string, { id: string, name: string, lastMsg: string, timestamp: string }> = {};
    whatsappMessages.forEach(msg => {
      // Find client info (could also just use msg.clientName)
      const cName = msg.clientName || 'Desconocido';
      list[msg.clientId] = {
        id: msg.clientId,
        name: cName,
        lastMsg: msg.text,
        timestamp: msg.timestamp
      };
    });
    return Object.values(list).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [whatsappMessages]);

  const activeClientInfo = clients.find(c => c.id === activeChatId);
  const activeProfileClient = clients.find(c => c.id === activeClientProfileId);

  // Synthetic local chats for the end-user phone perspective
  const fakeChats = useMemo(() => [
    { id: 'optica', name: 'Óptica Opticalia Oficial', lastMsg: 'Tus lentes están listos', time: '10:00 AM' },
    { id: 'mama', name: 'Mamá', lastMsg: 'A qué hora llegas de la universidad?', time: '09:12 AM' },
    { id: 'trabajo', name: 'Grupo Trabajo', lastMsg: 'No olviden enviar el reporte', time: 'Ayer' },
    { id: 'amor', name: 'Amor ❤️', lastMsg: 'Te extraño', time: 'Ayer' }
  ], []);

  const activeMessages = useMemo(() => {
    if (!activeChatId) return [];
    
    // If in business mode or interacting with the real Optica thread
    if (viewMode === 'business') {
      return whatsappMessages.filter(m => m.clientId === activeChatId).sort((a,b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    } 
    
    // If in client phone simulating Optica thread
    if (viewMode === 'client' && activeChatId === 'optica' && activeClientProfileId) {
       return whatsappMessages.filter(m => m.clientId === activeClientProfileId).sort((a,b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    }

    return [];
  }, [whatsappMessages, activeChatId, viewMode, activeClientProfileId]);

  const activeClientName = viewMode === 'business' 
    ? (chatList.find(c => c.id === activeChatId)?.name || activeClientInfo?.name || '')
    : fakeChats.find(f => f.id === activeChatId)?.name || '';

  const formatTime = (isoString: string) => {
    const d = new Date(isoString);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleSendAction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !activeChatId) return;

    if (viewMode === 'client') {
      // The user is sending a message back to Opticalia. Appended to global array under standard logic:
      const existing = localStorage.getItem('whatsapp_messages_native');
      let arr = existing ? JSON.parse(existing) : [];
      arr.push({
        id: Date.now().toString(),
        clientId: activeChatId,
        clientName: activeClientName,
        text: replyText,
        timestamp: new Date().toISOString(),
        direction: 'received' // From CRM perspective, it's 'received'
      });
      localStorage.setItem('whatsapp_messages_native', JSON.stringify(arr));
      window.dispatchEvent(new Event('storage')); // trigger DataContext refresh or force reload? 
      // Wait, DataContext has a state but we can just mutate state if `sendWhatsAppMessage` allowed it.
      // Better to use window reload trick or similar, but since we don't have dispatch, let's just alert a page refresh.
    } else {
      alert("Para enviar campañas masivas cambia al módulo 'CRM y Campañas'. Aquí solo previsualizas y respondes como cliente final.");
    }
    
    setReplyText('');
    if (viewMode === 'client' && activeChatId === 'optica') {
       // Since tab syncing is implemented in DataContext now, no need to reload!
       // But I'll leave a tiny delay just to feel real
    }
  }

  return (
    <div className="wa-container" style={{ display: 'flex', height: isClientMode ? '100vh' : 'calc(100vh - 120px)', backgroundColor: 'var(--wa-bg)', color: 'var(--wa-text)', borderRadius: isClientMode ? 0 : 10, overflow: 'hidden', border: isClientMode ? 'none' : '1px solid var(--border-color)', boxShadow: isClientMode ? 'none' : '0 4px 6px rgba(0,0,0,0.1)', position: 'relative' }}>
      
      {/* Profile Selector Overlay */}
      {viewMode === 'client' && showProfileSelector && (
         <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ backgroundColor: 'var(--wa-panel)', padding: 25, borderRadius: 12, width: 400, maxHeight: '80%', display: 'flex', flexDirection: 'column' }}>
               <h3 style={{ marginTop: 0, marginBottom: 20 }}>Simular Celular de:</h3>
               <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 10 }}>
                 {clients.map(c => (
                   <div 
                      key={c.id} 
                      onClick={() => { setActiveClientProfileId(c.id); setShowProfileSelector(false); setActiveChatId(null); }}
                      style={{ padding: 12, backgroundColor: 'var(--wa-search-bg)', borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12 }}
                   >
                     <img src={getAvatar(c.name)} alt="av" style={{ width: 40, height: 40, borderRadius: '50%' }} />
                     <span style={{ fontWeight: 500 }}>{c.name}</span>
                   </div>
                 ))}
               </div>
               <button onClick={() => setShowProfileSelector(false)} style={{ marginTop: 15, padding: 10, backgroundColor: 'var(--opt-border)', border: 'none', borderRadius: 8, cursor: 'pointer' }}>Cerrar</button>
            </div>
         </div>
      )}

      {/* Sidebar List */}
      <div style={{ width: '30%', minWidth: 320, borderRight: '1px solid var(--wa-border)', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--wa-panel)' }}>
        
        <div style={{ padding: '15px', backgroundColor: 'var(--wa-header)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {viewMode === 'client' && activeProfileClient ? (
               <img src={getAvatar(activeProfileClient.name)} alt="av" style={{ width: 36, height: 36, borderRadius: '50%' }} />
            ) : (
               <img src={getAvatar("Optica")} alt="av" style={{ width: 36, height: 36, borderRadius: '50%' }} />
            )}
            <span style={{ fontWeight: 600, fontSize: '1.05rem', color: 'var(--wa-text)' }}>
              {viewMode === 'client' ? (activeProfileClient ? 'Tú (Teléfono de ' + activeProfileClient.name.split(' ')[0] + ')' : 'Selecciona un perfil') : 'Vista: Empresa CRM'}
            </span>
          </div>
          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: 8 }}>
            {viewMode === 'client' && (
              <button 
                 onClick={() => setShowProfileSelector(true)}
                 style={{ padding: '6px', borderRadius: 4, border: '1px solid var(--opt-border)', backgroundColor: 'transparent', cursor: 'pointer' }}
                 title="Escoger otro paciente a simular"
              >
                 <Search size={16} color="var(--wa-icon)" />
              </button>
            )}
          </div>
        </div>

        <div style={{ padding: '10px 15px', backgroundColor: 'var(--wa-panel)', borderBottom: '1px solid var(--wa-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', backgroundColor: 'var(--wa-search-bg)', padding: '8px 15px', borderRadius: 8, gap: 10 }}>
            <Search size={18} color="var(--wa-icon)" />
            <input 
              type="text" 
              placeholder="Busca un chat o inicia uno nuevo" 
              style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', color: 'var(--wa-text)' }} 
            />
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto' }}>
          {viewMode === 'client' ? (
            // In Client mode: if profile is selected, list personal synthetic chats + the Optica thread
            !activeClientProfileId ? (
               <div style={{ padding: 30, textAlign: 'center', color: 'var(--wa-icon)' }}>Selecciona qué teléfono quieres simular.</div>
            ) : (
               fakeChats.map(fc => {
                  let unreadCount = 0;
                  
                  // Compute if they have unread messages in optica chat
                  if (fc.id === 'optica') {
                     const myMsgs = whatsappMessages.filter(m => m.clientId === activeClientProfileId);
                     const receivedFromCRM = myMsgs.filter(m => m.direction === 'sent');
                     unreadCount = receivedFromCRM.length;
                  }

                  return (
                    <div 
                       key={fc.id} 
                       onClick={() => setActiveChatId(fc.id)}
                       style={{ 
                         display: 'flex', gap: 15, padding: '12px 15px', cursor: 'pointer',
                         backgroundColor: activeChatId === fc.id ? 'var(--wa-search-bg)' : 'transparent',
                         borderBottom: '1px solid var(--wa-border)' 
                       }}
                     >
                       <img src={getAvatar(fc.name)} alt="av" style={{ width: 45, height: 45, borderRadius: '50%' }} />
                       <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                          <span style={{ fontWeight: 500, fontSize: '1.05rem', color: 'var(--wa-text)' }}>{fc.name}</span>
                          <span style={{ fontSize: '0.85rem', color: fc.id==='optica'? 'var(--opt-fiel)' : 'var(--wa-icon)' }}>
                            {fc.id === 'optica' && unreadCount > 0 ? `${unreadCount} mensajes de tu óptica` : fc.lastMsg}
                          </span>
                       </div>
                     </div>
                  )
               })
            )
          ) : (
            // In Business mode: list actual active incoming/outgoing message threads
            chatList.length === 0 ? (
              <div style={{ padding: 20, textAlign: 'center', color: 'var(--wa-icon)' }}>No hay chats activos. Envíe uno desde el CRM.</div>
            ) : (
               chatList.map(chat => (
                 <div 
                   key={chat.id} 
                   onClick={() => setActiveChatId(chat.id)}
                   style={{ 
                     display: 'flex', gap: 15, padding: '12px 15px', cursor: 'pointer',
                     backgroundColor: activeChatId === chat.id ? 'var(--wa-search-bg)' : 'transparent',
                     borderBottom: '1px solid var(--wa-border)' 
                   }}
                 >
                   <img src={getAvatar(chat.name)} alt="av" style={{ width: 45, height: 45, borderRadius: '50%' }} />
                   <div style={{ flex: 1, overflow: 'hidden' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                         <span style={{ fontWeight: 500, fontSize: '1.05rem', color: 'var(--wa-text)' }}>{chat.name}</span>
                         <span style={{ fontSize: '0.75rem', color: 'var(--wa-icon)' }}>{formatTime(chat.timestamp)}</span>
                      </div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--wa-icon)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                         {chat.lastMsg}
                      </div>
                   </div>
                 </div>
               ))
            )
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: 'var(--wa-chat-bg)', position: 'relative' }}>
        {/* Background Pattern */}
        <div style={{ position: 'absolute', inset: 0, opacity: 0.1, backgroundColor: 'var(--wa-bg)', zIndex: 0 }} />

        {activeChatId ? (
          <>
            {/* Header Chat */}
            <div style={{ padding: '10px 20px', backgroundColor: 'var(--wa-header)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 1, borderBottom: '1px solid var(--wa-border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <img src={getAvatar(activeClientName)} alt="av" style={{ width: 40, height: 40, borderRadius: '50%' }} />
                <span style={{ fontWeight: 600, fontSize: '1.1rem' }}>
                   {activeClientName}
                </span>
              </div>
              <div style={{ display: 'flex', gap: 20 }}>
                <Video size={20} color="var(--wa-icon)" style={{ cursor: 'pointer' }} />
                <Phone size={20} color="var(--wa-icon)" style={{ cursor: 'pointer' }} />
                <Search size={20} color="var(--wa-icon)" style={{ cursor: 'pointer' }} />
              </div>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '20px 5%', display: 'flex', flexDirection: 'column', gap: 10, zIndex: 1 }}>
              <div style={{ textAlign: 'center', marginBottom: 20 }}>
                 <span style={{ backgroundColor: 'var(--wa-system)', color: 'var(--wa-system-text)', padding: '5px 12px', borderRadius: 8, fontSize: '0.8rem', boxShadow: '0 1px 1px rgba(0,0,0,0.1)' }}>
                   Los mensajes están cifrados de extremo a extremo.
                 </span>
              </div>
              
              {activeMessages.map(msg => {
                // If viewing from CRM side: msg.direction === 'sent' implies green bubble on right.
                // If viewing from Client side: msg.direction === 'sent' implies received from CRM (white bubble on left)
                const isSentByViewer = viewMode === 'business' 
                   ? msg.direction === 'sent' 
                   : msg.direction === 'received';

                return (
                  <div key={msg.id} style={{ display: 'flex', justifyContent: isSentByViewer ? 'flex-end' : 'flex-start' }}>
                    <div style={{ 
                      backgroundColor: isSentByViewer ? 'var(--wa-msg-out)' : 'var(--wa-msg-in)', 
                      color: isSentByViewer ? 'var(--wa-msg-out-text)' : 'var(--wa-msg-in-text)',
                      padding: '8px 12px', 
                      borderRadius: 8, 
                      maxWidth: '65%',
                      boxShadow: '0 1px 1px rgba(0,0,0,0.1)',
                      position: 'relative'
                    }}>
                      <span style={{ fontSize: '0.95rem' }}>{msg.text}</span>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 4, marginTop: 4 }}>
                         <span style={{ fontSize: '0.65rem', color: isSentByViewer ? 'rgba(0,0,0,0.4)' : 'rgba(255,255,255,0.6)', opacity: 0.8 }}>{formatTime(msg.timestamp)}</span>
                         {isSentByViewer && <CheckCheck size={14} color="#FFFFFF" />}
                      </div>
                    </div>
                  </div>
                )
              })}
              {activeMessages.length === 0 && viewMode === 'client' && activeChatId !== 'optica' && (
                 <div style={{ textAlign: 'center', marginTop: 20, color: 'var(--wa-icon)' }}>
                   Este es un chat de ejemplo (vacío temporalmente).
                 </div>
              )}
            </div>

            <div style={{ padding: '15px 20px', backgroundColor: 'var(--wa-header)', display: 'flex', alignItems: 'center', gap: 15, zIndex: 1 }}>
              <Smile size={24} color="var(--wa-icon)" style={{ cursor: 'pointer' }} />
              <Paperclip size={24} color="var(--wa-icon)" style={{ cursor: 'pointer' }} />
              <form onSubmit={handleSendAction} style={{ flex: 1, display: 'flex' }}>
                <input 
                  type="text" 
                  disabled={viewMode === 'client' && activeChatId !== 'optica'}
                  style={{ width: '100%', padding: '12px 15px', borderRadius: 8, border: 'none', outline: 'none', backgroundColor: 'var(--wa-search-bg)', color: 'var(--wa-text)', fontSize: '0.95rem', opacity: (viewMode === 'client' && activeChatId !== 'optica') ? 0.5 : 1 }} 
                  placeholder={viewMode === 'client' ? (activeChatId === 'optica' ? "Responderle a Óptica Opticalia..." : "No puedes responder a simulaciones falsas") : "Envía desde CRM y Campañas (solo visual)"} 
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                />
              </form>
              <Send size={24} color="var(--wa-icon)" onClick={handleSendAction} style={{ cursor: (viewMode === 'client' && activeChatId !== 'optica') ? 'not-allowed' : 'pointer', opacity: (viewMode === 'client' && activeChatId !== 'optica') ? 0.3 : 1 }} />
            </div>
          </>
        ) : (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 1, padding: 30, textAlign: 'center' }}>
            <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" width={100} style={{ opacity: 0.2, marginBottom: 20 }} alt="wa" />
            <h2 style={{ color: 'var(--wa-text)', fontWeight: 300 }}>
               {viewMode === 'client' && !activeClientProfileId ? 'Selecciona qué teléfono quieres simular' : 'WhatsApp Web Simulado'}
            </h2>
            <p style={{ color: 'var(--wa-icon)' }}>
               {viewMode === 'client' ? 'Haz clic en una de tus conversaciones a la izquierda para ver el chat.' : 'Envía y recibe mensajes desde la plataforma de CRM sin salir de esta pestaña.'}
            </p>
          </div>
        )}
      </div>

    </div>
  );
}
