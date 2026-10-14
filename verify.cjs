const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');

const listeners = [];
const content = { innerHTML: '' };
const crumb = { textContent: '' };
const search = { addEventListener() {} };
const sidebar = { classList: { remove() {} } };
const progressRoot = { attributes: {}, setAttribute(name, value) { this.attributes[name] = value; } };
const progressFill = { style: {} };
const windowListeners = [];
function fakeElement(id = '', value = '') {
  return {
    id, value, textContent: '', innerHTML: '', hidden: false, tabIndex: 0, attributes: {},
    dataset: {},
    setAttribute(name, next) { this.attributes[name] = next; },
    getAttribute(name) { return this.attributes[name] || null; },
    matches() { return false; },
    focus() { this.focused = true; },
  };
}
const elements = { '#content': content, '#crumb': crumb, '#search': search, '.sidebar': sidebar, '#reading-progress': progressRoot, '#reading-progress-fill': progressFill };
for (const [id, value] of Object.entries({
  'box-x': '140', 'box-y': '110', 'prediction-box': '', 'prediction-label': '', 'x-label': '', 'y-label': '', 'iou-value': '', 'iou-detail': '',
  'gradient-lr': '0.5', 'gradient-steps': '4', 'gradient-lr-value': '', 'gradient-steps-value': '',
  'gradient-chart': '', 'gradient-explanation': '', 'gradient-result': '',
  'conv-kernel': 'edge', 'conv-visual': '', 'conv-detail': '',
  'nms-confidence': '0.3', 'nms-iou': '0.5', 'nms-confidence-value': '', 'nms-iou-value': '',
  'nms-visual': '', 'nms-summary': '',
  'metric-class': 'all', 'metric-confidence': '0.70', 'metric-iou': '0.50',
  'metric-confidence-value': '', 'metric-iou-value': '', 'metric-point-summary': '',
  'metric-precision': '', 'metric-recall': '', 'metric-f1': '', 'metric-best-f1': '',
  'metric-pr-chart': '', 'metric-f1-chart': '', 'metric-map-summary': '', 'metric-map-breakdown': '',
})) elements[`#${id}`] = fakeElement(id, value);
const labTabs = ['iou', 'gradient', 'convolution', 'nms', 'metrics'].map(id => {
  const tab = fakeElement();
  tab.dataset.labTab = id;
  tab.attributes['aria-selected'] = 'false';
  tab.attributes.tabindex = '-1';
  return tab;
});
const labPanels = ['iou', 'gradient', 'convolution', 'nms', 'metrics'].map(id => {
  const panel = fakeElement();
  panel.dataset.labPanel = id;
  return panel;
});
const convolutionCells = Array.from({ length: 9 }, (_, index) => {
  const cell = fakeElement();
  cell.dataset.convCell = `${Math.floor(index / 3)},${index % 3}`;
  return cell;
});
const location = { hash: '#courses', pathname: '/', search: '' };
const sectionPositions = { 'section-1': 90, 'section-2': 450, 'chapter-review': 1000, 'chapter-notes': 1500 };
const sections = Object.entries(sectionPositions).map(([id, position]) => ({
  id,
  getBoundingClientRect() { return { top: position - window.scrollY }; },
}));
function tocLink(id) {
  const attributes = { href: `#${id}` };
  const classes = new Set();
  return {
    attributes,
    classes,
    getAttribute(name) { return attributes[name] || null; },
    setAttribute(name, value) { attributes[name] = value; },
    removeAttribute(name) { delete attributes[name]; },
    classList: { toggle(name, enabled) { if (enabled) classes.add(name); else classes.delete(name); } },
  };
}
const tocLinks = Object.keys(sectionPositions).map(tocLink);
const document = {
  title: '',
  querySelector(selector) { return elements[selector] || null; },
  querySelectorAll(selector) {
    if (selector === '[data-lab-tab]') return labTabs;
    if (selector === '[data-lab-panel]') return labPanels;
    if (selector === '[data-conv-cell]') return convolutionCells;
    if (selector === '.text-section[id^="section-"], #chapter-review, #chapter-notes') return sections;
    if (selector === '.chapter-toc a') return tocLinks;
    return [];
  },
  documentElement: { scrollHeight: 2400 },
  getElementById(id) { return elements[`#${id}`] || null; },
  addEventListener(type, listener, options) { listeners.push({ type, listener, capture: options === true || options?.capture === true }); },
};
const window = {
  innerHeight: 800,
  scrollY: 0,
  addEventListener(type, listener) { windowListeners.push({ type, listener }); },
  removeEventListener(type, listener) {
    const index = windowListeners.findIndex(item => item.type === type && item.listener === listener);
    if (index >= 0) windowListeners.splice(index, 1);
  },
  matchMedia() { return { matches: false }; },
  scrollTo() {},
};
const context = vm.createContext({
  document,
  window,
  location,
  history: { pushState(_state, _title, url) { location.hash = url.slice(url.indexOf('#')); } },
  localStorage: { getItem() { return null; }, setItem() {} },
  navigator: { clipboard: { writeText: async () => {} } },
  setTimeout,
  clearTimeout,
  console,
});

