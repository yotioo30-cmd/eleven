/* =========================================================
   CRUD ENGINE - Generic Table Operations
   ========================================================= */

const TABLES = {
  students: {
    label: 'Data Siswa', icon: '🎓', menuIcon:'🎓',
    perms: { admin: 'crud', ketua: 'r', siswa: 'r' },
    order: 'name.asc',
    fields: [
      { key: 'nis', label: 'NIS', type: 'text', required: true },
      { key: 'name', label: 'Nama Lengkap', type: 'text', required: true },
      { key: 'class_name', label: 'Kelas', type: 'text' },
      { key: 'gender', label: 'Jenis Kelamin', type: 'select', options: ['Laki-laki', 'Perempuan'] },
      { key: 'birth_date', label: 'Tanggal Lahir', type: 'date' },
      { key: 'phone', label: 'No. HP', type: 'text' },
      { key: 'address', label: 'Alamat', type: 'textarea' },
    ],
    columns: ['nis', 'name', 'class_name', 'gender', 'phone'],
  },
  teachers: {
    label: 'Guru', icon: '🧑‍🏫', menuIcon:'🧑‍🏫',
    perms: { admin: 'crud', ketua: 'r', siswa: 'r' },
    order: 'name.asc',
    fields: [
      { key: 'nip', label: 'NIP', type: 'text' },
      { key: 'name', label: 'Nama Lengkap', type: 'text', required: true },
      { key: 'subject', label: 'Mata Pelajaran', type: 'text' },
      { key: 'phone', label: 'No. HP', type: 'text' },
      { key: 'email', label: 'Email', type: 'text' },
    ],
    columns: ['nip', 'name', 'subject', 'phone'],
  },
  classes: {
    label: 'Kelas', icon: '🏫', menuIcon:'🏫',
    perms: { admin: 'crud', ketua: 'r', siswa: 'r' },
    order: 'name.asc',
    fields: [
      { key: 'name', label: 'Nama Kelas', type: 'text', required: true },
      { key: 'wali_kelas', label: 'Wali Kelas', type: 'text' },
      { key: 'tahun_ajaran', label: 'Tahun Ajaran', type: 'text' },
      { key: 'jumlah_siswa', label: 'Jumlah Siswa', type: 'number' },
    ],
    columns: ['name', 'wali_kelas', 'tahun_ajaran', 'jumlah_siswa'],
  },
  schedule: {
    label: 'Jadwal', icon: '🗓️', menuIcon:'🗓️',
    perms: { admin: 'crud', ketua: 'r', siswa: 'r' },
    order: 'day.asc',
    fields: [
      { key: 'class_name', label: 'Kelas', type: 'text', required: true },
      { key: 'day', label: 'Hari', type: 'select', options: ['Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'] },
      { key: 'subject', label: 'Mata Pelajaran', type: 'text', required: true },
      { key: 'start_time', label: 'Jam Mulai', type: 'text', placeholder:'07:00' },
      { key: 'end_time', label: 'Jam Selesai', type: 'text', placeholder:'08:30' },
      { key: 'teacher_name', label: 'Guru Pengajar', type: 'text' },
    ],
    columns: ['day', 'class_name', 'subject', 'start_time', 'end_time', 'teacher_name'],
  },
  grades: {
    label: 'Nilai', icon: '📊', menuIcon:'📊',
    perms: { admin: 'crud', ketua: 'r', siswa: 'r' },
    order: 'created_at.desc',
    fields: [
      { key: 'student_id', label: 'Siswa', type: 'student_select', required: true },
      { key: 'subject', label: 'Mata Pelajaran', type: 'text', required: true },
      { key: 'type', label: 'Jenis', type: 'select', options: ['Tugas','UTS','UAS','Kuis'] },
      { key: 'score', label: 'Nilai', type: 'number', required: true },
      { key: 'semester', label: 'Semester', type: 'text', placeholder:'Ganjil 2026' },
    ],
    columns: ['student_name', 'subject', 'type', 'score', 'semester'],
    siswaFilterField: 'student_id',
  },
  attendance: {
    label: 'Absensi', icon: '✅', menuIcon:'✅',
    perms: { admin: 'crud', ketua: 'cru', siswa: 'r' },
    order: 'date.desc',
    fields: [
      { key: 'student_id', label: 'Siswa', type: 'student_select', required: true },
      { key: 'date', label: 'Tanggal', type: 'date', required: true },
      { key: 'status', label: 'Status', type: 'select', options: ['Hadir','Izin','Sakit','Alpa'] },
      { key: 'note', label: 'Catatan', type: 'textarea' },
    ],
    columns: ['date', 'student_name', 'status', 'note'],
    siswaFilterField: 'student_id',
  },
  announcements: {
    label: 'Pengumuman', icon: '📢', menuIcon:'📢',
    perms: { admin: 'crud', ketua: 'cru', siswa: 'r' },
    order: 'created_at.desc',
    fields: [
      { key: 'title', label: 'Judul', type: 'text', required: true },
      { key: 'content', label: 'Isi Pengumuman', type: 'textarea', required: true },
      { key: 'scope', label: 'Cakupan', type: 'select', options: ['Sekolah','Kelas'] },
      { key: 'target_class', label: 'Kelas Tujuan (jika Kelas)', type: 'text' },
      { key: 'event_date', label: 'Tanggal Terkait (opsional)', type: 'date' },
    ],
    columns: ['title', 'scope', 'target_class', 'event_date'],
  },
  files: {
    label: 'File', icon: '🗂️', menuIcon:'🗂️',
    perms: { admin: 'crud', ketua: 'cru', siswa: 'r' },
    order: 'created_at.desc',
    fields: [
      { key: 'title', label: 'Judul File', type: 'text', required: true },
      { key: 'description', label: 'Deskripsi', type: 'textarea' },
      { key: 'category', label: 'Kategori', type: 'select', options: ['Materi','Tugas','Dokumen'] },
      { key: 'file_upload', label: 'Upload File', type: 'file' },
    ],
    columns: ['title', 'category', 'file_name'],
  },
  transactions: {
    label: 'Kas Kelas', icon: '💰', menuIcon:'💰',
    perms: { admin: 'crud', ketua: 'r', siswa: 'r' },
    order: 'date.desc',
    fields: [
      { key: 'date', label: 'Tanggal', type: 'date', required: true },
      { key: 'type', label: 'Jenis', type: 'select', options: ['Masuk','Keluar'] },
      { key: 'amount', label: 'Jumlah (Rp)', type: 'number', required: true },
      { key: 'class_name', label: 'Kelas', type: 'text' },
      { key: 'description', label: 'Keterangan', type: 'textarea' },
    ],
    columns: ['date', 'type', 'amount', 'class_name', 'description'],
  },
  activity_logs: {
    label: 'Log Aktivitas', icon: '📜', menuIcon:'📜',
    perms: { admin: 'r', ketua: '', siswa: '' },
    order: 'created_at.desc',
    fields: [],
    columns: ['created_at', 'actor_name', 'action', 'table_name', 'detail'],
  },
};

