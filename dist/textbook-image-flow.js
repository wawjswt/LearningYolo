/* A dimension walkthrough, not an inference engine; values follow the bundled P5 YOLOv5l. */
(() => {
  const lesson=lessons.find(x=>x.id==='architecture'); if(!lesson)return;
  const photo='assets/image-flow/bus.jpg';
  const entries=[
    [-1,'Conv',64,2,1],[-1,'Conv',128,4,1],[-1,'C3',128,4,3],[-1,'Conv',256,8,1],[-1,'C3',256,8,6],[-1,'Conv',512,16,1],[-1,'C3',512,16,9],[-1,'Conv',1024,32,1],[-1,'C3',1024,32,3],[-1,'SPPF',1024,32,1],[-1,'Conv',512,32,1],[-1,'Upsample',512,16,1],[[11,6],'Concat',1024,16,1],[-1,'C3',512,16,3],[-1,'Conv',256,16,1],[-1,'Upsample',256,8,1],[[15,4],'Concat',512,8,1],[-1,'C3',256,8,3],[-1,'Conv',256,16,1],[[18,14],'Concat',512,16,1],[-1,'C3',512,16,3],[-1,'Conv',512,32,1],[[21,10],'Concat',1024,32,1],[-1,'C3',1024,32,3],[[17,20,23],'Detect',null,null,1]
  ].map((r,i)=>({i,from:r[0],type:r[1],c:r[2],s:r[3],n:r[4]}));
  const sources=r=>Array.isArray(r.from)?r.from:[r.i-1];
  const fmt=n=>n.toLocaleString('en-US');
  const quiz=(q,options,answer,why)=>({q,options,answer,why});
  const sections=[
    {title:'13. 实图案例：810×1080照片怎样成为输入张量',paragraphs:[
      '下面使用YOLOv5官方仓库的bus.jpg，实际文件宽810、高1080，RGB三通道。图片通常写“宽×高”，数组与张量却按高、宽排列：OpenCV读入时为[1080,810,3]、uint8、BGR顺序。请始终分清W×H和H×W。本案例沿用本课YOLOv5l、nc=80与3组anchor/尺度，不加载权重，也不声称生成了真实预测。',
      '先走固定640×640的letterbox：缩放比r=min(640/1080,640/810)=16/27≈0.592593。图像内容缩成宽480、高640，为保持比例不拉伸，需要左右各填充80像素，填充值114。结果数组为[640,640,3]，其中左右灰边不是原图内容。这里明确设置auto=False；训练默认方形批次可以用它作为尺寸推导基线。',
      '随后BGR→RGB，HWC→CHW，整理连续内存，得到[3,640,640]。加入批次维得到[1,3,640,640]，转浮点并除以255使像素落在[0,1]。通道换序不改变空间尺寸，除以255不改变张量形状。输入采用float32时仅该张量占4.69 MiB；这不是运行整个模型所需的显存。',
      '推理常见的auto=True会把多余填充量对32取余。本照片的总横向填充160，160 mod 32=0，因此可以不填灰边，实际输入为[1,3,640,480]，并不是640×640。不是所有图片都会变成这个矩形，批处理、后端与rect设置也会影响最终输入。为方便对照，下方的选择会同步改变后续案例图表；训练步骤演示固定采用方形基线。',
      '绿色框是为坐标换算手工设置的教学框，近似圈住左侧行人：原图xyxy=(54,405,243,918)，不属于官方标注，也不是模型预测。方形输入后变为(112,240,224,544)；中心xywh=(168,392,112,304)。真实训练必须完整标注需要学习的所有目标，不能把这张示意框当作整张照片的完整训练标签。'
    ],exercise:quiz('这张照片用auto=True、stride=32做最小矩形letterbox，输入高宽是多少？',['640×640','640×480','480×640'],1,'原图宽810、高1080，缩到宽480、高640；横向多余160对32取余为0，最终H×W=640×480。')},
    {title:'14. 实图逐层流动：0～24层与模块内部尺寸',paragraphs:[
      '下面把同一张照片送入网络，完整列出每一层的来源、输入与输出。所有普通特征按[B,C,H,W]显示；Detect原始预测改用[B,anchor,H,W,85]。切换批次大小只改变B，切换填充方式才会改变空间尺寸。B=4表示案例照片加上3张同样预处理尺寸的其他照片，不是把一个图像的通道复制4遍。',
      '默认方形输入依次经过640→320→160→80→40→20。第0层6×6、s=2、p=2：floor((640+4−6)/2)+1=320；第1层3×3、s=2、p=1得到160。其余步长2层同理。矩形输入则是H:640→320→160→80→40→20，W:480→240→120→60→30→15。C/H/W都是张量轴，不是类别数量。',
      '每个节点的输出通常是学习到的特征，不再是可以当普通照片直接展示的RGB图像。后面图表中的高宽数字表达空间分辨率，不代表真实激活热图。网络的权重和输入值决定特征数值；本案例只依据源码推导尺寸与连接，不伪造中间层实际输出。',
      '网络不是一条只保留上一层的流水线。层4、6的输出要留给FPN横向融合；层10、14的输出要留给PAN融合；层17、20、23同时送给Detect。点击节点后，图中会标出它读取的来源。Concat保留两路通道，例如层12把512与512拼为1024，随后层13的C3再融合为512。',
      '选中C3、SPPF或Detect，可以继续查看内部形状。C3的两路分支读取同一个输入；Bottleneck的Add只在shortcut开启且形状匹配时发生。SPPF的池化链保持高宽，四份512通道拼为2048通道。Detect三个输出卷积保持各自网格高宽，把通道变为255，然后分组和换轴。'
    ],exercise:quiz('矩形输入[1,3,640,480]，层17的P3特征是什么形状？',['[1,256,80,60]','[1,255,80,80]','[1,3,80,60,85]'],0,'层17是Neck的C3输出，通道256、stride=8。Detect尚未执行，所以不是255通道或5维预测。')},
    {title:'15. 训练全程：照片、标签、损失和参数更新',paragraphs:[
      '先固定训练基线：B=1、640×640、nc=80，关闭Mosaic、MixUp、随机透视/翻转、额外复制粘贴与multi-scale，采用非rect方形批次，才能逐项核对这里的坐标。项目的数据加载器还包含自定义增强；开启任何几何增强都必须同步变换标签，这时不能继续套用本案例的固定框坐标。',
      'YOLO标签文件每行是[class,xc/W,yc/H,w/W,h/H]。教学框假定类别person=0，原图对应[0,0.183333,0.6125,0.233333,0.475]。经过方形letterbox后，归一化标签变为[0,0.2625,0.6125,0.175,0.475]。DataLoader合批后额外增加image_index，targets为[N,6]；本框在批次第0张中可写[0,0,0.2625,0.6125,0.175,0.475]。N是批次内全部标注框数，与批次大小B不同。',
      'model.train()前向输出三个raw张量：[B,3,80,80,85]、[B,3,40,40,85]、[B,3,20,20,85]。训练不会先对它们做NMS再求损失，也没有要求网络产生与标注数量相同的候选。build_targets依据框宽高与anchor的比例筛选匹配，并可能扩展到邻近网格：一个真值可以对应多个尺度、anchor与位置，不能简单说“一个物体只归一个格子”。',
      '本框在P3网格的中心为(168/8,392/8)=(21,49)，宽高为(14,38)个网格单位。这只是坐标换算，是否匹配某个anchor以及会分配哪些邻格，还要按build_targets规则判定。损失挑选正样本框并解码，计算CIoU相关定位项；物体性在全部位置计算，匹配位置的目标可由IoU构造；类别项通常对正样本计算，nc=1时此实现跳过类别项。',
      '加权损失是一个可反向传播的标量，loss.backward()沿计算图计算参数梯度；optimizer.step()根据梯度和优化器状态更新权重，随后清理梯度进入下一轮。更新的是卷积等层的参数，图片不是被“改写成答案”。梯度张量的形状与对应参数一致，例如P3输出卷积权重和梯度都是[255,256,1,1]。',
      '教学循环展示每批更新一次；实际train.py还使用AMP梯度缩放、梯度累积、梯度裁剪与EMA。梯度累积时，并非每个batch都立刻step。训练模式中的BN更新运行统计量，评估模式改用已有统计量；model.eval()本身不会关闭自动求导，还应在推理中使用no_grad或inference_mode。验证在独立数据上评估并选择权重，不能用训练损失直接替代检测质量。'
    ],code:'# 方形输入、关闭几何增强后的单批次教学循环\nmodel.train()\noptimizer.zero_grad()\nimages = images.to(device).float() / 255.0  # [B,3,640,640]\nraw = model(images)                       # 三个5维预测张量\nloss, loss_items = compute_loss(raw, targets.to(device))\nloss.backward()                          # 梯度流向可学习参数\noptimizer.step()                         # 教学简化：每批更新\n# 正式train.py另含AMP、梯度累积、裁剪与EMA等',exercise:quiz('训练标签targets的第一维N表示什么？',['batch中的图片数','batch中的标注框总数','Detect候选总数'],1,'合批标签[N,6]的每一行是一条标注，包含image_index与class以及4个归一化框参数。')},
    {title:'16. 推理全程：候选解码、NMS与原图坐标还原',paragraphs:[
      '推理先加载训练后的权重，设置model.eval()，再在torch.inference_mode()中前向计算。不需要真实标签，也不执行loss.backward或optimizer.step。主干和Neck仍进行同样的特征计算；输入高宽不同则中间形状随之改变，训练所得卷积权重仍可用于这些合法的空间尺寸。',
      '方形输入的三尺度原始预测展平后为[B,19200,85]、[B,4800,85]、[B,1200,85]，合为[B,25200,85]。矩形输入则为[B,14400,85]、[B,3600,85]、[B,900,85]，合为[B,18900,85]。每张图分别处理，B=4不会把4张图的候选混在一起做NMS。',
      'Detect把tx/ty/tw/th经过Sigmoid并结合网格、stride与anchor解码为输入画布中的中心xywh。物体性与类别独立Sigmoid，再由外部后处理相乘得到类别置信度。80类分数不要求总和为1；分数也不自动具有已校准真实概率的含义。',
      '为专注坐标还原，假设有一个候选恰好等于教学框：方形输入xywh=(168,392,112,304)。转成xyxy=(112,240,224,544)。这是假设数值，不是实际模型输出。若该候选物体性0.9、person分数0.8，组合置信度为0.72；它是否最终保留还取决于阈值、重叠框、类别和NMS规则。',
      'NMS之后每张图是[Mi,6]，每行通常为[x1,y1,x2,y2,confidence,class]，Mi随图片变化，可能为0。框还在输入画布中，应先去掉填充，再除以r：原图x=(输入x−pad_x)/r，原图y=(输入y−pad_y)/r，最后裁到图像范围。代入本框即可还原(54,405,243,918)，再叠加到原图上；普通detect.py还会取整。',
      '完整路径因此是：读图→保持比例缩放/填充→RGB/CHW/浮点/合批→Backbone→FPN/PAN→Detect→解码与候选拼接→分数筛选/NMS→坐标还原→显示结果。图片尺寸和预处理参数是这条链的一部分，不能只看模型最后的25200这个数字。'
    ],code:'model.eval()\nwith torch.inference_mode():\n    decoded, raw = model(images)\n# decoded: [B,25200,85]（640×640）\n#       或 [B,18900,85]（640×480）\ndetections = non_max_suppression(decoded, conf_thres=0.25, iou_thres=0.45)\nfor image_id, det in enumerate(detections):\n    # det: [Mi,6]；空结果为[0,6]\n    det[:, :4] = scale_boxes(images.shape[2:], det[:, :4], originals[image_id].shape)\n# 预处理元数据必须与当前图片一一对应',exercise:quiz('方形letterbox中输入坐标x=112，pad_x=80、r=16/27，对应原图x是多少？',['189','54','32'],1,'先减去80像素填充，再除以16/27：(112−80)×27/16=54。')}
  ];
  lesson.sections.push(...sections);
  lesson.sections[0].paragraphs.push('想把网络结构与一张具体照片连起来，请接着阅读第13～16节实图案例：从原始810×1080照片、预处理和各层张量，一直追踪到训练更新与推理坐标还原。');
  lesson.time=115;
  lesson.goals.push('用810×1080实图核算方形/矩形输入、逐层张量、训练标签和原图坐标还原。');
  lesson.keypoints.push('原图宽810高1080：方形letterbox为640×640，auto最小矩形可为640×480；对应候选数25200与18900。');
  lesson.chapterExercises.push(sections[1].exercise,sections[3].exercise);
  lesson.sources.push({label:'随课实图来源：YOLOv5官方bus.jpg',url:'https://github.com/ultralytics/yolov5/blob/master/data/images/bus.jpg'});
  let choice={rect:false,b:1};
  const width=()=>choice.rect?480:640;
  const shape=i=>i<0?`[${choice.b},3,640,${width()}]`:`[${choice.b},${entries[i].c},${640/entries[i].s},${width()/entries[i].s}]`;
  const raw=s=>`[${choice.b},3,${640/s},${width()/s},85]`;
  const settings=()=>`<div class="if-settings"><label>输入画布<select data-if-layout aria-label="实图输入画布"><option value="square"${!choice.rect?' selected':''}>固定方形640×640 · auto=False</option><option value="rect"${choice.rect?' selected':''}>推理最小矩形640×480 · auto=True</option></select></label><label>批次B<select data-if-batch aria-label="实图批次大小"><option${choice.b===1?' selected':''}>1</option><option${choice.b===4?' selected':''}>4</option></select></label></div>`;
  function imageCanvas(original=false){const w=original?810:width(),h=original?1080:640,x=original?0:choice.rect?0:80,iw=original?810:480,box=original?[54,405,189,513]:[choice.rect?32:112,240,112,304];return `<svg viewBox="0 0 ${w} ${h}" role="img" aria-label="${original?'原始810乘1080照片与教学框':'letterbox输入画布与教学框'}"><rect width="${w}" height="${h}" fill="#727272"/><image href="${photo}" x="${x}" y="0" width="${iw}" height="${h}"/><rect x="${box[0]}" y="${box[1]}" width="${box[2]}" height="${box[3]}" fill="#49e9a6" fill-opacity=".12" stroke="#30f09e" stroke-width="${original?5:3}"/></svg>`;}
  function preprocess(){const pad=choice.rect?0:80;return `<div class="if-photo-pair"><figure>${imageCanvas(true)}<figcaption>原始文件：W=810、H=1080<br>数组 [1080,810,3] · uint8</figcaption></figure><span class="if-arrow" aria-hidden="true">→</span><figure>${imageCanvas()}<figcaption>网络画布：W=${width()}、H=640<br>r=16/27；左右填充各${pad}px</figcaption></figure></div><div class="if-flowline"><span>HWC / BGR<br>[640,${width()},3]</span><b>→</b><span>RGB / CHW<br>[3,640,${width()}]</span><b>→</b><span>合批 / float32 / ÷255<br>${shape(-1)}</span></div><p class="if-note">绿色框是手工设定的坐标教学框。第一张图在批次中索引为0。输入张量float32占用 ${(choice.b*3*640*width()*4/1048576).toFixed(2)} MiB，不包含权重、特征缓存与梯度。</p><div class="if-math">xyxy：原图 (54,405,243,918) → 画布 (${32+pad},240,${144+pad},544)<br>画布中心xywh：(${88+pad},392,112,304)<br>合批标签示例：[0,0,${((88+pad)/width()).toFixed(6)},0.612500,${(112/width()).toFixed(6)},0.475000]</div>`;}
  function layers(root){const id=Number(root.dataset.layer||0),r=entries[id],ins=sources(r),active=new Set(ins);const groups=[[0,9,'Backbone · 提取'],[10,17,'FPN · 向细尺度融合'],[18,24,'PAN与Detect · 聚合和预测']];return `<div class="if-layer-map">${groups.map(([a,b,label])=>`<div><h4>${label}</h4>${entries.slice(a,b+1).map(n=>`<button type="button" data-if-layer="${n.i}" aria-pressed="${id===n.i}" class="${active.has(n.i)?'if-source':''}"><b>${n.i}</b> ${n.type}<small>${n.i===24?'读取17、20、23':shape(n.i)}</small></button>`).join('')}</div>`).join('')}</div><p class="if-note">紫色为当前层，绿色边框为它读取的来源。节点按功能分组，具体连接以来源标注为准；检测层同时读取三条尺度。</p><div class="if-layer-detail" aria-live="polite"><span class="if-kicker">层 ${id} · ${r.type}</span><div class="if-flowline">${ins.map(i=>`<span>${i<0?'网络输入':'层'+i}<br>${shape(i)}</span>`).join('<b>＋</b>')}<b>→</b><span>层${id}输出<br>${id===24?[8,16,32].map(raw).join('<br>'):shape(id)}</span></div><p>${inner(r)}</p></div><details class="if-all-shapes"><summary>展开全部0～24层输入／输出尺寸表</summary><div class="if-table-scroll" tabindex="0" aria-label="逐层张量尺寸表"><table><thead><tr><th>层 / 模块</th><th>来源</th><th>输入 [B,C,H,W]</th><th>输出张量</th></tr></thead><tbody>${entries.map(n=>`<tr><td>${n.i} ${n.type}</td><td>${sources(n).join(', ')}</td><td>${sources(n).map(shape).join('<br>')}</td><td>${n.i===24?[8,16,32].map(raw).join('<br>'):shape(n.i)}</td></tr>`).join('')}</tbody></table></div></details>`;}
  function inner(r){const h=640/r.s,w=width()/r.s,input=entries[r.i-1]?.c||3;
    if(r.type==='C3'){const hidden=r.c/2,add=r.i<10;return `内部拆解：两路同时读入${input}通道。主路1×1 Conv → [${choice.b},${hidden},${h},${w}] → ${r.n}个Bottleneck；旁路1×1 Conv → 同形状。每个Bottleneck内部1×1与3×3均保持${hidden}通道和${h}×${w}网格${add?'，再执行x+F(x)残差相加':'；shortcut=False，不做残差相加'}。两路Concat → [${choice.b},${2*hidden},${h},${w}] → cv3融合为${shape(r.i)}。`;}
    if(r.type==='SPPF')return `内部拆解：cv1将1024→512通道，得到[${choice.b},512,${h},${w}]。三次5×5最大池化均s=1、p=2，各自保持此形状；原分支加三份池化结果Concat为[${choice.b},2048,${h},${w}]，cv2融合为${shape(r.i)}。没有残差相加。`;
    if(r.type==='Detect')return `内部拆解：层17/20/23分别经1×1卷积，输出${[8,16,32].map(s=>`[${choice.b},255,${640/s},${width()/s}]`).join('、')}。各自view成[B,3,85,H,W]，再permute成[B,3,H,W,85]。三尺度每张图共${fmt(3*(640/8*width()/8+640/16*width()/16+640/32*width()/32))}个候选。训练返回raw列表；推理继续解码。更细的通道含义见第10节。`;
    if(r.type==='Concat')return `沿通道轴dim=1拼接：${sources(r).map(i=>entries[i].c).join('+')}=${r.c}。高宽必须相同；这不是逐元素残差相加。拼接本身没有可学习参数。`;
    if(r.type==='Upsample')return `nearest上采样×2：复制特征值，将高宽翻倍为${h}×${w}，${r.c}通道保持不变。此操作没有可学习参数。`;
    return `${r.i===0?'6×6卷积，s=2、p=2':r.s===entries[r.i-1]?.s?'1×1卷积，s=1':'3×3卷积，s=2、p=1'}：${input}→${r.c}通道；随后BN与SiLU保持形状${shape(r.i)}。卷积改变的是特征表示，不是把原图直接裁成这些小图片。`;
  }
  const trainSteps=[
    ['① 图像与标签','输入[1,3,640,640]；教学框标签[0,0,0.2625,0.6125,0.175,0.475]。标签不是拼成第4个图像通道，而是作为另一份数据交给损失函数。'],
    ['② 前向预测','经过0～23层，再由Detect返回[1,3,80,80,85]、[1,3,40,40,85]、[1,3,20,20,85]。此时还没有NMS，也没有最终物体列表。'],
    ['③ 匹配与损失','build_targets比较真值宽高与anchor比例，并处理邻格。正样本定位损失+全网格物体性损失+正样本类别损失，经权重组合成标量。标签数量不必等于候选数量。'],
    ['④ 反向传播','loss.backward()按计算图求梯度。P3输出卷积weight.grad为[255,256,1,1]，bias.grad为[255]；前面的可学习层也收到梯度。反向传播不是PAN的自底向上前向路径。'],
    ['⑤ 参数更新','optimizer.step()更新权重，清理梯度后继续下一批。真实训练可累积多个batch再更新，并使用AMP与EMA等；这里一次更新是教学简化。']
  ];
  function training(root){const step=Number(root.dataset.step||0);return `<div class="if-train-flow" role="group" aria-label="训练过程步骤">${trainSteps.map((s,i)=>`<button type="button" data-if-train-step="${i}" aria-pressed="${step===i}">${s[0]}</button>`).join('<b aria-hidden="true">→</b>')}</div><div class="if-layer-detail" aria-live="polite"><h4>${trainSteps[step][0]}</h4><p>${trainSteps[step][1]}</p></div><div class="if-cycle"><span>照片 → 预测 → 损失</span><strong>← 梯度沿计算图返回可学习参数</strong><span>更新权重 → 下一批照片 → 下一轮前向</span></div><p class="if-note">本训练演示固定B=1、方形640×640。图示只展示计算关系，未实际执行训练。前面逐层表可以另选B=4查看批次轴如何变化。</p>`;}
  function inference(root){const s=Number(root.dataset.step||0),pad=choice.rect?0:80,candidates=choice.rect?18900:25200,stages=[
    ['① 读取与预处理',`原图[1080,810,3] → 输入${shape(-1)}。记录r=16/27、pad_x=${pad}、pad_y=0，供最后坐标还原。`],
    ['② 特征与原始预测',`三尺度网格80×${width()/8}、40×${width()/16}、20×${width()/32}；raw形状分别为${[8,16,32].map(raw).join('、')}。`],
    ['③ 解码与拼接',`每个候选变成输入画布中的xywh、物体性与类别分数，三尺度拼接[${choice.b},${candidates},85]。教学假设框xywh=(${88+pad},392,112,304)，不是实际预测。`],
    ['④ 筛选与NMS',`假设物体性0.9、person分数0.8，则组合分数0.72。分别对每张图筛选/NMS，得到长度为B的列表，每项[Mi,6]；Mi可为0。`],
    ['⑤ 还原到原图',`假设教学框保留：输入xyxy=(${32+pad},240,${144+pad},544)。先减(${pad},0)，再除以16/27 → 原图(54,405,243,918)，裁到810×1080范围后显示。`]
  ];return `<div class="if-train-flow" role="group" aria-label="推理过程步骤">${stages.map((a,i)=>`<button type="button" data-if-infer-step="${i}" aria-pressed="${s===i}">${a[0]}</button>`).join('<b aria-hidden="true">→</b>')}</div><div class="if-layer-detail" aria-live="polite"><h4>${stages[s][0]}</h4><p>${stages[s][1]}</p></div><div class="if-photo-pair"><figure>${imageCanvas()}<figcaption>输入画布上的教学候选框</figcaption></figure><span class="if-arrow" aria-hidden="true">→</span><figure>${imageCanvas(true)}<figcaption>去填充、除缩放比，回到原图</figcaption></figure></div><p class="if-note">图片是真实照片；绿色框和0.72分数用于手算，均不是运行模型得到的检测结果。</p>`;}
  const body=(root)=>root.dataset.ifKind==='pre'?preprocess():root.dataset.ifKind==='layers'?layers(root):root.dataset.ifKind==='train'?training(root):inference(root);
  function render(kind){return `<section class="if-workbench" data-if-root data-if-kind="${kind}" data-layer="0" data-step="0"><span class="if-kicker">ONE PHOTO, ALL THE WAY · 一张照片贯穿全程</span>${kind==='train'?'':settings()}<div data-if-content></div></section>`;}
  function update(root){root.querySelector('[data-if-content]').innerHTML=body(root);}
  function updateAll(){document.querySelectorAll('[data-if-root]').forEach(root=>{const layout=root.querySelector('[data-if-layout]'),batch=root.querySelector('[data-if-batch]');if(layout)layout.value=choice.rect?'rect':'square';if(batch)batch.value=String(choice.b);update(root);});}
  const previous=window.lessonPlaygrounds||{};
  window.lessonPlaygrounds={render(id,i){return (previous.render?.(id,i)||'')+(id==='architecture'&&i>=12&&i<=15?render(['pre','layers','train','infer'][i-12]):'');},initialize(){previous.initialize?.();updateAll();}};
  document.addEventListener('change',event=>{if(event.target.matches('[data-if-layout]'))choice.rect=event.target.value==='rect';else if(event.target.matches('[data-if-batch]'))choice.b=Number(event.target.value);else return;updateAll();});
  document.addEventListener('click',event=>{const b=event.target.closest('button'),root=b?.closest('[data-if-root]');if(!root)return;if(b.dataset.ifLayer!==undefined)root.dataset.layer=b.dataset.ifLayer;else if(b.dataset.ifTrainStep!==undefined)root.dataset.step=b.dataset.ifTrainStep;else if(b.dataset.ifInferStep!==undefined)root.dataset.step=b.dataset.ifInferStep;else return;update(root);});
})();
