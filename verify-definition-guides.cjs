const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');

// Run the actual content scripts in production order; UI actions are outside this content check.
const root = path.join(__dirname, 'dist');
const files = [...fs.readFileSync(path.join(root, 'index.html'), 'utf8').matchAll(/<script src="([^"?]+)(?:\?[^" ]*)?"/g)]
  .map(match => match[1]).filter(file => !file.startsWith('http') && !['textbook-ui-v3.js', 'sidebar.js'].includes(file));
const noop = () => {};
const element = { innerHTML:'', textContent:'', value:'', dataset:{}, style:{},
  classList:{add:noop,remove:noop,toggle:noop,contains:()=>false},
  setAttribute:noop,addEventListener:noop,appendChild:noop,querySelector:()=>null,
  querySelectorAll:()=>[],getBoundingClientRect:()=>({top:0}) };
const context = { console, location:{hash:'#courses',search:'',pathname:'/'},
  localStorage:{getItem:()=>null,setItem:noop},setTimeout:noop,clearTimeout:noop,
  requestAnimationFrame:noop,addEventListener:noop,scrollTo:noop,innerHeight:900,
  MutationObserver:class {observe(){}},document:{readyState:'loading',addEventListener:noop,
    querySelector:()=>element,querySelectorAll:()=>[],getElementById:()=>element,
    createElement:()=>({...element}),documentElement:element,body:element},
  navigator:{clipboard:{writeText:noop}},history:{replaceState:noop,pushState:noop} };
context.window = context;
vm.createContext(context);
for (const file of files) vm.runInContext(fs.readFileSync(path.join(root, file), 'utf8'), context, {filename:file});
const lessons = vm.runInContext('lessons', context);
const glossary = context.visionlabGlossary;
const ids = new Set(lessons.map(lesson => lesson.id));
const examples = new Set();
let definitionCount = 0;
for (const lesson of lessons) {
  const intro = lesson.foundation;
  assert.ok(intro, lesson.id + ': missing introduction');
  assert.ok(intro.why.length >= 15 && !intro.why.includes('完成本课后，你可以用自己的话说明'), lesson.id + ': generic purpose');
  assert.ok(intro.example.length >= 35, lesson.id + ': missing concrete example');
  assert.ok(!examples.has(intro.example), lesson.id + ': inherited duplicate example');
  examples.add(intro.example);
  assert.ok(intro.terms.length >= 2 && intro.terms.length <= 4, lesson.id + ': term scope');
  const steps = context.visionlabFoundation.beginnerSteps[lesson.id];
  assert.equal(steps.length, intro.terms.length, lesson.id + ': missing definition steps');
  intro.terms.forEach((id, index) => {
    const item = glossary.byId[id];
    assert.ok(item, lesson.id + ': unknown term ' + id);
    assert.equal(steps[index][0], item.title);
    assert.equal(steps[index][1], item.plainExplanation);
    const target = item.learnMore.replace('#lesson/', '').split('/')[0];
    assert.ok(ids.has(target), id + ': invalid course link ' + target);
    definitionCount++;
  });
  const markup = context.renderFoundationStart(lesson);
  assert.ok(markup.includes('先把本课名词讲清楚') && markup.includes('zero-start-steps'), lesson.id + ': definitions not rendered');
}
for (const [course, intro] of Object.entries(context.visionlabFoundation.starts)) {
  for (const id of intro.terms || []) assert.ok(glossary.byId[id], course + ': stale starter term ' + id);
}
const aliases = new Map();
for (const item of glossary.items) {
  assert.ok(ids.has(item.learnMore.replace('#lesson/', '').split('/')[0]), item.id + ': broken learn-more');
  for (const alias of item.aliases) {
    const key = alias.toLocaleLowerCase();
    assert.ok(!aliases.has(key) || aliases.get(key) === item.id, 'ambiguous alias ' + alias);
    aliases.set(key, item.id);
  }
}
assert.equal(glossary.firstTerm('标准正态分布').id, 'standard-normal-distribution');
assert.equal(glossary.firstTerm('相对熵').id, 'kl-divergence');
assert.equal(glossary.firstTerm('二元交叉熵').id, 'bce');
assert.equal(glossary.firstTerm('L2 正则化').id, 'l2-regularization');
assert.notEqual(glossary.lookup('SmoothL1Loss').id, glossary.lookup('HuberLoss').id);
assert.equal(glossary.lookup('SmoothL1Loss').id, 'smooth-l1');
assert.ok(glossary.byId['smooth-l1'].plainExplanation.includes('HuberLoss/β'));
assert.equal(glossary.byId.stride.learnMore, '#lesson/tensor-layout');
assert.equal(glossary.byId['conv-stride'].learnMore, '#lesson/cnn-shapes');
assert.ok(glossary.byId.iteration.plainExplanation.includes('4 次迭代只对应 1 次更新'));
assert.ok(glossary.byId['batch-normalization'].plainExplanation.includes('N、H、W'));
assert.ok(glossary.byId['whitening'].plainExplanation.includes('没有完整去相关'));
console.log('Definition review passed: ' + lessons.length + ' courses, ' + glossary.items.length + ' terms, ' + definitionCount + ' in-context definitions.');
