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
  if (src === 'textbook-cv-editorial.js') source = source.replace('  const visuals={', '  window.cvNumericCheck={computeWindow,windowState,windowView,scaleView,boxOverlap,scoreDetections,overlapView};\n  const visuals={');
  vm.runInContext(source, context, { filename: src });
}
const run = source => vm.runInContext(source, context);
const courses = run('lessons');
const ids = courses.filter(l => l.curriculumKey === 'dl' && l.foundationDepth).map(l => l.id);

test('ResNet begins with its identity and motivation before introducing residual notation', () => {
  const c=courses.find(l=>l.id==='cnn-residual');
  const intro=c.sections[0].paragraphs.join(' ');
  assert.match(c.sections[0].paragraphs[0],/残差网络.*Residual Network.*ResNet/);
  assert.match(intro,/20层.*56层/);
  assert.match(intro,/训练误差/);
  assert.match(intro,/恒等映射/);
  assert.match(c.sections[1].paragraphs.join(' '),/不是.*损失|不是.*标签/);
  assert.match(c.sections[1].paragraphs.join(' '),/ReLU/);
  const main=c.sections.map(s=>s.paragraphs.join(' ')).join(' ');
  assert.ok(main.indexOf('残差网络')<main.indexOf('F(x)'));
  const shapeLesson=context.lesson('cnn-residual-shapes');
  assert.match(shapeLesson,/Conv1×1\(16→32, stride=2\)/);
  assert.doesNotMatch(shapeLesson,/64→128|64×8×8/);
});

test('ResNet names and training pathologies remain whole concepts in glossary explanations', () => {
  for(const [text,id] of [['残差网络','resnet-family'],['Residual Network','resnet-family'],['残差块','residual-block'],['残差学习','residual-learning'],['梯度消失','vanishing-gradient'],['梯度爆炸','exploding-gradient']]){
    assert.equal(context.visionlabGlossary.firstTerm(text)?.id,id,text);
  }
});

test('named architectures and training mechanisms define the object before giving configuration details', () => {
  const required={
    'cnn-architectures':['LeNet','手写数字'],
    'cnn-vgg':['VGG','卷积神经网络'],
    'feature-pyramid':['特征金字塔','分辨率'],
    'network-activation':['激活函数','非线性'],
    'optimizer':['优化器','学习率'],
    'optimizer-momentum':['动量','Adam'],
    'optimizer-tuning':['权重衰减','AdamW'],
    'training-accumulation':['梯度累积','显存'],
    'fine-tuning':['微调','预训练']
  };
  for(const [id,terms] of Object.entries(required)){
    const first=courses.find(l=>l.id===id).sections[0].paragraphs[0];
    for(const term of terms)assert.ok(first.includes(term),`${id}: opening must explain ${term}`);
  }
});

test('ResNet separates addition from activation and its shape code agrees with a real BasicBlock',
  {skip:!process.env.VISIONLAB_TORCH_PYTHON}, () => {
    const codes=['cnn-residual','cnn-residual-shapes'].map(id=>({id,code:courses.find(l=>l.id===id).sections.find(s=>s.code).code}));
    const program=[
      'import contextlib, io, json, sys',
      'for item in json.load(sys.stdin):',
      '    output=io.StringIO(); scope={}',
      '    with contextlib.redirect_stdout(output): exec(item["code"],scope)',
      '    if item["id"]=="cnn-residual":',
      '        assert "sum: [3.2, -1.0]" in output.getvalue()',
      '        assert "block output: [3.2, 0.0]" in output.getvalue()',
      '        assert "x gradient: [1.0, 0.0]" in output.getvalue()',
      '    else: assert output.getvalue().count("(1, 32, 4, 4)")==3'
    ].join('\n');
    const r=spawnSync(process.env.VISIONLAB_TORCH_PYTHON,['-X','utf8','-c',program],{encoding:'utf8',input:JSON.stringify(codes),timeout:60000});
    assert.equal(r.status,0,r.stderr||String(r.error));
});

