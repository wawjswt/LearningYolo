const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const vm = require('node:vm');
const { test } = require('node:test');
const { spawnSync } = require('node:child_process');

// Load the actual browser scripts and course composition without mounting a DOM.
const root = join(__dirname, '../dist');
const handlers = [];
const elements = new Map();
let stored = '', navigations = 0, scrolled = '';
const element = id => {
  if (!elements.has(id)) elements.set(id, {
    value: '', innerHTML: '', dataset: {}, style: {},
    addEventListener() {}, setAttribute() {}, querySelectorAll() { return []; },
    classList: { add() {}, remove() {}, toggle() {} },
    scrollIntoView() { scrolled = id; }
  });
  return elements.get(id);
};
const context = {
  console, URL, Blob, setTimeout() {}, clearTimeout() {},
  localStorage: { getItem() { return null; }, setItem(key, value) { stored = value; } },
  location: { hash: '#lesson/tensor', pathname: '/', search: '' },
  history: { replaceState() {}, pushState() { navigations++; } },
  document: {
    readyState: 'loading',
    addEventListener(type, fn, capture) { handlers.push({ type, fn, capture }); },
    querySelector(selector) { return element(selector); },
    querySelectorAll() { return []; }, getElementById: element
  },
  addEventListener() {}, matchMedia() { return { matches: true }; }, scrollTo() {}
};
context.window = context;
vm.createContext(context);
const html = readFileSync(join(root, 'index.html'), 'utf8');
for (const [, src] of html.matchAll(/<script src="([^"?]+)(?:\?[^"]*)?"><\/script>/g)) {
  if (/^https?:/.test(src) || src === 'sidebar.js') continue;
  let source = readFileSync(join(root, src), 'utf8');
  if (src === 'textbook-ui-v3.js') source = source.replace(/  render\(\);\s*\}\)\(\);\s*$/, '})();');
  vm.runInContext(source, context, { filename: src });
}
const run = source => vm.runInContext(source, context);
const courses = run('lessons');
const ids = courses.filter(l => l.curriculumKey === 'dl').slice(0, 12).map(l => l.id);

test('first twelve short courses have their own scoped explanation, worked steps and code', () => {
  for (const id of ids) {
    const lesson = courses.find(l => l.id === id);
    assert.ok(lesson.foundationDepth?.parts.length >= 3, id + ': missing short-course explanation');
    assert.ok(lesson.worked?.steps.length >= 3, id + ': missing worked steps');
    assert.ok(lesson.starterCode, id + ': missing code');
    assert.match(context.lesson(id), /data-worked-example/);
    assert.ok(context.renderFoundationDepth(lesson).includes(lesson.foundationDepth.title));
  }
});

