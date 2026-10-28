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

test('YOLO examples keep units, model assumptions and explanations in their intended sections', () => {
  const course = id => courses.find(c => c.id === id);
  const anchor = course('anchors').sections.flatMap(s => s.paragraphs).find(p => p.includes('匹配计算式'));
  assert.match(anchor, /两者须使用相同单位/);
  assert.doesNotMatch(anchor, /是换成同一网格单位后的Anchor宽高/);
  const head = course('yolo-head').sections.flatMap(s => s.paragraphs).find(p => p.includes('三个输出卷积的参数分别'));
  assert.match(head, /80类/);
  const checkerText = course('yolo-head').sections.flatMap(s => s.paragraphs).find(p => p.includes('脚本分别用训练模式读取原始多尺度列表'));
  assert.match(checkerText, /每个检测尺度的形状/);
  assert.match(checkerText, /冻结BN统计/);
  const p2 = course('yolo-head').sections.find(s => s.id === 'head-p2-contract').paragraphs.join(' ');
  assert.match(p2, /\[1,102000,7\]/);
  assert.match(p2, /随机初始化与配置中的占位Anchor/);
  assert.equal(course('train-yolo').sections.find(s => s.trainDetail !== undefined).id, 'repo-training-loop');
  assert.equal(course('inference').sections.find(s => s.nmsDetail !== undefined).id, 'inference-s-hlnnlcv');
  assert.equal(course('yolo-data').sections.find(s => s.dataPractice !== undefined).id, 'yolo-data-paths');
  const assignment = course('yolo-assignment').sections.find(s => s.assignmentAll !== undefined);
  const assignmentFigure = context.visionlabYoloLearning.renderParagraph(assignment, assignment.assignmentAll);
  assert.match(assignmentFigure, /一处火焰如何得到9条匹配/);
  assert.match(assignmentFigure, /中心 \(42,37\)/);
  assert.match(assignmentFigure, /左邻 \(41,37\)/);
  assert.match(assignmentFigure, /下邻 \(42,38\)/);
  assert.equal((assignmentFigure.match(/>匹配<\/text>/g) || []).length, 9);
  assert.deepEqual([[10,13],[16,30],[33,23]].map(([w,h]) => Math.max(32/w,w/32,16/h,h/16) < 4), [true,true,true]);
  const exportText = course('yolo-export').sections.find(s => s.id === 'export-check').paragraphs.join(' ');
  assert.match(exportText, /python export\.py --weights/);
  assert.match(exportText, /--nms 选项标为 TensorFlow 路线使用/);
  assert.match(exportText, /经过NMS，候选数量或排列顺序可能/);
  const rcnnSection = course('detection-two-stage').sections.find(s => s.rcnnDiagram !== undefined);
  const rcnnFigure = context.visionlabYoloLearning.renderParagraph(rcnnSection, rcnnSection.rcnnDiagram);
  assert.match(rcnnFigure, /fc7 → 各类别线性 SVM/);
  assert.match(rcnnFigure, /pool5 → 线性框回归/);
  const checkpoint = course('train-yolo').sections.flatMap(s => s.exercise ? [s.exercise] : []).find(e => e.q.includes('best.pt 与 last.pt'));
  assert.match(checkpoint.options[checkpoint.answer], /模型权重/);
  assert.match(checkpoint.why, /续训还需检查/);
});

test('YOLO command identifiers and environment activation keep their intended meaning', () => {
  const matches = text => context.visionlabGlossary.matchesIn(text).map(item => item.alias);
  assert.equal(matches('运行 train.py --batch-size 4，查看 data.yaml。').length, 0);
  assert.equal(matches('创建 Python 虚拟环境，按系统激活它。').includes('激活'), false);
  assert.equal(matches('环境激活写法因终端而异。').includes('激活'), false);
  assert.equal(matches('SiLU 是激活函数。').includes('激活函数'), true);
  assert.deepEqual(Array.from(matches('支持向量机'), String), ['支持向量机']);
  assert.equal(matches('线性 SVM 给候选打分。').includes('SVM'), true);
  assert.deepEqual(Array.from(matches('两阶段检测与一阶段检测'), String), ['两阶段检测', '一阶段检测']);
});

