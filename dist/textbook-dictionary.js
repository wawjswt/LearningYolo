/* 复用全站词典的独立速查入口；筛选状态仅保留在本次页面会话。 */
(()=>{
  const state={query:'',category:'all',page:0};
  const pageSize=24;
  const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const catalog=()=>window.visionlabGlossary;
  const categories=()=>window.visionlabDictionaryContent.categories;
  const categoryName=id=>categories().find(pair=>pair[0]===id)?.[1]||'基础概念';
  const href=id=>'#dictionary/'+encodeURIComponent(id);
  const termLink=id=>{const item=catalog().byId[id];return item?'<a href="'+href(id)+'">'+esc(item.title)+'</a>':''};
  const lessonsList=()=>typeof lessons!=='undefined'?lessons:[];
  function selectedId(){try{return decodeURIComponent(location.hash.split('/')[1]||'')}catch{return ''}}
  function filtered(){
    const q=state.query.trim();
    const all=q?catalog().search(q,Infinity):catalog().items.slice().sort((a,b)=>a.title.localeCompare(b.title,'zh-Hans-CN'));
    return all.filter(item=>state.category==='all'||item.dictionary?.category===state.category);
  }
  function resultMarkup(){
    const matches=filtered(),pages=Math.max(1,Math.ceil(matches.length/pageSize));
    state.page=Math.min(state.page,pages-1);
    const first=state.page*pageSize,items=matches.slice(first,first+pageSize),selected=selectedId();
    return '<p class="dictionary-result-count" role="status">'+(state.query?'“'+esc(state.query)+'” · ':'')+matches.length+' 个词条'+(matches.length?' · '+(first+1)+'–'+Math.min(first+pageSize,matches.length):'')+'</p>'
      +(selected&&catalog().byId[selected]&&!matches.some(item=>item.id===selected)?'<p class="dictionary-filter-notice">当前词条不在筛选结果中。<button type="button" data-dictionary-clear>显示全部</button></p>':'')
      +(items.length?'<ul class="dictionary-word-list">'+items.map(item=>'<li><a href="'+href(item.id)+'"'+(item.id===selected?' aria-current="true"':'')+'><strong>'+esc(item.title)+'</strong><span>'+esc(item.plainExplanation)+'</span><small>'+esc(categoryName(item.dictionary?.category))+'</small></a></li>').join('')+'</ul>':'<div class="dictionary-empty"><strong>没有找到匹配词条</strong><p>试试中文名、英文全称或 API 名称，例如“梯度”“backward”“CrossEntropyLoss”；也可以清除当前分类。</p><button type="button" data-dictionary-clear>清除搜索和分类</button></div>')
      +'<nav class="dictionary-pagination" aria-label="词条列表分页"><button type="button" data-dictionary-page="'+(state.page-1)+'" '+(state.page===0?'disabled':'')+'>上一页</button><span>'+(state.page+1)+' / '+pages+'</span><button type="button" data-dictionary-page="'+(state.page+1)+'" '+(state.page>=pages-1?'disabled':'')+'>下一页</button></nav>';
  }
  function related(item){
    const explicit=item.dictionary?.related||[];
    const sameCourse=catalog().items.filter(other=>other.id!==item.id&&other.learnMore===item.learnMore).map(other=>other.id);
    return [...new Set([...explicit,...sameCourse])].filter(id=>id!==item.id&&catalog().byId[id]).slice(0,5);
  }
  function lessonLinks(item){
    const id=item.learnMore.replace('#lesson/','').split('/')[0],lesson=lessonsList().find(record=>record.id===id);
    return lesson?'<a class="dictionary-course-link" href="'+esc(item.learnMore)+'"><small>相关课程 · 继续深入</small><strong>'+esc(lesson.title)+' ↗</strong><span>这里提供相关基础或延伸讲解；部分工程与序列模型词条以本页速查为主。</span></a>':'';
  }
  function detail(item){
    const d=item.dictionary||{},aliases=item.aliases.filter(alias=>alias!==item.title).slice(0,12);
    const source=d.source,relatedTerms=related(item);
    return '<article class="dictionary-entry" aria-labelledby="dictionary-entry-title"><div class="dictionary-entry-meta"><span>'+esc(categoryName(d.category))+'</span><button type="button" data-dictionary-copy-link>复制词条链接</button></div>'
      +'<h2 id="dictionary-entry-title" tabindex="-1">'+esc(item.title)+'</h2>'
      +'<p class="dictionary-aliases"><span>也可这样查：</span>'+aliases.map(alias=>'<code>'+esc(alias)+'</code>').join(' ')+'</p>'
      +'<section><h3>是什么</h3><p class="dictionary-definition">'+esc(item.plainExplanation)+'</p></section>'
      +(d.why?'<section><h3>为什么需要它</h3><p>'+esc(d.why)+'</p></section>':'')
      +'<section class="dictionary-example"><h3>从一个例子理解</h3><p>'+esc(d.example||item.metaphor)+'</p></section>'
      +(d.formula?'<section class="dictionary-formula"><h3>表达式与符号</h3><div>\\['+esc(d.formula)+'\\]</div><p>'+esc(d.symbols)+'</p></section>':'')
      +(item.contextNote?'<section><h3>放回具体场景</h3><p>'+esc(item.contextNote)+'</p></section>':'')
      +(d.code?'<section><h3>PyTorch 用法</h3><div class="code-block"><div class="code-head"><span>Python · '+(d.code.split('\n').some(line=>line&&!line.startsWith('#')&&!line.startsWith('import '))?'最小示例':'用法片段，先准备注释中的对象')+'</span><button type="button" data-dictionary-copy-code>复制代码</button></div><pre><code id="dictionary-code">'+esc(d.code)+'</code></pre></div><p class="dictionary-code-note">需在安装 PyTorch 的 Python 环境运行。示例中的随机数会变化；维度、API 与设备支持以你的安装版本为准。</p></section>':'')
      +(d.pitfall?'<section class="dictionary-caution"><h3>容易混淆的地方</h3><p>'+esc(d.pitfall)+'</p></section>':'')
      +(item.formalDefinition?'<details class="dictionary-more"><summary>进阶说明</summary><p>'+esc(item.formalDefinition)+'</p></details>':'')
      +(relatedTerms.length?'<section><h3>一起理解这些词</h3><div class="dictionary-related">'+relatedTerms.map(termLink).join('')+'</div></section>':'')
      +lessonLinks(item)
      +'<footer class="dictionary-source"><strong>查阅依据</strong>'+(source?'<a href="'+esc(source.url)+'" target="_blank" rel="noopener noreferrer">'+esc(source.label)+' ↗</a>':'<span>本站课程与术语解释</span>')+'<a href="resources/deep-learning-terms-pytorch-guide.pdf'+(d.pdfPage?'#page='+d.pdfPage:'')+'" target="_blank" rel="noopener">深度学习与 PyTorch 参考手册'+(d.pdfPage?' · 第 '+d.pdfPage+' 页':'')+' ↗</a><p>条目按概念和使用条件整理；手册中的简化说法已在相应词条补充边界。框架行为请对照所用版本的官方文档。</p></footer></article>';
  }
  const welcome=()=>'<article class="dictionary-welcome"><span class="chapter-kicker">LOOK IT UP · THEN CONNECT THE IDEAS</span><h2>遇到一个词，先查清它在做什么。</h2><p>左侧按名称或主题找词；点开后查看定义、例子和相关课程。有公式、API 或常见误区的词条，会在解释后继续展开。</p><h3>把术语放回训练过程</h3><p>下面是一条监督学习的常见流程。每个节点都能打开完整词条。</p><ol class="dictionary-flow">'+[['sample','样本与标签'],['forward-pass','前向计算'],['loss','损失'],['backpropagation','反向传播'],['optimizer-step','更新参数']].map(([id,label],i)=>'<li><a href="'+href(id)+'"><span>0'+(i+1)+'</span><strong>'+label+'</strong></a></li>').join('')+'</ol><p class="dictionary-flow-note">训练会重复这个流程；纯推理通常只做输入、前向和后处理。反向计算梯度，优化器才负责更新。</p><h3>最容易查混的几组</h3><div class="dictionary-comparisons">'+[
    ['梯度与更新',['backpropagation','optimizer-step','zero-grad']],
    ['评估时的两个开关',['eval-mode','no-grad','inference-mode']],
    ['形状与轴顺序',['reshape','view','permute']],
    ['分类分数与目标',['logit','cross-entropy-loss','bce-with-logits']]
  ].map(([label,ids])=>'<section><h4>'+label+'</h4><div class="dictionary-related">'+ids.map(termLink).join('')+'</div></section>').join('')+'</div><a class="dictionary-manual" href="resources/deep-learning-terms-pytorch-guide.pdf" target="_blank" rel="noopener">打开原始参考手册 · PDF · 49 页 ↗</a></article>';
  function render(id){
    let decoded;try{decoded=decodeURIComponent(id||'')}catch{decoded=''}
    const item=catalog().byId[decoded],isDetail=!!id;
    return '<div class="dictionary-page'+(isDetail?' has-selection':'')+'"><div class="dictionary-heading"><span class="chapter-kicker">THE REFERENCE DESK</span><h1>术语速查</h1><p>'+catalog().items.length+' 个词条 · 中文、英文与 PyTorch API 一起查。先弄懂含义，再回到课程深入学习。</p></div><div class="dictionary-controls"><label for="dictionary-search">查一个概念或 API</label><div class="dictionary-search-row"><input id="dictionary-search" type="search" value="'+esc(state.query)+'" placeholder="例如：批量归一化、detach、CrossEntropyLoss" autocomplete="off"><button type="button" data-dictionary-clear>重置</button></div><div class="dictionary-categories" role="group" aria-label="按主题筛选"><button type="button" data-dictionary-category="all" aria-pressed="'+(state.category==='all')+'">全部 <small>'+catalog().items.length+'</small></button>'+categories().map(([key,label])=>'<button type="button" data-dictionary-category="'+key+'" aria-pressed="'+(state.category===key)+'">'+label+' <small>'+catalog().items.filter(t=>t.dictionary?.category===key).length+'</small></button>').join('')+'</div></div><a class="dictionary-back" href="#dictionary">← 返回词条列表</a><div class="dictionary-layout"><aside class="dictionary-index" aria-label="词条列表"><div id="dictionary-results">'+resultMarkup()+'</div></aside><div class="dictionary-reading">'+(item?detail(item):isDetail?'<article class="dictionary-empty"><h2>没有这个词条</h2><p>链接可能不完整。可以用上方搜索框查找，或返回完整词表。</p><a href="#dictionary">返回术语速查</a></article>':welcome())+'</div></div></div>';
  }
  function updateResults(){
    const root=document.getElementById('dictionary-results');if(!root)return;
    root.innerHTML=resultMarkup();
    document.querySelectorAll('[data-dictionary-category]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.dictionaryCategory===state.category)));
    const input=document.getElementById('dictionary-search');if(input&&input.value!==state.query)input.value=state.query;
    const header=document.getElementById('search');if(header)header.value=state.query;
  }
  function setQuery(value){
    state.query=String(value||'');state.page=0;
    if(selectedId()&&window.matchMedia('(max-width:760px)').matches){
      history.replaceState({},'',location.pathname+location.search+'#dictionary');
      window.render();window.scrollTo(0,0);
    }else updateResults();
  }
  function initialize(){
    if(!location.hash.startsWith('#dictionary'))return;
    const header=document.getElementById('search');if(header)header.value=state.query;
  }
  document.addEventListener('input',event=>{if(event.target.id==='dictionary-search')setQuery(event.target.value)});
  document.addEventListener('click',async event=>{
    const button=event.target.closest('button');if(!button)return;
    if(button.hasAttribute('data-dictionary-clear')){state.query='';state.category='all';state.page=0;updateResults();document.getElementById('dictionary-search')?.focus();return;}
    if(button.dataset.dictionaryCategory){state.category=button.dataset.dictionaryCategory;state.page=0;updateResults();return;}
    if(button.hasAttribute('data-dictionary-page')){state.page=Math.max(0,Number(button.dataset.dictionaryPage)||0);updateResults();document.querySelector('.dictionary-word-list a')?.focus();return;}
    if(button.hasAttribute('data-dictionary-copy-code')||button.hasAttribute('data-dictionary-copy-link')){
      const value=button.hasAttribute('data-dictionary-copy-code')?document.getElementById('dictionary-code')?.textContent:location.href;
      try{await navigator.clipboard.writeText(value||'');if(typeof toast==='function')toast(button.hasAttribute('data-dictionary-copy-code')?'代码已复制':'词条链接已复制');}
      catch{if(typeof toast==='function')toast('复制失败，请手动选择内容复制。');}
    }
  });
  window.visionlabDictionary={render,initialize,setQuery,getQuery:()=>state.query};
})();
