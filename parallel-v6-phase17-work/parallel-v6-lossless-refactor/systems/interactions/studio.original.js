
/* ─── PAGE / SUB NAVIGATION ───────────────────────────────────────── */
function switchTab(id,btn){
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  document.querySelectorAll('.di').forEach(b=>b.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  btn.classList.add('active');
}

const subStack=[];
function showSub(id){
  const el=document.getElementById(id);
  if(el){
    el.classList.add('open');
    subStack.push(id);
  }
}
function closeSub(id){
  const el=document.getElementById(id);
  if(el) el.classList.remove('open');
  const i=subStack.indexOf(id);
  if(i>-1) subStack.splice(i,1);
}

/* ─── PROJECT TABS ────────────────────────────────────────────────── */
const projTabIds=['ptab-tasks','ptab-docs','ptab-board','ptab-milestones','ptab-files','ptab-comments'];
function switchProjTab(btn,tabId){
  document.querySelectorAll('.pt').forEach(t=>t.classList.remove('active'));
  btn.classList.add('active');
  projTabIds.forEach(id=>{
    const el=document.getElementById(id);
    if(el) el.style.display=(id===tabId)?'':'none';
  });
}

/* ─── TEMPLATE CATEGORY ───────────────────────────────────────────── */
function switchTmplCat(btn){
  document.querySelectorAll('.tc').forEach(t=>t.classList.remove('active'));
  btn.classList.add('active');
}

/* ─── PROJECT OPEN WOW ANIMATION ──────────────────────────────────── */
const projIcons={
  brand:{bg:'linear-gradient(145deg,#9b8ec4,#7a6fa0)',icon:'ti-palette',sub:'s-project-detail'},
  app:{bg:'linear-gradient(145deg,#6b8f71,#5a7860)',icon:'ti-device-mobile',sub:'s-project-detail'},
  marketing:{bg:'linear-gradient(145deg,#c07840,#9a5a28)',icon:'ti-speakerphone',sub:'s-project-detail'},
};
function showProjectOpen(key){
  const cfg=projIcons[key]||projIcons.brand;
  const overlay=document.getElementById('projOpenOverlay');
  const icon=document.getElementById('projOpenIcon');
  icon.style.background=cfg.bg;
  icon.innerHTML=`<i class="ti ${cfg.icon}" style="font-size:32px;color:#fff;"></i>`;
  overlay.classList.add('flashing');
  setTimeout(()=>{
    overlay.classList.remove('flashing');
    showSub(cfg.sub);
  },650);
}

/* ─── TASK TOGGLE ─────────────────────────────────────────────────── */
function togglePTask(row){
  const check=row.querySelector('.ptask-check');
  const title=row.querySelector('.ptask-title');
  const isDone=check.classList.contains('done');
  check.classList.toggle('done');
  title.classList.toggle('done');
}

/* ─── DOC CHECKBOX ────────────────────────────────────────────────── */
document.addEventListener('click',e=>{
  if(e.target.closest('.bc-box')){
    const box=e.target.closest('.bc-box');
    const txt=box.nextElementSibling;
    box.classList.toggle('checked');
    if(txt) txt.classList.toggle('checked');
  }
  if(e.target.closest('.toggle')){
    e.target.closest('.toggle').classList.toggle('on');
  }
  if(e.target.closest('.wb-t:not(.wb-t:first-child)')){
    const btn=e.target.closest('.wb-t');
    const toolbar=btn.closest('.wb-toolbar');
    toolbar.querySelectorAll('.wb-t').forEach(t=>t.classList.remove('active'));
    btn.classList.add('active');
  }
});

/* ─── WHITEBOARD STICKY ───────────────────────────────────────────── */
let stickyCount=0;
const stickyColors=['#f0e4b8','#dde8de','#e8e4f0','#f8dce4','#dce8f4','#f2e8dc'];
function addSticky(){
  stickyCount++;
  const wb=document.getElementById('wbContent');
  const div=document.createElement('div');
  div.className='sticky';
  div.style.cssText=`left:${20+Math.random()*120}px;top:${20+Math.random()*100}px;background:${stickyColors[stickyCount%stickyColors.length]};width:90px;`;
  div.innerHTML=`<div class="sticky-lbl">NOTE</div>Tap to edit…`;
  div.contentEditable='true';
  wb.appendChild(div);
}

/* ─── COMMAND PALETTE ─────────────────────────────────────────────── */
function openCmdPalette(){
  document.getElementById('cmdOverlay').classList.add('open');
  setTimeout(()=>document.getElementById('cmdInput').focus(),200);
}
function closeCmdPalette(){
  document.getElementById('cmdOverlay').classList.remove('open');
  document.getElementById('cmdInput').value='';
}
function closeCmdIfBg(e){
  if(e.target===document.getElementById('cmdOverlay')) closeCmdPalette();
}
function filterCmd(val){
  // Basic filter — in production this would be fuzzy-matched
  const rows=document.querySelectorAll('.cmd-r');
  rows.forEach(r=>{
    const txt=r.querySelector('.cmd-r-t').textContent.toLowerCase();
    r.style.display=txt.includes(val.toLowerCase())||!val?'':'none';
  });
}
document.addEventListener('keydown',e=>{
  if(e.key==='Escape') closeCmdPalette();
});

/* ─── STAGGER HOME ELEMENTS ───────────────────────────────────────── */
setTimeout(()=>{
  document.querySelectorAll('#pg-studio > *').forEach((el,i)=>{
    el.style.opacity='0';el.style.transform='translateY(14px)';
    setTimeout(()=>{
      el.style.transition=`opacity .5s var(--ease-out),transform .5s var(--ease-out)`;
      el.style.opacity='1';el.style.transform='translateY(0)';
    },80+i*60);
  });
},100);
