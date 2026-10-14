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
  const metricGroundTruths = { pedestrian: 60, vehicle: 44, bicycle: 32 };
  const metricClassLabels = { pedestrian: '行人', vehicle: '车辆', bicycle: '自行车' };
  const yoloV5IouThresholds = Array.from({ length: 10 }, (_, index) => Number((0.5 + index * 0.05).toFixed(2)));
  function createTeachingPredictions() {
    const predictions = [];
    Object.entries(metricGroundTruths).forEach(([className, count], classIndex) => {
      for (let index = 0; index < count; index++) {
        if ((index + classIndex) % 10 === 0) continue;
        const quality = ((index * 37 + classIndex * 23) % 101) / 100;
        const targetId = className + '-' + index;
        const score = Number((0.18 + quality * 0.78).toFixed(4));
        const iou = Number((0.34 + quality * 0.65).toFixed(4));
        predictions.push({ className, score, targetId, iou });
        if (index % 4 === 0) {
          predictions.push({ className, score: Number((score * 0.72).toFixed(4)), targetId, iou: Number((iou * 0.78).toFixed(4)) });
        }
      }
      for (let index = 0; index < 40; index++) {
        const quality = ((index * 29 + classIndex * 17) % 97) / 97;
        predictions.push({
          className,
          score: Number((0.12 + quality * 0.82).toFixed(4)),
          targetId: null,
          iou: 0,
        });
      }
    });
    return predictions.sort((a, b) => b.score - a.score);
  }
  const metricPredictions = createTeachingPredictions();
  const tabIds = ['iou', 'gradient', 'convolution', 'nms', 'metrics'];
  let activeTab = 'iou';
  let convolutionFocus = { row: 1, column: 1 };
  let importedYoloV5Evaluation = null;

  const byId = id => document.getElementById(id);
  const number = (value, fallback) => Number.isFinite(Number(value)) ? Number(value) : fallback;
  const format = value => Number(value).toFixed(2).replace(/\.00$/, '');
  const escapeHtml = value => String(value).replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);

  function normalizeYoloV5Evaluation(data) {
    if (!data || data.format !== 'visionlab-yolov5-eval-v1') throw new Error('文件格式不匹配，请使用 VisionLab 的 YOLOv5 导出 JSON。');
    if (!Array.isArray(data.iouThresholds) || data.iouThresholds.length !== yoloV5IouThresholds.length
      || data.iouThresholds.some((value, index) => Math.abs(Number(value) - yoloV5IouThresholds[index]) > 1e-6)) {
      throw new Error('IoU 阈值必须为 YOLOv5 使用的 0.50 至 0.95（步长 0.05）。');
    }
    if (!Array.isArray(data.classes) || data.classes.length < 1 || data.classes.length > 1000) throw new Error('文件中没有有效的类别与标注数量。');
    const classIds = new Set();
    const classes = data.classes.map(item => {
      const id = Number(item?.id);
      const groundTruthCount = Number(item?.groundTruthCount);
      const name = String(item?.name ?? '').trim();
      if (!Number.isInteger(id) || id < 0 || classIds.has(id) || !Number.isInteger(groundTruthCount) || groundTruthCount < 1 || !name || name.length > 100) {
        throw new Error('类别编号、类别名称或标注数量无效。');
      }
      classIds.add(id);
      return { id, name, groundTruthCount };
    });
    if (!Array.isArray(data.predictions) || data.predictions.length > 500000) throw new Error('预测框数据缺失或超过 50 万条，请使用单次验证生成的文件。');
    const predictions = data.predictions.map((item, index) => {
      const classId = Number(item?.classId);
      const confidence = Number(item?.confidence);
      if (!Number.isInteger(classId) || classId < 0 || !Number.isFinite(confidence) || confidence < 0 || confidence > 1) {
        throw new Error('第 ' + (index + 1) + ' 个预测框的类别或 confidence 无效。');
      }
      if (!Array.isArray(item.correct) || item.correct.length !== yoloV5IouThresholds.length || item.correct.some(value => typeof value !== 'boolean')) {
        throw new Error('第 ' + (index + 1) + ' 个预测框缺少 10 个 IoU 阈值下的匹配结果。');
      }
      return { classId, confidence, correct: item.correct.slice() };
    });
    const source = data.source && typeof data.source === 'object' ? data.source : {};
    const shortText = value => String(value ?? '').trim().slice(0, 120);
    const yoloV5Metrics = Array.isArray(data.yoloV5Metrics) ? data.yoloV5Metrics.map(item => {
      const id = Number(item?.classId);
      const ap50 = Number(item?.ap50);
      const ap5095 = Number(item?.ap50_95);
      if (!Number.isInteger(id) || !classIds.has(id) || !Number.isFinite(ap50) || ap50 < 0 || ap50 > 1 || !Number.isFinite(ap5095) || ap5095 < 0 || ap5095 > 1) {
        throw new Error('YOLOv5 自带的 AP 校验摘要无效。');
      }
      return { classId: id, ap50, ap5095 };
    }) : [];
    return {
      source: {
        model: shortText(source.model) || 'YOLOv5 模型',
        dataset: shortText(source.dataset) || '验证集',
        split: shortText(source.split) || 'val',
        imageSize: number(source.imageSize, 640),
        nmsIou: number(source.nmsIou, 0.6),
        generatedAt: shortText(source.generatedAt),
      },
      classes,
      predictions,
      yoloV5Metrics,
    };
  }

  function interpolateYoloCurve(x, xValues, yValues, leftValue) {
    if (!xValues.length) return 0;
    let low = 0;
    let high = xValues.length;
    while (low < high) {
      const middle = (low + high) >> 1;
      if (xValues[middle] <= x) low = middle + 1;
      else high = middle;
    }
    const lower = low - 1;
    if (lower < 0) return leftValue;
    if (xValues[lower] === x || low >= xValues.length) return yValues[lower];
    const span = xValues[low] - xValues[lower];
    if (!span) return yValues[lower];
    const ratio = (x - xValues[lower]) / span;
    return yValues[lower] + ratio * (yValues[low] - yValues[lower]);
  }

  function yoloAveragePrecision(recall, precision) {
    if (!recall.length) return { ap: 0, mrec: [0, 1], mpre: [0, 0] };
    const mrec = [0, ...recall, 1];
    const mpre = [1, ...precision, 0];
    for (let index = mpre.length - 2; index >= 0; index--) mpre[index] = Math.max(mpre[index], mpre[index + 1]);
    let area = 0;
    let previous = interpolateYoloCurve(0, mrec, mpre, 1);
    for (let sample = 1; sample <= 100; sample++) {
      const current = interpolateYoloCurve(sample / 100, mrec, mpre, 1);
      area += (previous + current) * 0.005;
      previous = current;
    }
    return { ap: area, mrec, mpre };
  }

  function smoothYoloCurve(values) {
    const width = Math.round(values.length * 0.1 * 2) / 2 + 1;
    const padding = Math.floor(width / 2);
    return values.map((_, index) => {
      let sum = 0;
      for (let offset = -padding; offset <= padding; offset++) sum += values[Math.min(values.length - 1, Math.max(0, index + offset))];
      return sum / width;
    });
  }

  function analyzeYoloV5Evaluation(data) {
    const confidenceSamples = Array.from({ length: 1000 }, (_, index) => index / 999);
    const recallSamples = confidenceSamples;
    const classes = data.classes.map(classInfo => {
      const predictions = data.predictions.filter(item => item.classId === classInfo.id).slice().sort((a, b) => b.confidence - a.confidence);
      const iouResults = yoloV5IouThresholds.map((_, iouIndex) => {
        const cumulativeTruePositives = [];
        const cumulativeFalsePositives = [];
        const recallByPrediction = [];
        const precisionByPrediction = [];
        let tp = 0;
        for (const prediction of predictions) {
          if (prediction.correct[iouIndex]) tp++;
          cumulativeTruePositives.push(tp);
          cumulativeFalsePositives.push(cumulativeTruePositives.length - tp);
          recallByPrediction.push(tp / classInfo.groundTruthCount);
          precisionByPrediction.push(tp / cumulativeTruePositives.length);
        }
        const apResult = yoloAveragePrecision(recallByPrediction, precisionByPrediction);
        const confidenceX = predictions.map(item => -item.confidence);
        const precisionCurve = confidenceSamples.map(sample => predictions.length
          ? interpolateYoloCurve(-sample, confidenceX, precisionByPrediction, 1) : 0);
        const recallCurve = confidenceSamples.map(sample => predictions.length
          ? interpolateYoloCurve(-sample, confidenceX, recallByPrediction, 0) : 0);
        const f1Curve = precisionCurve.map((precision, index) => (
          precision + recallCurve[index] ? 2 * precision * recallCurve[index] / (precision + recallCurve[index]) : 0
        ));
        const prPrecision = recallSamples.map(sample => predictions.length
          ? interpolateYoloCurve(sample, apResult.mrec, apResult.mpre, 1) : 0);
        const prCurve = recallSamples.map((recall, index) => ({ recall, precision: prPrecision[index] }));
        return { ap: apResult.ap, precisionCurve, recallCurve, f1Curve, prCurve };
      });
      return { ...classInfo, predictions, iouResults };
    });
    return { confidenceSamples, recallSamples, classes };
  }

  function evaluateYoloV5Evaluation(data, options = {}) {
    const analysis = data.analysis || analyzeYoloV5Evaluation(data);
    const confidenceThreshold = Math.max(0, Math.min(1, number(options.confidenceThreshold, 0.5)));
    const iouThreshold = Math.max(0.5, Math.min(0.95, number(options.iouThreshold, 0.5)));
    const iouIndex = Math.max(0, Math.min(9, Math.round((iouThreshold - 0.5) / 0.05)));
    const className = options.className || 'all';
    const visibleClasses = className === 'all' ? analysis.classes : analysis.classes.filter(item => String(item.id) === String(className));
    const selectedClasses = visibleClasses.length ? visibleClasses : analysis.classes;
    const selectedClassIds = new Set(selectedClasses.map(item => item.id));
    const mean = values => values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;
    const classPoints = selectedClasses.map(classInfo => {
      const predictions = classInfo.predictions.filter(item => item.confidence >= confidenceThreshold);
      const classTp = predictions.reduce((sum, item) => sum + (item.correct[iouIndex] ? 1 : 0), 0);
      const classFp = predictions.length - classTp;
      const classFn = Math.max(0, classInfo.groundTruthCount - classTp);
      const precision = classTp + classFp ? classTp / (classTp + classFp) : 0;
      const recall = classInfo.groundTruthCount ? classTp / classInfo.groundTruthCount : 0;
      return { tp: classTp, fp: classFp, fn: classFn, precision, recall, f1: precision + recall ? 2 * precision * recall / (precision + recall) : 0 };
    });
    const totals = classPoints.reduce((sum, item) => ({ tp: sum.tp + item.tp, fp: sum.fp + item.fp, fn: sum.fn + item.fn }), { tp: 0, fp: 0, fn: 0 });
    const confidenceCurve = analysis.confidenceSamples.map((threshold, index) => ({
      threshold,
      precision: mean(selectedClasses.map(item => item.iouResults[iouIndex].precisionCurve[index])),
      recall: mean(selectedClasses.map(item => item.iouResults[iouIndex].recallCurve[index])),
      f1: mean(selectedClasses.map(item => item.iouResults[iouIndex].f1Curve[index])),
    }));
    const curve = confidenceCurve;
    const prCurve = analysis.recallSamples.map((recall, index) => ({
      recall,
      precision: mean(selectedClasses.map(item => item.iouResults[iouIndex].prCurve[index].precision)),
    }));
    const smoothF1 = smoothYoloCurve(confidenceCurve.map(item => item.f1));
    const bestIndex = smoothF1.reduce((best, value, index) => value >= smoothF1[best] ? index : best, 0);
    const ap50ByClass = Object.fromEntries(analysis.classes.map(item => [String(item.id), item.iouResults[0].ap]));
    const ap5095ByClass = Object.fromEntries(analysis.classes.map(item => [String(item.id), mean(item.iouResults.map(result => result.ap))]));
    return {
      operatingPoint: { ...totals, precision: mean(classPoints.map(item => item.precision)), recall: mean(classPoints.map(item => item.recall)), f1: mean(classPoints.map(item => item.f1)) },
      curve,
      prCurve,
      confidenceCurve,
      bestF1: { threshold: confidenceCurve[bestIndex]?.threshold || 0, f1: confidenceCurve[bestIndex]?.f1 || 0 },
      ap50ByClass,
      ap5095ByClass,
      mapAtIou: mean(analysis.classes.map(item => item.iouResults[iouIndex].ap)),
      map50: mean(analysis.classes.map(item => item.iouResults[0].ap)),
      map5095: mean(analysis.classes.map(item => mean(item.iouResults.map(result => result.ap)))),
    };
  }

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
    const sampleGroundTruthCount = Object.values(metricGroundTruths).reduce((sum, count) => sum + count, 0);
    return '<section class="experiment-panel" role="tabpanel" id="lab-panel-metrics" aria-labelledby="lab-tab-metrics" data-lab-panel="metrics" hidden>'
      + '<div class="metric-intro-card"><span class="chapter-kicker">PRECISION · RECALL · AVERAGE PRECISION</span><h2>用验证集数据读懂 PR、F1 与 mAP</h2><p id="metric-data-description">教学样例包含 ' + sampleGroundTruthCount + ' 个标注目标、' + metricPredictions.length + ' 个预测框和 3 个类别，供操作学习使用。要查看与你模型一致的曲线，请用下方导出工具在自己的 YOLOv5 验证集上生成数据并导入。</p>'
      + '<div class="metric-import-toolbar"><span id="metric-data-mode" class="metric-data-mode">教学样例</span><label class="metric-upload-button" for="metric-import-file">导入 YOLOv5 验证 JSON<input id="metric-import-file" type="file" accept=".json,application/json"></label><a class="secondary metric-export-link" href="visionlab-yolov5-export.py" download>下载 YOLOv5 导出脚本</a><button class="secondary metric-reset-button" type="button" data-metric-reset>恢复教学样例</button></div><p id="metric-data-status" class="metric-data-status" aria-live="polite">当前为可重复的教学样例，并非你的模型评估结果。</p>'
      + '<details class="metric-export-guide"><summary>怎样生成与你训练结果一致的真实曲线</summary><ol><li>下载导出脚本，放到 YOLOv5 仓库根目录。</li><li>在训练模型使用的 Python 环境中，对相同权重、验证集和输入尺寸重新运行验证：</li></ol><pre><code>python visionlab-yolov5-export.py --weights runs/train/exp/weights/best.pt --data data/Mydata.yaml --imgsz 640 --device 0 --output runs/val/visionlab-metrics.json</code></pre><p>脚本会调用 YOLOv5 验证流程，保存每个预测框的类别、置信度，以及它在 IoU=0.50 至 0.95 下是否匹配标注。网页只在本机浏览器读取这个 JSON，不会上传权重、图片或标注文件。请把示例中的权重、数据配置和尺寸换成你训练时实际使用的值。</p></details></div>'
      + '<div class="metric-workbench"><div class="metric-chart-stack"><article class="lab-visual-card metric-chart-card"><div class="lab-card-heading"><div><span class="chapter-kicker">PRECISION ↔ RECALL</span><h3>PR 曲线</h3></div><span class="lab-step-badge">阈值逐步变化</span></div><div id="metric-pr-chart" class="metric-chart" aria-live="polite"></div><p class="metric-chart-caption">真实数据按 YOLOv5 的匹配结果和 101 点插值绘制；教学样例则由浏览器本地计算。曲线越靠近右上角，通常表示找回更多目标时仍能保持较高准确率。</p></article>'
      + '<article class="lab-visual-card metric-chart-card"><div class="lab-card-heading"><div><span class="chapter-kicker">F1 ↔ CONFIDENCE</span><h3>F1 曲线</h3></div><span id="metric-best-f1" class="lab-step-badge"></span></div><div id="metric-f1-chart" class="metric-chart" aria-live="polite"></div><p class="metric-chart-caption">F1 是 Precision 与 Recall 的调和平均。它会显示两者折中较好的置信度范围；并列峰值时取较高阈值。</p></article></div>'
      + '<aside class="lab-control-card metric-control-card"><label for="metric-class">查看类别</label><select id="metric-class"><option value="all">全部类别 · 汇总</option><option value="pedestrian">行人</option><option value="vehicle">车辆</option><option value="bicycle">自行车</option></select>'
      + '<label for="metric-confidence">置信度阈值 <output id="metric-confidence-value">0.70</output></label><input id="metric-confidence" type="range" min="0" max="1" step="0.01" value="0.70">'
      + '<label for="metric-iou">匹配所需 IoU <output id="metric-iou-value">0.50</output></label><input id="metric-iou" type="range" min="0.50" max="0.95" step="0.05" value="0.50">'
      + '<p id="metric-point-summary" class="lab-callout metric-point-summary" aria-live="polite"></p><div class="metric-score-grid"><div><span>Precision</span><strong id="metric-precision"></strong></div><div><span>Recall</span><strong id="metric-recall"></strong></div><div><span>F1</span><strong id="metric-f1"></strong></div></div>'
      + '<div class="metric-formulas"><p><b>Precision</b> = TP ÷ (TP + FP)</p><p><b>Recall</b> = TP ÷ (TP + FN)</p><p><b>F1</b> = 2 × P × R ÷ (P + R)</p></div><p class="lab-small-note">TP：正确匹配的框；FP：重复、误检或 IoU 未达标的框；FN：没有被找回的标注目标。</p></aside></div>'
      + '<article class="lab-visual-card metric-map-card"><div class="lab-card-heading"><div><span class="chapter-kicker">AVERAGE PRECISION · MEAN AP</span><h3>从 PR 面积到 mAP</h3></div><div id="metric-map-summary" class="metric-map-summary" aria-live="polite"></div></div><div class="metric-ap-legend"><span><i class="ap50"></i>AP@0.50</span><span><i class="ap5095"></i>AP@0.50:0.95</span></div><div id="metric-map-breakdown" class="metric-map-breakdown"></div><p class="metric-chart-caption">AP 是某一类别 PR 曲线下的插值面积；mAP@0.50 先在 IoU=0.50 计算每类 AP，再对类别求平均。mAP@0.50:0.95 则把 IoU 从 0.50 到 0.95（步长 0.05）的 AP 一并平均，共 10 个阈值。导入数据严格使用 YOLOv5 的验证匹配结果；教学样例单独标记。</p></article>'
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
    const classOptions = importedYoloV5Evaluation
      ? importedYoloV5Evaluation.classes.map(item => ({ key: String(item.id), label: item.name }))
      : Object.keys(metricGroundTruths).map(name => ({ key: name, label: metricClassLabels[name] }));
    const previousClass = classInput.value || 'all';
    classInput.innerHTML = '<option value="all">全部类别 · 宏平均</option>' + classOptions.map(item => (
      '<option value="' + escapeHtml(item.key) + '">' + escapeHtml(item.label) + '</option>'
    )).join('');
    classInput.value = previousClass === 'all' || classOptions.some(item => item.key === previousClass) ? previousClass : 'all';
    const className = classInput.value || 'all';
    const confidence = number(confidenceInput.value, 0.7);
    const iouThreshold = number(iouInput.value, 0.5);
    const metrics = importedYoloV5Evaluation
      ? evaluateYoloV5Evaluation(importedYoloV5Evaluation, { confidenceThreshold: confidence, iouThreshold, className })
      : evaluateDetectionMetrics(metricPredictions, metricGroundTruths, { confidenceThreshold: confidence, iouThreshold, className });
    const point = metrics.operatingPoint;
    const percentage = value => (value * 100).toFixed(1) + '%';
    const classLabel = className === 'all' ? (importedYoloV5Evaluation ? '全部类别宏平均' : '全部类别汇总')
      : importedYoloV5Evaluation ? importedYoloV5Evaluation.classes.find(item => String(item.id) === className)?.name || className : metricClassLabels[className];
    const groundTruthCount = importedYoloV5Evaluation
      ? importedYoloV5Evaluation.classes.reduce((sum, item) => sum + item.groundTruthCount, 0)
      : Object.values(metricGroundTruths).reduce((sum, count) => sum + count, 0);
    const predictionsCount = importedYoloV5Evaluation ? importedYoloV5Evaluation.predictions.length : metricPredictions.length;
    const dataMode = byId('metric-data-mode');
    const dataStatus = byId('metric-data-status');
    const dataDescription = byId('metric-data-description');
    if (dataMode) dataMode.textContent = importedYoloV5Evaluation ? '真实 YOLOv5 验证结果' : '教学样例';
    if (dataStatus) dataStatus.textContent = importedYoloV5Evaluation
      ? importedYoloV5Evaluation.source.model + ' · ' + importedYoloV5Evaluation.source.dataset + ' · ' + importedYoloV5Evaluation.source.split + ' 集 · ' + importedYoloV5Evaluation.classes.length + ' 类 · ' + groundTruthCount + ' 个标注目标 · ' + predictionsCount + ' 个预测框 · 输入 ' + importedYoloV5Evaluation.source.imageSize + ' px · NMS IoU ' + importedYoloV5Evaluation.source.nmsIou.toFixed(2)
      : '当前为可重复的教学样例，并非你的模型评估结果；包含 ' + groundTruthCount + ' 个标注目标、' + predictionsCount + ' 个候选框、3 个类别。';
    if (dataStatus && importedYoloV5Evaluation?.yoloV5Metrics.length) {
      const expectedMap50 = importedYoloV5Evaluation.yoloV5Metrics.reduce((sum, item) => sum + item.ap50, 0) / importedYoloV5Evaluation.yoloV5Metrics.length;
      const expectedMap5095 = importedYoloV5Evaluation.yoloV5Metrics.reduce((sum, item) => sum + item.ap5095, 0) / importedYoloV5Evaluation.yoloV5Metrics.length;
      const parity = Math.max(Math.abs(expectedMap50 - metrics.map50), Math.abs(expectedMap5095 - metrics.map5095));
      dataStatus.textContent += parity < 1e-4 ? ' · 网页复算 mAP 与 YOLOv5 验证摘要一致' : ' · mAP 与 YOLOv5 摘要不一致，请核对验证参数';
    }
    if (dataDescription) dataDescription.textContent = importedYoloV5Evaluation
      ? '当前曲线由导入的 YOLOv5 验证预测与标注匹配结果计算，可按类别、置信度和 IoU 阈值查看。'
      : '教学样例包含 ' + groundTruthCount + ' 个标注目标、' + predictionsCount + ' 个预测框和 3 个类别，供操作学习使用。要查看与你模型一致的曲线，请用下方导出工具在自己的 YOLOv5 验证集上生成数据并导入。';
    byId('metric-confidence-value').textContent = confidence.toFixed(2);
    byId('metric-iou-value').textContent = iouThreshold.toFixed(2);
    byId('metric-point-summary').textContent = classLabel + (importedYoloV5Evaluation && className === 'all' ? ' · 指标按类别宏平均' : '') + ' · TP ' + point.tp + ' · FP ' + point.fp + ' · FN ' + point.fn;
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
    const prPoints = metrics.prCurve || metrics.curve;
    const prPath = prPoints.map((item, index) => {
      const x = left + item.recall * width;
      const y = top + (1 - item.precision) * height;
      return (index ? 'L' : 'M') + x.toFixed(1) + ' ' + y.toFixed(1);
    }).join(' ');
    const prX = left + point.recall * width;
    const prY = top + (1 - point.precision) * height;
    prChart.innerHTML = '<svg viewBox="0 0 500 260" role="img" aria-label="Precision Recall 曲线；当前 Precision ' + percentage(point.precision) + '，Recall ' + percentage(point.recall) + '"><path class="metric-axis-line" d="M' + left + ' ' + top + 'V' + (top + height) + 'H' + (left + width) + '"/>' + grid + '<path class="metric-pr-line" d="' + prPath + '"/><circle class="metric-selected-point" cx="' + prX.toFixed(1) + '" cy="' + prY.toFixed(1) + '" r="6"><title>当前置信度 ' + confidence.toFixed(2) + '：Precision ' + percentage(point.precision) + '，Recall ' + percentage(point.recall) + '</title></circle><text class="metric-axis-title" x="259" y="254" text-anchor="middle">Recall (%)</text><text class="metric-axis-title" x="13" y="116" transform="rotate(-90 13 116)" text-anchor="middle">Precision (%)</text></svg>';

    const f1Points = (metrics.confidenceCurve || metrics.curve).slice().sort((a, b) => a.threshold - b.threshold);
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

    const mapClasses = importedYoloV5Evaluation
      ? importedYoloV5Evaluation.classes.map(item => ({ key: String(item.id), label: item.name }))
      : Object.keys(metricGroundTruths).map(name => ({ key: name, label: metricClassLabels[name] }));
    mapBreakdown.innerHTML = mapClasses.map(item => {
      const ap50 = metrics.ap50ByClass[item.key];
      const ap5095 = metrics.ap5095ByClass[item.key];
      const label = escapeHtml(item.label);
      return '<div class="metric-ap-row" role="img" aria-label="' + label + '：AP@0.50 ' + percentage(ap50) + '，AP@0.50:0.95 ' + percentage(ap5095) + '"><strong>' + label + '</strong><div class="metric-ap-bars"><span class="metric-ap-bar ap50" style="--metric-bar-width:' + (ap50 * 100).toFixed(1) + '%"></span><span class="metric-ap-bar ap5095" style="--metric-bar-width:' + (ap5095 * 100).toFixed(1) + '%"></span></div><span class="metric-ap-values">' + percentage(ap50) + ' / ' + percentage(ap5095) + '</span></div>';
    }).join('');
  }

  function initializeInteractiveLab() {
    setActiveTab(activeTab);
    updateGradient();
    updateConvolution();
    updateNms();
    updateMetrics();
  }

  window.VisionLabMath = {
    gradientDescent, convolve, intersectionOverUnion, nonMaximumSuppression, evaluateDetectionMetrics,
    normalizeYoloV5Evaluation, evaluateYoloV5Evaluation,
    getTeachingSampleStats: () => ({
      groundTruths: Object.values(metricGroundTruths).reduce((sum, count) => sum + count, 0),
      predictions: metricPredictions.length,
      classes: Object.keys(metricGroundTruths).length,
    }),
  };
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
      return;
    }
    const resetMetrics = event.target.closest('[data-metric-reset]');
    if (resetMetrics) {
      importedYoloV5Evaluation = null;
      const fileInput = byId('metric-import-file');
      if (fileInput) fileInput.value = '';
      updateMetrics();
    }
  });

  document.addEventListener('input', event => {
    if (event.target.id === 'gradient-lr' || event.target.id === 'gradient-steps') updateGradient();
    if (event.target.id === 'conv-kernel') { convolutionFocus = { row: 1, column: 1 }; updateConvolution(); }
    if (event.target.id === 'nms-confidence' || event.target.id === 'nms-iou') updateNms();
    if (event.target.id === 'metric-class' || event.target.id === 'metric-confidence' || event.target.id === 'metric-iou') updateMetrics();
  });

  document.addEventListener('change', async event => {
    if (event.target.id === 'metric-class') { updateMetrics(); return; }
    if (event.target.id !== 'metric-import-file') return;
    const file = event.target.files?.[0];
    if (!file) return;
    const status = byId('metric-data-status');
    try {
      if (file.size > 30 * 1024 * 1024) throw new Error('文件超过 30 MB；请仅导出单次验证的预测数据。');
      const parsed = JSON.parse(await file.text());
      const normalized = normalizeYoloV5Evaluation(parsed);
      normalized.analysis = analyzeYoloV5Evaluation(normalized);
      importedYoloV5Evaluation = normalized;
      updateMetrics();
    } catch (error) {
      if (status) status.textContent = '没有导入文件：' + error.message;
    } finally {
      event.target.value = '';
    }
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
