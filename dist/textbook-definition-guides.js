/* 逐课基础名词：复用词典定义，避免短课拆分后丢失入门解释。 */
(()=>{
  const catalog=typeof lessons!=='undefined'?lessons:window.lessons;
  const foundation=window.visionlabFoundation;
  const glossary=window.visionlabGlossary;
  if(!catalog||!foundation||!glossary)return;
  // 每条记录依次是核心词条、学习用途、可核对的具体例子。
  const guides={
  "ai-foundations": [
    [
      "ai",
      "function",
      "model",
      "neuron"
    ],
    "区分任务、计算规则和计算单元，理解模型怎样把输入变为输出。",
    "输入 3，规则“乘 2 再加 1”输出 7。把乘数和加数做成可调整参数，就得到一个最小模型；识别猫需要更多数据和更复杂的计算。"
  ],
  "ai-layers": [
    [
      "linear-layer",
      "parameter",
      "training"
    ],
    "理解层怎样组合，以及训练究竟改变了模型中的什么。",
    "第一层把输入 2 算成 5，第二层再把 5 算成 11。层是计算步骤，权重与偏置是步骤中的数字；一次训练更新改这些数字，不会自动增加网络层。"
  ],
  "tensor": [
    [
      "tensor",
      "shape",
      "axis",
      "dimension"
    ],
    "分清张量、形状、轴的数量与轴的长度，能先读懂数据再计算。",
    "shape=(2,3,4) 表示 2 组、每组 3 行、每行 4 个数：3 条轴、24 个元素；轴 0、1、2 的长度分别为 2、3、4。"
  ],
  "tensor-indexing": [
    [
      "index",
      "axis",
      "shape"
    ],
    "把位置编号与数据值分开，理解索引与切片在取什么。",
    "二维表 [[10,20,30],[40,50,60]] 中，索引 [1,2] 取到 60；第一行编号是 0。切片 0:2 取编号 0、1，不含编号 2。"
  ],
  "tensor-operations": [
    [
      "dot-product",
      "matrix-multiplication",
      "broadcasting"
    ],
    "分清逐元素运算、向量点积与矩阵乘法，并在计算前检查形状。",
    "[1,2] 与 [3,4] 逐元素乘得 [3,8]，点积得 11；[2,3] 形状的矩阵乘 [3,4] 形状矩阵，结果形状为 [2,4]。"
  ],
  "tensor-layout": [
    [
      "storage",
      "stride",
      "contiguous"
    ],
    "把逻辑形状和实际存储位置分开，理解重塑、换轴为何不能互相替代。",
    "连续 2×3 矩阵的内存步幅常为 (3,1)；转置成 3×2 后步幅可为 (1,3)，仍共享原来 6 个数，但读取顺序改变。"
  ],
  "network": [
    [
      "neuron",
      "weight",
      "bias"
    ],
    "能逐项说明输入、权重与偏置怎样组成一个神经元的计算。",
    "输入为 2 和 1，权重为 3 和 −2，偏置为 1：加权结果是 3×2−2×1+1=5。5 是计算结果，是否再变成概率取决于后续函数。"
  ],
  "network-activation": [
    [
      "affine",
      "activation",
      "relu"
    ],
    "理解激活函数的输入和输出，以及为什么层间需要非线性。",
    "同一个原始结果 z=−2，经 ReLU 得 0，经 Sigmoid 得约 0.119。仅把 z=2x+1 再接 y=3z+4，仍能合成 y=6x+7。"
  ],
  "network-outputs": [
    [
      "regression",
      "logit",
      "multilabel-classification"
    ],
    "先判断输出代表数值、互斥类别还是多个可同时成立的标签，再选损失。",
    "预测温度可输出 23.5；猫、狗、兔单选可输出 3 个 logits；“有猫”和“室外”可同时为真，需要分别判断，不能当作两个互斥答案。"
  ],
  "losses": [
    [
      "label",
      "loss",
      "regression"
    ],
    "先认清题型与监督答案，再解释损失为什么这样计分。",
    "真实温度为 20、预测为 22，误差是 2，平方损失为 4；如果 0、1、2 表示三种动物，这些数字只是类别编号，不能按温度差计算。"
  ],
  "loss-probabilities": [
    [
      "logit",
      "sigmoid",
      "softmax"
    ],
    "区分原始分数与概率，并说明二分类和互斥多分类怎样转换。",
    "一个 logit=0 经 Sigmoid 得正类概率 0.5；两个 logits=[0,0] 经 Softmax 得 [0.5,0.5]。给所有多类分数同时加 10，概率不变。"
  ],
  "loss-cross-entropy": [
    [
      "one-hot",
      "cross-entropy",
      "bce"
    ],
    "把真实答案、概率与惩罚一一对应，分清多分类交叉熵和二元交叉熵。",
    "猫、狗、兔中真实为狗，标签 [0,1,0]、概率 [0.1,0.8,0.1]，单样本交叉熵为 −ln0.8≈0.223；PyTorch 硬标签接口可直接传类别编号 1。"
  ],
  "gradient": [
    [
      "derivative",
      "partial-derivative",
      "gradient"
    ],
    "先理解一个数的局部变化率，再理解多个参数的梯度。",
    "L(w)=(w−3)² 在 w=1 的导数为 −4：把 w 稍微增大，损失局部趋向降低。多个参数就分别计算这种变化率，再按参数顺序组成向量。"
  ],
  "gradient-chain-rule": [
    [
      "computation-graph",
      "chain-rule",
      "backpropagation"
    ],
    "沿计算图追踪局部影响，分清求梯度和更新参数的职责。",
    "令 z=2w、L=z²，在 w=1 时 z=2；dL/dz=4、dz/dw=2，所以 dL/dw=8。有两条分支影响同一参数时，要把分支贡献相加。"
  ],
  "gradient-diagnostics": [
    [
      "gradient-descent",
      "learning-rate",
      "autograd"
    ],
    "识别梯度数值代表什么，并理解清零、反向和更新为何是不同步骤。",
    "当前 w=2、梯度为 3，学习率 0.1 的普通 SGD 把 w 改为 1.7。backward 只把梯度写入或累加到 grad；没有 step，参数通常不会因此改变。"
  ],
  "optimizer": [
    [
      "optimizer",
      "sgd",
      "learning-rate"
    ],
    "用一次可手算更新认识优化器，明确梯度方向与步幅系数的关系。",
    "参数 w=2、损失梯度 g=−3、学习率 η=0.1，普通 SGD 更新为 w−ηg=2.3。负梯度让这一个参数增大；不是所有参数都会一起减小。"
  ],
  "optimizer-momentum": [
    [
      "batch",
      "momentum",
      "adam"
    ],
    "认识批次梯度的波动，再比较历史平滑与自适应更新。",
    "两个批次给出梯度 2 和 −1，反映它们对参数的不同局部建议。动量保存近期方向；Adam 还记录梯度平方的平滑平均，用来调节各参数的更新尺度。"
  ],
  "optimizer-tuning": [
    [
      "l2-regularization",
      "adamw",
      "gradient-clipping"
    ],
    "区分参数惩罚、权重衰减、学习率调度和梯度限幅各自控制什么。",
    "梯度向量 [3,4] 的 L2 范数为 5，按范数阈值 1 裁剪后为 [0.6,0.8]；这是限制梯度，与把学习率从 0.1 调为 0.01 是不同操作。"
  ],
  "training-data-splits": [
    [
      "training-set",
      "validation-set",
      "test-set"
    ],
    "说明三类数据分别用于学习、选方案和最终评估，避免提前看答案。",
    "1000 张图片可按独立拍摄来源划成训练、验证、测试三组。训练集更新权重，验证集挑选方案，测试集在方案确定后检查；比例没有适用于所有项目的固定答案。"
  ],
  "training-loop": [
    [
      "forward-pass",
      "batch",
      "epoch",
      "iteration"
    ],
    "把一次批次计算、一轮数据遍历和一次参数更新放到正确层级。",
    "10 个样本、每批 4 个并保留尾批，一轮是 4、4、2 共 3 批。不累积梯度时常更新 3 次；若把全部 3 批梯度累积后再 step，则只更新 1 次。"
  ],
  "checkpoints": [
    [
      "parameter",
      "buffer",
      "state-dict"
    ],
    "区分结构、模型数值与保存状态，知道权重文件能恢复什么。",
    "state_dict 可含某层的 weight、bias 和 BN 运行均值；它不是模型类代码。要恢复训练，还常需优化器状态、轮次等，只有权重通常只能恢复模型数值。"
  ],
  "checkpoint-inference": [
    [
      "checkpoint",
      "onnx",
      "runtime"
    ],
    "分清文件名、保存内容与加载执行的软件，避免把格式当作完整部署。",
    "两个文件都叫 model.pt，一个可只含 state_dict，另一个可含训练检查点。扩展名相同不代表加载方式相同；ONNX 还需要兼容的运行时执行。"
  ],
  "regularization": [
    [
      "generalization",
      "overfitting",
      "regularization"
    ],
    "用训练与新样本的差异解释泛化，再理解过拟合和约束策略。",
    "训练图片分对 99%，独立道路图片只分对 60%，说明训练高分没有充分迁移到新样本。需先检查数据划分与分布，再评估正则化是否改善。"
  ],
  "regularization-data": [
    [
      "data-augmentation",
      "dropout",
      "label"
    ],
    "分清对输入做变化与对中间激活做随机失活，以及标签是否仍成立。",
    "水平翻转一张猫图，猫标签常可保留；翻转文字或方向标识可能改变含义。Dropout 则在网络内部随机置零部分激活，输入照片本身没有被翻转。"
  ],
  "regularization-diagnostics": [
    [
      "underfitting",
      "overfitting",
      "early-stopping"
    ],
    "把曲线当成排查线索，理解欠拟合、过拟合与早停的判断对象。",
    "训练损失从 1 降到 0.2，验证损失从 1 降到 0.6 后回升到 0.9，是过拟合的常见线索；也要看采样与标注，不能只凭一条曲线认定原因。"
  ],
  "network-extensions": [
    [
      "mean",
      "variance",
      "batch-normalization"
    ],
    "先认识中心与分散程度，再理解 BN 在通道内部处理了什么。",
    "一个通道有 [1,3,5,7]，均值为 4，按 4 作分母的方差为 5。先减 4，再除以 √(5+ε)，得到约 [−1.342,−0.447,0.447,1.342]，之后还可学习缩放和平移。"
  ],
  "network-activations": [
    [
      "silu",
      "gelu",
      "normal-cdf"
    ],
    "解释平滑激活怎样改变一个数，读懂公式中的概率函数记号。",
    "输入 x=−2，ReLU 输出 0；SiLU 为 −2×σ(−2)≈−0.238。GELU 的精确形式 xΦ(x) 使用标准正态分布的累计概率，不是在运行时随机删掉一部分输入。"
  ],
  "network-gated-activations": [
    [
      "ffn",
      "glu",
      "swiglu"
    ],
    "区分普通逐点激活与含两条可学习分支的门控计算。",
    "同一输入经两路线性变换得到内容 c=[2,−1] 和门值 g=[0.5,0.8]，逐项相乘得 [1,−0.8]。SwiGLU 的门由 SiLU 产生，门值未必都在 0～1。"
  ],
  "loss-theory": [
    [
      "probability",
      "information-content",
      "natural-log"
    ],
    "先解释事件概率和单次信息量，给后面的熵与交叉熵建立直觉。",
    "用自然对数时，概率 0.5 的事件信息量约 0.693 nat，概率 0.1 的事件约 2.303 nat。这里比较的是单次事件的意外程度，熵还要按整个分布平均。"
  ],
  "loss-theory-cross-entropy": [
    [
      "probability-distribution",
      "entropy",
      "kl-divergence"
    ],
    "分清数据本身的不确定性与使用模型分布预测它的额外代价。",
    "真实分布 P=[0.5,0.5]，模型 Q=[0.9,0.1]，熵 H(P)≈0.693，交叉熵 H(P,Q)≈1.204，额外代价 KL≈0.511；三者都使用自然对数。"
  ],
  "loss-gradients": [
    [
      "logit",
      "cross-entropy",
      "gradient"
    ],
    "把“预测错了”的评价连接到每个分数的局部修正信号。",
    "两类概率为 [0.8,0.2]，真实类是第 2 类，独热标签为 [0,1]。未加权单样本 Softmax 交叉熵对 logits 的梯度为 [0.8,−0.8]，不是把损失值直接当作梯度。"
  ],
  "loss-gradients-softmax": [
    [
      "one-hot",
      "cross-entropy-example",
      "backpropagation"
    ],
    "说明未出现在独热损失显式求和中的错误类别为何仍会得到梯度。",
    "概率 [0.7,0.2,0.1]，真实类索引 1，则损失 −ln0.2≈1.609，logits 梯度 [0.7,−0.8,0.1]；所有分数经 Softmax 分母互相影响。"
  ],
  "loss-implementation": [
    [
      "class-imbalance",
      "reduction",
      "label-noise"
    ],
    "先识别样本分布和标签问题，再理解类别权重改变了哪些贡献。",
    "如果猫 900 张、狗 100 张，只报猫就能有 90% 准确率，但狗召回率为 0。类别加权会改变损失贡献，不能修复把狗错标成猫的标签噪声。"
  ],
  "loss-stability": [
    [
      "reduction",
      "float32",
      "numerical-stability"
    ],
    "分清多项损失的汇总规则与有限精度计算，理解稳定接口的作用。",
    "logits=[1000,999,−1000]、真实类为第 3 类时，稳定交叉熵约 2000.3133；直接先算该类 float32 概率可下溢为 0，再取对数就失去有限结果。"
  ],
  "loss-regression": [
    [
      "mse",
      "mae",
      "huber",
      "smooth-l1"
    ],
    "从误差数值理解损失曲线，并明确 Huber 与 Smooth L1 的参数和尺度差异。",
    "误差 e=3 时，平方项为 9、绝对值项为 3；Huber 的 δ=2 时为 4，Smooth L1 的 β=2 时为 2。二者在转折相同时仍相差一个缩放系数。"
  ],
  "training-engineering": [
    [
      "batch",
      "mean",
      "reduction"
    ],
    "明确批次均值与样本均值各自的分母，正确处理尾批。",
    "一批 4 个样本平均损失 1，另一批 1 个样本损失 5；平均两个批次得 3，平均全部 5 个样本应为 (4×1+1×5)/5=1.8。"
  ],
  "training-accumulation": [
    [
      "gradient-accumulation",
      "iteration",
      "batch-normalization"
    ],
    "区分小批次、更新组与实际 BN 统计范围，避免把累积等同于真实大批。",
    "101 个样本、每小批 8 个、一组累积 4 批，保留并刷新尾组时共 13 批、4 次更新；更新组样本数为 32、32、32、5，BN 仍按各次前向批次处理。"
  ],
  "tasks": [
    [
      "classification",
      "object-detection",
      "semantic-segmentation",
      "instance-segmentation"
    ],
    "按输出的粒度区分视觉任务：整图标签、物体框、像素类别或个体区域。",
    "一张图有两只猫：分类回答“有猫”；检测给 2 个框；语义分割把猫像素统一标猫；实例分割还把两只猫分成不同个体。"
  ],
  "tasks-models": [
    [
      "bounding-box",
      "mask",
      "head"
    ],
    "理解矩形位置与像素轮廓的差别，再看任务头交付哪种表示。",
    "一辆弯曲车身的外接矩形会包含背景，掩码可逐像素标出车身区域。矩形可用 4 个坐标表示，而掩码需要许多位置的标记，不能只把掩码当作更细的框。"
  ],
  "tasks-beyond-detection": [
    [
      "keypoint",
      "tracking",
      "depth-estimation"
    ],
    "区分关键位置、跨帧身份与远近信息，不把所有视觉输出都当作类别。",
    "肩点 (10,20) 和肘点 (15,30) 描述姿态；连续帧中同一人的 ID=7 描述跟踪身份。深度图的数值表示远近，是否有米单位取决于模型与标定。"
  ],
  "image": [
    [
      "pixel",
      "channel",
      "nchw",
      "dtype"
    ],
    "把像素值、颜色通道与张量排列分别解释清楚。",
    "一张高 2、宽 3 的 RGB 小图有 6 个像素、18 个颜色数值；1 张图按 NCHW 表示为 [1,3,2,3]。uint8 转 float32 后仍需另做缩放才会变成 0～1。"
  ],
  "image-preprocessing": [
    [
      "letterbox",
      "normalization",
      "standardization"
    ],
    "分清几何调整与数值尺度调整，并追踪目标坐标怎样变化。",
    "640×480 图保持比例补成 640×640，可上下各补 80 像素；框的 y 坐标也增加 80。像素除以 255 则只改数值尺度，不会把框移动到新位置。"
  ],
  "cnn": [
    [
      "convolution",
      "kernel",
      "feature-map"
    ],
    "把卷积窗口中的数字、权重和输出位置对应起来，再讨论提取特征。",
    "窗口 [1,2,3;4,5,6;7,8,9] 与核 [1,0,−1;1,0,−1;1,0,−1] 逐项相乘求和得到 −6（偏置为 0），这个数填入一个输出位置。"
  ],
  "cnn-shapes": [
    [
      "channel",
      "conv-stride",
      "padding",
      "groups"
    ],
    "区分通道连接与空间滑动，知道哪些设置影响参数量、哪些影响输出高宽。",
    "3 输入通道、16 输出通道、3×3 核、groups=1、有偏置，共 16×3×3×3+16=448 个参数。输入 5×5、无填充、步幅 1 时输出为 3×3。"
  ],
  "pooling": [
    [
      "pooling",
      "downsampling",
      "conv-stride"
    ],
    "先做窗口汇总，再理解窗口移动为何可能缩小空间网格。",
    "2×2 窗口 [1,4;2,3] 最大池化得 4，平均池化得 2.5。4×4 输入用 2×2 窗口、步幅 2、无填充，输出 2×2；窗口与步幅是不同设置。"
  ],
  "pooling-tradeoffs": [
    [
      "downsampling",
      "receptive-field",
      "translation-equivariance"
    ],
    "解释下采样为何减少计算、增加覆盖范围，也可能丢失位置细节。",
    "同一个 2×2 窗口中，强响应从左上移到右下，最大值可仍为 9；移到隔壁窗口后输出位置就可能改变。这种局部容忍不能推广为任意平移都不影响答案。"
  ],
  "cnn-priors": [
    [
      "flatten",
      "local-connectivity",
      "weight-sharing",
      "translation-equivariance"
    ],
    "先区分数据排列和连接方式，再说明卷积为何适合重复的局部模式。",
    "把 2×3 图片展平为 6 个数，知道原顺序就能排回去。3×3 卷积在各窗口复用同一组权重，图片变大主要增加计算位置，不会让该核参数跟着翻倍。"
  ],
  "cnn-priors-limits": [
    [
      "inductive-bias",
      "fully-connected",
      "forward-pass"
    ],
    "理解结构带来的学习倾向及其边界，不把卷积优势说成其他网络不能处理图像。",
    "全连接层可把 6 个像素作为 6 个输入来学习；卷积额外利用邻近位置与重复模式的假设。它通常更节省参数，但是否更准仍需任务数据和评估。"
  ],
  "cnn-architectures": [
    [
      "lenet5",
      "convolution",
      "pooling"
    ],
    "把网络名称放回输入、层级和任务中，读懂经典数字分类的计算链。",
    "常见 LeNet-5 图以 32×32 输入开始，5×5 无填充卷积后为 28×28。原始结构与现代 PyTorch 简化版本在激活、下采样和连接方式上可能不同，尺寸图应注明版本。"
  ],
  "cnn-alexnet": [
    [
      "alexnet",
      "relu",
      "dropout"
    ],
    "理解 AlexNet 的网络身份与主要组件，避免只记历史名词。",
    "经典分类设置输出 1000 个类别分数；ReLU 改变中间数值，Dropout 在训练时随机失活，Softmax 可将最终分数转成概率。三个名称各负责不同环节。"
  ],
  "cnn-vgg": [
    [
      "vgg-family",
      "convolution",
      "pooling"
    ],
    "从重复小卷积块理解网络深度，并分开看卷积与空间压缩。",
    "3×3、步幅 1、填充 1 的卷积可保持 224×224 高宽；2×2、步幅 2 的池化可变为 112×112。VGG-16 中的 16 是常见计数约定下含权重层的数量。"
  ],
  "cnn-residual": [
    [
      "resnet-family",
      "residual",
      "identity-mapping"
    ],
    "先认识主分支与捷径，再区分优化退化和泛化问题。",
    "残差块输入 x=3，主分支给修正 F(x)=0.2，相加得到 3.2；若 F(x)=0，仍可传递 3。这个例子解释连接方式，不代表真实网络只处理一个数。"
  ],
  "cnn-residual-shapes": [
    [
      "residual-connection",
      "concatenation",
      "channel"
    ],
    "明确相加和拼接的形状要求，理解投影捷径为何有参数。",
    "两路 [1,16,8,8] 相加仍为 [1,16,8,8]，通道拼接得 [1,32,8,8]。若主路变为 [1,32,4,4]，捷径也要变到相同形状才能按位置相加。"
  ],
  "receptive-field": [
    [
      "receptive-field",
      "conv-stride",
      "dilation"
    ],
    "区分输出网格大小、采样间隔与一个位置依赖的输入区域。",
    "两层 3×3、步幅 1、膨胀率 1 的卷积，内部位置的理论感受野从 3×3 扩成 5×5；它不是把特征图本身变成 5×5，边界处还受填充影响。"
  ],
  "feature-pyramid": [
    [
      "feature-pyramid",
      "fpn",
      "pan"
    ],
    "理解多种分辨率特征各保留什么，并看懂跨尺度信息怎样融合。",
    "640 输入的检测网络可使用 80×80、40×40、20×20 特征层。高分辨率网格位置更密；融合前先对齐高宽，再按具体结构相加或拼接，不直接把不同高宽张量硬接起来。"
  ],
  "transfer": [
    [
      "pretrained-weights",
      "transfer-learning",
      "fine-tuning"
    ],
    "区分参数的来源、迁移的目的与继续训练的动作。",
    "模型先在通用图片上学到一组权重，再用于工业零件分类，是迁移学习的一种做法；在零件数据上继续调整这些参数叫微调，不等于从原通用任务中断处续训。"
  ],
  "fine-tuning": [
    [
      "label",
      "freeze-parameters",
      "fine-tuning"
    ],
    "理解新任务类别、可更新参数和模块运行模式的关系。",
    "把旧的 1000 类头换成 3 类头，先冻结骨干、训练新头，再按方案解冻。冻结权重不自动停止 BN 运行统计更新，是否使用 eval 需要另按训练方案设置。"
  ],
  "iou": [
    [
      "bounding-box",
      "coordinate",
      "iou"
    ],
    "先解释框记录了什么位置，再用交并面积比较重叠程度。",
    "xyxy 框 [10,20,30,50] 表示左上 (10,20)、右下 (30,50)，宽 20、高 30；换成中心宽高为 [20,35,20,30]。坐标值必须配原点、轴向和单位。"
  ],
  "iou-calculation": [
    [
      "intersection",
      "union",
      "iou"
    ],
    "逐项计算交集、并集与比值，理解不相交和重合的边界。",
    "A=[0,0,10,10]、B=[5,0,15,10]，两框面积各 100，交集 50，并集 150，IoU=1/3。非退化框完全重合时为 1，不相交时为 0。"
  ],
  "metrics": [
    [
      "true-positive",
      "false-positive",
      "false-negative"
    ],
    "先按评估协议分清对的预测、错的预测和漏掉的真实目标，再算指标。",
    "真实有 10 个目标，模型报 8 个框，按类别与 IoU 匹配正确 6 个：TP=6、FP=2、FN=4，Precision=6/8=0.75，Recall=6/10=0.6。"
  ],
  "metrics-map": [
    [
      "ap",
      "map",
      "nms"
    ],
    "分清评估曲线、跨类汇总与预测去重，避免把它们当作一个阈值操作。",
    "某 IoU 协议下两类 AP 为 0.8、0.6，mAP 为 0.7。NMS 先减少重复候选，评估再对结果与标注匹配；NMS 的重叠阈值不是评估的匹配阈值。"
  ],
  "dataset": [
    [
      "dataset",
      "label",
      "yaml"
    ],
    "把样本、标注与类别配置的对应关系讲清楚，能读一行 YOLO 标签。",
    "图像 100×200（宽×高），标签行“0 0.5 0.5 0.2 0.4”表示类别 0、中心 (50,100)、框宽 20、高 80。类别名由 YAML 的 names 按相同编号给出。"
  ],
  "dataset-split": [
    [
      "training-set",
      "validation-set",
      "data-leakage"
    ],
    "按模型要面对的新场景划分数据，理解相似帧为什么会让成绩虚高。",
    "同一视频连续取的 100 帧彼此很像，即使随机分成 80 帧训练、20 帧验证，也未必能检验对新道路的表现；应按视频或场景分组，避免近重复跨集合。"
  ],
  "dataset-check": [
    [
      "path",
      "ground-truth",
      "negative-sample"
    ],
    "理解路径可读、标注正确和无目标图片分别意味着什么。",
    "一张确认没有目标的图可以是有效背景样本；一张有车却漏掉标签的图会给出错误监督。两者都可能没有框记录，必须通过检查图像与标注区分。"
  ],
  "data-quality": [
    [
      "generalization",
      "data-leakage",
      "test-set"
    ],
    "围绕实际新数据定义评估范围，解释代表性与独立性。",
    "只用晴天白天图片训练和验证，分数高也不能直接说明雨夜可靠；把近重复帧拆到训练和测试又会虚高成绩。代表性和划分独立性都需要单独检查。"
  ],
  "data-diagnosis": [
    [
      "class-imbalance",
      "label-noise",
      "precision-recall-curve"
    ],
    "把类别数量少、答案错误和预测阈值问题分开，找到相应证据。",
    "猫 900 张、狗 100 张是类别不平衡；把 20 张狗标成猫是标签噪声。先按类查看错误图片与指标，再决定补数据、修标注还是调训练权重。"
  ],
  "augmentation": [
    [
      "data-augmentation",
      "bounding-box",
      "coordinate"
    ],
    "说明图像几何变换为什么必须同步标签，以及变化后坐标怎样算。",
    "归一化框中心 x=0.2、宽 0.1，水平翻转后中心变 1−0.2=0.8，宽仍 0.1；如果只翻图片而保留原框，标签就会指向错误位置。"
  ],
  "augmentation-evaluation": [
    [
      "hsv",
      "saturation",
      "validation-set"
    ],
    "区分颜色变换的含义与任务标签，理解如何用固定评估检查增强是否有效。",
    "同一车框的坐标在适度亮度调整后不变；但把红灯颜色大幅改成绿灯可能改变答案。比较增强方案时固定验证集，不能只凭增强后的图片更丰富就认定更好。"
  ],
  "euler-angles": [
    [
      "euler-angles",
      "rotation-order",
      "gimbal-lock"
    ],
    "把三个角与旋转顺序、参考轴一起定义，理解表示奇异性。",
    "在右手系主动旋转、固定轴约定下，向量 (1,0,0) 先绕 X 转 90°再绕 Y 转 90°可到 (0,0,−1)；交换顺序可到 (0,1,0)，三个角必须配顺序。"
  ],
  "quaternion": [
    [
      "vector",
      "axis-angle",
      "quaternion"
    ],
    "先认识空间向量与轴角，再解释单位四元数四个分量怎样编码旋转。",
    "绕 z 轴转 90°的单位四元数按 (w,x,y,z) 写作 (√2/2,0,0,√2/2)；角度的一半用于编码，物体实际仍转 90°，不是转 45°。"
  ],
  "quaternion-compose": [
    [
      "hamilton-product",
      "quaternion-conjugate",
      "rotation-order"
    ],
    "理解旋转组合的乘法顺序和逆旋转，避免把四元数按分量相乘。",
    "按主动旋转 v′=qvq⁻¹ 的约定，先 q1 后 q2 的合成写为 q2q1；单位四元数的逆等于共轭。分量顺序、手性与主动/被动约定须先固定。"
  ],
  "quaternion-compare": [
    [
      "rotation-matrix",
      "slerp",
      "gimbal-lock"
    ],
    "比较表示同一姿态的三种数学对象，并说明换库时要核对什么。",
    "同一旋转可以存 3 个欧拉角、4 个单位四元数分量或 3×3 旋转矩阵。四元数 q 与 −q 表示同一旋转；插值前处理符号可避免绕较长路径。"
  ],
  "detection-intro": [
    [
      "object-detection",
      "bounding-box",
      "confidence"
    ],
    "从一张图片需要交付的答案出发，解释检测与整图分类的差别。",
    "道路图中有 3 辆车，整图分类只能回答“有车”；检测需要给出 3 组类别、位置和分数。分数用于筛选与排序，位置还要映射到原图坐标。"
  ],
  "detection-two-stage": [
    [
      "region-proposal",
      "rpn",
      "roi-pooling"
    ],
    "把候选区域生成与区域判断两个阶段分开，读懂历史模型解决的问题。",
    "先提出 1000 个可能含物体的区域，不表示图中有 1000 个物体。Faster R-CNN 用 RPN 提区域，再由区域头分类、修框；候选须继续筛选与处理。"
  ],
  "detection-one-stage": [
    [
      "one-stage-detection",
      "dense-prediction",
      "anchor-free"
    ],
    "解释一次网络计算中的密集预测，并理解有无锚框的组织差异。",
    "80×80 特征图有 6400 个空间位置，可在许多位置同时给出候选数字；这不是给每个位置裁图再独立运行整个模型。无锚框也仍需定义框表示和训练分配规则。"
  ],
  "yolo-evolution": [
    [
      "yolo-family",
      "yolov5",
      "preprint"
    ],
    "理解模型家族、具体版本与仓库实现的关系，避免把名称当成统一规范。",
    "同叫 YOLO 的不同版本可采用不同模块、损失和分配方法。本课后续使用的 C3、SPPF、Anchor 与 Detect 说明，需配本项目对应的 YOLOv5 配置和源码阅读。"
  ],
  "architecture": [
    [
      "backbone",
      "neck",
      "head"
    ],
    "把整台检测网络划成特征提取、融合与任务输出三个职责。",
    "一张图片先变成多层特征，Neck 让不同尺度交换信息，Head 产生候选框相关数字。候选仍需解码和筛选，不能把骨干输出的特征图当成最终检测答案。"
  ],
  "yolo-repository": [
    [
      "source-repository",
      "path",
      "command-line"
    ],
    "让文件名对应程序职责，并认识路径和运行命令的含义。",
    "train.py 是训练入口，models/common.py 定义常用模块，utils/loss.py 负责损失相关计算；路径说明文件位置，命令行参数说明本次怎样运行，两者不是模型参数。"
  ],
  "yolo-data": [
    [
      "dataset",
      "label",
      "yaml"
    ],
    "把图片、目标标注和配置文件接成可读取的数据约定。",
    "data.yaml 的 names=[猫,狗] 表示类别 0 是猫、1 是狗；txt 行首 1 就指狗。换了 names 顺序却不改标签编号，即使程序能读，也会监督成错误类别。"
  ],
  "yolo-config": [
    [
      "yaml",
      "channel",
      "concatenation"
    ],
    "先读懂结构配置记录什么，再追踪重复次数、通道和连线。",
    "YAML 中的 from 指从哪层取输入，number 表示模块重复设置，args 提供通道或卷积核等参数。两路各 64 通道的同高宽特征拼接后为 128 通道，不是逐元素相加。"
  ],
  "yolo-backbone": [
    [
      "yolo-conv-module",
      "feature-map",
      "conv-stride"
    ],
    "区分源码 Conv 组件与单独 Conv2d，理解尺度变化发生在哪一步。",
    "本地 Conv 典型顺序为 Conv2d→BatchNorm2d→SiLU。步幅 2 的卷积可让高宽下降；通道变多由输出通道配置决定，不能把它解释成颜色种类增多。"
  ],
  "yolo-c3": [
    [
      "csp",
      "c3",
      "bottleneck"
    ],
    "把分支、内部重复和融合讲清楚，避免按名称猜模块层数。",
    "C3 外部有 3 个主要卷积组件，内部还可重复 n 个 Bottleneck。某些内部块 e=1 不压窄通道；只有启用 shortcut 且输入输出通道等条件满足时才做残差相加。"
  ],
  "yolo-sppf": [
    [
      "sppf",
      "pooling",
      "receptive-field"
    ],
    "区分看得更广与网格变小，逐步解释串联池化的空间作用。",
    "步幅 1、适当填充的 5×5 最大池化连续做 1、2、3 次，内部位置覆盖范围可对应 5×5、9×9、13×13。各路高宽仍相同，之后沿通道拼接。"
  ],
  "yolo-neck": [
    [
      "fpn",
      "pan",
      "upsample"
    ],
    "理解跨尺度融合前的高宽对齐，以及上、下行路径分别传递什么。",
    "20×20 特征最近邻上采样到 40×40，可与同高宽的浅层特征沿通道拼接。上采样增加网格位置，不会凭空恢复已丢失细节；融合利用的是另一条路径保留的信息。"
  ],
  "yolo-head": [
    [
      "detect-module",
      "anchor",
      "logit"
    ],
    "把输出通道、候选数量和每个候选的字段逐项读出来。",
    "若每尺度 3 个 Anchor、类别数 2，每位置需 3×(5+2)=21 个原始输出数；5 表示 4 个框参数和 1 个物体性字段，不是 5 个类别。"
  ],
  "anchors": [
    [
      "anchor",
      "autoanchor",
      "anchor-bpr"
    ],
    "认识宽高参考、数据适配与几何覆盖率，避免把先验框当检测结果。",
    "对宽高 40×20 的真实框，40×20 Anchor 在几何比例上很合适，但模型仍可能没检测到它。BPR 统计尺寸匹配可能性，不是运行模型得到的真实 Recall。"
  ],
  "yolo-assignment": [
    [
      "target-assignment",
      "positive-sample",
      "negative-sample"
    ],
    "先定义哪些候选负责监督，再计算对应训练目标。",
    "一张图只有 1 辆车，也可按宽高比例和相邻网格规则分配多个正位置。其他位置主要学习背景；这一步依赖标注，推理时的 NMS 则不看标注。"
  ],
  "yolo-loss": [
    [
      "ciou",
      "objectness",
      "bce-with-logits"
    ],
    "区分定位、目标性与类别三项任务，再看加权后的总损失。",
    "若某正样本 CIoU=0.8，未加权的 1−CIoU 定位项为 0.2；物体性与类别另有学习目标。三项权重决定汇总尺度，总损失数值不是直接的检测准确率。"
  ],
  "train-yolo": [
    [
      "batch",
      "epoch",
      "gradient-accumulation",
      "checkpoint"
    ],
    "把数据批次、训练轮次、更新和保存串成完整实验。",
    "100 张图、batch=8 且保留尾批，一轮有 13 批。是否每批都更新要看梯度累积设置；保存的检查点还要看是否保留优化器和训练进度。"
  ],
  "yolo-checkpoints": [
    [
      "pretrained-weights",
      "fine-tuning",
      "resume-training"
    ],
    "明确从旧模型学习新任务与恢复同一实验需要哪些不同状态。",
    "只加载旧权重再用新数据训练通常是微调；恢复中断实验还需原进度与优化器等状态。best.pt、last.pt 是文件名惯例，能否续训要检查实际保存内容。"
  ],
  "yolo-augment": [
    [
      "hyperparameter",
      "data-augmentation",
      "mosaic-augmentation"
    ],
    "区分训练控制设置与输入变换，并检查增强后的监督答案。",
    "Mosaic 将多张图的部分区域拼到同一画布，框也要同步缩放、平移和裁切。改变增强幅度是改超参数，不是直接训练某个卷积权重；比较时固定评估方案。"
  ],
  "yolo-evaluation": [
    [
      "precision",
      "recall",
      "map"
    ],
    "说明验证结果各自回答什么问题，并用匹配协议解释成绩。",
    "模型报 10 个框、8 个匹配正确，真实有 12 个目标，则 Precision=8/10=0.8、Recall=8/12≈0.667。mAP 还需扫描排序并按协议汇总，不能由这一个点直接得到。"
  ],
  "inference": [
    [
      "letterbox",
      "decode",
      "nms",
      "confidence"
    ],
    "把输入处理、原始输出、候选筛选与原图坐标连接起来。",
    "物体性 0.8、某类别分数 0.75，在本课标准组合下得到分数 0.6。若 letterbox 在 y 方向补 80 像素、缩放比为 1，框映回原图先减去这 80。"
  ],
  "yolo-export": [
    [
      "onnx",
      "runtime",
      "quantization"
    ],
    "区分模型表示、运行软件与部署性能，明确导出之后还需完成什么。",
    "ONNX 文件描述模型计算；ONNX Runtime 等软件负责执行。即使导出成功，也要用相同图片、预处理和后处理比较框与分数，再在指定硬件上测延迟。"
  ],
  "yolo-trace": [
    [
      "nchw",
      "feature-map",
      "candidate-box"
    ],
    "沿一张图追踪数值表示，明确示意候选与真实模型预测的区别。",
    "bus.jpg 的宽高为 810×1080，图像数组常按 [1080,810,3] 记录。输入模型后可变成 [1,3,H,W]；后面的候选数量由特征网格和 Anchor 数量决定，不等于图中物体数。"
  ],
  "debugging": [
    [
      "nan",
      "infinity",
      "none"
    ],
    "把有效零值、无效浮点结果和缺少对象分开，再沿数据流定位最早异常。",
    "概率 0 是一种可能的数值结果，NaN 表示运算结果无效，None 表示没有对象；检查 loss、grad 和输入时不能只用“是否等于 0”把它们混在一起。"
  ]
};
  const additionalSources={
  "ai-foundations": [
    {
      "label": "Google 机器学习术语表：模型、特征与学习任务",
      "url": "https://developers.google.com/machine-learning/glossary"
    }
  ],
  "network": [
    {
      "label": "PyTorch：Linear 执行的仿射变换与参数形状",
      "url": "https://docs.pytorch.org/docs/stable/generated/torch.nn.Linear.html"
    }
  ],
  "network-activation": [
    {
      "label": "PyTorch：Linear 的含偏置仿射计算",
      "url": "https://docs.pytorch.org/docs/stable/generated/torch.nn.Linear.html"
    }
  ],
  "training-accumulation": [
    {
      "label": "PyTorch：梯度累积与优化器更新的不同频率",
      "url": "https://docs.pytorch.org/docs/stable/notes/amp_examples.html#gradient-accumulation"
    }
  ]
};
  for(const lesson of catalog){
    const guide=guides[lesson.id];
    if(!guide)continue;
    const [terms,why,example]=guide;
    for(const source of additionalSources[lesson.id]||[]){
      lesson.sources=lesson.sources||[];
      if(!lesson.sources.some(item=>item.url===source.url))lesson.sources.push(source);
    }
    lesson.foundation={...lesson.foundation,title:lesson.title,question:lesson.desc,why,example,terms:terms.slice()};
    foundation.beginnerSteps[lesson.id]=terms.map(id=>glossary.byId[id]).filter(Boolean).map(item=>[item.title,item.plainExplanation]);
  }
})();
