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
        unit('training-loop','训练循环 2：batch、epoch 到一次完整更新',[3,2],20,'先跟着一个 batch 走完预测、计分和参数更新，再学习训练与评估模式。')
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

  const check=(q,options,answer,why)=>({q,options,answer,why});
  const foundationUnitGuides={
    'ai-foundations':{goals:['指出神经网络接收的数据、执行计算的部分和给出答案的位置。','给定输入、权重和偏置，算出一个神经元的原始分数。'],exercise:check('输入 x=2，权重 w=3，偏置 b=−1，神经元分数 wx+b 是多少？',['5','6','−1'],0,'先算 3×2=6，再加偏置 −1，得到 5。')},
    'ai-layers':{goals:['区分网络里的层、权重和偏置分别是什么。','解释训练如何根据损失信号调整可学习参数。'],exercise:check('两个线性层中间没有激活函数，连续计算仍可合并成什么？',['一个仿射变换','任意弯曲的非线性函数','一个概率分布'],0,'线性层连续组合仍是仿射变换；非线性激活才增加弯曲表达能力。')},
    'tensor':{goals:['从形状读出张量的轴数，以及每条轴的长度。','用各轴长度相乘，算出张量包含多少个数。'],exercise:check('形状为 (2,3,4) 的张量有多少条轴、多少个数？',['4 条轴、9 个数','3 条轴、24 个数','24 条轴、3 个数'],1,'形状里有 3 个长度，所以是 3 条轴；元素数为 2×3×4=24。')},
    'tensor-indexing':{goals:['根据每个索引分别定位到对应的轴和位置。','区分取出单个元素、整行和切片区域。'],exercise:check('一个按 0 到 23 顺序填数、形状为 (2,3,4) 的张量，索引 [1,2,3] 取到什么？',['23','17','11'],0,'首轴为 1 的部分从 12 开始；第二轴 2 取第三行，再取最后一项，结果是 23。')},
    'tensor-operations':{goals:['判断逐元素运算要求哪些维度能够对齐。','根据矩阵乘法的内侧维度和外侧维度写出结果形状。'],exercise:check('A 的形状是 [2,3]，B 的形状是 [3,4]，A @ B 的形状是什么？',['[2,4]','[3,3]','[2,3,4]'],0,'左矩阵的列数 3 与右矩阵的行数 3 对齐并求和，保留外侧的 2 和 4。')},
    'tensor-layout':{goals:['说明 reshape 改变形状但不增减元素。','读出二维张量转置前后的形状和元素对应关系。'],exercise:check('形状为 [2,3] 的矩阵转置后，形状是什么？',['[2,3]','[3,2]','[6]'],1,'转置交换行轴与列轴，所以两个维度从 [2,3] 变为 [3,2]。')},
    'network':{goals:['按“输入乘权重、相加、再加偏置”的顺序计算神经元分数。','指出权重改变输入影响幅度、偏置整体平移结果。'],exercise:check('输入 x=2、权重 w=0.5、偏置 b=1，分数 wx+b 是多少？',['2','1','0.5'],0,'0.5×2=1，再加偏置 1，结果为 2。')},
    'network-activation':{goals:['用一个输入说明激活函数如何改变神经元的输出。','解释没有非线性激活时叠加多个线性层的限制。'],exercise:check('两个线性层之间不加激活函数，通常仍等价于什么？',['一个线性或仿射变换','任意非线性函数','自动归一化的概率'],0,'多个线性或仿射变换连续组合后仍可合并成一个仿射变换。')},
    'network-outputs':{goals:['区分分类头给出的原始分数和换算后的概率。','根据任务判断输出应表示类别分数还是连续数值。'],exercise:check('分类头输出 logits [2,1,0] 时，这三个数首先表示什么？',['尚未归一化的类别原始分数','总和为 1 的概率','真实类别编号'],0,'Logits 是模型的原始分数，可以为负，总和也不必等于 1。')},
    'losses':{goals:['根据问题能否多选，区分单标签多分类与多标签分类。','为互斥类别选择相匹配的输出形式和损失接口。'],exercise:check('一张图片只能属于猫、狗、兔中的一类，常见训练输入组合是什么？',['原始 logits 与整数类别编号','Softmax 后概率与预测 argmax','一个类别的概率与图像文件名'],0,'单标签多分类通常把原始 logits 和类别索引交给 CrossEntropyLoss。')},
    'loss-probabilities':{goals:['用 Sigmoid 表示独立二分类概率，用 Softmax 表示互斥类别分布。','观察 Softmax 如何让一个类别分数变化时其他类别概率也变化。'],exercise:check('Softmax 处理互斥的多个类别后，各类别概率有什么关系？',['总和为 1','每个概率都相同','总和等于类别数'],0,'Softmax 把各类别分数归一化成一个概率分布，因此概率总和为 1。')},
    'loss-cross-entropy':{goals:['从标签定位真实类别对应的预测概率。','用 −ln(真实类概率) 计算硬标签交叉熵并解释惩罚大小。'],exercise:check('真实类别的预测概率约为 0.1，单样本交叉熵约是多少？',['0.1','2.30','10'],1,'−ln(0.1)=ln(10)≈2.30；真实类概率越低，损失越大。')},
    'gradient':{goals:['区分函数值与当前位置的导数，读懂导数的正负方向。','根据损失的梯度和学习率计算一次权重更新。'],exercise:check('L=(wx−y)²，x=2、w=1、y=5 时，dL/dw 是多少？',['−12','−6','12'],0,'误差 wx−y=−3；链式法则给出 dL/dw=2(wx−y)x=2×(−3)×2=−12。')},
    'gradient-chain-rule':{goals:['拆开损失对中间误差、误差对参数的局部导数。','把沿计算链的局部导数相乘得到参数梯度。'],exercise:check('在 L=u²、u=2w−5、w=1 时，dL/du=−6、du/dw=2，dL/dw 是多少？',['−12','−4','−6'],0,'链式法则将两段局部导数相乘：dL/dw=(−6)×2=−12。')},
    'gradient-diagnostics':{goals:['按清零梯度、前向计算、反向求导、参数更新的顺序读训练代码。','说明 PyTorch 梯度会累加，以及何时需要清零。'],exercise:check('对同一参数连续调用两次 loss.backward()，中间不清零梯度，默认会怎样？',['两次梯度累加','第二次自动覆盖第一次','参数自动更新两次'],0,'PyTorch 默认累加叶子参数的梯度，因此新一轮独立更新前通常先调用 optimizer.zero_grad()。')},
    'optimizer':{goals:['把“沿负梯度方向、按学习率缩放”写成一次 SGD 更新。','用更新前后的参数计算新的预测和损失。'],exercise:check('参数 w=1、梯度 −12、学习率 0.05，一步 SGD 后 w 是多少？',['1.6','0.4','−0.6'],0,'w_new=w−ηg=1−0.05×(−12)=1.6。')},
    'optimizer-momentum':{goals:['数出样本数与批大小对应的更新批次数。','解释动量如何把当前梯度和之前的更新方向结合。'],exercise:check('有 10 个样本，batch size 为 4，保留最后不足一批的样本，每轮有几个 batch？',['2 个','3 个','4 个'],1,'样本分成 4、4、2，共 3 个 batch；最后一批较小但没有丢弃。')},
    'optimizer-tuning':{goals:['区分学习率、权重衰减、调度器和梯度裁剪各自控制的内容。','从损失振荡或发散现象判断是否需要检查步长。'],exercise:check('学习率过大时，即使梯度方向正确，也可能出现什么情况？',['一步跨过合适区域，损失振荡或变大','参数自动固定在最优值','所有梯度都会变成零'],0,'学习率控制更新幅度；过大的步子可能越过低损失区域。')},
    'training-data-splits':{goals:['分别说出训练集、验证集和测试集在学习流程中的用途。','解释为什么不能反复用测试集挑选模型。'],exercise:check('根据验证表现挑选学习率和模型版本，应该使用哪一份数据？',['训练集','验证集','测试集'],1,'验证集用于比较方案和调参；测试集应留到最终评估，避免被调参过程“用熟”。')},
    'training-loop':{goals:['按顺序复述一个 batch 的前向、计分、反向和更新。','区分 model.eval() 与关闭自动求导的作用。'],exercise:check('PyTorch 中 loss.backward() 与 optimizer.step() 分别做什么？',['前者计算梯度，后者据此更新参数','前者更新参数，后者读取图片','两者都只切换评估模式'],0,'backward() 计算梯度；step() 使用已有梯度按优化器规则改动参数。')},
    'checkpoints':{goals:['区分模型结构、模型参数和训练检查点保存的内容。','判断从中断处继续训练还需要哪些优化器状态。'],exercise:check('仅保存模型权重，通常能否让 Adam 训练精确地从中断处继续？',['能，权重里含有 Adam 全部历史','通常不能，还需优化器等训练状态','能，只要把文件改成 .pt'],1,'Adam 的动量等状态不包含在模型权重中；精确续训通常还需保存优化器和其他进度状态。')},
    'checkpoint-inference':{goals:['根据模型文件的保存内容判断能否加载结构、参数或训练状态。','区分切换 eval 模式与关闭梯度记录。'],exercise:check('model.eval() 会自动停止 PyTorch 记录梯度吗？',['会','不会，通常还要用 no_grad 或 inference_mode','只有 GPU 上会'],1,'eval() 改变 Dropout、BatchNorm 等模块行为；是否记录梯度由自动求导上下文控制。')},
    'regularization':{goals:['用训练集和新数据表现的差距解释过拟合与泛化。','根据训练、验证结果选择先检查数据还是修改模型。'],exercise:check('训练损失持续下降，验证表现却连续变差，最先应检查什么？',['只增加训练轮数','先核对数据与评估，再判断过拟合','反复用测试集调参'],1,'先排除划分、标签和评估问题，再结合训练验证差距判断过拟合。')},
    'regularization-data':{goals:['指出增强操作模拟的真实变化及其适用条件。','对翻转、裁剪等几何变化同步更新检测框或掩码标签。'],exercise:check('对检测图片做水平翻转时，边界框标签应怎样处理？',['同步翻转框的位置','保持框坐标不变','只改类别编号'],0,'图像内容位置改变，框的左右坐标也必须按同一变换更新。')},
    'regularization-diagnostics':{goals:['从训练与验证曲线区分欠拟合和过拟合的常见信号。','结合错例、标签质量与数据覆盖定位下一步检查对象。'],exercise:check('训练和验证误差都很高且接近，通常先说明什么？',['模型可能欠拟合或训练尚未学好','已经确定过拟合','测试集泄漏是唯一原因'],0,'训练集本身也表现差，常提示拟合不足、优化问题或数据问题，需要继续查证。')},
    'network-extensions':{goals:['说清 BatchNorm 对一批中间特征做什么，以及为何按通道处理。','辨认训练时批次统计与评估时运行统计的区别。'],exercise:check('常见 BatchNorm2d 对图像特征通常按什么维度分别统计？',['每个通道','每个类别标签','整张数据集的文件名'],0,'BatchNorm2d 对每个通道统计批次和空间位置上的数值；评估时通常使用累计运行统计。')},
    'network-activations':{goals:['读出 SiLU 与 GELU 公式中的输入、门控或累积分布函数。','根据曲线判断它们与 ReLU 在零点附近和负区间的差异。'],exercise:check('SiLU(x) 的常见定义是哪一个？',['x·sigmoid(x)','max(0,x)','x²'],0,'SiLU(x)=x·σ(x)，其中 σ 是 Sigmoid；它会平滑地压低负输入。')},
    'network-gated-activations':{goals:['指出 SwiGLU 的两条投影分支分别提供什么。','解释逐元素门控如何调节另一条特征分支。'],exercise:check('SwiGLU 中门控分支的主要作用是什么？',['逐元素调节另一条特征分支','把图像改成 RGB','替代所有训练标签'],0,'门控值与另一支的特征逐元素相乘，从而控制哪些特征通过。')},
    'loss-theory':{goals:['用 −ln(p) 解释单个事件的信息量与概率的关系。','说明熵是对一个概率分布下信息量取平均。'],exercise:check('熵 H(P) 主要描述什么？',['真实分布 P 的平均不确定程度','模型参数的总数量','预测框的位置偏差'],0,'熵把各结果的信息量按其真实概率加权平均，描述分布本身的不确定性。')},
    'loss-theory-cross-entropy':{goals:['区分真实分布 P 的熵与模型分布 Q 的交叉熵。','解释交叉熵如何通过真实结果在 Q 下的概率评价预测。'],exercise:check('交叉熵 H(P,Q) 中的 Q 表示什么？',['模型给出的预测概率分布','训练图片数量','类别编号的排列顺序'],0,'交叉熵用模型分布 Q 给真实分布 P 中的结果计分。')},
    'loss-gradients':{goals:['写出未加权单标签 Softmax 交叉熵对 logits 的梯度 p−y。','指出真实类别和非真实类别各自收到的梯度信号。'],exercise:check('预测概率 p=[0.7,0.2,0.1]，第二类是真实类别，梯度 p−y 是什么？',['[0.7,−0.8,0.1]','[−0.7,0.8,−0.1]','[0,1,0]'],0,'第二类的独热目标是 1，其余为 0，所以逐项用 p 减去 y。')},
    'loss-gradients-softmax':{goals:['从 Softmax 概率和独热标签逐类计算 p−y。','区分损失对 logits 的梯度与反向传播后得到的模型参数梯度。'],exercise:check('未加权硬标签 Softmax 交叉熵对 logits 的梯度是什么？',['p−y','只在非真实类别为 0','真实类位置恒为 1'],0,'对 logits 的梯度为预测概率向量减去独热标签；还需继续向前传播到网络参数。')},
    'loss-implementation':{goals:['说明类别权重怎样改变不同样本对总损失的贡献。','在训练时优先选择直接接 logits 的稳定损失接口。'],exercise:check('互斥多分类训练时，PyTorch CrossEntropyLoss 通常应接收什么？',['原始 logits 与类别索引','先做 Softmax 再传 argmax','已经取最大值的类别分数'],0,'CrossEntropyLoss 内部做稳定的 log-softmax 与交叉熵，通常传原始 logits 和类别索引。')},
    'loss-stability':{goals:['解释 logits 很大时直接取指数为何可能溢出。','用 log-sum-exp 或 logits 损失接口避免先算极小概率再取对数。'],exercise:check('多分类 logits 很大时，哪种做法通常更稳定？',['把原始 logits 交给 CrossEntropyLoss','先手动 exp 再归一化并取对数','先把预测类别取整再求损失'],0,'稳定损失接口用 log-softmax 等方法处理 logits，避免显式构造溢出的指数或下溢概率。')},
    'loss-regression':{goals:['从连续数值目标识别回归任务，并计算预测误差。','比较 MSE、MAE、Huber 对大误差和小误差的惩罚方式。'],exercise:check('误差 e=4 时，单个值的 MSE 与 MAE 分别是多少？',['16 和 4','4 和 16','8 和 2'],0,'MSE=e²=16；MAE=|e|=4。MSE 对大误差增长更快。')},
    'training-engineering':{goals:['根据样本数和 batch size 算出是否存在不完整尾批。','解释保留或丢弃尾批对样本利用和统计的影响。'],exercise:check('10 个样本按 batch size 4 分批并保留尾批，三批的样本数是什么？',['4、4、2','4、4','4、4、4'],0,'前两批各 4 个，最后剩余 2 个；保留尾批时总共用到全部 10 个样本。')},
    'training-accumulation':{goals:['说明梯度累积期间何时清零、何时反向和何时更新。','按实际样本数处理不完整累积组，避免缩放分母错误。'],exercise:check('梯度累积多个小批次后，只希望做一次参数更新，应在什么时机调用 step()？',['每个小批次反向后立刻更新','累计组的梯度都算完后更新一次','清零梯度时同时更新'],1,'梯度累积先把多个小批次的梯度累加，再调用一次 optimizer.step()。')}
  };
  const foundationUnitKeypoints={
    'ai-foundations':['神经网络把输入数值经过若干计算步骤变成输出。','单个神经元常先算加权和，再加偏置，得到原始分数。'],
    'ai-layers':['权重控制对应输入的贡献，偏置改变结果的整体偏移。','训练用损失衡量预测，再用梯度指导可学习参数更新。'],
    'tensor':['张量用多个轴组织数值，shape 按顺序记录每条轴的长度。','轴数是 shape 中长度值的个数；元素总数是各轴长度的乘积。'],
    'tensor-indexing':['常见张量索引从 0 开始；整数索引选中某位置并通常移除该轴。','切片选择一段范围，通常保留该轴，结果形状随选择方式变化。'],
    'tensor-operations':['逐元素运算按对应位置计算；维度不完全相等时要符合广播规则。','矩阵乘法要求左列数等于右行数，结果形状取两个外侧维度。'],
    'tensor-layout':['reshape 改变元素分组形状，不改变逻辑元素总数；必要时可能复制数据。','转置重排轴；shape 与 stride 会随轴顺序改变。'],
    'network':['单个神经元的线性部分常写作 z=Σᵢwᵢxᵢ+b。','权重决定各输入的贡献，偏置是输入之外可学习的平移量。'],
    'network-activation':['激活函数逐位置变换神经元输出；非线性使网络不再只是线性变换。','若层间没有非线性，多个线性或仿射层仍可合成一个仿射变换。'],
    'network-outputs':['分类模型通常先给每类一个 logit；logits 不是已归一化的概率。','回归模型输出连续数值；输出层形式取决于任务和目标范围。'],
    'losses':['损失把预测与目标之间的差异变成可用于训练的数值。','标签形式、输出变换和损失接口必须与任务含义匹配。'],
    'loss-probabilities':['Sigmoid 分别把各 logit 映射到 0 到 1，适合可独立成立的标签。','Softmax 把互斥类别变成总和为 1 的分布，一个 logit 变化会影响其他类概率。'],
    'loss-cross-entropy':['多类交叉熵为 −Σₖyₖln(pₖ)；硬标签时等于 −ln(p真实类)。','真实类概率越小，损失越大；概率趋近 0 时惩罚迅速增大。'],
    'gradient':['导数描述函数在某点附近的局部变化率；多参数时用梯度汇集各偏导。','SGD 按 θ新=θ旧−学习率×梯度更新；负梯度会使该参数在这一步增大。'],
    'gradient-chain-rule':['复合函数的导数等于沿计算链相乘的局部导数。','反向传播沿计算图从结果向前传递梯度，复用中间计算结果。'],
    'gradient-diagnostics':['backward() 计算并累加叶子参数的梯度，本身不更新参数。','zero_grad() 清理旧梯度；optimizer.step() 才按优化器规则更新参数。'],
    'optimizer':['SGD 单步规则是 θ新=θ旧−学习率×梯度。','学习率控制更新步幅；更新后损失需重新计算才能得知。'],
    'optimizer-momentum':['一个 batch 是一次参数更新所用的一组样本，数据集可拆成多个 batch。','动量结合历史方向和当前梯度；Adam 还会按参数维护梯度统计量。'],
    'optimizer-tuning':['学习率控制每次更新幅度，调度器按训练进程调整学习率。','梯度裁剪限制梯度范数；权重衰减对参数施加收缩或正则化作用。'],
    'training-data-splits':['训练集用于拟合参数，验证集用于比较方案和调参。','测试集留作最终评估；反复据它调整会让评估偏乐观。'],
    'training-loop':['训练常按前向计算、损失、清零、backward、step 的顺序更新。','eval() 切换 Dropout/BatchNorm 等模块行为；no_grad/inference_mode 控制梯度记录。'],
    'checkpoints':['模型参数保存网络学到的权重；模型结构需由代码或配置重建。','恢复训练通常还需优化器状态、轮数、调度器和随机状态等信息。'],
    'checkpoint-inference':['加载权重前须创建匹配结构，并核对类别顺序、预处理等配置。','eval() 不会关闭自动求导；推理时通常还使用 inference_mode() 或 no_grad()。'],
    'regularization':['泛化指模型在未参与拟合的新样本上的表现。','训练表现好而验证变差可能是过拟合，也需先检查数据划分与评估流程。'],
    'regularization-data':['数据增强通过训练时的合理变换扩大样本变化，不会自动增加新标注事实。','几何变换后，检测框、关键点或分割掩码须做对应变换。'],
    'regularization-diagnostics':['训练与验证都差可能来自欠拟合、优化失败或数据问题，不能只凭曲线定因。','错误样本、标签、类别覆盖和预处理能帮助判断应改模型还是数据。'],
    'network-extensions':['BatchNorm 按特征或通道用批次统计量归一化中间数值，并可用 γ、β 调整。','训练时通常使用当前批次统计；评估时通常改用累计运行统计量。'],
    'network-activations':['SiLU(x)=x·σ(x)，其中 σ 是 Sigmoid；负值被平滑压低而非直接截断。','GELU(x)=xΦ(x)，用标准正态分布累积分布函数 Φ 平滑调节输入。'],
    'network-gated-activations':['SwiGLU 将一支的 SiLU 门控值与另一支特征逐元素相乘。','门控结果须与被调节分支形状相容，投影维度通常据此设置。'],
    'loss-theory':['事件概率 p 越小，信息量 −ln(p) 越大；对数底会改变单位。','熵按真实分布概率对各结果的信息量求平均，描述分布的不确定性。'],
    'loss-theory-cross-entropy':['交叉熵 H(P,Q) 用预测分布 Q 给真实分布 P 中的结果计分。','H(P,Q)=H(P)+KL(P∥Q)；P 固定时，降低交叉熵等价于降低 KL。'],
    'loss-gradients':['单样本硬标签、未加权 Softmax 交叉熵对 logits 的梯度是 p−y。','类别权重和 reduction 设置会改变实际梯度的缩放。'],
    'loss-gradients-softmax':['Softmax 与硬标签交叉熵组合后，logit 梯度可简化为 p−y。','网络参数梯度还要通过链式法则把 logit 梯度传回各层。'],
    'loss-implementation':['类别权重会改变各目标类别样本对损失的贡献，mean 的归一化也需留意。','互斥多类通常直接把 logits 和类别索引交给 CrossEntropyLoss。'],
    'loss-stability':['显式 exp 大正 logits 可能上溢，极小概率也可能下溢为 0。','log-sum-exp 先减最大值稳定计算；sum 与 mean 决定怎样汇总样本损失。'],
    'loss-regression':['MSE(e)=e²，MAE(e)=|e|；MSE 对大误差的增长更快。','Huber 在小误差区用平方项、大误差区转为线性项，阈值 δ 决定分界。'],
    'training-engineering':['样本数不能被 batch size 整除时，最后一个 batch 会较小。','保留尾批会用到所有样本；丢弃尾批会改变本轮实际参与训练的数据。'],
    'training-accumulation':['梯度累积把多个小批次的梯度合并后再做一次参数更新。','若要等价于大批次平均梯度，损失缩放须按实际样本总数处理。']
  };
  const tier=(stage,q,options,answer,why)=>({...check(q,options,answer,why),stage});
  const foundationUnitExerciseTiers={
    'ai-foundations':[
      tier('第 1 关 · 认概念','在神经元 z=wx+b 中，w 和 b 分别控制什么？',['w 缩放输入贡献，b 平移结果','w 是类别标签，b 是概率','w 决定图片大小，b 决定颜色'],0,'w 决定输入变化对分数的影响幅度；b 是不随输入变化的可学习偏移。'),
      tier('第 3 关 · 场景迁移','x=2、w=3 时，把偏置 b 从 0 改成 1，神经元分数会怎样变化？',['增加 1','增加 3','不变'],0,'分数是 wx+b；只把 b 增加 1，输出也增加 1。')
    ],
    'ai-layers':[
      tier('第 1 关 · 认概念','通常哪些量会在训练中被优化器更新？',['网络的权重和偏置','输入图片的像素标签','验证集的类别名称'],0,'权重和偏置是模型参数；训练根据损失计算梯度并更新它们。'),
      tier('第 3 关 · 场景迁移','PyTorch 中 `loss.backward()` 后，通常还需要哪一步才会按梯度改参数？',['调用 optimizer.step()','调用 model.eval()','再次计算一次 shape'],0,'backward() 计算梯度；优化器的 step() 才应用更新。')
    ],
    'tensor':[
      tier('第 1 关 · 认概念','shape 为 (2,3,4) 时，第二条轴的长度是多少？',['2','3','4'],1,'shape 按轴顺序记录长度；第二个数字 3 就是第二条轴的长度。'),
      tier('第 3 关 · 场景迁移','一批 8 张 RGB 图片排成 NCHW，单张图片高宽为 32×32，张量形状是什么？',['(8,3,32,32)','(3,8,32,32)','(8,32,32,3)'],0,'NCHW 顺序是批次、通道、高、宽，所以形状为 (8,3,32,32)。')
    ],
    'tensor-indexing':[
      tier('第 1 关 · 认概念','张量索引 0 通常表示什么？',['该轴上的第一个位置','该轴上的第二个位置','整条轴的长度'],0,'常见 Python/PyTorch 索引从 0 开始，因此索引 0 取第一个位置。'),
      tier('第 3 关 · 场景迁移','x.shape=(2,3,4)，表达式 `x[:,1,:]` 选出什么形状？',['(2,4)','(3,4)','(2,3)'],0,'冒号保留首尾两轴；整数索引 1 取走中间轴，因此结果形状为 (2,4)。')
    ],
    'tensor-operations':[
      tier('第 1 关 · 认概念','同形状张量做 `A * B` 与 `A @ B`，通常分别表示什么？',['逐元素相乘；矩阵乘法','矩阵乘法；逐元素相乘','两者都只做逐元素相乘'],0,'`*` 通常按对应元素相乘；`@` 表示矩阵乘法并沿内侧维度求和。'),
      tier('第 3 关 · 场景迁移','A.shape=(2,3)、B.shape=(2,3)，能否直接计算 `A @ B`？',['不能，内侧维度 3 和 2 不相等','能，结果形状为 (2,3)','能，结果形状为 (3,2)'],0,'矩阵乘法要求 A 的列数等于 B 的行数；这里 3 不等于 2。')
    ],
    'tensor-layout':[
      tier('第 1 关 · 认概念','把 12 个数 reshape 成 (3,4)，元素总数会怎样？',['仍是 12 个','变成 7 个','自动复制成 24 个'],0,'reshape 改变逻辑分组和形状，不会增加或减少元素总数。'),
      tier('第 3 关 · 场景迁移','连续存储的 (2,3) 矩阵 stride 为 (3,1)，转置后 stride 通常是什么？',['(1,3)','(3,1)','(2,3)'],0,'转置交换轴的访问顺序，因此 stride 从 (3,1) 变为 (1,3)。')
    ],
    'network':[
      tier('第 1 关 · 认概念','在线性分数 z=wx+b 中，输入 x 增加 1 时，分数改变多少？',['改变 w','改变 b','总是改变 1'],0,'z 对 x 的变化率是 w；权重决定输入变化会给分数带来多大影响。'),
      tier('第 3 关 · 场景迁移','两个输入为 x₁=1、x₂=2，权重为 2、3，偏置为 1，分数是多少？',['9','8','6'],0,'加权求和是 1×2+2×3=8，再加偏置 1，得到 9。')
    ],
    'network-activation':[
      tier('第 1 关 · 认概念','在多层网络中加入非线性激活，主要让网络能够做什么？',['表示非线性关系','自动把输出变成概率','自动读取真实标签'],0,'非线性激活让多层组合不再只是一个仿射变换，能表示弯曲的关系。'),
      tier('第 3 关 · 场景迁移','ReLU(x)=max(0,x)，当 x=−2 时输出是多少？',['0','−2','2'],0,'ReLU 将负输入截为 0；正输入则保持原值。')
    ],
    'network-outputs':[
      tier('第 1 关 · 认概念','分类头输出 logits [−1,2] 时，数字 2 首先表示什么？',['第二个类别的原始分数','第二个类别的概率 2','真实类别编号'],0,'Logit 是未归一化的类别分数，可以为负或大于 1。'),
      tier('第 3 关 · 场景迁移','两个类别的 logits 都是 0，经过 Softmax 后概率是多少？',['[0.5,0.5]','[0,0]','[1,1]'],0,'两个分数相等，Softmax 会在两个互斥类别间平均分配概率。')
    ],
    'losses':[
      tier('第 1 关 · 认概念','“一张图可以同时有猫和狗”属于哪类分类问题？',['多标签分类','单标签多分类','连续值回归'],0,'猫和狗可以同时为真，因此标签彼此独立，属于多标签分类。'),
      tier('第 3 关 · 场景迁移','多标签任务中，猫和狗可以同时出现，常见输出组合是什么？',['每类独立 Sigmoid，并配合 BCE 类损失','跨类别 Softmax，并只保留一个类别','回归一个类别编号并用 MSE'],0,'多标签的各类标签可独立成立，通常对每个 logit 使用 Sigmoid/BCEWithLogitsLoss。')
    ],
    'loss-probabilities':[
      tier('第 1 关 · 认概念','哪个场景更适合 Softmax？',['猫、狗、兔中只能选一个','猫和狗可能同时出现','预测图片亮度数值'],0,'Softmax 用于互斥类别，让各类概率总和为 1。'),
      tier('第 3 关 · 场景迁移','训练单标签多分类时，通常把什么传给 PyTorch CrossEntropyLoss？',['原始 logits 和整数类别索引','Softmax 概率和预测类别','先 argmax 后的类别编号'],0,'CrossEntropyLoss 内部处理 log-softmax，训练时通常直接接收 logits 与类别索引。')
    ],
    'loss-cross-entropy':[
      tier('第 1 关 · 认概念','独热标签下，交叉熵主要检查哪一项预测概率？',['真实类别对应的概率','所有类别中最大的 logit','真实标签编号本身'],0,'独热标签把真实类别位置设为 1，交叉熵因此只留下该类的负对数概率。'),
      tier('第 3 关 · 场景迁移','真实类别概率为 0.8，单样本交叉熵约是多少？',['0.223','0.800','1.609'],0,'损失为 −ln(0.8)≈0.223；正确类概率较高时惩罚较小。')
    ],
    'gradient':[
      tier('第 1 关 · 认概念','当前位置的损失梯度为负，沿梯度下降更新时参数会怎样变化？',['参数通常增大','参数通常减小','参数必定不变'],0,'更新式是参数减去学习率乘梯度；减去负数会让参数增大。'),
      tier('第 3 关 · 场景迁移','w=1、梯度 g=−12、学习率 η=0.05，一步 SGD 后 w 是多少？',['1.6','0.4','−0.6'],0,'w_new=1−0.05×(−12)=1.6。')
    ],
    'gradient-chain-rule':[
      tier('第 1 关 · 认概念','若 y=f(g(w))，链式法则怎样组合局部导数？',['dy/dw=(dy/dg)(dg/dw)','dy/dw=dy/dg+dg/dw','dy/dw 只看最外层函数'],0,'沿计算链把局部导数相乘，得到最终输出对 w 的变化率。'),
      tier('第 3 关 · 场景迁移','某中间量 a 对 w 的导数为 2，损失对 a 的导数为 3，损失对 w 的导数是多少？',['6','5','1'],0,'链式法则相乘：dL/dw=(dL/da)(da/dw)=3×2=6。')
    ],
    'gradient-diagnostics':[
      tier('第 1 关 · 认概念','`loss.backward()` 的主要作用是什么？',['计算并累加梯度','直接更新参数','切换到评估模式'],0,'backward() 根据计算图计算参数梯度；参数更新由优化器 step() 执行。'),
      tier('第 3 关 · 场景迁移','一次常见训练更新的顺序是哪一个？',['zero_grad → 前向和损失 → backward → step','step → eval → zero_grad → backward','backward → 前向 → eval → step'],0,'先清理旧梯度，再计算损失、反向求导，最后由优化器应用梯度。')
    ],
    'optimizer':[
      tier('第 1 关 · 认概念','SGD 更新式中的学习率主要控制什么？',['每一步更新的幅度','真实标签的类别编号','张量轴的数量'],0,'学习率缩放梯度，控制参数每一步移动多远。'),
      tier('第 3 关 · 场景迁移','w=2、梯度 g=3、学习率 η=0.1，一步 SGD 后 w 是多少？',['1.7','2.3','0.3'],0,'w_new=2−0.1×3=1.7。')
    ],
    'optimizer-momentum':[
      tier('第 1 关 · 认概念','一个训练 batch 通常指什么？',['一次更新所用的一组样本','完整数据集的所有类别','模型的一层参数'],0,'Batch 是一次前向和损失计算使用的一组样本。'),
      tier('第 3 关 · 场景迁移','11 个样本按 batch size 4 分批并保留尾批，每轮有几个 batch？',['3 个','2 个','4 个'],0,'分成 4、4、3，共 3 个 batch。')
    ],
    'optimizer-tuning':[
      tier('第 1 关 · 认概念','梯度裁剪通常限制什么？',['梯度的范数或幅度','类别数量','输入图像的宽度'],0,'梯度裁剪用于控制过大的梯度，避免一次更新步子过大。'),
      tier('第 3 关 · 场景迁移','梯度范数为 3，裁剪上限为 5，常见按范数裁剪会怎样？',['梯度保持不变','梯度放大到 5','梯度变为 0'],0,'梯度范数未超过上限 5，因此无需缩小。')
    ],
    'training-data-splits':[
      tier('第 1 关 · 认概念','训练集和验证集的主要分工是什么？',['训练集拟合参数，验证集比较方案和调参','验证集更新参数，训练集只用于最后评分','两者都只用于部署'],0,'模型从训练集学习参数，验证集用于比较模型或训练设置。'),
      tier('第 3 关 · 场景迁移','已经用验证集选好模型，最终报告泛化表现应看哪份数据？',['保留到最后的测试集','继续反复挑选的验证集','训练集'],0,'测试集应留作最终评估，避免调参过程反复使用它。')
    ],
    'training-loop':[
      tier('第 1 关 · 认概念','`model.eval()` 会自动停止梯度记录吗？',['不会','会','只在 CPU 上会'],0,'eval() 切换模块行为；梯度记录由 no_grad() 或 inference_mode() 控制。'),
      tier('第 3 关 · 场景迁移','验证模型时要让 BatchNorm/Dropout 使用评估行为，并避免记录梯度，应怎样做？',['model.eval() 并使用 torch.inference_mode()','只调用 optimizer.step()','只调用 loss.backward()'],0,'eval() 切换模块行为，inference_mode() 关闭该推理过程的梯度记录。')
    ],
    'checkpoints':[
      tier('第 1 关 · 认概念','只保存模型 `state_dict`，通常保存了什么？',['模型参数张量','完整 Python 模型类的源代码','全部训练样本'],0,'state_dict 通常保存模块参数和相关缓冲区；结构仍需代码或配置定义。'),
      tier('第 3 关 · 场景迁移','想从中断处继续 Adam 训练，除模型权重外还应保存什么？',['优化器状态等训练状态','只保存类别名称','只保存一张训练图片'],0,'Adam 的动量状态不在模型权重中；续训还需保存优化器和训练进度等状态。')
    ],
    'checkpoint-inference':[
      tier('第 1 关 · 认概念','加载权重进行推理前，哪项配置必须与训练时匹配？',['模型结构以及输入预处理等约定','浏览器窗口大小','训练日志文件名'],0,'参数要加载进兼容的模型结构；输入预处理和类别映射也需一致。'),
      tier('第 3 关 · 场景迁移','常见 PyTorch 推理准备组合是什么？',['model.eval() 并在 torch.inference_mode() 中前向','model.train() 后调用 backward()','optimizer.zero_grad() 后调用 step()'],0,'eval() 设置模块评估行为，inference_mode() 适合不需要梯度的推理。')
    ],
    'regularization':[
      tier('第 1 关 · 认概念','泛化主要指模型在什么数据上的表现？',['未参与拟合的新样本','只在训练集上的记忆结果','优化器的内部状态'],0,'泛化关注模型面对未参与拟合的新样本时是否仍能完成任务。'),
      tier('第 3 关 · 场景迁移','训练表现继续变好、验证表现持续变差时，下一步较合理的做法是什么？',['检查数据和评估流程，再判断过拟合','只增加训练轮数','反复用测试集挑设置'],0,'先排除数据划分、标签和评估问题，再结合训练/验证差距判断过拟合。')
    ],
    'regularization-data':[
      tier('第 1 关 · 认概念','几何增强改变了图像里目标的位置后，检测标签应怎样处理？',['同步变换边界框坐标','保持所有框坐标不变','只修改类别名字'],0,'标签必须继续描述变换后图像中的目标位置。'),
      tier('第 3 关 · 场景迁移','对分割图片做水平翻转时，掩码应怎样处理？',['用相同的几何变换翻转掩码','保持掩码原样','把掩码改成分类编号'],0,'分割掩码与图像逐像素对应，因此要应用相同的空间变换。')
    ],
    'regularization-diagnostics':[
      tier('第 1 关 · 认概念','训练集和验证集误差都高且相近，说明什么？',['可能欠拟合、优化不充分或数据有问题','已经能确定过拟合','模型肯定达到最佳效果'],0,'训练集本身也表现差，需继续检查拟合能力、优化和数据。'),
      tier('第 3 关 · 场景迁移','训练误差低、验证误差高时，哪项检查更有助于判断原因？',['抽查验证样本、标签和数据分布','只查看训练准确率','立刻把测试集并入训练集'],0,'验证错例、标签和分布能帮助区分过拟合、划分差异与数据错误。')
    ],
    'network-extensions':[
      tier('第 1 关 · 认概念','BatchNorm2d 通常对什么分别计算统计量？',['每个特征通道','每个类别名称','每张图片文件名'],0,'BatchNorm2d 通常按通道统计，并跨批次及空间位置聚合数值。'),
      tier('第 3 关 · 场景迁移','忽略 ε、γ、β，输入 x=6、该通道均值 μ=4、标准差 σ=2，归一化结果是多少？',['1','2','3'],0,'(x−μ)/σ=(6−4)/2=1。')
    ],
    'network-activations':[
      tier('第 1 关 · 认概念','SiLU(x) 的公式是哪一个？',['x·σ(x)','max(0,x)','x²'],0,'SiLU(x)=x·σ(x)，其中 σ 是 Sigmoid。'),
      tier('第 3 关 · 场景迁移','SiLU(0) 等于多少？',['0','0.5','1'],0,'SiLU(0)=0×σ(0)=0。')
    ],
    'network-gated-activations':[
      tier('第 1 关 · 认概念','SwiGLU 中逐元素相乘主要表示什么？',['门控分支调节另一支特征','把两支特征的维度直接拼接','把特征改成类别标签'],0,'门控值与另一支特征逐元素相乘，控制特征通过的强弱。'),
      tier('第 3 关 · 场景迁移','某位置的门控值为 0.25，另一支特征值为 8，相乘结果是多少？',['2','8.25','32'],0,'逐元素门控得到 0.25×8=2。')
    ],
    'loss-theory':[
      tier('第 1 关 · 认概念','二分类熵在什么分布下更大？',['两个结果各 0.5 的均匀分布','一个结果概率 1、另一个为 0','两种分布熵都为 0'],0,'结果越均匀、越难预先确定，平均不确定性越大。'),
      tier('第 3 关 · 场景迁移','某事件概率为 0.5，使用自然对数时信息量 −ln(p) 约是多少 nat？',['0.693','0.5','2'],0,'−ln(0.5)=ln(2)≈0.693 nat。')
    ],
    'loss-theory-cross-entropy':[
      tier('第 1 关 · 认概念','交叉熵 H(P,Q) 中的 P 和 Q 通常分别表示什么？',['真实分布和模型预测分布','两个模型参数向量','训练集和测试集的数量'],0,'交叉熵用预测分布 Q 给真实分布 P 中的结果计分。'),
      tier('第 3 关 · 场景迁移','真实分布是 [1,0]，模型分布是 [0.8,0.2]，交叉熵是多少？',['−ln(0.8)≈0.223','−ln(0.2)≈1.609','0'],0,'真实分布只给第一类权重，因此 H(P,Q)=−ln(0.8)≈0.223。')
    ],
    'loss-gradients':[
      tier('第 1 关 · 认概念','硬标签 Softmax 交叉熵对 logits 的梯度常简写成什么？',['p−y','p+y','只有真实类概率 pₜ'],0,'未加权单样本硬标签情况下，logit 梯度为预测概率减独热标签。'),
      tier('第 3 关 · 场景迁移','p=[0.2,0.5,0.3]，第 0 类为真实类，p−y 是什么？',['[−0.8,0.5,0.3]','[0.8,−0.5,−0.3]','[0.2,0.5,0.3]'],0,'独热标签为 [1,0,0]，逐项相减得到 [−0.8,0.5,0.3]。')
    ],
    'loss-gradients-softmax':[
      tier('第 1 关 · 认概念','损失对 logits 的梯度与损失对网络权重的梯度是什么关系？',['还需沿网络计算图继续用链式法则','两者永远相同','权重梯度只等于标签'],0,'p−y 是对 logits 的梯度；要到网络参数，还要继续反向传播。'),
      tier('第 3 关 · 场景迁移','真实类的预测概率为 0.8，单样本交叉熵对该类 logit 的梯度是多少？',['−0.2','0.8','1.0'],0,'真实类的 p−y=0.8−1=−0.2。')
    ],
    'loss-implementation':[
      tier('第 1 关 · 认概念','类别权重主要改变什么？',['不同类别样本对训练损失的相对贡献','模型输出张量的通道顺序','图像文件的像素数量'],0,'类别权重会改变对应目标类别样本的损失贡献；具体归一化还与 reduction 有关。'),
      tier('第 3 关 · 场景迁移','只看未归约单样本损失项，真实类别权重从 1 调到 3，这一项乘数变为多少？',['3 倍','1 倍','1/3 倍'],0,'未归约的对应损失项乘以目标类别权重 3；批次 mean 的最终分母另需核对。')
    ],
    'loss-stability':[
      tier('第 1 关 · 认概念','log-sum-exp 先减去最大 logit，主要目的是什么？',['避免直接 exp 大数溢出且保持计算等价','把类别概率改成整数','让模型只预测最大类别'],0,'减去共同常数不改变 Softmax 结果，并能缩小指数的数值范围。'),
      tier('第 3 关 · 场景迁移','logsumexp([1000,999]) 约是多少？',['1000.313','1999','约 0'],0,'减去最大值后为 1000+ln(1+e⁻¹)≈1000.313。')
    ],
    'loss-regression':[
      tier('第 1 关 · 认概念','Huber 损失通常怎样处理小误差和大误差？',['小误差用平方段，大误差转为线性段','所有误差都只取绝对值','误差越大损失越小'],0,'Huber 在阈值附近平滑衔接，小误差区为二次、大误差区为一次增长。'),
      tier('第 3 关 · 场景迁移','Huber 阈值 δ=1、误差 e=3，按标准分段式损失是多少？',['2.5','4.5','3'],0,'|e|>δ 时为 δ(|e|−δ/2)=1×(3−0.5)=2.5。')
    ],
    'training-engineering':[
      tier('第 1 关 · 认概念','样本数不能被 batch size 整除且保留尾批时，会发生什么？',['最后一个 batch 比较小','最后一个 batch 自动补成完整新样本','前面的 batch 会被合并成一个'],0,'保留尾批会留下一个较小 batch，仍能使用剩余真实样本。'),
      tier('第 3 关 · 场景迁移','10 个样本、batch size=4、`drop_last=True` 时，本轮使用和丢弃多少样本？',['使用 8 个，丢弃 2 个','使用 10 个，丢弃 0 个','使用 4 个，丢弃 6 个'],0,'前两个完整 batch 共 8 个；尾部 2 个因 drop_last 被丢弃。')
    ],
    'training-accumulation':[
      tier('第 1 关 · 认概念','梯度累积中，通常在什么时候调用 optimizer.step()？',['一组小批次的梯度累计完成后','每个小批次开始前','每次清零梯度时'],0,'先累计一组小批次的梯度，再做一次参数更新。'),
      tier('第 3 关 · 场景迁移','要让大小为 4、4、2 的三个微批次等价于 10 个样本的平均损失，怎样合并各微批次平均梯度？',['分别乘 4/10、4/10、2/10 后相加','每个微批次都等权乘 1/3','只使用最后 2 个样本的梯度'],0,'按各微批次的样本占比加权，等价于对全部 10 个样本求平均。')
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
        const teaching=key==='dl'?foundationUnitGuides[spec.id]:null;
        const goals=teaching?.goals||sectionNames.slice(0,2).map(name=>'理解“'+name+'”在本课中解决什么问题。');
        if(!teaching&&goals.length<2)goals.push('结合图示或算例，说清输入、关键步骤和结果之间的关系。');
        const l={...base,id:spec.id,title:spec.title,desc:spec.desc,sections,time:spec.time,level:base.curriculumOptional?'选学':'基础',
          goals,keypoints:foundationUnitKeypoints[spec.id]||goals,prereq:spec.prereq||base.prereq,prereqLinks:[],curriculumIntro:spec.desc,curriculumKey:key,
          curriculumOptional:false,curriculumPhase:'',chapterExercises:spec.chapterExercises||(teaching?[{...foundationUnitExerciseTiers[spec.id][0]}, {...teaching.exercise,stage:'第 2 关 · 手算与推理'}, {...foundationUnitExerciseTiers[spec.id][1]}]:(isLast?(base.chapterExercises||[]):[])),
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
