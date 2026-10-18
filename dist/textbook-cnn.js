/* CNN 与全连接的空间结构对比：教材内容和轻量交互均在此维护。 */
(()=>{
  const lesson=lessons.find(item=>item.id==='cnn');
  if(!lesson)return;

  lesson.goals.push(
    '说明 flatten 保留像素值与顺序，但全连接层没有显式利用局部邻域和共享权重。',
    '估算图像全连接层和卷积层的参数量，并区分参数量、计算量与速度。',
    '区分卷积的平移等变与分类结果的平移不变。'
  );
  lesson.desc='从通道、滤波器与特征图继续深入：对照全连接与卷积的空间结构，计算参数量，观察平移等变与位置不变的区别。';
  lesson.time=75;
  lesson.sections.push(
    {title:'8. 展平没有抹掉位置：全连接缺少的是空间先验',paragraphs:[
      '把一张 H×W 的图像展平成向量，只是按约定把二维坐标排成一列。例如灰度图按行展开时，像素 (r,c) 的索引是 `r×W+c`；在 PyTorch 的 NCHW 张量中，单张图展平后索引为 `channel×H×W+r×W+c`。给定展平顺序和索引，原来的行、列仍然能找回来，所以不能说 flatten 把像素值或坐标信息彻底删除。',
      '困难在于后续全连接层没有把“相邻像素通常相关、同一种局部纹理可能出现在不同位置”写进结构。输入的每个坐标都拥有自己的权重；一条边从左边移到右边，参与计算的权重也跟着换。全连接层理论上可以学会这些关系，但没有局部连接和共享权重带来的先验，往往需要更多参数与数据才能学得有效。',
      '卷积把一个小滤波器放在局部窗口上计算，并在空间位置重复使用同一组权重。它更自然地表达局部模式能出现在不同位置这一规律。下面点选像素，看看二维坐标如何对应到展平索引；再对照两种连接方式，注意卷积核会被重复使用。'
    ]},
    {title:'9. 参数量为什么会膨胀：算一笔公平的账',paragraphs:[
      '若输入有 `D=H×W×C` 个数，全连接到 h 个隐藏单元的权重矩阵有 D×h 个权重；每个隐藏单元再有一个偏置，总参数量是 `D×h+h`。28×28 灰度图接 64 个单元就有 50,240 个参数；224×224 RGB 接 64 个单元则有 9,633,856 个参数。',
      '卷积只学习小核，并在许多空间位置共享。普通 `Conv2d(Cin,Cout,k)` 有偏置时，参数量为 `Cout×Cin×k×k+Cout`，与输入的 H、W 无关。例如 3→32 的 3×3 卷积为 896 个参数。输入变大时，核仍要在更多位置执行计算，所以运算量和中间特征图会增大。',
      '这组数字说明参数共享能显著压缩可学习参数，但它不是两个等价网络的速度竞赛：全连接与卷积的输出结构不同，参数量也不等于 FLOPs、显存占用或实测延迟。模型整体是否过拟合，还取决于数据量与质量、模型容量、正则化和训练策略；参数多会提高拟合能力，不会自动判定泛化结果。'
    ]},
    {title:'10. 平移等变，不等于分类不变',paragraphs:[
      '把一个物体在图像中向右移动，卷积特征通常也会向右移动。这种“输入移动，特征图跟着移动”的关系叫平移等变。对于步幅为 1 的卷积，它在理想的无限网格上成立；真实图像有边界、填充和裁切，实际结果会在边缘附近受影响。步幅大于 1 时，也不保证对任意一个像素的平移都严格等变。',
      '分类任务有时希望物体移位后类别分数变化不大，这叫平移不变。卷积本身主要提供等变性，并不会自动让最终类别预测完全不变。池化、全局聚合、训练数据增强等设计可以增加对位置变化的鲁棒性，但程度依模型而异。目标检测和分割则需要知道物体在哪里，保留位置变化的响应往往正是需要的。',
      '拖动左侧的 L 形图案，观察右边共享模板的响应峰值随之移动；再看全局最大响应。这个小实验用同一个 2×2 模板和步幅 1 的有效卷积，展示响应位置如何跟着输入走，而全局最大值在本例中保持相同。边界、下采样和真实分类器会带来额外影响。'
    ]},
    {title:'11. 用四个判断题校准直觉',paragraphs:[
      '全连接网络不是不能处理图像；它可以学习复杂映射，只是对像素局部性和跨位置重复模式缺少结构性假设。卷积神经网络把这些图像规律作为归纳偏置，因此常能更有效地利用样本，但不保证在每个数据集、每个训练条件下都胜出。',
      '平移等变和平移不变也不能混为一谈。卷积特征图随目标移动，是“位置跟着变”；如果后续汇聚让输出忽略具体位置，才可能表现出一定的位置不敏感。做检测、分割时，网络还要保留位置和尺度信息。',
      '看完下方判断卡后，可以用一句话总结：flatten 保留有序数值，CNN 则把局部连接和权重共享写进结构；它们带来不同的学习偏置与输出方式，没有一句“必定识别不了”或“必然精度更高”能替代具体数据与任务评估。'
    ]}
  );
  lesson.keypoints.push(
    'Flatten 以确定顺序重排像素；坐标可以从索引恢复。',
    '全连接为每个绝对坐标分别学习权重；卷积利用局部连接和空间共享。',
    '全连接参数为 D×h+h；带偏置的普通二维卷积参数为 Cout×Cin×k²+Cout。',
    '参数量不等于运算量、速度或泛化表现；卷积不保证任何任务上都更准确。',
    '步幅 1 卷积主要呈现平移等变；平移不变通常需要后续汇聚或训练设计。'
  );
  lesson.sources=[
    {url:'https://docs.pytorch.org/docs/stable/generated/torch.nn.Linear.html',label:'PyTorch Linear：全连接层的输入输出与权重形状'},
    {url:'https://docs.pytorch.org/docs/stable/generated/torch.nn.Conv2d.html',label:'PyTorch Conv2d：卷积核形状、groups 与参数定义'},
    {url:'https://bottou.org/papers/lecun-98h',label:'LeCun 等：局部感受野、权重共享与文档识别'},
    {url:'https://proceedings.mlr.press/v48/cohenc16.pdf',label:'Group Equivariant CNNs：卷积与等变性'},
    {url:'https://openreview.net/forum?id=YicbFdNTTy',label:'Vision Transformer：图像 patch 与纯 Transformer 视觉模型'}
  ];

  const base=window.lessonPlaygrounds;
  const esc=value=>String(value).replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const section8=7,section9=8,section10=9,section11=10;
  const pixels=[0,0,0,0,0, 0,1,1,0,0, 0,1,0,0,0, 0,0,0,1,0, 0,0,1,1,1];
  const claims=[
    {text:'“展平后坐标信息全没了，所以全连接层从原理上无法识别图案。”',answer:'fix',why:'需要修正。flatten 保留有序像素值，可按索引还原坐标。问题是全连接层没有显式利用局部邻接与跨位置共享；它理论上能学，只是学习偏置不同。'},
    {text:'“224×224 的 RGB 输入连到 64 个全连接单元，含偏置共 9,633,856 个参数。”',answer:'ok',why:'基本准确。输入数 D=224×224×3=150,528，参数 D×64+64=9,633,856。它只是在计算该全连接层参数，不代表整网总量。'},
    {text:'“参数更多就一定过拟合；换成 CNN 就一定有更高测试精度。”',answer:'fix',why:'需要修正。更多可学习参数提高模型容量，但是否过拟合要看数据、训练、正则化等因素。卷积的图像归纳偏置常有帮助，却不保证每个任务都胜出。'},
    {text:'“卷积让类别输出自动平移不变；全连接遇到平移就必然失效。”',answer:'fix',why:'需要修正。步幅 1 卷积主要带来特征图的平移等变。池化、全局汇聚和数据增强可带来一定位置鲁棒性；全连接也能通过训练学到鲁棒性，没有必然失效的定律。'}
  ];

  function header(kicker,title,copy){return '<div class="cnn-play-head"><span>'+kicker+'</span><h3>'+title+'</h3><p>'+copy+'</p></div>'}
  function flattenMarkup(){
    const cells=pixels.map((value,index)=>'<button type="button" class="cnn-pixel" data-cnn-pixel="'+index+'" aria-label="第 '+(Math.floor(index/5)+1)+' 行，第 '+(index%5+1)+' 列，数值 '+value+'，展平索引 '+index+'" aria-pressed="'+String(index===6)+'"><span>'+value+'</span></button>').join('');
    const vector=pixels.map((value,index)=>'<span class="cnn-vector-cell" data-cnn-vector="'+index+'"><small>'+index+'</small><b>'+value+'</b></span>').join('');
    return '<section class="lesson-playground cnn-playground" data-cnn-flatten aria-labelledby="cnn-flatten-title">'+header('INTERACTIVE · 坐标 ↔ 索引','点一格，追踪它在向量中的位置','行优先展开 5×5 灰度示意图。键盘也可聚焦像素格，查看同一数值在向量中的索引。')
      +'<div class="cnn-flatten-layout"><div class="cnn-visual-card"><div class="cnn-card-title"><strong>二维像素网格</strong><span>行 r · 列 c</span></div><div class="cnn-pixel-grid" role="group" aria-label="可交互的 5 行 5 列像素图">'+cells+'</div><p class="cnn-index-formula" data-cnn-index-readout aria-live="polite">像素 (1,1) → 索引 6：1×5 + 1 = 6</p></div><div class="cnn-flatten-arrow" aria-hidden="true">按行<br>展开<br>⟶</div><div class="cnn-visual-card"><div class="cnn-card-title"><strong>展平后的向量</strong><span>保留数值与次序</span></div><div class="cnn-vector" role="group" aria-label="按行展开的 25 个像素和索引">'+vector+'</div><p class="cnn-index-formula">灰度行优先：index = r×W+c</p></div></div>'
      +'<div class="cnn-connection-compare"><figure><figcaption><strong>全连接</strong><span>每个输出接收全部像素</span></figcaption><svg viewBox="0 0 270 126" role="img" aria-label="全连接示意图：多个输入像素连接到两个输出，每个输出都接收全体输入"><g stroke="#c8c1d9" stroke-width="1"><path d="M36 27L211 42M36 27L211 85M36 48L211 42M36 48L211 85M36 69L211 42M36 69L211 85M36 90L211 42M36 90L211 85M36 111L211 42M36 111L211 85"/></g><g fill="#d9d2e7" stroke="#8878aa"><circle cx="36" cy="27" r="8"/><circle cx="36" cy="48" r="8"/><circle cx="36" cy="69" r="8"/><circle cx="36" cy="90" r="8"/><circle cx="36" cy="111" r="8"/></g><g fill="#d8ebe5" stroke="#4c9180"><circle cx="211" cy="42" r="12"/><circle cx="211" cy="85" r="12"/></g><text x="36" y="15" text-anchor="middle">全部输入</text><text x="211" y="117" text-anchor="middle">输出单元</text></svg></figure><figure><figcaption><strong>卷积</strong><span>小窗口局部连接；同一核在位置间共享</span></figcaption><svg viewBox="0 0 270 126" role="img" aria-label="卷积示意图：一个局部 3 乘 3 核在图像不同位置重复使用相同参数"><rect x="17" y="22" width="94" height="82" rx="5" fill="#f6f4ef" stroke="#d9d6ce"/><g stroke="#d9d6ce"><path d="M40 22v82M63 22v82M86 22v82M17 42h94M17 62h94M17 82h94"/></g><rect x="40" y="42" width="46" height="40" fill="#ddd7eb" fill-opacity=".8" stroke="#7864a4" stroke-width="2"/><path d="M87 62H144M159 62H220" fill="none" stroke="#8b8170" stroke-width="2"/><path d="m140 57 7 5-7 5m76-5 7 5-7 5" fill="none" stroke="#8b8170" stroke-width="2"/><rect x="151" y="39" width="28" height="46" rx="4" fill="#f1e7d4" stroke="#c69a58"/><text x="165" y="58" text-anchor="middle">同一</text><text x="165" y="72" text-anchor="middle">权重核</text><circle cx="238" cy="62" r="17" fill="#d8ebe5" stroke="#4c9180"/><text x="238" y="66" text-anchor="middle">响应</text><text x="62" y="117" text-anchor="middle">图像不同局部</text></svg></figure></div>'
      +'<p class="cnn-play-note">同一幅图可以按不同行优先或通道优先约定展平；索引公式要和张量的轴顺序一致。全连接也能学习空间关系，卷积只是把局部性与权重共享作为更贴合图像的结构偏置。</p></section>';
  }
  function parameterMarkup(){
    return '<section class="lesson-playground cnn-playground" data-cnn-parameters aria-labelledby="cnn-parameter-title">'+header('INTERACTIVE · 参数量估算','改分辨率与通道数，比较两种参数规模','计算输入展平后连接到 h 个全连接单元，以及 3×3、3→32 普通卷积的可学习参数。')
      +'<div class="cnn-parameter-layout"><div class="cnn-control-card"><label>图像边长<select data-cnn-size aria-label="选择正方形图像边长"><option value="28">28 × 28</option><option value="64">64 × 64</option><option value="224" selected>224 × 224</option></select></label><label>输入通道<select data-cnn-channels aria-label="选择输入通道数"><option value="1">1（灰度）</option><option value="3" selected>3（RGB）</option></select></label><label class="cnn-range-control">全连接隐藏单元 <output data-cnn-hidden-value>64</output><input type="range" min="16" max="256" step="16" value="64" data-cnn-hidden aria-label="全连接隐藏单元数量"></label><p>卷积对照：3×3 核、32 个输出通道、有偏置、groups=1。</p></div><div class="cnn-count-comparison"><article class="cnn-count-card cnn-dense-count"><span>flatten → Linear</span><strong data-cnn-dense-count>9,633,856</strong><small data-cnn-dense-detail>150,528 个输入 × 64 个单元 + 64 个偏置</small><div class="cnn-count-meter"><i data-cnn-dense-meter></i></div></article><article class="cnn-count-card cnn-conv-count"><span>Conv2d 3×3</span><strong data-cnn-conv-count>896</strong><small data-cnn-conv-detail>32×3×3×3 个权重 + 32 个偏置</small><div class="cnn-count-meter"><i data-cnn-conv-meter></i></div></article></div></div><p class="cnn-play-note">参数量只数可训练权重与偏置。两层的输出结构并不等价；卷积在更多空间位置复用这些参数，分辨率增大仍会增加计算量和特征图存储。参数更少不自动等于整网更快或准确率更高。</p><p class="cnn-live-count" data-cnn-count-summary aria-live="polite"></p></section>';
  }
  const shape=[[0,0],[0,1],[1,1]],motionCell=25;
  function motionMarkup(){
    let grid='';
    for(let r=0;r<7;r++)for(let c=0;c<7;c++)grid+='<rect x="'+(28+c*motionCell)+'" y="'+(65+r*motionCell)+'" width="'+motionCell+'" height="'+motionCell+'" fill="#fbfaf7" stroke="#dedbd3" stroke-width="1"/>';
    let map='';
    for(let r=0;r<6;r++)for(let c=0;c<6;c++){const x=353+c*24,y=75+r*24;map+='<g><rect data-cnn-response="'+r+','+c+'" x="'+x+'" y="'+y+'" width="24" height="24" rx="2" fill="#f0efeb" stroke="#fffefa" stroke-width="2"/><text data-cnn-response-value="'+r+','+c+'" x="'+(x+12)+'" y="'+(y+16)+'" text-anchor="middle" font-size="11" fill="#65717b">0</text></g>'}
    const object=shape.map(([r,c])=>'<rect x="'+(c*motionCell)+'" y="'+(r*motionCell)+'" width="'+motionCell+'" height="'+motionCell+'" fill="#8070ab" stroke="#fffefa" stroke-width="2"/>').join('');
    return '<section class="lesson-playground cnn-playground" data-cnn-motion data-row="2" data-col="2" aria-labelledby="cnn-motion-title">'+header('INTERACTIVE · 平移等变','拖动图案，看卷积响应跟着移动','左边是输入，右边用同一个 2×2 模板逐格计算。可拖动图案，也可用下方滑块或方向按钮。')
      +'<div class="cnn-motion-viz-wrap"><svg class="cnn-motion-svg" data-cnn-motion-svg viewBox="0 0 540 270" role="img" aria-label="左侧是可移动的 7 乘 7 输入网格，右侧是 6 乘 6 卷积响应；物体移动时响应峰值随之移动"><text x="28" y="34" fill="#414c58" font-size="13" font-weight="700">输入图像 · 7×7</text><text x="353" y="34" fill="#414c58" font-size="13" font-weight="700">卷积响应 · 6×6</text>'+grid+'<g data-cnn-draggable transform="translate(78 115)" cursor="grab">'+object+'<rect data-cnn-drag-hit x="0" y="0" width="50" height="50" fill="transparent"/></g>'+map+'<path d="M226 145H312m-8-7 8 7-8 7" fill="none" stroke="#b3a99a" stroke-width="2"/><text x="269" y="133" text-anchor="middle" fill="#7a807f" font-size="10">共享模板</text></svg></div>'
      +'<div class="cnn-motion-controls"><label>行位置 <output data-cnn-row-value>2</output><input type="range" min="0" max="5" step="1" value="2" data-cnn-row aria-label="图案所在行"></label><label>列位置 <output data-cnn-col-value>2</output><input type="range" min="0" max="5" step="1" value="2" data-cnn-col aria-label="图案所在列"></label><div class="cnn-move-buttons" role="group" aria-label="移动图案"><button type="button" data-cnn-move="0,-1" aria-label="向上移动">↑</button><button type="button" data-cnn-move="-1,0" aria-label="向左移动">←</button><button type="button" data-cnn-move="1,0" aria-label="向右移动">→</button><button type="button" data-cnn-move="0,1" aria-label="向下移动">↓</button></div></div><div class="cnn-motion-readouts"><div><span>响应峰值位置</span><strong data-cnn-peak-position>(2, 2)</strong></div><div><span>全局最大响应</span><strong data-cnn-global-peak>3</strong></div><p data-cnn-motion-note role="status" aria-live="polite">输入图案移动后，特征峰值也移动；本例的全局最大值仍是 3。</p></div><p class="cnn-play-note">这幅 7×7 示意图采用步幅 1、无填充的 2×2 有效互相关；模板与图案同形。整图全局最大值在这个受控例子里不随位置变化。真实网络会受填充、边界、下采样与后续层影响。</p></section>';
  }
  function claimsMarkup(){
    return '<section class="lesson-playground cnn-playground" data-cnn-claims aria-labelledby="cnn-claims-title">'+header('CHECK YOUR UNDERSTANDING · 说法辨析','哪些说法准确？逐条判断再看依据','这里检验的是概念本身。选择“基本准确”或“需要修正”，每题都会给出简短理由。')
      +'<div class="cnn-claim-list">'+claims.map((claim,index)=>'<article class="cnn-claim" data-cnn-claim-card="'+index+'"><span class="cnn-claim-index">0'+(index+1)+'</span><p>'+claim.text+'</p><div class="cnn-claim-actions" role="group" aria-label="判断第 '+(index+1)+' 条说法"><button type="button" data-cnn-claim="'+index+'" data-answer="ok" aria-pressed="false">基本准确</button><button type="button" data-cnn-claim="'+index+'" data-answer="fix" aria-pressed="false">需要修正</button></div><p class="cnn-claim-feedback" data-cnn-claim-feedback="'+index+'" role="status" aria-live="polite"></p></article>').join('')+'</div><p class="cnn-play-note">概念适用范围和结构假设比绝对化口号更重要：要讨论精度、速度或泛化，需要结合具体数据和完整模型评估。</p></section>';
  }
  window.lessonPlaygrounds={
    render(id,index){
      if(id==='cnn'&&index===section8)return flattenMarkup();
      if(id==='cnn'&&index===section9)return parameterMarkup();
      if(id==='cnn'&&index===section10)return motionMarkup();
      if(id==='cnn'&&index===section11)return claimsMarkup();
      return base?.render?.(id,index)||'';
    },
    initialize(){
      base?.initialize?.();
      document.querySelectorAll('[data-cnn-flatten]').forEach(root=>updatePixelSelection(root));
      document.querySelectorAll('[data-cnn-parameters]').forEach(updateParameters);
      document.querySelectorAll('[data-cnn-motion]').forEach(updateMotion);
    }
  };

  function updatePixelSelection(root,selected=Number(root.dataset.selectedPixel??6)){
    selected=Math.max(0,Math.min(24,selected));root.dataset.selectedPixel=String(selected);
    const row=Math.floor(selected/5),col=selected%5,value=pixels[selected];
    root.querySelectorAll('[data-cnn-pixel]').forEach(button=>{const active=Number(button.dataset.cnnPixel)===selected;button.setAttribute('aria-pressed',String(active));button.classList.toggle('is-selected',active)});
    root.querySelectorAll('[data-cnn-vector]').forEach(cell=>cell.classList.toggle('is-selected',Number(cell.dataset.cnnVector)===selected));
    root.querySelector('[data-cnn-index-readout]').textContent='像素 ('+row+','+col+') → 索引 '+selected+'：'+row+'×5 + '+col+' = '+selected+'；值为 '+value;
  }
  function updateParameters(root){
    const size=Number(root.querySelector('[data-cnn-size]').value),channels=Number(root.querySelector('[data-cnn-channels]').value),hidden=Number(root.querySelector('[data-cnn-hidden]').value),denseInput=size*size*channels;
    const dense=denseInput*hidden+hidden,conv=32*channels*3*3+32;
    root.querySelector('[data-cnn-hidden-value]').textContent=String(hidden);
    root.querySelector('[data-cnn-dense-count]').textContent=dense.toLocaleString('en-US');
    root.querySelector('[data-cnn-dense-detail]').textContent=denseInput.toLocaleString('en-US')+' 个输入 × '+hidden+' 个单元 + '+hidden+' 个偏置';
    root.querySelector('[data-cnn-conv-count]').textContent=conv.toLocaleString('en-US');
    root.querySelector('[data-cnn-conv-detail]').textContent='32×'+channels+'×3×3 个权重 + 32 个偏置';
    const denseRatio=Math.log10(dense+1)/Math.log10(1e9),convRatio=Math.log10(conv+1)/Math.log10(1e9);
    root.querySelector('[data-cnn-dense-meter]').style.width=Math.max(5,denseRatio*100)+'%';
    root.querySelector('[data-cnn-conv-meter]').style.width=Math.max(5,convRatio*100)+'%';
    root.querySelector('[data-cnn-count-summary]').textContent='当前设置下，全连接层约是此卷积层的 '+(dense/conv).toLocaleString('zh-CN',{maximumFractionDigits:0})+' 倍参数。比较的是单层可训练参数数量。';
  }
  function updateMotion(root){
    const row=Number(root.dataset.row)||0,col=Number(root.dataset.col)||0,svg=root.querySelector('[data-cnn-motion-svg]'),obj=root.querySelector('[data-cnn-draggable]');
    obj.setAttribute('transform','translate('+(28+col*motionCell)+' '+(65+row*motionCell)+')');
    root.querySelector('[data-cnn-row]').value=String(row);root.querySelector('[data-cnn-col]').value=String(col);
    root.querySelector('[data-cnn-row-value]').textContent=String(row);root.querySelector('[data-cnn-col-value]').textContent=String(col);
    const inputAt=(r,c)=>shape.some(([dy,dx])=>row+dy===r&&col+dx===c)?1:0;
    let max=0,peak={r:row,c:col};
    for(let r=0;r<6;r++)for(let c=0;c<6;c++){
      let score=0;for(const [dy,dx] of shape)score+=inputAt(r+dy,c+dx);
      const cell=root.querySelector('[data-cnn-response="'+r+','+c+'"]'),label=root.querySelector('[data-cnn-response-value="'+r+','+c+'"]');
      cell.setAttribute('fill',['#f0efeb','#e8e3f2','#cfc4e8','#7562a2'][score]);
      cell.setAttribute('stroke',score===3?'#4c9180':'#fffefa');cell.setAttribute('stroke-width',score===3?'2':'2');
      label.textContent=String(score);label.setAttribute('fill',score===3?'#fffefa':'#65717b');
      if(score>max){max=score;peak={r,c}}
    }
    root.querySelector('[data-cnn-peak-position]').textContent='('+peak.r+', '+peak.c+')';
    root.querySelector('[data-cnn-global-peak]').textContent=String(max);
    root.querySelector('[data-cnn-motion-note]').textContent='输入图案位于 ('+row+', '+col+')；共享卷积模板在 ('+peak.r+', '+peak.c+') 得到峰值 '+max+'。全局最大值在本例保持为 3。';
    svg.setAttribute('aria-label','左侧物体位于第 '+row+' 行第 '+col+' 列；右侧卷积响应峰值位于第 '+peak.r+' 行第 '+peak.c+' 列，最大响应为 '+max);
  }
  function localSvgPoint(svg,event){const point=svg.createSVGPoint();point.x=event.clientX;point.y=event.clientY;return point.matrixTransform(svg.getScreenCTM().inverse())}
  let drag=null;
  document.addEventListener('pointerdown',event=>{
    const handle=event.target.closest('[data-cnn-draggable]');if(!handle)return;
    const root=handle.closest('[data-cnn-motion]'),svg=root.querySelector('[data-cnn-motion-svg]'),point=localSvgPoint(svg,event);
    drag={root,pointerId:event.pointerId,startRow:Number(root.dataset.row)||0,startCol:Number(root.dataset.col)||0,startPointerRow:(point.y-65)/motionCell,startPointerCol:(point.x-28)/motionCell};
    handle.setPointerCapture?.(event.pointerId);handle.setAttribute('cursor','grabbing');event.preventDefault();
  });
  document.addEventListener('pointermove',event=>{
    if(!drag||event.pointerId!==drag.pointerId)return;
    const svg=drag.root.querySelector('[data-cnn-motion-svg]'),point=localSvgPoint(svg,event);
    const row=Math.max(0,Math.min(5,Math.round(drag.startRow+(point.y-65)/motionCell-drag.startPointerRow)));
    const col=Math.max(0,Math.min(5,Math.round(drag.startCol+(point.x-28)/motionCell-drag.startPointerCol)));
    drag.root.dataset.row=String(row);drag.root.dataset.col=String(col);updateMotion(drag.root);
  });
  document.addEventListener('pointerup',event=>{if(drag&&event.pointerId===drag.pointerId){drag.root.querySelector('[data-cnn-draggable]')?.setAttribute('cursor','grab');drag=null}});
  document.addEventListener('pointercancel',()=>{if(drag){drag.root.querySelector('[data-cnn-draggable]')?.setAttribute('cursor','grab');drag=null}});
  document.addEventListener('click',event=>{
    const pixel=event.target.closest('[data-cnn-pixel]');if(pixel){updatePixelSelection(pixel.closest('[data-cnn-flatten]'),Number(pixel.dataset.cnnPixel));return}
    const move=event.target.closest('[data-cnn-move]');if(move){const root=move.closest('[data-cnn-motion]'),[dx,dy]=move.dataset.cnnMove.split(',').map(Number);root.dataset.row=String(Math.max(0,Math.min(5,(Number(root.dataset.row)||0)+dy)));root.dataset.col=String(Math.max(0,Math.min(5,(Number(root.dataset.col)||0)+dx)));updateMotion(root);return}
    const answer=event.target.closest('[data-cnn-claim]');if(!answer)return;
    const root=answer.closest('[data-cnn-claims]'),index=Number(answer.dataset.cnnClaim),claim=claims[index],correct=answer.dataset.answer===claim.answer,card=answer.closest('[data-cnn-claim-card]');
    card.querySelectorAll('[data-cnn-claim]').forEach(button=>{const selected=button===answer;button.setAttribute('aria-pressed',String(selected));button.classList.toggle('is-correct',selected&&correct);button.classList.toggle('is-wrong',selected&&!correct)});
    const feedback=root.querySelector('[data-cnn-claim-feedback="'+index+'"]');feedback.textContent=(correct?'判断正确。':'再看看修正点：')+claim.why;feedback.classList.add('is-visible');
  });
  document.addEventListener('input',event=>{
    const parameters=event.target.closest('[data-cnn-size],[data-cnn-channels],[data-cnn-hidden]');if(parameters){updateParameters(parameters.closest('[data-cnn-parameters]'));return}
    const motion=event.target.closest('[data-cnn-row],[data-cnn-col]');if(!motion)return;
    const root=motion.closest('[data-cnn-motion]');if(motion.matches('[data-cnn-row]'))root.dataset.row=motion.value;else root.dataset.col=motion.value;updateMotion(root);
  });
})();
