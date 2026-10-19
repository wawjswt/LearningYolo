/* 训练全流程补充：把模型准备、batch 更新、验证与选择 checkpoint 连成一条可操作的学习路径。 */
(()=>{
  const lesson=lessons.find(item=>item.id==='training');
  if(!lesson)return;

  const sectionTitle='5. 把一轮训练串成完整闭环';
  if(!lesson.sections.some(section=>section.title===sectionTitle)){
    const flowSection={
      title:sectionTitle,
      paragraphs:[
        '训练不是只调用一次 `backward()`：先核对数据、标签和任务，再确定网络结构与初始化；每个 batch 里清理旧梯度、前向预测、计算损失、反向求导、让优化器更新参数。一个 epoch 的训练 batch 全部走完后，再用验证集看泛化表现，保存当前最佳 checkpoint，并据验证信号决定继续还是早停。',
        '常见图像分类中，互斥类别用原始 logits 配整数标签交给 `CrossEntropyLoss`；不要先把 logits 做 Softmax。回归、多标签和检测任务的输出与损失不同。He / Xavier 是按结构与激活特点选择的初始化方法，不是所有层都必须手工改初始化。BatchNorm、Dropout 的训练行为由 `model.train()` / `model.eval()` 切换；验证还要用 `torch.no_grad()` 或 `torch.inference_mode()` 关闭梯度记录。',
        '调度器什么时候 `step()` 取决于调度策略：有的每个 batch 更新，有的每个 epoch 更新；`ReduceLROnPlateau` 通常在验证指标算出后接收该指标。早停观察验证指标而非测试集，patience 只是容忍若干轮没有改善的策略参数，不是固定的 5、10 或 20 轮。选好 checkpoint 后再评估测试集；若要从中断处续训，还应保存优化器和调度器状态。'
      ],
      exercise:{q:'一轮训练里，什么时候应该用测试集来选最佳 epoch？',options:['每个 epoch 都看测试集并按它挑 checkpoint','不拿测试集调参；用验证集选模型，最终方案确定后再评估测试集','只看训练损失，不需要独立评估'],answer:1,why:'反复用测试集选 epoch 会把测试信息带入模型选择；验证集承担训练期间的比较，测试集尽量留作最后的独立评估。'}
    };
    const curveIndex=lesson.sections.findIndex(section=>section.title.startsWith('4. 用曲线判断训练发生了什么'));
    const insertionIndex=curveIndex>=0?curveIndex+1:lesson.sections.length;
    lesson.sections.splice(insertionIndex,0,flowSection);
    lesson.sections.slice(insertionIndex+1).forEach(section=>{
      const match=section.title.match(/^(\d+)\.\s/);
      if(match)section.title=String(Number(match[1])+1)+section.title.slice(match[1].length);
    });
    lesson.keypoints.push(
      '单个 batch 的典型顺序：zero_grad → 前向与损失 → backward → optimizer.step。',
      '一个 epoch 遍历训练集后，单独评估验证集；验证表现用于挑选 checkpoint 与决定早停。',
      'CrossEntropyLoss 接收原始 logits；model.eval() 与关闭梯度是两件不同的事。',
      '学习率调度步频取决于调度器；ReduceLROnPlateau 使用验证指标。',
      '测试集不参与早停或反复调参；推理评估与恢复训练需要保存的状态也不同。'
    );
    const sourceList=[
      {url:'https://docs.pytorch.org/tutorials/beginner/basics/optimization_tutorial.html',label:'PyTorch：优化模型参数与训练循环'},
      {url:'https://docs.pytorch.org/tutorials/beginner/basics/data_tutorial.html',label:'PyTorch：Dataset 与 DataLoader'},
      {url:'https://docs.pytorch.org/docs/stable/generated/torch.nn.CrossEntropyLoss.html',label:'PyTorch：CrossEntropyLoss 的 logits 输入'},
      {url:'https://docs.pytorch.org/docs/stable/notes/autograd.html',label:'PyTorch：eval、no-grad 与 autograd 的区别'},
      {url:'https://docs.pytorch.org/docs/stable/nn.init.html',label:'PyTorch：参数初始化方法'},
      {url:'https://docs.pytorch.org/tutorials/beginner/saving_loading_models.html',label:'PyTorch：保存模型与训练 checkpoint'}
    ];
    lesson.sources=[...(lesson.sources||[]),...sourceList.filter(source=>!(lesson.sources||[]).some(existing=>existing.url===source.url))];
    lesson.time=65;
  }

  const previous=window.lessonPlaygrounds||{};
  const flowSteps=[
    {title:'检查数据',label:'数据 / batch',copy:'先核对样本、标签、预处理和输入 shape；DataLoader 把样本组成 batch。训练集通常打乱顺序，验证与测试通常不打乱。视频帧、同一患者或同一来源的近重复样本应按来源分组，避免泄漏。',code:'train_loader = DataLoader(train_set, batch_size=64, shuffle=True)\nval_loader = DataLoader(val_set, batch_size=256, shuffle=False)'},
    {title:'搭建并初始化',label:'结构 / 初值',copy:'结构决定计算图，权重与偏置是待学习参数。按激活函数和层的特点选用合适初始化，或先用框架默认初始化；初始化要避免对称参数和极端激活尺度，但不存在对所有模型都最佳的单一方案。',code:'model = MyModel().to(device)\n# 示例：ReLU 系列线性层常考虑 Kaiming 初始化\n# 隐藏层与输出层的初始化可按结构分别决定'},
    {title:'切换训练模式',label:'model.train()',copy:'每轮训练前调用 model.train()，让 Dropout、BatchNorm 等模块采用训练行为。它不会清空梯度；梯度清理由 optimizer.zero_grad() 完成。',code:'model.train()\nfor images, labels in train_loader:\n    optimizer.zero_grad(set_to_none=True)'},
    {title:'前向与损失',label:'forward / loss',copy:'输入先经过网络得到预测，再由损失函数与目标比较。互斥多分类中，CrossEntropyLoss 直接接原始 logits 与整数类标；Softmax 只在需要展示概率时使用。',code:'logits = model(images)\nloss = loss_fn(logits, labels)  # 多分类：CrossEntropyLoss(logits, class_index)'},
    {title:'反向传播',label:'backward()',copy:'loss.backward() 沿计算图用链式法则计算每个可训练参数的梯度，并写入参数的 grad。它计算“往哪个方向改会影响损失”，此时参数值还没被优化器更新。',code:'loss.backward()  # 计算并累积梯度；不会在这行修改权重'},
    {title:'更新参数',label:'optimizer.step()',copy:'optimizer.step() 根据梯度、学习率和优化器内部状态更新参数。SGD、Momentum、Adam 与 AdamW 的更新规则不同；选择应结合任务、训练预算和验证表现，不是固定的“某种优化器永远最好”。',code:'optimizer.step()  # 使用当前梯度更新参数\n# 若有按 batch 调用的 scheduler，在配置规定的位置 step'},
    {title:'每轮验证',label:'eval / 验证',copy:'训练集的所有 batch 走完后，调用 model.eval()，再在 no_grad 或 inference_mode 环境下跑验证数据。验证不调用 optimizer.step()。统计整轮指标时按样本数汇总，避免把大小不同的 batch 等权平均。',code:'model.eval()\nwith torch.inference_mode():\n    for images, labels in val_loader:\n        logits = model(images)  # 只预测与统计'},
    {title:'调度并保留最佳',label:'scheduler / best',copy:'先计算验证指标，再按照调度器的规定更新学习率；例如 ReduceLROnPlateau 在验证后读取指标。若验证表现刷新，就保存最佳 checkpoint。推理只需模型状态和匹配结构；续训通常还要恢复 optimizer、scheduler 等状态。',code:'scheduler.step(val_loss)  # 仅 ReduceLROnPlateau 示例；其他调度器按其步频\nif val_loss < best_val_loss:\n    best_val_loss = val_loss\n    torch.save(model.state_dict(), "best.pt")'},
    {title:'早停与最终评估',label:'早停 / test',copy:'若关键验证指标连续若干轮没有改善，可触发早停并恢复最佳 checkpoint。patience 是策略设置；最后只在模型选择完成后用测试集做独立评估。测试集不应参与早停、选 epoch 或调超参数。',code:'if epochs_without_improvement >= patience:\n    break\nmodel.load_state_dict(torch.load("best.pt", map_location=device))\n# 最终方案确定后，再对 test_loader 做一次独立评估'}
  ];

  const fullCode=[
    '# 监督式多分类训练框架：model、loaders、device 已由项目准备好',
    'import torch',
    'from torch import nn',
    '',
    'loss_fn = nn.CrossEntropyLoss()  # 输入 raw logits + 整数类别标签',
    'optimizer = torch.optim.AdamW(model.parameters(), lr=1e-3, weight_decay=1e-2)',
    'best_val_loss = float("inf")',
    'patience, no_improve = 5, 0',
    'epochs = 30',
    '',
    'for epoch in range(epochs):',
    '    model.train()',
    '    for images, labels in train_loader:',
    '        images, labels = images.to(device), labels.to(device)',
    '        optimizer.zero_grad(set_to_none=True)',
    '        logits = model(images)',
    '        loss = loss_fn(logits, labels)',
    '        loss.backward()',
    '        optimizer.step()',
    '',
    '    model.eval()',
    '    val_sum, val_count = 0.0, 0',
    '    with torch.inference_mode():',
    '        for images, labels in val_loader:',
    '            images, labels = images.to(device), labels.to(device)',
    '            val_loss = loss_fn(model(images), labels)',
    '            val_sum += val_loss.item() * labels.size(0)  # 默认 mean reduction',
    '            val_count += labels.size(0)',
    '    val_loss = val_sum / max(val_count, 1)',
    '',
    '    if val_loss < best_val_loss:',
    '        best_val_loss, no_improve = val_loss, 0',
    '        torch.save(model.state_dict(), "best.pt")',
    '    else:',
    '        no_improve += 1',
    '        if no_improve >= patience:',
    '            break',
    '',
    'model.load_state_dict(torch.load("best.pt", map_location=device, weights_only=True))',
    'model.eval()',
    'test_correct, test_total = 0, 0',
    'with torch.inference_mode():',
    '    for images, labels in test_loader:',
    '        images, labels = images.to(device), labels.to(device)',
    '        test_correct += (model(images).argmax(dim=1) == labels).sum().item()',
    '        test_total += labels.numel()',
    'print("final test accuracy:", test_correct / max(test_total, 1))  # 只作最终评估'
  ].join('\n');

  const esc=value=>String(value).replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  function stepperMarkup(){
    const buttons=flowSteps.map((step,index)=>'<button type="button" class="tl-node'+(index===0?' is-active':'')+'" data-tl-step="'+index+'" aria-pressed="'+(index===0)+'"><span>'+(index+1)+'</span><strong>'+esc(step.title)+'</strong><small>'+esc(step.label)+'</small></button>').join('');
    return '<section class="lesson-playground training-lifecycle" data-training-lifecycle aria-labelledby="tl-title">'
      +'<div class="playground-heading"><div><span class="playground-kicker">互动流程图 · 从数据到最佳模型</span><h3 id="tl-title">点一个步骤，看清训练循环里的每个动作</h3><p>一个 batch 负责计算并更新；一个 epoch 负责遍历训练集，随后验证、保存 checkpoint，再决定是否开始下一轮。</p></div><button class="playground-reset" type="button" data-tl-reset>从头看</button></div>'
      +'<div class="tl-flow-scroll"><div class="tl-flow" role="group" aria-label="模型训练全流程">'+buttons+'</div></div>'
      +'<p class="tl-loop-note"><span>循环 A · 每个 batch</span>清梯度 → 前向与损失 → 反向传播 → 更新参数　　<span>循环 B · 每个 epoch</span>验证 → 调度学习率 → 保存最佳 → 继续或早停</p>'
      +'<div class="tl-detail" aria-live="polite"><div><span class="tl-detail-kicker" data-tl-step-number>STEP 1 / 9</span><h4 data-tl-step-title>检查数据</h4><p data-tl-step-copy></p></div><div class="tl-code-card"><div class="tl-code-heading"><strong data-tl-code-label>对应的 PyTorch 操作</strong><button type="button" data-tl-copy-step>复制这一步</button></div><pre><code data-tl-step-code></code></pre></div></div>'
      +'<details class="tl-full-code"><summary>展开：完整多分类训练骨架（可复制）</summary><div class="tl-code-heading"><strong>验证集选 checkpoint，测试集留到最后</strong><button type="button" data-tl-copy-full>复制完整代码</button></div><pre><code data-tl-full-code>'+esc(fullCode)+'</code></pre><p>这是用于说明控制流的分类示例。真实项目需按任务更换模型、损失、指标和数据预处理。若使用 scheduler，应按它的设计在每步或每轮调用；若要恢复训练，还要保存优化器与调度器状态。</p></details>'
      +'<p class="playground-footnote">代码展示常见的监督分类训练顺序。检测、语言模型、梯度累积、混合精度与分布式训练会增加额外步骤；数据和梯度的处理规则仍要以具体实现为准。</p>'
      +'</section>';
  }
  function playgroundMarkup(){return stepperMarkup()}
  function updateStepper(root,index){
    const current=Math.max(0,Math.min(flowSteps.length-1,Number(index)||0));
    root.dataset.tlActiveStep=String(current);
    root.querySelectorAll('[data-tl-step]').forEach((button,i)=>{button.classList.toggle('is-active',i===current);button.setAttribute('aria-pressed',String(i===current))});
    const step=flowSteps[current];
    root.querySelector('[data-tl-step-number]').textContent='STEP '+(current+1)+' / '+flowSteps.length;
    root.querySelector('[data-tl-step-title]').textContent=step.title;
    root.querySelector('[data-tl-step-copy]').textContent=step.copy;
    root.querySelector('[data-tl-step-code]').textContent=step.code;
    root.querySelector('[data-tl-code-label]').textContent='对应的 PyTorch 操作 · '+step.label;
  }
  window.lessonPlaygrounds={
    render(id,index){const flowIndex=lesson.sections.findIndex(section=>section.title===sectionTitle);return id==='training'&&index===flowIndex?playgroundMarkup():(previous.render?.(id,index)||'')},
    initialize(){previous.initialize?.();document.querySelectorAll('[data-training-lifecycle]').forEach(root=>updateStepper(root,0))}
  };
  document.addEventListener('click',event=>{
    const stepButton=event.target.closest('[data-tl-step]');
    if(stepButton){updateStepper(stepButton.closest('[data-training-lifecycle]'),stepButton.dataset.tlStep);return}
    const reset=event.target.closest('[data-tl-reset]');
    if(reset){updateStepper(reset.closest('[data-training-lifecycle]'),0);return}
    const copyStep=event.target.closest('[data-tl-copy-step]');
    const copyFull=event.target.closest('[data-tl-copy-full]');
    if(copyStep||copyFull){const button=copyStep||copyFull,root=button.closest('[data-training-lifecycle]'),text=root.querySelector(copyStep?'[data-tl-step-code]':'[data-tl-full-code]').innerText;navigator.clipboard.writeText(text).then(()=>{button.textContent='已复制';window.setTimeout(()=>{button.textContent=copyStep?'复制这一步':'复制完整代码'},1300)}).catch(()=>{button.textContent='复制失败，请手动选择';window.setTimeout(()=>{button.textContent=copyStep?'复制这一步':'复制完整代码'},1600)});}
  });
})();