test('YOLO layer ledger follows real sources and produces correct rectangular detection shapes', () => {
  const ledger = run('window.visionlabYoloLayerLedger');
  const square = ledger(640, 640, 2);
  const rectangle = ledger(640, 480, 2);
  assert.equal(square.length, 25);
  assert.deepEqual(Array.from(square[19].sources), [18, 14]);
  assert.deepEqual(Array.from(square[22].sources), [21, 10]);
  assert.deepEqual(Array.from(square[16].inputs, x => Array.from(x)), [[1,256,80,80],[1,256,80,80]]);
  assert.deepEqual(Array.from(square[16].output), [1,512,80,80]);
  assert.deepEqual(Array.from(square[24].outputs, x => Array.from(x)), [[1,3,80,80,7],[1,3,40,40,7],[1,3,20,20,7]]);
  assert.deepEqual(Array.from(rectangle[24].outputs, x => Array.from(x)), [[1,3,80,60,7],[1,3,40,30,7],[1,3,20,15,7]]);
  assert.equal(rectangle[24].candidates, 18900);
});

test('street-scene recap connects the same boxes and computes both interactive examples', () => {
  const lesson = courses.find(item => item.id === 'cv-synthesis');
  const section = name => lesson.sections.find(item => item.id === 'cv-synthesis-'+name);
  const visual = name => context.visionlabCvEditorial.renderParagraph(section(name), 0);
  for (const name of ['story','dataset-journey','data','window','features','scale','prediction','target-loss','learning','training-walk','validation','inference','metrics','ap-walk','hands-on','bridge']) assert.ok(visual(name).length > 50, `visual in ${name}`);
  assert.match(visual('data'), /600 × 300.*640 × 320.*640 × 640/s);
  assert.match(visual('data'), /64, 288, 213\.3, 352/);
  assert.match(visual('metrics'), /左车 0\.95.*背景 0\.75.*右车 0\.35/s);
  assert.match(section('story').paragraphs.join(' '), /0 0\.2167 0\.5 0\.2333 0\.2/);
  assert.match(section('inference').paragraphs.join(' '), /\\frac\{7200\}\{9600\}=0\.75/);
  assert.equal((120*60)/(2*140*60-120*60), .75);
  assert.equal(section('metrics').exercise.revision, 'street-v2');
  assert.equal(section('metrics').legacyIndex, 7);
  assert.equal(lesson.chapterExercises[2].revision, 'street-v2');

  const handler = handlers.find(h => h.type === 'input' && h.fn.toString().includes('[data-recap-weight]'));
  assert.ok(handler);
  const fields = Object.fromEntries(['[data-recap-weight-display]','[data-recap-weight-output]','[data-recap-conv-result]','[data-recap-relu-result]'].map(key => [key, {textContent:''}]));
  const weightRoot = {querySelector: key => fields[key]};
  const weightInput = {value:'1', closest: () => weightRoot};
  handler.fn({target:{closest: key => key === '[data-recap-weight]' ? weightInput : null}});
  assert.equal(fields['[data-recap-conv-result]'].textContent, 5);
  assert.equal(fields['[data-recap-relu-result]'].textContent, 'ReLU 后为 5');
  weightInput.value = '-2';
  handler.fn({target:{closest: key => key === '[data-recap-weight]' ? weightInput : null}});
  assert.equal(fields['[data-recap-conv-result]'].textContent, -7);
  assert.equal(fields['[data-recap-relu-result]'].textContent, 'ReLU 后为 0');

  const output = {textContent:''}, stats = {textContent:''};
  const candidates = [.95,.75,.35].map(score => ({dataset:{summaryCandidate:String(score)},textContent:String(score),classList:{toggle(){}},setAttribute(){}}));
  const thresholdRoot = {querySelector:key => key === '[data-summary-value]' ? output : stats, querySelectorAll:() => candidates};
  const thresholdInput = {value:'0.70',closest:() => thresholdRoot};
  const event = {target:{closest:key => key === '[data-summary-input]' ? thresholdInput : null}};
  handler.fn(event);
  assert.match(stats.textContent, /TP 1，FP 1，FN 1；P 50\.0%，R 50\.0%/);
  thresholdInput.value = '0.30'; handler.fn(event);
  assert.match(stats.textContent, /TP 2，FP 1，FN 0；P 66\.7%，R 100\.0%/);
  thresholdInput.value = '1.00'; handler.fn(event);
  assert.match(stats.textContent, /TP 0，FP 0，FN 2；P 未定义，R 0\.0%/);
});

