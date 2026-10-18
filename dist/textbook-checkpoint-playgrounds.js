/* Training artifacts, file containers, and deployment paths. */
(() => {
  const previous = window.lessonPlaygrounds;

  function architectureMarkup() {
    return '<section class="lesson-playground checkpoint-playground" aria-labelledby="checkpoint-architecture-title">'
      + '<div class="playground-heading"><div><span class="playground-kicker">图解 · 结构与参数</span><h3 id="checkpoint-architecture-title">同一张“蓝图”，装入训练学到的数值</h3><p>网络结构规定计算步骤；权重、偏置等状态填入对应位置，模型才可以对输入执行预测。</p></div></div>'
      + '<figure class="cp-architecture-figure"><div class="cp-architecture-flow" aria-label="模型结构蓝图经过训练得到参数状态，结构和参数配对后形成可运行模型">'
      + '<div class="cp-flow-stage cp-blueprint"><span class="cp-stage-number">01 · 结构蓝图</span><strong>模型结构</strong><div class="cp-layer-sketch" aria-hidden="true"><i></i><i></i><i></i><b>···</b><i></i><i></i></div><small>层、连接、激活、配置</small><em>代码 / config</em></div>'
      + '<span class="cp-flow-arrow" aria-hidden="true"><b>训练</b> →</span>'
      + '<div class="cp-flow-stage cp-learned"><span class="cp-stage-number">02 · 学到的状态</span><strong>state_dict</strong><div class="cp-parameter-stack" aria-hidden="true"><i>weight</i><i>bias</i><i>running stats</i></div><small>参数张量与持久化 buffer</small><em>checkpoint 内的数据</em></div>'
      + '<span class="cp-flow-arrow" aria-hidden="true"><b>匹配加载</b> →</span>'
      + '<div class="cp-flow-stage cp-running"><span class="cp-stage-number">03 · 可运行模型</span><strong>模型 + 状态</strong><div class="cp-running-mark" aria-hidden="true">ƒ(x)</div><small>输入 → 前向计算 → 输出</small><em>再接推理运行环境</em></div>'
      + '</div><figcaption>state_dict 提供与层对应的张量值，不会自动替代模型结构定义。结构不匹配时，参数就无法正确装入对应位置。</figcaption></figure>'
      + '<p class="cp-inline-note"><strong>一个细节：</strong><code>state_dict</code> 也可能含 BatchNorm 的运行均值、方差等持久化 buffer，因此把它简单称作“只有权重”并不严谨。</p>'
      + '</section>';
  }

  function checkpointMarkup() {
    return '<section class="lesson-playground checkpoint-playground" data-checkpoint-builder data-mode="inference" aria-labelledby="checkpoint-builder-title">'
      + '<div class="playground-heading"><div><span class="playground-kicker">可切换保存包 · 用途决定内容</span><h3 id="checkpoint-builder-title">这次要做推理，还是要接着训练？</h3><p>切换用途，看看模型文件里通常要带哪些状态。模型结构仍由代码或配置提供。</p></div><button type="button" class="playground-reset" data-checkpoint-reset>恢复示例</button></div>'
      + '<div class="cp-mode-tabs" role="group" aria-label="选择模型保存用途"><button type="button" data-checkpoint-mode="inference" aria-pressed="true">只做推理</button><button type="button" data-checkpoint-mode="resume" aria-pressed="false">恢复训练</button></div>'
      + '<div class="cp-package-flow"><div class="cp-external-structure"><span>运行所需的结构定义</span><strong>模型代码 / config</strong><small>在项目或配置文件中提供</small></div><span class="cp-flow-join" aria-hidden="true">＋</span><div class="cp-package" aria-live="polite"><div class="cp-package-heading"><span>当前保存包</span><strong data-checkpoint-package-name>model.pth · 推理状态</strong></div><div class="cp-package-items" data-checkpoint-items></div></div><span class="cp-flow-join" aria-hidden="true">→</span><div class="cp-output-model"><span>配对加载</span><strong data-checkpoint-output>可以执行预测</strong><small data-checkpoint-output-note>再配好运行库和输入预处理</small></div></div>'
      + '<p class="cp-live-explanation" data-checkpoint-explanation role="status" aria-live="polite"></p>'
      + '<p class="cp-inline-note"><strong>恢复训练也要看流程：</strong>若用 AMP、学习率计划、随机采样或分布式训练，想复现接续点时应按项目需要补存 GradScaler、scheduler、随机数与采样器状态等。</p>'
      + '</section>';
  }

  const formatSpecs = {
    pt: { label: '.pt / .pth', title: 'PyTorch 常见保存后缀', summary: '可以保存 state_dict、多个训练状态组成的字典，或整个 Python 模块对象。', detail: '确认保存时传给 torch.save 的对象，并按项目提供的模型类、配置和加载代码读取。整个模块的 pickle 序列化会依赖代码中的类路径。', hint: '后缀不能证明里面只放权重。优先读取可信来源的模型说明。' },
    bin: { label: '.bin', title: '通用二进制后缀', summary: '它本身没有规定唯一的模型内容或框架。', detail: '在 Hugging Face 模型仓库中，pytorch_model.bin 常与 config.json 配合保存/加载模型；其他项目也能把不同对象命名为 .bin。', hint: '看模型卡、仓库文件清单和指定的 from_pretrained / 加载接口。' },
    safe: { label: '.safetensors', title: '以张量数据为核心的格式', summary: '模型仓库可以用它分发张量状态。', detail: '它不是网络结构或推理引擎本身；模型还需匹配的配置、结构实现和运行库。', hint: '和 .bin 一样，文件名不能替你确认模型任务、标签或预处理约定。' },
    gguf: { label: '.gguf', title: '面向 GGML 系执行器的推理模型格式', summary: 'GGUF 可携带权重张量与加载模型所需的元数据，常配合 llama.cpp 等工具使用。', detail: 'GGUF 是容器/文件格式。它可以保存 F16 等表示，也可以保存 Q4 等量化张量；具体兼容哪些模型还取决于执行器版本。', hint: '看文件说明中的模型架构、量化类型和执行器支持情况。' }
  };

  function formatMarkup() {
    return '<section class="lesson-playground checkpoint-playground cp-format-playground" data-format-explorer data-format="pt" aria-labelledby="checkpoint-format-title">'
      + '<div class="playground-heading"><div><span class="playground-kicker">文件格式探索 · 先看容器，再看内容</span><h3 id="checkpoint-format-title">点选一个后缀，检查真正需要确认的事</h3><p>这些后缀在常见生态里有习惯用法，但不能单靠扩展名推断内容、精度或运行环境。</p></div></div>'
      + '<div class="cp-format-tabs" role="group" aria-label="选择模型文件后缀">'+Object.entries(formatSpecs).map(([id,spec])=>'<button type="button" data-model-format="'+id+'" aria-pressed="'+String(id==='pt')+'">'+spec.label+'</button>').join('')+'</div>'
      + '<div class="cp-format-detail" aria-live="polite"><div class="cp-format-heading"><code data-format-label>.pt / .pth</code><div><h4 data-format-title>PyTorch 常见保存后缀</h4><p data-format-summary></p></div></div><p data-format-detail></p><p class="cp-format-hint"><strong>下一步：</strong><span data-format-hint></span></p></div>'
      + '<div class="cp-quant-panel"><div><span class="playground-kicker">单独看一个维度 · 数值精度</span><h4>量化不是文件后缀的同义词</h4><p>以 GGUF 推理为例，对比 F16 和 Q4 两种表示。位宽更低通常更省存储/内存；实际速度与质量变化取决于模型、硬件和量化方案。</p></div><div class="cp-quant-switch" data-quant-compare="f16" role="group" aria-label="对比 F16 与 Q4 数值表示"><button type="button" data-quant-mode="f16" aria-pressed="true">F16</button><button type="button" data-quant-mode="q4" aria-pressed="false">Q4</button></div><div class="cp-quant-visual" aria-live="polite"><div class="cp-precision-bars" data-quant-bars aria-hidden="true"></div><strong data-quant-title></strong><p data-quant-explanation role="status"></p><small class="cp-quant-scale-note">刻度仅作概念示意，不代表某个模型的真实权重分布。</small></div></div>'
      + '<p class="cp-inline-note"><strong>三个问题不要混成一个：</strong>文件格式回答“怎样组织/读取”；量化回答“数字用怎样的精度表示”；运行时回答“哪套软件可以执行”。</p>'
      + '</section>';
  }

  function deploymentMarkup() {
    return '<section class="lesson-playground checkpoint-playground cp-deployment-playground" data-deployment-compare data-deployment="local" aria-labelledby="checkpoint-deployment-title">'
      + '<div class="playground-heading"><div><span class="playground-kicker">交互数据流 · 推理在哪里发生？</span><h3 id="checkpoint-deployment-title">切换本地模型和托管 API</h3><p>重点看输入发往哪里、模型权重由谁管理、需要自己准备哪些运行条件。</p></div></div>'
      + '<div class="cp-deployment-tabs" role="group" aria-label="选择推理部署方式"><button type="button" data-deployment-mode="local" aria-pressed="true">本地运行</button><button type="button" data-deployment-mode="api" aria-pressed="false">云端 API</button></div>'
      + '<div class="cp-deployment-flow" data-deployment-flow aria-live="polite"></div>'
      + '<div class="cp-deployment-summary"><div><span>谁负责模型运行</span><strong data-deployment-owner></strong></div><div><span>请求中的输入</span><strong data-deployment-input></strong></div><div><span>主要取舍</span><strong data-deployment-tradeoff></strong></div></div>'
      + '<p class="cp-inline-note"><strong>怎么选：</strong>本地更重视离线、设备控制和本地数据流程；API 更省硬件与环境维护。费用、速率上限和数据保留规则要按具体服务条款确认。</p>'
      + '</section>';
  }

  function updateCheckpoint(root, mode) {
    if (!root) return;
    root.dataset.mode = mode;
    const resume = mode === 'resume';
    root.querySelectorAll('[data-checkpoint-mode]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.checkpointMode === mode)));
    root.querySelector('[data-checkpoint-package-name]').textContent = resume ? 'resume.pt · 续训状态' : 'model.pth · 推理状态';
    root.querySelector('[data-checkpoint-output]').textContent = resume ? '可恢复优化步骤' : '可以执行预测';
    root.querySelector('[data-checkpoint-output-note]').textContent = resume ? '重建模型与优化器后加载各自状态' : '再配好运行库和输入预处理';
    const items = [
      ['模型 state_dict', '参数 + 持久化 buffer', true],
      ['optimizer_state_dict', '动量等优化器更新状态', resume],
      ['epoch / global_step', '当前训练进度与指标', resume],
      ['scheduler / scaler 等', '按恢复要求选择保存', resume]
    ].filter(item => item[2]);
    root.querySelector('[data-checkpoint-items]').innerHTML = items.map((item,index)=>'<div class="cp-package-item"><span class="cp-item-index">0'+(index+1)+'</span><div><strong>'+item[0]+'</strong><small>'+item[1]+'</small></div><b aria-hidden="true">✓</b></div>').join('');
    root.querySelector('[data-checkpoint-explanation]').textContent = resume
      ? '当前保存包除了模型状态，还加入优化器状态和训练进度。若只载入模型参数再创建一个全新的 optimizer，预测可以正常，但优化器的历史更新状态不会自动恢复。'
      : '当前包只装模型 state_dict，适合部署推理的常见场景。还要能取得相容的模型结构/配置、运行库、类别定义和预处理/后处理规则。';
  }

  function updateFormat(root, id) {
    const spec = formatSpecs[id] || formatSpecs.pt;
    root.dataset.format = id;
    root.querySelectorAll('[data-model-format]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.modelFormat === id)));
    root.querySelector('[data-format-label]').textContent = spec.label;
    root.querySelector('[data-format-title]').textContent = spec.title;
    root.querySelector('[data-format-summary]').textContent = spec.summary;
    root.querySelector('[data-format-detail]').textContent = spec.detail;
    root.querySelector('[data-format-hint]').textContent = spec.hint;
  }

  function updateQuant(root, mode) {
    root.dataset.quantCompare = mode;
    root.querySelectorAll('[data-quant-mode]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.quantMode === mode)));
    const q4 = mode === 'q4';
    const levels = q4 ? [2,2,3,3,4,4,5,5] : [2,5,3,7,4,6,3,5];
    root.querySelector('[data-quant-bars]').innerHTML = levels.map(level=>'<i style="--bar:'+level+'"></i>').join('');
    root.querySelector('[data-quant-title]').textContent = q4 ? 'Q4 · 低位宽表示' : 'F16 · 半精度浮点表示';
    root.querySelector('[data-quant-explanation]').textContent = q4
      ? '用更少位数表示权重，通常显著缩小文件并降低内存需求；数值近似会带来一定质量风险，需在目标模型与任务上实际评估。'
      : '比 Q4 保留更多数值精度，通常需要更多存储与内存。它说明 GGUF 文件并不必然是量化文件。';
  }

  function updateDeployment(root, mode) {
    root.dataset.deployment = mode;
    const api = mode === 'api';
    root.querySelectorAll('[data-deployment-mode]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.deploymentMode === mode)));
    root.querySelector('[data-deployment-flow]').innerHTML = api
      ? '<div class="cp-flow-node cp-client"><span>你的程序</span><strong>输入 + 请求参数</strong><small>无需下载服务端权重</small></div><span class="cp-network-arrow">请求 →<small>经网络发送</small></span><div class="cp-flow-node cp-provider"><span>服务提供方</span><strong>模型权重 + 推理运行库</strong><small>服务端完成计算</small></div><span class="cp-network-arrow">← 结果<small>返回预测/文本</small></span><div class="cp-flow-node cp-result"><span>你的程序</span><strong>接收输出</strong><small>连接网络并按 API 规则调用</small></div>'
      : '<div class="cp-flow-node cp-client"><span>设备本地</span><strong>输入 + 预处理</strong><small>输入保留在设备上的本地流程内</small></div><span class="cp-network-arrow">→<small>本地调用</small></span><div class="cp-flow-node cp-provider cp-local-model"><span>同一设备</span><strong>模型权重 + 推理运行库</strong><small>设备本地完成计算</small></div><span class="cp-network-arrow">→<small>本地结果</small></span><div class="cp-flow-node cp-result"><span>设备本地</span><strong>后处理 / 输出</strong><small>需准备兼容环境与设备资源</small></div>';
    root.querySelector('[data-deployment-owner]').textContent = api ? '服务提供方在服务器端' : '你的设备和推理环境';
    root.querySelector('[data-deployment-input]').textContent = api ? '通常发送到 API 服务端' : '由本地推理流程读取';
    root.querySelector('[data-deployment-tradeoff]').textContent = api ? '少管环境；需关注费用、网络和服务条款' : '控制更强；需管硬件、依赖和模型文件';
  }

  window.lessonPlaygrounds = {
    render(id,index) {
      if (id === 'training' && index === 4) return architectureMarkup();
      if (id === 'training' && index === 5) return checkpointMarkup();
      if (id === 'training' && index === 6) return formatMarkup();
      if (id === 'training' && index === 7) return deploymentMarkup();
      return previous?.render ? previous.render(id,index) : '';
    },
    initialize() {
      previous?.initialize?.();
      document.querySelectorAll('[data-checkpoint-builder]').forEach(root => updateCheckpoint(root,root.dataset.mode||'inference'));
      document.querySelectorAll('[data-format-explorer]').forEach(root => { updateFormat(root,root.dataset.format||'pt'); updateQuant(root,root.dataset.quantCompare||'f16'); });
      document.querySelectorAll('[data-deployment-compare]').forEach(root => updateDeployment(root,root.dataset.deployment||'local'));
    }
  };

  document.addEventListener('click',event=>{
    const mode=event.target.closest('[data-checkpoint-mode]');
    if(mode){updateCheckpoint(mode.closest('[data-checkpoint-builder]'),mode.dataset.checkpointMode);return;}
    if(event.target.closest('[data-checkpoint-reset]')){const root=event.target.closest('[data-checkpoint-builder]');if(root)updateCheckpoint(root,'inference');return;}
    const format=event.target.closest('[data-model-format]');
    if(format){updateFormat(format.closest('[data-format-explorer]'),format.dataset.modelFormat);return;}
    const quant=event.target.closest('[data-quant-mode]');
    if(quant){updateQuant(quant.closest('[data-format-explorer]'),quant.dataset.quantMode);return;}
    const deployment=event.target.closest('[data-deployment-mode]');
    if(deployment)updateDeployment(deployment.closest('[data-deployment-compare]'),deployment.dataset.deploymentMode);
  });
})();
