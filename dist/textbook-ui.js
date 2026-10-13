/* 教材式阅读界面：保留原有笔记、自测、搜索与 IoU 实验交互。 */
(()=>{
  const visualData={
    tensor:['一批图像','B × C × H × W','逐层变换','形状与轴含义','模型接口','维度必须对齐'],
    gradient:['前向计算','得到预测与损失','反向传播','计算参数梯度','优化更新','沿下降方向移动'],
    network:['输入数据','特征张量','网络层','逐步提取组合','输出','对应任务目标'],
    losses:['模型 logits','未经归一化分数','标签与目标','分类 / 回归 / 检测','损失值','可微分的训练信号'],
    optimizer:['计算梯度','当前批次的方向','优化器','SGD / Momentum / Adam','更新参数','学习率决定步幅'],
    training:['训练集','拟合模型参数','验证集','选择设置与检查','测试集','最终一次评估'],
    regularization:['模型复杂度','参数、数据与训练时长','控制过拟合','增强 / 衰减 / 早停','新数据表现','检验泛化能力'],
    transfer:['预训练权重','已有视觉特征','适配检测头','对齐类别与标签','目标数据','逐步微调'],
    image:['像素数组','H × W × C','预处理','通道 / 类型 / 归一化','模型张量','N × C × H × W'],
    cnn:['局部感受野','读取附近像素','共享卷积核','滑动提取相同模式','特征图','响应随位置变化'],
    pooling:['局部窗口','2 × 2 特征','下采样','取最大值或平均值','更小特征图','空间细节相应减少'],
    augmentation:['变换图像','翻转 / 缩放 / 颜色','同步变标签','框与图一起变化','检查样本','确认目标仍可辨认'],
    tasks:['整张图','分类：图里有什么','目标实例','检测：位置与类别','像素区域','分割：精确轮廓'],
    iou:['预测框','覆盖的像素区域','真实框','标注目标区域','交集 ÷ 并集','得到重叠比例'],
    metrics:['检测候选框','置信度排序','NMS','清理重复结果','IoU 匹配','计算 P / R / AP'],
    'data-quality':['原始样本','图片与标注','分组划分','同源内容不泄漏','分层评估','定位场景盲区'],
    architecture:['Backbone','抽取多尺度特征','Neck','融合上下文信息','Detect Head','预测框与类别'],
    dataset:['定义类别','名称与索引','YOLO 标签','归一化 xywh','目录与 YAML','训练脚本可读取'],
    anchors:['特征网格','多个下采样尺度','Anchor 先验','匹配适合的候选','预测偏移','回归最终边界框'],
    'yolo-loss':['匹配预测','生成正负样本','检测监督','box / obj / cls','多项合并','反向传播更新'],
    'train-yolo':['数据配置','路径与类别顺序','训练脚本','显式参数与权重','验证集','保存最佳检查点'],
    'yolo-augment':['建立基线','固定数据与指标','调一个因素','尺寸 / batch / 增强','重新验证','比较速度与精度'],
    inference:['预处理','resize 与 padding','模型前向','产生候选预测','后处理','阈值、NMS 与还原'],
    debugging:['观察症状','空结果 / 漏检 / 发散','按链路检查','数据 → 训练 → 推理','构造对照','用证据定位根因']
  };
  const palette={dl:['#6656a5','#f1eef8'],cv:['#427a9b','#edf4f7'],yolo:['#3d826a','#edf5f0']};
  function rich(value){const mark=String.fromCharCode(96);const pattern=new RegExp(mark+'([^'+mark+']+)'+mark,'g');return esc(value).replace(pattern,'<code>$1</code>').replace(/\n/g,'<br>')}
  function figure(l){
    const d=visualData[l.id]||['输入','准备数据','计算','模型处理','输出','检查结果'];
    const color=(palette[l.group]||palette.dl)[0],soft=(palette[l.group]||palette.dl)[1];
    const cards=[0,1,2].map(i=>'<g><rect x="'+(16+i*248)+'" y="58" width="218" height="112" rx="12" fill="'+soft+'" stroke="'+color+'" stroke-opacity=".17"/><circle cx="'+(39+i*248)+'" cy="81" r="12" fill="'+color+'"/><text x="'+(39+i*248)+'" y="85" fill="white" text-anchor="middle" font-size="11" font-weight="700">'+(i+1)+'</text><text x="'+(125+i*248)+'" y="105" fill="#273343" text-anchor="middle" font-size="16" font-weight="700">'+esc(d[i*2])+'</text><text x="'+(125+i*248)+'" y="134" fill="#687687" text-anchor="middle" font-size="12">'+esc(d[i*2+1])+'</text></g>').join('');
    return '<figure class="lesson-figure"><div class="figure-heading"><span>概念图解</span><span>先看关系，再看细节</span></div><svg viewBox="0 0 760 194" role="img" aria-label="'+esc(l.title)+'的三步关系示意"><path d="M235 114h16m0 0-6-6m6 6-6 6M483 114h16m0 0-6-6m6 6-6 6" stroke="'+color+'" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>'+cards+'</svg><figcaption>'+esc((l.figureCaption)||'图中从左到右表示本章概念之间的关系。掌握输入、变换和输出后，再联系每一步的数学定义与代码实现。')+'</figcaption></figure>';
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
    if(!items.length)return '<div class="empty">没有找到匹配章节。试试“卷积”“梯度”“标签”或“YOLO”。</div>';
    return '<ol class="chapter-list">'+items.map(l=>'<li><a class="chapter-row '+l.group+'" href="#lesson/'+l.id+'"><span class="chapter-index">'+String(lessons.indexOf(l)+1).padStart(2,'0')+'</span><span class="chapter-row-copy"><strong>'+l.title+'</strong><small>'+l.desc+'</small></span><span class="chapter-row-meta"><span class="level-pill">'+l.level+'</span><span>约 '+l.time+' 分钟</span></span><span class="chapter-status">'+(state.done.includes(l.id)?'✓':'→')+'</span></a></li>').join('')+'</ol>';
  }
  function filters(){
    return '<div class="textbook-filters">'+[['all','全部章节'],['dl','深度学习'],['cv','计算机视觉'],['yolo','YOLOv5 实战']].map(([id,name])=>'<button class="'+(filter===id?'selected':'')+'" data-filter="'+id+'">'+name+'</button>').join('')+'</div>';
  }
  function matched(){
    return lessons.filter(l=>(filter==='all'||filter===l.group)&&(!query||JSON.stringify(l).toLowerCase().includes(query.toLowerCase())));
  }
  function courses(){
    const items=matched();
    return heading(query?'搜索结果：'+esc(query):'课程目录','按顺序阅读，或用上方搜索框查找概念。每章都附有学习目标、图解、例题与自测。','THE TEXTBOOK')
      +filters()+'<p class="catalog-count">共 '+items.length+' 章 · '+lessons.length+' 章完整课程</p>'+courseList(items);
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
    const articleSections=l.sections.map((s,i)=>'<section class="text-section" id="section-'+(i+1)+'"><span class="section-number">0'+(i+1)+'</span><h2>'+s.title+'</h2>'+s.paragraphs.map(p=>'<p>'+rich(p)+'</p>').join('')+'</section>').join('');
    const examples=l.worked?'<section class="worked-example"><span class="chapter-kicker">WORKED EXAMPLE · 例题拆解</span><h2>'+l.worked.title+'</h2><p><strong>问题</strong>　'+rich(l.worked.prompt)+'</p><p><strong>解析</strong>　'+rich(l.worked.solution)+'</p></section>':'';
    const code=l.code?'<section class="text-section code-section"><div class="code-block"><div class="code-head"><span>'+esc(l.language||'代码示例')+' · 建议逐行阅读</span><button class="copy" data-copy="'+l.id+'">复制代码</button></div><pre><code>'+esc(l.code)+'</code></pre></div><p class="code-note">先运行原始示例并观察结果，再一次只改变一个输入或参数。YOLOv5 命令行选项会随仓库版本变化，请用本地脚本的帮助信息核对。</p></section>':'';
    const quiz=l.quiz?'<section class="chapter-quiz quiz"><span class="chapter-kicker">CHECK YOUR UNDERSTANDING · 章末自测</span><h2>检查一下你的理解</h2><p>'+l.quiz.q+'</p>'+l.quiz.options.map((o,i)=>'<button data-answer="'+i+'" data-lesson="'+l.id+'">'+String.fromCharCode(65+i)+'. '+o+'</button>').join('')+'<div class="quiz-result" aria-live="polite"></div></section>':'';
    const keypoints=l.keypoints?'<section class="keypoint-review"><span class="chapter-kicker">CHAPTER REVIEW</span><h2>本章要点</h2><ul>'+l.keypoints.map(x=>'<li>'+x+'</li>').join('')+'</ul></section>':'';
    const source=l.source?'<p class="source-note">延伸阅读：<a href="'+esc(l.source)+'" target="_blank" rel="noopener noreferrer">官方文档与参考资料 ↗</a>。概念解释为本课程整理；具体接口、参数和仓库实现请以对应版本文档为准。</p>':'';
    return '<article class="textbook-page"><div class="book-toolbar"><a href="#courses/'+l.group+'">← 返回'+groups[l.group].name+'目录</a><span>第 '+String(index+1).padStart(2,'0')+' 章　/　'+lessons.length+' 章</span></div>'
      +'<header class="chapter-heading"><p class="chapter-kicker">'+groups[l.group].label+'　·　'+l.level+'</p><h1>'+l.title+'</h1><p class="chapter-deck">'+l.desc+'</p><div class="chapter-byline"><span>◷ 约 '+l.time+' 分钟阅读</span><span>📖 概念讲解 · 图文示意 · 例题 · 自测</span></div></header>'
      +'<div class="chapter-layout"><aside class="chapter-toc"><strong>本章导航</strong><ol>'+l.sections.map((s,i)=>'<li><a href="#section-'+(i+1)+'">'+s.title+'</a></li>').join('')+'<li><a href="#chapter-review">本章要点</a></li><li><a href="#chapter-notes">笔记与进度</a></li></ol></aside>'
      +'<div class="chapter-body">'+objectiveBox(l)+figure(l)+articleSections+examples+code+keypoints.replace('<section class="keypoint-review">','<section class="keypoint-review" id="chapter-review">')+quiz+source
      +'<section class="chapter-notes" id="chapter-notes"><span class="chapter-kicker">MY STUDY NOTES</span><h2>写下你的思考</h2><p>用自己的话总结一个概念，或记下尚未解决的问题。笔记保存在当前浏览器。</p><textarea class="note-input" id="lesson-note" placeholder="例如：我现在可以用自己的话解释…… / 我还不确定的是……" aria-label="课程笔记">'+esc(state.notes[id]||'')+'</textarea><div class="lesson-actions"><button class="secondary" data-save-note="'+id+'">保存笔记</button><span id="note-status" class="saved" role="status"></span><button class="primary complete-button" data-complete="'+id+'">'+(state.done.includes(id)?'已完成 · 点击撤销':'标记本章已完成 ✓')+'</button></div></section>'
      +'<nav class="chapter-pagination">'+(prev?'<a href="#lesson/'+prev.id+'"><small>上一章</small><strong>← '+prev.title+'</strong></a>':'<a href="#path"><small>学习路线</small><strong>浏览课程阶段 →</strong></a>')+(next?'<a class="pagination-next" href="#lesson/'+next.id+'"><small>接下来</small><strong>'+next.title+' →</strong></a>':'<a class="pagination-next" href="#path"><small>全部完成</small><strong>回顾完整学习路线 →</strong></a>')+'</nav></div></div></article>';
  }
  function render(){
    const parts=location.hash.slice(1).split('/'),route=parts[0]||'home',id=parts[1];
    if(route==='courses'&&id&&groups[id])filter=id;
    const names={home:'学习概览',courses:'课程目录',path:'学习路线',lab:'交互实验室',notes:'我的笔记',resources:'资源导航',lesson:'教材阅读'};
    const crumb=route==='lesson'?(lessons.find(l=>l.id===id)||{}).title||'教材阅读':names[route]||'学习概览';
    const content=route==='home'?home():route==='courses'?courses():route==='path'?path():route==='lesson'?lesson(id):route==='lab'?lab():route==='notes'?notes():route==='resources'?resources():home();
    document.getElementById('crumb').textContent=crumb;
    document.querySelectorAll('[data-nav]').forEach(a=>a.classList.toggle('active',a.dataset.nav===(route==='lesson'?'courses':route)));
    const badge=document.querySelector('[data-nav="courses"] em');if(badge)badge.textContent=lessons.length;
    document.getElementById('content').innerHTML=content;
    if(route==='lab')updateIoU();
    document.querySelector('.sidebar').classList.remove('open');
    document.title=(route==='lesson'?crumb:names[route]||'学习概览')+' · VisionLab';
  }
  window.home=home;window.courses=courses;window.path=path;window.lesson=lesson;window.render=render;
  render();
})();