test('street recap slides the window and its runnable matching example agrees with the lesson', () => {
  const lesson = courses.find(item => item.id === 'cv-synthesis');
  const windowHandler = handlers.find(h => h.type === 'click' && h.fn.toString().includes('[data-recap-window]'));
  const output = {textContent:''};
  const buttons = Array.from({length:4}, (_,i) => ({dataset:{recapWindow:String(i)},setAttribute(k,v){this[k]=v}}));
  const root = {querySelector:()=>output,querySelectorAll:()=>buttons};
  buttons.forEach(button=>button.closest=()=>root);
  windowHandler.fn({target:{closest:()=>buttons[1]}});
  assert.match(output.textContent, /2×1.*1×\(−1\) = 1/);
  assert.equal(buttons[1]['aria-pressed'], 'true');
  assert.equal(buttons[0]['aria-pressed'], 'false');
  const code = lesson.sections.find(s=>s.id==='cv-synthesis-hands-on').code;
  const result = spawnSync('python',['-X','utf8','-c',code],{encoding:'utf8'});
  assert.equal(result.status,0,result.stderr);
  assert.equal(result.stdout.trim().replace(/\r/g,''),'(1, 1, 1)\n(2, 1, 0)');
  assert.ok(Math.abs((.5*1+.5*2/3)-5/6)<1e-12);
});

test('beginner definitions include concrete samples before technical details', () => {
  const text=id=>courses.find(c=>c.id===id).sections.flatMap(s=>s.paragraphs).join(' ');
  assert.match(text('ai-foundations'),/一张图片是一个样本.*标签.*数据集.*推理/);
  assert.match(text('ai-foundations'),/2×1\+3×\(−1\)\+0.5=−0.5/);
  assert.match(text('tensor'),/元素总数是 2×3=6.*两条轴/);
  assert.match(text('network'),/Linear\(2,3\).*3×2\+3=9.*weight 形状是 \[3,2\].*\[16,2\].*\[16,3\]/);
  assert.match(text('network-outputs'),/\[2,1,0\].*\[0.665,0.245,0.090\]/);
  assert.match(text('loss-probabilities'),/\[7.389,2.718,1.105\].*11.212/);
  assert.match(text('losses'),/\(4\+9\)\/2=6.5.*\(2\+3\)\/2=2.5/);
  assert.match(text('gradient'),/8.8804.*−11.96.*导数−12/);
  assert.match(text('gradient-chain-rule'),/a=2w.*−6×2=−12/);
  assert.ok(Math.abs(((2*1.01-5)**2-9)/.01+11.96)<1e-9);
  const logits=[2,1,0],exps=logits.map(Math.exp),total=exps.reduce((a,b)=>a+b,0);
  for(const [i,want] of [.665,.245,.090].entries())assert.ok(Math.abs(exps[i]/total-want)<.0005);
});

