/* Code-native diagrams: all values are shape derivations, not sampled activations. */
(() => {
  const escape=v=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const number=n=>n.toLocaleString('en-US');
  const out=(n,k,s,p,d=1)=>Math.floor((n+2*p-d*(k-1)-1)/s)+1;
  const tensor=(c,h,w,b=1)=>`[${b}, ${c}, ${h}, ${w}]`;
  const tabs=(attr,items,active)=>`<div class="yd-tabs" role="group">${items.map((v,i)=>`<button type="button" ${attr}="${i}" aria-pressed="${i===active}">${escape(v)}</button>`).join('')}</div>`;
  const box=(label,value,accent='')=>`<div class="yd-value ${accent}"><span>${label}</span><strong>${value}</strong></div>`;
  const table=(headers,rows)=>`<div class="yd-table" tabindex="0" aria-label="可横向滚动的尺寸对照表"><table><thead><tr>${headers.map(h=>`<th>${h}</th>`).join('')}</tr></thead><tbody>${rows.map(r=>`<tr>${r.map(v=>`<td>${v}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
  const note='静态形状推导与人工算例，不读取真实模型激活，不执行训练。';
  const panel=(type,title,description,controls)=>`<section class="yd-workshop" data-yd-type="${type}"><span class="yd-eyebrow">一步一步 · 看懂计算</span><h3>${title}</h3><p>${description}</p>${controls}<div data-yd-output aria-live="polite"></div><p class="yd-footnote">${note}</p></section>`;
  function convMarkup(){return panel('conv','一个窗口怎样走出整张特征图','先选输入高宽，再拖动输出位置。紫框表示这一维卷积窗口覆盖的输入范围，灰段为填充；刻度按真实长度缩放。',
    '<div class="yd-controls"><label>局部输入高×宽<select data-yd-input><option value="640,640" selected>640×640</option><option value="640,480">640×480</option><option value="641,481">641×481（只用于局部卷积，不保证整网连线）</option></select></label><label>卷积设置<select data-yd-conv><option value="6,2,2,64">入口：k6 / s2 / p2 / 输出64通道</option><option value="3,2,1,128">对照：k3 / s2 / p1 / 输出128通道</option><option value="1,1,0,64">对照：k1 / s1 / p0 / 输出64通道</option></select></label><label>观察轴<select data-yd-axis><option value="0">高度H</option><option value="1">宽度W</option></select></label></div><label class="yd-slider">输出位置索引 <output data-yd-position-label>0</output><input type="range" min="0" max="319" step="1" value="0" data-yd-position aria-label="卷积输出位置索引"></label>');}
  function updateConv(root){
    const [h,w]=root.querySelector('[data-yd-input]').value.split(',').map(Number),[k,s,p,c]=root.querySelector('[data-yd-conv]').value.split(',').map(Number),axis=Number(root.querySelector('[data-yd-axis]').value),n=[h,w][axis],o=out(n,k,s,p),slider=root.querySelector('[data-yd-position]');
    slider.max=o-1;slider.value=Math.min(Number(slider.value),o-1);const j=Number(slider.value),start=j*s-p,end=start+k-1,total=n+2*p,scale=560/total,x=40+(start+p)*scale;
    root.querySelector('[data-yd-position-label]').textContent=`${j} / ${o-1}`;
    root.querySelector('[data-yd-output]').innerHTML=`<div class="yd-values">${box('输入 B,C,H,W',tensor(3,h,w))}${box('输出 B,C,H,W',tensor(c,out(h,k,s,p),out(w,k,s,p)),'yd-highlight')}</div><svg viewBox="0 0 640 155" role="img" aria-label="${axis?'宽度':'高度'}轴卷积窗口从${start}到${end}，输出索引${j}"><rect x="40" y="45" width="560" height="36" rx="4" fill="#dedbd4"/><rect x="${40+p*scale}" y="45" width="${n*scale}" height="36" fill="#d6e6df"/><rect x="${x}" y="36" width="${k*scale}" height="54" fill="#7860b5" fill-opacity=".5" stroke="#684fa6"/><text x="40" y="25">输入${axis?'宽W':'高H'}：${n}；两侧各补${p}</text><text x="40" y="115">窗口坐标 ${start}…${end}；步长 ${s}</text><text x="40" y="143">起点 = j×s−p = ${j}×${s}−${p} = ${start}；负坐标或超出${n-1}部分取填充值0</text></svg><div class="yd-explanation"><p><b>高度：</b>floor((${h}+2×${p}−${k})/${s})+1 = <b>${out(h,k,s,p)}</b></p><p><b>宽度：</b>floor((${w}+2×${p}−${k})/${s})+1 = <b>${out(w,k,s,p)}</b></p><p>d=1，输入通道固定3；输出有${c}组跨全部3通道的滤波器，所以C_out=${c}。滑块改变窗口位置，不改变权重或输出形状。</p></div>`;
  }
  const layers=[['Conv',64,6,2,2],['Conv',128,3,2,1],['C3',128],['Conv',256,3,2,1],['C3',256],['Conv',512,3,2,1],['C3',512],['Conv',1024,3,2,1],['C3',1024],['SPPF',1024]];
  function ledgerMarkup(){return panel('ledger','同一张图片的尺寸账本','按层号选取节点，同时核对输入、运算和输出。先预测输出，再选择层号核对。切换矩形输入只改变高宽；通道来自当前YOLOv5l配置。','<label>合法整网输入<select data-yd-ledger-size><option value="640,640" selected>640×640</option><option value="640,480">640×480</option><option value="320,320">320×320</option></select></label>'+tabs('data-yd-layer',layers.map((r,i)=>`${i} · ${r[0]}`),0));}
  function updateLedger(root){
    const [height,width]=root.querySelector('select').value.split(',').map(Number),selected=Number(root.dataset.layer||0);let h=height,w=width,c=3;
    const rows=layers.map((l,i)=>{const input=tensor(c,h,w),[type,c2,k,s,p]=l;if(type==='Conv'){h=out(h,k,s,p);w=out(w,k,s,p);}c=c2;return {i,type,k,s,p,input,output:tensor(c,h,w),c,h,w};});const r=rows[selected];
    root.querySelector('[data-yd-output]').innerHTML=`<div class="yd-values">${box('层'+selected+' 输入',r.input)}${box('运算',r.type==='Conv'?`k${r.k} / s${r.s} / p${r.p}`:r.type)}${box('输出',r.output,'yd-highlight')}</div><p>${r.type==='Conv'?`高：floor((${selected?rows[selected-1].h:height}+2×${r.p}−${r.k})/${r.s})+1=${r.h}；宽同理得到${r.w}。${r.s===2?'空间下采样；':'空间保持；'}输出滤波器数决定C=${r.c}。`:`本配置${r.type}保持H=${r.h}、W=${r.w}。${r.type==='C3'?'内部卷积与分支继续提取、融合特征；重复次数不等于空间反复减半。':'连续池化保持尺寸，四路通道先拼接，再由卷积融合。'}`}</p><div class="yd-ledger-flow" role="img" aria-label="五次下采样尺寸链">${rows.filter(x=>[0,1,3,5,7].includes(x.i)).map(x=>`<div class="${x.i===selected?'is-current':''}"><span>层${x.i} · 步长2</span><b>${x.h}×${x.w}</b><small>${x.c}通道</small></div>`).join('<span aria-hidden="true">→</span>')}</div>${table(['层','模块','输出 [B,C,H,W]','本步改变'],rows.map(x=>[x.i,x.type,x.output,x.type==='Conv'?'空间尺寸；按配置设置C':'保持空间，内部处理特征']))}<p class="yd-footnote">层4和层6的特征会保留给FPN，不能只保留最后的层9。这里只展示Backbone；完整0～24层浏览器在模型YAML课。</p>`;
    root.querySelectorAll('[data-yd-layer]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.ydLayer)===selected)));
  }
  const routes=[
    {label:'20→40 · P4融合',source:9,c1:1024,h:20,project:10,mid:512,move:11,side:6,sc:512,cat:12,final:13,fc:512,steps:['1×1降通道','最近邻上采样×2','读取层6并Concat','C3融合']},
    {label:'40→80 · P3融合',source:13,c1:512,h:40,project:14,mid:256,move:15,side:4,sc:256,cat:16,final:17,fc:256,steps:['1×1降通道','最近邻上采样×2','读取层4并Concat','C3融合']},
    {label:'80→40 · P4聚合',source:17,c1:256,h:80,mid:256,move:18,side:14,sc:256,cat:19,final:20,fc:512,steps:['读取层17','步长2卷积','读取层14并Concat','C3融合']},
    {label:'40→20 · P5聚合',source:20,c1:512,h:40,mid:512,move:21,side:10,sc:512,cat:22,final:23,fc:1024,steps:['读取层20','步长2卷积','读取层10并Concat','C3融合']}
  ];
  function neckMarkup(pan){return panel(pan?'pan':'fpn',pan?'PAN：让融合后的信息再向粗尺度走':'FPN：两路信息在哪里会合','选择一条路径和一步运算。高亮节点对应当前步骤；每个Concat都明确列出两路来源。',tabs('data-yd-route',(pan?routes.slice(2):routes.slice(0,2)).map(r=>r.label),0)+'<div data-yd-neck-steps></div><label class="yd-check"><input type="checkbox" data-yd-wrong>试试错误连线：横向特征高宽不匹配</label>');}
  function updateNeck(root){
    const pan=root.dataset.ydType==='pan',route=Number(root.dataset.route||0),r=routes[route+(pan?2:0)],step=Number(root.dataset.step||0),size=pan?r.h/2:r.h*2,wrong=root.querySelector('[data-yd-wrong]').checked,sideH=wrong?size*2:size;
    root.querySelector('[data-yd-neck-steps]').innerHTML=tabs('data-yd-step',r.steps,step);
    const texts=[`${pan?'读取层'+r.source:'层'+r.project+'用1×1 Conv'}：${tensor(r.c1,r.h,r.h)}${pan?'，保留给后面的步长2卷积。':' → '+tensor(r.mid,r.h,r.h)+'。高宽不变，通道压缩。'}`,
      `层${r.move}${pan?'步长2卷积下采样':'最近邻上采样×2'}：${tensor(r.mid,r.h,r.h)} → ${tensor(r.mid,size,size)}。${pan?'这一步有可学习权重。':'复制特征值，不增加可学习参数。'}`,
      wrong?`高宽${size}与${sideH}不一致，禁止Concat。检查from和缩放倍率；修正连线，而非用view强改。`:`层${r.cat}：来源层${r.move}与层${r.side}，高宽都是${size}，C=${r.mid}+${r.sc}=${r.mid+r.sc}，输出${tensor(r.mid+r.sc,size,size)}。`,
      wrong?'上一步拼接失败，C3没有合法输入。取消错误连线后再观察。':`层${r.final} C3：${tensor(r.mid+r.sc,size,size)} → ${tensor(r.fc,size,size)}，在保留空间网格的同时学习两路信息的组合。`];
    const svgBox=(x,y,width,label,value,on)=>`<g><rect x="${x}" y="${y}" width="${width}" height="65" rx="8" fill="${on?'#ebe4fb':'#f8f7f3'}" stroke="${on?'#7860b5':'#d3d0c8'}" stroke-width="${on?2:1}"/><text x="${x+10}" y="${y+24}">${label}</text><text x="${x+10}" y="${y+47}" class="yd-svg-number">${value}</text></g>`;
    root.querySelector('[data-yd-output]').innerHTML=`<p class="yd-state">固定YOLOv5l · 输入640×640 · B=1 · 标准三尺度结构</p><svg viewBox="0 0 660 440" role="img" aria-label="${r.label}，${r.steps[step]}${wrong?'，错误连线':''}"><path d="M165 85V125M165 190V257H200M495 85V212H625V257H590M395 290V330" fill="none" stroke="${wrong&&step>=2?'#ad574c':'#8d80aa'}" stroke-width="3"/><path d="M160 115l5 10 5-10M190 252l10 5-10 5M600 252l-10 5 10 5M390 320l5 10 5-10" fill="none" stroke="#8d80aa" stroke-width="2"/>${svgBox(35,20,260,`层${pan?r.source:r.project} · ${pan?'已融合特征':'1×1降通道'}`,`${pan?r.c1:r.c1+'→'+r.mid} · ${r.h}×${r.h}`,step===0)}${svgBox(365,20,260,`横向来源 · 层${r.side}`,`${r.sc}×${sideH}×${sideH}`,step===2)}${svgBox(35,125,300,`层${r.move} · ${pan?'步长2卷积':'最近邻上采样×2'}`,`${r.mid}×${size}×${size}`,step===1)}${svgBox(200,225,390,`层${r.cat} · Concat(dim=1)`,wrong?'高宽不匹配，无法拼接':`${r.mid+r.sc}×${size}×${size}（${r.mid}+${r.sc}通道）`,step===2)}${svgBox(200,330,390,`层${r.final} · C3融合`,wrong?'无合法输入':`${r.fc}×${size}×${size}`,step===3)}<text x="35" y="423">图中省略B=1；线是前向特征流。</text></svg><div class="yd-explanation ${wrong?'yd-error':''}"><b>${r.steps[step]}</b><p>${texts[step]}</p></div>`;
    root.querySelectorAll('[data-yd-route]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.ydRoute)===route)));
  }
  function modificationMarkup(p2=false){return panel(p2?'p2':'modify',p2?'三尺度与四尺度：改动到底传到哪里':'改类别数：哪些数字改变，哪些保持',p2?'对照官方P2路径。模型输入和字段约定写在图旁，候选数由当前网格逐项相加。':'使用同一个YOLOv5l主干与融合网络。切换类别数，比较输出通道、单候选字段与候选总数。',
    `<div class="yd-controls"><label>输入高×宽<select data-yd-model-size><option value="640,640">640×640</option><option value="640,480">640×480</option><option value="320,320">320×320</option></select></label><label>任务类别 nc<select data-yd-classes><option value="2" selected>2 · smoke / fire</option><option value="1">1 · 单类</option><option value="80">80 · 标准对照</option></select></label><label>检测尺度<select data-yd-scales><option value="3" ${!p2?'selected':''}>标准 P3/P4/P5</option><option value="4" ${p2?'selected':''}>P2/P3/P4/P5</option></select></label></div>`);}
  function updateModification(root){
    const [h,w]=root.querySelector('[data-yd-model-size]').value.split(',').map(Number),nc=Number(root.querySelector('[data-yd-classes]').value),four=root.querySelector('[data-yd-scales]').value==='4',strides=four?[4,8,16,32]:[8,16,32],channels=four?[128,256,512,1024]:[256,512,1024],ids=four?[21,24,27,30]:[17,20,23],d=nc+5,co=3*d,N=strides.reduce((n,s)=>n+3*(h/s)*(w/s),0),params=channels.reduce((n,c)=>n+co*(c+1),0),oldParams=channels.reduce((n,c)=>n+255*(c+1),0);
    const branch=strides.map((s,i)=>({name:'P'+Math.log2(s),id:ids[i],c:channels[i],s,h:h/s,w:w/s,n:3*h/s*w/s}));
    root.querySelector('[data-yd-output]').innerHTML=`<p class="yd-state">当前：YOLOv5l ${four?'官方P2变体':'标准P5结构'} · B=1 · 输入${h}×${w} · nc=${nc} · 每位置3个Anchor</p><div class="yd-values">${box('每个候选 D = 4+1+nc',d)}${box('输出通道 / 尺度 = 3D',co,'yd-highlight')}${box('候选总数 N',number(N))}${box('输出卷积参数合计',number(params))}</div><div class="yd-branch-graph" role="img" aria-label="当前检测尺度与输出形状">${branch.map(b=>`<div><b>${b.name} · 层${b.id}</b><span>特征 ${b.c}×${b.h}×${b.w}</span><span aria-hidden="true">↓</span><span>1×1 Conv · ${b.c}→${co}</span><span aria-hidden="true">↓</span><strong>[1,3,${b.h},${b.w},${d}]</strong><small>${number(b.n)}个候选</small></div>`).join('')}</div>${table(['只比较类别数','80类对照','当前'+nc+'类'],[['每候选字段','85',d],['每尺度输出通道','255',co],['候选数（固定当前结构/输入）',number(N),number(N)],['解码后形状',`[1,${N},85]`,`[1,${N},${d}]`],['输出卷积参数（含偏置）',number(oldParams),number(params)]])}<div class="yd-explanation"><p><b>逐项计算：</b>N = 3×(${branch.map(b=>b.h+'×'+b.w).join(' + ')}) = ${number(N)}。单候选[tx,ty,tw,th,to,${nc===2?'smoke,fire':nc+'个类别字段'}]，输出卷积参数为各分支C_out×(C_in+1)之和。</p><p>单类时仍保留一个类别字段，当前YOLOv5的ComputeLoss会跳过nc=1的分类损失；并非删去该输出通道。</p></div>${four?`<h4>P2增加的连线与返回路径</h4><div class="yd-p2-path"><p>层17 · 256×${h/8}×${w/8} → 层18 · 1×1降为128通道 → 层19 · 上采样×2</p><p>层19 与 Backbone层2 → 层20 Concat → 层21 C3 · 128×${h/4}×${w/4} → P2</p><p>层21 → 层22下采样，与层18拼接 → 层24 P3；层24 → 层25下采样，与层14拼接 → 层27 P4；层27 → 层28下采样，与层10拼接 → 层30 P5。</p></div><p><a href="assets/yolov5l/yolov5-p2.yaml" download>下载P2对照配置 ↓</a> · <a href="https://github.com/ultralytics/yolov5/blob/v7.0/models/hub/yolov5-p2.yaml" target="_blank" rel="noopener">官方固定版本 ↗</a></p><p class="yd-footnote">配置中的anchors:3需要真实数据适配。这里仅计算形状，不将占位Anchor用于真实预测。</p>`:''}`;
  }
  function branchMarkup(){return panel('branches','分支怎么拆，候选字段怎么装回来','比较标准耦合头与本课保留Anchor和物体性的教学解耦设计。数字是识别字段归属的人工ID，不是真实预测。',tabs('data-yd-branch-mode',['标准耦合头','教学解耦头'],0)+'<label class="yd-check"><input type="checkbox" data-yd-bad-pack>显示错误：按任务直接拼通道再view</label>');}
  function updateBranches(root){
    const mode=Number(root.dataset.branchMode||0),bad=root.querySelector('[data-yd-bad-pack]').checked&&mode===1,boxValues=Array.from({length:3},(_,a)=>Array.from({length:4},(_,k)=>100*a+k)).flat(),objValues=[4,104,204],clsValues=[5,6,105,106,205,206],flat=[...boxValues,...objValues,...clsValues],correct=Array.from({length:3},(_,a)=>Array.from({length:7},(_,k)=>100*a+k)),packed=bad?correct.map((_,a)=>flat.slice(a*7,a*7+7)):correct;
    root.querySelector('[data-yd-output]').innerHTML=`<p class="yd-state">P3 · B=1 · C_in=256 · H=W=80 · A=3 · nc=2 · D=7</p><div class="yd-task-graph" role="img" aria-label="${mode?'教学解耦':'标准耦合'}预测结构"><div class="yd-feature">共享输入特征<br><b>[1,256,80,80]</b></div><span aria-hidden="true">↓</span>${mode?'<div class="yd-task-lanes"><div>框特征分支<br>3×3 Conv → SiLU<br>框12通道 · 物体性3通道</div><div>分类特征分支<br>3×3 Conv → SiLU<br>分类6通道</div></div><p>分别view为 [B,A,4,H,W]、[B,A,1,H,W]、[B,A,2,H,W]</p><div class="yd-feature">沿字段轴dim=2拼接 → [B,A,7,H,W]</div>':'<div class="yd-feature">同一个1×1输出卷积<br>256→21通道</div><p>直接按每Anchor连续7个字段分组 → [B,A,7,H,W]</p>'}<span aria-hidden="true">↓ permute(0,1,3,4,2)</span><div class="yd-feature">原始候选 [1,3,80,80,7]</div></div>${table(['Anchor索引','该位置的7个字段（人工ID）'],packed.map((r,i)=>[i,r.join(', ')]))}<div class="yd-explanation ${bad?'yd-error':''}"><b>${bad?'字段错位：元素总数相同也会装错':'每个Anchor的字段必须完整对齐'}</b><p>${bad?'错误序列先放全部框字段，再放物体性和分类。Anchor 0拿到0,1,2,3之后，物体性位置却被填成100（另一个Anchor的框字段），损失与解码将读错语义。':'人工ID的百位区分Anchor，末两位0～3为框、4为物体性、5～6为类别。标准输出与正确重组后都应让同一行属于同一个Anchor。'}</p><p>只保持外部形状不保证系统兼容；新模块还需适配解析器、初始化、ComputeLoss、解码和导出。此图不声称改造后精度提升。</p></div>`;
    root.querySelectorAll('[data-yd-branch-mode]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.ydBranchMode)===mode)));
  }
  function update(root){
    const type=root.dataset.ydType;
    if(type==='conv')updateConv(root);else if(type==='ledger')updateLedger(root);else if(type==='fpn'||type==='pan')updateNeck(root);else if(type==='modify'||type==='p2')updateModification(root);else if(type==='branches')updateBranches(root);
    root.querySelectorAll('[data-yd-output] > svg').forEach(svg=>{
      const scroll=document.createElement('div');scroll.className='yd-svg-scroll';scroll.tabIndex=0;scroll.setAttribute('aria-label','可横向滚动的计算图');svg.replaceWith(scroll);scroll.append(svg);
    });
    window.renderLessonMath?.(root.querySelector('[data-yd-output]'));
  }
  const renders={
    'yd-conv-shapes':convMarkup,'yd-backbone-ledger':ledgerMarkup,
    'yd-fpn-flow':()=>neckMarkup(false),'yd-pan-flow':()=>neckMarkup(true),
    'yd-head-change-classes':()=>modificationMarkup(false),
    'yd-head-p2':()=>modificationMarkup(true),'yd-head-decoupled':branchMarkup
  };
  const previous=window.lessonPlaygrounds||{};
  window.lessonPlaygrounds={...previous,render(id,key,legacy){return (previous.render?.(id,key,legacy)||'')+(renders[key]?.()||'');},initialize(){previous.initialize?.();document.querySelectorAll('[data-yd-type]').forEach(update);}};
  document.addEventListener('click',event=>{
    const button=event.target.closest('button'),root=button?.closest('[data-yd-type]');if(!root)return;
    if(button.dataset.ydLayer!==undefined)root.dataset.layer=button.dataset.ydLayer;
    else if(button.dataset.ydRoute!==undefined){root.dataset.route=button.dataset.ydRoute;root.dataset.step='0';}
    else if(button.dataset.ydStep!==undefined)root.dataset.step=button.dataset.ydStep;
    else if(button.dataset.ydBranchMode!==undefined)root.dataset.branchMode=button.dataset.ydBranchMode;
    else return;
    update(root);
    // Neck step buttons are recreated: restore keyboard focus to the chosen step.
    if(button.dataset.ydStep!==undefined)root.querySelector(`[data-yd-step="${button.dataset.ydStep}"]`)?.focus({preventScroll:true});
  });
  document.addEventListener('change',event=>{const root=event.target.closest('[data-yd-type]');if(root&&event.target.matches('select,input[type="checkbox"]'))update(root);});
  document.addEventListener('input',event=>{const root=event.target.closest('[data-yd-type]');if(root&&event.target.matches('[data-yd-position]'))update(root);});
})();
