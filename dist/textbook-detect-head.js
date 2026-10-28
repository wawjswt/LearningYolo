/* Detect mechanics follow the local YOLOv5 models/yolo.py implementation. */
(() => {
  const lesson = lessons.find(item => item.id === 'architecture');
  if (!lesson) return;
  const section = lesson.sections[9];
  section.title = '10. Detect内部：从1×1卷积到三尺度候选';
  section.paragraphs = [
    '检测头像三台放在不同楼层的“读数器”：Neck已经把图像变成特征，Detect负责把每个位置的特征翻译成检测数值。第24层读取层17、20、23，分别得到P3的256×80×80、P4的512×40×40、P5的1024×20×20。下文固定输入640×640、nc=80，张量中的B表示批次大小。',
    '打开Detect，最核心的可学习部分是一个ModuleList，里面只有三个原生nn.Conv2d：256→255、512→255、1024→255，卷积核均为1×1，stride=1，含bias。这里没有普通Conv模块中的BatchNorm和SiLU，也没有额外的全连接层。三个尺度各用自己的权重；同一个尺度内，所有空间位置共享该卷积的权重。',
    '1×1不代表只看一个特征数。在P3的一个位置，卷积同时读取该位置全部256个通道，通过255组不同的加权求和与偏置，输出255个数。对输出通道j：z[j,y,x]=Σc W[j,c,0,0]×F[c,y,x]+b[j]。空间网格仍为80×80，通道从256变为255。输入特征已汇集了前面网络的邻域信息，因此1×1预测并不意味着只利用原图的一个像素。',
    '为什么是255？每个网格有3组anchor，每组需要85个数：4个框原始参数tx、ty、tw、th，1个物体性原始分数to，80个类别原始分数。三个尺度分支与这三种语义不能混为一谈：每个尺度的一次卷积联合产生全部三种数值，这属于耦合检测头；不能把它画成三套独立的框、物体性和分类子网络。',
    '通道按anchor连续分组：0～84对应anchor 0，85～169对应anchor 1，170～254对应anchor 2。组内0～3是框，4是物体性，5～84是类别。它们此时都是未限制范围的原始数值；框参数尚不是像素坐标，类别数值也尚不是概率。这种排列由输出约定及损失计算共同赋予含义。每个网格产生3个候选，而不是一个框的三个类别。',
    '接下来view(B,3,85,H,W)，再permute(0,1,3,4,2).contiguous()，得到B×3×H×W×85。这两步把同一批数按“anchor、位置、候选向量”组织起来，不增加可学习参数；contiguous可能复制内存。直接view(B,3,H,W,85)会打乱数值对应关系，不能省略中间的维度交换。',
    '训练路径到此返回三张原始预测张量，外部ComputeLoss挑选匹配的正样本，解码其框并计算CIoU相关定位损失；物体性使用全部网格，类别损失通常只用匹配正样本且nc>1时计算。物体性目标在这份实现中可由匹配框的IoU构造，不应一概说成全是0或1。损失通过反向传播训练输出卷积及前面的网络。',
    '推理路径继续执行Sigmoid、网格与anchor解码，再把三尺度展平为B×19200×85、B×4800×85、B×1200×85，沿候选维拼接成B×25200×85。普通推理返回(decoded, raw)，导出模式的返回封装可能不同。分数筛选、物体性×类别分数以及NMS属于外部后处理；Detect不是直接输出最终物体列表。',
    '以80类（每个尺度255个输出通道）为例，三个输出卷积的参数分别为255×256+255=65,535，255×512+255=130,815，255×1024+255=261,375，总计457,725。anchor在源码中注册为buffer，grid是缓存，stride描述采样间隔，它们都不是这里新增的可学习卷积权重。P3通常更利于小目标，P4/P5逐渐偏向较大目标，但这是倾向而非硬性分工。'
  ];
  section.code = '# Detect中可学习的输出层：三个尺度各有一个1×1卷积\nself.m = nn.ModuleList(\n    nn.Conv2d(c, 3 * (80 + 5), kernel_size=1)\n    for c in (256, 512, 1024)\n)\n\n# forward循环中，第i个尺度\np = self.m[i](features[i])       # [B, 255, H, W]，含bias\nB, _, H, W = p.shape\np = p.view(B, 3, 85, H, W)\np = p.permute(0, 1, 3, 4, 2).contiguous()\n# [B, 3, H, W, 85]：p[b, anchor, y, x]是一个85维候选\n# 训练：收集三个尺度的p，交给外部损失计算\n# 推理：继续sigmoid与框解码，再展平、拼接';
  lesson.keypoints.push('Detect每尺度仅一个带偏置的1×1输出卷积；框、物体性和类别是共同输出的通道切片。');
  lesson.chapterExercises.push({q:'Detect中的三个1×1卷积，分别负责什么？',options:['框回归、物体性、分类各一个','P3、P4、P5各一个，每个都输出框、物体性和类别','训练、推理、NMS各一个'],answer:1,why:'三个卷积对应三个特征尺度，每个卷积输出3×(4+1+80)=255通道。它们不是三种任务各自独立的子网络。'});
  const scales = [{name:'P3',layer:17,c:256,h:80},{name:'P4',layer:20,c:512,h:40},{name:'P5',layer:23,c:1024,h:20}];
  const count = n => n.toLocaleString('en-US');
  function workshop() {
    return `<section class="dh-workshop" data-dh-root data-scale="0" data-step="0" data-mode="train"><span class="yl-eyebrow">INSIDE DETECT · 打开检测头</span><h3>跟着一个尺度，把里面的计算走一遍</h3><p>先选一条尺度通路，再点击计算步骤。下图中的三条通路都同时产生框、物体性和类别。</p><div class="dh-lanes" role="group" aria-label="检测尺度">${scales.map((s,i)=>`<button type="button" data-dh-scale="${i}" aria-pressed="${i===0}"><strong>${s.name} · 层${s.layer}</strong><span>特征 ${s.c}×${s.h}×${s.h}</span><b aria-hidden="true">↓</b><span class="dh-conv">1×1 Conv2d<br>${s.c} → 21 · bias=True</span><b aria-hidden="true">↓</b><span>原始输出 21×${s.h}×${s.h}</span></button>`).join('')}</div><div class="dh-modes" role="group" aria-label="计算路径"><button type="button" data-dh-mode="train" aria-pressed="true">训练路径</button><button type="button" data-dh-mode="infer" aria-pressed="false">推理路径</button></div><div class="dh-steps" role="group" aria-label="检测头计算步骤">${['① 读入特征','② 1×1卷积','③ view分组','④ permute换轴','⑤ 路径分流','⑥ 交给下一环节'].map((name,i)=>`<button type="button" data-dh-step="${i}" aria-pressed="${i===0}">${name}</button>`).join('')}</div><div class="dh-detail" data-dh-detail aria-live="polite"></div><h4>21个通道，究竟装的是什么？</h4><p>固定某个网格位置，拖动输出通道j。每7个通道组成一个anchor的完整候选向量。</p><label class="dh-channel-label">输出通道 j <output data-dh-channel-value>0</output><input data-dh-channel type="range" min="0" max="20" value="0" step="1" aria-label="检测头输出通道编号"></label><div class="dh-shortcuts" role="group" aria-label="跳到输出通道分组"><button type="button" data-dh-channel-jump="0">anchor 0：0～6</button><button type="button" data-dh-channel-jump="7">anchor 1：7～13</button><button type="button" data-dh-channel-jump="14">anchor 2：14～20</button></div><div data-dh-channel-note class="dh-channel-note" aria-live="polite"></div><div class="dh-vector" aria-label="每个anchor的7维向量"><span>框参数<br>0～3 · 4个数</span><span>物体性<br>4 · 1个数</span><span>类别<br>5～6 · 2个数</span></div><p class="dh-footnote">色块为语义分组示意，宽度不表示真实比例。三个分组来自同一个输出卷积；这里没有在分组之间添加新的网络层。所有形状与参数量均按随课YOLOv5l配置静态计算。</p></section>`;
  }
  function update(root) {
    const s = scales[Number(root.dataset.scale)], step=Number(root.dataset.step), infer=root.dataset.mode==='infer';
    const h=s.h, raw=`B×3×${h}×${h}×7`, conv=`B×21×${h}×${h}`;
    const details = [
      ['① Neck交来的是特征，不是图片',`输入 B×${s.c}×${h}×${h}。每个网格位置有${s.c}个特征数，已经携带前面网络提取和融合的信息。Detect读取层${s.layer}的输出，不再接收原始RGB图片。`,`features[${Number(root.dataset.scale)}]  # [B, ${s.c}, ${h}, ${h}]`],
      ['② 每个位置，全部通道一起加权',`输出 ${conv}。权重形状[21, ${s.c}, 1, 1]，偏置形状[21]；参数共${count(21*(s.c+1))}。每个输出通道各有一组${s.c}个权重，在所有${h}×${h}个位置重复使用。这一步既不改变空间尺寸，也不在卷积之后接BN或SiLU。`,`z[j,y,x] = Σc W[j,c,0,0] * F[c,y,x] + bias[j]`],
      ['③ 把21个通道分为3×7',`从 ${conv} 变成 B×3×7×${h}×${h}。这里先分出anchor维和候选数值维；第7号输出通道就是anchor 1的第0个数。没有新权重，也没有新数值产生。`,`p.view(B, 3, 7, ${h}, ${h})`],
      ['④ 把7维候选向量放到最后',`将候选数值轴移到末尾，得到 ${raw}。此时p[b,a,y,x,k]能直接取出某批次、某anchor、某位置的第k个数。permute交换轴；contiguous使内存连续，可能发生复制。`,`p.permute(0, 1, 3, 4, 2).contiguous()`],
      infer ? ['⑤ 推理：激活并解码',`先对原始数值做Sigmoid，再结合stride=${640/h}、网格坐标及该尺度的anchor解码xywh。形状仍为 ${raw}，但前4个数已是输入画布中的像素中心与宽高。物体性和类别分别使用Sigmoid，不是2类Softmax。`,`xy = (2 * sigmoid(txy) + grid) * stride\nwh = (2 * sigmoid(twh)) ** 2 * anchor_grid`] : ['⑤ 训练：返回原始预测',`Detect返回三尺度raw列表，当前一项形状为 ${raw}。这里不执行推理用的整张特征图解码，不先把logits变成概率交给BCEWithLogitsLoss。训练分支与推理分支共用同一套卷积权重。`,`return raw_predictions  # 三个尺度的原始张量`],
      infer ? ['⑥ 展平拼接，再交给外部后处理',`当前尺度变为 B×${3*h*h}×7。三尺度拼接得到B×25200×7；普通推理返回(decoded, raw)。之后才在Detect外做objectness×class、阈值筛选、NMS与原图坐标还原。25,200是候选数量，不是检测结果数量。`,`decoded_i.view(B, ${3*h*h}, 7)\ntorch.cat(decoded_scales, dim=1)`] : ['⑥ 外部损失把监督信号传回网络',`ComputeLoss对匹配正样本的框做解码并计算CIoU相关损失，物体性损失覆盖所有位置，类别损失用于匹配正样本（nc>1）。因此“Detect训练时返回原始张量”并不等于“训练过程完全不解码框”。损失随后反向传播到这三个输出卷积和前面的网络。`,`loss = box_loss + objectness_loss + class_loss\n# 示意：实际各项还按超参数及尺度加权`]
    ];
    const d=details[step];
    root.querySelector('[data-dh-detail]').innerHTML=`<span class="dh-active-scale">${s.name} / stride ${640/h} / ${infer?'推理':'训练'}</span><h4>${d[0]}</h4><p>${d[1]}</p><pre><code>${d[2]}</code></pre>`;
    root.querySelectorAll('[data-dh-scale]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.dhScale===root.dataset.scale)));
    root.querySelectorAll('[data-dh-step]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.dhStep===root.dataset.step)));
    root.querySelectorAll('[data-dh-mode]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.dhMode===root.dataset.mode)));
    updateChannel(root);
  }
  function updateChannel(root) {
    const j=Number(root.querySelector('[data-dh-channel]').value), a=Math.floor(j/7), k=j%7;
    const semantic=k<4?['tx：中心x的原始参数','ty：中心y的原始参数','tw：宽度的原始参数','th：高度的原始参数'][k]:k===4?'to：物体性原始分数':`类别 ${k-5} 的原始分数`;
    root.querySelector('[data-dh-channel-value]').textContent=j;
    root.querySelector('[data-dh-channel-note]').innerHTML=`<strong>通道 ${j} → anchor ${a} → 组内索引 ${k}</strong><span>${semantic}</span><code>raw[b, ${a}, y, x, ${k}] = conv_output[b, ${j}, y, x]</code><span>${k<4?'还要结合网格、stride与anchor解码，才能成为框坐标。':k===4?'经Sigmoid成为物体性分数；它不指定是哪一类。':'经独立Sigmoid成为该类分数；后处理再与物体性相乘。'}</span>`;
    root.querySelectorAll('[data-dh-channel-jump]').forEach(b=>b.setAttribute('aria-pressed',String(Math.floor(Number(b.dataset.dhChannelJump)/7)===a)));
    root.querySelectorAll('.dh-vector span').forEach((el,i)=>el.classList.toggle('is-active',i===(k<4?0:k===4?1:2)));
  }
  const previous=window.lessonPlaygrounds||{};
  window.lessonPlaygrounds={render(id,index){return (previous.render?.(id,index)||'')+(id==='architecture'&&index===9?workshop():'');},initialize(){previous.initialize?.();document.querySelectorAll('[data-dh-root]').forEach(update);}};
  document.addEventListener('click',event=>{
    const b=event.target.closest('button'), root=b?.closest('[data-dh-root]'); if(!root)return;
    if(b.dataset.dhScale!==undefined)root.dataset.scale=b.dataset.dhScale;
    else if(b.dataset.dhStep!==undefined)root.dataset.step=b.dataset.dhStep;
    else if(b.dataset.dhMode!==undefined)root.dataset.mode=b.dataset.dhMode;
    else if(b.dataset.dhChannelJump!==undefined)root.querySelector('[data-dh-channel]').value=b.dataset.dhChannelJump;
    else return;
    update(root);
  });
  document.addEventListener('input',event=>{if(event.target.matches('[data-dh-channel]'))updateChannel(event.target.closest('[data-dh-root]'));});
})();