test('YOLO second batch carries one labelled box through matching, loss and inference', () => {
  const text = id => courses.find(item => item.id === id).sections.flatMap(section => section.paragraphs).join(' ');
  const caseData = run('window.visionlabYoloLearning.teachingCase');
  assert.deepEqual(Array.from(caseData.targetXYWH), [530,220,50,25]);
  assert.match(text('yolo-assignment'), /\[0,1,0\.53,0\.47,0\.05,0\.025\]/);
  assert.match(text('yolo-assignment'), /3组P3.*2组P4.*P5.*没有通过/);
  const lossText = text('yolo-loss');
  assert.match(lossText, /CIoU\}=1.*L_\{box\}=1-\\mathrm\{CIoU\}=0/);
  assert.match(lossText, /L_\{obj\}=-\\ln\(0\.9\).*0\.10536/);
  assert.match(lossText, /L_\{cls\}=.*0\.22314/);
  const anchorFigure = courses.find(item => item.id === 'anchors').sections.find(section => section.beginnerFigure === 'anchor-matches');
  assert.ok(anchorFigure, 'Anchor lesson exposes the nine-match calculation');
  context.__testSection = anchorFigure;
  const anchorMarkup = run('window.visionlabYoloLearning.renderParagraph(window.__testSection, window.__testSection.beginnerAfter)');
  assert.match(anchorMarkup, /P3/);
  assert.match(anchorMarkup, /P4/);
  assert.match(anchorMarkup, /P5/);
  assert.match(anchorMarkup, /3\.8125/);
  assert.match(anchorMarkup, /5\.625/);
  const inference = courses.find(item => item.id === 'inference').sections.find(section => section.id === 'inference-s-h1993c6k');
  assert.ok(inference);
  context.__testSection = inference;
  const inferenceMarkup = run('window.visionlabYoloLearning.renderParagraph(window.__testSection, window.__testSection.beginnerAfter)');
  assert.match(inferenceMarkup, /339\.2/);
  assert.match(inferenceMarkup, /300\.8/);
  assert.match(inferenceMarkup, /505/);
  assert.match(inferenceMarkup, /232\.5/);
});

test('YOLO training explains an optimizer update numerically and distinguishes it from a batch', () => {
  const lesson = courses.find(item => item.id === 'train-yolo');
  const body = lesson.sections.flatMap(section => section.paragraphs).join(' ');
  assert.match(body, /L\(w\)=\(w-3\)\^2/);
  assert.match(body, /w=1/);
  assert.match(body, /2\(w-3\)=-4/);
  assert.match(body, /\\eta=0\.1/);
  assert.match(body, /1\.4/);
  const updateCode = lesson.sections.find(section => section.codeLabel === 'Python · 单参数梯度下降演示');
  assert.ok(updateCode);
  assert.match(updateCode.code, /loss\.backward\(\)[\s\S]*optimizer\.step\(\)/);
  assert.match(body, /梯度累积.*一个batch.*不一定.*一次参数更新/);
  assert.match(body, /runs\/train\/.*weights/);
});

test('YOLO validation, export and troubleshooting give ordered checks rather than vague advice', () => {
  const text = id => courses.find(item => item.id === id).sections.flatMap(section => section.paragraphs).join(' ');
  assert.match(text('yolo-evaluation'), /TP.*FP.*FN.*Precision.*Recall.*AP/);
  assert.match(text('yolo-evaluation'), /三个门槛.*NMS IoU阈值.*验证IoU阈值/);
  assert.match(text('yolo-checkpoints'), /初始化.*微调.*恢复/);
  assert.match(text('yolo-augment'), /图像.*框.*同步/);
  assert.match(text('yolo-export'), /同一张原图预处理.*原始\/解码输出.*NMS/);
  assert.match(text('debugging'), /框整体偏移.*类别错.*漏检.*画面无框/);
});

