
/* ──────────────────────────────────────────────────────────────
   DATA
─────────────────────────────────────────────────────────────── */
const TASKS=[
  {id:'t1',title:'Review pitch deck slides',time:'09:00',period:'morning',energy:'deep',done:false,proj:'Launch',notes:'Focus on slides 8–12. Sharpen the narrative arc.',subs:[{t:'Slide 8 — market size',d:true},{t:'Slide 10 — traction',d:false},{t:'Slide 12 — ask',d:false}]},
  {id:'t2',title:'Reply to investor email',time:'10:30',period:'morning',energy:'quick',done:false,proj:'Launch',notes:'Keep it brief and confident.',subs:[]},
  {id:'t3',title:'Review Q2 budget forecast',time:'14:00',period:'afternoon',energy:'deep',done:false,proj:null,notes:'Focus on burn rate.',subs:[]},
  {id:'t4',title:'Write product changelog',time:'15:00',period:'afternoon',energy:'creative',done:false,proj:'Launch',notes:'',subs:[]},
  {id:'t5',title:'Evening meditation',time:'20:00',period:'evening',energy:'personal',done:true,proj:null,notes:'',subs:[]},
  {id:'t6',title:'Update CRM contacts',time:'11:00',period:'morning',energy:'quick',done:true,proj:null,notes:'',subs:[]},
];
const PROJECTS=[
  {id:'p1',name:'Parallel Launch',color:'--sage',icon:'ti-rocket',tasks:12,done:8,desc:'App Store submission · June 2025'},
  {id:'p2',name:'Investor Deck',color:'--lilac',icon:'ti-chart-bar',tasks:7,done:5,desc:'Series A · Q2 closing'},
  {id:'p3',name:'Content Pipeline',color:'--peach',icon:'ti-brand-instagram',tasks:15,done:6,desc:'30-day content plan'},
];
const TOMORROW=[
  {title:'Team standup',time:'9:00',color:'#6b8f71'},
  {title:'Design review',time:'11:30',color:'#9b8ec4'},
  {title:'Gym',time:'6:00 PM',color:'#c07840'},
];
const BREATHMSGS=[
  'You\'re building something meaningful.',
  'One focused step is all it takes.',
  'Your calm is your superpower.',
  'Today is exactly enough.',
  'Presence is the practice.',
];
let activeTaskTab='today';
let selEnrg='deep',selPeriod_='morning';
const T={secs:25*60,running:false,mode:'focus',sessions:2,interval:null};

/* ──────────────────────────────────────────────────────────────
   PAGE NAVIGATION
─────────────────────────────────────────────────────────────── */
function goPage(id){
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  document.querySelectorAll('.di').forEach(d=>d.classList.remove('active'));
  document.getElementById('pg-'+id).classList.add('active');
  const di=document.getElementById('di-'+id);
  if(di)di.classList.add('active');
  closeMenu();
  if(id==='timeline')renderTimeline();
  if(id==='focus')renderFocusList();
}

/* ──────────────────────────────────────────────────────────────
   SUB-PAGE NAVIGATION
─────────────────────────────────────────────────────────────── */
function openSub(id){
  closeMenu();
  const el=document.getElementById(id);
  if(!el)return;
  el.classList.add('open');
  if(id==='s-tasks'){renderTaskTab(activeTaskTab);updateTaskHero();}
  if(id==='s-reset')renderReset();
  if(id==='s-calendar')renderCal();
}
function closeSub(id){
  document.getElementById(id)?.classList.remove('open');
}

/* ──────────────────────────────────────────────────────────────
   QUICK MENU
─────────────────────────────────────────────────────────────── */
let menuOpen=false;
function toggleCreate(){
  menuOpen=!menuOpen;
  document.getElementById('qmenu').classList.toggle('open',menuOpen);
  document.getElementById('plusBtn').classList.toggle('open',menuOpen);
}
function closeMenu(){
  menuOpen=false;
  document.getElementById('qmenu').classList.remove('open');
  document.getElementById('plusBtn').classList.remove('open');
}

