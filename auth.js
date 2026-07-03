/* =========================================================
   AUTHENTICATION MODULE
   ========================================================= */

const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const goRegister = document.getElementById('go-register');
const authSwitchWrap = document.getElementById('auth-switch-wrap');

goRegister.addEventListener('click', ()=>{
  const toRegister = registerForm.style.display === 'none';
  loginForm.style.display = toRegister ? 'none' : 'block';
  registerForm.style.display = toRegister ? 'block' : 'none';
  authSwitchWrap.innerHTML = toRegister
    ? 'Sudah punya akun? <span id="go-login">Masuk di sini</span>'
    : 'Belum punya akun? <span id="go-register">Daftar di sini</span>';
  bindAuthSwitch();
});

function bindAuthSwitch(){
  const goLogin = document.getElementById('go-login');
  const goReg = document.getElementById('go-register');
  if(goLogin) goLogin.addEventListener('click', ()=>{
    loginForm.style.display = 'block';
    registerForm.style.display = 'none';
    authSwitchWrap.innerHTML = 'Belum punya akun? <span id="go-register">Daftar di sini</span>';
    bindAuthSwitch();
  });
  if(goReg && goReg !== goRegister) goReg.addEventListener('click', ()=> goRegister.click());
}

loginForm.addEventListener('submit', async (e)=>{
  e.preventDefault();
  const btn = document.getElementById('login-btn');
  const errEl = document.getElementById('login-error');
  errEl.textContent = '';
  btn.disabled = true; btn.textContent = 'Menghubungkan...';
  const email = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;
  const { data, error } = await sb.auth.signInWithPassword({ email, password });
  btn.disabled = false; btn.textContent = '// Masuk Sistem';
  if(error){ errEl.textContent = 'Gagal masuk: ' + error.message; return; }
  await onAuthed(data.user);
});

registerForm.addEventListener('submit', async (e)=>{
  e.preventDefault();
  const btn = document.getElementById('register-btn');
  const errEl = document.getElementById('register-error');
  errEl.textContent = '';
  btn.disabled = true; btn.textContent = 'Mendaftarkan...';
  const full_name = document.getElementById('reg-name').value.trim();
  const email = document.getElementById('reg-email').value.trim();
  const password = document.getElementById('reg-password').value;
  const { data, error } = await sb.auth.signUp({ 
    email, 
    password, 
    options: { data: { full_name } } 
  });
  btn.disabled = false; btn.textContent = '// Daftar Akun';
  if(error){ errEl.textContent = 'Gagal daftar: ' + error.message; return; }
  if(data.session){
    await onAuthed(data.user);
  } else {
    toast('Pendaftaran berhasil! Silakan cek email untuk verifikasi, lalu login.', 'ok');
    goRegister.click();
  }
});

document.getElementById('logout-btn').addEventListener('click', async ()=>{
  await sb.auth.signOut();
  if(APP.chatChannel) sb.removeChannel(APP.chatChannel);
  APP.user = null; APP.profile = null; APP.studentRecord = null;
  document.getElementById('app-shell').classList.remove('active');
  document.getElementById('auth-screen').style.display = 'flex';
  toast('Berhasil keluar dari sistem');
});

async function onAuthed(user){
  APP.user = user;
  let { data: profile, error } = await sb.from('profiles').select('*').eq('id', user.id).maybeSingle();
  if(!profile){
    const ins = await sb.from('profiles').insert({ 
      id: user.id, 
      full_name: user.user_metadata?.full_name || user.email, 
      email: user.email, 
      role: 'siswa' 
    }).select().maybeSingle();
    profile = ins.data;
  }
  APP.profile = profile;

  if(profile.role === 'siswa'){
    const { data: srow } = await sb.from('students').select('*').eq('profile_id', user.id).maybeSingle();
    APP.studentRecord = srow || null;
  }

  document.getElementById('auth-screen').style.display = 'none';
  document.getElementById('app-shell').classList.add('active');
  document.getElementById('user-name').textContent = profile.full_name || profile.email;
  document.getElementById('user-avatar').textContent = initials(profile.full_name || profile.email);
  document.getElementById('user-role').textContent = roleLabel(profile.role);

  buildSidebar();
  applyTheme();
  navigate('dashboard');
  logActivity('login', 'auth', 'Pengguna login ke sistem');
}

async function checkSession(){
  showLoading(true);
  const { data: { session } } = await sb.auth.getSession();
  if(session && session.user){
    await onAuthed(session.user);
  }
  showLoading(false);
}

sb.auth.onAuthStateChange((event, session)=>{
  if(event === 'SIGNED_OUT'){
    document.getElementById('app-shell').classList.remove('active');
    document.getElementById('auth-screen').style.display = 'flex';
  }
});
