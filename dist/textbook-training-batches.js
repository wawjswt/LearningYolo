/* 用可调整的数据量，把 batch、iteration 和 epoch 放到同一条训练流程里。 */
(()=>{
  const format=value=>Number(value).toLocaleString('en-US');
  const previous=window.lessonPlaygrounds;

  function batchExplorerMarkup(){
    return '<section class="training-batch-explorer" data-training-batches aria-labelledby="training-batch-title">'
      +'<div class="playground-heading"><div><span class="playground-kicker">互动图解 · Batch / Iteration / Epoch</span><h3 id="training-batch-title">把训练集拆开，数清每一次参数更新</h3><p>先复现视频的 60,000 张图片与 batch size=100，再改变样本数、批大小或 epoch 数，看训练日志里的计数怎样变化。</p></div></div>'
      +'<div class="training-batch-controls">'
      +'<label>训练样本数<select data-tbp-samples aria-label="选择训练样本数量"><option value="1000">1,000 张</option><option value="6000">6,000 张</option><option value="10000">10,000 张</option><option value="60000" selected>60,000 张 · 视频例子</option></select></label>'
      +'<label>batch size<select data-tbp-size aria-label="选择每个批次的样本数"><option value="32">32 张</option><option value="64">64 张</option><option value="100" selected>100 张 · 视频例子</option><option value="128">128 张</option><option value="256">256 张</option><option value="1000">1,000 张</option></select></label>'
      +'<label class="training-batch-epochs">训练轮数 <output data-tbp-epochs-value>5</output><input type="range" min="1" max="20" step="1" value="5" data-tbp-epochs aria-label="设置训练 epoch 数"></label>'
      +'<label class="training-batch-drop"><input type="checkbox" data-tbp-drop>丢弃最后不足一批的样本（drop_last）</label>'
      +'</div>'
      +'<div class="training-batch-flow" aria-label="一个 batch 到一次参数更新的训练流程">'
      +'<div class="training-batch-flow-card"><span>训练集</span><strong data-tbp-flow-samples>60,000 张样本</strong></div><span class="training-batch-arrow" aria-hidden="true">→</span>'
      +'<div class="training-batch-flow-card"><span>取出一个 Batch</span><strong data-tbp-flow-batch>第 1 批 · 100 张</strong></div><span class="training-batch-arrow" aria-hidden="true">→</span>'
      +'<div class="training-batch-flow-card"><span>前向 · 损失 · 反向传播</span><strong>计算本批梯度</strong></div><span class="training-batch-arrow" aria-hidden="true">→</span>'
      +'<div class="training-batch-flow-card training-batch-update"><span>optimizer.step()</span><strong>Iteration +1</strong></div>'
      +'</div>'
      +'<div class="training-batch-lower">'
      +'<section class="training-batch-map"><div class="training-batch-card-heading"><div><strong>一轮里的 Batch</strong><span data-tbp-batches-label>600 批</span></div><span>点方块或拖动滑块选一批</span></div>'
      +'<div class="training-batch-tiles" data-tbp-tiles role="group" aria-label="选择本轮训练批次"></div>'
      +'<label class="training-batch-slider">当前查看第 <output data-tbp-current-index>1</output> 批<input type="range" min="1" max="600" step="1" value="1" data-tbp-index aria-label="选择本轮中的 batch 序号"></label>'
      +'<p class="training-batch-sample-range" data-tbp-current-range aria-live="polite">第 1 批读取第 1–100 张训练图。</p></section>'
      +'<section class="training-batch-totals" aria-label="训练计数"><div><span>每个 Epoch 批次数</span><strong data-tbp-per-epoch>600</strong><small data-tbp-formula>ceil(60,000 ÷ 100)</small></div><div><span>本轮实际读取</span><strong data-tbp-used>60,000 张</strong><small data-tbp-remainder>没有样本被跳过</small></div><div><span>训练完所有 Epoch</span><strong data-tbp-total-steps>3,000 次更新</strong><small data-tbp-total-batches>5 轮 × 每轮 600 次</small></div></section>'
      +'</div>'
      +'<p class="training-batch-epoch-note"><strong>Epoch 怎么数？</strong><span>上面一轮的所有 Batch 都处理完，训练集就完整走过一遍，Epoch 加 1。继续训练 5 轮就是再走 5 遍；验证集在每轮后单独评估。</span></p>'
      +'<aside class="training-batch-verdict"><strong>视频知识核对</strong><p>三者的核心定义和 60,000 ÷ 100 = 600 的例子是正确的。补充两个边界：常见循环里“一批一次更新”成立；使用梯度累积时，多个小批次才做一次参数更新。batch size=1 会让更新更受单个样本影响，也较难发挥 GPU 的批量并行，但并非不能训练或必然浪费算力。多跑 Epoch 也不保证验证效果一直变好，轮数要结合验证集判断。</p></aside>'
      +'<p class="playground-footnote">这里按常见的 map-style 数据集、每批调用一次 optimizer.step() 来计数。最后一个不足批次默认保留；勾选 drop_last 后会跳过它。梯度累积和自定义 sampler 会改变简单的“一批一次更新”关系。</p>'
      +'</section>';
  }

  function tileSequence(batchCount,batchSize,sampleCount,dropLast,current){
    const indices=new Set([1,batchCount]);
    for(let value=Math.max(1,current-1);value<=Math.min(batchCount,current+1);value++)indices.add(value);
    const ordered=[...indices].sort((a,b)=>a-b);let out='',previousIndex=0;
    ordered.forEach(index=>{
      if(previousIndex&&index-previousIndex>1)out+='<span class="training-batch-ellipsis" aria-hidden="true">···</span>';
      const first=(index-1)*batchSize+1,last=Math.min(index*batchSize,dropLast?batchCount*batchSize:sampleCount),count=Math.max(0,last-first+1);
      out+='<button type="button" class="training-batch-tile'+(index===current?' is-current':'')+'" data-tbp-pick="'+index+'" aria-pressed="'+(index===current)+'" aria-label="第 '+index+' 批，读取第 '+format(first)+' 到第 '+format(last)+' 张，共 '+format(count)+' 张"><span>Batch '+index+'</span><strong>'+format(first)+'–'+format(last)+'</strong></button>';
      previousIndex=index;
    });
    return out;
  }

  function updateBatchExplorer(root){
    const sampleCount=Number(root.querySelector('[data-tbp-samples]').value);
    const batchSize=Number(root.querySelector('[data-tbp-size]').value);
    const epochs=Number(root.querySelector('[data-tbp-epochs]').value);
    const dropLast=root.querySelector('[data-tbp-drop]').checked;
    const batchCount=dropLast?Math.floor(sampleCount/batchSize):Math.ceil(sampleCount/batchSize);
    const usedSamples=dropLast?batchCount*batchSize:sampleCount;
    const skipped=sampleCount-usedSamples;
    const indexInput=root.querySelector('[data-tbp-index]');
    indexInput.max=String(batchCount);
    const batchIndex=Math.min(batchCount,Math.max(1,Number(indexInput.value)||1));
    indexInput.value=String(batchIndex);
    const first=(batchIndex-1)*batchSize+1;
    const last=Math.min(batchIndex*batchSize,usedSamples);
    const activeSize=Math.max(0,last-first+1);
    const totalSteps=batchCount*epochs;

    root.querySelector('[data-tbp-epochs-value]').textContent=String(epochs);
    root.querySelector('[data-tbp-flow-samples]').textContent=format(sampleCount)+' 张样本';
    root.querySelector('[data-tbp-flow-batch]').textContent='第 '+format(batchIndex)+' 批 · '+format(activeSize)+' 张';
    root.querySelector('[data-tbp-batches-label]').textContent=format(batchCount)+' 批';
    root.querySelector('[data-tbp-current-index]').textContent=format(batchIndex)+' / '+format(batchCount);
    root.querySelector('[data-tbp-current-range]').textContent='第 '+format(batchIndex)+' 批读取第 '+format(first)+'–'+format(last)+' 张训练图，共 '+format(activeSize)+' 张；标准循环在它之后完成一次更新。';
    root.querySelector('[data-tbp-per-epoch]').textContent=format(batchCount);
    root.querySelector('[data-tbp-formula]').textContent=(dropLast?'floor':'ceil')+'('+format(sampleCount)+' ÷ '+format(batchSize)+')';
    root.querySelector('[data-tbp-used]').textContent=format(usedSamples)+' 张';
    root.querySelector('[data-tbp-remainder]').textContent=skipped?format(skipped)+' 张尾部样本本轮跳过':'没有样本被跳过';
    root.querySelector('[data-tbp-total-steps]').textContent=format(totalSteps)+' 次更新';
    root.querySelector('[data-tbp-total-batches]').textContent=format(epochs)+' 轮 × 每轮 '+format(batchCount)+' 次';
    root.querySelector('[data-tbp-tiles]').innerHTML=tileSequence(batchCount,batchSize,sampleCount,dropLast,batchIndex);
  }

  window.lessonPlaygrounds={
    render(id,index){return id==='training'&&index===1?batchExplorerMarkup():previous.render(id,index)},
    initialize(){previous.initialize();document.querySelectorAll('[data-training-batches]').forEach(updateBatchExplorer)}
  };

  document.addEventListener('input',event=>{
    const target=event.target.closest('[data-tbp-epochs],[data-tbp-index]');
    if(target)updateBatchExplorer(target.closest('[data-training-batches]'));
  });
  document.addEventListener('change',event=>{
    const target=event.target.closest('[data-tbp-samples],[data-tbp-size],[data-tbp-drop]');
    if(target)updateBatchExplorer(target.closest('[data-training-batches]'));
  });
  document.addEventListener('click',event=>{
    const tile=event.target.closest('[data-tbp-pick]');
    if(tile){const root=tile.closest('[data-training-batches]');root.querySelector('[data-tbp-index]').value=tile.dataset.tbpPick;updateBatchExplorer(root)}
  });
})();
