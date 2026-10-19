/* AlexNet: architecture, landmark techniques, and the limits of the 2012 story. */
(()=>{
  const lesson=lessons.find(item=>item.id==='cnn');
  if(!lesson)return;

  lesson.goals.push(
    '沿着 AlexNet 的五个卷积层与三个全连接层，说明图像怎样变成 1000 类预测。',
    '用 ReLU、重叠最大池化、Dropout、双 GPU 和数据增强解释它如何扩大 CNN 的训练规模。',
    '正确阅读 ImageNet Top-5 错误率，并分清历史里程碑、已有方法与现代实现变体。'
  );
  lesson.sections.push({title:'15. AlexNet：让深度 CNN 走向规模化',paragraphs:[
    '2012 年，AlexNet 在 ImageNet 大规模视觉识别挑战赛中取得显著领先，成为深度学习发展史上的重要转折点。它不是深度学习或卷积网络的起点，而是把更深的 CNN、GPU 训练、较大数据集与一组成熟技巧组合起来，证明这条路线能在大规模图像分类中取得强劲效果。',
    '经典 AlexNet 有 5 个卷积层和 3 个全连接层，最后输出 1000 个类别分数。沿着结构看：卷积层逐层抽取视觉特征；池化压缩空间网格；两个 4096 单元的全连接隐藏层整合特征；最后一层给出 1000 类 logits，再经 Softmax 可解释成概率。点选下方结构节点，查看每一步。',
    'AlexNet 的代表性组合包括 ReLU 激活、3×3 且步幅为 2 的重叠最大池化、全连接隐藏层上的 Dropout、数据增强，以及把计算拆到两张 GTX 580 GPU 上。ReLU 和 Dropout 等想法早已出现；AlexNet 的历史贡献在于把它们与更深的网络和 ImageNet 规模训练有效结合。原论文还使用了局部响应归一化（LRN），虽然今天常见总结有时会略过它。',
    '比赛成绩要看指标口径：Top-5 错误率表示正确类别没有出现在模型分数最高的五个类别里。论文报告，未使用额外数据的五模型集成错误率为 16.4%；加入额外 ImageNet 2011 预训练数据的最佳集成为 15.3%，第二名约为 26.2%。因此 15.3% 和 26.2% 是不同参赛系统的 Top-5 成绩，不是 AlexNet 使用增强前后的对比。',
    '原始论文约有 6000 万个参数，其中大量参数集中在全连接层。常见 PyTorch 教学实现仍保留 AlexNet 的大体骨架，但通道数、填充、分类器细节与 2012 原版并不完全相同；复现时要注明采用哪一种实现。下方可以比较全连接参数规模、查看技巧如何工作，并用小测验检查理解。'
  ]});
  lesson.keypoints.push(
    '经典 AlexNet 由 5 个卷积层、3 个全连接层组成，最后对 ImageNet 的 1000 个类别输出分数；论文模型约 6000 万参数。',
    'ReLU 缓解 sigmoid/tanh 在饱和区梯度变小的问题，但负半轴梯度为零，不能说它彻底解决了梯度问题。',
    '重叠最大池化使用 3×3 窗口、步幅 2；窗口会重叠，但这并不意味着最大池化在所有网络中取代平均池化。',
    'Dropout 在训练时随机屏蔽全连接隐藏单元，推理时关闭随机屏蔽并使用相应缩放；原论文在前两个全连接隐藏层使用它。',
    '双 GPU 是当时受显存限制采用的工程方案；随机裁剪、翻转与颜色扰动扩充训练视角，但前提是变换仍保留正确标签。',
    'Top-5 错误率 15.3% 是使用额外预训练数据的五模型集成结果；仅用比赛提供训练数据的五模型集成结果为 16.4%。'
  );
  const sources=[
    {url:'https://courses.csail.mit.edu/6.803/pdf/2012%20hinton.pdf',label:'Krizhevsky、Sutskever、Hinton：ImageNet Classification with Deep Convolutional Neural Networks（NeurIPS 2012 原论文）'},
    {url:'https://www.image-net.org/challenges/LSVRC/2012/results.html',label:'ImageNet：ILSVRC 2012 官方结果'},
    {url:'https://icml.cc/2010/papers/432.pdf',label:'Nair 与 Hinton：Rectified Linear Units Improve Restricted Boltzmann Machines（ICML 2010）'},
    {url:'https://jmlr.org/papers/v15/srivastava14a.html',label:'Srivastava 等：Dropout: A Simple Way to Prevent Neural Networks from Overfitting（JMLR 2014）'},
    {url:'https://github.com/pytorch/vision/blob/main/torchvision/models/alexnet.py',label:'Torchvision：AlexNet 参考实现（常见现代实现示例）'}
  ];
  lesson.sources=[...(lesson.sources||[]),...sources.filter(source=>!(lesson.sources||[]).some(existing=>existing.url===source.url))];

  const stages=[
    {label:'输入',shape:'224×224×3 示意',title:'RGB 图像进入网络',copy:'训练图像会先缩放，再随机裁出 224×224 区域并随机翻转。网络读入红、绿、蓝三个颜色通道；预处理细节要与所用实现一致。',kind:'image'},
    {label:'Conv1',shape:'96 个 11×11 卷积核',title:'大步幅找出基础视觉模式',copy:'96 个卷积核以 11×11 感受野、步幅 4 扫过图像。ReLU 后接局部响应归一化与 3×3、步幅 2 的最大池化。原论文把这一层的计算分给两张 GPU。',kind:'conv'},
    {label:'Conv2',shape:'256 个 5×5 卷积核',title:'组合更丰富的局部纹理',copy:'第二个卷积层使用 256 个 5×5 卷积核，后接 ReLU、LRN 与重叠最大池化。原模型的通道连接受双 GPU 划分影响，不应把结构图理解成每层都完全全连接。',kind:'conv'},
    {label:'Conv3–5',shape:'384 → 384 → 256',title:'逐层组合高级视觉特征',copy:'三个 3×3 卷积层依次产生 384、384、256 个特征通道。Conv3 使用跨 GPU 特征连接，Conv4/Conv5 延续分组连接；Conv5 后再做一次最大池化。',kind:'conv'},
    {label:'FC1',shape:'4096 个隐藏单元',title:'汇总整幅图的特征',copy:'池化后的特征展平为向量，送入第一个 4096 单元全连接隐藏层。ReLU 产生非线性，训练时使用 Dropout 随机屏蔽部分单元。',kind:'dense'},
    {label:'FC2',shape:'4096 个隐藏单元',title:'进一步组合全局证据',copy:'第二个 4096 单元全连接层继续整合来自不同位置的高层特征，训练时同样使用 Dropout。这里的连接权重是 AlexNet 参数量的重要来源。',kind:'dense'},
    {label:'FC3',shape:'1000 个类别 logits',title:'给每个 ImageNet 类别打分',copy:'最后一个全连接层为 1000 个类别产生 logits。推理时可对 logits 做 Softmax 得到和为 1 的类别概率；训练时交叉熵通常直接接收 logits。',kind:'output'}
  ];
  const ideas=[
    {id:'relu',label:'ReLU',title:'让正向信号更直接地通过',copy:'ReLU(x)=max(0,x)。正半轴保留输入，负半轴置零；相比饱和的 sigmoid/tanh，它在正区间不容易出现越来越小的梯度。它仍可能有“死 ReLU”等问题。'},
    {id:'pool',label:'重叠池化',title:'窗口每次移动两格，覆盖范围更密',copy:'3×3 最大池化窗口以步幅 2 移动，相邻窗口会共享一行或一列。每个窗口只留下最大激活，空间尺寸会缩小；池化类型要按任务选择。'},
    {id:'dropout',label:'Dropout',title:'训练时随机让一部分神经元暂时休息',copy:'训练时随机屏蔽全连接隐藏单元，减少网络对某些单元组合的依赖。推理时不再随机丢弃，并使用训练时约定的缩放方式。它是正则化方法，不是永久删除节点。'},
    {id:'gpu',label:'双 GPU',title:'把特征通道切开并行计算',copy:'当时单张 GPU 显存有限，原论文将通道与计算分布在两张 GTX 580 GPU 上。部分卷积层跨设备通信，布局是工程取舍；今天硬件与软件不同，不代表两张 GPU 永远更快。'},
    {id:'augment',label:'数据增强',title:'从已有图片生成标签仍成立的训练视角',copy:'随机裁剪、水平翻转与颜色扰动增加训练输入的变化。增强能缓解过拟合，但变换必须对当前任务保持标签语义；例如方向具有类别含义时，翻转未必合理。'}
  ];
  const quiz=[
    {q:'2012 年的 AlexNet 是深度学习和 CNN 的起点。',a:'false',why:'不正确。更早已有深度学习与卷积网络研究；2012 年是大规模视觉识别中的重要里程碑。'},
    {q:'ReLU 让所有输入区间的梯度都保持非零。',a:'false',why:'不正确。ReLU 的负半轴输出与梯度都为 0；它缓解部分饱和问题，但不能消除所有优化困难。'},
    {q:'15.3% 与 26.2% 是 AlexNet 增强前后的错误率。',a:'false',why:'不正确。它们对应不同参赛系统的 Top-5 错误率；论文另报告未使用额外数据的 AlexNet 五模型集成为 16.4%。'},
    {q:'只要做数据增强，所有图像任务都可以水平翻转。',a:'false',why:'不正确。只有标签在该变换下仍然成立时，增强才可靠；文字识别、左右方向类别等任务需谨慎。'}
  ];
  const previous=window.lessonPlaygrounds||{};
  const esc=value=>String(value).replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));

  function layerShape(stage){
    const labels=['RGB','96×11²','256×5²','384/384/256×3²','4,096','4,096','1,000'];
    return labels[stage];
  }
  function featureStack(index){
    const count=[3,5,6,8,5,5,5][index];
    return '<span class="ax-stack ax-stack-'+(stages[index].kind||'conv')+'" aria-hidden="true">'+Array.from({length:count},(_,i)=>'<i style="--i:'+i+'"></i>').join('')+'</span>';
  }
  function architectureMarkup(){
    const buttons=stages.map((stage,index)=>'<button type="button" class="ax-stage" data-ax-stage="'+index+'" aria-pressed="'+String(index===0)+'"><span class="ax-stage-visual">'+featureStack(index)+'</span><b>'+esc(stage.label)+'</b><small>'+esc(layerShape(index))+'</small></button>').join('<span class="ax-connector" aria-hidden="true">›</span>');
    return '<div class="ax-architecture"><div class="ax-stage-track" role="group" aria-label="点选 AlexNet 网络层">'+buttons+'</div><div class="ax-stage-detail" aria-live="polite"><div><span data-ax-stage-kind>输入层</span><h4 data-ax-stage-title>'+esc(stages[0].title)+'</h4><code data-ax-stage-shape>'+esc(stages[0].shape)+'</code></div><p data-ax-stage-copy>'+esc(stages[0].copy)+'</p></div><p class="ax-caption">结构示意省略了部分 ReLU、LRN 与池化节点；不同实现的填充及空间尺寸可能不同。图示突出通道数与计算顺序，不代表逐像素尺寸图。</p></div>';
  }
  function ideasMarkup(){
    const tabs=ideas.map((idea,index)=>'<button type="button" data-ax-idea="'+idea.id+'" aria-pressed="'+String(index===0)+'">'+esc(idea.label)+'</button>').join('');
    const panels=ideas.map(idea=>'<section class="ax-idea-panel" data-ax-idea-panel="'+idea.id+'" '+(idea.id==='relu'?'':'hidden')+'><div class="ax-idea-copy"><span>关键技巧 · '+esc(idea.label)+'</span><h4>'+esc(idea.title)+'</h4><p>'+esc(idea.copy)+'</p></div>'+ideaDemo(idea.id)+'</section>').join('');
    return '<div class="ax-ideas"><div class="ax-idea-tabs" role="group" aria-label="选择一种 AlexNet 训练技巧">'+tabs+'</div>'+panels+'</div>';
  }
  function ideaDemo(id){
    if(id==='relu')return '<div class="ax-demo ax-relu-demo"><label for="ax-relu-input">输入 x <output data-ax-relu-value>1</output></label><input id="ax-relu-input" type="range" min="-4" max="4" step="0.5" value="1" data-ax-relu-input><svg viewBox="0 0 300 132" role="img" aria-label="ReLU 与 sigmoid 激活曲线"><path class="ax-axis" d="M20 110H284M20 110V12"/><path class="ax-sigmoid" d="M20 104C57 102 77 95 105 78S143 48 170 32 218 16 284 14"/><path class="ax-relu" d="M20 110H150L278 18"/><path class="ax-probe" data-ax-probe d="M183 12V110"/><circle class="ax-probe-dot" data-ax-probe-dot cx="183" cy="44" r="4"/><text x="282" y="126">x</text><text x="5" y="16">输出</text><text x="219" y="45">ReLU</text><text x="222" y="25">sigmoid</text></svg><p class="ax-demo-readout" data-ax-relu-readout aria-live="polite">ReLU(1) = 1；正区间梯度为 1。</p></div>';
    if(id==='pool')return '<div class="ax-demo ax-pool-demo"><div class="ax-control-line"><label for="ax-pool-position">移动 3×3 窗口</label><select id="ax-pool-position" data-ax-pool-position><option value="0">左上</option><option value="1">右上</option><option value="2">左下</option><option value="3">右下</option></select></div><div class="ax-pool-grid" data-ax-pool-grid aria-label="4乘4特征图和当前池化窗口"></div><p class="ax-demo-readout" data-ax-pool-readout aria-live="polite"></p></div>';
    if(id==='dropout')return '<div class="ax-demo ax-dropout-demo"><label for="ax-drop-rate">训练时丢弃比例 <output data-ax-drop-rate-out>50%</output></label><input id="ax-drop-rate" type="range" min="0" max="75" step="25" value="50" data-ax-drop-rate><div class="ax-node-map" data-ax-node-map aria-label="训练时随机屏蔽的示意神经元"></div><p class="ax-demo-readout" data-ax-drop-readout aria-live="polite"></p><small>固定示意掩码用于说明原理；真实 Dropout 会在训练步骤中随机采样。</small></div>';
    if(id==='gpu')return '<div class="ax-demo ax-gpu-demo"><div class="ax-gpu-switch" role="group" aria-label="切换特征通道的 GPU 分配"><button type="button" data-ax-gpu="2" aria-pressed="true">论文中的双 GPU</button><button type="button" data-ax-gpu="1" aria-pressed="false">单 GPU 示意</button></div><div class="ax-gpu-board" data-ax-gpu-board></div><p class="ax-demo-readout" data-ax-gpu-readout aria-live="polite"></p></div>';
    return '<div class="ax-demo ax-augment-demo" data-ax-augment-view="crop"><div class="ax-augment-controls" role="group" aria-label="选择图像增强方式"><button type="button" data-ax-augment="crop" aria-pressed="true">随机裁剪</button><button type="button" data-ax-augment="flip" aria-pressed="false">水平翻转</button><button type="button" data-ax-augment="color" aria-pressed="false">颜色扰动</button></div><div class="ax-scene-frame"><svg viewBox="0 0 180 100" role="img" aria-label="天空、道路和汽车组成的简化街景"><rect width="180" height="100" fill="#eaf1ed"/><circle cx="145" cy="19" r="10" fill="#e8cb88"/><path d="M0 61 50 35l41 26 31-21 58 24v36H0Z" fill="#c9d8d0"/><path d="M0 74h180v26H0Z" fill="#64747a"/><path d="M15 86h32m22 0h32m22 0h32" stroke="#f4e5b0" stroke-width="3" stroke-dasharray="15 9"/><g class="ax-car"><path d="M48 69h63l9 13H41Z" fill="#8b78b4"/><path d="m59 69 10-11h28l10 11Z" fill="#9c8cbc"/><circle cx="58" cy="83" r="6" fill="#354353"/><circle cx="103" cy="83" r="6" fill="#354353"/><rect x="72" y="61" width="17" height="7" rx="2" fill="#e8f0ee"/></g></svg></div><p class="ax-demo-readout" data-ax-augment-readout aria-live="polite">随机裁出不同区域，让同一辆车出现在画面不同位置；类别标签仍是“汽车”。</p></div>';
  }
  function playgroundMarkup(){
    const quizCards=quiz.map((item,index)=>'<article class="ax-quiz-card" data-ax-quiz-card="'+index+'"><h4>'+esc(item.q)+'</h4><div role="group" aria-label="判断第 '+(index+1)+' 题"><button type="button" data-ax-answer="true">正确</button><button type="button" data-ax-answer="false">不正确</button></div><p data-ax-feedback aria-live="polite"></p></article>').join('');
    return '<section class="lesson-playground alexnet-playground" data-alexnet data-ax-stage="0" data-ax-idea-active="relu" data-ax-gpu-layout="2" data-ax-aug-active="crop" aria-labelledby="ax-title">'+
      '<header class="ax-heading"><span>INTERACTIVE · 经典 CNN 档案</span><h3 id="ax-title">拆开 AlexNet：从像素到 1000 类</h3><p>沿着网络结构点选，接着动手试试激活、池化、Dropout、GPU 分工和数据增强。</p></header>'+ 
      '<section class="ax-panel"><div class="ax-subhead"><div><span>01 · NETWORK MAP</span><h4>五层卷积，三层全连接</h4></div><p>通道越往后，特征越抽象；空间网格逐步缩小。</p></div>'+architectureMarkup()+'</section>'+
      '<section class="ax-panel"><div class="ax-subhead"><div><span>02 · TRAINING IDEAS</span><h4>五种关键设计，五个小实验</h4></div><p>点选一种方法，直接观察它改变了什么。</p></div>'+ideasMarkup()+'</section>'+ 
      '<section class="ax-panel ax-results"><div class="ax-subhead"><div><span>03 · IMAGE NET 2012</span><h4>读懂比赛数字：Top-5 错误率</h4></div><p>数值越低，表示正确类别越常出现在前五名。</p></div><div class="ax-result-switch" role="group" aria-label="选择 AlexNet 的数据口径"><button type="button" data-ax-result="external" aria-pressed="true">使用额外预训练数据</button><button type="button" data-ax-result="provided" aria-pressed="false">仅用比赛训练数据</button></div><div class="ax-bars" data-ax-bars></div><p class="ax-result-note" data-ax-result-note aria-live="polite"></p></section>'+ 
      '<section class="ax-panel ax-parameters"><div class="ax-subhead"><div><span>04 · PARAMETER SCALE</span><h4>为什么全连接层这么“重”？</h4></div><p>点选全连接层，比较权重数量。</p></div><div class="ax-parameter-tabs" role="group" aria-label="选择一个全连接层"><button type="button" data-ax-param="fc1" aria-pressed="true">FC1</button><button type="button" data-ax-param="fc2" aria-pressed="false">FC2</button><button type="button" data-ax-param="fc3" aria-pressed="false">FC3</button></div><div class="ax-param-visual"><div class="ax-param-stack" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></div><div><span data-ax-param-label>FC1 · 9,216 → 4,096</span><strong data-ax-param-value></strong><div class="ax-param-bar"><i data-ax-param-bar></i></div><p data-ax-param-copy></p></div></div><p class="ax-caption">数量按经典论文结构的权重与偏置计算；由于分组连接、实现细节与统计口径差异，总参数常概括为约 6000 万。</p></section>'+ 
      '<section class="ax-panel ax-quiz"><div class="ax-subhead"><div><span>05 · CHECK YOUR MODEL</span><h4>判断四句话</h4></div><p>选择后查看解释。</p></div><div class="ax-quiz-grid">'+quizCards+'</div></section>'+ 
      '<p class="ax-footer-note">AlexNet 的价值在于一次成功的规模化实践。理解它时，既要记住有效组合，也要看见时代背景、指标口径与技术边界。</p></section>';
  }
  function updateStage(root){
    const index=Number(root.dataset.axStage)||0,stage=stages[index];
    root.querySelectorAll('[data-ax-stage]').forEach(button=>button.setAttribute('aria-pressed',String(Number(button.dataset.axStage)===index)));
    root.querySelector('[data-ax-stage-kind]').textContent=stage.kind==='image'?'图像输入':stage.kind==='dense'?'全连接层':stage.kind==='output'?'分类输出':'卷积特征';
    root.querySelector('[data-ax-stage-title]').textContent=stage.title;
    root.querySelector('[data-ax-stage-shape]').textContent=stage.shape;
    root.querySelector('[data-ax-stage-copy]').textContent=stage.copy;
  }
  const poolValues=[[1,3,2,0],[4,6,5,1],[2,8,7,3],[0,4,2,9]];
  function updatePool(root){
    const position=Number(root.querySelector('[data-ax-pool-position]').value),x=position%2,y=Math.floor(position/2),values=[];
    let maximum=-Infinity;
    for(let row=y;row<y+3;row++)for(let col=x;col<x+3;col++){values.push(poolValues[row][col]);maximum=Math.max(maximum,poolValues[row][col])}
    root.querySelector('[data-ax-pool-grid]').innerHTML=poolValues.flatMap((line,row)=>line.map((value,col)=>'<span class="'+(row>=y&&row<y+3&&col>=x&&col<x+3?'is-window ':'')+(value===maximum&&row>=y&&row<y+3&&col>=x&&col<x+3?'is-max':'')+'">'+value+'</span>')).join('');
    root.querySelector('[data-ax-pool-readout]').textContent='当前 3×3 窗口的最大值是 '+maximum+'。窗口移动 1 格时会与上一窗口共享大部分输入，体现 stride 2 的重叠。';
  }
  function updateDropout(root){
    const rate=Number(root.querySelector('[data-ax-drop-rate]').value),count=24,dropped=Math.round(count*rate/100),mask=[2,5,7,11,14,18,21,23,0,9,16,20,4,13,19,6,22,10];
    root.querySelector('[data-ax-drop-rate-out]').textContent=rate+'%';
    root.querySelector('[data-ax-node-map]').innerHTML=Array.from({length:count},(_,i)=>'<i class="'+(mask.slice(0,dropped).includes(i)?'is-dropped':'')+'" aria-hidden="true"></i>').join('');
    root.querySelector('[data-ax-drop-readout]').textContent='本轮示意屏蔽 '+dropped+' / '+count+' 个单元；它们只在训练的这次前向计算中暂时置零。';
  }
  function updateGpu(root){
    const dual=root.dataset.axGpuLayout==='2',count=16;
    root.querySelectorAll('[data-ax-gpu]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.axGpu===root.dataset.axGpuLayout)));
    root.querySelector('[data-ax-gpu-board]').innerHTML=(dual?'<div><b>GPU 1</b><small>部分特征通道</small></div><div><b>GPU 2</b><small>部分特征通道</small></div>':'<div><b>GPU 1</b><small>全部示意通道</small></div>')+'<div class="ax-channel-map">'+Array.from({length:count},(_,i)=>'<i class="'+(dual?(i<8?'gpu-a':'gpu-b'):'gpu-one')+'" aria-hidden="true"></i>').join('')+'</div>';
    root.querySelector('[data-ax-gpu-readout]').textContent=dual?'示意图把通道分成两组；原论文的不同卷积层连接方式并不完全相同，且存在跨 GPU 通信。':'单卡示意把通道放在同一设备上。现代显存、并行库与模型规模不同，工程选择也会变化。';
  }
  const resultData={external:{alex:15.3,label:'五模型集成 · 额外预训练',detail:'原论文最佳集成使用额外的 ImageNet 2011 数据预训练；这不是仅凭比赛训练集得到的成绩。'},provided:{alex:16.4,label:'五模型集成 · 比赛训练数据',detail:'原论文报告未使用额外数据的五模型集成结果为 16.4%。论文还讨论单模型成绩，口径不要混在一起。'}};
  function updateResults(root){
    const mode=root.querySelector('[data-ax-result][aria-pressed="true"]').dataset.axResult,data=resultData[mode],values=[{label:data.label,value:data.alex,focus:true},{label:'第二名参赛系统',value:26.2,focus:false}];
    root.querySelector('[data-ax-bars]').innerHTML=values.map(item=>'<div class="ax-bar-row"><div><span>'+esc(item.label)+'</span><strong>'+item.value.toFixed(1)+'%</strong></div><div class="ax-bar-track"><i class="'+(item.focus?'is-alex':'')+'" style="width:'+(item.value/30*100)+'%"></i></div></div>').join('');
    root.querySelector('[data-ax-result-note]').textContent=data.detail+' 对比口径：ImageNet 2012 Top-5 测试错误率；两条柱比较的是不同参赛系统。';
  }
  const parameterData={
    fc1:{label:'FC1 · 9,216 → 4,096',value:37752832,copy:'9,216×4,096 个连接权重，加 4,096 个偏置。仅这一层约 3775 万个参数。'},
    fc2:{label:'FC2 · 4,096 → 4,096',value:16781312,copy:'4,096×4,096 个连接权重，加 4,096 个偏置。两个宽大的隐藏层是模型参数多的重要原因。'},
    fc3:{label:'FC3 · 4,096 → 1,000',value:4097000,copy:'4,096×1,000 个连接权重，加 1,000 个偏置。输出对应 1000 个 ImageNet 类别。'}
  };
  function updateParameters(root){
    const key=root.querySelector('[data-ax-param][aria-pressed="true"]').dataset.axParam,data=parameterData[key];
    root.querySelectorAll('[data-ax-param]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.axParam===key)));
    root.querySelector('[data-ax-param-label]').textContent=data.label;
    root.querySelector('[data-ax-param-value]').textContent=data.value.toLocaleString('en-US')+' 个参数';
    root.querySelector('[data-ax-param-bar]').style.width=(data.value/parameterData.fc1.value*100)+'%';
    root.querySelector('[data-ax-param-copy]').textContent=data.copy;
  }
  function updateReLU(root){
    const input=Number(root.querySelector('[data-ax-relu-input]').value),x=20+(input+4)*32.5,y=110-Math.max(0,input)*23;
    root.querySelector('[data-ax-relu-value]').textContent=input.toFixed(1);
    root.querySelector('[data-ax-probe]').setAttribute('d','M'+x+' 12V110');
    root.querySelector('[data-ax-probe-dot]').setAttribute('cx',x);root.querySelector('[data-ax-probe-dot]').setAttribute('cy',y);
    root.querySelector('[data-ax-relu-readout]').textContent=input<0?'ReLU('+input.toFixed(1)+') = 0；负半轴局部梯度为 0。':'ReLU('+input.toFixed(1)+') = '+input.toFixed(1)+'；正半轴局部梯度为 1。';
  }
  function updateAugment(root){
    const mode=root.dataset.axAugActive,scene=root.querySelector('[data-ax-augment-view]');
    scene.dataset.axAugmentView=mode;
    scene.querySelectorAll('[data-ax-augment]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.axAugment===mode)));
    const copies={crop:'随机裁出不同区域，让同一辆车出现在画面不同位置；类别标签仍是“汽车”。',flip:'水平翻转会改变道路朝向，但这个示意中的“汽车”类别仍成立；方向敏感任务未必适合这样做。',color:'轻微改变颜色可以增加外观变化；若颜色本身决定类别，扰动幅度就需要谨慎设定。'};
    root.querySelector('[data-ax-augment-readout]').textContent=copies[mode];
  }
  function update(root){
    updateStage(root);updatePool(root);updateDropout(root);updateGpu(root);updateResults(root);updateParameters(root);updateReLU(root);updateAugment(root);
    root.querySelectorAll('[data-ax-idea]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.axIdea===root.dataset.axIdeaActive)));
    root.querySelectorAll('[data-ax-idea-panel]').forEach(panel=>{panel.hidden=panel.dataset.axIdeaPanel!==root.dataset.axIdeaActive});
  }
  window.lessonPlaygrounds={
    render(lessonId,sectionIndex){return lessonId==='cnn'&&sectionIndex===14?playgroundMarkup():(previous.render?.(lessonId,sectionIndex)||'')},
    initialize(){previous.initialize?.();document.querySelectorAll('[data-alexnet]').forEach(update)}
  };
  document.addEventListener('click',event=>{
    const root=event.target.closest('[data-alexnet]');if(!root)return;
    const stage=event.target.closest('[data-ax-stage]');if(stage){root.dataset.axStage=stage.dataset.axStage;update(root);return}
    const idea=event.target.closest('[data-ax-idea]');if(idea){root.dataset.axIdeaActive=idea.dataset.axIdea;update(root);return}
    const gpu=event.target.closest('[data-ax-gpu]');if(gpu){root.dataset.axGpuLayout=gpu.dataset.axGpu;updateGpu(root);return}
    const result=event.target.closest('[data-ax-result]');if(result){root.querySelectorAll('[data-ax-result]').forEach(button=>button.setAttribute('aria-pressed',String(button===result)));updateResults(root);return}
    const parameter=event.target.closest('[data-ax-param]');if(parameter){root.querySelectorAll('[data-ax-param]').forEach(button=>button.setAttribute('aria-pressed',String(button===parameter)));updateParameters(root);return}
    const augment=event.target.closest('[data-ax-augment]');if(augment){root.dataset.axAugActive=augment.dataset.axAugment;updateAugment(root);return}
    const answer=event.target.closest('[data-ax-answer]');if(answer){const card=answer.closest('[data-ax-quiz-card]'),item=quiz[Number(card.dataset.axQuizCard)],correct=answer.dataset.axAnswer===item.a;card.querySelectorAll('[data-ax-answer]').forEach(button=>{const selected=button===answer;button.setAttribute('aria-pressed',String(selected));button.classList.toggle('is-correct',selected&&correct);button.classList.toggle('is-wrong',selected&&!correct)});card.querySelector('[data-ax-feedback]').textContent=(correct?'判断正确。':'再想一下。')+item.why;return}
  });
  document.addEventListener('input',event=>{const root=event.target.closest('[data-alexnet]');if(!root)return;if(event.target.matches('[data-ax-relu-input]'))updateReLU(root);if(event.target.matches('[data-ax-drop-rate]'))updateDropout(root)});
  document.addEventListener('change',event=>{if(event.target.matches('[data-ax-pool-position]'))updatePool(event.target.closest('[data-alexnet]'))});
})();