test('shape lesson does not introduce matrix multiplication or indexing as its example', () => {
  const lesson = courses.find(l => l.id === 'tensor');
  assert.doesNotMatch(JSON.stringify(lesson.foundationDepth) + JSON.stringify(lesson.worked), /矩阵乘法|点积|stride/);
  assert.doesNotMatch(lesson.starterCode, /@|x\[/);
  assert.match(lesson.starterCode, /numel/);
});

test('chapter questions use stable identities and do not reuse old positional answers', () => {
  run('state.exerciseAnswers = {"tensor:chapter:0": 0}');
  for (const lesson of courses.filter(l => l.curriculumKey === 'dl')) {
    assert.equal(lesson.chapterExercises.length, 3, lesson.id);
    assert.equal(new Set(lesson.chapterExercises.map(e => e.id)).size, 3, lesson.id);
  }
  const chapter = context.lesson('tensor').split('id="chapter-quiz"')[1].split('class="chapter-notes"')[0];
  assert.match(chapter, /data-exercise-key="tensor:chapter:/);
  assert.doesNotMatch(chapter, /class="(?:correct|wrong)"/);
  const counts = [0, 0, 0];
  for (const lesson of courses.filter(l => l.curriculumKey === 'dl')) {
    for (const q of lesson.chapterExercises) { counts[q.answer]++; assert.ok(q.options[q.answer]); }
  }
  assert.ok(counts.every(n => n >= 20), 'answer positions should not overwhelmingly favor A: ' + counts);
});

test('answer clicks save the renderer key and update accessible selection immediately', async () => {
  const lesson = courses.find(l => l.id === 'tensor');
  const q = lesson.chapterExercises[0];
  const key = 'tensor:chapter:' + q.id;
  let pressed = '';
  const result = {};
  const button = {
    dataset: { exerciseAnswer: String(q.answer), lesson: 'tensor', exerciseType: 'chapter', exerciseIndex: '0', exerciseKey: key },
    matches() { return false; }, classList: { add() {}, remove() {} },
    setAttribute(name, value) { if (name === 'aria-pressed') pressed = value; },
    closest() { return { querySelectorAll() { return [button]; }, querySelector() { return result; } }; }
  };
  const handler = handlers.find(h => h.type === 'click' && h.fn.toString().includes('t.dataset.exerciseAnswer'));
  await handler.fn({ target: { closest() { return button; } } });
  assert.equal(JSON.parse(stored).exerciseAnswers[key], q.answer);
  assert.equal(pressed, 'true');
  assert.match(result.textContent, /回答正确/);
  const restored = context.lesson('tensor').split('id="chapter-quiz"')[1];
  assert.match(restored, /class="correct" aria-pressed="true"/);
});

test('legacy section answer remains readable and new section answers use the stable section id', () => {
  const lesson = courses.find(l => l.id === 'tensor');
  const section = lesson.sections.find(s => s.exercise);
  run('state.exerciseAnswers = ' + JSON.stringify({ ['tensor:section:' + section.legacyIndex]: section.exercise.answer }));
  const rendered = context.lesson('tensor');
  assert.ok(rendered.includes('data-exercise-key="tensor:section:' + section.id + '"'));
  assert.match(rendered, /class="correct" aria-pressed="true"/);
});

test('chapter quiz table-of-contents link scrolls inside the current lesson', () => {
  const handler = handlers.find(h => h.type === 'click' && h.capture && h.fn.toString().includes('const destination'));
  const before = navigations;
  const render = context.render;
  context.render = () => {};
  handler.fn({ target: { closest() { return { getAttribute() { return '#chapter-quiz'; } }; } }, preventDefault() {} });
  context.render = render;
  assert.equal(scrolled, 'chapter-quiz');
  assert.equal(navigations, before);
});

test('multi-label explanation distinguishes scoring each label from statistical independence', () => {
  const lesson = courses.find(l => l.id === 'losses');
  assert.doesNotMatch(lesson.chapterExercises.map(q => q.why).join(' '), /标签彼此独立/);
  const probabilityLesson = courses.find(l => l.id === 'loss-probabilities');
  assert.match(probabilityLesson.starterCode || '', /softmax/);
});

test('tensor layout explanations and stride API use memory terminology', () => {
  const lesson = courses.find(l => l.id === 'tensor-layout');
  const text = JSON.stringify(lesson.foundationDepth) + lesson.chapterExercises.map(q => q.q + q.why).join('');
  assert.ok(!context.visionlabGlossary.termsIn(text).some(t => t.id === 'spatial-stride'));
  assert.equal(context.visionlabGlossary.firstTerm('x.stride()').id, 'stride');
  assert.equal(context.visionlabGlossary.firstTerm('stride=2').id, 'conv-stride');
});

test('loss reading map points to the split probability and cross entropy lessons', () => {
  const map = context.renderLossFoundationChain();
  assert.ok(map.includes('href="#lesson/loss-probabilities"'));
  assert.ok(map.includes('href="#lesson/loss-cross-entropy"'));
  assert.doesNotMatch(map, /已经逐步算过/);
});

test('neuron workshop keeps probability conversion in an optional explanation', () => {
  const workshop = context.renderFoundationWorkshop(courses.find(l => l.id === 'network'));
  const optional = workshop.match(/<details[^>]*>[\s\S]*?<\/details>/)?.[0];
  assert.ok(optional?.includes('data-bw-net-p'));
  assert.ok(!optional.includes('data-bw-net-z'));
  assert.doesNotMatch(workshop, /只有经过 Sigmoid/);
});

test('twelve Python examples parse and the two arithmetic examples produce the documented numbers', () => {
  const program = [
    'import ast, contextlib, io, json, sys',
    'programs = json.load(sys.stdin)',
    'expected = {"ai-foundations": "6\\n5\\n", "ai-layers": "5\\n11\\n"}',
    'for item in programs:',
    '    ast.parse(item["code"], filename=item["id"])',
    '    if item["id"] in expected:',
    '        output = io.StringIO()',
    '        with contextlib.redirect_stdout(output): exec(item["code"], {})',
    '        assert output.getvalue() == expected[item["id"]], output.getvalue()'
  ].join('\n');
  const result = spawnSync('python', ['-X', 'utf8', '-c', program], {
    encoding: 'utf8', input: JSON.stringify(ids.map(id => ({ id, code: courses.find(l => l.id === id).starterCode })))
  });
  assert.equal(result.status, 0, result.stderr || String(result.error));
});

test('shared exercise and code rendering works across every course', () => {
  for (const lesson of courses) {
    const rendered = context.lesson(lesson.id);
    assert.match(rendered, /<article class="textbook-page">/, lesson.id);
    assert.match(rendered, /id="chapter-notes"/, lesson.id);
  }
});
