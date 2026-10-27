/* One deterministic scene links the existing detection lessons into a single walkthrough. */
(() => {
  const sceneWidth = 480;
  const sceneHeight = 300;
  const letterboxSide = 480;
  const letterboxPadY = (letterboxSide - sceneHeight) / 2;
  const steps = [
    { title: '先确认数据与标注', kicker: '01 · DATA & LABELS', lesson: '#lesson/data-quality' },
    { title: '把图像变成模型输入', kicker: '02 · PREPROCESSING', lesson: '#lesson/image' },
    { title: '增强图像时同步更新标签', kicker: '03 · AUGMENTATION', lesson: '#lesson/augmentation' },
    { title: '让目标匹配到合适的尺度', kicker: '04 · GRID & ANCHORS', lesson: '#lesson/anchors' },
    { title: '训练用哪些信号纠错', kicker: '05 · TRAINING SIGNALS', lesson: '#lesson/yolo-loss' },
    { title: '置信度筛选与 NMS', kicker: '06 · INFERENCE & NMS', lesson: '#lesson/metrics' },
    { title: '用 IoU 计算检测结果', kicker: '07 · EVALUATION', lesson: '#lesson/metrics' },
  ];
  const targets = [
    { id: 'small-person', label: '远处行人', cls: 'person', classId: 0, box: [343, 100, 371, 193] },
    { id: 'bicycle', label: '自行车', cls: 'bicycle', classId: 1, box: [127, 171, 237, 253] },
    { id: 'near-person', label: '近处行人', cls: 'person', classId: 0, box: [80, 48, 152, 250] },
  ];
  const detections = [
    { id: 'A', cls: 'person', label: '行人', objectness: 0.94, classConfidence: 0.91, box: [82, 50, 154, 248] },
    { id: 'B', cls: 'person', label: '行人', objectness: 0.88, classConfidence: 0.81, box: [76, 54, 160, 247] },
    { id: 'C', cls: 'bicycle', label: '自行车', objectness: 0.90, classConfidence: 0.86, box: [128, 174, 239, 255] },
    { id: 'D', cls: 'bicycle', label: '自行车 · 类别混淆', objectness: 0.80, classConfidence: 0.60, box: [83, 50, 155, 248] },
    { id: 'E', cls: 'person', label: '远处行人', objectness: 0.52, classConfidence: 0.55, box: [342, 103, 370, 191] },
  ];
  const anchorGroups = [
    { name: 'P3 / 8', stride: 8, anchors: [[10, 13], [16, 30], [33, 23]] },
    { name: 'P4 / 16', stride: 16, anchors: [[30, 61], [62, 45], [59, 119]] },
    { name: 'P5 / 32', stride: 32, anchors: [[116, 90], [156, 198], [373, 326]] },
  ];
  const failures = {
    localization: { name: '框位置偏了', box: 0.66, obj: 0.12, cls: 0.08, text: '真实框已经匹配到预测，主要看 box 回归；objectness 和分类仍会在匹配正样本上提供监督。' },
    missing: { name: '真实目标漏标', box: 0.00, obj: 0.72, cls: 0.00, text: '没有真实标签的目标可能被当成背景，附近 objectness 会收到相反监督。先补标，再看模型。' },
    background: { name: '背景误报', box: 0.00, obj: 0.82, cls: 0.00, text: '未匹配的背景候选主要由 objectness 监督为负；它没有正样本框回归或分类目标。' },
    classification: { name: '类别判错', box: 0.12, obj: 0.20, cls: 0.78, text: '假设这个候选仍与真实框匹配，类别项会明显受影响；多类别任务才有分类损失。' },
  };
  const state = {
    step: 0,
    split: 'group',
    inputSize: 640,
    flipped: false,
    target: 'small-person',
    failure: 'localization',
    confidence: 0.30,
    nmsIou: 0.50,
    classAware: true,
    matchIou: 0.50,
  };

  const esc = value => String(value).replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
  const round = (value, digits = 2) => Number(value).toFixed(digits);
  const clamp = (value, low, high) => Math.max(low, Math.min(high, value));
  const candidateScore = item => item.objectness * item.classConfidence;
  const targetById = id => targets.find(target => target.id === id) || targets[0];
  const flippedBox = box => state.flipped ? [sceneWidth - box[2], box[1], sceneWidth - box[0], box[3]] : box.slice();

  function normalizedBox(box) {
    return [
      (box[0] + box[2]) / 2 / letterboxSide,
      ((box[1] + box[3]) / 2 + letterboxPadY) / letterboxSide,
      (box[2] - box[0]) / letterboxSide,
      (box[3] - box[1]) / letterboxSide,
    ];
  }

  function yoloLabel(target, flipped = false) {
    const box = flipped ? flippedBox(target.box) : target.box;
    return target.classId + ' ' + normalizedBox(box).map(value => round(value, 4)).join(' ');
  }

  function intersectionOverUnion(a, b) {
    const width = Math.max(0, Math.min(a[2], b[2]) - Math.max(a[0], b[0]));
    const height = Math.max(0, Math.min(a[3], b[3]) - Math.max(a[1], b[1]));
    const intersection = width * height;
    const areaA = Math.max(0, a[2] - a[0]) * Math.max(0, a[3] - a[1]);
    const areaB = Math.max(0, b[2] - b[0]) * Math.max(0, b[3] - b[1]);
    return intersection / Math.max(Number.EPSILON, areaA + areaB - intersection);
  }

  function nmsResults() {
    const ordered = detections.map(item => ({ ...item, score: candidateScore(item), status: 'kept', reason: '' }))
      .sort((a, b) => b.score - a.score);
    const retained = [];
    ordered.forEach(item => {
      if (item.score <= state.confidence) {
        item.status = 'filtered';
        item.reason = '分数没有超过阈值';
        return;
      }
      const blocker = retained.find(previous =>
        (!state.classAware || previous.cls === item.cls)
        && intersectionOverUnion(previous.box, item.box) > state.nmsIou);
      if (blocker) {
        item.status = 'suppressed';
        item.reason = '与 ' + blocker.id + ' 高度重叠';
      } else {
        retained.push(item);
      }
    });
    return { ordered, retained };
  }

  function evaluationResults() {
    const { retained } = nmsResults();
    const matched = new Set();
    const outcomes = retained.map(item => {
      const choices = targets
        .filter(target => target.cls === item.cls && !matched.has(target.id))
        .map(target => ({ target, iou: intersectionOverUnion(item.box, target.box) }))
        .sort((a, b) => b.iou - a.iou);
      const best = choices[0];
      if (best && best.iou > state.matchIou) {
        matched.add(best.target.id);
        return { item, result: 'TP', detail: '匹配 ' + best.target.label + '，IoU ' + round(best.iou) };
      }
      const closest = targets.filter(target => target.cls === item.cls)
        .map(target => intersectionOverUnion(item.box, target.box)).sort((a, b) => b - a)[0] || 0;
      return { item, result: 'FP', detail: '没有未匹配的同类框超过阈值；最高 IoU ' + round(closest) };
    });
    const tp = outcomes.filter(item => item.result === 'TP').length;
    const fp = outcomes.filter(item => item.result === 'FP').length;
    const fn = targets.length - matched.size;
    const precision = tp + fp ? tp / (tp + fp) : 0;
    const recall = tp + fn ? tp / (tp + fn) : 0;
    const f1 = precision + recall ? 2 * precision * recall / (precision + recall) : 0;
    return { outcomes, tp, fp, fn, precision, recall, f1 };
  }

  function labelWidth(text) {
    const textWidth = [...text].reduce((width, character) => width + (/[\u3400-\u9fff]/.test(character) ? 10 : 5.5), 0);
    return Math.min(156, Math.max(70, textWidth + 12));
  }

  function drawBox(box, label, className, flipped = false) {
    const [x1, y1, x2, y2] = flipped ? flippedBox(box) : box;
    const width = labelWidth(label);
    const labelX = clamp(x1, 1, sceneWidth - width - 1);
    const labelY = Math.max(1, y1 - 19);
    return '<g class="pipeline-box ' + className + '"><rect class="pipeline-box-outline" x="' + x1 + '" y="' + y1 + '" width="' + (x2 - x1) + '" height="' + (y2 - y1) + '"></rect><rect class="pipeline-box-label-bg" x="' + labelX + '" y="' + labelY + '" width="' + width + '" height="17" rx="2"></rect><text x="' + (labelX + 5) + '" y="' + (labelY + 12) + '">' + esc(label) + '</text></g>';
  }

  function sceneArtwork() {
    return '<rect class="pipeline-sky" width="480" height="300"></rect>'
      + '<path class="pipeline-hill" d="M0 190L64 138L112 174L180 113L264 181L328 126L406 175L480 130V300H0Z"></path>'
      + '<path class="pipeline-road" d="M0 263L480 225V300H0Z"></path>'
      + '<path class="pipeline-building" d="M260 112H310V226H260Z M270 94H301V112H270Z"></path>'
      + '<circle class="pipeline-person-head" cx="116" cy="68" r="13"></circle>'
      + '<path class="pipeline-person" d="M116 82V164M116 103L94 137M116 104L139 133M116 164L99 232M116 164L140 232"></path>'
      + '<circle class="pipeline-wheel" cx="156" cy="222" r="25"></circle><circle class="pipeline-wheel" cx="215" cy="222" r="25"></circle>'
      + '<path class="pipeline-bike" d="M156 222L177 190L194 222L156 222L180 222L215 222L194 222L206 188M168 190H185M202 187H215"></path>'
      + '<circle class="pipeline-small-head" cx="357" cy="119" r="7"></circle>'
      + '<path class="pipeline-small-person" d="M357 127V166M357 139L346 154M357 139L368 151M357 166L348 188M357 166L367 188"></path>'
      + '<path class="pipeline-sign" d="M281 148V196M272 148H291M276 140H286"></path>';
  }

  function sceneSvg(mode) {
    const showTruth = mode === 'truth' || mode === 'training' || mode === 'evaluation';
    let boxes = '';
    if (showTruth) {
      targets.forEach(target => {
        const selected = mode === 'truth' && target.id === state.target;
        boxes += drawBox(target.box, 'GT · ' + target.label, selected ? 'pipeline-truth is-selected' : 'pipeline-truth', state.step === 2 && state.flipped);
      });
    }
    if (mode === 'nms') {
      const result = nmsResults();
      result.ordered.forEach(item => {
        const score = round(item.score);
        boxes += drawBox(item.box, item.id + ' · ' + item.label + ' ' + score + ' · ' + item.status, 'pipeline-prediction is-' + item.status);
      });
    }
    if (mode === 'evaluation') {
      const result = evaluationResults();
      result.outcomes.forEach(({ item, result: outcome }) => {
        boxes += drawBox(item.box, item.id + ' · ' + outcome + ' ' + item.label, 'pipeline-prediction is-' + outcome.toLowerCase());
      });
    }
    const flipScene = state.step === 2 && state.flipped;
    const note = mode === 'nms'
      ? '<p class="pipeline-scene-note">虚线框被 NMS 抑制；淡色框被置信度阈值滤掉。绿色框保留。</p>'
      : mode === 'evaluation'
        ? '<p class="pipeline-scene-note">绿色预测为 TP，玫瑰色预测为 FP；虚线框是全部真实标注。</p>'
        : '<p class="pipeline-scene-note">虚线绿色：真实标注框。点按阶段按钮，观察同一场景如何经过各个步骤。</p>';
    return '<div class="pipeline-scene-wrap"><svg class="pipeline-scene" viewBox="0 0 480 300" role="img" aria-label="合成教学场景，包含近处行人、自行车和远处行人">'
      + '<defs><pattern id="pipeline-scene-grid" width="24" height="24" patternUnits="userSpaceOnUse"><path d="M24 0H0V24" class="pipeline-grid-line"></path></pattern></defs>'
      + '<rect width="480" height="300" fill="url(#pipeline-scene-grid)"></rect>'
      + '<g class="' + (flipScene ? 'pipeline-art-flipped' : '') + '">' + sceneArtwork() + '</g>' + boxes
      + '</svg>' + note + '</div>';
  }

  function renderTruthList() {
    return '<div class="pipeline-label-table"><strong>当前场景的 YOLO 标签（class · x中心 · y中心 · 宽 · 高）</strong>'
      + targets.map(target => '<code>' + esc(target.label) + '：' + esc(yoloLabel(target, false)) + '</code>').join('')
      + '</div>';
  }

  function renderResolution() {
    const side = state.inputSize;
    const contentHeight = Math.round(side * sceneHeight / sceneWidth);
    const pad = (side - contentHeight) / 2;
    const target = targetById(state.target);
    const boxWidth = (target.box[2] - target.box[0]) * side / sceneWidth;
    const boxHeight = (target.box[3] - target.box[1]) * side / sceneWidth;
    const label = normalizedBox(target.box).map(value => round(value, 4)).join(' ');
    return '<div class="pipeline-readout-grid"><div><span>模型画布</span><strong>' + side + ' × ' + side + '</strong></div>'
      + '<div><span>等比例图像</span><strong>' + side + ' × ' + contentHeight + '</strong></div>'
      + '<div><span>上下 letterbox</span><strong>各 ' + round(pad) + ' px</strong></div>'
      + '<div><span>' + esc(target.label) + ' 的框尺寸</span><strong>' + round(boxWidth) + ' × ' + round(boxHeight) + ' px</strong></div></div>'
      + '<div class="pipeline-formula"><span>同一标注转为归一化 xywh：</span><code>' + esc(target.classId + ' ' + label) + '</code></div>'
      + '<p class="pipeline-note">尺寸改变时，像素坐标会跟着缩放；经过等比例 letterbox 后，归一化位置保持一致。若有裁剪、填充或翻转，必须同步更新标签。</p>';
  }

  function ratioFor(width, height, anchor) {
    return Math.max(width / anchor[0], anchor[0] / width, height / anchor[1], anchor[1] / height);
  }

  function renderAnchorTable() {
    const target = targetById(state.target);
    const scale = state.inputSize / sceneWidth;
    const width = (target.box[2] - target.box[0]) * scale;
    const height = (target.box[3] - target.box[1]) * scale;
    const groupsMarkup = anchorGroups.map(group => {
      const cellWidth = width / group.stride;
      const cellHeight = height / group.stride;
      const cellCount = Math.ceil(state.inputSize / group.stride);
      const rows = group.anchors.map(anchor => {
        const ratio = ratioFor(width, height, anchor);
        const matched = ratio < 4;
        return '<tr class="' + (matched ? 'is-match' : '') + '"><td>' + anchor[0] + ' × ' + anchor[1] + '</td><td>' + round(ratio) + '</td><td>' + (matched ? '通过 R &lt; 4' : '未通过') + '</td></tr>';
      }).join('');
      return '<section class="pipeline-scale-card"><header><strong>' + group.name + '</strong><span>步长 ' + group.stride + ' · 网格 ' + cellCount + ' × ' + cellCount + '</span></header>'
        + '<p>目标约占 ' + round(cellWidth, 1) + ' × ' + round(cellHeight, 1) + ' 格</p>'
        + '<div class="pipeline-mini-grid" style="--pipeline-grid-cell:' + (100 / clamp(Math.round(6 / group.stride * 8), 2, 6)).toFixed(2) + '%"><i></i></div>'
        + '<div class="pipeline-table-scroll"><table><thead><tr><th>Anchor (px)</th><th>max-ratio</th><th>匹配</th></tr></thead><tbody>' + rows + '</tbody></table></div></section>';
    }).join('');
    return '<div class="pipeline-anchor-summary"><p>输入 ' + state.inputSize + ' 方图时，' + esc(target.label) + ' 约为 ' + round(width) + ' × ' + round(height) + ' px。高亮行满足 YOLOv5 教学阈值 <code>max(w/aₙ, aₙ/w, h/aₕ, aₕ/h) &lt; 4</code>。</p><div class="pipeline-scale-grid">' + groupsMarkup + '</div><p class="pipeline-note">这是读取本地 YOLOv5 v6.0 yolov5s.yaml 三组 Anchor 的演示。实际配置、anchor_t 与相邻网格正样本分配会影响匹配结果；一行通过不代表只有一个正样本。</p></div>';
  }

  function renderFailure() {
    const item = failures[state.failure];
    const weighted = '示意总损失 = 1.0×' + round(item.box) + '（box） + 1.0×' + round(item.obj) + '（obj） + 1.0×' + round(item.cls) + '（cls） = ' + round(item.box + item.obj + item.cls);
    return '<div class="pipeline-loss-readouts"><div><span>box</span><strong>' + round(item.box) + '</strong></div><div><span>objectness</span><strong>' + round(item.obj) + '</strong></div><div><span>classification</span><strong>' + round(item.cls) + '</strong></div></div>'
      + '<p class="pipeline-formula"><code>' + weighted + '</code></p>'
      + '<p class="pipeline-note">' + esc(item.text) + ' 数值仅为固定教学示意，不是模型训练日志。</p>';
  }

  function renderNmsSteps() {
    const result = nmsResults();
    return '<ol class="pipeline-processing-list">' + result.ordered.map(item => {
      const suffix = item.status === 'kept' ? '保留，进入下一步' : item.status === 'suppressed' ? item.reason : item.reason;
      return '<li class="is-' + item.status + '"><span class="pipeline-candidate-id">' + item.id + '</span><span><strong>' + esc(item.label) + '</strong><small>objectness ' + round(item.objectness) + ' × class ' + round(item.classConfidence) + ' = <b>' + round(item.score, 3) + '</b></small></span><em>' + esc(suffix) + '</em></li>';
    }).join('') + '</ol><p class="pipeline-note">置信度用 objectness × 类别分数；NMS 按分数由高到低处理。当前示意为' + (state.classAware ? '按类别分别' : '不区分类别') + '抑制，预测框 IoU 严格超过阈值时才会被压掉。</p>';
  }

  function renderEvaluation() {
    const result = evaluationResults();
    const details = result.outcomes.map(({ item, result: outcome, detail }) =>
      '<li><strong>' + item.id + ' · ' + outcome + '</strong><span>' + esc(detail) + '</span></li>').join('');
    return '<div class="pipeline-metric-grid"><div><span>TP</span><strong>' + result.tp + '</strong></div><div><span>FP</span><strong>' + result.fp + '</strong></div><div><span>FN</span><strong>' + result.fn + '</strong></div>'
      + '<div><span>Precision</span><strong>' + round(result.precision * 100) + '%</strong></div><div><span>Recall</span><strong>' + round(result.recall * 100) + '%</strong></div><div><span>F1</span><strong>' + round(result.f1 * 100) + '%</strong></div></div>'
      + '<ol class="pipeline-match-list">' + details + '</ol>'
      + '<p class="pipeline-note">按类别相同、IoU 严格超过阈值、且每个真实目标只匹配一次进行单图示范。单张图可算 P/R/F1 工作点；AP 和 mAP 需要在数据集上扫过置信度并汇总 PR 曲线。</p>';
  }

  function controlsMarkup() {
    if (state.step === 0) {
      return '<h3>先决定怎样划分数据</h3><p>样例包含同一段视频的相邻帧。验证集要模拟将来遇到的新来源。</p><div class="pipeline-choice-row"><button type="button" data-case-split="group">按视频 / 场景分组</button><button type="button" data-case-split="random">随机拆图片</button></div><div class="pipeline-live-card" data-case-live></div>' + renderTruthList();
    }
    if (state.step === 1) {
      return '<h3>调整模型输入尺寸</h3><label class="pipeline-range-label" for="pipeline-input-size">输入边长 <output data-case-output="inputSize">' + state.inputSize + '</output></label><input id="pipeline-input-size" data-case-input-size type="range" min="320" max="960" step="160" value="' + state.inputSize + '"><div data-case-resolution>' + renderResolution() + '</div>';
    }
    if (state.step === 2) {
      return '<h3>同步翻转图像与边界框</h3><button type="button" class="pipeline-toggle" data-case-flip aria-pressed="false">试一下水平翻转</button><div class="pipeline-live-card" data-case-live></div><div class="pipeline-formula"><span>远处行人 YOLO 标签：</span><code data-case-flip-label></code></div><p class="pipeline-note">水平翻转：x_center′ = 1 − x_center；y、宽、高不变。标签 id 也跟着目标移动，不会换类别。</p>';
    }
    if (state.step === 3) {
      return '<h3>选一个目标，看三种检测尺度</h3><div class="pipeline-choice-row">' + targets.map(target => '<button type="button" data-case-target="' + target.id + '">' + esc(target.label) + '</button>').join('') + '</div><div data-case-anchor-table>' + renderAnchorTable() + '</div>';
    }
    if (state.step === 4) {
      return '<h3>选择训练时出现的问题</h3><div class="pipeline-choice-stack">' + Object.entries(failures).map(([key, item]) => '<button type="button" data-case-failure="' + key + '">' + esc(item.name) + '</button>').join('') + '</div><div data-case-failure-readout>' + renderFailure() + '</div>';
    }
    if (state.step === 5) {
      return '<h3>调节推理筛选</h3><label class="pipeline-range-label" for="pipeline-confidence">置信度阈值 <output data-case-output="confidence">' + round(state.confidence) + '</output></label><input id="pipeline-confidence" data-case-confidence type="range" min="0.20" max="0.90" step="0.05" value="' + state.confidence + '">'
        + '<label class="pipeline-range-label" for="pipeline-nms-iou">NMS IoU 阈值 <output data-case-output="nmsIou">' + round(state.nmsIou) + '</output></label><input id="pipeline-nms-iou" data-case-nms-iou type="range" min="0.10" max="0.90" step="0.05" value="' + state.nmsIou + '">'
        + '<button type="button" class="pipeline-toggle" data-case-class-mode aria-pressed="true">按类别分别做 NMS</button><div data-case-nms-readout>' + renderNmsSteps() + '</div>';
    }
    return '<h3>真实框与预测框怎样匹配</h3><label class="pipeline-range-label" for="pipeline-match-iou">评估 IoU 阈值 <output data-case-output="matchIou">' + round(state.matchIou) + '</output></label><input id="pipeline-match-iou" data-case-match-iou type="range" min="0.30" max="0.90" step="0.05" value="' + state.matchIou + '"><div data-case-evaluation-readout>' + renderEvaluation() + '</div>';
  }

  function stageDescription(step) {
    const descriptions = [
      '这一张合成图有近处行人、自行车和远处行人。标注必须覆盖可见目标、类别顺序一致；若来源是视频，应按完整视频分组，防止相似帧泄漏到验证集。',
      'YOLOv5 用 letterbox 把图像等比例缩放到模型画布，再补边到合适尺寸。框位置要随缩放与 padding 转换；转换后再归一化成 class、中心点和宽高。',
      '几何增强会改变目标位置。翻转图像时必须同步翻转框中心；颜色变化不改变框。验证集保持固定，才能比较增强策略是否有效。',
      'P3、P4、P5 的步长分别为 8、16、32。Anchor 提供宽高参考；YOLOv5 按宽高比例筛选匹配项，同一个目标可能匹配多个尺度或邻近网格。',
      '错误类型对应不同训练信号：未匹配背景主要影响 objectness；定位偏差由 box 回归处理；匹配正样本的类别由 classification 监督。',
      '模型先产生候选框与分数，再按 confidence 阈值筛选，并用 NMS 去掉高度重叠的重复预测。阈值会改变误检和漏检的平衡。',
      '先将每个保留预测和未匹配的同类真实框比较 IoU，得到 TP、FP、FN，再计算单图 Precision、Recall 与 F1。AP / mAP 要汇总整套数据。',
    ];
    return descriptions[step];
  }

  function stageScene(step) {
    if (step === 5) return 'nms';
    if (step === 6) return 'evaluation';
    return 'truth';
  }

  function updateControls(root) {
    root.querySelectorAll('[data-case-split]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.caseSplit === state.split)));
    root.querySelectorAll('[data-case-target]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.caseTarget === state.target)));
    root.querySelectorAll('[data-case-failure]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.caseFailure === state.failure)));
    const flipButton = root.querySelector('[data-case-flip]');
    if (flipButton) {
      flipButton.setAttribute('aria-pressed', String(state.flipped));
      flipButton.textContent = state.flipped ? '水平翻转已开启 · 再点还原' : '试一下水平翻转';
      const label = root.querySelector('[data-case-flip-label]');
      if (label) label.textContent = yoloLabel(targetById('small-person'), state.flipped);
    }
    const classButton = root.querySelector('[data-case-class-mode]');
    if (classButton) {
      classButton.setAttribute('aria-pressed', String(state.classAware));
      classButton.textContent = state.classAware ? '按类别分别做 NMS' : '不区分类别做 NMS';
    }
    const inputOutput = root.querySelector('[data-case-output="inputSize"]');
    if (inputOutput) inputOutput.textContent = String(state.inputSize);
    const resolution = root.querySelector('[data-case-resolution]');
    if (resolution) resolution.innerHTML = renderResolution();
    const confidenceOutput = root.querySelector('[data-case-output="confidence"]');
    if (confidenceOutput) confidenceOutput.textContent = round(state.confidence);
    const nmsOutput = root.querySelector('[data-case-output="nmsIou"]');
    if (nmsOutput) nmsOutput.textContent = round(state.nmsIou);
    const matchOutput = root.querySelector('[data-case-output="matchIou"]');
    if (matchOutput) matchOutput.textContent = round(state.matchIou);
    const anchorTable = root.querySelector('[data-case-anchor-table]');
    if (anchorTable) anchorTable.innerHTML = renderAnchorTable();
    const failureReadout = root.querySelector('[data-case-failure-readout]');
    if (failureReadout) failureReadout.innerHTML = renderFailure();
    const nmsReadout = root.querySelector('[data-case-nms-readout]');
    if (nmsReadout) nmsReadout.innerHTML = renderNmsSteps();
    const evaluationReadout = root.querySelector('[data-case-evaluation-readout]');
    if (evaluationReadout) evaluationReadout.innerHTML = renderEvaluation();
  }

  function update(root, rebuildControls = false) {
    if (!root) return;
    root.dataset.caseCurrentStep = String(state.step);
    root.querySelector('[data-case-kicker]').textContent = steps[state.step].kicker;
    root.querySelector('[data-case-title]').textContent = steps[state.step].title;
    root.querySelector('[data-case-description]').textContent = stageDescription(state.step);
    root.querySelector('[data-case-current-position]').textContent = '第 ' + (state.step + 1) + ' / ' + steps.length + ' 步';
    root.querySelector('[data-case-current-title]').textContent = steps[state.step].title;
    root.querySelector('[data-case-progress-fill]').style.width = ((state.step + 1) / steps.length * 100) + '%';
    root.querySelector('[data-case-lesson]').setAttribute('href', steps[state.step].lesson);
    root.querySelector('[data-case-lesson]').textContent = state.step === 5
      ? '继续学习：置信度、NMS 与评估指标 →'
      : state.step === 6 ? '打开 PR、F1、AP 与 mAP 实验 →' : '回到相关课程：继续学这一环 →';
    root.querySelectorAll('[data-case-step]').forEach(button => {
      const selected = Number(button.dataset.caseStep) === state.step;
      button.classList.toggle('is-current', selected);
      button.setAttribute('aria-current', selected ? 'step' : 'false');
    });
    const mode = stageScene(state.step);
    root.querySelector('[data-case-scene]').innerHTML = sceneSvg(mode);
    if (rebuildControls) root.querySelector('[data-case-controls]').innerHTML = controlsMarkup();
    updateControls(root);
    root.querySelector('[data-case-position]').textContent = '第 ' + (state.step + 1) + ' / ' + steps.length + ' 步';
    root.querySelector('[data-case-previous]').disabled = state.step === 0;
    root.querySelector('[data-case-next]').disabled = state.step === steps.length - 1;
    const live = root.querySelector('[data-case-live]');
    if (live) {
      live.className = 'pipeline-live-card' + (state.split === 'random' && state.step === 0 ? ' is-warning' : '');
      live.textContent = state.step === 0
        ? state.split === 'group'
          ? '正确做法：先按视频 / 场景分组，再把组分到 train 与 val；相邻帧不会跨集合。'
          : '注意：随机拆相邻帧容易让几乎相同的画面同时出现在 train 和 val，验证分数会偏乐观。'
        : state.step === 1 ? renderResolution().replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
          : state.step === 5 ? '当前 NMS 保留 ' + nmsResults().retained.length + ' 个候选；下方逐个列出筛选原因。'
            : state.step === 6 ? '当前单图：TP ' + evaluationResults().tp + '，FP ' + evaluationResults().fp + '，FN ' + evaluationResults().fn + '。'
              : '';
    }
  }

  function render() {
    return '<section class="experiment-panel detection-pipeline" id="lab-panel-pipeline" aria-labelledby="lab-tab-pipeline" data-lab-panel="pipeline" data-detection-pipeline hidden>'
      + '<div class="pipeline-heading"><div><span class="chapter-kicker">ONE SCENE · SEVEN STEPS</span><h2>从一张图，走完一次目标检测</h2><p>同一组真实框与候选框，依次经过数据、训练、推理和评估。这里是可重复的合成教学数据，不是实际模型输出。</p></div><span class="pipeline-badge">教学样例</span></div>'
      + '<div class="pipeline-progress-summary"><span>当前步骤</span><output data-case-current-position aria-live="polite"></output><strong data-case-current-title></strong><div class="pipeline-progress-track" aria-hidden="true"><i data-case-progress-fill></i></div></div>'
      + '<ol class="pipeline-stepper" aria-label="目标检测流程步骤">' + steps.map((step, index) => '<li><button type="button" data-case-step="' + index + '" aria-controls="pipeline-stage-content" aria-label="第 ' + (index + 1) + ' 步：' + step.title + '" aria-current="' + (index === state.step ? 'step' : 'false') + '"><span>' + String(index + 1).padStart(2, '0') + '</span><strong>' + step.title + '</strong></button></li>').join('') + '</ol>'
      + '<section class="pipeline-stage" id="pipeline-stage-content"><div class="pipeline-stage-intro"><span data-case-kicker></span><h3 data-case-title></h3><p data-case-description aria-live="polite"></p></div>'
      + '<div class="pipeline-layout"><figure class="pipeline-visual-card"><div data-case-scene></div><figcaption>绿色虚线表示真实标注；预测框颜色表示置信度筛选、NMS 或最终匹配结果。</figcaption></figure><aside class="pipeline-controls-card"><div data-case-controls></div><a class="lab-lesson-link" data-case-lesson href="#lesson/data-quality">回到相关课程：继续学这一环 →</a></aside></div>'
      + '<div class="pipeline-navigation"><button type="button" class="secondary" data-case-previous>← 上一步</button><output data-case-position aria-live="polite"></output><button type="button" class="secondary" data-case-next>下一步 →</button><button type="button" class="pipeline-reset" data-case-reset>重置样例</button></div>'
      + '<p class="pipeline-source-note">本实验教学用的 Anchor 取自 <a href="https://github.com/ultralytics/yolov5/blob/v6.0/models/yolov5s.yaml" target="_blank" rel="noopener noreferrer">YOLOv5 v6.0 yolov5s.yaml</a>；样例物体分数与损失值为合成数字。实际项目应以所用仓库版本、配置和验证结果为准。</p></section></section>';
  }

  function initialize() {
    const root = document.querySelector('[data-detection-pipeline]');
    if (root) update(root, true);
  }

  function setSplit(value) {
    if (value !== 'group' && value !== 'random') return;
    state.step = 0;
    state.split = value;
    state.flipped = false;
    update(document.querySelector('[data-detection-pipeline]'), true);
  }

  document.addEventListener('click', event => {
    const root = event.target.closest('[data-detection-pipeline]');
    if (!root) return;
    const step = event.target.closest('[data-case-step]');
    if (step) {
      state.step = clamp(Number(step.dataset.caseStep) || 0, 0, steps.length - 1);
      if (state.step !== 2) state.flipped = false;
      update(root, true);
      return;
    }
    if (event.target.closest('[data-case-previous]')) {
      state.step = Math.max(0, state.step - 1);
      if (state.step !== 2) state.flipped = false;
      update(root, true);
      return;
    }
    if (event.target.closest('[data-case-next]')) {
      state.step = Math.min(steps.length - 1, state.step + 1);
      if (state.step !== 2) state.flipped = false;
      update(root, true);
      return;
    }
    if (event.target.closest('[data-case-reset]')) {
      Object.assign(state, { step: 0, split: 'group', inputSize: 640, flipped: false, target: 'small-person', failure: 'localization', confidence: 0.30, nmsIou: 0.50, classAware: true, matchIou: 0.50 });
      update(root, true);
      return;
    }
    const split = event.target.closest('[data-case-split]');
    if (split) { state.split = split.dataset.caseSplit; update(root, false); return; }
    const target = event.target.closest('[data-case-target]');
    if (target) { state.target = target.dataset.caseTarget; update(root, false); return; }
    const failure = event.target.closest('[data-case-failure]');
    if (failure) { state.failure = failure.dataset.caseFailure; update(root, false); return; }
    if (event.target.closest('[data-case-flip]')) { state.flipped = !state.flipped; update(root, false); return; }
    if (event.target.closest('[data-case-class-mode]')) { state.classAware = !state.classAware; update(root, false); }
  });

  document.addEventListener('input', event => {
    const root = event.target.closest('[data-detection-pipeline]');
    if (!root) return;
    if (event.target.matches('[data-case-input-size]')) state.inputSize = Number(event.target.value);
    if (event.target.matches('[data-case-confidence]')) state.confidence = Number(event.target.value);
    if (event.target.matches('[data-case-nms-iou]')) state.nmsIou = Number(event.target.value);
    if (event.target.matches('[data-case-match-iou]')) state.matchIou = Number(event.target.value);
    update(root, false);
  });

  document.addEventListener('keydown', event => {
    if (!event.target.matches('[data-case-step]')) return;
    let next = null;
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = Math.min(steps.length - 1, state.step + 1);
    if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = Math.max(0, state.step - 1);
    if (next === null) return;
    event.preventDefault();
    state.step = next;
    if (state.step !== 2) state.flipped = false;
    const root = event.target.closest('[data-detection-pipeline]');
    update(root, true);
    root.querySelector('[data-case-step="' + next + '"]').focus();
  });

  window.detectionPipeline = { render, initialize, setSplit };
})();