/* ──────────────────────────────────────────────────────────────
   CREATE OVERLAY
─────────────────────────────────────────────────────────────── */
function openCreate(){
  closeMenu();
  document.getElementById('createOverlay').classList.add('open');
  setTimeout(()=>document.getElementById('newTaskTitle')?.focus(),400);
}
function closeCreate(){document.getElementById('createOverlay').classList.remove('open');}
document.getElementById('createOverlay').addEventListener('click',e=>{if(e.target===e.currentTarget)closeCreate();});

function selEnergy(el){selEnrg=el.dataset.e;document.querySelectorAll('#energyChips .chip').forEach(c=>c.classList.toggle('sel',c===el));}
function selPeriod(el){selPeriod_=el.dataset.p;document.querySelectorAll('#periodChips .chip').forEach(c=>c.classList.toggle('sel',c===el));}

function createTask(){
  const inp=document.getElementById('newTaskTitle');
  const title=inp?.value.trim();
  if(!title){inp?.focus();return;}
  TASKS.unshift({id:'t'+Date.now(),title,time:'',period:selPeriod_,energy:selEnrg,done:false,proj:null,notes:'',subs:[]});
  inp.value='';
  closeCreate();
  setTimeout(()=>{renderTaskTab(activeTaskTab);updateTaskHero();},400);
}

/* ──────────────────────────────────────────────────────────────
   GREETING
─────────────────────────────────────────────────────────────── */
function setGreeting(){
  const h=new Date().getHours();
  const msgs=['Good morning','Good afternoon','Good evening'];
  const i=h<12?0:h<18?1:2;
  const el=document.getElementById('greetSm');
  if(el)el.textContent=msgs[i];
}
setGreeting();

/* Breathing message rotation */
let bIdx=0;
function rotatBreath(){
  const el=document.getElementById('breathMsg');
  if(!el)return;
  el.style.opacity='0';el.style.transform='translateY(6px)';
  setTimeout(()=>{
    bIdx=(bIdx+1)%BREATHMSGS.length;
    el.textContent=BREATHMSGS[bIdx];
    el.style.transition='opacity .5s,transform .5s';
    el.style.opacity='1';el.style.transform='translateY(0)';
  },400);
}
setInterval(rotatBreath,7000);

/* ──────────────────────────────────────────────────────────────
   TASK HELPERS
─────────────────────────────────────────────────────────────── */
function todayTasks(){return TASKS.filter(t=>t.period==='morning'||t.period==='afternoon'||t.period==='evening');}
function pct(a,b){return b===0?0:Math.round((a/b)*100);}

function eBadge(e){
  const map={deep:'badge-deep',light:'badge-light',creative:'badge-creative',quick:'badge-quick',personal:'badge-personal'};
  const labels={deep:'Deep',light:'Light',creative:'Creative',quick:'Quick',personal:'Personal'};
  return`<span class="badge ${map[e]||'badge-light'}">${labels[e]||e}</span>`;
}

function energyColor(e){
  return{deep:'--lilac',creative:'--peach',quick:'--sky',personal:'--rose',light:'--sage'}[e]||'--sage';
}

/* ──────────────────────────────────────────────────────────────
   TASKS MODULE RENDER
─────────────────────────────────────────────────────────────── */
function switchTab(tab){
  activeTaskTab=tab;
  document.querySelectorAll('.tab').forEach(t=>t.classList.remove('active'));
  document.getElementById('tab-'+tab)?.classList.add('active');
  renderTaskTab(tab);
}

