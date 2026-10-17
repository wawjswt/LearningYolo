/* 章节内的小型交互图解：曲线、数值与解释始终使用同一组参数。 */
(()=>{
  const esc=value=>String(value).replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const fmt=(value,digits=2)=>{const rounded=Number(value.toFixed(digits));return Object.is(rounded,-0)?'0.00':rounded.toFixed(digits)};
  const svgText=(x,y,label,size=11,anchor='middle',fill='#77818b')=>'<text x="'+x+'" y="'+y+'" text-anchor="'+anchor+'" fill="'+fill+'" font-size="'+size+'">'+esc(label)+'</text>';

  const activationSpecs={
    sigmoid:{name:'Sigmoid',formula:'σ(x)=1/(1+e⁻ˣ)',color:'#8b70bd',fn:x=>{const y=x>=0?1/(1+Math.exp(-x)):Math.exp(x)/(1+Math.exp(x));return [y,y*(1-y)]},hint:'输出落在 0 到 1。两端逐渐饱和，斜率变小，深层反向传播时梯度可能变弱。'},
    tanh:{name:'Tanh',formula:'tanh(x)',color:'#4c88a6',fn:x=>{const y=Math.tanh(x);return [y,1-y*y]},hint:'输出以 0 为中心，但两端同样会饱和；极大正负输入处的梯度接近 0。'},
    relu:{name:'ReLU',formula:'max(0,x)',color:'#cf7659',fn:x=>[Math.max(0,x),x<0?0:x>0?1:0],hint:'负半轴直接变成 0，正半轴保留输入。负区间梯度为 0，若神经元长期落在那里就难以恢复。'},
    silu:{name:'SiLU',formula:'x·σ(x)',color:'#3e967c',fn:x=>{const s=x>=0?1/(1+Math.exp(-x)):Math.exp(x)/(1+Math.exp(x));return [x*s,s+x*s*(1-s)]},hint:'平滑地门控输入；负数会被压小但通常不被硬切成 0，因此负半轴仍可保留梯度。'},
    gelu:{name:'GELU（近似）',formula:'0.5x·(1+tanh(√(2/π)(x+0.044715x³)))',color:'#be984a',fn:x=>{const c=Math.sqrt(2/Math.PI),u=c*(x+0.044715*x*x*x),t=Math.tanh(u),du=c*(1+3*0.044715*x*x);return [0.5*x*(1+t),0.5*(1+t)+0.5*x*(1-t*t)*du]},hint:'按输入大小平滑决定保留多少信号。此处使用常见 tanh 近似；框架也可能提供基于 erf 的精确版本。'}
  };

  function activationMarkup(){
    return '<section class="lesson-playground activation-playground" data-activation-playground data-function="relu" aria-labelledby="activation-playground-title"><div class="playground-heading"><div><span class="playground-kicker">互动图解 · 激活函数</span><h3 id="activation-playground-title">同一个输入，经过不同激活会怎样？</h3><p>先留意负输入会发生什么，再切换曲线。拖动 x，观察函数输出与局部斜率。</p></div><button type="button" class="playground-reset" data-activation-reset>恢复默认</button></div><div class="playground-tabs" role="group" aria-label="选择激活函数">'+Object.entries(activationSpecs).map(([id,spec])=>'<button type="button" data-activation-choose="'+id+'" aria-pressed="'+String(id==='relu')+'">'+spec.name+'</button>').join('')+'</div><div class="playground-chart" data-activation-chart></div><div class="playground-controls"><label class="playground-range"><span>输入 x <output data-activation-x-value>1.50</output></span><input type="range" min="-6" max="6" step="0.1" value="1.5" data-activation-x aria-label="激活函数输入 x"></label><div class="playground-readouts"><div><span>所选函数</span><strong data-activation-name>ReLU</strong></div><div><span>输出 f(x)</span><strong data-activation-y>1.50</strong></div><div><span>局部斜率 f′(x)</span><strong data-activation-slope>1.00</strong></div></div></div><p class="playground-insight" data-activation-hint role="status" aria-live="polite"></p><p class="playground-footnote">图中同时保留其他函数作为浅色参照。ReLU 在 x=0 处不可导；滑块经过该点时显示采用的常见次梯度约定。</p></section>';
  }

  function activationChart(selected,x){
    const W=760,H=306,L=54,R=18,T=18,B=250, xmin=-6,xmax=6,ymin=-1.5,ymax=6.2,pw=W-L-R,ph=B-T;
    const X=v=>L+(v-xmin)/(xmax-xmin)*pw, Y=v=>B-(v-ymin)/(ymax-ymin)*ph;
    const xTicks=[-6,-3,0,3,6],yTicks=[-1,0,1,2,3,4,5,6];let out='<svg viewBox="0 0 '+W+' '+H+'" role="img" aria-label="激活函数输出曲线与当前输入位置">';
    yTicks.forEach(v=>{out+='<line x1="'+L+'" y1="'+Y(v)+'" x2="'+(W-R)+'" y2="'+Y(v)+'" stroke="'+(v===0?'#a9a69f':'#ebe8e1')+'" stroke-width="'+(v===0?1.3:1)+'"/>'+svgText(L-10,Y(v)+4,String(v),10,'end')});
    xTicks.forEach(v=>{out+='<line x1="'+X(v)+'" y1="'+T+'" x2="'+X(v)+'" y2="'+B+'" stroke="'+(v===0?'#b4b0a8':'#efede7')+'" stroke-width="'+(v===0?1.2:1)+'"/>'+svgText(X(v),B+20,String(v),10)});
    out+=svgText(L,B+42,'输入 x',11,'start','#626e79')+svgText(16,T+5,'f(x)',11,'start','#626e79');
    Object.entries(activationSpecs).forEach(([id,spec])=>{
      let d='';for(let i=0;i<=120;i++){const xv=xmin+(xmax-xmin)*i/120,yv=spec.fn(xv)[0];d+=(i?'L':'M')+X(xv).toFixed(1)+','+Y(yv).toFixed(1)}
      out+='<path d="'+d+'" fill="none" stroke="'+spec.color+'" stroke-width="'+(id===selected?3.3:1.5)+'" stroke-opacity="'+(id===selected?1:.36)+'" stroke-linecap="round" stroke-linejoin="round"/>';
    });
    const [value]=activationSpecs[selected].fn(x);
    out+='<line x1="'+X(x)+'" y1="'+T+'" x2="'+X(x)+'" y2="'+B+'" stroke="#565f68" stroke-width="1" stroke-dasharray="4 4"/><circle cx="'+X(x)+'" cy="'+Y(value)+'" r="6" fill="'+activationSpecs[selected].color+'" stroke="#fff" stroke-width="2"/>';
    out+='<rect x="'+(W-316)+'" y="'+(H-31)+'" width="298" height="23" rx="4" fill="#fffefa" stroke="#ece9e1"/>';
    let legendX=W-305;Object.entries(activationSpecs).forEach(([id,spec])=>{out+='<line x1="'+legendX+'" y1="'+(H-20)+'" x2="'+(legendX+13)+'" y2="'+(H-20)+'" stroke="'+spec.color+'" stroke-width="3" opacity="'+(id===selected?1:.5)+'"/>'+svgText(legendX+17,H-16,spec.name.replace('（近似）',''),9,'start','#68737e');legendX+=id==='sigmoid'||id==='tanh'||id==='relu'?56:66});
    return out+'</svg>';
  }

  function updateActivation(root){
    const selected=root.dataset.function||'relu',x=Number(root.querySelector('[data-activation-x]').value),spec=activationSpecs[selected],[y,slope]=spec.fn(x);
    root.querySelector('[data-activation-chart]').innerHTML=activationChart(selected,x);
    root.querySelector('[data-activation-x-value]').textContent=fmt(x);
    root.querySelector('[data-activation-name]').textContent=spec.name;
    root.querySelector('[data-activation-y]').textContent=fmt(y);
    root.querySelector('[data-activation-slope]').textContent=selected==='relu'&&Math.abs(x)<1e-9?'0（次梯度约定）':fmt(slope);
    root.querySelector('[data-activation-hint]').textContent=selected==='relu'&&x<0?'当前位于 ReLU 的负半轴：输出为 0，斜率为 0。'+spec.hint:spec.hint;
    root.querySelectorAll('[data-activation-choose]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.activationChoose===selected)));
  }

  const lossSpecs={
    mse:{name:'MSE',color:'#8b70bd',calc:e=>[e*e,2*e]},
    mae:{name:'MAE',color:'#4c88a6',calc:e=>[Math.abs(e),e>0?1:e<0?-1:0]},
    huber:{name:'Huber',color:'#3e967c',calc:(e,d)=>Math.abs(e)<=d?[0.5*e*e,e]:[d*(Math.abs(e)-0.5*d),Math.sign(e)*d]}
  };

  function lossMarkup(){
    return '<section class="lesson-playground loss-playground" data-loss-playground aria-labelledby="loss-playground-title"><div class="playground-heading"><div><span class="playground-kicker">互动图解 · 回归损失</span><h3 id="loss-playground-title">大误差会怎样影响训练目标？</h3><p>拖动误差 e，对照三条惩罚曲线；再调整 Huber 的转折点 δ。</p></div><button type="button" class="playground-reset" data-loss-reset>恢复默认</button></div><div class="playground-chart" data-loss-chart></div><div class="playground-controls loss-controls"><label class="playground-range"><span>预测误差 e <output data-loss-error-value>2.00</output></span><input type="range" min="-4" max="4" step="0.1" value="2" data-loss-error aria-label="预测误差 e"></label><label class="playground-range"><span>Huber 转折点 δ <output data-loss-delta-value>1.00</output></span><input type="range" min="0.5" max="2" step="0.1" value="1" data-loss-delta aria-label="Huber 转折点 delta"></label></div><div class="loss-readouts" data-loss-readouts></div><p class="playground-insight" data-loss-hint role="status" aria-live="polite"></p><p class="playground-footnote">这里令 e=预测值−目标值，展示单个误差的损失；MSE=e²，Huber 在 |e|≤δ 时为 e²/2，超过 δ 后改为线性增长。真实批次还会按样本数求平均或求和。</p></section>';
  }

  function lossChart(error,delta){
    const W=760,H=290,L=60,R=20,T=18,B=231,xmin=-4,xmax=4,ymin=0,ymax=16.5,pw=W-L-R,ph=B-T;
    const X=v=>L+(v-xmin)/(xmax-xmin)*pw,Y=v=>B-(v-ymin)/(ymax-ymin)*ph;let out='<svg viewBox="0 0 '+W+' '+H+'" role="img" aria-label="MSE、MAE 和 Huber 随预测误差变化的曲线">';
    [0,4,8,12,16].forEach(v=>{out+='<line x1="'+L+'" y1="'+Y(v)+'" x2="'+(W-R)+'" y2="'+Y(v)+'" stroke="'+(v===0?'#aaa69e':'#ebe8e1')+'"/>'+svgText(L-10,Y(v)+4,String(v),10,'end')});
    [-4,-2,0,2,4].forEach(v=>{out+='<line x1="'+X(v)+'" y1="'+T+'" x2="'+X(v)+'" y2="'+B+'" stroke="'+(v===0?'#b4b0a8':'#efede7')+'"/>'+svgText(X(v),B+19,String(v),10)});
    out+=svgText(L,B+40,'误差 e',11,'start','#626e79')+svgText(14,T+3,'损失',11,'start','#626e79');
    Object.entries(lossSpecs).forEach(([id,spec])=>{let d='';for(let i=0;i<=160;i++){const e=xmin+(xmax-xmin)*i/160,v=spec.calc(e,delta)[0];d+=(i?'L':'M')+X(e).toFixed(1)+','+Y(v).toFixed(1)}out+='<path d="'+d+'" fill="none" stroke="'+spec.color+'" stroke-width="3" stroke-linejoin="round"/>'});
    out+='<line x1="'+X(error)+'" y1="'+T+'" x2="'+X(error)+'" y2="'+B+'" stroke="#545f68" stroke-dasharray="4 4"/>';
    Object.entries(lossSpecs).forEach(([id,spec])=>{const [v]=spec.calc(error,delta);out+='<circle cx="'+X(error)+'" cy="'+Y(v)+'" r="5.5" fill="'+spec.color+'" stroke="#fff" stroke-width="2"/>'});
    const legend=[['MSE',lossSpecs.mse.color],['MAE',lossSpecs.mae.color],['Huber',lossSpecs.huber.color]];let lx=540;
    legend.forEach(([label,color])=>{out+='<line x1="'+lx+'" y1="'+(H-25)+'" x2="'+(lx+16)+'" y2="'+(H-25)+'" stroke="'+color+'" stroke-width="3"/>'+svgText(lx+21,H-21,label,10,'start','#596672');lx+=label==='Huber'?0:58});
    return out+'</svg>';
  }

  function updateLoss(root){
    const e=Number(root.querySelector('[data-loss-error]').value),delta=Number(root.querySelector('[data-loss-delta]').value);
    root.querySelector('[data-loss-error-value]').textContent=fmt(e);root.querySelector('[data-loss-delta-value]').textContent=fmt(delta);
    root.querySelector('[data-loss-chart]').innerHTML=lossChart(e,delta);
    root.querySelector('[data-loss-readouts]').innerHTML=Object.entries(lossSpecs).map(([id,spec])=>{const [value,gradient]=spec.calc(e,delta),gradientText=id==='mae'&&e===0?'0（次梯度约定）':fmt(gradient);return '<div class="loss-readout" style="--loss-color:'+spec.color+'"><span>'+spec.name+'</span><strong>'+fmt(value)+'</strong><small>当前损失</small><small>对误差的斜率 '+gradientText+'</small></div>'}).join('');
    root.querySelector('[data-loss-hint]').textContent=Math.abs(e)>delta?'当前 |e| 已超过 δ：MSE 继续按平方增长，Huber 转为线性增长，MAE 始终线性。':Math.abs(e)<1?'当前误差较小：MSE 与 Huber 都是平滑的平方形状；MAE 在 0 附近有尖点。':'Huber 还处于平方区；继续增大误差直到超过 δ，它才会切换为线性惩罚。';
  }

  const multiclassLabels=['猫','狗','兔子'];
  function multiclassMarkup(){
    return '<section class="lesson-playground multiclass-playground" data-multiclass-playground data-target="2" aria-labelledby="multiclass-playground-title">'
      +'<div class="playground-heading"><div><span class="playground-kicker">交互图解 · Softmax 与交叉熵</span><h3 id="multiclass-playground-title">分数怎样变成概率？错得越离谱，损失会怎样？</h3><p>拖动三个类别的 logit，或切换真实类别。观察概率总和、最高分预测和交叉熵同步变化。</p></div><button type="button" class="playground-reset" data-multiclass-reset>恢复默认</button></div>'
      +'<div class="multiclass-flow" aria-label="从 logits 到预测概率和损失的步骤"><span>类别 logits</span><i>→</i><span>Softmax 归一化</span><i>→</i><span>类别概率</span><i>→</i><span>与真实类别计算交叉熵</span></div>'
      +'<div class="multiclass-layout"><div class="multiclass-prediction">'
      +'<div class="multiclass-logits">'+multiclassLabels.map((label,i)=>'<label class="playground-range"><span>'+label+' 的 logit z<sub>'+i+'</sub><output data-multiclass-logit-value="'+i+'">0.00</output></span><input type="range" min="-4" max="4" step="0.1" value="'+[2,1,0.1][i]+'" data-multiclass-logit="'+i+'" aria-label="'+label+' 原始分数"></label>').join('')+'</div>'
      +'<div class="multiclass-probability-plot" data-multiclass-chart role="img" aria-label="Softmax 类别概率图"></div>'
      +'<p class="multiclass-sum">概率总和 <strong data-multiclass-sum>100.0%</strong> <span>Softmax 把互斥类别归一化到同一分布</span></p></div>'
      +'<aside class="multiclass-target-panel"><span class="multiclass-panel-kicker">训练目标</span><p>这张图片的真实类别是：</p><div class="multiclass-targets" role="group" aria-label="选择真实类别">'+multiclassLabels.map((label,i)=>'<button type="button" data-multiclass-target="'+i+'" aria-pressed="'+String(i===2)+'">'+label+'</button>').join('')+'</div>'
      +'<div class="multiclass-vector"><span>独热标签 y</span><strong data-multiclass-onehot>[0, 0, 1]</strong></div>'
      +'<div class="multiclass-loss-result"><span>真实类预测概率 p<sub>y</sub></span><strong data-multiclass-true-prob>9.9%</strong></div>'
      +'<div class="multiclass-loss-result"><span>单样本交叉熵 −log(p<sub>y</sub>)</span><strong data-multiclass-ce>2.32</strong></div>'
      +'<p class="multiclass-top-prediction" data-multiclass-top>最高概率：猫</p></aside></div>'
      +'<p class="playground-insight" data-multiclass-hint role="status" aria-live="polite"></p>'
      +'<p class="playground-footnote">示意：类别 logits 为 [z猫,z狗,z兔子]，训练标签表示这三个互斥答案中哪一个是真的。改变非目标类分数也会改变 Softmax 和反向梯度；交叉熵公式中其他 one-hot 项为 0，不代表它们不参与学习。</p></section>';
  }
  function updateMulticlass(root){
    const inputs=[...root.querySelectorAll('[data-multiclass-logit]')],logits=inputs.map(input=>Number(input.value)),maxLogit=Math.max(...logits);
    const exponentials=logits.map(value=>Math.exp(value-maxLogit)),denominator=exponentials.reduce((sum,value)=>sum+value,0),probabilities=exponentials.map(value=>value/denominator);
    const target=Number(root.dataset.target||2),predicted=probabilities.indexOf(Math.max(...probabilities)),trueProbability=probabilities[target],crossEntropy=-Math.log(Math.max(trueProbability,Number.MIN_VALUE));
    inputs.forEach((input,i)=>{root.querySelector('[data-multiclass-logit-value="'+i+'"]').textContent=fmt(logits[i])});
    root.querySelector('[data-multiclass-chart]').innerHTML=probabilities.map((probability,i)=>'<div class="multiclass-probability-row"><div class="multiclass-row-label"><strong>'+multiclassLabels[i]+'</strong><span>'+(i===target?'真实类别':i===predicted?'最高分':'')+'</span><b>'+fmt(probability*100,1)+'%</b></div><div class="multiclass-bar-track"><i class="'+(i===target?'is-target':'')+'" style="width:'+(probability*100).toFixed(2)+'%"></i></div></div>').join('');
    root.querySelector('[data-multiclass-sum]').textContent=fmt(probabilities.reduce((sum,value)=>sum+value,0)*100,1)+'%';
    root.querySelector('[data-multiclass-onehot]').textContent='['+multiclassLabels.map((_,i)=>i===target?'1':'0').join(', ')+']';
    root.querySelector('[data-multiclass-true-prob]').textContent=fmt(trueProbability*100,1)+'%';
    root.querySelector('[data-multiclass-ce]').textContent=fmt(crossEntropy,3);
    root.querySelector('[data-multiclass-top]').textContent='最高概率：'+multiclassLabels[predicted]+'（'+fmt(probabilities[predicted]*100,1)+'%）';
    root.querySelectorAll('[data-multiclass-target]').forEach(button=>button.setAttribute('aria-pressed',String(Number(button.dataset.multiclassTarget)===target)));
    root.querySelector('[data-multiclass-hint]').textContent=predicted===target?'当前最高概率命中真实类。真实类概率越高，交叉熵越小；其他类别分数仍会通过 Softmax 影响梯度。':'当前模型把 '+multiclassLabels[predicted]+' 排在最高，却应预测 '+multiclassLabels[target]+'。真实类概率只有 '+fmt(trueProbability*100,1)+'%，因此交叉熵惩罚较大。';
  }

  function informationMarkup(){
    return '<section class="lesson-playground information-playground" data-information-playground data-base="nat" aria-labelledby="information-playground-title">'
      +'<div class="playground-heading"><div><span class="playground-kicker">互动图解 · 信息量</span><h3 id="information-playground-title">一个结果越少见，带来的信息越多</h3><p>拖动事件概率。看看概率降低时，信息量 −log(p) 怎样快速上升。</p></div><button type="button" class="playground-reset" data-information-reset>恢复默认</button></div>'
      +'<div class="information-units" role="group" aria-label="选择信息量单位"><button type="button" data-information-base="nat" aria-pressed="true">自然对数 · nat</button><button type="button" data-information-base="bit" aria-pressed="false">以 2 为底 · bit</button></div>'
      +'<div class="information-layout"><div class="information-chart" data-information-chart></div><div class="information-controls"><label class="playground-range"><span>结果发生概率 p <output data-information-probability-value>0.90</output></span><input type="range" min="0.01" max="1" step="0.01" value="0.9" data-information-probability aria-label="结果发生概率"></label>'
      +'<div class="information-result"><span>自信息量</span><strong data-information-value>0.105 nat</strong><code>I(p) = −log(p)</code></div>'
      +'<div class="information-presets" role="group" aria-label="快速试试不同概率"><button type="button" data-information-preset="0.9">常见 · 90%</button><button type="button" data-information-preset="0.5">一半 · 50%</button><button type="button" data-information-preset="0.1">少见 · 10%</button></div>'
      +'<p class="playground-insight" data-information-hint role="status" aria-live="polite"></p></div></div>'
      +'<p class="playground-footnote">概率为 1 的确定结果没有意外信息；概率越接近 0，负对数惩罚越大。p=0 的理想化信息量趋于无穷，实际训练通常通过有限 logits 与稳定的 log-softmax 计算。</p></section>';
  }
  function informationChart(base,probability){
    const W=720,H=270,L=58,R=20,T=18,B=220,pmin=.01,pmax=1,log=value=>base==='bit'?Math.log2(value):Math.log(value),ymax=-log(pmin),pw=W-L-R,ph=B-T;
    const X=value=>L+(value-pmin)/(pmax-pmin)*pw,Y=value=>B+log(value)/ymax*ph;
    let out='<svg viewBox="0 0 '+W+' '+H+'" role="img" aria-label="事件概率越低，自信息量越高的对数曲线">';
    [0,.25,.5,.75,1].forEach(t=>{const p=pmin+(pmax-pmin)*t;out+='<line x1="'+X(p)+'" y1="'+T+'" x2="'+X(p)+'" y2="'+B+'" stroke="#efede7"/>'+svgText(X(p),B+19,p.toFixed(2),10)});
    const maxTick=Math.ceil(ymax);for(let tick=0;tick<=maxTick;tick++){const value=tick;if(value<=ymax){out+='<line x1="'+L+'" y1="'+Y(Math.pow(base==='bit'?2:Math.E,-value))+'" x2="'+(W-R)+'" y2="'+Y(Math.pow(base==='bit'?2:Math.E,-value))+'" stroke="#ebe8e1"/>'+svgText(L-9,Y(Math.pow(base==='bit'?2:Math.E,-value))+4,String(tick),10,'end')}}
    let path='';for(let i=0;i<=120;i++){const p=pmin+(pmax-pmin)*i/120;path+=(i?'L':'M')+X(p).toFixed(1)+','+Y(p).toFixed(1)}
    out+='<path d="'+path+'" fill="none" stroke="#75649f" stroke-width="3.5" stroke-linecap="round"/><line x1="'+X(probability)+'" y1="'+T+'" x2="'+X(probability)+'" y2="'+B+'" stroke="#bd7c38" stroke-width="1.5" stroke-dasharray="5 4"/><circle cx="'+X(probability)+'" cy="'+Y(probability)+'" r="6" fill="#bd7c38" stroke="#fffefa" stroke-width="2"/>';
    out+=svgText(L,B+43,'事件概率 p',11,'start','#626e79')+svgText(15,T+5,base==='bit'?'信息量（bit）':'信息量（nat）',10,'start','#626e79');
    out+=svgText(X(.16),T+18,'罕见 · 惊喜多',10,'middle','#8a6741')+svgText(X(.82),Y(.82)-10,'常见 · 惊喜少',10,'middle','#6c7780');
    return out+'</svg>';
  }
  function updateInformation(root){
    const probability=Number(root.querySelector('[data-information-probability]').value),base=root.dataset.base||'nat',value=-(base==='bit'?Math.log2(probability):Math.log(probability)),unit=base==='bit'?'bit':'nat';
    root.querySelector('[data-information-probability-value]').textContent=(probability*100).toFixed(0)+'%';
    root.querySelector('[data-information-value]').textContent=fmt(value,3)+' '+unit;
    root.querySelector('[data-information-chart]').innerHTML=informationChart(base,probability);
    root.querySelectorAll('[data-information-base]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.informationBase===base)));
    root.querySelector('[data-information-hint]').textContent=probability>.75?'结果很常见：发生后带来的新信息较少。':probability>.25?'结果有一定不确定性，信息量也处于中间。':'结果比较少见：一旦发生，会带来更多信息；负对数也会给它更大的损失权重。';
  }

  const entropyScenarios={
    uniform:{name:'类别出现得差不多',values:[1/3,1/3,1/3]},
    skew:{name:'猫更常见，兔子较少',values:[.6,.3,.1]},
    certain:{name:'结果总是猫',values:[1,0,0]}
  };
  function entropyMarkup(){
    return '<section class="lesson-playground entropy-playground" data-entropy-playground data-scenario="skew" aria-labelledby="entropy-playground-title">'
      +'<div class="playground-heading"><div><span class="playground-kicker">互动图解 · 熵 / 交叉熵 / KL</span><h3 id="entropy-playground-title">把“数据本身的不确定”与“模型猜错的代价”分开</h3><p>选择真实分布 P，拖动模型 logits。系统实时计算 H(P)、H(P,Q) 和 KL(P∥Q)。</p></div><button type="button" class="playground-reset" data-entropy-reset>恢复默认</button></div>'
      +'<div class="entropy-scenarios" role="group" aria-label="选择真实数据分布">'+Object.entries(entropyScenarios).map(([id,spec])=>'<button type="button" data-entropy-scenario="'+id+'" aria-pressed="'+String(id==='skew')+'">'+spec.name+'</button>').join('')+'</div>'
      +'<div class="entropy-distributions"><section class="entropy-distribution entropy-truth"><header><strong>真实分布 P(y)</strong><span>数据里各类别实际出现的比例</span></header><div data-entropy-truth-bars role="img" aria-label="真实类别分布"></div></section>'
      +'<section class="entropy-distribution entropy-prediction"><header><strong>模型分布 Q(y)</strong><span>Softmax(logits) 转成的预测概率</span></header><div class="entropy-logits">'+multiclassLabels.map((label,i)=>'<label class="playground-range"><span>'+label+' 的 logit z<sub>'+i+'</sub><output data-entropy-logit-value="'+i+'">'+[-1.6,-1.2,-.7][i].toFixed(2)+'</output></span><input type="range" min="-4" max="4" step="0.1" value="'+[-1.6,-1.2,-.7][i]+'" data-entropy-logit="'+i+'" aria-label="'+label+' 预测 logit"></label>').join('')+'</div><div data-entropy-prediction-bars role="img" aria-label="模型预测类别分布"></div></section></div>'
      +'<div class="entropy-score-grid"><div><span>数据本身的熵</span><strong data-entropy-h>0.898 nat</strong><small>H(P)：标签分布有多不确定</small></div><div><span>模型的交叉熵</span><strong data-entropy-ce>1.389 nat</strong><small>H(P,Q)：真实结果在模型眼中有多意外</small></div><div><span>多出来的代价</span><strong data-entropy-kl>0.492 nat</strong><small>KL(P∥Q)：模型分布与真实分布的差异</small></div></div>'
      +'<div class="entropy-identity"><strong>交叉熵 = 熵 + KL</strong><code>H(P,Q) = H(P) + KL(P∥Q)</code><span data-entropy-scenario-hint></span></div>'
      +'<p class="playground-insight" data-entropy-hint role="status" aria-live="polite"></p>'
      +'<p class="playground-footnote">固定 P 时，H(P) 不随模型变化；训练降低的是 H(P,Q)，也就是把模型分布 Q 往 P 靠近。KL 与交叉熵都依赖方向，交换 P、Q 后通常会变。单个独热标签是 P=[1,0,0] 的特例，交叉熵就只剩 −ln Q(真实类)。</p></section>';
  }
  function entropyBars(values,kind){
    const label=kind==='truth'?'真实 P':'模型 Q';
    return values.map((value,i)=>'<div class="entropy-bar-row"><div class="entropy-bar-label"><strong>'+multiclassLabels[i]+'</strong><span>'+label+'</span><b>'+fmt(value*100,1)+'%</b></div><div class="entropy-bar-track"><i class="'+(kind==='truth'?'is-truth':'is-prediction')+'" style="width:'+(value*100).toFixed(2)+'%"></i></div></div>').join('');
  }
  function updateEntropy(root){
    const scenario=root.dataset.scenario||'skew',truth=entropyScenarios[scenario].values,inputs=[...root.querySelectorAll('[data-entropy-logit]')],logits=inputs.map(input=>Number(input.value)),maximum=Math.max(...logits),exp=logits.map(value=>Math.exp(value-maximum)),sum=exp.reduce((a,b)=>a+b,0),prediction=exp.map(value=>value/sum);
    const entropy=-truth.reduce((total,p)=>total+(p>0?p*Math.log(p):0),0),cross=-truth.reduce((total,p,i)=>total+(p>0?p*Math.log(prediction[i]):0),0),kl=Math.max(0,cross-entropy);
    inputs.forEach((input,i)=>{root.querySelector('[data-entropy-logit-value="'+i+'"]').textContent=fmt(logits[i])});
    root.querySelector('[data-entropy-truth-bars]').innerHTML=entropyBars(truth,'truth');
    root.querySelector('[data-entropy-prediction-bars]').innerHTML=entropyBars(prediction,'prediction');
    root.querySelector('[data-entropy-h]').textContent=fmt(entropy,3)+' nat';
    root.querySelector('[data-entropy-ce]').textContent=fmt(cross,3)+' nat';
    root.querySelector('[data-entropy-kl]').textContent=fmt(kl,3)+' nat';
    root.querySelector('[data-entropy-scenario-hint]').textContent=entropyScenarios[scenario].name+'；选择“结果总是猫”时 H(P)=0，交叉熵直接等于猫这一类的 −ln Q(猫)。';
    root.querySelectorAll('[data-entropy-scenario]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.entropyScenario===scenario)));
    const predicted=prediction.indexOf(Math.max(...prediction));
    root.querySelector('[data-entropy-hint]').textContent='模型目前把 '+multiclassLabels[predicted]+' 排在第一。真实分布中各类仍按 P 加权计分，因此只看最高概率类别或准确率，无法看出交叉熵的完整惩罚。';
  }
  function lossTrainingMarkup(){
    return '<section class="lesson-playground loss-training-card" aria-labelledby="loss-training-title"><div class="playground-heading"><div><span class="playground-kicker">训练流程 · 从分数到更新</span><h3 id="loss-training-title">模型不是“看见答案”，而是收到一条可微的误差信号</h3><p>交叉熵把真实类别概率转换成损失；反向传播再把这条信号传回网络参数。</p></div></div>'
      +'<div class="loss-training-flow" role="img" aria-label="logits 经 CrossEntropyLoss 计算损失，反向传播并更新参数的训练流程"><div><span>神经网络输出</span><strong>logits z</strong></div><i>→</i><div><span>稳定地计算</span><strong>交叉熵 L</strong></div><i>→</i><div><span>反向传播</span><strong>∇W L</strong></div><i>→</i><div><span>优化器更新</span><strong>W ← W − η∇W L</strong></div></div>'
      +'<div class="loss-training-notes"><div><strong>训练时</strong><p>把原始 logits 直接交给损失函数。log-sum-exp 技巧避免巨大分数导致指数溢出，融合的 log-softmax 计算也避免先得到极小概率再取对数。</p></div><div><strong>推理展示时</strong><p>想看每类概率，再对 logits 做 softmax。只取 argmax 可以得到类别，但会丢掉置信度，也不能拿来训练交叉熵。</p></div></div>'
      +'<pre class="loss-training-code"><code>logits = model(images)                  # [N, K]，原始分数\nloss = nn.CrossEntropyLoss()(logits, labels)  # labels: [N] 类别编号\noptimizer.zero_grad()\nloss.backward()\noptimizer.step()</code></pre>'
      +'<p class="playground-footnote">对普通、未加权的单标签多分类，单个样本对 logits 的梯度为 softmax(z)−y。真实类的预测越低，修正信号通常越大；类别权重或标签平滑会改变该表达式。损失是训练目标，不等于准确率、泛化能力或概率校准。</p></section>';
  }

  const optimizerSpecs={
    sgd:{name:'SGD',color:'#8b70bd',hint:'SGD 对每个方向使用同一个学习率。这里 y 方向曲率更大、坡更陡，x 方向会相对缓慢地靠近谷底。'},
    momentum:{name:'动量 SGD',color:'#4c88a6',hint:'动量累计近期梯度方向；在较平缓的 x 方向上可能加快前进，也会让陡峭方向出现惯性和来回摆动。'},
    adam:{name:'Adam',color:'#cf7659',hint:'Adam 对梯度的一阶、二阶移动平均做自适应缩放。它能调整不同参数的步幅，但仍需检查学习率和验证效果。'}
  };
  const objective=(x,y)=>0.075*x*x+2*y*y;
  function optimizerPath(method,lr,steps){
    let x=4,y=3,vx=0,vy=0,mx=0,my=0,sx=0,sy=0;const path=[[x,y,objective(x,y)]];
    for(let t=1;t<=steps;t++){
      const gx=0.15*x,gy=4*y;
      if(method==='sgd'){x-=lr*gx;y-=lr*gy}
      else if(method==='momentum'){vx=0.8*vx+gx;vy=0.8*vy+gy;x-=lr*vx;y-=lr*vy}
      else{
        mx=0.9*mx+0.1*gx;my=0.9*my+0.1*gy;sx=0.999*sx+0.001*gx*gx;sy=0.999*sy+0.001*gy*gy;
        const mhatX=mx/(1-Math.pow(0.9,t)),mhatY=my/(1-Math.pow(0.9,t)),vhatX=sx/(1-Math.pow(0.999,t)),vhatY=sy/(1-Math.pow(0.999,t));
        x-=lr*mhatX/(Math.sqrt(vhatX)+1e-8);y-=lr*mhatY/(Math.sqrt(vhatY)+1e-8);
      }
      if(!Number.isFinite(x)||!Number.isFinite(y)||Math.abs(x)>30||Math.abs(y)>30)break;
      path.push([x,y,objective(x,y)]);
    }
    return path;
  }

  function optimizerMarkup(){
    return '<section class="lesson-playground optimizer-playground" data-optimizer-playground data-optimizer="sgd" aria-labelledby="optimizer-playground-title"><div class="playground-heading"><div><span class="playground-kicker">互动图解 · 优化器走法</span><h3 id="optimizer-playground-title">同一座“损失山谷”，不同优化器怎样下坡？</h3><p>保持起点、函数和步数相同，切换优化器，再调学习率观察轨迹。</p></div><button type="button" class="playground-reset" data-optimizer-reset>恢复默认</button></div><div class="optimizer-methods" role="group" aria-label="高亮一种优化器">'+Object.entries(optimizerSpecs).map(([id,spec])=>'<button type="button" data-optimizer-choose="'+id+'" aria-pressed="'+String(id==='sgd')+'"><i style="--method-color:'+spec.color+'"></i>'+spec.name+'</button>').join('')+'</div><div class="optimizer-layout"><div class="playground-chart optimizer-chart" data-optimizer-chart></div><div class="optimizer-controls"><label class="playground-range"><span>学习率 η <output data-optimizer-rate-value>0.20</output></span><input type="range" min="0.02" max="0.45" step="0.01" value="0.20" data-optimizer-rate aria-label="优化器学习率"></label><label class="playground-range"><span>更新步数 <output data-optimizer-step-value>10</output></span><input type="range" min="0" max="24" step="1" value="10" data-optimizer-step aria-label="优化器更新步数"></label><div class="optimizer-current" data-optimizer-current></div><div class="optimizer-score-table" data-optimizer-table></div></div></div><p class="playground-insight" data-optimizer-hint role="status" aria-live="polite"></p><p class="playground-footnote">教学模拟：固定二维函数 L(x,y)=0.075x²+2y²，初点为 (4,3)。它用来比较更新规则，不代表某个真实神经网络的训练结果；实际表现需在目标数据上验证。</p></section>';
  }

  function optimizerChart(paths,selected){
    const W=760,H=380,L=60,R=18,T=18,B=319,xmin=-1,xmax=5,ymin=-1.2,ymax=4.2,pw=W-L-R,ph=B-T;
    const X=v=>L+(v-xmin)/(xmax-xmin)*pw,Y=v=>B-(v-ymin)/(ymax-ymin)*ph;let out='<svg viewBox="0 0 '+W+' '+H+'" role="img" aria-label="SGD、动量 SGD 和 Adam 在相同二维损失曲面上的更新轨迹"><defs><clipPath id="optimizer-plot-clip"><rect x="'+L+'" y="'+T+'" width="'+pw+'" height="'+ph+'"/></clipPath></defs><rect x="'+L+'" y="'+T+'" width="'+pw+'" height="'+ph+'" fill="#fffefa"/>';
    for(let v=-1;v<=5;v++){out+='<line x1="'+X(v)+'" y1="'+T+'" x2="'+X(v)+'" y2="'+B+'" stroke="#eeece6"/>'+svgText(X(v),B+18,String(v),10)}
    for(let v=-1;v<=4;v++){out+='<line x1="'+L+'" y1="'+Y(v)+'" x2="'+(W-R)+'" y2="'+Y(v)+'" stroke="#eeece6"/>'+svgText(L-10,Y(v)+4,String(v),10,'end')}
    out+=svgText(L,B+39,'参数 x',11,'start','#626e79')+svgText(14,T+5,'参数 y',11,'start','#626e79');
    out+='<g clip-path="url(#optimizer-plot-clip)">';
    [0.25,0.5,1,2,4,8,16,24,32,40].forEach(level=>{const cx=X(0),cy=Y(0),rx=Math.sqrt(level/0.075)*pw/(xmax-xmin),ry=Math.sqrt(level/2)*ph/(ymax-ymin);out+='<ellipse cx="'+cx+'" cy="'+cy+'" rx="'+rx+'" ry="'+ry+'" fill="none" stroke="#dcd9d0" stroke-width="1"/>'});
    Object.entries(optimizerSpecs).forEach(([id,spec])=>{const path=paths[id];if(!path.length)return;const points=path.map(p=>X(p[0]).toFixed(1)+','+Y(p[1]).toFixed(1)).join(' '),last=path[path.length-1];out+='<polyline points="'+points+'" fill="none" stroke="'+spec.color+'" stroke-width="'+(id===selected?3.4:2)+'" stroke-opacity="'+(id===selected?1:.62)+'" stroke-linecap="round" stroke-linejoin="round"/>';
      if(id===selected){out+='<circle cx="'+X(path[0][0])+'" cy="'+Y(path[0][1])+'" r="5" fill="#fffefa" stroke="'+spec.color+'" stroke-width="2.5"/><circle cx="'+X(last[0])+'" cy="'+Y(last[1])+'" r="7" fill="'+spec.color+'" stroke="#fffefa" stroke-width="2.5"/>'}
    });
    out+='</g><circle cx="'+X(0)+'" cy="'+Y(0)+'" r="4" fill="#283b37"/>'+svgText(X(0)+10,Y(0)-9,'最低点 (0,0)',10,'start','#53635e');return out+'</svg>';
  }

  function updateOptimizer(root){
    const selected=root.dataset.optimizer||'sgd',lr=Number(root.querySelector('[data-optimizer-rate]').value),steps=Number(root.querySelector('[data-optimizer-step]').value),paths={};
    Object.keys(optimizerSpecs).forEach(id=>paths[id]=optimizerPath(id,lr,steps));
    root.querySelector('[data-optimizer-rate-value]').textContent=fmt(lr);root.querySelector('[data-optimizer-step-value]').textContent=String(steps);
    root.querySelector('[data-optimizer-chart]').innerHTML=optimizerChart(paths,selected);
    root.querySelectorAll('[data-optimizer-choose]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.optimizerChoose===selected)));
    const selectedEnd=paths[selected][paths[selected].length-1]||[4,3,objective(4,3)];
    root.querySelector('[data-optimizer-current]').innerHTML='<span>当前高亮 · '+optimizerSpecs[selected].name+'</span><strong>L='+fmt(selectedEnd[2])+'</strong><small>(x, y)=('+fmt(selectedEnd[0])+', '+fmt(selectedEnd[1])+')</small>';
    root.querySelector('[data-optimizer-table]').innerHTML='<div class="optimizer-table-heading"><span>相同设置下的结果</span><small>第 '+steps+' 步</small></div>'+Object.entries(optimizerSpecs).map(([id,spec])=>{const p=paths[id][paths[id].length-1]||[4,3,objective(4,3)];return '<div class="optimizer-row" style="--method-color:'+spec.color+'"><span><i></i>'+spec.name+'</span><b>'+fmt(p[2])+'</b><small>损失</small></div>'}).join('');
    const methodHint=optimizerSpecs[selected].hint;const rateHint=lr>=0.34?' 学习率偏大时，注意看陡峭方向是否出现摆动或越过低点。':lr<=0.06?' 当前步幅较小，路径稳定但下降较慢。':'';
    root.querySelector('[data-optimizer-hint]').textContent=methodHint+rateHint;
  }

  const poolValues=[[1,3,2,0],[4,6,1,2],[1,2,5,3],[0,1,7,8]];
  function poolingMarkup(){
    return '<section class="lesson-playground pooling-playground" data-pooling-playground data-pool-method="max" data-pool-stride="2" aria-labelledby="pooling-playground-title"><div class="playground-heading"><div><span class="playground-kicker">互动图解 · 池化窗口</span><h3 id="pooling-playground-title">一个局部窗口，怎样变成一个输出值？</h3><p>切换最大池化与平均池化，再改变步幅、移动输出位置；图中的窗口和对应结果会同步更新。</p></div><button type="button" class="playground-reset" data-pool-reset>恢复默认</button></div><div class="pooling-methods" role="group" aria-label="选择池化计算方式"><button type="button" data-pool-method-choice="max" aria-pressed="true">最大池化</button><button type="button" data-pool-method-choice="avg" aria-pressed="false">平均池化</button></div><div class="playground-chart pooling-chart" data-pool-chart></div><div class="pooling-controls"><div class="pooling-stride-switch"><span>窗口步幅 stride</span><div role="group" aria-label="选择池化步幅"><button type="button" data-pool-stride-choice="1" aria-pressed="false">1 · 重叠滑动</button><button type="button" data-pool-stride-choice="2" aria-pressed="true">2 · 不重叠</button></div></div><label class="playground-range"><span>输出行 <output data-pool-row-value>0</output></span><input type="range" min="0" max="1" step="1" value="0" data-pool-row aria-label="选择输出矩阵中的行"></label><label class="playground-range"><span>输出列 <output data-pool-col-value>0</output></span><input type="range" min="0" max="1" step="1" value="0" data-pool-col aria-label="选择输出矩阵中的列"></label></div><div class="pooling-readouts" data-pool-readouts></div><p class="playground-insight" data-pool-hint role="status" aria-live="polite"></p><p class="playground-footnote">教学例子使用固定的 4×4 特征图和 2×2 无填充窗口。步幅改变窗口移动距离；池化不会学习新权重，但输出更小也意味着空间位置细节更少。真实网络还要核对 padding、奇数尺寸和具体框架的输出规则。</p></section>';
  }
  function poolingResult(method,row,col,stride){
    const values=[];
    for(let r=0;r<2;r++)for(let c=0;c<2;c++)values.push(poolValues[row*stride+r][col*stride+c]);
    return method==='max'?Math.max(...values):values.reduce((sum,value)=>sum+value,0)/values.length;
  }
  function poolingSvg(method,stride,row,col){
    const outputSize=Math.floor((4-2)/stride)+1,windowRow=row*stride,windowCol=col*stride,W=760,H=302;
    const inputX=48,inputY=87,cell=46,outX=513,outY=100,outCell=52;
    let out='<svg viewBox="0 0 '+W+' '+H+'" role="img" aria-label="池化交互图：左侧 4 乘 4 输入特征图中高亮一个 2 乘 2 窗口，右侧显示对应输出矩阵"><rect width="760" height="302" fill="#fffefa"/>';
    out+=svgText(inputX,35,'输入特征图 · 4 × 4',14,'start','#4e5e69')+svgText(outX,35,'输出特征图 · '+outputSize+' × '+outputSize,14,'start','#4e5e69');
    out+=svgText(inputX,57,'橙色：窗口内最大值；紫色：当前参与计算的窗口',10,'start','#79838a');
    for(let r=0;r<4;r++)for(let c=0;c<4;c++){
      const inWindow=r>=windowRow&&r<windowRow+2&&c>=windowCol&&c<windowCol+2;
      const winner=inWindow&&poolValues[r][c]===Math.max(poolValues[windowRow][windowCol],poolValues[windowRow][windowCol+1],poolValues[windowRow+1][windowCol],poolValues[windowRow+1][windowCol+1]);
      const x=inputX+c*cell,y=inputY+r*cell,fill=winner?'#f4d9b7':inWindow?'#ebe6f4':'#f2f3f0',stroke=winner?'#c87928':inWindow?'#8879b3':'#fffefa';
      out+='<rect x="'+x+'" y="'+y+'" width="'+(cell-3)+'" height="'+(cell-3)+'" rx="4" fill="'+fill+'" stroke="'+stroke+'" stroke-width="'+(inWindow?2:1)+'"/>'+svgText(x+(cell-3)/2,y+29,String(poolValues[r][c]),15,'middle',winner?'#8f511d':'#47545e');
    }
    out+='<path d="M252 172H439M429 161L440 172L429 183" fill="none" stroke="#8d8a9b" stroke-width="2"/><rect x="300" y="136" width="94" height="25" rx="12" fill="#f0edf6"/>'+svgText(347,153,method==='max'?'取最大值':'取窗口均值',10,'middle','#62538b');
    for(let r=0;r<outputSize;r++)for(let c=0;c<outputSize;c++){
      const value=poolingResult(method,r,c,stride),selected=r===row&&c===col,x=outX+c*outCell,y=outY+r*outCell;
      out+='<rect x="'+x+'" y="'+y+'" width="'+(outCell-4)+'" height="'+(outCell-4)+'" rx="4" fill="'+(selected?'#e9e3f3':'#f2f3f0')+'" stroke="'+(selected?'#8879b3':'#fffefa')+'" stroke-width="'+(selected?2:1)+'"/>'+svgText(x+(outCell-4)/2,y+32,fmt(value),14,'middle',selected?'#574786':'#47545e');
    }
    out+=svgText(510,270,'高亮输出 ['+row+', '+col+'] ← 输入窗口左上角 ['+windowRow+', '+windowCol+']',10,'start','#747e87');
    return out+'</svg>';
  }
  function updatePooling(root){
    const method=root.dataset.poolMethod||'max',stride=Number(root.dataset.poolStride)||2,outputSize=Math.floor((4-2)/stride)+1;
    const rowInput=root.querySelector('[data-pool-row]'),colInput=root.querySelector('[data-pool-col]');
    rowInput.max=String(outputSize-1);colInput.max=String(outputSize-1);
    const row=Math.min(outputSize-1,Number(rowInput.value)||0),col=Math.min(outputSize-1,Number(colInput.value)||0);
    rowInput.value=String(row);colInput.value=String(col);
    root.querySelector('[data-pool-row-value]').textContent=String(row);root.querySelector('[data-pool-col-value]').textContent=String(col);
    root.querySelector('[data-pool-chart]').innerHTML=poolingSvg(method,stride,row,col);
    root.querySelectorAll('[data-pool-method-choice]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.poolMethodChoice===method)));
    root.querySelectorAll('[data-pool-stride-choice]').forEach(button=>button.setAttribute('aria-pressed',String(Number(button.dataset.poolStrideChoice)===stride)));
    const windowRow=row*stride,windowCol=col*stride,values=[poolValues[windowRow][windowCol],poolValues[windowRow][windowCol+1],poolValues[windowRow+1][windowCol],poolValues[windowRow+1][windowCol+1]],value=poolingResult(method,row,col,stride);
    root.querySelector('[data-pool-readouts]').innerHTML='<div><span>当前窗口的 4 个值</span><strong>['+values.join(', ')+']</strong></div><div><span>'+ (method==='max'?'池化输出 · 最大值':'池化输出 · 平均值')+'</span><strong>'+fmt(value)+'</strong></div><div><span>输出形状</span><strong>['+outputSize+', '+outputSize+']</strong></div>';
    root.querySelector('[data-pool-hint]').textContent=method==='max'?'窗口里最强的激活被保留下来；切换窗口可看到峰值怎样移动到输出图。':'窗口里的数值被平均，强峰会被邻近低值拉低；这保留整体强度，但弱化局部尖峰。';
  }

  const trainingCurve={train:[1.92,1.58,1.32,1.13,0.98,0.86,0.77,0.69,0.62,0.56,0.51,0.47,0.44,0.41,0.39,0.37,0.355,0.34,0.328,0.316,0.306,0.297,0.288,0.28,0.272,0.265,0.258,0.252,0.246,0.24],validation:[1.70,1.42,1.20,1.02,0.90,0.80,0.73,0.67,0.62,0.58,0.55,0.53,0.52,0.525,0.54,0.57,0.61,0.66,0.72,0.79,0.87,0.96,1.06,1.17,1.29,1.42,1.56,1.71,1.87,2.04]};
  const bestTrainingEpoch=trainingCurve.validation.indexOf(Math.min(...trainingCurve.validation))+1;
  function trainingMarkup(){
    return '<section class="lesson-playground training-playground" data-training-playground aria-labelledby="training-playground-title"><div class="playground-heading"><div><span class="playground-kicker">互动图解 · 训练与验证</span><h3 id="training-playground-title">训练得越来越好，为什么验证结果反而变差？</h3><p>拖动轮次指针，看两条误差曲线怎样分开。试着比较当前轮与最佳验证轮。</p></div><button type="button" class="playground-reset" data-training-reset>回到第 20 轮</button></div><div class="playground-chart training-chart" data-training-chart></div><div class="training-controls"><label class="playground-range"><span>查看训练轮次 <output data-training-epoch-value>20</output></span><input type="range" min="1" max="30" step="1" value="20" data-training-epoch aria-label="选择要观察的训练轮次"></label><button type="button" class="secondary" data-training-best>跳到最佳验证轮次</button></div><div class="training-readouts" data-training-readouts></div><p class="playground-insight" data-training-hint role="status" aria-live="polite"></p><p class="playground-footnote">教学示意曲线，不是某次真实训练记录。示例用验证损失最低点说明检查点选择；检测任务通常还会按验证 fitness、mAP 等配置指定的指标选权重。看到验证曲线波动时，应结合数据划分、其他指标与失败样例判断。</p></section>';
  }
  function trainingSvg(epoch){
    const W=760,H=350,L=66,R=25,T=25,B=281,xmin=1,xmax=30,ymin=0,ymax=2.1,pw=W-L-R,ph=B-T;
    const X=value=>L+(value-xmin)/(xmax-xmin)*pw,Y=value=>B-(value-ymin)/(ymax-ymin)*ph;
    let out='<svg viewBox="0 0 '+W+' '+H+'" role="img" aria-label="訓練示意曲線：训练损失逐轮下降，验证损失先下降后上升；竖线标出当前轮，绿色虚线标出最佳验证轮次"><rect width="760" height="350" fill="#fffefa"/>';
    for(let value=0;value<=2.001;value+=0.5)out+='<line x1="'+L+'" y1="'+Y(value)+'" x2="'+(W-R)+'" y2="'+Y(value)+'" stroke="#eeece6"/>'+svgText(L-10,Y(value)+4,value.toFixed(1),10,'end','#7c858c');
    for(let value=1;value<=30;value+=5)out+='<line x1="'+X(value)+'" y1="'+T+'" x2="'+X(value)+'" y2="'+B+'" stroke="#f2f0eb"/>'+svgText(X(value),B+18,String(value),9,'middle','#7c858c');
    out+=svgText(17,T+3,'损失',10,'start','#717c84')+svgText(W-R,B+36,'epoch',10,'end','#717c84');
    const points=(values)=>values.map((value,index)=>X(index+1).toFixed(1)+','+Y(value).toFixed(1)).join(' ');
    out+='<polyline points="'+points(trainingCurve.train)+'" fill="none" stroke="#668db4" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><polyline points="'+points(trainingCurve.validation)+'" fill="none" stroke="#d4895c" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>';
    const bestX=X(bestTrainingEpoch),currentX=X(epoch),trainY=Y(trainingCurve.train[epoch-1]),valY=Y(trainingCurve.validation[epoch-1]);
    out+='<line x1="'+bestX+'" y1="'+T+'" x2="'+bestX+'" y2="'+B+'" stroke="#5d987f" stroke-width="1.6" stroke-dasharray="5 5"/>'+svgText(bestX+5,T+12,'最佳轮 '+bestTrainingEpoch,9,'start','#4e876f');
    out+='<line x1="'+currentX+'" y1="'+T+'" x2="'+currentX+'" y2="'+B+'" stroke="#75649f" stroke-width="1.6" stroke-dasharray="3 4"/><circle cx="'+currentX+'" cy="'+trainY+'" r="5.5" fill="#668db4" stroke="#fffefa" stroke-width="2"/><circle cx="'+currentX+'" cy="'+valY+'" r="5.5" fill="#d4895c" stroke="#fffefa" stroke-width="2"/>';
    const legendY=H-17;out+='<line x1="244" y1="'+legendY+'" x2="261" y2="'+legendY+'" stroke="#668db4" stroke-width="3"/>'+svgText(267,legendY+4,'训练损失',10,'start','#5a6874')+'<line x1="357" y1="'+legendY+'" x2="374" y2="'+legendY+'" stroke="#d4895c" stroke-width="3"/>'+svgText(380,legendY+4,'验证损失',10,'start','#5a6874')+'<line x1="474" y1="'+legendY+'" x2="491" y2="'+legendY+'" stroke="#5d987f" stroke-width="2" stroke-dasharray="4 4"/>'+svgText(497,legendY+4,'最佳验证轮次',10,'start','#5a6874');
    return out+'</svg>';
  }
  function updateTraining(root){
    const input=root.querySelector('[data-training-epoch]'),epoch=Math.min(trainingCurve.train.length,Math.max(1,Number(input.value)||1));input.value=String(epoch);
    const train=trainingCurve.train[epoch-1],validation=trainingCurve.validation[epoch-1],best=trainingCurve.validation[bestTrainingEpoch-1];
    root.querySelector('[data-training-epoch-value]').textContent=String(epoch);
    root.querySelector('[data-training-chart]').innerHTML=trainingSvg(epoch);
    root.querySelector('[data-training-readouts]').innerHTML='<div><span>第 '+epoch+' 轮 · 训练损失</span><strong>'+fmt(train,3)+'</strong></div><div><span>第 '+epoch+' 轮 · 验证损失</span><strong>'+fmt(validation,3)+'</strong></div><div><span>最佳验证轮次</span><strong>第 '+bestTrainingEpoch+' 轮 · '+fmt(best,3)+'</strong></div>';
    const hint=epoch<bestTrainingEpoch?'这时验证损失仍在下降。可以继续训练，并持续用验证集比较检查点。':epoch===bestTrainingEpoch?'本例到达验证损失最低点。若以验证损失选模型，这一轮的权重会成为当前最佳检查点。':'验证损失已经高于第 '+bestTrainingEpoch+' 轮；这是泛化变差的信号。比较并保留最佳检查点，再检查数据划分与其他验证指标。';
    root.querySelector('[data-training-hint]').textContent=hint;
  }

  const yoloReadinessItems=[
    {id:'coverage',title:'图像覆盖真实场景',detail:'光照、背景、角度、目标大小尽量贴近实际使用情况。',hint:'先补足真实应用里容易漏掉的光照、背景、角度和目标大小。'},
    {id:'labels',title:'标注框与类别准确',detail:'抽查是否漏框、错类、框偏位；一个框对应一个目标。',hint:'把标注框画回图像，检查漏标、错类和框偏位。'},
    {id:'classes',title:'类别编号与名称一致',detail:'从 0 开始的类号必须对应 YAML names 中相同顺序。',hint:'核对类别 ID 与 names 的顺序，避免框对了却教错类别。'},
    {id:'splits',title:'相似来源分到同一组',detail:'按视频、场景或采集批次划分，避免近重复图像泄漏。',hint:'先按视频、场景或采集批次分组，再划分训练、验证和测试。'},
    {id:'config',title:'路径与配置读对了',detail:'核对 train / val 路径、类别数和标签图；先做短程检查。',hint:'检查 YAML 路径和类别映射，再抽看程序实际读取的标签图。'}
  ];
  function yoloReadinessMarkup(){
    return '<section class="lesson-playground yolo-readiness-playground" data-yolo-readiness aria-labelledby="yolo-readiness-title">'
      +'<div class="playground-heading"><div><span class="playground-kicker">互动清单 · 开训前的数据体检</span><h3 id="yolo-readiness-title">这五项都核对过了吗？</h3><p>逐项点击，给已完成的检查打勾。训练能启动，只说明程序开始运行，不代表数据已经正确。</p></div><button type="button" class="playground-reset" data-yolo-readiness-reset>清空勾选</button></div>'
      +'<div class="yolo-readiness-rail" role="img" aria-label="从真实场景图像、准确标注、统一类别、合理划分到正确配置的检查链路">'+yoloReadinessItems.map((item,index)=>'<div class="yolo-readiness-node"><span>'+(index+1)+'</span><strong>'+item.title.replace('图像覆盖真实场景','图像覆盖').replace('标注框与类别准确','框标准确').replace('类别编号与名称一致','类号统一').replace('相似来源分到同一组','分组划分').replace('路径与配置读对了','配置读对')+'</strong></div>').join('')+'</div>'
      +'<div class="yolo-readiness-grid" role="group" aria-label="开训前五项检查">'+yoloReadinessItems.map(item=>'<button type="button" class="yolo-readiness-check" data-yolo-readiness-check="'+item.id+'" aria-pressed="false"><span class="yolo-readiness-mark" data-readiness-mark aria-hidden="true">○</span><span><strong>'+item.title+'</strong><small>'+item.detail+'</small></span><em data-readiness-state>待检查</em></button>').join('')+'</div>'
      +'<div class="yolo-readiness-result"><div class="yolo-readiness-progress" role="progressbar" aria-label="已完成的开训前检查" aria-valuemin="0" aria-valuemax="5" aria-valuenow="0"><span data-yolo-readiness-fill></span></div><strong data-yolo-readiness-count>0 / 5 项已核对</strong></div>'
      +'<p class="playground-insight" data-yolo-readiness-hint role="status" aria-live="polite">'+yoloReadinessItems[0].hint+'</p><p class="playground-footnote">勾选只是提醒自己完成了检查；如实核验标签图、数据路径和独立验证结果，才是判断依据。</p></section>';
  }
  function updateYoloReadiness(root){
    const checked=new Set();
    root.querySelectorAll('[data-yolo-readiness-check]').forEach(button=>{
      const ready=button.getAttribute('aria-pressed')==='true';
      if(ready)checked.add(button.dataset.yoloReadinessCheck);
      button.querySelector('[data-readiness-mark]').textContent=ready?'✓':'○';
      button.querySelector('[data-readiness-state]').textContent=ready?'已核对':'待检查';
    });
    const count=checked.size,percent=count/yoloReadinessItems.length*100;
    const progress=root.querySelector('[role="progressbar"]');
    progress.setAttribute('aria-valuenow',String(count));
    root.querySelector('[data-yolo-readiness-fill]').style.width=percent+'%';
    root.querySelector('[data-yolo-readiness-count]').textContent=count+' / '+yoloReadinessItems.length+' 项已核对';
    const next=yoloReadinessItems.find(item=>!checked.has(item.id));
    root.querySelector('[data-yolo-readiness-hint]').textContent=count===yoloReadinessItems.length
      ?'五项都已核对。先做短程训练，确认标签图、损失和验证预测，再启动正式实验。'
      :next.hint;
  }

  const yoloLogFields={
    epoch:{group:'训练进度',title:'epoch · 完整遍历几轮',sample:'epoch 50 / 100',description:'一个 epoch 通常表示训练集被完整遍历一次。它不是一次参数更新；每轮包含多少 batch 取决于数据量与 batch size。',caution:'跑更多轮不保证验证效果更好。'},
    imgsz:{group:'训练设置',title:'imgsz · 输入图像尺寸',sample:'imgsz 640',description:'常见训练配置会把图像缩放到指定尺寸。更高分辨率可能保留小目标细节，也会增加显存、计算量和耗时。',caution:'需要结合目标大小、显存与固定验证方案比较。'},
    batch:{group:'训练设置',title:'batch · 每批图像数',sample:'batch 16',description:'模型每次用一小批图像和标签计算损失。batch size 会影响显存、吞吐和梯度估计。',caution:'它不是类别数，也没有适合所有设备的单一最佳值。'},
    lr:{group:'训练设置',title:'lr · 学习率',sample:'lr 0.001',description:'学习率控制优化器每次更新参数的步幅。日志可能显示当前学习率或不同参数组的学习率。',caution:'学习率需要结合优化器、训练阶段和损失变化判断。'},
    box_loss:{group:'YOLOv5 训练损失',title:'box_loss · 框定位误差',sample:'box_loss 0.72',description:'衡量预测框与真实框的位置差异。当前 YOLOv5 实现以 CIoU 误差形成框项，再按训练配置加权。',caution:'不同数据、模型和配置下的原始损失数值不能直接当作统一排行榜。'},
    obj_loss:{group:'YOLOv5 训练损失',title:'obj_loss · 目标性误差',sample:'obj_loss 0.48',description:'学习候选位置是否包含目标。检测器会同时处理正样本与大量背景位置，并按尺度和配置汇总。',caution:'它不是最终 Precision，也不是置信度阈值。'},
    cls_loss:{group:'YOLOv5 训练损失',title:'cls_loss · 类别误差',sample:'cls_loss 0.31',description:'学习已匹配目标属于哪个类别；多类别检测中会监督类别分数。类别数为 1 时，当前 YOLOv5 实现会跳过分类损失项。',caution:'标签类号、类别顺序错了，损失曲线下降也可能是在学错映射。'},
    dfl_loss:{group:'部分较新检测头',title:'dfl_loss · 分布焦点损失',sample:'dfl_loss 0.93',description:'Distribution Focal Loss，用离散分布监督边界框距离的回归。部分较新的检测头会使用这一项。',caution:'它不是“置信度损失”，也不是标准 YOLOv5 ComputeLoss 的第四项；看到它时先核对模型与仓库版本。'},
    precision:{group:'验证集指标',title:'Precision · 查准率',sample:'Precision 0.84',description:'在被模型报出来的目标中，有多少与真实目标匹配。误报越多，Precision 通常越容易下降。',caution:'检测指标受置信度和 IoU 匹配口径影响，应连同阈值与类别看。'},
    recall:{group:'验证集指标',title:'Recall · 查全率',sample:'Recall 0.76',description:'真实目标中，有多少被模型成功找出。漏检越多，Recall 通常越容易下降。',caution:'为了提高 Recall 而降低置信度，可能同时带来更多误报。'},
    map50:{group:'验证集指标',title:'mAP@0.5 · 一个 IoU 门槛下的平均精度',sample:'mAP@0.5 0.81',description:'按 IoU=0.5 的匹配门槛计算各类别 AP，再对类别求平均。',caution:'不能脱离数据集、类别构成和评估口径比较不同实验。'},
    map5095:{group:'验证集指标',title:'mAP@0.5:0.95 · 多个 IoU 门槛的平均精度',sample:'mAP@0.5:0.95 0.56',description:'在 IoU 0.50 到 0.95、间隔 0.05 的多个门槛分别计算 AP 后取平均；对框定位更严格。',caution:'示例数字仅用于识别字段，不是通用达标线。'}
  };
  const yoloLogGroups=[
    {title:'先看训练条件',fields:['epoch','imgsz','batch','lr']},
    {title:'YOLOv5 常见训练损失',fields:['box_loss','obj_loss','cls_loss']},
    {title:'验证集看检测效果',fields:['precision','recall','map50','map5095']},
    {title:'版本差异提示',fields:['dfl_loss']}
  ];
  function yoloTrainingLogMarkup(){
    return '<section class="lesson-playground yolo-log-playground" data-yolo-log data-yolo-log-field="box_loss" aria-labelledby="yolo-log-title">'
      +'<div class="playground-heading"><div><span class="playground-kicker">互动读数 · YOLO 训练日志</span><h3 id="yolo-log-title">一行日志里，哪些是“在学”，哪些是“学得好不好”？</h3><p>训练集用来更新参数；验证集用来检查模型遇到未见图像时的表现。点击字段看它在回答什么问题。</p></div></div>'
      +'<div class="yolo-log-flow" aria-label="训练阶段更新参数，验证阶段计算检测指标"><div class="yolo-log-lane"><strong>训练集 · 更新参数</strong><div><span>图像 + 标签</span><b aria-hidden="true">→</b><span>前向预测</span><b aria-hidden="true">→</b><span>计算损失</span><b aria-hidden="true">→</b><span>反向传播与更新</span></div></div><div class="yolo-log-lane validation"><strong>验证集 · 检查泛化</strong><div><span>未用于更新的图像</span><b aria-hidden="true">→</b><span>预测并匹配真实框</span><b aria-hidden="true">→</b><span>Precision / Recall / mAP</span></div></div></div>'
      +'<div class="yolo-log-groups">'+yoloLogGroups.map(group=>'<section class="yolo-log-group"><h4>'+group.title+'</h4><div role="group" aria-label="'+group.title+'">'+group.fields.map(id=>'<button type="button" data-yolo-log-field-choice="'+id+'" aria-pressed="'+String(id==='box_loss')+'">'+id+'</button>').join('')+'</div></section>').join('')+'</div>'
      +'<div class="yolo-log-detail" aria-live="polite"><div><span data-yolo-log-group>YOLOv5 训练损失</span><h4 data-yolo-log-field-title>box_loss · 框定位误差</h4><p data-yolo-log-description></p><p class="yolo-log-caution" data-yolo-log-caution></p></div><div class="yolo-log-example"><small>演示字段值</small><strong data-yolo-log-sample>box_loss 0.72</strong><span>只用于读懂名称，不代表训练结果或达标线</span></div></div>'
      +'<p class="playground-footnote">同一实验里，损失趋势要和验证指标、类别分布及预测图一起判断。不同模型、任务和版本可能使用不同损失项；比较时也要保持数据与评估口径一致。</p></section>';
  }
  function updateYoloTrainingLog(root){
    const id=root.dataset.yoloLogField||'box_loss',field=yoloLogFields[id]||yoloLogFields.box_loss;
    root.querySelectorAll('[data-yolo-log-field-choice]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.yoloLogFieldChoice===id)));
    root.querySelector('[data-yolo-log-group]').textContent=field.group;
    root.querySelector('[data-yolo-log-field-title]').textContent=field.title;
    root.querySelector('[data-yolo-log-description]').textContent=field.description;
    root.querySelector('[data-yolo-log-caution]').textContent=field.caution;
    root.querySelector('[data-yolo-log-sample]').textContent=field.sample;
  }

  const taskSpecs={
    classification:{name:'图像分类',question:'整张图里有什么？',label:'每张图一个或多个类别',output:'图像级类别分数',metric:'准确率 / Top-k',cost:'标注通常较轻',summary:'适合判断是否出现某类物体。若一张图可同时属于多个类别，要采用多标签定义。'},
    detection:{name:'目标检测',question:'每个物体在哪里？',label:'每个实例一个类别和边界框',output:'框坐标 + 类别 + 分数',metric:'按类 AP / mAP',cost:'需逐个框出物体',summary:'适合计数、定位和逐目标告警；框包含部分背景，轮廓并不精确。'},
    segmentation:{name:'语义分割',question:'哪些像素属于哪一类？',label:'像素级类别掩码',output:'逐像素类别图',metric:'IoU / mIoU',cost:'像素标注较细',summary:'适合面积、边界或区域分析。同类多个实例不会自动获得不同身份；区分实例要用实例分割。'}
  };
  function tasksMarkup(){
    return '<section class="lesson-playground tasks-playground" data-tasks-playground data-task-mode="classification" aria-labelledby="tasks-playground-title"><div class="playground-heading"><div><span class="playground-kicker">互动图解 · 视觉任务选型</span><h3 id="tasks-playground-title">同一张图，三种任务会给出什么不同答案？</h3><p>切换任务，观察输入图上的标注和模型输出如何变化。先从“系统要回答什么”开始选。</p></div><button type="button" class="playground-reset" data-task-reset>恢复分类视图</button></div><div class="task-mode-switch" role="group" aria-label="选择视觉任务">'+Object.entries(taskSpecs).map(([id,spec])=>'<button type="button" data-task-choice="'+id+'" aria-pressed="'+String(id==='classification')+'">'+spec.name+'</button>').join('')+'</div><div class="playground-chart tasks-chart" data-task-scene></div><div class="task-readouts" data-task-readouts></div><p class="playground-insight" data-task-hint role="status" aria-live="polite"></p><p class="playground-footnote">示意图中的输出是教学插画，不是模型推理结果。语义分割按像素分配类别；实例分割还要区分同类的各个对象。任务标注、模型输出与评估指标需要相互匹配。</p></section>';
  }
  function taskSceneSvg(mode){
    const selected=taskSpecs[mode];let out='<svg viewBox="0 0 760 310" role="img" aria-label="同一张道路场景分别展示'+selected.name+'的图像级、边界框或像素掩码输出"><rect width="760" height="310" fill="#fffefa"/><text x="42" y="34" fill="#586571" font-size="13" font-weight="650">同一输入图像</text><text x="383" y="34" fill="#586571" font-size="13" font-weight="650">'+esc(selected.name)+'的输出示意</text><rect x="40" y="50" width="294" height="216" rx="5" fill="#deebea"/><rect x="40" y="165" width="294" height="101" fill="#b6c9c3"/><path d="M40 166L110 105L169 159L231 94L334 164" fill="#ceddd5"/><path d="M40 205H334M40 236H334" stroke="#9aacaa" stroke-width="3"/><path d="M164 166L206 166L248 266H116Z" fill="#8e9e9b"/><path d="M175 189H187M190 218H207M153 241H216" stroke="#f5f0dc" stroke-width="3" stroke-dasharray="8 7"/><rect x="132" y="156" width="100" height="39" rx="10" fill="#729187"/><path d="M146 156L164 140H202L220 156" fill="#729187"/><circle cx="154" cy="197" r="10" fill="#445955"/><circle cx="211" cy="197" r="10" fill="#445955"/><circle cx="88" cy="153" r="7" fill="#cb8a67"/><path d="M88 160L88 183M78 171L98 171M88 183L79 197M88 183L97 197" stroke="#cb8a67" stroke-width="5" stroke-linecap="round"/><text x="48" y="286" fill="#7b858d" font-size="10">输入固定，变化的是任务定义和监督粒度</text>';
    if(mode==='classification'){
      out+='<rect x="381" y="55" width="336" height="205" rx="7" fill="#f2f0f6" stroke="#e4dfed"/><rect x="402" y="77" width="99" height="22" rx="11" fill="#e7e1f1"/><text x="451" y="92" text-anchor="middle" fill="#655593" font-size="10" font-weight="650">图像级输出</text><text x="402" y="137" fill="#354552" font-size="20" font-weight="700">汽车</text><text x="699" y="136" text-anchor="end" fill="#557e71" font-size="16" font-weight="700">0.92</text><rect x="402" y="150" width="296" height="8" rx="4" fill="#e2e2de"/><rect x="402" y="150" width="272" height="8" rx="4" fill="#729d8c"/><text x="402" y="190" fill="#65727d" font-size="11">模型回答：这张图里最可能有什么？</text><text x="402" y="219" fill="#899198" font-size="10">不提供位置；只看得出整张图包含汽车</text>';
    }else if(mode==='detection'){
      out+='<rect x="126" y="136" width="111" height="70" fill="none" stroke="#7a65aa" stroke-width="2.5"/><rect x="126" y="121" width="96" height="16" rx="2" fill="#7a65aa"/><text x="132" y="133" fill="#fff" font-size="9">汽车 0.92</text><rect x="69" y="142" width="39" height="63" fill="none" stroke="#4c8b78" stroke-width="2.5"/><rect x="69" y="127" width="80" height="16" rx="2" fill="#4c8b78"/><text x="75" y="139" fill="#fff" font-size="9">行人 0.87</text><rect x="383" y="58" width="326" height="201" rx="6" fill="#f7f6f1" stroke="#e9e6df"/><text x="405" y="90" fill="#384652" font-size="15" font-weight="700">逐个目标输出</text><rect x="405" y="108" width="281" height="47" rx="4" fill="#f0edf6"/><rect x="405" y="108" width="3" height="47" fill="#7a65aa"/><text x="420" y="128" fill="#514477" font-size="11" font-weight="650">汽车 · 0.92</text><text x="420" y="144" fill="#73808b" font-size="10">边界框：左、上、右、下坐标</text><rect x="405" y="166" width="281" height="47" rx="4" fill="#edf4f0"/><rect x="405" y="166" width="3" height="47" fill="#4c8b78"/><text x="420" y="186" fill="#3c7966" font-size="11" font-weight="650">行人 · 0.87</text><text x="420" y="202" fill="#73808b" font-size="10">每个实例都有自己的框和类别</text><text x="405" y="238" fill="#899198" font-size="10">矩形定位，不精确描述目标轮廓</text>';
    }else{
      out+='<path d="M164 166L179 151L202 151L221 166L232 193L126 193L140 166Z" fill="#8067b3" fill-opacity=".42" stroke="#70589f" stroke-width="1.5"/><path d="M40 205H334M40 236H334M164 166L206 166L248 266H116Z" fill="#538f7b" fill-opacity=".23" stroke="#538f7b" stroke-width="1.2"/><rect x="383" y="58" width="326" height="201" rx="6" fill="#f7f6f1" stroke="#e9e6df"/><text x="405" y="90" fill="#384652" font-size="15" font-weight="700">每个像素都有类别</text><rect x="407" y="111" width="16" height="16" rx="3" fill="#8067b3" fill-opacity=".65"/><text x="433" y="123" fill="#56636e" font-size="11">汽车像素</text><rect x="407" y="141" width="16" height="16" rx="3" fill="#538f7b" fill-opacity=".5"/><text x="433" y="153" fill="#56636e" font-size="11">道路像素</text><rect x="407" y="171" width="16" height="16" rx="3" fill="#dce8e4"/><text x="433" y="183" fill="#56636e" font-size="11">背景像素</text><text x="405" y="220" fill="#73808b" font-size="10">紫色覆盖汽车区域，绿色覆盖道路区域</text><text x="405" y="239" fill="#899198" font-size="10">像素边界更细，标注也需要更多细节</text>';
    }
    return out+'</svg>';
  }
  function updateTasks(root){
    const mode=root.dataset.taskMode||'classification',spec=taskSpecs[mode];
    root.querySelector('[data-task-scene]').innerHTML=taskSceneSvg(mode);
    root.querySelectorAll('[data-task-choice]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.taskChoice===mode)));
    root.querySelector('[data-task-readouts]').innerHTML='<div><span>系統要回答</span><strong>'+spec.question+'</strong></div><div><span>标注单位</span><strong>'+spec.label+'</strong></div><div><span>模型主要输出</span><strong>'+spec.output+'</strong></div><div><span>常见评估 / 标注特点</span><strong>'+spec.metric+' · '+spec.cost+'</strong></div>';
    root.querySelector('[data-task-hint]').textContent=spec.summary+' 选能满足决策需求的最简单粒度。';
  }

  const augmentationModes={
    flip:{name:'水平翻转',hint:'左右镜像后，中心横坐标变为 x′ = 1 − x；中心纵坐标和宽高保持不变。'},
    zoom:{name:'中心裁剪 / 缩放',hint:'围绕图像中心缩放；放大时会裁切出界部分，缩小时目标框也会随图像缩小，再重新计算归一化中心与宽高。'},
    color:{name:'颜色扰动',hint:'颜色或亮度变化修改像素值，不改变目标的位置和大小，因此 YOLO 框坐标保持不变。'}
  };
  const augmentationBox={cx:0.28,cy:0.52,w:0.20,h:0.32};
  const clamp01=value=>Math.min(1,Math.max(0,value));
  function augmentationTargetBox(mode,strength){
    const box=augmentationBox;
    if(mode==='flip')return {cx:1-box.cx,cy:box.cy,w:box.w,h:box.h};
    if(mode!=='zoom')return {cx:box.cx,cy:box.cy,w:box.w,h:box.h};
    return {cx:0.5+(box.cx-0.5)*strength,cy:0.5+(box.cy-0.5)*strength,w:box.w*strength,h:box.h*strength};
  }
  function transformedAugmentationBox(mode,strength){
    const box=augmentationTargetBox(mode,strength);
    const left=clamp01(box.cx-box.w/2),right=clamp01(box.cx+box.w/2);
    const top=clamp01(box.cy-box.h/2),bottom=clamp01(box.cy+box.h/2);
    return {cx:(left+right)/2,cy:(top+bottom)/2,w:right-left,h:bottom-top};
  }
  function augmentationFrame(x,title,target,box,colorShift,label){
    const y=48,px=x+20,py=y+16,pw=286,ph=132;
    let out='<g><text x="'+(x+12)+'" y="28" fill="#596672" font-size="13" font-weight="700">'+esc(title)+'</text>';
    out+='<rect x="'+px+'" y="'+py+'" width="'+pw+'" height="'+ph+'" rx="4" fill="'+(colorShift?'#f2e7d7':'#e6efec')+'" stroke="#d9e2de"/>';
    for(let i=1;i<4;i++){
      const gx=px+pw*i/4,gy=py+ph*i/4;
      out+='<line x1="'+gx+'" y1="'+py+'" x2="'+gx+'" y2="'+(py+ph)+'" stroke="#ffffff" stroke-opacity=".8"/><line x1="'+px+'" y1="'+gy+'" x2="'+(px+pw)+'" y2="'+gy+'" stroke="#ffffff" stroke-opacity=".8"/>';
    }
    const tx=px+(target.cx-target.w/2)*pw,ty=py+(target.cy-target.h/2)*ph,tw=target.w*pw,th=target.h*ph,tcx=tx+tw/2;
    out+='<defs><clipPath id="augment-window-'+x+'"><rect x="'+px+'" y="'+py+'" width="'+pw+'" height="'+ph+'"/></clipPath></defs><g clip-path="url(#augment-window-'+x+')">';
    out+='<rect x="'+tx+'" y="'+ty+'" width="'+tw+'" height="'+th+'" fill="#3e967c" fill-opacity=".16"/><circle cx="'+tcx+'" cy="'+(ty+th*.2)+'" r="'+Math.min(tw*.15,th*.13)+'" fill="'+(colorShift?'#9b7951':'#43866d')+'"/>';
    out+='<path d="M'+tcx+' '+(ty+th*.36)+'V'+(ty+th*.65)+' M'+(tcx-tw*.26)+' '+(ty+th*.48)+'L'+tcx+' '+(ty+th*.39)+'L'+(tcx+tw*.26)+' '+(ty+th*.48)+' M'+(tcx-tw*.22)+' '+(ty+th*.9)+'L'+tcx+' '+(ty+th*.65)+'L'+(tcx+tw*.22)+' '+(ty+th*.9)+'" fill="none" stroke="'+(colorShift?'#9b7951':'#43866d')+'" stroke-width="'+Math.max(2,tw*.07)+'" stroke-linecap="round"/></g>';
    const bx=px+(box.cx-box.w/2)*pw,by=py+(box.cy-box.h/2)*ph,bw=box.w*pw,bh=box.h*ph;
    out+='<rect x="'+bx.toFixed(1)+'" y="'+by.toFixed(1)+'" width="'+bw.toFixed(1)+'" height="'+bh.toFixed(1)+'" rx="3" fill="#75649f" fill-opacity=".20" stroke="#75649f" stroke-width="2.5"/>';
    out+='<circle cx="'+(bx+bw/2).toFixed(1)+'" cy="'+(by+bh/2).toFixed(1)+'" r="3" fill="#655593"/>';
    out+='<text x="'+bx.toFixed(1)+'" y="'+Math.max(py+11,by-5).toFixed(1)+'" fill="#655593" font-size="10" font-weight="700">'+esc(label)+'</text>';
    out+='<text x="'+px+'" y="'+(py+ph+16)+'" fill="#7b858d" font-size="9">左上 (0,0)</text><text x="'+(px+pw)+'" y="'+(py+ph+16)+'" text-anchor="end" fill="#7b858d" font-size="9">右下 (1,1)</text></g>';
    return out;
  }
  function augmentationLessonSvg(mode,strength,shown,sync){
    return '<div class="augmentation-frame-pair"><svg viewBox="0 0 350 228" role="img" aria-label="增强前，绿色目标与紫色标签框对齐">'
      +augmentationFrame(8,'增强前 · YOLO 标签',augmentationBox,augmentationBox,false,'标签框')
      +'</svg><svg viewBox="358 0 350 228" role="img" aria-label="增强后的绿色目标和紫色标签框，可对照检查标注是否跟随变换">'
      +augmentationFrame(366,'增强后 · '+augmentationModes[mode].name,augmentationTargetBox(mode,strength),shown,mode==='color',sync?'同步标签框':'旧标签框')
      +'</svg></div><div class="augmentation-visual-legend"><span><i></i>绿色区域 / 人形：图像中的目标</span><span><i></i>紫框：交给模型的标签</span></div>';
  }
  function augmentationMarkup(){
    return '<section class="lesson-playground augmentation-lesson-playground" data-lesson-augmentation data-lesson-augment-mode="flip" data-lesson-augment-sync="true" aria-labelledby="lesson-augmentation-title">'
      +'<div class="playground-heading"><div><span class="playground-kicker">互动图解 · 图像与标签同步</span><h3 id="lesson-augmentation-title">图像变了，YOLO 标签怎样跟着变？</h3><p>框表示目标在图像中的位置。切换增强方式后，对照变换后的图像和归一化标签；关闭标签同步，可以观察监督错位。</p></div><button type="button" class="playground-reset" data-lesson-augment-reset>恢复默认</button></div>'
      +'<div class="playground-tabs lesson-augmentation-modes" role="group" aria-label="选择图像增强方式">'+Object.entries(augmentationModes).map(([id,spec])=>'<button type="button" data-lesson-augment-mode="'+id+'" aria-pressed="'+String(id==='flip')+'">'+spec.name+'</button>').join('')+'</div>'
      +'<div class="playground-chart augmentation-lesson-visual" data-lesson-augment-visual></div>'
      +'<div class="augmentation-lesson-layout"><div class="augmentation-lesson-controls">'
      +'<label class="playground-range"><span>缩放强度 <output data-lesson-augment-strength-value>1.20×</output></span><input type="range" min="0.80" max="2.20" step="0.05" value="1.20" data-lesson-augment-strength aria-label="中心裁剪缩放强度"></label>'
      +'<button type="button" class="augmentation-sync-toggle" data-lesson-augment-sync aria-pressed="true">标签同步：开启</button>'
      +'<p class="augmentation-coordinate-note" data-lesson-augment-hint role="status" aria-live="polite"></p></div>'
      +'<div class="augmentation-label-readout" data-lesson-augment-labels aria-live="polite"></div></div>'
      +'<div class="lesson-calculation" data-lesson-augment-math></div>'
      +'<details class="lesson-deeper"><summary>继续理解：归一化、裁剪与数据泄漏</summary><div><p><strong>归一化要用当前画布的宽高。</strong>YOLO 一行依次是 class、cx/W、cy/H、w/W、h/H。这里的 0 是类别编号，后四个数才是坐标。例如在 640×480 图像上，中心 (0.28, 0.52) 对应 (179.2, 249.6) 像素，宽高 (0.20, 0.32) 对应 128×153.6 像素。</p><p><strong>裁剪后先裁边界，再重算中心。</strong>只把中心限制到 [0,1] 会留下错误宽高；完全出界、太小或比例极端的框还需要过滤。实际 YOLOv5 的 random_perspective 会调用 box_candidates 检查宽高、面积保留比例和长宽比。这里展示框的几何变化，没有模拟完整的样本过滤。</p><p><strong>先划分数据，再做训练增强。</strong>同一原图及其增强副本若分到训练和验证两边，会造成泄漏；视频帧也应按来源分组。验证通常保留确定性预处理，使用同一验证集比较增强前后的按类指标及失败图。</p></div></details>'
      +'<p class="playground-footnote">坐标采用 YOLO 的归一化中心点格式：类别、中心 x、中心 y、宽、高。示例是教学示意；颜色变化不改框，几何变换必须同步更新框。</p></section>';
  }
  function updateAugmentationLesson(root){
    const mode=root.dataset.lessonAugmentMode||'flip';
    const sync=root.dataset.lessonAugmentSync!=='false';
    const strengthInput=root.querySelector('[data-lesson-augment-strength]');
    const strength=Number(strengthInput.value);
    const transformed=transformedAugmentationBox(mode,strength);
    const shown=sync||mode==='color'?transformed:augmentationBox;
    const format=value=>Number(value).toFixed(4);
    const originalLine='0 '+format(augmentationBox.cx)+' '+format(augmentationBox.cy)+' '+format(augmentationBox.w)+' '+format(augmentationBox.h);
    const transformedLine='0 '+format(transformed.cx)+' '+format(transformed.cy)+' '+format(transformed.w)+' '+format(transformed.h);
    const strengthValue=root.querySelector('[data-lesson-augment-strength-value]');
    strengthValue.textContent=strength.toFixed(2)+'×';
    strengthInput.disabled=mode!=='zoom';
    const syncButton=root.querySelector('[data-lesson-augment-sync]');
    syncButton.disabled=mode==='color';
    syncButton.setAttribute('aria-pressed',String(sync||mode==='color'));
    syncButton.textContent=mode==='color'?'几何标签：无需修改':'标签同步：'+(sync?'开启':'关闭');
    root.querySelectorAll('[data-lesson-augment-mode]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.lessonAugmentMode===mode)));
    const aligned=Object.keys(augmentationBox).every(key=>Math.abs(shown[key]-transformed[key])<1e-9);
    root.querySelector('[data-lesson-augment-visual]').innerHTML=augmentationLessonSvg(mode,strength,shown,sync||mode==='color');
    root.querySelector('[data-lesson-augment-labels]').innerHTML='<div><span>增强前 · label</span><code>'+originalLine+'</code></div><div><span>实际送入训练的增强后标签</span><code>'+(sync||mode==='color'?transformedLine:originalLine)+'</code></div>'+(!aligned?'<div><span>正确同步时应为</span><code>'+transformedLine+'</code></div>':'')+'<strong class="'+(aligned?'is-synced':'is-unsynced')+'">'+(aligned?'标签与图像一致':'标签仍指向原位置 · 监督错位')+'</strong>';
    const raw=augmentationTargetBox(mode,strength);
    const corners=box=>[box.cx-box.w/2,box.cy-box.h/2,box.cx+box.w/2,box.cy+box.h/2].map(format).join(', ');
    const operation=mode==='flip'?'x′ = 1 − x；y、w、h 不变':mode==='zoom'?'x′ = 0.5 + (x − 0.5) × '+strength.toFixed(2)+'；宽高同倍缩放':'颜色 / 亮度变化；四个几何坐标不变';
    const retained=transformed.w*transformed.h/(raw.w*raw.h)*100;
    root.querySelector('[data-lesson-augment-math]').innerHTML='<h4>跟着当前参数算一遍</h4><ol><li><strong>中心格式 → 四个边界</strong><code>left = cx − w/2；right = cx + w/2</code><span>原始 (left, top, right, bottom) = ('+corners(augmentationBox)+')</span></li><li><strong>图像与四角应用同一变换</strong><code>'+operation+'</code><span>变换后、裁边前 = ('+corners(raw)+')</span></li><li><strong>裁边后 → 重新计算中心与宽高</strong><code>cx = (left + right)/2；w = right − left</code><span>合法边界 = ('+corners(transformed)+')；框面积保留 '+retained.toFixed(1)+'%（不是目标像素可见率）。</span></li></ol>';
    let hint=augmentationModes[mode].hint;
    if(mode==='zoom')hint+=' 当前缩放 '+strength.toFixed(2)+'×。试着调到 1.60× 以上，观察左边界裁切后，中心和宽度怎样一起改变。';
    if(!aligned)hint='标签同步已关闭：绿色目标发生移动或缩放，紫色标签框仍停在旧位置。训练会收到错误的位置监督。';
    else if(!sync&&mode!=='color')hint+=' 当前参数恰好没有改变框的位置与大小，所以关闭同步后也仍然对齐。';
    root.querySelector('[data-lesson-augment-hint]').textContent=hint;
  }

  const anchorScales=[
    {name:'P3',stride:8,cells:16,anchors:[[16,16],[24,32],[48,32]]},
    {name:'P4',stride:16,cells:8,anchors:[[40,40],[64,48],[96,64]]},
    {name:'P5',stride:32,cells:4,anchors:[[96,96],[128,160],[192,128]]}
  ];
  function anchorMarkup(){
    return '<section class="lesson-playground anchor-playground" data-anchor-playground aria-labelledby="anchor-playground-title">'
      +'<div class="playground-heading"><div><span class="playground-kicker">互动图解 · Anchor 与多尺度网格</span><h3 id="anchor-playground-title">同一个目标，在不同检测尺度上有多大？</h3><p>调整目标框宽高，比较同一块 128×128 图像区域在 P3、P4、P5 特征网格中的覆盖范围。</p></div><button type="button" class="playground-reset" data-anchor-reset>恢复默认</button></div>'
      +'<div class="anchor-controls"><label class="playground-range"><span>目标宽度 <output data-anchor-width-value>64 px</output></span><input type="range" min="16" max="112" step="8" value="64" data-anchor-width aria-label="目标框宽度，像素"></label><label class="playground-range"><span>目标高度 <output data-anchor-height-value>48 px</output></span><input type="range" min="16" max="112" step="8" value="48" data-anchor-height aria-label="目标框高度，像素"></label></div>'
      +'<div class="playground-chart anchor-chart" data-anchor-chart tabindex="0" role="region" aria-label="多尺度网格对照，窄屏可左右滚动"></div><p class="lesson-visual-key">左右滑动比较三个尺度。紫框是同一个目标，绿色格子是中心落点所在的格子。三个面板显示同一块图像区域，所以目标占画面的比例相同，覆盖的网格数量不同。</p><div class="anchor-reference-readouts" data-anchor-readouts></div>'
      +'<div class="lesson-calculation"><h4>哪些 Anchor 会通过宽高匹配？</h4><p>把目标和 Anchor 放在同一单位下，计算宽高的最大倍率。小于阈值的候选都保留；这里先看尺寸筛选，尚未展开邻格分配。</p><code>R = max(w/a_w, a_w/w, h/a_h, a_h/h)；通过条件：R &lt; anchor_t</code><label class="playground-range anchor-threshold"><span>匹配阈值 anchor_t <output data-anchor-threshold-value>4.0</output></span><input type="range" min="1" max="5" step="0.5" value="4" data-anchor-threshold aria-label="Anchor 宽高倍率匹配阈值"></label><div class="lesson-table-scroll" data-anchor-matches></div></div>'
      +'<p class="playground-insight" data-anchor-hint role="status" aria-live="polite"></p>'
      +'<details class="lesson-deeper"><summary>继续理解：网格、步幅和正样本不是一回事</summary><div><p><strong>网格位置负责“在哪里”，Anchor 提供宽高参考。</strong>例如 64×48 像素目标在 stride=8 的特征图上是 8×6 个网格单位，在 stride=32 上是 2×1.5。小目标覆盖的位置较少，空间细节更容易损失，但不能仅凭一个尺寸就断言它只归某一层。</p><p><strong>先过尺寸筛选，再扩展邻格。</strong>本项目 build_targets 会在各层逐个比较宽高倍率，再根据目标中心的小数部分和边界条件加入横向、纵向邻格。同一目标可能产生多个 Anchor / 网格正样本；这里的候选数量不是最终正样本数量。</p><p><strong>训练匹配阈值与推理 NMS 阈值作用不同。</strong>anchor_t 控制训练时哪些参考框参与监督；NMS IoU 阈值用于推理后删除重复预测。增加匹配阈值会接纳更多形状差异较大的候选，效果需要在固定验证集上判断。</p><p>对应源码：<a href="https://github.com/ultralytics/yolov5/blob/master/utils/loss.py" target="_blank" rel="noopener noreferrer">utils/loss.py · build_targets ↗</a>。本页按项目中这类 YOLOv5 匹配实现讲解，其他检测器的分配方式可能不同。</p></div></details>'
      +'<p class="playground-footnote">图中 Anchor 尺寸是教学用示意值，不对应特定权重或配置。实际 YOLOv5 正样本分配可涉及多个尺度、邻近网格和版本相关匹配阈值；请以当前仓库配置和训练日志为准。</p></section>';
  }
  function anchorDiagram(width,height){
    const W=816,H=274,panelW=260,gridSize=164,windowPx=128;
    let out='<svg viewBox="0 0 '+W+' '+H+'" role="img" aria-label="同一目标在 P3、P4、P5 三种特征网格上的相对大小">';
    anchorScales.forEach((scale,index)=>{
      const x=8+index*270,gridX=x+(panelW-gridSize)/2,gridY=53,cell=gridSize/scale.cells;
      out+='<rect x="'+x+'" y="8" width="'+panelW+'" height="252" rx="5" fill="#fffefa" stroke="#e9e6df"/>';
      out+=svgText(x+panelW/2,31,scale.name+' · stride '+scale.stride,13,'middle','#584987');
      for(let row=0;row<scale.cells;row++)for(let col=0;col<scale.cells;col++){
        out+='<rect x="'+(gridX+col*cell).toFixed(1)+'" y="'+(gridY+row*cell).toFixed(1)+'" width="'+cell.toFixed(1)+'" height="'+cell.toFixed(1)+'" fill="none" stroke="#dfe4e2" stroke-width=".7"/>';
      }
      const centerCol=Math.floor(scale.cells*.53),centerRow=Math.floor(scale.cells*.54);
      out+='<rect x="'+(gridX+centerCol*cell).toFixed(1)+'" y="'+(gridY+centerRow*cell).toFixed(1)+'" width="'+cell.toFixed(1)+'" height="'+cell.toFixed(1)+'" fill="#dcebe4" fill-opacity=".65" stroke="#77a18c" stroke-width="1.2"/>';
      const bw=width/windowPx*gridSize,bh=height/windowPx*gridSize,bx=gridX+gridSize*.53-bw/2,by=gridY+gridSize*.54-bh/2;
      out+='<rect x="'+bx.toFixed(1)+'" y="'+by.toFixed(1)+'" width="'+bw.toFixed(1)+'" height="'+bh.toFixed(1)+'" rx="2" fill="#75649f" fill-opacity=".15" stroke="#75649f" stroke-width="2"/>';
      out+='<circle cx="'+(gridX+gridSize*.53).toFixed(1)+'" cy="'+(gridY+gridSize*.54).toFixed(1)+'" r="3.2" fill="#b17c31"/>';
      out+=svgText(x+panelW/2,236,formatCells(width,scale.stride)+' × '+formatCells(height,scale.stride)+' 个网格单元',11,'middle','#45535f');
      out+=svgText(x+panelW/2,253,'参考框示意：'+scale.anchors.map(pair=>pair[0]+'×'+pair[1]).join('  '),9,'middle','#7b858d');
    });
    return out+'</svg>';
  }
  function formatCells(pixels,stride){const value=pixels/stride;return Number.isInteger(value)?String(value):value.toFixed(1)}
  function anchorFit(anchor,width,height){return Math.max(width/anchor[0],anchor[0]/width,height/anchor[1],anchor[1]/height)}
  function updateAnchors(root){
    const width=Number(root.querySelector('[data-anchor-width]').value),height=Number(root.querySelector('[data-anchor-height]').value);
    const threshold=Number(root.querySelector('[data-anchor-threshold]').value);
    root.querySelector('[data-anchor-threshold-value]').textContent=threshold.toFixed(1);
    root.querySelector('[data-anchor-width-value]').textContent=width+' px';
    root.querySelector('[data-anchor-height-value]').textContent=height+' px';
    root.querySelector('[data-anchor-chart]').innerHTML=anchorDiagram(width,height);
    root.querySelector('[data-anchor-readouts]').innerHTML=anchorScales.map(scale=>{
      const nearest=scale.anchors.reduce((best,current)=>anchorFit(current,width,height)<anchorFit(best,width,height)?current:best,scale.anchors[0]);
      return '<div><span>'+scale.name+' · 最大倍率最小的示意先验</span><strong>'+nearest[0]+' × '+nearest[1]+' px</strong><small>R = '+anchorFit(nearest,width,height).toFixed(2)+'</small></div>';
    }).join('');
    let accepted=0;
    root.querySelector('[data-anchor-matches]').innerHTML='<table class="lesson-knowledge-table"><caption>同一目标与 9 个教学 Anchor 的尺寸比较</caption><thead><tr><th scope="col">尺度</th><th scope="col">Anchor 宽×高</th><th scope="col">最大倍率 R</th><th scope="col">R &lt; '+threshold.toFixed(1)+'</th></tr></thead><tbody>'+anchorScales.map(scale=>scale.anchors.map(anchor=>{
      const ratio=anchorFit(anchor,width,height),matches=ratio<threshold;if(matches)accepted++;
      return '<tr><th scope="row">'+scale.name+'</th><td>'+anchor[0]+' × '+anchor[1]+' px</td><td>'+ratio.toFixed(2)+'</td><td><span class="lesson-match-state '+(matches?'is-match':'is-rejected')+'">'+(matches?'通过':'不通过')+'</span></td></tr>';
    }).join('')).join('')+'</tbody></table>';
    root.querySelector('[data-anchor-hint]').textContent='目标 '+width+' × '+height+' px：当前 '+accepted+' / 9 个示意 Anchor 通过尺寸筛选。比较使用严格小于号，R 等于阈值时不通过。步幅越大，同一目标覆盖的网格单元越少；最终正样本还要经过中心位置和邻格分配。';
  }

  const detectorScales=[
    {id:'p3',name:'P3',stride:8,grid:80,role:'网格最密 · 细节较多',color:'#3e967c',soft:'#e5f1eb'},
    {id:'p4',name:'P4',stride:16,grid:40,role:'中间尺度',color:'#4c88a6',soft:'#e7f0f4'},
    {id:'p5',name:'P5',stride:32,grid:20,role:'网格较疏 · 范围较大',color:'#bd7c38',soft:'#f4eee3'}
  ];
  const detectorTargetSizes=[
    {id:'small',name:'小目标',size:32},
    {id:'medium',name:'中目标',size:96},
    {id:'large',name:'大目标',size:192}
  ];
  function scaleMapSvg(scale,target){
    const side=180,cell=side/scale.grid,extent=side*target.size/640,cx=side*.5,cy=side*.5;
    const x=cx-extent/2,y=cy-extent/2,pattern='scale-grid-'+scale.id;
    return '<svg class="scale-map-svg" viewBox="0 0 '+side+' '+side+'" role="img" aria-label="'+scale.name+' 步长 '+scale.stride+'，特征图 '+scale.grid+' 乘 '+scale.grid+'；'+target.size+' 像素目标的宽高约跨 '+(target.size/scale.stride).toFixed(1)+' 个网格">'
      +'<defs><pattern id="'+pattern+'" width="'+cell.toFixed(3)+'" height="'+cell.toFixed(3)+'" patternUnits="userSpaceOnUse"><path d="M '+cell.toFixed(3)+' 0 H 0 V '+cell.toFixed(3)+'" fill="none" stroke="#9aa8a1" stroke-width=".55"/></pattern></defs>'
      +'<rect width="180" height="180" rx="4" fill="#eef1ed"/><rect width="180" height="180" rx="4" fill="url(#'+pattern+')"/>'
      +'<rect x="'+x.toFixed(2)+'" y="'+y.toFixed(2)+'" width="'+extent.toFixed(2)+'" height="'+extent.toFixed(2)+'" fill="'+scale.soft+'" fill-opacity=".8" stroke="'+scale.color+'" stroke-width="2"/><circle cx="'+cx+'" cy="'+cy+'" r="2.5" fill="'+scale.color+'" stroke="#fffefa" stroke-width="1"/>'
      +'<text x="7" y="171" fill="#77837d" font-size="8">640 px 输入画布 · 网格为示意</text></svg>';
  }
  function scaleMapCard(scale,target){
    const span=(target.size/scale.stride).toFixed(1).replace(/\.0$/,'');
    return '<article class="scale-map-card" style="--scale-color:'+scale.color+';--scale-soft:'+scale.soft+'"><header><strong>'+scale.name+'</strong><span>步长 '+scale.stride+'</span></header>'
      +scaleMapSvg(scale,target)+'<div class="scale-map-readouts"><div><span>特征图</span><strong>'+scale.grid+' × '+scale.grid+'</strong></div><div><span>'+target.size+' px 目标约跨</span><strong>'+span+' × '+span+' 格</strong></div></div><p>'+scale.role+'</p></article>';
  }
  function scaleExplorerMarkup(){
    const target=detectorTargetSizes[0];
    return '<section class="lesson-playground scale-explorer" data-scale-explorer data-scale-target="small" aria-labelledby="scale-explorer-title">'
      +'<div class="playground-heading"><div><span class="playground-kicker">互动图解 · YOLO 多尺度检测</span><h3 id="scale-explorer-title">同一目标，在 P3、P4、P5 上有多大？</h3><p>切换目标大小，观察 640 × 640 输入经过不同步长后，目标跨过多少网格。</p></div></div>'
      +'<div class="scale-target-choices" role="group" aria-label="选择示意目标边长">'+detectorTargetSizes.map(item=>'<button type="button" data-scale-target="'+item.id+'" aria-pressed="'+String(item.id===target.id)+'">'+item.name+' · '+item.size+' px</button>').join('')+'</div>'
      +'<div class="scale-map-grid" data-scale-map-grid>'+detectorScales.map(scale=>scaleMapCard(scale,target)).join('')+'</div>'
      +'<p class="playground-insight" data-scale-explorer-hint role="status" aria-live="polite">小目标在 P3 上跨过更多网格宽度，因此较密的空间特征更有利于保留位置细节。</p>'
      +'<p class="playground-footnote">这里把目标简化成正方形，只比较特征图的空间步长。跨过几个网格不等于这些格子都会成为正样本；真实 YOLOv5 还会按 Anchor、目标中心与邻格规则分配训练样本。</p></section>';
  }
  function updateScaleExplorer(root){
    const target=detectorTargetSizes.find(item=>item.id===root.dataset.scaleTarget)||detectorTargetSizes[0];
    root.querySelectorAll('[data-scale-target]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.scaleTarget===target.id)));
    root.querySelector('[data-scale-map-grid]').innerHTML=detectorScales.map(scale=>scaleMapCard(scale,target)).join('');
    root.querySelector('[data-scale-explorer-hint]').textContent=target.name+'（边长 '+target.size+' px）的宽高约对应 '+detectorScales.map(scale=>scale.name+' '+(target.size/scale.stride).toFixed(1).replace(/\.0$/,'')+' × '+(target.size/scale.stride).toFixed(1).replace(/\.0$/,'')).join('；')+' 个网格单元。较密的空间网格能保留更细的位置线索。';
  }

  const boxLabelDefaults={cx:0.50,cy:0.40,w:0.20,h:0.16};
  function boxLabelMarkup(){
    const controls=[['cx','中心 x',0.20,0.80,0.50],['cy','中心 y',0.20,0.80,0.40],['w','框宽 w',0.10,0.38,0.20],['h','框高 h',0.10,0.38,0.16]];
    return '<section class="lesson-playground box-label-playground" data-box-label-playground aria-labelledby="box-label-playground-title">'
      +'<div class="playground-heading"><div><span class="playground-kicker">互动图解 · YOLO 标签</span><h3 id="box-label-playground-title">拖动标注框，读出标签这一行</h3><p>移动中心、调整框的大小；图像坐标和 YOLO 标签会一起更新。</p></div><button type="button" class="playground-reset" data-box-label-reset>恢复例题</button></div>'
      +'<div class="box-label-layout"><div class="box-label-preview"><div class="box-label-preview-heading"><strong>目标：车辆</strong><span>原图 1000 × 500 px</span></div><div class="box-label-scene" data-box-label-scene></div><p class="box-label-legend"><span><i></i>橙框：当前标注</span><span><b></b>圆点：框中心</span><span>车辆保持不动</span></p></div>'
      +'<div class="box-label-editor"><div class="box-label-sliders">'+controls.map(control=>'<label class="playground-range"><span>'+control[1]+' <output data-box-label-value="'+control[0]+'">'+control[4].toFixed(2)+'</output></span><input type="range" min="'+control[2]+'" max="'+control[3]+'" step="0.01" value="'+control[4]+'" data-box-label-coordinate="'+control[0]+'" aria-label="'+control[1]+'"></label>').join('')+'</div>'
      +'<div class="box-label-readout"><span>YOLO 标签行 · class x_center y_center width height</span><code data-box-label-row>0 0.50 0.40 0.20 0.16</code><p data-box-label-pixels>像素值：中心 (500, 200) · 宽高 200 × 80 px</p></div>'
      +'<p class="playground-insight" data-box-label-hint role="status" aria-live="polite">橙框基本贴合车辆。x 和框宽除以图像宽；y 和框高除以图像高。坐标归一化后，换分辨率也能表示相同比例的位置。</p></div></div>'
      +'<p class="playground-footnote">例题图像为 1000 × 500 像素。标签写入中心点与宽高，顺序是 class、x_center、y_center、width、height；不是左上角坐标。</p></section>';
  }
  function boxLabelScene(values){
    const W=640,H=320,cx=values.cx,cy=values.cy,width=values.w,height=values.h;
    const bw=width*W,bh=height*H,bx=(cx-width/2)*W,by=(cy-height/2)*H,centerX=cx*W,centerY=cy*H;
    let svg='<svg viewBox="0 0 '+W+' '+H+'" role="img" aria-label="车辆图像上的 YOLO 标注框，中心 '+cx.toFixed(2)+'、'+cy.toFixed(2)+'，宽 '+width.toFixed(2)+'、高 '+height.toFixed(2)+'">';
    svg+='<rect width="640" height="320" fill="#edf1ed"/>';
    for(let i=1;i<5;i++){svg+='<line x1="'+(i*128)+'" y1="0" x2="'+(i*128)+'" y2="320" stroke="#fffefa" stroke-width="1.5"/><line x1="0" y1="'+(i*64)+'" x2="640" y2="'+(i*64)+'" stroke="#fffefa" stroke-width="1.5"/>'}
    svg+='<text x="14" y="22" fill="#687687" font-size="11" font-weight="600">0001.jpg</text><line x1="0" y1="'+centerY.toFixed(1)+'" x2="'+centerX.toFixed(1)+'" y2="'+centerY.toFixed(1)+'" stroke="#b17c31" stroke-width="1.3" stroke-dasharray="4 4" opacity=".72"/><line x1="'+centerX.toFixed(1)+'" y1="'+centerY.toFixed(1)+'" x2="'+centerX.toFixed(1)+'" y2="320" stroke="#b17c31" stroke-width="1.3" stroke-dasharray="4 4" opacity=".72"/>';
    const targetW=boxLabelDefaults.w*W,targetH=boxLabelDefaults.h*H,targetX=(boxLabelDefaults.cx-boxLabelDefaults.w/2)*W,targetY=(boxLabelDefaults.cy-boxLabelDefaults.h/2)*H;
    svg+='<g transform="translate('+targetX.toFixed(1)+' '+targetY.toFixed(1)+') scale('+(targetW/100).toFixed(3)+' '+(targetH/50).toFixed(3)+')"><path d="M7 31 L14 29 L23 18 Q26 15 33 15 H65 Q72 16 78 27 L91 30 Q95 31 96 36 V42 H5 V35 Q5 32 7 31Z" fill="#75649f"/><path d="M28 19 L35 19 H63 Q67 20 71 27 H23Z" fill="#e7e5ef"/><circle cx="27" cy="41" r="7" fill="#344252"/><circle cx="27" cy="41" r="3" fill="#edf1ed"/><circle cx="75" cy="41" r="7" fill="#344252"/><circle cx="75" cy="41" r="3" fill="#edf1ed"/></g>';
    svg+='<rect x="'+bx.toFixed(1)+'" y="'+by.toFixed(1)+'" width="'+bw.toFixed(1)+'" height="'+bh.toFixed(1)+'" rx="2" fill="#c17a45" fill-opacity=".05" stroke="#bd7c38" stroke-width="2.5"/><circle cx="'+centerX.toFixed(1)+'" cy="'+centerY.toFixed(1)+'" r="4.2" fill="#bd7c38" stroke="#fffefa" stroke-width="1.5"/><text x="'+Math.max(8,bx).toFixed(1)+'" y="'+Math.max(14,by-7).toFixed(1)+'" fill="#8b5b28" font-size="10" font-weight="700">class 0</text>';
    svg+='<text x="8" y="310" fill="#758078" font-size="9">0%</text><text x="320" y="310" text-anchor="middle" fill="#758078" font-size="9">50%</text><text x="632" y="310" text-anchor="end" fill="#758078" font-size="9">100%</text></svg>';
    return svg;
  }
  function updateBoxLabel(root){
    const values={};
    root.querySelectorAll('[data-box-label-coordinate]').forEach(input=>{
      const key=input.dataset.boxLabelCoordinate,value=Number(input.value);values[key]=value;
      root.querySelector('[data-box-label-value="'+key+'"]').textContent=value.toFixed(2);
    });
    root.querySelector('[data-box-label-scene]').innerHTML=boxLabelScene(values);
    root.querySelector('[data-box-label-row]').textContent='0 '+[values.cx,values.cy,values.w,values.h].map(value=>value.toFixed(2)).join(' ');
    root.querySelector('[data-box-label-pixels]').textContent='像素值：中心 ('+Math.round(values.cx*1000)+', '+Math.round(values.cy*500)+') · 宽高 '+Math.round(values.w*1000)+' × '+Math.round(values.h*500)+' px';
    const overlaps=Math.abs(values.cx-boxLabelDefaults.cx)*2<values.w+boxLabelDefaults.w-0.001&&Math.abs(values.cy-boxLabelDefaults.cy)*2<values.h+boxLabelDefaults.h-0.001;
    const aligned=Math.abs(values.cx-boxLabelDefaults.cx)<0.03&&Math.abs(values.cy-boxLabelDefaults.cy)<0.03&&Math.abs(values.w-boxLabelDefaults.w)<0.04&&Math.abs(values.h-boxLabelDefaults.h)<0.04;
    root.querySelector('[data-box-label-hint]').textContent=aligned?'当前框基本贴合车辆。x 和框宽除以图像宽；y 和框高除以图像高，换分辨率也能表示相同比例的位置。':overlaps?'车辆保持不动；当前框仍覆盖目标，但中心或宽高不够贴合。可以继续调整，再观察标签数值。':'车辆保持不动；当前框已偏离目标。错误框会把错误位置教给模型。';
  }

  const yoloLossScenarios={
    localization:{name:'定位偏差',base:{box:0.86,obj:0.18,cls:0.08},hint:'目标类别与存在性已识别，但预测框的位置或大小不准。先检查 box 相关监督和框标签。'},
    objectness:{name:'背景误检',base:{box:0,obj:0.82,cls:0},hint:'这里单看一个未匹配目标的背景候选：它收到 objectness 监督，不计算正样本的 box / classification 损失。真实一批图像仍可能有其他目标贡献后两项。'},
    classification:{name:'类别混淆',base:{box:0.12,obj:0.20,cls:0.78},hint:'框位置大致正确，但类别预测错误。检查类别映射、标签顺序和分类监督。'},
    missed:{name:'漏检目标',base:{box:0.10,obj:0.72,cls:0.14},hint:'本示例假设目标位置已参与训练匹配、但 objectness 预测偏低。真实漏检也可能来自标签、分辨率或正样本分配问题。'}
  };
  const yoloLossNames={box:'box loss',obj:'objectness loss',cls:'classification loss'};
  const yoloLossColors={box:'#75649f',obj:'#4c88a6',cls:'#3e967c'};
  function yoloLossMarkup(){
    return '<section class="lesson-playground yolo-loss-playground" data-yolo-loss-playground data-yolo-loss-mode="localization" aria-labelledby="yolo-loss-playground-title">'
      +'<div class="playground-heading"><div><span class="playground-kicker">互动图解 · 检测损失拆解</span><h3 id="yolo-loss-playground-title">不同错误，会把哪一项损失推高？</h3><p>切换一个教学样例，观察预测框和三类监督信号的对应关系。</p></div><button type="button" class="playground-reset" data-yolo-loss-reset>恢复默认</button></div>'
      +'<div class="playground-tabs yolo-loss-modes" role="group" aria-label="选择检测错误类型">'+Object.entries(yoloLossScenarios).map(([id,spec])=>'<button type="button" data-yolo-loss-mode="'+id+'" aria-pressed="'+String(id==='localization')+'">'+spec.name+'</button>').join('')+'</div>'
      +'<label class="lesson-single-class"><input type="checkbox" data-yolo-loss-single>切换为单类别任务（nc=1）：观察分类损失为何为 0</label>'
      +'<div class="yolo-loss-layout"><div class="playground-chart yolo-loss-scene" data-yolo-loss-scene></div><div class="yolo-loss-controls">'
      +'<div class="yolo-loss-gains"><label class="playground-range"><span>box 权重 <output data-yolo-loss-gain-value="box">1.00×</output></span><input type="range" min="0.5" max="2" step="0.1" value="1" data-yolo-loss-gain="box" aria-label="box loss 权重"></label>'
      +'<label class="playground-range"><span>objectness 权重 <output data-yolo-loss-gain-value="obj">1.00×</output></span><input type="range" min="0.5" max="2" step="0.1" value="1" data-yolo-loss-gain="obj" aria-label="objectness loss 权重"></label>'
      +'<label class="playground-range"><span>classification 权重 <output data-yolo-loss-gain-value="cls">1.00×</output></span><input type="range" min="0.5" max="2" step="0.1" value="1" data-yolo-loss-gain="cls" aria-label="classification loss 权重"></label></div>'
      +'<div class="yolo-loss-readouts" data-yolo-loss-readouts></div><div class="yolo-loss-total" data-yolo-loss-total></div></div></div>'
      +'<p class="playground-insight" data-yolo-loss-hint role="status" aria-live="polite"></p>'
      +'<div class="lesson-supervision-grid"><article><h4>box：框贴得准不准</h4><p>只在匹配到目标的位置计算。本项目使用 mean(1−CIoU)，同时考虑重叠、中心距离和宽高比。</p></article><article><h4>objectness：候选应得到多少目标性分数</h4><p>覆盖各层候选位置。未匹配位置的目标值从 0 开始；已匹配位置会填入截断到非负值、停止梯度后的 CIoU 质量值，本项目 gr=1。</p></article><article><h4>classification：属于哪一类</h4><p>只对匹配目标且 nc&gt;1 的位置计算 BCEWithLogitsLoss，可结合标签平滑等配置；这里不能直接套用“类别总概率必须为 1”的 softmax 理解。</p></article></div>'
      +'<details class="lesson-deeper"><summary>继续理解：训练损失、日志与推理分数怎样区分</summary><div><p><strong>日志里的三项通常已经乘过 gain。</strong>本项目 ComputeLoss 先对各项乘 hyp[box/obj/cls]，返回分项供日志记录；用于反向传播的和还乘 batch size。train.py 也按类别数、检测层数和输入尺寸调整相关系数。比较实验前，应核对这些约定；不同损失数值的大小不能直接代表问题的重要程度。</p><p><strong>loss 不等于推理 confidence。</strong>常见 YOLOv5 后处理把 objectness 分数与类别分数相乘。例如 0.80×0.60=0.48，若置信度阈值是 0.50，该候选会被过滤。降低阈值可能找回候选，也可能增加误检；它不会回头改变已经训练好的权重。NMS 随后处理重复框。</p><p><strong>cls=0 不等于分类已经完美。</strong>nc=1 时源码跳过分类损失；单类模型仍需学习目标性和定位。漏检要同时检查分辨率、标签、正样本分配、分数过滤及 NMS；loss 下降但验证指标变差时，还要检查过拟合与数据分布。</p><p>建议排查顺序：先画标签与预测 → 核对类别和坐标 → 查看匹配与输入尺寸 → 对照按类 / 按尺寸验证指标 → 最后有依据地调整损失权重。<a href="https://github.com/ultralytics/yolov5/blob/master/utils/loss.py" target="_blank" rel="noopener noreferrer">阅读 ComputeLoss 源码 ↗</a></p></div></details>'
      +'<p class="playground-footnote">柱形与数值是可重复的教学样例，不是 swim_v9 的训练日志。简化关系为 L = λbox·Lbox + λobj·Lobj + λcls·Lcls；实际 YOLOv5 还会按尺度、样本分配和版本配置处理各项。调高权重只改变该项对目标函数的贡献，不保证验证指标变好。</p></section>';
  }
  function yoloLossSceneSvg(mode){
    let out='<svg viewBox="0 0 520 245" role="img" aria-label="真实框与预测框对照，展示'+esc(yoloLossScenarios[mode].name)+'示意"><rect width="520" height="245" fill="#fffefa"/><text x="24" y="28" fill="#697581" font-size="11">框与监督信号示意</text><rect x="52" y="52" width="416" height="154" rx="4" fill="#f1f4f0" stroke="#e3e8e3"/>';
    for(let i=1;i<4;i++)out+='<line x1="'+(52+i*104)+'" y1="52" x2="'+(52+i*104)+'" y2="206" stroke="#fffefa" stroke-width="2"/><line x1="52" y1="'+(52+i*38.5)+'" x2="468" y2="'+(52+i*38.5)+'" stroke="#fffefa" stroke-width="2"/>';
    if(mode!=='objectness')out+='<rect x="176" y="91" width="92" height="74" rx="3" fill="#3e967c" fill-opacity=".10" stroke="#3e967c" stroke-width="2.5" stroke-dasharray="5 3"/><text x="177" y="86" fill="#3e806f" font-size="10" font-weight="700">真实框 · GT</text>';
    if(mode==='localization'){
      out+='<rect x="206" y="105" width="92" height="74" rx="3" fill="#75649f" fill-opacity=".16" stroke="#75649f" stroke-width="2.5"/><text x="207" y="195" fill="#655593" font-size="10" font-weight="700">预测框 · 偏移</text><path d="M270 128L286 119" stroke="#b17c31" stroke-width="2"/><path d="M282 118L287 118L285 123" fill="none" stroke="#b17c31" stroke-width="2"/>';
    }else if(mode==='objectness'){
      out+='<rect x="206" y="94" width="92" height="74" rx="3" fill="#4c88a6" fill-opacity=".13" stroke="#4c88a6" stroke-width="2.5"/><text x="207" y="185" fill="#3c748e" font-size="10" font-weight="700">背景候选 · 高分</text>';
    }else if(mode==='classification'){
      out+='<rect x="176" y="91" width="92" height="74" rx="3" fill="#75649f" fill-opacity=".08" stroke="#75649f" stroke-width="2.5"/><rect x="177" y="73" width="107" height="16" rx="3" fill="#75649f"/><text x="183" y="84" fill="#fff" font-size="9" font-weight="700">预测：车辆 0.88</text><text x="176" y="195" fill="#3e806f" font-size="10">真实类别：行人</text>';
    }else{
      out+='<text x="270" y="130" text-anchor="middle" fill="#8a6aa1" font-size="18" font-weight="700">未产生有效预测框</text><text x="270" y="151" text-anchor="middle" fill="#73808b" font-size="10">目标存在，但候选分数未通过阈值</text>';
    }
    return out+'</svg>';
  }
  function updateYoloLoss(root){
    const mode=root.dataset.yoloLossMode||'localization',spec=yoloLossScenarios[mode];
    const single=root.querySelector('[data-yolo-loss-single]').checked;
    const weights={box:Number(root.querySelector('[data-yolo-loss-gain="box"]').value),obj:Number(root.querySelector('[data-yolo-loss-gain="obj"]').value),cls:Number(root.querySelector('[data-yolo-loss-gain="cls"]').value)};
    const base={...spec.base,cls:single?0:spec.base.cls};
    root.querySelector('[data-yolo-loss-gain="cls"]').disabled=single;
    root.querySelectorAll('button[data-yolo-loss-mode]').forEach(button=>{button.setAttribute('aria-pressed',String(button.dataset.yoloLossMode===mode));button.disabled=single&&button.dataset.yoloLossMode==='classification'});
    root.querySelector('[data-yolo-loss-scene]').innerHTML=yoloLossSceneSvg(mode);
    let total=0;
    root.querySelector('[data-yolo-loss-readouts]').innerHTML=Object.keys(yoloLossNames).map(key=>{
      const value=base[key],weighted=value*weights[key];total+=weighted;
      root.querySelector('[data-yolo-loss-gain-value="'+key+'"]').textContent=weights[key].toFixed(2)+'×';
      return '<div class="yolo-loss-component" style="--loss-color:'+yoloLossColors[key]+'"><span>'+yoloLossNames[key]+'</span><strong>'+weighted.toFixed(2)+'</strong><small>样例 '+value.toFixed(2)+' × 权重 '+weights[key].toFixed(2)+'</small><div class="yolo-loss-track"><i style="width:'+Math.min(100,weighted/1.6*100).toFixed(1)+'%"></i></div></div>';
    }).join('');
    root.querySelector('[data-yolo-loss-total]').innerHTML='<span>示意总损失</span><strong>'+total.toFixed(2)+'</strong><code>L = '+weights.box.toFixed(2)+'×'+base.box.toFixed(2)+'（box） + '+weights.obj.toFixed(2)+'×'+base.obj.toFixed(2)+'（obj） + '+weights.cls.toFixed(2)+'×'+base.cls.toFixed(2)+'（cls）</code>';
    root.querySelector('[data-yolo-loss-hint]').textContent=spec.hint+(single?' 当前 nc=1：分类项被跳过，所以 cls=0；这不能说明检测已经完美。':'')+' 上方使用教学值，不是直接由图中的框计算出的实际训练损失。';
  }

  function quaternionMarkup(){
    return '<section class="lesson-playground quaternion-playground" data-quaternion-playground aria-labelledby="quaternion-playground-title">'
      +'<div class="playground-heading"><div><span class="playground-kicker">INTERACTIVE · 3D ROTATION</span><h3 id="quaternion-playground-title">转动这根空间箭头</h3><p>改变旋转轴和角度，观察向量、四元数分量与结果之间的对应关系。</p></div><button type="button" class="playground-reset" data-quaternion-reset>恢复示例</button></div>'
      +'<div class="quaternion-stage"><div class="quaternion-visual" data-quaternion-visual></div><div class="quaternion-controls">'
      +'<div class="quaternion-control"><label for="quaternion-axis-x">旋转轴 x <output data-quaternion-axis-value="x">0.0</output></label><input id="quaternion-axis-x" type="range" min="-1" max="1" step="0.1" value="0" data-quaternion-axis="x"></div>'
      +'<div class="quaternion-control"><label for="quaternion-axis-y">旋转轴 y <output data-quaternion-axis-value="y">0.0</output></label><input id="quaternion-axis-y" type="range" min="-1" max="1" step="0.1" value="0" data-quaternion-axis="y"></div>'
      +'<div class="quaternion-control"><label for="quaternion-axis-z">旋转轴 z <output data-quaternion-axis-value="z">1.0</output></label><input id="quaternion-axis-z" type="range" min="-1" max="1" step="0.1" value="1" data-quaternion-axis="z"></div>'
      +'<div class="quaternion-control"><label for="quaternion-angle">旋转角 θ <output data-quaternion-angle-value>90°</output></label><input id="quaternion-angle" type="range" min="0" max="360" step="1" value="90" data-quaternion-angle></div>'
      +'<div class="quaternion-readout"><div><small>归一化旋转轴 n</small><strong data-quaternion-axis-normalized>(0.00, 0.00, 1.00)</strong></div><div><small>单位四元数 q = (w, x, y, z)</small><strong data-quaternion-components>(0.7071, 0.0000, 0.0000, 0.7071)</strong></div><div><small>向量 v′ = q · v · q*</small><strong data-quaternion-vector>(0.0000, 1.0000, 0.0000)</strong></div></div>'
      +'<p class="quaternion-hint" data-quaternion-hint aria-live="polite">默认把 (1,0,0) 绕 z 轴转 90°，结果约为 (0,1,0)。</p>'
      +'</div></div><p class="playground-footnote">图中是三维方向的二维投影，数值读数才是精确分量。数学式采用标量在前 (w,x,y,z)；软件接口可能使用不同顺序。</p></section>';
  }
  function quaternionMultiply(a,b){
    const av=a.slice(1),bv=b.slice(1);
    const cross=[av[1]*bv[2]-av[2]*bv[1],av[2]*bv[0]-av[0]*bv[2],av[0]*bv[1]-av[1]*bv[0]];
    return [a[0]*b[0]-av[0]*bv[0]-av[1]*bv[1]-av[2]*bv[2],
      a[0]*bv[0]+b[0]*av[0]+cross[0],
      a[0]*bv[1]+b[0]*av[1]+cross[1],
      a[0]*bv[2]+b[0]*av[2]+cross[2]];
  }
  function quaternionVectorSvg(axis,rotated){
    const W=520,H=300,cx=255,cy=164,scale=100;
    const project=v=>[cx+scale*(v[0]-.42*v[1]),cy-scale*(v[2]+.38*v[1])];
    const arrow=(v,color,width=3,dash='')=>{
      const end=project(v),dx=end[0]-cx,dy=end[1]-cy,len=Math.hypot(dx,dy)||1,head=9;
      const bx=end[0]-head*dx/len,by=end[1]-head*dy/len,px=-dy/len*4,py=dx/len*4;
      return '<line x1="'+cx+'" y1="'+cy+'" x2="'+end[0].toFixed(1)+'" y2="'+end[1].toFixed(1)+'" stroke="'+color+'" stroke-width="'+width+'" stroke-linecap="round"'+(dash?' stroke-dasharray="'+dash+'"':'')+'/><polygon points="'+end[0].toFixed(1)+','+end[1].toFixed(1)+' '+(bx+px).toFixed(1)+','+(by+py).toFixed(1)+' '+(bx-px).toFixed(1)+','+(by-py).toFixed(1)+'" fill="'+color+'"/>';
    };
    let out='<svg viewBox="0 0 '+W+' '+H+'" role="img" aria-label="空间坐标轴、当前旋转轴、旋转前后向量的二维投影">'
      +'<rect x="1" y="1" width="'+(W-2)+'" height="'+(H-2)+'" rx="8" fill="#fffefa"/>'
      +'<line x1="'+cx+'" y1="'+cy+'" x2="'+(project([.72,0,0])[0]).toFixed(1)+'" y2="'+cy+'" stroke="#d5d4ce" stroke-width="1.5"/>'
      +'<line x1="'+cx+'" y1="'+cy+'" x2="'+project([0,.72,0])[0].toFixed(1)+'" y2="'+project([0,.72,0])[1].toFixed(1)+'" stroke="#d5d4ce" stroke-width="1.5"/>'
      +'<line x1="'+cx+'" y1="'+cy+'" x2="'+cx+'" y2="'+project([0,0,.72])[1].toFixed(1)+'" stroke="#d5d4ce" stroke-width="1.5"/>'
      +'<text x="'+(project([.72,0,0])[0]+9).toFixed(1)+'" y="'+(cy+4)+'" fill="#74808b" font-size="11">X</text>'
      +'<text x="'+(project([0,.72,0])[0]-5).toFixed(1)+'" y="'+(project([0,.72,0])[1]-7).toFixed(1)+'" fill="#74808b" font-size="11">Y</text>'
      +'<text x="'+(cx+7)+'" y="'+(project([0,0,.72])[1]-6).toFixed(1)+'" fill="#74808b" font-size="11">Z</text>';
    out+=arrow(axis.map(v=>v*.72),'#c38b3b',2.5,'5 4');
    out+=arrow([1,0,0],'#4c88a6',3.3);
    out+=arrow(rotated,'#458d73',4);
    out+='<circle cx="'+cx+'" cy="'+cy+'" r="4" fill="#46535d"/><text x="17" y="28" fill="#4c88a6" font-size="11">原向量 v=(1,0,0)</text><text x="17" y="47" fill="#458d73" font-size="11">旋转后 v′</text><text x="17" y="66" fill="#ad7a32" font-size="11">旋转轴 n</text></svg>';
    return out;
  }
  function updateQuaternion(root){
    const raw=['x','y','z'].map(axis=>Number(root.querySelector('[data-quaternion-axis="'+axis+'"]').value));
    ['x','y','z'].forEach((axis,index)=>{root.querySelector('[data-quaternion-axis-value="'+axis+'"]').textContent=raw[index].toFixed(1)});
    const magnitude=Math.hypot(raw[0],raw[1],raw[2]),hint=root.querySelector('[data-quaternion-hint]');
    if(magnitude<1e-8){
      root.querySelector('[data-quaternion-components]').textContent='—';
      root.querySelector('[data-quaternion-vector]').textContent='—';
      root.querySelector('[data-quaternion-axis-normalized]').textContent='无法归一化';
      hint.textContent='当前旋转轴是零向量。请至少把 x、y、z 中一个分量调离 0。';
      root.querySelector('[data-quaternion-visual]').innerHTML=quaternionVectorSvg([0,0,0],[1,0,0]);
      return;
    }
    const axis=raw.map(v=>v/magnitude),degrees=Number(root.querySelector('[data-quaternion-angle]').value),half=degrees*Math.PI/360;
    const q=[Math.cos(half),axis[0]*Math.sin(half),axis[1]*Math.sin(half),axis[2]*Math.sin(half)];
    const vector=[0,1,0,0],conjugate=[q[0],-q[1],-q[2],-q[3]];
    const rotated=quaternionMultiply(quaternionMultiply(q,vector),conjugate).slice(1).map(v=>Math.abs(v)<1e-10?0:v);
    const fmt=(v,digits=4)=>{const clean=Math.abs(v)<1e-10?0:v;return clean.toFixed(digits)};
    root.querySelector('[data-quaternion-angle-value]').textContent=degrees+'°';
    root.querySelector('[data-quaternion-axis-normalized]').textContent='('+axis.map(v=>fmt(v,2)).join(', ')+')';
    root.querySelector('[data-quaternion-components]').textContent='('+q.map(v=>fmt(v)).join(', ')+')';
    root.querySelector('[data-quaternion-vector]').textContent='('+rotated.map(v=>fmt(v)).join(', ')+')';
    root.querySelector('[data-quaternion-visual]').innerHTML=quaternionVectorSvg(axis,rotated);
    hint.textContent='已归一化旋转轴；按右手坐标系主动旋转计算，当前向量结果为 ('+rotated.map(v=>fmt(v,3)).join(', ')+')。';
  }
  document.addEventListener('input',event=>{
    const control=event.target.closest('[data-quaternion-angle],[data-quaternion-axis]');
    if(control)updateQuaternion(control.closest('[data-quaternion-playground]'));
  });
  document.addEventListener('click',event=>{
    const reset=event.target.closest('[data-quaternion-reset]');
    if(!reset)return;
    const root=reset.closest('[data-quaternion-playground]');
    root.querySelector('[data-quaternion-axis="x"]').value='0';
    root.querySelector('[data-quaternion-axis="y"]').value='0';
    root.querySelector('[data-quaternion-axis="z"]').value='1';
    root.querySelector('[data-quaternion-angle]').value='90';
    updateQuaternion(root);
  });
  function render(lessonId,sectionIndex){
    if(lessonId==='dataset'&&sectionIndex===0)return boxLabelMarkup();
    if(lessonId==='dataset'&&sectionIndex===4)return yoloReadinessMarkup();
    if(lessonId==='train-yolo'&&sectionIndex===2)return yoloTrainingLogMarkup();
    if(lessonId==='architecture'&&sectionIndex===1)return scaleExplorerMarkup();
    if(lessonId==='network'&&sectionIndex===1)return activationMarkup();
    if(lessonId==='losses'&&sectionIndex===1)return lossMarkup();
    if(lessonId==='losses'&&sectionIndex===3)return informationMarkup();
    if(lessonId==='losses'&&sectionIndex===4)return entropyMarkup();
    if(lessonId==='losses'&&sectionIndex===5)return multiclassMarkup();
    if(lessonId==='losses'&&sectionIndex===8)return lossTrainingMarkup();
    if(lessonId==='optimizer'&&sectionIndex===0)return optimizerMarkup();
    if(lessonId==='pooling'&&sectionIndex===0)return poolingMarkup();
    if(lessonId==='training'&&sectionIndex===3)return trainingMarkup();
    if(lessonId==='tasks'&&sectionIndex===1)return tasksMarkup();
    if(lessonId==='augmentation'&&sectionIndex===0)return augmentationMarkup();
    if(lessonId==='anchors'&&sectionIndex===1)return anchorMarkup();
    if(lessonId==='yolo-loss'&&sectionIndex===3)return yoloLossMarkup();
    if(lessonId==='quaternion'&&sectionIndex===1)return quaternionMarkup();
    return '';
  }
  function initialize(){
    document.querySelectorAll('[data-box-label-playground]').forEach(updateBoxLabel);
    document.querySelectorAll('[data-scale-explorer]').forEach(updateScaleExplorer);
    document.querySelectorAll('[data-activation-playground]').forEach(updateActivation);
    document.querySelectorAll('[data-loss-playground]').forEach(updateLoss);
    document.querySelectorAll('[data-multiclass-playground]').forEach(updateMulticlass);
    document.querySelectorAll('[data-information-playground]').forEach(updateInformation);
    document.querySelectorAll('[data-entropy-playground]').forEach(updateEntropy);
    document.querySelectorAll('[data-optimizer-playground]').forEach(updateOptimizer);
    document.querySelectorAll('[data-pooling-playground]').forEach(updatePooling);
    document.querySelectorAll('[data-training-playground]').forEach(updateTraining);
    document.querySelectorAll('[data-yolo-readiness]').forEach(updateYoloReadiness);
    document.querySelectorAll('[data-yolo-log]').forEach(updateYoloTrainingLog);
    document.querySelectorAll('[data-tasks-playground]').forEach(updateTasks);
    document.querySelectorAll('[data-lesson-augmentation]').forEach(updateAugmentationLesson);
    document.querySelectorAll('[data-anchor-playground]').forEach(updateAnchors);
    document.querySelectorAll('[data-yolo-loss-playground]').forEach(updateYoloLoss);
    document.querySelectorAll('[data-quaternion-playground]').forEach(updateQuaternion);
  }
  window.lessonPlaygrounds={render,initialize};

  document.addEventListener('input',event=>{
    const target=event.target;
    const boxLabelControl=target.closest('[data-box-label-coordinate]');if(boxLabelControl){updateBoxLabel(boxLabelControl.closest('[data-box-label-playground]'));return}
    const activation=target.closest('[data-activation-x]');if(activation){updateActivation(activation.closest('[data-activation-playground]'));return}
    const loss=target.closest('[data-loss-error],[data-loss-delta]');if(loss){updateLoss(loss.closest('[data-loss-playground]'));return}
    const multiclassLogit=target.closest('[data-multiclass-logit]');if(multiclassLogit){updateMulticlass(multiclassLogit.closest('[data-multiclass-playground]'));return}
    const informationProbability=target.closest('[data-information-probability]');if(informationProbability){updateInformation(informationProbability.closest('[data-information-playground]'));return}
    const entropyLogit=target.closest('[data-entropy-logit]');if(entropyLogit){updateEntropy(entropyLogit.closest('[data-entropy-playground]'));return}
    const optimizer=target.closest('[data-optimizer-rate],[data-optimizer-step]');if(optimizer)updateOptimizer(optimizer.closest('[data-optimizer-playground]'));
    const poolControl=target.closest('[data-pool-row],[data-pool-col]');if(poolControl){updatePooling(poolControl.closest('[data-pooling-playground]'));return}
    const trainingControl=target.closest('[data-training-epoch]');if(trainingControl){updateTraining(trainingControl.closest('[data-training-playground]'));return}
    const augmentationControl=target.closest('[data-lesson-augment-strength]');if(augmentationControl){updateAugmentationLesson(augmentationControl.closest('[data-lesson-augmentation]'));return}
    const anchorControl=target.closest('[data-anchor-width],[data-anchor-height],[data-anchor-threshold]');if(anchorControl){updateAnchors(anchorControl.closest('[data-anchor-playground]'));return}
    const singleClass=target.closest('[data-yolo-loss-single]');if(singleClass){const root=singleClass.closest('[data-yolo-loss-playground]');if(singleClass.checked&&root.dataset.yoloLossMode==='classification')root.dataset.yoloLossMode='localization';updateYoloLoss(root);return}
    const yoloLossControl=target.closest('[data-yolo-loss-gain]');if(yoloLossControl){updateYoloLoss(yoloLossControl.closest('[data-yolo-loss-playground]'));return}
  });
  document.addEventListener('click',event=>{
    const informationBase=event.target.closest('[data-information-base]');
    if(informationBase){const root=informationBase.closest('[data-information-playground]');root.dataset.base=informationBase.dataset.informationBase;updateInformation(root);return}
    const informationPreset=event.target.closest('[data-information-preset]');
    if(informationPreset){const root=informationPreset.closest('[data-information-playground]');root.querySelector('[data-information-probability]').value=informationPreset.dataset.informationPreset;updateInformation(root);return}
    const informationReset=event.target.closest('[data-information-reset]');
    if(informationReset){const root=informationReset.closest('[data-information-playground]');root.dataset.base='nat';root.querySelector('[data-information-probability]').value='0.9';updateInformation(root);return}
    const entropyScenario=event.target.closest('[data-entropy-scenario]');
    if(entropyScenario){const root=entropyScenario.closest('[data-entropy-playground]');root.dataset.scenario=entropyScenario.dataset.entropyScenario;updateEntropy(root);return}
    const entropyReset=event.target.closest('[data-entropy-reset]');
    if(entropyReset){const root=entropyReset.closest('[data-entropy-playground]');root.dataset.scenario='skew';root.querySelectorAll('[data-entropy-logit]').forEach((input,i)=>input.value=[-1.6,-1.2,-.7][i]);updateEntropy(root);return}
    const scaleTarget=event.target.closest('[data-scale-target]');
    if(scaleTarget){const root=scaleTarget.closest('[data-scale-explorer]');root.dataset.scaleTarget=scaleTarget.dataset.scaleTarget;updateScaleExplorer(root);return}
    const boxLabelReset=event.target.closest('[data-box-label-reset]');
    if(boxLabelReset){const root=boxLabelReset.closest('[data-box-label-playground]');root.querySelectorAll('[data-box-label-coordinate]').forEach(input=>{input.value=String(boxLabelDefaults[input.dataset.boxLabelCoordinate])});updateBoxLabel(root);return}
    const activationChoice=event.target.closest('[data-activation-choose]');
    if(activationChoice){const root=activationChoice.closest('[data-activation-playground]');root.dataset.function=activationChoice.dataset.activationChoose;updateActivation(root);return}
    const activationReset=event.target.closest('[data-activation-reset]');
    if(activationReset){const root=activationReset.closest('[data-activation-playground]');root.dataset.function='relu';root.querySelector('[data-activation-x]').value='1.5';updateActivation(root);return}
    const lossReset=event.target.closest('[data-loss-reset]');
    if(lossReset){const root=lossReset.closest('[data-loss-playground]');root.querySelector('[data-loss-error]').value='2';root.querySelector('[data-loss-delta]').value='1';updateLoss(root);return}
    const multiclassTarget=event.target.closest('[data-multiclass-target]');
    if(multiclassTarget){const root=multiclassTarget.closest('[data-multiclass-playground]');root.dataset.target=multiclassTarget.dataset.multiclassTarget;updateMulticlass(root);return}
    const multiclassReset=event.target.closest('[data-multiclass-reset]');
    if(multiclassReset){const root=multiclassReset.closest('[data-multiclass-playground]');root.dataset.target='2';root.querySelectorAll('[data-multiclass-logit]').forEach((input,i)=>input.value=[2,1,0.1][i]);updateMulticlass(root);return}
    const optimizerChoice=event.target.closest('[data-optimizer-choose]');
    if(optimizerChoice){const root=optimizerChoice.closest('[data-optimizer-playground]');root.dataset.optimizer=optimizerChoice.dataset.optimizerChoose;updateOptimizer(root);return}
    const optimizerReset=event.target.closest('[data-optimizer-reset]');
    if(optimizerReset){const root=optimizerReset.closest('[data-optimizer-playground]');root.dataset.optimizer='sgd';root.querySelector('[data-optimizer-rate]').value='0.20';root.querySelector('[data-optimizer-step]').value='10';updateOptimizer(root)}
    const poolMethod=event.target.closest('[data-pool-method-choice]');
    if(poolMethod){const root=poolMethod.closest('[data-pooling-playground]');root.dataset.poolMethod=poolMethod.dataset.poolMethodChoice;updatePooling(root);return}
    const poolStride=event.target.closest('[data-pool-stride-choice]');
    if(poolStride){const root=poolStride.closest('[data-pooling-playground]');root.dataset.poolStride=poolStride.dataset.poolStrideChoice;root.querySelector('[data-pool-row]').value='0';root.querySelector('[data-pool-col]').value='0';updatePooling(root);return}
    const poolReset=event.target.closest('[data-pool-reset]');
    if(poolReset){const root=poolReset.closest('[data-pooling-playground]');root.dataset.poolMethod='max';root.dataset.poolStride='2';root.querySelector('[data-pool-row]').value='0';root.querySelector('[data-pool-col]').value='0';updatePooling(root);return}
    const trainingBest=event.target.closest('[data-training-best]');
    if(trainingBest){const root=trainingBest.closest('[data-training-playground]');root.querySelector('[data-training-epoch]').value=String(bestTrainingEpoch);updateTraining(root);return}
    const trainingReset=event.target.closest('[data-training-reset]');
    if(trainingReset){const root=trainingReset.closest('[data-training-playground]');root.querySelector('[data-training-epoch]').value='20';updateTraining(root);return}
    const yoloReadinessCheck=event.target.closest('[data-yolo-readiness-check]');
    if(yoloReadinessCheck){yoloReadinessCheck.setAttribute('aria-pressed',String(yoloReadinessCheck.getAttribute('aria-pressed')!=='true'));updateYoloReadiness(yoloReadinessCheck.closest('[data-yolo-readiness]'));return}
    const yoloReadinessReset=event.target.closest('[data-yolo-readiness-reset]');
    if(yoloReadinessReset){const root=yoloReadinessReset.closest('[data-yolo-readiness]');root.querySelectorAll('[data-yolo-readiness-check]').forEach(button=>button.setAttribute('aria-pressed','false'));updateYoloReadiness(root);return}
    const yoloLogField=event.target.closest('[data-yolo-log-field-choice]');
    if(yoloLogField){const root=yoloLogField.closest('[data-yolo-log]');root.dataset.yoloLogField=yoloLogField.dataset.yoloLogFieldChoice;updateYoloTrainingLog(root);return}
    const taskChoice=event.target.closest('[data-task-choice]');
    if(taskChoice){const root=taskChoice.closest('[data-tasks-playground]');root.dataset.taskMode=taskChoice.dataset.taskChoice;updateTasks(root);return}
    const taskReset=event.target.closest('[data-task-reset]');
    if(taskReset){const root=taskReset.closest('[data-tasks-playground]');root.dataset.taskMode='classification';updateTasks(root);return}
    const augmentationMode=event.target.closest('button[data-lesson-augment-mode]');
    if(augmentationMode){const root=augmentationMode.closest('[data-lesson-augmentation]');root.dataset.lessonAugmentMode=augmentationMode.dataset.lessonAugmentMode;updateAugmentationLesson(root);return}
    const augmentationSync=event.target.closest('button[data-lesson-augment-sync]');
    if(augmentationSync){const root=augmentationSync.closest('[data-lesson-augmentation]');root.dataset.lessonAugmentSync=root.dataset.lessonAugmentSync==='false'?'true':'false';updateAugmentationLesson(root);return}
    const augmentationReset=event.target.closest('[data-lesson-augment-reset]');
    if(augmentationReset){const root=augmentationReset.closest('[data-lesson-augmentation]');root.dataset.lessonAugmentMode='flip';root.dataset.lessonAugmentSync='true';root.querySelector('[data-lesson-augment-strength]').value='1.20';updateAugmentationLesson(root);return}
    const anchorReset=event.target.closest('[data-anchor-reset]');
    if(anchorReset){const root=anchorReset.closest('[data-anchor-playground]');root.querySelector('[data-anchor-width]').value='64';root.querySelector('[data-anchor-height]').value='48';root.querySelector('[data-anchor-threshold]').value='4';updateAnchors(root);return}
    const yoloLossMode=event.target.closest('button[data-yolo-loss-mode]');
    if(yoloLossMode){const root=yoloLossMode.closest('[data-yolo-loss-playground]');root.dataset.yoloLossMode=yoloLossMode.dataset.yoloLossMode;updateYoloLoss(root);return}
    const yoloLossReset=event.target.closest('[data-yolo-loss-reset]');
    if(yoloLossReset){const root=yoloLossReset.closest('[data-yolo-loss-playground]');root.dataset.yoloLossMode='localization';root.querySelector('[data-yolo-loss-single]').checked=false;root.querySelectorAll('[data-yolo-loss-gain]').forEach(input=>{input.value='1'});updateYoloLoss(root)}
  });
})();