test('basic examples stay in the relevant lesson and appear before their later use', () => {
  const lesson=id=>courses.find(c=>c.id===id);
  const body=id=>lesson(id).sections.flatMap(s=>s.paragraphs).join(' ');
  assert.doesNotMatch(body('loss-regression'),/Softmax 保持 logits/);
  assert.match(body('loss-probabilities'),/Softmax 保持 logits/);
  assert.match(body('loss-regression'),/Huber=1×\(2−0.5\)=1.5/);
  assert.match(body('loss-theory-cross-entropy'),/0.693 nat.*1.204 nat.*0.511/);
  const layout=lesson('tensor-layout').sections;
  assert.match(layout[1].title,/内存、shape/);
  assert.match(layout[2].title,/连续性/);
  assert.match(body('gradient'),/输入 x=2、参考答案 y=5/);
  assert.match(body('training-loop'),/训练可以有随机裁剪.*验证通常使用确定性处理/);
  assert.match(body('metrics'),/IoU（交并比）是两个框重叠面积/);
  assert.match(body('yolo-evaluation'),/精确率Precision/);
  assert.match(body('train-yolo'),/P（精确率）.*R（召回率）.*AP/);
  assert.ok(Math.abs(-.5*Math.log(.9)-.5*Math.log(.1)-1.2039728)<1e-6);
  assert.ok(Math.abs((-.5*Math.log(.9)-.5*Math.log(.1))-Math.log(2)-.5108256)<1e-6);
});

test('the introductory Linear example matches PyTorch parameter and output shapes', {skip:!process.env.VISIONLAB_TORCH_PYTHON}, () => {
  const code='import torch\nm=torch.nn.Linear(2,3)\nassert tuple(m.weight.shape)==(3,2)\nassert tuple(m.bias.shape)==(3,)\nassert sum(p.numel() for p in m.parameters())==9\nassert tuple(m(torch.zeros(16,2)).shape)==(16,3)';
  const result=spawnSync(process.env.VISIONLAB_TORCH_PYTHON,['-c',code],{encoding:'utf8'});
  assert.equal(result.status,0,result.stderr);
});

test('narrative order follows the calculation before tuning, diagnosis and reference material', () => {
  const expected={
    'tensor-operations':['tensor-s-hkdzb3y','tensor-s-heqw76k'],
    'optimizer-momentum':['optimizer-s-h1fiuhc','optimizer-s-h18osnmd','optimizer-s-h1u12m8n','optimizer-s-h9acvek'],
    'anchors':['anchors-s-h1qk8bam','anchors-s-h39ptah','anchors-s-hhcndxb','anchor-range','anchors-s-htomdot','repo-autoanchor'],
    'train-yolo':['train-yolo-s-h1pof1wi','repo-training-loop','train-yolo-s-hkh4g0o','train-yolo-s-hc5ufri'],
    'inference':['inference-s-h1xm23xg','repo-inference-coordinates','architecture-s-h1a1b2kj','inference-s-hlnnlcv','inference-s-h1993c6k']
  };
  for(const [id,order] of Object.entries(expected)){
    const c=courses.find(item=>item.id===id);
    assert.deepEqual(Array.from(c.sections,s=>s.id),order,id);
    assert.equal(new Set(c.sections.map(s=>s.legacyIndex)).size,c.sections.length,id+' legacy anchors');
    assert.ok(c.sections.every((s,i)=>s.title.startsWith((i+1)+'. ')),id+' numbered titles');
    const rendered=context.lesson(id);
    let previous=-1;
    for(const section of c.sections){
      const position=rendered.indexOf('id="section-'+section.id+'"');
      assert.ok(position>previous,id+' rendered order: '+section.id);
      previous=position;
    }
  }
  const tensor=courses.find(c=>c.id==='tensor-operations');
  assert.equal(tensor.sections[1].narrativePlaygroundIndex,0);
  assert.equal(tensor.sections[0].playgroundId,'tensor-operations');
});

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