function renderTaskTab(tab){
  const cont=document.getElementById('taskTabContent');
  if(!cont)return;

  if(tab==='projects'){
    cont.innerHTML=`<div style="padding:12px 18px;display:flex;flex-direction:column;gap:12px;">${PROJECTS.map(proj=>{
      const p=pct(proj.done,proj.tasks);
      return`<div class="proj-card" onclick="openProjDetail('${proj.id}')">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px;">
          <div style="width:38px;height:38px;border-radius:13px;background:rgba(var(--${proj.color.replace('--','')}-bg),0.3);display:flex;align-items:center;justify-content:center;position:relative;z-index:1;">
            <i class="ti ${proj.icon}" style="color:var(${proj.color});font-size:17px;"></i>
          </div>
          <div style="flex:1;position:relative;z-index:1;">
            <div style="font-size:14px;font-weight:500;color:var(--txt);">${proj.name}</div>
            <div style="font-size:11px;color:var(--txt3);font-weight:300;margin-top:1px;">${proj.desc}</div>
          </div>
          <span style="font-size:13px;font-weight:500;color:var(${proj.color});position:relative;z-index:1;">${p}%</span>
        </div>
        <div class="prog" style="position:relative;z-index:1;"><div class="prog-f" style="width:${p}%;background:var(${proj.color});"></div></div>
        <div style="font-size:10px;color:var(--txt3);margin-top:8px;position:relative;z-index:1;">${proj.done} of ${proj.tasks} completed</div>
      </div>`;
    }).join('')}</div>`;
    return;
  }

  if(tab==='done'){
    const done=TASKS.filter(t=>t.done);
    if(!done.length){
      cont.innerHTML=`<div class="empty-state">
        <div class="empty-orb"><i class="ti ti-sparkles"></i></div>
        <div class="empty-title">Nothing completed yet</div>
        <div class="empty-sub">Every task you complete will rest here. Begin with one.</div>
      </div>`;
      return;
    }
    cont.innerHTML=`<div class="card" style="margin:12px 18px;padding:0;">${done.map(t=>`
      <div class="task-item">
        <div class="cb done"></div>
        <div class="task-body">
          <div class="task-title done">${t.title}</div>
        </div>
        ${eBadge(t.energy)}
      </div>`).join('')}</div>`;
    return;
  }

  if(tab==='upcoming'){
    const upcoming=TOMORROW.map((t,i)=>({id:'u'+i,title:t.title,time:t.time,period:'morning',energy:'deep',done:false,proj:null,notes:'',subs:[],color:t.color}));
    cont.innerHTML=`<div class="card" style="margin:12px 18px;padding:0;">${upcoming.map(t=>`
      <div class="task-item">
        <div class="cb"></div>
        <div class="task-body">
          <div class="task-title">${t.title}</div>
          <div class="task-meta"><span class="task-time">${t.time}</span></div>
        </div>
      </div>`).join('')}</div>`;
    return;
  }

  // TODAY tab — grouped by period
  const periods=[
    {key:'morning',label:'Morning'},
    {key:'afternoon',label:'Afternoon'},
    {key:'evening',label:'Evening'},
  ];
  let html='';
  periods.forEach(({key,label})=>{
    const tasks=TASKS.filter(t=>t.period===key&&!t.done);
    if(!tasks.length)return;
    html+=`<div class="tg"><span class="tg-lbl">${label.toUpperCase()}</span><div class="tg-line"></div><span class="tg-cnt">${tasks.length}</span></div>
    <div class="card" style="margin:0 18px;padding:0;">`;
    tasks.forEach(t=>{
      const eColor=energyColor(t.energy);
      html+=`<div class="task-item" id="ti-${t.id}" onclick="toggleTaskActs('${t.id}')">
        <div class="cb ${t.done?'done':''}" onclick="event.stopPropagation();completeTask('${t.id}')"></div>
        <div class="task-body">
          <div class="task-title ${t.done?'done':''}">${t.title}</div>
          <div class="task-meta">
            ${t.time?`<span class="task-time">${t.time}</span>`:''}
            ${t.proj?`<span class="task-proj">· ${t.proj}</span>`:''}
            ${eBadge(t.energy)}
          </div>
        </div>
        <i class="ti ti-chevron-right" style="font-size:14px;color:var(--txt4);flex-shrink:0;"></i>
      </div>
      <div class="task-acts" id="ta-${t.id}">
        <div class="ta-btn" onclick="openTaskDetail('${t.id}')"><i class="ti ti-notes" style="color:var(--txt2);"></i><span>Detail</span></div>
        <div class="ta-btn" onclick="openSub('s-focus')"><i class="ti ti-player-play" style="color:var(--sage);"></i><span>Focus</span></div>
        <div class="ta-btn" onclick="postponeTask('${t.id}')"><i class="ti ti-clock" style="color:var(--amber);"></i><span>Later</span></div>
        <div class="ta-btn" onclick="deleteTask('${t.id}')"><i class="ti ti-trash" style="color:var(--rose);"></i><span>Remove</span></div>
      </div>`;
    });
    html+=`</div>`;
  });

  const allDone=TASKS.filter(t=>!t.done).length===0;
  if(allDone||!html){
    html=`<div class="empty-state">
      <div class="empty-orb"><i class="ti ti-sun-high"></i></div>
      <div class="empty-title">The slate is clear.</div>
      <div class="empty-sub">You've created beautiful space. Add an intention or simply rest in the stillness.</div>
    </div>`;
  }
  cont.innerHTML=html;
}

