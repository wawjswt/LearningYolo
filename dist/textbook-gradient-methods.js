/* 章节内互动图解：同一损失面上比较全量、单样本与小批量梯度更新。 */
(()=>{
  const previous=window.lessonPlaygrounds;
  const samples=[-3,-2,-1,-1,1,1,2,3];
  const initialWeight=3.5;
  const esc=value=>String(value).replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const fmt=value=>{const n=Number(value.toFixed(2));return Object.is(n,-0)?'0.00':n.toFixed(2)};
  const average=values=>values.reduce((sum,value)=>sum+value,0)/values.length;
  const lossAt=weight=>average(samples.map(target=>0.5*(weight-target)**2));

  function markup(){
    return '<section class="lesson-playground gradient-method-playground" data-gradient-method-playground data-gdm-method="full" aria-labelledby="gradient-method-title">'
      +'<div class="playground-heading"><div><span class="playground-kicker">互动图解 · GD / SGD / Mini-batch SGD</span><h3 id="gradient-method-title">同一座“损失山”，三种取梯度的方式</h3><p>固定同一组 8 个训练样本，逐步观察每次更新用了哪些数据、估出的梯度和参数走过的路径。</p></div><button type="button" class="playground-reset" data-gdm-reset>回到起点</button></div>'
      +'<div class="gradient-method-tabs" role="group" aria-label="选择梯度下降方式">'
      +'<button type="button" data-gdm-method="full" aria-pressed="true">全量 Batch GD</button>'
      +'<button type="button" data-gdm-method="single" aria-pressed="false">单样本 SGD</button>'
      +'<button type="button" data-gdm-method="mini" aria-pressed="false">小批量 Mini-batch SGD</button></div>'
      +'<div class="gradient-method-layout"><div class="gradient-method-chart" data-gdm-chart></div>'
      +'<aside class="gradient-method-samples-card"><div class="gradient-method-card-head"><strong>训练样本的单独目标 aᵢ</strong><span>下一步选中的样本会高亮</span></div><div class="gradient-method-samples" data-gdm-samples></div><div class="gradient-method-batch" data-gdm-batch-description aria-live="polite"></div></aside></div>'
      +'<div class="gradient-method-controls">'
      +'<label class="playground-range"><span>小批次大小 <output data-gdm-batch-value>3</output> / 8</span><input type="range" min="2" max="7" step="1" value="3" data-gdm-batch aria-label="设置小批量中的样本数"></label>'
      +'<label class="playground-range"><span>学习率 η <output data-gdm-rate-value>0.25</output></span><input type="range" min="0.05" max="0.80" step="0.05" value="0.25" data-gdm-rate aria-label="设置梯度下降学习率"></label>'
      +'<label class="playground-range"><span>已完成更新 <output data-gdm-step-value>0</output> / 12</span><input type="range" min="0" max="12" step="1" value="0" data-gdm-step aria-label="选择已完成的参数更新次数"></label>'
      +'</div><div class="gradient-method-readouts" aria-label="当前训练状态">'
      +'<div><span>当前参数 w</span><strong data-gdm-weight>3.50</strong></div><div><span>当前全量平均损失</span><strong data-gdm-loss>8.00</strong></div>'
      +'<div><span>下一步使用的样本数</span><strong data-gdm-used>8 / 8</strong></div><div><span>每轮约更新</span><strong data-gdm-steps-per-epoch>1 次</strong></div></div>'
      +'<p class="gradient-method-equation" data-gdm-equation aria-live="polite">本批平均梯度 ĝ = 3.50；w_next = 3.50 − 0.25 × 3.50 = 2.63</p>'
      +'<p class="playground-insight" data-gdm-insight role="status" aria-live="polite"></p>'
      +'<p class="playground-footnote">示意目标为 Lᵢ(w)=½(w−aᵢ)²；每批取所选样本梯度的平均值，再用 w←w−ηĝ 更新。SGD / 小批量的样本顺序在本图中固定、可重复；真实训练通常会打乱数据。每轮末尾不足一批的样本仍会保留。文献中的“SGD”有时泛指随机小批量更新。延伸阅读：<a href="https://cs231n.github.io/optimization-1/" target="_blank" rel="noopener noreferrer">Stanford CS231n：优化与梯度下降</a> · <a href="https://www.deeplearningbook.org/contents/optimization.html" target="_blank" rel="noopener noreferrer">Deep Learning：训练深度模型的优化方法</a> · <a href="https://docs.pytorch.org/tutorials/beginner/basics/optimization_tutorial.html" target="_blank" rel="noopener noreferrer">PyTorch：优化模型参数</a></p>'
      +'</section>';
  }

  function shuffled(epoch){
    const order=samples.map((_,index)=>index);
    let seed=(0x9e3779b9^Math.imul(epoch+1,0x85ebca6b))>>>0;
    for(let i=order.length-1;i>0;i--){
      seed=(Math.imul(seed,1664525)+1013904223)>>>0;
      const j=Math.floor(seed/4294967296*(i+1));
      [order[i],order[j]]=[order[j],order[i]];
    }
    return order;
  }

  function updateIndices(method,batchSize,updateNumber){
    if(method==='full')return samples.map((_,index)=>index);
    const size=method==='single'?1:batchSize;
    const perEpoch=Math.ceil(samples.length/size);
    const zeroBased=updateNumber-1;
    const epoch=Math.floor(zeroBased/perEpoch);
    const batchInEpoch=zeroBased%perEpoch;
    return shuffled(epoch).slice(batchInEpoch*size,Math.min((batchInEpoch+1)*size,samples.length));
  }

  function run(method,batchSize,rate,steps){
    let weight=initialWeight;
    const path=[{weight,indices:[]}];
    for(let update=1;update<=steps;update++){
      const indices=updateIndices(method,batchSize,update);
      const gradient=average(indices.map(index=>weight-samples[index]));
      weight-=rate*gradient;
      path.push({weight,indices,gradient});
    }
    return path;
  }

  function chart(path){
    const W=720,H=270,L=58,R=24,T=25,B=208,xMin=-4,xMax=4,yMin=0,yMax=10;
    const X=value=>L+(value-xMin)/(xMax-xMin)*(W-L-R);
    const Y=value=>B-(value-yMin)/(yMax-yMin)*(B-T);
    let svg='<svg viewBox="0 0 '+W+' '+H+'" role="img" aria-labelledby="gdm-svg-title gdm-svg-desc"><title id="gdm-svg-title">梯度下降方法的参数更新轨迹</title><desc id="gdm-svg-desc">紫色曲线是固定训练集的平均损失，绿色虚线和圆点表示当前方法已走过的参数更新轨迹；下方虚线标出全量损失最小的位置 w 等于零。</desc>';
    [0,2,4,6,8,10].forEach(value=>{svg+='<line x1="'+L+'" y1="'+Y(value)+'" x2="'+(W-R)+'" y2="'+Y(value)+'" stroke="'+(value===0?'#b4b0a8':'#eae7df')+'"/><text x="'+(L-10)+'" y="'+(Y(value)+4)+'" text-anchor="end" fill="#7b8590" font-size="10">'+value+'</text>'});
    [-4,-2,0,2,4].forEach(value=>{svg+='<line x1="'+X(value)+'" y1="'+T+'" x2="'+X(value)+'" y2="'+B+'" stroke="'+(value===0?'#d2cce0':'#f0eee8')+'"/><text x="'+X(value)+'" y="'+(B+18)+'" text-anchor="middle" fill="#7b8590" font-size="10">'+value+'</text>'});
    svg+='<line x1="'+L+'" y1="'+B+'" x2="'+(W-R)+'" y2="'+B+'" stroke="#aaa69e"/><line x1="'+L+'" y1="'+T+'" x2="'+L+'" y2="'+B+'" stroke="#aaa69e"/>';
    svg+='<line x1="'+X(0)+'" y1="'+T+'" x2="'+X(0)+'" y2="'+B+'" stroke="#9789b6" stroke-dasharray="4 4"/><text x="'+(X(0)+6)+'" y="'+(T+12)+'" fill="#776b9c" font-size="10">全量损失最低点 w=0</text>';
    let curve='';for(let i=0;i<=120;i++){const weight=xMin+(xMax-xMin)*i/120;curve+=(i?'L':'M')+X(weight).toFixed(1)+','+Y(lossAt(weight)).toFixed(1)}
    svg+='<path d="'+curve+'" fill="none" stroke="#9484b8" stroke-width="3" stroke-linecap="round"/>';
    const walk=path.map((point,index)=>(index?'L':'M')+X(point.weight).toFixed(1)+','+Y(lossAt(point.weight)).toFixed(1)).join(' ');
    if(path.length>1)svg+='<path d="'+walk+'" fill="none" stroke="#3d8a73" stroke-width="2.5" stroke-dasharray="5 4"/>';
    path.forEach((point,index)=>{svg+='<circle cx="'+X(point.weight)+'" cy="'+Y(lossAt(point.weight))+'" r="'+(index===path.length-1?6:3.5)+'" fill="'+(index===path.length-1?'#3d8a73':'#7ab29c')+'" stroke="#fffefa" stroke-width="2"><title>更新 '+index+'：w='+fmt(point.weight)+'，全量损失='+fmt(lossAt(point.weight))+'</title></circle>'});
    svg+='<text x="'+(W-R)+'" y="'+(B+40)+'" text-anchor="end" fill="#68737f" font-size="11">参数 w</text><text x="15" y="'+(T+5)+'" fill="#68737f" font-size="11">全量平均损失 L(w)</text></svg>';
    return svg;
  }

  function update(root){
    const method=root.dataset.gdmMethod||'full';
    const batchInput=root.querySelector('[data-gdm-batch]');
    const rateInput=root.querySelector('[data-gdm-rate]');
    const stepInput=root.querySelector('[data-gdm-step]');
    const batchSize=Number(batchInput.value);
    const rate=Number(rateInput.value);
    const steps=Number(stepInput.value);
    const size=method==='full'?samples.length:method==='single'?1:batchSize;
    const path=run(method,batchSize,rate,steps);
    const current=path[path.length-1];
    const shownIndices=updateIndices(method,batchSize,steps+1);
    const gradient=average(shownIndices.map(index=>current.weight-samples[index]));
    const nextWeight=current.weight-rate*gradient;
    const updatesPerEpoch=method==='full'?1:Math.ceil(samples.length/size);
    const methodName=method==='full'?'全量 Batch GD':method==='single'?'单样本 SGD':'小批量 Mini-batch SGD';
    batchInput.disabled=method!=='mini';
    root.querySelector('[data-gdm-batch-value]').textContent=String(batchSize);
    root.querySelector('[data-gdm-rate-value]').textContent=rate.toFixed(2);
    root.querySelector('[data-gdm-step-value]').textContent=String(steps);
    root.querySelectorAll('[data-gdm-method]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.gdmMethod===method)));
    root.querySelector('[data-gdm-chart]').innerHTML=chart(path);
    root.querySelector('[data-gdm-samples]').innerHTML=samples.map((target,index)=>'<span class="gradient-method-sample'+(shownIndices.includes(index)?' is-selected':'')+'" aria-label="样本 '+(index+1)+'，单样本目标 '+target+(shownIndices.includes(index)?'，本步使用':'')+'"><small>样本 '+(index+1)+'</small><strong>a='+target+'</strong></span>').join('');
    root.querySelector('[data-gdm-batch-description]').innerHTML='下一次更新使用：<strong>'+shownIndices.map(index=>'样本 '+(index+1)+'（a='+samples[index]+'）').join('、')+'</strong>。'+(method==='full'?'全量梯度是这组固定样本经验损失的精确梯度。':method==='single'?'单个样本给出的方向受该样本影响较大，轨迹会更有波动。':'在选中小批次内平均梯度；最后一批若不足 '+batchSize+' 个，仍保留实际样本数。');
    root.querySelector('[data-gdm-weight]').textContent=fmt(current.weight);
    root.querySelector('[data-gdm-loss]').textContent=fmt(lossAt(current.weight));
    root.querySelector('[data-gdm-used]').textContent=shownIndices.length+' / '+samples.length;
    root.querySelector('[data-gdm-steps-per-epoch]').textContent=updatesPerEpoch+' 次';
    root.querySelector('[data-gdm-equation]').textContent='下一步平均梯度 ĝ = '+fmt(gradient)+'；w_next = '+fmt(current.weight)+' − '+rate.toFixed(2)+' × '+fmt(gradient)+' = '+fmt(nextWeight);
    const explanation=method==='full'?'每次更新都用全部 '+samples.length+' 个样本，梯度最稳定；完整遍历训练集一轮通常只更新一次。':method==='single'?'每次只用一个随机样本，计算量小但估计噪声较大；打乱数据后，一轮约更新 '+samples.length+' 次。':'每次用 '+batchSize+' 个样本的平均梯度，每轮约更新 '+updatesPerEpoch+' 次；它在梯度波动、吞吐和显存之间取舍。';
    root.querySelector('[data-gdm-insight]').textContent=methodName+'：'+explanation+' 图中全量平均损失的最低点是 w=0；真实神经网络的损失面更复杂，梯度下降不保证找到全局最优。';
  }

  window.lessonPlaygrounds={
    render(id,index){return id==='gradient'&&index===1?markup():previous.render(id,index)},
    initialize(){previous.initialize();document.querySelectorAll('[data-gradient-method-playground]').forEach(update)}
  };
  document.addEventListener('input',event=>{
    const target=event.target.closest('[data-gdm-batch],[data-gdm-rate],[data-gdm-step]');
    if(target)update(target.closest('[data-gradient-method-playground]'));
  });
  document.addEventListener('click',event=>{
    const methodButton=event.target.closest('[data-gdm-method]');
    if(methodButton){const root=methodButton.closest('[data-gradient-method-playground]');root.dataset.gdmMethod=methodButton.dataset.gdmMethod;root.querySelector('[data-gdm-step]').value='0';update(root);return}
    const reset=event.target.closest('[data-gdm-reset]');
    if(reset){const root=reset.closest('[data-gradient-method-playground]');root.querySelector('[data-gdm-step]').value='0';update(root)}
  });
})();
