/* A compact, shape-aware walkthrough of a CNN image-classification forward pass. */
(()=>{
  const lesson=lessons.find(item=>item.id==="cnn");
  if(!lesson)return;

  lesson.goals.push(
    "沿着一条分类网络前向路径追踪图像张量的形状变化。",
    "区分分类推理时展示概率的 Softmax 与训练时直接接收 logits 的交叉熵。",
    "知道展平全连接分类头只是一种结构，检测网络还需要保留空间位置。"
  );
  lesson.sections.push({title:"13. 把 CNN 识图链路接起来：从像素到类别",paragraphs:[
    "先分清图像排列方式。图像库常把一张 RGB 图像写成 H×W×C；PyTorch 卷积网络通常接收 [N,C,H,W]，N 是批次，C 是通道。像素缩放或均值方差归一化要遵循模型的训练预处理。",
    "卷积层在局部窗口做乘加，并把各输入通道的贡献合并成输出通道；ReLU 逐元素处理数值，不改变形状。池化用固定窗口汇总局部响应，常见 2×2、步幅 2 会让特征图的宽高减半。池化不是每个 CNN 都必须使用的层。",
    "分类器可以把 [C,H,W] 特征展平成一条向量，再由全连接层映射成每个类别一个 logit。Flatten 只按顺序重排元素，批次轴 N 要保留；它本身不提取特征。全连接层能组合特征，但不再显式保留二维网格。",
    "单标签互斥分类在推理展示时可对 logits 做 Softmax，得到总和为 1 的类别概率。训练时通常把原始 logits 和类别编号交给 CrossEntropyLoss；该损失内部完成 log-softmax 相关计算，再由反向传播计算梯度、由优化器更新可学习参数。",
    "这条链路是一个小型图像分类器示例。检测网络要回答物体在哪里，通常继续保留空间特征图，由检测头在多个位置或尺度上输出预测；YOLO 的 Backbone、Neck、Head 就是另一种任务结构。"
  ]});
  lesson.keypoints.push(
    "PyTorch 图像批次通常为 [N,C,H,W]；HWC 与 NCHW 是轴顺序差异。",
    "卷积改变特征值与输出通道，ReLU 保持形状，池化或步幅卷积可缩小空间分辨率。",
    "Flatten(start_dim=1) 保留批次轴，把每张图的 C、H、W 合成特征向量。",
    "分类推理可把 logits 转成 Softmax 概率；训练交叉熵直接使用 logits。",
    "展平全连接是分类头的一种设计；检测任务通常必须保留位置网格。"
  );
  const newSources=[
    {url:"https://docs.pytorch.org/docs/stable/generated/torch.nn.Conv2d.html",label:"PyTorch Conv2d：输入输出形状、通道与卷积计算"},
    {url:"https://docs.pytorch.org/docs/stable/generated/torch.nn.MaxPool2d.html",label:"PyTorch MaxPool2d：窗口、步幅与下采样"},
    {url:"https://docs.pytorch.org/docs/stable/generated/torch.flatten.html",label:"PyTorch torch.flatten：按顺序重排张量元素"},
    {url:"https://docs.pytorch.org/docs/stable/generated/torch.nn.Linear.html",label:"PyTorch Linear：从特征向量到类别分数"},
    {url:"https://docs.pytorch.org/docs/stable/generated/torch.nn.Softmax.html",label:"PyTorch Softmax：沿类别维度归一化分数"},
    {url:"https://docs.pytorch.org/docs/stable/generated/torch.nn.CrossEntropyLoss.html",label:"PyTorch CrossEntropyLoss：以 logits 和标签计算分类损失"},
    {url:"https://docs.ultralytics.com/yolov5/tutorials/architecture-description/",label:"Ultralytics YOLOv5 架构：Backbone、Neck 与检测 Head"}
  ];
  lesson.sources=[...(lesson.sources||[]),...newSources.filter(source=>!(lesson.sources||[]).some(existing=>existing.url===source.url))];
  lesson.code="import torch\nfrom torch import nn\n\n# 小型 RGB 图像分类器：输入 [N, 3, 32, 32]\nmodel = nn.Sequential(\n    nn.Conv2d(3, 8, kernel_size=3, padding=1),\n    nn.ReLU(),\n    nn.MaxPool2d(kernel_size=2, stride=2),\n    nn.Conv2d(8, 16, kernel_size=3, padding=1),\n    nn.ReLU(),\n    nn.MaxPool2d(kernel_size=2, stride=2),\n    nn.Flatten(start_dim=1),  # [N, 16, 8, 8] -> [N, 1024]\n    nn.Linear(16 * 8 * 8, 3), # 输出 3 个未归一化类别分数\n)\n\nimages = torch.randn(4, 3, 32, 32)\nlabels = torch.tensor([0, 1, 2, 1])\nlogits = model(images)                         # [4, 3]\nloss = nn.CrossEntropyLoss()(logits, labels)  # 训练时直接传 logits\nprobabilities = logits.softmax(dim=1)          # 需要展示概率时再转换";
  lesson.language="Python";

  const steps=[
    {label:"输入图像",title:"图像先成为张量",copy:"一批图像的形状按 [N,C,H,W] 记录。N=1、RGB 三通道；本例选 32×32 或 64×64 输入。",icon:"image"},
    {label:"卷积 + ReLU",title:"局部计算，接上非线性",copy:"Conv2d(3,8,3,padding=1) 提取并组合局部响应；ReLU 把负响应变为 0，空间尺寸保持。",icon:"feature"},
    {label:"池化 1",title:"把空间网格缩小一半",copy:"2×2 窗口、步幅 2 将相邻响应汇总。通道数不变，H 与 W 各减半。",icon:"pool"},
    {label:"卷积 + ReLU",title:"继续组合更丰富的模式",copy:"第二个卷积把 8 个输入通道混合成 16 个输出通道；ReLU 仍不改变张量形状。",icon:"feature"},
    {label:"池化 2",title:"再次压缩空间位置",copy:"第二次 2×2 池化后，32×32 输入留下 8×8 网格；64×64 输入留下 16×16 网格。",icon:"pool"},
    {label:"Flatten",title:"每张图整理成一条向量",copy:"把每个样本的 C、H、W 合并为一个特征轴，N 保持不变。空间坐标可由元素顺序还原。",icon:"flatten"},
    {label:"Linear",title:"全连接层给出 logits",copy:"每个输出单元从整条特征向量读取信息，产生一个类别分数。logits 还不是概率。",icon:"head"},
    {label:"训练 / 推理",title:"从 logits 分成两种后续用法",copy:"训练用 logits 和标签算损失；推理展示互斥类别的概率时，才对 logits 做 Softmax。",icon:"branch"}
  ];
  const previous=window.lessonPlaygrounds||{};
  const flowSectionIndex=12;
  const sizeOptions='<option value="32" selected>32 × 32</option><option value="64">64 × 64</option>';
  function vectorWidth(size){return 16*Math.pow(size/4,2)}
  function stageShape(index,size,mode){
    const half=size/2,quarter=size/4;
    const shapes=["[1, 3, "+size+", "+size+"]","[1, 8, "+size+", "+size+"]","[1, 8, "+half+", "+half+"]","[1, 16, "+half+", "+half+"]","[1, 16, "+quarter+", "+quarter+"]","[1, "+vectorWidth(size)+"]","[1, 3] logits",mode==="train"?"标量 loss":"[1, 3] 概率"];
    return shapes[index];
  }
  function iconMarkup(kind){
    if(kind==="image")return '<svg viewBox="0 0 60 48" aria-hidden="true"><rect x="4" y="4" width="52" height="40" rx="4" fill="#f2efe8" stroke="#bdb8ae"/><path d="M8 34 20 21l9 9 8-12 15 16v6H8Z" fill="#8b78b4"/><circle cx="43" cy="14" r="4" fill="#79a997"/></svg>';
    if(kind==="feature")return '<svg viewBox="0 0 60 48" aria-hidden="true"><rect x="9" y="12" width="35" height="28" rx="3" fill="#d9d1e9" stroke="#77659f"/><rect x="15" y="7" width="35" height="28" rx="3" fill="#e8e3f2" stroke="#77659f"/><rect x="21" y="3" width="35" height="28" rx="3" fill="#f3f0f8" stroke="#77659f"/><path d="M26 10h8v7h-8zm12 0h8v7h-8zm-12 10h8v7h-8z" fill="#8a78b2"/></svg>';
    if(kind==="pool")return '<svg viewBox="0 0 60 48" aria-hidden="true"><path d="M12 8h16v14H12zm20 0h16v14H32zM12 26h16v14H12zm20 0h16v14H32z" fill="#ded8ec" stroke="#78669f"/><path d="m20 16 20 16" stroke="#4e907e" stroke-width="2.5"/><circle cx="42" cy="32" r="5" fill="#4e907e"/></svg>';
    if(kind==="flatten")return '<svg viewBox="0 0 60 48" aria-hidden="true"><path d="M8 11h8v8H8zm12 0h8v8h-8zm12 0h8v8h-8zm12 0h8v8h-8zM8 28h8v8H8zm12 0h8v8h-8zm12 0h8v8h-8zm12 0h8v8h-8z" fill="#ddd6eb" stroke="#78669f"/><path d="M8 42h44" stroke="#4e907e" stroke-width="3" stroke-linecap="round"/></svg>';
    if(kind==="head")return '<svg viewBox="0 0 60 48" aria-hidden="true"><circle cx="12" cy="12" r="4" fill="#9584bb"/><circle cx="12" cy="24" r="4" fill="#9584bb"/><circle cx="12" cy="36" r="4" fill="#9584bb"/><path d="M18 12 38 18M18 24h20M18 36 38 30" stroke="#b4abca"/><rect x="39" y="13" width="14" height="8" rx="2" fill="#6b9f8e"/><rect x="39" y="26" width="10" height="8" rx="2" fill="#8b78b4"/></svg>';
    return '<svg viewBox="0 0 60 48" aria-hidden="true"><circle cx="13" cy="24" r="5" fill="#9584bb"/><path d="M20 24h12M32 24 42 12M32 24l10 12" stroke="#9185ab" stroke-width="2"/><rect x="43" y="7" width="13" height="13" rx="3" fill="#e6e0f0" stroke="#78669f"/><rect x="43" y="28" width="13" height="13" rx="3" fill="#dcece5" stroke="#4e907e"/></svg>';
  }
  function pipelineMarkup(){
    const track=steps.map((step,index)=>'<button type="button" class="cnn-pipe-step" data-cnn-pipe-step="'+index+'" aria-pressed="'+String(index===0)+'"><span class="cnn-pipe-icon">'+iconMarkup(step.icon)+'</span><b>'+step.label+'</b><small data-cnn-pipe-step-shape="'+index+'">'+stageShape(index,32,"predict")+'</small></button>').join('<span class="cnn-pipe-arrow" aria-hidden="true">→</span>');
    const sliders=[0,1,2].map(index=>'<label class="cnn-pipe-logit"><span>类别 '+String.fromCharCode(65+index)+' <output data-cnn-pipe-logit-value="'+index+'">'+[0.5,1.4,-0.2][index].toFixed(1)+'</output></span><input type="range" min="-3" max="3" step="0.1" value="'+[0.5,1.4,-0.2][index]+'" data-cnn-pipe-logit="'+index+'" aria-label="类别 '+String.fromCharCode(65+index)+' 的 logit"></label>').join('');
    const bars=[0,1,2].map(index=>'<div class="cnn-pipe-prob-row"><b>类别 '+String.fromCharCode(65+index)+'</b><span class="cnn-pipe-prob-track"><i data-cnn-pipe-prob-bar="'+index+'"></i></span><output data-cnn-pipe-prob="'+index+'">—</output></div>').join('');
    return '<section class="lesson-playground cnn-playground cnn-pipeline-playground" data-cnn-pipeline data-step="0" data-mode="predict" aria-labelledby="cnn-pipeline-title">'+
      '<div class="cnn-play-head"><span>INTERACTIVE · CNN 前向路径</span><h3 id="cnn-pipeline-title">一张图怎样变成类别分数？</h3><p>选中某一站看张量形状；改变图像尺寸，观察空间网格和展平长度怎样一起变化。</p></div>'+
      '<div class="cnn-pipe-toolbar"><label>输入图像尺寸<select data-cnn-pipe-size aria-label="选择输入图像边长">'+sizeOptions+'</select></label><span>示例：RGB · 2 组 Conv → ReLU → MaxPool · 3 个候选类别</span></div>'+
      '<div class="cnn-pipe-track" role="group" aria-label="选择 CNN 前向路径中的一个阶段">'+track+'</div>'+
      '<div class="cnn-pipe-current"><div class="cnn-pipe-current-visual" data-cnn-pipe-visual>'+iconMarkup("image")+'</div><div class="cnn-pipe-current-copy"><span data-cnn-pipe-kicker>第 1 站 · 数据输入</span><h4 data-cnn-pipe-title>'+steps[0].title+'</h4><code data-cnn-pipe-shape>[1, 3, 32, 32]</code><p data-cnn-pipe-copy>'+steps[0].copy+'</p></div></div>'+
      '<div class="cnn-pipe-output"><div class="cnn-pipe-output-heading"><div><span class="cnn-pipe-eyebrow">LOGITS · 手动设定的示例分数</span><h4>调一调分数，看看 Softmax 与交叉熵</h4></div><div class="cnn-pipe-mode" role="group" aria-label="选择训练或推理展示"><button type="button" data-cnn-pipe-mode="predict" aria-pressed="true">推理看概率</button><button type="button" data-cnn-pipe-mode="train" aria-pressed="false">训练算损失</button></div></div>'+
      '<div class="cnn-pipe-logit-controls">'+sliders+'</div>'+
      '<div data-cnn-pipe-predict><div class="cnn-pipe-probabilities">'+bars+'</div><p class="cnn-pipe-feedback" data-cnn-pipe-prediction aria-live="polite">选择最高概率类别。</p></div>'+
      '<div data-cnn-pipe-train hidden><label class="cnn-pipe-target">真实类别<select data-cnn-pipe-target aria-label="选择交叉熵目标类别"><option value="0">类别 A</option><option value="1" selected>类别 B</option><option value="2">类别 C</option></select></label><p class="cnn-pipe-feedback" data-cnn-pipe-loss aria-live="polite"></p></div>'+
      '<p class="cnn-pipe-footnote">这些 logit 是可调的教学数值，不是实际网络推理结果。训练时直接将 logits 和类别标签传给 <code>CrossEntropyLoss</code>；只有需要展示类别概率时才显式使用 Softmax。</p></div>'+
      '<div class="cnn-pipe-task-note"><strong>分类与检测的分岔</strong><span>分类头可把整张特征图展平后输出一个类别向量。目标检测要保留空间网格，才能为不同位置预测边框与类别；不要把这张分类示意图当作 YOLO 的逐层结构。</span></div>'+
      '</section>';
  }
  function updatePipeline(root){
    const size=Number(root.querySelector('[data-cnn-pipe-size]').value),step=Math.max(0,Math.min(7,Number(root.dataset.step)||0)),mode=root.dataset.mode||"predict";
    root.querySelectorAll('[data-cnn-pipe-step]').forEach(button=>{
      const index=Number(button.dataset.cnnPipeStep);
      button.setAttribute("aria-pressed",String(index===step));
      button.querySelector('[data-cnn-pipe-step-shape]').textContent=stageShape(index,size,mode);
    });
    const selected=steps[step];
    root.querySelector('[data-cnn-pipe-kicker]').textContent="第 "+(step+1)+" 站 · "+(step===0?"数据输入":step===7?(mode==="train"?"训练分支":"推理分支"):selected.label);
    root.querySelector('[data-cnn-pipe-title]').textContent=step===7?(mode==="train"?"logits + 标签 → 分类损失":"logits → Softmax 概率"):selected.title;
    root.querySelector('[data-cnn-pipe-shape]').textContent=stageShape(step,size,mode);
    root.querySelector('[data-cnn-pipe-copy]').textContent=step===7?(mode==="train"?"CrossEntropyLoss 内部完成稳定的 log-softmax 计算，再比较真实类与预测分布；梯度沿计算图回传，更新卷积核与全连接权重。":"Softmax 沿类别维度把三个 logits 变成和为 1 的数值，可用于解释预测置信分布。"):selected.copy;
    root.querySelector('[data-cnn-pipe-visual]').innerHTML=iconMarkup(selected.icon);
    root.querySelectorAll('[data-cnn-pipe-mode]').forEach(button=>button.setAttribute("aria-pressed",String(button.dataset.cnnPipeMode===mode)));
    root.querySelector('[data-cnn-pipe-predict]').hidden=mode!=="predict";
    root.querySelector('[data-cnn-pipe-train]').hidden=mode!=="train";
    root.querySelector('[data-cnn-pipe-step="7"]').setAttribute("aria-label",mode==="train"?"第 8 站，训练分支，计算交叉熵损失":"第 8 站，推理分支，Softmax 概率");
    const values=[0,1,2].map(index=>Number(root.querySelector('[data-cnn-pipe-logit="'+index+'"]').value));
    const max=Math.max(...values),exp=values.map(value=>Math.exp(value-max)),sum=exp.reduce((total,value)=>total+value,0),probabilities=exp.map(value=>value/sum);
    probabilities.forEach((probability,index)=>{
      root.querySelector('[data-cnn-pipe-logit-value="'+index+'"]').textContent=values[index].toFixed(1);
      root.querySelector('[data-cnn-pipe-prob-bar="'+index+'"]').style.width=(probability*100).toFixed(1)+"%";
      root.querySelector('[data-cnn-pipe-prob="'+index+'"]').textContent=(probability*100).toFixed(1)+"%";
    });
    const predicted=probabilities.indexOf(Math.max(...probabilities));
    root.querySelector('[data-cnn-pipe-prediction]').textContent="最高概率：类别 "+String.fromCharCode(65+predicted)+" · "+(probabilities[predicted]*100).toFixed(1)+"%。三类概率相加为 100%。";
    const target=Number(root.querySelector('[data-cnn-pipe-target]').value),loss=max+Math.log(sum)-values[target];
    root.querySelector('[data-cnn-pipe-loss]').textContent="目标为类别 "+String.fromCharCode(65+target)+" 时，交叉熵 = log(Σeˡ) − 目标类 logit = "+loss.toFixed(3)+"。目标类分数越低，当前损失越大。";
    root.dataset.step=String(step);
  }
  window.lessonPlaygrounds={
    render(id,index){return id==="cnn"&&index===flowSectionIndex?pipelineMarkup():(previous.render?.(id,index)||"")},
    initialize(){previous.initialize?.();document.querySelectorAll('[data-cnn-pipeline]').forEach(updatePipeline)}
  };
  document.addEventListener("click",event=>{
    const stepButton=event.target.closest('[data-cnn-pipe-step]');
    if(stepButton){const root=stepButton.closest('[data-cnn-pipeline]');root.dataset.step=stepButton.dataset.cnnPipeStep;updatePipeline(root);return}
    const modeButton=event.target.closest('[data-cnn-pipe-mode]');
    if(modeButton){const root=modeButton.closest('[data-cnn-pipeline]');root.dataset.mode=modeButton.dataset.cnnPipeMode;root.dataset.step="7";updatePipeline(root)}
  });
  document.addEventListener("input",event=>{
    if(event.target.matches('[data-cnn-pipe-size],[data-cnn-pipe-logit]'))updatePipeline(event.target.closest('[data-cnn-pipeline]'));
  });
  document.addEventListener("change",event=>{
    if(event.target.matches('[data-cnn-pipe-target]'))updatePipeline(event.target.closest('[data-cnn-pipeline]'));
  });
})();
