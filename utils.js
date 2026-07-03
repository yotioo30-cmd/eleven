/* =========================================================
   UTILITY FUNCTIONS
   ========================================================= */

function toast(msg, type='ok'){
  const wrap = document.getElementById('toast-wrap');
  const el = document.createElement('div');
  el.className = 'toast glass ' + (type==='error'?'error':type==='warn'?'warn':'');
  const ic = type==='error' ? '⛔' : type==='warn' ? '⚠️' : '✅';
  el.innerHTML = `<span>${ic}</span><span>${escapeHtml(msg)}</span>`;
  wrap.appendChild(el);
  setTimeout(()=>{ 
    el.style.transition='all .3s ease'; 
    el.style.opacity='0'; 
    el.style.transform='translateX(120%)'; 
    setTimeout(()=>el.remove(),300); 
  }, 3800);
}

function showLoading(show){
  document.getElementById('loading-screen').classList.toggle('hidden', !show);
}

function escapeHtml(str){
  if (str === null || str === undefined) return '';
  return String(str).replace(/[&<>"']/g, s => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[s]));
}

function fmtRupiah(n){
  const num = Number(n)||0;
  return 'Rp ' + num.toLocaleString('id-ID');
}

function initials(name){
  if(!name) return '?';
  const parts = name.trim().split(' ');
  return (parts[0][0] + (parts[1]?parts[1][0]:'')).toUpperCase();
}

function roleLabel(r){
  return r==='admin' ? 'Admin' : r==='ketua' ? 'Ketua Kelas' : 'Siswa';
}

function colLabel(cfg, key){
  const f = cfg.fields.find(f=>f.key===key);
  if(f) return f.label;
  const map = { 
    student_name:'Siswa', 
    created_at:'Waktu', 
    actor_name:'Pengguna', 
    action:'Aksi', 
    table_name:'Tabel', 
    detail:'Detail', 
    file_name:'Nama File' 
  };
  return map[key] || key;
}

let debTimer;
function debounce(fn, ms){ 
  return (...args)=>{ 
    clearTimeout(debTimer); 
    debTimer = setTimeout(()=>fn(...args), ms); 
  }; 
}