function toggleTaskActs(id){
  const el=document.getElementById('ta-'+id);
  if(!el)return;
  const isOpen=el.classList.contains('open');
  document.querySelectorAll('.task-acts.open').forEach(e=>e.classList.remove('open'));
  if(!isOpen)el.classList.add('open');
}

function completeTask(id){
  const task=TASKS.find(t=>t.id===id);
  if(!task)return;
  const cb=document.querySelector(`#ti-${id} .cb`);
  const item=document.getElementById('ti-${id}');
  if(cb){cb.classList.add('completing','done');cb.classList.add('completing');}
  const tiEl=document.getElementById('ti-'+id);
  if(tiEl)tiEl.classList.add('completing');
  setTimeout(()=>{
    task.done=true;
    if(tiEl)tiEl.classList.add('vanishing');
    setTimeout(()=>{renderTaskTab(activeTaskTab);updateTaskHero();},480);
  },400);
}

function postponeTask(id){
  const t=TASKS.find(x=>x.id===id);
  if(t)t.period='evening';
  renderTaskTab(activeTaskTab);
}
function deleteTask(id){
  const idx=TASKS.findIndex(x=>x.id===id);
  if(idx>-1)TASKS.splice(idx,1);
  renderTaskTab(activeTaskTab);updateTaskHero();
}

function updateTaskHero(){
  const today=todayTasks();
  const done=today.filter(t=>t.done).length;
  const p=pct(done,today.length);
  const pctEl=document.getElementById('taskPct');
  if(pctEl)pctEl.textContent=p+'%';
  const ring=document.getElementById('taskHeroRing');
  if(ring){
    const circ=182.2;
    ring.setAttribute('stroke-dashoffset',(circ-(p/100)*circ).toFixed(1));
  }
}

/* ──────────────────────────────────────────────────────────────
   TASK DETAIL
─────────────────────────────────────────────────────────────── */
function openTaskDetail(id){
  const t=TASKS.find(x=>x.id===id);
  if(!t)return;
  const eColor=energyColor(t.energy);
  document.getElementById('taskDetailContent').innerHTML=`
    <div class="sub-hd">
      <div class="back-btn" onclick="closeSub('s-taskdetail')"><i class="ti ti-arrow-left"></i></div>
      <span class="sub-title" style="font-size:17px;">${t.title}</span>
    </div>
    <div style="margin:8px 18px 0;background:linear-gradient(135deg,rgba(var(--${eColor.replace('--','')}-lt),0.5),rgba(255,255,255,0.4));border:1px solid rgba(255,255,255,0.85);border-radius:22px;padding:18px 20px;">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px;">
        ${eBadge(t.energy)}
        ${t.time?`<span class="task-time">${t.time}</span>`:''}
        ${t.proj?`<span class="task-proj">${t.proj}</span>`:''}
      </div>
      ${t.notes?`<div style="font-size:14px;color:var(--txt2);line-height:1.6;font-weight:300;">${t.notes}</div>`:'<div style="font-size:13px;color:var(--txt3);font-style:italic;">No notes yet. Tap to add context.</div>'}
    </div>
    ${t.subs.length?`
    <span class="sec-lbl">SUBTASKS</span>
    <div class="card" style="margin:0 18px;padding:12px 16px;">
      ${t.subs.map((s,i)=>`<div class="subtask">
        <div class="sub-cb ${s.d?'done':''}" onclick="toggleSub('${id}',${i})"></div>
        <span style="font-size:13px;color:var(--txt);text-decoration:${s.d?'line-through':''};opacity:${s.d?0.5:1};">${s.t}</span>
      </div>`).join('')}
    </div>`:''}
    <span class="sec-lbl">ACTIONS</span>
    <div class="card" style="margin:0 18px;padding:0;">
      <div class="li" onclick="openSub('s-focus')"><div class="li-ico" style="background:var(--sage-lt);"><i class="ti ti-player-play" style="color:var(--sage);"></i></div><div class="li-body"><div class="li-t">Enter Focus Mode</div><div class="li-s">Start a deep work session</div></div><i class="ti ti-chevron-right li-r"></i></div>
      <div class="li" style="border-bottom:none;" onclick="completeTask('${id}');closeSub('s-taskdetail');"><div class="li-ico" style="background:var(--sage-lt);"><i class="ti ti-check" style="color:var(--sage);"></i></div><div class="li-body"><div class="li-t">Mark complete</div><div class="li-s">Celebrate this win</div></div></div>
    </div>
    <div style="height:12px;"></div>`;
  openSub('s-taskdetail');
}