test('AlexNet exposes every operation with a continuous tensor contract, including unchanged shapes', () => {
  assert.ok(context.visionlabAlexnetFlow, 'AlexNet needs a complete layer trace');
  const trace=context.visionlabAlexnetFlow.trace(1,224);
  assert.equal(trace.length,24); // input + 22 network operations + optional Softmax
  for(let i=1;i<trace.length;i++)assert.deepEqual(trace[i].input,trace[i-1].output,trace[i].name);
  const featureShapes=[[1,64,55,55],[1,64,55,55],[1,64,27,27],[1,192,27,27],[1,192,27,27],[1,192,13,13],[1,384,13,13],[1,384,13,13],[1,256,13,13],[1,256,13,13],[1,256,13,13],[1,256,13,13],[1,256,6,6]];
  assert.deepEqual(JSON.parse(JSON.stringify(trace.slice(1,14).map(r=>r.output))),featureShapes);
  assert.deepEqual(Array.from(trace[15].output),[1,9216]);
  assert.deepEqual(Array.from(trace[22].output),[1,1000]);
  assert.equal(trace.reduce((n,r)=>n+r.params,0),61100840);
  assert.equal(trace.filter(r=>r.params>0).length,8);
  assert.equal(trace[1].params,23296);assert.equal(trace[4].params,307392);
  assert.equal(trace[17].params,37752832);
});

test('AlexNet adaptive pooling and batch size follow the chosen input rather than a fixed picture', () => {
  const trace=context.visionlabAlexnetFlow?.trace(2,256);
  assert.ok(trace,'a second input size must be calculated');
  assert.deepEqual(Array.from(trace[13].output),[2,256,7,7]);
  assert.deepEqual(Array.from(trace[14].output),[2,256,6,6]);
  assert.deepEqual(Array.from(trace[15].output),[2,9216]);
  assert.deepEqual(Array.from(trace[22].output),[2,1000]);
  const rendered=context.lesson('cnn-alexnet');
  assert.match(rendered,/data-ax-flow-detail/);
  assert.match(rendered,/features\.12/);
  assert.match(rendered,/classifier\.6/);
  assert.doesNotMatch(rendered,/96 个 11×11 卷积核|Conv3–5|结构示意省略了部分/);
});

test('AlexNet displayed Python prints the same layer shapes and parameter counts as real Torchvision',
  {skip:!process.env.VISIONLAB_TORCH_PYTHON}, () => {
    const api=context.visionlabAlexnetFlow;
    const cases=[[1,224],[2,224],[4,224],[1,256],[2,256],[4,256]].map(([n,size])=>({
      code:api.code(n,size),
      expected:api.trace(n,size).map(r=>({path:r.path,input:r.input,output:r.output,params:r.params})),
      weights:api.trace(n,size).filter(r=>r.params).map(r=>({path:r.path,shape:r.weight}))
    }));
    const program=[
      'import ast, contextlib, io, json, re, sys, torch',
      'torch.set_num_threads(1)',
      'for case in json.load(sys.stdin):',
      '    ast.parse(case["code"])',
      '    output=io.StringIO()',
      '    scope={}',
      '    with contextlib.redirect_stdout(output): exec(case["code"], scope)',
      '    for row in case["weights"]:',
      '        assert list(scope["model"].get_submodule(row["path"]).weight.shape)==row["shape"]',
      '    actual=[]',
      '    for line in output.getvalue().splitlines():',
      '        m=re.match(r"^(.+?)\\s+(\\([0-9, ]+\\))\\s*->\\s*(\\([0-9, ]+\\))\\s+params=(\\d+)$",line)',
      '        if m: actual.append({"path":m[1].strip(),"input":list(ast.literal_eval(m[2])),"output":list(ast.literal_eval(m[3])),"params":int(m[4])})',
      '    assert actual==case["expected"], (actual,case["expected"])',
      '    assert "total parameters: 61100840" in output.getvalue()',
      'patch=torch.stack([torch.ones(11,11)*i for i in [1,2,3]])[None]',
      'assert torch.nn.functional.conv2d(patch,torch.ones(1,3,11,11),torch.ones(1)).item()==727',
      'assert torch.nn.functional.adaptive_avg_pool2d(torch.arange(49.).reshape(1,1,7,7),(6,6))[0,0,0,0].item()==4',
      'print("Six real forward passes match every displayed operation.")'
    ].join('\n');
    const result=spawnSync(process.env.VISIONLAB_TORCH_PYTHON,['-X','utf8','-c',program],{
      encoding:'utf8',input:JSON.stringify(cases),timeout:120000
    });
    assert.equal(result.status,0,result.stderr||String(result.error));
    assert.match(result.stdout,/Six real forward passes/);
});

test('IoU handles identity, containment, touching and invalid boxes with continuous coordinates', () => {
  const {boxOverlap}=context.cvNumericCheck;
  const a=[0,0,10,10],b=[5,0,15,10];
  assert.equal(boxOverlap(a,a).value,1);
  assert.equal(boxOverlap(a,b).value,1/3);
  assert.equal(boxOverlap(a,b).value,boxOverlap(b,a).value);
  assert.equal(boxOverlap(a,[10,0,20,10]).value,0);
  assert.equal(boxOverlap(a,[12,0,22,10]).width,0);
  assert.equal(boxOverlap(a,[2,2,7,7]).value,.25);
  assert.throws(()=>boxOverlap([0,0,0,10],a),/宽、高/);
});

