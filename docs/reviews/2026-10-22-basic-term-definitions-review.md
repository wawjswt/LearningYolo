# 全站基本名称定义审查与补强记录

日期：2026-10-22。审查基线：main 提交 6915ad1230488adb4c85ae184abf16a53d729a71，线上 v103。

本轮围绕基础名词的准确性、前置解释和独立阅读能力审查网站：96 门短课、原有 327 个术语词条，以及学习概览、课程目录、路线、交互实验室、笔记、资源 6 个主要页面。技术核对采用框架官方文档和本地 YOLOv5 源码；对涉及术语职责的正文作了定向复查。

## 发现与修正

| 问题 | 实际影响 | 修正 |
| --- | --- | --- |
| 71 门短课没有入门步骤 | 页面出现“按这个顺序理解”，却没有解释内容 | 逐课指定核心词条，直接用共享词典生成定义步骤 |
| 72 门短课沿用通用目的句 | “说明本课含义”没有告诉学习者究竟要学会什么 | 96 门课分别提供具体用途和独立例子 |
| 55 次入门词条引用无法解析 | 某些按钮不出现；同一个旧 ID 可在多门课重复出错 | 将同义旧 ID 改为实际词条 ID，并补足缺失概念 |
| 拆课后继承同一个例子和词条表 | 激活课仍展示神经元权重，卷积步幅指向内存步幅 | 每门课单独选择 2～4 个名词；内存步幅链接到张量布局，卷积步幅链接到卷积尺寸 |
| Huber、Smooth L1 合用同一个词条 | 学习者可能误以为任意阈值下两者都相等 | 分成两个词条，明确 β=δ>0 时 Smooth L1=Huber/β，默认 1 时相等，并给 δ=β=2 的数例 |
| iteration 被定义为参数更新 | 梯度累积时混淆取批次数和优化器更新数 | 区分迭代与 optimizer step；说明 4 个小批次可只更新 1 次 |
| 参数、超参数、反向传播定义过度简化 | 容易以为冻结后就不再是参数、超参数必须始终固定、backward 会更新权重 | 明确训练职责、调度和状态；反向传播计算梯度，优化器应用更新 |
| 线性与仿射混用 | 带偏置的计算与严格数学定义不一致 | 解释框架 Linear 名称和仿射计算；同步修订两处正文 |
| AutoAnchor 的 whitening 被当作完整统计白化 | 按标准差缩放与去相关变换混为一谈 | 说明本地实现只按宽高各自标准差缩放 |
| 把 ONNX、OpenVINO、TensorRT 都称“格式” | 模型表示、工具体系与运行软件职责不清 | 正文与入门卡明确区分表示、转换优化工具和运行时 |
| 部分词条仍链接到已拆除的 training 路由 | 点“继续学习”无法到达实际课程 | 按实际课程 ID 重新整理词条目标；当前全部 354 个词条目标均有效 |
| 交叉熵标题“错得越远”易暗示类别距离 | 分类编号本身没有可用于回归的距离 | 改为“正确类概率越低，惩罚越大” |

## 内容补强

- 修订 112 个原有词条的定义，补充对象、用途、例子和必要边界；保留现有生活比喻。
- 新增 27 个概念，词典总数为 354。标准正态分布、相对熵、L2 正则化等按完整术语匹配。
- 为全部 96 门课程建立专属入门说明，共展示 298 处课内定义。定义直接复用词典，避免正文起点和 tooltip 各写一套。
- 保留现有图解、数学排版、练习、笔记和课程 ID。入门说明使用既有组件；名词区由三列改为单列，正文改为 15px、1.85 倍行高，避免长定义在窄列中拥挤。未新增依赖。
- 新内容位于 [课程定义指南](../../dist/textbook-definition-guides.js)；统一定义位于 [术语词典](../../dist/textbook-glossary.js)。
- 全站数据与定义校验位于 [verify-definition-guides.cjs](../../verify-definition-guides.cjs)。

## 新增词条

