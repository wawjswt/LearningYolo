/* 池化的局部平移容忍度示意：突出“有条件的局部稳定”，避免把它说成绝对不变。 */
(()=>{
  const lesson=lessons.find(item=>item.id==='pooling');
  if(!lesson||!window.lessonPlaygrounds||!lesson.sections[2])return;

  lesson.goals.push('解释池化对同一窗口内的小幅位移可能保持响应，但跨窗口后输出位置会改变。');
  lesson.sections[2].paragraphs.push('下面移动一个强激活，观察它在 2×2、stride=2 池化网格中的位置。示意图只展示一个激活值在池化窗口间的关系；真实图像还会经过多层卷积、边界填充和采样，池化不保证整个网络对任意平移保持相同预测。');
  lesson.keypoints.push('池化带来的位置容忍度取决于窗口与步幅；跨越池化网格边界时，输出位置仍会改变。');
  lesson.sources=[...(lesson.sources||[]),
    {url:'https://docs.pytorch.org/docs/stable/generated/torch.nn.MaxPool2d.html',label:'PyTorch MaxPool2d：最大值、窗口、步幅与输出形状'},
    {url:'https://docs.pytorch.org/docs/stable/generated/torch.nn.AvgPool2d.html',label:'PyTorch AvgPool2d：窗口平均、步幅与填充值规则'},
    {url:'https://docs.pytorch.org/docs/stable/generated/torch.nn.Conv2d.html',label:'PyTorch Conv2d：可学习权重、输出通道与步幅'},
    {url:'https://arxiv.org/abs/2103.10097',label:'Stride and Translation Invariance in CNNs：下采样、平移与泛化的权衡'}
  ];

  const baseRender=window.lessonPlaygrounds.render;
  const baseInitialize=window.lessonPlaygrounds.initialize;
  function shiftMarkup(){
    return '<section class="lesson-playground pooling-shift-playground" data-pooling-shift data-pooling-shift-col="0" data-pooling-shift-method="max" aria-labelledby="pooling-shift-title">'
      +'<div class="playground-heading"><div><span class="playground-kicker">互动图解 · 局部位置容忍度</span><h3 id="pooling-shift-title">移动一个响应，池化输出会跟着变吗？</h3><p>拖动滑杆，让一个强激活横向移动。窗口内移动可能落在同一个输出格；跨过窗口边界后，输出格会换位置。</p></div><button type="button" class="playground-reset" data-pooling-shift-reset>回到起点</button></div>'
      +'<div class="pooling-shift-methods" role="group" aria-label="选择池化计算方法"><button type="button" data-pooling-shift-method-choice="max" aria-pressed="true">最大池化</button><button type="button" data-pooling-shift-method-choice="avg" aria-pressed="false">平均池化</button></div>'
      +'<div class="pooling-shift-svg-wrap" data-pooling-shift-svg></div>'
      +'<label class="playground-range pooling-shift-range"><span>强激活所在列 <output data-pooling-shift-col-value>1</output></span><input type="range" min="0" max="3" step="1" value="0" data-pooling-shift-col aria-label="移动特征图中强激活所在的列"></label>'
      +'<p class="pooling-shift-status" data-pooling-shift-status role="status" aria-live="polite"></p>'
      +'<p class="playground-footnote">这是特征图上的数值示意，不是原始图像的边缘检测。这里使用 4×4 输入、2×2 窗口和 stride=2；模型中的边界、其他激活和后续层都会影响最终预测。</p></section>';
  }
  function updateShift(root){
    const col=Number(root.dataset.poolingShiftCol||0),method=root.dataset.poolingShiftMethod||'max',outCol=Math.floor(col/2),outValue=method==='max'?'4':'1';
    root.querySelector('[data-pooling-shift-col]').value=String(col);
    root.querySelector('[data-pooling-shift-col-value]').textContent=String(col+1);
    root.querySelectorAll('[data-pooling-shift-method-choice]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.poolingShiftMethodChoice===method)));
    let svg='<svg viewBox="0 0 740 270" role="img" aria-label="4 乘 4 输入特征图中一个强激活移动经过两个 2 乘 2 池化窗口，右边显示池化后的 2 乘 2 输出">';
    svg+='<text x="28" y="30" class="pooling-shift-svg-title">输入特征图 · 4 × 4</text><text x="474" y="30" class="pooling-shift-svg-title">输出特征图 · 2 × 2</text>';
    svg+='<text x="28" y="48" class="pooling-shift-svg-note">每格是上游网络产生的激活</text><text x="474" y="48" class="pooling-shift-svg-note">2 × 2 窗口 · stride=2</text>';
    const x0=28,y0=62,cell=42;
    for(let r=0;r<4;r++)for(let c=0;c<4;c++){
      const active=r===1&&c===col,x=x0+c*cell,y=y0+r*cell;
      svg+='<g><rect x="'+x+'" y="'+y+'" width="38" height="38" rx="5" class="pooling-shift-cell'+(active?' is-active':'')+'"/><text x="'+(x+19)+'" y="'+(y+24)+'" text-anchor="middle" class="pooling-shift-cell-value">'+(active?'4':'0')+'</text></g>';
    }
    const ox=474,oy=76,outCell=78;
    for(let r=0;r<2;r++)for(let c=0;c<2;c++){
      const selected=r===0&&c===outCol,x=ox+c*outCell,y=oy+r*outCell,value=selected?outValue:'0';
      svg+='<g><rect x="'+x+'" y="'+y+'" width="68" height="68" rx="7" class="pooling-shift-output'+(selected?' is-selected':'')+'"/><text x="'+(x+34)+'" y="'+(y+42)+'" text-anchor="middle" class="pooling-shift-output-value">'+value+'</text><text x="'+(x+34)+'" y="'+(y+83)+'" text-anchor="middle" class="pooling-shift-output-label">格 '+(r+1)+','+(c+1)+'</text></g>';
    }
    svg+='<path d="M245 145H405m-8-7 8 7-8 7" class="pooling-shift-arrow"/><text x="325" y="132" text-anchor="middle" class="pooling-shift-arrow-label">池化汇总</text>';
    svg+='<rect x="'+(x0+Math.floor(col/2)*cell*2-3)+'" y="'+(y0-3)+'" width="'+(cell*2-4)+'" height="'+(cell*2-4)+'" rx="8" class="pooling-shift-window"/>';
    svg+='</svg>';
    root.querySelector('[data-pooling-shift-svg]').innerHTML=svg;
    root.querySelector('[data-pooling-shift-status]').textContent=col%2===0
      ?'当前强激活在第 '+(col+1)+' 列，汇总到输出第 '+(outCol+1)+' 列。最大池化取 4；平均池化把窗口中的 4 平均到 1。'
      :col===3
        ?'强激活在第 4 列，仍落在右侧同一个池化窗口；移回第 3 列时才跨过边界，输出位置会换格。'
        :'当前强激活移到同一窗口的第 '+(col+1)+' 列，输出格没有改变；继续向右越过窗口边界后，输出位置才会换格。';
  }
  window.lessonPlaygrounds.render=function(lessonId,sectionIndex){
    const markup=baseRender(lessonId,sectionIndex);
    return lessonId==='pooling'&&sectionIndex===2?markup+shiftMarkup():markup;
  };
  window.lessonPlaygrounds.initialize=function(){
    baseInitialize();
    document.querySelectorAll('[data-pooling-shift]').forEach(updateShift);
  };
  document.addEventListener('input',event=>{
    const slider=event.target.closest('[data-pooling-shift-col]');
    if(!slider)return;
    const root=slider.closest('[data-pooling-shift]');root.dataset.poolingShiftCol=slider.value;updateShift(root);
  });
  document.addEventListener('click',event=>{
    const method=event.target.closest('[data-pooling-shift-method-choice]');
    if(method){const root=method.closest('[data-pooling-shift]');root.dataset.poolingShiftMethod=method.dataset.poolingShiftMethodChoice;updateShift(root);return}
    const reset=event.target.closest('[data-pooling-shift-reset]');
    if(reset){const root=reset.closest('[data-pooling-shift]');root.dataset.poolingShiftCol='0';root.dataset.poolingShiftMethod='max';updateShift(root)}
  });
})();
