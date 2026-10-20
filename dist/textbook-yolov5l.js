/* YOLOv5l: layer-by-layer reading of the supplied Conv/C3/SPPF P5 configuration. */
(()=>{
  const lesson=lessons.find(item=>item.id==='architecture');
  if(!lesson)return;
  const asset='assets/yolov5l/';
  const question=(q,options,answer,why)=>({q,options,answer,why});
  const rows=[
    [-1,'Conv',64,2,1,'6×6 / s2 / p2','第一块卷积提取特征并下采样。64是输出通道数。'],
    [-1,'Conv',128,4,1,'3×3 / s2','空间再次减半，得到P2/4。'],
    [-1,'C3',128,4,3,'shortcut=True','内部3个Bottleneck，隐藏64通道，保持输入的空间尺寸。'],
    [-1,'Conv',256,8,1,'3×3 / s2','下采样到P3/8。'],
    [-1,'C3',256,8,6,'shortcut=True','隐藏128通道，内部6个残差Bottleneck；保留供层16融合。'],
    [-1,'Conv',512,16,1,'3×3 / s2','下采样到P4/16。'],
    [-1,'C3',512,16,9,'shortcut=True','隐藏256通道，内部9个残差Bottleneck；保留供层12融合。'],
    [-1,'Conv',1024,32,1,'3×3 / s2','下采样到P5/32。'],
    [-1,'C3',1024,32,3,'shortcut=True','隐藏512通道，内部3个残差Bottleneck。'],
    [-1,'SPPF',1024,32,1,'k5 / s1 / p2','先降为512通道；四路池化范围拼接为2048，再融合为1024通道。'],
    [-1,'Conv',512,32,1,'1×1 / s1','降通道1024→512，保留供层22融合。'],
    [-1,'Upsample',512,16,1,'nearest ×2','复制特征值，使高和宽翻倍；没有可学习参数。'],
    [[11,6],'Concat',1024,16,1,'dim=1','上采样的512通道与Backbone层6的512通道拼接。'],
    [-1,'C3',512,16,3,'shortcut=False','输入1024、输出512、隐藏256通道；内部不做残差相加。'],
    [-1,'Conv',256,16,1,'1×1 / s1','把层13的512通道降为256，保留供层19融合。'],
    [-1,'Upsample',256,8,1,'nearest ×2','高宽翻倍，通道保持256；640输入时为40×40→80×80。'],
    [[15,4],'Concat',512,8,1,'dim=1','上采样的256通道与Backbone层4的256通道拼接。'],
    [-1,'C3',256,8,3,'shortcut=False','得到最终P3检测特征，也作为PAN路径起点。'],
    [-1,'Conv',256,16,1,'3×3 / s2','PAN路径下采样，输出256通道；640输入时为80×80→40×40。'],
    [[18,14],'Concat',512,16,1,'dim=1','接的是层14，不是Backbone层6；256+256=512。'],
    [-1,'C3',512,16,3,'shortcut=False','得到最终P4检测特征；即使输入输出同通道，也因False而关闭残差。'],
    [-1,'Conv',512,32,1,'3×3 / s2','PAN路径下采样，输出512通道；640输入时为40×40→20×20。'],
    [[21,10],'Concat',1024,32,1,'dim=1','接的是层10，不是直接接SPPF层9；512+512=1024。'],
    [-1,'C3',1024,32,3,'shortcut=False','得到最终P5检测特征。'],
    [[17,20,23],'Detect',null,null,1,'3个输出卷积','同时读取三尺度；每分支用原生1×1 Conv2d输出3×(nc+5)通道。']
  ].map((r,i)=>({i,from:r[0],type:r[1],c:r[2],stride:r[3],n:r[4],args:r[5],note:r[6]}));
  const sourceIds=row=>Array.isArray(row.from)?row.from:[row.from===-1?row.i-1:row.from];
  const shape=(id,side=640)=>id<0?'3 × '+side+' × '+side:rows[id].c+' × '+side/rows[id].stride+' × '+side/rows[id].stride;
  const quiz=[
    question('这份YAML的head字段中，哪些层主要承担Neck的特征融合？',['10～23层','只有第24层','只有0～9层'],0,'按功能划分，0～9为Backbone，10～23融合特征，第24层Detect输出预测；YAML把10～24都写在head字段下。'),
    question('[-1,6,C3,[256]]中的6在本配置中表示什么？',['串联6个完整C3','一个C3内部含6个Bottleneck','输出6个通道'],1,'parse_model把重复次数注入C3的n参数，并把外层构造次数设为1。'),
    question('第0层k=6、s=2、p=2，640输入的输出边长是多少？',['640','319','320'],2,'floor((640+2×2−6)/2)+1=320。'),
    question('Backbone第6层保留的特征是哪个尺寸？',['512×40×40','256×80×80','1024×20×20'],0,'第5层下采样到40×40，第6层C3保持空间尺寸并输出512通道。'),
    question('第4层C3的n=6，一共含多少个Conv2d？',['3','15','6'],1,'外部3个Conv，加6个Bottleneck各2个Conv，共3+2×6=15。'),
    question('第20层C3输入输出同为512通道，内部有残差相加吗？',['有，通道相同一定相加','没有，配置显式传入shortcut=False','只在推理时相加'],1,'内部Bottleneck的相加需要shortcut=True且输入输出通道相同；本层的False关闭了它。'),
    question('SPPF的三个5×5最大池化为何保持20×20？',['因为stride=1、padding=2','因为最大池化总不改变尺寸','因为输出被强行reshape'],0,'这里每次池化k5、s1、p2，保持空间大小；池化是否下采样要看参数。'),
    question('FPN路径第16层拼接哪两份特征？',['层15和层4','层15和层6','层17和层14'],0,'层15上采样成256×80×80，与Backbone层4的256×80×80拼接。'),
    question('PAN路径第19层拼接的是？',['层18与层6','层18与层14','层21与层10'],1,'层18与层14都是256×40×40，拼接后512通道。'),
    question('nc=80、每格3个anchor，Detect每个分支输出通道是多少？',['85','240','255'],2,'每anchor含4个框参数、1个物体性和80个类别数值，3×(80+5)=255。'),
    question('本检测头的80个类别分数使用哪种变换？',['独立Sigmoid','强制和为1的Softmax','先argmax再训练'],0,'这份Detect在推理中对类别和物体性使用Sigmoid；类别分数不要求和为1。'),
    question('25,200个候选框与NMS的关系是什么？',['候选数就是物体数','候选还需分数筛选与NMS等后处理','NMS是YAML第25层'],1,'Detect生成候选，后处理筛选和抑制部分重复框；NMS不在这份YAML的层表中。')
  ];
  lesson.title='YOLOv5 网络结构：以 YOLOv5l 逐层拆解';
  lesson.desc='追踪0～24层的尺寸与连接，拆开C3、Bottleneck和SPPF，读懂FPN/PAN与检测解码。';
  lesson.time=85;
  lesson.figureKeys=[];
  lesson.goals=[
    '读懂from、重复次数、模块参数，并追踪0～24层的输入与输出。',
    '拆开Conv、C3、Bottleneck和SPPF，区分残差相加与通道拼接。',
    '沿20→40→80和80→40→20两条路径解释FPN/PAN特征融合。',
    '计算三尺度输出形状、anchor候选数量，并解释推理解码与NMS。'
  ];
  lesson.prereq='张量的C/H/W维度、卷积和下采样、Sigmoid与基础目标检测。';
  const contents=[
    ['一张图看清Backbone、Neck与Detect',[
      '本课使用随课提供的yolov5l.yaml：入口为6×6步长2卷积，主体使用C3与SPPF，最终在P3/P4/P5三个尺度进行基于anchor的检测。具体层号和参数以这份配置及配套实现为准。',
      '按功能划分，0～9层是Backbone，10～23层是Neck，第24层是Detect。YAML把10～24都放在head字段下；功能边界不一定与配置字段同名。Backbone提取特征，Neck融合不同尺度信息，Detect产生位置、物体性和类别相关预测。',
      '统一输入为B×3×640×640，B是批次大小。图表省略B时采用C×H×W顺序。总览中的“层13→层14”合并了两个操作：层13输出512通道，层14才降为256通道。用下一节的逐层浏览器查看每一步。'
    ]],
    ['读YAML：层号、输入来源与尺寸浏览器',[
      '每行是[from, number, module, args]。from=-1表示上一层，[-1,6]表示上一层与绝对编号6的层。args中的首个数字通常是输出通道；输入通道由解析器根据来源补入。',
      '[-1,6,C3,[256]]构建一个内部有6个Bottleneck的C3。parse_model把number传给C3的n参数，并将外层构造次数设为1。本配置depth_multiple=1.0、width_multiple=1.0，因此重复次数和通道按配置值使用；这些通道也都符合8的倍数约束。',
      '点选任意层查看来源与形状；来源按钮能直接跳到被引用的层。改变输入边长或类别数，观察哪些输出会变化。这里按给定结构计算形状，属于教学推导，不执行训练或真实图像检测。'
    ]],
    ['Conv内部：卷积、BN与SiLU',[
      '这里的Conv是一块Conv2d(bias=False)→BatchNorm2d→SiLU。卷积学习空间与通道组合，BN使用训练统计量或评估时的运行统计量归一化并学习缩放/偏移，SiLU(x)=x·sigmoid(x)提供非线性。',
      '1×1卷积可以混合、压缩或扩展通道；3×3卷积还会聚合邻域。空间是否缩小取决于步长、padding等参数。每个空间维度Hout=floor((Hin+2p−d(k−1)−1)/s+1)。',
      '第0层参数[64,6,2,2]表示输出64通道、6×6核、步长2、padding2，640输入得到floor((640+4−6)/2)+1=320。64通道是学到的特征响应，不是64种物体类别。'
    ]],
    ['Backbone逐层：640如何走到20',[
      '五次步长2卷积使边长640→320→160→80→40→20。C3在这些尺度内继续提取特征，本配置中的C3不改变空间边长。第4、6层会保留给Neck做横向融合。',
      'P3/8、P4/16、P5/32中的8、16、32是相对输入的采样步长。步长与感受野不同：P3相邻位置对应约8像素采样间隔，但每个位置经过前面的网络，可以受到远大于8×8区域的影响。'
    ]],
    ['拆开C3：两路分支怎样融合',[
      '以第4层为例，c1=c2=256、n=6、e=0.5，隐藏通道int(c2·e)=128。主路经过1×1 Conv(256→128)和6个Bottleneck；旁路经过另一块1×1 Conv(256→128)。两路Concat成256通道，再经cv3的1×1 Conv融合为256通道。',
      '两条分支都读取完整输入x，再各自通过可学习卷积；源码没有先把输入通道硬切成两半。较短分支提供不同于深分支的信息与梯度路径。外部融合执行torch.cat，而非把完整输入直接加到输出。',
      'C3的“3”对应cv1、cv2、cv3三个外层Conv，内部Bottleneck还含卷积。第4层共3+2×6=15个Conv2d。下面切换不同C3，查看隐藏通道、重复次数与内部残差开关。'
    ]],
    ['进入Bottleneck：残差相加与Concat',[
      '本实现Bottleneck有两块Conv：1×1和3×3。只有shortcut=True且c1==c2时，才返回x+cv2(cv1(x))；否则只返回变换分支。这里的具体结构与常见ResNet三卷积Bottleneck不同。',
      'C3外部e=0.5得到隐藏通道后，构建内部Bottleneck明确使用e=1.0。第4层中的Bottleneck是128→128→128，没有再压成64。第二块Conv已经含SiLU，相加后源码没有额外激活。',
      '残差y=x+F(x)的梯度含I+∂F/∂x，恒等路径有助于信息和梯度传播，但不能保证任意深度的网络都没有训练困难。整网8个C3含33个Bottleneck；Backbone共21处内部残差相加，Neck的C3全部显式关闭它。',
      'Add逐元素相加，要求对应形状相同，通道数不变；Concat沿通道拼接，要求B/H/W匹配，通道数相加。C3、SPPF和Neck的拼接都不能直接当成残差连接。'
    ]],
    ['拆开SPPF：三次池化收集四种范围',[
      '第9层输入1024×20×20，cv1先降为512通道，这里的隐藏通道按c1//2计算。随后x0→y1→y2→y3连续执行三次5×5最大池化，每次stride=1、padding=2，所以四份特征都是512×20×20。',
      '把x0、y1、y2、y3沿通道拼成2048×20×20，再用cv2的1×1卷积融合到1024×20×20。池化本身没有可学习参数；前后的卷积有参数。本模块没有残差相加。',
      '相对于x0，0、1、2、3次池化对应覆盖范围1、5、9、13，因为k_eff=1+m·(5−1)。这提供类似并行5×5、9×9、13×13池化的多范围聚合；这些数字不是相对于原图的完整感受野，也没有把特征变成固定长度向量。'
    ]],
    ['FPN路径：深层信息走向高分辨率',[
      '深层特征经过更多处理，通常有更强的语义表达；较高分辨率特征保留较细的空间信息。FPN通过自顶向下路径与横向连接，让多个尺度使用更深层的信息。“顶、下”指网络层级，不是图上的纸面方向。',
      '第10层先将1024通道降到512；第11层最近邻上采样到40×40，与Backbone第6层拼接成1024通道；第13层C3输出512通道。接着第14层降到256，第15层上采样到80×80，与第4层拼接；第17层C3输出256×80×80。',
      '最近邻上采样复制特征值，没有可学习参数，也不能凭空恢复丢失的原始细节。横向连接补入另一份高分辨率特征，Concat保留两路通道，再由C3学习融合。经典FPN常采用投影后相加；本实现使用Concat和C3组织相应的融合思想。'
    ]],
    ['PAN路径：再向粗尺度聚合',[
      '第17层80×80特征已经融合了深层信息。PAN风格路径经步长2卷积再走向40×40和20×20，让较粗尺度分支也利用这条较短的信息路径。',
      '第18层下采样为256×40×40，与层14的256×40×40拼接；第20层C3输出512×40×40。第21层下采样为512×20×20，与层10的512×20×20拼接；第23层C3输出1024×20×20。',
      '特别核对：层19接层14，不是Backbone层6；层22接层10，不是直接接SPPF层9。FPN方向为20→40→80，PAN增强路径为80→40→20，两者都属于同一次前向计算。PAN自底向上不是反向传播；这段Neck也不等于原PANet的完整系统。'
    ]],
    ['Detect内部：三张特征图变成候选',[
      '第24层读取[17,20,23]，分别是256×80×80、512×40×40、1024×20×20。每个分支使用一块原生1×1 nn.Conv2d，含bias，没有套Conv块中的BN与SiLU；一块输出卷积联合产生框、物体性和类别相关数值。',
      'nc=80时，每个anchor输出4个框参数+1个objectness+80个类别数值=85；每格3个anchor，卷积输出3×85=255通道。再view/permute成B×3×H×W×85。三尺度共3×(80²+40²+20²)=25,200个候选，这不是最终物体数量。',
      'P3通常更利于小目标，P4/P5逐渐偏向较大目标，但实际匹配还受anchor、尺度等训练规则影响，不能当成不可跨越的硬分工。按本配置nc=80静态计数，未融合模型有46,563,709个可学习参数、104个Conv2d；改类别数、结构或BN融合后数字会变化。'
    ]],
    ['Anchor与解码：数字怎样成为位置框',[
      'Anchor是宽高参考模板，不是最终框，也不对应某个固定类别。P3模板为(10,13)、(16,30)、(33,23)；P4为(30,61)、(62,45)、(59,119)；P5为(116,90)、(156,198)、(373,326)。下面使用每尺度第一组模板演示。',
      '令σ为Sigmoid、(gx,gy)为网格索引、s为stride、(aw,ah)为像素anchor：bx=(2σ(tx)−0.5+gx)s，by同理；bw=(2σ(tw))²aw，bh同理。源码grid内部已经减去0.5，公式把这一偏移显式展开。',
      '本检测头的物体性与类别数值使用独立Sigmoid，类别分数不要求和为1。后处理以objectness_score×class_score计算类别置信度；这些分数不自动等于已校准的真实概率。',
      '训练时Detect返回三个尺度的原始预测张量；普通推理路径给出解码后的B×25200×85及原始张量，返回封装还会受export等模式影响。框坐标属于送入网络的缩放/填充后图片，映射回原图需撤销预处理变换。'
    ]],
    ['从网络到检测结果：NMS、损失与源码入口',[
      '标准推理流程是预处理→Backbone→FPN/PAN→Detect解码→分数筛选与NMS→坐标映射回原图→绘制结果。NMS在utils/general.py后处理中执行，没有作为YAML第25层列出。',
      '训练损失在utils/loss.py中计算：正样本定位使用CIoU相关损失，物体性与类别使用BCEWithLogitsLoss等配置，再按超参数加权。检测系统因此同时学习在哪里、是否有目标、是什么。',
      '源码阅读顺序：models/yolov5l.yaml确定层和来源；models/yolo.py的parse_model补通道、注入重复次数，_forward_once按from取输入，Detect.forward产生预测；models/common.py展开Conv、Bottleneck、C3、SPPF。改配置、类别或加载权重时，必须核对代码版本与张量形状。'
    ]]
  ];
  // Preserve earlier answers in a history field; their indices refer to the previous four-section course.
  if(typeof state!=='undefined'&&state.yolov5lLessonRevision!=='20261020'){
    const old=Object.fromEntries(Object.entries(state.exerciseAnswers||{}).filter(([key])=>key.startsWith('architecture:')));
    if(Object.keys(old).length)state.architecturePreviousAnswers=old;
    Object.keys(old).forEach(key=>delete state.exerciseAnswers[key]);
    state.yolov5lLessonRevision='20261020';
    try{localStorage.setItem('visionlab-state',JSON.stringify(state));}catch{}
  }
  lesson.sections=contents.map(([title,paragraphs],i)=>({title:(i+1)+'. '+title,paragraphs,exercise:quiz[i]}));
  lesson.sections[1].code='# YAML: [-1, 6, C3, [256]]\n# from=-1: 上一层；n=6: 一个C3内部含6个Bottleneck\nfrom models.common import C3\nblock = C3(256, 256, n=6, shortcut=True, e=0.5)\nprint(block)';
  lesson.sections[4].code='def forward(self, x):\n    main = self.m(self.cv1(x))\n    bypass = self.cv2(x)\n    return self.cv3(torch.cat((main, bypass), dim=1))';
  lesson.sections[5].code='self.add = shortcut and c1 == c2\n# cv1、cv2 均为包含BN和SiLU的Conv块\nreturn x + self.cv2(self.cv1(x)) if self.add else self.cv2(self.cv1(x))';
  lesson.sections[6].code='x0 = self.cv1(x)\ny1 = self.m(x0)\ny2 = self.m(y1)\ny3 = self.m(y2)\nreturn self.cv2(torch.cat((x0, y1, y2, y3), 1))';
  lesson.code='from models.yolo import Model\nimport torch\n\nmodel = Model("models/yolov5l.yaml", ch=3, nc=80).eval()\nprint(model.model[4])   # C3的两路卷积和内部6个Bottleneck\nprint(model.model[9])   # SPPF的两块卷积与MaxPool\nprint(model.model[24])  # 三个1×1输出卷积\n\nwith torch.inference_mode():\n    decoded, raw = model(torch.zeros(1, 3, 640, 640))\nprint(decoded.shape)    # [1, 25200, 85]\nprint([x.shape for x in raw])\n# [1,3,80,80,85], [1,3,40,40,85], [1,3,20,20,85]';
  lesson.language='Python';
  lesson.keypoints=[
    '层0～9提取特征，10～23融合特征，层24读取17/20/23做三尺度检测。',
    'C3的重复数作用于内部Bottleneck；外部融合为Concat，内部可选残差为Add。',
    'Backbone的C3共有21处内部残差，Neck四个C3的shortcut均为False。',
    'SPPF串联三次k5/s1/p2池化，空间不变，四路通道拼接后融合。',
    'FPN为20→40→80，PAN风格增强为80→40→20；二者均为前向计算。',
    'nc=80时每分支255输出通道，共25,200候选；独立Sigmoid、解码和后处理共同产生结果。'
  ];
  lesson.worked={title:'从一个P3网格手算候选框',prompt:'P3的stride=8，网格索引(gx,gy)=(10,20)，anchor=(10,13)。框、物体性和某类别的原始数值均为0，解码结果是什么？',solution:'Sigmoid(0)=0.5。bx=(1−0.5+10)×8=84，by=164，bw=(2×0.5)²×10=10，bh=13；物体性与该类分数均为0.5，组合类别置信度为0.25。坐标仍处于网络输入画布中，后面还需筛选和NMS。'};
  lesson.chapterExercises=[quiz[1],quiz[5],quiz[9],quiz[11]];
  lesson.quiz=quiz[9];
  lesson.sources=[
    {label:'Ultralytics YOLOv5：模型架构说明',url:'https://docs.ultralytics.com/yolov5/tutorials/architecture_description/'},
    {label:'FPN原论文：自顶向下与横向连接',url:'https://arxiv.org/abs/1612.03144'},
    {label:'PANet原论文：自底向上路径增强',url:'https://arxiv.org/abs/1803.01534'},
    {label:'YOLOv5官方源码：Conv、Bottleneck、C3、SPPF',url:'https://github.com/ultralytics/yolov5/blob/master/models/common.py'},
    {label:'YOLOv5官方源码：配置解析与Detect',url:'https://github.com/ultralytics/yolov5/blob/master/models/yolo.py'}
  ];
  const table=(head,body)=>'<div class="yl-table-scroll" tabindex="0" aria-label="可横向滚动的数据表"><table><thead><tr>'+head.map(x=>'<th>'+x+'</th>').join('')+'</tr></thead><tbody>'+body.map(r=>'<tr>'+r.map(x=>'<td>'+x+'</td>').join('')+'</tr>').join('')+'</tbody></table></div>';
  const layerTable=(first,last)=>table(['层','来源','模块 / 内部次数','关键参数','输出 C×H×W'],rows.slice(first,last+1).map(r=>[r.i,sourceIds(r).join(', '),r.type+(r.type==='C3'?' · n='+r.n:''),r.args,shape(r.i)]));
  const figure=(file,alt,caption)=>'<figure class="yl-figure"><a href="'+asset+file+'" target="_blank" rel="noopener"><img src="'+asset+file+'" alt="'+alt+'" loading="lazy" width="1600" height="1000"><span>打开大图 ↗</span></a><figcaption>'+caption+'</figcaption></figure>';
  function explorer(){return '<section class="yl-lab" data-yl-explorer><span class="yl-eyebrow">LAYER EXPLORER · 逐层追踪</span><h3>点一层，看它从哪里读入</h3><div class="yl-settings"><label>输入边长<select data-yl-side aria-label="模型输入边长"><option>320</option><option selected>640</option><option>960</option></select></label><label>类别数 nc<select data-yl-nc aria-label="检测类别数"><option>1</option><option>2</option><option selected>80</option></select></label></div><div class="yl-layer-buttons" role="group" aria-label="选择0到24层">'+rows.map(r=>'<button type="button" data-yl-layer="'+r.i+'" aria-pressed="false"><b>'+r.i+'</b> '+r.type+'</button>').join('')+'</div><div class="yl-detail" data-yl-detail aria-live="polite"></div><div class="yl-navigation"><button type="button" data-yl-prev>← 上一层</button><button type="button" data-yl-next>下一层 →</button></div><p class="yl-small">尺寸省略批次B，按C×H×W书写。输入选项均为32的倍数；教学计算不运行模型。</p></section>';}
  function updateExplorer(root){
    const id=Number(root.dataset.layer||0),r=rows[id],side=Number(root.querySelector('[data-yl-side]').value),nc=Number(root.querySelector('[data-yl-nc]').value),ids=sourceIds(r);
    const ins=ids.map(i=>'<div><span>'+ (i<0?'输入图片':'层'+i)+'</span><code>'+shape(i,side)+'</code></div>').join('');
    const output=id===24?'三分支：'+[8,16,32].map(s=>'B×3×'+side/s+'×'+side/s+'×'+(nc+5)).join('；'):shape(id,side);
    const result=id===24?'<p><b>'+3*(nc+5)+'输出通道 / 分支</b>；'+(3*((side/8)**2+(side/16)**2+(side/32)**2)).toLocaleString('en-US')+'个候选，单候选'+(nc+5)+'个数。</p>':'';
    root.querySelector('[data-yl-detail]').innerHTML='<span class="yl-chip">'+(id<10?'Backbone':id<24?'Neck':'Detect')+'</span><h4>层'+id+' · '+r.type+'</h4><div class="yl-shape-flow">'+ins+'<b aria-hidden="true">→</b><div><span>输出</span><code>'+output+'</code></div></div><p>'+r.note+'</p>'+result+'<div class="yl-source-links">来源：'+ids.map(i=>i<0?'<span>输入图片</span>':'<button type="button" data-yl-layer="'+i+'">查看层'+i+'</button>').join(' ')+'</div>';
    root.querySelectorAll('.yl-layer-buttons button').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.ylLayer)===id)));
    root.querySelector('[data-yl-prev]').disabled=id===0;root.querySelector('[data-yl-next]').disabled=id===24;
  }
  function c3Explorer(){return '<section class="yl-lab" data-yl-c3><span class="yl-eyebrow">MODULE INSPECTOR · 模块参数</span><h3>同名C3，内部残差开关并不相同</h3><label class="yl-select-label">选择C3所在层<select data-yl-c3-layer aria-label="选择C3所在层">'+rows.filter(r=>r.type==='C3').map(r=>'<option value="'+r.i+'"'+(r.i===4?' selected':'')+'>层'+r.i+' · '+(r.i<10?'Backbone':'Neck')+'</option>').join('')+'</select></label><div data-yl-c3-output aria-live="polite"></div></section>';}
  function updateC3(root){const id=Number(root.querySelector('select').value),r=rows[id],input=rows[id-1].c,h=r.c/2,add=id<10;root.querySelector('[data-yl-c3-output]').innerHTML='<div class="yl-stats"><div><span>输入 → 输出</span><strong>'+input+' → '+r.c+'</strong></div><div><span>隐藏通道</span><strong>'+h+'</strong></div><div><span>Bottleneck数</span><strong>'+r.n+'</strong></div><div><span>内部残差数</span><strong>'+ (add?r.n:0)+'</strong></div></div><div class="yl-route"><span>主路：'+input+' → '+h+' → '+r.n+'个Bottleneck</span><span>旁路：'+input+' → '+h+'</span><span>Concat：'+(2*h)+' → cv3 → '+r.c+'</span></div><p class="yl-readout">shortcut='+add+'；内部Bottleneck均使用e=1.0。该C3共有'+(3+2*r.n)+'个Conv2d。'+(add?'每个Bottleneck执行x+F(x)。':'内部只执行F(x)，C3两路分支与Concat仍然存在。')+'</p>';}
  function addConcat(){return '<section class="yl-lab" data-yl-merge><h3>同样两份特征，换一种合并方式</h3><div class="yl-segment" role="group" aria-label="选择合并运算"><button type="button" data-yl-merge-mode="add" aria-pressed="true">逐元素 Add</button><button type="button" data-yl-merge-mode="concat" aria-pressed="false">通道 Concat</button></div><div data-yl-merge-output aria-live="polite"></div></section>';}
  function updateMerge(root,mode='add'){const add=mode==='add';root.querySelectorAll('[data-yl-merge-mode]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.ylMergeMode===mode)));root.querySelector('[data-yl-merge-output]').innerHTML='<div class="yl-route"><span>A：128×80×80</span><span>'+ (add?'+':'Concat(dim=1)')+'</span><span>B：128×80×80</span><span>→ '+(add?'128':'256')+'×80×80</span></div><p class="yl-readout">'+(add?'同位置、同通道相加，通道数保持128。例：A=2、B=3，对应输出为5。':'两组通道依次保留，通道数变成256。例：A=2、B=3，不会直接加成5；后续卷积再学习融合。')+'</p>';}
  function sppfSteps(){return '<section class="yl-lab" data-yl-sppf><h3>沿着池化链走一步</h3><div class="yl-segment" role="group" aria-label="选择SPPF池化分支">'+['x0 · 原分支','y1 · 第1次','y2 · 第2次','y3 · 第3次'].map((s,i)=>'<button type="button" data-yl-pool="'+i+'" aria-pressed="'+(i===0)+'">'+s+'</button>').join('')+'</div><p class="yl-readout" data-yl-pool-note aria-live="polite"></p></section>';}
  function updatePool(root,i=0){root.querySelectorAll('[data-yl-pool]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.ylPool)===i)));root.querySelector('[data-yl-pool-note]').textContent=(i===0?'x0尚未经过池化。':'连续'+i+'次5×5最大池化。')+'相对x0的覆盖范围为'+(1+4*i)+'×'+(1+4*i)+'；当前形状仍为512×20×20。四路全部收集后，共4×512=2048通道。';}
  function decoder(){return '<section class="yl-lab" data-yl-decoder><span class="yl-eyebrow">BOX DECODER · 候选框解码</span><h3>调节原始分数，看框的位置与宽高</h3><p class="yl-small">固定640×640输入、网格(gx,gy)=(10,10)，使用每尺度第一组anchor。tx=ty、tw=th用于减少控制项。</p><label class="yl-select-label">检测尺度<select data-yl-decode-scale aria-label="解码检测尺度"><option value="8">P3 / stride 8 / anchor 10×13</option><option value="16">P4 / stride 16 / anchor 30×61</option><option value="32" selected>P5 / stride 32 / anchor 116×90</option></select></label><div class="yl-decode-grid"><svg viewBox="0 0 640 640" role="img" aria-label="640画布中的解码预测框"><defs><pattern id="yl-grid" width="32" height="32" patternUnits="userSpaceOnUse"><path d="M32 0H0V32" fill="none" stroke="#ddd7e9" stroke-width="1"/></pattern></defs><rect width="640" height="640" fill="#f8f6fc"/><rect width="640" height="640" fill="url(#yl-grid)"/><rect data-yl-cell fill="#dbd2ef"/><rect data-yl-decoded-box fill="#7f67b8" fill-opacity=".15" stroke="#7153ab" stroke-width="5"/><circle data-yl-center r="6" fill="#257e6c"/><text x="20" y="36" fill="#5e5079" font-size="23">网络输入画布 · 640×640</text></svg><div class="yl-decoder-controls"><label>tx = ty <output data-yl-xy-value>0.0</output><input type="range" min="-2" max="2" step="0.1" value="0" data-yl-xy aria-label="中心位置原始分数"></label><label>tw = th <output data-yl-wh-value>0.0</output><input type="range" min="-2" max="2" step="0.1" value="0" data-yl-wh aria-label="宽高原始分数"></label><button type="button" data-yl-reset>恢复零分数</button><div class="yl-decode-values" data-yl-decode-values aria-live="polite"></div></div></div><p class="yl-small">浅紫格为所选网格，绿点为框中心；这是公式演示，不是训练模型的真实预测。物体性与类别原始分数固定为0，组合分数为0.25。</p></section>';}
  function updateDecoder(root){const s=Number(root.querySelector('[data-yl-decode-scale]').value),anchors={8:[10,13],16:[30,61],32:[116,90]},[aw,ah]=anchors[s],xy=Number(root.querySelector('[data-yl-xy]').value),wh=Number(root.querySelector('[data-yl-wh]').value),sigmoid=x=>1/(1+Math.exp(-x)),center=(2*sigmoid(xy)-.5+10)*s,w=(2*sigmoid(wh))**2*aw,h=(2*sigmoid(wh))**2*ah;
    root.querySelector('[data-yl-xy-value]').textContent=xy.toFixed(1);root.querySelector('[data-yl-wh-value]').textContent=wh.toFixed(1);
    const rect=root.querySelector('[data-yl-decoded-box]');Object.entries({x:center-w/2,y:center-h/2,width:w,height:h}).forEach(([k,v])=>rect.setAttribute(k,v));
    const cell=root.querySelector('[data-yl-cell]');Object.entries({x:10*s,y:10*s,width:s,height:s}).forEach(([k,v])=>cell.setAttribute(k,v));
    const point=root.querySelector('[data-yl-center]');point.setAttribute('cx',center);point.setAttribute('cy',center);
    const grid=root.querySelector('#yl-grid');grid.setAttribute('width',s);grid.setAttribute('height',s);grid.querySelector('path').setAttribute('d','M'+s+' 0H0V'+s);
    root.querySelector('[data-yl-decode-values]').innerHTML='<span>中心 bx / by</span><strong>'+center.toFixed(1)+' / '+center.toFixed(1)+' px</strong><span>宽 bw / 高 bh</span><strong>'+w.toFixed(1)+' / '+h.toFixed(1)+' px</strong><span>σ(位置) / σ(宽高)</span><strong>'+sigmoid(xy).toFixed(3)+' / '+sigmoid(wh).toFixed(3)+'</strong>';
  }
  function render(index){
    if(index===0)return '<div class="yl-materials">'+figure('overview.webp','YOLOv5l的Backbone、FPN、PAN与三尺度检测信息流','节点按功能分组；逐层尺寸与来源见下一节。')+'<a class="yl-link" href="'+asset+'overview.html" target="_blank" rel="noopener">打开可缩放与追踪的结构图 ↗</a><a class="yl-link" href="'+asset+'yolov5l.yaml" download>下载本课模型配置 ↓</a></div>';
    if(index===1)return explorer();
    if(index===2)return '<div class="yl-route"><span>Conv2d<br>bias=False</span><b>→</b><span>BatchNorm2d</span><b>→</b><span>SiLU</span></div>';
    if(index===3)return layerTable(0,9);
    if(index===4)return figure('c3-bottleneck.webp','第4层C3的两条分支、6个Bottleneck以及内部残差相加','图固定演示层4；下方浏览器可对照其他C3的参数。')+c3Explorer();
    if(index===5)return addConcat()+table(['层号','输入→输出C','隐藏C','n','内部残差'],rows.filter(r=>r.type==='C3').map(r=>[r.i,rows[r.i-1].c+' → '+r.c,r.c/2,r.n,r.i<10?'开启':'关闭']));
    if(index===6)return figure('sppf.webp','SPPF串联三次5×5池化，收集1、5、9、13范围，再拼接和卷积融合','所有池化stride=1、padding=2，20×20空间尺寸保持不变。')+sppfSteps();
    if(index===7)return layerTable(10,17)+'<p class="yl-readout">横向来源：层6 → 层12；层4 → 层16。融合后的层17进入P3检测分支。</p>';
    if(index===8)return layerTable(18,23)+'<p class="yl-readout">横向来源：层14 → 层19；层10 → 层22。层20、23分别进入P4、P5检测分支。</p>';
    if(index===9)return table(['分支 / 来源','输入 C×H×W','训练张量（含B）','候选数'],[['P3 / 层17','256×80×80','B×3×80×80×85','19,200'],['P4 / 层20','512×40×40','B×3×40×40×85','4,800'],['P5 / 层23','1024×20×20','B×3×20×20×85','1,200']])+'<p class="yl-readout">想改变输入或nc，回到逐层浏览器并选择层24，比较候选数和单候选维度。</p><button class="yl-link" type="button" data-yl-jump="24">在逐层浏览器查看Detect ↑</button>';
    if(index===10)return decoder();
    if(index===11)return '<div class="yl-route"><span>预处理</span><b>→</b><span>Backbone</span><b>→</b><span>FPN / PAN</span><b>→</b><span>Detect解码</span><b>→</b><span>筛选 / NMS</span></div><p class="yl-small">随课配置保留Ultralytics YOLOv5原始许可说明，见<a href="'+asset+'LICENSE.txt" target="_blank" rel="noopener">AGPL-3.0许可文本</a>。官方仓库可能更新，逐层表以随课配置为准。</p>';
    return '';
  }
  const previous=window.lessonPlaygrounds||{};
  window.lessonPlaygrounds={render(id,index){return id==='architecture'?render(index):(previous.render?.(id,index)||'');},initialize(){previous.initialize?.();document.querySelectorAll('[data-yl-explorer]').forEach(updateExplorer);document.querySelectorAll('[data-yl-c3]').forEach(updateC3);document.querySelectorAll('[data-yl-merge]').forEach(root=>updateMerge(root));document.querySelectorAll('[data-yl-sppf]').forEach(root=>updatePool(root));document.querySelectorAll('[data-yl-decoder]').forEach(updateDecoder);}};
  document.addEventListener('click',event=>{
    const button=event.target.closest('button');if(!button)return;
    const explorerRoot=button.closest('[data-yl-explorer]');
    if(explorerRoot){if(button.dataset.ylLayer!==undefined)explorerRoot.dataset.layer=button.dataset.ylLayer;else if(button.hasAttribute('data-yl-prev'))explorerRoot.dataset.layer=String(Math.max(0,Number(explorerRoot.dataset.layer||0)-1));else if(button.hasAttribute('data-yl-next'))explorerRoot.dataset.layer=String(Math.min(24,Number(explorerRoot.dataset.layer||0)+1));else return;updateExplorer(explorerRoot);return;}
    if(button.dataset.ylMergeMode){updateMerge(button.closest('[data-yl-merge]'),button.dataset.ylMergeMode);return;}
    if(button.dataset.ylPool!==undefined){updatePool(button.closest('[data-yl-sppf]'),Number(button.dataset.ylPool));return;}
    if(button.hasAttribute('data-yl-reset')){const root=button.closest('[data-yl-decoder]');root.querySelector('[data-yl-xy]').value='0';root.querySelector('[data-yl-wh]').value='0';updateDecoder(root);return;}
    if(button.dataset.ylJump!==undefined){const root=document.querySelector('[data-yl-explorer]');if(root){root.dataset.layer=button.dataset.ylJump;updateExplorer(root);root.scrollIntoView({behavior:'smooth',block:'start'});}}
  });
  document.addEventListener('change',event=>{if(event.target.matches('[data-yl-side],[data-yl-nc]'))updateExplorer(event.target.closest('[data-yl-explorer]'));else if(event.target.matches('[data-yl-c3-layer]'))updateC3(event.target.closest('[data-yl-c3]'));else if(event.target.matches('[data-yl-decode-scale]'))updateDecoder(event.target.closest('[data-yl-decoder]'));});
  document.addEventListener('input',event=>{if(event.target.matches('[data-yl-xy],[data-yl-wh]'))updateDecoder(event.target.closest('[data-yl-decoder]'));});
})();
