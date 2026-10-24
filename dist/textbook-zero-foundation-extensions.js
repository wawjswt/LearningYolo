/* 面向零基础的分步互动补充：梯度链式法则、四元数乘法、YOLO 损失分配。 */
(()=>{
  const previousRender=window.renderFoundationWorkshop;
  if(typeof previousRender!=='function')return;

  const additions={
    gradient:`<section class="bw-chain-demo" aria-labelledby="bw-chain-title"><h4 id="bw-chain-title">沿着预测 → 误差 → 损失，逐步把斜率算回来</h4><p>固定输入 x=2、正确答案 y=5、偏置 b=0，从 w=1 开始。这里的误差 u 保留正负号，L 是平方误差。</p><div class="bw-chain-flow" role="group" aria-label="前向计算与反向求导步骤"><div data-bw-chain-node="w"><small>权重</small><strong>w = 1</strong></div><span aria-hidden="true">→</span><div data-bw-chain-node="prediction"><small>预测</small><strong>ŷ = 2w = 2</strong></div><span aria-hidden="true">→</span><div data-bw-chain-node="error"><small>误差</small><strong>u = ŷ−y = −3</strong></div><span aria-hidden="true">→</span><div data-bw-chain-node="loss"><small>损失</small><strong>L = u² = 9</strong></div></div><div class="bw-adam-controls" role="group" aria-label="选择链式法则演示步骤"><button type="button" data-bw-chain-step="0" aria-pressed="true">1 · 参数起点</button><button type="button" data-bw-chain-step="1" aria-pressed="false">2 · 正向算数值</button><button type="button" data-bw-chain-step="2" aria-pressed="false">3 · 分段求斜率</button><button type="button" data-bw-chain-step="3" aria-pressed="false">4 · 相乘得到梯度</button></div><p class="bw-adam-detail" data-bw-chain-status role="status">起点：w=1；输入 x=2、正确答案 y=5、偏置 b 固定为 0。</p><div class="bw-gradient-equations"><p>正向：\\[\\hat y=2w,\\qquad u=\\hat y-y=2w-5,\\qquad L=u^2\\]</p><p>反向：\\[\\frac{dL}{du}=2u=-6,\\qquad \\frac{du}{dw}=2\\]</p><p>链式法则：\\[\\frac{dL}{dw}=\\frac{dL}{du}\\frac{du}{dw}=2u\\times2=4(2w-5)=-12\\quad(w=1)\\]</p><small>系数 4 来自两段影响相乘：平方的导数给出 2u，预测 2w 对 w 的导数再给出 2。</small></div><p class="bw-note">反向传播按计算链从后往前传递影响：损失先对误差求斜率，再乘误差对权重的斜率。它算出梯度，但这一步本身还没有更新权重。</p></section><section class="bw-finite-difference" data-bw-finite-difference aria-labelledby="bw-finite-title"><h4 id="bw-finite-title">把 w 从 1 改一点，实际损失变化接近导数吗？</h4><p>先固定基准 w₀=1，它的损失是 9。拖动 Δw，查看新权重与损失；有限差商表示这两点之间的平均斜率，和 w₀ 处的导数比较。</p><div class="bw-finite-formula">\\[w=1+\\Delta w,\\quad \\hat y=2w,\\quad u=\\hat y-5,\\quad L=u^2,\\quad \\text{平均斜率}=\\frac{L(w)-L(1)}{\\Delta w}\\]</div><label class="bw-slider-label">权重变化 Δw：<output data-bw-delta-out>+0.01</output><input type="range" min="-0.10" max="0.10" step="0.01" value="0.01" data-bw-delta-slider aria-label="调整相对基准权重 1 的变化量"></label><figure class="bw-gradient-plot"><svg viewBox="0 0 360 190" role="img" aria-labelledby="bw-gradient-plot-title bw-gradient-plot-desc"><title id="bw-gradient-plot-title">权重附近的平方损失曲线</title><desc id="bw-gradient-plot-desc">曲线展示 w 从 0.9 到 1.1 时的损失。基准权重 1 的局部导数为负 12；可拖动滑杆查看有限变化的平均斜率。</desc><path d="M24 150H336M24 24V150" fill="none" stroke="#aeb7c2" stroke-width="1.5"/><path d="M24 51.4 L102 74 L180 96 L258 117.2 L336 137.8" fill="none" stroke="#8370b7" stroke-width="3"/><line x1="180" y1="96" x2="180" y2="150" stroke="#b9b2c8" stroke-dasharray="4 4"/><line data-bw-secant x1="180" y1="96" x2="195.6" y2="100.3" stroke="#df9a51" stroke-width="2.5"/><circle cx="180" cy="96" r="5" fill="#fff" stroke="#67569b" stroke-width="3"/><circle data-bw-current-point cx="195.6" cy="100.3" r="5" fill="#df9a51"/><text x="180" y="174" text-anchor="middle">基准 w₀=1</text><text data-bw-current-label x="196" y="88" text-anchor="middle">当前 w=1.01</text><text x="30" y="18">损失 L</text><text x="326" y="174" text-anchor="end">权重 w</text></svg><figcaption>橙线连接基准点和当前点；紫线是本例的损失曲线。只显示 w 在 0.9 到 1.1 附近的教学示意。</figcaption></figure><div class="bw-readouts bw-finite-readouts"><div><small>当前权重 w</small><strong data-bw-current-w>1.01</strong></div><div><small>预测 ŷ = 2w</small><strong data-bw-current-pred>2.02</strong></div><div><small>误差 u = ŷ−5</small><strong data-bw-current-error>−2.98</strong></div><div><small>当前损失 L</small><strong data-bw-current-loss>8.8804</strong></div><div><small>损失变化 ΔL</small><strong data-bw-loss-change>−0.1196</strong></div><div><small>两点间平均斜率</small><strong data-bw-secant-slope>−11.96</strong></div><div><small>基准点导数 dL/dw</small><strong>−12</strong></div></div><p class="bw-finite-status" data-bw-finite-status role="status" aria-live="polite">w 从 1 增至 1.01：损失从 9 降到 8.8804，变化 −0.1196；平均斜率 −11.96，接近基准点导数 −12。</p><p class="bw-note">平均斜率使用一段有限距离；导数描述基准点处无限靠近时的局部斜率。步长越小，两者通常越接近，但计算精度也会影响数值结果。这里的教学函数很简单，不应直接推广为任意模型每次更新都降低损失。</p></section><section class="bw-update-comparison" data-bw-update-comparison aria-labelledby="bw-update-title"><h4 id="bw-update-title">同一组数据：只更新权重，还是权重和偏置都更新？</h4><p>统一从 x=2、y=5、w=1、b=0 开始，平方误差 L=(wx+b−y)²，学习率 η=0.05。两种算法只差在“哪些参数允许更新”。</p><div class="bw-adam-controls" role="group" aria-label="选择参数更新方式"><button type="button" data-bw-update-mode="fixed" aria-pressed="true">偏置固定为 0</button><button type="button" data-bw-update-mode="both" aria-pressed="false">权重和偏置都更新</button></div><div class="bw-update-explain" data-bw-update-readout aria-live="polite"><p><strong>共同起点：</strong>预测 ŷ=1×2+0=2，误差 e=2−5=−3，损失 L=e²=9。</p><p><strong>本次更新的梯度：</strong>∂L/∂w=2e·x=−12。偏置 b 固定，不参与求导和更新。</p><p><strong>只更新 w：</strong>w=1−0.05×(−12)=1.6，b 仍为 0；新预测 3.2，新损失 (3.2−5)²=3.24。</p></div><div class="bw-update-results" role="group" aria-label="两种设置的计算结果"><article data-bw-update-card="fixed" class="is-selected"><h5>偏置固定</h5><p>w=1.6，b=0</p><p>预测 3.2 · 损失 3.24</p></article><article data-bw-update-card="both"><h5>两个参数都更新</h5><p>w=1.6，b=0.3</p><p>预测 3.5 · 损失 2.25</p></article></div><pre class="bw-update-code" data-bw-update-code="fixed"><code>import torch

x = torch.tensor([2.0])
y = torch.tensor([5.0])
w = torch.nn.Parameter(torch.tensor(1.0))
b = torch.tensor(0.0)  # 固定偏置，不加入优化器
optimizer = torch.optim.SGD([w], lr=0.05)

optimizer.zero_grad()
loss = (w * x + b - y).pow(2).mean()
loss.backward()
print(w.grad)  # tensor(-12.)
optimizer.step()

with torch.no_grad():
    new_loss = (w * x + b - y).pow(2).mean()
print(w.item(), b.item(), new_loss.item())  # 1.6, 0.0, 3.24</code></pre><pre class="bw-update-code" data-bw-update-code="both" hidden><code>import torch

x = torch.tensor([2.0])
y = torch.tensor([5.0])
w = torch.nn.Parameter(torch.tensor(1.0))
b = torch.nn.Parameter(torch.tensor(0.0))
optimizer = torch.optim.SGD([w, b], lr=0.05)

optimizer.zero_grad()
loss = (w * x + b - y).pow(2).mean()
loss.backward()
print(w.grad, b.grad)  # tensor(-12.), tensor(-6.)
optimizer.step()

with torch.no_grad():
    new_loss = (w * x + b - y).pow(2).mean()
print(w.item(), b.item(), new_loss.item())  # 1.6, 0.3, 2.25</code></pre><p class="bw-note">两个梯度都在更新前的 w=1、b=0 上算好；optimizer.step() 随后一起应用它们。这里的 3.24 和 2.25 都来自同一个教学算例，不能据此说训练中每一步损失都会下降。</p></section>`,
    quaternion:'<section class="bw-quaternion-product" aria-labelledby="bw-q-product-title"><h4 id="bw-q-product-title">亲手走一遍：四元数怎样把 x 方向转到 y 方向</h4><p>约定与上方滑杆相同：四元数按 <span>(w,x,y,z)</span> 排列，绕 z 轴正向转 90°。把向量 <span>(1,0,0)</span> 写成 <span>p=(0,1,0,0)</span>，然后按顺序计算 <span>q p q*</span>。</p><div class="bw-adam-controls" role="group" aria-label="选择四元数旋转计算步骤"><button type="button" data-bw-q-product-step="0" aria-pressed="true">1 · 写出 q、p、q*</button><button type="button" data-bw-q-product-step="1" aria-pressed="false">2 · 先算 q p</button><button type="button" data-bw-q-product-step="2" aria-pressed="false">3 · 再乘 q*</button></div><div class="bw-q-product-equation" aria-live="polite"><strong data-bw-q-product-result>q=(0.707,0,0,0.707)　 p=(0,1,0,0)　 q*=(0.707,0,0,−0.707)</strong></div><p class="bw-adam-detail" data-bw-q-product-status role="status">q 记录绕 z 轴转 90°；p 把原向量放进四元数的三个方向分量。</p><details class="bw-q-product-more"><summary>四元数乘法具体怎么算？</summary><p>对两个四元数 <span>a=(a₀, a⃗)</span>、<span>b=(b₀, b⃗)</span>，Hamilton 乘积可写成 <span>a⊗b=(a₀b₀−a⃗·b⃗, a₀b⃗+b₀a⃗+a⃗×b⃗)</span>。其中 <span>·</span> 表示点积，<span>×</span> 表示叉积。</p><ol><li><span>q p=(0, 0.707, 0.707, 0)</span>：旋转运算的中间结果。</li><li><span>(q p)q*=(0, 0, 1, 0)</span>：四个数里的第一个是 0，后三个数就是旋转后的向量。</li></ol><p>因此 <span>(1,0,0)</span> 被转成 <span>(0,1,0)</span>。乘法顺序不能任意换；这个例子采用单位四元数和 Hamilton 乘法约定。</p></details><p class="bw-note">这是绕单一轴转 90° 的手算例子，方便先看懂乘法步骤。不同软件库对分量顺序、主动/被动旋转和乘法顺序的约定可能不同，使用前要核对。</p></section>',
    'yolo-loss':'<section class="bw-yolo-candidate-ledger" aria-labelledby="bw-yolo-ledger-title"><h4 id="bw-yolo-ledger-title">几种候选框，分别要为哪些问题负责？</h4><p>想象模型给出三个候选：A 被匹配去负责真实目标，B、C 位于背景。选一个候选，查看哪些损失项会计算，以及这组教学数字对应什么答案。</p><div class="bw-adam-controls" role="group" aria-label="选择候选框查看损失分配"><button type="button" data-bw-candidate="A" aria-pressed="true">候选 A · 匹配到目标</button><button type="button" data-bw-candidate="B" aria-pressed="false">候选 B · 背景</button><button type="button" data-bw-candidate="C" aria-pressed="false">候选 C · 背景</button></div><div class="bw-candidate-card" aria-live="polite"><strong data-bw-candidate-title>候选 A：正样本，负责一个真实目标</strong><p data-bw-candidate-copy>它要学习框的位置、目标是否存在，以及目标类别。这个教学例子把物体性目标设成 IoU 软值 0.700。</p><div class="bw-candidate-losses"><div><small>位置损失 box</small><strong data-bw-box-loss>0.310</strong></div><div><small>物体性损失 obj</small><strong data-bw-obj-loss>0.613</strong></div><div><small>类别损失 cls</small><strong data-bw-cls-loss>0.394</strong></div></div></div><div class="bw-ap-table-wrap"><table class="bw-ap-table bw-candidate-table"><caption>三种候选分别参与哪些计算</caption><thead><tr><th scope="col">候选</th><th scope="col">是否负责目标</th><th scope="col">box 定位</th><th scope="col">obj 有无目标</th><th scope="col">cls 是什么类别</th></tr></thead><tbody><tr data-bw-candidate-row="A" class="is-current"><th scope="row">A</th><td>是，正样本</td><td>计算</td><td>计算；目标值 0.700</td><td>计算；标签 [1,0]</td></tr><tr data-bw-candidate-row="B"><th scope="row">B</th><td>否，背景</td><td>不计算</td><td>计算；目标值 0</td><td>不计算</td></tr><tr data-bw-candidate-row="C"><th scope="row">C</th><td>否，背景</td><td>不计算</td><td>计算；目标值 0</td><td>不计算</td></tr></tbody></table></div><p class="bw-note">示例物体性 logit 分别为 A=1、B=−1、C=0.5，使用 BCEWithLogitsLoss 后约为 0.613、0.313、0.974；A 的类别 logits=[1,−0.5]，平均 BCE≈0.394；A 的定位损失沿用上面的 CIoU 示例 0.310。数值只为展示“哪类候选算哪笔账”，真实 YOLOv5 还会在多层网格上匹配、汇总并应用各层与分项权重，不能把这几个数字当成一次训练日志。</p></section>'
  };

  window.renderFoundationWorkshop=(lesson)=>{
    const html=previousRender(lesson);
    const id=typeof lesson==='string'?lesson:lesson?.id;
    const extra=additions[id];
    if(!extra)return html;
    const closing=html.lastIndexOf('</section>');
    return closing<0?html+extra:html.slice(0,closing)+extra+html.slice(closing);
  };

  const previousInitialize=window.initializeFoundationWorkshops;
  window.initializeFoundationWorkshops=()=>{
    previousInitialize?.();
    document.querySelectorAll('[data-bw-root]').forEach(root=>{
      if(root.dataset.bwExtensionReady==='true')return;
      const id=root.dataset.bwRoot;
      if(id==='gradient'){initChainRule(root);initUpdateComparison(root);}
      if(id==='quaternion')initQuaternionProduct(root);
      if(id==='yolo-loss')initCandidateLedger(root);
      root.dataset.bwExtensionReady='true';
    });
  };

  function initChainRule(root){
    const buttons=[...root.querySelectorAll('[data-bw-chain-step]')];if(!buttons.length)return;
    const nodes=[...root.querySelectorAll('[data-bw-chain-node]')],status=root.querySelector('[data-bw-chain-status]');
    const messages=['起点：w=1；输入 x=2、正确答案 y=5、偏置 b 固定为 0。','正向：ŷ=2w=2，误差 u=ŷ−y=−3，平方误差 L=u²=9。','在 w=1：u=−3；损失对误差的斜率 dL/du=2u=−6，误差对权重的斜率 du/dw=2。','链式法则：dL/dw=(−6)×2=−12；系数 4 来自两个局部导数中的 2×2。'];
    buttons.forEach(button=>button.addEventListener('click',()=>{const step=Number(button.dataset.bwChainStep),active=['w','prediction','error','loss'];buttons.forEach(item=>item.setAttribute('aria-pressed',String(item===button)));nodes.forEach(node=>node.classList.toggle('is-current',active.slice(0,step===0?1:step===1?4:step===2?3:4).includes(node.dataset.bwChainNode)));status.textContent=messages[step];}));
    nodes[0]?.classList.add('is-current');
    const demo=root.querySelector('[data-bw-finite-difference]');if(!demo)return;
    const slider=demo.querySelector('[data-bw-delta-slider]'),out=demo.querySelector('[data-bw-delta-out]');
    const signed=(value,digits)=>{const fixed=value.toFixed(digits);return (value>0?'+':'')+fixed.replace('-','−')};
    const update=()=>{
      const delta=Number(slider.value),w=1+delta,prediction=2*w,error=prediction-5,loss=error*error,lossChange=loss-9;
      const x=24+(w-.9)/.2*312,y=150-(loss-7.5)/3*108,baseX=180,baseY=96;
      out.value=signed(delta,2);out.textContent=signed(delta,2);
      demo.querySelector('[data-bw-current-w]').textContent=w.toFixed(2);
      demo.querySelector('[data-bw-current-pred]').textContent=prediction.toFixed(2);
      demo.querySelector('[data-bw-current-error]').textContent=error.toFixed(2).replace('-','−');
      demo.querySelector('[data-bw-current-loss]').textContent=loss.toFixed(4);
      demo.querySelector('[data-bw-loss-change]').textContent=signed(lossChange,4);
      const secant=delta===0?null:lossChange/delta;
      demo.querySelector('[data-bw-secant-slope]').textContent=secant===null?'—':signed(secant,2);
      const line=demo.querySelector('[data-bw-secant]');line.setAttribute('x1',String(baseX));line.setAttribute('y1',String(baseY));line.setAttribute('x2',String(x));line.setAttribute('y2',String(y));line.style.display=delta===0?'none':'';
      const point=demo.querySelector('[data-bw-current-point]');point.setAttribute('cx',String(x));point.setAttribute('cy',String(y));
      const label=demo.querySelector('[data-bw-current-label]');label.setAttribute('x',String(Math.max(60,Math.min(300,x))));label.setAttribute('y',String(Math.max(30,y-12)));label.textContent='当前 w='+w.toFixed(2);
      demo.querySelector('[data-bw-finite-status]').textContent=secant===null
        ?'Δw=0 时新旧点重合，不能用两点差商计算斜率；基准点的导数仍是 −12。'
        :'w 从 1 变为 '+w.toFixed(2)+'：损失从 9 变为 '+loss.toFixed(4)+'，变化 '+signed(lossChange,4)+'；两点间平均斜率 '+signed(secant,2)+'，基准点导数为 −12。';
    };
    slider.addEventListener('input',update);update();
  }

  function initUpdateComparison(root){
    const panel=root.querySelector('[data-bw-update-comparison]');if(!panel)return;
    const buttons=[...panel.querySelectorAll('[data-bw-update-mode]')],readout=panel.querySelector('[data-bw-update-readout]'),codes=[...panel.querySelectorAll('[data-bw-update-code]')],cards=[...panel.querySelectorAll('[data-bw-update-card]')];
    const copy={
      fixed:'<p><strong>共同起点：</strong>预测 ŷ=1×2+0=2，误差 e=2−5=−3，损失 L=e²=9。</p><p><strong>本次更新的梯度：</strong>∂L/∂w=2e·x=−12。偏置 b 固定，不参与求导和更新。</p><p><strong>只更新 w：</strong>w=1−0.05×(−12)=1.6，b 仍为 0；新预测 3.2，新损失 (3.2−5)²=3.24。</p>',
      both:'<p><strong>共同起点：</strong>预测 ŷ=1×2+0=2，误差 e=2−5=−3，损失 L=e²=9。</p><p><strong>两个梯度：</strong>∂L/∂w=2e·x=−12；∂L/∂b=2e=−6。它们都由同一个更新前的 w=1、b=0 算出。</p><p><strong>一起更新：</strong>w=1.6，b=0.3；新预测 1.6×2+0.3=3.5，新损失 (3.5−5)²=2.25。</p>'
    };
    const update=mode=>{panel.dataset.mode=mode;buttons.forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.bwUpdateMode===mode)));codes.forEach(code=>{code.hidden=code.dataset.bwUpdateCode!==mode});cards.forEach(card=>card.classList.toggle('is-selected',card.dataset.bwUpdateCard===mode));readout.innerHTML=copy[mode];};
    buttons.forEach(button=>button.addEventListener('click',()=>update(button.dataset.bwUpdateMode)));update('fixed');
  }
  function initQuaternionProduct(root){
    const buttons=[...root.querySelectorAll('[data-bw-q-product-step]')];if(!buttons.length)return;
    const result=root.querySelector('[data-bw-q-product-result]'),status=root.querySelector('[data-bw-q-product-status]');
    const rows=[
      ['q=(0.707,0,0,0.707)　 p=(0,1,0,0)　 q*=(0.707,0,0,−0.707)','q 记录绕 z 轴转 90°；p 把原向量放进四元数的三个方向分量。'],
      ['q p=(0,0.707,0.707,0)','第一次乘法得到中间四元数；这一步还不是旋转后的最终向量。'],
      ['(q p) q*=(0,0,1,0)　 →　旋转后的向量 (0,1,0)','第二次乘以共轭 q*；去掉纯向量四元数的第一个 0，后三个分量就是最终方向。']
    ];
    buttons.forEach(button=>button.addEventListener('click',()=>{const step=Number(button.dataset.bwQProductStep);buttons.forEach(item=>item.setAttribute('aria-pressed',String(item===button)));result.textContent=rows[step][0];status.textContent=rows[step][1];}));
  }

  function initCandidateLedger(root){
    const buttons=[...root.querySelectorAll('[data-bw-candidate]')];if(!buttons.length)return;
    const data={
      A:['候选 A：正样本，负责一个真实目标','它要学习框的位置、目标是否存在，以及目标类别。这个教学例子把物体性目标设成 IoU 软值 0.700。','0.310','0.613','0.394'],
      B:['候选 B：负样本，背景候选','它没有匹配到真实目标，所以不回归目标框，也不计算类别损失；仍要学习“这里没有目标”，其物体性 logit=−1，对应 BCE≈0.313。','—','0.313','—'],
      C:['候选 C：负样本，背景候选','它没有匹配到真实目标，所以不回归目标框，也不计算类别损失；仍要学习“这里没有目标”，其物体性 logit=0.5，对应 BCE≈0.974。','—','0.974','—']
    };
    buttons.forEach(button=>button.addEventListener('click',()=>{
      const key=button.dataset.bwCandidate,entry=data[key];buttons.forEach(item=>item.setAttribute('aria-pressed',String(item===button)));
      root.querySelectorAll('[data-bw-candidate-row]').forEach(row=>row.classList.toggle('is-current',row.dataset.bwCandidateRow===key));
      root.querySelector('[data-bw-candidate-title]').textContent=entry[0];root.querySelector('[data-bw-candidate-copy]').textContent=entry[1];
      root.querySelector('[data-bw-box-loss]').textContent=entry[2];root.querySelector('[data-bw-obj-loss]').textContent=entry[3];root.querySelector('[data-bw-cls-loss]').textContent=entry[4];
    }));
  }
})();
