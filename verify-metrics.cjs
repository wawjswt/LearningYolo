const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');

const window = {};
const listeners = [];
const elements = new Map();
const document = {
  addEventListener(type, listener) { listeners.push({ type, listener }); },
  getElementById(id) { return elements.get(id) || null; },
  querySelector() { return null; },
  querySelectorAll() { return []; },
};
function fakeElement(id, value = '') {
  return { id, value, textContent: '', innerHTML: '', files: [], closest() { return null; } };
}
for (const id of [
  'metric-class', 'metric-confidence', 'metric-iou', 'metric-pr-chart', 'metric-f1-chart', 'metric-map-breakdown',
  'metric-formulas', 'metric-count-note', 'metric-reading-note', 'metric-pr-caption', 'metric-f1-caption',
  'metric-data-mode', 'metric-data-status', 'metric-data-description', 'metric-confidence-value', 'metric-iou-value',
  'metric-point-summary', 'metric-precision', 'metric-recall', 'metric-f1', 'metric-best-f1', 'metric-map-summary',
  'metric-import-file',
]) elements.set(id, fakeElement(id, ({ 'metric-class': 'all', 'metric-confidence': '0.70', 'metric-iou': '0.50' })[id] || ''));
const context = vm.createContext({ window, document, console, setTimeout, clearTimeout });
vm.runInContext(fs.readFileSync('dist/textbook-lab.js', 'utf8'), context, { filename: 'textbook-lab.js' });
const math = window.VisionLabMath;
assert.equal(typeof math?.evaluateDetectionMetrics, 'function');
assert.equal(typeof math?.evaluateYoloV5Evaluation, 'function');

function createMetricPredictions(classCounts) {
  return classCounts.flatMap(({ name, tp, fp }) => [
    ...Array.from({ length: tp }, (_, index) => ({
      className: name, score: 0.9, targetId: `${name}-target-${index}`, iou: 1,
    })),
    ...Array.from({ length: fp }, (_, index) => ({
      className: name, score: 0.8, targetId: `${name}-false-${index}`, iou: 0,
    })),
  ]);
}

function createYoloV5MetricFixture(classCounts) {
  return {
    format: 'visionlab-yolov5-eval-v1',
    source: { model: 'fixture.pt', dataset: 'fixture.yaml', split: 'val', imageSize: 640, nmsIou: 0.6 },
    iouThresholds: Array.from({ length: 10 }, (_, index) => Number((0.5 + index * 0.05).toFixed(2))),
    classes: classCounts.map((item, id) => ({ id, name: item.name, groundTruthCount: item.tp + item.fn })),
    predictions: classCounts.flatMap((item, classId) => [
      ...Array.from({ length: item.tp }, () => ({ classId, confidence: 0.9, correct: Array(10).fill(true) })),
      ...Array.from({ length: item.fp }, () => ({ classId, confidence: 0.8, correct: Array(10).fill(false) })),
    ]),
  };
}

function assertPoint(result, counts, values, label) {
  assert.deepEqual(
    { tp: result.operatingPoint.tp, fp: result.operatingPoint.fp, fn: result.operatingPoint.fn },
    counts,
    `${label}: class counts must remain summed totals`,
  );
  assert.deepEqual(
    { precision: result.operatingPoint.precision, recall: result.operatingPoint.recall, f1: result.operatingPoint.f1 },
    values,
    `${label}: P/R/F1 must follow the class averaging rule`,
  );
}