for (const file of ['data.js', 'textbook-figures.js', 'textbook-v2.js', 'textbook-app.js', 'textbook-lab.js', 'textbook-ui-v3.js']) {
  vm.runInContext(fs.readFileSync(`dist/${file}`, 'utf8'), context, { filename: file });
}

const lessons = vm.runInContext('lessons', context);
assert.equal(lessons.length, 24);
assert.equal(new Set(lessons.map(lesson => lesson.id)).size, 24);
for (const group of ['dl', 'cv', 'yolo']) assert.equal(lessons.filter(lesson => lesson.group === group).length, 8);
for (const lesson of lessons) {
  assert.ok(lesson.sections.length >= 3, `${lesson.id} should have detailed sections`);
  assert.ok(lesson.code.trim(), `${lesson.id} should include a code example`);
  assert.ok(lesson.quiz.answer >= 0 && lesson.quiz.answer < lesson.quiz.options.length, `${lesson.id} should have a valid quiz answer`);
  const page = context.window.lesson(lesson.id);
  assert.match(page, new RegExp(`<figure class="chapter-concept-figure" data-visual="${lesson.visual}"`), `${lesson.id} should have a chapter-specific concept figure`);
  assert.match(page, /<figure class="chapter-concept-figure"[^>]*tabindex="0"/, `${lesson.id} figure should be keyboard scrollable on narrow screens`);
  assert.match(page, /<svg[^>]+aria-labelledby="[^"]+"[\s\S]*?<title id="[^"]+">[\s\S]*?<desc id="[^"]+">/, `${lesson.id} figure should explain its visual to assistive technology`);
  assert.match(page, /<section class="text-section" id="section-\d+">[\s\S]*?<figure class="chapter-concept-figure"/, `${lesson.id} figure should sit beside its related explanation`);
}
const readingPage = context.window.lesson('iou');
assert.match(readingPage, /class="reading-progress"[^>]*role="progressbar"/, 'lesson pages should expose an accessible reading progress bar');
assert.match(readingPage, /id="reading-progress-fill"/, 'lesson pages should contain a progress indicator');
const textbookCss = fs.readFileSync('dist/textbook-v3.css', 'utf8');
assert.match(textbookCss, /@keyframes textbook-enter/, 'page sections should use the restrained entrance animation');
assert.match(textbookCss, /prefers-reduced-motion:\s*reduce/, 'motion should respect the reduced-motion preference');
assert.match(textbookCss, /\.lab-canvas svg pattern path,\.nms-visual svg pattern path\{fill:none\}/, 'open SVG grid paths should not fill triangular cells');
assert.match(textbookCss, /\.chapter-toc a\.is-current/, 'the current reading section should be highlighted in the table of contents');
assert.match(textbookCss, /\.metric-pr-line[\s\S]*\.metric-f1-line/, 'the metric charts should have separate readable curve styles');
assert.match(textbookCss, /\.metric-ap-bar\.ap5095/, 'the mAP breakdown should distinguish AP@0.50 from AP@0.50:0.95');
assert.match(textbookCss, /@media\(max-width:600px\)\{\.metric-intro-card/, 'the metric lab should adapt to narrow screens');
assert.match(textbookCss, /@media\(prefers-reduced-motion:reduce\)\{\.metric-chart svg/, 'chart motion should respect reduced-motion preferences');
const manifest = JSON.parse(fs.readFileSync('.openai/hosting.json', 'utf8'));
assert.equal(manifest.static.directory, 'dist');
const html = fs.readFileSync('dist/index.html', 'utf8');
assert.match(html, /href="textbook-v3\.css"/);
assert.match(html, /src="textbook-ui-v3\.js"/);
assert.match(html, /src="textbook-figures\.js"/);
assert.match(html, /src="textbook-lab\.js"/);
for (const file of ['index.html', 'style.css', 'app.js', 'data.js', 'textbook-app.js', 'textbook-figures.js', 'textbook-lab.js', 'textbook-ui-v3.js', 'textbook-v2.js', 'textbook-v3.css']) {
  assert.ok(fs.statSync(`dist/${file}`).size > 0, `${file} should be present`);
}

function clickCourseFilter(group) {
  const destination = group === 'all' ? '#courses' : `#courses/${group}`;
  const anchor = { getAttribute(name) { return name === 'href' ? destination : null; } };
  const handler = listeners.find(item => item.type === 'click' && item.capture);
  assert.ok(handler, 'course filters should use the shared in-page navigation handler');
  handler.listener({
    target: { closest(selector) { return selector === 'a[href^="#"]' ? anchor : null; } },
    preventDefault() {},
  });
}

for (const group of ['dl', 'cv', 'yolo']) {
  assert.match(content.innerHTML, new RegExp(`href="#courses/${group}"`), `${group} filter should be a navigable link`);
  clickCourseFilter(group);
  assert.equal(location.hash, `#courses/${group}`);
  assert.match(content.innerHTML, /共 8 章/);
}

clickCourseFilter('all');
assert.equal(location.hash, '#courses');
assert.match(content.innerHTML, /共 24 章/);
location.hash = '#lesson/iou';
context.window.render();
assert.equal(progressRoot.attributes['aria-valuenow'], '0', 'reading progress should initialize at the top of a lesson');
assert.ok(tocLinks[0].classes.has('is-current'), 'the first section should be active at the top of a lesson');
window.scrollY = 650;
windowListeners.find(item => item.type === 'scroll').listener();
assert.equal(progressRoot.attributes['aria-valuenow'], '41', 'reading progress should follow page scrolling');
assert.ok(tocLinks[1].classes.has('is-current'), 'the active table-of-contents item should follow the visible section');
assert.equal(tocLinks[1].attributes['aria-current'], 'location', 'the current section should be announced to assistive technology');

location.hash = '#lab';
context.window.render();
assert.equal(typeof context.window.VisionLabMath?.evaluateDetectionMetrics, 'function', 'the metrics lab should expose detection metric calculations');
const labPage = content.innerHTML;
assert.match(labPage, /role="tablist"/, 'the experiment lab should expose an accessible experiment selector');
for (const experiment of ['iou', 'gradient', 'convolution', 'nms']) {
  assert.match(labPage, new RegExp(`data-lab-tab="${experiment}"`), `${experiment} should be available in the experiment lab`);
  assert.match(labPage, new RegExp(`id="lab-panel-${experiment}"`), `${experiment} should have a dedicated panel`);
}
assert.match(labPage, /data-lab-tab="metrics"/, 'the lab should include a detector metrics experiment');
assert.match(labPage, /id="metric-pr-chart"[\s\S]*id="metric-f1-chart"[\s\S]*class="metric-ap-legend"[\s\S]*id="metric-map-breakdown"/, 'the metrics experiment should include PR, F1, and labeled mAP visualizations');
assert.match(labPage, /href="#lesson\/metrics"/, 'the metrics experiment should link back to its textbook chapter');
for (const lessonId of ['iou', 'optimizer', 'cnn', 'metrics']) {
  assert.ok(lessons.some(lesson => lesson.id === lessonId), `${lessonId} should be a real textbook chapter`);
  assert.ok(labPage.includes(`href="#lesson/${lessonId}"`), `the experiment lab should link to the existing ${lessonId} chapter`);
}

const labMath = context.window.VisionLabMath;
assert.ok(labMath, 'the experiment lab should expose its real calculations to the page');
assert.equal(typeof labMath.evaluateDetectionMetrics, 'function', 'the metrics lab should expose its detection metric calculations');
const sampleMetrics = labMath.evaluateDetectionMetrics([
  { className: 'cat', score: 0.9, targetId: 'cat-1', iou: 0.8 },
  { className: 'dog', score: 0.85, targetId: 'dog-1', iou: 0.4 },
  { className: 'cat', score: 0.8, targetId: 'cat-2', iou: 0.7 },
  { className: 'cat', score: 0.7, targetId: 'cat-1', iou: 0.9 },
], { cat: 2, dog: 1 }, { confidenceThreshold: 0.75, iouThreshold: 0.5, className: 'all' });
assert.deepEqual(
  { tp: sampleMetrics.operatingPoint.tp, fp: sampleMetrics.operatingPoint.fp, fn: sampleMetrics.operatingPoint.fn },
  { tp: 2, fp: 1, fn: 1 },
  'detection metrics should count a duplicate match and a below-IoU prediction as false positives',
);
assert.ok(Math.abs(sampleMetrics.operatingPoint.precision - 2 / 3) < 1e-9, 'precision should be TP divided by predicted positives');
assert.ok(Math.abs(sampleMetrics.operatingPoint.recall - 2 / 3) < 1e-9, 'recall should be TP divided by ground-truth objects');
assert.ok(Math.abs(sampleMetrics.operatingPoint.f1 - 2 / 3) < 1e-9, 'F1 should be the harmonic mean of precision and recall');
assert.ok(Math.abs(sampleMetrics.map50 - 0.5) < 1e-9, 'mAP@0.5 should average per-class AP rather than pool detections');
assert.ok(Math.abs(sampleMetrics.map5095 - 641 / 2020) < 1e-9, 'mAP@0.5:0.95 should average 101-point AP over ten IoU thresholds');
const noPredictions = labMath.evaluateDetectionMetrics([], { cat: 2 }, { confidenceThreshold: 0.99, iouThreshold: 0.5 });
assert.equal(noPredictions.operatingPoint.precision, 0, 'precision should be shown as zero when the model returns no predictions');
assert.equal(noPredictions.operatingPoint.recall, 0, 'recall should be zero when no ground-truth object is found');
const exactIouBoundary = labMath.evaluateDetectionMetrics([
  { className: 'cat', score: 0.9, targetId: 'cat-1', iou: 0.95 },
], { cat: 1 }, { confidenceThreshold: 0.5, iouThreshold: 0.95 });
assert.equal(exactIouBoundary.operatingPoint.tp, 1, 'a prediction exactly at the IoU threshold should count as a match');
assert.ok(Math.abs(exactIouBoundary.map5095 - 1) < 1e-9, 'mAP@0.5:0.95 should include the exact 0.95 IoU boundary');
const strictMetrics = labMath.evaluateDetectionMetrics([
  { className: 'cat', score: 0.9, targetId: 'cat-1', iou: 0.8 },
  { className: 'dog', score: 0.85, targetId: 'dog-1', iou: 0.4 },
  { className: 'cat', score: 0.8, targetId: 'cat-2', iou: 0.7 },
  { className: 'cat', score: 0.7, targetId: 'cat-1', iou: 0.9 },
], { cat: 2, dog: 1 }, { confidenceThreshold: 0.75, iouThreshold: 0.75, className: 'all' });
assert.equal(strictMetrics.operatingPoint.tp, 1, 'raising the IoU match threshold should turn a looser match into a false positive');
assert.ok(strictMetrics.operatingPoint.precision < sampleMetrics.operatingPoint.precision, 'a stricter IoU threshold should lower precision for this example');
const descent = labMath.gradientDescent(0.5, 4);
assert.equal(descent[0].weight, -4, 'gradient descent should begin at the documented starting point');
assert.equal(descent[1].weight, -0.5, 'a learning rate of 0.5 should move one step toward the minimum');
assert.equal(descent[4].weight, 2.5625, 'gradient descent should report the fourth update');
assert.ok(descent[4].loss < descent[0].loss, 'gradient descent should lower loss for a stable learning rate');

const impulse = labMath.convolve([[1, 2, 3], [4, 5, 6], [7, 8, 9]], [[0, 0, 0], [0, 1, 0], [0, 0, 0]]);
assert.deepEqual(Array.from(impulse[0]), [5], 'the center-only kernel should select the center pixel');

const nms = labMath.nonMaximumSuppression([
  { id: 'top', score: 0.9, box: [0, 0, 10, 10] },
  { id: 'overlap', score: 0.8, box: [1, 1, 11, 11] },
  { id: 'low-score', score: 0.6, box: [20, 20, 30, 30] },
], 0.75, 0.5);
assert.deepEqual(Array.from(nms.kept, item => item.id), ['top'], 'NMS should keep the strongest overlapping prediction');
assert.deepEqual(Array.from(nms.suppressed, item => item.id), ['overlap'], 'NMS should report a duplicate above the IoU threshold');
assert.deepEqual(Array.from(nms.filtered, item => item.id), ['low-score'], 'the confidence threshold should filter weak predictions first');
const relaxedNms = labMath.nonMaximumSuppression([
  { id: 'top', score: 0.9, box: [0, 0, 10, 10] },
  { id: 'overlap', score: 0.8, box: [1, 1, 11, 11] },
], 0.3, 0.7);
assert.deepEqual(Array.from(relaxedNms.kept, item => item.id), ['top', 'overlap'], 'a higher NMS IoU threshold should retain more overlapping predictions');

const clickListeners = listeners.filter(item => item.type === 'click');
const tabClickTarget = {
  closest(selector) {
    if (selector === '[data-lab-tab]' || selector === 'button') return labTabs[1];
    return null;
  },
};
for (const item of clickListeners) item.listener({ target: tabClickTarget, preventDefault() {} });
assert.equal(labTabs[1].attributes['aria-selected'], 'true', 'clicking a lab tab should activate its experiment');
assert.equal(labPanels[1].hidden, false, 'the selected experiment panel should be visible');
assert.equal(labPanels[0].hidden, true, 'other experiment panels should be hidden');

const keyListeners = listeners.filter(item => item.type === 'keydown');
const tabKeyTarget = { closest(selector) { return selector === '[data-lab-tab]' ? labTabs[1] : null; } };
for (const item of keyListeners) item.listener({ target: tabKeyTarget, key: 'ArrowRight', preventDefault() {} });
assert.equal(labTabs[2].attributes['aria-selected'], 'true', 'arrow keys should move through the experiment tabs');
assert.equal(labTabs[2].focused, true, 'keyboard navigation should focus the newly selected tab');

const convolutionClickTarget = {
  closest(selector) {
    if (selector === '[data-conv-cell]' || selector === 'button') return convolutionCells[8];
    return null;
  },
};
for (const item of clickListeners) item.listener({ target: convolutionClickTarget, preventDefault() {} });
assert.match(elements['#conv-detail'].textContent, /输出位置（3, 3）/, 'selecting an output cell should explain its input patch');
assert.equal(convolutionCells[8].focused, true, 'selecting an output cell should restore focus after redrawing the matrix');

function dispatchLabInput(id, value) {
  const target = elements[`#${id}`];
  target.value = value;
  for (const item of listeners.filter(listener => listener.type === 'input')) item.listener({ target });
}
dispatchLabInput('gradient-lr', '0.5');
assert.match(elements['#gradient-chart'].innerHTML, /<circle/, 'changing the learning rate should redraw the gradient path');
dispatchLabInput('conv-kernel', 'blur');
assert.match(elements['#conv-visual'].innerHTML, /conv-grid/, 'changing the convolution kernel should redraw its feature map');
dispatchLabInput('nms-confidence', '0.8');
assert.match(elements['#nms-summary'].textContent, /置信度筛选后剩余 1 个候选框/, 'changing the confidence threshold should filter weaker predictions');
dispatchLabInput('nms-confidence', '0.3');
dispatchLabInput('nms-iou', '0.7');
assert.match(elements['#nms-summary'].textContent, /抑制 0 个重叠框，最终保留 3 个/, 'raising the NMS IoU threshold should keep the overlapping box');
const firstF1Chart = elements['#metric-f1-chart'].innerHTML;
dispatchLabInput('metric-confidence', '0.95');
assert.notEqual(elements['#metric-point-summary'].textContent, '', 'the metrics panel should report its current operating point');
assert.notEqual(elements['#metric-f1-chart'].innerHTML, firstF1Chart, 'changing confidence should move the selected F1 point');
dispatchLabInput('metric-class', 'person');
assert.match(elements['#metric-point-summary'].textContent, /行人/, 'the class selector should describe the selected class');
dispatchLabInput('metric-iou', '0.75');
assert.match(elements['#metric-pr-chart'].innerHTML, /role="img"/, 'the precision-recall chart should be accessible to assistive technology');
console.log('Verified textbook lessons, navigation, reading progress, and interactive learning simulations.');