function toggleSub(taskId,i){
  const t=TASKS.find(x=>x.id===taskId);
  if(t&&t.subs[i])t.subs[i].d=!t.subs[i].d;
  openTaskDetail(taskId);
}

/* ──────────────────────────────────────────────────────────────
   PROJECT DETAIL
─────────────────────────────────────────────────────────────── */
function openProjDetail(id){
  const proj=PROJECTS.find(p=>p.id===id);
  if(!proj)return;
  const pTasks=TASKS.filter(t=>t.proj===proj.name);
  const p=pct(proj.done,proj.tasks);
  document.getElementById('projDetailContent').innerHTML=`
    <div class="sub-hd">
      <div class="back-btn" onclick="closeSub('s-projdetail')"><i class="ti ti-arrow-left"></i></div>
      <span class="sub-title">${proj.name}</span>
    </div>
    <div style="margin:8px 18px 0;background:var(--card);border:1px solid var(--glass);border-radius:24px;padding:20px;box-shadow:var(--sh-glass),var(--sh);">
      <div style="font-size:13px;color:var(--txt2);margin-bottom:14px;font-weight:300;">${proj.desc}</div>
      <div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:10px;">
        <span style="font-size:13px;color:var(--txt3);">${proj.done} of ${proj.tasks} complete</span>
        <span style="font-size:22px;font-weight:500;color:var(${proj.color});font-family:var(--serif);">${p}%</span>
      </div>
      <div class="prog"><div class="prog-f" style="width:${p}%;background:var(${proj.color});"></div></div>
    </div>
    ${pTasks.length?`<span class="sec-lbl">TASKS</span>
    <div class="card" style="margin:0 18px;padding:0;">
      ${pTasks.map(t=>`<div class="task-item">
        <div class="cb ${t.done?'done':''}" onclick="completeTask('${t.id}')"></div>
        <div class="task-body"><div class="task-title ${t.done?'done':''}">${t.title}</div>
        <div class="task-meta">${t.time?`<span class="task-time">${t.time}</span>`:''}${eBadge(t.energy)}</div></div>
      </div>`).join('')}
    </div>`:''}
    <div style="height:12px;"></div>`;
  openSub('s-projdetail');
}

/* ──────────────────────────────────────────────────────────────
   FOCUS PAGE
─────────────────────────────────────────────────────────────── */
function renderFocusList(){
  const el=document.getElementById('focusTaskList');
  if(!el)return;
  const tasks=todayTasks().filter(t=>!t.done);
  if(!tasks.length){
    el.innerHTML=`<div style="padding:20px;text-align:center;font-size:13px;color:var(--txt3);font-style:italic;font-family:var(--serif);">All clear. Remarkable work today.</div>`;
    return;
  }
  el.innerHTML=tasks.map(t=>`<div class="focus-list-item" onclick="setFocusTask('${t.id}')">
    <div class="fli-dot" style="background:var(${energyColor(t.energy)});"></div>
    <div class="fli-body">
      <div class="fli-title">${t.title}</div>
      <div class="fli-meta">${t.time||''} ${t.period}</div>
    </div>
    ${eBadge(t.energy)}
  </div>`).join('');
}

