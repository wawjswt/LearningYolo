/* Small, deterministic visual experiments for the existing textbook lab. */
(() => {
  const lessonMatrix = [
    [0, 0, 0, 0, 0],
    [0, 1, 1, 0, 0],
    [0, 1, 1, 0, 0],
    [0, 0, 0, 1, 1],
    [0, 0, 0, 1, 1],
  ];
  const kernels = {
    edge: { label: '边缘检测', values: [[-1, 0, 1], [-2, 0, 2], [-1, 0, 1]] },
    blur: { label: '均值模糊', values: [[1 / 9, 1 / 9, 1 / 9], [1 / 9, 1 / 9, 1 / 9], [1 / 9, 1 / 9, 1 / 9]] },
    sharpen: { label: '锐化', values: [[0, -1, 0], [-1, 5, -1], [0, -1, 0]] },
  };
  const candidates = [
    { id: 'A', score: 0.92, className: 'person', box: [62, 70, 214, 226] },
    { id: 'B', score: 0.78, className: 'person', box: [84, 90, 236, 246] },
    { id: 'C', score: 0.66, className: 'person', box: [290, 92, 412, 250] },
  ];
  const tabIds = ['iou', 'gradient', 'convolution', 'nms'];
  let activeTab = 'iou';
  let convolutionFocus = { row: 1, column: 1 };

  const byId = id => document.getElementById(id);
  const number = (value, fallback) => Number.isFinite(Number(value)) ? Number(value) : fallback;
  const format = value => Number(value).toFixed(2).replace(/\.00$/, '');

  function gradientDescent(learningRate = 0.5, steps = 6, start = -4) {
    const rate = Number(learningRate);
    const count = Number(steps);
    let weight = Number(start);
    if (!Number.isFinite(rate) || rate <= 0 || !Number.isInteger(count) || count < 0 || !Number.isFinite(weight)) return [];
    const path = [];
    for (let step = 0; step <= count; step++) {
      path.push({ step, weight, loss: 0.5 * (weight - 3) ** 2 });
      if (step < count) weight -= rate * (weight - 3);
    }
    return path;
  }

  function convolve(input, kernel) {
    if (!Array.isArray(input) || !Array.isArray(kernel) || !input.length || !kernel.length) return [];
    const inputWidth = input[0]?.length || 0;
    const kernelWidth = kernel[0]?.length || 0;
    if (!inputWidth || !kernelWidth || input.some(row => !Array.isArray(row) || row.length !== inputWidth)
      || kernel.some(row => !Array.isArray(row) || row.length !== kernelWidth)
      || input.length < kernel.length || inputWidth < kernelWidth) return [];
    const output = [];
    for (let row = 0; row <= input.length - kernel.length; row++) {
      const outputRow = [];
      for (let column = 0; column <= inputWidth - kernelWidth; column++) {
        let sum = 0;
        for (let ky = 0; ky < kernel.length; ky++) {
          for (let kx = 0; kx < kernelWidth; kx++) sum += input[row + ky][column + kx] * kernel[ky][kx];
        }
        outputRow.push(Number(sum.toFixed(2)));
      }
      output.push(outputRow);
    }
    return output;
  }

  function intersectionOverUnion(a, b) {
    const [ax1, ay1, ax2, ay2] = a;
    const [bx1, by1, bx2, by2] = b;
    const intersection = Math.max(0, Math.min(ax2, bx2) - Math.max(ax1, bx1))
      * Math.max(0, Math.min(ay2, by2) - Math.max(ay1, by1));
    const areaA = Math.max(0, ax2 - ax1) * Math.max(0, ay2 - ay1);
    const areaB = Math.max(0, bx2 - bx1) * Math.max(0, by2 - by1);
    const union = areaA + areaB - intersection;
    return union > 0 ? intersection / union : 0;
  }

  function nonMaximumSuppression(items, confidenceThreshold, overlapThreshold) {
    const confidence = number(confidenceThreshold, 0.3);
    const overlap = number(overlapThreshold, 0.5);
    const filtered = items.filter(item => item.score < confidence);
    let pending = items.filter(item => item.score >= confidence).slice().sort((a, b) => b.score - a.score);
    const kept = [];
    const suppressed = [];
    while (pending.length) {
      const best = pending.shift();
      kept.push(best);
      const remaining = [];
      for (const item of pending) {
        const iou = item.className === best.className ? intersectionOverUnion(item.box, best.box) : 0;
        if (iou > overlap) suppressed.push({ ...item, suppressedBy: best.id, overlap: iou });
        else remaining.push(item);
      }
      pending = remaining;
    }
    return { kept, suppressed, filtered };
  }

  function setActiveTab(id, focus = false) {
    const tabs = [...document.querySelectorAll('[data-lab-tab]')];
    const panels = [...document.querySelectorAll('[data-lab-panel]')];
    const selected = tabs.find(tab => (tab.dataset?.labTab || tab.getAttribute('data-lab-tab')) === id);
    if (!selected) return false;
    activeTab = id;
    tabs.forEach(tab => {
      const active = (tab.dataset?.labTab || tab.getAttribute('data-lab-tab')) === id;
      tab.setAttribute('aria-selected', String(active));
      tab.setAttribute('tabindex', active ? '0' : '-1');
    });
    panels.forEach(panel => { panel.hidden = (panel.dataset?.labPanel || panel.getAttribute('data-lab-panel')) !== id; });
    if (focus) selected.focus();
    return true;
  }

  function gradientPanel() {
    return '<section class="experiment-panel" role="tabpanel" id="lab-panel-gradient" aria-labelledby="lab-tab-gradient" data-lab-panel="gradient" hidden>'
      + '<div class="lab-sim-layout"><div class="lab-visual-card"><div class="lab-card-heading"><div><span class="chapter-kicker">LOSS LANDSCAPE</span><h2>沿着斜坡，一步步找低点</h2></div><strong id="gradient-result"></strong></div>'
      + '<div id="gradient-chart" class="lab-chart" aria-live="polite"></div><div class="lab-chart-legend"><span></span>损失曲线 <i></i>参数更新路径</div></div>'
      + '<div class="lab-control-card"><label for="gradient-lr">学习率 η <output id="gradient-lr-value">0.50</output></label><input id="gradient-lr" type="range" min="0.05" max="1.90" step="0.05" value="0.50">'
      + '<label for="gradient-steps">更新步数 <output id="gradient-steps-value">4</output></label><input id="gradient-steps" type="range" min="1" max="8" step="1" value="4">'
      + '<div id="gradient-explanation" class="lab-callout" aria-live="polite"></div><p class="lab-formula">本实验的损失为 <code>L(w)=½(w−3)²</code>，梯度为 <code>w−3</code>。每一步按 <code>w ← w−η∇L</code> 更新。</p>'
      + '<button class="secondary" type="button" data-lab-reset="gradient">重置参数</button><p class="lab-small-note">学习率较小时收敛慢；偏大时会越过谷底。这里的稳定范围是 0 &lt; η &lt; 2。</p></div></div>'
      + '<a class="lab-lesson-link" href="#lesson/optimizer">接着学习：优化器与学习率 →</a></section>';
  }

  function convolutionPanel() {
    return '<section class="experiment-panel" role="tabpanel" id="lab-panel-convolution" aria-labelledby="lab-tab-convolution" data-lab-panel="convolution" hidden>'
      + '<div class="lab-sim-layout"><div class="lab-visual-card"><div class="lab-card-heading"><div><span class="chapter-kicker">KERNEL × IMAGE</span><h2>卷积核怎样留下特征</h2></div><span class="lab-step-badge">5×5 → 3×3</span></div>'
      + '<div id="conv-visual" class="conv-visual" aria-live="polite"></div><p id="conv-detail" class="lab-callout" aria-live="polite"></p></div>'
      + '<div class="lab-control-card"><label for="conv-kernel">选择一个 3×3 卷积核</label><select id="conv-kernel"><option value="edge">边缘检测</option><option value="blur">均值模糊</option><option value="sharpen">锐化</option></select>'
      + '<p class="lab-formula">每个输出格都来自对应的 3×3 输入区域：对应元素相乘，再把 9 个乘积相加。</p><p class="lab-small-note">点击输出特征图中的格子，可以高亮它在输入图像上对应的感受野。深度学习框架通常使用不翻转卷积核的互相关运算。</p>'
      + '<a class="lab-lesson-link" href="#lesson/cnn">接着学习：卷积神经网络与感受野 →</a></div></div></section>';
  }

  function nmsPanel() {
    return '<section class="experiment-panel" role="tabpanel" id="lab-panel-nms" aria-labelledby="lab-tab-nms" data-lab-panel="nms" hidden>'
      + '<div class="lab-sim-layout"><div class="lab-visual-card"><div class="lab-card-heading"><div><span class="chapter-kicker">CONFIDENCE → NMS</span><h2>从重叠候选框中选出结果</h2></div><span class="lab-step-badge">同类别示例</span></div>'
      + '<div id="nms-visual" class="nms-visual" aria-live="polite"></div><p id="nms-summary" class="lab-callout" aria-live="polite"></p></div>'
      + '<div class="lab-control-card"><label for="nms-confidence">置信度阈值 <output id="nms-confidence-value">0.30</output></label><input id="nms-confidence" type="range" min="0.20" max="0.90" step="0.05" value="0.30">'
      + '<label for="nms-iou">NMS 的 IoU 阈值 <output id="nms-iou-value">0.50</output></label><input id="nms-iou" type="range" min="0.10" max="0.90" step="0.05" value="0.50">'
      + '<ol class="nms-steps"><li>先按置信度阈值移除低分框。</li><li>按分数从高到低选框。</li><li>同类框与已选框的 IoU 超过阈值时，移除重叠较大的框。</li></ol>'
      + '<p class="lab-small-note">调高 NMS 的 IoU 阈值会让抑制更宽松；调低则更容易去掉重叠候选框。真实检测器还会按类别分别处理。</p><a class="lab-lesson-link" href="#lesson/metrics">接着学习：NMS、Precision、Recall 与 mAP →</a></div></div></section>';
  }

  function renderInteractiveLab() {
    const oldMarkup = lab();
    const gridStart = oldMarkup.indexOf('<div class="lab-grid">');
    const iouMarkup = gridStart >= 0 ? oldMarkup.slice(gridStart) : '<p class="lab-callout">IoU 实验暂时无法加载，请刷新页面重试。</p>';
    const tabs = [
      ['iou', 'IoU 框重叠'], ['gradient', '梯度下降'], ['convolution', '卷积特征'], ['nms', 'YOLO 后处理'],
    ];
    return '<section class="page-intro"><p class="eyebrow">LEARN BY INTERACTION</p><h1>让概念动起来。</h1><p>拖动参数、切换算子、观察结果变化。每个实验都把图像、计算步骤和教材章节连在一起。</p></section>'
      + '<p class="lab-notice"><strong>建议：</strong>先预测参数变化会带来什么结果，再操作控件验证自己的判断。</p>'
      + '<div class="lab-tabs" role="tablist" aria-label="选择学习实验">' + tabs.map(([id, label], index) => '<button type="button" role="tab" id="lab-tab-' + id + '" aria-controls="lab-panel-' + id + '" aria-selected="' + String(activeTab === id) + '" tabindex="' + (activeTab === id ? '0' : '-1') + '" data-lab-tab="' + id + '">' + label + '<span>0' + (index + 1) + '</span></button>').join('') + '</div>'
      + '<section class="experiment-panel" role="tabpanel" id="lab-panel-iou" aria-labelledby="lab-tab-iou" data-lab-panel="iou"' + (activeTab === 'iou' ? '' : ' hidden') + '>' + iouMarkup + '<a class="lab-lesson-link" href="#lesson/iou">接着学习：交并比与检测评价 →</a></section>'
      + gradientPanel() + convolutionPanel() + nmsPanel();
  }

  function updateGradient() {
    const rateInput = byId('gradient-lr');
    const stepsInput = byId('gradient-steps');
    const chart = byId('gradient-chart');
    if (!rateInput || !stepsInput || !chart) return;
    const rate = number(rateInput.value, 0.5);
    const steps = number(stepsInput.value, 4);
    const path = gradientDescent(rate, steps);
    byId('gradient-lr-value').textContent = rate.toFixed(2);
    byId('gradient-steps-value').textContent = String(steps);
    const left = 52, top = 18, width = 420, height = 192, xMin = -4, xMax = 10, maxLoss = 26;
    const x = weight => left + ((weight - xMin) / (xMax - xMin)) * width;
    const y = loss => top + height - (Math.min(loss, maxLoss) / maxLoss) * height;
    const curve = Array.from({ length: 57 }, (_, index) => {
      const weight = xMin + (xMax - xMin) * index / 56;
      return (index ? 'L' : 'M') + x(weight).toFixed(1) + ' ' + y(0.5 * (weight - 3) ** 2).toFixed(1);
    }).join(' ');
    const points = path.map(item => ({ ...item, px: x(item.weight), py: y(item.loss) }));
    const walk = points.map((item, index) => (index ? 'L' : 'M') + item.px.toFixed(1) + ' ' + item.py.toFixed(1)).join(' ');
    const marks = points.map(item => '<circle cx="' + item.px.toFixed(1) + '" cy="' + item.py.toFixed(1) + '" r="5"><title>第 ' + item.step + ' 步：w=' + format(item.weight) + '，损失=' + format(item.loss) + '</title></circle><text x="' + item.px.toFixed(1) + '" y="' + (item.py - 10).toFixed(1) + '" text-anchor="middle">' + item.step + '</text>').join('');
    chart.innerHTML = '<svg viewBox="0 0 510 260" role="img" aria-label="抛物线损失曲线上的梯度下降路径"><path class="chart-axis" d="M52 18V210H472"/><path class="loss-curve" d="' + curve + '"/><path class="gradient-walk" d="' + walk + '"/><path class="minimum-line" d="M262 18V210"/><text x="267" y="32">最低点 w=3</text><text x="52" y="235">w = -4</text><text x="443" y="235">w = 10</text>' + marks + '</svg>';
    const last = path[path.length - 1];
    byId('gradient-result').textContent = 'w = ' + format(last.weight) + ' · L = ' + format(last.loss);
    byId('gradient-explanation').textContent = rate < 0.25
      ? '学习率较小，每次沿斜坡前进一小步，下降平稳但需要更多轮。'
      : rate > 1
        ? '学习率偏大，更新点会跨过谷底并左右摆动；当前 η 小于 2，仍会逐步靠近最低点。'
        : '每一步都沿负梯度方向更新参数。绿色路径逐渐靠近损失最低点，损失值随之下降。';
  }

  function updateConvolution() {
    const kernelInput = byId('conv-kernel');
    const visual = byId('conv-visual');
    const detail = byId('conv-detail');
    if (!kernelInput || !visual || !detail) return;
    const selected = kernels[kernelInput.value] || kernels.edge;
    const output = convolve(lessonMatrix, selected.values);
    const maxAbs = Math.max(1, ...output.flat().map(value => Math.abs(value)));
    const focusRow = Math.min(Math.max(0, convolutionFocus.row), output.length - 1);
    const focusColumn = Math.min(Math.max(0, convolutionFocus.column), output[0].length - 1);
    convolutionFocus = { row: focusRow, column: focusColumn };
    const inputCells = lessonMatrix.map((row, r) => row.map((value, c) => {
      const inPatch = r >= focusRow && r < focusRow + 3 && c >= focusColumn && c < focusColumn + 3;
      return '<span class="conv-cell' + (inPatch ? ' is-active-patch' : '') + '" aria-label="像素 ' + value + '">' + value + '</span>';
    }).join('')).join('');
    const outputCells = output.map((row, r) => row.map((value, c) => {
      const active = r === focusRow && c === focusColumn;
      const intensity = Math.min(0.9, 0.12 + Math.abs(value) / maxAbs * 0.72).toFixed(2);
      return '<button type="button" class="conv-cell conv-output-cell' + (active ? ' is-selected' : '') + '" style="--cell-strength:' + intensity + '" data-conv-cell="' + r + ',' + c + '" aria-label="输出特征第 ' + (r + 1) + ' 行第 ' + (c + 1) + ' 列，数值 ' + format(value) + '">' + format(value) + '</button>';
    }).join('')).join('');
    const kernelCells = selected.values.map(row => row.map(value => '<span class="conv-cell kernel-cell">' + format(value) + '</span>').join('')).join('');
    const result = output[focusRow][focusColumn];
    visual.innerHTML = '<div class="conv-workbench"><div><span class="conv-grid-title">输入图像 · 5×5</span><div class="conv-grid conv-input-grid" style="--cols:5" role="img" aria-label="输入图像像素矩阵">' + inputCells + '</div></div>'
      + '<div class="conv-arrow" aria-hidden="true">→</div><div><span class="conv-grid-title">3×3 ' + selected.label + '核</span><div class="conv-grid kernel-grid" style="--cols:3" role="img" aria-label="' + selected.label + '卷积核">' + kernelCells + '</div></div>'
      + '<div class="conv-arrow" aria-hidden="true">→</div><div><span class="conv-grid-title">输出特征图 · 3×3</span><div class="conv-grid conv-output-grid" style="--cols:3" role="group" aria-label="选择一个输出像素查看计算区域">' + outputCells + '</div></div></div>';
    detail.textContent = '输出位置（' + (focusRow + 1) + ', ' + (focusColumn + 1) + '）来自输入图像第 ' + (focusRow + 1) + ' 至 ' + (focusRow + 3) + ' 行、第 ' + (focusColumn + 1) + ' 至 ' + (focusColumn + 3) + ' 列；对应相乘并求和，得到 ' + format(result) + '。';
  }

  function updateNms() {
    const confidenceInput = byId('nms-confidence');
    const overlapInput = byId('nms-iou');
    const visual = byId('nms-visual');
    const summary = byId('nms-summary');
    if (!confidenceInput || !overlapInput || !visual || !summary) return;
    const confidence = number(confidenceInput.value, 0.3);
    const overlap = number(overlapInput.value, 0.5);
    const result = nonMaximumSuppression(candidates, confidence, overlap);
    byId('nms-confidence-value').textContent = confidence.toFixed(2);
    byId('nms-iou-value').textContent = overlap.toFixed(2);
    const kept = new Set(result.kept.map(item => item.id));
    const suppressed = new Map(result.suppressed.map(item => [item.id, item]));
    const filtered = new Set(result.filtered.map(item => item.id));
    const boxes = candidates.map(item => {
      const [x, y, x2, y2] = item.box;
      const state = kept.has(item.id) ? 'kept' : suppressed.has(item.id) ? 'suppressed' : 'filtered';
      const reason = state === 'kept' ? '保留' : state === 'suppressed' ? 'IoU ' + format(suppressed.get(item.id).overlap) + ' · 被抑制' : '低于置信度';
      return '<g class="nms-box nms-' + state + '"><rect x="' + x + '" y="' + y + '" width="' + (x2 - x) + '" height="' + (y2 - y) + '" rx="4"/><rect class="nms-label-bg" x="' + x + '" y="' + Math.max(16, y - 24) + '" width="148" height="20" rx="3"/><text x="' + (x + 5) + '" y="' + (Math.max(16, y - 24) + 14) + '">' + item.id + ' · ' + item.score.toFixed(2) + ' · ' + reason + '</text></g>';
    }).join('');
    visual.innerHTML = '<svg viewBox="0 0 480 290" role="img" aria-label="调整阈值后显示保留、抑制和低置信度目标框"><defs><pattern id="nms-grid" width="20" height="20" patternUnits="userSpaceOnUse"><path d="M20 0H0V20" stroke="#dedbd2" stroke-width=".7"/></pattern></defs><rect width="480" height="290" fill="url(#nms-grid)"/><path d="M24 254H456M42 270H128M300 270H430" stroke="#b8c8b9" stroke-width="4" stroke-linecap="round"/><circle cx="138" cy="94" r="19" fill="#d9dfd1"/><path d="M120 117Q138 103 156 117L170 218H108Z" fill="#d9dfd1"/><circle cx="352" cy="120" r="15" fill="#d9dfd1"/><path d="M338 139Q352 129 366 139L378 226H326Z" fill="#d9dfd1"/>' + boxes + '</svg>';
    summary.textContent = '置信度筛选后剩余 ' + (candidates.length - result.filtered.length) + ' 个候选框；NMS 抑制 ' + result.suppressed.length + ' 个重叠框，最终保留 ' + result.kept.length + ' 个。';
  }

  function initializeInteractiveLab() {
    setActiveTab(activeTab);
    updateGradient();
    updateConvolution();
    updateNms();
  }

  window.VisionLabMath = { gradientDescent, convolve, intersectionOverUnion, nonMaximumSuppression };
  window.renderInteractiveLab = renderInteractiveLab;
  window.initializeInteractiveLab = initializeInteractiveLab;
  window.setActiveLabTab = setActiveTab;

  document.addEventListener('click', event => {
    const tab = event.target.closest('[data-lab-tab]');
    if (tab) { setActiveTab(tab.dataset.labTab); return; }
    const cell = event.target.closest('[data-conv-cell]');
    if (cell) {
      const [row, column] = cell.dataset.convCell.split(',').map(Number);
      convolutionFocus = { row, column };
      updateConvolution();
      [...document.querySelectorAll('[data-conv-cell]')]
        .find(outputCell => outputCell.dataset.convCell === row + ',' + column)?.focus();
      return;
    }
    const reset = event.target.closest('[data-lab-reset="gradient"]');
    if (reset) {
      byId('gradient-lr').value = '0.50';
      byId('gradient-steps').value = '4';
      updateGradient();
    }
  });

  document.addEventListener('input', event => {
    if (event.target.id === 'gradient-lr' || event.target.id === 'gradient-steps') updateGradient();
    if (event.target.id === 'conv-kernel') { convolutionFocus = { row: 1, column: 1 }; updateConvolution(); }
    if (event.target.id === 'nms-confidence' || event.target.id === 'nms-iou') updateNms();
  });

  document.addEventListener('keydown', event => {
    const tab = event.target.closest('[data-lab-tab]');
    if (!tab) return;
    const index = tabIds.indexOf(tab.dataset.labTab);
    if (index < 0) return;
    let next = null;
    if (event.key === 'ArrowRight') next = (index + 1) % tabIds.length;
    if (event.key === 'ArrowLeft') next = (index - 1 + tabIds.length) % tabIds.length;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = tabIds.length - 1;
    if (next === null) return;
    event.preventDefault();
    setActiveTab(tabIds[next], true);
  });
})();
