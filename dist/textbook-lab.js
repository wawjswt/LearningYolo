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
  const metricGroundTruths = { person: 4, vehicle: 3 };
  const metricClassLabels = { person: '行人', vehicle: '车辆' };
  const metricPredictions = [
    { className: 'person', score: 0.96, targetId: 'p1', iou: 0.91 },
    { className: 'vehicle', score: 0.93, targetId: 'v1', iou: 0.86 },
    { className: 'person', score: 0.90, targetId: 'p1', iou: 0.82 },
    { className: 'person', score: 0.85, targetId: 'p2', iou: 0.71 },
    { className: 'vehicle', score: 0.82, targetId: 'v1', iou: 0.73 },
    { className: 'person', score: 0.78, targetId: null, iou: 0 },
    { className: 'vehicle', score: 0.74, targetId: 'v2', iou: 0.64 },
    { className: 'person', score: 0.69, targetId: 'p3', iou: 0.62 },
    { className: 'vehicle', score: 0.65, targetId: null, iou: 0 },
    { className: 'vehicle', score: 0.60, targetId: 'v3', iou: 0.53 },
    { className: 'person', score: 0.56, targetId: 'p4', iou: 0.48 },
    { className: 'person', score: 0.50, targetId: 'p2', iou: 0.90 },
  ];
  const tabIds = ['iou', 'gradient', 'convolution', 'nms', 'metrics'];
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

  function detectionCounts(items, groundTruthCount, confidenceThreshold, iouThreshold) {
    const selected = items.filter(item => Number(item.score) >= confidenceThreshold).slice().sort((a, b) => b.score - a.score);
    const matchedTargets = new Set();
    let tp = 0;
    let fp = 0;
    for (const item of selected) {
      const matchKey = item.targetId == null ? '' : item.className + ':' + item.targetId;
      const isMatch = matchKey && Number(item.iou) >= iouThreshold && !matchedTargets.has(matchKey);
      if (isMatch) {
        tp++;
        matchedTargets.add(matchKey);
      } else fp++;
    }
    const fn = Math.max(0, groundTruthCount - tp);
    const precision = tp + fp ? tp / (tp + fp) : 0;
    const recall = groundTruthCount ? tp / groundTruthCount : 0;
    const f1 = precision + recall ? 2 * precision * recall / (precision + recall) : 0;
    return { tp, fp, fn, precision, recall, f1 };
  }

  function detectionCurve(items, groundTruthCount, iouThreshold) {
    const thresholds = [1, ...new Set(items.map(item => Number(item.score)))].sort((a, b) => b - a);
    return thresholds.map(threshold => ({
      threshold,
      ...detectionCounts(items, groundTruthCount, threshold, iouThreshold),
    }));
  }

  function interpolatedAveragePrecision(curve) {
    const measured = curve.filter(point => point.tp + point.fp > 0);
    if (!measured.length) return 0;
    let total = 0;
    for (let sample = 0; sample <= 100; sample++) {
      const recall = sample / 100;
      let bestPrecision = 0;
      for (const point of measured) {
        if (point.recall + 1e-12 >= recall) bestPrecision = Math.max(bestPrecision, point.precision);
      }
      total += bestPrecision;
    }
    return total / 101;
  }

  function evaluateDetectionMetrics(predictions, groundTruthCounts, options = {}) {
    const confidenceThreshold = number(options.confidenceThreshold, 0.5);
    const iouThreshold = number(options.iouThreshold, 0.5);
    const className = options.className || 'all';
    const classes = Object.keys(groundTruthCounts).filter(name => Number(groundTruthCounts[name]) > 0);
    const selectedClasses = className === 'all' || !classes.includes(className) ? classes : [className];
    const selectedPredictions = predictions.filter(item => selectedClasses.includes(item.className));
    const selectedGroundTruths = selectedClasses.reduce((sum, name) => sum + Number(groundTruthCounts[name]), 0);
    const curve = detectionCurve(selectedPredictions, selectedGroundTruths, iouThreshold);
    const operatingPoint = detectionCounts(selectedPredictions, selectedGroundTruths, confidenceThreshold, iouThreshold);
    const apAtIouByClass = {};
    const ap50ByClass = {};
    const ap5095ByClass = {};
    const iouThresholds = Array.from({ length: 10 }, (_, index) => Number((0.5 + index * 0.05).toFixed(2)));
    for (const name of classes) {
      const classPredictions = predictions.filter(item => item.className === name);
      apAtIouByClass[name] = interpolatedAveragePrecision(detectionCurve(classPredictions, Number(groundTruthCounts[name]), iouThreshold));
      ap50ByClass[name] = interpolatedAveragePrecision(detectionCurve(classPredictions, Number(groundTruthCounts[name]), 0.5));
      ap5095ByClass[name] = iouThresholds.reduce((sum, threshold) => (
        sum + interpolatedAveragePrecision(detectionCurve(classPredictions, Number(groundTruthCounts[name]), threshold))
      ), 0) / iouThresholds.length;
    }
    const mean = values => values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;
    const bestF1 = curve.reduce((best, point) => point.f1 > best.f1 ? point : best, curve[0] || { threshold: 1, f1: 0 });
    return {
      operatingPoint,
      curve,
      bestF1,
      apAtIouByClass,
      ap50ByClass,
      ap5095ByClass,
      mapAtIou: mean(Object.values(apAtIouByClass)),
      map50: mean(Object.values(ap50ByClass)),
      map5095: mean(Object.values(ap5095ByClass)),
    };
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

  function metricsPanel() {
    return '<section class="experiment-panel" role="tabpanel" id="lab-panel-metrics" aria-labelledby="lab-tab-metrics" data-lab-panel="metrics" hidden>'
      + '<div class="metric-intro-card"><span class="chapter-kicker">PRECISION · RECALL · AVERAGE PRECISION</span><h2>同一组预测，如何变成评估曲线</h2><p>这组教学样例包含 7 个标注目标、12 个候选框和两个类别。分数与重合度是预设的模拟数据，用来展示评估过程，不代表浏览器运行了 YOLOv5。</p></div>'
      + '<div class="metric-workbench"><div class="metric-chart-stack"><article class="lab-visual-card metric-chart-card"><div class="lab-card-heading"><div><span class="chapter-kicker">PRECISION ↔ RECALL</span><h3>PR 曲线</h3></div><span class="lab-step-badge">阈值逐步变化</span></div><div id="metric-pr-chart" class="metric-chart" aria-live="polite"></div><p class="metric-chart-caption">每个点代表一个置信度阈值。曲线越靠近右上角，通常表示模型能在找回更多目标时维持较高准确率。</p></article>'
      + '<article class="lab-visual-card metric-chart-card"><div class="lab-card-heading"><div><span class="chapter-kicker">F1 ↔ CONFIDENCE</span><h3>F1 曲线</h3></div><span id="metric-best-f1" class="lab-step-badge"></span></div><div id="metric-f1-chart" class="metric-chart" aria-live="polite"></div><p class="metric-chart-caption">F1 是 Precision 与 Recall 的调和平均。它会显示两者折中较好的置信度范围；并列峰值时取较高阈值。</p></article></div>'
      + '<aside class="lab-control-card metric-control-card"><label for="metric-class">查看类别</label><select id="metric-class"><option value="all">全部类别 · 汇总</option><option value="person">行人</option><option value="vehicle">车辆</option></select>'
      + '<label for="metric-confidence">置信度阈值 <output id="metric-confidence-value">0.70</output></label><input id="metric-confidence" type="range" min="0.05" max="0.95" step="0.05" value="0.70">'
      + '<label for="metric-iou">匹配所需 IoU <output id="metric-iou-value">0.50</output></label><input id="metric-iou" type="range" min="0.50" max="0.95" step="0.05" value="0.50">'
      + '<p id="metric-point-summary" class="lab-callout metric-point-summary" aria-live="polite"></p><div class="metric-score-grid"><div><span>Precision</span><strong id="metric-precision"></strong></div><div><span>Recall</span><strong id="metric-recall"></strong></div><div><span>F1</span><strong id="metric-f1"></strong></div></div>'
      + '<div class="metric-formulas"><p><b>Precision</b> = TP ÷ (TP + FP)</p><p><b>Recall</b> = TP ÷ (TP + FN)</p><p><b>F1</b> = 2 × P × R ÷ (P + R)</p></div><p class="lab-small-note">TP：正确匹配的框；FP：重复、误检或 IoU 未达标的框；FN：没有被找回的标注目标。</p></aside></div>'
      + '<article class="lab-visual-card metric-map-card"><div class="lab-card-heading"><div><span class="chapter-kicker">AVERAGE PRECISION · MEAN AP</span><h3>从 PR 面积到 mAP</h3></div><div id="metric-map-summary" class="metric-map-summary" aria-live="polite"></div></div><div class="metric-ap-legend"><span><i class="ap50"></i>AP@0.50</span><span><i class="ap5095"></i>AP@0.50:0.95</span></div><div id="metric-map-breakdown" class="metric-map-breakdown"></div><p class="metric-chart-caption">AP 是某一类别 PR 曲线下的插值面积；mAP@0.50 先在 IoU=0.50 计算每类 AP，再对类别求平均。mAP@0.50:0.95 则把 IoU 从 0.50 到 0.95（步长 0.05）的 AP 一并平均，共 10 个阈值。图中采用 101 点插值。</p></article>'
      + '<p class="lab-formula metric-reading-note">调置信度会改变 PR 曲线上的工作点；调匹配 IoU 会改变哪些预测算 TP。AP 看一整条 PR 曲线，mAP 再对类别及指定 IoU 阈值求平均。</p>'
      + '<a class="lab-lesson-link" href="#lesson/metrics">接着学习：NMS、Precision、Recall 与 mAP →</a></section>';
  }

  function renderInteractiveLab() {
    const oldMarkup = lab();
    const gridStart = oldMarkup.indexOf('<div class="lab-grid">');
    const iouMarkup = gridStart >= 0 ? oldMarkup.slice(gridStart) : '<p class="lab-callout">IoU 实验暂时无法加载，请刷新页面重试。</p>';
    const tabs = [
      ['iou', 'IoU 框重叠'], ['gradient', '梯度下降'], ['convolution', '卷积特征'], ['nms', 'YOLO 后处理'], ['metrics', 'PR · F1 · mAP'],
    ];
    return '<section class="page-intro"><p class="eyebrow">LEARN BY INTERACTION</p><h1>让概念动起来。</h1><p>拖动参数、切换算子、观察结果变化。每个实验都把图像、计算步骤和教材章节连在一起。</p></section>'
      + '<p class="lab-notice"><strong>建议：</strong>先预测参数变化会带来什么结果，再操作控件验证自己的判断。</p>'
      + '<div class="lab-tabs" role="tablist" aria-label="选择学习实验">' + tabs.map(([id, label], index) => '<button type="button" role="tab" id="lab-tab-' + id + '" aria-controls="lab-panel-' + id + '" aria-selected="' + String(activeTab === id) + '" tabindex="' + (activeTab === id ? '0' : '-1') + '" data-lab-tab="' + id + '">' + label + '<span>0' + (index + 1) + '</span></button>').join('') + '</div>'
      + '<section class="experiment-panel" role="tabpanel" id="lab-panel-iou" aria-labelledby="lab-tab-iou" data-lab-panel="iou"' + (activeTab === 'iou' ? '' : ' hidden') + '>' + iouMarkup + '<a class="lab-lesson-link" href="#lesson/iou">接着学习：交并比与检测评价 →</a></section>'
      + gradientPanel() + convolutionPanel() + nmsPanel() + metricsPanel();
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

  function updateMetrics() {
    const classInput = byId('metric-class');
    const confidenceInput = byId('metric-confidence');
    const iouInput = byId('metric-iou');
    const prChart = byId('metric-pr-chart');
    const f1Chart = byId('metric-f1-chart');
    const mapBreakdown = byId('metric-map-breakdown');
    if (!classInput || !confidenceInput || !iouInput || !prChart || !f1Chart || !mapBreakdown) return;
    const className = classInput.value || 'all';
    const confidence = number(confidenceInput.value, 0.7);
    const iouThreshold = number(iouInput.value, 0.5);
    const metrics = evaluateDetectionMetrics(metricPredictions, metricGroundTruths, {
      confidenceThreshold: confidence, iouThreshold, className,
    });
    const point = metrics.operatingPoint;
    const percentage = value => (value * 100).toFixed(1) + '%';
    const classLabel = className === 'all' ? '全部类别汇总' : metricClassLabels[className];
    byId('metric-confidence-value').textContent = confidence.toFixed(2);
    byId('metric-iou-value').textContent = iouThreshold.toFixed(2);
    byId('metric-point-summary').textContent = classLabel + ' · TP ' + point.tp + ' · FP ' + point.fp + ' · FN ' + point.fn;
    byId('metric-precision').textContent = percentage(point.precision);
    byId('metric-recall').textContent = percentage(point.recall);
    byId('metric-f1').textContent = percentage(point.f1);
    byId('metric-best-f1').textContent = '峰值 ' + percentage(metrics.bestF1.f1) + ' · 阈值 ' + metrics.bestF1.threshold.toFixed(2);
    byId('metric-map-summary').textContent = 'mAP@0.50 ' + percentage(metrics.map50) + '　·　mAP@0.50:0.95 ' + percentage(metrics.map5095) + '　·　当前 IoU 的 mAP ' + percentage(metrics.mapAtIou);

    const left = 48, top = 18, width = 422, height = 196;
    const grid = Array.from({ length: 5 }, (_, index) => {
      const tick = index / 4;
      const x = left + tick * width;
      const y = top + (1 - tick) * height;
      return '<path class="metric-grid-line" d="M' + left + ' ' + y.toFixed(1) + 'H' + (left + width) + 'M' + x.toFixed(1) + ' ' + top + 'V' + (top + height) + '"/><text class="metric-axis-label" x="' + (left - 10) + '" y="' + (y + 4).toFixed(1) + '" text-anchor="end">' + Math.round(tick * 100) + '</text><text class="metric-axis-label" x="' + x.toFixed(1) + '" y="' + (top + height + 22) + '" text-anchor="middle">' + Math.round(tick * 100) + '</text>';
    }).join('');
    const prPath = metrics.curve.map((item, index) => {
      const x = left + item.recall * width;
      const y = top + (1 - item.precision) * height;
      return (index ? 'L' : 'M') + x.toFixed(1) + ' ' + y.toFixed(1);
    }).join(' ');
    const prX = left + point.recall * width;
    const prY = top + (1 - point.precision) * height;
    prChart.innerHTML = '<svg viewBox="0 0 500 260" role="img" aria-label="Precision Recall 曲线；当前 Precision ' + percentage(point.precision) + '，Recall ' + percentage(point.recall) + '"><path class="metric-axis-line" d="M' + left + ' ' + top + 'V' + (top + height) + 'H' + (left + width) + '"/>' + grid + '<path class="metric-pr-line" d="' + prPath + '"/><circle class="metric-selected-point" cx="' + prX.toFixed(1) + '" cy="' + prY.toFixed(1) + '" r="6"><title>当前置信度 ' + confidence.toFixed(2) + '：Precision ' + percentage(point.precision) + '，Recall ' + percentage(point.recall) + '</title></circle><text class="metric-axis-title" x="259" y="254" text-anchor="middle">Recall (%)</text><text class="metric-axis-title" x="13" y="116" transform="rotate(-90 13 116)" text-anchor="middle">Precision (%)</text></svg>';

    const f1Points = metrics.curve.slice().sort((a, b) => a.threshold - b.threshold);
    const f1Path = f1Points.map((item, index) => {
      const x = left + item.threshold * width;
      const y = top + (1 - item.f1) * height;
      return (index ? 'L' : 'M') + x.toFixed(1) + ' ' + y.toFixed(1);
    }).join(' ');
    const f1X = left + confidence * width;
    const f1Y = top + (1 - point.f1) * height;
    const bestX = left + metrics.bestF1.threshold * width;
    const bestY = top + (1 - metrics.bestF1.f1) * height;
    f1Chart.innerHTML = '<svg viewBox="0 0 500 260" role="img" aria-label="F1 随置信度阈值变化的曲线；当前 F1 ' + percentage(point.f1) + '"><path class="metric-axis-line" d="M' + left + ' ' + top + 'V' + (top + height) + 'H' + (left + width) + '"/>' + grid + '<path class="metric-f1-line" d="' + f1Path + '"/><circle class="metric-best-point" cx="' + bestX.toFixed(1) + '" cy="' + bestY.toFixed(1) + '" r="5"><title>最佳 F1 ' + percentage(metrics.bestF1.f1) + '，置信度阈值 ' + metrics.bestF1.threshold.toFixed(2) + '</title></circle><circle class="metric-selected-point" cx="' + f1X.toFixed(1) + '" cy="' + f1Y.toFixed(1) + '" r="6"><title>当前阈值 ' + confidence.toFixed(2) + '：F1 ' + percentage(point.f1) + '</title></circle><text class="metric-axis-title" x="259" y="254" text-anchor="middle">置信度阈值</text><text class="metric-axis-title" x="13" y="116" transform="rotate(-90 13 116)" text-anchor="middle">F1 (%)</text></svg>';

    mapBreakdown.innerHTML = Object.keys(metricGroundTruths).map(name => {
      const ap50 = metrics.ap50ByClass[name];
      const ap5095 = metrics.ap5095ByClass[name];
      return '<div class="metric-ap-row" role="img" aria-label="' + metricClassLabels[name] + '：AP@0.50 ' + percentage(ap50) + '，AP@0.50:0.95 ' + percentage(ap5095) + '"><strong>' + metricClassLabels[name] + '</strong><div class="metric-ap-bars"><span class="metric-ap-bar ap50" style="--metric-bar-width:' + (ap50 * 100).toFixed(1) + '%"></span><span class="metric-ap-bar ap5095" style="--metric-bar-width:' + (ap5095 * 100).toFixed(1) + '%"></span></div><span class="metric-ap-values">' + percentage(ap50) + ' / ' + percentage(ap5095) + '</span></div>';
    }).join('');
  }

  function initializeInteractiveLab() {
    setActiveTab(activeTab);
    updateGradient();
    updateConvolution();
    updateNms();
    updateMetrics();
  }

  window.VisionLabMath = { gradientDescent, convolve, intersectionOverUnion, nonMaximumSuppression, evaluateDetectionMetrics };
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
    if (event.target.id === 'metric-class' || event.target.id === 'metric-confidence' || event.target.id === 'metric-iou') updateMetrics();
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
