/* =========================================================
   COMPONENTS: Sidebar, Navigation, Routing
   ========================================================= */

const MENU = [
  { key: 'dashboard', label: 'Dashboard', icon: '🧭', roles: ['admin','ketua','siswa'] },
  { key: 'students', label: 'Data Siswa', icon: '🎓', roles: ['admin','ketua','siswa'] },
  { key: 'teachers', label: 'Guru', icon: '🧑‍🏫', roles: ['admin','ketua','siswa'] },
  { key: 'classes', label: 'Kelas', icon: '🏫', roles: ['admin','ketua','siswa'] },
  { key: 'attendance', label: 'Absensi', icon: '✅', roles: ['admin','ketua','siswa'] },
  { key: 'transactions', label: 'Kas Kelas', icon: '💰', roles: ['admin','ketua','siswa'] },
  { key: 'grades', label: 'Nilai', icon: '📊', roles: ['admin','ketua','siswa'] },
  { key: 'announcements', label: 'Pengumuman', icon: '📢', roles: ['admin','ketua','siswa'] },
  { key: 'files', label: 'File', icon: '🗂️', roles: ['admin','ketua','siswa'] },
  { key: 'calendar', label: 'Kalender', icon: '🗓️', roles: ['admin','ketua','siswa'] },
  { key: 'chat', label: 'Chat Kelas', icon: '💬', roles: ['admin','ketua','siswa'] },
  { key: 'users', label: 'Kelola Pengguna', icon: '🛡️', roles: ['admin'] },
  { key: 'logs', label: 'Log Aktivitas', icon: '📜', roles: ['admin'] },
  { key: 'profile', label: 'Profil', icon: '👤', roles: ['admin','ketua','siswa'] },
  { key: 'settings', label: 'Pengaturan', icon: '⚙️', roles: ['admin','ketua','siswa'] },
];

function buildSidebar(){
  const nav = document.getElementById('nav-list');
  nav.innerHTML = '';
  MENU.filter(m => m.roles.includes(APP.profile.role)).forEach(m=>{
    const el = document.createElement('div');
    el.className = 'nav-item';
    el.dataset.page = m.key;
    el.innerHTML = `<span class="ic">${m.icon}</span><span>${m.label}</span>`;
    el.addEventListener('click', ()=>{ navigate(m.key); closeSidebarMobile(); });
    nav.appendChild(el);
  });
}

function closeSidebarMobile(){
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('sidebar-overlay').classList.remove('active');
}

document.getElementById('menu-toggle').addEventListener('click', ()=>{
  document.getElementById('sidebar').classList.toggle('open');
  document.getElementById('sidebar-overlay').classList.toggle('active');
});
document.getElementById('sidebar-overlay').addEventListener('click', closeSidebarMobile);

function navigate(page){
  APP.page = page;
  document.querySelectorAll('.nav-item').forEach(n=> n.classList.toggle('active', n.dataset.page===page));
  const menuItem = MENU.find(m=>m.key===page);
  document.getElementById('page-title').textContent = menuItem ? menuItem.label : page;
  const content = document.getElementById('content');
  content.innerHTML = '<div class="empty-state">Memuat data...</div>';

  if(page === 'dashboard') renderDashboard();
  else if(page === 'calendar') renderCalendar();
  else if(page === 'chat') renderChat();
  else if(page === 'profile') renderProfile();
  else if(page === 'settings') renderSettings();
  else if(page === 'users') renderUsers();
  else if(page === 'logs') renderCrud('activity_logs');
  else if(TABLES[page]) renderCrud(page);
  else content.innerHTML = '<div class="empty-state">Halaman tidak ditemukan.</div>';
}

// Theme functions
function applyTheme(){
  document.body.classList.toggle('light', APP.theme==='light');
  document.getElementById('theme-toggle').textContent = APP.theme==='dark' ? '🌙' : '☀️';
}

document.getElementById('theme-toggle').addEventListener('click', ()=>{
  APP.theme = APP.theme==='dark' ? 'light' : 'dark';
  localStorage.setItem('nexus_theme', APP.theme);
  applyTheme();
});