test('detection matching assigns a true object at most once and uses inclusive thresholds', () => {
  const score=context.cvNumericCheck.scoreDetections;
  const baseline=score(false,0,.5,0);
  assert.equal(baseline.tp,2);assert.equal(baseline.fp,2);assert.equal(baseline.fn,1);
  assert.match(baseline.rows[1].reason,/重复/);
  assert.equal(baseline.precision,.5);assert.equal(baseline.recall,2/3);
  const boundary=score(false,10,.5,.7);
  assert.equal(boundary.tp,2);assert.equal(boundary.fp,1);assert.equal(boundary.rows[2].best.value,.5);
  assert.equal(score(false,11,.5,0).tp,1);
  assert.equal(score(false,10,.75,0).tp,1);
  assert.equal(score(false,0,.95,0).rows[1].matched,null);
});

test('AP sums recall increments under the precision envelope and keeps the selected point separate', () => {
  const score=context.cvNumericCheck.scoreDetections;
  const fixed=score(true,0,.5,0);
  assert.equal(fixed.tp,3);assert.equal(fixed.fp,1);assert.equal(fixed.fn,0);
  assert.ok(Math.abs(fixed.ap-5/6)<1e-12);
  assert.ok(Math.abs(fixed.ap101-(34+67*.75)/101)<1e-12);
  assert.ok(Math.abs(score(false,0,.5,0).ap-5/9)<1e-12);
  const empty=score(true,0,.5,1);
  assert.equal(empty.precision,null);assert.equal(empty.recall,0);assert.equal(empty.fn,3);
  assert.equal(empty.ap,fixed.ap,'the score control selects a point, not a prefilter for the AP ranking');
});

test('the IoU Python example executes and agrees with the browser arithmetic', () => {
  const cases=[[0,0],[5,0],[10,0],[6,3]];
  const programs=cases.map(([x,y])=>({code:context.cvNumericCheck.overlapView(x,y).match(/<code id="cv-overlap-code">([\s\S]*?)<\/code>/)[1],expected:context.cvNumericCheck.boxOverlap([0,0,10,10],[x,y,x+10,y+10]).value}));
  const source='import contextlib,html,io,json,sys\nfor item in json.load(sys.stdin):\n    out=io.StringIO()\n    with contextlib.redirect_stdout(out): exec(html.unescape(item["code"]),{})\n    assert abs(float(out.getvalue())-item["expected"])<1e-12';
  const result=spawnSync('python',['-X','utf8','-c',source],{encoding:'utf8',input:JSON.stringify(programs)});
  assert.equal(result.status,0,result.stderr||String(result.error));
  for(const [id,attribute] of [['iou-calculation','data-cv-overlap aria-label='],['metrics','data-cv-matching="matching"'],['metrics-map','data-cv-matching="ap-matching"']])assert.equal(context.lesson(id).split(attribute).length-1,1,id);
});

test('CV convolution uses the same windows as the text and handles shared input contributions', () => {
  const {computeWindow,windowState} = context.cvNumericCheck;
  const s = windowState('conv');
  assert.deepEqual(Array.from(computeWindow(s.values,3,1,0,'conv',0).outputs), [-4,-4,-4,-4]);
  s.values[4] = 9;
  assert.deepEqual(Array.from(computeWindow(s.values,3,1,0,'conv',0).outputs), [-8,-4,-4,0]);
  const padded = computeWindow([1,2,3,4,5,6,7,8,9],3,1,1,'conv',0);
  assert.equal(padded.out,4); assert.equal(padded.outputs[0],-1); assert.equal(padded.outputs.at(-1),9);
  assert.equal(padded.terms.filter(t=>!t.inside).length,3);
  assert.equal(computeWindow(s.values,3,2,0,'conv',0,2).out,1);
  assert.equal(computeWindow(s.values,3,2,0,'conv',0,2).outputs[0],-6);
});

