/* A visual primer on classification, regression, and tasks that combine both. */
(()=>{
  const lesson=lessons.find(item=>item.id==='losses');
  if(!lesson)return;

  const sectionTitle='1. 分类与回归：先看模型要交付什么答案';
  if(!lesson.sections.some(section=>section.title===sectionTitle)){
    lesson.sections.unshift({
      title:sectionTitle,
      paragraphs:[
        '先问模型最后要交付什么。答案是从有限名单里选一个或多个类别，例如“猫 / 狗”或“有车 / 没车”，就是分类；答案是可以连续变化的量，例如房价、温度或坐标，就是回归。分类标签即使写成数字 0、1、2，若它们代表不同类别，仍是类别；不能只看标签的数据类型来决定任务。',
        '分类通常关心类别是否选对。例如 10 张图判对 8 张，准确率是 8/10=80%；回归关心数值偏了多少。损失是训练时计算的目标，评价指标是检查结果的尺子，两者不一定相同。这里先认识均方误差 MSE：预测分别为 8、13，真实值为 10、10，误差为 −2、3，平方后得到 4、9，平均为 (4+9)/2=6.5。平均绝对误差 MAE 则先取绝对值再平均，本例为 (2+3)/2=2.5。MSE 会放大较大的误差，MAE 对极端误差相对不敏感，Huber / Smooth L1 在小误差与大误差区间采用不同惩罚；没有一种损失对所有数据都“首选”。',
        '分类和回归可以出现在同一个系统里。目标检测要回答“是什么”并预测物体边界框，因此同时含类别判断和坐标回归；语义分割通常给每个像素分配类别，实例分割还要分清同一类别的不同物体。去噪和超分辨率常含像素值回归目标，但也可能组合感知等其他损失。',
        '把“分类 / 回归”当成许多监督预测任务的入门视角很有用，但“所有 AI 任务只有这两种”并不准确。聚类、强化学习、检索排序和内容生成等问题还有各自的任务定义。GPT 这类语言模型会逐步预测词表中的下一个 token；单个 token 的训练目标可写成类别概率预测，但用户看到的是序列生成，不能把整项应用简单说成普通图像分类。分类与回归能帮助选输出、标签、损失和指标，却不能单独决定整个训练方案。'
      ]
    });
    lesson.sections.slice(1).forEach(section=>{
      const match=section.title.match(/^(\d+)\.\s/);
      if(match)section.title=String(Number(match[1])+1)+section.title.slice(match[1].length);
    });
    lesson.goals=[...new Set([...(lesson.goals||[]),'从预测答案区分分类与回归，并识别检测等组合任务。'])];
    lesson.keypoints=[...new Set([...(lesson.keypoints||[]),
      '先看目标答案的含义：有限类别通常是分类，连续数量通常是回归；标签的数字格式本身不能决定任务。',
      '目标检测同时预测类别与位置；不少实际模型会把分类 / 物体性与定位目标组合训练。',
      '分类与回归是理解许多监督预测问题的起点，不是 AI 全部任务的完整分类。',
      '分类概率是连续数值，但任务仍是分类；最终类别与概率分数回答不同问题。'
    ])];
    lesson.time=Math.max(lesson.time||0,45);
    const sources=[
      {url:'https://scikit-learn.org/stable/modules/neural_networks_supervised.html',label:'scikit-learn：神经网络模型可用于分类与回归'},
      {url:'https://docs.pytorch.org/docs/stable/generated/torch.nn.CrossEntropyLoss.html',label:'PyTorch：CrossEntropyLoss 的输入与分类目标'},
      {url:'https://docs.pytorch.org/docs/stable/generated/torch.nn.SmoothL1Loss.html',label:'PyTorch：SmoothL1Loss 如何混合平滑与线性惩罚'},
      {url:'https://docs.pytorch.org/tutorials/intermediate/torchvision_tutorial.html',label:'PyTorch：检测模型同时处理类别、框与定位损失'},
      {url:'https://docs.ultralytics.com/platform/data/',label:'Ultralytics：分类、检测、分割、深度与关键点等任务类型'},
      {url:'https://openai.com/index/gpt-2-1-5b-release/',label:'OpenAI：自回归语言模型按序列预测 token'}
    ];
    lesson.sources=[...(lesson.sources||[]),...sources.filter(source=>!(lesson.sources||[]).some(existing=>existing.url===source.url))];
  }

  const sectionIndex=lesson.sections.findIndex(section=>section.title===sectionTitle);
  if(sectionIndex<0)return;

  function playgroundMarkup(){
    return '<section class="task-types-playground" data-task-types aria-labelledby="tt-title">'
      +'<div class="tt-heading"><div><span class="tt-eyebrow">INTERACTIVE · 任务答案实验室</span><h3 id="tt-title">同一张输入，换个问题，答案就变了</h3><p>切换任务，再拖动滑杆。观察模型要输出什么、应该用什么方式衡量偏差。</p></div><span class="tt-stamp">先看目标，再选损失</span></div>'
      +'<div class="tt-tabs" role="tablist" aria-label="选择预测任务">'
      +'<button type="button" role="tab" aria-selected="true" aria-controls="tt-panel-classification" data-tt-mode="classification">① 选类别</button>'
      +'<button type="button" role="tab" aria-selected="false" aria-controls="tt-panel-regression" data-tt-mode="regression">② 估数值</button>'
      +'<button type="button" role="tab" aria-selected="false" aria-controls="tt-panel-detection" data-tt-mode="detection">③ 找物体并定位</button></div>'
      +'<div class="tt-panel" role="tabpanel" id="tt-panel-classification" data-tt-panel="classification">'
      +'<div class="tt-demo-grid"><figure class="tt-visual-card"><div class="tt-card-label"><strong>输入</strong><span>一张图片</span></div><svg viewBox="0 0 360 190" role="img" aria-label="猫咪图像示意"><defs><linearGradient id="tt-cat-bg" x1="0" x2="1" y1="0" y2="1"><stop stop-color="#f1edff"/><stop offset="1" stop-color="#e7f2ff"/></linearGradient></defs><rect width="360" height="190" rx="16" fill="url(#tt-cat-bg)"/><circle cx="180" cy="103" r="56" fill="#f6c98c"/><path d="M137 67 126 28 160 51M223 67l11-39-34 23" fill="#f6c98c" stroke="#d39c57" stroke-width="4" stroke-linejoin="round"/><path d="M151 97q10-12 20 0m18 0q10-12 20 0" fill="none" stroke="#45354c" stroke-width="5" stroke-linecap="round"/><path d="m173 115 7 6 7-6" fill="#e68a96"/><path d="M180 121q-14 16-26 4m26-4q14 16 26 4" fill="none" stroke="#80545a" stroke-width="3" stroke-linecap="round"/><path d="M126 111 83 104m44 17-46 5m153-15 43-7m-43 17 46 8" stroke="#9b754d" stroke-width="2" stroke-linecap="round"/><rect x="22" y="20" width="100" height="28" rx="14" fill="#fff"/><text x="72" y="39" text-anchor="middle" font-size="13" fill="#66589b">图片分类</text><text x="180" y="177" text-anchor="middle" font-size="13" fill="#706987">真实答案：猫</text></svg><figcaption>分类：从猫、狗等有限标签里选答案。</figcaption></figure>'
      +'<div class="tt-result-card"><div class="tt-card-label"><strong>模型输出</strong><span>类别概率</span></div><div class="tt-prob-row"><span>猫</span><div class="tt-bar"><i data-tt-cat-bar></i></div><strong data-tt-cat-p>72%</strong></div><div class="tt-prob-row"><span>狗</span><div class="tt-bar tt-bar-blue"><i data-tt-dog-bar></i></div><strong data-tt-dog-p>28%</strong></div><label class="tt-slider-label">模型给“猫”的概率 <output data-tt-cat-output>72%</output><input type="range" min="1" max="99" value="72" data-tt-confidence aria-label="模型给猫的概率"></label><div class="tt-score-row"><span>预测类别</span><strong data-tt-class-name>猫</strong><span>单样本交叉熵</span><strong data-tt-class-loss>0.329</strong></div><p class="tt-dynamic-note" data-tt-class-note role="status" aria-live="polite">类别选对；损失仍会随着概率变化。</p></div></div>'
      +'<p class="tt-insight"><b>看这里：</b>把“猫”的概率从 72% 调到 60%，预测类别仍是猫，但交叉熵会变大。准确率只看最终类别是否正确；交叉熵还能反映模型对正确答案有多确信。</p>'
      +'</div>'
      +'<div class="tt-panel" role="tabpanel" id="tt-panel-regression" data-tt-panel="regression" hidden>'
      +'<div class="tt-demo-grid"><figure class="tt-visual-card"><div class="tt-card-label"><strong>输入</strong><span>房间面积、地段等特征</span></div><svg viewBox="0 0 360 190" role="img" aria-label="房价连续数值预测示意"><rect width="360" height="190" rx="16" fill="#f4f0ff"/><path d="M104 88 180 34l76 54v63h-152z" fill="#d6c9f2"/><path d="M93 90 180 25l87 65" fill="none" stroke="#917dc5" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/><rect x="162" y="101" width="36" height="50" rx="4" fill="#fff"/><rect x="124" y="100" width="24" height="24" rx="4" fill="#fff"/><rect x="212" y="100" width="24" height="24" rx="4" fill="#fff"/><text x="180" y="174" text-anchor="middle" font-size="13" fill="#706987">真实房价：300 万元</text><line x1="28" y1="63" x2="332" y2="63" stroke="#c8bfdc" stroke-width="3" stroke-linecap="round"/><circle data-tt-reg-target cx="180" cy="63" r="9" fill="#2f967b" stroke="white" stroke-width="3"/><circle data-tt-reg-pred cx="149" cy="63" r="9" fill="#8069c7" stroke="white" stroke-width="3"/><text x="28" y="48" font-size="11" fill="#786d91">100 万</text><text x="332" y="48" text-anchor="end" font-size="11" fill="#786d91">500 万</text></svg><figcaption>回归：输出能连续变化的数量，不是从固定类别中选一项。</figcaption></figure>'
      +'<div class="tt-result-card"><div class="tt-card-label"><strong>模型输出</strong><span>一个连续数值</span></div><div class="tt-number-result"><span>预测房价</span><strong data-tt-reg-pred-label>260</strong><small>万元</small></div><label class="tt-slider-label">拖动预测值 <output data-tt-reg-output>260 万元</output><input type="range" min="100" max="500" step="10" value="260" data-tt-regression aria-label="预测房价，单位万元"></label><div class="tt-score-row"><span>绝对误差 / MAE</span><strong data-tt-reg-mae>40 万元</strong><span>单样本平方误差</span><strong data-tt-reg-mse>1600 万元²</strong></div><p class="tt-dynamic-note" data-tt-reg-note role="status" aria-live="polite">误差为 −40 万元；MSE 会把偏大的误差放大。</p></div></div>'
      +'<p class="tt-insight"><b>看这里：</b>同一个真实值，预测偏差越大，MAE 线性增加；MSE 会平方误差，因此对较大的偏差惩罚更重。训练时常对多个样本求平均。</p>'
      +'</div>'
      +'<div class="tt-panel" role="tabpanel" id="tt-panel-detection" data-tt-panel="detection" hidden>'
      +'<div class="tt-demo-grid"><figure class="tt-visual-card"><div class="tt-card-label"><strong>输入</strong><span>街景中的汽车</span></div><svg viewBox="0 0 360 190" role="img" aria-label="汽车目标检测真值框和预测框比较"><rect width="360" height="190" rx="16" fill="#edf5f2"/><path d="M0 123h360v67H0z" fill="#d4dce0"/><path d="M0 145h360" stroke="#fff" stroke-width="4" stroke-dasharray="18 13"/><rect x="39" y="34" width="53" height="81" fill="#d9e5df"/><rect x="278" y="25" width="45" height="90" fill="#d7e4df"/><rect x="141" y="94" width="106" height="45" rx="14" fill="#78a7a2"/><path d="M157 94 173 75h45l19 19" fill="#79aaa6"/><circle cx="164" cy="141" r="10" fill="#415d62"/><circle cx="224" cy="141" r="10" fill="#415d62"/><rect x="130" y="70" width="130" height="85" rx="3" fill="none" stroke="#2f967b" stroke-width="3"/><rect data-tt-pred-box x="154" y="70" width="130" height="85" rx="3" fill="#8069c7" fill-opacity=".08" stroke="#8069c7" stroke-width="3" stroke-dasharray="7 5"/><rect x="134" y="50" width="77" height="17" rx="8" fill="#2f967b"/><text x="172" y="62" text-anchor="middle" font-size="10" fill="white">真实框</text><rect data-tt-pred-tag x="154" y="158" width="96" height="17" rx="8" fill="#8069c7"/><text data-tt-pred-text x="202" y="170" text-anchor="middle" font-size="10" fill="white">预测框 · 汽车</text></svg><div class="tt-legend"><span><i class="tt-dot-green"></i>真实框</span><span><i class="tt-dot-purple"></i>预测框</span></div><figcaption>类别答“是什么”，框坐标答“在哪里”。</figcaption></figure>'
      +'<div class="tt-result-card"><div class="tt-card-label"><strong>两个输出一起看</strong><span>目标检测是组合任务</span></div><div class="tt-detect-chip"><span>是什么？</span><strong>汽车 · 0.91</strong><small>类别判断</small></div><label class="tt-slider-label">预测框横向偏移 <output data-tt-shift-output>24 px</output><input type="range" min="0" max="100" step="4" value="24" data-tt-box-shift aria-label="预测框横向偏移量"></label><div class="tt-iou-readout"><span>位置重合程度 IoU</span><strong data-tt-iou>0.69</strong></div><p class="tt-dynamic-note" data-tt-detect-note role="status" aria-live="polite">框移动得越远，重叠面积通常越小，定位评价也会改变。</p></div></div>'
      +'<p class="tt-insight"><b>模型边界：</b>示意中的类别概率与 IoU 是两种不同信息。实际检测模型通常组合类别 / 物体性和定位相关的训练目标；具体输出、损失权重和 IoU 变体会因模型而异，不能把这张图当成 YOLOv5 的完整损失公式。</p>'
      +'</div>'
      +'<div class="tt-scope-grid"><article><span class="tt-scope-mark">01</span><div><strong>数值概率，不等于回归</strong><p>分类器可以输出 0.72 这样的概率。它表示对离散类别的把握；任务仍由目标标签决定。</p></div></article><article><span class="tt-scope-mark">02</span><div><strong>类别 / 回归只是入门地图</strong><p>分组、排序、生成、强化学习等问题需要按实际目标描述。GPT 的逐 token 预测带有类别概率形式，整体用途仍是生成序列。</p></div></article></div>'
      +'<div class="tt-check" data-tt-check><div><span class="tt-eyebrow">QUICK CHECK · 想一想</span><h4>巡检系统要判断每个人“是否戴安全帽”，并画出每个人的位置框。它在做什么？</h4></div><div class="tt-check-options"><button type="button" data-tt-answer="0">整张图只输出一个类别</button><button type="button" data-tt-answer="1">组合类别判断和边界框回归</button><button type="button" data-tt-answer="2">只预测一个连续温度值</button></div><p class="tt-check-feedback" data-tt-feedback role="status" aria-live="polite">先想想：系统要给出几种不同的信息？</p></div>'
      +'<p class="tt-footnote">图中的类别概率、房价与框坐标都是教学数值，帮助理解目标输出，不是训练模型的真实结果。分类训练常见交叉熵；回归可按误差分布、离群点和业务代价选择 MAE、MSE 或 Huber / Smooth L1 等目标。</p>'
      +'</section>';
  }

  function updateClassification(root){
    const value=Number(root.querySelector('[data-tt-confidence]').value)/100;
    const dog=1-value;
    const isCorrect=value>=0.5;
    root.querySelector('[data-tt-cat-output]').textContent=Math.round(value*100)+'%';
    root.querySelector('[data-tt-cat-p]').textContent=Math.round(value*100)+'%';
    root.querySelector('[data-tt-dog-p]').textContent=Math.round(dog*100)+'%';
    root.querySelector('[data-tt-cat-bar]').style.width=(value*100)+'%';
    root.querySelector('[data-tt-dog-bar]').style.width=(dog*100)+'%';
    root.querySelector('[data-tt-class-name]').textContent=isCorrect?'猫':'狗';
    root.querySelector('[data-tt-class-loss]').textContent=(-Math.log(value)).toFixed(3);
    root.querySelector('[data-tt-class-note]').textContent=isCorrect?'类别选对；损失仍会随着概率变化。':'模型把狗排在前面了；真实答案是猫，交叉熵会变大。';
  }

  function updateRegression(root){
    const predicted=Number(root.querySelector('[data-tt-regression]').value);
    const target=300;
    const error=predicted-target;
    const absolute=Math.abs(error);
    const x=28+(predicted-100)/400*304;
    const circle=root.querySelector('[data-tt-reg-pred]');
    circle.setAttribute('cx',x.toFixed(1));
    root.querySelector('[data-tt-reg-pred-label]').textContent=String(predicted);
    root.querySelector('[data-tt-reg-output]').textContent=predicted+' 万元';
    root.querySelector('[data-tt-reg-mae]').textContent=absolute+' 万元';
    root.querySelector('[data-tt-reg-mse]').textContent=(absolute*absolute)+' 万元²';
    root.querySelector('[data-tt-reg-note]').textContent='误差为 '+(error>0?'+':'')+error+' 万元；MSE 会把偏大的误差放大。';
  }

  function updateDetection(root){
    const shift=Number(root.querySelector('[data-tt-box-shift]').value);
    const width=130,height=85;
    const intersection=Math.max(0,width-shift)*height;
    const union=2*width*height-intersection;
    const iou=union?intersection/union:0;
    root.querySelector('[data-tt-pred-box]').setAttribute('x',String(130+shift));
    const tagX=Math.min(360-96,98+shift);
    root.querySelector('[data-tt-pred-tag]').setAttribute('x',String(tagX));
    root.querySelector('[data-tt-pred-text]').setAttribute('x',String(tagX+48));
    root.querySelector('[data-tt-shift-output]').textContent=shift+' px';
    root.querySelector('[data-tt-iou]').textContent=iou.toFixed(2);
    root.querySelector('[data-tt-detect-note]').textContent=shift===0?'两个框重合，IoU 为 1；类别分数仍是另一项信息。':'框移动得越远，重叠面积通常越小，定位评价也会改变。';
  }

  function setMode(root,mode){
    root.querySelectorAll('[data-tt-mode]').forEach(button=>button.setAttribute('aria-selected',String(button.dataset.ttMode===mode)));
    root.querySelectorAll('[data-tt-panel]').forEach(panel=>{panel.hidden=panel.dataset.ttPanel!==mode});
  }

  const previous=window.lessonPlaygrounds||{};
  window.lessonPlaygrounds={
    render(id,index){return id==='losses'&&index===sectionIndex?playgroundMarkup():(previous.render?.(id,index)||'')},
    initialize(){
      previous.initialize?.();
      document.querySelectorAll('[data-task-types]').forEach(root=>{updateClassification(root);updateRegression(root);updateDetection(root)});
    }
  };
  document.addEventListener('click',event=>{
    const button=event.target.closest('button');
    if(!button)return;
    const root=button.closest('[data-task-types]');
    if(!root)return;
    if(button.dataset.ttMode){setMode(root,button.dataset.ttMode);return}
    if(button.dataset.ttAnswer!==undefined){
      const feedback=root.querySelector('[data-tt-feedback]');
      feedback.textContent=button.dataset.ttAnswer==='1'
        ?'答对了。检测既要给出每个人的类别，也要定位边界框；输出里包含离散类别与连续坐标。'
        :'再看一眼目标：题目同时要回答“是什么”和“在哪里”，需要类别与位置两类输出。';
      root.querySelectorAll('[data-tt-answer]').forEach(option=>option.classList.toggle('is-selected',option===button));
    }
  });
  document.addEventListener('input',event=>{
    const root=event.target.closest('[data-task-types]');
    if(!root)return;
    if(event.target.matches('[data-tt-confidence]'))updateClassification(root);
    else if(event.target.matches('[data-tt-regression]'))updateRegression(root);
    else if(event.target.matches('[data-tt-box-shift]'))updateDetection(root);
  });
})();
