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

  function render(lessonId,sectionIndex){
    if(lessonId==='network'&&sectionIndex===1)return activationMarkup();
    if(lessonId==='losses'&&sectionIndex===1)return lossMarkup();
    if(lessonId==='optimizer'&&sectionIndex===0)return optimizerMarkup();
    if(lessonId==='pooling'&&sectionIndex===0)return poolingMarkup();
    if(lessonId==='training'&&sectionIndex===3)return trainingMarkup();
    if(lessonId==='tasks'&&sectionIndex===1)return tasksMarkup();
    return '';
  }
  function initialize(){
    document.querySelectorAll('[data-activation-playground]').forEach(updateActivation);
    document.querySelectorAll('[data-loss-playground]').forEach(updateLoss);
    document.querySelectorAll('[data-optimizer-playground]').forEach(updateOptimizer);
    document.querySelectorAll('[data-pooling-playground]').forEach(updatePooling);
    document.querySelectorAll('[data-training-playground]').forEach(updateTraining);
    document.querySelectorAll('[data-tasks-playground]').forEach(updateTasks);
  }
  window.lessonPlaygrounds={render,initialize};

  document.addEventListener('input',event=>{
    const target=event.target;
    const activation=target.closest('[data-activation-x]');if(activation){updateActivation(activation.closest('[data-activation-playground]'));return}
    const loss=target.closest('[data-loss-error],[data-loss-delta]');if(loss){updateLoss(loss.closest('[data-loss-playground]'));return}
    const optimizer=target.closest('[data-optimizer-rate],[data-optimizer-step]');if(optimizer)updateOptimizer(optimizer.closest('[data-optimizer-playground]'));
    const poolControl=target.closest('[data-pool-row],[data-pool-col]');if(poolControl){updatePooling(poolControl.closest('[data-pooling-playground]'));return}
    const trainingControl=target.closest('[data-training-epoch]');if(trainingControl){updateTraining(trainingControl.closest('[data-training-playground]'));return}
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
    const taskChoice=event.target.closest('[data-task-choice]');
    if(taskChoice){const root=taskChoice.closest('[data-tasks-playground]');root.dataset.taskMode=taskChoice.dataset.taskChoice;updateTasks(root);return}
    const taskReset=event.target.closest('[data-task-reset]');
    if(taskReset){const root=taskReset.closest('[data-tasks-playground]');root.dataset.taskMode='classification';updateTasks(root)}
  });
})();