test('CV pooling checks mean, negative inputs and moving an impulse across a window boundary', () => {
  const {computeWindow,windowState} = context.cvNumericCheck;
  const s=windowState('pooling');
  assert.deepEqual(Array.from(computeWindow(s.values,4,2,0,'max',0).outputs),[4,3,6,8]);
  assert.deepEqual(Array.from(computeWindow(s.values,4,2,0,'avg',0).outputs),[2.5,1.5,3.5,5.5]);
  assert.equal(computeWindow([-1,-2,-3,-4],2,1,0,'max',0).outputs[0],-1);
  const pulse=Array(16).fill(0); pulse[1]=9;
  assert.deepEqual(Array.from(computeWindow(pulse,4,2,0,'max',0).outputs),[9,0,0,0]);
  pulse[1]=0;pulse[5]=9;
  assert.deepEqual(Array.from(computeWindow(pulse,4,2,0,'max',0).outputs),[9,0,0,0]);
  pulse[5]=0;pulse[2]=9;
  assert.deepEqual(Array.from(computeWindow(pulse,4,2,0,'max',0).outputs),[0,9,0,0]);
});

test('CV labs are mounted once in the appropriate lessons and preprocessing computes actual numbers', () => {
  for (const [id,attribute] of [['cnn','data-cv-window-lab="conv"'],['pooling','data-cv-window-lab="pooling"'],['pooling-tradeoffs','data-cv-window-lab="pool-shift"'],['image','data-cv-scale ']]) {
    assert.equal(context.lesson(id).split(attribute).length-1,1,id);
  }
  assert.doesNotMatch(context.lesson('cnn'),/data-cnn-convolution|data-bw-root="cnn"/);
  assert.match(context.cvNumericCheck.scaleView(128,false),/0\.50196/);
  assert.match(context.cvNumericCheck.scaleView(128,false),/0\.00784/);
  assert.match(context.cvNumericCheck.scaleView(128,true),/−1\.99213/);
  assert.match(context.cvNumericCheck.scaleView(0,false),/−2/);
  assert.match(context.cvNumericCheck.scaleView(255,false),/>2</);
});

