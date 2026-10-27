const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

// Exercise the real delegated listener with the same ancestor matching as the panel DOM.
function fixture() {
  const handlers = {};
  const nodes = new Map();
  const el = () => ({dataset:{},style:{},textContent:'',innerHTML:'',disabled:false,
    classList:{toggle(){}},setAttribute(){},focus(){}});
  const root = {
    dataset:{},
    querySelector(selector) { if (!nodes.has(selector)) nodes.set(selector,el()); return nodes.get(selector); },
    querySelectorAll(selector) { return selector === '[data-case-step]' ? steps : []; }
  };
  const steps = Array.from({length:7},(_,i)=>Object.assign(el(),{dataset:{caseStep:String(i)}}));
  const document = {
    addEventListener(type, fn) { handlers[type]=fn; },
    querySelector(selector) { return selector === '[data-detection-pipeline]' ? root : null; }
  };
  const context = {document, console}; context.window=context;
  vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../dist/textbook-pipeline.js'),'utf8'),context);
  context.detectionPipeline.initialize();
  function click(attribute, value) {
    const element=el();
    if(attribute==='data-case-step') element.dataset.caseStep=String(value);
    if(attribute==='data-case-target') element.dataset.caseTarget=value;
    if(attribute==='data-case-split') element.dataset.caseSplit=value;
    element.closest=selector=>{
      if(selector==='[data-detection-pipeline]') return root;
      if(selector==='['+attribute+']') return element;
      if(selector==='[data-case-step]' && root.dataset.caseStep!==undefined) return root;
      return null;
    };
    handlers.click({target:element});
  }
  function input(attribute, value) {
    const element={value:String(value),closest:selector=>selector==='[data-detection-pipeline]'?root:null,
      matches:selector=>selector==='['+attribute+']'};
    handlers.input({target:element});
  }
  return {root,click,input,node:selector=>root.querySelector(selector)};
}

test('pipeline controls work after initialization instead of being treated as step clicks',()=>{
  const f=fixture();
  f.click('data-case-next');
  assert.match(f.node('[data-case-title]').textContent,/模型输入/);
  f.input('data-case-input-size',800);
  assert.equal(f.node('[data-case-output="inputSize"]').textContent,'800');
  assert.match(f.node('[data-case-resolution]').innerHTML,/800 × 800/);
  f.click('data-case-previous');
  assert.match(f.node('[data-case-title]').textContent,/数据与标注/);
  f.click('data-case-split','random');
  assert.match(f.node('[data-case-live]').textContent,/偏乐观/);
  f.click('data-case-step',2);
  f.click('data-case-flip');
  assert.match(f.node('[data-case-flip]').textContent,/已开启/);
  f.click('data-case-step',3);
  f.click('data-case-target','bicycle');
  assert.match(f.node('[data-case-anchor-table]').innerHTML,/自行车/);
  f.click('data-case-step',5);
  f.input('data-case-confidence',0.9);
  assert.equal(f.node('[data-case-output="confidence"]').textContent,'0.90');
  assert.match(f.node('[data-case-nms-readout]').innerHTML,/分数没有超过阈值/);
  f.click('data-case-class-mode');
  assert.match(f.node('[data-case-class-mode]').textContent,/不区分/);
  f.click('data-case-reset');
  assert.match(f.node('[data-case-title]').textContent,/数据与标注/);
});