function permFor(table){
  const cfg = TABLES[table];
  return cfg.perms[APP.profile.role] || '';
}

function canDo(table, action){ 
  return permFor(table).includes(action); 
}

async function fetchStudentsList(){
  const { data } = await sb.from('students').select('id,name,class_name').order('name');
  return data || [];
}

async function renderCrud(table){
  const cfg = TABLES[table];
  const content = document.getElementById('content');
  const perm = permFor(table);
  if(!perm){ 
    content.innerHTML = '<div class="empty-state">🚫 Kamu tidak memiliki akses ke halaman ini.</div>'; 
    return; 
  }

  content.innerHTML = `
    <div class="glass panel">
      <div class="panel-head">
        <div class="panel-title neon-text">${cfg.icon} ${cfg.label}</div>
        <div class="toolbar">
          <input type="text" id="crud-search" placeholder="Cari data...">
          ${canDo(table,'c') ? `<button class="btn btn-solid btn-sm" id="crud-add">+ Tambah</button>` : ''}
        </div>
      </div>
      <div class="table-wrap"><div id="crud-table-holder" class="empty-state">Memuat data...</div></div>
    </div>
  `;

  if(canDo(table,'c')){
    document.getElementById('crud-add').addEventListener('click', ()=> openModal(table, null));
  }
  document.getElementById('crud-search').addEventListener('input', debounce(()=>loadCrudTable(table), 300));

  await loadCrudTable(table);
}