test('generated CV code parses for convolution, bias, padding and both pooling rules', () => {
  const {windowState,windowView}=context.cvNumericCheck;
  const conv=windowState('conv');conv.padding=1;conv.stride=2;conv.bias=-3;
  const avg=windowState('pooling');avg.mode='avg';avg.stride=1;
  const examples=[windowState('conv'),conv,windowState('pooling'),avg];
  const snippets=examples.map(s=>windowView(s).match(/<code id="cv-window-code-[^"]+">([\s\S]*?)<\/code>/)[1]);
  const result=spawnSync('python',['-X','utf8','-c','import ast,html,json,sys\nfor code in json.load(sys.stdin): ast.parse(html.unescape(code))'],{encoding:'utf8',input:JSON.stringify(snippets)});
  assert.equal(result.status,0,result.stderr||String(result.error));
});

function mountWorkshop(id, collections = {}) {
  const nodes = new Map();
  const node = selector => {
    if (!nodes.has(selector)) nodes.set(selector, {
      value: '', textContent: '', innerHTML: '', dataset: {}, disabled: false,
      events: {}, attributes: {},
      addEventListener(type, handler) { this.events[type] = handler; },
      setAttribute(name, value) { this.attributes[name] = value; },
      classList: { toggle() {} }, querySelector: node
    });
    return nodes.get(selector);
  };
  const root = { dataset: { bwRoot: id }, querySelector: node,
    querySelectorAll(selector) { return collections[selector] || []; } };
  const original = context.document.querySelectorAll;
  context.document.querySelectorAll = selector => selector === '[data-bw-root]' ? [root] : [];
  context.initializeFoundationWorkshops();
  context.document.querySelectorAll = original;
  return node;
}

test('gradient ledger separates fresh graphs, gradient accumulation, step, and clearing', () => {
  const actions = ['forward', 'backward', 'clear', 'step', 'reset'].map(action => ({
    dataset: { bwLedgerAction: action }, addEventListener(type, handler) { this.click = handler; }
  }));
  const node = mountWorkshop('gradient-diagnostics', { '[data-bw-ledger-action]': actions });
  const click = action => actions.find(button => button.dataset.bwLedgerAction === action).click();
  const read = key => node('[data-bw-ledger-' + key + ']').textContent;
  click('step'); assert.equal(read('w'), '1.000');
  click('forward'); assert.equal(read('loss'), '9.000');
  click('backward'); assert.equal(read('grad'), '−12.000'); assert.equal(read('w'), '1.000');
  click('backward'); assert.equal(read('grad'), '−12.000'); assert.match(read('status'), /已释放/);
  click('forward'); click('backward'); assert.equal(read('grad'), '−24.000');
  click('step'); assert.equal(read('w'), '2.200'); assert.equal(read('grad'), '−24.000');
  assert.equal(read('loss'), '9.000', 'step does not recalculate the old loss');
  click('forward'); assert.equal(read('loss'), '0.360');
  click('clear'); assert.equal(read('grad'), 'None'); assert.equal(read('w'), '2.200');
  click('reset'); assert.equal(read('w'), '1.000'); assert.equal(read('loss'), '尚未计算');
});

test('learning rate demo reaches an increasing loss and Adam belongs to the next course', () => {
  const slider = { value: '0.05', addEventListener(type, handler) { this.input = handler; } };
  // The initializer queries this slider once; inject it through the root node map.
  const original = context.document.querySelectorAll;
  const fields = new Map();
  const root = { dataset: { bwRoot: 'optimizer' }, querySelector(selector) {
    if (selector === '[data-bw-lr-slider]') return slider;
    if (!fields.has(selector)) fields.set(selector, {});
    return fields.get(selector);
  } };
  context.document.querySelectorAll = () => [root];
  context.initializeFoundationWorkshops(); context.document.querySelectorAll = original;
  slider.value = '0.5'; slider.input();
  assert.equal(fields.get('[data-bw-lr-next]').textContent, '7.00');
  assert.equal(fields.get('[data-bw-lr-loss]').textContent, '81.00');
  assert.match(fields.get('[data-bw-lr-note]').textContent, /更大/);
  assert.doesNotMatch(context.renderFoundationWorkshop('optimizer'), /data-bw-adam-step/);
  assert.match(context.renderFoundationWorkshop('optimizer-momentum'), /data-bw-adam-step/);
});

test('batch demonstration counts an update only after its third phase', () => {
  const cells = Array.from({ length: 4 }, () => ({
    classList: { toggle() {} }, small: {}, querySelector() { return this.small; }
  }));
  const nodes = new Map();
  const node = selector => {
    if (!nodes.has(selector)) nodes.set(selector, { textContent: '', innerHTML: '', disabled: false,
      addEventListener(type, handler) { this.click = handler; }, querySelectorAll() { return cells; } });
    return nodes.get(selector);
  };
  const original = context.document.querySelectorAll;
  context.document.querySelectorAll = () => [{ dataset: { bwRoot: 'training-loop' }, querySelector: node }];
  context.initializeFoundationWorkshops(); context.document.querySelectorAll = original;
  const next = node('[data-bw-loop-next]'), counter = node('[data-bw-loop-step]');
  next.click(); next.click(); assert.equal(counter.textContent, '0 / 4 次更新已完成');
  next.click(); assert.equal(counter.textContent, '1 / 4 次更新已完成');
  assert.match(node('[data-bw-loop-label]').textContent, /第 1 批/);
  for (let i = 3; i < 12; i++) next.click();
  assert.equal(counter.textContent, '4 / 4 次更新已完成'); assert.equal(next.disabled, true);
  assert.ok(cells.every(cell => cell.small.textContent === '2 张 · 已更新'));
  node('[data-bw-loop-reset]').click(); assert.equal(counter.textContent, '0 / 4 次更新已完成');
});

test('beginner short courses with custom examples have scoped explanations, worked steps and code', () => {
  for (const id of ids) {
    const lesson = courses.find(l => l.id === id);
    assert.ok(lesson.foundationDepth?.parts.length >= 3, id + ': missing short-course explanation');
    assert.ok(lesson.worked?.steps.length >= 3, id + ': missing worked steps');
    assert.ok(lesson.starterCode, id + ': missing code');
    assert.match(context.lesson(id), /data-worked-example/);
    assert.ok(context.renderFoundationDepth(lesson).includes(lesson.foundationDepth.title));
  }
});

test('gradient to training loop uses one consistent calculation from loss to updated parameters', () => {
  const expected = {
    gradient: ['w_new=1.6', '3.24', 'dL/dw=−12'],
    'gradient-chain-rule': ['dL/du=−6', 'du/dw=2', 'dL/dw=−12'],
    optimizer: ['η=0.01', 'η=0.05', '7.6176', '81'],
    'training-loop': ['dw=−12', 'db=−6', '2.25']
  };
  for (const [id, phrases] of Object.entries(expected)) {
    const lesson = courses.find(l => l.id === id);
    assert.ok(lesson?.foundationDepth, id + ': missing beginner explanation');
    const text = JSON.stringify(lesson.foundationDepth) + JSON.stringify(lesson.worked) + lesson.starterCode;
    for (const phrase of phrases) assert.ok(text.includes(phrase), id + ': missing ' + phrase);
    assert.ok(lesson.starterCode, id + ': missing code example');
  }
  const fullLoop = courses.find(l => l.id === 'training-loop');
  assert.match(fullLoop.starterCode, /zero_grad\(\)[\s\S]*backward\(\)[\s\S]*step\(\)/);
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

test('all custom Python examples parse and the two pure-Python examples produce the documented numbers', () => {
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
