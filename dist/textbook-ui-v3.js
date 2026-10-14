/* 教材式阅读界面：保留原有笔记、自测、搜索与 IoU 实验交互。 */
(()=>{
  let readingEffectsHandler=null;
  function clearReadingEffects(){
    if(!readingEffectsHandler)return;
    window.removeEventListener('scroll',readingEffectsHandler);
    window.removeEventListener('resize',readingEffectsHandler);
    readingEffectsHandler=null;
  }
  function updateReadingEffects(route){
    clearReadingEffects();
    if(route!=='lesson')return;
    const progress=document.getElementById('reading-progress');
    const fill=document.getElementById('reading-progress-fill');
    const sections=[...document.querySelectorAll('.text-section[id^="section-"], #chapter-review, #chapter-notes')];
    const links=[...document.querySelectorAll('.chapter-toc a')];
    if(!progress||!fill)return;
    readingEffectsHandler=()=>{
      const maxScroll=Math.max(1,document.documentElement.scrollHeight-window.innerHeight);
      const percent=Math.round(Math.min(1,Math.max(0,(window.scrollY||0)/maxScroll))*100);
      fill.style.transform='scaleX('+(percent/100)+')';
      progress.setAttribute('aria-valuenow',String(percent));
      progress.setAttribute('aria-valuetext','阅读进度 '+percent+'%');
      let active=sections[0]?.id;
      const threshold=Math.max(120,(window.innerHeight||0)*.25);
      for(const section of sections){
        if(section.getBoundingClientRect().top<=threshold)active=section.id;
        else break;
      }
      for(const link of links){
        const current=link.getAttribute('href')==='#'+active;
        link.classList.toggle('is-current',current);
        if(current)link.setAttribute('aria-current','location');
        else link.removeAttribute('aria-current');
      }
    };
    window.addEventListener('scroll',readingEffectsHandler,{passive:true});
    window.addEventListener('resize',readingEffectsHandler);
    readingEffectsHandler();
  }
  function rich(value){const mark=String.fromCharCode(96);const pattern=new RegExp(mark+'([^'+mark+']+)'+mark,'g');return esc(value).replace(pattern,'<code>$1</code>').replace(/\n/g,'<br>')}
  function articleSections(l){
    const placement=window.lessonFigures.placement(l);
    let placed=false;
    return l.sections.map((s,i)=>{
      const paragraphs=s.paragraphs.map((p,j)=>{
        const markup='<p>'+rich(p)+'</p>';
        if(!placed&&placement&&placement.section===i&&placement.paragraph===j){placed=true;return markup+window.lessonFigures.render(l)}
        return markup;
      }).join('');
      const fallback=!placed&&placement&&placement.section===i?(placed=true,window.lessonFigures.render(l)):'';
      return '<section class="text-section" id="section-'+(i+1)+'"><span class="section-number">0'+(i+1)+'</span><h2>'+s.title+'</h2>'+paragraphs+fallback+'</section>';
    }).join('');
  }
  function heading(title,sub,eyebrow){
    return '<section class="page-intro"><p class="eyebrow">'+eyebrow+'</p><h1>'+title+'</h1><p>'+sub+'</p></section>';
  }
  function progress(){
    const done=lessons.filter(l=>state.done.includes(l.id)).length;
    return {done:done,pct:Math.round(done/lessons.length*100)};
  }
  function home(){
    const p=progress(),next=lessons.find(l=>l.id===state.last&&!state.done.includes(l.id))||lessons.find(l=>!state.done.includes(l.id))||lessons[0];
    return heading('从像素开始，读懂视觉模型。','一套循序渐进的中文教材：先建立深度学习直觉，再走进计算机视觉，最后读懂并训练 YOLOv5。','VISIONLAB · 图文学习路径')
    +'<section class="welcome-panel"><div><span class="chapter-kicker">YOUR TEXTBOOK FOR DEEP LEARNING</span><h2>把公式、代码和图像，<br>连成一条能走通的路。</h2><p>每章先说明要解决的问题，再逐步展开概念、推导直觉和可运行示例。读完一节，你可以自测、记笔记，并从下一章接着学习。</p><a class="primary" href="#lesson/'+next.id+'">'+(p.done?'继续阅读':'从第一章开始')+' <span>→</span></a><a class="welcome-secondary" href="#path">查看完整目录</a></div><div class="welcome-art" aria-hidden="true"><span class="art-orbit orbit-one"></span><span class="art-orbit orbit-two"></span><div class="art-core">AI<br><small>VISION</small></div><span class="art-node node-one">像素</span><span class="art-node node-two">特征</span><span class="art-node node-three">检测</span><span class="art-line line-one"></span><span class="art-line line-two"></span></div></section>'
    +'<section class="overview-strip"><div><span>课程章节</span><strong>'+lessons.length+'<small>章</small></strong></div><div><span>学习阶段</span><strong>03<small>阶</small></strong></div><div><span>我的进度</span><strong>'+p.pct+'<small>%</small></strong></div><div class="progress-wide"><div class="progress-label"><span>已完成 '+p.done+' / '+lessons.length+' 章</span><span>'+p.pct+'%</span></div><div class="progress-bar"><i style="width:'+p.pct+'%"></i></div></div></section>'
    +'<section class="next-reading"><div class="section-heading"><div><span class="chapter-kicker">PICK UP WHERE YOU LEFT OFF</span><h2>接下来读这一章</h2></div><a href="#path">完整学习路线 ↗</a></div><a class="next-reading-card" href="#lesson/'+next.id+'"><span class="next-number">'+String(lessons.indexOf(next)+1).padStart(2,'0')+'</span><span class="next-copy"><small>'+groups[next.group].name+' · '+next.level+' · 约 '+next.time+' 分钟</small><strong>'+next.title+'</strong><span>'+next.desc+'</span></span><span class="next-arrow">继续阅读　→</span></a></section>'
    +'<section class="stage-preview"><div class="section-heading"><div><span class="chapter-kicker">THREE STAGES · TWENTY-FOUR CHAPTERS</span><h2>沿着概念，一步步深入</h2></div><a href="#courses">浏览全部章节 ↗</a></div><div class="stage-grid">'+Object.entries(groups).map(([key,g],i)=>{const list=lessons.filter(l=>l.group===key),finished=list.filter(l=>state.done.includes(l.id)).length;return '<a class="stage-card '+key+'" href="#courses/'+key+'"><span class="stage-index">0'+(i+1)+'</span><span class="stage-meta">'+g.label+'</span><h3>'+g.name+'</h3><p>'+g.desc+'</p><span class="stage-bottom">'+list.length+' 章 · '+finished+' 章已完成 <b>→</b></span></a>'}).join('')+'</div></section>'
    +'<section class="reading-note"><span>✳</span><p><strong>建议这样学习</strong><br>先读每章目标与图解，再按小节顺序学习；遇到公式时，联系旁边的直觉说明。代码可以复制到本地尝试，自测和笔记帮助你确认真正掌握的部分。</p></section>';
  }
  function courseList(items){
    if(!items.length)return '<div class="empty">未找到“'+esc(query)+'”。换个关键词试试。</div>';
    if(query)return '<ol class="chapter-list search-results">'+items.map(hit=>{
      const l=hit.lesson,index=lessons.indexOf(l)+1,section=hit.sectionIndex;
      const href='#lesson/'+l.id+(section===null?'':'/section-'+(section+1));
      return '<li><a class="chapter-row search-result '+l.group+'" href="'+href+'"><span class="chapter-index">'+String(index).padStart(2,'0')+'</span><span class="chapter-row-copy search-result-copy"><span class="search-match-label">'+hit.label+'</span><strong>'+l.title+'</strong>'+(hit.sectionTitle?'<span class="search-match-section">'+(section===null?'相关内容':'第 '+(section+1)+' 节 · ')+hit.sectionTitle+'</span>':'')+(hit.excerpt?'<span class="search-match-excerpt">'+esc(hit.excerpt)+'</span>':'')+'</span><span class="chapter-row-meta"><span class="level-pill">'+l.level+'</span><span>约 '+l.time+' 分钟</span></span><span class="chapter-status">→</span></a></li>';
    }).join('')+'</ol>';
    return '<ol class="chapter-list">'+items.map(l=>'<li><a class="chapter-row '+l.group+'" href="#lesson/'+l.id+'"><span class="chapter-index">'+String(lessons.indexOf(l)+1).padStart(2,'0')+'</span><span class="chapter-row-copy"><strong>'+l.title+'</strong><small>'+l.desc+'</small></span><span class="chapter-row-meta"><span class="level-pill">'+l.level+'</span><span>约 '+l.time+' 分钟</span></span><span class="chapter-status">'+(state.done.includes(l.id)?'✓':'→')+'</span></a></li>').join('')+'</ol>';
  }
  function filters(){
    return '<div class="textbook-filters">'+[['all','全部章节'],['dl','深度学习'],['cv','计算机视觉'],['yolo','YOLOv5 实战']].map(([id,name])=>'<a class="'+(filter===id?'selected':'')+'"'+(filter===id?' aria-current="page"':'')+' href="#courses'+(id==='all'?'':'/'+id)+'">'+name+'</a>').join('')+'</div>';
  }
  function normalized(value){return String(value||'').toLocaleLowerCase().replace(/\s+/g,' ').trim()}
  function excerpt(value,term){
    const text=String(value||'').replace(/\s+/g,' ').trim(),position=normalized(text).indexOf(term);
    if(position<0)return '';
    const start=Math.max(0,position-48),end=Math.min(text.length,position+term.length+96);
    return (start?'…':'')+text.slice(start,end)+(end<text.length?'…':'');
  }
  function searchHit(lesson,term){
    let best=null;
    const consider=(rank,label,text,sectionIndex=null,sectionTitle='',context='')=>{
      if(!normalized(text).includes(term))return;
      const candidate={rank,label,sectionIndex,sectionTitle,excerpt:excerpt(context||text,term)};
      if(!best||candidate.rank<best.rank)best=candidate;
    };
    consider(0,'课程标题',lesson.title,null,'',lesson.desc);
    consider(2,'课程简介',lesson.desc,null,'',lesson.desc);
    (lesson.goals||[]).forEach(goal=>consider(2,'学习目标',goal,null,'',goal));
    (lesson.keypoints||[]).forEach(point=>consider(2,'本章要点',point,null,'',point));
    (lesson.sections||[]).forEach((section,index)=>{
      const title=Array.isArray(section)?section[0]:section.title||'';
      const paragraphs=Array.isArray(section)?section.slice(1):section.paragraphs||[];
      const matchingParagraph=paragraphs.find(paragraph=>normalized(paragraph).includes(term))||paragraphs[0]||'';
      consider(1,'小节标题命中',title,index,title,matchingParagraph);
      paragraphs.forEach(paragraph=>consider(3,'正文命中',paragraph,index,title,paragraph));
    });
    const additional=[lesson.worked?.title,lesson.worked?.prompt,lesson.worked?.solution,lesson.quiz?.q,...(lesson.quiz?.options||[])];
    additional.filter(Boolean).forEach(text=>consider(4,'例题或自测命中',text,null,'',text));
    if(lesson.code)consider(5,'代码命中',lesson.code,null,'','');
    return best?{lesson,...best}:null;
  }
  function matched(){
    const available=lessons.filter(l=>filter==='all'||filter===l.group);
    if(!query)return available;
    const term=normalized(query);
    return available.map(lesson=>searchHit(lesson,term)).filter(Boolean).sort((a,b)=>a.rank-b.rank||lessons.indexOf(a.lesson)-lessons.indexOf(b.lesson));
  }
  function courses(){
    const items=matched();
    const subtitle=query?'按标题、小节和正文匹配；点击结果可直达命中位置。':'按学习路线阅读，或搜索课程、概念与代码。每章提供目标、图解和练习。';
    const count=query?'找到 '+items.length+' 条相关结果':'共 '+items.length+' 章 · '+lessons.length+' 章完整课程';
    return heading(query?'搜索结果：'+esc(query):'课程目录',subtitle,'THE TEXTBOOK')
      +filters()+'<p class="catalog-count">'+count+'</p>'+courseList(items);
  }
  function path(){
    return heading('从基础出发，走向 YOLOv5 实战。','路线由概念、模型与实践三阶段组成。阶段内的顺序对应前置知识关系，也可以点击目录中的任意章节跳读。','LEARNING ROADMAP')
      +'<div class="roadmap-intro"><strong>阅读提示</strong><span>每一阶段的最后几章会逐步连接到实际训练。学习时先看图解，再读解释和例子；代码版本以附带的官方文档及仓库为准。</span></div>'
      +Object.entries(groups).map(([key,g],i)=>{const items=lessons.filter(l=>l.group===key),done=items.filter(l=>state.done.includes(l.id)).length;return '<section class="roadmap-stage '+key+'"><div class="roadmap-stage-head"><div><span>STAGE 0'+(i+1)+' · '+g.label+'</span><h2>'+g.name+'</h2><p>'+g.desc+'</p></div><div class="stage-progress">'+done+' / '+items.length+'<small>章完成</small></div></div>'+courseList(items)+'</section>'}).join('');
  }
  function objectiveBox(l){
    return '<section class="learning-contract"><div><h2>学完本章，你将能够</h2><ul>'+l.goals.map(g=>'<li>'+g+'</li>').join('')+'</ul></div><p><strong>先修知识</strong><span>'+rich(l.prereq||'可从上一章接着阅读；不需要提前掌握本领域全部数学。')+'</span></p></section>';
  }
  function lesson(id){
    const l=lessons.find(x=>x.id===id);
    if(!l)return '<div class="empty">这章暂时没有找到。<a href="#courses">返回课程目录</a></div>';
    state.last=id;save();
    const index=lessons.indexOf(l),next=lessons[index+1],prev=lessons[index-1];
    const articleContent=articleSections(l);
    const examples=l.worked?'<section class="worked-example"><span class="chapter-kicker">WORKED EXAMPLE · 例题拆解</span><h2>'+l.worked.title+'</h2><p><strong>问题</strong>　'+rich(l.worked.prompt)+'</p><p><strong>解析</strong>　'+rich(l.worked.solution)+'</p></section>':'';
    const code=l.code?'<section class="text-section code-section"><div class="code-block"><div class="code-head"><span>'+esc(l.language||'代码示例')+' · 建议逐行阅读</span><button class="copy" data-copy="'+l.id+'">复制代码</button></div><pre><code>'+esc(l.code)+'</code></pre></div><p class="code-note">先运行原始示例并观察结果，再一次只改变一个输入或参数。'+(l.group==='yolo'?'YOLOv5 命令行选项会随仓库版本变化，请用本地脚本的帮助信息核对。':'每做一步，先预测输入与输出形状，再用实际结果核对。')+'</p></section>':'';
    const quiz=l.quiz?'<section class="chapter-quiz quiz"><span class="chapter-kicker">CHECK YOUR UNDERSTANDING · 章末自测</span><h2>检查一下你的理解</h2><p>'+l.quiz.q+'</p>'+l.quiz.options.map((o,i)=>'<button data-answer="'+i+'" data-lesson="'+l.id+'">'+String.fromCharCode(65+i)+'. '+o+'</button>').join('')+'<div class="quiz-result" aria-live="polite"></div></section>':'';
    const keypoints=l.keypoints?'<section class="keypoint-review"><span class="chapter-kicker">CHAPTER REVIEW</span><h2>本章要点</h2><ul>'+l.keypoints.map(x=>'<li>'+x+'</li>').join('')+'</ul></section>':'';
    const source=l.source?'<p class="source-note">延伸阅读：<a href="'+esc(l.source)+'" target="_blank" rel="noopener noreferrer">官方文档与参考资料 ↗</a>。概念解释为本课程整理；具体接口、参数和仓库实现请以对应版本文档为准。</p>':'';
    return '<article class="textbook-page"><div class="reading-progress" id="reading-progress" role="progressbar" aria-label="章节阅读进度" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0" aria-valuetext="阅读进度 0%"><span id="reading-progress-fill"></span></div><div class="book-toolbar"><a href="#courses/'+l.group+'">← 返回'+groups[l.group].name+'目录</a><span>第 '+String(index+1).padStart(2,'0')+' 章　/　'+lessons.length+' 章</span></div>'
      +'<header class="chapter-heading"><p class="chapter-kicker">'+groups[l.group].label+'　·　'+l.level+'</p><h1>'+l.title+'</h1><p class="chapter-deck">'+l.desc+'</p><div class="chapter-byline"><span>◷ 约 '+l.time+' 分钟阅读</span><span>📖 概念讲解 · 图文示意 · 例题 · 自测</span></div></header>'
      +'<div class="chapter-layout"><aside class="chapter-toc"><strong>本章导航</strong><ol>'+l.sections.map((s,i)=>'<li><a href="#section-'+(i+1)+'">'+s.title+'</a></li>').join('')+'<li><a href="#chapter-review">本章要点</a></li><li><a href="#chapter-notes">笔记与进度</a></li></ol></aside>'
      +'<div class="chapter-body">'+objectiveBox(l)+articleContent+examples+code+keypoints.replace('<section class="keypoint-review">','<section class="keypoint-review" id="chapter-review">')+quiz+source
      +'<section class="chapter-notes" id="chapter-notes"><span class="chapter-kicker">MY STUDY NOTES</span><h2>写下你的思考</h2><p>用自己的话总结一个概念，或记下尚未解决的问题。笔记保存在当前浏览器。</p><textarea class="note-input" id="lesson-note" placeholder="例如：我现在可以用自己的话解释…… / 我还不确定的是……" aria-label="课程笔记">'+esc(state.notes[id]||'')+'</textarea><div class="lesson-actions"><button class="secondary" data-save-note="'+id+'">保存笔记</button><span id="note-status" class="saved" role="status"></span><button class="primary complete-button" data-complete="'+id+'">'+(state.done.includes(id)?'已完成 · 点击撤销':'标记本章已完成 ✓')+'</button></div></section>'
      +'<nav class="chapter-pagination">'+(prev?'<a href="#lesson/'+prev.id+'"><small>上一章</small><strong>← '+prev.title+'</strong></a>':'<a href="#path"><small>学习路线</small><strong>浏览课程阶段 →</strong></a>')+(next?'<a class="pagination-next" href="#lesson/'+next.id+'"><small>接下来</small><strong>'+next.title+' →</strong></a>':'<a class="pagination-next" href="#path"><small>全部完成</small><strong>回顾完整学习路线 →</strong></a>')+'</nav></div></div></article>';
  }
  function render(){
    const parts=location.hash.slice(1).split('/'),route=parts[0]||'home',id=parts[1];
    if(route==='courses')filter=id&&groups[id]?id:'all';
    const names={home:'学习概览',courses:'课程目录',path:'学习路线',lab:'交互实验室',notes:'我的笔记',resources:'资源导航',lesson:'教材阅读'};
    const crumb=route==='lesson'?(lessons.find(l=>l.id===id)||{}).title||'教材阅读':names[route]||'学习概览';
    const content=route==='home'?home():route==='courses'?courses():route==='path'?path():route==='lesson'?lesson(id):route==='lab'?(window.renderInteractiveLab?window.renderInteractiveLab():lab()):route==='notes'?notes():route==='resources'?resources():home();
    document.getElementById('crumb').textContent=crumb;
    document.querySelectorAll('[data-nav]').forEach(a=>a.classList.toggle('active',a.dataset.nav===(route==='lesson'?'courses':route)));
    const badge=document.querySelector('[data-nav="courses"] em');if(badge)badge.textContent=lessons.length;
    document.getElementById('content').innerHTML=content;
    if(route==='lesson'&&parts[2])document.getElementById(parts[2])?.scrollIntoView({behavior:'smooth',block:'start'});
    if(route==='lab'){updateIoU();window.initializeInteractiveLab?.();}
    document.querySelector('.sidebar').classList.remove('open');
    updateReadingEffects(route);
    document.title=(route==='lesson'?crumb:names[route]||'学习概览')+' · VisionLab';
  }
  window.home=home;window.courses=courses;window.path=path;window.lesson=lesson;window.render=render;
  document.addEventListener('click',event=>{
    const anchor=event.target.closest('a[href^="#"]');
    if(!anchor)return;
    const destination=anchor.getAttribute('href').slice(1);
    if(destination.startsWith('section-')||destination==='chapter-review'||destination==='chapter-notes'){
      event.preventDefault();
      const reduced=window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
      document.getElementById(destination)?.scrollIntoView({behavior:reduced?'auto':'smooth',block:'start'});
      return;
    }
    event.preventDefault();
    history.pushState({},'',location.pathname+location.search+'#'+destination);
    window.render();
    if(destination.split('/').length<3)window.scrollTo(0,0);
  },true);
  window.addEventListener('popstate',()=>{window.render();window.scrollTo(0,0)});
  render();
})();

