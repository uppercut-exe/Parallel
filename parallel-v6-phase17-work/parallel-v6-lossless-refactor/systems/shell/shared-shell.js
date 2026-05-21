(function(){
  /* Phase 6 shared shell foundation.
     This file is intentionally small: it owns only stable shell metadata and
     dock-aware positioning helpers used by both runnable Parallel entries.
     Studio block, page, persistence, and database engines stay local until
     their view systems are stable enough for a safer extraction. */
  const MODULE_IDS={
    home:'home',
    tasks:'tasks',
    studio:'studio',
    you:'you',
    create:'create'
  };

  /* Canonical global dock source of truth: STUDIO / TASKS / + / HOME / YOU.
     Phase 8 navigation rule: this global footer belongs to the Parallel shell.
     Studio may change its internal command center, drawer, editor, and sheets,
     but it must not replace, duplicate, or reorder this dock. */
  const DOCK_ITEMS=[
    {moduleId:MODULE_IDS.studio,label:'STUDIO',icon:'ti-briefcase',routeKey:'studio',pageId:'pg-studio',buttonId:'di-studio'},
    {moduleId:MODULE_IDS.tasks,label:'TASKS',icon:'ti-check',routeKey:'timeline',pageId:'pg-timeline',buttonId:'di-timeline'},
    {moduleId:MODULE_IDS.create,label:'',icon:'ti-plus',routeKey:'create',isCreate:true,buttonId:'plusBtn'},
    {moduleId:MODULE_IDS.home,label:'HOME',icon:'ti-home-2',routeKey:'home',pageId:'pg-home',buttonId:'di-home'},
    {moduleId:MODULE_IDS.you,label:'YOU',icon:'ti-user',routeKey:'profile',pageId:'pg-profile',buttonId:'di-profile'}
  ];

  /* Contextual create menu metadata. The button stays shell-level while the
     action set adapts to the active module. */
  const CREATE_ACTIONS={
    home:[
      {id:'home-task',section:'Home',label:'New Task',sub:'Capture a gentle next step in Tasks',icon:'ti-check',tone:'sage'},
      {id:'home-note',section:'Home',label:'New Note',sub:'Open a blank Studio note',icon:'ti-notebook',tone:'lilac'},
      {id:'home-habit',section:'Home',label:'New Habit',sub:'Create a soft daily rhythm',icon:'ti-repeat',tone:'peach'},
      {id:'home-focus',section:'Home',label:'Start Focus',sub:'Enter sanctuary mode',icon:'ti-circle-dot',tone:'sky'}
    ],
    tasks:[
      {id:'timeline-task',section:'Tasks',label:'New Task',sub:'Add an intention to the task timeline',icon:'ti-check',tone:'sage'},
      {id:'timeline-project',section:'Tasks',label:'New Project',sub:'Open the project studio',icon:'ti-briefcase',tone:'lilac'},
      {id:'timeline-item',section:'Tasks',label:'New Timeline Item',sub:'Plan a dated milestone',icon:'ti-timeline',tone:'peach'}
    ],
    studio:[
      {id:'studio-page',section:'Studio',label:'New Page',sub:'Create a page in the workspace tree',icon:'ti-file-plus',tone:'sage'},
      {id:'studio-doc',section:'Studio',label:'New Doc',sub:'Open the document composer',icon:'ti-file-text',tone:'lilac'},
      {id:'studio-database',section:'Studio',label:'New Database',sub:'Create a structured database block',icon:'ti-database',tone:'sage'},
      {id:'studio-canvas',section:'Studio',label:'New Canvas',sub:'Open the visual whiteboard',icon:'ti-chart-dots',tone:'sky'},
      {id:'studio-project',section:'Studio',label:'New Project',sub:'Start from the project surface',icon:'ti-briefcase',tone:'peach'}
    ],
    you:[
      {id:'you-note',section:'You',label:'Personal Note',sub:'Create a private Studio page',icon:'ti-notebook',tone:'lilac'},
      {id:'you-settings',section:'You',label:'Settings',sub:'Keep Parallel feeling like you',icon:'ti-settings',tone:'sage'}
    ],
    focus:[
      {id:'focus-session',section:'Focus',label:'Start Session',sub:'Begin deep work',icon:'ti-player-play',tone:'sage'},
      {id:'focus-intention',section:'Focus',label:'New Intention',sub:'Name the work before it begins',icon:'ti-sparkles',tone:'lilac'},
      {id:'focus-routine',section:'Focus',label:'New Routine',sub:'Shape a repeatable ritual',icon:'ti-repeat',tone:'peach'}
    ]
  };

  const TONE_STYLES={
    sage:['var(--sage-bg)','var(--sage)'],
    lilac:['var(--lilac-bg)','var(--lilac)'],
    peach:['var(--peach-bg)','var(--peach)'],
    sky:['var(--sky-bg)','var(--sky)']
  };

  const PAGE_TO_MODULE={
    'pg-home':'home',
    'pg-timeline':'tasks',
    'pg-tasks':'tasks',
    'pg-studio':'studio',
    'pg-profile':'you',
    'pg-focus':'focus'
  };

  const MODULE_LABELS={
    home:'Home',
    tasks:'Tasks',
    studio:'Studio',
    you:'You',
    focus:'Focus'
  };

  const CONSTANTS={
    storage:{
      studio:'parallel.studio.phase4.v2',
      legacyStudio:['parallel.studio.phase3_5.v1']
    },
    overlay:{
      dockGap:10,
      dockFallback:96,
      mobileDockSafeBottom:104,
      slashHeight:360,
      blockMenuHeight:288,
      transformHeight:398,
      databaseHeight:280,
      pageActionHeight:310
    },
    zIndex:{
      dock:100,
      drawerBackdrop:210,
      drawer:220,
      editorToolbar:240,
      floatingOverlay:250
    }
  };

  function escapeHTML(value){
    return String(value).replace(/[&<>"']/g,char=>({
      '&':'&amp;',
      '<':'&lt;',
      '>':'&gt;',
      '"':'&quot;',
      "'":'&#039;'
    }[char]));
  }

  function moduleFromPageId(pageId){
    return PAGE_TO_MODULE[pageId]||'home';
  }

  function actionsForModule(moduleId){
    return CREATE_ACTIONS[moduleId]||CREATE_ACTIONS.home;
  }

  function actionsForPage(pageId){
    return actionsForModule(moduleFromPageId(pageId));
  }

  function dockTop(doc){
    const root=doc||document;
    return root.querySelector('.dock')?.getBoundingClientRect().top||window.innerHeight-CONSTANTS.overlay.dockFallback;
  }

  /* Dock-aware overlay clamp used by Studio slash menus, action sheets, and
     mobile editing accessories so they remain above the global footer. */
  function overlayTop({anchorBottom,fallback=120,height=CONSTANTS.overlay.slashHeight,pad=CONSTANTS.overlay.dockGap,doc=document}={}){
    const desired=(anchorBottom||fallback)+8;
    const maxTop=Math.max(16,dockTop(doc)-height-pad);
    return Math.max(16,Math.min(desired,maxTop));
  }

  function quickMenuHTML(actions,handlerName){
    return actions.map(action=>{
      const tone=TONE_STYLES[action.tone]||TONE_STYLES.sage;
      return `<div class="qi" onclick="${handlerName}('${action.id}')"><div class="qi-i" style="background:${tone[0]};"><i class="ti ${action.icon}" style="color:${tone[1]};"></i></div><span class="qi-l">${escapeHTML(action.label)}</span></div>`;
    }).join('');
  }

  window.ParallelShell={
    moduleIds:MODULE_IDS,
    dockItems:DOCK_ITEMS,
    createActions:CREATE_ACTIONS,
    createActionSets:{
      'pg-home':CREATE_ACTIONS.home,
      'pg-timeline':CREATE_ACTIONS.tasks,
      'pg-tasks':CREATE_ACTIONS.tasks,
      'pg-studio':CREATE_ACTIONS.studio,
      'pg-profile':CREATE_ACTIONS.you,
      'pg-focus':CREATE_ACTIONS.focus
    },
    createToneStyles:TONE_STYLES,
    pageToModule:PAGE_TO_MODULE,
    moduleLabels:MODULE_LABELS,
    constants:CONSTANTS,
    escapeHTML,
    moduleFromPageId,
    actionsForModule,
    actionsForPage,
    dockTop,
    overlayTop,
    quickMenuHTML
  };
})();
