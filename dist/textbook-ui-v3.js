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
  function exerciseCard(l,exercise,type,index){
    const label=type==='section'?'本节练习':'章末综合题 '+(index+1);
    const indexAttribute=type==='section'?'data-section-index':'data-exercise-index';
    const options=exercise.options.map((option,i)=>'<button type="button" data-exercise-answer="'+i+'" data-lesson="'+l.id+'" data-exercise-type="'+type+'" '+indexAttribute+'="'+index+'">'+String.fromCharCode(65+i)+'. '+rich(option)+'</button>').join('');
    return '<section class="exercise-card '+type+'-exercise"><span class="exercise-label">'+label+'</span><p class="exercise-prompt">'+rich(exercise.q)+'</p><div class="exercise-options" role="group" aria-label="'+label+'">'+options+'</div><div class="quiz-result exercise-feedback" role="status" aria-live="polite"></div></section>';
  }
  function articleSections(l){
    const placements=window.lessonFigures.placement(l);
    const placed=new Set();
    return l.sections.map((s,i)=>{
      const paragraphs=s.paragraphs.map((p,j)=>{
        const markup='<p>'+rich(p)+'</p>';
        const here=placements.filter(figure=>figure.section===i&&figure.paragraph===j&&!placed.has(figure.key));
        if(here.length){here.forEach(figure=>placed.add(figure.key));return markup+here.map(figure=>window.lessonFigures.render(l,figure.key)).join('')}
        return markup;
      }).join('');
      const fallback=placements.filter(figure=>figure.section===i&&!placed.has(figure.key)).map(figure=>{placed.add(figure.key);return window.lessonFigures.render(l,figure.key)}).join('');
      const tensorExplorer=l.id==='tensor'&&i===8?tensorExplorerMarkup():'';
      const transposeExplorer=l.id==='tensor'&&i===4?tensorTransposeMarkup():'';
      return '<section class="text-section" id="section-'+(i+1)+'"><span class="section-number">0'+(i+1)+'</span><h2>'+s.title+'</h2>'+paragraphs+fallback+transposeExplorer+tensorExplorer+(s.exercise?exerciseCard(l,s.exercise,'section',i):'')+'</section>';
    }).join('');
  }
  function tensorExplorerMarkup(){
    return '<section class="tensor-explorer" data-tensor-explorer data-shape="4d" data-step="0" aria-labelledby="tensor-explorer-title"><div class="tensor-explorer-heading"><div><span class="chapter-kicker">INTERACTIVE EXPLORER · 动手看 shape 与索引</span><h3 id="tensor-explorer-title">亲自选一组索引，看它怎样落到内存</h3></div><span class="tensor-zero-note">索引从 0 开始</span></div><p class="tensor-explorer-intro">拖动每条轴的索引。左边看它选中了哪一组数据，右边看最终的行、列与元素；默认数据是 <code>torch.arange(元素总数).reshape(shape)</code>。</p><div class="tensor-shape-switch" role="group" aria-label="选择张量形状"><button type="button" data-tensor-shape="3d" aria-pressed="false">三维　(3, 4, 5)</button><button type="button" data-tensor-shape="4d" aria-pressed="true">四维　(2, 3, 4, 5)</button></div><div class="tensor-layout"><figure class="tensor-diagram-card"><div class="tensor-card-label"><strong>分组结构</strong><span>紫色边框标出所选组与表</span></div><div class="tensor-diagram-scroll" data-tensor-diagram></div><figcaption>先沿外层轴选组，再进入其中的表；放大区展示行轴与列轴上的位置。图中的折叠只是阅读方式，张量本身仍有 shape 所写的全部轴。</figcaption></figure><div class="tensor-controls-card"><div class="tensor-card-label"><strong>逐轴选择</strong><span>用滑块或键盘方向键</span></div><div class="tensor-axis-controls" data-tensor-axis-controls></div><div class="tensor-computation"><p><span>shape</span><code data-tensor-shape-readout></code></p><p><span>stride</span><code data-tensor-stride-readout></code></p><p><span>storage_offset</span><code>0</code></p><div class="tensor-selected-value" aria-live="polite"><span>当前元素</span><strong data-tensor-selected-readout></strong></div><p class="tensor-valid-range" data-tensor-range-readout></p></div></div></div><div class="tensor-learning-grid"><section class="tensor-steps-card"><div class="tensor-card-label"><strong>把 offset 一步步算出来</strong><span>每项都是“索引 × stride”</span></div><p class="tensor-formula">元素位置 = storage_offset + Σ(索引 × stride)</p><div class="tensor-step-list" data-tensor-step-list aria-live="polite"></div><div class="tensor-step-actions"><button type="button" class="secondary" data-tensor-step-next>显示下一步</button><button type="button" class="tensor-quiet-button" data-tensor-step-reset>从头演示</button></div></section><section class="tensor-predict-card"><div class="tensor-card-label"><strong>先预测，再揭晓</strong><span>试着心算当前索引</span></div><p>按上面的 stride，当前索引对应的元素偏移是多少？</p><label class="tensor-prediction-label" for="tensor-prediction">我的预测</label><div class="tensor-prediction-row"><input id="tensor-prediction" data-tensor-prediction type="number" min="0" step="1" inputmode="numeric" placeholder="输入一个整数"><button type="button" class="secondary" data-tensor-check>检查</button></div><p class="tensor-prediction-feedback" data-tensor-prediction-feedback role="status" aria-live="polite"></p><p class="tensor-small-note">本示例用从 0 开始的连续整数填充张量，因此偏移数值也恰好是元素值。换成别的数据后，两者不一定相等。</p></section></div></section>';
  }
  function tensorTransposeMarkup(){
    return '<section class="tensor-transpose-explorer" data-tensor-transpose data-view="original" aria-labelledby="tensor-transpose-title"><div class="tensor-card-label"><strong id="tensor-transpose-title">切换视图：交换两条轴</strong><span>同一块 storage，不同的读取顺序</span></div><p>用按钮切换 `a` 与 `a.transpose(0,1)`。标橙色的数字都是 6：它在原矩阵的 `a[1,2]`，换轴后位于 `t[2,1]`。</p><div class="transpose-view-switch" role="group" aria-label="切换原矩阵或转置视图"><button type="button" data-transpose-view="original" aria-pressed="true">原矩阵 a</button><button type="button" data-transpose-view="transposed" aria-pressed="false">转置视图 t</button></div><div class="transpose-live-view" data-transpose-live-view aria-live="polite"></div><p class="tensor-small-note">转置改变 shape、stride 和轴的对应关系；这个例子只是创建共享原存储的视图，底层 0–11 的排列没有被重写。</p></section>';
  }
  function tensorShape(key){return key==='3d'?[3,4,5]:[2,3,4,5]}
  function tensorStrides(shape){let stride=1;const out=[];for(let i=shape.length-1;i>=0;i--){out[i]=stride;stride*=shape[i]}return out}
  function tensorAxisName(shape,index){if(shape.length===3)return ['表','行','列'][index];return ['大组','表','行','列'][index]}
  function tensorClampIndex(value,max){const number=Number(value);return Math.min(max,Math.max(0,Number.isFinite(number)?Math.floor(number):0))}
  function tensorText(x,y,value,size,color,weight,anchor){return '<text x="'+x+'" y="'+y+'" font-size="'+size+'" fill="'+color+'" font-weight="'+weight+'" text-anchor="'+(anchor||'middle')+'">'+value+'</text>'}
  function tensorRect(x,y,w,h,fill,stroke,sw,rx){return '<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" rx="'+(rx||3)+'" fill="'+fill+'" stroke="'+stroke+'" stroke-width="'+sw+'"/>'}
  function tensorMiniTable(x,y,shape,indexes,strides,group,sheet,active){
    const cellW=shape.length===3?14:17,cellH=shape.length===3?10:6.5,gridW=cellW*shape[shape.length-1],gridH=cellH*shape[shape.length-2],startX=x+(shape.length===3?18:36),startY=y+18;
    let out='';
    for(let row=0;row<shape[shape.length-2];row++)for(let col=0;col<shape[shape.length-1];col++){
      const selected=active&&row===indexes[shape.length-2]&&col===indexes[shape.length-1];
      out+=tensorRect(startX+col*cellW,startY+row*cellH,cellW,cellH,selected?'#e5a057':active&&row===indexes[shape.length-2]?'#e9e4f3':'#f3f4f1',selected?'#c87928':'#ffffff',.8,1);
    }
    const value=shape.length===3?group:(group*shape[1]+sheet);
    out+=tensorText(x+(shape.length===3?58:93),y+12,'表 '+value,shape.length===3?9:8,active?'#655598':'#75808a',650);
    return out;
  }
  function tensorExplorerSvg(shape,indexes,strides,offset){
    const four=shape.length===4,groupCount=shape[0],groupW=four?190:126,groupGap=8,left=16,top=52,groupH=202;
    let out='<svg viewBox="0 0 830 282" role="img" aria-labelledby="tensor-svg-title tensor-svg-desc"><title id="tensor-svg-title">交互式张量分组和索引图</title><desc id="tensor-svg-desc">当前索引 ['+indexes.join(', ')+']，通过分组图定位到右侧放大的表格，所选元素偏移为 '+offset+'。</desc>';
    out+=tensorText(16,24,four?'外层轴 0 有 2 组；每组的轴 1 有 3 张表':'轴 0 有 3 张表',12,'#5e6876',650,'start');
    out+=tensorText(480,24,'放大当前表：行轴与列轴',12,'#5e6876',650,'start');
    for(let g=0;g<groupCount;g++){
      const gx=left+g*(groupW+groupGap),activeGroup=g===indexes[0],fill=activeGroup?'#f0ecf7':'#faf9f5',stroke=activeGroup?'#8372b4':'#e2dfd6';
      out+=tensorRect(gx,top,groupW,groupH,fill,stroke,activeGroup?2:1,6);
      out+=tensorText(gx+11,top+17,four?'大组 '+g:'表 '+g,10,activeGroup?'#594a89':'#687481',700,'start');
      if(four){
        for(let m=0;m<shape[1];m++){
          const selected=activeGroup&&m===indexes[1],my=top+25+m*56;
          out+=tensorRect(gx+7,my,groupW-14,51,selected?'#fffefa':'#f8f7f2',selected?'#9a86c5':'#e9e6de',selected?1.5:.8,3);
          out+=tensorMiniTable(gx+7,my+3,shape,indexes,strides,g,m,selected);
        }
      }else{
        out+=tensorMiniTable(gx,top+37,shape,indexes,strides,g,0,activeGroup);
        out+=tensorText(gx+groupW/2,top+118,'4 行 × 5 列',9,'#7b8590',500);
      }
    }
    const tableX=470,tableY=73,cellW=49,cellH=32,rowStart=tableY+35,colStart=tableX+37;
    const selectedGroup=four?indexes[0]:indexes[0],selectedSheet=four?indexes[1]:0;
    const rowAxis=shape.length-2,colAxis=shape.length-1;
    out+=tensorRect(tableX,tableY,335,181,'#fffefa','#e3dfd6',1,5);
    out+=tensorText(tableX+167,tableY+19,(four?'大组 '+selectedGroup+' · 表 '+selectedSheet:'表 '+selectedGroup)+' · 行轴索引 '+indexes[rowAxis],10,'#5a4d83',650);
    out+=tensorText(tableX+18,rowStart+cellH*2,'行',9,'#83909a',500);
    for(let col=0;col<shape[colAxis];col++)out+=tensorText(colStart+col*cellW+cellW/2,rowStart-4,String(col),9,'#75818c',600);
    for(let row=0;row<shape[rowAxis];row++){
      out+=tensorText(tableX+18,rowStart+row*cellH+cellH/2+3,String(row),9,'#75818c',600);
      for(let col=0;col<shape[colAxis];col++){
        const indexesForCell=indexes.slice();indexesForCell[rowAxis]=row;indexesForCell[colAxis]=col;
        const value=indexesForCell.reduce((sum,index,axis)=>sum+index*strides[axis],0),selected=row===indexes[rowAxis]&&col===indexes[colAxis];
        const fill=selected?'#e5a057':row===indexes[rowAxis]?'#eeeaf6':'#f3f4f1',stroke=selected?'#c87928':'#ffffff';
        out+=tensorRect(colStart+col*cellW,rowStart+row*cellH,cellW-2,cellH-2,fill,stroke,1,2);
        out+=tensorText(colStart+col*cellW+(cellW-2)/2,rowStart+row*cellH+cellH/2+3,String(value),10,selected?'#4c3827':'#586675',selected?700:500);
      }
    }
    out+=tensorText(tableX+167,tableY+170,'橙色格：索引 ['+indexes.join(', ')+'] → offset '+offset,9,'#6d5b91',650);
    out+='</svg>';
    return out;
  }
  function tensorAxisControls(root,shape,indexes){
    return '<div class="tensor-axis-grid">'+shape.map((size,axis)=>'<label class="tensor-axis-control"><span>轴 '+axis+' · '+tensorAxisName(shape,axis)+' <output data-tensor-axis-value="'+axis+'">'+indexes[axis]+'</output></span><input type="range" data-tensor-axis="'+axis+'" min="0" max="'+(size-1)+'" value="'+indexes[axis]+'" aria-label="轴 '+axis+' · '+tensorAxisName(shape,axis)+'索引" aria-valuetext="'+indexes[axis]+'，范围 0 到 '+(size-1)+'"></label>').join('')+'</div>';
  }
  function tensorStepMarkup(indexes,strides,count){
    const parts=indexes.map((index,axis)=>({axis,index,stride:strides[axis],term:index*strides[axis]}));
    if(!count)return '<p class="tensor-step-hint">从 storage_offset = 0 开始，点击“显示下一步”，逐轴累加索引乘以 stride。</p>';
    const visible=parts.slice(0,count);
    return '<ol>'+visible.map((part,i)=>'<li><span class="tensor-step-number">'+(i+1)+'</span><span>轴 '+part.axis+'：'+part.index+' × '+part.stride+' = <strong>'+part.term+'</strong><small>累计偏移 '+visible.slice(0,i+1).reduce((sum,item)=>sum+item.term,0)+'</small></span></li>').join('')+(count===parts.length?'<li class="tensor-step-total"><span class="tensor-step-number">✓</span><span>storage_offset 0 + 各轴贡献 = <strong>'+parts.reduce((sum,part)=>sum+part.term,0)+'</strong></span></li>':'')+'</ol>';
  }
  function updateTensorSteps(root,indexes,strides){
    const list=root.querySelector('[data-tensor-step-list]'),next=root.querySelector('[data-tensor-step-next]');
    if(!list||!next)return;
    const count=Math.min(indexes.length,Number(root.dataset.step)||0);
    list.innerHTML=tensorStepMarkup(indexes,strides,count);
    next.disabled=count>=indexes.length;
    next.textContent=count>=indexes.length?'计算完成':'显示下一步（'+(count+1)+' / '+indexes.length+'）';
  }
  function updateTensorExplorer(root,rebuildControls){
    const shape=tensorShape(root.dataset.shape),strides=tensorStrides(shape),previous=(root.dataset.indices||'').split(',').filter(Boolean).map(Number),defaults=shape.length===3?[1,2,3]:[1,2,3,4];
    const indexes=shape.map((size,axis)=>tensorClampIndex(previous[axis]===undefined?defaults[axis]:previous[axis],size-1));
    root.dataset.indices=indexes.join(',');
    if(rebuildControls)root.querySelector('[data-tensor-axis-controls]').innerHTML=tensorAxisControls(root,shape,indexes);
    else root.querySelectorAll('[data-tensor-axis]').forEach(input=>{const axis=Number(input.dataset.tensorAxis);input.closest('.tensor-axis-control').querySelector('output').textContent=String(indexes[axis]);input.setAttribute('aria-valuetext',indexes[axis]+'，范围 0 到 '+(shape[axis]-1))});
    const offset=indexes.reduce((sum,index,axis)=>sum+index*strides[axis],0),selector='x['+indexes.join(',')+']';
    root.querySelector('[data-tensor-diagram]').innerHTML=tensorExplorerSvg(shape,indexes,strides,offset);
    root.querySelector('[data-tensor-shape-readout]').textContent='('+shape.join(', ')+')';
    root.querySelector('[data-tensor-stride-readout]').textContent='('+strides.join(', ')+')';
    root.querySelector('[data-tensor-selected-readout]').textContent=selector+' → offset '+offset+' → 值 '+offset;
    root.querySelector('[data-tensor-range-readout]').textContent='合法范围：'+shape.map((size,axis)=>'轴 '+axis+' 为 0–'+(size-1)).join('；');
    root.querySelectorAll('[data-tensor-shape]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.tensorShape===root.dataset.shape)));
    updateTensorSteps(root,indexes,strides);
  }
  function updateTransposeView(root){
    const transposed=root.dataset.view==='transposed',rows=transposed?4:3,cols=transposed?3:4;
    const cells=Array.from({length:rows},(_,row)=>'<tr>'+Array.from({length:cols},(_,col)=>{const value=transposed?col*4+row:row*4+col,selected=value===6;return '<td class="'+(selected?'is-highlighted':'')+'"'+(selected?' aria-label="值 6；原矩阵 a[1,2]，转置视图 t[2,1]"':'')+'>'+value+'</td>'}).join('')+'</tr>').join('');
    const shape=transposed?'(4, 3)':'(3, 4)',stride=transposed?'(1, 4)':'(4, 1)',axes=transposed?'新轴 0 ← 原列轴 1　·　新轴 1 ← 原行轴 0':'新轴 0 ← 原行轴 0　·　新轴 1 ← 原列轴 1';
    root.querySelector('[data-transpose-live-view]').innerHTML='<div class="transpose-result"><div class="transpose-matrix"><strong>'+(transposed?'t = a.transpose(0,1)':'a')+'</strong><table aria-label="'+(transposed?'转置矩阵':'原始矩阵')+'：元素 6 以橙色标记"><tbody>'+cells+'</tbody></table></div><div class="transpose-facts"><p><span>shape</span><code>'+shape+'</code></p><p><span>stride</span><code>'+stride+'</code></p><p><span>轴对应</span><strong>'+axes+'</strong></p><p class="transpose-coordinate">同一个数值 6：'+(transposed?'t[2,1]':'a[1,2]')+'</p></div></div>';
    root.querySelectorAll('[data-transpose-view]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.transposeView===(transposed?'transposed':'original'))));
  }
  function initializeTensorLearning(){
    document.querySelectorAll('[data-tensor-explorer]').forEach(root=>updateTensorExplorer(root,true));
    document.querySelectorAll('[data-tensor-transpose]').forEach(updateTransposeView);
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
    +'<section class="stage-preview"><div class="section-heading"><div><span class="chapter-kicker">THREE STAGES · '+lessons.length+' CHAPTERS</span><h2>沿着概念，一步步深入</h2></div><a href="#courses">浏览全部章节 ↗</a></div><div class="stage-grid">'+Object.entries(groups).map(([key,g],i)=>{const list=lessons.filter(l=>l.group===key),finished=list.filter(l=>state.done.includes(l.id)).length;return '<a class="stage-card '+key+'" href="#courses/'+key+'"><span class="stage-index">0'+(i+1)+'</span><span class="stage-meta">'+g.label+'</span><h3>'+g.name+'</h3><p>'+g.desc+'</p><span class="stage-bottom">'+list.length+' 章 · '+finished+' 章已完成 <b>→</b></span></a>'}).join('')+'</div></section>'
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
    const quiz=l.chapterExercises?.length?'<section class="chapter-quiz" id="chapter-quiz"><span class="chapter-kicker">CHAPTER REVIEW · 章末综合练习</span><h2>本章综合练习</h2><p>结合本章概念完成练习；每题作答后查看解析。</p>'+l.chapterExercises.map((exercise,i)=>exerciseCard(l,exercise,'chapter',i)).join('')+'</section>':'';
    const keypoints=l.keypoints?'<section class="keypoint-review"><span class="chapter-kicker">CHAPTER REVIEW</span><h2>本章要点</h2><ul>'+l.keypoints.map(x=>'<li>'+x+'</li>').join('')+'</ul></section>':'';
    const source=l.source?'<p class="source-note">延伸阅读：<a href="'+esc(l.source)+'" target="_blank" rel="noopener noreferrer">官方文档与参考资料 ↗</a>。概念解释为本课程整理；具体接口、参数和仓库实现请以对应版本文档为准。</p>':'';
    const videoLinks=[...(l.videoUrl?[{url:l.videoUrl,label:'观看张量基础视频'}]:[]),...(l.relatedVideos||[])].map(video=>'<a class="chapter-video-link" href="'+esc(video.url)+'" target="_blank" rel="noopener noreferrer">'+esc(video.label||'观看抖音原视频')+' ↗</a>').join('');
    return '<article class="textbook-page"><div class="reading-progress" id="reading-progress" role="progressbar" aria-label="章节阅读进度" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0" aria-valuetext="阅读进度 0%"><span id="reading-progress-fill"></span></div><div class="book-toolbar"><a href="#courses/'+l.group+'">← 返回'+groups[l.group].name+'目录</a><span>第 '+String(index+1).padStart(2,'0')+' 章　/　'+lessons.length+' 章</span></div>'
      +'<header class="chapter-heading"><p class="chapter-kicker">'+groups[l.group].label+'　·　'+l.level+'</p><h1>'+l.title+'</h1><p class="chapter-deck">'+l.desc+'</p><div class="chapter-byline"><span>◷ 约 '+l.time+' 分钟阅读</span><span>📖 概念讲解 · 图文示意 · 例题 · 自测</span>'+videoLinks+'</div></header>'
      +'<div class="chapter-layout"><aside class="chapter-toc"><strong>本章导航</strong><ol>'+l.sections.map((s,i)=>'<li><a href="#section-'+(i+1)+'">'+s.title+'</a></li>').join('')+'<li><a href="#chapter-review">本章要点</a></li><li><a href="#chapter-quiz">本章综合练习</a></li><li><a href="#chapter-notes">笔记与进度</a></li></ol></aside>'
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
    initializeTensorLearning();
    if(route==='lesson'&&parts[2])document.getElementById(parts[2])?.scrollIntoView({behavior:'smooth',block:'start'});
    if(route==='lab'){updateIoU();window.initializeInteractiveLab?.();}
    document.querySelector('.sidebar').classList.remove('open');
    updateReadingEffects(route);
    document.title=(route==='lesson'?crumb:names[route]||'学习概览')+' · VisionLab';
  }
  window.home=home;window.courses=courses;window.path=path;window.lesson=lesson;window.render=render;
  document.addEventListener('input',event=>{
    const input=event.target.closest('input[data-tensor-axis]');
    if(!input)return;
    const root=input.closest('[data-tensor-explorer]');
    root.dataset.indices=Array.from(root.querySelectorAll('[data-tensor-axis]')).map(axis=>axis.value).join(',');
    root.dataset.step='0';
    root.querySelector('[data-tensor-prediction]').value='';
    root.querySelector('[data-tensor-prediction-feedback]').textContent='';
    updateTensorExplorer(root,false);
  });
  document.addEventListener('click',event=>{
    const shapeButton=event.target.closest('[data-tensor-shape]');
    if(shapeButton){
      const root=shapeButton.closest('[data-tensor-explorer]');
      root.dataset.shape=shapeButton.dataset.tensorShape;root.dataset.step='0';
      root.querySelector('[data-tensor-prediction]').value='';root.querySelector('[data-tensor-prediction-feedback]').textContent='';
      updateTensorExplorer(root,true);return;
    }
    const nextStep=event.target.closest('[data-tensor-step-next]');
    if(nextStep){const root=nextStep.closest('[data-tensor-explorer]');root.dataset.step=String(Math.min(tensorShape(root.dataset.shape).length,(Number(root.dataset.step)||0)+1));updateTensorExplorer(root,false);return}
    const resetSteps=event.target.closest('[data-tensor-step-reset]');
    if(resetSteps){const root=resetSteps.closest('[data-tensor-explorer]');root.dataset.step='0';updateTensorExplorer(root,false);return}
    const check=event.target.closest('[data-tensor-check]');
    if(check){
      const root=check.closest('[data-tensor-explorer]'),prediction=root.querySelector('[data-tensor-prediction]'),feedback=root.querySelector('[data-tensor-prediction-feedback]'),shape=tensorShape(root.dataset.shape),strides=tensorStrides(shape),indexes=(root.dataset.indices||'').split(',').map(Number),offset=indexes.reduce((sum,index,axis)=>sum+index*strides[axis],0);
      if(prediction.value.trim()===''){feedback.textContent='先写下你的预测，再检查。';return}
      if(Number.isInteger(Number(prediction.value))&&Number(prediction.value)===offset)feedback.textContent='答对了！逐轴相乘并相加，得到偏移 '+offset+'；本例元素值也是 '+offset+'。';
      else feedback.textContent='还没对上。逐轴把索引乘以对应的 stride，再把各项相加；可以先看一步步演示，再修改预测。';
      return;
    }
    const transpose=event.target.closest('[data-transpose-view]');
    if(transpose){const root=transpose.closest('[data-tensor-transpose]');root.dataset.view=transpose.dataset.transposeView;updateTransposeView(root)}
  });
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