function setFocusTask(id){
  const t=TASKS.find(x=>x.id===id);
  if(!t)return;
  const n=document.getElementById('focusTaskName');
  const s=document.getElementById('focusTaskSub');
  if(n){n.style.opacity='0';setTimeout(()=>{n.textContent=t.title;n.style.transition='opacity .4s';n.style.opacity='1';},200);}
  if(s){s.style.opacity='0';setTimeout(()=>{s.textContent=`${t.time?t.time+' · ':''}${t.energy} energy`;s.style.transition='opacity .4s';s.style.opacity='1';},220);}
  document.getElementById('heroPrimary').textContent=t.title;
}

function selectIntention(el){
  document.querySelectorAll('#focusRitual .chip').forEach(c=>c.classList.remove('sel'));
  el.classList.add('sel');
}

/* Focus dark mode toggle when timer runs */
function setFocusAmbient(active){
  document.getElementById('focusBg')?.classList.toggle('active-mode',active);
}

/* ──────────────────────────────────────────────────────────────
   FOCUS TIMER
─────────────────────────────────────────────────────────────── */
function fmtTime(s){const m=Math.floor(s/60),sec=s%60;return`${m<10?'0':''}${m}:${sec<10?'0':''}${sec}`;}

function updateRing(secs,mode){
  const el=document.getElementById('fRing');
  if(!el)return;
  const total=(mode==='focus'?25:5)*60;
  const circ=628.3;
  const off=circ-((total-secs)/total)*circ;
  el.setAttribute('stroke-dashoffset',Math.max(0,off).toFixed(1));
  el.setAttribute('stroke',mode==='focus'?'#6b8f71':'#9b8ec4');
}

function togT(){
  T.running=!T.running;
  const ico=document.getElementById('fIco');
  if(ico)ico.className=`ti ti-${T.running?'player-pause':'player-play'}`;
  setFocusAmbient(T.running);

  if(T.running){
    // Collapse ritual on start
    const ritual=document.getElementById('focusRitual');
    if(ritual){ritual.style.transition='all .5s var(--gentle)';ritual.style.opacity='0';ritual.style.transform='translateY(-8px)';setTimeout(()=>ritual.style.display='none',500);}

    T.interval=setInterval(()=>{
      if(T.secs>0){
        T.secs--;
        const d=document.getElementById('fNum');
        if(d)d.textContent=fmtTime(T.secs);
        updateRing(T.secs,T.mode);
      }else{
        clearInterval(T.interval);T.running=false;
        setFocusAmbient(false);
        if(T.mode==='focus'){
          T.mode='break';T.secs=5*60;T.sessions++;
          const sc=document.getElementById('sessCount'),tm=document.getElementById('totalMin');
          if(sc)sc.textContent=T.sessions;
          if(tm)tm.textContent=T.sessions*25;
          showCeremony();
        }else{
          T.mode='focus';T.secs=25*60;
        }
        if(ico)ico.className='ti ti-player-play';
        const sub=document.getElementById('fSub');
        if(sub)sub.textContent=T.mode==='focus'?'FOCUS TIME':'BREAK TIME';
      }
    },1000);
  }else{
    clearInterval(T.interval);
  }
}

function resetT(){
  clearInterval(T.interval);T.running=false;T.mode='focus';T.secs=25*60;
  setFocusAmbient(false);
  const d=document.getElementById('fNum'),ico=document.getElementById('fIco'),sub=document.getElementById('fSub');
  if(d)d.textContent='25:00';
  if(ico)ico.className='ti ti-player-play';
  if(sub)sub.textContent='FOCUS TIME';
  updateRing(T.secs,T.mode);
  // Restore ritual
  const ritual=document.getElementById('focusRitual');
  if(ritual){ritual.style.display='';ritual.style.opacity='1';ritual.style.transform='';}
}

