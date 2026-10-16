/* 多通道卷积：形状与数值使用相同规则，示例权重固定以便手算。 */
(()=>{
  const text=(x,y,value,size=13,color='#586674')=>'<text x="'+x+'" y="'+y+'" font-size="'+size+'" fill="'+color+'" text-anchor="middle">'+value+'</text>';
  const inputs=[[[1,2,0],[0,1,3],[2,1,0]],[[0,1,2],[2,0,1],[1,3,2]],[[2,0,1],[1,2,0],[0,1,3]]];
  const weights=[[[[1,0],[0,1]],[[0,1],[1,0]],[[1,-1],[0,1]]],[[[0,1],[-1,0]],[[1,0],[0,-1]],[[0,1],[1,0]]]];
  const colors=['#aa655f','#50846d','#5a7ea7'];
  function shape(cin,cout,k,s,p,g){
    if(!Number.isInteger(g)||g<1||cin%g||cout%g)throw new Error('输入和输出通道必须都能被 groups 整除');
    return {size:Math.floor((7+2*p-k)/s)+1,depth:cin/g,parameters:cout*(cin/g)*k*k+cout};
  }
  function compute(filter,row,col,enabled,bias){
    const terms=inputs.map((plane,c)=>weights[filter][c].flatMap((line,u)=>line.map((w,v)=>[plane[row+u][col+v],w])));
    const parts=terms.map((channel,c)=>enabled[c]?channel.reduce((sum,[x,w])=>sum+x*w,0):0);
    return {terms,parts,value:parts.reduce((sum,v)=>sum+v,0)+bias};
  }
  function select(label,key,values,current){return '<label>'+label+'<select data-channel-setting="'+key+'" aria-label="'+label+'">'+values.map(v=>'<option value="'+v+'"'+(v===current?' selected':'')+'>'+v+'</option>').join('')+'</select></label>'}
  function shapeMarkup(){
    return '<section class="lesson-playground channel-explorer" data-channel-shape aria-labelledby="channel-shape-title"><div class="playground-heading"><div><span class="playground-kicker">互动图解 · 形状与连接</span><h3 id="channel-shape-title">改变通道数，哪些尺寸会跟着变？</h3><p>输入固定为一张 7×7 图。先从 3→16 的基础配置开始，再切换 1×1 或分组连接。</p></div></div><div class="channel-presets" role="group" aria-label="选择卷积配置"><button type="button" data-channel-preset="video">基础配置 · 3→16</button><button type="button" data-channel-preset="pointwise">1×1 混合通道</button><button type="button" data-channel-preset="grouped">分组 · groups=2</button><button type="button" data-channel-preset="depthwise">深度卷积 · groups=8</button></div><div class="channel-settings">'+select('输入通道 Cin','cin',[1,3,8],3)+select('输出通道 Cout','cout',[1,2,8,16],16)+select('空间核大小 K','k',[1,3],3)+select('步幅 stride','s',[1,2],1)+select('填充 padding','p',[0,1],0)+select('连接分组 groups','g',[1],1)+'</div><div class="channel-svg-scroll" data-channel-diagram></div><div class="channel-shape-readouts" data-channel-shapes aria-live="polite"></div><p class="playground-insight" data-channel-shape-hint role="status"></p><p class="playground-footnote">图中的前后叠放只表示通道，不是实际空间深度；超过四片时省略绘制。所有配置均启用 bias，dilation=1。每个完整滤波器对应一个输出通道。</p></section>';
  }
  function stack(x,y,count,size,color){
    const shown=Math.min(count,4);let out='';
    for(let c=shown-1;c>=0;c--){const px=x+c*11,py=y-c*10;out+='<rect x="'+px+'" y="'+py+'" width="'+size+'" height="'+size+'" rx="3" fill="#fffefa" stroke="'+color+'" stroke-width="1.8"/>';
      for(let j=1;j<4;j++){out+='<path d="M'+(px+j*size/4)+' '+py+'v'+size+' M'+px+' '+(py+j*size/4)+'h'+size+'" stroke="'+color+'" opacity=".25"/>'}
    }
    return out;
  }
  function shapeSvg(cin,cout,k,g,result){
    return '<svg viewBox="0 0 760 260" role="img" aria-label="输入有 '+cin+' 个通道，每个滤波器连接 '+result.depth+' 个输入通道，'+cout+' 个滤波器生成 '+cout+' 个输出通道">'+text(115,29,'输入 · '+cin+' 个通道',15)+text(379,29,cout+' 个完整滤波器',15)+text(641,29,'输出 · '+cout+' 个通道',15)+stack(55,95,cin,94,'#6689ad')+stack(340,121,result.depth,54,'#9b7cb7')+stack(584,95,cout,94,'#57927b')+'<path d="M203 138H288 M278 131L289 138L278 145 M452 138H535 M525 131L536 138L525 145" fill="none" stroke="#a5a1ad" stroke-width="2"/>'+text(115,226,'HWC：7 × 7 × '+cin)+text(379,211,'每个：'+k+' × '+k+' × '+result.depth)+text(379,233,g===1?'跨全部输入通道':'仅连接同组输入',11)+text(641,226,'HWC：'+result.size+' × '+result.size+' × '+cout)+'</svg>';
  }
  function updateShape(root){
    const field=key=>root.querySelector('[data-channel-setting="'+key+'"]');
    const cin=+field('cin').value,cout=+field('cout').value,k=+field('k').value,s=+field('s').value,p=+field('p').value;
    const groupSelect=field('g'),previous=+groupSelect.value;
    const groups=Array.from({length:cin},(_,i)=>i+1).filter(g=>cin%g===0&&cout%g===0);
    groupSelect.innerHTML=groups.map(g=>'<option value="'+g+'">'+g+'</option>').join('');
    const g=groups.includes(previous)?previous:1;groupSelect.value=String(g);
    const result=shape(cin,cout,k,s,p,g);
    root.querySelector('[data-channel-diagram]').innerHTML=shapeSvg(cin,cout,k,g,result);
    root.querySelector('[data-channel-shapes]').innerHTML='<div><span>输入 → 输出 · NCHW</span><strong>[1,'+cin+',7,7] → [1,'+cout+','+result.size+','+result.size+']</strong></div><div><span>整层权重 · Cout, Cin/groups, Kh, Kw</span><strong>['+cout+','+result.depth+','+k+','+k+']</strong></div><div><span>可学习参数 · 含 '+cout+' 个偏置</span><strong>'+cout+' × '+result.depth+' × '+k+' × '+k+' + '+cout+' = '+result.parameters+'</strong></div><div><span>高度与宽度分别计算</span><strong>⌊(7 + 2×'+p+' − '+k+')/'+s+'⌋ + 1 = '+result.size+'</strong></div>';
    root.querySelector('[data-channel-shape-hint]').textContent=(g===1?'普通卷积：每个输出通道融合全部 '+cin+' 个输入通道。':g===cin?'深度卷积：每个滤波器只读取一个输入通道；这一层不混合不同输入通道。':'分组卷积：分成 '+g+' 组，每个输出只读取本组 '+result.depth+' 个输入通道。')+(k===1?' 1×1 只读取同一空间位置；能否混合通道还取决于 groups。':'')+' out_channels 控制输出通道数，不能从 RGB 的 3 个通道推导出它。';
  }
  function mathMarkup(){
    return '<section class="lesson-playground channel-explorer" data-channel-math data-filter="0" data-row="0" data-col="0" aria-labelledby="channel-math-title"><div class="playground-heading"><div><span class="playground-kicker">互动图解 · 从乘法到输出</span><h3 id="channel-math-title">三层输入，怎样合成一个输出值？</h3><p>每行先算一个通道的贡献，再将三个贡献相加。切换滤波器或点选右侧输出位置。</p></div><button type="button" class="playground-reset" data-channel-math-reset>恢复示例</button></div><div class="channel-filter-switch" role="group" aria-label="选择输出通道"><button type="button" data-channel-filter="0" aria-pressed="true">输出通道 0 · 滤波器 0</button><button type="button" data-channel-filter="1" aria-pressed="false">输出通道 1 · 滤波器 1</button></div><div class="channel-math-layout"><div data-channel-terms></div><div class="channel-output-panel"><strong>输出特征图 · 2×2</strong><p>点一个位置，看它的输入窗口。</p><div class="channel-output-grid" data-channel-output></div><label class="playground-range"><span>当前滤波器偏置 <output data-channel-bias-value>1</output></span><input type="range" min="-3" max="3" step="1" value="1" data-channel-bias aria-label="当前输出通道偏置"></label><div class="channel-mask-controls"><span>参与计算的输入通道</span>'+['R','G','B'].map((name,c)=>'<label><input type="checkbox" checked data-channel-enabled="'+c+'">'+name+'</label>').join('')+'</div></div></div><p class="channel-sum" data-channel-sum role="status" aria-live="polite"></p><p class="playground-footnote">固定教学数值和手工权重，未在浏览器训练模型。此处核为 2×2、groups=1，与上方的 3×3 基础卷积配置不同。取消勾选仅把该输入通道的数值暂时置零，shape 和权重数量保持不变；展示值尚未经过激活函数。</p><p class="playground-footnote">核对依据：<a href="https://docs.pytorch.org/docs/stable/generated/torch.nn.Conv2d.html" target="_blank" rel="noopener noreferrer">PyTorch Conv2d</a> · <a href="https://cs231n.github.io/convolutional-networks/" target="_blank" rel="noopener noreferrer">Stanford CS231n 卷积教材</a></p></section>';
  }
  function matrix(values,row,col,color,highlight){
    return '<div class="channel-matrix" style="--matrix-cols:'+values[0].length+';--channel-color:'+color+'">'+values.flatMap((line,r)=>line.map((value,c)=>'<span class="'+(!highlight||(r>=row&&r<row+2&&c>=col&&c<col+2)?'in-window':'')+'">'+value+'</span>')).join('')+'</div>';
  }
  function updateMath(root){
    const filter=+root.dataset.filter,row=+root.dataset.row,col=+root.dataset.col,bias=+root.querySelector('[data-channel-bias]').value;
    const enabled=[...root.querySelectorAll('[data-channel-enabled]')].map(input=>input.checked);
    const result=compute(filter,row,col,enabled,bias);
    root.querySelectorAll('[data-channel-filter]').forEach(button=>button.setAttribute('aria-pressed',String(+button.dataset.channelFilter===filter)));
    root.querySelector('[data-channel-bias-value]').textContent=String(bias);
    root.querySelector('[data-channel-terms]').innerHTML=result.terms.map((terms,c)=>'<div class="channel-term-row'+(enabled[c]?'':' is-muted')+'"><div><b style="color:'+colors[c]+'">'+['R','G','B'][c]+' 输入 · 3×3</b>'+matrix(inputs[c],row,col,colors[c],true)+'</div><span class="channel-times">×</span><div><b>对应权重 · 2×2</b>'+matrix(weights[filter][c],0,0,colors[c],false)+'</div><div class="channel-contribution"><span>逐元素相乘，再求和</span><code>'+terms.map(([x,w])=>x+'×'+(w<0?'('+w+')':w)).join(' + ')+'</code><strong>'+(enabled[c]?String(result.parts[c]):'0 · 已置零')+'</strong></div></div>').join('');
    let output='';for(let r=0;r<2;r++)for(let c=0;c<2;c++){const v=compute(filter,r,c,enabled,bias).value;output+='<button type="button" data-channel-position="'+r+','+c+'" aria-label="输出位置 '+r+','+c+'，值 '+v+'" aria-pressed="'+String(row===r&&col===c)+'">'+v+'<small>['+r+','+c+']</small></button>'}
    root.querySelector('[data-channel-output]').innerHTML=output;
    root.querySelector('[data-channel-sum]').textContent='Y['+filter+','+row+','+col+'] = '+result.parts.map(v=>v<0?'('+v+')':v).join(' + ')+' + 偏置('+bias+') = '+result.value+'。三个通道贡献合成一个数；完整滑动后形成一张特征图。';
  }
  const previous=window.lessonPlaygrounds;
  window.lessonPlaygrounds={
    render(id,index){return id==='cnn'&&index===1?shapeMarkup():id==='cnn'&&index===4?mathMarkup():previous.render(id,index)},
    initialize(){previous.initialize();document.querySelectorAll('[data-channel-shape]').forEach(updateShape);document.querySelectorAll('[data-channel-math]').forEach(updateMath)}
  };
  document.addEventListener('change',event=>{
    const control=event.target.closest('[data-channel-setting]');if(control){updateShape(control.closest('[data-channel-shape]'));return}
    const enabled=event.target.closest('[data-channel-enabled]');if(enabled)updateMath(enabled.closest('[data-channel-math]'));
  });
  document.addEventListener('input',event=>{const bias=event.target.closest('[data-channel-bias]');if(bias)updateMath(bias.closest('[data-channel-math]'))});
  document.addEventListener('click',event=>{
    const preset=event.target.closest('[data-channel-preset]');
    if(preset){const root=preset.closest('[data-channel-shape]'),values={video:[3,16,3,1,0,1],pointwise:[3,16,1,1,0,1],grouped:[8,16,3,1,0,2],depthwise:[8,8,3,1,0,8]}[preset.dataset.channelPreset];['cin','cout','k','s','p'].forEach((key,i)=>root.querySelector('[data-channel-setting="'+key+'"]').value=String(values[i]));updateShape(root);root.querySelector('[data-channel-setting="g"]').value=String(values[5]);updateShape(root);return}
    const filter=event.target.closest('[data-channel-filter]');
    if(filter){const root=filter.closest('[data-channel-math]');root.dataset.filter=filter.dataset.channelFilter;root.querySelector('[data-channel-bias]').value=filter.dataset.channelFilter==='0'?'1':'-1';updateMath(root);return}
    const position=event.target.closest('[data-channel-position]');
    if(position){const root=position.closest('[data-channel-math]');[root.dataset.row,root.dataset.col]=position.dataset.channelPosition.split(',');updateMath(root);return}
    const reset=event.target.closest('[data-channel-math-reset]');if(reset){const root=reset.closest('[data-channel-math]');root.dataset.filter='0';root.dataset.row='0';root.dataset.col='0';root.querySelector('[data-channel-bias]').value='1';root.querySelectorAll('[data-channel-enabled]').forEach(input=>input.checked=true);updateMath(root)}
  });
  window.channelConvolution={shape,compute};
})();