async function verifyMetricUi() {
const sample = math.evaluateDetectionMetrics([
  { className: 'cat', score: 0.9, targetId: 'cat-1', iou: 0.8 },
  { className: 'dog', score: 0.85, targetId: 'dog-1', iou: 0.4 },
  { className: 'cat', score: 0.8, targetId: 'cat-2', iou: 0.7 },
  { className: 'cat', score: 0.7, targetId: 'cat-1', iou: 0.9 },
], { cat: 2, dog: 1 }, { confidenceThreshold: 0.75, iouThreshold: 0.5, className: 'all' });
assertPoint(sample, { tp: 2, fp: 1, fn: 1 }, { precision: 0.5, recall: 0.5, f1: 0.5 }, 'synthetic sample');
assert.ok(Math.abs(sample.map50 - 0.5) < 1e-9, 'synthetic AP@0.50 must remain unchanged');
assert.ok(Math.abs(sample.map5095 - 641 / 2020) < 1e-9, 'synthetic mAP@0.50:0.95 must remain unchanged');

const singleClass = math.evaluateDetectionMetrics([
  { className: 'cat', score: 0.9, targetId: 'cat-1', iou: 0.8 },
  { className: 'cat', score: 0.8, targetId: 'cat-2', iou: 0.7 },
], { cat: 2, dog: 1 }, { confidenceThreshold: 0.75, iouThreshold: 0.5, className: 'cat' });
assertPoint(singleClass, { tp: 2, fp: 0, fn: 0 }, { precision: 1, recall: 1, f1: 1 }, 'single class');

const unbalancedClasses = [{ name: 'large', tp: 90, fp: 10, fn: 10 }, { name: 'small', tp: 1, fp: 9, fn: 9 }];
const syntheticUnbalanced = math.evaluateDetectionMetrics(
  createMetricPredictions(unbalancedClasses), { large: 100, small: 10 },
  { confidenceThreshold: 0.5, iouThreshold: 0.5, className: 'all' },
);
const importedUnbalanced = math.evaluateYoloV5Evaluation(
  math.normalizeYoloV5Evaluation(createYoloV5MetricFixture(unbalancedClasses)),
  { confidenceThreshold: 0.5, iouThreshold: 0.5, className: 'all' },
);
for (const [label, result] of [['synthetic', syntheticUnbalanced], ['imported', importedUnbalanced]]) {
  assertPoint(result, { tp: 91, fp: 19, fn: 19 }, { precision: 0.5, recall: 0.5, f1: 0.5 }, label);
  const nearHalfRecall = result.prCurve.reduce((best, point) => (
    Math.abs(point.recall - 0.5) < Math.abs(best.recall - 0.5) ? point : best
  ), result.prCurve[0]);
  const classPrecisions = unbalancedClasses.map((item, index) => {
    const singleClass = label === 'synthetic'
      ? math.evaluateDetectionMetrics(createMetricPredictions([item]), { [item.name]: item.tp + item.fn }, { confidenceThreshold: 0.5, iouThreshold: 0.5, className: item.name })
      : math.evaluateYoloV5Evaluation(math.normalizeYoloV5Evaluation(createYoloV5MetricFixture([item])), { confidenceThreshold: 0.5, iouThreshold: 0.5, className: String(index) });
    return singleClass.prCurve.reduce((best, point) => (
      Math.abs(point.recall - nearHalfRecall.recall) < Math.abs(best.recall - nearHalfRecall.recall) ? point : best
    ), singleClass.prCurve[0]).precision;
  });
  const expectedMacroPrecision = classPrecisions.reduce((sum, value) => sum + value, 0) / classPrecisions.length;
  assert.ok(Math.abs(nearHalfRecall.precision - expectedMacroPrecision) < 1e-12, `${label}: all-class PR curve should average per-class precision envelopes`);
}
const syntheticAtPoint = syntheticUnbalanced.confidenceCurve.find(point => point.threshold === 0.8);
assert.deepEqual(
  { precision: syntheticAtPoint.precision, recall: syntheticAtPoint.recall, f1: syntheticAtPoint.f1 },
  { precision: 0.5, recall: 0.5, f1: 0.5 },
  'synthetic confidence samples should plot the macro working point at each threshold',
);

const f1Counterexample = [{ name: 'high-precision', tp: 9, fp: 1, fn: 81 }, { name: 'high-recall', tp: 9, fp: 81, fn: 1 }];
for (const [label, result] of [
  ['synthetic', math.evaluateDetectionMetrics(createMetricPredictions(f1Counterexample), { 'high-precision': 90, 'high-recall': 10 }, { confidenceThreshold: 0.5, iouThreshold: 0.5 })],
  ['imported', math.evaluateYoloV5Evaluation(math.normalizeYoloV5Evaluation(createYoloV5MetricFixture(f1Counterexample)), { confidenceThreshold: 0.5, iouThreshold: 0.5 })],
]) {
  assert.equal(result.operatingPoint.precision, 0.5, `${label}: macro precision should average class precision`);
  assert.equal(result.operatingPoint.recall, 0.5, `${label}: macro recall should average class recall`);
  assert.ok(Math.abs(result.operatingPoint.f1 - 0.18) < 1e-12, `${label}: macro F1 must be mean(class F1), not the harmonic mean of macro P and R`);
}

const missingClass = math.evaluateDetectionMetrics(
  [{ className: 'cat', score: 0.9, targetId: 'cat-1', iou: 1 }],
  { cat: 1, dog: 1 }, { confidenceThreshold: 0.5, iouThreshold: 0.5 },
);
assertPoint(missingClass, { tp: 1, fp: 0, fn: 1 }, { precision: 0.5, recall: 0.5, f1: 0.5 }, 'labeled class with no predictions');
const noPredictions = math.evaluateDetectionMetrics([], { cat: 1, dog: 1 }, { confidenceThreshold: 0.99, iouThreshold: 0.5 });
assertPoint(noPredictions, { tp: 0, fp: 0, fn: 2 }, { precision: 0, recall: 0, f1: 0 }, 'no predictions');
const importedFixture = {
  format: 'visionlab-yolov5-eval-v1',
  source: { model: 'best.pt', dataset: 'fixture.yaml', split: 'val', imageSize: 640, nmsIou: 0.6 },
  iouThresholds: Array.from({ length: 10 }, (_, index) => Number((0.5 + index * 0.05).toFixed(2))),
  classes: [{ id: 0, name: 'cat', groundTruthCount: 2 }, { id: 1, name: 'dog', groundTruthCount: 1 }],
  predictions: [
    { classId: 0, confidence: 0.9, correct: Array.from({ length: 10 }, (_, index) => index < 9) },
    { classId: 0, confidence: 0.8, correct: Array(10).fill(false) },
    { classId: 0, confidence: 0.7, correct: Array.from({ length: 10 }, (_, index) => index < 5) },
    { classId: 1, confidence: 0.95, correct: Array(10).fill(false) },
    { classId: 1, confidence: 0.6, correct: Array(10).fill(true) },
  ],
};
const importedSample = math.evaluateYoloV5Evaluation(math.normalizeYoloV5Evaluation(importedFixture), { confidenceThreshold: 0.75, iouThreshold: 0.5 });
assertPoint(importedSample, { tp: 1, fp: 2, fn: 2 }, { precision: 0.25, recall: 0.25, f1: 0.25 }, 'imported YOLOv5 sample');
assert.ok(Math.abs(importedSample.map50 - 2 / 3) < 0.01, 'imported YOLOv5 AP@0.50 must retain its existing interpolation');
const strictImported = math.evaluateYoloV5Evaluation(math.normalizeYoloV5Evaluation(importedFixture), { confidenceThreshold: 0.65, iouThreshold: 0.75, className: '0' });
assert.deepEqual(
  { tp: strictImported.operatingPoint.tp, fp: strictImported.operatingPoint.fp, fn: strictImported.operatingPoint.fn },
  { tp: 1, fp: 2, fn: 1 },
  'single-class imported metrics should keep the exact stricter-IoU match counts',
);
assert.deepEqual(
  { precision: strictImported.operatingPoint.precision, recall: strictImported.operatingPoint.recall, f1: strictImported.operatingPoint.f1 },
  { precision: 1 / 3, recall: 0.5, f1: 0.4 },
  'single-class imported P/R/F1 should use the ordinary formulas on that class',
);
const importedEmptyPoint = math.evaluateYoloV5Evaluation(math.normalizeYoloV5Evaluation(importedFixture), { confidenceThreshold: 1, iouThreshold: 0.95 });
assertPoint(importedEmptyPoint, { tp: 0, fp: 0, fn: 3 }, { precision: 0, recall: 0, f1: 0 }, 'imported no predictions');
const exactIouBoundary = math.evaluateDetectionMetrics(
  [{ className: 'cat', score: 0.9, targetId: 'cat-1', iou: 0.95 }],
  { cat: 1 }, { confidenceThreshold: 0.5, iouThreshold: 0.95 },
);
assertPoint(exactIouBoundary, { tp: 1, fp: 0, fn: 0 }, { precision: 1, recall: 1, f1: 1 }, 'exact IoU boundary');

  const change = listeners.find(item => item.type === 'change').listener;
  const click = listeners.find(item => item.type === 'click').listener;
  const dispatchInput = (id, value) => {
    const target = elements.get(id);
    target.value = value;
    listeners.find(item => item.type === 'input').listener({ target });
  };

  dispatchInput('metric-class', 'all');
  assert.match(elements.get('metric-point-summary').textContent, /全部类别宏平均 · 各类别数量合计 TP/);
  assert.match(elements.get('metric-formulas').innerHTML, /P<sub>macro<\/sub>=mean/);
  assert.match(elements.get('metric-formulas').innerHTML, /F1<sub>macro<\/sub>=mean/);
  assert.match(elements.get('metric-count-note').textContent, /各类别数量合计.*微平均.*不是/);
  assert.match(elements.get('metric-reading-note').innerHTML, /A 类.*B 类.*宏平均各为 0\.5.*微平均/);
  assert.match(elements.get('metric-reading-note').innerHTML, /宏平均 F1=0\.18/);
  assert.match(elements.get('metric-pr-caption').textContent, /各类别精度包络.*离散工作点/);
  assert.match(elements.get('metric-f1-caption').textContent, /逐类统计.*精确计数/);
  for (const threshold of ['0', '0.5', '0.95', '1']) {
    dispatchInput('metric-confidence', threshold);
    assert.match(elements.get('metric-precision').textContent, /^\d+\.\d%$/);
    assert.match(elements.get('metric-recall').textContent, /^\d+\.\d%$/);
    assert.match(elements.get('metric-f1').textContent, /^\d+\.\d%$/);
  }
  for (const threshold of ['0.5', '0.95']) {
    dispatchInput('metric-iou', threshold);
    assert.match(elements.get('metric-f1').textContent, /^\d+\.\d%$/);
  }

  dispatchInput('metric-class', 'pedestrian');
  assert.match(elements.get('metric-point-summary').textContent, /^行人 · TP/);
  assert.doesNotMatch(elements.get('metric-point-summary').textContent, /数量合计/);
  assert.match(elements.get('metric-formulas').innerHTML, /单类别：.*Precision=TP/);
  assert.match(elements.get('metric-count-note').textContent, /只统计所选类别/);
  assert.match(elements.get('metric-pr-caption').textContent, /所选类别的精度包络/);

  const fileInput = elements.get('metric-import-file');
  fileInput.files = [{ size: 300, text: async () => JSON.stringify(createYoloV5MetricFixture(unbalancedClasses)) }];
  fileInput.value = 'selected';
  await change({ target: fileInput });
  assert.equal(elements.get('metric-data-mode').textContent, '真实 YOLOv5 验证结果');
  assert.match(elements.get('metric-point-summary').textContent, /全部类别宏平均 · 各类别数量合计 TP/);
  assert.match(elements.get('metric-formulas').innerHTML, /F1<sub>macro<\/sub>=mean/);
  assert.match(elements.get('metric-f1-caption').textContent, /YOLOv5.*1000 个置信度样本.*精确计数/);

  click({ target: { closest(selector) { return selector === '[data-metric-reset]' ? {} : null; } } });
  assert.equal(elements.get('metric-data-mode').textContent, '合成教学样例');
  assert.match(elements.get('metric-point-summary').textContent, /全部类别宏平均 · 各类别数量合计 TP/);
  console.log('Metric math and UI verified: macro averages, per-class counts, curve semantics, single-class formulas, import and reset behavior, and unchanged AP.');
}

verifyMetricUi().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
