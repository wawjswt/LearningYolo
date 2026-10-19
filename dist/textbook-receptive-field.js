/* Receptive fields: calculate the footprint, distinguish influence, and fuse scales. */
(()=>{
  const lesson=lessons.find(item=>item.id==='cnn');
  if(!lesson)return;
  const firstSection=lesson.sections.length;
  lesson.time=Math.max(lesson.time||0,120);
  lesson.desc='从卷积的局部连接走到感受野与特征金字塔：逐层计算视野，分清理论范围和实际影响，再看检测网络如何融合不同尺度。';
  lesson.goals.push(
    '按卷积核、步幅和膨胀率逐层计算理论感受野与输出位置间隔。',
    '区分理论感受野的可达范围与有效感受野中的影响强弱。',
    '说明高分辨率细节与深层语义怎样在多尺度检测结构中融合，并辨认适用边界。'
  );
  const rfSections=[
    {
      title:(firstSection+1)+'. 用计算跟踪感受野：卷积核、步幅与下采样',
      paragraphs:[
        '感受野回答的是：特征图上某一个位置，沿网络连接往回追，最多会依赖原图中的哪一片区域。讨论空间范围时，我们先只算高和宽；彩色图像和中间特征的通道连接仍参与运算，但不把通道数当成感受野边长。感受野也不是特征图本身的尺寸。',
        '从输入开始记 R₀=1、J₀=1。对第 l 层，Rₗ=Rₗ₋₁+(Kₑff−1)Jₗ₋₁，Jₗ=Jₗ₋₁×stride；其中 Kₑff=dilation×(kernel−1)+1。R 是理论感受野边长，J 是相邻输出位置映回原图时相隔多少像素。步幅和前面累积的 J 会决定后续每一层增加多少。',
        '连续两个 3×3、stride=1 的卷积，理论感受野从 1→3→5。若之后接 2×2、stride=2 池化，再接一个 3×3 卷积，则 R 从 5→6→10：池化既把相邻特征点在原图上的间隔扩大到 2，也让后一层卷积每次覆盖更多原图区域。具体要按层序计算，不能只数卷积层数。',
        '1×1 卷积会混合通道，却不扩大空间理论感受野；空洞卷积通过拉开采样点扩大覆盖跨度，仍需考虑边界、填充与实际有效影响。感受野变大不自动代表检测更准，调网络时还要同时看特征分辨率、计算量和目标在特征图上还剩多少位置。'
      ]
    },
    {
      title:(firstSection+2)+'. 理论感受野与有效感受野：范围不等于贡献',
      paragraphs:[
        '理论感受野描述由网络结构允许哪些输入位置沿计算路径影响某个输出位置。它给出一个最大覆盖范围，适合逐层推算和比较结构。画成一个方框很直观，但方框内部并不代表每个像素都被同等使用。',
        '有效感受野关注这些输入位置对输出实际有多大影响。研究发现，深层卷积网络的影响常集中在理论范围的中心，向外围逐渐变弱，形状近似高斯分布；有效影响区可能只占理论范围的一部分。具体分布会随网络、权重、输入样本和测量方式变化。',
        '一种观察方法是选定特征图上的一个激活，对输入像素求梯度，查看哪些位置的微小变化最能改变该激活。梯度图是局部敏感度的线索，不是完整因果解释；下面的渐变图只用来表达“中心较强、外围较弱”，不是某个真实模型算出的热力图。',
        '所以，“理论感受野覆盖了整张图”只说明存在跨图像的连接路径，不能证明模型充分利用了所有远处上下文。需要结合实际特征、梯度或遮挡实验，并在目标任务与样本上验证。'
      ]
    },
    {
      title:(firstSection+3)+'. 小目标与大目标：用多尺度特征组合细节和语义',
      paragraphs:[
        '常见 CNN 越往深处，空间分辨率越低、语义线索越强、理论感受野越大；浅层通常保留更细的位置和纹理线索。它们是常见趋势，不是每一层都固定“只看边缘”或“只看物体”，通道表示会由任务和训练共同形成。',
        '小目标经过多次下采样后，在特征图上可能只剩少量甚至不足一个网格位置，高分辨率特征因此有助于保留定位线索；但浅层单独使用时语义也可能不够。大目标需要更广的上下文，也仍要有足够的空间信息来定位边界。目标漏检或框不完整不能仅凭感受野大小下结论，还要检查图像缩放、标签、目标分配、锚框或预测头、置信度与后处理。',
        '特征金字塔常把深层语义向上送到高分辨率层，并用横向连接融合相同尺度的浅层特征。FPN 用自顶向下路径和横向连接建立不同分辨率的语义特征；YOLOv5 v6.0 的结构再结合 PAN 路径，使用 P3/8、P4/16、P5/32 三个检测尺度。输入为 640×640 时，它们分别是 80×80、40×40、20×20 的预测网格。',
        '在这类配置中，小目标通常更适合高分辨率预测层，大目标通常更适合粗尺度层；实际由锚框匹配或目标分配、输入尺寸和训练规则共同决定，不是每个目标都被硬性指定到唯一层。多尺度融合很常见，也不是所有检测器必须采用的固定结构。'
      ]
    }
  ];
  lesson.sections.push(...rfSections);
  lesson.keypoints.push(
    '逐层感受野递推：Rₗ=Rₗ₋₁+(Kₑff−1)Jₗ₋₁，Jₗ=Jₗ₋₁×stride；步幅会改变后续层的增长量。',
    '理论感受野是结构上可达的最大范围；有效感受野描述输入影响强弱，区域内贡献并不均匀。',
    '高分辨率特征保留位置细节，深层特征常包含更强语义；融合有助于兼顾两者，但不能保证解决所有检测错误。',
    'YOLOv5 v6.0 示例使用 P3/8、P4/16、P5/32；实际层级匹配取决于模型配置、输入尺寸与目标分配方式。'
  );
  const sources=[
    {url:'https://arxiv.org/abs/1705.07049',label:'Le 与 Borji：CNN 中感受野的定义与逐层计算'},
    {url:'https://arxiv.org/abs/1701.04128',label:'Luo 等：Understanding the Effective Receptive Field in Deep Convolutional Neural Networks'},
    {url:'https://openaccess.thecvf.com/content_cvpr_2017/papers/Lin_Feature_Pyramid_Networks_CVPR_2017_paper.pdf',label:'Lin 等：Feature Pyramid Networks for Object Detection（CVPR 2017）'},
    {url:'https://github.com/ultralytics/yolov5/blob/v6.0/models/yolov5s.yaml',label:'Ultralytics YOLOv5 v6.0 模型配置：P3/8、P4/16、P5/32 与多尺度预测头'}
  ];
  lesson.sources=[...(lesson.sources||[]),...sources.filter(source=>!(lesson.sources||[]).some(item=>item.url===source.url))];

  const previous=window.lessonPlaygrounds||{};
  const escapeHtml=value=>String(value).replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const calcStates=new WeakMap();
  const labels={conv:{label:'3×3 卷积 · s=1',k:3,s:1,d:1},pool:{label:'2×2 池化 · s=2',k:2,s:2,d:1},dilated:{label:'3×3 空洞卷积 · d=2',k:3,s:1,d:2}};
  const presets={
    stacked:[{...labels.conv},{...labels.conv}],
    pooled:[{...labels.conv},{...labels.pool},{...labels.conv}],
    dilated:[{...labels.dilated}]
  };
  function panelHead(kicker,title,copy){return '<div class="vg-panel-head"><div><span>'+kicker+'</span><h4>'+title+'</h4></div><p>'+copy+'</p></div>'}
  function calculatorMarkup(){return '<section class="lesson-playground rf-playground" data-rf="calculator"><div class="vg-panel">'+panelHead('01 · CALCULATE','搭一段网络，跟踪它看见多大一片','点选常见层，观察理论感受野和输出网格间距怎样累积。')+'<div class="rf-preset-row" role="group" aria-label="载入感受野计算示例"><button type="button" data-rf-preset="stacked" aria-pressed="true">连续两个 3×3</button><button type="button" data-rf-preset="pooled" aria-pressed="false">卷积 → 池化 → 卷积</button><button type="button" data-rf-preset="dilated" aria-pressed="false">空洞卷积</button></div><div class="rf-calc-tools" role="group" aria-label="向网络添加层"><button type="button" data-rf-add="conv">＋ 3×3 卷积</button><button type="button" data-rf-add="pool">＋ 2×2 池化</button><button type="button" data-rf-add="dilated">＋ 空洞卷积</button><button type="button" data-rf-undo>撤销一步</button><button type="button" data-rf-reset>重置示例</button></div><div class="rf-calc-layout"><div class="rf-grid-card"><svg data-rf-grid viewBox="0 0 220 220" role="img" aria-label="原图中心位置的理论感受野网格"></svg><p data-rf-grid-caption></p></div><div class="rf-calc-readout"><div class="rf-metrics"><div><span>理论感受野</span><strong data-rf-size></strong></div><div><span>输出点间隔</span><strong data-rf-jump></strong></div></div><ol class="rf-layer-steps" data-rf-steps></ol><p class="rf-note" data-rf-calculation-note aria-live="polite"></p></div></div><p class="vg-caption">这里只追踪空间尺寸和规则网格上的理论覆盖；边缘填充、特征权重、非线性与实际响应强弱未在方格里计算。</p></div></section>'}
  function heatmapMarkup(){return '<section class="lesson-playground rf-playground" data-rf="effective"><div class="vg-panel">'+panelHead('02 · INFLUENCE MAP','方框内部，也有强弱之分','拖动阈值，只显示影响强度达到设定值的示意位置。')+'<div class="rf-effective-layout"><div class="rf-heatmap-card"><svg data-rf-heatmap viewBox="0 0 264 264" role="img" aria-label="中心较强、边缘渐弱的示意影响热力图"></svg><div class="rf-heat-legend"><span>外围较弱</span><i aria-hidden="true"></i><span>中心较强</span></div></div><div class="rf-effective-copy"><div class="rf-metrics"><div><span>理论范围</span><strong>11×11</strong></div><div><span>达到阈值的格子</span><strong data-rf-active-count></strong></div></div><label class="rf-threshold-control">显示门槛 <output data-rf-threshold-label>25%</output><input type="range" min="5" max="80" step="5" value="25" data-rf-threshold aria-label="调节热力图显示阈值"></label><p class="rf-note" data-rf-threshold-copy aria-live="polite"></p><div class="rf-legend-copy"><span class="rf-legend-swatch rf-theory-swatch"></span>外框：理论范围<span class="rf-legend-swatch rf-effective-swatch"></span>亮度：影响强弱</div></div></div><p class="vg-caption">渐变为教学示意，不是从训练模型测出的数据。真实有效感受野会因结构、权重、输入和测量方式变化；它不是固定的另一块正方形。</p></div></section>'}
  function pyramidSvg(){return '<svg class="rf-pyramid-svg" viewBox="0 0 660 252" role="img" aria-label="骨干网络产生三个分辨率层级，颈部通过自顶向下和自底向上路径融合，接到三个预测头"><defs><marker id="rf-arrow-up" markerWidth="7" markerHeight="7" refX="5" refY="3" orient="auto"><path d="M0 0L6 3 0 6" fill="none" stroke="#8b78bf"/></marker><marker id="rf-arrow-down" markerWidth="7" markerHeight="7" refX="5" refY="3" orient="auto"><path d="M0 0L6 3 0 6" fill="none" stroke="#368f82"/></marker></defs><text x="330" y="18" class="rf-svg-caption">骨干网络 · 由细到粗</text><rect class="rf-svg-backbone" x="34" y="34" width="154" height="44" rx="10"/><rect class="rf-svg-backbone" x="253" y="34" width="154" height="44" rx="10"/><rect class="rf-svg-backbone" x="472" y="34" width="154" height="44" rx="10"/><text x="111" y="53">C3 · stride 8</text><text x="111" y="68" class="rf-svg-small">高分辨率 · 细节多</text><text x="330" y="53">C4 · stride 16</text><text x="330" y="68" class="rf-svg-small">中间层级</text><text x="549" y="53">C5 · stride 32</text><text x="549" y="68" class="rf-svg-small">语义强 · 网格粗</text><path class="rf-svg-lateral" d="M111 78V122M330 78V122M549 78V122"/><path class="rf-svg-topdown" marker-end="url(#rf-arrow-up)" d="M516 80C476 103 402 102 363 120M299 80C260 102 186 103 144 120"/><text x="330" y="101" class="rf-svg-pathlabel">自顶向下：传递深层语义</text><rect class="rf-svg-fused" x="34" y="126" width="154" height="42" rx="10"/><rect class="rf-svg-fused" x="253" y="126" width="154" height="42" rx="10"/><rect class="rf-svg-fused" x="472" y="126" width="154" height="42" rx="10"/><text x="111" y="152">融合 P3</text><text x="330" y="152">融合 P4</text><text x="549" y="152">融合 P5</text><path class="rf-svg-bottomup" marker-end="url(#rf-arrow-down)" d="M176 170C212 192 252 192 286 171M395 170C432 192 470 192 504 171"/><text x="330" y="204" class="rf-svg-pathlabel">自底向上：补充定位信息</text><path class="rf-svg-headline" d="M111 170V218M330 170V218M549 170V218"/><circle cx="111" cy="227" r="8" class="rf-svg-head"/><circle cx="330" cy="227" r="8" class="rf-svg-head"/><circle cx="549" cy="227" r="8" class="rf-svg-head"/><text x="111" y="248" class="rf-svg-small">小目标 · P3/8</text><text x="330" y="248" class="rf-svg-small">中目标 · P4/16</text><text x="549" y="248" class="rf-svg-small">大目标 · P5/32</text></svg>'}
  function pyramidMarkup(){return '<section class="lesson-playground rf-playground" data-rf="pyramid"><div class="vg-panel">'+panelHead('03 · MULTI-SCALE','别只选“看得近”或“看得远”','骨干保留不同分辨率，颈部融合位置细节与语义，再由多个尺度预测。')+'<div class="rf-size-controls" role="group" aria-label="选择示意目标大小"><button type="button" data-rf-object="small" aria-pressed="true">小目标</button><button type="button" data-rf-object="medium" aria-pressed="false">中目标</button><button type="button" data-rf-object="large" aria-pressed="false">大目标</button><label>输入图像<select data-rf-input-size aria-label="选择网络输入尺寸"><option value="320">320 × 320</option><option value="640" selected>640 × 640</option><option value="1280">1280 × 1280</option></select></label></div><div class="rf-pyramid-diagram">'+pyramidSvg()+'</div><div class="rf-feature-levels" data-rf-feature-levels></div><p class="rf-note" data-rf-object-note aria-live="polite"></p><p class="vg-caption">方格图案为示意；右侧网格尺寸由输入边长除以 YOLOv5 v6.0 配置中的 stride 得到。适合的预测层还受锚框匹配和目标分配影响。</p><div class="rf-quiz"><h5>快速判断</h5><div class="rf-quiz-grid">'+[
    {q:'两层连续的 3×3、stride=1 卷积，理论感受野是 5×5。',answer:'true',why:'每层覆盖边长增加 2，1→3→5。'},
    {q:'理论感受野里的每个像素，都会对输出产生相同大小的影响。',answer:'false',why:'理论范围描述可达路径；有效影响通常并不均匀。'},
    {q:'小目标用高分辨率特征有帮助，因此浅层特征单独使用就一定足够。',answer:'false',why:'高分辨率保留细节，浅层语义可能不足；跨层融合可同时利用两类信息。'},
    {q:'所有目标检测模型都必须采用 FPN，并且都要使用三个预测尺度。',answer:'false',why:'多尺度很常见；网络结构与尺度数量取决于任务和模型设计。'}
  ].map((item,index)=>'<article class="vg-quiz-card" data-rf-quiz="'+index+'"><h5>'+escapeHtml(item.q)+'</h5><div role="group" aria-label="感受野知识第 '+(index+1)+' 题"><button type="button" data-rf-answer="true">正确</button><button type="button" data-rf-answer="false">不正确</button></div><p data-rf-feedback role="status" aria-live="polite"></p></article>').join('')+'</div></div></div></section>'}

  function stateFor(root){return calcStates.get(root)||[]}
  function footprintSvg(rf){
    const n=Math.max(9,Math.min(19,Math.ceil(rf))),size=Math.min(n,rf),cell=220/n,start=Math.floor((n-size)/2);
    let cells='';
    for(let y=0;y<n;y++)for(let x=0;x<n;x++)cells+='<rect class="rf-grid-cell '+(x>=start&&x<start+size&&y>=start&&y<start+size?'is-in-field':'')+'" x="'+(x*cell+1)+'" y="'+(y*cell+1)+'" width="'+(cell-2)+'" height="'+(cell-2)+'" rx="2"/>';
    return '<svg data-rf-grid viewBox="0 0 220 220" role="img" aria-label="原图中心位置 '+rf+' 乘 '+rf+' 的理论感受野网格">'+cells+'</svg>';
  }
  function updateCalculator(root){
    const layers=stateFor(root);let rf=1,jump=1;
    const rows='<li><span>输入像素</span><b>R=1 · J=1</b></li>'+layers.map(layer=>{const eff=layer.d*(layer.k-1)+1;rf+=(eff-1)*jump;jump*=layer.s;return '<li><span>'+escapeHtml(layer.label)+'</span><b>R='+rf+' · J='+jump+'</b></li>'}).join('');
    root.querySelector('[data-rf-steps]').innerHTML=rows;
    root.querySelector('[data-rf-grid]').outerHTML=footprintSvg(rf);
    root.querySelector('[data-rf-size]').textContent=rf+' × '+rf;
    root.querySelector('[data-rf-jump]').textContent=jump+' 像素';
    root.querySelector('[data-rf-grid-caption]').textContent='中心位置最多沿结构连接到原图中的 '+rf+'×'+rf+' 区域。';
    const notes=[];
    if(layers.some(layer=>layer.s>1))notes.push('步幅大于 1 后，输出特征点之间在原图中相隔 '+jump+' 像素，后续卷积的感受野增长会更快。');
    if(layers.some(layer=>layer.d>1))notes.push('空洞卷积用间隔采样扩大覆盖跨度；这里按有效核宽计算，没有增加卷积核权重数。');
    if(rf>19)notes.push('方格图在 19×19 处封顶显示，数值读数仍按完整网络精确递推。');
    if(!notes.length)notes.push(layers.length?'每层 stride=1，输出点仍相隔 1 个输入像素；理论覆盖随核宽逐层扩张。':'还没有添加网络层。输入像素自身的理论感受野是 1×1。');
    root.querySelector('[data-rf-calculation-note]').textContent=notes.join(' ');
    root.querySelectorAll('[data-rf-preset]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.rfPreset===root.dataset.rfPreset)));
    root.querySelector('[data-rf-undo]').disabled=!layers.length;
  }
  const heatStates=new WeakMap();
  function updateHeatmap(root){
    const threshold=Number(root.querySelector('[data-rf-threshold]').value),n=11,cell=24,center=(n-1)/2,sigma=2.65;
    let nodes='',active=0;
    for(let y=0;y<n;y++)for(let x=0;x<n;x++){
      const distance=(x-center)**2+(y-center)**2,intensity=Math.round(100*Math.exp(-distance/(2*sigma*sigma))),visible=intensity>=threshold;
      if(visible)active++;
      const level=intensity>=80?5:intensity>=55?4:intensity>=32?3:intensity>=15?2:1;
      nodes+='<rect class="rf-heat-cell rf-heat-'+level+(visible?' is-visible':' is-faint')+'" x="'+(x*cell+2)+'" y="'+(y*cell+2)+'" width="20" height="20" rx="4" data-rf-intensity="'+intensity+'"/>';
    }
    root.querySelector('[data-rf-heatmap]').innerHTML='<rect class="rf-theory-outline" x="1" y="1" width="262" height="262" rx="8"/>'+nodes;
    root.querySelector('[data-rf-threshold-label]').textContent=threshold+'%';
    root.querySelector('[data-rf-active-count]').textContent=active+' / 121';
    root.querySelector('[data-rf-threshold-copy]').textContent='在这张示意图里，阈值为 '+threshold+'% 时有 '+active+' 个格子被突出显示。调高门槛，中心强影响区域更明显；淡色外围仍属于理论范围。';
  }
  const targets={small:{label:'小目标',level:'P3',stride:8,copy:'高分辨率 P3 网格保留更多位置，适合小目标的密集定位；融合后的语义线索也很重要。'},medium:{label:'中目标',level:'P4',stride:16,copy:'中等分辨率 P4 在位置细节与上下文范围之间折中，实际目标分配仍看模型规则。'},large:{label:'大目标',level:'P5',stride:32,copy:'较粗的 P5 网格对应更大上下文范围；大目标仍需要足够空间信息来回归边界。'}};
  function miniGrid(level,count,inputSize){
    const stride=level==='P3'?8:level==='P4'?16:32,actual=inputSize/stride,draw=level==='P3'?8:level==='P4'?6:4;
    let cells='';for(let i=0;i<draw*draw;i++)cells+='<i aria-hidden="true"></i>';
    return '<div class="rf-level-card '+(count?'is-selected':'')+'" data-rf-level="'+level+'"><div class="rf-level-top"><strong>'+level+'</strong><span>stride '+stride+'</span></div><div class="rf-mini-grid rf-grid-'+level.toLowerCase()+'" style="--rf-grid-count:'+draw+'">'+cells+'</div><div class="rf-level-dims">'+actual+' × '+actual+' 网格</div><small>输入 '+inputSize+' ÷ '+stride+'</small></div>';
  }
  function updatePyramid(root,key){
    const target=targets[key],inputSize=Number(root.querySelector('[data-rf-input-size]').value);
    root.dataset.rfObject=key;
    root.querySelectorAll('[data-rf-object]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.rfObject===key)));
    root.querySelector('[data-rf-feature-levels]').innerHTML=['P3','P4','P5'].map(level=>miniGrid(level,level===target.level,inputSize)).join('');
    root.querySelector('[data-rf-object-note]').textContent=target.label+'：先观察 '+target.level+'（stride '+target.stride+'）这一层的网格与信息，再结合融合特征、目标匹配结果和验证集指标判断。'+target.copy;
  }
  const quiz=[
    {q:'两层连续的 3×3、stride=1 卷积，理论感受野是 5×5。',answer:'true',why:'每层覆盖边长增加 2，1→3→5。'},
    {q:'理论感受野里的每个像素，都会对输出产生相同大小的影响。',answer:'false',why:'理论范围描述可达路径；有效影响通常并不均匀。'},
    {q:'小目标用高分辨率特征有帮助，因此浅层特征单独使用就一定足够。',answer:'false',why:'高分辨率保留细节，浅层语义可能不足；跨层融合可同时利用两类信息。'},
    {q:'所有目标检测模型都必须采用 FPN，并且都要使用三个预测尺度。',answer:'false',why:'多尺度很常见；网络结构与尺度数量取决于任务和模型设计。'}
  ];
  function initialize(){
    previous.initialize?.();
    document.querySelectorAll('[data-rf="calculator"]').forEach(root=>{calcStates.set(root,presets.stacked.map(layer=>({...layer})));root.dataset.rfPreset='stacked';updateCalculator(root)});
    document.querySelectorAll('[data-rf="effective"]').forEach(updateHeatmap);
    document.querySelectorAll('[data-rf="pyramid"]').forEach(root=>updatePyramid(root,'small'));
  }
  window.lessonPlaygrounds={
    render(id,index){
      if(id==='cnn'){
        if(index===firstSection)return calculatorMarkup();
        if(index===firstSection+1)return heatmapMarkup();
        if(index===firstSection+2)return pyramidMarkup();
      }
      return previous.render?.(id,index)||'';
    },
    initialize
  };
  document.addEventListener('click',event=>{
    const button=event.target.closest('button');if(!button)return;
    const calcRoot=button.closest('[data-rf="calculator"]');
    if(calcRoot){
      if(button.dataset.rfPreset){calcStates.set(calcRoot,presets[button.dataset.rfPreset].map(layer=>({...layer})));calcRoot.dataset.rfPreset=button.dataset.rfPreset;updateCalculator(calcRoot)}
      if(button.dataset.rfAdd){const key=button.dataset.rfAdd;calcStates.set(calcRoot,[...stateFor(calcRoot),{...labels[key]}]);calcRoot.dataset.rfPreset='';updateCalculator(calcRoot)}
      if(button.hasAttribute('data-rf-undo')){calcStates.set(calcRoot,stateFor(calcRoot).slice(0,-1));calcRoot.dataset.rfPreset='';updateCalculator(calcRoot)}
      if(button.hasAttribute('data-rf-reset')){calcStates.set(calcRoot,presets.stacked.map(layer=>({...layer})));calcRoot.dataset.rfPreset='stacked';updateCalculator(calcRoot)}
    }
    const pyramidRoot=button.closest('[data-rf="pyramid"]');
    if(pyramidRoot&&button.dataset.rfObject)updatePyramid(pyramidRoot,button.dataset.rfObject);
    const card=button.closest('[data-rf-quiz]');
    if(card&&button.dataset.rfAnswer){const item=quiz[Number(card.dataset.rfQuiz)],correct=button.dataset.rfAnswer===item.answer;card.querySelectorAll('[data-rf-answer]').forEach(answer=>{const selected=answer===button;answer.setAttribute('aria-pressed',String(selected));answer.classList.toggle('is-correct',selected&&correct);answer.classList.toggle('is-wrong',selected&&!correct)});card.querySelector('[data-rf-feedback]').textContent=(correct?'判断正确。':'再想一想。')+item.why}
  });
  document.addEventListener('input',event=>{
    const root=event.target.closest('[data-rf="effective"]');if(root&&event.target.matches('[data-rf-threshold]'))updateHeatmap(root);
    const pyramid=event.target.closest('[data-rf="pyramid"]');if(pyramid&&event.target.matches('[data-rf-input-size]'))updatePyramid(pyramid,pyramid.dataset.rfObject||'small');
  });
  document.addEventListener('change',event=>{const root=event.target.closest('[data-rf="pyramid"]');if(root&&event.target.matches('[data-rf-input-size]'))updatePyramid(root,root.dataset.rfObject||'small')});
})();
