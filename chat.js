/* =========================================================
   CHAT MODULE
   ========================================================= */

async function renderChat(){
  const content = document.getElementById('content');
  content.innerHTML = `
    <div class="glass panel">
      <div class="panel-title neon-text mt8">💬 Chat Kelas</div>
      <div id="chat-box" class="mt16"><div class="empty-state">Memuat pesan...</div></div>
      <div class="chat-input-row">
        <input type="text" id="chat-input" placeholder="Tulis pesan...">
        <button class="btn btn-solid" id="chat-send">Kirim</button>
      </div>
    </div>
  `;
  await loadChatMessages();
  document.getElementById('chat-send').addEventListener('click', sendChat);
  document.getElementById('chat-input').addEventListener('keydown', e=>{ if(e.key==='Enter') sendChat(); });

  if(APP.chatChannel) sb.removeChannel(APP.chatChannel);
  APP.chatChannel = sb.channel('chat_messages_realtime')
    .on('postgres_changes', { event:'INSERT', schema:'public', table:'chat_messages' }, payload=>{
      appendChatMsg(payload.new);
      const box = document.getElementById('chat-box');
      if(box) box.scrollTop = box.scrollHeight;
    }).subscribe();
}

async function loadChatMessages(){
  const { data, error } = await sb.from('chat_messages').select('*').order('created_at',{ascending:true}).limit(100);
  const box = document.getElementById('chat-box');
  if(error){ 
    box.innerHTML = `<div class="empty-state">⚠️ ${escapeHtml(error.message)}</div>`; 
    return; 
  }
  if(!data || !data.length){ 
    box.innerHTML = '<div class="empty-state">Belum ada pesan. Mulai percakapan!</div>'; 
    return; 
  }
  box.innerHTML = '';
  data.forEach(appendChatMsg);
  box.scrollTop = box.scrollHeight;
}

function appendChatMsg(msg){
  const box = document.getElementById('chat-box');
  if(!box) return;
  if(box.querySelector('.empty-state')) box.innerHTML = '';
  const mine = msg.sender_id === APP.profile.id;
  const el = document.createElement('div');
  el.className = 'chat-msg' + (mine ? ' mine' : '');
  el.innerHTML = `<div class="meta">${escapeHtml(msg.sender_name||'Anonim')} · ${new Date(msg.created_at).toLocaleTimeString('id-ID',{hour:'2-digit',minute:'2-digit'})}</div><div>${escapeHtml(msg.message)}</div>`;
  box.appendChild(el);
}

async function sendChat(){
  const input = document.getElementById('chat-input');
  const text = input.value.trim();
  if(!text) return;
  input.value = '';
  const { error } = await sb.from('chat_messages').insert({
    sender_id: APP.profile.id, 
    sender_name: APP.profile.full_name || APP.profile.email,
    class_name: APP.profile.class_name || null, 
    message: text
  });
  if(error) toast('Gagal mengirim pesan: ' + error.message, 'error');
}