function skipT(){
  clearInterval(T.interval);T.running=false;
  T.mode=T.mode==='focus'?'break':'focus';T.secs=(T.mode==='focus'?25:5)*60;
  const d=document.getElementById('fNum'),ico=document.getElementById('fIco'),sub=document.getElementById('fSub');
  if(d)d.textContent=fmtTime(T.secs);
  if(ico)ico.className='ti ti-player-play';
  if(sub)sub.textContent=T.mode==='focus'?'FOCUS TIME':'BREAK TIME';
  updateRing(T.secs,T.mode);
  setFocusAmbient(false);
}

/* ──────────────────────────────────────────────────────────────
   COMPLETION CEREMONY
─────────────────────────────────────────────────────────────── */
function showCeremony(){
  const c=document.getElementById('focusCeremony');
  if(c)c.classList.add('visible');
}
function endCeremony(){
  const c=document.getElementById('focusCeremony');
  if(c)c.classList.remove('visible');
}

/* ──────────────────────────────────────────────────────────────
   TIMELINE
─────────────────────────────────────────────────────────────── */
function renderTimeline(){
  const entries=[
    {date:'Monday, May 26',items:[
      {t:'Focus session complete',sub:'2 sessions · 50 min',ico:'ti-circle-dot',col:'--sage'},
      {t:'Review pitch deck slides',sub:'Completed · Deep work',ico:'ti-check',col:'--sage'},
    ]},
    {date:'Sunday, May 25',items:[
      {t:'Gym session',sub:'Push day · 45 min',ico:'ti-barbell',col:'--peach'},
      {t:'Journal entry',sub:'The clarity I needed',ico:'ti-notebook',col:'--lilac'},
      {t:'Cold shower streak',sub:'11 consecutive days',ico:'ti-droplet',col:'--sky'},
    ]},
    {date:'Saturday, May 24',items:[
      {t:'Reading — The War of Art',sub:'Finished chapter 4',ico:'ti-book',col:'--lilac'},
      {t:'Weekly planning',sub:'Reviewed Q2 goals',ico:'ti-chart-bar',col:'--peach'},
    ]},
  ];
  const el=document.getElementById('tl-content');
  if(!el)return;
  el.innerHTML=entries.map(day=>`
    <div style="padding:0 18px;">
      <div style="font-size:11px;color:var(--txt3);letter-spacing:.14em;font-weight:400;padding:14px 0 8px;">${day.date.toUpperCase()}</div>
      <div class="card" style="padding:0;">
        ${day.items.map(item=>`<div class="li">
          <div class="li-ico" style="background:var(${item.col}-lt);"><i class="ti ${item.ico}" style="color:var(${item.col});"></i></div>
          <div class="li-body"><div class="li-t">${item.t}</div><div class="li-s">${item.sub}</div></div>
        </div>`).join('')}
      </div>
    </div>`).join('');
}

/* ──────────────────────────────────────────────────────────────
   CALENDAR
─────────────────────────────────────────────────────────────── */
function renderCal(){
  const days=['S','M','T','W','T','F','S'];
  const hdEl=document.getElementById('calHd');
  const grEl=document.getElementById('calGrid');
  if(!hdEl||!grEl)return;
  hdEl.innerHTML=days.map(d=>`<div style="text-align:center;font-size:10px;color:var(--txt3);">${d}</div>`).join('');
  const today=17;const events=[3,7,12,17,22,28];const firstDay=4;
  let cells='';
  for(let i=0;i<firstDay;i++)cells+=`<div></div>`;
  for(let d=1;d<=31;d++){
    const isToday=d===today;const hasEvent=events.includes(d);
    cells+=`<div class="cal-d${isToday?' today':''}${hasEvent&&!isToday?' event':''}">${d}</div>`;
  }
  grEl.innerHTML=cells;
}

