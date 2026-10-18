/* Bias 与 BatchNorm 交互图解：让每个滑块都对应一个清楚的计算变化。 */
(()=>{
  const fmt=value=>{const n=Number(value.toFixed(2));return Object.is(n,-0)?'0.00':n.toFixed(2)};
  const svgText=(x,y,label,size=11,anchor='middle',fill='#77818b')=>'<text x="'+x+'" y="'+y+'" text-anchor="'+anchor+'" fill="'+fill+'" font-size="'+size+'">'+label+'</text>';
  const plotFrame=(W,H,L,R,T,B,xmin,xmax,ymin,ymax,xticks,yticks,xname,yname)=>{
    const X=value=>L+(value-xmin)/(xmax-xmin)*(W-L-R);
    const Y=value=>B-(value-ymin)/(ymax-ymin)*(B-T);
    let out='<svg viewBox="0 0 '+W+' '+H+'" role="img">';
    yticks.forEach(value=>{out+='<line x1="'+L+'" y1="'+Y(value)+'" x2="'+(W-R)+'" y2="'+Y(value)+'" stroke="'+(value===0?'#aaa69e':'#ebe8e1')+'" stroke-width="'+(value===0?1.3:1)+'"/>'+svgText(L-9,Y(value)+4,String(value),10,'end')});
    xticks.forEach(value=>{out+='<line x1="'+X(value)+'" y1="'+T+'" x2="'+X(value)+'" y2="'+B+'" stroke="'+(value===0?'#aaa69e':'#efede7')+'" stroke-width="'+(value===0?1.3:1)+'"/>'+svgText(X(value),B+18,String(value),10)});
    out+=svgText(L,B+39,xname,11,'start','#626e79')+svgText(16,T+5,yname,11,'start','#626e79');
    return {out,X,Y};
  };
  const curvePath=(fn,X,Y,xmin,xmax,steps=120)=>{
    let path='';
    for(let i=0;i<=steps;i++){
      const x=xmin+(xmax-xmin)*i/steps;
      path+=(i?'L':'M')+X(x).toFixed(1)+','+Y(fn(x)).toFixed(1);
    }
    return path;
  };
  const legend=(items,y)=>{
    let out='',x=64;
    items.forEach(item=>{
      out+='<line x1="'+x+'" y1="'+y+'" x2="'+(x+17)+'" y2="'+y+'" stroke="'+item.color+'" stroke-width="3"/>'+svgText(x+23,y+4,item.label,10,'start','#596672');
      x+=item.width||120;
    });
    return out;
  };
  function lineBiasMarkup(){
    return '<section class="lesson-playground bias-playground" data-bias-line aria-labelledby="bias-line-title"><div class="playground-heading"><div><span class="playground-kicker">互动图解 · 权重与偏置</span><h3 id="bias-line-title">改斜率，还是把整条线平移？</h3><p>灰线是没有偏置的 z=wx；紫线是 z=wx+b。调整参数和输入，观察两条线怎样变化。</p></div><button type="button" class="playground-reset" data-bias-line-reset>恢复默认</button></div><div class="bias-chart" data-bias-line-chart role="img" aria-label="比较有无偏置时的直线"></div><div class="bias-control-grid"><label class="playground-range"><span>权重 w <output data-bias-weight-value>1.00</output></span><input type="range" min="-1.5" max="1.5" step="0.1" value="1" data-bias-weight aria-label="权重 w"></label><label class="playground-range"><span>偏置 b <output data-bias-value>1.00</output></span><input type="range" min="-3" max="3" step="0.1" value="1" data-bias-value-control aria-label="偏置 b"></label><label class="playground-range"><span>当前输入 x <output data-bias-input-value>1.00</output></span><input type="range" min="-3" max="3" step="0.1" value="1" data-bias-input aria-label="当前输入 x"></label></div><div class="bias-readouts"><div><span>预激活 z=wx+b</span><strong data-bias-current-z>2.00</strong></div><div><span>没有偏置 wx</span><strong data-bias-no-offset>1.00</strong></div><div><span>偏置带来的变化</span><strong data-bias-delta>+1.00</strong></div></div><p class="playground-insight" data-bias-line-hint role="status" aria-live="polite"></p><p class="playground-footnote">权重决定输入变化对输出的影响；偏置是在加权求和之后加入的可训练常数。图中只画一个输入和一个神经元，多输入时会扩展为 z=wᵀx+b。</p></section>';
  }
  function updateLineBias(root){
    const w=Number(root.querySelector('[data-bias-weight]').value);
    const b=Number(root.querySelector('[data-bias-value-control]').value);
    const x=Number(root.querySelector('[data-bias-input]').value);
    const z=w*x+b,plain=w*x,W=760,H=320,L=56,R=22,T=20,B=264,xmin=-3,xmax=3,ymin=-8,ymax=8;
    const frame=plotFrame(W,H,L,R,T,B,xmin,xmax,ymin,ymax,[-3,-2,-1,0,1,2,3],[-6,-3,0,3,6],'输入 x','输出 z');
    let out=frame.out;
    out+='<path d="'+curvePath(value=>w*value,frame.X,frame.Y,xmin,xmax)+'" fill="none" stroke="#a4adb8" stroke-width="2.5" stroke-dasharray="7 5"/>';
    out+='<path d="'+curvePath(value=>w*value+b,frame.X,frame.Y,xmin,xmax)+'" fill="none" stroke="#6e59a5" stroke-width="3.5" stroke-linecap="round"/>';
    out+='<line x1="'+frame.X(x)+'" y1="'+T+'" x2="'+frame.X(x)+'" y2="'+B+'" stroke="#575f68" stroke-width="1" stroke-dasharray="4 4"/>';
    out+='<circle cx="'+frame.X(x)+'" cy="'+frame.Y(z)+'" r="6" fill="#cf7659" stroke="#fff" stroke-width="2"/>';
    out+=legend([{label:'z=wx',color:'#a4adb8',width:100},{label:'z=wx+b',color:'#6e59a5',width:135},{label:'当前输入',color:'#cf7659',width:120}],H-12)+'</svg>';
    root.querySelector('[data-bias-line-chart]').innerHTML=out;
    root.querySelector('[data-bias-weight-value]').textContent=fmt(w);
    root.querySelector('[data-bias-value]').textContent=fmt(b);
    root.querySelector('[data-bias-input-value]').textContent=fmt(x);
    root.querySelector('[data-bias-current-z]').textContent=fmt(z);
    root.querySelector('[data-bias-no-offset]').textContent=fmt(plain);
    root.querySelector('[data-bias-delta]').textContent=(b>0?'+':'')+fmt(b);
    root.querySelector('[data-bias-line-hint]').textContent=b===0?'b=0，两条线重合；加入偏置后，斜率仍由 w 决定，直线可以上下移动。':(b>0?'b 为正，紫线相对灰线整体上移 '+fmt(b)+'。':'b 为负，紫线相对灰线整体下移 '+fmt(Math.abs(b))+'。')+' 当前输入下，wx='+fmt(plain)+'，wx+b='+fmt(z)+'。';
  }
  function reluBiasMarkup(){
    return '<section class="lesson-playground bias-playground" data-relu-bias aria-labelledby="relu-bias-title"><div class="playground-heading"><div><span class="playground-kicker">互动图解 · ReLU 激活阈值</span><h3 id="relu-bias-title">偏置会移动 ReLU 的“开关线”</h3><p>紫线是 ReLU(wx+b)，灰线是 ReLU(wx)。拖动 b，看激活区域与当前梯度怎样改变。</p></div><button type="button" class="playground-reset" data-relu-bias-reset>恢复默认</button></div><div class="bias-chart" data-relu-bias-chart role="img" aria-label="有无偏置时的 ReLU 输出曲线"></div><div class="bias-control-grid"><label class="playground-range"><span>权重 w <output data-relu-weight-value>1.00</output></span><input type="range" min="-1.5" max="1.5" step="0.1" value="1" data-relu-weight aria-label="ReLU 前的权重 w"></label><label class="playground-range"><span>偏置 b <output data-relu-b-value>-1.00</output></span><input type="range" min="-4" max="4" step="0.1" value="-1" data-relu-b-value-control aria-label="ReLU 前的偏置 b"></label><label class="playground-range"><span>当前输入 x <output data-relu-x-value>0.00</output></span><input type="range" min="-4" max="4" step="0.1" value="0" data-relu-x aria-label="ReLU 当前输入 x"></label></div><div class="bias-readouts"><div><span>预激活 z=wx+b</span><strong data-relu-z>-1.00</strong></div><div><span>ReLU 输出</span><strong data-relu-a>0.00</strong></div><div><span>局部梯度 da/dz</span><strong data-relu-grad>0</strong></div><div><span>激活分界 x*=−b/w</span><strong data-relu-boundary>1.00</strong></div></div><p class="playground-insight" data-relu-bias-hint role="status" aria-live="polite"></p><p class="playground-footnote">这里只展示一个神经元的一维切片。多维时，分界面是 wᵀx+b=0；偏置改变位置，不单独保证训练稳定或神经元存活。ReLU 在 z=0 处不可导，本互动在该点按常见次梯度约定显示 0。</p></section>';
  }
  function updateReluBias(root){
    const w=Number(root.querySelector('[data-relu-weight]').value);
    const b=Number(root.querySelector('[data-relu-b-value-control]').value);
    const x=Number(root.querySelector('[data-relu-x]').value);
    const z=w*x+b,a=Math.max(0,z),gradient=z>0?1:0,W=760,H=320,L=56,R=22,T=20,B=264,xmin=-4,xmax=4,ymin=0,ymax=10;
    const frame=plotFrame(W,H,L,R,T,B,xmin,xmax,ymin,ymax,[-4,-2,0,2,4],[0,2,4,6,8,10],'输入 x','激活 a');
    let out=frame.out;
    out+='<path d="'+curvePath(value=>Math.max(0,w*value),frame.X,frame.Y,xmin,xmax)+'" fill="none" stroke="#a4adb8" stroke-width="2.5" stroke-dasharray="7 5"/>';
    out+='<path d="'+curvePath(value=>Math.max(0,w*value+b),frame.X,frame.Y,xmin,xmax)+'" fill="none" stroke="#6e59a5" stroke-width="3.5" stroke-linecap="round"/>';
    const boundary=Math.abs(w)<0.05?null:-b/w;
    if(boundary!==null&&boundary>=xmin&&boundary<=xmax)out+='<line x1="'+frame.X(boundary)+'" y1="'+T+'" x2="'+frame.X(boundary)+'" y2="'+B+'" stroke="#cf7659" stroke-width="1.5" stroke-dasharray="4 4"/>'+svgText(frame.X(boundary),T+13,'z=0',10,'middle','#b85e47');
    out+='<line x1="'+frame.X(x)+'" y1="'+T+'" x2="'+frame.X(x)+'" y2="'+B+'" stroke="#575f68" stroke-width="1" stroke-dasharray="4 4"/>';
    out+='<circle cx="'+frame.X(x)+'" cy="'+frame.Y(a)+'" r="6" fill="#cf7659" stroke="#fff" stroke-width="2"/>';
    out+=legend([{label:'ReLU(wx)',color:'#a4adb8',width:120},{label:'ReLU(wx+b)',color:'#6e59a5',width:160},{label:'z=0 分界',color:'#cf7659',width:135}],H-12)+'</svg>';
    root.querySelector('[data-relu-bias-chart]').innerHTML=out;
    root.querySelector('[data-relu-weight-value]').textContent=fmt(w);
    root.querySelector('[data-relu-b-value]').textContent=fmt(b);
    root.querySelector('[data-relu-x-value]').textContent=fmt(x);
    root.querySelector('[data-relu-z]').textContent=fmt(z);
    root.querySelector('[data-relu-a]').textContent=fmt(a);
    root.querySelector('[data-relu-grad]').textContent=z===0?'0（常见次梯度约定）':String(gradient);
    root.querySelector('[data-relu-boundary]').textContent=boundary===null?'w≈0，无唯一分界':fmt(boundary);
    const state=z>0?'当前 z>0，ReLU 对 z 的局部梯度为 1，梯度可以继续通过该节点回传；w 与 b 的实际梯度还取决于输入和上游梯度。':'当前 z≤0，ReLU 输出为 0，局部梯度为 0；这个样本对该单元的 w 与 b 都没有有效梯度。';
    root.querySelector('[data-relu-bias-hint]').textContent=state+' b 会移动 z=0 分界，但若所有训练样本都长期落在负区，Bias 也无法保证自行恢复。';
  }
  const bnBase=[-1,0,1,2];
  function batchNormBiasMarkup(){
    return '<section class="lesson-playground bias-playground bn-bias-playground" data-bn-bias aria-labelledby="bn-bias-title"><div class="playground-heading"><div><span class="playground-kicker">互动图解 · Conv/Linear 接 BatchNorm</span><h3 id="bn-bias-title">常量偏移，怎样被减均值抵消？</h3><p>用一组简化的通道数值，拖动前层偏置 b 与 BatchNorm 的 γ、β。</p></div><button type="button" class="playground-reset" data-bn-bias-reset>恢复默认</button></div><div class="bn-flow" aria-label="卷积或线性层后接 BatchNorm"><span>卷积 / 线性层</span><i>→</i><span>按通道减均值</span><i>→</i><span>缩放 γ、平移 β</span></div><div class="bias-chart" data-bn-bias-chart role="img" aria-label="比较前层偏置、加偏置后和 BatchNorm 输出"></div><div class="bias-control-grid bn-control-grid"><label class="playground-range"><span>前层偏置 b <output data-bn-b-value>1.00</output></span><input type="range" min="-3" max="3" step="0.1" value="1" data-bn-b aria-label="归一化前一层的偏置"></label><label class="playground-range"><span>BatchNorm γ <output data-bn-gamma-value>1.00</output></span><input type="range" min="-2" max="2" step="0.1" value="1" data-bn-gamma aria-label="BatchNorm 缩放参数 gamma"></label><label class="playground-range"><span>BatchNorm β <output data-bn-beta-value>0.00</output></span><input type="range" min="-2" max="2" step="0.1" value="0" data-bn-beta aria-label="BatchNorm 平移参数 beta"></label></div><div class="bn-readouts"><div><span>加入前层偏置后的均值 μ</span><strong data-bn-mean>1.50</strong></div><div><span>标准差（不受常量平移影响）</span><strong data-bn-std>1.12</strong></div><div><span>归一化后再经 γ、β</span><strong data-bn-output>[-1.34, -0.45, 0.45, 1.34]</strong></div></div><p class="playground-insight" data-bn-bias-hint role="status" aria-live="polite"></p><p class="playground-footnote">示例把四个数当作同一通道的一小组位置，并用这四个数计算批次均值和方差。真实 BatchNorm 会按通道对实际批次与空间位置统计；图用于展示“加同一个常数后再减均值”的抵消关系。</p></section>';
  }
  function updateBatchNormBias(root){
    const b=Number(root.querySelector('[data-bn-b]').value);
    const gamma=Number(root.querySelector('[data-bn-gamma]').value);
    const beta=Number(root.querySelector('[data-bn-beta]').value);
    const meanBase=0.5,variance=1.25,sd=Math.sqrt(variance+1e-5);
    const mean=meanBase+b,normalized=bnBase.map(value=>(value-meanBase)/sd),output=normalized.map(value=>gamma*value+beta);
    const W=760,H=320,L=62,R=22,T=20,B=264,xmin=0.5,xmax=4.5,ymin=-4,ymax=4;
    const frame=plotFrame(W,H,L,R,T,B,xmin,xmax,ymin,ymax,[1,2,3,4],[-4,-2,0,2,4],'同一通道中的位置','数值');
    const series=[
      {label:'卷积输出 u=Wx',values:bnBase,color:'#9aa4ae'},
      {label:'加偏置 u+b',values:bnBase.map(value=>value+b),color:'#cf7659'},
      {label:'BatchNorm 输出',values:output,color:'#6e59a5'}
    ];
    let out=frame.out;
    series.forEach((line,index)=>{
      out+='<path d="'+line.values.map((value,i)=>(i?'L':'M')+frame.X(i+1).toFixed(1)+','+frame.Y(value).toFixed(1)).join(' ')+'" fill="none" stroke="'+line.color+'" stroke-width="'+(index===2?3.5:2.4)+'" stroke-linecap="round" stroke-linejoin="round"'+(index===0?' stroke-dasharray="6 5"':'')+'/>';
      line.values.forEach((value,i)=>{out+='<circle cx="'+frame.X(i+1)+'" cy="'+frame.Y(value)+'" r="'+(index===2?5:4)+'" fill="'+line.color+'" stroke="#fff" stroke-width="1.5"/>'});
    });
    out+=legend(series.map(line=>({label:line.label,color:line.color,width:190})),H-12)+'</svg>';
    root.querySelector('[data-bn-bias-chart]').innerHTML=out;
    root.querySelector('[data-bn-b-value]').textContent=fmt(b);
    root.querySelector('[data-bn-gamma-value]').textContent=fmt(gamma);
    root.querySelector('[data-bn-beta-value]').textContent=fmt(beta);
    root.querySelector('[data-bn-mean]').textContent=fmt(mean);
    root.querySelector('[data-bn-std]').textContent=fmt(sd);
    root.querySelector('[data-bn-output]').textContent='['+output.map(fmt).join(', ')+']';
    root.querySelector('[data-bn-bias-hint]').textContent='前层 b 把均值从 '+fmt(meanBase)+' 改为 '+fmt(mean)+'，但标准差仍为 '+fmt(sd)+'；减去新均值后，归一化输入与 b=0 时相同。最终变化由 BatchNorm 的 γ='+fmt(gamma)+' 和 β='+fmt(beta)+' 控制。';
  }
  function render(lessonId,sectionIndex){
    if(lessonId==='network'&&sectionIndex===0)return lineBiasMarkup();
    if(lessonId==='network'&&sectionIndex===2)return reluBiasMarkup();
    if(lessonId==='network'&&sectionIndex===3)return batchNormBiasMarkup();
    return '';
  }
  function initialize(){
    document.querySelectorAll('[data-bias-line]').forEach(updateLineBias);
    document.querySelectorAll('[data-relu-bias]').forEach(updateReluBias);
    document.querySelectorAll('[data-bn-bias]').forEach(updateBatchNormBias);
  }
  document.addEventListener('input',event=>{
    const target=event.target;
    const line=target.closest('[data-bias-weight],[data-bias-value-control],[data-bias-input]');
    if(line){updateLineBias(line.closest('[data-bias-line]'));return}
    const relu=target.closest('[data-relu-weight],[data-relu-b-value-control],[data-relu-x]');
    if(relu){updateReluBias(relu.closest('[data-relu-bias]'));return}
    const bn=target.closest('[data-bn-b],[data-bn-gamma],[data-bn-beta]');
    if(bn)updateBatchNormBias(bn.closest('[data-bn-bias]'));
  });
  document.addEventListener('click',event=>{
    const lineReset=event.target.closest('[data-bias-line-reset]');
    if(lineReset){const root=lineReset.closest('[data-bias-line]');root.querySelector('[data-bias-weight]').value='1';root.querySelector('[data-bias-value-control]').value='1';root.querySelector('[data-bias-input]').value='1';updateLineBias(root);return}
    const reluReset=event.target.closest('[data-relu-bias-reset]');
    if(reluReset){const root=reluReset.closest('[data-relu-bias]');root.querySelector('[data-relu-weight]').value='1';root.querySelector('[data-relu-b-value-control]').value='-1';root.querySelector('[data-relu-x]').value='0';updateReluBias(root);return}
    const bnReset=event.target.closest('[data-bn-bias-reset]');
    if(bnReset){const root=bnReset.closest('[data-bn-bias]');root.querySelector('[data-bn-b]').value='1';root.querySelector('[data-bn-gamma]').value='1';root.querySelector('[data-bn-beta]').value='0';updateBatchNormBias(root)}
  });
  window.lessonBiasPlaygrounds={render,initialize};
})();
