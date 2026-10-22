/* 深度学习与计算机视觉：按核心概念拆分为短课，并保留原章节与学习记录。 */
(()=>{
  const catalog=typeof lessons!=='undefined'?lessons:window.lessons;
  const curriculum=window.visionlabFoundationCurriculum;
  if(!catalog||!curriculum)return;
  const esc=v=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const stripNumber=v=>String(v||'').replace(/^\s*(?:\d+[.、]|[一二三四五六七八九十]+[、.])\s*/, '').trim();
  const unit=(id,title,sections,time,desc,options={})=>({id,title,sections,time,desc,...options});
  const source=(from,units)=>({from,units});
  const plan={
    dl:[
      source('ai-foundations',[
        unit('ai-foundations','AI 入门：数据、模型和神经元',[0,1],15,'先弄清模型接收什么数据、怎样做计算、怎样给出答案；用一个乘加例子认识神经元。'),
        unit('ai-layers','神经网络怎样学习：层、参数与调整',[2,3],15,'把多个计算层连成网络，再看训练怎样逐步调整权重和偏置。')
      ]),
      source('tensor',[
        unit('tensor','张量 1：标量、向量、矩阵和形状',[0,1],15,'从一个数字、数字列表和表格开始，读懂张量有几维、每一维有多长。'),
        unit('tensor-indexing','张量 2：多维索引与切片',[2,3],15,'用具体下标从多维数据中取出一个值、一行或一块区域。'),
        unit('tensor-operations','张量 3：计算规则与形状对齐',[4,5],15,'比较逐元素运算和矩阵运算，并在计算前检查形状是否匹配。'),
        unit('tensor-layout','张量 4：重塑、换轴与内存布局',[6,7,8],20,'区分改变形状和交换维度，并认识连续存储、步长与视图的关系。')
      ]),
      source('network',[
        unit('network','神经元：权重、偏置与一次乘加',[0],15,'逐步计算一个神经元：输入乘权重、求和、加偏置，得到原始输出。'),
        unit('network-activation','激活函数：多层网络怎样学会弯曲',[1,2],15,'观察非线性函数怎样改变神经元输出，以及为什么仅叠线性层不够。'),
        unit('network-outputs','模型输出：分类分数与连续数值',[3],15,'比较分类任务给出的分数与回归任务给出的数值，先认清输出代表什么。')
      ]),
      source('losses',[
        unit('losses','损失起点：任务、标签与模型分数',[0,1,2],20,'从“模型要回答什么”开始，区分单选、多选和连续数值问题，再认识损失的作用。'),
        unit('loss-probabilities','Sigmoid 与 Softmax：分数怎样变成概率',[3],15,'用小数字演算 Sigmoid 和 Softmax，比较二分类、多分类与多标签场景。'),
        unit('loss-cross-entropy','交叉熵：正确类概率越低，惩罚越大',[4],15,'从真实类别的概率出发理解交叉熵，并看清 logits、概率和标签的先后关系。')
      ]),
      source('gradient',[
        unit('gradient','梯度 1：导数、斜率和改错方向',[0,1,2],15,'先用一元函数的斜率理解导数，再把多个参数的变化方向称为梯度。'),
        unit('gradient-chain-rule','梯度 2：链式法则与反向传播',[3,4,5],20,'顺着计算步骤把最终误差传回前面的参数，理解链式法则怎样逐层工作。'),
        unit('gradient-diagnostics','梯度 3：一次更新、清零与常见异常',[6,7],15,'分清清零、反向计算和更新；辨认梯度过大、为零或未生成时的现象。')
      ]),
      source('optimizer',[
        unit('optimizer','优化器 1：梯度与学习率',[0,1],15,'梯度提供方向，学习率控制步幅；用简单数值手算一次 SGD 更新。'),
        unit('optimizer-momentum','优化器 2：批次、动量与 Adam',[2,3,4,5],20,'观察批次怎样组成更新，比较动量如何累积方向、Adam 如何调整每个参数的步幅。'),
        unit('optimizer-tuning','优化器 3：AdamW、调度器与梯度裁剪',[6,7],15,'认识常见训练设置分别控制什么，并知道何时查看学习率变化和梯度范围。')
      ]),
      source('training',[
        unit('training-data-splits','训练循环 1：训练集、验证集与测试集',[0,1],15,'用“练习、模拟考、正式考试”的比喻，区分三类数据各自的职责。'),
        unit('training-loop','训练循环 2：batch、epoch 到一次完整更新',[2,3],20,'把数据批次、前向计算、损失、反向传播、参数更新和验证串成完整流程。')
      ]),
      source('checkpoints',[
        unit('checkpoints','模型保存 1：结构、参数与检查点',[0,1],15,'分清模型结构、学到的权重和用于恢复训练的检查点各自保存什么。'),
        unit('checkpoint-inference','模型保存 2：文件格式与推理部署',[2,3],15,'根据保存方式判断文件能否直接推理、是否能继续训练，以及怎样加载。')
      ]),
      source('regularization',[
        unit('regularization','泛化 1：训练成绩好，为什么新数据会错',[0,1],15,'从练习题与新题的差异理解过拟合、泛化和正则化。'),
        unit('regularization-data','泛化 2：数据增强与合理变化',[2,3],15,'观察图像增强如何增加训练变化，并区分训练时处理与评估时处理。'),
        unit('regularization-diagnostics','泛化 3：从曲线和样本判断问题',[4,5],15,'比较训练与验证表现，结合错误样本判断欠拟合、过拟合或数据不足。')
      ]),
      source('network-extensions',[
        unit('network-extensions','网络模块 1：BatchNorm 稳定中间数值',[0],15,'先认识一批数值的平均水平和波动，再理解 BatchNorm 对中间特征的处理。'),
        unit('network-activations','网络模块 2：SiLU 与 GELU',[1],15,'把常用激活函数画出来，比较它们如何平滑地保留或压低输入。'),
        unit('network-gated-activations','网络模块 3：SwiGLU 与门控激活',[2,3],15,'用“信息阀门”理解门控激活，并比较它与普通逐点激活的计算差异。')
      ]),
      source('loss-theory',[
        unit('loss-theory','损失推导 1：信息量与熵',[0],15,'从罕见事件更令人意外的直觉出发，理解信息量和熵怎样描述不确定性。'),
        unit('loss-theory-cross-entropy','损失推导 2：交叉熵与分布差异',[1],15,'用真实分布和模型分布比较预测质量，并连接到分类交叉熵。')
      ]),
      source('loss-gradients',[
        unit('loss-gradients','损失梯度 1：错误概率怎样产生修正信号',[0],15,'观察预测概率变化时损失如何变化，理解错误信号从哪里来。'),
        unit('loss-gradients-softmax','损失梯度 2：Softmax 与交叉熵的组合',[1],15,'把 Softmax 与交叉熵放在一起看，理解常见分类梯度的方向和含义。')
      ]),
      source('loss-implementation',[
        unit('loss-implementation','损失实现 1：类别不平衡与加权',[0],15,'当某些类别很少时，理解类别权重如何改变不同样本对损失的贡献。'),
        unit('loss-stability','损失实现 2：reduction 与数值稳定',[1,2],20,'比较逐样本损失的求和与平均，并理解 logits 输入为何有助于稳定计算。')
      ]),
      source('loss-regression',[
        unit('loss-regression','回归损失：预测数值偏差怎样计分',[0],15,'从一个真实数值和预测数值出发，理解回归损失如何衡量偏差。')
      ]),
      source('training-engineering',[
        unit('training-engineering','训练工程 1：最后一个不完整批次',[0],15,'认识每轮数据末尾的较小批次，并判断保留或丢弃它的影响。'),
        unit('training-accumulation','训练工程 2：梯度累积与排错',[1,2],20,'理解梯度累积如何模拟较大批次，并按顺序定位常见训练问题。')
      ])
    ],
    cv:[
      source('tasks',[
        unit('tasks','视觉任务 1：分类、检测与分割',[0,4,3],15,'先看输出是什么：整图类别、目标位置与类别，或每个像素的类别。'),
        unit('tasks-models','视觉任务 2：检测框、分割掩码与输出步骤',[1,2],15,'比较模型交付矩形框、像素区域或进一步处理后结果时，答案粒度有什么不同。'),
        unit('tasks-beyond-detection','视觉任务 3：关键点、跟踪与任务共性',[5,6,7],15,'认识其他常见视觉任务，并抽出输入、特征和任务输出这条共同主线。')
      ]),
      source('image',[
        unit('image','图像 1：像素、颜色通道与数值范围',[0,1],15,'从彩色小图开始，认识像素、RGB 通道、张量轴和像素数值的表示。'),
        unit('image-preprocessing','图像 2：缩放、裁剪与预处理',[2,3],15,'理解图像尺寸变化和归一化，并检查预处理是否改变了目标位置。')
      ]),
      source('cnn',[
        unit('cnn','卷积 1：卷积核怎样在图片上找特征',[0,1,2],20,'拿一个小卷积核逐格计算，观察边缘、纹理等局部模式怎样变成特征图。'),
        unit('cnn-shapes','卷积 2：通道、参数量和输出尺寸',[3,4,5],20,'逐步计算卷积输出的高宽、通道数和参数量，分清卷积核与特征图。')
      ]),
      source('pooling',[
        unit('pooling','池化 1：窗口、步幅与下采样',[0,1,2],15,'用小网格演算最大池化和平均池化，观察空间尺寸怎样缩小。'),
        unit('pooling-tradeoffs','池化 2：位移容忍与细节损失',[3,4],15,'理解下采样为什么能减少计算，也会带走哪些位置细节。')
      ]),
      source('cnn-priors',[
        unit('cnn-priors','卷积的优势：局部连接、共享权重与平移',[0,1,2],20,'比较全连接和卷积连接方式，理解卷积核为何能在不同位置重复使用。'),
        unit('cnn-priors-limits','卷积的边界：参数、全连接与端到端流程',[3,4,5],20,'认识卷积的归纳偏置和适用边界，并把图像到输出的步骤接起来。')
      ]),
      source('cnn-architectures',[
        unit('cnn-architectures','经典 CNN 1：LeNet-5 与手写数字',[0,3],20,'沿着 LeNet-5 的卷积、池化和分类层逐步看尺寸变化，再联系手写数字识别。'),
        unit('cnn-alexnet','经典 CNN 2：AlexNet 与深度视觉学习',[1],15,'了解 AlexNet 的关键结构选择，以及它在大规模图像分类中的历史作用。'),
        unit('cnn-vgg','经典 CNN 3：VGG 与重复的小卷积块',[2],15,'观察 VGG 如何重复堆叠小卷积核，并理解深度、参数量与计算量的关系。')
      ]),
      source('cnn-residual',[
        unit('cnn-residual','残差网络 1：深层网络为何需要捷径',[0,1],15,'从深层网络的优化困难出发，画出输入捷径与主分支如何相加。'),
        unit('cnn-residual-shapes','残差网络 2：残差块与形状对齐',[2],15,'检查残差相加前的张量形状，并认识通道或尺寸变化时的对齐方法。')
      ]),
      source('receptive-field',[
        unit('receptive-field','感受野：一层层扩大能看到的范围',[0,1],15,'用卷积核与步幅逐层计算理论感受野，并区分理论范围和实际影响。'),
        unit('feature-pyramid','多尺度特征：小目标与大目标都要看见',[2],15,'理解不同分辨率的特征各自保留什么，再看 FPN、PAN 一类结构为何融合尺度。')
      ]),
      source('transfer',[
        unit('transfer','迁移学习：预训练权重从哪里来',[0,1],15,'把已有模型当作学习过通用视觉模式的起点，理解冻结参数的作用。'),
        unit('fine-tuning','微调：标签、解冻与公平比较',[2,3],15,'检查新任务类别映射和权重匹配，再设计逐步解冻与公平验证。')
      ]),
      source('iou',[
        unit('iou','边界框与 IoU 1：坐标和交并比',[0,1],15,'认识常见边界框坐标表示，再用矩形面积理解交集与并集。'),
        unit('iou-calculation','边界框与 IoU 2：手算、范围和用途',[2,3],15,'手算一组预测框与真实框的 IoU，并分清它衡量位置重合而非类别正确。')
      ]),
      source('metrics',[
        unit('metrics','检测指标 1：TP、FP、FN、Precision 与 Recall',[0,1],20,'用预测框逐个匹配真实目标，再数清正确、误报和漏报。'),
        unit('metrics-map','检测指标 2：AP、mAP、IoU 阈值与 NMS',[2,3],20,'从不同置信度下的查准率和查全率理解 AP、mAP，并认识 NMS 去重。')
      ]),
      source('dataset',[
        unit('dataset','数据准备 1：标注规则、目录与类别',[0,1],15,'先统一类别名称和框标注规则，再读懂图片、标签和配置文件之间的关系。'),
        unit('dataset-split','数据准备 2：训练验证划分与可视化抽查',[2,3],15,'检查数据划分是否可靠，并把标签叠回图片抽查位置和类别。'),
        unit('dataset-check','数据准备 3：路径、空标签与开训前体检',[4,5],15,'按路径、标签格式、类别编号和样本抽查清单完成开训前检查。')
      ]),
      source('data-quality',[
        unit('data-quality','数据质量 1：代表性、泄漏与公平划分',[0,1],15,'判断数据能否代表实际场景，并用分组切分减少相似样本泄漏。'),
        unit('data-diagnosis','数据质量 2：类别不平衡、噪声与错误样本',[2,3],15,'区分类别数量偏差和标注噪声，再按错误样本寻找数据改进方向。')
      ]),
      source('augmentation',[
        unit('augmentation','图像增强 1：翻转、裁剪与边界框同步',[0,1],15,'观察几何变换怎样作用于图片，也同步修改检测框位置。'),
        unit('augmentation-evaluation','图像增强 2：颜色变化与验证检查',[2,3],15,'认识颜色增强的作用，并用验证集检查增强是否符合真实场景。')
      ]),
      source('quaternion',[
        unit('euler-angles','三维旋转 1：欧拉角与旋转顺序',[4,5],20,'从三个方向角开始，比较旋转顺序，并用图示理解万向节锁。',{prereq:'会辨认 x、y、z 三个空间方向即可；角度单位和旋转顺序会在本课说明。',chapterExercises:[{q:'用欧拉角记录一个朝向时，除了三个角的数值，还必须说明什么？',options:['旋转轴与旋转顺序等约定','图像的 RGB 颜色顺序','神经网络的层数'],answer:0,why:'三个角本身不足以唯一说明姿态；要明确绕哪些轴、按什么顺序转，以及使用的坐标和角度单位。'}]}),
        unit('quaternion','三维旋转 2：向量、轴角与四元数',[0,1,2],20,'从绕轴旋转开始，读懂单位四元数怎样紧凑表示三维姿态。'),
        unit('quaternion-compose','三维旋转 3：多次旋转怎样组合',[3],15,'把一次旋转接在另一次后面，观察乘法顺序为什么会改变最终朝向。'),
        unit('quaternion-compare','三维旋转 4：四元数、矩阵与实现约定',[6,7],15,'比较常见旋转表示，并核对坐标系、乘法方向和单位化等实现约定。')
      ])
    ]
  };

  const sources=new Map(catalog.map(l=>[l.id,l]));
  const bySource={dl:plan.dl,cv:plan.cv};
  const oldToUnits=new Map(),sectionOwner=new Map(),newById=new Map();
  const replacements={dl:[],cv:[]};
  for(const key of ['dl','cv']){
    for(const entry of plan[key]){
      const base=sources.get(entry.from);
      if(!base)throw new Error('Missing course to split: '+entry.from);
      const assigned=entry.units.flatMap(u=>u.sections),expected=base.sections.map((_,i)=>i);
      if(assigned.length!==expected.length||new Set(assigned).size!==expected.length||expected.some(i=>!assigned.includes(i)))throw new Error('Course sections are missing or duplicated: '+entry.from);
      const pieces=[];
      for(let i=0;i<entry.units.length;i++){
        const spec=entry.units[i],isFirst=i===0,isLast=i===entry.units.length-1;
        if(newById.has(spec.id))throw new Error('Duplicate micro-course id: '+spec.id);
        const sections=spec.sections.map((index,n)=>{
          const original=base.sections[index];
          const copy={...original,title:(n+1)+'. '+stripNumber(original.title)};
          if(Array.isArray(original.paragraphs))copy.paragraphs=original.paragraphs.slice();
          sectionOwner.set(entry.from+'|'+original.id,{lesson:spec.id,section:copy,source:entry.from});
          sectionOwner.set(entry.from+'|'+original.legacyIndex,{lesson:spec.id,section:copy,source:entry.from});
          return copy;
        });
        const sectionNames=sections.map(s=>stripNumber(s.title)).filter(Boolean);
        const goals=sectionNames.slice(0,2).map(name=>'理解“'+name+'”在本课中解决什么问题。');
        if(goals.length<2)goals.push('结合图示或算例，说清输入、关键步骤和结果之间的关系。');
        const l={...base,id:spec.id,title:spec.title,desc:spec.desc,sections,time:spec.time,level:base.curriculumOptional?'选学':'基础',
          goals,keypoints:goals,prereq:spec.prereq||base.prereq,prereqLinks:[],curriculumIntro:spec.desc,curriculumKey:key,
          curriculumOptional:false,curriculumPhase:'',chapterExercises:spec.chapterExercises||(isLast?(base.chapterExercises||[]):[]),
          quiz:isLast?base.quiz:undefined,worked:isFirst?base.worked:undefined,code:isFirst?(base.code||''):'',starterCode:isFirst?(base.starterCode||''):'',
          language:isFirst?(base.language||'Python'):'课堂图解',visual:isFirst?(base.visual||''):'',figureKeys:isFirst?(base.figureKeys||[]):[],
          foundation:{...(base.foundation||{}),title:spec.title,question:spec.desc,why:'完成本课后，你可以用自己的话说明“'+spec.title+'”的含义，以及它和前后知识的关系。',
            example:base.foundation?.example||spec.desc,terms:(base.foundation?.terms||[]).slice()}};
        if(isLast)l.worked=isFirst?base.worked:undefined;
        pieces.push(l);newById.set(l.id,l);
        for(const s of sections){
          sectionOwner.set(spec.id+'|'+s.id,{lesson:spec.id,section:s,source:entry.from});
          sectionOwner.set(spec.id+'|'+s.legacyIndex,{lesson:spec.id,section:s,source:entry.from});
        }
      }
      oldToUnits.set(entry.from,pieces);
      replacements[key].push(...pieces);
    }
    const unplanned=catalog.filter(l=>l.group===key&&!oldToUnits.has(l.id));
    if(unplanned.length)throw new Error('Unplanned '+key+' courses: '+unplanned.map(l=>l.id).join(', '));
  }

  const phaseDefinitions={
    dl:[
      {id:'dl-start',title:'阶段一 · 从输入和数字表示开始',why:'先理解模型处理什么，再读懂数字、形状和基本计算。',ids:['ai-foundations','ai-layers','tensor','tensor-indexing','tensor-operations','tensor-layout'],check:'能把一批图片写成张量形状，并说明网络如何对输入做计算。'},
      {id:'dl-network',title:'阶段二 · 网络怎样产生答案',why:'从一个神经元走到多层网络、激活函数和任务输出。',ids:['network','network-activation','network-outputs'],check:'能解释权重、偏置、激活函数和输出分数各自在做什么。'},
      {id:'dl-loss',title:'阶段三 · 模型的答案怎样计分',why:'先分清任务与标签，再从 logits、概率进入交叉熵。',ids:['losses','loss-probabilities','loss-cross-entropy'],check:'能说明 logits 怎样变成概率，以及损失如何评价预测。'},
      {id:'dl-learning',title:'阶段四 · 从梯度走到完整训练',why:'沿着梯度、优化器、数据划分、训练循环和泛化依次学习。',ids:['gradient','gradient-chain-rule','gradient-diagnostics','optimizer','optimizer-momentum','optimizer-tuning','training-data-splits','training-loop','checkpoints','checkpoint-inference','regularization','regularization-data','regularization-diagnostics'],check:'能按顺序说明一次参数更新，并区分训练集、验证集和测试集。'},
      {id:'dl-electives',title:'选学 · 把网络和损失讲得更细',why:'主线学完后，再深入常见模块、损失推导和训练边界。',ids:['network-extensions','network-activations','network-gated-activations','loss-theory','loss-theory-cross-entropy','loss-gradients','loss-gradients-softmax','loss-implementation','loss-stability','loss-regression','training-engineering','training-accumulation'],check:'能指出选学概念适用于什么问题，以及它和主线概念的关系。',optional:true}
    ],
    cv:[
      {id:'cv-start',title:'阶段一 · 先确定任务与图像表示',why:'先明确机器需要交付哪种答案，再理解图片如何变成数字输入。',ids:['tasks','tasks-models','tasks-beyond-detection','image','image-preprocessing'],check:'能区分分类、检测和分割，并说明图像的通道、形状与数值。'},
      {id:'cv-cnn',title:'阶段二 · 从卷积走到视觉网络',why:'先计算卷积和池化，再看经典网络、残差、多尺度和迁移学习。',ids:['cnn','cnn-shapes','pooling','pooling-tradeoffs','cnn-priors','cnn-priors-limits','cnn-architectures','cnn-alexnet','cnn-vgg','cnn-residual','cnn-residual-shapes','receptive-field','feature-pyramid','transfer','fine-tuning'],check:'能画出卷积块并追踪尺寸，说明深层网络如何融合不同尺度特征。'},
      {id:'cv-detection',title:'阶段三 · 框、指标、数据与增强',why:'从边界框和 IoU 开始，接着学习检测评估，再准备和检查数据。',ids:['iou','iou-calculation','metrics','metrics-map','dataset','dataset-split','dataset-check','data-quality','data-diagnosis','augmentation','augmentation-evaluation'],check:'能用 IoU 比较预测框，并列出训练前的数据检查与评估步骤。'},
      {id:'cv-electives',title:'选学 · 三维姿态与旋转表示',why:'先用欧拉角学会描述朝向和旋转顺序，再学习四元数与矩阵；可以按兴趣选学。',ids:['euler-angles','quaternion','quaternion-compose','quaternion-compare'],check:'能读懂一组欧拉角所依赖的顺序约定，解释万向节锁，并比较四元数和矩阵的用途。',optional:true}
    ]
  };
  const optionalIds=new Set(phaseDefinitions.dl.concat(phaseDefinitions.cv).filter(p=>p.optional).flatMap(p=>p.ids));
  const phases=curriculum.phases;
  phases.dl=phaseDefinitions.dl;phases.cv=phaseDefinitions.cv;
  for(const key of ['dl','cv']){
    const ordered=phases[key].flatMap(p=>p.ids.map(id=>newById.get(id))).filter(Boolean);
    ordered.forEach((l,i)=>{l.curriculumNumber=i+1;l.curriculumTotal=ordered.length;l.curriculumPhase=phases[key].find(p=>p.ids.includes(l.id)).id;l.curriculumOptional=optionalIds.has(l.id);l.level=l.curriculumOptional?'选学':'基础';});
    for(let i=0;i<ordered.length;i++){
      const l=ordered[i],prev=ordered[i-1];
      if(prev&&!l.curriculumOptional){l.prereq='建议按目录顺序学习；上一课会提供本课要用到的基础。';l.prereqLinks=[{id:prev.id,title:prev.title}];}
    }
  }

  function findOwner(from,token){
    const value=String(token||'').replace(/^section-/,'');
    let owner=sectionOwner.get(from+'|'+value);
    if(owner)return owner;
    if(/^\d+$/.test(value)){owner=sectionOwner.get(from+'|'+(Number(value)-1));if(owner)return owner;}
    const match=new RegExp('^'+from+'-s(\\d+)$').exec(value);
    return match?sectionOwner.get(from+'|'+(Number(match[1])-1)):null;
  }

  // 迁移老课程的完成状态、阅读位置、练习答案，并保留原来的笔记键。
  let migrated=false;
  for(const [oldId,pieces] of oldToUnits){
    const base=sources.get(oldId),wasDone=state.done?.includes(oldId);
    if(wasDone)for(const piece of pieces)if(!state.done.includes(piece.id)){state.done.push(piece.id);migrated=true;}
    const savedSection=state.lastSection?.[oldId];
    if(savedSection){
      const owner=findOwner(oldId,savedSection);
      if(owner){state.last=owner.lesson;state.lastSection[owner.lesson]='section-'+owner.section.id;migrated=true;}
    }
    for(const section of base.sections){
      const owner=findOwner(oldId,section.id)||findOwner(oldId,section.legacyIndex);
      if(!owner)continue;
      for(const token of [section.legacyIndex,section.id]){
        const oldKey=oldId+':section:'+token;
        if(state.exerciseAnswers?.[oldKey]!==undefined){
          const newKey=owner.lesson+':section:'+owner.section.legacyIndex;
          if(state.exerciseAnswers[newKey]===undefined){state.exerciseAnswers[newKey]=state.exerciseAnswers[oldKey];migrated=true;}
        }
      }
    }
  }
  if(Array.isArray(state.done))state.done=[...new Set(state.done)];
  const otherLessons=catalog.filter(l=>l.group!=='dl'&&l.group!=='cv');
  catalog.splice(0,catalog.length,...replacements.dl,...replacements.cv,...otherLessons);
  curriculum.lessons.splice(0,curriculum.lessons.length,...replacements.dl,...replacements.cv);
  if(typeof groups!=='undefined'){
    groups.dl={...groups.dl,desc:'从数据与张量开始，逐课理解神经网络、损失、梯度、训练与泛化。每课聚焦一个概念，约 10–20 分钟。'};
    groups.cv={...groups.cv,desc:'从视觉任务与图像开始，逐课学习卷积网络、检测指标和数据实践。每课聚焦一个概念，约 10–20 分钟。'};
  }

  // 老链接若指向已拆分课程的中间章节，自动打开承接该章节的新小课。
  const previousResolve=curriculum.resolveRoute;
  curriculum.resolveRoute=function(hash){
    const parts=String(hash).replace(/^#/,'').split('/');
    if(parts[0]==='lesson'&&parts[2]){
      const from=parts[1],candidate=parts[2].replace(/^section-/,'');
      const owner=findOwner(from,candidate);
      if(owner&&owner.lesson!==from)return '#lesson/'+owner.lesson+'/section-'+owner.section.id;
    }
    const redirect=previousResolve?.(hash);
    if(redirect){
      const p=redirect.replace(/^#/,'').split('/');
      if(p[0]==='lesson'&&p[2]){
        const owner=findOwner(p[1],p[2]);
        if(owner)return '#lesson/'+owner.lesson+'/section-'+owner.section.id;
      }
    }
    return redirect||null;
  };
  curriculum.renderCatalog=function(key,items,renderList){
    const list=items.filter(l=>l.curriculumKey===key),stages=phases[key];
    const labels=key==='dl'?['深度学习课程路线','深度学习','从数据和神经元开始，逐步走到损失、训练与泛化。','从第 1 课开始 →','#lesson/ai-foundations']:['视觉课程路线','计算机视觉','从任务和图像开始，再学习卷积网络、检测与数据实践。','从视觉任务开始 →','#lesson/tasks'];
    const coreCount=list.filter(l=>!l.curriculumOptional).length,electiveCount=list.length-coreCount;
    return '<section class="fc-syllabus"><div class="fc-intro"><span class="chapter-kicker">'+labels[0]+' · '+coreCount+' 节主线 · '+electiveCount+' 节选学</span><h2>'+labels[1]+'：从一个概念到下一个概念</h2><p>'+labels[2]+'每课约 10–20 分钟；建议按阶段顺序学习，遇到熟悉内容可以跳读。</p><a class="primary" href="'+labels[4]+'">'+labels[3]+'</a><nav aria-label="课程阶段导航">'+stages.map((p,i)=>'<a href="#fc-phase-'+p.id+'">'+(i+1)+' · '+p.title.split('·')[1].trim()+'</a>').join('')+'</nav></div>'+stages.map(p=>{
      const group=p.ids.map(id=>list.find(l=>l.id===id)).filter(Boolean);if(!group.length)return '';
      return '<section class="fc-phase'+(p.optional?' is-elective':'')+'" id="fc-phase-'+p.id+'"><div class="fc-phase-title"><h2>'+p.title+'</h2>'+(p.optional?'<span>选学，可先略过</span>':'')+'</div><p>'+p.why+'</p>'+renderList(group)+'<p class="fc-check"><strong>阶段验收：</strong>'+p.check+'</p></section>';
    }).join('')+'</section>';
  };

  const termTargets={
  "logit": "network-outputs",
  "softmax": "loss-probabilities",
  "sigmoid": "loss-probabilities",
  "activation": "network-activation",
  "relu": "network-activation",
  "tanh": "network-activation",
  "batch-normalization": "network-extensions",
  "silu": "network-activations",
  "gelu": "network-activations",
  "swiglu": "network-gated-activations",
  "glu": "network-gated-activations",
  "ffn": "network-gated-activations",
  "cross-entropy": "loss-cross-entropy",
  "bce": "loss-cross-entropy",
  "bce-with-logits": "losses",
  "bce-loss": "losses",
  "cross-entropy-loss": "loss-cross-entropy",
  "mse": "loss-regression",
  "mae": "loss-regression",
  "huber": "loss-regression",
  "smooth-l1": "loss-regression",
  "entropy": "loss-theory-cross-entropy",
  "reduction": "loss-stability",
  "gradient": "gradient",
  "backpropagation": "gradient-chain-rule",
  "chain-rule": "gradient-chain-rule",
  "optimizer": "optimizer",
  "learning-rate": "optimizer",
  "momentum": "optimizer-momentum",
  "adam": "optimizer-momentum",
  "adamw": "optimizer-tuning",
  "weight-decay": "optimizer-tuning",
  "lrn-scheduler": "optimizer-tuning",
  "warmup": "optimizer-tuning",
  "batch": "training-loop",
  "epoch": "training-loop",
  "iteration": "training-loop",
  "gradient-accumulation": "training-accumulation",
  "vram": "train-yolo",
  "fp16": "train-yolo",
  "amp": "train-yolo",
  "grad-scaler": "train-yolo",
  "random-seed": "yolo-evaluation",
  "exponential-moving-average": "yolo-checkpoints",
  "convolution": "cnn",
  "feature-map": "cnn",
  "kernel": "cnn",
  "stride": "tensor-layout",
  "conv-stride": "cnn-shapes",
  "spatial-stride": "receptive-field",
  "padding": "cnn-shapes",
  "dilation": "receptive-field",
  "pooling": "pooling",
  "global-average-pooling": "pooling",
  "lenet5": "cnn-architectures",
  "alexnet": "cnn-alexnet",
  "vgg-family": "cnn-vgg",
  "resnet-family": "cnn-residual",
  "residual-connection": "cnn-residual-shapes",
  "receptive-field": "receptive-field",
  "fpn": "feature-pyramid",
  "pan": "feature-pyramid",
  "bounding-box": "iou",
  "iou": "iou",
  "precision": "metrics",
  "recall": "metrics",
  "ap": "metrics-map",
  "map": "metrics-map",
  "nms": "metrics-map",
  "data-leakage": "data-quality",
  "data-augmentation": "augmentation",
  "transfer-learning": "transfer",
  "pretrained-weights": "transfer",
  "fine-tuning": "fine-tuning",
  "quaternion": "quaternion",
  "euler-angles": "euler-angles",
  "rotation-order": "euler-angles",
  "gimbal-lock": "euler-angles",
  "rotation-matrix": "quaternion-compare",
  "slerp": "quaternion-compare"
};
  for(const [term,id] of Object.entries(termTargets)){const item=window.visionlabGlossary?.byId?.[term];if(item)item.learnMore='#lesson/'+id;}
  if(migrated&&typeof save==='function')save();
})();