/* ──────────────────────────────────────────────────────────────
   EVENING RESET
─────────────────────────────────────────────────────────────── */
function renderReset(){
  const today=todayTasks();
  const done=today.filter(t=>t.done).length;
  const p=pct(done,today.length);
  const unfinished=today.filter(t=>!t.done);
  const emotionalNote=p>=70?'A day of quiet excellence. Exactly right.':p>=40?'Solid progress. Tomorrow begins fresh.':'Even one step forward matters. Rest well.';
  document.getElementById('resetContent').innerHTML=`
    <div style="text-align:center;padding:14px 22px 0;">
      <div style="width:62px;height:62px;border-radius:50%;background:linear-gradient(145deg,var(--lilac-lt),var(--sage-lt));display:flex;align-items:center;justify-content:center;margin:0 auto 14px;box-shadow:0 4px 18px rgba(155,142,196,.22);"><i class="ti ti-moon-stars" style="font-size:26px;color:var(--lilac);"></i></div>
      <div style="font-size:24px;font-weight:600;color:var(--txt);font-family:var(--serif);">Evening Review</div>
      <div style="font-size:12px;color:var(--txt3);margin-top:4px;font-weight:300;">Monday, May 17</div>
    </div>
    <span class="sec-lbl">TODAY'S HARVEST</span>
    <div class="card" style="margin:0 18px 10px;padding:18px 20px;">
      <div style="display:flex;justify-content:space-around;margin-bottom:14px;">
        <div style="text-align:center;"><div style="font-size:28px;font-weight:500;color:var(--sage);font-family:var(--serif);">${done}</div><div style="font-size:10px;color:var(--txt3);letter-spacing:.1em;margin-top:2px;">COMPLETE</div></div>
        <div style="text-align:center;"><div style="font-size:28px;font-weight:500;color:var(--txt);font-family:var(--serif);">${unfinished.length}</div><div style="font-size:10px;color:var(--txt3);letter-spacing:.1em;margin-top:2px;">CARRIED</div></div>
        <div style="text-align:center;"><div style="font-size:28px;font-weight:500;color:var(--lilac);font-family:var(--serif);">${p}%</div><div style="font-size:10px;color:var(--txt3);letter-spacing:.1em;margin-top:2px;">CLARITY</div></div>
      </div>
      <div class="prog"><div class="prog-f" style="width:${p}%;background:linear-gradient(90deg,var(--sage),var(--lilac));"></div></div>
      <p style="font-size:13px;color:var(--txt2);margin-top:14px;text-align:center;font-style:italic;font-family:var(--serif);line-height:1.6;">"${emotionalNote}"</p>
    </div>
    ${unfinished.length?`<span class="sec-lbl">GENTLE CARRY-FORWARD</span>
    <div class="card" style="margin:0 18px 10px;padding:0;">
      ${unfinished.slice(0,4).map(t=>`<div class="tm-item">
        <div class="tm-dot" style="background:var(${energyColor(t.energy)});"></div>
        <span class="tm-lbl">${t.title}</span>${eBadge(t.energy)}
      </div>`).join('')}
    </div>`:''}
    <span class="sec-lbl">TOMORROW BEGINS WITH</span>
    <div class="card" style="margin:0 18px 10px;padding:0;">
      ${TOMORROW.map(t=>`<div class="tm-item"><div class="tm-dot" style="background:${t.color};"></div><span class="tm-lbl">${t.title}</span><span class="tm-meta">${t.time}</span></div>`).join('')}
    </div>
    <div style="padding:0 18px;margin-top:4px;">
      <button class="start-btn" style="width:100%;justify-content:center;font-size:14px;" onclick="closeSub('s-reset')">
        <i class="ti ti-moon"></i> Rest well tonight
      </button>
    </div>
    <div style="height:14px;"></div>`;
}

/* ──────────────────────────────────────────────────────────────
   BOOT
─────────────────────────────────────────────────────────────── */
renderFocusList();
renderTaskTab('today');
updateTaskHero();
updateRing(T.secs,T.mode);

/* Stagger home elements on load */
setTimeout(()=>{
  document.querySelectorAll('#pg-home > *').forEach((el,i)=>{
    el.style.opacity='0';el.style.transform='translateY(14px)';
    setTimeout(()=>{
      el.style.transition=`opacity .5s var(--ease-out), transform .5s var(--ease-out)`;
      el.style.opacity='1';el.style.transform='translateY(0)';
    },80+i*55);
  });
},100);
