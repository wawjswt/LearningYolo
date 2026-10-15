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

  function render(lessonId,sectionIndex){
    if(lessonId==='network'&&sectionIndex===1)return activationMarkup();
    if(lessonId==='losses'&&sectionIndex===1)return lossMarkup();
    if(lessonId==='optimizer'&&sectionIndex===0)return optimizerMarkup();
    return '';
  }
  function initialize(){
    document.querySelectorAll('[data-activation-playground]').forEach(updateActivation);
    document.querySelectorAll('[data-loss-playground]').forEach(updateLoss);
    document.querySelectorAll('[data-optimizer-playground]').forEach(updateOptimizer);
  }
  window.lessonPlaygrounds={render,initialize};

  document.addEventListener('input',event=>{
    const target=event.target;
    const activation=target.closest('[data-activation-x]');if(activation){updateActivation(activation.closest('[data-activation-playground]'));return}
    const loss=target.closest('[data-loss-error],[data-loss-delta]');if(loss){updateLoss(loss.closest('[data-loss-playground]'));return}
    const optimizer=target.closest('[data-optimizer-rate],[data-optimizer-step]');if(optimizer)updateOptimizer(optimizer.closest('[data-optimizer-playground]'));
  });
  document.addEventListener('click',event=>{
    const activationChoice=event.target.closest('[data-activation-choose]');
    if(activationChoice){const root=activationChoice.closest('[data-activation-playground]');root.dataset.function=activationChoice.dataset.activationChoose;updateActivation(root);return}
    const activationReset=event.target.closest('[data-activation-reset]');
    if(activationReset){const root=activationReset.closest('[data-activation-playground]');root.dataset.function='relu';root.querySelector('[data-activation-x]').value='1.5';updateActivation(root);return}
    const lossReset=event.target.closest('[data-loss-reset]');
    if(lossReset){const root=lossReset.closest('[data-loss-playground]');root.querySelector('[data-loss-error]').value='2';root.querySelector('[data-loss-delta]').value='1';updateLoss(root);return}
    const optimizerChoice=event.target.closest('[data-optimizer-choose]');
    if(optimizerChoice){const root=optimizerChoice.closest('[data-optimizer-playground]');root.dataset.optimizer=optimizerChoice.dataset.optimizerChoose;updateOptimizer(root);return}
    const optimizerReset=event.target.closest('[data-optimizer-reset]');
    if(optimizerReset){const root=optimizerReset.closest('[data-optimizer-playground]');root.dataset.optimizer='sgd';root.querySelector('[data-optimizer-rate]').value='0.20';root.querySelector('[data-optimizer-step]').value='10';updateOptimizer(root)}
  });
})();
