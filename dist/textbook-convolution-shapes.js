/* CNN 卷积输出尺寸互动：在 H/W/C 章节中演示 kernel、stride、padding 与 dilation。 */
(()=>{
  const lesson=lessons.find(item=>item.id==="cnn");
  if(!lesson||!window.lessonPlaygrounds||!lesson.sections[1])return;

  lesson.goals.push("根据 kernel、stride、padding 与 dilation 计算卷积输出的高度和宽度。");
  lesson.sections[1].paragraphs.push(
    "卷积输出的高度、宽度要分开计算。对一个维度，通用公式是 out = floor((in + 2p − d×(k−1) − 1) / s + 1)。其中 p 是每一侧补入的像素数，所以 p=1 会让总长度增加 2；d 是 dilation（膨胀率）。也可以先算有效卷积核跨度 k_eff = d×(k−1)+1，再写成 floor((in + 2p − k_eff) / s)+1。二维时分别代入 H、W 以及各自的核、步幅和填充值。",
    "例如 7×7 输入用 3×3 核、dilation=1、stride=1、padding=0，会得到 5×5；每一边 padding=1 后得到 7×7；stride=2、padding=1 时得到 4×4。若除不尽，floor 向下取整：8×8 输入、3×3 核、stride=2、padding=0 仍是 3×3，末尾不足以放下下一整个窗口的余量不会再生成一格。",
    "stride 是相邻两个卷积窗口起点之间移动的像素数。stride=2 不等于窗口一定互不重叠：3×3 窗口每次移动 2 格时仍重叠 1 格。padding=1 是在每一侧补一个 0，能让边界附近的输入参与更多输出窗口，也可在特定设置下保持空间尺寸；它不会复制或还原图像边缘，补零还会影响边界处的数值。",
    "dilation 会拉开核内采样点：3×3 核、dilation=2 的有效跨度是 5×5，但实际仍只有 9 个核权重。两层 stride=1 的 3×3 卷积可以让后一层的感受野覆盖 5×5 区域；这说的是覆盖范围相同，不代表它和单个 5×5 卷积的数值行为完全等价。这里讨论的是卷积层；通道数由 out_channels 决定，不参与 H、W 的尺寸公式。"
  );
  lesson.sections[1].exercise={
    q:"输入为 8×8，卷积核 3×3，stride=2、padding=0、dilation=1。输出空间尺寸是多少？",
    options:["4×4","3×3","5×5"],
    answer:1,
    why:"单维为 floor((8−3)/2)+1=floor(2.5)+1=3，所以输出是 3×3。floor 会舍去无法再放下完整窗口的尾部余量。"
  };
  lesson.keypoints.push(
    "卷积高度、宽度分别计算；输出尺寸由 kernel、stride、padding、dilation 决定，通道数另由 out_channels 控制。",
    "通用公式包含向下取整；stride=2 时窗口仍可能重叠，padding=1 也不保证所有设置下都保持尺寸。"
  );
  lesson.sources=[...(lesson.sources||[]),{url:"https://docs.pytorch.org/docs/stable/generated/torch.nn.Conv2d.html",label:"PyTorch Conv2d：输出尺寸、stride、padding 与 dilation"}];

  const baseRender=window.lessonPlaygrounds.render;
  const baseInitialize=window.lessonPlaygrounds.initialize;
  const esc=value=>String(value).replace(/[&<>"']/g,char=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char]));
  const selectOptions=(values,current)=>values.map(value=>'<option value="'+value+'"'+(value===current?" selected":"")+'>'+value+"</option>").join("");

  function shapeMarkup(){
    return [
      '<section class="lesson-playground conv-shape-playground" data-conv-shape data-h="7" data-w="7" data-k="3" data-s="1" data-p="0" data-d="1" data-r="2" data-c="2" aria-labelledby="conv-shape-title">',
      '<div class="conv-shape-heading"><div><span class="conv-shape-kicker">INTERACTIVE · 卷积尺寸</span><h3 id="conv-shape-title">调一调参数，看输出特征图怎样变化</h3><p>先改一个参数，再点右侧输出格。左图会定位对应的输入窗口，公式同步给出 Hout 与 Wout。</p></div><button type="button" class="conv-shape-reset" data-conv-shape-reset>恢复示例</button></div>',
      '<div class="conv-shape-controls" role="group" aria-label="卷积尺寸参数">',
      '<label><span>输入高度 H</span><select data-conv-param="h" aria-label="输入高度 H">'+selectOptions([5,6,7,8,9],7)+'</select></label>',
      '<label><span>输入宽度 W</span><select data-conv-param="w" aria-label="输入宽度 W">'+selectOptions([5,6,7,8,9],7)+'</select></label>',
      '<label><span>卷积核 K × K</span><select data-conv-param="k" aria-label="卷积核大小 K">'+selectOptions([2,3,5],3)+'</select></label>',
      '<label><span>步幅 stride</span><select data-conv-param="s" aria-label="卷积步幅 stride">'+selectOptions([1,2,3],1)+'</select></label>',
      '<label><span>每边填充 p</span><select data-conv-param="p" aria-label="每一边的填充量 padding">'+selectOptions([0,1,2],0)+'</select></label>',
      '<label><span>膨胀率 dilation</span><select data-conv-param="d" aria-label="卷积膨胀率 dilation">'+selectOptions([1,2],1)+'</select></label>',
      '</div>',
      '<div class="conv-shape-equations" data-conv-shape-equations></div>',
      '<div class="conv-shape-visuals"><figure class="conv-shape-card"><figcaption><strong>输入网格与卷积窗口</strong><span data-conv-input-caption></span></figcaption><div class="conv-shape-svg-wrap" data-conv-input-grid></div><p class="conv-shape-legend"><span class="legend-input"></span>输入像素 <span class="legend-pad"></span>补入的 0 <span class="legend-kernel"></span>卷积核采样点</p></figure>',
      '<figure class="conv-shape-card"><figcaption><strong>输出特征图位置</strong><span data-conv-output-caption></span></figcaption><div class="conv-shape-output-grid" data-conv-output-grid role="grid" aria-label="输出特征图"></div><p class="conv-shape-selection" data-conv-selection role="status" aria-live="polite"></p></figure></div>',
      '<div class="conv-shape-takeaway"><strong data-conv-shape-summary></strong><p>淡紫色边框表示每边补入的零；紫色框表示有效核跨度，蓝紫小格表示实际采样位置。输入格中的数字只作图示，不参与尺寸计算。</p></div>',
      '<div class="conv-shape-rules"><div><b>K</b><span>核越大，有效覆盖范围通常越大；不填充时输出更小。</span></div><div><b>S</b><span>窗口起点每次移动 S 格；步幅大通常下采样更快。</span></div><div><b>P</b><span>每边各补 P 格，所以输入总长度增加 2P。</span></div><div><b>D</b><span>采样点间隔变大，有效核跨度扩大，权重数量不变。</span></div></div>',
      '</section>'
    ].join("");
  }

  window.lessonPlaygrounds.render=function(lessonId,sectionIndex){
    const markup=baseRender(lessonId,sectionIndex);
    return lessonId==="cnn"&&sectionIndex===1?markup+shapeMarkup():markup;
  };
  window.lessonPlaygrounds.initialize=function(){
    baseInitialize();
    document.querySelectorAll("[data-conv-shape]").forEach(updateShape);
  };

  function formula(n,k,s,p,d){
    const raw=Math.floor((n+2*p-d*(k-1)-1)/s+1);
    return {raw,display:raw>0?String(raw):"无有效位置",text:"floor(("+n+"+2×"+p+"−"+d+"×("+k+"−1)−1)/"+s+"+1) = "+raw};
  }
  function drawInput(root,h,w,k,s,p,d,row,col,oh,ow){
    const svg=root.querySelector("[data-conv-input-grid]");
    if(oh<1||ow<1){svg.innerHTML='<div class="conv-shape-empty">当前设置下，没有能够完整放入输入网格的卷积窗口。</div>';return}
    const eff=d*(k-1)+1,ph=h+2*p,pw=w+2*p,cell=31,origin=21,svgW=origin*2+pw*cell,svgH=origin*2+ph*cell,startR=row*s,startC=col*s;
    let content='<svg viewBox="0 0 '+svgW+" "+svgH+'" role="img" aria-label="补零后的 '+ph+" 行 "+pw+" 列网格；所选输出位置对应的有效卷积核跨度为 "+eff+" 乘 "+eff+'">';
    for(let r=0;r<ph;r++)for(let c=0;c<pw;c++){
      const inputR=r-p,inputC=c-p,isPad=inputR<0||inputR>=h||inputC<0||inputC>=w;
      const value=(Math.abs(inputR*7+inputC*3)+inputR+inputC+20)%10;
      const x=origin+c*cell,y=origin+r*cell;
      content+='<rect x="'+x+'" y="'+y+'" width="'+(cell-2)+'" height="'+(cell-2)+'" rx="3" fill="'+(isPad?"#f0ebf6":"#f5f3ee")+'" stroke="'+(isPad?"#c9bddb":"#e3e0d8")+'" stroke-width="1"/>';
      content+='<text x="'+(x+(cell-2)/2)+'" y="'+(y+19)+'" text-anchor="middle" font-size="10" font-weight="650" fill="'+(isPad?"#74658e":"#727a81")+'">'+(isPad?"0":value)+'</text>';
    }
    const wx=origin+startC*cell,wy=origin+startR*cell,wh=eff*cell-2;
    content+='<rect x="'+wx+'" y="'+wy+'" width="'+wh+'" height="'+wh+'" rx="5" fill="#7963a2" fill-opacity=".08" stroke="#76619d" stroke-width="2" stroke-dasharray="5 3"/>';
    for(let kr=0;kr<k;kr++)for(let kc=0;kc<k;kc++){
      const x=origin+(startC+kc*d)*cell,y=origin+(startR+kr*d)*cell;
      content+='<rect x="'+(x+2)+'" y="'+(y+2)+'" width="'+(cell-6)+'" height="'+(cell-6)+'" rx="3" fill="#b8a7d4" fill-opacity=".75" stroke="#63528e" stroke-width="1.5"/>';
    }
    content+="</svg>";
    svg.innerHTML=content;
    root.querySelector("[data-conv-input-caption]").textContent=h+" × "+w+" 输入；补零后 "+ph+" × "+pw;
  }
  function updateShape(root){
    const h=Number(root.dataset.h)||7,w=Number(root.dataset.w)||7,k=Number(root.dataset.k)||3,s=Number(root.dataset.s)||1,p=Number(root.dataset.p)||0,d=Number(root.dataset.d)||1;
    root.querySelectorAll("[data-conv-param]").forEach(select=>{select.value=String(root.dataset[select.dataset.convParam])});
    const eff=d*(k-1)+1,hf=formula(h,k,s,p,d),wf=formula(w,k,s,p,d),oh=Math.max(0,hf.raw),ow=Math.max(0,wf.raw);
    root.querySelector("[data-conv-shape-equations]").innerHTML=
      '<div class="conv-shape-equation"><span>高度 Hout</span><code>'+esc(hf.text)+'</code><strong>'+esc(hf.display)+'</strong></div>'+
      '<div class="conv-shape-equation"><span>宽度 Wout</span><code>'+esc(wf.text)+'</code><strong>'+esc(wf.display)+'</strong></div>'+
      '<div class="conv-shape-effective"><span>有效核跨度</span><b>d×(K−1)+1 = '+eff+'</b><small>输出通道数不改变这里的 H、W 计算。</small></div>';
    root.querySelector("[data-conv-output-caption]").textContent=oh&&ow?oh+" × "+ow+" 个位置":"无有效输出位置";
    const grid=root.querySelector("[data-conv-output-grid]");
    if(!oh||!ow){
      grid.innerHTML='<div class="conv-shape-empty">核的有效跨度超过补零后的输入尺寸，请调小 K 或 dilation，或增加 padding。</div>';
      root.querySelector("[data-conv-selection]").textContent="这个参数组合无法产生有效的输出窗口。";
      root.querySelector("[data-conv-shape-summary]").textContent="当前没有完整可放置的卷积窗口。";
      root.querySelector("[data-conv-input-grid]").innerHTML='<div class="conv-shape-empty">先调到能容纳卷积核的设置，再查看窗口覆盖。</div>';
      root.querySelector("[data-conv-input-caption]").textContent=h+" × "+w+" 输入";
      return;
    }
    let row=Math.max(0,Math.min(oh-1,Number(root.dataset.r)||0)),col=Math.max(0,Math.min(ow-1,Number(root.dataset.c)||0));
    root.dataset.r=String(row);root.dataset.c=String(col);
    grid.style.gridTemplateColumns="repeat("+ow+", minmax(28px, 1fr))";
    grid.innerHTML=Array.from({length:oh*ow},(_,i)=>{
      const r=Math.floor(i/ow),c=i%ow,active=r===row&&c===col;
      return '<button type="button" role="gridcell" class="conv-shape-position'+(active?" is-selected":"")+'" data-conv-output-position="'+r+","+c+'" aria-label="选择输出第 '+(r+1)+" 行第 "+(c+1)+" 列"+(active?"，当前选中":"")+'" aria-pressed="'+String(active)+'"><span>'+(r+1)+","+(c+1)+"</span></button>";
    }).join("");
    drawInput(root,h,w,k,s,p,d,row,col,oh,ow);
    const startR=row*s-p,startC=col*s-p;
    root.querySelector("[data-conv-selection]").textContent="选中输出位置 ("+(row+1)+","+(col+1)+")：卷积窗口左上角对应未填充输入坐标 ("+startR+","+startC+")（从 0 开始）；超出输入边界的采样点使用填充值 0。";
    root.querySelector("[data-conv-shape-summary]").textContent="输入 "+h+"×"+w+" → 有效核 "+eff+"×"+eff+"，每次移动 "+s+" 格 → 输出 "+oh+"×"+ow+"。";
  }

  document.addEventListener("change",event=>{
    const select=event.target.closest("[data-conv-param]");
    if(!select)return;
    const root=select.closest("[data-conv-shape]");
    root.dataset[select.dataset.convParam]=select.value;
    updateShape(root);
  });
  document.addEventListener("click",event=>{
    const reset=event.target.closest("[data-conv-shape-reset]");
    if(reset){
      const root=reset.closest("[data-conv-shape]");
      Object.assign(root.dataset,{h:"7",w:"7",k:"3",s:"1",p:"0",d:"1",r:"2",c:"2"});
      updateShape(root);
      return;
    }
    const position=event.target.closest("[data-conv-output-position]");
    if(!position)return;
    const root=position.closest("[data-conv-shape]"),coords=position.dataset.convOutputPosition.split(",");
    root.dataset.r=coords[0];root.dataset.c=coords[1];
    updateShape(root);
  });
})();
