/* VGG: small receptive fields, stacked depth, and the full-model cost. */
(()=>{
  const lesson=lessons.find(item=>item.id==='cnn');
  if(!lesson)return;

  lesson.goals.push(
    '沿 VGG-16 与 VGG-19 的五个卷积块，读出每次下采样前后的特征图尺寸。',
    '推导连续 3×3 卷积怎样扩大感受野，并在相同通道数条件下比较参数量。',
    '区分局部卷积核的参数节省、整个 VGG 模型的参数规模，以及深度带来的计算代价。'
  );
  lesson.desc='看懂 VGG 怎样用连续 3×3 卷积建立更深的 CNN：沿五个卷积块追踪特征图尺寸，动手比较感受野、参数量与模型代价。';
  lesson.time=Math.max(lesson.time||0,100);
  lesson.sections.push({title:'16. VGG：用小卷积堆出深层网络',paragraphs:[
    'VGG 研究的是一个清楚的问题：在网络其他设计大体统一时，逐步增加卷积层深度会怎样影响大规模图像识别？经典 VGG-16 与 VGG-19 使用步幅为 1、填充为 1 的 3×3 卷积，让卷积后空间尺寸保持不变；每组卷积后再用 2×2、步幅 2 的最大池化把宽和高减半。卷积与池化分工不同：前者提取并组合局部模式，后者压缩空间网格。',
    '为什么重复使用 3×3？在步幅 1、层间不做池化时，一个 3×3 卷积位置读取上一层周围 3×3；连续两层可以让最终位置依赖原输入的 5×5 区域，连续三层则覆盖 7×7。这里说的是理论感受野边界，不代表区域里的每个像素对输出影响完全相同。',
    '在输入、中间和输出通道都为 C 的简化条件下，一个 5×5 卷积需要 25C² 个权重；两个 3×3 卷积需要 18C² 个权重。堆叠后少了卷积权重，而且每层之间可以加入 ReLU，增加非线性组合。三层 3×3 对比一层 7×7 时，权重是 27C² 对 49C²。参数优势来自这个明确的替换条件，并不意味着整个 VGG 模型参数少或运行更快。',
    '经典 VGG-16 有 13 个卷积层和 3 个全连接层；VGG-19 有 16 个卷积层和 3 个全连接层。名称统计的是带权重的层，ReLU、池化等不计入 16 或 19。两者的五个卷积块通道依次为 64、128、256、512、512；VGG-16 每块卷积层数为 2、2、3、3、3，VGG-19 为 2、2、4、4、4。',
    '以 224×224 输入为例，五次池化后空间尺寸依次变为 112、56、28、14、7，最后得到 7×7×512 特征。原版分类头将它展平后接 4096、4096、1000 个单元。原论文报告 VGG-16 约 138M、VGG-19 约 144M 参数；VGG-16 的大部分参数集中在全连接分类头。因此，3×3 卷积块的局部优势不能掩盖整网的存储和计算成本。',
    '论文在 ImageNet 的受控实验中观察到，增加网络深度的配置取得了更好的分类准确率；这是该数据、训练方法和模型配置下的实验发现，不是“只要加深网络就一定更准”的定律。更深的网络会增加计算与显存负担，模型是否合适还要结合任务、数据和硬件判断。点选下方结构、改变堆叠层数，并用参数小实验核对自己的直觉。'
  ]});
  lesson.keypoints.push(
    'VGG-16 是 13 个卷积层加 3 个全连接层；VGG-19 是 16 个卷积层加 3 个全连接层。',
    '在步幅 1 且中间不池化时，两层 3×3 卷积的理论感受野为 5×5，三层为 7×7。',
    '3×3 堆叠的参数比较依赖通道数等条件；它不代表 VGG 整体很小或必然更快。',
    'VGG 五个卷积块后各有一次 2×2、步幅 2 最大池化；224×224 输入经五次池化成为 7×7。',
    '“16/19 层”统计有权重的卷积层与全连接层，不包含 ReLU 和池化。',
    '原论文的 ImageNet 结果说明加深在该实验设置下有效，不能外推成适用于所有任务的保证。'
  );
  const sources=[
    {url:'https://arxiv.org/abs/1409.1556',label:'Simonyan 与 Zisserman：Very Deep Convolutional Networks for Large-Scale Image Recognition（VGG 原论文）'},
    {url:'https://docs.pytorch.org/vision/main/models/generated/torchvision.models.vgg16.html',label:'Torchvision VGG-16：官方模型参数量、计算量与预处理说明'}
  ];
  lesson.sources=[...(lesson.sources||[]),...sources.filter(source=>!(lesson.sources||[]).some(existing=>existing.url===source.url))];

  const previous=window.lessonPlaygrounds||{};
  const esc=value=>String(value).replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const channels=[64,128,256,512,512];
  const resolutions=[224,112,56,28,14,7];
  const models={
    vgg16:{label:'VGG-16',layers:[2,2,3,3,3],convCount:13,depth:16,params:'约 138M'},
    vgg19:{label:'VGG-19',layers:[2,2,4,4,4],convCount:16,depth:19,params:'约 144M'}
  };
  const quizzes=[
    {q:'两层连续的 3×3 卷积（中间没有池化）对应 5×5 的理论感受野。',answer:'true',why:'正确。步幅为 1 时，每增加一层 3×3，感受野边长增加 2。'},
    {q:'VGG-16 的“16”表示 16 个卷积层。',answer:'false',why:'不正确。经典 VGG-16 是 13 个卷积层与 3 个全连接层；两者合计 16 个带权重的层。'},
    {q:'两个 3×3 卷积在任何通道配置下都比一个 5×5 卷积参数更少。',answer:'false',why:'不正确。18C² 对 25C² 的比较假设三层通道宽度相同；通道数改变时要重新计算。'},
    {q:'VGG 论文证明任何任务上网络越深，准确率就一定越高。',answer:'false',why:'不正确。论文展示的是其 ImageNet 实验配置中的结果，不能当作普遍保证。'},
    {q:'原版 VGG-16 虽以小卷积核为特点，整体参数规模仍然很大。',answer:'true',why:'正确。原论文约 138M 参数，4096 单元的全连接分类头占了很大一部分。'}
  ];

  function blockButtons(model){
    return model.layers.map((count,index)=>'<button type="button" class="vg-block" data-vg-block="'+index+'" aria-pressed="'+String(index===0)+'"><span class="vg-block-top"><b>卷积块 '+(index+1)+'</b><small>'+count+'× Conv 3×3</small></span><span class="vg-kernel-stack" aria-hidden="true">'+Array.from({length:Math.min(count,4)},(_,i)=>'<i style="--i:'+i+'"></i>').join('')+'</span><span class="vg-block-channels">'+channels[index]+' 通道</span><span class="vg-pool-arrow" aria-hidden="true">↓ 池化</span></button>').join('');
  }
  function resolutionsMarkup(){
    return '<div class="vg-resolution-flow" aria-label="连续五次池化后的特征图分辨率">'+resolutions.map((size,index)=>'<div class="vg-resolution-step"><span class="vg-resolution-map" style="--map-size:'+Math.max(14,Math.round(34*size/224))+'px" aria-hidden="true"></span><b>'+size+'×'+size+'</b><small>'+(index===0?'输入':index===5?'最终特征图':'池化 '+index)+'</small></div>'+ (index<resolutions.length-1?'<span class="vg-flow-arrow" aria-hidden="true">›</span>':'')).join('')+'</div>';
  }
  function architectureMarkup(){
    const active=models.vgg16;
    return '<section class="vg-panel" aria-labelledby="vg-architecture-title"><div class="vg-panel-head"><div><span>01 · ARCHITECTURE MAP</span><h4 id="vg-architecture-title">从输入图到分类分数</h4></div><p>选择深度，再点卷积块看尺寸和卷积层数怎样变化。</p></div><div class="vg-model-switch" role="group" aria-label="切换 VGG 深度"><button type="button" data-vg-model="vgg16" aria-pressed="true">VGG-16</button><button type="button" data-vg-model="vgg19" aria-pressed="false">VGG-19</button></div><div class="vg-block-track" data-vg-block-track>'+blockButtons(active)+'</div><div class="vg-block-detail" aria-live="polite"><div><span data-vg-block-label>卷积块 1</span><h5 data-vg-block-title>先抽取浅层边缘与纹理</h5><code data-vg-block-shape>224×224×3 → 112×112×64</code></div><p data-vg-block-copy>两个 3×3 卷积都保持宽高不变；接着 2×2 最大池化将空间尺寸减半，通道数由卷积设为 64。</p></div>'+resolutionsMarkup()+'<div class="vg-classifier-flow"><span><b>展平</b><small>7×7×512</small></span><i aria-hidden="true">→</i><span><b>全连接</b><small>4096</small></span><i aria-hidden="true">→</i><span><b>全连接</b><small>4096</small></span><i aria-hidden="true">→</i><span class="vg-output"><b>类别分数</b><small>1000 logits</small></span></div><p class="vg-caption" data-vg-model-note>VGG-16：13 个卷积层 + 3 个全连接层；论文约 138M 参数。ReLU 与池化不计入层数。</p></section>';
  }
  function receptiveMarkup(){
    const cells=Array.from({length:49},(_,i)=>'<i data-vg-cell="'+i+'" class="'+((i>=16&&i<=32&&i%7>=2&&i%7<=4)?'is-active':'')+'"></i>').join('');
    return '<section class="vg-panel"><div class="vg-panel-head"><div><span>02 · RECEPTIVE FIELD</span><h4>小窗口叠起来，看的范围变大</h4></div><p>中间不池化、每层 stride=1；选择层数观察理论感受野。</p></div><div class="vg-receptive-layout"><div class="vg-receptive-controls" role="group" aria-label="选择连续 3×3 卷积层数"><button type="button" data-vg-depth="1" aria-pressed="false">1 层</button><button type="button" data-vg-depth="2" aria-pressed="true">2 层</button><button type="button" data-vg-depth="3" aria-pressed="false">3 层</button></div><div class="vg-receptive-grid" data-vg-receptive-grid aria-label="输入特征图中心位置的理论感受区域">'+cells+'</div><div class="vg-receptive-copy"><span data-vg-rf-label>当前理论感受野</span><strong data-vg-rf-value>5×5</strong><p data-vg-rf-explain>最终中心位置最多依赖原输入中间这片 5×5 区域。网格显示覆盖边界，不代表每个像素贡献相同。</p><div class="vg-layer-chain" data-vg-layer-chain><span>3×3</span><i aria-hidden="true">→</i><span>3×3</span></div></div></div><p class="vg-caption">计算前提：卷积 stride=1、膨胀率为 1，中间没有池化；若 stride、dilation 或下采样改变，感受野需要重新推导。</p></section>';
  }
  function parameterMarkup(){
    return '<section class="vg-panel"><div class="vg-panel-head"><div><span>03 · PARAMETER CALCULATOR</span><h4>比较一个 5×5 与两个 3×3</h4></div><p>改变通道数，亲自看卷积权重差多少。</p></div><div class="vg-param-layout"><div class="vg-param-control"><label for="vg-channels">每层通道数 C <output data-vg-channel-value>64</output></label><input id="vg-channels" type="range" min="16" max="128" step="16" value="64" data-vg-channels><div class="vg-param-formula"><code>5×5：25C² 权重</code><code>3×3×2：18C² 权重</code><span>同宽、无池化的对照；偏置另计</span></div></div><div class="vg-param-bars" aria-live="polite"><div class="vg-param-row"><div><span>一个 5×5 卷积</span><strong data-vg-5x5-value></strong></div><div class="vg-param-track"><i data-vg-5x5-bar></i></div></div><div class="vg-param-row"><div><span>两个 3×3 卷积</span><strong data-vg-3x3-value></strong></div><div class="vg-param-track"><i class="is-stack" data-vg-3x3-bar></i></div></div><p class="vg-param-result" data-vg-param-result></p></div></div><div class="vg-full-model-note"><span class="vg-mini-chip">整网看法</span><p>这只是局部卷积核的参数比较。VGG-16 全模型约有 <b>138M</b> 参数，其中大头来自展平后的宽大分类头；小卷积核不会自动让整网轻量。</p></div></section>';
  }
  function quizMarkup(){
    return '<section class="vg-panel vg-quiz"><div class="vg-panel-head"><div><span>04 · CHECK YOUR UNDERSTANDING</span><h4>用五句话检查理解</h4></div><p>选“正确”或“不正确”，看每句背后的条件。</p></div><div class="vg-quiz-grid">'+quizzes.map((item,index)=>'<article class="vg-quiz-card" data-vg-quiz="'+index+'"><h5>'+esc(item.q)+'</h5><div role="group" aria-label="第 '+(index+1)+' 题"><button type="button" data-vg-answer="true">正确</button><button type="button" data-vg-answer="false">不正确</button></div><p data-vg-feedback role="status" aria-live="polite"></p></article>').join('')+'</div></section>';
  }
  function playgroundMarkup(){
    return '<section class="lesson-playground vgg-playground" data-vgg data-vg-model-active="vgg16" data-vg-block-active="0" data-vg-depth-active="2" aria-labelledby="vg-title"><header class="vg-heading"><span>INTERACTIVE · CNN 结构实验室</span><h3 id="vg-title">拆开 VGG：小卷积怎样堆成深网络</h3><p>先看 VGG-16/19 的五个卷积块，再探索感受野和参数的变化。</p></header>'+architectureMarkup()+receptiveMarkup()+parameterMarkup()+quizMarkup()+'<p class="vg-footer-note">记住这条线索：小卷积保持结构简单，堆叠增加深度与非线性；池化负责缩小空间图；分类头把全局特征变成类别分数。每种设计都要结合完整模型成本来评价。</p></section>';
  }

  function updateArchitecture(root){
    const model=models[root.dataset.vgModelActive]||models.vgg16,index=Number(root.dataset.vgBlockActive)||0;
    const count=model.layers[index],channel=channels[index],input=resolutions[index],output=resolutions[index+1];
    root.querySelectorAll('[data-vg-model]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.vgModel===root.dataset.vgModelActive)));
    root.querySelector('[data-vg-block-track]').innerHTML=blockButtons(model);
    root.querySelectorAll('[data-vg-block]').forEach(button=>button.setAttribute('aria-pressed',String(Number(button.dataset.vgBlock)===index)));
    const titles=['先抽取浅层边缘与纹理','把简单纹理组合成局部形状','扩大局部组合，通道数提升到 256','在更小网格里组合高层模式','把最终卷积特征保持在 512 个通道'];
    root.querySelector('[data-vg-block-label]').textContent='卷积块 '+(index+1)+' · '+model.label;
    root.querySelector('[data-vg-block-title]').textContent=titles[index];
    root.querySelector('[data-vg-block-shape]').textContent=input+'×'+input+'×'+(index===0?3:channels[index-1])+' → '+output+'×'+output+'×'+channel;
    root.querySelector('[data-vg-block-copy]').textContent='本块串联 '+count+' 个 3×3 卷积，每个卷积后接 ReLU；卷积保持空间尺寸 '+input+'×'+input+'，随后 2×2、stride 2 的最大池化将网格缩到 '+output+'×'+output+'，输出 '+channel+' 个通道。';
    root.querySelector('[data-vg-model-note]').textContent=model.label+'：'+model.convCount+' 个卷积层 + 3 个全连接层，共 '+model.depth+' 个带权重的层；原论文约 '+model.params+' 参数。ReLU 与池化不计入层数。';
  }
  function updateReceptive(root,depth){
    const size=depth*2+1,start=Math.floor((7-size)/2),cells=root.querySelectorAll('[data-vg-cell]');
    cells.forEach((cell,index)=>{const row=Math.floor(index/7),col=index%7;cell.classList.toggle('is-active',row>=start&&row<start+size&&col>=start&&col<start+size)});
    root.querySelectorAll('[data-vg-depth]').forEach(button=>button.setAttribute('aria-pressed',String(Number(button.dataset.vgDepth)===depth)));
    root.querySelector('[data-vg-rf-value]').textContent=size+'×'+size;
    root.querySelector('[data-vg-rf-explain]').textContent='最终中心位置最多依赖原输入中间这片 '+size+'×'+size+' 区域。网格显示覆盖边界，不代表每个像素贡献相同。';
    root.querySelector('[data-vg-layer-chain]').innerHTML=Array.from({length:depth},()=>'<span>3×3</span>').join('<i aria-hidden="true">→</i>');
    root.dataset.vgDepthActive=String(depth);
  }
  function updateParameters(root){
    const c=Number(root.querySelector('[data-vg-channels]').value),single=25*c*c+c,stacked=18*c*c+2*c;
    root.querySelector('[data-vg-channel-value]').textContent=c;
    root.querySelector('[data-vg-5x5-value]').textContent=single.toLocaleString('en-US')+' 个参数';
    root.querySelector('[data-vg-3x3-value]').textContent=stacked.toLocaleString('en-US')+' 个参数';
    root.querySelector('[data-vg-5x5-bar]').style.width='100%';
    root.querySelector('[data-vg-3x3-bar]').style.width=(stacked/single*100)+'%';
    root.querySelector('[data-vg-param-result]').textContent='在这组同宽配置下，两个 3×3 卷积约少 '+((1-stacked/single)*100).toFixed(1)+'% 参数（已把每层偏置计入）；层间没有池化，理论感受野与单个 5×5 相同。';
  }
  function update(root){updateArchitecture(root);updateParameters(root);updateReceptive(root,Number(root.dataset.vgDepthActive)||2)}

  window.lessonPlaygrounds={
    render(id,index){return id==='cnn'&&index===15?playgroundMarkup():(previous.render?.(id,index)||'')},
    initialize(){previous.initialize?.();document.querySelectorAll('[data-vgg]').forEach(update)}
  };
  document.addEventListener('click',event=>{
    const root=event.target.closest('[data-vgg]');if(!root)return;
    const model=event.target.closest('[data-vg-model]');if(model){root.dataset.vgModelActive=model.dataset.vgModel;root.dataset.vgBlockActive='0';updateArchitecture(root);return}
    const block=event.target.closest('[data-vg-block]');if(block){root.dataset.vgBlockActive=block.dataset.vgBlock;updateArchitecture(root);return}
    const depth=event.target.closest('[data-vg-depth]');if(depth){updateReceptive(root,Number(depth.dataset.vgDepth));return}
    const answer=event.target.closest('[data-vg-answer]');if(answer){const card=answer.closest('[data-vg-quiz]'),item=quizzes[Number(card.dataset.vgQuiz)],correct=answer.dataset.vgAnswer===item.answer;card.querySelectorAll('[data-vg-answer]').forEach(button=>{const selected=button===answer;button.setAttribute('aria-pressed',String(selected));button.classList.toggle('is-correct',selected&&correct);button.classList.toggle('is-wrong',selected&&!correct)});card.querySelector('[data-vg-feedback]').textContent=(correct?'判断正确。':'再核对一下。')+item.why}
  });
  document.addEventListener('input',event=>{const root=event.target.closest('[data-vgg]');if(root&&event.target.matches('[data-vg-channels]'))updateParameters(root)});
})();
