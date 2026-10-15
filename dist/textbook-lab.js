/* Small, deterministic visual experiments for the existing textbook lab. */
(() => {
  const lessonMatrix = [
    [0, 0, 0, 0, 0],
    [0, 1, 1, 0, 0],
    [0, 1, 1, 0, 0],
    [0, 0, 0, 1, 1],
    [0, 0, 0, 1, 1],
  ];
  const convolutionInputs = {
    shape: { label: '方块边缘', values: lessonMatrix },
    vertical: { label: '竖直亮边', values: [[0, 0, 1, 1, 0], [0, 0, 1, 1, 0], [0, 0, 1, 1, 0], [0, 0, 1, 1, 0], [0, 0, 1, 1, 0]] },
    checker: { label: '棋盘图案', values: [[1, 0, 1, 0, 1], [0, 1, 0, 1, 0], [1, 0, 1, 0, 1], [0, 1, 0, 1, 0], [1, 0, 1, 0, 1]] },
  };
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
  const nmsGroundTruths = [
    { id: 'G1', box: [70, 78, 212, 220] },
    { id: 'G2', box: [292, 95, 410, 247] },
  ];
  const mapWalkthroughClasses = [
    { key: 'person', label: 'person · 行人', groundTruthCount: 2, predictions: [
      { score: 0.95, targetId: 'person-1', iou: 0.82 },
      { score: 0.83, targetId: 'person-1', iou: 0.75 },
      { score: 0.67, targetId: 'person-2', iou: 0.61 },
      { score: 0.42, targetId: null, iou: 0 },
    ] },
    { key: 'swimmer', label: 'swimmer · 游泳者', groundTruthCount: 1, predictions: [
      { score: 0.91, targetId: 'swimmer-1', iou: 0.77 },
      { score: 0.38, targetId: null, iou: 0 },
    ] },
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
  const tabIds = ['pipeline', 'iou', 'gradient', 'convolution', 'augmentation', 'diagnosis', 'nms', 'metrics'];
  let activeTab = 'pipeline';
  let convolutionFocus = { row: 1, column: 1 };
  let mapWalkthroughStep = 0;
  let diagnosisIndex = 0;
  let diagnosisAnswer = '';
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

  function linearNeuronStep(weight, input, target, learningRate) {
    const w = number(weight, 0);
    const x = number(input, 1);
    const y = number(target, 0);
    const rate = number(learningRate, 0);
    const prediction = w * x;
    const error = prediction - y;
    const gradient = error * x;
    return { weight: w, input: x, target: y, prediction, error, loss: 0.5 * error ** 2, gradient, nextWeight: w - rate * gradient };
  }

  function linearNeuronTraining(learningRate = 0.5, steps = 8, start = -4, input = 1, target = 3) {
    const count = Math.max(0, Math.min(100, Math.floor(number(steps, 8))));
    const trace = [];
    let weight = number(start, -4);
    for (let step = 0; step <= count; step++) {
      const point = linearNeuronStep(weight, input, target, learningRate);
      trace.push({ step, ...point });
      if (step < count) weight = point.nextWeight;
    }
    return trace;
  }

  function transformAugmentationBox(box, mode, options = {}) {
    if (!Array.isArray(box) || box.length !== 4 || box.some(value => !Number.isFinite(Number(value)))) return [];
    const [x1, y1, x2, y2] = box.map(Number);
    const width = number(options.width, 320);
    const height = number(options.height, 200);
    if (mode === 'flip') return [width - x2, y1, width - x1, y2];
    if (mode === 'scale') {
      const scale = number(options.scale, 1.2);
      const centerX = width / 2;
      const centerY = height / 2;
      return [centerX + (x1 - centerX) * scale, centerY + (y1 - centerY) * scale,
        centerX + (x2 - centerX) * scale, centerY + (y2 - centerY) * scale];
    }
    if (mode === 'mosaic') {
      const quadrant = Math.max(0, Math.min(3, Math.floor(number(options.quadrant, 0))));
      const halfWidth = width / 2;
      const halfHeight = height / 2;
      const offsetX = (quadrant % 2) * halfWidth;
      const offsetY = Math.floor(quadrant / 2) * halfHeight;
      return [
        Math.max(offsetX, Math.min(offsetX + halfWidth, offsetX + x1 * 0.5)),
        Math.max(offsetY, Math.min(offsetY + halfHeight, offsetY + y1 * 0.5)),
        Math.max(offsetX, Math.min(offsetX + halfWidth, offsetX + x2 * 0.5)),
        Math.max(offsetY, Math.min(offsetY + halfHeight, offsetY + y2 * 0.5)),
      ];
    }
    return [x1, y1, x2, y2];
  }

  const teachingDiagnosisCases = [
    {
      id: 'missed', answer: '漏检', groundTruths: [{ className: 'person', box: [76, 42, 162, 170], kind: 'person' }], predictions: [],
      explanation: '图中有一个真实目标，却没有任何预测框。目标没有被找回，因此计为 FN。',
    },
    {
      id: 'false-positive', answer: '误检', groundTruths: [{ className: 'person', box: [56, 46, 142, 174], kind: 'person' }],
      predictions: [{ className: 'person', score: 0.81, box: [210, 68, 286, 142], kind: 'buoy' }],
      explanation: '预测框没有匹配到真实目标，计为 FP；真实行人也没有被找回，计为 FN。',
    },
    {
      id: 'class-error', answer: '类别错误', groundTruths: [{ className: 'person', box: [110, 38, 194, 170], kind: 'person' }],
      predictions: [{ className: 'swimmer', score: 0.88, box: [110, 38, 194, 170], kind: 'person' }],
      explanation: '位置重合但类别不一致。对 person 来说是真实目标漏检（FN）；对 swimmer 来说是错误预测（FP）。',
    },
    {
      id: 'box-shift', answer: '框偏移', groundTruths: [{ className: 'person', box: [72, 42, 158, 170], kind: 'person' }],
      predictions: [{ className: 'person', score: 0.76, box: [108, 42, 194, 170], kind: 'person' }],
      explanation: '类别正确，但框向右偏移；IoU 约为 0.41。阈值 0.50 时不能匹配，降低阈值到 IoU 以下后才计为 TP。',
    },
  ];

  function evaluateTeachingDiagnosis(caseId, iouThreshold = 0.5) {
    const item = teachingDiagnosisCases.find(example => example.id === caseId);
    if (!item) return null;
    const threshold = Math.max(0, Math.min(1, number(iouThreshold, 0.5)));
    const matched = new Set();
    let tp = 0;
    let fp = 0;
    let classErrors = 0;
    const predictions = item.predictions.slice().sort((a, b) => b.score - a.score);
    for (const prediction of predictions) {
      const candidates = item.groundTruths.map((groundTruth, index) => ({ groundTruth, index, overlap: intersectionOverUnion(prediction.box, groundTruth.box) }));
      const best = candidates.filter(candidate => candidate.groundTruth.className === prediction.className && !matched.has(candidate.index))
        .sort((a, b) => b.overlap - a.overlap)[0];
      if (best && best.overlap >= threshold) {
        matched.add(best.index);
        tp++;
      } else {
        fp++;
        if (candidates.some(candidate => candidate.groundTruth.className !== prediction.className && candidate.overlap >= threshold)) classErrors++;
      }
    }
    const fn = item.groundTruths.length - matched.size;
    const precision = tp + fp ? tp / (tp + fp) : 0;
    const recall = item.groundTruths.length ? tp / item.groundTruths.length : 0;
    return { caseId, answer: item.answer, tp, fp, fn, classErrors, precision, recall, f1: precision + recall ? 2 * precision * recall / (precision + recall) : 0 };
  }

  function convolve(input, kernel, stride = 1) {
    if (!Array.isArray(input) || !Array.isArray(kernel) || !input.length || !kernel.length) return [];
    const inputWidth = input[0]?.length || 0;
    const kernelWidth = kernel[0]?.length || 0;
    const step = Math.max(1, Math.floor(number(stride, 1)));
    if (!inputWidth || !kernelWidth || input.some(row => !Array.isArray(row) || row.length !== inputWidth)
      || kernel.some(row => !Array.isArray(row) || row.length !== kernelWidth)
      || input.length < kernel.length || inputWidth < kernelWidth) return [];
    const output = [];
    for (let row = 0; row <= input.length - kernel.length; row += step) {
      const outputRow = [];
      for (let column = 0; column <= inputWidth - kernelWidth; column += step) {
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
      + '<div class="lab-control-card"><h3 class="lab-subheading">误差沿计算链反传</h3><div class="gradient-equation-grid"><div><span>前向：ŷ = w × x</span><b id="gradient-forward"></b></div><div><span>损失：L = ½(ŷ − y)²</span><b id="gradient-loss"></b></div><div><span>反向：∂L/∂w</span><b id="gradient-backprop"></b></div><div><span>更新：w ← w − η∇L</span><b id="gradient-update"></b></div></div>'
      + '<label for="gradient-lr">学习率 η <output id="gradient-lr-value">0.50</output></label><input id="gradient-lr" type="range" min="0.05" max="1.90" step="0.05" value="0.50">'
      + '<label for="gradient-steps">更新步数 <output id="gradient-steps-value">4</output></label><input id="gradient-steps" type="range" min="1" max="8" step="1" value="4">'
      + '<div id="gradient-explanation" class="lab-callout" aria-live="polite"></div><p class="lab-formula">单神经元示例：固定输入 x=1、目标 y=3，<code>ŷ=wx</code>；链式法则给出 <code>∂L/∂w = ∂L/∂ŷ × ∂ŷ/∂w = (ŷ−y)x</code>。每次更新后重新前向计算。</p>'
      + '<button class="secondary" type="button" data-lab-reset="gradient">重置参数</button><p class="lab-small-note">下方以同一初始权重比较 η=0.05、0.50、2.10；η≥2 时，这个二次损失不再收敛。</p></div></div>'
      + '<section class="gradient-comparison-card"><div class="lab-card-heading"><div><span class="chapter-kicker">SAME START · DIFFERENT LEARNING RATES</span><h3>训练损失对比</h3></div><span>8 次更新</span></div><div id="gradient-comparison" class="gradient-comparison" aria-live="polite"></div><div class="gradient-comparison-legend"><span class="slow">η = 0.05 · 慢</span><span class="steady">η = 0.50 · 稳</span><span class="oversized">η = 2.10 · 过大</span></div></section>'
      + '<a class="lab-lesson-link" href="#lesson/optimizer">接着学习：优化器与学习率 →</a></section>';
  }

  function augmentationPanel() {
    return '<section class="experiment-panel" role="tabpanel" id="lab-panel-augmentation" aria-labelledby="lab-tab-augmentation" data-lab-panel="augmentation" hidden>'
      + '<div class="lab-sim-layout"><div class="lab-visual-card"><div class="lab-card-heading"><div><span class="chapter-kicker">YOLOV5 · TRAINING AUGMENTATION</span><h2>变换图像，也要同步变换标签</h2></div><span id="augmentation-badge" class="lab-step-badge">水平翻转</span></div>'
      + '<div id="augmentation-visual" class="augmentation-visual" aria-live="polite"></div><p id="augmentation-caption" class="lab-callout"></p></div>'
      + '<div class="lab-control-card"><label for="augmentation-mode">选择增强方式</label><select id="augmentation-mode"><option value="flip">水平翻转</option><option value="scale">缩放与裁剪</option><option value="color">颜色扰动（HSV 示意）</option><option value="mosaic">Mosaic 四图拼接</option></select>'
      + '<label for="augmentation-strength"><span id="augmentation-strength-label">缩放比例</span><output id="augmentation-strength-value">1.20×</output></label><input id="augmentation-strength" type="range" min="0.75" max="1.50" step="0.05" value="1.20">'
      + '<div id="augmentation-explanation" class="lab-callout" aria-live="polite"></div><div id="augmentation-box-math" class="augmentation-box-math"></div><p class="lab-small-note">边界框用绿色虚线表示，红紫色细框表示变换后的标注位置。Mosaic 示例把四张图像缩放后放入四个象限。</p></div></div></section>';
  }

  function diagnosisPanel() {
    return '<section class="experiment-panel" role="tabpanel" id="lab-panel-diagnosis" aria-labelledby="lab-tab-diagnosis" data-lab-panel="diagnosis" hidden>'
      + '<div class="lab-sim-layout"><div class="lab-visual-card"><div class="lab-card-heading"><div><span class="chapter-kicker">ANNOTATION · PREDICTION · METRICS</span><h2>看图找出检测错误</h2></div><span id="diagnosis-progress" class="lab-step-badge">练习 1 / 4</span></div>'
      + '<div id="diagnosis-scene" class="diagnosis-scene" aria-live="polite"></div><p class="diagnosis-legend"><span>绿色虚线：真实标注</span><span>紫色实线：模型预测</span></p><p id="diagnosis-prompt" class="lab-callout">观察真实框和预测框，判断主要问题。</p>'
      + '<div class="diagnosis-navigation"><button type="button" class="secondary" data-diagnosis-nav="prev">← 上一题</button><button type="button" class="secondary" data-diagnosis-nav="next">下一题 →</button></div></div>'
      + '<div class="lab-control-card"><h3 class="lab-subheading">这是什么问题？</h3><div class="diagnosis-choices" role="radiogroup" aria-label="选择检测错误类型">' + ['漏检', '误检', '类别错误', '框偏移'].map(choice => '<button type="button" role="radio" aria-checked="false" data-diagnosis-choice="' + choice + '">' + choice + '</button>').join('') + '</div>'
      + '<div id="diagnosis-feedback" class="lab-callout" aria-live="polite">选择一个答案，查看判断依据。</div><div id="diagnosis-counts" class="diagnosis-counts" aria-live="polite"></div>'
      + '<label for="diagnosis-iou">匹配 IoU 阈值 <output id="diagnosis-iou-value">0.50</output></label><input id="diagnosis-iou" type="range" min="0.30" max="0.80" step="0.05" value="0.50">'
      + '<p class="lab-small-note">预测框只有在类别相同、IoU 达到阈值且真实目标尚未匹配时，才算 TP。一个错类框会造成一个 FP 和一个 FN。</p></div></div></section>';
  }

  function convolutionPanel() {
    return '<section class="experiment-panel" role="tabpanel" id="lab-panel-convolution" aria-labelledby="lab-tab-convolution" data-lab-panel="convolution" hidden>'
      + '<div class="lab-sim-layout"><div class="lab-visual-card"><div class="lab-card-heading"><div><span class="chapter-kicker">KERNEL × IMAGE</span><h2>卷积核怎样留下特征</h2></div><span id="conv-output-shape" class="lab-step-badge">输出 3×3</span></div>'
      + '<div id="conv-visual" class="conv-visual" aria-live="polite"></div><p id="conv-detail" class="lab-callout" aria-live="polite"></p></div>'
      + '<div class="lab-control-card"><label for="conv-input">选择输入图案</label><select id="conv-input"><option value="shape">方块边缘</option><option value="vertical">竖直亮边</option><option value="checker">棋盘图案</option></select>'
      + '<label for="conv-kernel">选择一个 3×3 卷积核</label><select id="conv-kernel"><option value="edge">边缘检测</option><option value="blur">均值模糊</option><option value="sharpen">锐化</option></select>'
      + '<label for="conv-stride">步长 <output id="conv-stride-value">1</output></label><select id="conv-stride"><option value="1">1 · 每格移动</option><option value="2">2 · 隔格移动</option></select>'
      + '<p class="lab-formula">每个输出格都来自对应的 3×3 输入区域：对应元素相乘，再把 9 个乘积相加。无填充时，输出边长 = ⌊(输入边长 − 卷积核边长) ÷ 步长⌋ + 1。</p><p class="lab-small-note">点击输出特征图中的格子，可以高亮它在输入图像上对应的感受野。深度学习框架通常使用不翻转卷积核的互相关运算。</p>'
      + '<a class="lab-lesson-link" href="#lesson/cnn">接着学习：卷积神经网络与感受野 →</a></div></div></section>';
  }

  function nmsPanel() {
    return '<section class="experiment-panel" role="tabpanel" id="lab-panel-nms" aria-labelledby="lab-tab-nms" data-lab-panel="nms" hidden>'
      + '<div class="lab-sim-layout"><div class="lab-visual-card"><div class="lab-card-heading"><div><span class="chapter-kicker">CONFIDENCE → NMS</span><h2>从重叠候选框中选出结果</h2></div><span class="lab-step-badge">同类别示例</span></div>'
      + '<div id="nms-visual" class="nms-visual" aria-live="polite"></div><p id="nms-summary" class="lab-callout" aria-live="polite"></p></div>'
      + '<div class="lab-control-card"><label for="nms-confidence">置信度阈值 <output id="nms-confidence-value">0.30</output></label><input id="nms-confidence" type="range" min="0.20" max="0.90" step="0.05" value="0.30">'
      + '<label for="nms-iou">NMS 的 IoU 阈值 <output id="nms-iou-value">0.50</output></label><input id="nms-iou" type="range" min="0.10" max="0.90" step="0.05" value="0.50">'
      + '<div id="nms-metric-summary" class="nms-metric-summary" aria-live="polite"></div><h3 class="lab-subheading">这次筛选的过程</h3><ol id="nms-step-list" class="nms-steps"></ol>'
      + '<p class="lab-small-note">调高 NMS 的 IoU 阈值会让抑制更宽松；调低则更容易去掉重叠候选框。真实检测器还会按类别分别处理。</p><a class="lab-lesson-link" href="#lesson/metrics">接着学习：NMS、Precision、Recall 与 mAP →</a></div></div></section>';
  }

  function mapWalkthroughPanel() {
    return '<section class="map-walkthrough-card" aria-labelledby="map-walkthrough-title"><div class="lab-card-heading"><div><span class="chapter-kicker">STEP-BY-STEP · TEACHING EXAMPLE</span><h3 id="map-walkthrough-title">逐框计算 AP，再对类别求 mAP</h3><p>按置信度从高到低逐个判断；同一个真实目标只能匹配一次。这里是教学样例，不是 swim_v9 预测结果。</p></div></div>'
      + '<div class="map-walk-controls"><label for="map-walk-class">查看类别<select id="map-walk-class"><option value="person">person · 行人</option><option value="swimmer">swimmer · 游泳者</option></select></label>'
      + '<label for="map-walk-iou">匹配 IoU 阈值 <output id="map-walk-iou-value">0.50</output></label><input id="map-walk-iou" type="range" min="0.50" max="0.95" step="0.05" value="0.50"></div>'
      + '<div class="map-walk-body"><div><h4>置信度排序与逐步匹配</h4><ol id="map-walk-predictions" class="map-walk-predictions"></ol></div><div class="map-walk-explainer"><div class="map-walk-step-controls"><button class="secondary" type="button" data-map-step="prev">← 上一个框</button><output id="map-walk-position" aria-live="polite"></output><button class="secondary" type="button" data-map-step="next">下一个框 →</button></div><p id="map-walk-detail" class="lab-callout" aria-live="polite"></p><p class="lab-small-note">AP 会扫描完整的置信度排序，不只看某一个置信度截点；mAP 是各类别 AP 的算术平均。</p></div></div>'
      + '<div id="map-walk-summary" class="map-walk-summary" aria-live="polite"></div><p class="lab-formula">AP：在 PR 曲线上对 Recall 的 0～1 区间做 101 点插值平均。mAP@0.50：各类别 AP@0.50 的平均值；mAP@0.50:0.95：再对 10 个 IoU 阈值下的 AP 求平均。</p></section>';
  }

  function swimV9CasePanel() {
    const run = window.VisionLabSwimV9;
    const final = run.history[run.history.length - 1];
    const percent = value => (value * 100).toFixed(2) + '%';
    const classes = run.curves.classAp50.map(item => '<span><b>' + escapeHtml(item.name) + '</b> AP@0.50 ' + percent(item.ap) + '</span>').join('');
    const figure = (file, alt, caption) => '<figure><a href="assets/swim-v9/' + file + '" target="_blank" rel="noreferrer"><img src="assets/swim-v9/' + file + '" alt="' + alt + '" loading="lazy"></a><figcaption>' + caption + '</figcaption></figure>';
    return '<section class="swim-case-card" aria-labelledby="swim-case-title"><div class="swim-case-heading"><div><span class="chapter-kicker">真实训练记录 · YOLOv5</span><h2 id="swim-case-title">你的 swim_v9 检测实验</h2><p>曲线图直接取自训练结果文件夹；下方历史图按 results.csv 的 126 行记录绘制。</p></div><span class="swim-case-badge">实际训练结果</span></div>'
      + '<div class="swim-kpi-grid"><div><span>PR 图 · mAP@0.50</span><strong>' + percent(run.curves.prMap50) + '</strong></div><div><span>F1 曲线峰值</span><strong>' + percent(run.curves.peakF1) + '</strong></div><div><span>峰值置信度</span><strong>' + run.curves.peakF1Confidence.toFixed(3) + '</strong></div><div><span>CSV 记录轮数</span><strong>' + run.history.length + ' 轮</strong></div></div>'
      + '<div class="swim-ap-summary" aria-label="各类别 AP@0.50">' + classes + '</div>'
      + '<div class="swim-v9-plot-grid swim-v9-primary-plots">' + figure('PR_curve.png', 'swim_v9 原始 Precision Recall 曲线，person AP 0.987，swimmer AP 0.952，全部类别 mAP@0.5 为 0.969', '原始 PR_curve.png · 横轴 Recall，纵轴 Precision；图例同时标出每类 AP 与整体 mAP。') + figure('F1_curve.png', 'swim_v9 原始 F1 与 confidence 曲线，全部类别峰值约 0.94，置信度约 0.662', '原始 F1_curve.png · 峰值约为 F1 0.94，置信度 0.662。阈值过高时，漏检增加，F1 会快速下降。') + '</div>'
      + '<article class="swim-history-card"><div class="swim-history-heading"><div><span class="chapter-kicker">TRAINING HISTORY · 126 EPOCHS</span><h3>指标怎样随训练轮数变化</h3></div><label for="swim-history-metric">查看指标<select id="swim-history-metric"><option value="map50">mAP@0.50</option><option value="map5095">mAP@0.50:0.95</option><option value="precision">Precision</option><option value="recall">Recall</option><option value="trainBoxLoss">训练 box loss</option><option value="valBoxLoss">验证 box loss</option><option value="trainObjLoss">训练 obj loss</option><option value="valObjLoss">验证 obj loss</option><option value="trainClsLoss">训练 cls loss</option><option value="valClsLoss">验证 cls loss</option></select></label></div>'
      + '<div id="swim-history-chart" class="swim-history-chart" aria-live="polite"></div><label class="swim-epoch-control" for="swim-history-epoch">选择训练轮次 <output id="swim-history-summary" aria-live="polite"></output><input id="swim-history-epoch" type="range" min="0" max="' + (run.history.length - 1) + '" step="1" value="' + (run.history.length - 1) + '"></label>'
      + '<p class="swim-v9-source-note">逐轮指标来自 results.csv；图中的 PR 与 F1 曲线则是 YOLOv5 原始 PNG。PR 图图例为 mAP@0.50 0.969，results.csv 第 125 轮记录为 ' + final.map50.toFixed(5) + '；两份原始文件的数值略有差异，页面分别保留并标明来源。results.csv 只有汇总指标，没有每个预测框的置信度和 IoU 匹配记录，因此这里不从汇总值伪造可拖动的真实 PR 曲线。</p></article>'
      + '<div class="swim-v9-final-row"><b>results.csv · 第 ' + final.epoch + ' 轮</b><span>Precision ' + percent(final.precision) + '</span><span>Recall ' + percent(final.recall) + '</span><span>mAP@0.50 ' + percent(final.map50) + '</span><span>mAP@0.50:0.95 ' + percent(final.map5095) + '</span></div>'
      + '<div class="swim-v9-plot-grid swim-v9-support-plots">' + figure('results.png', 'swim_v9 原始逐轮训练结果图，含训练和验证损失、Precision、Recall、mAP 曲线', '原始 results.png · 同时展示训练/验证损失、Precision、Recall 与两种 mAP 的变化。') + figure('confusion_matrix.png', 'swim_v9 原始归一化混淆矩阵，包含 person、swimmer 与 background', '原始混淆矩阵 · 对角线代表正确分类；background 行和列帮助观察漏检与误检。') + figure('labels.jpg', 'swim_v9 训练标注的类别数量与目标框位置、宽高分布图', '标签分布 · 可观察训练标注中目标的位置与边界框尺寸。') + figure('labels_correlogram.jpg', 'swim_v9 训练标注的类别数量与边界框尺寸相关图', '标签相关图 · 类别、目标宽高等标注量的联合分布。') + '</div>'
      + '<details class="swim-config-note"><summary>本次训练的主要配置</summary><p>数据配置 data/swim.yaml · 类别 person、swimmer · 模型结构 PlanD5s-P2.yaml · 初始化权重 Swim_v7.pt · 输入尺寸 960 px · 配置训练 350 轮，文件记录 126 轮。</p></details></section>';
  }

  function updateSwimV9History() {
    const run = window.VisionLabSwimV9;
    const chart = byId('swim-history-chart');
    const metricInput = byId('swim-history-metric');
    const epochInput = byId('swim-history-epoch');
    const summary = byId('swim-history-summary');
    if (!run || !chart || !metricInput || !epochInput || !summary) return;
    const definitions = {
      map50: { label: 'mAP@0.50', field: 'map50', percent: true },
      map5095: { label: 'mAP@0.50:0.95', field: 'map5095', percent: true },
      precision: { label: 'Precision', field: 'precision', percent: true },
      recall: { label: 'Recall', field: 'recall', percent: true },
      trainBoxLoss: { label: '训练 box loss', field: 'trainBoxLoss' },
      valBoxLoss: { label: '验证 box loss', field: 'valBoxLoss' },
      trainObjLoss: { label: '训练 obj loss', field: 'trainObjLoss' },
      valObjLoss: { label: '验证 obj loss', field: 'valObjLoss' },
      trainClsLoss: { label: '训练 cls loss', field: 'trainClsLoss' },
      valClsLoss: { label: '验证 cls loss', field: 'valClsLoss' },
    };
    const definition = definitions[metricInput.value] || definitions.map50;
    const percent = value => (value * 100).toFixed(2) + '%';
    const finalEpoch = run.history.length - 1;
    const epoch = Math.max(0, Math.min(finalEpoch, Math.round(number(epochInput.value, finalEpoch))));
    epochInput.min = '0';
    epochInput.max = String(finalEpoch);
    epochInput.value = String(epoch);
    const values = run.history.map(item => item[definition.field]);
    const minimum = definition.percent ? 0 : Math.max(0, Math.min(...values) - Math.max((Math.max(...values) - Math.min(...values)) * 0.08, 0.000001));
    const maximum = definition.percent ? 1 : Math.max(...values) + Math.max((Math.max(...values) - Math.min(...values)) * 0.08, 0.000001);
    const left = 56, top = 20, width = 720, height = 210;
    const x = index => left + (index / finalEpoch) * width;
    const y = value => top + ((maximum - value) / (maximum - minimum || 1)) * height;
    const tickLines = Array.from({ length: 5 }, (_, index) => {
      const ratio = index / 4;
      const value = maximum - ratio * (maximum - minimum);
      const label = definition.percent ? Math.round(value * 100) + '%' : value.toFixed(4);
      const tickY = top + ratio * height;
      return '<path class="swim-grid-line" d="M' + left + ' ' + tickY.toFixed(1) + 'H' + (left + width) + '"/><text class="swim-axis-label" x="' + (left - 9) + '" y="' + (tickY + 4).toFixed(1) + '" text-anchor="end">' + label + '</text>';
    }).join('');
    const xTicks = [0, Math.round(finalEpoch / 2), finalEpoch].map(index => '<text class="swim-axis-label" x="' + x(index).toFixed(1) + '" y="' + (top + height + 25) + '" text-anchor="middle">' + index + '</text>').join('');
    const path = run.history.map((item, index) => (index ? 'L' : 'M') + x(index).toFixed(1) + ' ' + y(item[definition.field]).toFixed(1)).join(' ');
    const dots = run.history.map((item, index) => '<circle class="swim-history-dot" cx="' + x(index).toFixed(1) + '" cy="' + y(item[definition.field]).toFixed(1) + '" r="1.8"><title>第 ' + item.epoch + ' 轮 · ' + definition.label + ' ' + (definition.percent ? (item[definition.field] * 100).toFixed(2) + '%' : item[definition.field].toFixed(5)) + '</title></circle>').join('');
    const selected = run.history[epoch];
    const selectedX = x(epoch);
    const selectedY = y(selected[definition.field]);
    chart.innerHTML = '<svg viewBox="0 0 800 280" role="img" aria-label="swim_v9 的 ' + definition.label + ' 随 126 个训练轮次变化"><path class="swim-history-axis" d="M' + left + ' ' + top + 'V' + (top + height) + 'H' + (left + width) + '"/>' + tickLines + xTicks + '<path class="swim-history-line" d="' + path + '"/>' + dots + '<line class="swim-history-selected-line" x1="' + selectedX.toFixed(1) + '" x2="' + selectedX.toFixed(1) + '" y1="' + top + '" y2="' + (top + height) + '"/><circle class="swim-history-selected-point" data-epoch="' + epoch + '" cx="' + selectedX.toFixed(1) + '" cy="' + selectedY.toFixed(1) + '" r="5"><title>第 ' + selected.epoch + ' 轮 · ' + definition.label + ' ' + (definition.percent ? percent(selected[definition.field]) : selected[definition.field].toFixed(5)) + '</title></circle><text class="swim-axis-title" x="416" y="276" text-anchor="middle">训练轮次（epoch）</text><text class="swim-axis-title" x="15" y="126" transform="rotate(-90 15 126)" text-anchor="middle">' + definition.label + '</text></svg>';
    summary.textContent = '第 ' + selected.epoch + ' 轮 · Precision ' + percent(selected.precision) + ' · Recall ' + percent(selected.recall) + ' · mAP@0.50 ' + percent(selected.map50) + ' · mAP@0.50:0.95 ' + percent(selected.map5095);
  }

  function metricsPanel() {
    const sampleGroundTruthCount = Object.values(metricGroundTruths).reduce((sum, count) => sum + count, 0);
    return '<section class="experiment-panel" role="tabpanel" id="lab-panel-metrics" aria-labelledby="lab-tab-metrics" data-lab-panel="metrics" hidden>'
      + swimV9CasePanel()
      + '<div class="metric-intro-card"><span class="chapter-kicker">INTERACTIVE TEACHING EXAMPLE · SYNTHETIC DATA</span><h2>交互计算：阈值怎样改变检测指标</h2><p id="metric-data-description">本区教学样例包含 ' + sampleGroundTruthCount + ' 个标注目标、' + metricPredictions.length + ' 个预测框和 3 个类别，用于观察置信度和 IoU 对指标的影响。上方 swim_v9 区域展示你的真实曲线；可导入逐框验证 JSON 来计算其他模型的真实曲线。</p>'
      + '<div class="metric-import-toolbar"><span id="metric-data-mode" class="metric-data-mode">合成教学样例</span><label class="metric-upload-button" for="metric-import-file">导入 YOLOv5 验证 JSON<input id="metric-import-file" type="file" accept=".json,application/json"></label><a class="secondary metric-export-link" href="visionlab-yolov5-export.py" download>下载 YOLOv5 导出脚本</a><button class="secondary metric-reset-button" type="button" data-metric-reset>恢复合成样例</button></div><p id="metric-data-status" class="metric-data-status" aria-live="polite">这是用于操作学习的合成数据，不是 swim_v9 评估结果。</p>'
      + '<details class="metric-export-guide"><summary>怎样从 swim_v9 生成可交互的真实曲线</summary><ol><li>下载导出脚本，放到 YOLOv5 仓库根目录。</li><li>用训练时相同的权重、验证集和输入尺寸重新运行验证：</li></ol><pre><code>python visionlab-yolov5-export.py --weights runs/train/swim_v9/weights/best.pt --data data/swim.yaml --imgsz 960 --device 0 --output runs/val/swim_v9.json</code></pre><p>脚本会保存每个预测框的类别、置信度，以及它在 IoU=0.50 至 0.95 下是否匹配标注。网页只在本机浏览器读取导出的 JSON。你的现有结果文件夹保存了 PR/F1 图片和每轮汇总指标，但没有逐框置信度与匹配记录；导入 JSON 后，网页才能让游标沿真实 PR/F1 曲线移动。</p></details></div>'
      + '<div class="metric-workbench"><div class="metric-chart-stack"><article class="lab-visual-card metric-chart-card"><div class="lab-card-heading"><div><span class="chapter-kicker">PRECISION ↔ RECALL</span><h3>PR 曲线 · 交互教学样例</h3></div><span class="lab-step-badge">置信度阈值逐步变化</span></div><div id="metric-pr-chart" class="metric-chart" aria-live="polite"></div><p class="metric-chart-caption">本图用合成数据或导入的真实逐框数据重算；真实 swim_v9 原始 PR 图见上方。曲线越靠近右上角，通常表示找回更多目标时仍能保持较高准确率。</p></article>'
      + '<article class="lab-visual-card metric-chart-card"><div class="lab-card-heading"><div><span class="chapter-kicker">F1 ↔ CONFIDENCE</span><h3>F1 曲线 · 交互教学样例</h3></div><span id="metric-best-f1" class="lab-step-badge"></span></div><div id="metric-f1-chart" class="metric-chart" aria-live="polite"></div><p class="metric-chart-caption">本图用于学习 Precision 与 Recall 的折中；导入真实逐框 JSON 后会显示所选模型的真实曲线。swim_v9 的原始 F1 图及最优阈值见上方。</p></article></div>'
      + '<aside class="lab-control-card metric-control-card"><label for="metric-class">查看类别</label><select id="metric-class"><option value="all">全部类别 · 汇总</option><option value="pedestrian">行人</option><option value="vehicle">车辆</option><option value="bicycle">自行车</option></select>'
      + '<label for="metric-confidence">置信度阈值 <output id="metric-confidence-value">0.70</output></label><input id="metric-confidence" type="range" min="0" max="1" step="0.01" value="0.70">'
      + '<label for="metric-iou">匹配所需 IoU <output id="metric-iou-value">0.50</output></label><input id="metric-iou" type="range" min="0.50" max="0.95" step="0.05" value="0.50">'
      + '<p id="metric-point-summary" class="lab-callout metric-point-summary" aria-live="polite"></p><div class="metric-score-grid"><div><span>Precision</span><strong id="metric-precision"></strong></div><div><span>Recall</span><strong id="metric-recall"></strong></div><div><span>F1</span><strong id="metric-f1"></strong></div></div>'
      + '<div class="metric-formulas"><p><b>Precision</b> = TP ÷ (TP + FP)</p><p><b>Recall</b> = TP ÷ (TP + FN)</p><p><b>F1</b> = 2 × P × R ÷ (P + R)</p></div><p class="lab-small-note">TP：正确匹配的框；FP：重复、误检或 IoU 未达标的框；FN：没有被找回的标注目标。</p></aside></div>'
      + '<article class="lab-visual-card metric-map-card"><div class="lab-card-heading"><div><span class="chapter-kicker">AVERAGE PRECISION · MEAN AP</span><h3>从 PR 面积到 mAP</h3></div><div id="metric-map-summary" class="metric-map-summary" aria-live="polite"></div></div><div class="metric-ap-legend"><span><i class="ap50"></i>AP@0.50</span><span><i class="ap5095"></i>AP@0.50:0.95</span></div><div id="metric-map-breakdown" class="metric-map-breakdown"></div><p class="metric-chart-caption">AP 是某一类别 PR 曲线下的插值面积；mAP@0.50 先在 IoU=0.50 计算每类 AP，再对类别求平均。mAP@0.50:0.95 则把 IoU 从 0.50 到 0.95（步长 0.05）的 AP 一并平均，共 10 个阈值。导入数据严格使用 YOLOv5 的验证匹配结果；上方 swim_v9 数值直接取自原始训练图与 results.csv。</p></article>'
      + mapWalkthroughPanel()
      + '<p class="lab-formula metric-reading-note">置信度改变 PR 曲线上的工作点；匹配 IoU 改变哪些预测算 TP。AP 是单个类别 PR 曲线下的面积，mAP 再对类别及指定 IoU 阈值求平均。</p>'
      + '<a class="lab-lesson-link" href="#lesson/metrics">接着学习：NMS、Precision、Recall 与 mAP →</a></section>';
  }

  function renderInteractiveLab() {
    const oldMarkup = lab();
    const gridStart = oldMarkup.indexOf('<div class="lab-grid">');
    const iouMarkup = gridStart >= 0 ? oldMarkup.slice(gridStart) : '<p class="lab-callout">IoU 实验暂时无法加载，请刷新页面重试。</p>';
    const tabs = [
      ['pipeline', '完整检测流程'], ['iou', 'IoU 框重叠'], ['gradient', '反向传播'], ['convolution', '卷积特征'], ['augmentation', '数据增强'], ['diagnosis', '错误诊断'], ['nms', 'YOLO 后处理'], ['metrics', 'PR · F1 · mAP'],
    ];
    return '<section class="page-intro"><p class="eyebrow">LEARN BY INTERACTION</p><h1>让概念动起来。</h1><p>拖动参数、切换算子、观察结果变化。每个实验都把图像、计算步骤和教材章节连在一起。</p></section>'
      + '<p class="lab-notice"><strong>建议：</strong>先预测参数变化会带来什么结果，再操作控件验证自己的判断。</p>'
      + '<div class="lab-tabs" role="tablist" aria-label="选择学习实验">' + tabs.map(([id, label], index) => '<button type="button" role="tab" id="lab-tab-' + id + '" aria-controls="lab-panel-' + id + '" aria-selected="' + String(activeTab === id) + '" tabindex="' + (activeTab === id ? '0' : '-1') + '" data-lab-tab="' + id + '">' + label + '<span>0' + (index + 1) + '</span></button>').join('') + '</div>'
      + (window.detectionPipeline ? window.detectionPipeline.render() : '')
      + '<section class="experiment-panel" role="tabpanel" id="lab-panel-iou" aria-labelledby="lab-tab-iou" data-lab-panel="iou"' + (activeTab === 'iou' ? '' : ' hidden') + '>' + iouMarkup + '<a class="lab-lesson-link" href="#lesson/iou">接着学习：交并比与检测评价 →</a></section>'
      + gradientPanel() + convolutionPanel() + augmentationPanel() + diagnosisPanel() + nmsPanel() + metricsPanel();
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
    const firstStep = linearNeuronStep(-4, 1, 3, rate);
    const forward = byId('gradient-forward');
    const loss = byId('gradient-loss');
    const backprop = byId('gradient-backprop');
    const update = byId('gradient-update');
    if (forward) forward.textContent = 'ŷ = ' + format(firstStep.prediction) + '（目标 3）';
    if (loss) loss.textContent = format(firstStep.loss);
    if (backprop) backprop.textContent = format(firstStep.gradient);
    if (update) update.textContent = '-4 → ' + format(firstStep.nextWeight);
    byId('gradient-explanation').textContent = rate < 0.25
      ? '学习率较小，每次沿斜坡前进一小步，下降平稳但需要更多轮。'
      : rate > 1
        ? '学习率偏大，更新点会跨过谷底并左右摆动；当前 η 小于 2，仍会逐步靠近最低点。'
        : '每一步都沿负梯度方向更新参数。绿色路径逐渐靠近损失最低点，损失值随之下降。';
    updateGradientComparison();
  }

  function updateGradientComparison() {
    const chart = byId('gradient-comparison');
    if (!chart) return;
    const series = [
      { rate: 0.05, className: 'gradient-series-slow', label: '0.05' },
      { rate: 0.5, className: 'gradient-series-steady', label: '0.50' },
      { rate: 2.1, className: 'gradient-series-oversized', label: '2.10' },
    ].map(item => ({ ...item, points: linearNeuronTraining(item.rate, 8) }));
    const maximum = Math.max(1, ...series.flatMap(item => item.points.map(point => point.loss)));
    const ceiling = Math.ceil(maximum / 25) * 25;
    const left = 44, top = 16, width = 418, height = 132;
    const x = step => left + step / 8 * width;
    const y = value => top + height - Math.min(value, ceiling) / ceiling * height;
    const grid = [0, 0.5, 1].map(ratio => {
      const tickY = top + ratio * height;
      const value = ceiling * (1 - ratio);
      return '<path class="gradient-grid-line" d="M' + left + ' ' + tickY.toFixed(1) + 'H' + (left + width) + '"/><text class="gradient-axis-label" x="' + (left - 7) + '" y="' + (tickY + 4).toFixed(1) + '" text-anchor="end">' + format(value) + '</text>';
    }).join('');
    const xLabels = [0, 4, 8].map(step => '<text class="gradient-axis-label" x="' + x(step).toFixed(1) + '" y="' + (top + height + 19) + '" text-anchor="middle">' + step + '</text>').join('');
    const paths = series.map(item => {
      const d = item.points.map((point, index) => (index ? 'L' : 'M') + x(point.step).toFixed(1) + ' ' + y(point.loss).toFixed(1)).join(' ');
      return '<path class="' + item.className + '" d="' + d + '"><title>η = ' + item.label + '</title></path>';
    }).join('');
    chart.innerHTML = '<svg viewBox="0 0 500 184" role="img" aria-label="三种学习率经过八次更新后的损失曲线对比"><path class="gradient-chart-axis" d="M44 16V148H462"/>' + grid + paths + xLabels + '<text class="gradient-axis-title" x="250" y="178" text-anchor="middle">更新步数</text></svg>';
  }

  function augmentationScene(index = 0) {
    const palettes = [
      { bg: '#e5f0ed', water: '#bad8d3', line: '#7daca8', person: '#355c67', box: [95, 39, 174, 172] },
      { bg: '#e9edf2', water: '#c6d6e2', line: '#8aafc4', person: '#4b5c77', box: [135, 31, 208, 165] },
      { bg: '#e8f0e7', water: '#c3dac8', line: '#89b4a0', person: '#416c61', box: [70, 48, 143, 176] },
      { bg: '#eef0e8', water: '#d2d9be', line: '#a4b28d', person: '#56694b', box: [162, 42, 235, 169] },
    ];
    return palettes[index % palettes.length];
  }

  function augmentationSceneContent(index, mode, strength, idSuffix) {
    const width = 320, height = 200;
    const scene = augmentationScene(index);
    const [x1, y1, x2, y2] = scene.box;
    let transform = '';
    let filter = '';
    let box = scene.box;
    if (mode === 'flip') {
      transform = 'translate(320 0) scale(-1 1)';
      box = transformAugmentationBox(scene.box, 'flip', { width, height });
    } else if (mode === 'scale') {
      const scale = number(strength, 1.2);
      transform = 'translate(' + (width / 2 * (1 - scale)).toFixed(2) + ' ' + (height / 2 * (1 - scale)).toFixed(2) + ') scale(' + scale.toFixed(2) + ')';
      box = transformAugmentationBox(scene.box, 'scale', { width, height, scale });
    } else if (mode === 'color') {
      const hue = Math.round((number(strength, 1.2) - 0.75) * 80);
      filter = 'filter:hue-rotate(' + hue + 'deg) saturate(1.25)';
    }
    const x = box[0], y = box[1], w = box[2] - box[0], h = box[3] - box[1];
    const headX = (x1 + x2) / 2;
    const bodyTop = y1 + 35;
    const bodyBottom = y2 - 32;
    const hueStyle = filter ? ' style="' + filter + '"' : '';
    return '<g class="augmentation-art" transform="' + transform + '"' + hueStyle + '><rect width="320" height="200" fill="' + scene.bg + '"/><path d="M0 126H320M0 155H320" stroke="' + scene.line + '" stroke-width="3" opacity=".65"/><rect y="126" width="320" height="74" fill="' + scene.water + '" opacity=".45"/><path d="M0 138q24 -8 48 0t48 0t48 0t48 0t48 0t48 0t48 0M0 169q24 -8 48 0t48 0t48 0t48 0t48 0t48 0t48 0" fill="none" stroke="' + scene.line + '" stroke-width="2" opacity=".58"/><circle cx="' + headX.toFixed(1) + '" cy="' + (y1 + 17).toFixed(1) + '" r="12" fill="' + scene.person + '"/><path d="M' + headX.toFixed(1) + ' ' + bodyTop.toFixed(1) + 'L' + headX.toFixed(1) + ' ' + bodyBottom.toFixed(1) + 'M' + (headX - 20).toFixed(1) + ' ' + (bodyTop + 15).toFixed(1) + 'L' + headX.toFixed(1) + ' ' + (bodyTop + 7).toFixed(1) + 'L' + (headX + 20).toFixed(1) + ' ' + (bodyTop + 16).toFixed(1) + 'M' + headX.toFixed(1) + ' ' + bodyBottom.toFixed(1) + 'L' + (headX - 18).toFixed(1) + ' ' + (y2 - 5).toFixed(1) + 'M' + headX.toFixed(1) + ' ' + bodyBottom.toFixed(1) + 'L' + (headX + 18).toFixed(1) + ' ' + (y2 - 5).toFixed(1) + '" fill="none" stroke="' + scene.person + '" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/></g><rect class="augmentation-box" x="' + x.toFixed(1) + '" y="' + y.toFixed(1) + '" width="' + w.toFixed(1) + '" height="' + h.toFixed(1) + '"/><text class="augmentation-box-label" x="' + x.toFixed(1) + '" y="' + Math.max(13, y - 4).toFixed(1) + '">person · GT' + (idSuffix ? ' ' + idSuffix : '') + '</text>';
  }

  function updateAugmentation() {
    const modeInput = byId('augmentation-mode');
    const strengthInput = byId('augmentation-strength');
    const visual = byId('augmentation-visual');
    if (!modeInput || !strengthInput || !visual) return;
    const mode = modeInput.value || 'flip';
    const strength = number(strengthInput.value, 1.2);
    const metadata = {
      flip: { label: '水平翻转', title: '图像与标注同步镜像', text: '左右镜像会同步反射目标和边界框；类别保持不变。若目标含文字或固定左右方向，翻转可能制造不合理样本。' },
      scale: { label: '缩放与裁剪', title: '目标尺寸发生变化', text: '缩放时图像和框使用同一变换；目标触及画布边缘时会被裁切，训练代码需要同步裁剪框坐标。' },
      color: { label: '颜色扰动（HSV 示意）', title: '只改变颜色，不移动框', text: 'HSV 增强扰动色调和饱和度，几何位置不变。颜色变化过强可能抹掉区分类别所需的色彩线索。' },
      mosaic: { label: 'Mosaic 四图拼接', title: '四张训练图组成一张', text: '每张图缩放并平移到一个象限，框坐标随之缩放和平移；目标会变小，边缘裁切和场景拼接也会改变上下文。' },
    }[mode] || { label: '水平翻转', title: '图像与标注同步镜像', text: '几何增强必须同步更新目标框。' };
    const badge = byId('augmentation-badge');
    const caption = byId('augmentation-caption');
    const explanation = byId('augmentation-explanation');
    const formula = byId('augmentation-box-math');
    const parameterLabel = byId('augmentation-strength-label');
    const parameterValue = byId('augmentation-strength-value');
    const box = transformAugmentationBox(augmentationScene(0).box, mode, { width: 320, height: 200, scale: strength, quadrant: 3 });
    if (badge) badge.textContent = metadata.label;
    if (caption) caption.textContent = metadata.text;
    if (explanation) explanation.textContent = metadata.title + '。观察右图的真实框变化。';
    if (parameterLabel) parameterLabel.textContent = mode === 'color' ? '色调变化' : '缩放比例';
    if (parameterValue) parameterValue.textContent = mode === 'color' ? '+' + Math.round((strength - 0.75) * 80) + '°' : strength.toFixed(2) + '×';
    strengthInput.disabled = mode === 'flip' || mode === 'mosaic';
    if (mode === 'mosaic') {
      const tiles = Array.from({ length: 4 }, (_, index) => '<svg x="' + (index % 2 * 160) + '" y="' + (Math.floor(index / 2) * 100) + '" width="160" height="100" viewBox="0 0 320 200" aria-label="Mosaic 象限 ' + (index + 1) + '">' + augmentationSceneContent(index, 'mosaic', strength, '') + '</svg>').join('');
      const mosaic = '<svg class="augmentation-svg mosaic-svg" viewBox="0 0 320 200" role="img" aria-label="Mosaic 四图拼接，四个象限各有一个行人目标">' + tiles + '<path class="mosaic-divider" d="M160 0V200M0 100H320"/></svg>';
      visual.innerHTML = '<div class="augmentation-compare"><figure><figcaption>原图</figcaption><svg class="augmentation-svg" viewBox="0 0 320 200" role="img" aria-label="原始行人图像和真实边界框">' + augmentationSceneContent(0, 'original', strength, '') + '</svg></figure><figure><figcaption>增强后 · Mosaic</figcaption>' + mosaic + '</figure></div>';
    } else {
      visual.innerHTML = '<div class="augmentation-compare"><figure><figcaption>原图</figcaption><svg class="augmentation-svg" viewBox="0 0 320 200" role="img" aria-label="原始行人图像和真实边界框">' + augmentationSceneContent(0, 'original', strength, '') + '</svg></figure><figure><figcaption>增强后 · ' + metadata.label + '</figcaption><svg class="augmentation-svg" viewBox="0 0 320 200" role="img" aria-label="' + metadata.label + '后的行人图像与同步变化的真实边界框">' + augmentationSceneContent(0, mode, strength, '') + '</svg></figure></div>';
    }
    if (formula) formula.textContent = mode === 'mosaic'
      ? '右下象限示例框：[' + box.map(value => format(value)).join(', ') + ']'
      : mode === 'flip' || mode === 'scale' ? '变换后真实框：[ ' + box.map(value => format(value)).join(', ') + ' ]' : '颜色扰动只改像素颜色，真实框坐标不变。';
  }

  function diagnosisSceneMarkup(item) {
    const objectMarkup = item.groundTruths.map(target => {
      const [x1, y1, x2, y2] = target.box;
      const centerX = (x1 + x2) / 2;
      const centerY = (y1 + y2) / 2;
      return '<g class="diagnosis-object"><circle cx="' + centerX.toFixed(1) + '" cy="' + (y1 + 17).toFixed(1) + '" r="9"/><path d="M' + centerX.toFixed(1) + ' ' + (y1 + 28).toFixed(1) + 'V' + (y2 - 25).toFixed(1) + 'M' + (centerX - 18).toFixed(1) + ' ' + (centerY - 5).toFixed(1) + 'H' + (centerX + 18).toFixed(1) + 'M' + centerX.toFixed(1) + ' ' + (y2 - 25).toFixed(1) + 'L' + (centerX - 15).toFixed(1) + ' ' + (y2 - 4).toFixed(1) + 'M' + centerX.toFixed(1) + ' ' + (y2 - 25).toFixed(1) + 'L' + (centerX + 15).toFixed(1) + ' ' + (y2 - 4).toFixed(1) + '"/></g>';
    }).join('');
    const falseObjectMarkup = item.predictions.filter(prediction => prediction.kind === 'buoy').map(prediction => {
      const x = (prediction.box[0] + prediction.box[2]) / 2;
      const y = (prediction.box[1] + prediction.box[3]) / 2;
      return '<g class="diagnosis-buoy"><circle cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="12"/><path d="M' + (x - 8).toFixed(1) + ' ' + (y - 8).toFixed(1) + 'L' + (x + 8).toFixed(1) + ' ' + (y + 8).toFixed(1) + 'M' + (x + 8).toFixed(1) + ' ' + (y - 8).toFixed(1) + 'L' + (x - 8).toFixed(1) + ' ' + (y + 8).toFixed(1) + '"/></g>';
    }).join('');
    const groundTruthMarkup = item.groundTruths.map(target => {
      const [x1, y1, x2, y2] = target.box;
      return '<g><rect class="diagnosis-ground-truth" x="' + x1 + '" y="' + y1 + '" width="' + (x2 - x1) + '" height="' + (y2 - y1) + '"/><text class="diagnosis-gt-label" x="' + x1 + '" y="' + Math.max(13, y1 - 4) + '">GT · ' + escapeHtml(target.className) + '</text></g>';
    }).join('');
    const predictionMarkup = item.predictions.map(prediction => {
      const [x1, y1, x2, y2] = prediction.box;
      return '<g><rect class="diagnosis-prediction" x="' + x1 + '" y="' + y1 + '" width="' + (x2 - x1) + '" height="' + (y2 - y1) + '"/><text class="diagnosis-pred-label" x="' + x1 + '" y="' + Math.max(13, y1 - 4) + '">预测 · ' + escapeHtml(prediction.className) + ' · ' + prediction.score.toFixed(2) + '</text></g>';
    }).join('') || '<text class="diagnosis-empty-label" x="310" y="22" text-anchor="end">没有预测框</text>';
    return '<svg viewBox="0 0 320 200" role="img" aria-label="目标检测教学图，显示真实标注框和模型预测框"><rect width="320" height="200" fill="#e6efec"/><rect y="126" width="320" height="74" fill="#c2dcd6"/><path d="M0 130H320M0 159H320M0 185H320" stroke="#8cb8af" stroke-width="3" opacity=".75"/>' + objectMarkup + falseObjectMarkup + groundTruthMarkup + predictionMarkup + '</svg>';
  }

  function updateDiagnosis() {
    const scene = byId('diagnosis-scene');
    const thresholdInput = byId('diagnosis-iou');
    if (!scene || !thresholdInput) return;
    const item = teachingDiagnosisCases[diagnosisIndex];
    const threshold = number(thresholdInput.value, 0.5);
    const progress = byId('diagnosis-progress');
    const thresholdValue = byId('diagnosis-iou-value');
    const prompt = byId('diagnosis-prompt');
    const feedback = byId('diagnosis-feedback');
    const counts = byId('diagnosis-counts');
    if (progress) progress.textContent = '练习 ' + (diagnosisIndex + 1) + ' / ' + teachingDiagnosisCases.length;
    if (thresholdValue) thresholdValue.textContent = threshold.toFixed(2);
    if (prompt) prompt.textContent = '观察图中的真实标注和预测结果，判断主要问题。当前匹配阈值为 IoU ≥ ' + threshold.toFixed(2) + '。';
    scene.innerHTML = diagnosisSceneMarkup(item);
    [...document.querySelectorAll('[data-diagnosis-choice]')].forEach(button => {
      button.setAttribute('aria-checked', String(button.getAttribute('data-diagnosis-choice') === diagnosisAnswer));
      button.classList?.toggle('is-selected', button.getAttribute('data-diagnosis-choice') === diagnosisAnswer);
    });
    if (!diagnosisAnswer) {
      if (feedback) feedback.textContent = '选择一个答案，查看判断依据。';
      if (counts) counts.innerHTML = '';
      return;
    }
    const result = evaluateTeachingDiagnosis(item.id, threshold);
    const correct = diagnosisAnswer === item.answer;
    if (feedback) feedback.textContent = (correct ? '判断正确。' : '再看一次：正确答案是“' + item.answer + '”。') + item.explanation;
    if (counts) counts.innerHTML = '<span>TP <b>' + result.tp + '</b></span><span>FP <b>' + result.fp + '</b></span><span>FN <b>' + result.fn + '</b></span><span>Precision <b>' + (result.precision * 100).toFixed(0) + '%</b></span><span>Recall <b>' + (result.recall * 100).toFixed(0) + '%</b></span>' + (result.classErrors ? '<span>类别错配 <b>' + result.classErrors + '</b></span>' : '');
  }

  function moveDiagnosis(direction) {
    diagnosisIndex = Math.max(0, Math.min(teachingDiagnosisCases.length - 1, diagnosisIndex + direction));
    diagnosisAnswer = '';
    updateDiagnosis();
  }

  function updateConvolution() {
    const inputControl = byId('conv-input');
    const kernelInput = byId('conv-kernel');
    const strideInput = byId('conv-stride');
    const visual = byId('conv-visual');
    const detail = byId('conv-detail');
    if (!inputControl || !kernelInput || !strideInput || !visual || !detail) return;
    const input = convolutionInputs[inputControl.value] || convolutionInputs.shape;
    const selected = kernels[kernelInput.value] || kernels.edge;
    const stride = Math.max(1, Math.floor(number(strideInput.value, 1)));
    const output = convolve(input.values, selected.values, stride);
    if (!output.length) return;
    const maxAbs = Math.max(1, ...output.flat().map(value => Math.abs(value)));
    const focusRow = Math.min(Math.max(0, convolutionFocus.row), output.length - 1);
    const focusColumn = Math.min(Math.max(0, convolutionFocus.column), output[0].length - 1);
    convolutionFocus = { row: focusRow, column: focusColumn };
    const inputTop = focusRow * stride;
    const inputLeft = focusColumn * stride;
    const inputCells = input.values.map((row, r) => row.map((value, c) => {
      const inPatch = r >= inputTop && r < inputTop + selected.values.length && c >= inputLeft && c < inputLeft + selected.values[0].length;
      return '<span class="conv-cell' + (inPatch ? ' is-active-patch' : '') + '" aria-label="像素 ' + value + '">' + value + '</span>';
    }).join('')).join('');
    const outputCells = output.map((row, r) => row.map((value, c) => {
      const active = r === focusRow && c === focusColumn;
      const intensity = Math.min(0.9, 0.12 + Math.abs(value) / maxAbs * 0.72).toFixed(2);
      return '<button type="button" class="conv-cell conv-output-cell' + (active ? ' is-selected' : '') + '" style="--cell-strength:' + intensity + '" data-conv-cell="' + r + ',' + c + '" aria-label="输出特征第 ' + (r + 1) + ' 行第 ' + (c + 1) + ' 列，数值 ' + format(value) + '">' + format(value) + '</button>';
    }).join('')).join('');
    const kernelCells = selected.values.map(row => row.map(value => '<span class="conv-cell kernel-cell">' + format(value) + '</span>').join('')).join('');
    const result = output[focusRow][focusColumn];
    const patch = input.values.slice(inputTop, inputTop + selected.values.length).map(row => row.slice(inputLeft, inputLeft + selected.values[0].length));
    const products = patch.flatMap((row, r) => row.map((value, c) => format(value) + '×' + format(selected.values[r][c])));
    const expression = products.join(' + ') + ' = ' + format(result);
    byId('conv-stride-value').textContent = String(stride);
    byId('conv-output-shape').textContent = '输出 ' + output.length + '×' + output[0].length;
    visual.innerHTML = '<div class="conv-workbench"><div><span class="conv-grid-title">输入图案 · ' + input.label + ' · 5×5</span><div class="conv-grid conv-input-grid" style="--cols:5" role="img" aria-label="' + input.label + '输入像素矩阵">' + inputCells + '</div></div>'
      + '<div class="conv-arrow" aria-hidden="true">→</div><div><span class="conv-grid-title">3×3 ' + selected.label + '核</span><div class="conv-grid kernel-grid" style="--cols:3" role="img" aria-label="' + selected.label + '卷积核">' + kernelCells + '</div></div>'
      + '<div class="conv-arrow" aria-hidden="true">→</div><div><span class="conv-grid-title">输出特征图 · ' + output.length + '×' + output[0].length + '</span><div class="conv-grid conv-output-grid" style="--cols:' + output[0].length + '" role="group" aria-label="选择一个输出像素查看计算区域">' + outputCells + '</div></div></div>';
    detail.textContent = '在“' + input.label + '”图案中，输出位置（' + (focusRow + 1) + ', ' + (focusColumn + 1) + '）读取输入第 ' + (inputTop + 1) + '–' + (inputTop + 3) + ' 行、第 ' + (inputLeft + 1) + '–' + (inputLeft + 3) + ' 列；逐项乘加：' + expression + '。';
  }

  function evaluateNmsTeachingCase(items) {
    const matched = new Set();
    let tp = 0;
    let fp = 0;
    for (const item of items.slice().sort((a, b) => b.score - a.score)) {
      const target = nmsGroundTruths.map(groundTruth => ({ groundTruth, overlap: intersectionOverUnion(item.box, groundTruth.box) }))
        .filter(candidate => !matched.has(candidate.groundTruth.id))
        .sort((a, b) => b.overlap - a.overlap)[0];
      if (target && target.overlap >= 0.5) { matched.add(target.groundTruth.id); tp++; }
      else fp++;
    }
    const fn = nmsGroundTruths.length - tp;
    const precision = tp + fp ? tp / (tp + fp) : 0;
    const recall = nmsGroundTruths.length ? tp / nmsGroundTruths.length : 0;
    return { tp, fp, fn, precision, recall, f1: precision + recall ? 2 * precision * recall / (precision + recall) : 0 };
  }

  function evaluateWalkthroughClass(classInfo, iouThreshold) {
    const matched = new Set();
    let tp = 0;
    let fp = 0;
    const records = classInfo.predictions.slice().sort((a, b) => b.score - a.score).map((prediction, index) => {
      const correct = prediction.targetId != null && prediction.iou >= iouThreshold && !matched.has(prediction.targetId);
      if (correct) { matched.add(prediction.targetId); tp++; }
      else fp++;
      const precision = tp / (tp + fp);
      const recall = tp / classInfo.groundTruthCount;
      const reason = correct ? 'TP：匹配到尚未匹配的真实框'
        : prediction.targetId != null && matched.has(prediction.targetId) && prediction.iou >= iouThreshold ? 'FP：该真实框已被更高置信度预测匹配'
          : prediction.targetId != null && prediction.iou < iouThreshold ? 'FP：IoU 低于匹配阈值'
            : 'FP：没有匹配的真实框';
      return { ...prediction, index, tp, fp, precision, recall, correct, reason };
    });
    const area = yoloAveragePrecision(records.map(item => item.recall), records.map(item => item.precision));
    return { records, ap: area.ap, mrec: area.mrec, mpre: area.mpre };
  }

  function updateMapWalkthrough() {
    const classInput = byId('map-walk-class');
    const iouInput = byId('map-walk-iou');
    const predictions = byId('map-walk-predictions');
    const detail = byId('map-walk-detail');
    const position = byId('map-walk-position');
    const summary = byId('map-walk-summary');
    if (!classInput || !iouInput || !predictions || !detail || !position || !summary) return;
    const classInfo = mapWalkthroughClasses.find(item => item.key === classInput.value) || mapWalkthroughClasses[0];
    const iou = number(iouInput.value, 0.5);
    const result = evaluateWalkthroughClass(classInfo, iou);
    mapWalkthroughStep = Math.max(0, Math.min(mapWalkthroughStep, result.records.length - 1));
    const current = result.records[mapWalkthroughStep];
    const percent = value => (value * 100).toFixed(1) + '%';
    byId('map-walk-iou-value').textContent = iou.toFixed(2);
    predictions.innerHTML = result.records.map((item, index) => '<li class="map-walk-row' + (index === mapWalkthroughStep ? ' is-current' : '') + (item.correct ? ' is-tp' : ' is-fp') + '"><button type="button" data-map-step-index="' + index + '" aria-current="' + String(index === mapWalkthroughStep) + '"><span>#' + (index + 1) + ' · ' + item.score.toFixed(2) + '</span><b>' + (item.correct ? 'TP' : 'FP') + '</b><span>IoU ' + item.iou.toFixed(2) + '</span><span>P ' + percent(item.precision) + ' · R ' + percent(item.recall) + '</span></button></li>').join('');
    position.textContent = '第 ' + (mapWalkthroughStep + 1) + ' / ' + result.records.length + ' 个框';
    detail.textContent = '置信度 ' + current.score.toFixed(2) + ' · IoU ' + current.iou.toFixed(2) + ' · ' + current.reason + '。累计 TP ' + current.tp + '、FP ' + current.fp + '；Precision ' + percent(current.precision) + '，Recall ' + percent(current.recall) + '。';
    const classResults = mapWalkthroughClasses.map(item => {
      const ap50 = evaluateWalkthroughClass(item, 0.5).ap;
      const ap5095 = yoloV5IouThresholds.reduce((sum, threshold) => sum + evaluateWalkthroughClass(item, threshold).ap, 0) / yoloV5IouThresholds.length;
      return { ...item, ap50, ap5095 };
    });
    const meanAp50 = classResults.reduce((sum, item) => sum + item.ap50, 0) / classResults.length;
    const meanAp5095 = classResults.reduce((sum, item) => sum + item.ap5095, 0) / classResults.length;
    summary.innerHTML = '<div class="map-walk-ap-rows">' + classResults.map(item => '<span><b>' + escapeHtml(item.label) + '</b><i>AP@0.50 ' + percent(item.ap50) + '</i><i>AP@0.50:0.95 ' + percent(item.ap5095) + '</i></span>').join('') + '</div><strong>mAP@0.50 ' + percent(meanAp50) + ' · mAP@0.50:0.95 ' + percent(meanAp5095) + '</strong>';
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
    const groundTruthBoxes = nmsGroundTruths.map(item => {
      const [x, y, x2, y2] = item.box;
      return '<g class="nms-ground-truth"><rect x="' + x + '" y="' + y + '" width="' + (x2 - x) + '" height="' + (y2 - y) + '" rx="4"/><text x="' + (x + 4) + '" y="' + (y + 13) + '">' + item.id + ' · 标注框</text></g>';
    }).join('');
    const boxes = candidates.map(item => {
      const [x, y, x2, y2] = item.box;
      const state = kept.has(item.id) ? 'kept' : suppressed.has(item.id) ? 'suppressed' : 'filtered';
      const reason = state === 'kept' ? '保留' : state === 'suppressed' ? 'IoU ' + format(suppressed.get(item.id).overlap) + ' · 被抑制' : '低于置信度';
      return '<g class="nms-box nms-' + state + '"><rect x="' + x + '" y="' + y + '" width="' + (x2 - x) + '" height="' + (y2 - y) + '" rx="4"/><rect class="nms-label-bg" x="' + x + '" y="' + Math.max(16, y - 24) + '" width="148" height="20" rx="3"/><text x="' + (x + 5) + '" y="' + (Math.max(16, y - 24) + 14) + '">' + item.id + ' · ' + item.score.toFixed(2) + ' · ' + reason + '</text></g>';
    }).join('');
    visual.innerHTML = '<svg viewBox="0 0 480 290" role="img" aria-label="虚线框为标注，实线框显示 NMS 处理后的预测结果"><defs><pattern id="nms-grid" width="20" height="20" patternUnits="userSpaceOnUse"><path d="M20 0H0V20" stroke="#dedbd1" stroke-width=".7"/></pattern></defs><rect width="480" height="290" fill="url(#nms-grid)"/><path d="M24 254H456M42 270H128M300 270H430" stroke="#b8c8b9" stroke-width="4" stroke-linecap="round"/><circle cx="138" cy="94" r="19" fill="#d9dfd1"/><path d="M120 117Q138 103 156 117L170 218H108Z" fill="#d9dfd1"/><circle cx="352" cy="120" r="15" fill="#d9dfd1"/><path d="M338 139Q352 129 366 139L378 226H326Z" fill="#d9dfd1"/>' + groundTruthBoxes + boxes + '</svg>';
    const metrics = evaluateNmsTeachingCase(result.kept);
    const percent = value => (value * 100).toFixed(1) + '%';
    summary.textContent = '置信度筛选后剩余 ' + (candidates.length - result.filtered.length) + ' 个候选框；NMS 抑制 ' + result.suppressed.length + ' 个重叠框，最终保留 ' + result.kept.length + ' 个。';
    byId('nms-metric-summary').textContent = '教学样例匹配结果：TP ' + metrics.tp + ' · FP ' + metrics.fp + ' · FN ' + metrics.fn + '　P ' + percent(metrics.precision) + ' · R ' + percent(metrics.recall) + ' · F1 ' + percent(metrics.f1);
    const steps = ['置信度筛选：移除 ' + (result.filtered.map(item => item.id).join('、') || '无低分框') + '。'];
    for (const item of result.kept) {
      steps.push('保留 ' + item.id + '（置信度 ' + item.score.toFixed(2) + '），作为当前最高分框。');
      for (const suppressedItem of result.suppressed.filter(candidate => candidate.suppressedBy === item.id)) {
        steps.push('抑制 ' + suppressedItem.id + '：与 ' + item.id + ' 的 IoU 为 ' + suppressedItem.overlap.toFixed(2) + '，高于阈值 ' + overlap.toFixed(2) + '。');
      }
    }
    byId('nms-step-list').innerHTML = steps.map(step => '<li>' + escapeHtml(step) + '</li>').join('');
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
    if (dataMode) dataMode.textContent = importedYoloV5Evaluation ? '真实 YOLOv5 验证结果' : '合成教学样例';
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
    window.detectionPipeline?.initialize();
    updateGradient();
    updateConvolution();
    updateAugmentation();
    updateDiagnosis();
    updateNms();
    updateMapWalkthrough();
    updateMetrics();
    updateSwimV9History();
  }

  window.VisionLabMath = {
    gradientDescent, linearNeuronStep, linearNeuronTraining, transformAugmentationBox, evaluateTeachingDiagnosis,
    convolve, intersectionOverUnion, nonMaximumSuppression, evaluateDetectionMetrics,
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
    const diagnosisChoice = event.target.closest('[data-diagnosis-choice]');
    if (diagnosisChoice) { diagnosisAnswer = diagnosisChoice.getAttribute('data-diagnosis-choice'); updateDiagnosis(); return; }
    const diagnosisNav = event.target.closest('[data-diagnosis-nav]');
    if (diagnosisNav) { moveDiagnosis(diagnosisNav.getAttribute('data-diagnosis-nav') === 'next' ? 1 : -1); return; }
    const mapStep = event.target.closest('[data-map-step]');
    if (mapStep) {
      const selectedClass = mapWalkthroughClasses.find(item => item.key === byId('map-walk-class').value) || mapWalkthroughClasses[0];
      mapWalkthroughStep += mapStep.dataset.mapStep === 'next' ? 1 : -1;
      mapWalkthroughStep = Math.max(0, Math.min(mapWalkthroughStep, selectedClass.predictions.length - 1));
      updateMapWalkthrough();
      return;
    }
    const mapStepIndex = event.target.closest('[data-map-step-index]');
    if (mapStepIndex) {
      mapWalkthroughStep = number(mapStepIndex.dataset.mapStepIndex, 0);
      updateMapWalkthrough();
      return;
    }
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
    if (event.target.id === 'augmentation-mode' || event.target.id === 'augmentation-strength') updateAugmentation();
    if (event.target.id === 'diagnosis-iou') updateDiagnosis();
    if (event.target.id === 'conv-input' || event.target.id === 'conv-kernel' || event.target.id === 'conv-stride') { convolutionFocus = { row: 1, column: 1 }; updateConvolution(); }
    if (event.target.id === 'nms-confidence' || event.target.id === 'nms-iou') updateNms();
    if (event.target.id === 'map-walk-class') { mapWalkthroughStep = 0; updateMapWalkthrough(); }
    if (event.target.id === 'map-walk-iou') updateMapWalkthrough();
    if (event.target.id === 'metric-class' || event.target.id === 'metric-confidence' || event.target.id === 'metric-iou') updateMetrics();
    if (event.target.id === 'swim-history-metric' || event.target.id === 'swim-history-epoch') updateSwimV9History();
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