test('YOLO model changes explain class remapping, P2, and decoupled packing as complete procedures', () => {
  const head = courses.find(l => l.id === 'yolo-head');
  const sectionText = index => head.sections[index].paragraphs.join(' ');
  const classes = sectionText(6) + ' ' + sectionText(7) + ' ' + sectionText(8);
  assert.match(classes, /names.*smoke.*fire/);
  assert.match(classes, /nc=2/);
  assert.match(classes, /256→21.*512→21.*1024→21/);
  assert.match(classes, /intersect_dicts/);
  assert.match(classes, /strict=False.*形状/);
  assert.match(classes, /前向.*训练.*验证/);
  assert.match(sectionText(9), /P2\/4.*160×160/);
  assert.match(sectionText(9), /层21.*层24.*层27.*层30/);
  assert.match(sectionText(10), /25,200.*102,000.*76,800/);
  assert.match(sectionText(10), /不等于.*耗时|不能.*延迟/);
  assert.match(sectionText(11), /分类.*框.*不同|边界.*类别/);
  assert.match(sectionText(11), /\[B,A,4,H,W\].*\[B,A,1,H,W\].*\[B,A,2,H,W\]/);
  assert.match(sectionText(11), /dim=2.*\[B,A,7,H,W\]/);
  assert.match(sectionText(11), /训练.*损失.*解码.*导出/);
});

test('YOLO output shape checker is supplied with the promised CLI and honest scope', () => {
  const checker = join(root, 'assets/yolov5l/verify_detect_shapes.py');
  assert.ok(require('node:fs').existsSync(checker), 'provide the downloadable shape checker');
  const source = readFileSync(checker, 'utf8');
  for (const flag of ['--repo', '--cfg', '--nc', '--height', '--width']) assert.ok(source.includes(flag), flag);
  assert.match(source, /DetectionModel/);
  assert.match(source, /torch\.inference_mode|torch\.no_grad/);
  assert.match(source, /train.*raw|raw.*train/i);
  assert.match(source, /eval.*decoded|decoded.*eval/i);
  assert.match(source, /optimizer|不执行优化|shape-only|shape check/i);
  assert.doesNotMatch(source, /pip install|torch\.hub\.load|load_state_dict_from_url/);
});

test('YOLO bus case announces its different data contract and gives a transfer task', () => {
  const bus = courses.find(l => l.id === 'yolo-trace');
  const opening = bus.sections[0].paragraphs.join(' ');
  assert.match(opening, /烟雾.*火焰|smoke.*fire/);
  assert.match(opening, /810.*1080.*80类/);
  assert.match(bus.worked.prompt + bus.worked.solution, /迁移|公交|810|80类/);
});

test('YOLO opening explanations define each route once and then move the story forward', () => {
  const lesson = id => courses.find(item => item.id === id);
  const twoStage = lesson('detection-two-stage').sections[0].paragraphs.join(' ');
  assert.equal((twoStage.match(/两阶段检测把/g) || []).length, 1);
  assert.match(twoStage, /候选区域.*分类.*框回归/);
  assert.match(twoStage, /候选.*数量|候选.*区域/);

  const oneStage = lesson('detection-one-stage').sections[0].paragraphs.join(' ');
  assert.doesNotMatch(oneStage, /一阶段检测器通常在特征图的许多位置直接预测框与类别相关分数/);
  assert.match(oneStage, /网格.*密集预测/);
  assert.match(oneStage, /筛选|去重/);

  const bottleneck = lesson('yolo-c3').sections[1].paragraphs.join(' ');
  assert.equal((bottleneck.match(/Bottleneck可以先理解成/g) || []).length, 0);
  assert.match(bottleneck, /本版YOLOv5.*两层卷积.*Conv/);
  assert.match(bottleneck, /shortcut.*形状/);
  assert.match(bottleneck, /输入值3.*结果0\.2.*3\.2/);

  const training = lesson('train-yolo').sections[0].paragraphs;
  assert.doesNotMatch(training[0], /第一次运行/);
  assert.match(training[0], /训练是.*调整模型参数/);
  assert.match(training[2], /图片和标签.*仓库根目录/);
  assert.match(training[3], /读命令可以从左到右/);

  const checkpoints = lesson('yolo-checkpoints').sections[1].paragraphs[0];
  assert.match(checkpoints, /^新任务/);
  assert.doesNotMatch(checkpoints, /^预训练权重提供一个已学过的参数起点/);
});

