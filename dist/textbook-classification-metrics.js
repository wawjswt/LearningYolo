/* Classification-only confusion-matrix and threshold explorer for the metrics chapter. */
(()=>{
  const baseRender=window.lessonPlaygrounds?.render;
  const baseInitialize=window.lessonPlaygrounds?.initialize;
  if(!window.lessonPlaygrounds||typeof baseRender!=='function')return;

  const positives=[.98,.92,.86,.79,.72,.64,.56,.43,.31,.18];
  const negatives=[.95,.84,.76,.68,.60,.49,.36,.27,.15,.07];
  const scoreX=score=>32+Number(score)*532;
  const fmtCount=value=>Number(value).toLocaleString('zh-CN');
  const fmtPct=value=>Number.isFinite(value)?(value*100).toFixed(1)+'%':'—';

  function matrixMarkup(){
    return '<div class="cm-matrix-frame"><table class="cm-matrix"><caption>混淆矩阵 · 行是真实标签，列是预测标签</caption><thead><tr><th scope="col">实际 ＼ 预测</th><th scope="col">预测正类</th><th scope="col">预测负类</th></tr></thead><tbody><tr><th scope="row">实际正类</th><td class="cm-cell cm-tp" data-cm-cell="tp">0</td><td class="cm-cell cm-fn" data-cm-cell="fn">0</td></tr><tr><th scope="row">实际负类</th><td class="cm-cell cm-fp" data-cm-cell="fp">0</td><td class="cm-cell cm-tn" data-cm-cell="tn">0</td></tr></tbody></table><div class="cm-matrix-legend"><span><i class="cm-dot-legend cm-tp-legend"></i>TP 命中正类</span><span><i class="cm-dot-legend cm-fp-legend"></i>FP 误报正类</span><span><i class="cm-dot-legend cm-fn-legend"></i>FN 漏掉正类</span><span><i class="cm-dot-legend cm-tn-legend"></i>TN 正确识别负类</span></div></div>';
  }
  function metricMarkup(){
    return '<div class="cm-metric-grid" aria-label="由混淆矩阵计算的分类指标"><div class="cm-metric-card cm-accuracy"><span>Accuracy · 答对比例</span><strong data-cm-metric="accuracy">—</strong><small>(TP + TN) / 全部样本</small></div><div class="cm-metric-card cm-precision"><span>Precision · 预测为正有多准</span><strong data-cm-metric="precision">—</strong><small>TP / (TP + FP)</small></div><div class="cm-metric-card cm-recall"><span>Recall · 真实正类找回多少</span><strong data-cm-metric="recall">—</strong><small>TP / (TP + FN)</small></div><div class="cm-metric-card cm-f1"><span>F1 · P 与 R 的平衡摘要</span><strong data-cm-metric="f1">—</strong><small>2PR / (P + R)</small></div></div>';
  }
  function thresholdDots(){
    return positives.map(score=>'<circle class="cm-dot" data-cm-score="'+score+'" data-cm-actual="positive" cx="'+scoreX(score)+'" cy="43" r="6"><title>实际正类，分数 '+score.toFixed(2)+'</title></circle>').join('')
      +negatives.map(score=>'<circle class="cm-dot" data-cm-score="'+score+'" data-cm-actual="negative" cx="'+scoreX(score)+'" cy="91" r="6"><title>实际负类，分数 '+score.toFixed(2)+'</title></circle>').join('');
  }
  function classificationMarkup(){
    return '<section class="classification-metrics-playground" data-classification-metrics data-view="imbalance"><div class="cm-playground-heading"><span class="cm-eyebrow">INTERACTIVE · 分类指标实验</span><h3>先看四格，再看分数怎么变</h3><p>两项小实验使用固定的教学数据，亲手观察类别比例与决策阈值怎样改变混淆矩阵和指标。</p></div><div class="cm-tabs" role="tablist" aria-label="选择分类指标实验"><button type="button" role="tab" aria-selected="true" aria-controls="cm-panel-imbalance" data-cm-tab="imbalance">① 类别不平衡</button><button type="button" role="tab" aria-selected="false" aria-controls="cm-panel-threshold" data-cm-tab="threshold">② 调整决策阈值</button></div>'
      +'<section class="cm-panel" id="cm-panel-imbalance" role="tabpanel" data-cm-panel="imbalance"><div class="cm-experiment-copy"><div><span class="cm-step">实验 A</span><h4>“全猜阴性”也能拿高准确率？</h4><p>总样本固定为 1000 个，模型策略固定为“全部预测成负类”。拖动滑杆改变真实阳性占比。</p></div><label class="cm-range-label">阳性占比 <output data-cm-prevalence-label>1%</output><input type="range" min="1" max="50" step="1" value="1" data-cm-prevalence aria-label="真实阳性样本占比"></label></div><div class="cm-population" role="img" aria-label="真实样本类别比例"><div class="cm-population-bar"><span data-cm-positive-bar></span><i data-cm-negative-bar></i></div><div><b data-cm-population-positive>10 个阳性</b><span data-cm-population-negative>990 个阴性</span></div></div><div class="cm-results-layout">'+matrixMarkup()+metricMarkup()+'</div><p class="cm-insight" role="status" aria-live="polite" data-cm-insight></p><p class="cm-footnote">当没有任何预测正类时，Precision 的分母 TP+FP 为 0，数学上未定义；本演示显示“—”。一些软件实现会按 zero_division 选项把它记为 0。</p></section>'
      +'<section class="cm-panel" id="cm-panel-threshold" role="tabpanel" data-cm-panel="threshold" hidden><div class="cm-experiment-copy"><div><span class="cm-step">实验 B</span><h4>滑动阈值，观察误报和漏报</h4><p>每个点代表一个样本的模型分数。分数达到阈值就判为正类；圆点的实际类别固定。</p></div><label class="cm-range-label">决策阈值 <output data-cm-threshold-label>0.55</output><input type="range" min="0.10" max="0.90" step="0.05" value="0.55" data-cm-threshold aria-label="分类决策阈值"></label></div><div class="cm-score-legend"><span><i class="cm-score-swatch cm-tp-legend"></i>TP 命中</span><span><i class="cm-score-swatch cm-fp-legend"></i>FP 误报</span><span><i class="cm-score-swatch cm-fn-legend"></i>FN 漏报</span><span><i class="cm-score-swatch cm-tn-legend"></i>TN 正确识别负类</span><span><i class="cm-threshold-swatch"></i>当前阈值</span></div><div class="cm-score-chart-wrap"><svg class="cm-score-chart" viewBox="0 0 600 135" role="img" aria-label="横向分数图，越靠右分数越高"><text x="8" y="47">真实正类</text><text x="8" y="95">真实负类</text><line x1="32" y1="117" x2="564" y2="117" class="cm-axis"/><line x1="32" y1="112" x2="32" y2="121" class="cm-axis-tick"/><line x1="298" y1="112" x2="298" y2="121" class="cm-axis-tick"/><line x1="564" y1="112" x2="564" y2="121" class="cm-axis-tick"/><text x="32" y="132" text-anchor="middle">0</text><text x="298" y="132" text-anchor="middle">0.5</text><text x="564" y="132" text-anchor="middle">1.0</text><line data-cm-threshold-line x1="324.6" y1="16" x2="324.6" y2="108" class="cm-threshold-line"/><text data-cm-threshold-mark x="324.6" y="12" text-anchor="middle" class="cm-threshold-mark">阈值</text>'+thresholdDots()+'</svg></div><div class="cm-results-layout">'+matrixMarkup()+metricMarkup()+'</div><p class="cm-insight" role="status" aria-live="polite" data-cm-insight></p><p class="cm-footnote">点位和分数是为讲解而设的固定样例，不代表真实训练模型。阈值提高后，预测正类通常减少、Recall 通常降低；Precision 可能提高，但离散样本上不保证每一步都上升。</p></section></section>';
  }
  function panel(root,name){return root.querySelector('[data-cm-panel="'+name+'"]')}
  function countsInto(panelNode,counts){
    for(const key of ['tp','fp','fn','tn']){
      const cell=panelNode.querySelector('[data-cm-cell="'+key+'"]');
      if(cell)cell.textContent=fmtCount(counts[key]);
    }
    const total=counts.tp+counts.fp+counts.fn+counts.tn;
    const accuracy=total?(counts.tp+counts.tn)/total:0;
    const precisionDenominator=counts.tp+counts.fp;
    const recallDenominator=counts.tp+counts.fn;
    const precision=precisionDenominator?counts.tp/precisionDenominator:0;
    const recall=recallDenominator?counts.tp/recallDenominator:0;
    const f1=precision+recall?2*precision*recall/(precision+recall):0;
    const values={accuracy,precision,recall,f1};
    for(const [key,value] of Object.entries(values)){
      const output=panelNode.querySelector('[data-cm-metric="'+key+'"]');
      if(output)output.textContent=key==='precision'&&!precisionDenominator?'—':fmtPct(value);
    }
    return {accuracy,precision,recall,f1,precisionDenominator,recallDenominator,total};
  }
  function updateImbalance(root){
    const view=panel(root,'imbalance');
    if(!view)return;
    const slider=view.querySelector('[data-cm-prevalence]');
    const rate=Number(slider?.value||1);
    const positive=Math.max(1,Math.round(1000*rate/100));
    const negative=1000-positive;
    const result=countsInto(view,{tp:0,fp:0,fn:positive,tn:negative});
    view.querySelector('[data-cm-prevalence-label]').textContent=rate+'%';
    view.querySelector('[data-cm-population-positive]').textContent=fmtCount(positive)+' 个阳性';
    view.querySelector('[data-cm-population-negative]').textContent=fmtCount(negative)+' 个阴性';
    view.querySelector('[data-cm-positive-bar]').style.width=rate+'%';
    view.querySelector('[data-cm-negative-bar]').style.width=(100-rate)+'%';
    view.querySelector('.cm-population').setAttribute('aria-label','真实样本构成：'+fmtCount(positive)+' 个阳性，占 '+rate+'%；'+fmtCount(negative)+' 个阴性。');
    view.querySelector('[data-cm-insight]').textContent='模型把 '+fmtCount(negative)+' 个阴性都答对，因此 Accuracy='+fmtPct(result.accuracy)+'；但 '+fmtCount(positive)+' 个阳性全部漏掉，Recall=0%。这正是少数类任务不能只看整体准确率的原因。';
  }
  function updateThreshold(root){
    const view=panel(root,'threshold');
    if(!view)return;
    const threshold=Number(view.querySelector('[data-cm-threshold]')?.value||.55);
    let tp=0,fp=0,fn=0,tn=0;
    view.querySelectorAll('[data-cm-score]').forEach(dot=>{
      const score=Number(dot.dataset.cmScore);
      const actual=dot.dataset.cmActual;
      const predictedPositive=score>=threshold;
      const outcome=actual==='positive'?(predictedPositive?'tp':'fn'):(predictedPositive?'fp':'tn');
      if(outcome==='tp')tp++;else if(outcome==='fp')fp++;else if(outcome==='fn')fn++;else tn++;
      dot.setAttribute('class','cm-dot cm-dot-'+outcome);
      dot.setAttribute('aria-label',(actual==='positive'?'实际正类':'实际负类')+'，分数 '+score.toFixed(2)+'，'+(predictedPositive?'预测为正类':'预测为负类'));
    });
    const result=countsInto(view,{tp,fp,fn,tn});
    const label=threshold.toFixed(2);
    view.querySelector('[data-cm-threshold-label]').textContent=label;
    const lineX=scoreX(threshold);
    const line=view.querySelector('[data-cm-threshold-line]');
    const mark=view.querySelector('[data-cm-threshold-mark]');
    line.setAttribute('x1',lineX);line.setAttribute('x2',lineX);mark.setAttribute('x',lineX);mark.textContent='阈值 '+label;
    view.querySelector('.cm-score-chart').setAttribute('aria-label','横向分数图，当前阈值 '+label+'；越靠右分数越高；TP '+tp+'，FP '+fp+'，FN '+fn+'，TN '+tn+'。');
    view.querySelector('[data-cm-insight]').textContent='当前有 '+(tp+fp)+' 个样本被判为正类，其中命中 '+tp+' 个、误报 '+fp+' 个；10 个真实正类里找到 '+tp+' 个。Accuracy='+fmtPct(result.accuracy)+'，Precision='+fmtPct(result.precision)+'，Recall='+fmtPct(result.recall)+'，F1='+fmtPct(result.f1)+'。';
  }
  function initializeRoot(root){updateImbalance(root);updateThreshold(root)}

  window.lessonPlaygrounds.render=function(lessonId,sectionIndex){
    if(lessonId==='metrics'&&sectionIndex===4)return classificationMarkup();
    return baseRender.call(window.lessonPlaygrounds,lessonId,sectionIndex);
  };
  window.lessonPlaygrounds.initialize=function(){
    baseInitialize.call(window.lessonPlaygrounds);
    document.querySelectorAll('[data-classification-metrics]').forEach(initializeRoot);
  };
  document.addEventListener('input',event=>{
    const input=event.target.closest('[data-cm-prevalence],[data-cm-threshold]');
    if(!input)return;
    const root=input.closest('[data-classification-metrics]');
    if(input.matches('[data-cm-prevalence]'))updateImbalance(root);
    else updateThreshold(root);
  });
  document.addEventListener('click',event=>{
    const tab=event.target.closest('[data-cm-tab]');
    if(!tab)return;
    const root=tab.closest('[data-classification-metrics]');
    const active=tab.dataset.cmTab;
    root.dataset.view=active;
    root.querySelectorAll('[data-cm-tab]').forEach(button=>button.setAttribute('aria-selected',String(button===tab)));
    root.querySelectorAll('[data-cm-panel]').forEach(item=>item.hidden=item.dataset.cmPanel!==active);
  });
})();
