/* Embed Adam W. Harley's interactive CNN visualization in the CNN chapter. */
(()=>{
  const lesson=lessons.find(item=>item.id==='cnn');
  if(!lesson)return;

  const sectionTitle='交互延伸：亲眼看 CNN 怎样识别手写数字';
  lesson.sections.push({title:sectionTitle,paragraphs:[
    '下面的交互演示把手写数字送入一个已经训练好的卷积神经网络。你可以画一个数字，再观察输入、卷积、下采样和全连接层的响应怎样逐步变化；隐藏部分图层能让当前处理阶段更清楚。',
    '这个示例网络接收 32×32 的灰度图：两组 5×5 卷积滤波器分别产生 6 个和 16 个特征通道，每组后接 2×2 最大池化，最后经过 120、100 和 10 个单元的全连接层。下方的尺寸流程对应这个演示中的具体模型，不是所有 CNN 都采用的固定结构。',
    '这是用于手写数字分类的预训练示例。它不会在本页训练模型，也不能载入 YOLOv5 权重；绘制时尽量把数字写得端正并放在画布中央。网络给出的类别也只是模型判断，输入不清晰时可能会认错。'
  ]});
  lesson.goals.push('沿一个可视化的手写数字分类网络观察卷积、池化与全连接层的前向响应。');
  lesson.keypoints.push(
    'nn_vis 展示固定的手写数字分类网络；画布输入会改变各层的激活响应。',
    '该演示的卷积与池化尺寸属于它的具体模型，不能当成所有 CNN 的统一模板。',
    '演示提供预训练推理可视化，不包含模型训练，也不加载 YOLOv5。'
  );
  const sources=[
    {url:'https://adamharley.com/nn_vis/',label:'Adam W. Harley：交互式 CNN 网络可视化与论文说明（ISVC 2015）'},
    {url:'https://github.com/aharley/nn_vis',label:'nn_vis GitHub 源码仓库'},
    {url:'https://github.com/aharley/nn_vis/blob/master/LICENSE',label:'nn_vis MIT License'}
  ];
  lesson.sources=[...(lesson.sources||[]),...sources.filter(source=>!(lesson.sources||[]).some(existing=>existing.url===source.url))];

  const previous=window.lessonPlaygrounds||{};
  const sectionIndex=lesson.sections.length-1;
  const demoUrl='https://adamharley.com/nn_vis/cnn/3d.html';
  function visualizerMarkup(){
    const stages=[
      ['输入','32 × 32','灰度像素'],
      ['卷积 1','28 × 28 × 6','6 个 5×5 滤波器'],
      ['最大池化','14 × 14 × 6','2×2 · stride 2'],
      ['卷积 2','10 × 10 × 16','16 个 5×5 滤波器'],
      ['最大池化','5 × 5 × 16','2×2 · stride 2'],
      ['全连接','120 → 100','组合图像特征'],
      ['输出','10 类','数字 0–9']
    ];
    const flow=stages.map(([name,shape,detail],index)=>
      (index?'<span class="nnvis-arrow" aria-hidden="true">→</span>':'')+
      '<div class="nnvis-stage"><span>'+name+'</span><strong>'+shape+'</strong><small>'+detail+'</small></div>'
    ).join('');
    return '<section class="lesson-playground nnvis-playground" aria-labelledby="nnvis-title">'
      +'<div class="nnvis-heading"><span>INTERACTIVE CNN · 外部交互演示</span><h3 id="nnvis-title">让手写数字在网络里逐层变成判断</h3><p>在画板中写一个居中的数字，再观察网络各层的节点响应。可以切换图层可见性；如果页面内嵌显示受限，也可以直接打开原演示。</p></div>'
      +'<div class="nnvis-flow" role="img" aria-label="此演示的网络结构：32乘32输入，卷积与池化两次，全连接120和100个单元，最后输出10个数字类别">'+flow+'</div>'
      +'<ol class="nnvis-guide"><li><b>先画数字</b><span>写一个清晰、端正并尽量居中的数字。</span></li><li><b>再看响应</b><span>观察卷积和下采样层中的激活变化。</span></li><li><b>最后看输出</b><span>对照 0–9 的输出，留意模型何时会混淆。</span></li></ol>'
      +'<figure class="nnvis-demo"><div class="nnvis-demo-bar"><figcaption><strong>3D 卷积网络可视化</strong><span>演示由原作者网站提供</span></figcaption><a href="'+demoUrl+'" target="_blank" rel="noopener noreferrer">打开原演示 ↗</a></div>'
      +'<div class="nnvis-frame-shell"><iframe src="'+demoUrl+'" title="Adam W. Harley 的交互式 3D 卷积神经网络演示" loading="lazy" referrerpolicy="strict-origin-when-cross-origin" sandbox="allow-scripts allow-same-origin allow-pointer-lock allow-presentation" allow="fullscreen" allowfullscreen>当前浏览器无法显示内嵌页面。<a href="'+demoUrl+'" target="_blank" rel="noopener noreferrer">打开原演示</a></iframe></div></figure>'
      +'<aside class="nnvis-scope"><strong>适用范围</strong><p>这是 2015 年发布的手写数字分类示例，用于观察网络结构与激活行为。它的预测来自固定的预训练模型，不代表 YOLOv5 的结构或检测结果。</p></aside>'
      +'<div class="nnvis-credit"><span>出处与许可</span><p>Adam W. Harley, “An Interactive Node-Link Visualization of Convolutional Neural Networks,” ISVC, pp. 867–877, 2015.</p><a href="https://github.com/aharley/nn_vis" target="_blank" rel="noopener noreferrer">GitHub 源码 ↗</a><a href="https://github.com/aharley/nn_vis/blob/master/LICENSE" target="_blank" rel="noopener noreferrer">MIT License ↗</a></div>'
      +'</section>';
  }
  window.lessonPlaygrounds={
    render(id,index){return id==='cnn'&&index===sectionIndex?visualizerMarkup():(previous.render?.(id,index)||'')},
    initialize(){previous.initialize?.()}
  };
})();