| 名称 | ID |
| --- | --- |
| Smooth L1 损失（SmoothL1Loss） | smooth-l1 |
| 泛化（generalization） | generalization |
| 数据泄漏（data leakage） | data-leakage |
| 数据增强（data augmentation） | data-augmentation |
| 标签噪声（label noise） | label-noise |
| 信息量（self-information） | information-content |
| 熵（entropy） | entropy |
| 损失归约（reduction） | reduction |
| 梯度裁剪（gradient clipping） | gradient-clipping |
| L2 正则项（L2 penalty） | l2-regularization |
| 冻结参数（parameter freezing） | freeze-parameters |
| 前向计算（forward pass） | forward-pass |
| 自动求导（automatic differentiation，Autograd） | autograd |
| 分组卷积（grouped convolution） | groups |
| 局部连接（local connectivity） | local-connectivity |
| 权重共享（weight sharing） | weight-sharing |
| 平移等变性（translation equivariance） | translation-equivariance |
| 归纳偏置（inductive bias） | inductive-bias |
| 展平（flatten） | flatten |
| 恒等映射（identity mapping） | identity-mapping |
| 残差（residual） | residual |
| 特征金字塔（feature pyramid） | feature-pyramid |
| 等比例缩放与补边（letterbox） | letterbox |
| 数值稳定性（numerical stability） | numerical-stability |
| 样本分配（target assignment） | target-assignment |
| 正态分布（normal distribution） | normal-distribution |
| 标准正态分布（standard normal distribution） | standard-normal-distribution |

## 逐课核心名词覆盖

每门课还配有“这节要解决什么”和一个能核对的具体例子。下表记录本轮课内定义，不代表该课只涉及这些术语。

