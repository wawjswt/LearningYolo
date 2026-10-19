/* LeNet-5: historical architecture, tensor shapes, and faithful-vs-modern comparison. */
(()=>{
  const lesson=lessons.find(item=>item.id==='cnn');
  if(!lesson)return;

  lesson.goals.push(
    '沿着 LeNet-5 的层次追踪手写数字张量尺寸，并解释每次变化。',
    '区分 1998 年原始结构与常见的现代教学简化版。',
    '把卷积网络的历史位置、监督训练流程和技术局限放回时代背景理解。'
  );
  lesson.sections.push({title:'14. LeNet-5：从像素到手写数字',paragraphs:[
    'LeNet-5 是理解经典卷积网络的一扇窗口：局部卷积在不同位置复用同一组参数，逐层组合笔画与形状，再把整幅图的信息用于数字分类。它展示了从手工设计图像特征，到用带标签样本和梯度训练特征提取器的重要转变。',
    '经典结构使用 32×32 灰度输入：C1 得到 6 张 28×28 特征图，S2 缩到 14×14；C3 得到 16 张 10×10 特征图，S4 缩到 5×5；C5 输出 120 个 1×1 特征，之后接 F6 的 84 个单元和 10 个类别输出。点选下方各层，逐站查看它做了什么。',
    '常见 MNIST 图像是 28×28，经典 LeNet-5 则按 32×32 输入设计。教学图用每边补 2 个像素的方式演示如何放进 32×32 画布；原论文也描述了尺寸归一化、居中及扩展到更大画布的数据处理。实际复现时，图像极性、缩放和居中方式也要与训练设定一致。',
    '“原始 LeNet-5”和今天的“LeNet 教学实现”不是完全相同的网络。原始 S2/S4 是带可训练缩放和偏置的子采样层，使用缩放版 tanh；C3 只接收部分 S2 特征图；输出采用 RBF 单元。现代示例常用固定平均池化、ReLU、全连接层和 Softmax/交叉熵。简化版更适合入门，但要记住它是变体。',
    '训练时，图像和数字标签一起进入网络；前向传播产生输出，损失度量预测与标签的差距，反向传播计算梯度，优化器据此更新卷积核和连接权重。原论文使用与 RBF 输出相配的目标和损失设定；现代分类代码常用 CrossEntropyLoss 处理 logits。'
  ]});
  lesson.keypoints.push(
    '经典 LeNet-5 的空间尺寸链为 32→28→14→10→5→1；通道/单元数依次为 1→6→6→16→16→120。',
    'C3 的 16 张特征图只连接到 S2 中选定的若干张图，这是原始结构中的部分连接。',
    '原始 S2/S4 子采样含可训练参数，激活是缩放版 tanh；原始输出层是 RBF，不是 Softmax。',
    'MNIST 常见图片为 28×28；输入经典 32×32 LeNet-5 前，要明确扩边、居中和像素归一化。',
    'LeNet-5 是经典早期实用卷积网络之一，不是历史上第一个视觉卷积网络；网络浅、CPU 训练慢等评价需结合时代背景。'
  );
  const newSources=[
    {url:'https://leon.bottou.org/papers/lecun-98h',label:'LeCun、Bottou、Bengio 与 Haffner：Gradient-Based Learning Applied to Document Recognition（1998）'},
    {url:'https://doi.org/10.1007/BF00344251',label:'Kunihiko Fukushima：Neocognitron（1980），卷积视觉网络的重要先驱'},
    {url:'https://doi.org/10.1162/neco.1989.1.4.541',label:'LeCun 等：Backpropagation Applied to Handwritten Zip Code Recognition（1989）'}
  ];
  lesson.sources=[...(lesson.sources||[]),...newSources.filter(source=>!(lesson.sources||[]).some(existing=>existing.url===source.url))];

  const stages=[
    {label:'输入',name:'一张灰度数字图',copy:'LeNet-5 按单通道 32×32 图像设计。28×28 的 MNIST 示意图需要先扩边并保持训练时的居中、归一化约定。'},
    {label:'C1 卷积',name:'6 个局部滤镜开始找笔画',copy:'每个 5×5 卷积核在整张图上滑动并复用同一组权重；无填充、步幅 1 时，高和宽各缩小 4 格，6 个核会产生 6 张特征图。'},
    {label:'S2 子采样',name:'压缩网格，保留主要响应',copy:'每张图用 2×2 区域、步幅 2 做子采样，空间边长按整数规则缩小，通道数仍为 6。原始 S2 的缩放系数与偏置可学习，所以不是固定平均池化。'},
    {label:'C3 卷积',name:'组合更丰富的局部形状',copy:'16 张输出特征图各用 5×5 局部窗口；无填充、步幅 1 时，空间边长各缩小 4 格。原始 C3 采用部分连接：每张输出图只读取选定的 S2 特征图。'},
    {label:'S4 子采样',name:'再次缩小空间网格',copy:'第二个子采样层用 2×2 区域、步幅 2 缩小 16 张特征图的空间网格。原始 S4 与 S2 一样带有可学习的缩放与偏置。'},
    {label:'C5 卷积',name:'把整张小特征图汇成高层表征',copy:'120 个 5×5 卷积核分别覆盖全部 16 张 S4 特征图；经典结构的每个核输出一个 1×1 单元。论文把它称为卷积层；在固定输入尺寸下，它的连接效果类似全连接。'},
    {label:'F6 全连接',name:'整合高层特征',copy:'84 个单元分别读取 C5 的 120 个值，并使用缩放版 tanh。它把前面抽取到的局部信息组合起来。'},
    {label:'类别输出',name:'比较十个数字类别',copy:'原始 LeNet-5 使用 10 个 RBF 输出单元，每类一个，输出表示与类别目标编码的距离/惩罚，不是 Softmax 概率。现代实现常换成 10 个线性 logits。'}
  ];
  const timeline=[
    {year:'1980',title:'Neocognitron',copy:'Fukushima 提出的分层视觉识别网络，是后来卷积网络的重要先驱。它的训练思想和现代反向传播 CNN 不完全相同。'},
    {year:'1989',title:'手写邮编识别',copy:'LeCun 等展示用反向传播训练网络识别美国邮政手写邮政编码，早于 1998 年的 LeNet-5 论文。'},
    {year:'1998',title:'LeNet-5',copy:'系统阐述梯度学习用于文档识别，并评估 LeNet-5 等模型；论文报告了 60,000 个训练样本和 10,000 个测试样本的 MNIST。'},
    {year:'今天',title:'结构继续演进',copy:'现代 CNN 会按任务选择残差连接、多尺度特征、归一化或检测头；LeNet-5 是理解局部连接、权重共享和层次表征的经典起点。'}
  ];
  const quiz=[
    {question:'“LeNet-5 是历史上第一个卷积视觉网络。”',answer:'false',why:'不准确。1980 年的 Neocognitron 等工作更早；LeNet-5 是影响深远的早期实用卷积网络之一。'},
    {question:'“原始 S2/S4 就是没有可学习参数的固定平均池化。”',answer:'false',why:'不准确。原始子采样对 2×2 输入求和后，还乘以可训练系数、加可训练偏置并经过非线性。'},
    {question:'“32×32 输入经过 5×5、步幅 1、无填充的 C1 后，变成 6×28×28。”',answer:'true',why:'正确。每个方向缩小 5−1=4 个像素，因此边长为 32−4=28；6 个卷积核产生 6 张特征图。'},
    {question:'“经典 LeNet-5 的输出层可直接当作现代 Softmax 概率。”',answer:'false',why:'不准确。原始输出为 RBF 类单元；现代实现常替换成线性 logits，推理时再用 Softmax。'}
  ];
  const previous=window.lessonPlaygrounds||{};
  const esc=value=>String(value).replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  function dimensions(pad){
    const input=28+2*pad,c1=input-4,s2=Math.floor(c1/2),c3=s2-4,s4=Math.floor(c3/2),c5=s4-4;
    return {input,c1,s2,c3,s4,c5,valid:c5>=1};
  }
  function shapeText(index,d){
    const values=['1×'+d.input+'×'+d.input,'6×'+d.c1+'×'+d.c1,'6×'+d.s2+'×'+d.s2,'16×'+d.c3+'×'+d.c3,'16×'+d.s4+'×'+d.s4,d.valid?'120×'+d.c5+'×'+d.c5:'尺寸不成立',d.valid?'84':'不可达',d.valid?'10 类':'不可达'];
    return values[index];
  }
  function diagramMarkup(){
    return '<div class="lenet-diagram-scroll"><svg class="lenet-diagram" viewBox="0 0 1030 166" role="img" aria-labelledby="lenet-diagram-title lenet-diagram-desc"><title id="lenet-diagram-title">LeNet-5 从灰度图到十类输出的结构图</title><desc id="lenet-diagram-desc">图像依次经过 C1 卷积、S2 子采样、C3 卷积、S4 子采样、C5 卷积、F6 全连接，最后得到十类输出。</desc><defs><marker id="lenet-arrowhead" markerWidth="7" markerHeight="7" refX="5.5" refY="3.5" orient="auto"><path d="M0 0 7 3.5 0 7Z" fill="#8d849d"/></marker></defs><g class="lenet-svg-lines" aria-hidden="true"><path d="M91 78H130M204 78H238M306 78H344M412 78H447M511 78H545M608 78H648M720 78H760M817 78H854" marker-end="url(#lenet-arrowhead)"/></g><g class="lenet-svg-stage is-active" data-lenet-svg-stage="0"><rect class="lenet-svg-input" x="23" y="40" width="68" height="76" rx="4"/><path d="M39 99 48 59l8 25 8-22 10 37" fill="none" stroke="#76659f" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><text x="57" y="132">灰度图</text><text data-lenet-svg-shape="0" x="57" y="149">1×32×32</text></g><g class="lenet-svg-stage" data-lenet-svg-stage="1"><rect x="143" y="50" width="52" height="52" rx="3"/><rect x="151" y="43" width="52" height="52" rx="3"/><rect x="159" y="36" width="52" height="52" rx="3"/><path d="M168 49v32m10-32v32m10-32v32m-22-22h32m-32 11h32"/><text x="177" y="132">C1</text><text data-lenet-svg-shape="1" x="177" y="149">6×28×28</text></g><g class="lenet-svg-stage" data-lenet-svg-stage="2"><rect x="247" y="55" width="42" height="42" rx="3"/><rect x="254" y="48" width="42" height="42" rx="3"/><rect x="261" y="41" width="42" height="42" rx="3"/><path d="M269 52v24m12-24v24m-12-12h24"/><text x="274" y="132">S2</text><text data-lenet-svg-shape="2" x="274" y="149">6×14×14</text></g><g class="lenet-svg-stage" data-lenet-svg-stage="3"><rect x="351" y="49" width="48" height="48" rx="3"/><rect x="359" y="42" width="48" height="48" rx="3"/><rect x="367" y="35" width="48" height="48" rx="3"/><path d="M376 48v30m10-30v30m-10-20h20m-20 10h20"/><text x="383" y="132">C3</text><text data-lenet-svg-shape="3" x="383" y="149">16×10×10</text></g><g class="lenet-svg-stage" data-lenet-svg-stage="4"><rect x="452" y="59" width="34" height="34" rx="3"/><rect x="459" y="52" width="34" height="34" rx="3"/><rect x="466" y="45" width="34" height="34" rx="3"/><path d="M474 54v18m9-18v18m-9-9h18"/><text x="476" y="132">S4</text><text data-lenet-svg-shape="4" x="476" y="149">16×5×5</text></g><g class="lenet-svg-stage" data-lenet-svg-stage="5"><rect x="551" y="56" width="30" height="30" rx="3"/><rect x="558" y="49" width="30" height="30" rx="3"/><rect x="565" y="42" width="30" height="30" rx="3"/><text x="573" y="132">C5</text><text data-lenet-svg-shape="5" x="573" y="149">120×1×1</text></g><g class="lenet-svg-stage" data-lenet-svg-stage="6"><circle cx="675" cy="52" r="5"/><circle cx="675" cy="68" r="5"/><circle cx="675" cy="84" r="5"/><circle cx="675" cy="100" r="5"/><circle cx="697" cy="59" r="5"/><circle cx="697" cy="76" r="5"/><circle cx="697" cy="93" r="5"/><path d="m680 52 12 7m-12 16h12m-12 16 12 9"/><text x="686" y="132">F6</text><text data-lenet-svg-shape="6" x="686" y="149">84 单元</text></g><g class="lenet-svg-stage" data-lenet-svg-stage="7"><circle cx="873" cy="48" r="5"/><circle cx="890" cy="48" r="5"/><circle cx="907" cy="48" r="5"/><circle cx="873" cy="68" r="5"/><circle cx="890" cy="68" r="5"/><circle cx="907" cy="68" r="5"/><circle cx="873" cy="88" r="5"/><circle cx="890" cy="88" r="5"/><circle cx="907" cy="88" r="5"/><circle cx="890" cy="108" r="5"/><text x="890" y="132">RBF 输出</text><text data-lenet-svg-shape="7" x="890" y="149">10 类</text></g></svg></div>';
  }
  function playgroundMarkup(){
    const stageButtons=stages.map((stage,index)=>'<button type="button" class="lenet-stage" data-lenet-stage="'+index+'" aria-pressed="'+String(index===0)+'"><b>'+esc(stage.label)+'</b><small data-lenet-stage-shape="'+index+'">'+esc(shapeText(index,dimensions(2)))+'</small></button>').join('<span class="lenet-stage-arrow" aria-hidden="true">›</span>');
    const timelineButtons=timeline.map((item,index)=>'<button type="button" class="lenet-era" data-lenet-era="'+index+'" aria-pressed="'+String(index===0)+'"><b>'+esc(item.year)+'</b><span>'+esc(item.title)+'</span></button>').join('');
    const quizCards=quiz.map((item,index)=>'<article class="lenet-quiz-card" data-lenet-quiz-card="'+index+'"><h4>'+esc(item.question)+'</h4><div class="lenet-quiz-options" role="group" aria-label="判断第 '+(index+1)+' 题"><button type="button" data-lenet-quiz-answer="true">正确</button><button type="button" data-lenet-quiz-answer="false">不正确</button></div><p class="lenet-quiz-feedback" data-lenet-quiz-feedback="'+index+'" aria-live="polite"></p></article>').join('');
    return '<section class="lesson-playground lenet-playground" data-lenet data-stage="0" data-variant="original" data-train-step="0" data-era="0" aria-labelledby="lenet-play-title">'+
      '<div class="lenet-heading"><span>INTERACTIVE · 经典网络剖面</span><h3 id="lenet-play-title">把一张 28×28 数字图送进 LeNet-5</h3><p>拖动边缘补值，观察每一层的网格怎样变化；再点选层名，读懂特征图背后的运算。</p></div>'+
      '<div class="lenet-pad-control"><label for="lenet-pad-slider">给 28×28 图像的每条边补 <output data-lenet-pad-value>2</output> 个像素</label><input id="lenet-pad-slider" type="range" min="0" max="3" step="1" value="2" data-lenet-pad aria-label="每条边增加的图像像素数"><p data-lenet-pad-note aria-live="polite">28 + 2×2 = 32，符合经典 LeNet-5 的输入边长。</p></div>'+
      diagramMarkup()+
      '<div class="lenet-stage-track" role="group" aria-label="选择 LeNet-5 中的一层">'+stageButtons+'</div>'+
      '<div class="lenet-stage-detail" aria-live="polite"><div><span data-lenet-stage-index>第 1 站 · 输入</span><h4 data-lenet-stage-title>一张灰度数字图</h4><code data-lenet-selected-shape>1×32×32</code></div><p data-lenet-stage-copy>'+esc(stages[0].copy)+'</p></div>'+
      '<p class="lenet-shape-note" data-lenet-shape-note>每个卷积使用 5×5、步幅 1、无填充；每个 S 层使用 2×2、步幅 2。缩小的是高和宽，C1/C3/C5 增加或重组的是特征图数量。</p>'+
      '<div class="lenet-variant"><div class="lenet-subhead"><div><span>原始结构与入门实现</span><h4>结构相似，细节有别</h4></div><div class="lenet-variant-tabs" role="group" aria-label="切换 LeNet-5 实现对比"><button type="button" data-lenet-variant-choice="original" aria-pressed="true">1998 原始设计</button><button type="button" data-lenet-variant-choice="modern" aria-pressed="false">现代教学简化版</button></div></div><div class="lenet-variant-panel" data-lenet-variant-panel aria-live="polite"></div></div>'+
      '<div class="lenet-training"><div class="lenet-subhead"><div><span>训练中的一轮学习</span><h4>从标签走到参数更新</h4></div><p>播放步骤，观察误差怎样传回滤镜。</p></div><div class="lenet-training-steps" role="group" aria-label="选择训练过程步骤"><button type="button" data-lenet-train-step="0" aria-pressed="true"><b>01</b><span>图像 + 标签</span></button><button type="button" data-lenet-train-step="1" aria-pressed="false"><b>02</b><span>前向计算</span></button><button type="button" data-lenet-train-step="2" aria-pressed="false"><b>03</b><span>计算损失</span></button><button type="button" data-lenet-train-step="3" aria-pressed="false"><b>04</b><span>反向更新</span></button><button type="button" class="lenet-train-play" data-lenet-train-play aria-pressed="false">▶ 播放过程</button></div><p class="lenet-training-copy" data-lenet-training-copy aria-live="polite">给图像配上正确的数字标签，网络才知道这次要辨认什么。</p></div>'+ 
      '<div class="lenet-history"><div class="lenet-subhead"><div><span>放回发展脉络</span><h4>LeNet-5 从哪里来</h4></div><p>它是重要里程碑，也是更早视觉网络之后的实践进展。</p></div><div class="lenet-era-track" role="group" aria-label="选择卷积网络发展节点">'+timelineButtons+'</div><p class="lenet-era-copy" data-lenet-era-copy aria-live="polite">'+esc(timeline[0].copy)+'</p></div>'+
      '<div class="lenet-quiz"><div class="lenet-subhead"><div><span>CHECK YOUR MODEL</span><h4>判断这些说法</h4></div><p>选完会看到解释。</p></div><div class="lenet-quiz-grid">'+quizCards+'</div></div>'+
      '</section>';
  }
  const variantCopy={
    original:'<ul><li><b>S2 / S4：</b>2×2 子采样带可训练缩放与偏置，再经过非线性。</li><li><b>激活：</b>缩放版 tanh；C3 是部分连接。</li><li><b>末端：</b>C5 为 120 个 1×1 特征，F6 为 84 个单元，输出为 10 个 RBF 类单元。</li></ul><p>这是论文中的经典结构。输出值不能直接读成总和为 1 的 Softmax 概率。</p>',
    modern:'<ul><li><b>常见教学改写：</b>Conv → ReLU → 固定 AvgPool，再接 Linear 分类头。</li><li><b>输出：</b>通常产生 10 个 logits；训练交叉熵直接接收 logits，推理展示时才可转成 Softmax 概率。</li><li><b>形状：</b>许多示例直接用 28×28 输入，因此各层尺寸与经典 32×32 结构不同。</li></ul><p>这类实现保留了局部卷积和逐层分类的主意，但不是对原始 LeNet-5 的逐层复刻。</p>'
  };
  const trainingCopy=[
    '给图像配上正确的数字标签，网络才知道这次要辨认什么。',
    '像素依次经过卷积、子采样和分类层；每一步都根据当前权重产生新的特征与输出。',
    '损失把模型输出和正确标签作比较。原始 RBF 输出与现代交叉熵分类头的具体损失设定并不相同。',
    '反向传播把损失梯度传回各层；优化器按梯度调整滤镜和连接权重，让下一轮输出更接近目标。'
  ];
  const trainTimers=new WeakMap();
  function stopTraining(root){
    const timer=trainTimers.get(root);
    if(timer){clearInterval(timer);trainTimers.delete(root)}
    root.dataset.trainPlaying='false';
    const play=root.querySelector('[data-lenet-train-play]');
    if(play){play.setAttribute('aria-pressed','false');play.textContent='▶ 播放过程'}
  }
  function updatePlayground(root){
    const pad=Number(root.querySelector('[data-lenet-pad]').value),d=dimensions(pad),selected=Math.max(0,Math.min(stages.length-1,Number(root.dataset.stage)||0));
    root.querySelector('[data-lenet-pad-value]').textContent=String(pad);
    root.querySelector('[data-lenet-pad-note]').textContent=pad===2?'28 + 2×2 = 32，符合经典 LeNet-5 的输入边长。':d.valid?'当前尺寸可通过 C5，但不同于经典 32×32 输入对应的尺寸链。':'当前网格在 C5 之前缩到 '+d.s4+'×'+d.s4+'，小于 5×5；经典 C5 无法在这张图上计算。请把每边补值调到至少 2。';
    root.querySelectorAll('[data-lenet-stage]').forEach(button=>{const index=Number(button.dataset.lenetStage);button.setAttribute('aria-pressed',String(index===selected));button.querySelector('[data-lenet-stage-shape]').textContent=shapeText(index,d)});
    root.querySelectorAll('[data-lenet-svg-shape]').forEach(label=>{label.textContent=shapeText(Number(label.dataset.lenetSvgShape),d)});
    root.querySelectorAll('[data-lenet-svg-stage]').forEach(group=>group.classList.toggle('is-active',Number(group.dataset.lenetSvgStage)===selected));
    root.querySelector('[data-lenet-stage-index]').textContent='第 '+(selected+1)+' 站 · '+stages[selected].label;
    root.querySelector('[data-lenet-stage-title]').textContent=stages[selected].name;
    root.querySelector('[data-lenet-selected-shape]').textContent=shapeText(selected,d);
    root.querySelector('[data-lenet-stage-copy]').textContent=(!d.valid&&selected>=5)?'当前边长无法进入这一层：5×5 的 C5 核大于 S4 的 '+d.s4+'×'+d.s4+' 特征图。补足输入边缘后再继续观察。':stages[selected].copy;
    root.querySelector('[data-lenet-shape-note]').textContent='每个卷积使用 5×5、步幅 1、无填充；每个 S 层使用 2×2、步幅 2。当前边长 '+d.input+' → '+d.c1+' → '+d.s2+' → '+d.c3+' → '+d.s4+' → '+(d.valid?d.c5:'无法计算 C5')+'。';
    root.querySelectorAll('[data-lenet-variant-choice]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.lenetVariantChoice===root.dataset.variant)));
    root.querySelector('[data-lenet-variant-panel]').innerHTML=variantCopy[root.dataset.variant]||variantCopy.original;
    const trainStep=Number(root.dataset.trainStep)||0;
    root.querySelectorAll('[data-lenet-train-step]').forEach(button=>button.setAttribute('aria-pressed',String(Number(button.dataset.lenetTrainStep)===trainStep)));
    root.querySelector('[data-lenet-training-copy]').textContent=trainingCopy[trainStep];
    const play=root.querySelector('[data-lenet-train-play]');
    if(play){const playing=root.dataset.trainPlaying==='true';play.setAttribute('aria-pressed',String(playing));play.textContent=playing?'Ⅱ 暂停演示':'▶ 播放过程'}
    const era=Number(root.dataset.era)||0;
    root.querySelectorAll('[data-lenet-era]').forEach(button=>button.setAttribute('aria-pressed',String(Number(button.dataset.lenetEra)===era)));
    root.querySelector('[data-lenet-era-copy]').textContent=timeline[era].copy;
  }
  window.lessonPlaygrounds={
    render(lessonId,sectionIndex){return lessonId==='cnn'&&sectionIndex===13?playgroundMarkup():(previous.render?.(lessonId,sectionIndex)||'')},
    initialize(){previous.initialize?.();document.querySelectorAll('[data-lenet]').forEach(updatePlayground)}
  };
  document.addEventListener('click',event=>{
    const root=event.target.closest('[data-lenet]');
    if(!root)return;
    const stage=event.target.closest('[data-lenet-stage]');
    if(stage){root.dataset.stage=stage.dataset.lenetStage;updatePlayground(root);return}
    const variant=event.target.closest('[data-lenet-variant-choice]');
    if(variant){root.dataset.variant=variant.dataset.lenetVariantChoice;updatePlayground(root);return}
    const train=event.target.closest('[data-lenet-train-step]');
    if(train){stopTraining(root);root.dataset.trainStep=train.dataset.lenetTrainStep;updatePlayground(root);return}
    const play=event.target.closest('[data-lenet-train-play]');
    if(play){
      if(root.dataset.trainPlaying==='true'){stopTraining(root);updatePlayground(root);return}
      root.dataset.trainPlaying='true';updatePlayground(root);
      const timer=setInterval(()=>{
        const next=Number(root.dataset.trainStep||0)+1;
        if(next>3){stopTraining(root);updatePlayground(root);return}
        root.dataset.trainStep=String(next);updatePlayground(root);
      },1350);
      trainTimers.set(root,timer);return
    }
    const era=event.target.closest('[data-lenet-era]');
    if(era){root.dataset.era=era.dataset.lenetEra;updatePlayground(root);return}
    const answer=event.target.closest('[data-lenet-quiz-answer]');
    if(answer){
      const card=answer.closest('[data-lenet-quiz-card]'),item=quiz[Number(card.dataset.lenetQuizCard)],correct=answer.dataset.lenetQuizAnswer===item.answer;
      card.querySelectorAll('[data-lenet-quiz-answer]').forEach(button=>{button.setAttribute('aria-pressed',String(button===answer));button.classList.toggle('is-correct',button===answer&&correct);button.classList.toggle('is-wrong',button===answer&&!correct)});
      card.querySelector('[data-lenet-quiz-feedback]').textContent=(correct?'判断正确。':'再看一下这个边界。')+item.why;
      return;
    }
  });
  document.addEventListener('input',event=>{
    if(event.target.matches('[data-lenet-pad]'))updatePlayground(event.target.closest('[data-lenet]'));
  });
})();
