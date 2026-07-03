/* =========================================================
   CALENDAR MODULE
   ========================================================= */

let calMonth = new Date().getMonth();
let calYear = new Date().getFullYear();

async function renderCalendar(){
  const content = document.getElementById('content');
  content.innerHTML = `
    <div class="glass panel">
      <div class="panel-head">
        <div class="panel-title neon-text" id="cal-title">Kalender</div>
        <div class="flex gap8">
          <button class="btn btn-sm" id="cal-prev">‹ Sebelumnya</button>
          <button class="btn btn-sm" id="cal-next">Berikutnya ›</button>
        </div>
      </div>
      <div class="cal-grid" id="cal-dow"></div>
      <div class="cal-grid mt12" id="cal-body"></div>
    </div>
    <div class="glass panel mt20">
      <div class="panel-title cyan-text">📌 Agenda Bulan Ini</div>
      <div id="cal-agenda" class="mt12"><div class="empty-state">Memuat...</div></div>
    </div>
  `;
  document.getElementById('cal-prev').addEventListener('click', ()=>{ calMonth--; if(calMonth<0){calMonth=11; calYear--;} drawCalendar(); });
  document.getElementById('cal-next').addEventListener('click', ()=>{ calMonth++; if(calMonth>11){calMonth=0; calYear++;} drawCalendar(); });
  await drawCalendar();
}

async function drawCalendar(){
  const monthNames = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
  document.getElementById('cal-title').textContent = `${monthNames[calMonth]} ${calYear}`;
  const dowWrap = document.getElementById('cal-dow');
  dowWrap.innerHTML = ['Min','Sen','Sel','Rab','Kam','Jum','Sab'].map(d=>`<div class="cal-dow">${d}</div>`).join('');

  const firstDay = new Date(calYear, calMonth, 1).getDay();
  const daysInMonth = new Date(calYear, calMonth+1, 0).getDate();
  const today = new Date();

  const start = `${calYear}-${String(calMonth+1).padStart(2,'0')}-01`;
  const end = `${calYear}-${String(calMonth+1).padStart(2,'0')}-${String(daysInMonth).padStart(2,'0')}`;
  const [{ data: events1 }, { data: events2 }] = await Promise.all([
    sb.from('announcements').select('title,event_date').gte('event_date', start).lte('event_date', end),
    sb.from('attendance').select('date,status').gte('date', start).lte('date', end)
  ]);
  const eventDates = new Set((events1||[]).filter(e=>e.event_date).map(e=>e.event_date));
  const attDates = new Set((events2||[]).map(e=>e.date));

  const body = document.getElementById('cal-body');
  let html = '';
  for(let i=0;i<firstDay;i++) html += '<div class="cal-day blank"></div>';
  for(let d=1; d<=daysInMonth; d++){
    const dateStr = `${calYear}-${String(calMonth+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    const isToday = today.getFullYear()===calYear && today.getMonth()===calMonth && today.getDate()===d;
    const hasEvent = eventDates.has(dateStr) || attDates.has(dateStr);
    html += `<div class="cal-day ${isToday?'today':''}"><div class="num">${d}</div>${hasEvent?'<div class="dot-evt"></div>':''}</div>`;
  }
  body.innerHTML = html;

  const agenda = document.getElementById('cal-agenda');
  const agItems = (events1||[]).filter(e=>e.event_date).sort((a,b)=> a.event_date.localeCompare(b.event_date));
  agenda.innerHTML = agItems.length ? agItems.map(e=>`
    <div class="flex items-center gap12" style="padding:8px 0; border-bottom:1px solid rgba(255,255,255,.05);">
      <span class="badge badge-cyan">${new Date(e.event_date).toLocaleDateString('id-ID',{day:'2-digit',month:'short'})}</span>
      <span>${escapeHtml(e.title)}</span>
    </div>`).join('') : '<div class="empty-state small">Tidak ada agenda khusus bulan ini.</div>';
}