| 课程 | 起点中明确讲解的名词 |
| --- | --- |
| AI 入门：数据、模型和神经元 (ai-foundations) | 人工智能（Artificial Intelligence，AI）；函数（function）；模型（model）；神经元（neuron） |
| 神经网络怎样学习：层、参数与调整 (ai-layers) | 线性层（linear layer）；参数（parameter）；训练（training） |
| 张量 1：标量、向量、矩阵和形状 (tensor) | 张量（tensor）；形状（shape）；轴（axis）；维度（dimension） |
| 张量 2：多维索引与切片 (tensor-indexing) | 索引（index）；轴（axis）；形状（shape） |
| 张量 3：计算规则与形状对齐 (tensor-operations) | 点积（dot product）；矩阵乘法（matrix multiplication）；广播（broadcasting） |
| 张量 4：重塑、换轴与内存布局 (tensor-layout) | 底层存储（storage）；张量内存步幅（tensor stride）；连续布局（contiguous） |
| 神经元：权重、偏置与一次乘加 (network) | 神经元（neuron）；权重（weight）；偏置（bias） |
| 激活函数：多层网络怎样学会弯曲 (network-activation) | 仿射变换（affine transformation）；激活函数（activation function）；ReLU（Rectified Linear Unit，修正线性单元） |
| 模型输出：分类分数与连续数值 (network-outputs) | 回归（regression）；logit / logits（模型原始分数）；多标签分类（multi-label classification） |
| 损失起点：任务、标签与模型分数 (losses) | 标签（label）；损失（loss）；回归（regression） |
| Sigmoid 与 Softmax：分数怎样变成概率 (loss-probabilities) | logit / logits（模型原始分数）；Sigmoid（S 形函数）；Softmax（多类归一化函数） |
| 交叉熵：正确类概率越低，惩罚越大 (loss-cross-entropy) | 独热编码（one-hot encoding）；交叉熵（Cross Entropy，CE）；二元交叉熵（Binary Cross Entropy，BCE） |
| 梯度 1：导数、斜率和改错方向 (gradient) | 导数（derivative）；偏导数（partial derivative）；梯度（gradient） |
| 梯度 2：链式法则与反向传播 (gradient-chain-rule) | 计算图（computation graph）；链式法则（chain rule）；反向传播（backpropagation） |
| 梯度 3：一次更新、清零与常见异常 (gradient-diagnostics) | 梯度下降（gradient descent）；学习率（learning rate）；自动求导（automatic differentiation，Autograd） |
| 优化器 1：梯度与学习率 (optimizer) | 优化器（optimizer）；随机梯度下降（Stochastic Gradient Descent，SGD）；学习率（learning rate） |
| 优化器 2：批次、动量与 Adam (optimizer-momentum) | 批次（batch）；动量（momentum）；Adam 优化器（Adaptive Moment Estimation） |
| 优化器 3：AdamW、调度器与梯度裁剪 (optimizer-tuning) | L2 正则项（L2 penalty）；AdamW 优化器；梯度裁剪（gradient clipping） |
| 训练循环 1：训练集、验证集与测试集 (training-data-splits) | 训练集（training set）；验证集（validation set）；测试集（test set） |
| 训练循环 2：batch、epoch 到一次完整更新 (training-loop) | 前向计算（forward pass）；批次（batch）；训练轮次（epoch）；迭代步（iteration / step） |
| 模型保存 1：结构、参数与检查点 (checkpoints) | 参数（parameter）；缓冲状态（buffer）；参数字典（state_dict） |
| 模型保存 2：文件格式与推理部署 (checkpoint-inference) | 检查点（checkpoint）；开放神经网络交换格式（Open Neural Network Exchange，ONNX）；运行时（runtime） |
| 泛化 1：训练成绩好，为什么新数据会错 (regularization) | 泛化（generalization）；过拟合（overfitting）；正则化（regularization） |
| 泛化 2：数据增强与合理变化 (regularization-data) | 数据增强（data augmentation）；随机失活（Dropout）；标签（label） |
| 泛化 3：从曲线和样本判断问题 (regularization-diagnostics) | 欠拟合（underfitting）；过拟合（overfitting）；早停（early stopping） |
| 网络模块 1：BatchNorm 稳定中间数值 (network-extensions) | 平均值（mean）；方差（variance）；批量归一化（Batch Normalization，BatchNorm / BN） |
| 网络模块 2：SiLU 与 GELU (network-activations) | SiLU（Sigmoid Linear Unit）；GELU（Gaussian Error Linear Unit）；标准正态累积分布函数（常记作 Φ） |
| 网络模块 3：SwiGLU 与门控激活 (network-gated-activations) | 前馈网络（Feed-Forward Network，FFN）；门控线性单元（Gated Linear Unit，GLU）；SwiGLU（SiLU 门控线性单元） |
| 损失推导 1：信息量与熵 (loss-theory) | 概率（probability）；信息量（self-information）；自然对数（natural logarithm，ln） |
| 损失推导 2：交叉熵与分布差异 (loss-theory-cross-entropy) | 概率分布（probability distribution）；熵（entropy）；KL 散度（Kullback–Leibler divergence） |
| 损失梯度 1：错误概率怎样产生修正信号 (loss-gradients) | logit / logits（模型原始分数）；交叉熵（Cross Entropy，CE）；梯度（gradient） |
| 损失梯度 2：Softmax 与交叉熵的组合 (loss-gradients-softmax) | 独热编码（one-hot encoding）；真实类概率（target-class probability）；反向传播（backpropagation） |
| 损失实现 1：类别不平衡与加权 (loss-implementation) | 类别不平衡（class imbalance）；损失归约（reduction）；标签噪声（label noise） |
| 损失实现 2：reduction 与数值稳定 (loss-stability) | 损失归约（reduction）；单精度浮点（FP32 / float32）；数值稳定性（numerical stability） |
| 回归损失：预测数值偏差怎样计分 (loss-regression) | 均方误差（Mean Squared Error，MSE）；平均绝对误差（Mean Absolute Error，MAE）；Huber 损失（Huber loss）；Smooth L1 损失（SmoothL1Loss） |
| 训练工程 1：最后一个不完整批次 (training-engineering) | 批次（batch）；平均值（mean）；损失归约（reduction） |
| 训练工程 2：梯度累积与排错 (training-accumulation) | 梯度累积（gradient accumulation）；迭代步（iteration / step）；批量归一化（Batch Normalization，BatchNorm / BN） |
| 视觉任务 1：分类、检测与分割 (tasks) | 分类（classification）；目标检测（object detection）；语义分割（semantic segmentation）；实例分割（instance segmentation） |
| 视觉任务 2：检测框、分割掩码与输出步骤 (tasks-models) | 边界框（bounding box）；掩码（mask）；检测头（head / detection head） |
| 视觉任务 3：关键点、跟踪与任务共性 (tasks-beyond-detection) | 关键点（keypoint）；目标跟踪（object tracking）；深度估计（depth estimation） |
| 图像 1：像素、颜色通道与数值范围 (image) | 像素（pixel）；通道（channel）；NCHW 图像批次布局（Batch, Channels, Height, Width）；数据类型（dtype） |
| 图像 2：缩放、裁剪与预处理 (image-preprocessing) | 等比例缩放与补边（letterbox）；归一化（normalization）；标准化（standardization） |
| 卷积 1：卷积核怎样在图片上找特征 (cnn) | 卷积（convolution）；卷积核 / 滤波器（kernel / filter）；特征图（feature map） |
| 卷积 2：通道、参数量和输出尺寸 (cnn-shapes) | 通道（channel）；卷积步幅（convolution stride）；填充（padding）；分组卷积（grouped convolution） |
| 池化 1：窗口、步幅与下采样 (pooling) | 池化（pooling）；下采样（downsampling）；卷积步幅（convolution stride） |
| 池化 2：位移容忍与细节损失 (pooling-tradeoffs) | 下采样（downsampling）；感受野（receptive field）；平移等变性（translation equivariance） |
| 卷积的优势：局部连接、共享权重与平移 (cnn-priors) | 展平（flatten）；局部连接（local connectivity）；权重共享（weight sharing）；平移等变性（translation equivariance） |
| 卷积的边界：参数、全连接与端到端流程 (cnn-priors-limits) | 归纳偏置（inductive bias）；全连接层 / Linear（fully connected layer）；前向计算（forward pass） |
| 经典 CNN 1：LeNet-5 与手写数字 (cnn-architectures) | LeNet-5；卷积（convolution）；池化（pooling） |
| 经典 CNN 2：AlexNet 与深度视觉学习 (cnn-alexnet) | AlexNet 卷积神经网络；ReLU（Rectified Linear Unit，修正线性单元）；随机失活（Dropout） |
| 经典 CNN 3：VGG 与重复的小卷积块 (cnn-vgg) | VGG 网络家族；卷积（convolution）；池化（pooling） |
| 残差网络 1：深层网络为何需要捷径 (cnn-residual) | ResNet 残差网络家族；残差（residual）；恒等映射（identity mapping） |
| 残差网络 2：残差块与形状对齐 (cnn-residual-shapes) | 残差连接 / 捷径连接（residual / shortcut connection）；拼接（concatenation / Concat）；通道（channel） |
| 感受野：一层层扩大能看到的范围 (receptive-field) | 感受野（receptive field）；卷积步幅（convolution stride）；空洞率（dilation） |
| 多尺度特征：小目标与大目标都要看见 (feature-pyramid) | 特征金字塔（feature pyramid）；特征金字塔网络（Feature Pyramid Network，FPN）；路径聚合网络（Path Aggregation Network，PAN） |
| 迁移学习：预训练权重从哪里来 (transfer) | 预训练权重（pretrained weights）；迁移学习（transfer learning）；微调（fine-tuning） |
| 微调：标签、解冻与公平比较 (fine-tuning) | 标签（label）；冻结参数（parameter freezing）；微调（fine-tuning） |
| 边界框与 IoU 1：坐标和交并比 (iou) | 边界框（bounding box）；坐标（coordinate）；交并比（Intersection over Union，IoU） |
| 边界框与 IoU 2：手算、范围和用途 (iou-calculation) | 交集（intersection）；并集（union）；交并比（Intersection over Union，IoU） |
| 检测指标 1：TP、FP、FN、Precision 与 Recall (metrics) | 真阳性（true positive，TP）；假阳性（false positive，FP）；假阴性（false negative，FN） |
| 检测指标 2：AP、mAP、IoU 阈值与 NMS (metrics-map) | 平均精度（Average Precision，AP）；平均精度均值（mean Average Precision，mAP）；非极大值抑制（Non-Maximum Suppression，NMS） |
| 数据准备 1：标注规则、目录与类别 (dataset) | 数据集（dataset）；标签（label）；YAML 配置文件（YAML Ain’t Markup Language） |
| 数据准备 2：训练验证划分与可视化抽查 (dataset-split) | 训练集（training set）；验证集（validation set）；数据泄漏（data leakage） |
| 数据准备 3：路径、空标签与开训前体检 (dataset-check) | 路径（path）；真实标注（ground truth）；负样本（negative sample） |
| 数据质量 1：代表性、泄漏与公平划分 (data-quality) | 泛化（generalization）；数据泄漏（data leakage）；测试集（test set） |
| 数据质量 2：类别不平衡、噪声与错误样本 (data-diagnosis) | 类别不平衡（class imbalance）；标签噪声（label noise）；精确率—召回率曲线（Precision–Recall curve） |
| 图像增强 1：翻转、裁剪与边界框同步 (augmentation) | 数据增强（data augmentation）；边界框（bounding box）；坐标（coordinate） |
| 图像增强 2：颜色变化与验证检查 (augmentation-evaluation) | HSV 颜色表示；饱和度（saturation）；验证集（validation set） |
| 三维旋转 1：欧拉角与旋转顺序 (euler-angles) | 欧拉角（Euler angles）；三维旋转顺序（XYZ / ZYX）；万向节锁（gimbal lock） |
| 三维旋转 2：向量、轴角与四元数 (quaternion) | 向量（vector）；轴角表示（axis-angle）；四元数（quaternion） |
| 三维旋转 3：多次旋转怎样组合 (quaternion-compose) | Hamilton 四元数乘积（Hamilton product）；四元数共轭（quaternion conjugate）；三维旋转顺序（XYZ / ZYX） |
| 三维旋转 4：四元数、矩阵与实现约定 (quaternion-compare) | 旋转矩阵（rotation matrix）；球面线性插值（Spherical Linear Interpolation，SLERP）；万向节锁（gimbal lock） |
| 目标检测从哪里来：为什么“有车”还不够 (detection-intro) | 目标检测（object detection）；边界框（bounding box）；置信度（confidence score） |
| 两阶段检测：从R-CNN到Faster R-CNN (detection-two-stage) | 候选区域（region proposal）；区域建议网络（Region Proposal Network，RPN）；RoI池化（RoI Pooling） |
| 一阶段检测：YOLO与SSD怎样直接预测 (detection-one-stage) | 一阶段检测（one-stage detection）；密集预测（dense prediction）；无锚框设计（anchor-free） |
| 走到YOLOv5：问题、改进与版本边界 (yolo-evolution) | YOLO 目标检测模型家族；YOLOv5 目标检测模型；预印本（preprint） |
| YOLOv5整机图：从输入到检测答案 (architecture) | 骨干网络（backbone）；特征融合层（neck）；检测头（head / detection head） |
| 仓库地图：一项任务对应哪些文件 (yolo-repository) | 源码仓库（source repository）；路径（path）；命令行界面（Command-Line Interface，CLI） |
| 第一个检测项目：图片、标签与数据配置 (yolo-data) | 数据集（dataset）；标签（label）；YAML 配置文件（YAML Ain’t Markup Language） |
| 读懂模型YAML：连线、通道与规模缩放 (yolo-config) | YAML 配置文件（YAML Ain’t Markup Language）；通道（channel）；拼接（concatenation / Concat） |
| Backbone：像素怎样逐层成为特征 (yolo-backbone) | YOLOv5 Conv 模块；特征图（feature map）；卷积步幅（convolution stride） |
| 进入C3与Bottleneck：分支、重复与残差 (yolo-c3) | 跨阶段局部连接（Cross Stage Partial，CSP）；YOLOv5 C3 模块；瓶颈模块（bottleneck block） |
| SPPF：同一张特征图怎样看得更广 (yolo-sppf) | 快速空间金字塔池化（Spatial Pyramid Pooling–Fast，SPPF）；池化（pooling）；感受野（receptive field） |
| FPN与PAN：不同尺度怎样交换信息 (yolo-neck) | 特征金字塔网络（Feature Pyramid Network，FPN）；路径聚合网络（Path Aggregation Network，PAN）；上采样（upsampling） |
| Detect检测头：特征怎样变成候选数字 (yolo-head) | Detect 检测头模块；锚框（anchor）；logit / logits（模型原始分数） |
| Anchor与AutoAnchor：先选合适的宽高参考 (anchors) | 锚框（anchor）；AutoAnchor（锚框检查工具）；Anchor几何覆盖率（Best Possible Recall，BPR） |
| 样本分配：哪个位置负责哪个真实目标 (yolo-assignment) | 样本分配（target assignment）；正样本（positive sample）；负样本（negative sample） |
| 检测损失：框、目标性和类别各学什么 (yolo-loss) | 完全交并比（Complete IoU，CIoU）；目标存在性分数（objectness）；带 logits 的二元交叉熵（BCEWithLogitsLoss） |
| 训练循环：从第一个batch到验证和保存 (train-yolo) | 批次（batch）；训练轮次（epoch）；梯度累积（gradient accumulation）；检查点（checkpoint） |
| 预训练、微调与断点续训：别只看文件名 (yolo-checkpoints) | 预训练权重（pretrained weights）；微调（fine-tuning）；断点续训（resume training） |
| 训练策略：增强、输入尺寸与控制变量 (yolo-augment) | 超参数（hyperparameter）；数据增强（data augmentation）；Mosaic 拼图增强 |
| 验证与选模型：让成绩能回答实际问题 (yolo-evaluation) | 精确率（Precision）；召回率（Recall）；平均精度均值（mean Average Precision，mAP） |
| 推理与后处理：原始分数怎样成为原图上的框 (inference) | 等比例缩放与补边（letterbox）；解码（decode）；非极大值抑制（Non-Maximum Suppression，NMS）；置信度（confidence score） |
| 导出与部署：把模型交给另一套运行环境 (yolo-export) | 开放神经网络交换格式（Open Neural Network Exchange，ONNX）；运行时（runtime）；量化（quantization） |
| 实图串讲：一张照片走完模型、训练与推理 (yolo-trace) | NCHW 图像批次布局（Batch, Channels, Height, Width）；特征图（feature map）；候选框（candidate box） |
| 复盘与改进：按证据定位问题 (debugging) | 非数值（Not a Number，NaN）；无穷大（infinity / Inf）；空值（None） |

