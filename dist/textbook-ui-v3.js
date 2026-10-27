/* 教材式阅读界面：保留原有笔记、自测、搜索与 IoU 实验交互。 */
(()=>{
  // 章节保留原有稳定 ID 和旧锚点，阅读顺序独立于历史编号。
  const narrativeOrder={
    'tensor-operations':[1,0],
    'tensor-layout':[0,2,1],
    'optimizer-momentum':[0,2,3,1],
    'anchors':[0,3,1,5,2,4],
    'train-yolo':[0,3,1,2],
    'inference':[0,3,4,1,2]
  };
  for(const [id,order] of Object.entries(narrativeOrder)){
    const lesson=lessons.find(item=>item.id===id);
    if(!lesson||lesson.sections.length!==order.length)continue;
    const previous=lesson.sections.slice();
    previous.forEach((section,index)=>{section.narrativePlaygroundIndex=index;});
    lesson.sections=order.map(index=>previous[index]);
    if(id==='optimizer-momentum')lesson.sections[0].title='批次怎样影响梯度';
    lesson.sections.forEach((section,index)=>{section.title=(index+1)+'. '+String(section.title).replace(/^\s*\d+\s*[.、．]\s*/,'');});
  }
  const narrativeBridges={
    'tensor-operations':[
      '先算两种乘法和形状匹配，再看如何改变张量的排列与轴。',
      '前面比较了数值运算；下面整理怎样改变形状，为这些运算准备输入。'
    ],
    'tensor-layout':['','先用一组具体数字认识存储位置和读取间隔，再判断换轴后的布局。','知道原始张量与步幅后，再观察换轴为什么可能需要复制。'],
    'optimizer-momentum':[
      '',
      '知道一批数据怎样产生梯度后，先看优化器怎样把当前梯度和历史方向合起来。',
      '动量只保留方向历史；接下来看看 Adam 怎样再利用梯度平方的历史调整步幅。',
      '了解这些更新方法后，再用控制变量的小实验比较它们。'
    ],
    'anchors':[
      '',
      '先区分参考尺寸与最终预测框，才能理解后面的匹配规则。',
      '训练时哪些参考有资格负责真实目标？下面用宽高比例算一次。',
      '匹配条件讲清后，再对照推理时宽高如何由参考和网络输出计算。',
      '知道匹配和解码的作用后，再决定是否有必要调整参考尺寸。',
      '最后用 AutoAnchor 的统计量检查数据里的目标尺寸与参考是否匹配。'
    ],
    'train-yolo':[
      '',
      '命令启动后，程序如何把一批图片变成一次参数更新？先沿训练过程走一遍。',
      '理解每轮发生的步骤后，再看日志和保存的文件分别记录什么。',
      '最后用一轮小样本检查数据、更新和验证，确认流程后再扩大预算。'
    ],
    'inference':[
      '',
      '模型输出还不是原图上的框；先从一组原始数字算出位置并还原到原图。',
      '刚才只选了一组参考宽高；这里补充其他参考及分数的含义。',
      '有了已解码的候选框，接下来按分数筛选并去除重复框。',
      '走完整条推理链后，再根据每一步留下的结果定位错误。'
    ]
  };
  for(const [id,bridges] of Object.entries(narrativeBridges)){
    const lesson=lessons.find(item=>item.id===id);
    if(!lesson||lesson.sections.length!==bridges.length)continue;
    bridges.forEach((bridge,index)=>{if(bridge)lesson.sections[index].paragraphs[0]=bridge+' '+lesson.sections[index].paragraphs[0];});
  }
  let readingEffectsHandler=null;
  function clearReadingEffects(){
    if(!readingEffectsHandler)return;
    window.removeEventListener('scroll',readingEffectsHandler);
    window.removeEventListener('resize',readingEffectsHandler);
    readingEffectsHandler=null;
  }
  function updateReadingEffects(route,lessonId){
    clearReadingEffects();
    if(route!=='lesson')return;
    const progress=document.getElementById('reading-progress');
    const fill=document.getElementById('reading-progress-fill');
    const sections=[...document.querySelectorAll('.text-section[id^="section-"], #chapter-review, #chapter-quiz, #chapter-notes')];
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
      if(lessonId&&active){
        state.lastSection=state.lastSection||{};
        if(state.lastSection[lessonId]!==active){state.lastSection[lessonId]=active;save();}
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
  function mathLike(value){const source=value.trim();if(!source||source.length>140||/(?:->|=>)/.test(source))return false;if(/(?:\b(?:torch|nn|numpy|np|model|loss|optimizer|parameter|dataset|DataLoader|Linear|Conv2d|BatchNorm|CrossEntropyLoss|MSELoss|AdamW?|SGD|ReLU|Sigmoid|reshape|view|argmax|softmax|backward|zero_grad|train|eval|state_dict|shape|dtype|requires_grad|detach|item|append|range|print|tensor|True|False|None)\b|\.[A-Za-z_]\w*|["'])/.test(source))return false;if(/^(?:bias|axis|dim|stride|padding|dtype|device|lr|weight_decay|reduction|in_channels|out_channels|kernel_size|num_classes|batch_size|num_workers|dropout|eps|momentum)\s*=/.test(source))return false;return /[=≈≃≤≥<>±×·÷⊙∑Σ√∞^*+−-]|[\u0391-\u03A9\u03B1-\u03C9]|_[0-9{]/.test(source)||(/^[A-Za-z0-9.]+\/[A-Za-z0-9.]+$/.test(source)&&/\d/.test(source))}
  function rich(value){const source=String(value),mark=String.fromCharCode(96),pattern=new RegExp(mark+'([^'+mark+']+)'+mark,'g');let html='',last=0,match;while((match=pattern.exec(source))){html+=esc(source.slice(last,match.index));html+=mathLike(match[1])?'\\('+esc(match[1])+'\\)':'<code>'+esc(match[1])+'</code>';last=pattern.lastIndex}return (html+esc(source.slice(last))).replace(/\n/g,'<br>')}
  const lessonMathOptions={delimiters:[{left:'\\[',right:'\\]',display:true},{left:'\\(',right:'\\)',display:false}],ignoredTags:['script','noscript','style','textarea','pre','code','option'],throwOnError:false};
  function renderLessonMath(root){if(root&&window.renderMathInElement)window.renderMathInElement(root,lessonMathOptions)}
  window.renderLessonMath=renderLessonMath;
  function exerciseCard(l,exercise,type,index,sectionId=''){
    const label=exercise.stage|| (type==='section'?'本节练习':'章末综合题 '+(index+1));
    const indexAttribute=type==='section'?'data-section-index':'data-exercise-index';
    const key=l.id+':'+type+':'+(type==='section'?(sectionId||index):(exercise.id||index))+(exercise.revision?'@'+exercise.revision:'');
    const saved=state.exerciseAnswers?.[key]??(type==='section'&&!exercise.revision?state.exerciseAnswers?.[l.id+':section:'+index]:undefined);
    const selected=Number.isInteger(saved)&&saved>=0&&saved<exercise.options.length?saved:null;
    const sectionAttribute=type==='section'?' data-section-id="'+esc(sectionId||'')+'"':'';
    const options=exercise.options.map((option,i)=>{const active=selected===i,correct=active&&selected===exercise.answer;return '<button type="button" class="'+(active?(correct?'correct':'wrong'):'')+'" aria-pressed="'+active+'" data-exercise-key="'+esc(key)+'" data-exercise-answer="'+i+'" data-lesson="'+l.id+'" data-exercise-type="'+type+'" '+indexAttribute+'="'+index+'"'+sectionAttribute+'>'+String.fromCharCode(65+i)+'. '+rich(option)+'</button>'}).join('');
    const feedback=selected===null?'':(selected===exercise.answer?'回答正确。':'再想一想。正确答案：'+String.fromCharCode(65+exercise.answer)+'。')+'解析：'+exercise.why;
    return '<section class="exercise-card '+type+'-exercise"><span class="exercise-label">'+label+'</span><p class="exercise-prompt">'+rich(exercise.q)+'</p><div class="exercise-options" role="group" aria-label="'+label+'">'+options+'</div><div class="quiz-result exercise-feedback" role="status" aria-live="polite">'+feedback+'</div></section>';
  }
  function articleSections(l){
    const placements=window.lessonFigures.placement(l);
    const placed=new Set();
    return l.sections.map((s,i)=>{
      const legacyIndex=Number.isInteger(s.legacyIndex)?s.legacyIndex:i;
      const paragraphs=s.paragraphs.map((p,j)=>{
        const heading=s.subheadings?.[j]?'<h3 class="lesson-subheading">'+rich(s.subheadings[j])+'</h3>':'';
        const markup=heading+'<p>'+rich(p)+'</p>'+(window.lessonBiasPlaygrounds?.renderParagraph(l.id,legacyIndex,j)||'')+(window.visionlabCvEditorial?.renderParagraph(s,j)||'')+(window.visionlabYoloLearning?.renderParagraph(s,j)||'');
        const here=placements.filter(figure=>figure.section===legacyIndex&&figure.paragraph===j&&!placed.has(figure.key));
        if(here.length){here.forEach(figure=>placed.add(figure.key));return markup+here.map(figure=>window.lessonFigures.render(l,figure.key)).join('')}
        return markup;
      }).join('');
      const advancedBlocks=(s.advancedBlocks||[]).map(block=>'<details class="advanced-section"><summary>'+esc(block.title||'选学深入内容 · 点击展开')+'</summary><div class="advanced-section-body">'+(block.paragraphs||[]).map(paragraph=>'<p>'+rich(paragraph)+'</p>').join('')+'</div></details>').join('');
      const fallback=placements.filter(figure=>figure.section===legacyIndex&&!placed.has(figure.key)).map(figure=>{placed.add(figure.key);return window.lessonFigures.render(l,figure.key)}).join('');
      const sectionCode=s.code?'<div class="code-block"><div class="code-head"><span>'+esc(s.codeLabel||'Python · 本节示例')+'</span><button class="copy" type="button" data-copy-fragment="section-code-'+l.id+'-'+i+'">复制本段代码</button></div><pre><code id="section-code-'+l.id+'-'+i+'">'+esc(s.code)+'</code></pre></div>'+(s.codeNote?'<p class="code-note">'+rich(s.codeNote)+'</p>':'') : '';
      const sourcePlaygroundId=s.sourcePlaygroundId||s.playgroundId;
      const tensorOperations=sourcePlaygroundId==='tensor-operations'?tensorOperationsMarkup():'';
      const tensorExplorer=sourcePlaygroundId==='tensor-explorer'?tensorExplorerMarkup():'';
      const transposeExplorer=sourcePlaygroundId==='tensor-transpose'?tensorTransposeMarkup():'';
      const cvPlayers=l.cvEdited?window.visionlabCvEditorial?.renderPlayers(s):null;
      const lessonPlayground=s.suppressLegacyPlayer?'':(cvPlayers?.main??window.lessonPlaygrounds?.render(l.id,s.playgroundId||(s.narrativePlaygroundIndex??i),legacyIndex)??'')+(cvPlayers?.extra||'');
      const biasPlayground=window.lessonBiasPlaygrounds?.render(l.id,legacyIndex)||'';
      const cvWorkshop=s.cvWorkshop||s.foundationWorkshop?(window.renderFoundationWorkshop?.(l)||''):'';
      const content=paragraphs+cvWorkshop+advancedBlocks+sectionCode+fallback+tensorOperations+transposeExplorer+tensorExplorer+lessonPlayground+biasPlayground+(s.exercise?exerciseCard(l,s.exercise,'section',legacyIndex,s.id):'');
      const optional=s.depth==='advanced'?'<details class="advanced-section"><summary>'+esc(s.depthLabel||'选学深入内容 · 点击展开')+'</summary><div class="advanced-section-body">'+content+'</div></details>':content;
      const stableId=s.id||l.id+'-s'+String(legacyIndex+1).padStart(2,'0');
      return '<section class="text-section" id="section-'+stableId+'" data-lesson-id="'+l.id+'" data-section-id="'+stableId+'" data-section-index="'+i+'"><span class="legacy-section-anchor" id="section-'+(legacyIndex+1)+'" aria-hidden="true"></span><span class="section-number">'+String(i+1).padStart(2,'0')+'</span><h2>'+sectionTitle(s.title)+'</h2>'+optional+'</section>';
    }).join('');
  }
  function tensorOperationsMarkup(){
    const code=[
      'import torch',
      '',
      '# 1) 逐元素乘法：对应格子相乘',
      'A = torch.tensor([[1., 2.], [3., 4.]])',
      'B = torch.tensor([[10., 20.], [30., 40.]])',
      "print('逐元素乘法:', A * B)",
      '',
      '# 2) 向量点积：一对一相乘后相加，只剩一个数',
      'u = torch.tensor([1., 2., 3.])',
      'v = torch.tensor([4., 5., 6.])',
      "print('向量点积:', torch.dot(u, v))  # 1×4 + 2×5 + 3×6 = 32",
      '',
      '# 3) 矩阵乘法：一行乘一列，再把乘积相加',
      'M = torch.tensor([[1., 2.], [3., 4.]])',
      'N = torch.tensor([[2.], [1.]])',
      "print('矩阵乘法:', M @ N)  # [[1×2+2×1], [3×2+4×1]]"
    ].join('\n');
    return '<section class="tensor-ops-panel" aria-labelledby="tensor-ops-title"><div class="tensor-ops-heading"><div><span class="chapter-kicker">PYTORCH · 三种常用乘法</span><h3 id="tensor-ops-title">看符号，先判断“对应乘”还是“乘后相加”</h3><p>先用小数字看清结果怎么来，再记代码符号；不需要先学矩阵公式。</p></div></div><div class="tensor-ops-grid"><article class="tensor-op-card"><span>逐元素乘法</span><code>A * B</code><p>两个表格中相同位置的数各自相乘。</p><small>1×10=10；2×20=40；3×30=90；4×40=160</small></article><article class="tensor-op-card"><span>向量点积</span><code>torch.dot(u, v)</code><p>一对一相乘后把结果加起来，最后只剩一个数。</p><small>1×4 + 2×5 + 3×6 = 32</small></article><article class="tensor-op-card"><span>矩阵乘法</span><code>A @ B</code><p>左表每一行和右表每一列对应相乘，再把乘积相加。</p><small>第 1 行：1×2 + 2×1 = 4；第 2 行：3×2 + 4×1 = 10</small></article></div><div class="tensor-ops-code code-block"><div class="code-head"><span>PyTorch · 三种运算示例</span><button class="copy" type="button" data-copy-fragment="tensor-ops-code">复制本段代码</button></div><pre><code id="tensor-ops-code">'+esc(code)+'</code></pre></div><div class="tensor-ops-output"><strong>逐行算出的结果</strong><pre>逐元素乘法: tensor([[ 10.,  40.],&#10;        [ 90., 160.]])&#10;向量点积: tensor(32.)&#10;矩阵乘法: tensor([[ 4.],&#10;        [10.]])</pre></div><details class="advanced-section"><summary>选学：向量叉积 · 点击展开</summary><div class="advanced-section-body"><p>叉积只用于三维向量。它会得到一个新向量，方向同时垂直于两个输入方向；例如 x 方向叉乘 y 方向得到 z 方向。初学神经网络时通常先掌握逐元素乘法、点积和矩阵乘法即可。</p><div class="code-block"><div class="code-head"><span>PyTorch · 三维旋转中的向量运算</span><button class="copy" type="button" data-copy-fragment="tensor-cross-code">复制这段代码</button></div><pre><code id="tensor-cross-code">import torch\nex = torch.tensor([1., 0., 0.])\ney = torch.tensor([0., 1., 0.])\nprint(torch.linalg.cross(ex, ey, dim=0))  # tensor([0., 0., 1.])</code></pre></div></div></details><p class="tensor-ops-footnote">torch.dot 用于两个等长的一维向量；@ / torch.matmul 用于矩阵乘法，也能处理批次维度。广播会让兼容的长度为 1 的轴重复参与运算，可以在本节小例子里理解。</p></section>';
  }  document.addEventListener('click',async event=>{
    const button=event.target.closest('button[data-copy-fragment]');
    if(!button)return;
    const code=document.getElementById(button.dataset.copyFragment);
    if(!code)return;
    try{
      await navigator.clipboard.writeText(code.innerText);
      button.textContent='已复制';
      window.setTimeout(()=>{button.textContent='复制本段代码'},1400);
    }catch{
      button.textContent='复制失败，请手动选择';
      window.setTimeout(()=>{button.textContent='复制本段代码'},1800);
    }
  });
  function tensorExplorerMarkup(){
    return '<section class="tensor-explorer" data-tensor-explorer data-shape="4d" data-step="0" aria-labelledby="tensor-explorer-title"><div class="tensor-explorer-heading"><div><span class="chapter-kicker">INTERACTIVE EXPLORER · 动手看 shape 与索引</span><h3 id="tensor-explorer-title">亲自选一组索引，看它取到哪个数</h3></div><span class="tensor-zero-note">索引从 0 开始</span></div><p class="tensor-explorer-intro">拖动每条轴的索引。左边看选中了哪一组表格，右边看当前 shape 和取到的数字；默认把 0、1、2……按顺序填入，再按 shape 分组。</p><div class="tensor-shape-switch" role="group" aria-label="选择张量形状"><button type="button" data-tensor-shape="3d" aria-pressed="false">三维　(3, 4, 5)</button><button type="button" data-tensor-shape="4d" aria-pressed="true">四维　(2, 3, 4, 5)</button></div><div class="tensor-layout"><figure class="tensor-diagram-card"><div class="tensor-card-label"><strong>分组结构</strong><span>紫色边框标出所选组与表</span></div><div class="tensor-diagram-scroll" data-tensor-diagram></div><figcaption>先沿外层选组，再进入其中的表；放大区展示行和列的位置。折叠画法只是帮助阅读，shape 仍记录全部轴。</figcaption></figure><div class="tensor-controls-card"><div class="tensor-card-label"><strong>逐轴选择</strong><span>用滑块或键盘方向键</span></div><div class="tensor-axis-controls" data-tensor-axis-controls></div><div class="tensor-computation"><p><span>shape</span><code data-tensor-shape-readout></code></p><div class="tensor-selected-value" aria-live="polite"><span>当前元素</span><strong data-tensor-selected-readout></strong></div><p class="tensor-valid-range" data-tensor-range-readout></p></div><details class="advanced-section"><summary>选学：stride 怎样帮助找到内存位置</summary><div class="advanced-section-body"><p>stride（步幅）表示沿某条轴走一格，底层数据要跨过几个位置；storage_offset 表示从底层存储的哪个位置开始读。它们解释为什么转置和切片可能改变读取方式。</p><div class="tensor-computation"><p><span>stride</span><code data-tensor-stride-readout></code></p><p><span>storage_offset</span><code>0</code></p></div><div class="tensor-learning-grid"><section class="tensor-steps-card"><div class="tensor-card-label"><strong>把 offset 一步步算出来</strong><span>每项都是索引乘 stride</span></div><p class="tensor-formula">元素位置 = storage_offset + Σ(索引 × stride)</p><div class="tensor-step-list" data-tensor-step-list aria-live="polite"></div><div class="tensor-step-actions"><button type="button" class="secondary" data-tensor-step-next>显示下一步</button><button type="button" class="tensor-quiet-button" data-tensor-step-reset>从头演示</button></div></section><section class="tensor-predict-card"><div class="tensor-card-label"><strong>先预测，再揭晓</strong><span>试着心算当前索引</span></div><p>按上面的 stride，当前索引对应的元素偏移是多少？</p><label class="tensor-prediction-label" for="tensor-prediction">我的预测</label><div class="tensor-prediction-row"><input id="tensor-prediction" data-tensor-prediction type="number" min="0" step="1" inputmode="numeric" placeholder="输入一个整数"><button type="button" class="secondary" data-tensor-check>检查</button></div><p class="tensor-prediction-feedback" data-tensor-prediction-feedback role="status" aria-live="polite"></p><p class="tensor-small-note">本示例用从 0 开始的连续整数填充，所以偏移数值也恰好是元素值。换成其他数据后，两者不一定相等。</p></section></div></div></details></div></section>';
  }  function tensorTransposeMarkup(){
    return '<section class="tensor-transpose-explorer" data-tensor-transpose data-view="original" aria-labelledby="tensor-transpose-title"><div class="tensor-card-label"><strong id="tensor-transpose-title">切换视图：交换两条轴</strong><span>同一块 storage，不同的读取顺序</span></div><p>用按钮切换 <code>a</code> 与 <code>a.transpose(0,1)</code>。标橙色的数字都是 6：它在原矩阵的 <code>a[1,2]</code>，换轴后位于 <code>t[2,1]</code>。</p><div class="transpose-view-switch" role="group" aria-label="切换原矩阵或转置视图"><button type="button" data-transpose-view="original" aria-pressed="true">原矩阵 a</button><button type="button" data-transpose-view="transposed" aria-pressed="false">转置视图 t</button></div><div class="transpose-live-view" data-transpose-live-view aria-live="polite"></div><p class="tensor-small-note">转置改变 shape、stride 和轴的对应关系；这个例子只是创建共享原存储的视图，底层 0–11 的排列没有被重写。</p></section>';
  }
  function tensorShape(key){return key==='3d'?[3,4,5]:[2,3,4,5]}
  function tensorStrides(shape){let stride=1;const out=[];for(let i=shape.length-1;i>=0;i--){out[i]=stride;stride*=shape[i]}return out}
  function tensorAxisName(shape,index){if(shape.length===3)return ['表','行','列'][index];return ['大组','表','行','列'][index]}
  function tensorClampIndex(value,max){const number=Number(value);return Math.min(max,Math.max(0,Number.isFinite(number)?Math.floor(number):0))}
  function tensorText(x,y,value,size,color,weight,anchor){return '<text x="'+x+'" y="'+y+'" font-size="'+size+'" fill="'+color+'" font-weight="'+weight+'" text-anchor="'+(anchor||'middle')+'">'+value+'</text>'}
  function tensorRect(x,y,w,h,fill,stroke,sw,rx){return '<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" rx="'+(rx||3)+'" fill="'+fill+'" stroke="'+stroke+'" stroke-width="'+sw+'"/>'}
  function tensorMiniTable(x,y,shape,indexes,strides,group,sheet,active){
    const cellW=shape.length===3?14:17,cellH=shape.length===3?10:6.5,startX=x+(shape.length===3?18:36),startY=y+18;
    let out='';
    for(let row=0;row<shape[shape.length-2];row++)for(let col=0;col<shape[shape.length-1];col++){
      const selected=active&&row===indexes[shape.length-2]&&col===indexes[shape.length-1];
      out+=tensorRect(startX+col*cellW,startY+row*cellH,cellW,cellH,selected?'#e5a057':active&&row===indexes[shape.length-2]?'#e9e4f3':'#f3f4f1',selected?'#c87928':'#ffffff',.8,1);
    }
    out+=tensorText(x+(shape.length===3?58:93),y+12,'表 '+(shape.length===3?group:sheet),shape.length===3?9:8,active?'#655598':'#75808a',650);
    return out;
  }
  function tensorExplorerSvg(shape,indexes,strides,offset){
    const four=shape.length===4,groupCount=shape[0],groupW=four?254:169,groupGap=four?10:7,left=16,top=42,groupH=180;
    let out='<svg viewBox="0 0 560 450" role="img" aria-labelledby="tensor-svg-title tensor-svg-desc"><title id="tensor-svg-title">交互式张量分组和索引图</title><desc id="tensor-svg-desc">上方显示 shape 的分组结构，下方显示当前索引 ['+indexes.join(', ')+'] 选中的表；橙色元素偏移为 '+offset+'。</desc>';
    out+=tensorText(16,22,four?'分组结构：轴 0 有 2 个大组，每组轴 1 有 3 张表':'分组结构：轴 0 有 3 张表',12,'#5e6876',650,'start');
    out+=tensorText(544,22,'紫色边框标出当前选择',9,'#87909a',500,'end');
    for(let g=0;g<groupCount;g++){
      const gx=left+g*(groupW+groupGap),activeGroup=g===indexes[0],fill=activeGroup?'#f0ecf7':'#faf9f5',stroke=activeGroup?'#8372b4':'#e2dfd6';
      out+=tensorRect(gx,top,groupW,groupH,fill,stroke,activeGroup?2:1,6);
      out+=tensorText(gx+11,top+17,four?'大组 '+g:'表 '+g,10,activeGroup?'#594a89':'#687481',700,'start');
      if(four){
        for(let m=0;m<shape[1];m++){
          const selected=activeGroup&&m===indexes[1],my=top+25+m*49;
          out+=tensorRect(gx+7,my,groupW-14,45,selected?'#fffefa':'#f8f7f2',selected?'#9a86c5':'#e9e6de',selected?1.5:.8,3);
          out+=tensorMiniTable(gx+7,my+1,shape,indexes,strides,g,m,selected);
        }
      }else{
        out+=tensorMiniTable(gx,top+37,shape,indexes,strides,g,0,activeGroup);
        out+=tensorText(gx+groupW/2,top+132,'4 行 × 5 列',9,'#7b8590',500);
      }
    }
    const tableX=16,tableY=236,cellW=88,cellH=25,rowStart=tableY+49,colStart=tableX+53;
    const selectedGroup=indexes[0],selectedSheet=four?indexes[1]:0;
    const rowAxis=shape.length-2,colAxis=shape.length-1;
    out+=tensorRect(tableX,tableY,528,201,'#fffefa','#e3dfd6',1,5);
    out+=tensorText(tableX+12,tableY+19,'放大当前表 · '+(four?'大组 '+selectedGroup+' / 表 '+selectedSheet:'表 '+selectedGroup),11,'#5a4d83',650,'start');
    out+=tensorText(tableX+514,tableY+19,'行轴 '+indexes[rowAxis],9,'#74808b',550,'end');
    out+=tensorText(tableX+27,rowStart+cellH*2,'行',9,'#83909a',500);
    for(let col=0;col<shape[colAxis];col++)out+=tensorText(colStart+col*cellW+(cellW-2)/2,rowStart-5,String(col),9,'#75818c',600);
    for(let row=0;row<shape[rowAxis];row++){
      out+=tensorText(tableX+27,rowStart+row*cellH+cellH/2+3,String(row),9,'#75818c',600);
      for(let col=0;col<shape[colAxis];col++){
        const indexesForCell=indexes.slice();indexesForCell[rowAxis]=row;indexesForCell[colAxis]=col;
        const value=indexesForCell.reduce((sum,index,axis)=>sum+index*strides[axis],0),selected=row===indexes[rowAxis]&&col===indexes[colAxis];
        const fill=selected?'#e5a057':row===indexes[rowAxis]?'#eeeaf6':'#f3f4f1',stroke=selected?'#c87928':'#ffffff';
        out+=tensorRect(colStart+col*cellW,rowStart+row*cellH,cellW-2,cellH-2,fill,stroke,1,2);
        out+=tensorText(colStart+col*cellW+(cellW-2)/2,rowStart+row*cellH+cellH/2+3,String(value),10,selected?'#4c3827':'#586675',selected?700:500);
      }
    }
    out+=tensorText(tableX+12,tableY+191,'橙色格：索引 ['+indexes.join(', ')+'] → offset '+offset,9,'#6d5b91',650,'start');
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
    const count=Math.max(0,Math.min(indexes.length,Number(root.dataset.step)||0));
    root.dataset.step=String(count);
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
    saveTensorProgress(root);
  }
  function saveTensorProgress(root){
    const lessonId=root.closest('.text-section')?.dataset.lessonId;
    if(!lessonId)return;
    state.tensorProgress=state.tensorProgress||{};
    state.tensorProgress[lessonId]={shape:root.dataset.shape,indices:root.dataset.indices,step:Number(root.dataset.step)||0,prediction:root.querySelector('[data-tensor-prediction]')?.value||'',feedback:root.querySelector('[data-tensor-prediction-feedback]')?.textContent||''};
    save();
  }
  function updateTransposeView(root){
    const transposed=root.dataset.view==='transposed',rows=transposed?4:3,cols=transposed?3:4;
    const cells=Array.from({length:rows},(_,row)=>'<tr>'+Array.from({length:cols},(_,col)=>{const value=transposed?col*4+row:row*4+col,selected=value===6;return '<td class="'+(selected?'is-highlighted':'')+'"'+(selected?' aria-label="值 6；原矩阵 a[1,2]，转置视图 t[2,1]"':'')+'>'+value+'</td>'}).join('')+'</tr>').join('');
    const shape=transposed?'(4, 3)':'(3, 4)',stride=transposed?'(1, 4)':'(4, 1)',axes=transposed?'新轴 0 ← 原列轴 1　·　新轴 1 ← 原行轴 0':'新轴 0 ← 原行轴 0　·　新轴 1 ← 原列轴 1';
    root.querySelector('[data-transpose-live-view]').innerHTML='<div class="transpose-result"><div class="transpose-matrix"><strong>'+(transposed?'t = a.transpose(0,1)':'a')+'</strong><table aria-label="'+(transposed?'转置矩阵':'原始矩阵')+'：元素 6 以橙色标记"><tbody>'+cells+'</tbody></table></div><div class="transpose-facts"><p><span>shape</span><code>'+shape+'</code></p><p><span>stride</span><code>'+stride+'</code></p><p><span>轴对应</span><strong>'+axes+'</strong></p><p class="transpose-coordinate">同一个数值 6：'+(transposed?'t[2,1]':'a[1,2]')+'</p></div></div>';
    root.querySelectorAll('[data-transpose-view]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.transposeView===(transposed?'transposed':'original'))));
  }
  function initializeTensorLearning(){
    document.querySelectorAll('[data-tensor-explorer]').forEach(root=>{
      const lessonId=root.closest('.text-section')?.dataset.lessonId,saved=state.tensorProgress?.[lessonId];
      if(saved){
        if(saved.shape==='3d'||saved.shape==='4d')root.dataset.shape=saved.shape;
        root.dataset.indices=String(saved.indices||'');
        root.dataset.step=String(saved.step||0);
        root.querySelector('[data-tensor-prediction]').value=String(saved.prediction||'');
        root.querySelector('[data-tensor-prediction-feedback]').textContent=String(saved.feedback||'');
      }
      updateTensorExplorer(root,true);
    });
    document.querySelectorAll('[data-tensor-transpose]').forEach(updateTransposeView);
  }
  function heading(title,sub,eyebrow){
    return '<section class="page-intro"><p class="eyebrow">'+eyebrow+'</p><h1>'+title+'</h1><p>'+sub+'</p></section>';
  }
  function progress(){
    const done=lessons.filter(l=>state.done.includes(l.id)).length;
    return {done:done,pct:Math.round(done/lessons.length*100)};
  }
  function sectionTitle(value){return String(value||'').replace(/^\s*\d+\s*[.、．]\s*/,'')}
  function resumeSectionId(l,requested){
    const candidate=requested||state.lastSection?.[l.id]||'section-1';
    if(candidate==='chapter-review'&&l.keypoints)return candidate;
    if(candidate==='chapter-quiz'&&l.chapterExercises?.length)return candidate;
    if(candidate==='chapter-notes')return candidate;
    const match=/^section-(\d+)$/.exec(candidate);
    if(match){const section=l.sections.find(item=>item.legacyIndex===Number(match[1])-1);return section?'section-'+section.id:'section-'+l.sections[0]?.id;}
    const escapedLessonId=l.id.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
    const oldGenerated=new RegExp('^section-'+escapedLessonId+'-s(\\d+)$').exec(candidate);
    if(oldGenerated){const section=l.sections.find(item=>item.legacyIndex===Number(oldGenerated[1])-1);if(section)return 'section-'+section.id;}
    const stable=/^section-(.+)$/.exec(candidate);
    return stable&&l.sections.some(section=>section.id===stable[1])?candidate:'section-'+l.sections[0]?.id;
  }
  function resumeSectionTitle(l,sectionId){
    if(sectionId==='chapter-review')return '本章要点';
    if(sectionId==='chapter-quiz')return '本章综合练习';
    if(sectionId==='chapter-notes')return '笔记与进度';
    const legacy=/^section-(\d+)$/.exec(sectionId);
    const section=legacy?l.sections.find(item=>item.legacyIndex===Number(legacy[1])-1):l.sections.find(item=>item.id===String(sectionId).replace(/^section-/,''));
    return section?sectionTitle(section.title):sectionTitle(l.sections[0]?.title)||'第一节';
  }
  function home(){
    const p=progress(),next=lessons.find(l=>l.id===state.last&&!state.done.includes(l.id))||lessons.find(l=>!state.done.includes(l.id))||lessons[0];
    const hasSavedSection=!!state.lastSection?.[next.id],nextSection=resumeSectionId(next),nextHref='#lesson/'+next.id+(hasSavedSection?'/'+nextSection:''),nextSectionTitle=resumeSectionTitle(next,nextSection),sectionNumber=/^section-(\d+)$/.exec(nextSection),nextSectionLabel=hasSavedSection?'第 '+(next.sections.findIndex(s=>'section-'+s.id===nextSection)+1)+' 节 · '+nextSectionTitle:'从第一节开始 · '+nextSectionTitle,nextReadingHeading=hasSavedSection?'从上次的小节接着读':'从第一节开始学习',heroActionLabel=hasSavedSection?'继续学习 · '+nextSectionTitle:(p.done?'继续学习':'从第一章开始');
    return heading('从像素开始，读懂视觉模型。','一套循序渐进的中文教材：先建立深度学习直觉，再走进计算机视觉，最后读懂并训练 YOLOv5。','VISIONLAB · 图文学习路径')
    +'<section class="welcome-panel"><div><span class="chapter-kicker">YOUR TEXTBOOK FOR DEEP LEARNING</span><h2>把公式、代码和图像，<br>连成一条能走通的路。</h2><p>每章先说明要解决的问题，再逐步展开概念、推导直觉和可运行示例。读完一节，你可以自测、记笔记，并从下一章接着学习。</p><a class="primary" href="'+nextHref+'">'+heroActionLabel+' <span>→</span></a><a class="welcome-secondary" href="#path">查看完整目录</a></div><div class="welcome-art" aria-hidden="true"><span class="art-orbit orbit-one"></span><span class="art-orbit orbit-two"></span><div class="art-core">AI<br><small>VISION</small></div><span class="art-node node-one">像素</span><span class="art-node node-two">特征</span><span class="art-node node-three">检测</span><span class="art-line line-one"></span><span class="art-line line-two"></span></div></section>'
    +'<section class="learning-prep" aria-labelledby="learning-prep-title"><div class="learning-prep-heading"><span class="chapter-kicker">START WITH WHAT YOU KNOW</span><h2 id="learning-prep-title">第一次学，也可以直接开始</h2><p>不需要先会编程或背公式。概念、图解和网页互动可以先学；想运行代码时，再按准备步骤动手。</p></div><div class="learning-prep-grid"><article><span class="prep-index">01 · 概念路线</span><h3>先看懂模型在做什么</h3><p>从输入、计算、答案和训练开始，再学数字形状、神经网络、损失与更新。</p><a href="#lesson/ai-foundations">从 AI 入门开始 →</a></article><article><span class="prep-index">02 · 代码路线</span><h3>准备运行环境后再复制代码</h3><p>先认识变量、列表、索引和输出；再按官方说明准备 Python 与 PyTorch。每段示例会写清输入、运行位置和预期结果。</p><code class="prep-code">import torch<br>x = torch.tensor([1, 2, 3])<br>print(x.shape)　# torch.Size([3])</code><a href="#resources">查看官方入门资料与用途 →</a></article></div></section>'
    +'<section class="overview-strip"><div><span>课程章节</span><strong>'+lessons.length+'<small>章</small></strong></div><div><span>学习阶段</span><strong>03<small>阶</small></strong></div><div><span>我的进度</span><strong>'+p.pct+'<small>%</small></strong></div><div class="progress-wide"><div class="progress-label"><span>已完成 '+p.done+' / '+lessons.length+' 章</span><span>'+p.pct+'%</span></div><div class="progress-bar"><i style="width:'+p.pct+'%"></i></div></div></section>'
    +'<section class="next-reading"><div class="section-heading"><div><span class="chapter-kicker">PICK UP WHERE YOU LEFT OFF</span><h2>'+nextReadingHeading+'</h2></div><a href="#path">完整学习路线 ↗</a></div><a class="next-reading-card" href="'+nextHref+'"><span class="next-number">'+String(lessons.indexOf(next)+1).padStart(2,'0')+'</span><span class="next-copy"><small>'+groups[next.group].name+' · '+next.level+' · 约 '+next.time+' 分钟</small><strong>'+next.title+'</strong><span class="resume-section-label">'+nextSectionLabel+'</span><span>'+next.desc+'</span></span><span class="next-arrow">继续阅读　→</span></a></section>'
    +'<section class="stage-preview"><div class="section-heading"><div><span class="chapter-kicker">THREE LEARNING AREAS · '+lessons.length+' COURSES</span><h2>沿着基础、视觉与实战路线逐步深入</h2></div><a href="#courses">浏览全部课程 ↗</a></div><div class="stage-grid">'+Object.entries(groups).map(([key,g],i)=>{const list=lessons.filter(l=>l.group===key),finished=list.filter(l=>state.done.includes(l.id)).length;return '<a class="stage-card '+key+'" href="#courses/'+key+'"><span class="stage-index">0'+(i+1)+'</span><span class="stage-meta">'+g.label+'</span><h3>'+g.name+'</h3><p>'+g.desc+'</p><span class="stage-bottom">'+list.length+' 课 · '+finished+' 课已完成 <b>→</b></span></a>'}).join('')+'</div></section>'
    +'<a class="pipeline-home-promo" href="#lab"><span class="pipeline-home-icon" aria-hidden="true">↗</span><span><small>INTERACTIVE CASE · 7 STEPS</small><strong>从一张图，走完一次目标检测</strong><em>跟着真实框、候选框和评估指标，逐步看懂完整流程。</em></span><b>开始完整案例 →</b></a>'
    +'<section class="reading-note"><span>✳</span><p><strong>建议这样学习</strong><br>先读每章目标与图解，再按小节顺序学习；遇到公式时，联系旁边的直觉说明。代码可以复制到本地尝试，自测和笔记帮助你确认真正掌握的部分。</p></section>';
  }
  function courseList(items,grouped=true){
    if(!items.length)return '<div class="empty">未找到“'+esc(query)+'”。换个关键词试试。</div>';
    if(query)return '<ol class="chapter-list search-results">'+items.map(hit=>{
      const l=hit.lesson,index=lessons.indexOf(l)+1,section=hit.sectionIndex,sectionData=section===null?null:l.sections[section];
      const href='#lesson/'+l.id+(sectionData?'/section-'+sectionData.id:'');
      return '<li><a class="chapter-row search-result '+l.group+'" href="'+href+'"><span class="chapter-index">'+String(l.yoloNumber||l.curriculumNumber||index).padStart(2,'0')+'</span><span class="chapter-row-copy search-result-copy"><span class="search-match-label">'+hit.label+'</span><strong>'+l.title+'</strong>'+(hit.sectionTitle?'<span class="search-match-section">'+(section===null?'相关内容':'第 '+(section+1)+' 节 · ')+hit.sectionTitle+'</span>':'')+(hit.excerpt?'<span class="search-match-excerpt">'+esc(hit.excerpt)+'</span>':'')+'</span><span class="chapter-row-meta"><span class="level-pill">'+l.level+'</span><span>约 '+l.time+' 分钟</span></span><span class="chapter-status">→</span></a></li>';
    }).join('')+'</ol>';
    if(grouped&&window.visionlabFoundationCurriculum&&items.every(l=>l.group==='dl'))return window.visionlabFoundationCurriculum.renderCatalog('dl',items,list=>courseList(list,false));
    if(grouped&&window.visionlabFoundationCurriculum&&items.every(l=>l.group==='cv'))return window.visionlabFoundationCurriculum.renderCatalog('cv',items,list=>courseList(list,false));
    if(grouped&&items.every(l=>l.group==='yolo')&&window.visionlabYoloCurriculum)return window.visionlabYoloCurriculum.renderCatalog(items,list=>courseList(list,false));
    if(grouped&&!query&&new Set(items.map(l=>l.group)).size>1)return Object.keys(groups).filter(key=>items.some(l=>l.group===key)).map((key,i)=>'<section class="curriculum-group '+key+'"><div class="curriculum-group-heading"><span>LEARNING AREA 0'+(i+1)+'</span><h2>'+groups[key].name+'</h2><p>'+groups[key].desc+'</p></div>'+courseList(items.filter(l=>l.group===key),true)+'</section>').join('');
    return '<ol class="chapter-list">'+items.map(l=>'<li><a class="chapter-row '+l.group+'" href="#lesson/'+l.id+'"><span class="chapter-index">'+String(l.yoloNumber||l.curriculumNumber||lessons.indexOf(l)+1).padStart(2,'0')+'</span><span class="chapter-row-copy"><strong>'+l.title+'</strong><small>'+l.desc+'</small></span><span class="chapter-row-meta"><span class="level-pill">'+l.level+'</span><span>约 '+l.time+' 分钟</span></span><span class="chapter-status">'+(state.done.includes(l.id)?'✓':'→')+'</span></a></li>').join('')+'</ol>';
  }
  function filters(){
    return '<div class="textbook-filters">'+[['all','全部章节'],['dl','深度学习'],['cv','计算机视觉'],['yolo','YOLOv5 系统课程']].map(([id,name])=>'<a class="'+(filter===id?'selected':'')+'"'+(filter===id?' aria-current="page"':'')+' href="#courses'+(id==='all'?'':'/'+id)+'">'+name+'</a>').join('')+'</div>';
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
      const entry={...section,legacyIndex:Number.isInteger(section.legacyIndex)?section.legacyIndex:index};
      consider(1,'小节标题命中',title,index,title,matchingParagraph);
      if(best?.sectionIndex===index)best.sectionData=entry;
      paragraphs.forEach(paragraph=>consider(3,'正文命中',paragraph,index,title,paragraph));
    });
    const additional=[lesson.worked?.title,lesson.worked?.prompt,lesson.worked?.solution,lesson.quiz?.q,...(lesson.quiz?.options||[])];
    additional.filter(Boolean).forEach(text=>consider(4,'例题或自测命中',text,null,'',text));
    if(lesson.code)consider(5,'代码命中',lesson.code,null,'','');
    if(best&&best.sectionIndex!==null)best.sectionData=lesson.sections[best.sectionIndex];
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
    const glossaryMatches=query?window.visionlabGlossary?.search(query)||[]:[];
    const subtitle=query?'按标题、小节和正文匹配；点击结果可直达命中位置。':filter==='yolo'?'从检测背景开始，按仓库、网络、训练、部署的顺序学习；每阶段都有明确目标与验收问题。':filter==='dl'?'先学输入、张量、神经网络与损失，再沿梯度、优化器、训练和泛化逐步深入。':filter==='cv'?'先确定视觉任务与输入，再学习卷积、经典网络、检测指标和数据实践。':'按学习路线阅读，或搜索课程、概念与代码。每课提供目标、图解和练习。';
    const count=query?'找到 '+items.length+' 个课程位置与 '+glossaryMatches.length+' 个术语':filter==='yolo'?'YOLOv5专题 · '+items.length+'课 · 5个阶段':filter==='dl'?'深度学习 · '+items.length+'课 · 5个阶段':filter==='cv'?'计算机视觉 · '+items.length+'课 · '+(window.visionlabFoundationCurriculum?.phases?.cv?.length||4)+'个阶段':'共 '+items.length+' 课 · '+lessons.length+' 课课程';
    const terms=glossaryMatches.length?'<section class="glossary-search-results"><h2>术语速查</h2><ul>'+glossaryMatches.map(item=>'<li><a href="#dictionary/'+esc(item.id)+'"><strong>'+esc(item.title)+'</strong><span>'+esc(item.plainExplanation)+'</span><small>查看定义、例子与相关课程 ↗</small></a></li>').join('')+'</ul><p><a href="#dictionary">打开完整术语词典 ↗</a></p></section>':'';
    return heading(query?'搜索结果：'+esc(query):filter==='yolo'?'YOLOv5 系统课程':filter==='dl'?'深度学习课程路线':filter==='cv'?'计算机视觉课程路线':'课程目录',subtitle,'THE TEXTBOOK')
      +filters()+'<p class="catalog-count">'+count+'</p>'+terms+courseList(items);
  }
  function path(){
    return heading('从基础出发，走向 YOLOv5 实战。','先完成深度学习基础，再进入 CNN 与视觉任务，最后按五阶段学习 YOLOv5。每个课程组都有清楚的先修关系与阶段目标。','LEARNING ROADMAP')
      +'<div class="roadmap-intro"><strong>建议阅读顺序</strong><span>先按阶段学习主线课程；标注“选学”的专题可以留到第二遍。代码版本以附带的官方文档及仓库为准。</span></div>'
      +Object.entries(groups).map(([key,g],i)=>{const items=lessons.filter(l=>l.group===key),done=items.filter(l=>state.done.includes(l.id)).length;return '<section class="roadmap-stage '+key+'"><div class="roadmap-stage-head"><div><span>STAGE 0'+(i+1)+' · '+g.label+'</span><h2>'+g.name+'</h2><p>'+g.desc+'</p></div><div class="stage-progress">'+done+' / '+items.length+'<small>章完成</small></div></div>'+courseList(items)+'</section>'}).join('');
  }
  function objectiveBox(l){
    const links=l.prereqLinks?.length?'<div class="prerequisite-links"><strong>需要补基础？从这里开始：</strong><ul>'+l.prereqLinks.map(item=>'<li><a href="'+esc(item.href||('#lesson/'+item.id))+'">'+esc(item.title)+' ↗</a></li>').join('')+'</ul></div>':'';
    return '<section class="learning-contract"><div><h2>学完本章，你将能够</h2><ul>'+l.goals.map(g=>'<li>'+rich(g)+'</li>').join('')+'</ul></div><p><strong>先修知识</strong><span>'+rich(l.prereq||'可从上一章接着阅读；不需要提前掌握本领域全部数学。')+'</span>'+links+'</p></section>';
  }
  function beginnerReadingMarkup(l){
    const guide=l.beginnerReading;if(!guide)return '';
    return '<aside class="yl-reading-guide" aria-label="新手阅读建议"><h2>'+esc(guide.title)+'</h2><p>'+esc(guide.description)+'</p><ol>'+guide.steps.map(([target,label])=>{const [id,section]=target.split('#');return '<li><a href="#lesson/'+esc(id)+(section?'/section-'+esc(section):'')+'">'+esc(label)+' →</a></li>';}).join('')+'</ol></aside>';
  }
  function workedExampleMarkup(l){
    if(!l.worked)return '';
    const worked=l.worked;
    const figure=worked.figureKey?window.lessonFigures.render(l,worked.figureKey,'worked'):'';
    const guidedSteps=Array.isArray(worked.steps)&&worked.steps.length;
    const count=guidedSteps?worked.steps.length:0;
    const steps=guidedSteps
      ?'<div class="worked-example-steps"><h3>分步推演</h3><ol id="worked-steps-'+esc(l.id)+'" data-worked-list>'+worked.steps.map((step,index)=>'<li data-worked-step-item="'+(index+1)+'"><button type="button" class="worked-step-index" data-worked-jump="'+(index+1)+'" aria-label="跳到步骤 '+(index+1)+'" aria-current="'+(index===0?'step':'false')+'">步骤 '+String(index+1).padStart(2,'0')+'</button><div class="worked-step-content">'+rich(step)+'</div></li>').join('')+'</ol>'
        +'<div class="worked-example-controls" role="group" aria-label="例题步骤控制"><button type="button" class="worked-control-button" data-worked-prev disabled>上一步</button><output data-worked-progress>第 1 / '+count+' 步</output><button type="button" class="worked-control-button" data-worked-next>下一步</button><button type="button" class="worked-control-button is-quiet" data-worked-toggle-all aria-expanded="false" aria-controls="worked-steps-'+esc(l.id)+'">显示全部步骤</button><button type="button" class="worked-control-button is-quiet" data-worked-reset>从头演示</button></div>'
        +'<p class="worked-example-status" data-worked-status role="status" aria-live="polite">已显示第 1 步。</p></div>':'';
    const solutionLabel=guidedSteps?'结论':'解析';
    const guidedAttrs=guidedSteps?' data-worked-example data-worked-step="1" data-worked-expanded="false"':'';
    const conclusion=guidedSteps?'<p data-worked-conclusion hidden><strong>'+solutionLabel+'</strong>　'+rich(worked.solution)+'</p>':'<p><strong>'+solutionLabel+'</strong>　'+rich(worked.solution)+'</p>';
    return '<section id="worked-example-'+esc(l.id)+'" class="worked-example"'+guidedAttrs+'><span class="chapter-kicker">WORKED EXAMPLE · 例题拆解</span><h2>'+rich(worked.title)+'</h2><p><strong>问题</strong>　'+rich(worked.prompt)+'</p>'+figure+steps+conclusion+'</section>';
  }
  function updateWorkedExample(root,step,expanded){
    const items=Array.from(root.querySelectorAll('[data-worked-step-item]'));
    const count=items.length;
    if(!count)return;
    const current=Math.max(1,Math.min(count,Number(step)||1));
    root.dataset.workedStep=String(current);
    root.dataset.workedExpanded=String(Boolean(expanded));
    items.forEach((item,index)=>{
      const itemStep=index+1;
      item.hidden=!expanded&&itemStep>current;
      const button=item.querySelector('[data-worked-jump]');
      if(button)button.setAttribute('aria-current',String(itemStep===current?'step':'false'));
      item.classList.toggle('is-current',itemStep===current);
      item.classList.toggle('is-complete',itemStep<current);
    });
    const figure=root.querySelector('.chapter-concept-figure');
    if(figure)figure.dataset.workedCurrentStep=String(current);
    const progress=root.querySelector('[data-worked-progress]');
    if(progress)progress.textContent='第 '+current+' / '+count+' 步';
    const status=root.querySelector('[data-worked-status]');
    if(status)status.textContent=(expanded?'已显示全部 '+count+' 步。':'已显示到第 '+current+' 步，共 '+count+' 步。')+(figure?'图中高亮第 '+current+' 步。':'');
    const previous=root.querySelector('[data-worked-prev]');
    const next=root.querySelector('[data-worked-next]');
    if(previous)previous.disabled=current<=1;
    if(next)next.disabled=current>=count;
    const toggleAll=root.querySelector('[data-worked-toggle-all]');
    if(toggleAll){toggleAll.setAttribute('aria-expanded',String(Boolean(expanded)));toggleAll.textContent=expanded?'收起后续步骤':'显示全部步骤';}
    const conclusion=root.querySelector('[data-worked-conclusion]');
    if(conclusion)conclusion.hidden=!expanded&&current<count;
  }
  function initializeWorkedExamples(){
    document.querySelectorAll('[data-worked-example]').forEach(root=>updateWorkedExample(root,1,false));
  }
  function updateConceptGuide(root,step,expanded){
    const items=Array.from(root.querySelectorAll('[data-concept-guide-step-item]'));
    const count=items.length;
    if(!count)return;
    const current=Math.max(1,Math.min(count,Number(step)||1));
    root.dataset.guideCurrentStep=String(current);
    root.dataset.guideExpanded=String(Boolean(expanded));
    let currentTitle='';
    items.forEach((item,index)=>{
      const itemStep=index+1;
      item.hidden=!expanded&&itemStep>current;
      const button=item.querySelector('[data-concept-guide-jump]');
      if(button)button.setAttribute('aria-current',String(itemStep===current?'step':'false'));
      item.classList.toggle('is-current',itemStep===current);
      item.classList.toggle('is-complete',itemStep<current);
      if(itemStep===current)currentTitle=item.querySelector('.figure-guide-step-copy strong')?.textContent||'';
    });
    const progress=root.querySelector('[data-concept-guide-progress]');
    if(progress)progress.textContent='第 '+current+' / '+count+' 步';
    const status=root.querySelector('[data-concept-guide-status]');
    if(status)status.textContent=(expanded?'已展开全部 '+count+' 步；':'')+'图中已突出第 '+current+' 步：'+currentTitle+'。';
    const previous=root.querySelector('[data-concept-guide-prev]');
    const next=root.querySelector('[data-concept-guide-next]');
    if(previous)previous.disabled=current<=1;
    if(next)next.disabled=current>=count;
    const toggle=root.querySelector('[data-concept-guide-toggle]');
    if(toggle){toggle.setAttribute('aria-expanded',String(Boolean(expanded)));toggle.textContent=expanded?'收起后续步骤':'显示全部步骤';}
  }
  function initializeConceptGuides(){
    document.querySelectorAll('[data-concept-guide-root]').forEach(root=>updateConceptGuide(root,1,false));
  }
  function lesson(id){
    const l=lessons.find(x=>x.id===id);
    if(!l)return '<div class="empty">这章暂时没有找到。<a href="#courses">返回课程目录</a></div>';
    state.last=id;save();
    const index=lessons.indexOf(l),next=lessons[index+1],prev=lessons[index-1];
    const tocCollapsed=state.tocCollapsed===true;
    const tocItems=l.sections.map(s=>'<li><a href="#section-'+s.id+'">'+sectionTitle(s.title)+'</a></li>').join('')
      +(l.keypoints?'<li><a href="#chapter-review">本章要点</a></li>':'')
      +(l.chapterExercises?.length?'<li><a href="#chapter-quiz">本章综合练习</a></li>':'')
      +'<li><a href="#chapter-notes">笔记与进度</a></li>';
    const termGuide=window.renderFoundationStart?.(l)||'';
    const editedTeaching=l.cvEdited||l.yoloLearningEdited;
    const foundation=editedTeaching?'<details class="cv-term-reference"><summary>本课名词速查 · 阅读正文时可随时展开</summary>'+termGuide+'</details>':termGuide;
    const beginnerWorkshop=editedTeaching?'':window.renderFoundationWorkshop?.(l)||'';
    const beginnerDepth=editedTeaching?'':window.renderFoundationDepth?.(l)||'';
    const lossFoundation=l.id==='losses'?(window.renderLossFoundationChain?.()||''):'';
    const articleContent=articleSections(l);
    const examples=workedExampleMarkup(l);
    const codeGuide=l.codeGuide?'<aside class="code-orientation"><strong>运行前先看</strong><dl><div><dt>在哪里运行</dt><dd>'+rich(l.codeGuide.where)+'</dd></div><div><dt>要准备什么</dt><dd>'+rich(l.codeGuide.input)+'</dd></div><div><dt>看什么结果</dt><dd>'+rich(l.codeGuide.output)+'</dd></div></dl></aside>':'';
    const starterCode=l.starterCode?'<div class="code-block"><div class="code-head"><span>Python · 第一个小例子</span><button class="copy" type="button" data-copy-fragment="starter-code-'+l.id+'">复制这段代码</button></div><pre><code id="starter-code-'+l.id+'">'+esc(l.starterCode)+'</code></pre></div><p class="code-note">先看输出：它对应上方算例里的已知输入和手算结果；暂时不运行，也可以按给定数字核对。</p>':'';
    const codeBlock=l.code?'<div class="code-block"><div class="code-head"><span>'+esc(l.language||'代码示例')+' · 建议逐行阅读</span><button class="copy" data-copy="'+l.id+'">'+(l.starterCode?'复制完整示例':'复制代码')+'</button></div><pre><code>'+esc(l.code)+'</code></pre></div>':'';
    const codeNote='<p class="code-note">'+(l.language==='源码流程示意'?'这段内容是源码逻辑摘要，不是可独立运行的脚本；请按注释中的文件与方法名对照仓库。':'先运行示例并观察结果，再一次只改变一个输入或参数。'+(l.group==='yolo'?'YOLOv5 命令行选项会随仓库版本变化，请用本地脚本的帮助信息核对。':'每做一步，先预测输入与输出形状，再用实际结果核对。'))+'</p>';
    const code=l.starterCode?'<section class="text-section code-section">'+(!l.code?codeGuide:'')+starterCode+(l.code?'<details class="advanced-section"><summary>选学：完整 PyTorch 操作示例 · 点击展开</summary><div class="advanced-section-body">'+codeBlock+codeGuide+codeNote+'</div></details>':'')+'</section>':l.code?'<section class="text-section code-section">'+codeBlock+codeGuide+codeNote+'</section>':'';
    const stagedQuiz=l.chapterExercises?.length&&l.chapterExercises.every(exercise=>exercise.stage);
    const quiz=l.chapterExercises?.length?'<section class="chapter-quiz" id="chapter-quiz"><span class="chapter-kicker">CHAPTER REVIEW · 章末综合练习</span><h2>本章综合练习</h2><p>'+(stagedQuiz?'按“认概念 → 解释与计算 → 场景迁移”的顺序完成；每题作答后查看解析。':'结合本章概念完成练习；每题作答后查看解析。')+'</p>'+l.chapterExercises.map((exercise,i)=>exerciseCard(l,exercise,'chapter',i)).join('')+'</section>':'';
    const keypoints=l.keypoints?'<section class="keypoint-review"><span class="chapter-kicker">CHAPTER REVIEW</span><h2>本章要点</h2><ul>'+l.keypoints.map(x=>'<li>'+x+'</li>').join('')+'</ul></section>':'';
    const sourceItems=Array.isArray(l.sources)&&l.sources.length?l.sources:(l.source?[{url:l.source,label:'官方文档与参考资料'}]:[]);const source=sourceItems.length?'<p class="source-note">延伸阅读：'+sourceItems.map(item=>'<a href="'+esc(item.url)+'" target="_blank" rel="noopener noreferrer">'+esc(item.label)+' ↗</a>').join(' · ')+'。概念解释为本课程整理；实现细节请以对应版本文档为准。</p>':'';
    const lessonSequence=l.curriculumKey==='dl'
      ? beginnerDepth+articleContent+lossFoundation+beginnerWorkshop+examples+code+keypoints.replace('<section class="keypoint-review">','<section class="keypoint-review" id="chapter-review">')+quiz+source
      : beginnerWorkshop+beginnerDepth+lossFoundation+articleContent+examples+code+keypoints.replace('<section class="keypoint-review">','<section class="keypoint-review" id="chapter-review">')+quiz+source;
    const courseNumber=l.yoloNumber||l.curriculumNumber||index+1;
    const courseCount=l.yoloNumber?24:(l.curriculumNumber?l.curriculumTotal:lessons.length);
    const courseUnit=l.yoloNumber||l.curriculumNumber?'课':'章';
    const videoLinks=[...(l.videoUrl?[{url:l.videoUrl,label:l.videoLabel||'可选视频资料'}]:[]),...(l.relatedVideos||[])].map(video=>'<a class="chapter-video-link" href="'+esc(video.url)+'" target="_blank" rel="noopener noreferrer">'+esc(video.label||'可选外部视频资料')+' ↗</a>').join('');
    return '<article class="textbook-page"><div class="reading-progress" id="reading-progress" role="progressbar" aria-label="章节阅读进度" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0" aria-valuetext="阅读进度 0%"><span id="reading-progress-fill"></span></div><div class="book-toolbar"><a href="#courses/'+l.group+'">← 返回'+groups[l.group].name+'目录</a><span>第 '+String(courseNumber).padStart(2,'0')+' '+courseUnit+'　/　'+courseCount+' '+courseUnit+'</span></div>'
      +'<header class="chapter-heading"><p class="chapter-kicker">'+groups[l.group].label+'　·　'+l.level+'</p><h1>'+l.title+'</h1><p class="chapter-deck">'+l.desc+'</p><div class="chapter-byline"><span>◷ 约 '+l.time+' 分钟阅读</span><span>📖 概念讲解 · 图文示意 · 例题 · 自测</span>'+videoLinks+'</div></header>'
      +'<div class="chapter-layout"><aside class="chapter-toc'+(tocCollapsed?' is-collapsed':'')+'" aria-label="本章导航"><div class="chapter-toc-heading"><strong>本章导航</strong><button class="chapter-toc-toggle" type="button" data-toggle-toc aria-expanded="'+(!tocCollapsed)+'" aria-controls="chapter-toc-list">'+(tocCollapsed?'展开':'收起')+'</button></div><ol id="chapter-toc-list"'+(tocCollapsed?' hidden':'')+'>'+tocItems+'</ol></aside>'
      +'<div class="chapter-body">'+(window.visionlabYoloCurriculum?.renderContext(l)||window.visionlabFoundationCurriculum?.renderContext(l)||'')+beginnerReadingMarkup(l)+objectiveBox(l)+foundation+lessonSequence
      +'<section class="chapter-notes" id="chapter-notes"><span class="chapter-kicker">MY STUDY NOTES</span><h2>写下你的思考</h2><p>用自己的话总结一个概念，或记下尚未解决的问题。笔记保存在当前浏览器。</p><textarea class="note-input" id="lesson-note" placeholder="例如：我现在可以用自己的话解释…… / 我还不确定的是……" aria-label="课程笔记">'+esc(state.notes[id]||'')+'</textarea><div class="lesson-actions"><button class="secondary" data-save-note="'+id+'">保存笔记</button><span id="note-status" class="saved" role="status"></span><button class="primary complete-button" data-complete="'+id+'">'+(state.done.includes(id)?'已完成 · 点击撤销':'标记本章已完成 ✓')+'</button></div></section>'
      +'<nav class="chapter-pagination">'+(prev?'<a href="#lesson/'+prev.id+'"><small>上一章</small><strong>← '+prev.title+'</strong></a>':'<a href="#path"><small>学习路线</small><strong>浏览课程阶段 →</strong></a>')+(next?'<a class="pagination-next" href="#lesson/'+next.id+'"><small>接下来</small><strong>'+next.title+' →</strong></a>':'<a class="pagination-next" href="#path"><small>全部完成</small><strong>回顾完整学习路线 →</strong></a>')+'</nav></div></div></article>';
  }
  function render(){
    const curriculumRedirect=window.visionlabFoundationCurriculum?.resolveRoute(location.hash)||window.visionlabYoloCurriculum?.resolveRoute(location.hash);
    if(curriculumRedirect)history.replaceState({},'',location.pathname+location.search+curriculumRedirect);
    const parts=location.hash.slice(1).split('/'),route=parts[0]||'home',id=parts[1];
    const currentLesson=route==='lesson'?lessons.find(l=>l.id===id):null;
    const targetSection=currentLesson&&(parts[2]||state.lastSection?.[id])?resumeSectionId(currentLesson,parts[2]):null;
    if(route==='courses')filter=id&&groups[id]?id:'all';
    const names={home:'学习概览',courses:'课程目录',dictionary:'术语速查',path:'学习路线',lab:'交互实验室',notes:'我的笔记',resources:'资源导航',lesson:'教材阅读'};
    const crumb=route==='lesson'?(lessons.find(l=>l.id===id)||{}).title||'教材阅读':names[route]||'学习概览';
    let content=route==='home'?home():route==='courses'?courses():route==='dictionary'?window.visionlabDictionary.render(id):route==='path'?path():route==='lesson'?lesson(id):route==='lab'?(window.renderInteractiveLab?window.renderInteractiveLab():lab()):route==='notes'?notes():route==='resources'?(window.renderFoundationResources?.()||resources()):home();
    if(route==='lab'&&window.renderFoundationLabPrimer&&content.includes('<div class="lab-tabs"'))content=content.replace('<div class="lab-tabs"',window.renderFoundationLabPrimer()+'<div class="lab-tabs"');
    document.getElementById('crumb').textContent=crumb;
    document.querySelectorAll('[data-nav]').forEach(a=>a.classList.toggle('active',a.dataset.nav===(route==='lesson'?'courses':route)));
    document.querySelectorAll('[data-course-count]').forEach(badge=>{badge.textContent=String(lessons.length);badge.setAttribute('aria-label',lessons.length+' 节课程')});
    window.visionlabGlossary?.dismiss?.();
    document.getElementById('content').innerHTML=content;
    const headerSearch=document.getElementById('search');
    headerSearch.placeholder=route==='dictionary'?'搜索术语、英文名或 API…':'搜索课程、概念或代码…';
    headerSearch.setAttribute('aria-label',route==='dictionary'?'搜索术语':'搜索课程、概念或代码');
    headerSearch.value=route==='dictionary'?window.visionlabDictionary.getQuery():query;
    if(route==='dictionary')window.visionlabDictionary.initialize();
    renderLessonMath(document.getElementById('content'));
    window.visionlabGlossary?.init();
    window.visionlabGlossary?.decorate(document.getElementById('content'));
    initializeConceptGuides();
    initializeWorkedExamples();
    window.lessonPlaygrounds?.initialize();
    window.initializeFoundationExamples?.();
    window.initializeFoundationWorkshops?.();
    window.lessonBiasPlaygrounds?.initialize();
    initializeTensorLearning();
    if(route==='dictionary'&&id){document.querySelector('.dictionary-layout')?.scrollIntoView({behavior:'auto',block:'start'});document.getElementById('dictionary-entry-title')?.focus({preventScroll:true});}
    if(route==='lesson'&&targetSection)document.getElementById(targetSection)?.scrollIntoView({behavior:'auto',block:'start'});
    if(route==='lab'){updateIoU();window.initializeInteractiveLab?.();}
    document.querySelector('.sidebar').classList.remove('open');
    updateReadingEffects(route,id);
    document.title=(route==='lesson'?crumb:names[route]||'学习概览')+' · VisionLab';
  }
  window.home=home;window.courses=courses;window.path=path;window.lesson=lesson;window.render=render;
  document.addEventListener('input',event=>{
    const input=event.target.closest('input[data-tensor-axis]');
    if(input){
      const root=input.closest('[data-tensor-explorer]');
      root.dataset.indices=Array.from(root.querySelectorAll('[data-tensor-axis]')).map(axis=>axis.value).join(',');
      root.dataset.step='0';
      root.querySelector('[data-tensor-prediction]').value='';
      root.querySelector('[data-tensor-prediction-feedback]').textContent='';
      updateTensorExplorer(root,false);
      return;
    }
    const prediction=event.target.closest('input[data-tensor-prediction]');
    if(prediction)saveTensorProgress(prediction.closest('[data-tensor-explorer]'));
  });
  document.addEventListener('click',event=>{
    const guideControl=event.target.closest('.figure-guide-controls button');
    if(guideControl){
      const root=guideControl.closest('[data-concept-guide-root]');
      const current=Number(root?.dataset.guideCurrentStep)||1;
      const expanded=root?.dataset.guideExpanded==='true';
      if(root){
        if(guideControl.matches('[data-concept-guide-prev]'))updateConceptGuide(root,current-1,expanded);
        else if(guideControl.matches('[data-concept-guide-next]'))updateConceptGuide(root,current+1,expanded);
        else if(guideControl.matches('[data-concept-guide-toggle]'))updateConceptGuide(root,current,!expanded);
        else if(guideControl.matches('[data-concept-guide-reset]'))updateConceptGuide(root,1,false);
      }
      return;
    }
    const guideJump=event.target.closest('[data-concept-guide-jump]');
    if(guideJump){
      const root=guideJump.closest('[data-concept-guide-root]');
      if(root)updateConceptGuide(root,guideJump.dataset.conceptGuideJump,root.dataset.guideExpanded==='true');
      return;
    }
    const guideExample=event.target.closest('[data-guide-example-id]');
    if(guideExample){
      const target=document.getElementById(guideExample.dataset.guideExampleId);
      if(target){const behavior=window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth';target.scrollIntoView({behavior:behavior,block:'start'});target.setAttribute('tabindex','-1');target.focus({preventScroll:true});}
      return;
    }
    const workedControl=event.target.closest('.worked-example-controls button');
    if(workedControl){
      const root=workedControl.closest('[data-worked-example]');
      const current=Number(root?.dataset.workedStep)||1;
      const expanded=root?.dataset.workedExpanded==='true';
      if(root){
        if(workedControl.matches('[data-worked-prev]'))updateWorkedExample(root,current-1,expanded);
        else if(workedControl.matches('[data-worked-next]'))updateWorkedExample(root,current+1,expanded);
        else if(workedControl.matches('[data-worked-toggle-all]'))updateWorkedExample(root,current,!expanded);
        else if(workedControl.matches('[data-worked-reset]'))updateWorkedExample(root,1,false);
      }
      return;
    }
    const workedJump=event.target.closest('[data-worked-jump]');
    if(workedJump){
      const root=workedJump.closest('[data-worked-example]');
      if(root)updateWorkedExample(root,workedJump.dataset.workedJump,root.dataset.workedExpanded==='true');
      return;
    }
    const tocToggle=event.target.closest('[data-toggle-toc]');
    if(tocToggle){
      state.tocCollapsed=tocToggle.getAttribute('aria-expanded')==='true';
      const list=document.getElementById(tocToggle.getAttribute('aria-controls'));
      tocToggle.setAttribute('aria-expanded',String(!state.tocCollapsed));
      tocToggle.textContent=state.tocCollapsed?'展开':'收起';
      tocToggle.closest('.chapter-toc')?.classList.toggle('is-collapsed',state.tocCollapsed);
      if(list)list.hidden=state.tocCollapsed;
      save();
      return;
    }
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
      if(prediction.value.trim()===''){feedback.textContent='先写下你的预测，再检查。';saveTensorProgress(root);return}
      if(Number.isInteger(Number(prediction.value))&&Number(prediction.value)===offset)feedback.textContent='答对了！逐轴相乘并相加，得到偏移 '+offset+'；本例元素值也是 '+offset+'。';
      else feedback.textContent='还没对上。逐轴把索引乘以对应的 stride，再把各项相加；可以先看一步步演示，再修改预测。';
      saveTensorProgress(root);
      return;
    }
    const transpose=event.target.closest('[data-transpose-view]');
    if(transpose){const root=transpose.closest('[data-tensor-transpose]');root.dataset.view=transpose.dataset.transposeView;updateTransposeView(root)}
  });
  document.addEventListener('click',event=>{
    const anchor=event.target.closest('a[href^="#"]');
    if(!anchor)return;
    const destination=anchor.getAttribute('href').slice(1);
    if(destination.startsWith('section-')||destination.startsWith('yc-phase-')||destination.startsWith('fc-phase-')||destination==='chapter-review'||destination==='chapter-quiz'||destination==='chapter-notes'){
      event.preventDefault();
      const reduced=window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
      document.getElementById(destination)?.scrollIntoView({behavior:reduced?'auto':'smooth',block:'start'});
      return;
    }
    event.preventDefault();
    history.pushState({},'',location.pathname+location.search+'#'+destination);
    window.render();
    if(destination.split('/').length<3&&!destination.startsWith('dictionary/'))window.scrollTo(0,0);
  },true);
  window.addEventListener('popstate',()=>{window.render();if(!/^#(?:lesson|dictionary)\//.test(location.hash))window.scrollTo(0,0)});
  render();
})();
