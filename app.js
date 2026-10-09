
  // MOBILE STORY SWIPE
  const track = document.getElementById('storyTrack');
  const dots = document.querySelectorAll('#storyDots .dot');
  const totalSlides = 4;
  let slideIndex = 0;
  function goToSlide(i){
    slideIndex = Math.max(0, Math.min(totalSlides-1, i));
    track.style.transform = `translateX(-${slideIndex * (100/totalSlides)}%)`;
    dots.forEach((d, idx)=> d.dataset.active = idx === slideIndex ? "true" : "false");
  }
  dots.forEach((d, idx)=> d.addEventListener('click', ()=> goToSlide(idx)));
  let touchStartX = 0;
  const viewport = document.getElementById('storyViewport');
  viewport.addEventListener('touchstart', e=>{ touchStartX = e.touches[0].clientX; });
  viewport.addEventListener('touchend', e=>{
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) > 40){ dx < 0 ? goToSlide(slideIndex+1) : goToSlide(slideIndex-1); }
  });
  goToSlide(0);

  // PORTFOLIO DATA
  /* projects: see projects.js */

  const tagGroups = [
    {title:"Исследования", tags:["глубинные интервью","фокус-группы","семиотика","конкурентный анализ","UX-исследование","разработка методологии","интервью C-level"]},
    {title:"Стратегия", tags:["бренд-платформа","стратегическая сессия","коммуникационная стратегия","архитектура бренда"]},
    {title:"Индустрии", tags:["Fashion","GovTech","EdTech","Retail","E-commerce","Development","Media","HealthTech","FinTech","Industrial"]},
  ];

  const selectedTags = new Set();
  const tagGroupsEl = document.getElementById('tagGroups');

  tagGroups.forEach(group=>{
    const groupEl = document.createElement('div');
    groupEl.className = 'tag-group';
    const listEl = document.createElement('div');
    listEl.className = 'tag-group-list';
    group.tags.forEach(tag=>{
      const chip = document.createElement('button');
      chip.className = 'tag-chip';
      chip.textContent = '#' + tag;
      chip.setAttribute('aria-pressed','false');
      chip.addEventListener('click', ()=>{
        if (selectedTags.has(tag)){ selectedTags.delete(tag); chip.setAttribute('aria-pressed','false'); }
        else { selectedTags.add(tag); chip.setAttribute('aria-pressed','true'); }
        renderProjects();
      });
      listEl.appendChild(chip);
    });
    groupEl.innerHTML = `<div class="tag-group-title">#${group.title.toLowerCase()}</div>`;
    groupEl.appendChild(listEl);
    tagGroupsEl.appendChild(groupEl);
  });

  const projGrid = document.getElementById('projGrid');
  const countEl = document.getElementById('resultsCount');
  const noResults = document.getElementById('noResults');

  function renderProjects(){
    projGrid.innerHTML = "";
    const visible = projects.filter(p=>{
      return selectedTags.size === 0 || p.tags.some(t => selectedTags.has(t));
    });

    visible.sort((a,b)=>(b.flagship?1:0)-(a.flagship?1:0));
    visible.forEach(p=>{
      const card = document.createElement('div');
      card.className = 'proj-card' + (p.full ? ' has-full' : '') + (p.flagship ? ' flagship' : '');
      if(p.flagship){
        card.innerHTML = `
          <div class="proj-card-logo mono">${p.name}</div>
          <div class="fl-badge">Флагманский проект</div>
          <div class="fl-hook">${p.desc}</div>
          <div class="fl-meta"><div class="fl-result">${p.result}</div><div class="proj-card-tags">${p.tags.map(t=>'#'+t).join(' ')}</div></div>
          <div class="fl-press">${p.press.map(x=>`<a href="${x.u}" target="_blank" rel="noopener">${x.t}<small>${x.s}</small></a>`).join('')}</div>`;
        card.querySelectorAll('.fl-press a').forEach(a=>a.addEventListener('click', e=>e.stopPropagation()));
      } else {
        card.innerHTML = `
          <div class="proj-card-logo mono">${p.name}</div>
          <div class="proj-card-hook">${p.desc}</div>
          <div class="proj-card-foot">
            <div class="proj-card-result">${p.result}</div>
            <div class="proj-card-tags">${p.tags.map(t=>'#'+t).join(' ')}</div>
          </div>`;
      }
      if(p.full) card.addEventListener('click', ()=>openProject(p, card));
      projGrid.appendChild(card);
    });

    countEl.textContent = `${visible.length} из ${projects.length}`;
    noResults.style.display = visible.length === 0 ? 'block' : 'none';
    projGrid.style.display = visible.length === 0 ? 'none' : 'grid';
  }

  const modal = document.createElement('div');
  modal.className = 'modal';
  modal.innerHTML = '<div class="modal-panel" role="dialog" aria-modal="true"></div>';
  document.body.appendChild(modal);
  const panel = modal.firstChild;
  function openProject(p, card){
    card = card && card.getBoundingClientRect ? card : null;
    const f = p.full;
    panel.innerHTML = `
      <button class="modal-close" aria-label="Закрыть">×</button>
      <div>
        <div class="m-name">${p.name}</div>
        <div class="m-task">${f.task}</div>
        ${f.key?`<div class="m-key${f.key.length>40?' long':''}">${f.key}</div>`:''}
        <div class="m-tags">${p.tags.map(t=>'#'+t).join('  ')}</div>
        <div class="m-blocks">
          <div class="m-block"><h4>Вызов</h4><p>${f.challenge}</p></div>
          <div class="m-block"><h4>Моя роль</h4><p>${f.role}</p></div>
          <div class="m-block"><h4>Решение</h4><p>${f.solution}</p>${f.insight?`<p class="m-insight" style="margin-top:10px">${f.insight}</p>`:''}</div>
          <div class="m-block"><h4>Результат</h4><p>${f.result}</p></div>
        </div>
      </div>`;
    if(p.press){ const d=document.createElement('div'); d.className='m-press'; d.innerHTML='<h4>Публикации</h4>'+p.press.map(x=>`<a href="${x.u}" target="_blank" rel="noopener">${x.t}<br><small>${x.s}</small></a>`).join(''); panel.querySelector('.m-blocks').appendChild(d); }
    const r = card ? card.getBoundingClientRect() : {left:innerWidth/2, top:innerHeight/2, width:0, height:0};
    panel.style.setProperty('--dx', (r.left + r.width/2 - innerWidth/2) + 'px');
    panel.style.setProperty('--dy', (r.top + r.height/2 - innerHeight/2) + 'px');
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
    requestAnimationFrame(()=>requestAnimationFrame(()=>modal.classList.add('show')));
    panel.querySelector('.modal-close').addEventListener('click', closeProject);
  }
  function closeProject(){
    modal.classList.remove('show');
    setTimeout(()=>{ modal.classList.remove('open'); document.body.style.overflow=''; }, 380);
  }
  modal.addEventListener('click', e=>{ if(e.target === modal) closeProject(); });
  document.addEventListener('keydown', e=>{ if(e.key === 'Escape' && modal.classList.contains('open')) closeProject(); });
  renderProjects();


  // Логотипы: сюда кладутся настоящие файлы {название проекта: data-URI}; пока пусто — показывается текст
  const LOGOS = {"Газпром Медиа": "assets/img-3.png", "Сбер ЕАптека": "assets/img-4.png", "Самолет": "assets/img-5.png", "X5 Group": "assets/img-6.png", "Яндекс Практикум": "assets/img-7.png", "mos.ru": "assets/img-8.png", "Авито Премиум": "assets/img-9.png", "LIME": "assets/img-10.png"};
  document.querySelectorAll('.proj-logo').forEach(el=>{
    const n = el.dataset.project;
    if(LOGOS[n]){ el.innerHTML = '<img src="'+LOGOS[n]+'" alt="'+n+'">'; }
  });
  function openByName(name){ const pr = projects.find(x=>x.name===name); if(pr && pr.full) openProject(pr, null); }
  document.querySelectorAll('.proj-logo, .task-chip').forEach(el=>el.addEventListener('click', e=>{ e.stopPropagation(); openByName(el.dataset.project); }));

  // Плавный скролл к блоку "Проекты" по клику на карточку "Проекты" на первом экране
  const projectsCard = document.querySelector('.projects-card');
  if (projectsCard){
    projectsCard.style.cursor = 'pointer';
    projectsCard.addEventListener('click', ()=>{
      document.getElementById('portfolio').scrollIntoView({behavior:'smooth', block:'start'});
    });
  }


  (function(){
    const mq = window.matchMedia('(max-width:760px)');
    const card = document.querySelector('.contacts-card2');
    const footer = document.querySelector('.site-footer');
    const grid = document.querySelector('.bento-grid');
    if(!card || !footer || !grid) return;
    function place(){ if(mq.matches){ footer.appendChild(card); } else { grid.appendChild(card); } }
    place(); (mq.addEventListener ? mq.addEventListener('change', place) : mq.addListener(place));
  })();
