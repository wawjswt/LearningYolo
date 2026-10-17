/* Interactive walkthrough: see a scalar loss send gradients back to each parameter. */
(() => {
  const previous = window.lessonPlaygrounds;
  const fmt = value => {
    const rounded = Number(value.toFixed(2));
    return Object.is(rounded, -0) ? '0.00' : rounded.toFixed(2);
  };

  function markup() {
    return '<section class="lesson-playground backprop-playground" data-backprop-playground data-bp-stage="1" aria-labelledby="backprop-playground-title">'
      + '<div class="playground-heading"><div><span class="playground-kicker">互动图解 · 链式求导</span><h3 id="backprop-playground-title">一份损失，怎样把修正信号传回参数？</h3><p>从预测到损失往前算，再从损失往回求导。拖动数值，亲自看权重 k 和偏置 b 各自收到什么梯度。</p></div><button type="button" class="playground-reset" data-bp-reset>恢复示例</button></div>'
      + '<div class="bp-flow" data-bp-chart></div>'
      + '<div class="bp-controls" aria-label="调整一次函数和训练目标">'
      + '<label class="playground-range"><span>输入 x <output data-bp-value="x">2.00</output></span><input type="range" min="-3" max="3" step="0.5" value="2" data-bp-input="x" aria-label="调整输入 x"></label>'
      + '<label class="playground-range"><span>正确答案 y <output data-bp-value="target">3.00</output></span><input type="range" min="-3" max="3" step="0.5" value="3" data-bp-input="target" aria-label="调整正确答案 y"></label>'
      + '<label class="playground-range"><span>权重 k <output data-bp-value="k">0.80</output></span><input type="range" min="-2" max="2" step="0.1" value="0.8" data-bp-input="k" aria-label="调整权重 k"></label>'
      + '<label class="playground-range"><span>偏置 b <output data-bp-value="b">0.20</output></span><input type="range" min="-2" max="2" step="0.1" value="0.2" data-bp-input="b" aria-label="调整偏置 b"></label>'
      + '<label class="playground-range"><span>学习率 η <output data-bp-value="rate">0.10</output></span><input type="range" min="0.01" max="0.50" step="0.01" value="0.1" data-bp-input="rate" aria-label="调整学习率 eta"></label></div>'
      + '<div class="bp-stage-switch" role="group" aria-label="选择计算步骤">'
      + '<button type="button" data-bp-step="1" aria-pressed="true">1 · 前向预测</button><button type="button" data-bp-step="2" aria-pressed="false">2 · 计算损失</button><button type="button" data-bp-step="3" aria-pressed="false">3 · 链式求导</button><button type="button" data-bp-step="4" aria-pressed="false">4 · 更新参数</button></div>'
      + '<div class="bp-explanation" aria-live="polite"><div class="bp-explanation-title"><span data-bp-stage-title>1. 正向算出预测</span><small data-bp-stage-count>第 1 / 4 步</small></div><div class="bp-equations" data-bp-equations></div><p class="bp-stage-note" data-bp-stage-note></p><div class="bp-step-nav"><button type="button" class="secondary" data-bp-prev disabled aria-label="上一步">← 上一步</button><button type="button" class="secondary" data-bp-next aria-label="下一步">下一步 →</button></div></div>'
      + '<div class="bp-practice"><div><span class="playground-kicker">试着预测</span><strong>如果 x = 0，但模型仍然预测错了，哪一个梯度一定为 0？</strong><p>想一想：改变哪个参数，能影响这个输入对应的预测？</p></div><div class="bp-answer-options" role="group" aria-label="选择梯度为零的参数"><button type="button" data-bp-answer="k">权重 k</button><button type="button" data-bp-answer="b">偏置 b</button><button type="button" data-bp-answer="both">两者都是</button></div><p class="bp-answer-feedback" data-bp-feedback role="status" aria-live="polite"></p></div>'
      + '<p class="playground-insight">要分清两件事：反向传播按链式法则计算梯度；优化器再用梯度和学习率更新参数。梯度为零代表当前位置的一阶斜率为零，不一定就是全局最低点；复杂网络还可能有鞍点或局部低点。</p>'
      + '<p class="playground-footnote">教学例子使用平方损失 L = ½(ŷ−y)² 和模型 ŷ = kx+b。一步更新后损失可能下降，也可能因步幅太大而上升；真实网络还要看数据、损失形状与训练设置。延伸阅读：<a href="https://docs.pytorch.org/tutorials/beginner/basics/autogradqs_tutorial.html" target="_blank" rel="noopener noreferrer">PyTorch：自动微分与计算图</a> · <a href="https://docs.pytorch.org/tutorials/beginner/basics/optimization_tutorial.html" target="_blank" rel="noopener noreferrer">PyTorch：优化模型参数</a></p>'
      + '</section>';
  }

  function values(root) {
    return {
      x: Number(root.querySelector('[data-bp-input="x"]').value),
      target: Number(root.querySelector('[data-bp-input="target"]').value),
      k: Number(root.querySelector('[data-bp-input="k"]').value),
      b: Number(root.querySelector('[data-bp-input="b"]').value),
      rate: Number(root.querySelector('[data-bp-input="rate"]').value),
    };
  }

  function svg(root, data, stage) {
    const prediction = data.k * data.x + data.b;
    const loss = 0.5 * (prediction - data.target) ** 2;
    const gradK = (prediction - data.target) * data.x;
    const gradB = prediction - data.target;
    const nextK = data.k - data.rate * gradK;
    const nextB = data.b - data.rate * gradB;
    const active = number => stage >= number ? ' is-active' : '';
    const arrow = (path, className, marker, activeAt) => '<path class="bp-edge ' + className + (stage >= activeAt ? ' is-active' : '') + '" d="' + path + '" marker-end="' + marker + '"></path>';
    return '<svg viewBox="0 0 760 278" role="img" aria-label="前向计算从输入到损失，反向传播再把梯度传回权重和偏置"><defs><marker id="bp-arrow-forward" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0 0L8 4L0 8Z" fill="#8d7bb2"></path></marker><marker id="bp-arrow-backward" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0 0L8 4L0 8Z" fill="#4b997b"></path></marker></defs>'
      + '<text class="bp-flow-label" x="30" y="24">前向计算 · 从输入到损失</text>'
      + arrow('M192 95H286', 'bp-forward', 'url(#bp-arrow-forward)', 1) + arrow('M488 95H590', 'bp-forward', 'url(#bp-arrow-forward)', 2)
      + arrow('M590 131C558 174 517 179 488 131', 'bp-backward', 'url(#bp-arrow-backward)', 3)
      + arrow('M365 130C352 158 345 166 340 192', 'bp-backward', 'url(#bp-arrow-backward)', 3)
      + arrow('M425 130C441 157 462 166 475 192', 'bp-backward', 'url(#bp-arrow-backward)', 3)
      + '<text class="bp-flow-label bp-flow-back-label" x="30" y="253">反向求导 · 链式法则把梯度传回每个参数</text>'
      + '<g class="bp-node bp-node-input' + active(1) + '"><rect x="30" y="55" width="162" height="80" rx="9"></rect><text class="bp-node-kicker" x="111" y="79" text-anchor="middle">输入</text><text class="bp-node-value" x="111" y="110" text-anchor="middle">x = ' + fmt(data.x) + '</text></g>'
      + '<g class="bp-node bp-node-prediction' + active(1) + '"><rect x="286" y="55" width="202" height="80" rx="9"></rect><text class="bp-node-kicker" x="387" y="79" text-anchor="middle">模型预测</text><text class="bp-node-formula" x="387" y="100" text-anchor="middle">ŷ = kx + b</text><text class="bp-node-value" x="387" y="121" text-anchor="middle">ŷ = ' + fmt(prediction) + '</text></g>'
      + '<g class="bp-node bp-node-loss' + active(2) + '"><rect x="590" y="55" width="140" height="80" rx="9"></rect><text class="bp-node-kicker" x="660" y="79" text-anchor="middle">损失</text><text class="bp-node-formula" x="660" y="101" text-anchor="middle">½(ŷ−y)²</text><text class="bp-node-value" x="660" y="122" text-anchor="middle">L = ' + fmt(loss) + '</text></g>'
      + '<g class="bp-node bp-node-param' + active(3) + '"><rect x="298" y="190" width="128" height="46" rx="8"></rect><text class="bp-node-value" x="362" y="219" text-anchor="middle">权重 k = ' + fmt(stage === 4 ? nextK : data.k) + '</text></g>'
      + '<g class="bp-node bp-node-param' + active(3) + '"><rect x="436" y="190" width="128" height="46" rx="8"></rect><text class="bp-node-value" x="500" y="219" text-anchor="middle">偏置 b = ' + fmt(stage === 4 ? nextB : data.b) + '</text></g></svg>';
  }

  function update(root, selectedStage) {
    const data = values(root);
    const stage = selectedStage || Number(root.dataset.bpStage || 1);
    const prediction = data.k * data.x + data.b;
    const error = prediction - data.target;
    const loss = 0.5 * error ** 2;
    const gradPrediction = error;
    const gradK = error * data.x;
    const gradB = error;
    const nextK = data.k - data.rate * gradK;
    const nextB = data.b - data.rate * gradB;
    const nextPrediction = nextK * data.x + nextB;
    const nextLoss = 0.5 * (nextPrediction - data.target) ** 2;
    root.dataset.bpStage = String(stage);
    Object.entries({x: data.x, target: data.target, k: data.k, b: data.b, rate: data.rate}).forEach(([key, value]) => {
      root.querySelector('[data-bp-value="' + key + '"]').textContent = fmt(value);
    });
    root.querySelector('[data-bp-chart]').innerHTML = svg(root, data, stage);
    root.querySelectorAll('[data-bp-step]').forEach(button => button.setAttribute('aria-pressed', String(Number(button.dataset.bpStep) === stage)));
    root.querySelector('[data-bp-stage-count]').textContent = '第 ' + stage + ' / 4 步';
    const titles = ['','1. 正向算出预测','2. 把差距变成损失','3. 用链式法则回传','4. 优化器按梯度更新'];
    root.querySelector('[data-bp-stage-title]').textContent = titles[stage];
    root.querySelector('[data-bp-prev]').disabled = stage === 1;
    root.querySelector('[data-bp-next]').disabled = stage === 4;
    let equations = '';
    let note = '';
    if (stage === 1) {
      equations = '<div><span>输入经过模型</span><code>ŷ = kx + b = ' + fmt(data.k) + ' × ' + fmt(data.x) + ' + ' + fmt(data.b) + ' = ' + fmt(prediction) + '</code></div>';
      note = '这一刻只做前向计算：用当前的 k 和 b 得到预测值 ŷ。参数还没有改变。';
    } else if (stage === 2) {
      equations = '<div><span>先算预测与答案的差</span><code>ŷ − y = ' + fmt(prediction) + ' − ' + fmt(data.target) + ' = ' + fmt(error) + '</code></div><div><span>平方损失</span><code>L = ½(ŷ − y)² = ' + fmt(loss) + '</code></div>';
      note = '损失把“偏了多少”变成一个可计算的数。这里用平方损失举例；分类任务常用交叉熵等其他目标。';
    } else if (stage === 3) {
      equations = '<div><span>损失对预测的导数</span><code>∂L/∂ŷ = ŷ − y = ' + fmt(gradPrediction) + '</code></div><div><span>传到权重 k</span><code>∂L/∂k = (∂L/∂ŷ)(∂ŷ/∂k) = ' + fmt(gradPrediction) + ' × ' + fmt(data.x) + ' = ' + fmt(gradK) + '</code></div><div><span>传到偏置 b</span><code>∂L/∂b = (∂L/∂ŷ)(∂ŷ/∂b) = ' + fmt(gradPrediction) + ' × 1 = ' + fmt(gradB) + '</code></div>';
      note = Math.abs(data.x) < 1e-9 ? '此时 x=0，改变 k 不会改变这条样本的预测，所以 ∂L/∂k=0；偏置 b 仍能整体平移预测，梯度可以非零。' : '反向传回的不是把“错误答案”原样复制给每层，而是把局部导数按链式法则相乘，算出每个参数对损失的影响。';
    } else {
      equations = '<div><span>更新权重</span><code>k ← k − η∂L/∂k = ' + fmt(data.k) + ' − ' + fmt(data.rate) + ' × (' + fmt(gradK) + ') = ' + fmt(nextK) + '</code></div><div><span>更新偏置</span><code>b ← b − η∂L/∂b = ' + fmt(data.b) + ' − ' + fmt(data.rate) + ' × (' + fmt(gradB) + ') = ' + fmt(nextB) + '</code></div><div><span>更新后再前向计算</span><code>ŷ = ' + fmt(nextPrediction) + '，L = ' + fmt(nextLoss) + '（原来 ' + fmt(loss) + '）</code></div>';
      note = nextLoss < loss - 1e-8 ? '在这组数值和学习率下，一步更新后损失下降了。训练会重复“预测 → 求梯度 → 更新”，但每一步是否下降取决于目标曲面和步幅。' : nextLoss > loss + 1e-8 ? '这次一步后损失反而变大了，学习率可能太大，跨过了更低的位置。学习率控制每次走多远。' : '这一步没有明显降低损失；可调整学习率、参数或样本再观察。';
    }
    root.querySelector('[data-bp-equations]').innerHTML = equations;
    root.querySelector('[data-bp-stage-note]').textContent = note;
  }

  window.lessonPlaygrounds = {
    render(id, index) { return id === 'gradient' && index === 2 ? markup() : previous.render(id, index); },
    initialize() {
      previous.initialize();
      document.querySelectorAll('[data-backprop-playground]').forEach(root => update(root));
    },
  };

  document.addEventListener('input', event => {
    const input = event.target.closest('[data-bp-input]');
    if (input) update(input.closest('[data-backprop-playground]'));
  });
  document.addEventListener('click', event => {
    const root = event.target.closest('[data-backprop-playground]');
    if (!root) return;
    const stageButton = event.target.closest('[data-bp-step]');
    if (stageButton) { update(root, Number(stageButton.dataset.bpStep)); return; }
    if (event.target.closest('[data-bp-prev]')) { update(root, Math.max(1, Number(root.dataset.bpStage) - 1)); return; }
    if (event.target.closest('[data-bp-next]')) { update(root, Math.min(4, Number(root.dataset.bpStage) + 1)); return; }
    if (event.target.closest('[data-bp-reset]')) {
      root.querySelector('[data-bp-input="x"]').value = '2';
      root.querySelector('[data-bp-input="target"]').value = '3';
      root.querySelector('[data-bp-input="k"]').value = '0.8';
      root.querySelector('[data-bp-input="b"]').value = '0.2';
      root.querySelector('[data-bp-input="rate"]').value = '0.1';
      root.querySelectorAll('[data-bp-answer]').forEach(button => button.removeAttribute('aria-pressed'));
      root.querySelector('[data-bp-feedback]').textContent = '';
      update(root, 1);
      return;
    }
    const answer = event.target.closest('[data-bp-answer]');
    if (answer) {
      const correct = answer.dataset.bpAnswer === 'k';
      root.querySelectorAll('[data-bp-answer]').forEach(button => button.setAttribute('aria-pressed', String(button === answer)));
      root.querySelector('[data-bp-feedback]').textContent = correct
        ? '回答正确。∂L/∂k=(ŷ−y)x；当 x=0 时，这条样本的损失对 k 不敏感。∂L/∂b=ŷ−y，偏置仍可能收到梯度。'
        : '再想一想。模型是 ŷ=kx+b：当 x=0，k 这一项对预测没有贡献；试着选“权重 k”。';
    }
  });
})();