test('YOLO NMS prose uses the same candidate labels and overlap values as its interactive example', () => {
  const lesson = courses.find(item => item.id === 'inference');
  const nms = lesson.sections.find(section => section.id === 'inference-s-hlnnlcv').paragraphs.join(' ');
  assert.match(nms, /A是火焰.*B也是火焰.*C是另一处火焰.*D是烟雾/);
  assert.match(nms, /IoU.*0\.784/);
  assert.doesNotMatch(nms, /A烟雾|D火焰|0\.747/);
});

test('YOLO glossary tooltips preserve complete technical terms', () => {
  for (const [term, id] of [
    ['协变量','covariate'],['BatchNorm','batch-normalization'],['FPN','fpn'],['PAN','pan'],
    ['C3','c3'],['Bottleneck','bottleneck'],['SPPF','sppf'],['Anchor','anchor'],
    ['objectness','objectness'],['IoU','iou'],['CIoU','ciou'],['NMS','nms'],['letterbox','letterbox']
  ]) assert.equal(context.visionlabGlossary.firstTerm(term)?.id,id,term);
});

test('YOLO augmentation and evaluation sections expose their step order at a glance', () => {
  const augmentation = courses.find(item => item.id === 'yolo-augment').sections[0];
  assert.match(augmentation.paragraphs[0], /data YAML.*model YAML.*hyp YAML.*命令行/);
  assert.doesNotMatch(augmentation.paragraphs[0], /假设只有一张/);
  const validation = courses.find(item => item.id === 'yolo-evaluation').sections[0];
  assert.equal(validation.subheadings?.[0], '先数出找对、误报和漏检');
  assert.equal(validation.subheadings?.[4], '改变分数门槛，观察P和R');
  assert.equal(validation.subheadings?.[7], 'AP统计与三种门槛');
});

test('all 24 assembled YOLO lessons stand on their own without requiring a source video', () => {
  const expected = [
    'detection-intro','detection-two-stage','detection-one-stage','yolo-evolution','architecture',
    'yolo-repository','yolo-data','yolo-config','yolo-backbone','yolo-c3','yolo-sppf','yolo-neck',
    'yolo-head','anchors','yolo-assignment','yolo-loss','train-yolo','yolo-checkpoints',
    'yolo-augment','yolo-evaluation','inference','yolo-export','yolo-trace','debugging'
  ];
  const byId = new Map(courses.map(lesson => [lesson.id, lesson]));
  const assembled = expected.map(id => byId.get(id));
  assert.ok(assembled.every(Boolean), 'all planned YOLO lesson IDs are present');
  assert.equal(assembled.reduce((count, lesson) => count + lesson.sections.length, 0), 85);
  for (const lesson of assembled) {
    assert.ok(lesson.sections.length > 0, `${lesson.id} has visible lesson sections`);
    const visibleText = JSON.stringify(lesson);
    assert.doesNotMatch(visibleText, /视频中(?:提到|讲到|说到)|视频里(?:提到|讲到|说到)|看完视频|来源视频/, lesson.id);
  }
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

test('changed YOLO exercise ignores an answer to the old question but restores its own answer', () => {
  const section = courses.find(l => l.id === 'yolo-head').sections[0];
  const base = 'yolo-head:section:' + section.id;
  const revised = base + '@' + section.exercise.revision;
  run('state.exerciseAnswers = ' + JSON.stringify({[base]: 2, ['yolo-head:section:' + section.legacyIndex]: 2}));
  let card = context.lesson('yolo-head').split('id="section-' + section.id + '"')[1].split('class="quiz-result exercise-feedback"')[0];
  assert.ok(card.includes('data-exercise-key="' + revised + '"'));
  assert.doesNotMatch(card, /class="correct" aria-pressed="true"/);
  run('state.exerciseAnswers[' + JSON.stringify(revised) + '] = 2');
  card = context.lesson('yolo-head').split('id="section-' + section.id + '"')[1].split('class="quiz-result exercise-feedback"')[0];
  assert.match(card, /class="correct" aria-pressed="true"/);
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