## 验收证据

- 内容校验：96 门课、354 个词条、298 处定义；每课有专属目的、例子和 2～4 个有效词条，定义与术语卡共享内容，旧起点注册表也没有悬空 ID。
- 词条校验：Huber 与 Smooth L1 为不同 ID；标准正态分布、相对熵、二元交叉熵、L2 正则化按完整名词命中；所有继续学习链接指向实际课程。
- 复合术语原有检查通过：40 组候选关系、1289 个唯一别名；包含已有匹配性能检查。
- 浏览器逐课检查：96/96 门，298 个定义步骤与对应按钮一致；目的、例子均非空，入门卡无横向溢出。
- 浏览器主要页面检查：6/6 页可正常阅读，无页面横向溢出；抽查日志未发现错误。
- 交互抽查：卷积步幅卡和目标链接正确；Smooth L1 可通过 Enter 独立打开；Escape 可关闭解释卡。
- 主要验证命令：node verify-definition-guides.cjs；node verify-glossary-compound-terms.cjs。最终源码检查和发布结果见本次交付回执。

## 技术依据

1. [PyTorch Linear：仿射计算与参数形状](https://docs.pytorch.org/docs/2.14/generated/torch.nn.Linear.html)。
2. [PyTorch SmoothL1Loss：与 Huber 的缩放关系](https://docs.pytorch.org/docs/2.14/generated/torch.nn.SmoothL1Loss.html)。
3. [PyTorch BatchNorm2d：统计轴、运行统计与训练/评估差异](https://docs.pytorch.org/docs/2.14/generated/torch.nn.BatchNorm2d.html)。
4. [PyTorch AMP examples：梯度累积与更新频率](https://docs.pytorch.org/docs/2.14/notes/amp_examples.html#gradient-accumulation)。
5. [Google 机器学习术语表](https://developers.google.com/machine-learning/glossary)。
6. 本地 YOLOv5 models/common.py：Conv、C3、Bottleneck、SPPF 的实际计算；utils/autoanchor.py：按标准差缩放的实际步骤。

本记录是基础定义和教学衔接的审查结果；数值例子用于解释明确条件下的计算，浏览器中的教学演示不作为真实训练或基准测试成绩。
