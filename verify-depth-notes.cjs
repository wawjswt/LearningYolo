// Run: node verify-depth-notes.cjs [optional-example-export.json]
const fs=require('node:fs');
const vm=require('node:vm');
const assert=require('node:assert/strict');
const context=vm.createContext({window:{},document:{addEventListener(){}},console});
for(const name of ['data.js','textbook-v2.js','textbook-exercises.js','textbook-training-lifecycle.js']){
  vm.runInContext(fs.readFileSync('dist/'+name,'utf8'),context,{filename:name});
}
const lessons=vm.runInContext('lessons',context);
const expectedAdditions={gradient:4,losses:3,optimizer:4,training:3};
const originals=new Map(lessons.map(lesson=>[lesson.id,lesson.sections.slice()]));
vm.runInContext(fs.readFileSync('dist/textbook-depth-notes.js','utf8'),context,{filename:'textbook-depth-notes.js'});
const examples=[];
for(const lesson of lessons){
  const before=originals.get(lesson.id);
  before.forEach((section,index)=>assert.equal(lesson.sections[index],section,'Existing section index changed: '+lesson.id));
  assert.equal(lesson.sections.length-before.length,expectedAdditions[lesson.id]||0);
  for(const [index,section] of lesson.sections.entries()){
    assert.ok(section.paragraphs.length>0,lesson.id+': empty explanation');
    const exercise=section.exercise;
    assert.ok(exercise,'Missing section exercise: '+lesson.id+' '+index);
    assert.ok(exercise.q&&exercise.why,'Exercise needs a question and explanation');
    assert.ok(exercise.options.length>=2&&exercise.options.every(option=>typeof option==='string'));
    assert.ok(Number.isInteger(exercise.answer)&&exercise.answer>=0&&exercise.answer<exercise.options.length);
    if(section.code)examples.push({lesson:lesson.id,title:section.title,code:section.code});
  }
  assert.ok(lesson.chapterExercises?.length,'Chapter review missing: '+lesson.id);
  for(const exercise of lesson.chapterExercises)assert.ok(exercise?.q&&exercise.options?.length,'Invalid chapter exercise: '+lesson.id);
  if(expectedAdditions[lesson.id]){
    for(const source of lesson.sources)assert.match(source.url,/^https:\/\//);
  }
}
assert.equal(examples.length,7,'Each new code example should be exportable');
const html=fs.readFileSync('dist/index.html','utf8');
assert.ok(html.includes('textbook-depth-notes.js?v=20261020-depth1'));
assert.ok(html.indexOf('textbook-training-lifecycle.js')<html.indexOf('textbook-depth-notes.js'));
assert.ok(html.indexOf('textbook-depth-notes.js')<html.indexOf('textbook-ui-v3.js'));
assert.doesNotMatch(fs.readFileSync('dist/textbook-depth-notes.js','utf8'),/视频中提到|视频里|本视频|来源视频/);
if(process.argv[2])fs.writeFileSync(process.argv[2],JSON.stringify(examples,null,2));
// Reuse the repository's DOM fixture and execute the real entrypoint script order.
// This checks data and render integration without duplicating the renderer.
const fixture=fs.readFileSync('verify.cjs','utf8').split("for (const file of ['data.js'")[0];
const harness=new Function('require',fixture+';return {context,content,location};')(require);
const scripts=[...html.matchAll(/<script src="([^"?]+)(?:\?[^" ]*)?"/g)].map(match=>match[1]);
for(const name of scripts){
  if(name==='sidebar.js')continue; // Its separate navigation DOM is outside this lesson fixture.
  vm.runInContext(fs.readFileSync('dist/'+name,'utf8'),harness.context,{filename:name});
}
let renderedExamples=0;
for(const lesson of vm.runInContext('lessons',harness.context)){
  harness.location.hash='#lesson/'+lesson.id;
  vm.runInContext('window.render()',harness.context);
  const rendered=harness.content.innerHTML;
  assert.ok(rendered.includes('chapter-toc')&&rendered.includes('chapter-quiz'),'Incomplete rendered course: '+lesson.id);
  if(expectedAdditions[lesson.id])renderedExamples+=(rendered.match(/data-copy-fragment=/g)||[]).length;
}
assert.equal(renderedExamples,7,'New inline examples must render with copy buttons');
console.log('PASS: '+lessons.length+' courses load and render with complete exercises; 14 new sections and 7 inline code examples; original section positions preserved.');
