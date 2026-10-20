/* 面向零基础的分步互动补充：梯度链式法则、四元数乘法、YOLO 损失分配。 */
(()=>{
  const previousRender=window.renderFoundationWorkshop;
  if(typeof previousRender!=='function')return;

  const additions={
    gradient:'<section class="bw-chain-demo" aria-labelledby="bw-chain-title"><h4 id="bw-chain-title">沿着一条小计算链，算清梯度怎样传回来</h4><p>设输入 <span>x=2</span>，先乘以 3 得到中间结果 <span>u=3x</span>，再平方得到损失 <span>L=u²</span>。点按钮按顺序看“先算答案，再把影响倒着算回来”。</p><div class="bw-chain-flow" role="group" aria-label="前向计算与反向求导步骤"><div data-bw-chain-node="x"><small>输入</small><strong>x = 2</strong></div><span aria-hidden="true">→</span><div data-bw-chain-node="u"><small>中间结果</small><strong>u = 3x = 6</strong></div><span aria-hidden="true">→</span><div data-bw-chain-node="loss"><small>损失</small><strong>L = u² = 36</strong></div></div><div class="bw-adam-controls" role="group" aria-label="选择链式法则演示步骤"><button type="button" data-bw-chain-step="0" aria-pressed="true">1 · 输入 x</button><button type="button" data-bw-chain-step="1" aria-pressed="false">2 · 算出 u</button><button type="button" data-bw-chain-step="2" aria-pressed="false">3 · 算出 L</button><button type="button" data-bw-chain-step="3" aria-pressed="false">4 · 反向求斜率</button></div><p class="bw-adam-detail" data-bw-chain-status role="status">先从输入开始：x=2。</p><div class="bw-chain-readouts"><div><small>中间步骤的斜率 du/dx</small><strong>3</strong><span>x 每增加 1，u 增加 3</span></div><div><small>损失对中间结果的斜率 dL/du</small><strong>12</strong><span>因为 2u = 2×6 = 12</span></div><div><small>损失对输入的总斜率 dL/dx</small><strong>36</strong><span>12×3 = 36</span></div></div><p class="bw-note">链式法则的意思是：沿途每一步的变化影响要相乘。这里 dL/dx=(dL/du)×(du/dx)=12×3=36。反向传播会把这种“逐段相乘”的方法应用到网络中的许多计算步骤。</p></section>',
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
      if(id==='gradient')initChainRule(root);
      if(id==='quaternion')initQuaternionProduct(root);
      if(id==='yolo-loss')initCandidateLedger(root);
      root.dataset.bwExtensionReady='true';
    });
  };

  function initChainRule(root){
    const buttons=[...root.querySelectorAll('[data-bw-chain-step]')];if(!buttons.length)return;
    const nodes=[...root.querySelectorAll('[data-bw-chain-node]')],status=root.querySelector('[data-bw-chain-status]');
    const messages=['先从输入开始：x=2。','把输入乘以 3：u=3×2=6。','把中间结果平方：L=6²=36。','从损失往回传：dL/du=2×6=12；du/dx=3；所以 dL/dx=12×3=36。'];
    buttons.forEach(button=>button.addEventListener('click',()=>{const step=Number(button.dataset.bwChainStep);buttons.forEach(item=>item.setAttribute('aria-pressed',String(item===button)));nodes.forEach(node=>node.classList.toggle('is-current',node.dataset.bwChainNode===(['x','u','loss','loss'][step])));status.textContent=messages[step];}));
    nodes[0]?.classList.add('is-current');
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
