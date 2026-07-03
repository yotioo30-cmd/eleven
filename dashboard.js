/* =========================================================
   DASHBOARD MODULE
   ========================================================= */

async function renderDashboard(){
  const content = document.getElementById('content');

  const [studentsC, teachersC, classesC, announcementsC] = await Promise.all([
    sb.from('students').select('*', { count:'exact', head:true }),
    sb.from('teachers').select('*', { count:'exact', head:true }),
    sb.from('classes').select('*', { count:'exact', head:true }),
    sb.from('announcements').select('*', { count:'exact', head:true }),
  ]);

  content.innerHTML = `
    <div class="grid grid-4">
      <div class="glass stat-card"><div class="ic">🎓</div><div class="val cyan-text">${studentsC.count ?? 0}</div><div class="lbl">Total Siswa</div></div>
      <div class="glass stat-card"><div class="ic">🧑‍🏫</div><div class="val neon-text">${teachersC.count ?? 0}</div><div class="lbl">Total Guru</div></div>
      <div class="glass stat-card"><div class="ic">🏫</div><div class="val cyan-text">${classesC.count ?? 0}</div><div class="lbl">Total Kelas</div></div>
      <div class="glass stat-card"><div class="ic">📢</div><div class="val neon-text">${announcementsC.count ?? 0}</div><div class="lbl">Pengumuman</div></div>
    </div>

    <div class="grid grid-2 mt20">
      <div class="glass panel">
        <div class="panel-head"><div class="panel-title neon-text">📊 Statistik Absensi (50 Terbaru)</div></div>
        <div class="chart-wrap"><canvas id="chart-attendance"></canvas></div>
      </div>
      <div class="glass panel">
        <div class="panel-head"><div class="panel-title cyan-text">💰 Ringkasan Kas Kelas</div></div>
        <div class="chart-wrap"><canvas id="chart-kas"></canvas></div>
      </div>
    </div>

    <div class="glass panel mt20">
      <div class="panel-head"><div class="panel-title neon-text">📢 Pengumuman Terbaru</div></div>
      <div id="dash-announcements"><div class="empty-state">Memuat...</div></div>
    </div>
  `;

  loadAttendanceChart();
  loadKasChart();
  loadDashAnnouncements();
}

async function loadAttendanceChart(){
  let query = sb.from('attendance').select('status,date').order('date',{ascending:false}).limit(50);
  if(APP.profile.role==='siswa' && APP.studentRecord) query = query.eq('student_id', APP.studentRecord.id);
  const { data } = await query;
  const counts = { Hadir:0, Izin:0, Sakit:0, Alpa:0 };
  (data||[]).forEach(r=>{ if(counts[r.status]!==undefined) counts[r.status]++; });
  const ctx = document.getElementById('chart-attendance');
  if(!ctx) return;
  new Chart(ctx, {
    type:'doughnut',
    data:{ labels:Object.keys(counts), datasets:[{ data:Object.values(counts), backgroundColor:['#00ff85','#00e5ff','#ffcf4d','#ff3860'], borderColor:'transparent' }] },
    options:{ plugins:{ legend:{ labels:{ color: getComputedStyle(document.body).getPropertyValue('--text') } } } }
  });
}

async function loadKasChart(){
  const { data } = await sb.from('transactions').select('type,amount');
  let masuk = 0, keluar = 0;
  (data||[]).forEach(r=>{ if(r.type==='Masuk') masuk += Number(r.amount)||0; else keluar += Number(r.amount)||0; });
  const ctx = document.getElementById('chart-kas');
  if(!ctx) return;
  new Chart(ctx, {
    type:'bar',
    data:{ labels:['Masuk','Keluar','Saldo'], datasets:[{ label:'Rp', data:[masuk, keluar, masuk-keluar], backgroundColor:['#00ff85','#ff3860','#00e5ff'] }] },
    options:{ plugins:{ legend:{ display:false } }, scales:{ x:{ ticks:{ color:getComputedStyle(document.body).getPropertyValue('--text') } }, y:{ ticks:{ color:getComputedStyle(document.body).getPropertyValue('--text') } } } }
  });
}

async function loadDashAnnouncements(){
  const { data } = await sb.from('announcements').select('*').order('created_at',{ascending:false}).limit(4);
  const wrap = document.getElementById('dash-announcements');
  if(!data || !data.length){ 
    wrap.innerHTML = '<div class="empty-state"><div class="ic">📭</div>Belum ada pengumuman.</div>'; 
    return; 
  }
  wrap.innerHTML = data.map(a=>`
    <div style="padding:12px 0; border-bottom:1px solid rgba(255,255,255,.06);">
      <div class="flex justify-between items-center">
        <strong>${escapeHtml(a.title)}</strong>
        <span class="badge badge-cyan">${escapeHtml(a.scope||'Sekolah')}</span>
      </div>
      <div class="muted small mt8">${escapeHtml((a.content||'').slice(0,120))}${(a.content||'').length>120?'...':''}</div>
    </div>
  `).join('');
}