async function loadCrudTable(table){
  const cfg = TABLES[table];
  const holder = document.getElementById('crud-table-holder');
  if(!holder) return;
  const searchEl = document.getElementById('crud-search');
  const search = searchEl ? searchEl.value.trim() : '';

  let query = sb.from(table).select('*');

  if(APP.profile.role === 'siswa' && cfg.siswaFilterField){
    if(APP.studentRecord){
      query = query.eq(cfg.siswaFilterField, APP.studentRecord.id);
    } else {
      holder.innerHTML = '<div class="empty-state"><div class="ic">ℹ️</div>Data siswa untuk akun kamu belum terhubung. Hubungi admin.</div>';
      return;
    }
  }

  const [orderCol, orderDir] = (cfg.order || 'created_at.desc').split('.');
  query = query.order(orderCol, { ascending: orderDir === 'asc' });

  const { data, error } = await query.limit(500);
  if(error){ 
    holder.innerHTML = `<div class="empty-state">⚠️ ${escapeHtml(error.message)}</div>`; 
    return; 
  }

  let rows = data || [];
  if(search){
    const s = search.toLowerCase();
    rows = rows.filter(r => cfg.columns.some(c => String(r[c]||'').toLowerCase().includes(s)));
  }

  if(!rows.length){
    holder.innerHTML = `<div class="empty-state"><div class="ic">🗃️</div>Belum ada data ${cfg.label.toLowerCase()}.</div>`;
    return;
  }

  const showActions = canDo(table,'u') || canDo(table,'d');
  holder.innerHTML = `
    <table>
      <thead><tr>${cfg.columns.map(c=>`<th>${colLabel(cfg,c)}</th>`).join('')}${showActions?'<th>Aksi</th>':''}</tr></thead>
      <tbody>
        ${rows.map(r=>`
          <tr>
            ${cfg.columns.map(c=>`<td>${renderCell(table, c, r[c])}</td>`).join('')}
            ${showActions ? `<td class="row-actions">
              ${canDo(table,'u') ? `<button class="btn btn-sm btn-cyan" onclick="openModal('${table}','${r.id}')">✎</button>` : ''}
              ${canDo(table,'d') ? `<button class="btn btn-sm btn-danger" onclick="deleteRow('${table}','${r.id}')">🗑</button>` : ''}
            </td>` : ''}
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

function renderCell(table, key, val){
  if(key==='status'){
    const cls = val==='Hadir'?'badge-green':val==='Alpa'?'badge-red':'badge-warn';
    return `<span class="badge ${cls}">${escapeHtml(val||'-')}</span>`;
  }
  if(key==='type' && table==='transactions'){
    return `<span class="badge ${val==='Masuk'?'badge-green':'badge-red'}">${escapeHtml(val)}</span>`;
  }
  if(key==='amount') return fmtRupiah(val);
  if(key==='score') return `<strong>${val ?? '-'}</strong>`;
  if(key==='created_at' || key==='date' || key==='birth_date' || key==='event_date'){
    if(!val) return '-';
    return new Date(val).toLocaleDateString('id-ID', {day:'2-digit',month:'short',year:'numeric'});
  }
  if(key==='file_name' && val){
    return `<span class="cyan-text">📎 ${escapeHtml(val)}</span>`;
  }
  return escapeHtml(val ?? '-');
}

// Modal functions remain the same, just refactored
const modalOverlay = document.getElementById('modal-overlay');
document.getElementById('modal-close').addEventListener('click', closeModal);
document.getElementById('modal-cancel').addEventListener('click', closeModal);

function closeModal(){ 
  modalOverlay.classList.remove('active'); 
  APP.editing = null; 
}

async function openModal(table, id){
  const cfg = TABLES[table];
  APP.editing = { table, id };
  document.getElementById('modal-title').textContent = (id ? 'Edit ' : 'Tambah ') + cfg.label;
  const body = document.getElementById('modal-body');
  body.innerHTML = '<div class="empty-state">Memuat form...</div>';
  modalOverlay.classList.add('active');

  let record = {};
  if(id){
    const { data } = await sb.from(table).select('*').eq('id', id).maybeSingle();
    record = data || {};
  }

  let studentsOptions = [];
  if(cfg.fields.some(f=>f.type==='student_select')){
    studentsOptions = await fetchStudentsList();
  }

  body.innerHTML = cfg.fields.map(f=>{
    const val = record[f.key] ?? '';
    if(f.type === 'select'){
      return `<div class="field"><label>${f.label}</label>
        <select data-field="${f.key}">
          <option value="">-- Pilih --</option>
          ${f.options.map(o=>`<option value="${o}" ${val===o?'selected':''}>${o}</option>`).join('')}
        </select></div>`;
    }
    if(f.type === 'student_select'){
      return `<div class="field"><label>${f.label}</label>
        <select data-field="${f.key}" data-role="student-select">
          <option value="">-- Pilih Siswa --</option>
          ${studentsOptions.map(s=>`<option value="${s.id}" ${val===s.id?'selected':''}>${escapeHtml(s.name)} ${s.class_name?'('+escapeHtml(s.class_name)+')':''}</option>`).join('')}
        </select></div>`;
    }
    if(f.type === 'textarea'){
      return `<div class="field"><label>${f.label}</label><textarea data-field="${f.key}">${escapeHtml(val)}</textarea></div>`;
    }
    if(f.type === 'file'){
      return `<div class="field"><label>${f.label}</label>
        <div class="file-drop" id="file-drop-zone">📎 Klik untuk pilih file, atau seret ke sini<br><span class="small" id="file-name-preview">${escapeHtml(record.file_name||'')}</span></div>
        <input type="file" id="file-input-hidden" data-field="file_upload" style="display:none;"></div>`;
    }
    return `<div class="field"><label>${f.label}</label><input type="${f.type}" data-field="${f.key}" placeholder="${f.placeholder||''}" value="${escapeHtml(val)}"></div>`;
  }).join('');

  const fileZone = document.getElementById('file-drop-zone');
  if(fileZone){
    const input = document.getElementById('file-input-hidden');
    fileZone.addEventListener('click', ()=> input.click());
    input.addEventListener('change', ()=>{
      document.getElementById('file-name-preview').textContent = input.files[0] ? input.files[0].name : '';
    });
  }
}

document.getElementById('modal-save').addEventListener('click', async ()=>{
  const { table, id } = APP.editing;
  const cfg = TABLES[table];
  const btn = document.getElementById('modal-save');
  btn.disabled = true; btn.textContent = 'Menyimpan...';

  const payload = {};
  let fileToUpload = null;

  cfg.fields.forEach(f=>{
    if(f.type === 'file') return;
    const el = document.querySelector(`[data-field="${f.key}"]`);
    if(!el) return;
    let v = el.value;
    if(f.type === 'number') v = v === '' ? null : Number(v);
    payload[f.key] = v === '' ? null : v;
  });

  const studentSelect = document.querySelector('[data-role="student-select"]');
  if(studentSelect && studentSelect.value){
    const opt = studentSelect.options[studentSelect.selectedIndex];
    payload.student_name = opt.textContent.split(' (')[0];
  }

  const fileInput = document.getElementById('file-input-hidden');
  if(fileInput && fileInput.files[0]) fileToUpload = fileInput.files[0];

  try{
    if(fileToUpload){
      const path = `${Date.now()}_${fileToUpload.name}`.replace(/\s+/g,'_');
      const { error: upErr } = await sb.storage.from('school-files').upload(path, fileToUpload, { upsert:true });
      if(upErr) throw upErr;
      const { data: pub } = sb.storage.from('school-files').getPublicUrl(path);
      payload.file_url = pub.publicUrl;
      payload.file_name = fileToUpload.name;
    }

    if(table === 'attendance' && !id) payload.created_by = APP.profile.id;
    if(table === 'announcements' && !id) payload.created_by = APP.profile.id;
    if(table === 'files' && !id) payload.uploaded_by = APP.profile.id;
    if(table === 'transactions' && !id) payload.created_by = APP.profile.id;

    let error;
    if(id){
      ({ error } = await sb.from(table).update(payload).eq('id', id));
    } else {
      ({ error } = await sb.from(table).insert(payload));
    }
    if(error) throw error;

    toast(id ? 'Data berhasil diperbarui' : 'Data berhasil ditambahkan');
    logActivity(id?'update':'create', table, `${id?'Mengubah':'Menambah'} data pada ${TABLES[table].label}`);
    closeModal();
    if(APP.page === table) loadCrudTable(table);
    else if(APP.page === 'dashboard') renderDashboard();
  }catch(e){
    toast('Gagal menyimpan: ' + e.message, 'error');
  }finally{
    btn.disabled = false; btn.textContent = 'Simpan';
  }
});

async function deleteRow(table, id){
  if(!confirm('Yakin ingin menghapus data ini? Tindakan ini tidak dapat dibatalkan.')) return;
  const { error } = await sb.from(table).delete().eq('id', id);
  if(error){ 
    toast('Gagal menghapus: ' + error.message, 'error'); 
    return; 
  }
  toast('Data berhasil dihapus');
  logActivity('delete', table, `Menghapus data pada ${TABLES[table].label}`);
  loadCrudTable(table);
}
